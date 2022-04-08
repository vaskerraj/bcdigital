import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import axiosApi from '../../../helpers/api';
import axios from 'axios';

import moment from 'moment';
import { useForm } from 'react-hook-form';

import { message, Modal } from 'antd';
import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined, DownOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { paymentTypeText, generateTrackingId } from '../../../helpers/functions';

const AdminSellerOrdersDetails = ({ order }) => {

    // define delivery address variable
    const deliveryAddress = order.delivery?.addresses[0];

    const router = useRouter();
    const currentStatus = router.query.status;

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors, } = useForm();

    const getProductTotal = (products, currentOrder) => {
        let getNonCancelProduct = [];
        if (currentOrder === 'cancelled') {
            getNonCancelProduct = products.filter(product => product.orderStatus === 'cancel_approve' ||
                product.orderStatusLog.some(item =>
                    item.status !== 'cancel_denide')
                &&
                (
                    product.orderStatus === 'cancelled_by_seller'
                    || product.orderStatus === 'cancelled_by_user'
                    || product.orderStatus === 'cancelled_by_admin'
                ));
        } else {
            getNonCancelProduct = products.filter(item => item.orderStatus === currentOrder);
        }
        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const getShippingCharge = (products, currentOrder) => {
        let cancelledProducts = products;
        if (currentOrder === 'cancelled') {
            cancelledProducts = products.filter(product => product.orderStatus === 'cancel_approve' ||
                product.orderStatusLog.some(item =>
                    item.status !== 'cancel_denide')
                &&
                (
                    product.orderStatus === 'cancelled_by_seller'
                    || product.orderStatus === 'cancelled_by_user'
                    || product.orderStatus === 'cancelled_by_admin'
                ))
        }

        let shippingCharge = 0;
        if (cancelledProducts.length === products.length) {
            shippingCharge = order.shippingCharge;
        }
        return shippingCharge;
    }

    ///////////// update multiple orderStatus /////////////////
    const updateAllOrderProductStatus = async (status, productId, packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/orderstatus/all`,
                {
                    status,
                    productId,
                    packageId
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
                            Oder status succssfully updated.
                        </div>
                    ),
                    className: 'message-success',
                });
                setActiveTab(status);
                setTimeout(() => {
                    setActiveTab(activeTab);
                }, 200);

                return router.push(router.asPath);
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
    const cancelAllOrderProductByAdmin = async (orderId, productId, packageId, paymentType, paymentStatus) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/cancelorder/all`,
                {
                    orderId,
                    packageId,
                    productId,
                    paymentStatus,
                    paymentType
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
                            {
                                paymentStatus === 'cashondelivery' ?
                                    'Product has been succssfully cancelled but no need to proceed for refund.'
                                    :
                                    'Product has been succssfully cancelled and proceed for refund.'
                            }

                        </div>
                    ),
                    className: 'message-success',
                });
                return router.reload(true)
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

    const updateAllProductStatusWhileOrder = async (products, status, orderId, packageId, paymentType, paymentStatus) => {
        const filterCancellableProduct = products.filter(item => item.orderStatus === 'not_confirmed');
        const allProductId = filterCancellableProduct.map(item => item._id);

        status === 'cancelled'
            ?
            Modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: allProductId.length === 1
                    ?
                    'Are you sure to cancel this order?'
                    :
                    'Are you sure to cancel ' + allProductId.length + ' product(s)+',
                okText: 'Sure',
                cancelText: 'Cancel',
                onOk: () => cancelAllOrderProductByAdmin(orderId, allProductId, packageId, paymentType, paymentStatus),
            })
            :
            Modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: allProductId.length === 1
                    ?
                    'Are you sure to change order status to `' + orderStatusText(status) + '`'
                    :
                    'Are you sure to change order status of ' + allProductId.length + ' product(s) to `' + orderStatusText(status) + '`',
                okText: 'Sure',
                cancelText: 'Cancel',
                onOk: () => updateAllOrderProductStatus(status, allProductId, packageId),
            });
    }

    return (
        <>
            <Wrapper onActive="sellerOrders" breadcrumb={["Orders", "Seller's Orders", "Order's Detail"]}>
                <Head>
                    <title>Orders Details | Admin Center</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div className="d-block font15 mb-3 text-danger">This page content order details base on package(individual seller).
                    <Link href={`/admin/orders/all/${order.orders._id}`}>
                        <a className="text-info d-none">
                            View overall order details base on oder Id
                        </a>
                    </Link>
                </div>
                <div className="d-none d-sm-flex justify-content-between text-uppercase mt-2">
                    <div>
                        <span className="font12 font-weight-bold mr-2">Order Placed:</span>
                        {moment(order.createdAt).format("DD MMM YYYY HH:mm")}
                    </div>
                    <div>
                        <span className="font12 font-weight-bold">Order</span>:
                        #{order.orders._id}
                    </div>
                </div>
                <div className="d-block d-sm-none mt-3">
                    <div className="font-weight-bold" style={{ fontWeight: 500 }}>
                        Ship To
                    </div>
                    <div className="mt-2">
                        <div className="font14">{deliveryAddress.name}</div>
                        <div className="font14">{deliveryAddress.mobile}</div>
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
                        #{order.orders._id}
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
                            <div className="col-sm-4">
                                <div className="d-block font-weight-bold">Shipping Detail</div>
                                <div className="mt-2">
                                    <div className="font14">{deliveryAddress.name}</div>
                                    <div className="font14">{deliveryAddress.mobile}</div>
                                    <div className="font12 text-muted">
                                        {deliveryAddress.street}
                                        {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                        {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                    </div>
                                </div>
                                {order.trackingId &&
                                    <div className="mt-3">
                                        <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Tracking Id: {order.trackingId}</div>
                                    </div>
                                }
                            </div>
                            <div className="col-sm-4">
                                <div className="d-block font-weight-bold">Payment Details</div>
                                <div className="d-block">
                                    <span className="mr-2">Payment Method:</span>
                                    {paymentTypeText(order.paymentType)}
                                </div>
                                {order.paymentStatus === 'paid' &&
                                    <div className="d-block mt-2">
                                        <span className="mr-2">Paid At:</span>
                                        {moment(order.paymentDate).format("DD MMM YYYY HH:mm")}
                                    </div>
                                }
                            </div>
                            <div className="col-sm-4">
                                <div className="d-block font-weight-bold">Order Summery</div>
                                <div className="d-flex justify-content-between mt-2">
                                    <div>Item(s) Subtotal:</div>
                                    <div>Rs. {order.packageTotal}</div>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <div>Shipping Charge:</div>
                                    <div>Rs. {order.shippingCharge}</div>
                                </div>

                                <div className="d-flex justify-content-between font-weight-bold mt-2">
                                    <div className="font15">Grand Total:</div>
                                    <div className="font15" style={{ color: '#f33535' }}>Rs. {order.packageTotal + order.shippingCharge}</div>
                                </div>
                                {currentStatus !== 'not_confirmed' &&
                                    <>
                                        <div className="d-flex justify-content-between font-weight-bold mt-2 border-top pt-2">
                                            <div className="font13">
                                                {currentStatus !== 'cancelled' ? 'Payable' : 'Cancellable'} Total:
                                            </div>
                                            <div className="font13" style={{ color: '#f33535' }}>Rs. {getProductTotal(order.products, currentStatus)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between">
                                            <div>Shipping Charge:</div>
                                            <div>Rs. {getShippingCharge(order.products, currentStatus)}</div>
                                        </div>
                                        <div className="d-flex justify-content-between font-weight-bold mt-2">
                                            <div className="font15">{currentStatus !== 'cancelled' ? 'Payable' : 'Cancellable'} Price:</div>
                                            <div className="font15" style={{ color: '#f33535' }}>
                                                Rs. {getProductTotal(order.products, currentStatus) + getShippingCharge(order.products, currentStatus)}
                                            </div>
                                        </div>
                                    </>
                                }
                                <div className="d-flex justify-content-end mt-4">
                                    {currentStatus === 'not_confirmed' &&
                                        <>
                                            <button className="btn btn-success" title="Confirmed" onClick={() => updateAllProductStatusWhileOrder(order.products, 'confirmed', order.orders._id, order._id, order.paymentType, order.paymentStatus)}>
                                                <CheckOutlined />
                                            </button>

                                            <button className="btn btn-warning" title="Cancelled" onClick={() => updateAllProductStatusWhileOrder(order.products, 'cancelled', order.orders._id, order._id, order.paymentType, order.paymentStatus)}>
                                                <CloseOutlined />
                                            </button>
                                        </>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="d-block mt-4">
                    <div className="d-block border mt-4" style={{ borderRadius: '0.3rem' }}>
                        <div className="p-0 p-md-3">
                            <div className="d-block font-weight-bold font15 mt-2 mb-4">Product(s)</div>
                            {
                                order.products.map(item => (
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
                                                <span className="badge bg-success">{item.orderStatus}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="d-block d-sm-none mt-3 mb-5">
                    <div
                        className="title border p-3 pl-4 font13"
                        style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                    >
                        <div className="d-block">
                            <h2 style={{ fontWeight: 400 }}>Order Summary</h2>
                        </div>

                        <div className="d-flex justify-content-between font-weight-bold">
                            <div className="font15">Total Price:</div>
                            <div className="font15" style={{ color: '#f33535' }}>Rs. {getProductTotal(order.products, currentStatus)}</div>
                        </div>
                        <div className="d-block text-right">
                            <span className="text-muted mr-2">Paid By</span>
                            {paymentTypeText(order.paymentType)}
                            {order.paymentStatus !== 'paid' &&
                                <div className="d-block mt-2">
                                    <span className="mr-2">Paid At:</span>
                                    {moment(order.paymentDate).format("DD MMM YYYY HH:mm")}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const currentStatus = context.query.status;
        // if (currentStatus !== 'not_confirmed' && currentStatus !== 'confirmed' && currentStatus !== "packed" && currentStatus !== "shipped" && currentStatus !== "delivered" && currentStatus !== "cancelled" && currentStatus !== "return") {
        //     return {
        //         redirect: {
        //             source: '/admin/orders/seller',
        //             destination: '/admin/orders/seller',
        //             permanent: false,
        //         }
        //     }
        // }
        const { data } = await axios.get(`${process.env.api}/api/admin/package/${id}`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                order: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default AdminSellerOrdersDetails;
