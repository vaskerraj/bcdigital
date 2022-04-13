import React, { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { useForm } from 'react-hook-form';
import moment from 'moment';

import { Switch, message, Modal, Button, Table, Tag } from 'antd';
import { CloseOutlined, CheckOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { customImageLoader } from '../../../helpers/functions';
import { Edit2 } from 'react-feather';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerList = ({ sellers }) => {
    const [comissionModalVisible, setComissionModalVisible] = useState(false);
    const [selectedSellerId, setSelectedSellerId] = useState(null);
    const [selectedSellerComission, setSelectedSellerComission] = useState(null);
    const [comissionActionType, setComissionActionType] = useState(null);
    const [sellersData, setSellersData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    const defaultValues = {
        commissionAmt: comissionActionType === "edit" ? selectedSellerComission : null,
    }
    const { register, handleSubmit, errors, reset, setValue } = useForm({
        defaultValues: defaultValues,
    });
    useEffect(() => {
        if (comissionActionType === 'edit') reset(defaultValues)
    }, [comissionActionType]);

    useEffect(() => {
        const stepComplete = (activeTab === 'uncomplete') ? false : true;
        const filteredData = sellers.filter((data) => data.status.title === activeTab && data.stepComplete === stepComplete);
        setSellersData(filteredData);
    }, [activeTab]);

    const columns = useMemo(() => [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) =>
                <>
                    <div>
                        {record.userId.name}
                        {record.userId.sellerRole === "own" &&
                            <Tag color="green">Own shop</Tag>
                        }
                    </div>
                </>
        },
        {
            title: 'ID',
            dataIndex: ['userId', '_id'],
            key: '_id',
            render: text => <>{text.toUpperCase()}</>,
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
            title: "Commission(%)",
            render: (text, record) => (
                <>
                    {record.commission ?
                        <>
                            {record.commission} %
                            <Button size="small" type="primary"
                                className="ml-1"
                                icon={<Edit2 size="14" />}
                                onClick={() => handleComission(record._id, 'edit', record.commission)}
                            >
                            </Button>
                        </>
                        :
                        <Button size="small" danger onClick={() => handleComission(record._id, 'set')}>Set</Button>
                    }
                </>
            ),
        },
        {
            title: 'Created At',
            dataIndex: ['userId', 'createdAt'],
            key: ['userId', 'createdAt'],
            render: (text) => <>{moment(text).format("DD MMM YYYY")}</>,
        },
        {
            title: 'Status',
            key: 'status',
            render: (text, record) => (
                <>
                    {record.userId.sellerRole !== "own" ?
                        <>
                            {
                                record.status.title == 'approved'
                                    ?
                                    <Switch
                                        checkedChildren={<CheckOutlined />}
                                        unCheckedChildren={<CloseOutlined />}
                                        onChange={() => changeSellerStatusHandler(record._id, 'blocked')}
                                    />
                                    :
                                    <Switch
                                        checkedChildren={<CheckOutlined />}
                                        unCheckedChildren={<CloseOutlined />}
                                        onChange={() => changeSellerStatusHandler(record._id, 'approved')}
                                        defaultChecked
                                    />
                            }
                        </>
                        :
                        <Tag>Approved</Tag>
                    }
                </>
            ),
        },
    ]
    );

    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
                    {record.documentVerify === 'verified' &&
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
                                                width="100%"
                                                height='200px'
                                                loader={customImageLoader}
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
                        </div>
                    }
                    {record.account.bankVerify === 'verified' &&
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
                                                width="100%"
                                                height='200px'
                                                loader={customImageLoader}
                                            />
                                        </div>
                                        :
                                        <a href={`${process.env.NEXT_PUBLIC_CUSTOM_IMAGECDN}/uploads/sellers/docs/${record.account.chequeFile}`} download className="text-primary ml-2">
                                            <Button type="dashed" size="small" icon={<DownloadOutlined />}>Download</Button >
                                        </a>
                                }
                            </div>
                            <div className="mt-4">
                                <strong>Current Status</strong>:
                                <Tag color="red" className="ml-2">{record.account.bankVerify.toUpperCase()}</Tag>
                            </div>
                        </div>
                    }
                </div>
            </div >
        )
    }

    const handleComission = (sellerId, type, commission = null) => {
        setSelectedSellerId(sellerId)
        setComissionActionType(type)
        setSelectedSellerComission(commission);
        setComissionModalVisible(true);
    }

    const handleCommissionModalCancel = () => {
        setComissionModalVisible(false);
        setSelectedSellerId(null)
        setComissionActionType(null)
        setSelectedSellerComission(null);
    }

    const onModalSubmit = async (inputdata) => {
        const commissionAmt = inputdata.commissionAmt;
        try {
            const { data } = await axiosApi.put('/api/admin/seller/commission', {
                sellerId: selectedSellerId,
                amount: commissionAmt
            },
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
                            {comissionActionType === 'set'
                                ?
                                " Commission percentage added successfully."
                                :
                                "Commission percentage updated successfully."
                            }
                        </div>
                    ),
                    className: 'message-success',
                });

                setComissionModalVisible(false);
                setSelectedSellerId(null)
                setComissionActionType(null)
                setSelectedSellerComission(null);

                return router.reload();
            }
        } catch (error) {
            setComissionModalVisible(false);
            setSelectedSellerId(null)
            setComissionActionType(null)
            setSelectedSellerComission(null);
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

    const changeSellerStatusHandler = (async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/status/${id}/${status}`, {}, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                if (status === 'approved') {
                    setActiveTab('blocked');
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

    return (
        <>
            <Head>
                <title>Sellers List | Admin Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Modal
                title="Set Commission"
                visible={comissionModalVisible}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <form onSubmit={handleSubmit(onModalSubmit)}>
                    <div>
                        <label className="cat-label">Commission(1-100%)</label>
                        <input type="number" className="form-control mt-1"
                            name="commissionAmt"
                            autoComplete="off"
                            ref={register({
                                required: "Provide commission. its should be at percentage without `%` sign",
                                min: {
                                    value: 1,
                                    message:
                                        "Commission must be between 1 - 100"
                                },
                                max: {
                                    value: 100,
                                    message:
                                        "Commission must be between 1 - 100"
                                }
                            })}
                        />
                        {errors.commissionAmt && <p className="errorMsg">{errors.commissionAmt.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleCommissionModalCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            {comissionActionType === 'edit' ? "UPDATE" : "SAVE"}
                        </button>
                    </div>
                </form>
            </Modal>
            <Wrapper onActive="sellers" breadcrumb={["Sellers"]}>
                <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                        Approved Sellers
                        <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('blocked')}>
                        Blocked Sellers
                        <div className={`activebar ${activeTab === 'blocked' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="table-responsive mt-5">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        expandable={{
                            expandedRowRender: record =>
                                expandedRowRender(record),
                            rowExpandable: record => true,
                        }}
                        dataSource={sellersData}
                    />
                </div>
            </Wrapper>
        </>
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