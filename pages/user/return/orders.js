import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';

import { Layout, Card, Button, Affix } from 'antd';
const { Content } = Layout;

import moment from 'moment';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader, orderStatusText } from '../../../helpers/functions';

const CancelOrders = ({ orders }) => {

    const [orderItems, setOrderItems] = useState(orders);

    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width])

    const router = useRouter();
    const { userInfo } = useSelector(state => state.userAuth);

    const getReturnProductStatus = (products, returnTrackingId) => {
        const filterBaseOnTrackingId = products.filter(item => item.trackingId === returnTrackingId)
        return filterBaseOnTrackingId[0].orderStatus;
    }
    return (
        <>
            <Wrapper>
                <Head>
                    <title>Return Orders | BC Digital</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                {onlyMobile &&
                    <Affix offsetTop={70}>
                        <div className="row bg-white backNav-container border-top p-2">
                            <div className="d-flex align-items-center mb-2">
                                <ArrowLeft className="mr-3" onClick={() => router.back()} />
                                Return Orders
                            </div>
                        </div>
                    </Affix>
                }
                <div className="container mt-4">
                    <Layout>
                        {!onlyMobile &&
                            <UserSidebarNav onActive="return" />
                        }
                        <Layout className="site-layout">
                            <Content
                                style={{
                                    margin: onlyMobile ? '0' : '0 0 0 15px'
                                }}>
                                <Card style={{
                                    minHeight: '60vh'
                                }}>
                                    <div className="d-block page-header justify-content-between">
                                        <h1>Return Orders</h1>
                                    </div>

                                    {orderItems && orderItems.map(order => (
                                        <div key={order._id} className="d-block border mt-5" style={{ borderRadius: '0.3rem' }}>
                                            <div
                                                className="d-flex title border-bottom justify-content-between p-3 pl-4 font13"
                                                style={{ backgroundColor: '#fafafa' }}
                                            >
                                                {!onlyMobile ?
                                                    <>
                                                        <div className="d-flex justify-content-around">
                                                            <div className="d-block">
                                                                <div className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Order Placed</div>
                                                                <div>
                                                                    {moment(order.order.createdAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                            <div className="d-none d-sm-block ml-5">
                                                                <div className="text-uppercase font12 font-weight-bold">
                                                                    {order.status === 'complete' ?
                                                                        'Returned' :
                                                                        order.status === 'denide' ?
                                                                            'Denide'
                                                                            : 'Request'
                                                                    }  At
                                                                </div>
                                                                <div>{moment(order.updatedAt).format("DD MMMM YYYY")}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-block text-right">
                                                            <div className="text-uppercase">
                                                                <span className="font12 font-weight-bold">Order</span>
                                                                <Link href={`/user/orders/${order._id}`}>
                                                                    <a className="text-info">
                                                                        #{order._id}
                                                                    </a>
                                                                </Link>
                                                            </div>
                                                            <div className="d-flex justify-content-end">
                                                                <div>
                                                                    <span className="badge bg-danger mr-2">{orderStatusText(getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId))}</span>
                                                                </div>
                                                                {
                                                                    getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) === "return_approve" &&
                                                                    <>
                                                                        |
                                                                        <Link href={`/user/return/result?pId=${order.packageId._id}&trackingId=${order.returnTrackingId}`}>
                                                                            <Button size="small" type="primary" className="d-block ml-2 mr-2">View Return Steps</Button>
                                                                        </Link>
                                                                        |
                                                                        <Link href={`/user/return/print/${order.packageId._id}?trackingId=${order.returnTrackingId}`}>
                                                                            <Button size="small" danger className="d-block ml-2">Print Return Label</Button>
                                                                        </Link>
                                                                    </>
                                                                }
                                                            </div>
                                                            {
                                                                (
                                                                    getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) !== "return_request"
                                                                    && getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) !== "return_approve"
                                                                )
                                                                &&
                                                                order.refund &&
                                                                <div className="d-block">
                                                                    <div className="d-block ml-3">
                                                                        Refund Amount:
                                                                        <strong className="mr-2 ml-2">Rs. {order.refund?.amount}</strong>
                                                                    </div>

                                                                    <div className="d-block">
                                                                        Refund Status :
                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                            {order.refund.status === 'justin' ? 'Processing' : order.refund.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </>
                                                    :
                                                    <div style={{ width: '100%' }}>
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <div className="text-uppercase">
                                                                    <span className="font12 font-weight-bold">Order</span>
                                                                    <Link href={`/user/orders/${order._id}`}>
                                                                        <a className="text-info">
                                                                            #{order._id}
                                                                        </a>
                                                                    </Link>
                                                                </div>
                                                                <div className="d-block">
                                                                    <span className="text-uppercase font12 font-weight-bold mr-1" style={{ fontSize: '1.2rem' }}>
                                                                        Order Placed
                                                                    </span>
                                                                    {moment(order.order.createdAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="d-block">
                                                                    <span className="text-uppercase font12 font-weight-bold mr-1" style={{ fontSize: '1.2rem' }}>
                                                                        {order.status === 'complete'
                                                                            ? 'Returned' :
                                                                            order.status === 'denide' ?
                                                                                'Denide'
                                                                                : 'Request'
                                                                        }  At:
                                                                    </span>
                                                                    {moment(order.updatedAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-block border-top mt-2 pt-2">
                                                            <div className="d-flex">
                                                                <div>
                                                                    <span className="badge bg-danger mr-2">{orderStatusText(getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId))}</span>
                                                                </div>
                                                                {
                                                                    getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) === "return_approve" &&
                                                                    <>
                                                                        |
                                                                        <Link href={`/user/return/result?pId=${order.packageId._id}&trackingId=${order.returnTrackingId}`}>
                                                                            <Button size="small" type="primary" className="d-block ml-2 mr-2">View Return Steps</Button>
                                                                        </Link>
                                                                        |
                                                                        <Link href={`/user/return/print/${order.packageId._id}?trackingId=${order.returnTrackingId}`}>
                                                                            <Button size="small" danger className="d-block ml-2">Print Return Label</Button>
                                                                        </Link>
                                                                    </>
                                                                }
                                                            </div>
                                                            {
                                                                (
                                                                    getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) !== "return_request"
                                                                    && getReturnProductStatus(order.packageId.rproducts, order.returnTrackingId) !== "return_approve"
                                                                )
                                                                &&
                                                                order.refund &&
                                                                <div className="d-block">
                                                                    <div className="d-block ml-3">
                                                                        Refund Amount:
                                                                        <strong className="mr-2 ml-2">Rs. {order.refund?.amount}</strong>
                                                                    </div>

                                                                    <div className="d-block">
                                                                        Refund Status :
                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                            {order.refund.status === 'justin' ? 'Processing' : order.refund.status}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div className="col-12 p-0 p-md-3">
                                                <ul className="list-unstyled mt-2">
                                                    {
                                                        order.products.map(item => (
                                                            <div key={item.products[0]._id} className="pt-2 pb-2">
                                                                <div className="row">
                                                                    <div className="col-12 col-sm-8 col-md-6">
                                                                        <div className="d-flex">
                                                                            <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                layout="fixed"
                                                                                width="100"
                                                                                height="100"
                                                                                objectFit="cover"
                                                                                objectPosition="top center"
                                                                                quality="40"
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
                                                                                            <b>Return Qty</b>: {item.productQty}
                                                                                        </div>
                                                                                        <div className="mt-1">
                                                                                            <b>Price</b>: Rs.{item.price}
                                                                                        </div>
                                                                                    </div>
                                                                                    {onlyMobile &&
                                                                                        <div className="mr-2">
                                                                                            {
                                                                                                order.status === 'denide' ?
                                                                                                    <span className="badge bg-danger">Denide</span>
                                                                                                    :
                                                                                                    order.status === 'complete' ?
                                                                                                        <span className="badge bg-success text-capitalize">Returned</span>
                                                                                                        :
                                                                                                        <span className="badge bg-warning">Processing</span>
                                                                                            }
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="d-none d-sm-block col-sm-2 col-md-3 text-right pr-4">
                                                                        {
                                                                            order.status === 'denide' ?
                                                                                <span className="badge bg-danger">Denide</span>
                                                                                :
                                                                                order.status === 'complete' ?
                                                                                    <span className="badge bg-success text-capitalize">Returned</span>
                                                                                    :
                                                                                    <span className="badge bg-warning">Processing</span>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </Content>
                        </Layout >
                    </Layout >
                </div >
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/returnorders`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                orders: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                destination: '../../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default CancelOrders;