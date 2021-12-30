import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Table, Tag, Image, Input, Button } from 'antd';
import { CloseOutlined, CheckOutlined, DownloadOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import baseUrl from '../../../helpers/baseUrl';

const SellerVerification = ({ seller }) => {
    console.log(seller);
    const [commissionAmt, setCommissionAmt] = useState('');
    const [commissionStatus, setCommissionStatus] = useState(seller.commission ? true : false);
    const router = useRouter()

    const { adminAuth } = useSelector(state => state.adminAuth);

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => <a href={`/admin/seller/${record.userId._id}?status=verify`}>{record.userId.name}</a>,
        },
        {
            title: 'ID',
            dataIndex: ['userId', '_id'],
            key: ['userId', '_id'],
            render: text => <>{text}</>,
        },
        {
            title: 'Legal Name',
            dataIndex: 'legalName',
            key: 'legalName',
            render: text => <>{text}</>,
        },
        {
            title: 'Mobile No.',
            dataIndex: ['userId', 'mobile'],
            key: ['userId', 'mobile'],
        },
        {
            title: 'Email',
            dataIndex: ['userId', 'email'],
            key: ['userId', 'email'],

        },
        {
            title: 'Status',
            key: 'status',
            render: (text, record) => (
                <>
                    <Tag color={record.userId.status === 'approved' ? 'green' : 'blue'} key={record.userId._id} className="mt-1">
                        {record.userId.status}
                    </Tag>
                </>
            ),
        },
        {
            title: 'Created At',
            dataIndex: ['userId', 'createdAt'],
            key: ['userId', 'createdAt'],
            render: (text) => <>{moment(text).format("DD MMM YYYY")}</>,
        },
    ];
    console.log(commissionStatus)
    const sellerVerifyHandler = async (sellerId, type, status) => {
        try {
            const { data } = await axiosApi.put('/api/admin/seller/verify', { sellerId, type, status },
                {
                    headers: {
                        token: adminAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            {type === 'bank'
                                ?
                                'Bank Information succssfully updated.'
                                :
                                'Business Information succssfully updated.'
                            }
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
                }, 2000);
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

    const commissionHandler = async (sellerId) => {
        console.log(commissionAmt);
        try {
            const { data } = await axiosApi.put('/api/admin/seller/commission', { sellerId, amount: commissionAmt },
                {
                    headers: {
                        token: adminAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Commission amount added successfully.
                        </div>
                    ),
                    className: 'message-success',
                });
                setCommissionStatus(true);
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
    const expandedRowRender = (record) => {
        return (
            <div className="col">
                {!commissionStatus ?
                    <div className="row">
                        <div className="d-block"><strong>Set Commission(at Percentage)</strong></div>
                        <div className="d-flex" style={{ width: '30rem' }}>
                            <Input size="middle" onChange={(e) => setCommissionAmt(e.target.value)} />
                            <Button type="ghost" size="middle" className="ml-2"
                                onClick={() => commissionHandler(record._id)}
                            >
                                Submit
                            </Button >
                        </div>
                    </div>
                    :
                    <div className="row">
                        {(record.documentVerify === 'pending' || record.documentVerify === 're_uploaded') &&
                            <div className="col-6">
                                <div className="font-weight-bold font16">
                                    Business Info
                                </div>
                                <div className="d-flex mt-3">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Legal Name:
                                    </div>
                                    <div>
                                        {record.legalName}
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Registration Type:
                                    </div>
                                    <div>
                                        {record.registrationType}
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Registration No.:
                                    </div>
                                    <div>
                                        {record.registrationNumber}
                                    </div>
                                </div>
                                <div>
                                    <strong>
                                        Registration Document File:

                                    </strong>
                                    {
                                        record.documentFile.split(".").pop() === 'png'
                                            || record.documentFile.split(".").pop() === 'jpg'
                                            || record.documentFile.split(".").pop() === 'jpeg'
                                            ?

                                            <div className="text-center">
                                                <Image src={`/uploads/sellers/docs/${record.documentFile}`}
                                                    height='200px'
                                                />
                                            </div>
                                            :
                                            <a href={`/uploads/sellers/docs/${record.documentFile}`} download className="text-primary ml-2">
                                                <Button type="dashed" size="small" icon={<DownloadOutlined />}>Download</Button >
                                            </a>
                                    }
                                </div>
                                <div className="mt-4">
                                    <strong>Current Status</strong>:
                                    <Tag color="red" className="ml-2">{record.documentVerify.toUpperCase()}</Tag>
                                </div>
                                <div className="d-block text-center mt-4">
                                    <Button type="ghost" size="large"
                                        icon={<CloseOutlined />}
                                        onClick={() => sellerVerifyHandler(record._id, 'doc', 'not_verified')}
                                    >
                                        Not Verify
                                    </Button>
                                    <Button type="danger" size="large"
                                        icon={<CheckOutlined />} className="ml-4"
                                        onClick={() => sellerVerifyHandler(record._id, 'doc', 'verified')}
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>
                        }
                        {(record.account.bankVerify === 'pending' || record.account.bankVerify === 're_uploaded') &&
                            <div className="col-6">
                                <div className="font-weight-bold font16">
                                    Bank Info
                                </div>
                                <div className="d-flex mt-3">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Title:
                                    </div>
                                    <div>
                                        {record.account.title}
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Account Number:
                                    </div>
                                    <div>
                                        {record.account.number}
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Bank Name:
                                    </div>
                                    <div>
                                        {record.account.bankName}
                                    </div>
                                </div>
                                <div className="d-flex">
                                    <div className="font-weight-bold" style={{ minWidth: '15rem' }}>
                                        Branch:
                                    </div>
                                    <div>
                                        {record.account.branch}
                                    </div>
                                </div>
                                <div>
                                    <strong>
                                        Cheque File:

                                    </strong>
                                    {
                                        record.account.chequeFile.split(".").pop() === 'png'
                                            || record.account.chequeFile.split(".").pop() === 'jpg'
                                            || record.account.chequeFile.split(".").pop() === 'jpeg'
                                            ?
                                            <div className="text-center">
                                                <Image src={`/uploads/sellers/docs/${record.account.chequeFile}`}
                                                    height='200px'
                                                />
                                            </div>
                                            :
                                            <a href={`/uploads/sellers/docs/${record.account.chequeFile}`} download className="text-primary ml-2">
                                                <Button type="dashed" size="small" icon={<DownloadOutlined />}>Download</Button >
                                            </a>
                                    }
                                </div>
                                <div className="mt-4">
                                    <strong>Current Status</strong>:
                                    <Tag color="red" className="ml-2">{record.account.bankVerify.toUpperCase()}</Tag>
                                </div>
                                <div className="d-block text-center mt-4">
                                    <Button type="ghost" size="large"
                                        icon={<CloseOutlined />}
                                        onClick={() => sellerVerifyHandler(record._id, 'bank', 'not_verified')}
                                    >
                                        Not Verify
                                    </Button>
                                    <Button type="danger" size="large"
                                        icon={<CheckOutlined />} className="ml-4"
                                        onClick={() => sellerVerifyHandler(record._id, 'bank', 'verified')}
                                    >
                                        Verify
                                    </Button>
                                </div>
                            </div>
                        }
                    </div>
                }
            </div >
        )
    }
    return (
        <Wrapper onActive="verify" breadcrumb={["Sellers", "Pending Verification"]}>
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: record =>
                        expandedRowRender(record),
                    rowExpandable: record => true,
                }}
                dataSource={seller}
            />
        </Wrapper>
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/seller/verify`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                seller: data
            }
        }
    } catch (err) {
        console.log(err)
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

export default SellerVerification;
