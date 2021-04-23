import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { message, Popconfirm } from 'antd';
import { EditFilled, DeleteFilled } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { ReactTable } from '../../../components/helpers/ReactTable';
import ShippingPlanModal from '../../../components/admin/ShippingPlanModal';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const ShippingPlanList = ({ shippingPlan }) => {
    const [shippingPlanData, setShippingCostData] = useState(shippingPlan);

    const [visible, setVisible] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalAction, setModalAction] = useState('');
    const [dataForModal, setDataForModal] = useState('');

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);
    const precolumns = useMemo(() => [
        {
            Header: "Name",
            accessor: "name",
            show: true,
            displayValue: " Name ",
        },
        {
            Header: "City",
            accessor: row => row.cityId.name,
            Cell: ({ row: { original } }) => (
                <>
                    <span className="text-muted">{original.cityId.name}/</span>
                    <span>{original.cityId.parentId.name}</span>
                </>
            )
        },
        {
            Header: "Shipping Agent.",
            accessor: "shipAgentId.name",
            sortable: false,
            show: true,
            displayValue: " Shipping Agent "
        },
        {
            Header: "Amount",
            accessor: "amount",
            sortable: false,
            show: true,
            displayValue: " Amount "
        },
        {
            Header: "Actions",
            show: true,
            Cell: ({ row: { original } }) => (
                <>
                    <button className={`btn btn-info mr-2 ${adminAuth === null ? 'disabled' : ''}`}
                        onClick={() => editHandler(original)}
                    >
                        <EditFilled />
                    </button>
                    <Popconfirm
                        title="Are you sure to delete this agent?"
                        onConfirm={() => deleteHandler(original._id)}
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

    const deleteHandler = useCallback(async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/shipcost/${id}`, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Shipping Plan successfully deleted
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

    const addHandler = useCallback(() => {
        setVisible(true);
        setModalTitle("Add Shipping Plan");
        setModalAction("add_shipplan");
        setDataForModal(shippingPlanData);
    });

    const editHandler = useCallback((shippingCost) => {
        setVisible(true);
        setModalTitle("Edit Shipping Plan");
        setModalAction("edit_shipplan");
        setDataForModal(shippingCost);
    });

    const handleCancel = () => {
        setVisible(false);
    }

    return (
        <Wrapper onActive="shipping" breadcrumb={["Shipping"]}>
            <ShippingPlanModal
                title={modalTitle}
                visible={visible}
                handleCancel={handleCancel}
                modalAction={modalAction}
                shippingPlanData={dataForModal}
            />
            <div className="d-block text-right mt-3">
                <button type="button" onClick={addHandler} className={`btn c-btn-primary ${adminAuth === null ? 'disabled' : ''}`}>
                    Add Shipping Plan
                </button>
            </div>
            <div className="table-responsive mt-5">
                <ReactTable
                    columns={precolumns}
                    data={shippingPlanData}
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
        const { data } = await axios.get(`${process.env.api}/api/shipcost`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                shippingPlan: data
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

export default ShippingPlanList;