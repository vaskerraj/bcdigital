import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Layout, Card, message, Spin } from 'antd';
const { Content } = Layout;
import { LoadingOutlined } from '@ant-design/icons';

import moment from 'moment';

import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';

const Orders = ({ orders }) => {

    const [loadingOrderItems, setLoadingOrderItems] = useState(false);
    const [orderItems, setOrderItems] = useState(orders);
    const [orderFilter, setOrderFilter] = useState(2);

    const { userInfo } = useSelector(state => state.userAuth);

    const customLoadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

    const orderDurationChangeHandler = async (e) => {
        setLoadingOrderItems(true)
        const duration = e.target.value;
        setOrderFilter(duration);
        try {
            const { data } = await axiosApi.get(`/api/orders/${duration}`, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                setOrderItems(data);
                setLoadingOrderItems(false);
            }
        } catch (error) {
            setLoadingOrderItems(false);
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
    return (
        <Wrapper>
            <Head>
                <title>Orders | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <Layout>
                    <UserSidebarNav onActive="orders" />
                    <Layout className="site-layout">
                        <Content
                            style={{
                                margin: '0 0 0 15px'
                            }}>
                            <Card style={{
                                minHeight: '60vh'
                            }}>
                                <div className="d-block border-bottom pb-4">
                                    <div className="d-flex">
                                        <div className="mr-3">{orders.length} order placed in</div>
                                        <div className="">
                                            <select onChange={orderDurationChangeHandler}>
                                                <option value="1">last 30 days</option>
                                                <option value="2" selected>past 3 month</option>
                                                <option value="3">{moment().year()}</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <Spin spinning={loadingOrderItems} indicator={customLoadingIcon}>
                                    {orderItems.length === 0 &&
                                        <div className="d-block text-center mt-5 pt-4 pb-4">
                                            {orderFilter == 1 && <h2 className="text-muted">You have not placed any orders in last 30 days.</h2>}
                                            {orderFilter == 2 && <h2 className="text-muted">You have not placed any orders in past 3 month.</h2>}
                                            {orderFilter == 3 && <h2 className="text-muted">You have not placed any orders in {moment().year()}. </h2>}
                                            <Link href="/">
                                                <button type="button" className="btn c-btn-primary mt-5">Start Shopping</button>
                                            </Link>
                                        </div>
                                    }
                                    {orderItems && orderItems.map(order => (
                                        <div key={order._id} className="d-block border mt-5" style={{ borderRadius: '0.3rem' }}>
                                            <div
                                                className="d-flex title border-bottom justify-content-between p-3 pl-4 font13"
                                                style={{ backgroundColor: '#fafafa' }}
                                            >
                                                <div className="d-flex justify-content-around">
                                                    <div className="d-block">
                                                        <div className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Order Placed</div>
                                                        <div>
                                                            {moment(order.createdAt).format("DD MMMM YYYY")}
                                                        </div>
                                                    </div>
                                                    <div className="d-none d-sm-block ml-5">
                                                        <div className="text-uppercase font12 font-weight-bold">Total</div>
                                                        <div>Rs.{order.grandTotal}</div>
                                                    </div>
                                                </div>
                                                <div className="d-block text-right">
                                                    <div className="text-uppercase"><span className="font12 font-weight-bold">Order</span> #{order._id}</div>
                                                    <Link href={`/ user / orders / ${order._id}`}>
                                                        <a className="text-info">View Details</a>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="col-12 p-3">
                                                <ul className="list-unstyled">
                                                    {
                                                        order.products.map(item => (
                                                            <li key={item.products[0]._id} className={`cart-item item_${item.products[0]._id}`}>
                                                                <div className="row">
                                                                    <div className="col-6">
                                                                        <div className="d-flex">
                                                                            <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                layout="fixed"
                                                                                width="100"
                                                                                height="100"
                                                                                objectFit="cover"
                                                                                objectPosition="top center"
                                                                                quality="50"
                                                                            />
                                                                            <div className="product-detail ml-3">
                                                                                <div className="product-name">{item.name}</div>
                                                                                <div className="mt-1">
                                                                                    {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                                </div>
                                                                                <div className="mt-1">
                                                                                    <b>Qty</b>:{item.productQty}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-2 text-right">
                                                                        {item.orderStatus !== 'not_confirmed' && item.orderStatus !== 'confirmed'
                                                                            ?
                                                                            item.orderStatus === 'for_delivery' ?
                                                                                <span className="badge bg-warning">On The Way</span>
                                                                                :
                                                                                <span className="badge bg-success text-capitalize">{item.orderStatus}</span>
                                                                            :
                                                                            <span className="badge bg-warning">Processing</span>
                                                                        }
                                                                    </div>
                                                                    <div className="col-4 text-right">
                                                                        {item.orderStatus === 'delivered' && item.paymentStatus === 'paid'
                                                                            ?
                                                                            <div className="d-block">
                                                                                <button className="btn c-btn-primary">Write a Review</button>
                                                                            </div>
                                                                            : ''
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </Spin>
                            </Card>
                        </Content>
                    </Layout >
                </Layout >
            </div >
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/orders/2`, {
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
                destination: '../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Orders;
