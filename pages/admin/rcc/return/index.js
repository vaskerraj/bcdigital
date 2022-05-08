import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';

import moment from 'moment';

import { Table, Tag, Image } from 'antd';

import Wrapper from '../../../../components/admin/Wrapper';
import { customImageLoader } from '../../../../helpers/functions'

const ReturnList = ({ returns }) => {

    const router = useRouter()

    const columns = [
        {
            title: 'Order Id',
            key: '_id',
            render: (record, text) => <>{record.order?._id.toUpperCase()}</>,
        },
        {
            title: 'Tracking Id',
            dataIndex: ['trackingId'],
        },
        {
            title: 'Return Amount',
            dataIndex: 'amount',
            key: 'amount',
            render: text => <span className="font-weight-bold">Rs.{text}</span>,
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
                        <div className="d-flex justify-content-between">
                            <div>
                                Order Id:
                                <Link href={`/admin/order/${record.order._id}`}>
                                    <a target="_blank" className="font-weight-bold text-uppercase text-info ml-2">
                                        {record.order._id}
                                    </a>
                                </Link>
                            </div>
                            <div>
                                Tracking Id: {record.trackingId}
                            </div>
                        </div>

                        <div className="d-block mt-2">
                            {record.products.map(item => (
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
                                                                <b>Return Qty</b>:{item.productQty}
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
                        <div className="d-block text-right mt-3">
                            <div className="d-block font16">
                                Total Refund Amount : <span className="font-weight-bold">Rs.{record.amount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
    return (
        <>
            <Head>
                <title>Pending Return List | Admin Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="returnList" breadcrumb={["Return, Refund & Cancellation", "Returns List"]}>
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
                    dataSource={returns}
                />
            </Wrapper>
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/return/list`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                returns: data
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
export default ReturnList;
