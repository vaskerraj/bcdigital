import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Switch, message } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import baseUrl from '../../../helpers/baseUrl';
import { ReactTable } from '../../../components/helpers/ReactTable';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerList = ({ sellers }) => {
    console.log(sellers)
    const [sellersData, setSellersData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    const precolumns = useMemo(() => [
        {
            Header: "Name",
            show: true,
            accessor: "userId.name",
            displayValue: " Name ",
            Cell: ({ row: { original } }) => (
                <div className="d-flex align-items-center" style={{ verticalAlign: 'middle' }}>
                    <div className="">
                        <Image src={`${baseUrl}/uploads/sellers/${original.userId.picture}`}
                            className="img-thumbnail" width="50" height="50"
                        />
                    </div>
                    <div>
                        {original.userId.name}
                    </div>
                </div>
            )
        },
        {
            Header: "ID",
            accessor: "_id",
            sortable: true,
            show: true,
            displayValue: " ID "
        },
        {
            Header: "Legal Name",
            accessor: "legalName",
            sortable: false,
            show: true,
            displayValue: " Legal Name "
        },
        {
            Header: "Mobile No.",
            accessor: "userId.mobile",
            sortable: false,
            show: true,
            displayValue: " Mobile No. "
        },
        {
            Header: "Email",
            accessor: "userId.email",
            sortable: false,
            show: true,
            displayValue: " Email "
        },
        {
            Header: "Commission(%)",
            accessor: "commission",
            sortable: false,
            show: true,
            displayValue: " Commission "
        },
        {
            Header: "Status",
            show: true,
            Cell: ({ row: { original } }) => {
                return (
                    original.status.title == 'approved'
                        ?
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeSellerStatusHandler(original._id, 'unapproved')}
                        />
                        :
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeSellerStatusHandler(original._id, 'approved')}
                            defaultChecked
                        />
                )
            }
        },
        // {
        //     Header: "Actions",
        //     show: true,
        //     Cell: ({ row: { original } }) => (
        //         <button className="btn c-btn-primary"
        //             onClick={() => viewAnalyticsHandler(original._id)}>
        //             View Analytics
        //         </button>
        //     )
        // }
    ]);

    useEffect(() => {
        const stepComplete = (activeTab === 'uncomplete') ? false : true;
        const filteredData = sellers.filter((data) => data.status.title === activeTab && data.stepComplete === stepComplete);
        setSellersData(filteredData);
    }, [activeTab]);

    const changeSellerStatusHandler = (async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/status/${id}/${status}`, {}, {
                headers: {
                    token: adminAuth.token
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
                            Seller status succssfully changed
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

    const viewAnalyticsHandler = useCallback((id) => {
        console.log(id);
    });

    return (
        <Wrapper onActive="sellers" breadcrumb={["Sellers"]}>
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Approved Sellers
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    UnApproved Sellers
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('blocked')}>
                    Blocked Sellers
                    <div className={`activebar ${activeTab === 'blocked' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={sellersData}
                    defaultPageSize={100}
                    tableClass={'table-bordered'}
                />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/seller/list`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                sellers: data
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

export default SellerList;