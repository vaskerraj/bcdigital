import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';

import moment from 'moment';
import { useForm } from 'react-hook-form';

import { message, Modal, Table, Tag, Image, Tooltip, Button } from 'antd';
import { CloseOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../../components/admin/Wrapper';
import { orderStatusText, paymentTypeText } from '../../../../helpers/functions'

const PendingRefund = ({ refunds }) => {

    const [denideReasonModalVisible, setDenideReasonModalVisible] = useState(false);
    const [selectedRefundId, setSelectedRefundId] = useState(null);

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors } = useForm();

    const columns = [
        {
            title: 'Order Id',
            dataIndex: ["orderId", "_id"],
            key: '_id',
            render: text => <>{text.toUpperCase()}</>,
        },
        {
            title: 'Refund Amount',
            dataIndex: 'refundType',
            key: 'refundType',
            render: text => <Tag color={text === 'cancel' ? 'magenta' : 'orange'} className="text-capitalize">{text}</Tag>,
        },
        {
            title: 'Refund Type',
            dataIndex: 'amount',
            key: 'amount',
            render: text => <span className="font-weight-bold">Rs.{text}</span>,
        },
        {
            title: 'Payment Type',
            dataIndex: 'paymentType',
            render: text => <>{paymentTypeText(text)}</>,

        },
        {
            title: 'Payment Status',
            dataIndex: 'paymentStatus',
            render: text => <> {text === 'notpaid' ? 'Not Paid' : 'Paid'}</>,
        },
        {
            title: 'Order At',
            dataIndex: ['orderId', 'createdAt'],
            render: (text) => <>{moment(text).format("DD MMM YYYY HH:mm")}</>

        }, {
            title: 'Cancel At',
            dataIndex: ['cancellationId', 'createdAt'],
            render: (text) => <>{moment(text).format("DD MMM YYYY HH:mm")}</>

        },
        {
            title: 'Request By',
            render: (text, record) =>
                <Tooltip title={
                    <div className="d-block">
                        <div className="d-block">Mobile No.:{record.refundTo.mobile} </div>
                        <div className="d-block">Email: {record.refundTo.email}</div>
                        <div className="d-block text-uppercase font12">ID: {record.refundTo._id}</div>
                    </div>
                }
                    color={'#fff'}
                    overlayInnerStyle={{ color: '#000' }}
                >
                    <div className="text-info cp">
                        {record.refundTo.name}
                    </div>
                </Tooltip>
        },
        {
            title: 'Request Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (text) => <>{moment(text).format("DD MMM YYYY HH:mm")}</>

        },
        {
            title: 'Status',
            key: 'status',
            render: (text, record) => (
                <>
                    <Tag color="green" key={record._id} className="mt-1 text-capitalize">
                        {record.status}
                    </Tag>
                </>
            ),
        },
    ];
    const pendingRefundHandler = async (refundId, status, reason = null) => {
        try {
            const { data } = await axiosApi.put('/api/refund/pending',
                {
                    refundId,
                    status,
                    reason
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
                            Refund status succssfully updated.
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

    const refundDenideHandler = (refundId) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure to denide refund?',
            okText: 'Sure',
            cancelText: 'Cancel',
            onOk: () => {
                setSelectedRefundId(refundId)
                setDenideReasonModalVisible(true)
            },
            onCancel: () => {
                setSelectedRefundId(null)
                Modal.destroyAll();
            }
        });
    }
    const onDenideReasonSubmit = (inputdata) => {
        const reason = inputdata.reason;
        setDenideReasonModalVisible(false)
        pendingRefundHandler(selectedRefundId, 'denide', reason);
    }

    const refundCompleteHandler = (refundId) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure to complete refund?',
            okText: 'Sure',
            cancelText: 'Cancel',
            onOk: () => {
                pendingRefundHandler(refundId, 'complete');
            },
            onCancel: () => {
                Modal.destroyAll();
            }
        });
    }

    const getProductTotal = (packages) => packages.reduce((a, c) => (a + c.cancelAmount), 0);
    const getShippingChargeTotal = (packages) => packages.reduce((a, c) => (a + c.shippingCharge), 0);

    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
                    <div className="col-12 mb-3">
                        Note: Refund proccess have to done manually.
                    </div>
                    <div className="col-4 border-right pl-2 pr-4">
                        <div className="d-block font-weight-bold">
                            Payment Details
                        </div>
                        <div className="d-flex justify-content-between">
                            <div>ID:</div>
                            <div className="text-uppercase">
                                <Tag color="blue" key={record._id}>
                                    {record.paymentId._id}
                                </Tag>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Amount:</div>
                            <div><strong>Rs.{record.paymentId.amount}</strong></div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Type:</div>
                            <div>{paymentTypeText(record.paymentId.paymentType)}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>TransactionId Id:</div>
                            <div>{(record.paymentId.transactionId)}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Status:</div>
                            <div className=" text-capitalize">{record.paymentId.paymentStatus}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Order Id:</div>
                            <div className=" text-uppercase">{record.paymentId.orderId}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Paid By:</div>
                            <div>{record.paymentId.paidBy.name}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Date:</div>
                            <div className="text-right text-uppercase">
                                {moment(record.paymentId.createdAt).format("DD MMM YYYY HH:mm")}
                            </div>
                        </div>
                    </div>
                    <div className="col-4 border-right pl-2 pr-4">
                        <div className="d-block font-weight-bold">
                            Cancellation Details
                        </div>
                        <div className="d-flex justify-content-between">
                            <div>ID:</div>
                            <div className="text-uppercase">{record.cancellationId._id}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Cancelled Product Total:</div>
                            <div><strong>Rs.{getProductTotal(record.cancellationId.packages)}</strong></div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Shipping Amount:</div>
                            <div><strong>Rs.{getShippingChargeTotal(record.cancellationId.packages)}</strong></div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Refund Amount:</div>
                            <div><strong>Rs.{(record.cancellationId.totalCancelAmount)}</strong></div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Cancellation Status:</div>
                            <div className=" text-capitalize">{record.cancellationId.status}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Id:</div>
                            <div className=" text-uppercase">
                                <Tag color="blue" key={record._id}>
                                    {record.cancellationId.paymentId}
                                </Tag>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Order Id:</div>
                            <div className=" text-uppercase">{record.cancellationId.orderId}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Cancellation Date:</div>
                            <div className="text-right text-uppercase">
                                {moment(record.cancellationId.createdAt).format("DD MMM YYYY HH:mm")}
                            </div>
                        </div>
                    </div>
                    <div className="col-4 pl-2 pr-4">
                        <div className="d-block font-weight-bold">
                            Refund Details
                        </div>
                        <div className="d-flex justify-content-between">
                            <div>ID:</div>
                            <div className="text-uppercase">{record._id}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Order Id:</div>
                            <div className=" text-uppercase">{record.cancellationId.orderId}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Id:</div>
                            <div className=" text-uppercase">
                                <Tag color="blue" key={record._id}>
                                    {record.cancellationId.paymentId}
                                </Tag>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Payment Type:</div>
                            <div><strong>{paymentTypeText(record.paymentId.paymentType)}</strong></div>
                        </div>
                        <div className="d-block border-top mt-3">
                            <strong>User Details</strong>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Name:</div>
                            <div>{(record.refundTo.name)}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Mobile No.:</div>
                            <div>{(record.refundTo.mobile)}</div>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Email:</div>
                            <div>{(record.refundTo.email)}</div>
                        </div>
                        <div className="d-block border-top mt-3">
                            <strong>Refund At</strong>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Refund To:</div>
                            <div><strong>{paymentTypeText(record.paymentType)}</strong></div>
                        </div>
                        {record.paymentType === 'esewa' ?
                            <div className="d-flex justify-content-between mt-2">
                                <div>e-Sewa Id:</div>
                                <div>
                                    {record.esewaId === undefined ?
                                        'Not Provided'
                                        :
                                        <strong>{record.esewaId}</strong>
                                    }
                                </div>
                            </div>
                            :
                            <>
                                <div className="d-block border-top mt-3">
                                    <strong>Bank Details</strong>
                                </div>

                                {record.bank?.title !== undefined ?
                                    <>
                                        <div className="d-flex justify-content-between mt-2">
                                            <div>Name</div>
                                            <div>{record.bank?.title}</div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <div>Number</div>
                                            <div>{record.bank?.number}</div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <div>Bank Name</div>
                                            <div>{record.bank?.bankName}</div>
                                        </div>
                                        <div className="d-flex justify-content-between mt-2">
                                            <div>Bank Branch</div>
                                            <div>{record.bank?.branch}</div>
                                        </div>
                                    </>
                                    :
                                    <div className="d-block">Not Provided</div>
                                }
                            </>
                        }
                    </div>
                    <div className="col-12 d-block text-right mt-3">
                        <div className="d-block mt-4">
                            <Button type="ghost" size="middle"
                                disabled={
                                    record.paymentType === 'esewa' ?
                                        record.esewaId === undefined ? true : false
                                        : record.bank.title === undefined ? true : false
                                }
                                icon={<CloseOutlined />}
                                onClick={() => refundDenideHandler(record._id)}
                            >
                                Denide Refund
                            </Button>
                            <Button type="danger" size="middle"
                                disabled={
                                    record.paymentType === 'esewa' ?
                                        record.esewaId === undefined ? true : false
                                        : record.bank.title === undefined ? true : false
                                }
                                icon={<CheckOutlined />} className="ml-4"
                                onClick={() => refundCompleteHandler(record._id)}
                            >
                                Complete Refund
                            </Button>
                        </div>
                    </div>
                </div>
            </div >
        )
    }

    return (
        <>
            <Modal
                title="Reason of return denial"
                visible={denideReasonModalVisible}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <form onSubmit={handleSubmit(onDenideReasonSubmit)}>
                    <div className="d-block">
                        <label>Reason</label>
                        <textarea
                            name="reason"
                            className="form-control"
                            autoComplete="off"
                            ref={register({
                                required: "Provide reason"
                            })}
                        >
                        </textarea>
                        {errors.reason && <p className="errorMsg">{errors.reason.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={() => setDenideReasonModalVisible(false)} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            Save & Continue
                        </button>
                    </div>
                </form>
            </Modal>
            <Wrapper onActive="refundPending" breadcrumb={["Return, Refund & Cancellation", "Pending Refund"]}>
                <Table
                    rowKey="_id"
                    rowClassName={(record) => record.order._id === (router.query.search !== undefined ? router.query.search.toLowerCase() : null)
                        ? 'table-row-highlight'
                        : null
                    }
                    columns={columns}
                    expandable={{
                        expandedRowRender: record =>
                            expandedRowRender(record),
                        rowExpandable: record => true,
                    }}
                    dataSource={refunds}
                />
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/refund/pending`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                refunds: data
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
export default PendingRefund;
