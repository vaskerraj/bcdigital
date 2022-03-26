import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Switch, Popconfirm, message, Table } from 'antd';
import { CloseOutlined, CheckOutlined, EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../components/delivery/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const BranchList = ({ riders }) => {
    const [riderData, setRiderData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const router = useRouter();
    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const columns = [
        {
            title: 'Name',
            key: ['_id'],
            render: (text, record) => <Link href={`/delivery/branch/${record._id}?status=${activeTab}`}><a target="_blank">{record.name}</a></Link>,
        },
        {
            title: "Email",
            dataIndex: ['email'],

        },
        {
            title: "Number",
            dataIndex: ['number'],
        },
        {
            title: "Service At(City)",
            dataIndex: ['relatedCity', "name"],
        },
        {
            title: "Address",
            dataIndex: ['address'],
        },
        {
            title: "Branch Name",
            dataIndex: ['branchName'],
        },
        {
            title: 'Status',
            render: (text, record) =>
                record.status == 'approved'
                    ?
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={() => changeRiderStatusHandler(record._id, "blocked")}
                        defaultChecked
                    />
                    :
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={() => changeRiderStatusHandler(record._id, "approved")}
                    />,
        },
        {
            title: 'Action',
            render: (text, record) =>
                <>
                    <Link href={`/delivery/rider/edit/${record._id}`}>
                        <button className="btn btn-info mr-2">
                            <EditFilled />
                        </button>
                    </Link>
                    <Popconfirm
                        title="Are you sure to delete this rider?"
                        onConfirm={() => deleteRiderHandler(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="btn btn-warning">
                            <DeleteFilled />
                        </button>
                    </Popconfirm>

                </>,
        },
    ]

    useEffect(() => {
        const filteredData = riders.filter((data) => data.status === activeTab);
        setRiderData(filteredData);
    }, [activeTab]);

    const changeRiderStatusHandler = (async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/rider/status`, {
                riderId: id,
                status
            }, {
                headers: {
                    token: deliveryAuth.token
                }
            });
            if (data) {
                if (status === 'approved') {
                    setActiveTab('unapproved');
                    setTimeout(() => {
                        setActiveTab(status);
                    }, 200);
                } else {
                    setActiveTab('approved');
                    setTimeout(() => {
                        setActiveTab(status);
                    }, 300);
                }
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Rider's status succssfully changed
                        </div>
                    ),
                    className: 'message-success',
                });
                router.replace(router.asPath);
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
    });

    const deleteRiderHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/delivery/rider/${id}`, {
                headers: {
                    token: deliveryAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Rider succssfully deleted
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
                }, 3000);
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
    });

    return (
        <Wrapper onActive="manageRider" breadcrumb={["Manage Riders"]}>
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Approved Riders
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('blocked')}>
                    Blocked Riders
                    <div className={`activebar ${activeTab === 'blocked' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block text-right mt-5">
                <Link href="/delivery/rider/add">
                    <button type="button" className="btn c-btn-primary">
                        Add New Rider
                    </button>
                </Link>
            </div>
            <div className="table-responsive mt-5">
                <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={riderData}
                />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/delivery/rider`, {
            headers: {
                token: cookies.del_token,
            },
        });
        return {
            props: {
                riders: data
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

export default BranchList;