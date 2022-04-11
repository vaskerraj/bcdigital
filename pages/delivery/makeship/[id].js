import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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

const MakeShipped = ({ order, error }) => {

    const router = useRouter();

    // define delivery address variable
    const deliveryAddress = order?.delivery?.addresses[0];

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const proceedToShipHandler = async (packageId) => {
        try {
            const { data } = await axiosApi.put(`/api/package/makeship`,
                {
                    packageId
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
                            Successfully updated.
                        </div>
                    ),
                    className: 'message-success',
                });

                return router.push("/delivery");
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

    const getTotalWeight = (products) => {
        const onlyPackedProducts = products.filter(item => item.orderStatus === 'packed');
        return onlyPackedProducts.reduce((a, c) => (a + c.package.weight * c.productQty), 0);
    }

    const getShippedProduct = (products) => {
        return products.some(item => item.orderStatus === 'shipped');
    }

    return (
        <>
            <Head>
                <title>Orders Details | Admin Center</title>
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
                            {order.trackingId}
                        </div>
                    </div>
                    <div className="d-block d-sm-none mt-3">
                        <div className="font-weight-bold" style={{ fontWeight: 500 }}>
                            Ship To
                        </div>
                        <div className="mt-2">
                            <div className="font14">{deliveryAddress.name}</div>
                            <div className="font14">
                                {deliveryAddress.street}
                                {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
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
                            {order.trackingId}
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
                                    <div className="d-block font-weight-bold">Shipping Detail</div>
                                    <div className="mt-2">
                                        <div className="font15">{deliveryAddress.name}</div>
                                        <div className="font14">
                                            {deliveryAddress.street}
                                            {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                            {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Seller Details</div>
                                        <div className="d-block">
                                            <span className="mr-2">Name:</span>
                                            {order.seller.name}
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
                                    <div className="d-block mt-2 font15">
                                        <span className="mr-2">Address:</span>
                                        {order.orders.shipping?.shipAgentId.address}
                                    </div>
                                </div>
                                <div className="col-sm-4">
                                    <div className="d-block font-weight-bold">Ship Summery</div>
                                    <div className="d-flex justify-content-between">
                                        <div>Shipping Charge:</div>
                                        <div>Rs. {order.shippingCharge}</div>
                                    </div>
                                    <div className="d-flex justify-content-between font-weight-bold font15">
                                        <div>Total Weight:</div>
                                        <div>{getTotalWeight(order.products)} KG</div>
                                    </div>

                                    {getShippedProduct(order.products)}
                                    {getShippedProduct(order.products) === false ?
                                        <div className="d-block mt-3 text-right">
                                            <Button type="primary" onClick={() => proceedToShipHandler(order._id)}>Proceed To Ship</Button>
                                        </div>
                                        :
                                        <div className="d-block mt-3 text-right">
                                            <Button type="danger" icon={<CheckOutlined />}>Already Shipped</Button>
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
                                    order.products.map(item => (
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
                                                                        <b>Qty</b>:{item.productQty}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="d-none d-sm-block col-sm-2 col-md-2 text-right pr-4">
                                                    <span className="badge bg-success">{item.orderStatus}</span>
                                                </div>
                                                <div className="col-sm-4 col-md-4 text-right pr-4">
                                                    {item.orderStatus === 'packed' &&
                                                        <>
                                                            <div>Width: {item.package.dimensions.width} cm</div>
                                                            <div>Height: {item.package.dimensions.height} cm</div>
                                                            <div>Length: {item.package.dimensions.length} cm</div>
                                                            <div className="font15" style={{ fontWeight: 500 }}>Width: {item.package.weight} kg</div>
                                                            <div className="font15 font-weight-bold">Total Product Width: {item.package.weight * item.productQty}  kg</div>
                                                        </>
                                                    }
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
        const { data } = await axios.get(`${process.env.api}/api/package/makeship/${id}`, {
            headers: {
                token: cookies.del_token
            }
        });
        return {
            props: {
                order: data
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

export default MakeShipped;
