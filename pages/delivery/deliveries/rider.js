import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Table, Input, Select, Button, Pagination, Tag } from 'antd';
const { Option } = Select;
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { MapPin, Phone } from 'react-feather';

import Wrapper from '../../../components/delivery/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const RiderDeliveries = ({ deliveryData, total }) => {

    const [activeTab, setActiveTab] = useState('pending');

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(deliveryData);
    const [deliveryTotal, setDeliveryTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(30);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // 
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [trackingId, setTrackingId] = useState("");

    // filter
    const [filter, setFilter] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });

    // router
    const router = useRouter();

    const { deliveryAuth } = useSelector(state => state.deliveryAuth)

    const recallDeliveryList = async (filterByTrackingId, filterByPaymentMethod) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/deliveries/list/rider`, {
                status: activeTab,
                paymentMethod: filterByPaymentMethod,
                trackingId: filterByTrackingId,
                sort,
                page,
                limit: sizePerPage
            },
                {
                    headers: {
                        token: deliveryAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.delivery);
                setDeliveryTotal(data.total);
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
            const filterByTrackingId = trackingId !== '' ? trackingId.toLowerCase() : 'all';
            const filterByPaymentMethod = paymentMethod !== null ? paymentMethod : 'all';

            // call
            recallDeliveryList(filterByTrackingId, filterByPaymentMethod,);
        }
    }, [onFirstLoad, activeTab, page, sizePerPage, sort, onSearch]);


    const getProductTotal = (products, activeTab) => {
        const redefineActiveTab = activeTab === "pending" ? "reached_at_city" : activeTab;
        const getNonCancelProduct = products.filter(item => item.orderStatus === redefineActiveTab);

        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) =>
                <Link href={`/delivery/deliveries/${record._id}?status=${record.currentStatus}`}>
                    <a>
                        {record.orders._id.toUpperCase()}
                        <div className="font-weight-bold">
                            {record._id.toUpperCase()}
                        </div>
                    </a>
                </Link>
            ,
        },
        {
            title: 'Tracking Id',
            dataIndex: ['trackingId'],
            key: ['trackingId'],
        },
        {
            title: 'Receiveable',
            render: (text, record) => <>Rs.{
                (record.paymentStatus === 'notpaid' || record.paymentType === 'cashondelivery') ?
                    getProductTotal(record.products, activeTab) + record.shippingCharge
                    : 0
            }</>,
        },
        {
            title: 'Time',
            dataIndex: ['reachedDate'],
            key: ['reachedDate'],
            render: (text) => <>{moment(text).fromNow()}</>,
        },
        {
            title: 'Delivery Details',
            render: (text, record) => <>
                <div className="font14">{record.delivery.name}</div>
                <div className="d-flex mt-1">
                    <Phone size={14} className="mt-1" />
                    <div className="ml-2">
                        {record.orders.deliveryMobile}
                    </div>
                </div>
                <div className="d-flex mt-1">
                    <MapPin size={14} className="mt-1" />
                    <div className="ml-2">
                        {record.delivery.street}
                        {record.delivery.area ? record.delivery.area.city : ''}
                        {',' + record.delivery.city.name + ', ' + record.delivery.region.name}
                    </div>
                </div>
            </>,
        },
        {
            title: 'Status',
            render: (text, record) => <>
                <Tag color={record.currentStatus === 'delivered' && "green"} className="text-capitalize">
                    {
                        record.currentStatus === 'for_delivery' ?
                            "Way To Delivery"
                            : record.currentStatus === 'not_delivered' ?
                                "Not Delivered"
                                : record.currentStatus
                    }
                </Tag>
                {
                    record.currentStatus === 'not_delivered' && record.notDelivered !== undefined &&
                    <>
                        <div>
                            Attempt: <b>{record.notDelivered.length}</b>
                        </div>
                        <div>
                            Last Cause: <span className="text-muted font12">{record.notDelivered.at(-1).reason}</span>
                        </div>
                    </>
                }
            </>
        },
        {
            title: 'Action',
            render: (text, record) => <>
                {
                    record.currentStatus === "pending" &&
                    <Button size="small" onClick={() => handleRiderPick(record._id)}>Pick it</Button>
                }
                {
                    record.currentStatus === "not_delivered" &&
                    <>
                        {record.notDelivered !== undefined && record.notDelivered.length < 3 ?
                            <Button size="small" danger onClick={() => handleRetryDelivery(record._id)}>Pick to reattempt</Button>
                            :
                            <div className="text-danger font12">
                                Handover package to branch for return
                            </div>
                        }
                    </>
                }
            </>,
        },
    ];

    const handleRiderPick = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/riderpick`,
                {
                    packageId,
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Successfully picked.Check delivery at `Way to Delivery` tab.
                        </div>
                    ),
                    className: 'message-success',
                });
                return router.reload();
            }
        } catch (error) {
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
    const handleRetryDelivery = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/rider/reattempt`,
                {
                    packageId,
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Successfully picked.Check delivery at `Way to Delivery` tab.
                        </div>
                    ),
                    className: 'message-success',
                });
                return router.reload();
            }
        } catch (error) {
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

    const handleStatusChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setActiveTab(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
    });

    const handlePaymentChange = useCallback(value => {
        setFilter(prevState => prevState === true ? true : false);
        setPaymentMethod(value)
    });

    const handlePageChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setCurrPage(value);
        setPage(value);
        setOnSearch(true)
    });

    const handleLimitChange = value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setPagination({ position: ['none', 'none'], defaultPageSize: value });
        setSizePerPage(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true);
    };

    const handleSortChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setSort(value);
        setOnSearch(true);
    });

    const handleSearchClick = () => {
        setOnFirstLoad(false);
        setFilter(true);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
    }

    const handleClearFilter = () => {
        setFilter(false);
        return router.reload();
    }

    return (
        <>
            <Head>
                <title> Deliveries | Delivery Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="deliveries" breadcrumb={["Deliveries"]}>
                <div className="d-flex mb-5" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => handleStatusChange('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('pending')}>
                        Pending
                        <div className={`activebar ${activeTab === 'pending' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('for_delivery')}>
                        Way To Delivery
                        <div className={`activebar ${activeTab === 'for_delivery' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('not_delivered')}>
                        Not Delivered
                        <div className={`activebar ${activeTab === 'not_delivered' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('delivered')}>
                        Delivered
                        <div className={`activebar ${activeTab === 'delivered' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="d-block mb-5">
                    <div className="d-flex justify-content-around">
                        <Input className="mr-3" placeholder="Tracking Id" onChange={(e) => setTrackingId(e.target.value)} />
                        <Select className="mr-3" style={{ width: '600px' }} onChange={handlePaymentChange}>
                            <Option value="cashondelivery">Cash on delivery</Option>
                            <Option value="esewa">e-Sewa</Option>
                            <Option value="card">Card</Option>
                        </Select>

                        {filter &&
                            <Button type="dashed" className="mr-2" icon={<CloseOutlined />} onClick={handleClearFilter}>Clear</Button>
                        }

                        <Button type="default"
                            icon={<SearchOutlined />}
                            onClick={handleSearchClick}
                            size="middle"
                        >
                            Search
                        </Button>
                    </div>
                </div>
                <div className="d-flex justify-content-between mb-4">
                    <div>
                        {deliveryTotal} Deliveries(s)
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
                <div className="d-block table-responsive mt-5">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                    />
                    {
                        deliveryTotal !== 0 &&
                        <div className="d-flex justify-content-between mt-5">
                            <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={30}>30</Option>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                            </Select>
                            <Pagination
                                current={currPage}
                                total={deliveryTotal}
                                responsive
                                pageSize={sizePerPage}
                                onChange={handlePageChange}
                            />
                        </div>
                    }
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        if (cookies.del_role !== "rider") {
            return {
                redirect: {
                    source: '/delivery/404',
                    destination: '/delivery/404',
                    permanent: false,
                },
            }
        }
        const status = "pending";
        const paymentMethod = 'all';
        const trackingId = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;
        const { data } = await axios.post(`${process.env.api}/api/deliveries/list/rider`, {
            status,
            paymentMethod,
            trackingId,
            sort,
            page,
            limit
        },
            {
                headers: {
                    token: cookies.del_token,
                },
            });
        return {
            props: {
                deliveryData: data.delivery,
                total: data.total
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/delivery/login',
                destination: '/delivery/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default RiderDeliveries;
