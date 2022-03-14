import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import CryptoJS from 'crypto-js';

import Countdown from "react-countdown";
import moment from 'moment';

import { useForm } from 'react-hook-form';

import { message, Table, Tag, Modal, Input, DatePicker, Button, Select, Tooltip, Menu, Dropdown, Pagination } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;
import { SearchOutlined, DownOutlined, CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/admin/Wrapper';
import { orderStatusText, paymentTypeText, generateTrackingId } from '../../../helpers/functions'

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerOrder = ({ ordersData, total }) => {

    const [activeTab, setActiveTab] = useState('not_confirmed');

    const [allProductIdForPackedUpdate, setAllProductIdForPackedUpdate] = useState([]);
    const [shippingIdModalVisible, setShippingIdModalVisible] = useState(false);
    const [readyPackageId, setReadyPackageId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(ordersData);
    const [orderTotal, setOrderTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(30);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // 
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [orderId, setOrderId] = useState("");
    const [orderDateRange, setOrderDateRange] = useState(null);

    // filter
    const [filter, setFilter] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });

    // router
    const router = useRouter();

    const { adminAuth } = useSelector(state => state.adminAuth)

    const { register, handleSubmit, errors, } = useForm();

    const recallProductList = async (filterByOrderId, filterByPaymentMethod, filterByOrderDateRange) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/admin/orders/own`, {
                status: activeTab,
                paymentMethod: filterByPaymentMethod,
                orderId: filterByOrderId,
                orderDate: filterByOrderDateRange,
                sort,
                page,
                limit: sizePerPage
            },
                {
                    headers: {
                        token: adminAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.orders);
                setOrderTotal(data.total);
                setOnSearch(false);
            }
        } catch (error) {
            setLoading(false)
            setOnSearch(false);
            setFilter(false);

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
    useEffect(() => {
        if (!onFirstLoad) {
            const filterByOrderId = orderId !== '' ? orderId.toLowerCase() : 'all';
            const filterByPaymentMethod = paymentMethod !== null ? paymentMethod : 'all';
            const filterByOrderDateRange = orderDateRange !== null ? orderDateRange : 'all';

            // call
            recallProductList(filterByOrderId, filterByPaymentMethod, filterByOrderDateRange);
        }
    }, [onFirstLoad, activeTab, page, sizePerPage, sort, onSearch]);

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

    const handlePrintMenuClick = (e, packageId) => {
        if (e.key == 1) {
            return router.push(`/admin/orders/print/${packageId}`);
        } else {
            return router.push(`/admin/orders/print/order/${packageId}`);
        }
    }

    const getProductTotal = (products, activeTab) => {
        let getNonCancelProduct = 0;
        if (activeTab === 'cancelled') {
            getNonCancelProduct = products.filter(product => product.orderStatus === 'cancel_approve' ||
                product.orderStatusLog.some(item =>
                    item.status !== 'cancel_denide')
                &&
                (
                    product.orderStatus === 'cancelled_by_seller'
                    || product.status === 'cancelled_by_admin'
                    || product.status === 'cancelled_by_user'
                ));
        } else {
            getNonCancelProduct = products.filter(item => item.orderStatus === activeTab);
        }
        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const getShippingCharge = (products, packageShippingCharge, currentOrder) => {
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
            shippingCharge = packageShippingCharge;
        }
        return shippingCharge;
    }

    const makeShipHandler = (packageId) => {
        var originalText = CryptoJS.RC4Drop.encrypt(packageId, "BCxx20xx").toString();

        return router.push(`/makeship/${encodeURIComponent(originalText)}`);
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) => <Link href={`/admin/orders/${record._id}?status=${activeTab}`}><a target="_blank">{record.orders._id.toUpperCase()}</a></Link>,
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
            render: (text, record) => <>Rs.{getProductTotal(record.products, activeTab)}</>,
        },
        {
            title: 'Shipping',
            render: (text, record) => <>Rs.{getShippingCharge(record.products, record.shippingCharge, activeTab)}</>,

        },
        {
            title: 'Grand Total',
            render: (text, record) => <>Rs.{getProductTotal(record.products, activeTab) + getShippingCharge(record.products, record.shippingCharge, activeTab)}</>,
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
            render: (text, record) => <div className="d-block">
                {
                    checkAllProductStatus(record.products, 'confirmed') && activeTab !== 'cancelled' ?
                        <>
                            <Tag color="blue" className="d-block text-info cp"
                                onClick={() => checkProductStatusWhileReadyToShip(record.products, record._id)}
                            >
                                Ready to pack
                            </Tag>

                            <Tag color="red" className="d-block text-info mt-1 cp"
                                onClick={() => cancelOrderHandler(record.products, record.orders._id, record._id, record.paymentType, record.paymentStatus)}
                            >
                                Cancel
                            </Tag>
                        </>
                        :
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
                            activeTab !== 'cancelled' && activeTab !== 'return' && activeTab !== 'all' ?
                                <>
                                    <Dropdown
                                        overlay={
                                            <Menu onClick={(e) => handlePrintMenuClick(e, record._id)}>
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
                                    {
                                        activeTab === 'packed' &&
                                        <Button className="mt-2" onClick={() => makeShipHandler(record._id)}>
                                            <CheckOutlined />
                                            Make Ship
                                        </Button>
                                    }
                                </>
                                :
                                '-'
                }

            </div>,
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

    const checkProductStatusWhileReadyToShip = async (products, packageId) => {
        const allProductId = products.map(item => item._id);
        setAllProductIdForPackedUpdate(allProductId);
        setShippingIdModalVisible(true);
        setReadyPackageId(packageId);
    }

    const handleShippedModalCancel = () => {
        setShippingIdModalVisible(false);
        return router.push(router.asPath)
    }
    const onTackingIdSubmit = async (inputdata) => {
        const trackingId = inputdata.trackingId;
        updateOrderStatusTrackingId(trackingId, readyPackageId, allProductIdForPackedUpdate);
    }


    const handleStatusChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setActiveTab(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
    });

    const onChangeDatePicker = useCallback(date => {
        if (date) {
            setFilter(prevState => prevState === true ? true : false);
            setOrderDateRange({
                startDate: moment(date[0]).format('YYYY/MM/DD'),
                endDate: moment(date[1]).format('YYYY/MM/DD')
            });
        }
    });

    const handlePaymentChange = useCallback(value => {
        setFilter(prevState => prevState === true ? true : false);
        setPaymentMethod(value)
    });

    const handlePageChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setCurrPage(value);
        setPage(value);
        setOnSearch(true)
    });

    const handleLimitChange = value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setPagination({ position: ['none', 'none'], defaultPageSize: value });
        setSizePerPage(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true);
    };

    const handleSortChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setSort(value);
        setOnSearch(true);
    });

    const handleSearchClick = () => {
        setOnFirstLoad(false);
        setFilter(true);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
    }

    const handleClearFilter = () => {
        setFilter(false);
        return router.reload();
    }

    return (
        <>
            <Head>
                <title>Own Shop's Orders | Orders | Admin Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
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
            <Wrapper onActive="ownShopOrders" breadcrumb={["Orders", "Seller's Orders"]}>
                <div className="d-flex mb-5" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => handleStatusChange('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('not_confirmed')}>
                        Not Confirmed
                        <div className={`activebar ${activeTab === 'not_confirmed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('confirmed')}>
                        Confirmed
                        <div className={`activebar ${activeTab === 'confirmed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('packed')}>
                        Packed(Ready to Ship)
                        <div className={`activebar ${activeTab === 'packed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('shipped')}>
                        Shipped
                        <div className={`activebar ${activeTab === 'shipped' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('delivered')}>
                        Delivered
                        <div className={`activebar ${activeTab === 'delivered' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('cancelled')}>
                        Cancelled
                        <div className={`activebar ${activeTab === 'cancelled' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('return')}>
                        Return
                        <div className={`activebar ${activeTab === 'return' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="d-block mb-5">
                    <div className="d-flex justify-content-around">
                        <Input className="mr-3" placeholder="Order Id" onChange={(e) => setOrderId(e.target.value)} />
                        <Select className="mr-3" style={{ width: '600px' }} onChange={handlePaymentChange}>
                            <Option value="cashondelivery">Cash on delivery</Option>
                            <Option value="esewa">e-Sewa</Option>
                            <Option value="card">Card</Option>
                        </Select>
                        <RangePicker
                            defaultValue=""
                            format={'YYYY-MM-DD'}
                            onChange={(date) => onChangeDatePicker(date)}
                            className="form-control mr-2"
                        />
                        {filter &&
                            <Button type="dashed" className="mr-2" icon={<CloseOutlined />} onClick={handleClearFilter}>Clear</Button>
                        }

                        <Button type="default"
                            icon={<SearchOutlined />}
                            onClick={handleSearchClick}
                            size="middle"
                        >
                            Search
                        </Button>
                    </div>
                </div>
                <div className="d-flex justify-content-between mb-4">
                    <div>
                        {orderTotal} Order(s)
                    </div>
                    <Select
                        defaultValue={sort}
                        style={{ width: 120 }}
                        onChange={handleSortChange}
                        size="small"
                    >
                        <Option value="newest">Newest</Option>
                        <Option value="oldest">Oldest</Option>
                    </Select>
                </div>
                <div className="d-block table-responsive mt-5">
                    <Table
                        rowKey="_id"
                        columns={columns}
                        expandable={{
                            expandedRowRender: record =>
                                expandedRowRender(record),
                            rowExpandable: record => true,
                        }}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                    />
                    {
                        orderTotal !== 0 &&
                        <div className="d-flex justify-content-between mt-5">
                            <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={30}>30</Option>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                            </Select>
                            <Pagination
                                current={currPage}
                                total={orderTotal}
                                responsive
                                pageSize={sizePerPage}
                                onChange={handlePageChange}
                            />
                        </div>
                    }
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const status = "not_confirmed";
        const paymentMethod = 'all';
        const orderId = 'all';
        const orderDate = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;
        const { data } = await axios.post(`${process.env.api}/api/admin/orders/own`, {
            status,
            paymentMethod,
            orderId,
            orderDate,
            sort,
            page,
            limit
        },
            {
                headers: {
                    token: cookies.ad_token,
                },
            });
        return {
            props: {
                ordersData: data.orders,
                total: data.total
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
