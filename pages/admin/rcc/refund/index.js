import React from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';

import moment from 'moment';

import { Table, Tag, Tooltip } from 'antd';

import Wrapper from '../../../../components/admin/Wrapper';
import { orderStatusText, paymentTypeText } from '../../../../helpers/functions'

const RefundList = ({ refunds }) => {
    const router = useRouter();

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
                    <div className="d-block font12">
                        {moment(record.updatedAt).format("DD MMM YYYY HH:mm")}
                    </div>
                </>
            ),
        },
    ];

    const getProductTotal = (packages) => packages.reduce((a, c) => (a + c.cancelAmount), 0);
    const getShippingChargeTotal = (packages) => packages.reduce((a, c) => (a + c.shippingCharge), 0);

    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
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
                            <strong>Refunded At</strong>
                        </div>
                        <div className="d-flex justify-content-between mt-2">
                            <div>Refunded To:</div>
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
                </div>
            </div >
        )
    }

    return (
        <>
            <Wrapper onActive="refundList" breadcrumb={["Refund, Return & Cancellation", "Refund List"]}>
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
        const { data } = await axios.get(`${process.env.api}/api/refund/list`, {
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
export default RefundList;
