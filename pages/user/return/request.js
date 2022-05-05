import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'react-feather';
import { parseCookies } from 'nookies';
import { useSelector } from 'react-redux';

import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { Layout, Card, message, Radio, Space, Affix, Button, Checkbox, Select } from 'antd';
const { Content } = Layout;
const { Option } = Select;
import { LoadingOutlined } from '@ant-design/icons';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import Wrapper from '../../../components/Wrapper';
import { customImageLoader } from '../../../helpers/functions';

const ReturnRequest = ({ packages, defaultItemForReturn }) => {

    const [loaded, setLoaded] = useState(false);
    const [refundValue, setRefundValue] = useState(null)
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')
    const [bankName, setBankName] = useState('')
    const [branch, setBranch] = useState('')
    const [esewaId, setEsewaId] = useState('')

    const [onlyMobile, setOnlyMoble] = useState(false);

    const productLength = packages.products.length;
    const { width } = useWindowDimensions();

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width]);
    useEffect(() => {
        if (packages.products.some(item => item.productQty === 1 && item.productQty !== item.returnProductQty) === true) {
            setLoaded(true);
        }
    }, [packages]);


    const router = useRouter();

    const { orderId, id, packageId } = router.query;

    const [loading, setLoading] = useState(false);
    const [returnRequestOrders, setReturnRequestOrders] = useState([]);
    const [returnRequestProductQty, setReturnRequestProductQty] = useState([]);

    const [checkedProducts, setCheckedProducts] = useState([{
        packageId,
        productId: id
    }]);

    const [returnProductsReason, setReturnProductsReason] = useState([]);
    const [returnProductsQty, setReturnProductsQty] = useState([{
        productId: id,
    }]);
    const [returnRequestGroupPackage, setReturnRequestGroupPackage] = useState({});

    const { userInfo } = useSelector(state => state.userAuth);

    useEffect(() => {

        if (checkedProducts) {
            const groupByPackageId = data => Object.values(
                data.reduce((data, { packageId, productId }) => Object.assign({}, data, {
                    [packageId]: data[packageId]
                        ? { packageId, productId: [...data[packageId].productId, productId] }
                        : { packageId, productId: [productId] }
                }), {})
            );

            const result = Object.values(
                [].concat(checkedProducts, returnProductsQty, returnProductsReason)
                    .reduce((r, c) => (r[c.productId] = Object.assign((r[c.productId] || {}), c), r), {})
            );

            setReturnRequestGroupPackage(groupByPackageId(result));

            // filter result when checkbox is uncheked.
            const filterdReturnProductsReason = result.filter(item => item.packageId !== undefined);

            setReturnRequestOrders(filterdReturnProductsReason);
        }
    }, [checkedProducts, returnProductsQty, returnProductsReason]);

    const checkReturnItemHandler = (checkedOrNot, packageId, productId) => {
        let newArray = [];
        const cancelReasonEle = document.querySelector(".returnReason_" + productId);
        const returnQtyEle = document.querySelector(".returnQty_" + productId);

        //errors element
        const refundReasonErrorElement = document.querySelector(".error_" + productId);
        const productQtyErrorElement = document.querySelector(".errorQty_" + productId);

        if (checkedOrNot) {
            const checkProductsObj = {
                packageId,
                productId
            }
            newArray = [...checkedProducts, checkProductsObj];
            cancelReasonEle.style.display = "block";
            if (returnQtyEle) returnQtyEle.style.display = "block";

            //show error message
            if (productQtyErrorElement) productQtyErrorElement.textContent = "Provide return Qty";
            if (refundReasonErrorElement) refundReasonErrorElement.textContent = "Please provide reason";
        } else {
            if (checkedProducts.some(item => item.productId === productId)) {
                newArray = checkedProducts.filter(item => item.productId !== productId);
            }

            cancelReasonEle.style.display = "none";
            if (returnQtyEle) returnQtyEle.style.display = "none";
            //hide error message
            if (productQtyErrorElement) productQtyErrorElement.textContent = "";
            if (refundReasonErrorElement) refundReasonErrorElement.textContent = "";
        }
        setCheckedProducts(newArray);
    }

    const returnProductReasonHanlder = (productId, reason) => {
        let newArray = [];
        if (reason !== '') {
            const checkProductsReasonObj =
            {
                productId,
                reason,
            }
            newArray = [...returnProductsReason, checkProductsReasonObj];
            //hide error msg if displayed
            document.querySelector(".error_" + productId).textContent = "";
        } else {
            if (returnProductsReason.some(item => item.productId === productId)) {
                newArray = returnProductsReason.filter(item => item.productId !== productId);
            }
        }
        setReturnProductsReason(newArray);
    }

    const returnProductQtyHanlder = (productId, qty) => {
        if (qty !== '') {
            //hide error msg if displayed
            const errorElement = document.querySelector(".errorQty_" + productId)
            if (errorElement) errorElement.textContent = "";

            const checkProductsQtyObj =
            {
                productId,
                reqReturnProductQty: Number(qty),
            }

            const checkDuplicateProduct = returnProductsQty.find(x => x.productId === productId);

            if (checkDuplicateProduct) {
                const uniqueProductIdWithQty = returnProductsQty.map(x => x.productId === productId ? checkProductsQtyObj : x)

                setReturnProductsQty(uniqueProductIdWithQty);
            } else {
                setReturnProductsQty([...returnProductsQty, checkProductsQtyObj]);
            }
        }
    }

    const submitReturnRequestHandler = async () => {
        const checkReasonAtReturnOrder = returnRequestOrders.find((element) => {
            return typeof element['reason'] === 'undefined';
        });
        const checkQtyAtReturnOrder = returnRequestOrders.find((element) => {
            return typeof element['qty'] === 'undefined';
        });

        if (checkReasonAtReturnOrder) {
            returnRequestOrders.map(item => {
                if (item.reason === undefined) {
                    document.querySelector(".error_" + item.productId).textContent = "Please provide reason";
                    document.querySelector('[name="reason_' + item.productId + '"]').focus();
                }
            });
        }
        // check return qty
        if (checkQtyAtReturnOrder) {
            returnRequestOrders.map(item => {
                if (item.reqReturnProductQty === undefined) {
                    document.querySelector(".errorQty_" + item.productId).textContent = "Provide return Qty";
                    document.querySelector('[name="qty_' + item.productId + '"]').focus();
                }
            });
        }

        if (checkReasonAtReturnOrder && checkQtyAtReturnOrder) return;

        if (refundValue === null) {
            return;
        }
        if (refundValue === "bank") {
            if (accountName === '' || accountNumber === '' || bankName === '' || branch === '') {
                if (accountName === '') {
                    document.querySelector('[name="accountName"]').focus();
                } else if (accountNumber === '') {
                    document.querySelector('[name="accountNumber"]').focus();
                } else if (bankName === '') {
                    document.querySelector('[name="bankName"]').focus();
                } else if (branch === '') {
                    document.querySelector('[name="branch"]').focus();
                }
                return;
            }
        } else if (refundValue === "esewa") {
            if (esewaId === '') {
                document.querySelector('[name="esewaId"]').focus();
                return;
            }
        }
        try {
            setLoading(true);
            const { data } = await axiosApi.put(`/api/returnorder`,
                {
                    orderId,
                    orders: returnRequestOrders,
                    returnRequestGroupPackage,
                    paymentId: packages.paymentId,
                    refundValue,
                    accountName,
                    accountNumber,
                    bankName,
                    branch,
                    esewaId
                },
                {
                    headers: {
                        token: userInfo.token
                    }
                });
            if (data.msg === "success" && data.refund === "success") {
                setLoading(true);
                return router.push(`/user/return/result?pId=${packageId}&trackingId=${data.id}`);
            }
        } catch (error) {
            setLoading(true);
            return router.back();
        }
    }

    const onRefundChange = (e) => {
        setRefundValue(e.target.value)
    }

    return (
        <Wrapper>
            <Head>
                <title>Request Return | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {onlyMobile &&
                <Affix offsetTop={70}>
                    <div className="row bg-white backNav-container border-top p-2">
                        <div className="d-flex align-items-center mb-2">
                            <ArrowLeft className="mr-3" onClick={() => router.back()} />
                            Request Return
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
                                    <h1>Request Return</h1>
                                </div>
                                {productLength !== 0 && productLength !== undefined
                                    ?
                                    <>
                                        <div className="col-12 p-0 p-md-3">
                                            {
                                                packages.products.map(item => (
                                                    <>
                                                        {item.productQty !== item.returnProductQty &&
                                                            <div key={item.products[0]._id} className="pt-2 pb-2">
                                                                <div className="row">
                                                                    <div className="col-12 col-sm-7 col-md-7">
                                                                        <div className="d-flex">
                                                                            <Checkbox
                                                                                name="cancelItem"
                                                                                className="mr-2 mt-5"
                                                                                key={item.products[0]._id}
                                                                                defaultChecked={defaultItemForReturn === item.products[0]._id ? true : false}
                                                                                onChange={(e) => checkReturnItemHandler(e.target.checked, packages._id, item.products[0]._id)}
                                                                            />
                                                                            <Image src={`/uploads/products/${item.colour[0].images[0]}`}
                                                                                layout="fixed"
                                                                                width="100"
                                                                                height="100"
                                                                                objectFit="cover"
                                                                                objectPosition="top center"
                                                                                quality="50"
                                                                                loader={customImageLoader}
                                                                            />
                                                                            <div className="product-detail ml-3" style={{ width: '100%' }}>
                                                                                <div className="product-name">{item.name}</div>
                                                                                <div className="d-flex justify-content-between align-items-center mt-1">
                                                                                    <div>
                                                                                        <div className="">
                                                                                            {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                                        </div>
                                                                                    </div>
                                                                                    {onlyMobile &&
                                                                                        <div className="text-right">
                                                                                            <div className="d-flex">
                                                                                                <div className="mt-2 pt-1">Qty:</div>
                                                                                                {item.productQty - item.returnProductQty !== 1 ?
                                                                                                    <select size="medium"
                                                                                                        name={`qty_${item.products[0]._id}`}
                                                                                                        onChange={(e) => returnProductQtyHanlder(item.products[0]._id, e.target.value)}
                                                                                                        className={`form-control ml-2 returnQty_${item.products[0]._id}`}>
                                                                                                        <option value="">Select Qty</option>
                                                                                                        {
                                                                                                            [...Array(item.productQty - item.returnProductQty).keys()].map(x => (
                                                                                                                <option key={x} value={x + 1}>{x + 1}</option>
                                                                                                            ))
                                                                                                        }
                                                                                                    </select>
                                                                                                    :
                                                                                                    <div className="mt-2 pt-1 pl-2" onLoad={
                                                                                                        loaded &&
                                                                                                        setTimeout(() => {
                                                                                                            returnProductQtyHanlder(item.products[0]._id, 1)
                                                                                                            setLoaded(false)
                                                                                                        }, 1000)
                                                                                                    }
                                                                                                    >
                                                                                                        1
                                                                                                    </div>
                                                                                                }


                                                                                            </div>
                                                                                            <p className={`errorMsg ml-5 errorQty_${item.products[0]._id}`}></p>
                                                                                        </div>
                                                                                    }
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <div className="d-none d-sm-block col-sm-2 col-md-2">
                                                                        <div className="d-flex">
                                                                            <div className="mt-2 pt-1">Qty:</div>
                                                                            {item.productQty - item.returnProductQty !== 1 ?
                                                                                <select size="medium"
                                                                                    name={`qty_${item.products[0]._id}`}
                                                                                    onChange={(e) => returnProductQtyHanlder(item.products[0]._id, e.target.value)}
                                                                                    className={`form-control ml-2 returnQty_${item.products[0]._id}`}
                                                                                    style={{ display: defaultItemForReturn === item.products[0]._id ? 'block' : 'none' }}
                                                                                >
                                                                                    <option value="">Select Qty</option>
                                                                                    {
                                                                                        [...Array(item.productQty - item.returnProductQty).keys()].map(x => (
                                                                                            <option key={x} value={x + 1}>{x + 1}</option>
                                                                                        ))
                                                                                    }
                                                                                </select>
                                                                                :
                                                                                <div className="mt-2 pt-1 pl-2" onLoad={
                                                                                    loaded &&
                                                                                    setTimeout(() => {
                                                                                        returnProductQtyHanlder(item.products[0]._id, 1)
                                                                                        setLoaded(false)
                                                                                    }, 1000)
                                                                                }
                                                                                >
                                                                                    1
                                                                                </div>
                                                                            }


                                                                        </div>
                                                                        <p className={`errorMsg ml-5 errorQty_${item.products[0]._id}`}></p>
                                                                    </div>

                                                                    <div className="col-sm-3 col-md-3 text-right">
                                                                        <select className={`form-control returnReason_${item.products[0]._id}`}
                                                                            name={`reason_${item.products[0]._id}`}
                                                                            onChange={(e) => returnProductReasonHanlder(item.products[0]._id, e.target.value)}
                                                                            style={{ display: defaultItemForReturn === item.products[0]._id ? 'block' : 'none' }}
                                                                        >
                                                                            <option value="">Select reason</option>
                                                                            <option>Damage</option>
                                                                            <option>Defective</option>
                                                                            <option>Wrong Size</option>
                                                                            <option>Not Orginal</option>
                                                                            <option>Wrong Item</option>
                                                                            <option>Not Fit</option>
                                                                            <option>Not As Advertised</option>
                                                                            <option>Missing Parts</option>
                                                                            <option>Change My Mind</option>
                                                                        </select>
                                                                        <p className={`errorMsg error_${item.products[0]._id}`}></p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        }
                                                    </>
                                                ))
                                            }
                                        </div>
                                        <div className="col-12 mt-4 pt-3 border-top">
                                            <div className="font14">Select Refund Option</div>
                                            <div className="d-block mt-2">
                                                <Radio.Group onChange={onRefundChange} value={refundValue}>
                                                    <Space direction="vertical">
                                                        <Radio value="bank">Bank Transfer</Radio>
                                                        <Radio value="esewa">E-sewa Transfer</Radio>
                                                    </Space>
                                                </Radio.Group>
                                            </div>
                                            {!refundValue &&
                                                <p className="errorMsg">Provide refund option</p>
                                            }
                                            {refundValue === "bank" &&
                                                <div className="d-block mt-3" style={{ maxWidth: 320 }}>
                                                    <div className="d-block mt-4">
                                                        <label className="cat-label">Account Holder's Name</label>
                                                        <input type="text" className="form-control mt-1"
                                                            name="accountName"
                                                            autoComplete="none"
                                                            onChange={(e) => setAccountName(e.target.value)}
                                                        />
                                                        {!accountName &&
                                                            <p className="errorMsg">Provide account holder's name</p>
                                                        }
                                                    </div>
                                                    <div className="d-block mt-2">
                                                        <label className="cat-label">Account Number</label>
                                                        <input type="text" className="form-control mt-1"
                                                            name="accountNumber"
                                                            autoComplete="none"
                                                            onChange={(e) => setAccountNumber(e.target.value)}
                                                        />
                                                        {!accountNumber &&
                                                            <p className="errorMsg">Provide account number</p>
                                                        }
                                                    </div>
                                                    <div className="d-block mt-2">
                                                        <label className="cat-label">Bank Name</label>
                                                        <input type="text" className="form-control mt-1"
                                                            name="bankName"
                                                            autoComplete="none"
                                                            onChange={(e) => setBankName(e.target.value)}
                                                        />
                                                        {!bankName &&
                                                            <p className="errorMsg">Provide bank name</p>
                                                        }
                                                    </div>
                                                    <div className="d-block mt-2">
                                                        <label className="cat-label">Branch</label>
                                                        <input type="text" className="form-control mt-1"
                                                            name="branch"
                                                            autoComplete="none"
                                                            onChange={(e) => setBranch(e.target.value)}
                                                        />
                                                        {!branch &&
                                                            <p className="errorMsg">Provide branch</p>
                                                        }
                                                    </div>
                                                </div>
                                            }
                                            {refundValue === "esewa" &&
                                                <div className="d-block mt-3" style={{ maxWidth: 320 }}>
                                                    <label className="cat-label">E-sewa Id</label>
                                                    <input type="number" className="form-control mt-1"
                                                        name="esewaId"
                                                        autoComplete="none"
                                                        onChange={(e) => setEsewaId(e.target.value)}
                                                    />
                                                    {!esewaId &&
                                                        <p className="errorMsg">Provide e-sewa id</p>
                                                    }
                                                </div>
                                            }
                                        </div>
                                        <div className="col-12 mt-4 pt-3 border-top">
                                            Note: Please visit nearby courier office to return item(s).
                                        </div>
                                        <div className="col-12 mt-4 pt-3 border-top">
                                            <div className="text-right mt-3">
                                                <Button type="danger" size="large"
                                                    loading={loading ? true : false}
                                                    onClick={submitReturnRequestHandler}
                                                    disabled={loaded ? true : false}
                                                >
                                                    Submit
                                                </Button>
                                            </div>
                                        </div>
                                    </>
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
        const { data } = await axios.get(`${process.env.api}/api/returnrequest/${packageId}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                packages: data,
                defaultItemForReturn: id
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

export default ReturnRequest;
