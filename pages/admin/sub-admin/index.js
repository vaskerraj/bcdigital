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
import SubAdminModal from '../../../components/admin/SubAdminModal';
import EditSubAdminAuthModal from '../../../components/admin/EditSubAdminAuthModal';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SubAdminList = ({ subadmin }) => {
    const [subadminInitData, setSubadminInitData] = useState([]);
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
                        <button className="btn btn-light ml-1" onClick={() => changeSubAdminAuthHandler(original)}>
                            <EditFilled size={25} color="blue" />
                        </button>
                    </>
                )
            }
        },
        {
            Header: "Email",
            accessor: "email",
            sortable: false,
            show: true,
            displayValue: " Email "
        },
        {
            Header: "Mobile No.",
            accessor: "mobile",
            sortable: false,
            show: true,
            displayValue: " Mobile No. "
        },
        {
            Header: "Role",
            accessor: row => row.adminRole,
            displayValue: " Role ",
            Cell: ({ row: { original } }) => {
                let adminRoleText;
                if (original.adminRole === 'subsuperadmin') {
                    adminRoleText = "Sub Superadmin";
                } else if (original.adminRole === 'ordermanager') {
                    adminRoleText = "Order Manager";
                } else if (original.adminRole === 'financer') {
                    adminRoleText = "Financer";
                } else if (original.adminRole === 'contentmanager') {
                    adminRoleText = "Content Manager";
                }
                return adminRoleText;
            }
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
                            onChange={() => changeSubAdminHandler(original._id, original.status)}
                            defaultChecked
                        />
                        :
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeSubAdminHandler(original._id, original.status)}
                        />
                )
            }
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <button className="btn btn-info mr-2"
                        onClick={() => editSubAdminHandler(original)}
                    >
                        <EditFilled />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this sub-admin?"
                        onConfirm={() => deleteSubAdminHandler(original._id)}
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
        const filteredData = subadmin.filter(data => data.status === activeTab || data.status === undefined);
        setSubadminInitData(filteredData)
    }, [activeTab]);

    const changeSubAdminAuthHandler = useCallback(async (seller) => {
        setVisibleAuthModal(true);
        setDataForModal(seller);
    });

    const changeSubAdminHandler = useCallback(async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/subadmin/status/${id}`, {}, {
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

    const deleteSubAdminHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/subadmin/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Sub admin successfully deleted
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

    const addSubAdminHandler = useCallback(() => {
        setVisible(true);
        setModalTitle("Add Sub Admin");
        setModalAction("add_subadmin");
        setDataForModal('');
    });

    const editSubAdminHandler = useCallback((subadmin) => {
        setVisible(true);
        setModalTitle("Edit Sub Admin");
        setModalAction("edit_subadmin");
        setDataForModal(subadmin);
    });

    const handleCancel = () => {
        setVisible(false);
    }

    const handleAuthModalCancel = () => {
        setVisibleAuthModal(false)
    }

    return (
        <Wrapper onActive="subAdmin" breadcrumb={["Sub Admin"]}>
            <SubAdminModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
                subadminData={dataForModal}
            />
            <EditSubAdminAuthModal
                visible={visibleAuthModal}
                handleCancel={handleAuthModalCancel}
                subadminData={dataForModal}
            />
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Active Sub Admin
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    Deactive Sub Admin
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block text-right mt-5">
                <button type="button" onClick={addSubAdminHandler} className="btn c-btn-primary">
                    Add Sub Admin
                </button>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={subadminInitData}
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
        const { data } = await axios.get(`${process.env.api}/api/subadmin`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                subadmin: data
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

export default SubAdminList;