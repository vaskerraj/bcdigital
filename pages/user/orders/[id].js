import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';

import moment from 'moment';

import { Layout, Card, message, Spin, Affix, Button } from 'antd';
const { Content } = Layout;

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader, paymentTypeText } from '../../../helpers/functions';

const OrdersDetails = ({ order, deliveryAddress, packages }) => {

    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width]);

    const router = useRouter();
    const { userInfo } = useSelector(state => state.userAuth);

    return (
        <Wrapper>
            <Head>
                <title>Orders Details | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {onlyMobile &&
                <Affix offsetTop={70}>
                    <div className="row bg-white backNav-container border-top p-2">
                        <div className="d-flex align-items-center mb-2">
                            <ArrowLeft className="mr-3" onClick={() => router.back()} />
                            Order Details
                        </div>
                    </div>
                </Affix>
            }
            <div className="container mt-4">
                <Layout>
                    {!onlyMobile &&
                        <UserSidebarNav onActive="orders" />
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
                                    <h1>Order Details</h1>
                                </div>
                                <div className="d-none d-sm-flex justify-content-between text-uppercase mt-2">
                                    <div>
                                        <span className="font12 font-weight-bold">Order Placed</span>:
                                        {moment(order.createdAt).format("DD MMM YYYY")}
                                    </div>
                                    <div>
                                        <span className="font12 font-weight-bold">Order</span>:
                                        #{order._id}
                                    </div>
                                </div>
                                <div className="d-block d-sm-none mt-3">
                                    <div className="font-weight-bold" style={{ fontWeight: 500 }}>
                                        Shipping Address
                                    </div>
                                    <div className="mt-2">
                                        <div className="font14">{deliveryAddress.name}</div>
                                        <div className="font13">{order.deliveryMobile}</div>
                                        <div className="font12 text-muted">
                                            {deliveryAddress.street}
                                            {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                            {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                        </div>
                                    </div>
                                </div>
                                <div
                                    className="d-block d-sm-none title border justify-content-between p-3 pl-4 font13 mt-4"
                                    style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                                >
                                    <div className="d-block font15">
                                        <span className="font-weight-bold" style={{ fontWeight: 500 }}>Order</span>:
                                        #{order._id}
                                    </div>
                                    <div className="d-block font13">
                                        <span className="font-weight-bold">Order Placed</span>:
                                        {moment(order.createdAt).format("DD MMM YYYY")}
                                    </div>
                                </div>
                                <div
                                    className="d-none d-sm-flex title border justify-content-between p-3 pl-4 font13 mt-4"
                                    style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                                >
                                    <div className="col">
                                        <div className="row">
                                            <div className="col-sm-7">
                                                <div className="d-block font-weight-bold">Shipping Address</div>
                                                <div className="mt-2">
                                                    <div className="font14">{deliveryAddress.name}</div>
                                                    <div className="font13">{order.deliveryMobile}</div>
                                                    <div className="font12 text-muted">
                                                        {deliveryAddress.street}
                                                        {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                                        {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-sm-5 font13">
                                                <div className="d-block font-weight-bold">Order Summery</div>
                                                <div className="d-flex justify-content-between mt-2">
                                                    <div>Item(s) Subtotal:</div>
                                                    <div>Rs. {order.total}</div>
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <div>Shipping Charge:</div>
                                                    <div>Rs. {order.shippingCharge}</div>
                                                </div>
                                                {order.couponDiscount !== 0 &&
                                                    <div className="d-flex justify-content-between">
                                                        <div>Coupon Discount:</div>
                                                        <div>Rs. {order.couponDiscount}</div>
                                                    </div>
                                                }
                                                <div className="d-flex justify-content-between font-weight-bold mt-2">
                                                    <div className="font15">Grand Total:</div>
                                                    <div className="font15" style={{ color: '#f33535' }}>Rs. {order.grandTotal}</div>
                                                </div>
                                                <div className="d-block text-right">
                                                    <span className="text-muted mr-2">Payment Method:</span>
                                                    {paymentTypeText(order.paymentType)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-block mt-4">
                                    {
                                        packages.map((pack, index) => (
                                            <div key={order._id} className="d-block border mt-4" style={{ borderRadius: '0.3rem' }}>
                                                <div
                                                    className="d-flex title border-bottom justify-content-between p-3 pl-4 font13"
                                                    style={{ backgroundColor: '#fff' }}
                                                >
                                                    <div className="d-block">
                                                        <div className="d-block text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>
                                                            Package {index + 1}
                                                        </div>
                                                        <div className="d-block">
                                                            Sold By: {pack.seller.name}
                                                        </div>
                                                    </div>
                                                    <div className="d-block text-right">
                                                        <div className="d-block">
                                                            <span className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Total</span>
                                                            : Rs.{pack.packageTotal}
                                                        </div>
                                                        {pack.paymentStatus === 'paid' &&
                                                            <div className="d-block">
                                                                Paid At : {moment(pack.paymentDate).format("DD MMMM YYYY")}
                                                            </div>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="col-12 p-0 p-md-3">
                                                    <div className="d-block mt-2">
                                                        {
                                                            pack.products.map(item => (
                                                                <div key={item._id} className="pt-2 pb-2">
                                                                    <div className="row">
                                                                        <div className="col-12 col-sm-8 col-md-6">
                                                                            <div className="d-flex">
                                                                                <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                    layout="fixed"
                                                                                    width="100"
                                                                                    height="100"
                                                                                    objectFit="cover"
                                                                                    objectPosition="top center"
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
                                                                                            <div className="mt-1" style={{ color: '#f33535' }}>
                                                                                                <div className="font-weight-bold">Rs: {item.price}</div>
                                                                                            </div>
                                                                                        </div>
                                                                                        {onlyMobile &&
                                                                                            <div className="mr-2">
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
                                                                                        }
                                                                                    </div>
                                                                                    {onlyMobile && item.orderStatus === 'delivered' && pack.paymentStatus === 'paid' &&
                                                                                        <div className="d-flex justify-content-end mt-1 mr-2">
                                                                                            {
                                                                                                moment(moment(pack.maturityDate).format('YYYY-MM-DD'))
                                                                                                    .isSameOrAfter(moment().format('YYYY-MM-DD')) === true &&
                                                                                                (item.productQty - item.returnProductQty >= 1) &&
                                                                                                <div className="text-right">
                                                                                                    <Link Link href={`/user/return/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                                        <Button size="small" danger>Return</Button>
                                                                                                    </Link>
                                                                                                    <div className="text-danger font12" style={{ fontWeight: 500 }}>
                                                                                                        till {moment(pack.maturityDate).format('DD MMM YYYY')}
                                                                                                    </div>
                                                                                                </div>
                                                                                            }
                                                                                            <Button size="small" className="ml-2">Write a Review</Button>
                                                                                        </div>
                                                                                    }
                                                                                    {
                                                                                        onlyMobile && item.orderStatus === 'not_confirmed' || item.orderStatus === 'confirmed' || item.orderStatus === 'packed'
                                                                                            ?
                                                                                            <div className="d-block text-right mt-1 mr-2">
                                                                                                <Link href={`/user/cancel/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                                    <button className="btn btn-warning btn-sm">Cancel</button>
                                                                                                </Link>
                                                                                            </div>
                                                                                            :
                                                                                            ''
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="d-none d-sm-block col-sm-4 col-md-2 text-right pr-4">
                                                                            {item.orderStatus !== 'not_confirmed' && item.orderStatus !== 'confirmed'
                                                                                ?
                                                                                item.orderStatus === 'for_delivery' ?
                                                                                    <span className="badge bg-warning">On The Way</span>
                                                                                    :
                                                                                    <span className="badge bg-success text-capitalize">{item.orderStatus}</span>
                                                                                :
                                                                                <span className="badge bg-warning">Processing</span>
                                                                            }
                                                                            {item.orderStatus === 'delivered' && pack.paymentStatus === 'paid' &&
                                                                                <div className="d-none d-sm-block d-md-none d-lg-none mt-3">
                                                                                    <div className="d-flex justify-content-end">
                                                                                        {
                                                                                            moment(moment(pack.maturityDate).format('YYYY-MM-DD'))
                                                                                                .isSameOrAfter(moment().format('YYYY-MM-DD')) === true &&
                                                                                            (item.productQty - item.returnProductQty >= 1) &&
                                                                                            <div className="text-right">
                                                                                                <Link Link href={`/user/return/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                                    <Button size="small" danger>Return</Button>
                                                                                                </Link>
                                                                                                <div className="text-danger font12" style={{ fontWeight: 500 }}>
                                                                                                    till {moment(pack.maturityDate).format('DD MMM YYYY')}
                                                                                                </div>
                                                                                            </div>
                                                                                        }
                                                                                        <Button size="small" className="ml-2">Write a Review</Button>
                                                                                    </div>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                item.orderStatus === 'not_confirmed' || item.orderStatus === 'confirmed' || item.orderStatus === 'packed'
                                                                                    ?
                                                                                    <div className="d-none d-sm-block d-md-none d-lg-none mt-3">
                                                                                        <Link href={`/user/cancel/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                            <button className="btn btn-warning btn-sm">Cancel</button>
                                                                                        </Link>
                                                                                    </div>
                                                                                    :
                                                                                    ''
                                                                            }
                                                                        </div>
                                                                        <div className="d-none d-md-block col-md-4 text-right">
                                                                            {item.orderStatus === 'delivered' && pack.paymentStatus === 'paid' &&
                                                                                <div className="d-flex d-sm-block justify-content-end">
                                                                                    {
                                                                                        moment(moment(pack.maturityDate).format('YYYY-MM-DD'))
                                                                                            .isSameOrAfter(moment().format('YYYY-MM-DD')) === true &&
                                                                                        (item.productQty - item.returnProductQty >= 1) &&
                                                                                        <div className="text-right">
                                                                                            <Link Link href={`/user/return/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                                <Button size="small" danger>Return</Button>
                                                                                            </Link>
                                                                                            <div className="text-danger font12" style={{ fontWeight: 500 }}>
                                                                                                till {moment(pack.maturityDate).format('DD MMM YYYY')}
                                                                                            </div>
                                                                                        </div>
                                                                                    }
                                                                                    <Button size="small" className="ml-2 mt-sm-2">Write a Review</Button>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                item.orderStatus === 'not_confirmed' || item.orderStatus === 'confirmed' || item.orderStatus === 'packed' ?
                                                                                    <div className="d-block text-right mt-1 mr-2">
                                                                                        <Link href={`/user/cancel/request?orderId=${order._id}&id=${item.products[0]._id}&packageId=${pack._id}`}>
                                                                                            <button className="btn btn-outline-primary btn-md">Cancel</button>
                                                                                        </Link>
                                                                                    </div>
                                                                                    :
                                                                                    ''
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                                <div className="d-block d-sm-none mt-3 mb-5">
                                    <div
                                        className="title border p-3 pl-4 font13"
                                        style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                                    >
                                        <div className="d-block">
                                            <h2 style={{ fontWeight: 400 }}>Order Summary</h2>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <div>Item(s) Subtotal:</div>
                                            <div>Rs. {order.total}</div>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <div>Shipping Charge:</div>
                                            <div>Rs. {order.shippingCharge}</div>
                                        </div>
                                        {order.couponDiscount !== 0 &&
                                            <div className="d-flex justify-content-between">
                                                <div>Coupon Discount:</div>
                                                <div>Rs. {order.couponDiscount}</div>
                                            </div>
                                        }
                                        <div className="d-flex justify-content-between font-weight-bold">
                                            <div className="font15">Grand Total:</div>
                                            <div className="font15" style={{ color: '#f33535' }}>Rs. {order.grandTotal}</div>
                                        </div>
                                        <div className="d-block text-right">
                                            <span className="text-muted mr-2">Paid By</span>
                                            {paymentTypeText(order.paymentType)}
                                        </div>
                                    </div>
                                </div>
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
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/orders/detail/${id}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                order: data.order,
                deliveryAddress: data.deliveryAddress,
                packages: data.packages,
            }
        }
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                destination: '../../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default OrdersDetails;
