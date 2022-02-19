import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
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

const UsersList = ({ usersData, total }) => {

    const [activeTab, setActiveTab] = useState();

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(usersData);
    const [usersTotal, setUsersTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(10);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    //
    const [user, setUser] = useState("");

    // for autocomplete
    const [userOptions, setUserOptions] = useState([]);

    // filter
    const [filter, setFilter] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth);

    const recallUserList = async (filterByuser) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/admin/users`, {
                status: activeTab,
                user: filterByuser,
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
                setData(data.users);
                setUsersTotal(data.total);
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
            const filterByuser = user !== '' ? user : 'all';

            // call
            recallUserList(filterByuser);
        }
    }, [onFirstLoad, page, sizePerPage, sort, onSearch]);


    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <a href={`/admin/users/${record._id}`}>{text}</a>,
        },
        {
            title: 'ID',
            dataIndex: '_id',
            key: '_id',
            render: text => <>{text.toUpperCase()}</>,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            render: (text, record) => <> {text}</>,
        },
        {
            title: 'Mobile',
            dataIndex: 'mobile',
            key: 'mobile',

        },
        {
            title: 'email',
            dataIndex: 'email',
            key: 'email',

        },
        {
            title: 'method',
            render: (text, record) => (
                <Tag key={record._id}>
                    {
                        record.method === 'custom'
                            ?
                            "Custom"
                            : record.method === 'google.com'
                                ?
                                "Google"
                                : "Facebook"
                    }
                </Tag>
            ),
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: text => <>{moment(text).format("DD MMM YYYY")}</>,
        },
        {
            title: 'Action',
            key: 'action',
            render: (text, record) => (
                <Tooltip title="Block">
                    <CloseOutlined className="cp" onClick={() => handleProductStatus(record._id, 'blocked')} />
                </Tooltip>
            ),
        },

    ];

    const handlePageChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setCurrPage(value);
        setPage(value);
        setOnSearch(true)
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

    const handleUserSearch = useCallback(async (value) => {

        const { data } = await axiosApi.post("/api/search/users", {
            searchtext: value
        });

        let serachUsers = [];
        data.map(seller => {
            const userObj = new Object;
            userObj['key'] = seller._id;
            userObj['user'] = seller._id;
            userObj['value'] = seller.name;
            serachUsers.push(userObj);
        });
        setUserOptions(serachUsers);
    });

    return (
        <Wrapper onActive="users" breadcrumb={["Users"]}>
            <div className="d-block mb-5">
                <div className="d-flex justify-content-end">
                    <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                        <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                            Approved
                            <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                        </div>
                        <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('blocked')}>
                            Blocked
                            <div className={`activebar ${activeTab === 'blocked' ? 'active' : ''}`}></div>
                        </div>
                    </div>
                    <div className="mr-3 ml-3" style={{ width: 200 }}>
                        <AutoComplete
                            style={{ width: 200 }}
                            options={userOptions}
                            onSelect={(val, option) => setUser(option.user)}
                            onSearch={handleUserSearch}
                            backfill={true}
                            placeholder="User's name"
                        />
                    </div>
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
            <div className="d-block">
                <div className="d-flex justify-content-between mb-4">
                    <div>
                        {usersTotal} User(s)
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
                    usersTotal !== 0 &&
                    <div className="d-flex justify-content-between mt-5">
                        <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                            <Option value={10}>10</Option>
                            <Option value={30}>30</Option>
                            <Option value={50}>50</Option>
                            <Option value={100}>100</Option>
                        </Select>
                        <Pagination
                            current={currPage}
                            total={usersTotal}
                            responsive
                            pageSize={sizePerPage}
                            onChange={handlePageChange}
                        />
                    </div>
                }
            </div>
        </Wrapper>
    )
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        const status = 'all';
        const user = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;

        const { data } = await axios.post(`${process.env.api}/api/admin/users`, {
            status,
            user,
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
                usersData: data.users || null,
                total: data.total || null
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
