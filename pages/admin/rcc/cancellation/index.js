import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';

import moment from 'moment';

import { Table, Tag, Image } from 'antd';

import Wrapper from '../../../../components/admin/Wrapper';
import { customImageLoader, orderStatusText, paymentTypeText } from '../../../../helpers/functions'

const CancellationList = ({ cancellations }) => {

    const router = useRouter()
    console.log(router.query.search);
    const columns = [
        {
            title: 'Order Id',
            key: '_id',
            render: (record, text) => <>{record.order?._id.toUpperCase()}</>,
        },
        {
            title: 'Cancel Amount',
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
            dataIndex: ['order', 'createdAt'],
            render: (text) => <>{moment(text).format("DD MMM YYYY HH:mm")}</>

        },
        {
            title: 'Request By',
            render: (text, record) => <Link href={`/`}>
                <a target="_blank">
                    {record.requestBy.name}
                </a>
            </Link>

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
    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
                    <div className="col-12">
                        <div className="d-block">
                            Order Id:
                            <Link href={`/admin/order/${record.order._id}`}>
                                <a target="_blank" className="font-weight-bold text-uppercase text-info ml-2">
                                    {record.order._id}
                                </a>
                            </Link>
                        </div>
                        <div className="d-block">
                            {
                                record.packages.map((pack, index) => (
                                    <div key={pack._id} className="d-block border mt-5" style={{ borderRadius: '0.3rem' }}>
                                        <div
                                            className="d-flex title border-bottom justify-content-between p-3 pl-4 font13"
                                            style={{ backgroundColor: '#fafafa' }}
                                        >
                                            <div className="d-block">
                                                <div className="d-block font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>
                                                    Package {index + 1}
                                                    <div className="d-flex align-items-center">
                                                        <div className="text-uppercase mr-2"> Cancel At:</div>
                                                        <Tag color="blue" key={pack._id} className="mt-1 text-capitalize">{orderStatusText(pack.cancelAt)}</Tag>
                                                    </div>
                                                </div>
                                                {pack.paymentStatus === 'paid' &&
                                                    <div className="d-block">
                                                        Paid At : {moment(record.paymentId?.createdAt).format("DD MMMM YYYY")}
                                                    </div>
                                                }
                                            </div>
                                            <div className="d-block text-right">
                                                <div className="d-block">
                                                    <span className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Package Total</span>
                                                    : Rs.{pack.amount}
                                                </div>
                                                {pack.shippingCharge !== 0 &&
                                                    <div className="d-block">
                                                        <span className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Shipping Charge</span>
                                                        : Rs.{pack.shippingCharge}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="d-block mt-2">
                                            {pack.products.map(item => (
                                                <div key={item.products[0]._id} className="pt-2 pb-2">
                                                    <div className="row">
                                                        <div className="col-12 col-sm-8 col-md-6">
                                                            <div className="d-flex">
                                                                <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                    layout="fixed"
                                                                    width="100px"
                                                                    height="100px"
                                                                    quality="50"
                                                                    loader={customImageLoader}
                                                                />
                                                                <div className="product-detail ml-3" style={{ width: '100%' }}>
                                                                    <div className="product-name">{item.name}</div>
                                                                    <div className="d-flex justify-content-between align-items-center mt-1">
                                                                        <div>
                                                                            <div className="">
                                                                                {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                            </div>
                                                                            <div className="mt-1">
                                                                                <b>Qty</b>:{item.productQty}
                                                                            </div>
                                                                            <div className="mt-1">
                                                                                <b>Price</b>:{item.price}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-4 text-right">
                                                            <strong>Reason:</strong> {item.reason}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="d-block text-right mt-3">
                            <div className="d-block font16">
                                Total Cancel Amount : <span className="font-weight-bold">Rs.{record.amount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
    return (
        <Wrapper onActive="cancellationList" breadcrumb={["Return, Refund & Cancellation", "Canellation List"]}>
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
                dataSource={cancellations}
            />
        </Wrapper>
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/cancellation/list`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                cancellations: data
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
export default CancellationList;
