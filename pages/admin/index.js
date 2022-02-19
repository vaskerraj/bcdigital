import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import moment from 'moment'

import { Card, Input, Tooltip, AutoComplete, Tag } from 'antd';
const { Option } = AutoComplete;
import { InfoCircleOutlined, GoogleOutlined, FacebookFilled, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';

import { Area } from '@antv/g2plot';

import Wrapper from '../../components/admin/Wrapper';

const AdminIndex = ({
    totalOrders,
    lastWeekTotalOrder,
    thisWeekTotalOrder,
    yesterdayTotalOrder,
    todayTotalOrder,
    totalOwnShopOrders,
    totalSellerOrders,
    totalProducts,
    lastWeekTotalProducts,
    thisWeekTotalProducts,
    yesterdayTotalProducts,
    todayTotalProducts,
    todayPendingProducts,
    totalPendingRefund,
    totalPendigRetrun,
    totalPendingCancellation,
    totalSeller,
    lastWeekTotalSellers,
    thisWeekTotalSellers,
    yesterdayTotalSellers,
    todayTotalSellers,
    totalPendingVerification,
    totalUsers,
    totalGoogleUsers,
    totalFacebookUsers
}) => {
    const [userOptions, setUserOptions] = useState([]);
    const [sellerOptions, setSellerOptions] = useState([]);
    const [quickSearchValue, setQuickSearchValue] = useState(null);


    const { adminAuth } = useSelector(state => state.adminAuth);

    // order calculation
    const orderPercentageWeekByWeek = Math.abs((Number(lastWeekTotalOrder) - Number(thisWeekTotalOrder)) / (lastWeekTotalOrder === 0 ? 1 : Number(lastWeekTotalOrder))) * 100;

    const orderPercentageDayByDay = Math.abs((Number(yesterdayTotalOrder) - Number(todayTotalOrder)) / yesterdayTotalOrder == 0 ? 1 : yesterdayTotalOrder) * 100;

    // product calculation
    const productPercentageWeekByWeek = Math.abs((Number(lastWeekTotalProducts) - Number(thisWeekTotalProducts)) / (lastWeekTotalProducts === 0 ? 1 : lastWeekTotalProducts)) * 100;
    const productPercentageDayByDay = Math.abs((Number(yesterdayTotalProducts) - Number(todayTotalProducts)) / (yesterdayTotalProducts === 0 ? 1 : yesterdayTotalProducts)) * 100;

    // seller calculation
    const sellerPercentageWeekByWeek = Math.abs((parseInt(lastWeekTotalSellers) - parseInt(thisWeekTotalSellers)) / (lastWeekTotalSellers === 0 ? 1 : lastWeekTotalSellers)) * 100;
    const sellerPercentageDayByDay = Math.abs((parseInt(yesterdayTotalSellers) - parseInt(todayTotalSellers)) / (yesterdayTotalSellers === 0 ? 1 : yesterdayTotalSellers)) * 100;

    const dispatch = useDispatch();
    const router = useRouter();
    const handleUserSearch = useCallback(async (value) => {

        const { data } = await axiosApi.post("/api/search/users", {
            searchtext: value
        });
        setUserOptions(data);
    });
    const handleSellerSearch = useCallback(async (value) => {

        const { data } = await axiosApi.post("/api/search/sellers/mobile", {
            searchtext: value
        });
        setSellerOptions(data);
    });

    const handleQuickSearch = (type) => {
        if (quickSearchValue !== null) {
            switch (type) {
                case 'userDetails':
                    return router.push(`/admin/users/${quickSearchValue}`)
                case 'sellerDetails':
                    return router.push(`/admin/sellers/${quickSearchValue}`)
                case 'productDetails':
                    return router.push(`/admin/products/${quickSearchValue}`)
                case 'orderDetails':
                    return router.push(`/admin/orders/${quickSearchValue}`)
                case 'refundDetails':
                    return router.push(`/admin/rcc/refund?search=${quickSearchValue}`)
                case 'pendingRefund':
                    return router.push(`/admin/rcc/refund/pending?search=${quickSearchValue}`)
                case 'returnDetails':
                    return router.push(`/admin/rcc/return?search=${quickSearchValue}`)
                case 'pendingReturn':
                    return router.push(`/admin/rcc/return/pending?search=${quickSearchValue}`)
                case 'cancellationDetails':
                    return router.push(`/admin/rcc/cancellation?search=${quickSearchValue}`)
                case 'pendingCancellation':
                    return router.push(`/admin/rcc/cancellation/pending?search=${quickSearchValue}`)

                default:
                    break;
            }
        }
    }

    // chart 
    const todayDate = moment().startOf('day').format('YYYY-MM-DD');
    const fifteenDaysAgoDate = moment().subtract(15, 'day').endOf('day').format('YYYY-MM-DD');

    const loadOrderChart = async () => {
        try {
            const { data } = await axiosApi.post("/api/orderchart", {
                startDate: todayDate,
                endDate: fifteenDaysAgoDate
            }, {
                headers: {
                    token: adminAuth.token
                }
            });

            if (data) {
                const area = new Area('orderContainer', {
                    data,
                    xField: '_id',
                    yField: 'orders',
                    xAxis: {
                        range: [0, 1],
                    },
                });
                area.render();
            }
        } catch (error) {
            alert(error)
        }

    }

    const loadCustmerChart = async () => {
        try {
            const { data } = await axiosApi.post("/api/customerchart", {
                startDate: todayDate,
                endDate: fifteenDaysAgoDate
            }, {
                headers: {
                    token: adminAuth.token
                }
            });
            if (data) {
                const customerArea = new Area('customerContainer', {
                    data,
                    xField: '_id',
                    yField: 'customers',
                    xAxis: {
                        range: [0, 1],
                    },
                });
                customerArea.render();
            }
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        if (adminAuth) {
            loadOrderChart();
            loadCustmerChart();
        }
    }, [adminAuth])

    return (
        <Wrapper onActive="index" breadcrumb={["Dashboard"]}>
            <div className="d-block">
                <div className="row">
                    <div className="col-3">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Orders</div>
                                <div>
                                    <Tooltip title="not include cancelled orders & returned orders">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                {totalOrders}
                            </div>
                            <div className="d-block custom-card-content">
                                <div className="d-flex justify-content-between ">
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">W-by-W</span> {orderPercentageWeekByWeek}%
                                        {lastWeekTotalOrder < thisWeekTotalOrder
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            lastWeekTotalOrder == thisWeekTotalOrder
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">D-by-D</span> {orderPercentageDayByDay}%
                                        {yesterdayTotalOrder < todayTotalOrder
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            yesterdayTotalOrder == todayTotalOrder
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                </div>

                            </div>
                            <div className="d-block custom-card-footer">
                                <span className="font14">Pending</span>
                                <Link href="/admin/orders/own-shop">
                                    <a>
                                        <span className="ml-2 mr-2 p-2 border-right">
                                            OWN~<span className="font-weight-bold font16">{totalOwnShopOrders}</span>
                                        </span>
                                    </a>
                                </Link>
                                <Link href="admin/orders/seller">
                                    <a>
                                        <span className="p-2">
                                            S~<span className="font-weight-bold font16">{totalSellerOrders}</span></span>
                                    </a>
                                </Link>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Products</div>
                                <div>
                                    <Tooltip title="not include unapproved & pending products">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                {totalProducts}
                            </div>
                            <div className="d-block custom-card-content">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">W-by-W</span> {productPercentageWeekByWeek}%
                                        {lastWeekTotalProducts < thisWeekTotalProducts
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            lastWeekTotalProducts == thisWeekTotalProducts
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">D-by-D</span> {productPercentageDayByDay}%
                                        {yesterdayTotalProducts < todayTotalProducts
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            yesterdayTotalProducts == todayTotalProducts
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                </div>

                            </div>
                            <div className="d-block custom-card-footer">
                                <Link href="admin/orders/own-shop">
                                    <a>
                                        <span className="font14">Pending</span>
                                        <span className="ml-2 mr-2 p-2 font-weight-bold font16">{todayPendingProducts}</span>
                                    </a>
                                </Link>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Pending RRC</div>
                                <div>
                                    <Tooltip title="pending refund, pending return & pending cancellation">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                {totalPendingRefund + totalPendingRefund + totalPendingRefund}
                            </div>
                            <div className="d-block custom-card-content">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex mt-4">
                                        <Link href="/admin/rcc/refund/pending">
                                            <a>
                                                Refund {totalPendingRefund}
                                            </a>
                                        </Link>
                                    </div>
                                    <div className="d-flex mt-4">
                                        <Link href="/admin/rcc/return/pending">
                                            <a>
                                                Return {totalPendigRetrun}
                                            </a>
                                        </Link>
                                    </div>
                                </div>

                            </div>
                            <div className="d-block custom-card-footer">
                                <Link href="/admin/rrc/cancellation/pending">
                                    <a>
                                        <span className="font14">Cancellation</span>
                                        <span className="ml-2 mr-2 p-2 font-weight-bold font16">{totalPendingCancellation}</span>
                                    </a>
                                </Link>
                            </div>
                        </Card>
                    </div>
                    <div className="col-3">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Sellers</div>
                                <div>
                                    <Tooltip title="all sellers">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                {totalSeller}
                            </div>
                            <div className="d-block custom-card-content">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">D-by-D</span> {sellerPercentageWeekByWeek}%
                                        {lastWeekTotalSellers < thisWeekTotalSellers
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            lastWeekTotalSellers === thisWeekTotalSellers
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                    <div className="d-flex align-items-center mt-4">
                                        <span className="mr-2">D-by-D</span> {sellerPercentageDayByDay}%
                                        {yesterdayTotalSellers < todayTotalSellers
                                            ? <RiseOutlined style={{ color: 'red' }} />
                                            :
                                            yesterdayTotalSellers === todayTotalSellers
                                                ?
                                                <SwapOutlined style={{ color: 'blue' }} />
                                                : <FallOutlined style={{ color: 'green' }} />
                                        }
                                    </div>
                                </div>

                            </div>
                            <div className="d-block custom-card-footer">
                                <Link href="admin/orders/own-shop">
                                    <a>
                                        <span className="font14">Pending Verification</span>
                                        <span className="ml-2 mr-2 p-2 font-weight-bold font16">{totalPendingVerification}</span>
                                    </a>
                                </Link>
                            </div>
                        </Card>
                    </div>

                    <div className="col-3 mt-4">
                        <Card style={{ width: '100%' }}>
                            <div className="d-flex justify-content-between custom-card-header">
                                <div>Customers</div>
                                <div>
                                    <Tooltip title="all sellers">
                                        <InfoCircleOutlined />
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="custom-card-total">
                                {totalUsers}
                            </div>
                            <div className="d-block custom-card-content">
                                <div className="d-flex justify-content-between">
                                    <div className="d-flex mt-4">
                                        <GoogleOutlined style={{ fontSize: 26, color: "#dd4b39" }} /> {totalGoogleUsers}
                                    </div>
                                    <div className="d-flex mt-4">
                                        <FacebookFilled style={{ fontSize: 24, color: "#4267B2" }} />{totalFacebookUsers}
                                    </div>
                                </div>

                            </div>
                            <div className="d-flex justify-content-between custom-card-footer">
                                <div>
                                    <span className="font14">Custom</span>
                                    <span className="ml-2 mr-2 p-2 font-weight-bold font16">
                                        {totalUsers - totalGoogleUsers - totalFacebookUsers}
                                    </span>
                                </div>
                                <div>
                                    <Link href="admin/users">
                                        <a className="text-info">
                                            view all
                                        </a>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <div className="d-block mt-4">
                <Card>
                    <div className="row">
                        <div className="col-3">
                            <div className="d-block">Order Id</div>
                            <Input
                                allowClear
                                onChange={(e) => setQuickSearchValue(e.target.value)}
                            />
                            <div className="d-block mt-3 ">
                                <span className="badge bg-gradient bg-warning cp" onClick={() => handleQuickSearch('orderDetails')}>Order Details</span>
                                <span className="badge bg-success cp" onClick={() => handleQuickSearch('refundDetails')}>Refund</span>
                                <span className="badge bg-info cp" onClick={() => handleQuickSearch('pendingRefund')}>Pending Refund</span>
                                <span className="badge bg-danger cp" onClick={() => handleQuickSearch('returnDetails')}>Return</span>
                                <span className="badge bg-dark cp" onClick={() => handleQuickSearch('pendingReturn')}>Pending Return</span>
                                <span className="badge bg-primary cp" onClick={() => handleQuickSearch('cancellationDetails')}>Cancellation</span>
                                <span className="badge bg-gradient bg-secondary cp" onClick={() => handleQuickSearch('pendingCancellation')}>P. Cancellation</span>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="d-block">Product Id</div>
                            <Input
                                allowClear
                                onChange={(e) => setQuickSearchValue(e.target.value)}
                            />
                            <div className="d-block mt-3 text-right">
                                <Tag color="blue" className="cp" onClick={() => handleQuickSearch('productDetails')}>Details</Tag>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="d-block">Customer</div>
                            <AutoComplete
                                allowClear
                                style={{ width: '100%' }}
                                onSearch={handleUserSearch}
                                onSelect={(value) => setQuickSearchValue(value)}
                                placeholder="Customer's name"
                            >
                                {userOptions.map((user) => (
                                    <Option key={user._id} value={user._id}>
                                        {user.name}
                                        <div className="d-block">
                                            {user.method === 'google.com' ?
                                                <GoogleOutlined className="mr-2" />
                                                :
                                                user.method === 'facebook.com' ?
                                                    <FacebookFilled className="mr-2" />
                                                    :
                                                    <FacebookFilled className="mr-2" />
                                            }{user.username}
                                        </div>
                                    </Option>
                                ))}
                            </AutoComplete>
                            <div className="d-block mt-3 text-right">
                                <Tag color="green" className="cp" onClick={() => handleQuickSearch('userDetails')}>Details</Tag>
                            </div>
                        </div>
                        <div className="col-3">
                            <div className="d-block">Seller</div>
                            <div className="d-block">
                                <AutoComplete
                                    allowClear
                                    style={{ width: '100%' }}
                                    onSearch={handleSellerSearch}
                                    onSelect={(value) => setQuickSearchValue(value)}
                                    placeholder="Mobile number"
                                >
                                    {sellerOptions.map((seller) => (
                                        <Option key={seller._id} value={seller._id}>
                                            {seller.name}
                                        </Option>
                                    ))}
                                </AutoComplete>
                            </div>
                            <div className="d-block mt-3 text-right">
                                <Tag color="green" className="cp" onClick={() => handleQuickSearch('sellerDetails')}>Details</Tag>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
            <div className="d-block mt-4">

                <div className="row">
                    <div className="col-6">
                        <Card
                            bodyStyle={{ padding: 10 }}
                        >
                            <div className="d-block font16 mb-4">Last 15 days orders</div>
                            <div id="orderContainer" style={{ height: 300 }}></div>

                        </Card>
                    </div>
                    <div className="col-6">

                        <Card
                            bodyStyle={{ padding: 10 }}
                        >
                            <div className="d-block font16 mb-4">Last 15 days customers</div>
                            <div id="customerContainer" style={{ height: 300 }}></div>
                        </Card>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const lastWeekStart = moment().subtract(1, 'weeks').startOf('week').format('YYYY-MM-DD');
        const lastWeekEnd = moment().subtract(1, 'weeks').endOf('week').format('YYYY-MM-DD');

        const thisWeekStart = moment().startOf('week').format('YYYY-MM-DD');
        const thisWeekEnd = moment().endOf('week').format('YYYY-MM-DD');

        const { data } = await axios.post(`${process.env.api}/api/dashbaord`,
            {
                lastWeekStart,
                lastWeekEnd,
                thisWeekStart,
                thisWeekEnd
            },
            {
                headers: {
                    token: cookies.ad_token,
                },
            });
        return {
            props: {
                totalOrders: data.totalOrders,
                lastWeekTotalOrder: data.lastWeekTotalOrder,
                thisWeekTotalOrder: data.thisWeekTotalOrder,
                yesterdayTotalOrder: data.yesterdayTotalOrder,
                todayTotalOrder: data.todayTotalOrder,
                totalOwnShopOrders: data.totalOwnShopOrders,
                totalSellerOrders: data.totalSellerOrders,
                totalProducts: data.totalProducts,
                lastWeekTotalProducts: data.lastWeekTotalProducts,
                thisWeekTotalProducts: data.thisWeekTotalProducts,
                yesterdayTotalProducts: data.yesterdayTotalProducts,
                todayTotalProducts: data.todayTotalProducts,
                todayPendingProducts: data.todayPendingProducts,
                totalPendingRefund: data.totalPendingRefund,
                totalPendigRetrun: data.totalPendigRetrun,
                totalPendingCancellation: data.totalPendingCancellation,
                totalSeller: data.totalSeller,
                lastWeekTotalSellers: data.lastWeekTotalSellers,
                thisWeekTotalSellers: data.thisWeekTotalSellers,
                yesterdayTotalSellers: data.yesterdayTotalSellers,
                todayTotalSellers: data.todayTotalSellers,
                totalPendingVerification: data.totalPendingVerification,
                totalUsers: data.totalUsers,
                totalGoogleUsers: data.totalGoogleUsers,
                totalFacebookUsers: data.totalFacebookUsers
            }
        }
    } catch (err) {
        console.log(err);
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

export default AdminIndex;