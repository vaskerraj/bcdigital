import React from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { parseCookies } from 'nookies';

import axiosApi from '../../../helpers/api';
import axios from 'axios';

import moment from 'moment';

import { message, Button } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { customImageLoader } from '../../../helpers/functions';

const MakeReturn = ({ order, error }) => {

    const router = useRouter();

    const { tid } = router.query;

    // define delivery address variable
    const deliveryAddress = order?.delivery?.addresses[0];

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const proceedToShipHandler = async (packageId, trackingId) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/makereturn`,
                {
                    packageId,
                    trackingId
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Successfully Procced.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    return router.push("/delivery");
                }, 3000);

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

    const getReturnApproveProduct = (products) => {
        return products.some(item => item.orderStatus === 'return_approve');
    }
    const getReturnSameCityProduct = (products) => {
        return products.some(item => item.orderStatus === 'return_sameCity');
    }

    const getDeliveredQty = (productId, products) => {
        const findReturnQty = products.find(item => item.productId === productId);
        //Note: if delivered product not found its act of hack
        return findReturnQty?.productQty;
    }

    return (
        <>
            <Head>
                <title>Orders Details | Delivery Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            {order !== undefined ?
                <div className="p-4">
                    <div className="d-none d-sm-flex justify-content-between text-uppercase mt-2">
                        <div>
                            <span className="font12 font-weight-bold mr-2">Order Placed:</span>
                            {moment(order.createdAt).format("DD MMM YYYY HH:mm")}
                        </div>
                        <div>
                            <span className="font12 font-weight-bold">Order</span>:
                            #{order.orders._id}
                        </div>
                        <div>
                            <span className="font-weight-bold" style={{ fontWeight: 500 }}>Tracking Id</span>:
                            <span style={{ fontWeigth: 500 }}>{tid}</span>
                        </div>
                    </div>
                    <div className="d-block d-sm-none mt-3">
                        <div className="font-weight-bold" style={{ fontWeight: 500 }}>
                            Ship To
                        </div>
                        <div className="mt-2">
                            <div className="d-block">
                                <span className="mr-2">Seller Name:</span>
                                <b>{order.seller.name}</b>
                            </div>
                            <div className="mt-2">
                                <div>{order.returnAddress.fullname}</div>
                                <div>{order.returnAddress.mobile}</div>
                                <div>
                                    {order.returnAddress.street}
                                    {order.returnAddress.area ? order.returnAddress.area.city : ''}
                                    {',' + order.returnAddress.city.name + ', ' + order.returnAddress.region.name}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="d-block d-sm-none title border justify-content-between p-3 pl-4 font13 mt-4"
                        style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                    >
                        <div className="d-block font15">
                            <span className="font-weight-bold" style={{ fontWeight: 500 }}>Order</span>:
                            #{order.orders._id}
                        </div>
                        <div className="d-block font15">
                            <span className="font-weight-bold" style={{ fontWeight: 500 }}>Tracking Id</span>:
                            {tid}
                        </div>
                        <div className="d-block font13">
                            <span className="font-weight-bold">Order Placed</span>:
                            {moment(order.createdAt).format("DD MMM YYYY")}
                        </div>
                    </div>
                    <div
                        className="d-none d-sm-flex title border justify-content-between p-3 pl-4 font13 mt-4"
                        style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                    >
                        <div className="col">
                            <div className="row">
                                <div className="col-sm-4">
                                    <div className="d-block">
                                        <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Return Details</div>
                                        <div className="d-block">
                                            <span className="mr-2">Seller Name:</span>
                                            <b>{order.seller.name}</b>
                                        </div>
                                        <div className="mt-2">
                                            <div>{order.returnAddress.fullname}</div>
                                            <div>{order.returnAddress.mobile}</div>
                                            <div>
                                                {order.returnAddress.street}
                                                {order.returnAddress.area ? order.returnAddress.area.city : ''}
                                                {',' + order.returnAddress.city.name + ', ' + order.returnAddress.region.name}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="d-block mt-3">
                                        <div className="d-block font-weight-bold">Delivered Detail</div>
                                        <div className="mt-2">
                                            <div>{deliveryAddress.name}</div>
                                            <div>
                                                {deliveryAddress.street}
                                                {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                                {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div className="d-block font-weight-bold">Assign Shipping Partner</div>
                                    <div className="d-block mt-2">
                                        <span className="mr-2">Name:</span>
                                        {order.orders.shipping?.shipAgentId.name}
                                    </div>
                                    <div className="d-block mt-2">
                                        <span className="mr-2">Email:</span>
                                        {order.orders.shipping?.shipAgentId.email}
                                    </div>
                                    <div className="d-block mt-2">
                                        <span className="mr-2">Number:</span>
                                        {order.orders.shipping?.shipAgentId.number}
                                    </div>
                                    <div className="d-block mt-2">
                                        <span className="mr-2">Address:</span>
                                        {order.orders.shipping?.shipAgentId.address}
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div className="d-block text-right">
                                        <div className="d-flex justify-content-end">
                                            <div>Delivered At:</div>
                                            <div className="ml-2">{moment(order.deliveryDate).format("DD MMM YYYY HH:mm")}</div>
                                        </div>
                                    </div>
                                    {getReturnApproveProduct(order.rproducts) === true ?
                                        <div className="d-block mt-3 text-right">
                                            <Button type="primary" onClick={() => proceedToShipHandler(order._id, order.rtrackingId)}>Proceed To Return & Ship</Button>
                                            <div className="font12 text-info">
                                                Ship this returns to related city
                                            </div>
                                        </div>
                                        :
                                        getReturnSameCityProduct(order.rproducts) === true ?
                                            <div className="d-block mt-3 text-right">
                                                <Button danger icon={<CheckOutlined />}>Return city is same as yours</Button>
                                                <div className="font12 text-info">
                                                    Please call seller and deliver returns
                                                </div>
                                            </div>
                                            :
                                            <div className="d-block mt-3 text-right">
                                                <Button type="danger" icon={<CheckOutlined />}>Already Procced Return</Button>
                                            </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-block mt-4">
                        <div className="d-block border mt-4" style={{ borderRadius: '0.3rem' }}>
                            <div className="p-0 p-md-3">
                                <div className="d-block font-weight-bold font15 mt-2 mb-4">Product(s)</div>
                                {
                                    order.rproducts.map(item => (
                                        <div key={item._id} className="pt-2 pb-2 border-bottom">
                                            <div className="row">
                                                <div className="col-12 col-sm-6 col-md-6">
                                                    <div className="d-flex">
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
                                                                    <div className="mt-1">
                                                                        <b>Delivered Qty</b>:{getDeliveredQty(item.productId, order.products)} | <b>Return Qty:</b> {item.productQty}
                                                                    </div>
                                                                    {
                                                                        getDeliveredQty(item.productId, order.products) !== item.productQty &&
                                                                        <div className="mt-1 text-danger">
                                                                            Note: Ask customer about other product
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-none d-sm-block col-sm-2 col-md-2 text-right pr-4">
                                                    <span className="badge bg-success text-capitalize">
                                                        {
                                                            item.orderStatus === "return_request"
                                                                ?
                                                                "Returns Request Not Approved"
                                                                :
                                                                item.orderStatus === "return_approve"
                                                                    ?
                                                                    "Returns Approved"
                                                                    :
                                                                    item.orderStatus === "return_shipped" ?
                                                                        "Returns Shipped"
                                                                        :
                                                                        item.orderStatus === "return_atCity" ?
                                                                            "Returns At Delivery City"
                                                                            :
                                                                            item.orderStatus === "return_sameCity" ?
                                                                                "Same Returns City & Delivery City"
                                                                                :
                                                                                item.orderStatus === "return_delivered" ?
                                                                                    "Return Delivered To Seller"
                                                                                    :
                                                                                    item.orderStatus
                                                        }
                                                    </span>
                                                </div>
                                                <div className="col-sm-4 col-md-4 text-right pr-4">
                                                    Return Reason: <b>{item.reason}</b>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <div className="d-block d-sm-none mt-3 mb-5">

                    </div>
                </div>
                :
                <div className="p-4 text-center text-muted font16 mt-5">
                    No Data
                </div>
            }
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { tid } = context.query;
        const { data } = await axios.get(`${process.env.api}/api/package/makereturn/${id}/${tid}`, {
            headers: {
                token: cookies.del_token
            }
        });
        if (data.sameCity === true) {
            return {
                redirect: {
                    source: `/delivery/makereturn/${data._id}/?tid=${data.rtrackingId}`,
                    destination: `/delivery/makereturn/${data._id}/?tid=${data.rtrackingId}`,
                    permanent: false,
                }
            }
        } else {
            return {
                props: {
                    order: data
                }
            }
        }
    } catch (err) {
        return {
            props: {
                error: "nodata"
            },
        };
    }
}

export default MakeReturn;
