import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';
import baseUrl from '../../../helpers/baseUrl';

import Countdown from "react-countdown";
import moment from 'moment';

import { message, Table, Tag, Modal, Tooltip, Popconfirm } from 'antd';
import { CloseOutlined, CheckOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { orderStatusText, paymentTypeText, generateTrackingId } from '../../../helpers/functions'

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerOrder = ({ ordersData }) => {

    const [activeTab, setActiveTab] = useState('not_confirmed');
    const [orders, setOrders] = useState([]);

    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth)

    const updateOrderStatus = async (status, itemId, packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/admin/orderstatus`,
                {
                    status,
                    itemId,
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

    const orderStatusOnChange = (status, itemId, orderId, packageId, paymentStatus, paymentType) => {
        Modal.confirm({
            title: 'Confirm',
            icon: <ExclamationCircleOutlined />,
            content: 'Are you sure to change order status to `' + orderStatusText(status) + '`',
            okText: 'Sure',
            cancelText: 'Cancel',
            onOk: () => status !== 'cancelled' ?
                updateOrderStatus(status, itemId, packageId)
                :
                cancelOrderProductByAdmin(orderId, packageId, itemId, paymentStatus, paymentType),
            onCancel: () => Modal.destroyAll()
        });
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

    const checkAllProductStatus = (products, status) => {
        const allStatus = products.map(item => item.orderStatus);
        return allStatus.includes(status)
    }

    const sellerTimeRenderCallback = ({ formatted, completed }) => {
        if (completed) {
            return <Tag color="red"> Expired</Tag>
        } else {
            // Render a countdown
            return <Tag>
                <span className="font15">{formatted.hours}</span>H
                : <span>{formatted.minutes}</span>M
            </Tag>;
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) => <Link href={`/admin/orders/${record.orders._id}`}><a target="_blank">{record.orders._id.toUpperCase()}</a></Link>,
        },
        {
            title: 'Payment Method',
            dataIndex: ['paymentType'],
            key: ['paymentType'],
            render: (text, record) => <>
                <Tag color="green" className="ml-1">{paymentTypeText(text)}</Tag>
                <span className="badge bg-success ml-2">
                    {record.paymentStatus === 'notpaid' ? 'Not Paid' : 'Paid'}
                </span>
            </>,

        },
        {
            title: 'Total',
            dataIndex: ['packageTotal'],
            key: ['packageTotal'],
            render: text => <>Rs.{text}</>,
        },
        {
            title: 'Shipping',
            dataIndex: ['shippingCharge'],
            key: ['shippingCharge'],
        },
        {
            title: 'Grand Total',
            dataIndex: ['packageTotal'],
            render: (text, record) => <>Rs.{record.packageTotal + record.shippingCharge}</>,
        },
        {
            title: 'Order By',
            render: (text, record) =>
                <Tooltip title={
                    <div className="d-block">
                        <div className="d-block">Mobile No.:{record.orders.orderedBy?.mobile} </div>
                        <div className="d-block">Email: {record.orders.orderedBy?.email}</div>
                        <div className="d-block text-uppercase font12">ID: {record.orders.orderedBy?._id}</div>
                    </div>
                }
                    color={'#fff'}
                    overlayInnerStyle={{ color: '#000' }}
                >
                    <div className="text-info">
                        <Link href={`/admin/`}>
                            <a target="_blank" rel="noopener noreferrer">
                                {record.orders.orderedBy.name}
                            </a>
                        </Link>
                    </div>
                </Tooltip>
        },
        {
            title: 'Seller',
            render: (text, record) =>
                <Tooltip title={
                    <div className="d-block">
                        <div className="d-block">Mobile No.:{record.seller.mobile} </div>
                        <div className="d-block">Email: {record.seller.email}</div>
                        <div className="d-block text-uppercase font12">ID: {record.seller._id}</div>
                    </div>
                }
                    color={'#fff'}
                    overlayInnerStyle={{ color: '#000' }}
                >
                    <div className="text-info">
                        <Link href={`/admin/sellers/${record.seller._id}`}>
                            <a target="_blank" rel="noopener noreferrer">
                                {record.seller.name}
                            </a>
                        </Link>
                    </div>
                </Tooltip>
        },
        {
            title: 'Time',
            dataIndex: ['createdAt'],
            key: ['createdAt'],
            render: (text) => <>{moment(text).fromNow()}</>,
        },
        {
            title: 'Seller Time',
            render: (text, record) =>
                checkAllProductStatus(record.products, 'confirmed')
                    ?
                    <Countdown
                        date={record.sellerTime}
                        daysInHours
                        renderer={sellerTimeRenderCallback}
                    />
                    :
                    <>-</>
        },
        {
            title: 'Status',
            render: (text, record) => <div className="d-flex">
                {
                    checkAllProductStatus(record.products, 'not_confirmed') ?
                        <>
                            <button className="btn btn-success" title="Confirmed" onClick={() => updateAllProductStatusWhileOrder(record.products, 'confirmed', record.orders._id, record._id, record.paymentType, record.paymentStatus)}>
                                <CheckOutlined />
                            </button>

                            <button className="btn btn-warning" title="Cancelled" onClick={() => updateAllProductStatusWhileOrder(record.products, 'cancelled', record.orders._id, record._id, record.paymentType, record.paymentStatus)}>
                                <CloseOutlined />
                            </button>
                        </>
                        :
                        <>
                            -
                        </>
                }

            </div >,
        },
    ];

    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="row">
                    <div className="col-12 mb-2">
                        <div className="row border p-2" style={{ borderRadius: '0.3rem' }}>
                            <div className="col-6 pr-5 pl-5 border-right">
                                <strong style={{ fontWeight: '500' }}>Seller's contact</strong>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        Name:
                                        <Link href={`/admin/sellers/${record.seller._id}`}>
                                            <a target="_blank" rel="noopener noreferrer">
                                                {record.seller.name}
                                            </a>
                                        </Link>
                                    </div>
                                    <div>Mobile No.:
                                        <strong style={{ fontWeight: '500' }}>{record.seller.mobile}</strong>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 pr-5 pl-5">
                                <strong style={{ fontWeight: '500' }}>Orderer's contact</strong>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        Name:
                                        <Link href={`/admin/`}>
                                            <a target="_blank" rel="noopener noreferrer">
                                                {record.orders.orderedBy.name}
                                            </a>
                                        </Link>
                                    </div>
                                    <div>Mobile No.:
                                        <strong style={{ fontWeight: '500' }}>
                                            {record.orders.orderedBy.mobile}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-8 border-right">
                        {record.products.map(item => (
                            <div key={item._id} className="d-block">
                                <div className="font16" style={{ fontWeight: 600 }}>
                                    <Link href={`/admin/orders/product/${item._id}/${item.slug}`}>
                                        <a target="_blank">
                                            {item.name}
                                        </a>
                                    </Link>
                                </div>
                                <div className="d-flex justify-content-between mt-2">
                                    <div>
                                        <strong style={{ fontWeight: '500' }}>Quantity</strong>: {item.productQty}
                                    </div>
                                    <div>
                                        <strong style={{ fontWeight: '500' }}>Size</strong>: {item.products[0].size}
                                    </div>
                                    <div>
                                        <strong style={{ fontWeight: '500' }}>
                                            Paid Amt.: <span className="text-success font15 font-weight-bold"> Rs.{item.price * item.productQty}
                                            </span>
                                        </strong>
                                    </div>
                                </div>
                                <div className="d-flex justify-content-between bg-light border-top border-bottom mt-4 pb-2 pt-3 pr-2 pl-2 position-relative">
                                    <div className="badge bg-warning" style={{ position: 'absolute', top: '-0.8rem' }}>
                                        Current
                                    </div>
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
                                        Sell Price: <span className="font15">Rs.{item.products[0].finalPrice}</span>
                                    </div>
                                </div>
                                <>
                                    <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                                        Payment Info:
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center pt-2">
                                        <div>
                                            Type:
                                            <Tag color="green" className="ml-1">{paymentTypeText(record.paymentType)}
                                            </Tag>
                                        </div>
                                        <div>
                                            Status:
                                            <span className="badge bg-success ml-2">
                                                {record.paymentStatus === 'notpaid' ? 'Not Paid' : 'Paid'}
                                            </span>
                                        </div>
                                    </div>
                                </>

                                <div className="d-flex justify-content-between align-items-center border-top mt-3 pb-2 pt-3">
                                    <div>
                                        Current Status:
                                        <Tag color="blue" key={item.orderStatus} className="ml-1">
                                            {orderStatusText(item.orderStatus)}
                                        </Tag>
                                    </div>
                                    {item.orderStatus === 'not_confirmed' &&
                                        <div>
                                            <select className="form-control" defaultValue={item.orderStatus} onChange={(e) => orderStatusOnChange(e.target.value, item._id, record.orders._id, record._id, record.paymentStatus, record.paymentType)}>
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
                    <div className="col-4">
                        <div>
                            <div className="border-bottom mt-2 pt-2 font16" style={{ fontWeight: 500 }}>
                                Delivery Info:
                            </div>
                            <div className="d-block">
                                Mobile: {record.orders.deliveryMobile}
                            </div>
                            <div className="d-block">
                                Ordered By: {record.orders.orderedBy?.name}
                            </div>
                            <div className="d-block">
                                Ordered At: {moment(record.createdAt).format("DD MMM YYYY HH:mm")}
                            </div>
                            <div className="d-block">
                                Shipping Plan: {record.orders.shipping?.name}
                            </div>
                            <div className="d-block">
                                Shipping Agent: {record.orders.shipping?.shipAgentId.name}
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        )
    }
    useEffect(() => {
        if (activeTab === 'all') {
            setOrders(ordersData);
        } else if (activeTab === 'cancelled') {
            const filteredData = ordersData.filter(product => product.products.some(item => item.orderStatus === 'cancelled_by_admin' || item.orderStatus === 'cancelled_by_seller' || item.orderStatus === 'cancelled_by_user' || item.orderStatus === 'cancel_approve'));
            setOrders(filteredData);
        } else {
            const filteredData = ordersData.filter(product => product.products.some(item => item.orderStatus === activeTab));
            setOrders(filteredData);
        }
    }, [activeTab, ordersData]);

    return (
        <Wrapper onActive="sellerOrders" breadcrumb={["Orders", "Seller's Orders"]}>
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
                <div className="filter-tab ml-4 cp" onClick={() => setActiveTab('cancelled')}>
                    Cancelled
                    <div className={`activebar ${activeTab === 'cancelled' ? 'active' : ''}`}></div>
                </div>
            </div>
            <div className="d-block mt-5">
                <Table
                    rowKey="_id"
                    columns={columns}
                    expandable={{
                        expandedRowRender: record =>
                            expandedRowRender(record),
                        rowExpandable: record => true,
                    }}
                    dataSource={orders}

                />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/orders/seller`, {
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
export default SellerOrder;
