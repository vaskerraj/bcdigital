import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { message, Table, Pagination, Select, Tag, AutoComplete, Button, Tooltip } from 'antd';
const { Option } = Select;
import { CloseOutlined, SearchOutlined } from '@ant-design/icons';

import moment from 'moment';

import Wrapper from '../../../components/admin/Wrapper';
import UserAddressList from '../../../components/admin/UserAddressList';
import { orderStatusText, paymentTypeText } from '../../../helpers/functions';

const UsersList = ({ user, orderData, total }) => {
    console.log(user)

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(orderData);
    const [orderTotal, setOrderTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(10);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });

    const [filter, setFilter] = useState(false);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const recallUserList = async () => {
        setLoading(true);
        const { id } = router.query;
        try {
            const { data } = await axios.post(`${process.env.api}/api/admin/user/orders`, {
                userId: id,
                sort,
                page,
                limit: sizePerPage
            },
                {
                    headers: {
                        token: adminAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.orders);
                setOrderTotal(data.total);
                setOnSearch(false);
            }
        } catch (error) {
            setLoading(false)
            setOnSearch(false);
            setFilter(false);

            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }
    useEffect(() => {
        if (!onFirstLoad) {
            recallUserList();
        }
    }, [onFirstLoad, page, sizePerPage, sort, onSearch]);

    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) => <a href={`/admin/users/order/${record._id}`}>{record._id.toUpperCase()}</a>,
        },
        {
            title: 'Total',
            dataIndex: ['total'],
            key: ['total'],
            render: text => <>Rs.{text}</>,
        },
        {
            title: 'Shipping',
            dataIndex: ['shippingCharge'],
            key: ['shippingCharge'],
        },
        {
            title: 'Grand Total',
            dataIndex: ['grandTotal'],
            render: (text, record) => <>Rs.{record.total + record.shippingCharge}</>,
        },
        {
            title: 'Package(s)',
            render: (text, record) => <>{record.packages.length}</>
        },
        {
            title: 'Time',
            dataIndex: ['createdAt'],
            key: ['createdAt'],
            render: (text) => <>{moment(text).fromNow()}</>,
        }
    ];

    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
                    {record.products.map(item => (
                        <div key={item._id} className="d-block">
                            <div className="font16" style={{ fontWeight: 600 }}>
                                {item.name}
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    Order Quantity: {item.productQty}
                                </div>
                                <div>
                                    Size: {item.products[0].size}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between bg-light border-top border-bottom mt-3 pb-2 pt-3 pr-2 pl-2">
                                <div>
                                    Price: Rs.{item.products[0].price}
                                </div>
                                <div>
                                    Discount:
                                    {item.products[0].discount ? `${item.products[0].discount} %` : 'N/A'}
                                    <div className="font13 text-muted">
                                        {item.products[0].discount ?
                                            `${moment(item.products[0].promoStartDate).format("DD MMMM YYYY")}
                                            -
                                            ${moment(item.products[0].promoEndDate).format("DD MMM YYYY")}`
                                            :
                                            ''
                                        }
                                    </div>
                                </div>
                                <div>
                                    Sell Price: <span className="text-success font15 font-weight-bold">Rs.{item.products[0].finalPrice}</span>
                                </div>
                            </div>
                            <>
                                <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                                    Payment Info:
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-2">
                                    <div>
                                        Type:
                                        <Tag color="green" className="ml-1">{paymentTypeText(record.paymentType)}
                                        </Tag>
                                    </div>
                                    <div>
                                        Status:
                                        <span className="badge bg-success ml-2">
                                            {record.products[0].paymentStatus === 'notpaid' ? 'Not Paid' : 'Paid'}
                                        </span>
                                    </div>
                                </div>
                            </>

                            <div className="d-flex justify-content-between align-items-center border-top mt-3 pb-2 pt-3">
                                <div>
                                    Current Status:
                                    <Tag color="blue" key={item.orderStatus} className="ml-1">
                                        {orderStatusText(item.orderStatus)}
                                    </Tag>
                                </div>
                                {item.orderStatus === 'not_confirmed' &&
                                    <div>
                                        <select className="form-control" defaultValue={item.orderStatus} onChange={(e) => orderStatusOnChange(e.target.value, item._id)}>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="not_confirmed" disabled={true}>Not Confirmed</option>
                                        </select>
                                    </div>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    const handlePageChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setCurrPage(value);
        setPage(value);
        setOnSearch(true)
    });

    const handleSortChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setSort(value);
        setOnSearch(true);
    });

    const handleLimitChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setPagination({ position: ['none', 'none'], defaultPageSize: value });
        setSizePerPage(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true);
    });
    return (
        <Wrapper onActive="users" breadcrumb={[user.name + "'s Info"]}>
            <Head>
                <title>User's Details | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="d-block" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                <div className="font15" style={{ fontWeight: 700 }}>General Info</div>
                <div className="d-flex justify-content-around" style={{ flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontWeight: 500 }}>ID</div>
                        <div>{user._id}</div>
                    </div>
                    <div >
                        <div style={{ fontWeight: 500 }}>Name</div>
                        <div>{user.name}</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>Username</div>
                        <div>{user.username}</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>Mobile</div>
                        <div>{user.mobile}</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>Email</div>
                        <div>{user.email}</div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>Method</div>
                        <div>
                            {user.method === 'custom'
                                ?
                                "Custom"
                                : user.method === 'google.com'
                                    ?
                                    "Google"
                                    : "Facebook"
                            }
                        </div>
                    </div>
                    <div>
                        <div style={{ fontWeight: 500 }}>Created At</div>
                        <div>{moment(user.createdAt).format("DD MMM YYYY")}</div>
                    </div>
                </div>
            </div>
            <div className="d-block mt-3" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                <div className="font15" style={{ fontWeight: 700 }}>Addresses</div>
                <UserAddressList
                    data={user.addresses}
                />
            </div>
            <div className="d-block mt-3" style={{ border: '2px solid #ddd', borderRadius: 8, padding: 10 }}>
                <div className="d-block">
                    <div className="font15" style={{ fontWeight: 700 }}>Orders</div>
                    <div className="d-flex justify-content-between mt-4 mb-4">
                        <div>
                            {orderTotal} Order(s)
                        </div>
                        <Select
                            defaultValue={sort}
                            style={{ width: 120 }}
                            onChange={handleSortChange}
                            size="small"
                        >
                            <Option value="newest">Newest</Option>
                            <Option value="oldest">Oldest</Option>
                        </Select>
                    </div>
                </div>
                <div className="table-responsive">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                    />
                    {
                        orderTotal !== 0 &&
                        <div className="d-flex justify-content-between mt-5">
                            <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={30}>30</Option>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                            </Select>
                            <Pagination
                                current={currPage}
                                total={orderTotal}
                                responsive
                                pageSize={sizePerPage}
                                onChange={handlePageChange}
                            />
                        </div>
                    }
                </div>
            </div>
        </Wrapper >
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        const { id } = context.query;
        const { data: userInfo } = await axios.get(`${process.env.api}//api/admin/user/${id}`, {

            headers: {
                token: cookies.ad_token,
            }

        });

        // order list
        const sort = 'newest';
        const page = 1;
        const limit = 30;

        const { data } = await axios.post(`${process.env.api}/api/admin/user/orders`, {
            userId: id,
            sort,
            page,
            limit
        },
            {
                headers: {
                    token: cookies.ad_token,
                }
            });
        return {
            props: {
                user: userInfo,
                orderData: data.orders || null,
                total: data.total || null,
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default UsersList;
