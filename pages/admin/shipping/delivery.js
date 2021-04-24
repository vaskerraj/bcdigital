import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Switch, message, Popconfirm } from 'antd';
import { CloseOutlined, CheckOutlined, EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { ReactTable } from '../../../components/helpers/ReactTable';
import EditDeliveryAuthModal from '../../../components/admin/modals/EditDeliveryAuthModal';
import DeliveryUserModal from '../../../components/admin/modals/DeliveryUserModal';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const DeliveryUsersList = ({ deliveryusers }) => {
    const [userInitData, setUserInitData] = useState([]);
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
            accessor: "name",
            sortable: true,
            show: true,
            displayValue: " Name ",

        },
        {
            Header: "Agent",
            accessor: "agentId.name",
            sortable: true,
            show: true,
            displayValue: " Agent ",

        },
        {
            Header: "Username",
            Cell: ({ row: { original } }) => {
                return (
                    <>
                        <span>{original.username}</span>
                        <button className="btn btn-light ml-1" onClick={() => changeSubAdminAuthHandler(original)}>
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
            Header: "Status",
            show: true,
            Cell: ({ row: { original } }) => {
                return (
                    original.status == 'approved'
                        ?
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => chnageDeliveryUserHandler(original._id, original.status)}
                            defaultChecked
                        />
                        :
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => chnageDeliveryUserHandler(original._id, original.status)}
                        />
                )
            }
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <button className={`btn btn-info mr-2 ${adminAuth === null ? 'disabled' : ''}`}
                        onClick={() => editDeliveryUserHandler(original)}
                    >
                        <EditFilled />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this delivery user?"
                        onConfirm={() => deleteDeliveryUserHandler(original._id)}
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
        const filteredData = deliveryusers.filter(data => data.status === activeTab || data.status === undefined);
        setUserInitData(filteredData)
    }, [activeTab]);

    const changeSubAdminAuthHandler = useCallback(async (seller) => {
        setVisibleAuthModal(true);
        setDataForModal(seller);
    });

    const chnageDeliveryUserHandler = useCallback(async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/deliveryuser/status/${id}`, {}, {
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
                            Delivery user's status succssfully changed
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

    const deleteDeliveryUserHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/deliveryuser/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Delivery user successfully deleted
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

    const addDeliveryUserHandler = useCallback(() => {
        setVisible(true);
        setModalTitle("Add Delivery User");
        setModalAction("add_user");
        setDataForModal('');
    });

    const editDeliveryUserHandler = useCallback((user) => {
        setVisible(true);
        setModalTitle("Edit Delivery User");
        setModalAction("edit_user");
        setDataForModal(user);
    });

    const handleCancel = () => {
        setVisible(false);
    }

    const handleAuthModalCancel = () => {
        setVisibleAuthModal(false)
    }

    return (
        <Wrapper onActive="delivery" breadcrumb={["Shipping", 'Delivery Users']}>
            <DeliveryUserModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
                modalData={dataForModal}
            />
            <EditDeliveryAuthModal
                visible={visibleAuthModal}
                handleCancel={handleAuthModalCancel}
                modalData={dataForModal}
            />
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Active Delivery Users
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    Deactive Delivery Users
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block text-right mt-5">
                <button type="button" onClick={addDeliveryUserHandler} className={`btn c-btn-primary ${adminAuth === null ? 'disabled' : ''}`}>
                    Add Delivery User
                </button>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={userInitData}
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
        const { data } = await axios.get(`${process.env.api}/api/deliveryuser`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                deliveryusers: data
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

export default DeliveryUsersList;