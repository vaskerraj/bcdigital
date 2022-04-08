import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import axiosApi from '../../../helpers/api';
import axios from 'axios';

import moment from 'moment';
import { useForm } from 'react-hook-form';

import { message, Modal, Tag, Dropdown, Menu, Button } from 'antd';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/seller/Wrapper';
import { paymentTypeText, generateTrackingId } from '../../../helpers/functions';

const OrdersDetails = ({ order }) => {
    const [filteredProducts, setfilteredProducts] = useState([]);

    // for ready to pack
    const [allProductIdForPackedUpdate, setAllProductIdForPackedUpdate] = useState([]);
    const [shippingIdModalVisible, setShippingIdModalVisible] = useState(false);
    const [readyPackageId, setReadyPackageId] = useState(null);

    // define delivery address variable
    const deliveryAddress = order.delivery?.addresses[0];

    const router = useRouter();
    const currentStatus = router.query.status;

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const { register, handleSubmit, errors, } = useForm();

    useEffect(() => {
        if (currentStatus === 'cancelled') {
            const cancelledProduct = order.products.filter(product => product.orderStatus === 'cancel_approve' ||
                product.orderStatusLog.some(item =>
                    item.status !== 'cancel_denide')
                &&
                (
                    product.orderStatus === 'cancelled_by_seller'
                ));
            setfilteredProducts(cancelledProduct);
        } else {
            setfilteredProducts(order.products.filter(item => item.orderStatus === currentStatus))
        }
    }, [order, currentStatus]);

    const getProductTotal = (products, currentOrder) => {
        let getNonCancelProduct = 0;
        if (currentOrder === 'cancelled') {
            getNonCancelProduct = products.filter(product => product.orderStatus === 'cancel_approve' ||
                product.orderStatusLog.some(item =>
                    item.status !== 'cancel_denide')
                &&
                (
                    product.orderStatus === 'cancelled_by_seller'
                ));
        } else {
            getNonCancelProduct = products.filter(item => item.orderStatus === currentOrder);
        }
        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const handlePrintMenuClick = (e, packageId) => {
        if (e.key == 1) {
            return router.push(`/seller/orders/print/${packageId}`);
        } else {
            return router.push(`/seller/orders/print/order/${packageId}`);
        }
    }

    /////////order cancellation/////////
    const cancelAllOrderProductByAdmin = async (orderId, productId, packageId, paymentType, paymentStatus) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/cancelorder/all`,
                {
                    orderId,
                    packageId,
                    productId,
                    paymentStatus,
                    paymentType
                },
                {
                    headers: {
                        token: sellerAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Product has been succssfully cancelled.

                        </div>
                    ),
                    className: 'message-success',
                });
                return router.push(true)
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
    const cancelOrderHandler = async (products, orderId, packageId, paymentType, paymentStatus) => {
        const filterCancellableProduct = products.filter(item => item.orderStatus === 'confirmed');
        const allProductId = filterCancellableProduct.map(item => item._id);
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure to cancel this order?',
            okText: 'Sure',
            cancelText: 'Cancel',
            onOk: () => cancelAllOrderProductByAdmin(orderId, allProductId, packageId, paymentType, paymentStatus),
        })
    }
    ///////// update tracking Id ////////
    const updateOrderStatusTrackingId = async (trackingId, packageId, productId) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/orderstatus/trackingid`,
                {
                    trackingId,
                    packageId,
                    productId
                },
                {
                    headers: {
                        token: sellerAuth.token
                    }
                });
            if (data) {
                setShippingIdModalVisible(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Please print shipping level to process further.
                        </div>
                    ),
                    className: 'message-success',
                });
                return router.push(`/seller/orders/print/${packageId}`);
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

    const checkProductStatusWhileReadyToShip = async (products, packageId) => {
        const allProductId = products.map(item => item._id);
        setAllProductIdForPackedUpdate(allProductId);
        setShippingIdModalVisible(true);
        setReadyPackageId(packageId);
    }

    const handleShippedModalCancel = () => {
        setShippingIdModalVisible(false);
        setReadyPackageId(null);
        return router.push(router.asPath)
    }
    const onTackingIdSubmit = async (inputdata) => {
        const trackingId = inputdata.trackingId;
        updateOrderStatusTrackingId(trackingId, readyPackageId, allProductIdForPackedUpdate);
    }
    return (
        <>
            <Modal
                title="Add Tracking Id & Print Shipping Label"
                visible={shippingIdModalVisible}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <form onSubmit={handleSubmit(onTackingIdSubmit)}>
                    <div className="d-block">
                        <label>Tracking Id</label>
                        <input
                            name="trackingId"
                            className="form-control"
                            id="trackingId"
                            autoComplete="off"
                            ref={register({
                                required: "Provide tracking id"
                            })}
                        />

                        {errors.trackingId && <p className="errorMsg">{errors.trackingId.message}</p>}
                        <div className="d-block text-right text-primary cp" onClick={() => generateTrackingId('trackingId')}>
                            Generate Id
                        </div>
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleShippedModalCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            SAVE & PRINT
                        </button>
                    </div>
                </form>
            </Modal>
            <Wrapper onActive="manageOrders" breadcrumb={["Manage Orders", "Order Details"]}>
                <Head>
                    <title>Orders Details | BC Digital Seller Center</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
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
                                <div className="d-block font-weight-bold">Order Summery & Action</div>
                                <div className="d-flex justify-content-between font-weight-bold mt-2">
                                    <div className="font15">Total Price:</div>
                                    <div className="font15" style={{ color: '#f33535' }}>Rs. {getProductTotal(order.products, currentStatus)}</div>
                                </div>
                                <div className="d-flex justify-content-end mt-4">
                                    {currentStatus === 'confirmed' ?
                                        <div style={{ width: 120 }}>
                                            <Tag color="blue" className="d-block text-info cp"
                                                onClick={() => checkProductStatusWhileReadyToShip(order.products, order._id)}
                                            >
                                                Ready to pack
                                            </Tag>

                                            <Tag color="red" className="d-block text-info mt-1 cp"
                                                onClick={() => cancelOrderHandler(order.products, order.orders._id, order._id, order.paymentType, order.paymentStatus)}
                                            >
                                                Cancel
                                            </Tag>
                                        </div>
                                        :
                                        currentStatus !== 'cancelled' && currentStatus !== 'return' ?
                                            <Dropdown
                                                overlay={
                                                    <Menu onClick={(e) => handlePrintMenuClick(e, order._id)}>
                                                        <Menu.Item key="1">Print Shipping Label</Menu.Item>
                                                        <Menu.Item key="2" disabled>Print Order Details</Menu.Item>
                                                    </Menu>
                                                }
                                                placement="bottomRight"
                                                trigger={['click']}
                                            >
                                                <Button>
                                                    Print <DownOutlined />
                                                </Button>
                                            </Dropdown>
                                            :
                                            <></>
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
                                filteredProducts.map(item => (
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
                                                {item.orderStatus !== 'not_confirmed' && item.orderStatus !== 'confirmed'
                                                    ?
                                                    item.orderStatus === 'for_delivery' ?
                                                        <span className="badge bg-warning">On The Way</span>
                                                        :
                                                        <span className="badge bg-success text-capitalize">{currentStatus}</span>
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
                                    {moment(order.payementDate).format("DD MMM YYYY HH:mm")}
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
        if (currentStatus !== 'confirmed' && currentStatus !== "packed" && currentStatus !== "shipped" && currentStatus !== "delivered" && currentStatus !== "cancelled" && currentStatus !== "return") {
            return {
                redirect: {
                    source: '/seller/orders',
                    destination: '/seller/orders',
                    permanent: false,
                }
            }
        }
        const { data } = await axios.get(`${process.env.api}/api/seller/package/${id}`, {
            headers: {
                token: cookies.sell_token,
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
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default OrdersDetails;
