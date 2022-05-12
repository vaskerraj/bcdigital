import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';
import Countdown from "react-countdown";

import moment from 'moment';

import { message, Table, Tag, Modal, Input, DatePicker, Button, Select, Menu, Dropdown, Pagination } from 'antd';
const { Option } = Select;
const { RangePicker } = DatePicker;
import { SearchOutlined, CloseOutlined, DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/seller/Wrapper';
import { paymentTypeText, orderStatusText } from '../../../helpers/functions'

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const SellerOrders = ({ ordersData, total }) => {

    const [activeTab, setActiveTab] = useState('confirmed');

    const [shippingIdModalVisible, setShippingIdModalVisible] = useState(false);
    const [readyPackageId, setReadyPackageId] = useState(null);
    const [trackingId, setTrackingId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(ordersData);
    const [productTotal, setProductTotal] = useState(total);
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

    const router = useRouter();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const recallProductList = async (filterByOrderId, filterByPaymentMethod, filterByOrderDateRange) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/seller/orders/list`, {
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
                        token: sellerAuth.token,
                    }
                });
            if (data) {
                setLoading(false);
                setData(data.orders);
                setProductTotal(data.total);
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

    const updateOrderStatusTrackingId = async (packageId, productId) => {
        try {
            const { data } = await axiosApi.put(`/api/seller/orderstatus/trackingid`,
                {
                    packageId,
                    productId
                },
                {
                    headers: {
                        token: sellerAuth.token
                    }
                });
            if (data.trackingId) {
                setShippingIdModalVisible(true);
                setReadyPackageId(packageId)
                setTrackingId(data.trackingId)
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
        updateOrderStatusTrackingId(packageId, allProductId);

    }

    const handleShippedModalCancel = () => {
        setShippingIdModalVisible(false);
        return router.push(router.asPath)
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

    const checkAllProductStatus = (products, status) => {
        const allStatus = products.map(item => item.orderStatus);
        return allStatus.includes(status)
    }

    const sellerTimeRenderCallback = ({ formatted, completed }) => {
        if (completed) {
            return <Tag color="red">Expired</Tag>
        } else {
            // Render a countdown
            return <Tag color="black">
                <span className="font15">{formatted.hours}</span>H
                : <span>{formatted.minutes}</span>M
            </Tag>;
        }
    };


    const getTotalCountableProduct = (products) => {
        const totableProduct = products.filter(item => item.orderStatus === "confirmed" || item.orderStatus === "packed" || item.orderStatus === "reached_at_city" || item.orderStatus === "for_delivery" || item.orderStatus === "delivered" || item.orderStatus === "cancelled_by_seller");
        return totableProduct.length;
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
                ));
        } else if (activeTab === 'return') {
            getNonCancelProduct = products.filter(product => product.orderStatus === 'return_request' || product.orderStatus === 'return_approve' || product.orderStatus === 'return_shipped' || product.orderStatus === 'return_atCity' || product.orderStatus === 'return_sameCity' || product.orderStatus === 'return_delivered')
        }
        else if (activeTab === 'all') {
            getNonCancelProduct = products.filter(product => product.orderStatusLog.some(item => item.status !== 'cancelled_by_seller'));
        } else {
            getNonCancelProduct = products.filter(item => item.orderStatus === activeTab);
        }
        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const getCurrentOrderStatusDate = (orderStatus, statusLog) => {
        const currentStatusLog = statusLog.filter(item => item.status === orderStatus);
        const currentStatusDate = moment(currentStatusLog.statusChangeDate).format('DD MMM YYYY HH:mm');
        return currentStatusDate;
    }

    const handlePrintMenuClick = (e, packageId) => {
        if (e.key == 1) {
            return router.push(`/seller/orders/print/${packageId}`);
        } else {
            return router.push(`/seller/orders/print/order/${packageId}`);
        }
    }

    const columns = [
        {
            title: 'Order Id',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) =>
                <>
                    {activeTab !== 'all' ?
                        <Link href={`/seller/orders/${record._id}?status=${activeTab}`}>
                            <a>{record.orders._id.toUpperCase()}</a>
                        </Link>
                        :
                        record.orders._id.toUpperCase()
                    }
                </>,
        },
        {
            title: 'Order At',
            dataIndex: ['orders', 'createdAt'],
            key: ['_id'],
            render: (text) => <>{moment(text).format("DD MMM YYYY HH:mm")}</>,
        },
        {
            title: 'Product(s)',
            render: (text, record) => <>{getTotalCountableProduct(record.products, activeTab)}</>,
        },
        {
            title: 'Pending From',
            render: (text, record) => <>
                {activeTab === "pending" || activeTab === "packed" ?
                    <>
                        {moment(record.ordersConfirmedAt).fromNow()}
                    </>
                    :
                    '-'
                }
            </>,
        },
        {
            title: 'Payment Method',
            dataIndex: ['paymentType'],
            key: ['paymentType'],
            render: (text, record) => <>
                <Tag color="green" className="ml-1">{paymentTypeText(text)}</Tag>
            </>,

        },
        {
            title: 'Amount',
            render: (text, record) => <>Rs.{getProductTotal(activeTab !== 'return' ? record.products : record.rproducts, activeTab)}</>,
        },
        {
            title: 'Remaining Time',
            render: (text, record) =>
                checkAllProductStatus(record.products, 'confirmed') || checkAllProductStatus(record.products, 'packed')
                    ?
                    <>
                        <div className="d-block">{moment(record.sellerTime).format("DD MMM YYYY HH:mm")}</div>
                        <Countdown
                            date={record.sellerTime}
                            daysInHours
                            renderer={sellerTimeRenderCallback}
                        />
                    </>
                    :
                    <>-</>
        },
        {
            title: 'Action',
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
                        activeTab !== 'cancelled' && activeTab !== 'return' && activeTab !== 'all' ?
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
                            :
                            '-'
                }

            </div >,
        },
    ];
    const expandedRowRender = (record) => {
        return (
            <div className="col">
                <div className="font15" style={{ fontWeight: 500 }}>Return Product(s)</div>
                <table className="table">
                    <thead>
                        <tr>
                            <td>Name</td>
                            <td>Tracking Id</td>
                            <td>Quantity</td>
                            <td>Price</td>
                            <td>Reason</td>
                            <td>Status</td>
                            <td>Action</td>
                        </tr>
                    </thead>
                    <tbody>
                        {record.rproducts.map(item =>
                            <tr>
                                <td>
                                    {item.name}
                                </td>
                                <td>{item.trackingId}</td>
                                <td>{item.productQty}</td>
                                <td>Rs.{item.price}</td>
                                <td><div style={{ fontWeight: 500 }}>{item.reason}</div></td>
                                <td>
                                    <Tag color="green">
                                        {orderStatusText(item.orderStatus)}
                                    </Tag>
                                    <div className="text-danger" style={{ fontWeight: 500 }}>
                                        {getCurrentOrderStatusDate(item.orderStatus, item.orderStatusLog)}
                                    </div>
                                </td>
                                <td>
                                    {item.orderStatus === "return_atCity" || item.orderStatus === "return_sameCity"
                                        ?
                                        <div className="font12 text-success">Wait for call then receive returns</div>
                                        :
                                        '-'
                                    }
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div >
        )
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
                <title>Manage Orders | BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Modal
                title="Print Shipping Label"
                visible={shippingIdModalVisible}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Tracking Id</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{readyPackageId ? readyPackageId.toUpperCase() : ''}</td>
                                <td><strong>{trackingId}</strong></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="d-block border-top mt-5 text-right">
                    <button type="button" onClick={handleShippedModalCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                        Cancel
                    </button>
                    <Link href={`/seller/orders/print/${readyPackageId}`}>
                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            CONFIRM & PRINT
                        </button>
                    </Link>
                </div>
            </Modal>
            <Wrapper onActive="manageOrders" breadcrumb={["Manage Orders"]}>
                <div className="d-flex mb-5" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => handleStatusChange('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('confirmed')}>
                        Pending
                        <div className={`activebar ${activeTab === 'confirmed' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('packed')}>
                        Packed
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
                        Returned
                        <div className={`activebar ${activeTab === 'return' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('fail_delivery')}>
                        Fail Delivery
                        <div className={`activebar ${activeTab === 'fail_delivery' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="d-block mb-5">
                    <div className="d-flex justify-content-around">
                        <Input className="mr-3" placeholder="Order Id" onChange={(e) => setOrderId(e.target.value)} />
                        <Input className="mr-3 d-none" placeholder="Product Name"
                            onChange={(e) => setProductName(e.target.value)}
                        />
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
                        {productTotal} Order(s)
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
                        dataSource={data}
                        expandable={{
                            expandedRowRender: record =>
                                expandedRowRender(record),
                            rowExpandable: record => activeTab === "return" ? true : false
                        }}
                        pagination={pagination}
                        loading={loading}
                    />
                    {
                        productTotal !== 0 &&
                        <div className="d-flex justify-content-between mt-5">
                            <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={30}>30</Option>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                            </Select>
                            <Pagination
                                current={currPage}
                                total={productTotal}
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
        const status = "confirmed";
        const paymentMethod = 'all';
        const orderId = 'all';
        const orderDate = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;
        const { data } = await axios.post(`${process.env.api}/api/seller/orders/list`, {
            status,
            paymentMethod,
            orderId,
            orderDate,
            sort,
            page,
            limit
        }, {
            headers: {
                token: cookies.sell_token,
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
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default SellerOrders;
