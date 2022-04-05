import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head'
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import moment from 'moment';

import { message, Modal, Table, Input, Tag, Tooltip, Select, Button, Pagination, Popconfirm } from 'antd';
const { Option } = Select;
import { SearchOutlined, CloseOutlined } from '@ant-design/icons';

import { MapPin, Phone } from 'react-feather';

import Wrapper from '../../../components/delivery/Wrapper';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const BranchDeliveries = ({ deliveryData, total }) => {
    console.log(deliveryData)
    const [activeTab, setActiveTab] = useState('pending');

    const [loading, setLoading] = useState(false);
    const [onFirstLoad, setOnFirstLoad] = useState(true);

    const [data, setData] = useState(deliveryData);
    const [deliveryTotal, setDeliveryTotal] = useState(total);
    const [currPage, setCurrPage] = useState(1);
    const [page, setPage] = useState(1);
    const [sizePerPage, setSizePerPage] = useState(30);
    const [sort, setSort] = useState('newest');
    const [onSearch, setOnSearch] = useState(false);

    // 
    const [paymentMethod, setPaymentMethod] = useState(null);
    const [trackingId, setTrackingId] = useState("");

    // filter
    const [filter, setFilter] = useState(false);

    // to show seller return details
    const [packageToView, setPackageToView] = useState(null);
    const [selectedSeller, setSelectedSeller] = useState(null);
    const [sellerDetailModal, setSellerDetailModal] = useState(false);

    // pagation
    const [pagination, setPagination] = useState({ position: ['none', 'none'], defaultPageSize: sizePerPage });

    // router
    const router = useRouter();

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const recallDeliveryList = async (filterByTrackingId, filterByPaymentMethod) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${process.env.api}/api/deliveries/list/branch`, {
                status: activeTab,
                paymentMethod: filterByPaymentMethod,
                trackingId: filterByTrackingId,
                sort,
                page,
                limit: sizePerPage
            },
                {
                    headers: {
                        token: deliveryAuth.token,
                    }
                });
            if (data) {
                console.log(data)
                setLoading(false);
                setData(data.delivery);
                setDeliveryTotal(data.total);
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
            const filterByTrackingId = trackingId !== '' ? trackingId.toLowerCase() : 'all';
            const filterByPaymentMethod = paymentMethod !== null ? paymentMethod : 'all';

            // call
            recallDeliveryList(filterByTrackingId, filterByPaymentMethod,);
        }
    }, [onFirstLoad, activeTab, page, sizePerPage, sort, onSearch]);


    const getProductTotal = (products, activeTab) => {
        const redefineActiveTab = activeTab === "pending" ? "reached_at_city" : activeTab;
        const getNonCancelProduct = products.filter(item => item.orderStatus === redefineActiveTab);

        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const handleSameCity = async (packageId, seller) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/fail/samecity`,
                {
                    type: "id",
                    id: packageId,
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                if (data.msg === "not_found") {
                    message.warning({
                        content: (
                            <div>
                                <div className="font-weight-bold">No Found</div>
                                Package not valid to update any changes.
                            </div>
                        ),
                        className: 'message-warning',
                    });
                } else {
                    // show modal with seller details
                    setSelectedSeller(seller)
                    setSellerDetailModal(true);
                }
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

    const handleViweSellerDetails = async (seller, packageId) => {
        setPackageToView(packageId);
        setSelectedSeller(seller)
        setSellerDetailModal(true)
    }

    const handleHandoverToSeller = async (packageId) => {

        try {
            const { data } = await axiosApi.put(`/api/delivery/fail/handlerover`,
                {
                    type: "id",
                    id: packageId,
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                setPackageToView(null)
                setSelectedSeller(null)
                setSellerDetailModal(false)
                if (data.msg === "not_found") {
                    message.warning({
                        content: (
                            <div>
                                <div className="font-weight-bold">No Found</div>
                                Package not found to handover.Please check again.
                            </div>
                        ),
                        className: 'message-warning',
                    });
                } else {
                    setPackageToView(null)
                    setSelectedSeller(null)
                    setSellerDetailModal(false)
                    message.warning({
                        content: (
                            <div>
                                <div className="font-weight-bold">No Found</div>
                                Successfully package handover.
                            </div>
                        ),
                        className: 'message-warning',
                    });
                    router.push(router.asPath);
                }
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

    const columns = [
        {
            title: 'ID',
            dataIndex: ['_id'],
            key: ['_id'],
            render: (text, record) =>
                <Link href={`/delivery/deliveries/${record._id}?status=${record.currentStatus}`}>
                    <a>
                        {record.orders._id.toUpperCase()}
                        <div className="font-weight-bold">
                            {record._id.toUpperCase()}
                        </div>
                    </a>
                </Link>
            ,
        },
        {
            title: 'Tracking Id',
            dataIndex: ['trackingId'],
            key: ['trackingId'],
        },
        {
            title: 'Receiveable',
            render: (text, record) => <>Rs.{
                (record.paymentStatus === 'notpaid' || record.paymentType === 'cashondelivery') ?
                    getProductTotal(record.products, activeTab) + record.shippingCharge
                    : 0
            }</>,
        },
        {
            title: 'Time',
            dataIndex: ['reachedDate'],
            key: ['reachedDate'],
            render: (text) => <>{moment(text).fromNow()}</>,
        },
        {
            title: 'Delivery Details',
            render: (text, record) => <>
                <div className="font14">{record.delivery.name}</div>
                <div className="d-flex mt-1">
                    <Phone size={14} className="mt-1" />
                    <div className="ml-2">
                        {record.orders.deliveryMobile}
                    </div>
                </div>
                <div className="d-flex mt-1">
                    <MapPin size={14} className="mt-1" />
                    <div className="ml-2">
                        {record.delivery.street}
                        {record.delivery.area ? record.delivery.area.city : ''}
                        {',' + record.delivery.city.name + ', ' + record.delivery.region.name}
                    </div>
                </div>
            </>,
        },
        {
            title: 'Picked',
            render: (text, record) =>
                <Tooltip title={
                    <div className="d-block">
                        <div className="d-block">Mobile No.:{record.deliveredBy?.mobile} </div>
                    </div>
                }
                    color={'#fff'}
                    overlayInnerStyle={{ color: '#000' }}
                >
                    <div className="text-info">
                        {record.deliveredBy.name}
                    </div>
                </Tooltip>
        },
        {
            title: 'Status',
            render: (text, record) => <>
                <Tag color={record.currentStatus === 'delivered' && "green"} className="text-capitalize">
                    {
                        record.currentStatus === 'for_delivery' ?
                            "Way To Delivery"
                            : record.currentStatus === 'not_delivered' ?
                                "Not Delivered"
                                :
                                record.currentStatus === 'fail_delivery' ?
                                    "Fail Delivery"
                                    :
                                    record.currentStatus
                    }
                </Tag>
                {
                    record.currentStatus === 'not_delivered' && record.notDelivered !== undefined &&
                    <>
                        <div>
                            Attempt: <b>{record.notDelivered.length}</b>
                        </div>
                        <div>
                            Last Cause: <span className="text-muted font12">{record.notDelivered.at(-1).reason}</span>
                        </div>
                    </>
                }

                {
                    record.currentStatus === 'fail_delivery' &&
                    <Tag color={record.failDeliveryStatus?.status === 'fd_receivedBySeller' && "yellow"} className="text-capitalize mt-1">
                        {
                            record.failDeliveryStatus?.status === 'fd_dispatched' ?
                                "Package dispatch"
                                : record.currentStatus === 'fd_reachedSellerCity' ?
                                    "At seller city"
                                    :
                                    record.failDeliveryStatus?.status === 'fd_receivedBySeller' ?
                                        "Receive by seller"
                                        :
                                        record.failDeliveryStatus?.status === 'fd_sameCity' ?
                                            "Same city"
                                            :
                                            record.failDeliveryStatus?.status
                        }
                    </Tag>
                }
            </>
        },
        {
            title: 'Action',
            render: (text, record) => <>
                {
                    record.currentStatus === "not_delivered" &&
                    <>
                        {record.notDelivered !== undefined && (record.notDelivered.length < 3 || record.notDelivered.at(-1).reason == "Wrong Delivery Address") ?

                            <div className="text-danger font12">
                                Need to reattempt
                            </div>
                            :
                            record.seller.addresses[0]?.city._id === record.delivery.city._id ?
                                <>
                                    <div className="text-danger font12">Seller from same city. Call seller to pick package</div>
                                    <Button size="small" type="primary" onClick={() => handleSameCity(record._id, record.seller)}>Seller detail</Button>
                                </>
                                :
                                <Link href={`/delivery/deliveries/print/${record._id}?type=fail`}>
                                    <Button size="small" danger>Make Fail Delivery</Button>
                                </Link>
                        }

                    </>
                }
                {record.currentStatus === "fail_delivery" && (record.failDeliveryStatus?.status === "fd_reachedSellerCity" || record.failDeliveryStatus?.status === "fd_sameCity") &&
                    <div className="text-danger font12">
                        Call seller to pick package
                        <Button size="small" type="primary" onClick={() => handleViweSellerDetails(record.seller, record._id)}>Seller detail</Button>
                    </div>
                }
            </>,
        },
    ];

    const handleStatusChange = useCallback(value => {
        setOnFirstLoad(false);
        setFilter(prevState => prevState === true ? true : false);
        setActiveTab(value);
        setCurrPage(1);
        setPage(1);
        setOnSearch(true)
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
                <title> Deliveries | Delivery Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Modal
                title="Seller Return Details"
                visible={sellerDetailModal}
                footer={null}
                closable={activeTab !== "fail_delivery" ? false : true}
                onCancel={() => {
                    setSelectedSeller(null);
                    setSellerDetailModal(false)
                }}
                destroyOnClose={true}
            >
                {selectedSeller &&
                    <div className="mt-2">
                        <div className="font14 font-weight-bold">{selectedSeller.legalName}</div>
                        <div className="font14">{selectedSeller.addresses[0]?.fullname}</div>
                        <div className="font14">{selectedSeller.addresses[0]?.mobile}</div>
                        <div className="font12 text-muted">
                            {selectedSeller.addresses[0]?.street}
                            {selectedSeller.addresses[0]?.area ? selectedSeller.addresses[0]?.area.name : ''}
                            {',' + selectedSeller.addresses[0]?.city.name + ', ' + selectedSeller.addresses[0]?.region.name}
                        </div>
                    </div>
                }

                <div className="d-block border-top mt-5 text-right">
                    <button type="button" onClick={() => {
                        setSelectedSeller(null);
                        setSellerDetailModal(false)
                    }}
                        className="btn btn-lg c-btn-light font16 mt-4 mr-5"
                    >
                        Close
                    </button>
                    <Popconfirm
                        title="Are you sure handler this package to seller?"
                        onConfirm={() => handleHandoverToSeller(packageToView)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            Handover to seller
                        </button>
                    </Popconfirm>
                </div>
            </Modal>
            <Wrapper onActive="deliveries" breadcrumb={["Deliveries"]}>
                <div className="d-flex mb-5" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab cp" onClick={() => handleStatusChange('all')}>
                        All
                        <div className={`activebar ${activeTab === 'all' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('pending')}>
                        Pending
                        <div className={`activebar ${activeTab === 'pending' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('for_delivery')}>
                        Way To Delivery
                        <div className={`activebar ${activeTab === 'for_delivery' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('not_delivered')}>
                        Not Delivered
                        <div className={`activebar ${activeTab === 'not_delivered' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('fail_delivery')}>
                        Fail Delivery
                        <div className={`activebar ${activeTab === 'fail_delivery' ? 'active' : ''}`}></div>
                    </div>
                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('delivered')}>
                        Delivered
                        <div className={`activebar ${activeTab === 'delivered' ? 'active' : ''}`}></div>
                    </div>

                    <div className="filter-tab ml-4 cp" onClick={() => handleStatusChange('returned')}>
                        Returned
                        <div className={`activebar ${activeTab === 'return' ? 'active' : ''}`}></div>
                    </div>
                </div>
                <div className="d-block mb-5">
                    <div className="d-flex justify-content-around">
                        <Input className="mr-3" placeholder="Tracking Id" onChange={(e) => setTrackingId(e.target.value)} />
                        <Select className="mr-3" style={{ width: '600px' }} onChange={handlePaymentChange}>
                            <Option value="cashondelivery">Cash on delivery</Option>
                            <Option value="esewa">e-Sewa</Option>
                            <Option value="card">Card</Option>
                        </Select>

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
                        {deliveryTotal} Deliveries(s)
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
                        pagination={pagination}
                        loading={loading}
                    />
                    {
                        deliveryTotal !== 0 &&
                        <div className="d-flex justify-content-between mt-5">
                            <Select defaultValue={sizePerPage} style={{ width: 120 }} onChange={handleLimitChange}>
                                <Option value={10}>10</Option>
                                <Option value={30}>30</Option>
                                <Option value={50}>50</Option>
                                <Option value={100}>100</Option>
                            </Select>
                            <Pagination
                                current={currPage}
                                total={deliveryTotal}
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
        if (cookies.del_role !== "branch") {
            return {
                redirect: {
                    source: '/delivery/404',
                    destination: '/delivery/404',
                    permanent: false,
                },
            }
        }
        const status = "pending";
        const paymentMethod = 'all';
        const trackingId = 'all';
        const sort = 'newest';
        const page = 1;
        const limit = 30;
        const { data } = await axios.post(`${process.env.api}/api/deliveries/list/branch`, {
            status,
            paymentMethod,
            trackingId,
            sort,
            page,
            limit
        },
            {
                headers: {
                    token: cookies.del_token,
                },
            });
        return {
            props: {
                deliveryData: data.delivery,
                total: data.total
            }
        }
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                source: '/delivery/login',
                destination: '/delivery/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default BranchDeliveries;
