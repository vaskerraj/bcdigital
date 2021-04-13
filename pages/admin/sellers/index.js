import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Switch } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import baseUrl from '../../../helpers/baseUrl';
import { ReactTable } from '../../../components/helpers/ReactTable';

const SellerList = ({ sellers }) => {
    const [sellersData, setSellersData] = useState([]);
    const [columns, setColumns] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const { adminAuth } = useSelector(state => state.adminAuth);

    useEffect(() => {
        const precolumns = [
            {
                Header: "Name",
                show: true,
                accessor: row => {
                    return row.name
                },
                displayValue: " Name ",
                Cell: ({ row: { original } }) => (
                    <div className="d-flex align-items-center" style={{ verticalAlign: 'middle' }}>
                        <div className="">
                            <Image src={`${baseUrl}/uploads/sellers/${original.picture}`}
                                className="img-thumbnail" width="50" height="50"
                            />
                        </div>
                        <div>
                            {original.name}
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
                Header: "Username",
                accessor: "username",
                sortable: false,
                show: true,
                displayValue: " Username "
            },
            {
                Header: "Mobile No.",
                accessor: "mobile",
                sortable: false,
                show: true,
                displayValue: " Mobile No. "
            },
            {
                Header: "Email",
                accessor: "email",
                sortable: false,
                show: true,
                displayValue: " Email "
            },
            {
                Header: "Commission",
                accessor: "",
                sortable: false,
                show: true,
                displayValue: " Commission "
            },
            {
                Header: "Revenue",
                accessor: "",
                sortable: true,
                show: true,
                displayValue: " Revenue "
            },
            {
                Header: "Status",
                show: true,
                Cell: ({ row: { original } }) => (
                    <Switch
                        checkedChildren={<CheckOutlined />}
                        unCheckedChildren={<CloseOutlined />}
                        onChange={() => changeSellerStatusHandler(original._id)}
                        defaultChecked
                    />
                )
            }
            ,
            {
                Header: "Actions",
                show: true,
                Cell: ({ row: { original } }) => (
                    <button className="btn c-btn-primary" onClick={() => viewAnalyticsHandler(original._id)}>View Analytics</button>
                )
            }
        ];
        setColumns(precolumns);
    }, []);

    const changeSellerStatusHandler = useCallback((id) => {
        console.log(id);
    });
    const viewAnalyticsHandler = useCallback((id) => {
        console.log(id);
    });

    useEffect(() => {
        const filteredData = sellers.filter((data) => data.status === activeTab);
        setSellersData(filteredData)
    }, [activeTab]);
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
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={columns}
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
        const { data } = await axios.get(`${process.env.api}/api/admingetseller`, {
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