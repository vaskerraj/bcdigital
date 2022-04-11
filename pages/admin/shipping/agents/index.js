import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';

import { Switch, Popconfirm, message } from 'antd';
import { CloseOutlined, CheckOutlined, EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../../components/admin/Wrapper';
import ShipAgentModal from '../../../../components/admin/ShipAgentForm';
import { ReactTable } from '../../../../components/helpers/ReactTable';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const AgentList = ({ agents }) => {
    const [agentData, setAgentData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const [visible, setVisible] = useState(false);
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
                <Link href="admin/shipping/agent/">
                    <a target="_blank" rel="noopener noreferrer" className="text-info">
                        {original.name}
                    </a>
                </Link>
            )
        },
        {
            Header: "Email",
            accessor: "email",
            sortable: false,
            show: true,
            displayValue: " Email "
        },
        {
            Header: "Number.",
            accessor: "number",
            sortable: false,
            show: true,
            displayValue: " Number "
        },
        {
            Header: "Address",
            accessor: "address",
            sortable: false,
            show: true,
            displayValue: " Address "
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
                            onChange={() => changeAgentStatusHandler(original._id, original.status)}
                            defaultChecked
                        />
                        :
                        <Switch
                            checkedChildren={<CheckOutlined />}
                            unCheckedChildren={<CloseOutlined />}
                            onChange={() => changeAgentStatusHandler(original._id, original.status)}
                        />
                )
            }
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <Link href={`/admin/shipping/agents/edit/${original._id}`}>
                        <button className="btn btn-info mr-2">
                            <EditFilled />
                        </button>
                    </Link>
                </>
            )
        }
    ]);

    useEffect(() => {
        const filteredData = agents.filter((data) => data.status === activeTab);
        setAgentData(filteredData);
    }, [activeTab]);

    const changeAgentStatusHandler = (async (id, status) => {
        try {
            const { data } = await axiosApi.put(`/api/shipagent/status/${id}`, {}, {
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
                            Shipping Agent's status succssfully changed
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

    const deleteAgentHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/shipagent/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Shipping agent succssfully deleted
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

    return (
        <Wrapper onActive="agents" breadcrumb={["Shipping"]}>
            <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                <div className="filter-tab cp" onClick={() => setActiveTab('approved')}>
                    Approved Agents
                    <div className={`activebar ${activeTab === 'approved' ? 'active' : ''}`}></div>
                </div>
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('unapproved')}>
                    UnApproved Agents
                    <div className={`activebar ${activeTab === 'unapproved' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block text-right mt-5">
                <Link href="/admin/shipping/agents/add">
                    <button type="button" className="btn c-btn-primary">
                        Add Agent
                    </button>
                </Link>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={agentData}
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
        const { data } = await axios.get(`${process.env.api}/api/shipagent`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                agents: data
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

export default AgentList;