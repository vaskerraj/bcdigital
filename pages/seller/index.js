import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import moment from 'moment';

import { Card, Tooltip, Popover, Tag } from 'antd';
import { InfoCircleOutlined, GoogleOutlined, FacebookFilled, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';

import { Edit2 } from 'react-feather';

import { TinyArea } from '@antv/g2plot';

import Wrapper from '../../components/seller/Wrapper';
import { sellerStatusText } from '../../helpers/functions';

const SellerDashbaord = ({
    seller,
    totalOrders,
    totalDeliveredOrder,
    totalTodayDeliveredOrder,
    totalLast30DeliveredOrder,
    totalPackedOrder,
    totalOrderWithoutPending,
    totalCancelledOrder,
    totalTodayCancelledOrder,
    totalLast30CancelledOrder,
    totalOrderBetween24,
    totalOrderBetween24to12,
    totalOrderBefore24,
    totalExpiredOrder,
    totalPendingOrder,
    totalProducts,
    totalApprovedProducts,
    totalApprovedLiveProducts,
    totalApprovedButNotLiveProducts,
    totalUnapprovedProducts,
    totalPendingProducts
}) => {

    const { sellerAuth } = useSelector(state => state.sellerAuth);
    const router = useRouter();

    // chart 
    const fifteenDaysAgoDate = moment().subtract(15, 'day').endOf('day').format('YYYY-MM-DD');
    const loadOrderChart = async () => {
        try {
            const { data } = await axiosApi.post("/api/dashboard/orderchart", {
                endDate: fifteenDaysAgoDate
            }, {
                headers: {
                    token: sellerAuth.token
                }
            });
            const onlyOrderTotal = data.map(item => item.orders);
            if (onlyOrderTotal) {
                const tinyArea = new TinyArea('ordersContainer', {
                    height: 60,
                    autoFit: false,
                    data: onlyOrderTotal,
                    smooth: true,
                    color: '#E5EDFE',
                    pattern: { cfg: { stroke: '#5B8FF9' } },
                });

                tinyArea.render();
            }
        } catch (error) {
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
                const tinyArea = new TinyArea('ordersContainer', {
                    height: 60,
                    autoFit: false,
                    data,
                    smooth: true,
                    pattern: { cfg: { stroke: '#5B8FF9' } },
                });

                tinyArea.render();
            }
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if (sellerAuth) {
            loadOrderChart();
        }
    }, [sellerAuth])

    return (
        <>
            <Head>
                <title>BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="index" breadcrumb={["Dashboard"]}>
                <div className="d-block">
                    <div className="row">
                        <div className="col-md-6">
                            <Card style={{ width: '100%' }}>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <div className="custom-card-header">
                                            Orders
                                        </div>
                                        <div className="custom-card-total">
                                            {totalOrders}
                                            <Tooltip title="not include cancelled orders & returned orders">
                                                <InfoCircleOutlined className="ml-2 text-muted" style={{ fontSize: 14 }} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div>
                                        <div id="ordersContainer" style={{ height: 60 }}></div>
                                    </div>
                                </div>

                                <div className="d-block mt-4">
                                    <div className="row">
                                        <div className="col-6">
                                            <Popover
                                                placement="topLeft"
                                                content={
                                                    <>
                                                        <div className="d-block">
                                                            Total of <b>order delivered</b> at last 30 days period
                                                        </div>
                                                        <div className="d-block mt-2 font-weight-bold">
                                                            Also,
                                                        </div>
                                                        <div className="d-block">
                                                            Total: {totalDeliveredOrder}
                                                        </div>
                                                        <div className="d-block">
                                                            Today: {totalTodayDeliveredOrder}
                                                        </div>
                                                    </>
                                                }>
                                                <div className="d-flex justify-content-between">
                                                    <div>Delivered</div>
                                                    <div>{totalLast30DeliveredOrder}</div>
                                                </div>
                                            </Popover>
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex justify-content-between">
                                                <div>Packed but not shipped</div>
                                                <div>{totalPackedOrder}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 mt-3">
                                            <Popover
                                                placement="topLeft"
                                                content={
                                                    <>
                                                        <div className="d-block">
                                                            Total of <b>order shipped</b> on time during last 30 days of period
                                                        </div>
                                                    </>
                                                }>
                                                <div className="d-flex justify-content-between">
                                                    <div>Shipped on time</div>
                                                    <div>{totalOrderWithoutPending - totalExpiredOrder}/{totalOrderWithoutPending}</div>
                                                </div>
                                            </Popover>
                                        </div>
                                        <div className="col-6 mt-3">
                                            <Popover
                                                placement="topLeft"
                                                content={
                                                    <>
                                                        <div className="d-block">
                                                            Total of <b>order cancellation</b> at last 30 days period
                                                        </div>
                                                        <div className="d-block mt-2 font-weight-bold">
                                                            Also,
                                                        </div>
                                                        <div className="d-block">
                                                            Total: {totalCancelledOrder}
                                                        </div>
                                                        <div className="d-block">
                                                            Today: {totalTodayCancelledOrder}
                                                        </div>
                                                    </>
                                                }>
                                                <div className="d-flex justify-content-between">
                                                    <div>Cancelled</div>
                                                    <div>{totalLast30CancelledOrder}</div>
                                                </div>
                                            </Popover>
                                        </div>
                                    </div>
                                    <div className="d-block mt-4 pt-4 border-top">
                                        <div className="d-block font15 mb-3" style={{ fontWeight: 500 }}>Pending Orders</div>
                                        <div className="row">
                                            <div className="col-6">
                                                <div className="d-flex justify-content-between">
                                                    <div>Between 24 hour</div>
                                                    <div>{totalOrderBetween24}</div>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="d-flex justify-content-between">
                                                    <div>Between 12 to 24 hour</div>
                                                    <div>{totalOrderBetween24to12}</div>
                                                </div>
                                            </div>
                                            <div className="col-6 mt-3">
                                                <div className="d-flex justify-content-between">
                                                    <div>Before 24 hour</div>
                                                    <div>{totalOrderBefore24}</div>
                                                </div>
                                            </div>
                                            <div className="col-6 mt-3">
                                                <div className="d-flex justify-content-between">
                                                    <div>Shipping time expired</div>
                                                    <div>{totalExpiredOrder}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-block custom-card-footer text-right mt-4">
                                        <Link href="/seller/orders">
                                            <a>
                                                <span className="font14 mr-2">Total pending orders:</span>
                                                <b>{totalPendingOrder}</b>
                                            </a>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div className="col-md-6 mt-3 mt-sm-0">
                            <Card className="cp" style={{ width: '100%' }} onClick={() => router.push("/seller/product/manage")}>
                                <div className="d-flex justify-content-between">
                                    <div>
                                        <div className="custom-card-header">
                                            Product
                                        </div>
                                        <div className="custom-card-total">
                                            {totalProducts}
                                            <Tooltip title="all products">
                                                <InfoCircleOutlined className="ml-2 text-muted" style={{ fontSize: 14 }} />
                                            </Tooltip>
                                        </div>
                                    </div>
                                    <div>
                                        <div id="ordersContainer"></div>
                                    </div>
                                </div>

                                <div className="d-block mt-4">
                                    <div className="row">
                                        <div className="col-6">
                                            <div className="d-flex justify-content-between">
                                                <div>Approved</div>
                                                <div>{totalApprovedProducts}</div>
                                            </div>
                                        </div>
                                        <div className="col-6">
                                            <div className="d-flex justify-content-between">
                                                <div>Approved & live</div>
                                                <div>{totalApprovedLiveProducts}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 mt-3">
                                            <div className="d-flex justify-content-between">
                                                <div>Approved but not live</div>
                                                <div>{totalApprovedButNotLiveProducts}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 mt-3">
                                            <div className="d-flex justify-content-between">
                                                <div>Unapproved</div>
                                                <div>{totalUnapprovedProducts}</div>
                                            </div>
                                        </div>
                                        <div className="col-6 mt-3">
                                            <div className="d-flex justify-content-between">
                                                <div>Pending</div>
                                                <div>{totalPendingProducts}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="mt-3" bodyStyle={{ padding: 10 }} style={{ width: '100%' }}>
                                <div className="d-flex justify-content-between border-bottom pb-2 mb-3">
                                    <div className="font16" style={{ fontWeight: 500 }}>Verification</div>
                                    <div>
                                        <Link href="/seller/profile">
                                            <Edit2 className="cp" size={15} />
                                        </Link>
                                    </div>
                                </div>
                                <div className="d-flex mt-3">
                                    <div style={{ minWidth: '20rem', fontWeight: 500 }}>
                                        Business Document Status:
                                    </div>
                                    <div>
                                        <Tag color="red">
                                            {sellerStatusText(seller.documentVerify)}
                                        </Tag>
                                    </div>
                                </div>
                                <div className="d-flex mt-4 mb-1">
                                    <div style={{ minWidth: '20rem', fontWeight: 500 }}>
                                        Bank Info Status:
                                    </div>
                                    <div>
                                        <Tag color="red">
                                            {sellerStatusText(seller.account.bankVerify)}
                                        </Tag>
                                    </div>
                                </div>
                            </Card>
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
        const { data } = await axios.get(`${process.env.api}/api/isseller`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        const { data: dashbaordData } = await axios.get(`${process.env.api}/api/dashbaord/card`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        if (data) {
            if (data.stepComplete) {
                return {
                    props: {
                        seller: data,
                        totalOrders: dashbaordData.totalOrders,
                        totalDeliveredOrder: dashbaordData.totalDeliveredOrder,
                        totalTodayDeliveredOrder: dashbaordData.totalTodayDeliveredOrder,
                        totalLast30DeliveredOrder: dashbaordData.totalLast30DeliveredOrder,
                        totalPackedOrder: dashbaordData.totalPackedOrder,
                        totalOrderWithoutPending: dashbaordData.totalOrderWithoutPending,
                        totalCancelledOrder: dashbaordData.totalCancelledOrder,
                        totalTodayCancelledOrder: dashbaordData.totalTodayCancelledOrder,
                        totalLast30CancelledOrder: dashbaordData.totalLast30CancelledOrder,
                        totalOrderBetween24: dashbaordData.totalOrderBetween24,
                        totalOrderBetween24to12: dashbaordData.totalOrderBetween24to12,
                        totalOrderBefore24: dashbaordData.totalOrderBefore24,
                        totalExpiredOrder: dashbaordData.totalExpiredOrder,
                        totalPendingOrder: dashbaordData.totalPendingOrder,
                        totalProducts: dashbaordData.totalProducts,
                        totalApprovedProducts: dashbaordData.totalApprovedProducts,
                        totalApprovedLiveProducts: dashbaordData.totalApprovedLiveProducts,
                        totalApprovedButNotLiveProducts: dashbaordData.totalApprovedButNotLiveProducts,
                        totalUnapprovedProducts: dashbaordData.totalUnapprovedProducts,
                        totalPendingProducts: dashbaordData.totalPendingProducts,
                    }
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/start/addresses',
                            destination: '/seller/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/start/bank',
                            destination: '/seller/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/start/company',
                    destination: '/seller/start/company',
                    permanent: false,
                }
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

export default SellerDashbaord;