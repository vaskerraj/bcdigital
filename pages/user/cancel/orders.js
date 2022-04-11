import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Layout, Card, message, Modal, Tooltip, Affix } from 'antd';
const { Content } = Layout;
import { LoadingOutlined, InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import moment from 'moment';

import { useForm } from 'react-hook-form';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader } from '../../../helpers/functions';

const CancelOrders = ({ orders }) => {

    const [orderItems, setOrderItems] = useState(orders);
    const [esewaIdModal, setEsewaIdModal] = useState(false);
    const [bankDetailModal, setBankDetailModal] = useState(false);


    const [cancellationId, setCancellationId] = useState();

    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width])

    const [loadingOrderItems, setLoadingOrderItems] = useState(false);

    const router = useRouter();
    const { userInfo } = useSelector(state => state.userAuth);

    const { register, handleSubmit, errors } = useForm();

    const handleEsewaIdUpdate = async (cancellationId) => {
        setEsewaIdModal(true);
        setCancellationId(cancellationId);
    }

    const handleBankDetailUpdate = async (cancellationId) => {
        setBankDetailModal(true);
        setCancellationId(cancellationId);
    }

    const onEsewaIdUpdate = async (inputdata) => {
        const esewaId = inputdata.esewaId;
        try {
            const { data } = await axiosApi.put(`/api/refund/esewa`, {
                cancellationId,
                esewaId
            }, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                setEsewaIdModal(false);
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Esewa Id succssfully added.Refund process will be complete soon.
                        </div>
                    ),
                    className: 'message-warning',
                });
                setTimeout(() => {
                    return router.reload(true);
                }, 3000)
            }
        } catch (error) {
            setEsewaIdModal(false);
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

    const onBankDetailUpdate = async (inputdata) => {
        const accountName = inputdata.accountName;
        const accountNumber = inputdata.accountNumber;
        const bankName = inputdata.bankName;
        const branch = inputdata.branch;
        try {
            const { data } = await axiosApi.put(`/api/refund/bank`, {
                cancellationId,
                accountName,
                accountNumber,
                bankName,
                branch
            }, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                setBankDetailModal(false);
                message.warning({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Bank detail succssfully added.Refund process will be complete soon.
                        </div>
                    ),
                    className: 'message-warning',
                });
                setTimeout(() => {
                    return router.reload(true);
                }, 3000)
            }
        } catch (error) {
            setBankDetailModal(false);
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

    const handleCancelEsewaModal = () => {
        setEsewaIdModal(false);
    }
    const handleCancelBankDetailModal = () => {
        setBankDetailModal(false);
    }

    const getProductTotal = (packages) => packages.reduce((a, c) => (a + c.amount), 0);
    const getShippingChargeTotal = (packages) => packages.reduce((a, c) => (a + c.shippingCharge), 0);

    return (
        <>
            <Modal
                visible={esewaIdModal}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab">
                        Provide Esewa Id to refund.
                    </div>
                </div>

                <form className="border-top mt-3" onSubmit={handleSubmit(onEsewaIdUpdate)}>
                    <div className="d-block mt-4">
                        <label className="cat-label">E-sewa Id</label>
                        <input type="number" className="form-control mt-1"
                            name="esewaId"
                            autoComplete="none"
                            ref={register({
                                required: "Provide e-sewa id",
                            })}
                        />
                        {errors.esewaId && <p className="errorMsg">{errors.esewaId.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleCancelEsewaModal} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            SAVE
                        </button>
                    </div>
                </form>
            </Modal>
            <Modal
                visible={bankDetailModal}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <div className="d-flex" style={{ fontSize: '1.6rem', fontWeight: 600 }}>
                    <div className="filter-tab">
                        Provide bank account to refund.
                    </div>
                </div>

                <form className="border-top mt-3" onSubmit={handleSubmit(onBankDetailUpdate)}>
                    <div className="d-block mt-4">
                        <label className="cat-label">Account Holder's Name</label>
                        <input type="text" className="form-control mt-1"
                            name="accountName"
                            autoComplete="none"
                            ref={register({
                                required: "Provide account holder's name",
                            })}
                        />
                        {errors.accountName && <p className="errorMsg">{errors.accountName.message}</p>}
                    </div>
                    <div className="d-block mt-2">
                        <label className="cat-label">Account Number</label>
                        <input type="text" className="form-control mt-1"
                            name="accountNumber"
                            autoComplete="none"
                            ref={register({
                                required: "Provide account number",
                            })}
                        />
                        {errors.accountNumber && <p className="errorMsg">{errors.accountNumber.message}</p>}
                    </div>
                    <div className="d-block mt-2">
                        <label className="cat-label">Bank Name</label>
                        <input type="text" className="form-control mt-1"
                            name="bankName"
                            autoComplete="none"
                            ref={register({
                                required: "Provide bank name",
                            })}
                        />
                        {errors.bankName && <p className="errorMsg">{errors.bankName.message}</p>}
                    </div>
                    <div className="d-block mt-2">
                        <label className="cat-label">Branch</label>
                        <input type="text" className="form-control mt-1"
                            name="branch"
                            autoComplete="none"
                            ref={register({
                                required: "Provide branch",
                            })}
                        />
                        {errors.branch && <p className="errorMsg">{errors.branch.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleCancelBankDetailModal} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>

                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            SAVE
                        </button>
                    </div>
                </form>
            </Modal>
            <Wrapper>
                <Head>
                    <title>Cancel Orders | BC Digital</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                {onlyMobile &&
                    <Affix offsetTop={70}>
                        <div className="row bg-white backNav-container border-top p-2">
                            <div className="d-flex align-items-center mb-2">
                                <ArrowLeft className="mr-3" onClick={() => router.back()} />
                                Cancel Orders
                            </div>
                        </div>
                    </Affix>
                }
                <div className="container mt-4">
                    <Layout>
                        {!onlyMobile &&
                            <UserSidebarNav onActive="cancelOrder" />
                        }
                        <Layout className="site-layout">
                            <Content
                                style={{
                                    margin: onlyMobile ? '0' : '0 0 0 15px'
                                }}>
                                <Card style={{
                                    minHeight: '60vh'
                                }}>
                                    <div className="d-block page-header justify-content-between">
                                        <h1>Cancel Orders</h1>
                                    </div>

                                    {orderItems && orderItems.map(order => (
                                        <div key={order._id} className="d-block border mt-5" style={{ borderRadius: '0.3rem' }}>
                                            <div
                                                className="d-flex title border-bottom justify-content-between p-3 pl-4 font13"
                                                style={{ backgroundColor: '#fafafa' }}
                                            >
                                                {!onlyMobile ?
                                                    <>
                                                        <div className="d-flex justify-content-around">
                                                            <div className="d-block">
                                                                <div className="text-uppercase font12 font-weight-bold" style={{ fontSize: '1.2rem' }}>Order Placed</div>
                                                                <div>
                                                                    {moment(order.order.createdAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                            <div className="d-none d-sm-block ml-5">
                                                                <div className="text-uppercase font12 font-weight-bold">
                                                                    {order.status === 'complete'
                                                                        ? 'Cancel' :
                                                                        order.status === 'denide' ?
                                                                            'Denide'
                                                                            : 'Request'
                                                                    }  At
                                                                </div>
                                                                <div>{moment(order.updatedAt).format("DD MMMM YYYY")}</div>
                                                            </div>
                                                        </div>
                                                        <div className="d-block text-right">
                                                            <div className="text-uppercase">
                                                                <span className="font12 font-weight-bold">Order</span>
                                                                <Link href={`/user/orders/${order._id}`}>
                                                                    <a className="text-info">
                                                                        #{order._id}
                                                                    </a>
                                                                </Link>
                                                            </div>
                                                            {order.refund &&
                                                                <div className="d-block">
                                                                    <div className="d-block ml-3">
                                                                        Refund Amount:
                                                                        <strong className="mr-2 ml-2">Rs. {order.refund?.amount}</strong>
                                                                        {
                                                                            getShippingChargeTotal(order.packages) !== 0 &&

                                                                            <Tooltip title={
                                                                                <div className="d-block">
                                                                                    <div className="d-block">Product Total: Rs.{getProductTotal(order.packages)}</div>
                                                                                    <div className="d-block">Shipping Charge: Rs.{getShippingChargeTotal(order.packages)}</div>
                                                                                </div>
                                                                            }
                                                                                color={'#fff'}
                                                                                overlayInnerStyle={{ color: '#000' }}
                                                                            >
                                                                                <InfoCircleOutlined size={10} className="text-primary cp" />
                                                                            </Tooltip>
                                                                        }
                                                                    </div>
                                                                    <div className="d-block">
                                                                        {
                                                                            order.refund.status === 'progress' ?
                                                                                <>
                                                                                    {
                                                                                        order.paymentType === 'esewa'
                                                                                            ?
                                                                                            order.refund.esewaId === undefined ?
                                                                                                <div className="text-info cp" onClick={(e) => handleEsewaIdUpdate(order._id)}>
                                                                                                    <ExclamationCircleOutlined className="mr-2" />
                                                                                                    Provide Esewa Id
                                                                                                </div>
                                                                                                :
                                                                                                <div className="d-flex">
                                                                                                    <div className="mr-2 pr-2 border-right">
                                                                                                        Refund Status :
                                                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                                                            {order.refund.status === 'progress' ? 'Processing' : order.refund.status}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-info cp" onClick={(e) => handleEsewaIdUpdate(order._id)}>
                                                                                                        <ExclamationCircleOutlined className="mr-2" />
                                                                                                        Edit Esewa Id
                                                                                                    </div>
                                                                                                </div>
                                                                                            :
                                                                                            order.refund.account?.title === undefined ?
                                                                                                <div className="text-info cp" onClick={(e) => handleBankDetailUpdate(order._id)}>
                                                                                                    <ExclamationCircleOutlined className="mr-2" />
                                                                                                    Provide Bank Details
                                                                                                </div>
                                                                                                :
                                                                                                <div className="d-flex">
                                                                                                    <div className="mr-2 pr-2 border-right">
                                                                                                        Refund Status :
                                                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                                                            {order.refund.status === 'progress' ? 'Processing' : order.refund.status}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-info cp" onClick={(e) => handleBankDetailUpdate(order._id)}>
                                                                                                        <ExclamationCircleOutlined className="mr-2" />
                                                                                                        Edit Bank Details
                                                                                                    </div>
                                                                                                </div>
                                                                                    }
                                                                                </>
                                                                                :
                                                                                <div className="d-block">
                                                                                    Refund Status :
                                                                                    <span className="badge bg-success text-capitalize ml-2">
                                                                                        {order.refund.status === 'justin' ? 'Processing' : order.refund.status}
                                                                                    </span>
                                                                                </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            }
                                                        </div>
                                                    </>
                                                    :
                                                    <div style={{ width: '100%' }}>
                                                        <div className="d-flex justify-content-between">
                                                            <div>
                                                                <div className="text-uppercase">
                                                                    <span className="font12 font-weight-bold">Order</span>
                                                                    <Link href={`/user/orders/${order._id}`}>
                                                                        <a className="text-info">
                                                                            #{order._id}
                                                                        </a>
                                                                    </Link>
                                                                </div>
                                                                <div className="d-block">
                                                                    <span className="text-uppercase font12 font-weight-bold mr-1" style={{ fontSize: '1.2rem' }}>
                                                                        Order Placed
                                                                    </span>
                                                                    {moment(order.order.createdAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                            <div className="text-right">
                                                                <div className="d-block">
                                                                    <span className="text-uppercase font12 font-weight-bold mr-1" style={{ fontSize: '1.2rem' }}>
                                                                        {order.status === 'complete'
                                                                            ? 'Cancel' :
                                                                            order.status === 'denide' ?
                                                                                'Denide'
                                                                                : 'Request'
                                                                        }  At:
                                                                    </span>
                                                                    {moment(order.updatedAt).format("DD MMMM YYYY")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="d-block border-top mt-2 pt-2">
                                                            <div className="d-flex justify-content-between">
                                                                {
                                                                    getShippingChargeTotal(order.packages) !== 0 &&
                                                                    <div>
                                                                        <div className="d-block">Product Total: Rs.{getProductTotal(order.packages)}</div>
                                                                        <div className="d-block">Shippping Charge: Rs.{getShippingChargeTotal(order.packages)}</div>
                                                                    </div>
                                                                }
                                                                <div className="text-right">
                                                                    Refund Amount:
                                                                    <strong className="mr-2 ml-2">Rs. {order.refund?.amount}</strong>
                                                                    <div className="d-block">
                                                                        {
                                                                            order.refund.status === 'progress' ?
                                                                                <>
                                                                                    {
                                                                                        order.paymentType === 'esewa'
                                                                                            ?
                                                                                            order.refund.esewaId === undefined ?
                                                                                                <div className="text-info cp" onClick={(e) => handleEsewaIdUpdate(order._id)}>
                                                                                                    <ExclamationCircleOutlined className="mr-2" />
                                                                                                    Provide Esewa Id
                                                                                                </div>
                                                                                                :
                                                                                                <div className="d-flex">
                                                                                                    <div className="mr-2 pr-2 border-right">
                                                                                                        Refund Status :
                                                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                                                            {order.refund.status === 'progress' ? 'Processing' : order.refund.status}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-info cp" onClick={(e) => handleEsewaIdUpdate(order._id)}>
                                                                                                        <ExclamationCircleOutlined className="mr-2" />
                                                                                                        Edit Esewa Id
                                                                                                    </div>
                                                                                                </div>
                                                                                            :
                                                                                            order.refund.account?.title === undefined ?
                                                                                                <div className="text-info cp" onClick={(e) => handleBankDetailUpdate(order._id)}>
                                                                                                    <ExclamationCircleOutlined className="mr-2" />
                                                                                                    Provide Bank Details
                                                                                                </div>
                                                                                                :
                                                                                                <div className="d-flex">
                                                                                                    <div className="mr-2 pr-2 border-right">
                                                                                                        Refund Status :
                                                                                                        <span className="badge bg-success text-capitalize ml-2">
                                                                                                            {order.refund.status === 'progress' ? 'Processing' : order.refund.status}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                    <div className="text-info cp" onClick={(e) => handleBankDetailUpdate(order._id)}>
                                                                                                        <ExclamationCircleOutlined className="mr-2" />
                                                                                                        Edit Bank Details
                                                                                                    </div>
                                                                                                </div>
                                                                                    }
                                                                                </>
                                                                                :
                                                                                <div className="d-block">
                                                                                    Refund Status :
                                                                                    <span className="badge bg-success text-capitalize ml-2">
                                                                                        {order.refund.status === 'justin' ? 'Processing' : order.refund.status}
                                                                                    </span>
                                                                                </div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            </div>
                                            <div className="col-12 p-0 p-md-3">
                                                <ul className="list-unstyled mt-2">
                                                    {
                                                        order.packages.map(pack => (
                                                            <li key={pack._id}>
                                                                {pack.products.map(item => (
                                                                    <div key={item.products[0]._id} className="pt-2 pb-2">
                                                                        <div className="row">
                                                                            <div className="col-12 col-sm-8 col-md-6">
                                                                                <div className="d-flex">
                                                                                    <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                        layout="fixed"
                                                                                        width="100"
                                                                                        height="100"
                                                                                        objectFit="cover"
                                                                                        objectPosition="top center"
                                                                                        quality="40"
                                                                                        loader={customImageLoader}
                                                                                    />
                                                                                    <div className="product-detail ml-3" style={{ width: '100%' }}>
                                                                                        <div className="product-name">{item.name}</div>
                                                                                        <div className="d-flex justify-content-between align-items-center mt-1">
                                                                                            <div>
                                                                                                <div className="">
                                                                                                    {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                                                </div>
                                                                                                <div className="mt-1">
                                                                                                    <b>Qty</b>: {item.productQty}
                                                                                                </div>
                                                                                                <div className="mt-1">
                                                                                                    <b>Price</b>: Rs.{item.price}
                                                                                                </div>
                                                                                            </div>
                                                                                            {onlyMobile &&
                                                                                                <div className="mr-2">
                                                                                                    {
                                                                                                        order.status === 'denide' ?
                                                                                                            <span className="badge bg-danger">Denide</span>
                                                                                                            :
                                                                                                            order.status === 'complete' ?
                                                                                                                <span className="badge bg-success text-capitalize">Cancelled</span>
                                                                                                                :
                                                                                                                <span className="badge bg-warning">Processing</span>
                                                                                                    }
                                                                                                </div>
                                                                                            }
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            <div className="d-none d-sm-block col-sm-4 col-md-4 text-right pr-4">
                                                                                {
                                                                                    order.status === 'denide' ?
                                                                                        <span className="badge bg-danger">Denide</span>
                                                                                        :
                                                                                        order.status === 'complete' ?
                                                                                            <span className="badge bg-success text-capitalize">Cancelled</span>
                                                                                            :
                                                                                            <span className="badge bg-warning">Processing</span>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </li>
                                                        ))
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </Card>
                            </Content>
                        </Layout >
                    </Layout >
                </div >
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/cancelorders`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                orders: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                destination: '../../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default CancelOrders;