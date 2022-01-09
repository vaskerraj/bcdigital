import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import router, { useRouter } from 'next/router';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { message, Tag, Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

import moment from 'moment';

import { useForm } from 'react-hook-form';

import { orderStatusText, paymentTypeText, generateTrackingId } from '../../../helpers/functions'
import { checkProductDiscountValidity } from '../../../helpers/productDiscount';
import Wrapper from '../../../components/admin/Wrapper';
import { ReactTable } from '../../../components/helpers/ReactTable';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const OwnshopOrder = ({ ordersData }) => {
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('not_confirmed');
    const [shippingIdModalVisible, setShippingIdModalVisible] = useState(false);
    const [allProductIdForPackedUpdate, setAllProductIdForPackedUpdate] = useState([]);
    const [orderId, setOrderId] = useState('');

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors, } = useForm();

    const updateOrderStatus = async (status, itemId, tackingId = null) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/orderstatus`,
                {
                    status,
                    itemId,
                    tackingId
                },
                {
                    headers: {
                        token: adminAuth.token
                    }
                });
            if (data) {

                if (status === 'packed') {
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
                    return router.push(`/admin/orders/print/${orderId}`);
                } else {
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
                }

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

    const updateOrderStatusTrackingId = async (trackingId, packageId, productId) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/orderstatus/trackingid`,
                {
                    trackingId,
                    packageId,
                    productId
                },
                {
                    headers: {
                        token: adminAuth.token
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
                return router.push(`/admin/orders/print/${packageId}`);
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

    const cancelOrderProductByAdmin = async (orderId, packageId, productId, paymentStatus, paymentType) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/cancelorder`,
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

    const oderStatusOnChange = (status, itemId, orderId, packageId, paymentStatus, paymentType) => {
        const onModalConfirm = () => {
            if (status !== 'cancelled') {
                updateOrderStatus(status, itemId, packageId)
            } else {
                cancelOrderProductByAdmin(orderId, packageId, itemId, paymentStatus, paymentType)
            }
        }
        const onModalCancel = () => {
            return router.push(router.asPath);
        }
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure to change order status to `' + orderStatusText(status) + '`',
            okText: 'Sure',
            cancelText: 'Cancel',
            onOk: onModalConfirm,
            onCancel: onModalCancel
        });
    }

    const checkProductStatusWhileReadyToShip = async (products, packageId) => {
        const allStatus = products.map(item => item.orderStatus);
        const productStatusNotConfirm = allStatus.includes('not_confirmed');

        const onModalConfirm = () => {
            return router.push(router.asPath);
        }
        const onModalCancel = () => {
            return router.push(router.asPath);
        }

        if (productStatusNotConfirm) {
            Modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: 'You have another product with this order.Please confirm or cancel that product and proceed.',
                okText: 'Sure',
                cancelText: 'Cancel',
                onOk: onModalConfirm,
                onCancel: onModalCancel
            });
        } else {
            const allProductId = products.map(item => item._id);
            setAllProductIdForPackedUpdate(allProductId);
            setShippingIdModalVisible(true);
            setOrderId(packageId);
        }
    }

    const precolumns = useMemo(() => [
        {
            Header: "Product Details",
            show: true,
            Cell: ({ row: { original } }) => (
                <div className="pt-4 pb-4">
                    <div className="d-block">
                        <Tag color="black">
                            Order Id: {original.orders._id.toUpperCase()}
                        </Tag>
                    </div>
                    {original.products.map(item => (
                        <div key={item._id} className="d-block">
                            <div className="font16" style={{ fontWeight: 600 }}>
                                {item.name}
                            </div>
                            <div className="d-flex justify-content-between">
                                <div>
                                    Order Quantity: {item.productQty}
                                </div>
                                <div>
                                    Size: {item.products[0].size}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between bg-light border-top border-bottom mt-3 pb-2 pt-3 pr-2 pl-2">
                                <div>
                                    Price: Rs.{item.products[0].price}
                                </div>
                                <div>
                                    Discount:
                                    {
                                        checkProductDiscountValidity(item.products[0].promoStartDate, item.products[0].promoEndDate) ? item.products[0].discount : 'N/A'
                                    }
                                    <div className="font13 text-muted">
                                        {checkProductDiscountValidity(item.products[0].promoStartDate, item.products[0].promoEndDate) ?
                                            `${moment(item.products[0].promoStartDate).format("DD MMMM YYYY")}
                                            -
                                            ${moment(item.products[0].promoEndDate).format("DD MMM YYYY")}`
                                            :
                                            ''
                                        }
                                    </div>
                                </div>
                                <div>
                                    Sell Price:
                                    <span className="text-success font15 font-weight-bold">
                                        Rs.
                                        {checkProductDiscountValidity(item.products[0].promoStartDate, item.products[0].promoEndDate)
                                            ?
                                            item.products[0].finalPrice
                                            :
                                            item.products[0].price
                                        }
                                    </span>
                                </div>
                            </div>
                            <>
                                <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                                    Payment Info:
                                </div>
                                <div className="d-flex justify-content-between align-items-center pt-2">
                                    <div>
                                        Type:
                                        <Tag color="green" key={original.paymentType} className="ml-1">{paymentTypeText(original.paymentType)}
                                        </Tag>
                                    </div>
                                    <div>
                                        Status:
                                        <span className="badge bg-success ml-2">
                                            {original.paymentStatus === 'notpaid' ? 'Not Paid' : 'Paid'}
                                        </span>
                                    </div>
                                </div>
                            </>
                            <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                                Seller Info
                            </div>

                            <div className="d-flex justify-content-between">
                                <div>
                                    Name: {original.seller?.name}
                                </div>
                            </div>
                            <div className="d-flex justify-content-between align-items-center border-top mt-3 pb-2 pt-3">
                                <div>
                                    Current Status:
                                    <Tag color="blue" key={item.orderStatus} className="ml-1">
                                        {orderStatusText(item.orderStatus)}
                                    </Tag>
                                </div>
                                {item.orderStatus === 'not_confirmed' &&
                                    <div>
                                        <select
                                            className="form-control"
                                            defaultValue={item.orderStatus}
                                            onChange={(e) => oderStatusOnChange(e.target.value, item._id, original.orders._id, original._id, original.paymentStatus, original.paymentType)}
                                        >
                                            <option value="confirmed">Confirmed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="not_confirmed" disabled={true}>Not Confirmed</option>
                                        </select>
                                    </div>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            )
        },
        {
            Header: "Order Details",
            show: true,
            Cell: ({ row: { original } }) => (
                <div className="pt-4 pb-4">
                    <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                        Summery:
                    </div>
                    <div className="d-block font-weight-bold" style={{ fontWeight: 400 }}>
                        Total: Rs.{original.products.reduce((a, c) => (a + c.productQty * c.price), 0)}
                    </div>
                    <div className="d-block">
                        Coupon: {original.coupon ? original.coupon.name : 'N/A'}
                    </div>
                    <div className="d-block">
                        Coupon Discount: Rs.{original.orders.couponDiscount}
                    </div>
                    <div className="d-block">
                        Shipping: Rs.{original.orders.shippingCharge}
                    </div>
                    <div className="d-block font-weight-bold text-right">
                        Grand Total: <span className="text-success font16 ">Rs.{original.orders.grandTotal}</span>
                    </div>

                    <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                        Delivery Info:
                    </div>
                    <div className="d-block">
                        Mobile: {original.orders.deliveryMobile}
                    </div>
                    <div className="d-block">
                        Ordered By: {original.orders.orderedBy?.name}
                    </div>
                    <div className="d-block">
                        Ordered At: {moment(original.createdAt).format("DD MMM YYYY HH:mm")}
                    </div>
                    <div className="d-block">
                        Shipping Plan: {original.orders.shipping?.name}
                    </div>
                    <div className="d-block">
                        Shipping Agent: {original.orders.shipping?.shipAgentId.name}
                    </div>
                </div>
            )
        },
        {
            Header: "Action",
            show: true,
            Cell: ({ row: { original } }) => (
                <div className="text-right">
                    {activeTab === 'confirmed'
                        ?
                        <button type="button" className="btn btn-primary" onClick={() => checkProductStatusWhileReadyToShip(original.products, original._id)}>
                            Ready to Ship
                        </button>
                        :
                        "-"
                    }
                </div>
            )
        }
    ]);

    useEffect(() => {
        if (activeTab !== 'all') {
            const filteredData = ordersData.filter(product => product.products.some(item => item.orderStatus === activeTab));
            setOrders(filteredData);
        } else {
            setOrders(ordersData);
        }
    }, [activeTab, ordersData]);

    const handleShippedModalCancel = () => {
        setShippingIdModalVisible(false);
        return router.push(router.asPath)
    }
    const onTackingIdSubmit = async (inputdata) => {
        const trackingId = inputdata.trackingId;
        updateOrderStatusTrackingId(trackingId, orderId, allProductIdForPackedUpdate);
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
            <Wrapper onActive="ownShopOrders" breadcrumb={["Orders", "Own Shop's Orders"]}>
                <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => setActiveTab('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('not_confirmed')}>
                        Not Confirmed
                        <div className={`activebar ${activeTab === 'not_confirmed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('confirmed')}>
                        Confirmed
                        <div className={`activebar ${activeTab === 'confirmed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('packed')}>
                        Packed(Ready to Ship)
                        <div className={`activebar ${activeTab === 'packed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('shipped')}>
                        Shipped
                        <div className={`activebar ${activeTab === 'shipped' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('delivered')}>
                        Delivered
                        <div className={`activebar ${activeTab === 'delivered' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="table-responsive mt-5">
                    <ReactTable
                        columns={precolumns}
                        data={orders}
                        defaultPageSize={30}
                        tableClass={'table-striped'}
                    />
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/orders/own`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                ordersData: data
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
export default OwnshopOrder;
