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

import { Layout, Card, message, Spin, Affix, Button, Checkbox } from 'antd';
const { Content } = Layout;
import { LoadingOutlined } from '@ant-design/icons';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';

const CancelRequest = ({ packages, defaultItemForCancel }) => {
    console.log(packages)
    const productLength = packages.filter(item => item.products.length !== 0).length;
    console.log(productLength)
    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width]);

    const router = useRouter();

    const { orderId, id, packageId } = router.query;

    const [loading, setLoading] = useState(false);
    const [cancelRequestOrders, setCancelRequestOrders] = useState([]);

    const [checkedProducts, setCheckedProducts] = useState([{
        packageId,
        productId: id
    }]);

    const [cancelProductsReason, setCancelProductsReason] = useState([]);
    const [cancelRequestGroupPackages, setCancelRequestGroupPackages] = useState([]);

    const { userInfo } = useSelector(state => state.userAuth);

    useEffect(() => {
        if (checkedProducts) {
            const result = Object.values(
                [].concat(checkedProducts, cancelProductsReason)
                    .reduce((r, c) => (r[c.productId] = Object.assign((r[c.productId] || {}), c), r), {})
            );

            const groupByPackageId = data => Object.values(
                data.reduce((data, { packageId, productId }) => Object.assign({}, data, {
                    [packageId]: data[packageId]
                        ? { packageId, productId: [...data[packageId].productId, productId] }
                        : { packageId, productId: [productId] }
                }), {})
            );

            setCancelRequestGroupPackages(groupByPackageId(result));

            // filter result when checkbox is uncheked.
            const filterdCancelProductsReason = result.filter(item => item.packageId !== undefined);

            setCancelRequestOrders(filterdCancelProductsReason);
        }
    }, [checkedProducts, cancelProductsReason]);


    const checkCancelItemHandler = (checkedOrNot, packageId, productId) => {
        let newArray = [];
        const cancelReasonEle = document.querySelector(".cancelReason_" + productId);
        if (checkedOrNot) {
            const checkProductsObj = {
                packageId,
                productId
            }
            newArray = [...checkedProducts, checkProductsObj];
            cancelReasonEle.style.display = "block";
        } else {
            if (checkedProducts.some(item => item.productId === productId)) {
                newArray = checkedProducts.filter(item => item.productId !== productId);
            }

            cancelReasonEle.style.display = "none";
        }
        setCheckedProducts(newArray);
    }

    const cancelProductReasonHanlder = (productId, reason) => {
        let newArray = [];
        if (reason !== '') {
            const checkProductsReasonObj =
            {
                productId,
                reason
            }
            newArray = [...cancelProductsReason, checkProductsReasonObj];
            //hide error msg if displayed
            document.querySelector(".error_" + productId).textContent = "";
        } else {
            if (cancelProductsReason.some(item => item.productId === productId)) {
                newArray = cancelProductsReason.filter(item => item.productId !== productId);
            }
        }
        setCancelProductsReason(newArray);
    }

    const submitCancelRequestHandler = async () => {
        const checkReasonAtCancelOrder = cancelRequestOrders.find((element) => {
            return typeof element['reason'] === 'undefined';
        });
        if (checkReasonAtCancelOrder) {
            cancelRequestOrders.map(item => {
                if (item.reason === undefined) {
                    document.querySelector(".error_" + item.productId).textContent = "Please provide reason";
                    document.querySelector('[name="reason_' + item.productId + '"]').focus();
                }
            });
        } else {
            try {
                setLoading(true);
                const { data } = await axiosApi.put(`/api/cancelorder`,
                    {
                        orderId,
                        orders: cancelRequestOrders,
                        cancelRequestGroupPackages,
                        paymentId: packages[0].paymentId,
                        paymentStatus: packages[0].paymentStatus,
                        paymentType: packages[0].paymentType
                        //*Note:cancel can hold before shipping so paymentStatus & paymentType will be same for all order
                    },
                    {
                        headers: {
                            token: userInfo.token
                        }
                    });
                if (data) {
                    setLoading(true);
                    return router.push('/user/cancel/orders');
                }
            } catch (error) {
                setLoading(true);
                return router.back();
            }
        }
    }
    return (
        <Wrapper>
            <Head>
                <title>Request Cancellation | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {onlyMobile &&
                <Affix offsetTop={70}>
                    <div className="row bg-white backNav-container border-top p-2">
                        <div className="d-flex align-items-center mb-2">
                            <ArrowLeft className="mr-3" onClick={() => router.back()} />
                            Request Cancellation
                        </div>
                    </div>
                </Affix>
            }
            <div className="container mt-4">
                <Layout>
                    {!onlyMobile &&
                        <UserSidebarNav onActive="orders" />
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
                                    <h1>Request Cancellation</h1>
                                </div>
                                <div className="col-12 p-0 p-md-3">
                                    <ul className="list-unstyled mt-2">
                                        {
                                            packages.map(pack => (
                                                <li key={pack._id}>
                                                    {pack.products.map(item => (
                                                        <div key={item.products[0]._id} className="pt-2 pb-2">
                                                            <div className="row">
                                                                <div className="col-12 col-sm-8 col-md-8">
                                                                    <div className="d-flex">
                                                                        <Checkbox
                                                                            name="cancelItem"
                                                                            className="mr-2 mt-5"
                                                                            key={item.products[0]._id}
                                                                            defaultChecked={defaultItemForCancel === item.products[0]._id ? true : false}
                                                                            onChange={(e) => checkCancelItemHandler(e.target.checked, pack._id, item.products[0]._id)}
                                                                        />
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
                                                                                        {item.products[0]._id}
                                                                                        {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                                    </div>
                                                                                    <div className="mt-1">
                                                                                        <b>Qty</b>:{item.productQty}
                                                                                    </div>
                                                                                </div>
                                                                                {onlyMobile &&
                                                                                    <div className="mr-2">
                                                                                        <select className={`form-control cancelReason_${item.products[0]._id}`}
                                                                                            name={`reason_${item.products[0]._id}`}
                                                                                            onChange={(e) => cancelProductReasonHanlder(item.products[0]._id, e.target.value)}
                                                                                            style={{ display: defaultItemForCancel === item.products[0]._id ? 'block' : 'none' }}
                                                                                        >
                                                                                            <option value="">Select reason</option>
                                                                                            <option>Change my mind</option>
                                                                                            <option>Wrong Delivery Address</option>
                                                                                            <option>Other</option>
                                                                                        </select>
                                                                                        <p className={`errorMsg error_${item.products[0]._id}`}></p>
                                                                                    </div>
                                                                                }
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="d-none d-sm-block col-sm-4 col-md-4 text-right">
                                                                    <select className={`form-control cancelReason_${item.products[0]._id}`}
                                                                        name={`reason_${item.products[0]._id}`}
                                                                        onChange={(e) => cancelProductReasonHanlder(item.products[0]._id, e.target.value)}
                                                                        style={{ display: defaultItemForCancel === item.products[0]._id ? 'block' : 'none' }}
                                                                    >
                                                                        <option value="">Select reason</option>
                                                                        <option>Change my mind</option>
                                                                        <option>Wrong Delivery Address</option>
                                                                        <option>Other</option>
                                                                    </select>
                                                                    <p className={`errorMsg error_${item.products[0]._id}`}></p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </li>
                                            ))
                                        }
                                    </ul>
                                </div>
                                {productLength !== 0
                                    ?
                                    <div className="col-12 mt-4 pt-3 border-top">
                                        <div className="text-right mt-3">
                                            <Button type="danger" size="large" loading={loading ? true : false} onClick={submitCancelRequestHandler}>Submit</Button>
                                        </div>
                                    </div>
                                    :
                                    <div className="text-center text-muted mt-5 font16">No Data</div>
                                }
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </Wrapper >
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { orderId, id, packageId } = context.query;
        const { data } = await axios.get(`${process.env.api}/api/cancelrequest/${orderId}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                packages: data,
                defaultItemForCancel: id
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

export default CancelRequest;
