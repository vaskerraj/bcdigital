import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Switch, message, Popconfirm } from 'antd';
import { CloseOutlined, CheckOutlined, EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import baseUrl from '../../../helpers/baseUrl';
import { ReactTable } from '../../../components/helpers/ReactTable';
import OwnShopModal from '../../../components/admin/OwnShopModal';
import EditSellerAuthModal from '../../../components/admin/EditSellerAuthModal';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const OwnShopList = ({ sellers }) => {
    const [ownShopInitData, setOwnShopInitData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const [visible, setVisible] = useState(false);
    const [visibleAuthModal, setVisibleAuthModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalAction, setModalAction] = useState('');
    const [dataForModal, setDataForModal] = useState('');

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    const precolumns = useMemo(() => [
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
            Cell: ({ row: { original } }) => {
                return (
                    <>
                        <span>{original.username}</span>
                        <button className="btn btn-light ml-1" onClick={() => changeSellerAuthHandler(original)}>
                            <EditFilled size={25} color="blue" />
                        </button>
                    </>
                )
            }
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
            Header: "Revenue",
            accessor: "",
            sortable: true,
            show: true,
            displayValue: " Revenue "
        },
        {
            Header: "Status",
            show: true,
            Cell: ({ row: { original } }) => {
                return (
                    original.status == 'approved'
                        ?
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeSellerStatusHandler(original._id, original.status)}
                            defaultChecked
                        />
                        :
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeSellerStatusHandler(original._id, original.status)}
                        />
                )
            }
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <button className="btn btn-success mr-2"
                        onClick={() => viewAnalyticsHandler(original._id)}>
                        Analytics
                    </button>
                    <button className="btn btn-info mr-2"
                        onClick={() => editOwnShopHandler(original)}
                    >
                        <EditFilled />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this shop?"
                        onConfirm={() => deleteShopHandler(original._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button className="btn btn-warning">
                            <DeleteFilled />
                        </button>
                    </Popconfirm>

                </>
            )
        }
    ]);

    useEffect(() => {
        const filteredData = sellers.filter(data => data.status === activeTab && data.sellerRole === 'own');
        setOwnShopInitData(filteredData)
    }, [activeTab]);

    const changeSellerAuthHandler = useCallback(async (seller) => {
        setVisibleAuthModal(true);
        setDataForModal(seller);
    });

    const changeSellerStatusHandler = useCallback(async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/status/${id}`, {}, {
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
                            Shop status succssfully changed
                        </div>
                    ),
                    className: 'message-success',
                });
                router.push(router.asPath);
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


    const deleteShopHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/seller/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Shop succssfully deleted
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.reload();
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
    });

    const addOwnShopHandler = useCallback(() => {
        setVisible(true);
        setModalTitle("Add Own Shop");
        setModalAction("add_own");
        setDataForModal('');
    });

    const editOwnShopHandler = useCallback((seller) => {
        setVisible(true);
        setModalTitle("Edit Shop");
        setModalAction("edit_own");
        setDataForModal(seller);
    });

    const handleCancel = () => {
        setVisible(false);
    }

    const handleAuthModalCancel = () => {
        setVisibleAuthModal(false)
    }

    return (
        <Wrapper onActive="ownShop" breadcrumb={["Own Seller"]}>
            <OwnShopModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
                ownshopData={dataForModal}
            />
            <EditSellerAuthModal
                visible={visibleAuthModal}
                handleCancel={handleAuthModalCancel}
                ownshopData={dataForModal}
            />
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Active Shops
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    Deactive Shops
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block text-right mt-5">
                <button type="button" onClick={addOwnShopHandler} className="btn c-btn-primary">
                    Add Own Shop
                </button>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={ownShopInitData}
                    defaultPageSize={100}
                    tableClass={'table-bordered'}
                />
            </div>
        </Wrapper >
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

export default OwnShopList;