import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { parseCookies } from 'nookies';

import axios from 'axios';

import moment from 'moment';

import Wrapper from '../../../../components/admin/Wrapper';
import { customImageLoader, paymentTypeText } from '../../../../helpers/functions';

const OrdersDetails = ({ order, deliveryAddress, packages }) => {

    return (
        <Wrapper onActive="users" breadcrumb={["Order's Info"]}>
            <Head>
                <title>Orders Details | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
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
                                <span className="text-muted mr-2">Payment Method</span>
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
                                                                </div>
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
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/orders/detail/${id}`, {
            headers: {
                token: cookies.ad_token,
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
