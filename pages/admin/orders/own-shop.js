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
    const [shippedModalVisible, setShippedModalVisible] = useState(false);
    const [orderItemId, setOrderItemId] = useState('');

    const { adminAuth } = useSelector(state => state.adminAuth);

    const { register, handleSubmit, errors, } = useForm();

    const handleShippedModalCancel = () => {
        setShippedModalVisible(false);
        return router.push(router.asPath)
    }

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

    const oderStatusOnChange = (status, itemId) => {
        const onModalConfirm = () => {
            updateOrderStatus(status, itemId)
        }
        const onModalCancel = () => {
            return router.push(router.asPath);
        }
        if (status !== 'shipped') {
            Modal.confirm({
                title: 'Confirm',
                icon: <ExclamationCircleOutlined />,
                content: 'Are you sure to change order status to `' + orderStatusText(status) + '`',
                okText: 'Sure',
                cancelText: 'Cancel',
                onOk: onModalConfirm,
                onCancel: onModalCancel
            });
        } else {
            setOrderItemId(itemId);
            setShippedModalVisible(true);
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
                            Order Id: {original._id.toUpperCase()}
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
                                    {item.products[0].discount ? `${item.products[0].discount} %` : 'N/A'}
                                    <div className="font13 text-muted">
                                        {item.products[0].discount ?
                                            `${moment(item.products[0].promoStartDate).format("DD MMMM YYYY")}
                                            -
                                            ${moment(item.products[0].promoEndDate).format("DD MMM YYYY")}`
                                            :
                                            ''
                                        }
                                    </div>
                                </div>
                                <div>
                                    Sell Price: <span className="text-success font15 font-weight-bold">Rs.{item.products[0].finalPrice}</span>
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
                                            {original.products[0].paymentStatus === 'notpaid' ? 'Not Paid' : 'Paid'}
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
                                <div>
                                    <select className="form-control" defaultValue={item.orderStatus} onChange={(e) => oderStatusOnChange(e.target.value, item._id)}>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="packed">Packed</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="not_confirmed" disabled={true}>Not Confirmed</option>
                                    </select>
                                </div>
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

    const onTackingIdSubmit = async (inputdata) => {
        const trackingId = inputdata.trackingId;
        updateOrderStatus('shipped', orderItemId, trackingId);
    }

    return (
        <>
            <Modal
                title="Add Tracking Id & Update Order Status to `Shipped`"
                visible={shippedModalVisible}
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
                            SAVE & UPDATE
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
                        Packed
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
