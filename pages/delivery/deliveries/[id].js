import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import { parseCookies } from 'nookies';
import axiosApi from '../../../helpers/api';
import axios from 'axios';

import moment from 'moment';
import { useForm } from 'react-hook-form';

import { message, Modal, Button } from 'antd';
import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import Wrapper from '../../../components/delivery/Wrapper';
import { paymentTypeText } from '../../../helpers/functions';

const OrdersDetailsAtDelivery = ({ order, userRole }) => {
    const [filteredProducts, setfilteredProducts] = useState([]);

    // for ready to pack
    const [notDeliveryModal, setNotDeliveryModal] = useState(false);

    // define delivery address variable
    const deliveryAddress = order.delivery?.addresses[0];

    const router = useRouter();
    const currentStatus = router.query.status;

    const { deliveryAuth } = useSelector(state => state.deliveryAuth);

    const { register, handleSubmit, errors, } = useForm();

    useEffect(() => {
        const redefineActiveTab = currentStatus === "pending" ? "reached_at_city" : currentStatus;
        console.log(redefineActiveTab)
        setfilteredProducts(order.products.filter(item => item.orderStatus === redefineActiveTab))
    }, [order, currentStatus]);

    const getProductTotal = (products, currentOrder) => {
        const redefineActiveTab = currentOrder === "pending" ? "reached_at_city" : currentOrder;
        const getNonCancelProduct = products.filter(item => item.orderStatus === redefineActiveTab);
        return getNonCancelProduct.reduce((a, c) => (a + c.productQty * c.price), 0);
    }

    const handleDelivery = async (id) => {
        try {
            const { data } = await axiosApi.put(`/api/delivery/delivered`,
                {
                    packageId: id,
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
                            Product has been succssfully delivered.
                        </div>
                    ),
                    className: 'message-success',
                });
                return router.push(true)
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
    const handleDeliveredConfirm = (packageId) => {
        Modal.confirm({
            title: 'Confirm Delivery',
            icon: <ExclamationCircleOutlined />,
            content: order.paymentType === "cashondelivery" ? 'Are you sure you receive payement & want to confirm this delivery?' : 'Are you sure to confirm this delivery?',
            okText: 'Yes',
            onOk: () => handleDelivery(packageId),
            cancelText: 'NO',
            onCancel: Modal.destroyAll()

        });
    }

    const handleNotDeliveryModalCancel = () => {
        setNotDeliveryModal(false);
    }

    const onDeliveryNotDelivered = async (inputdata) => {
        const reason = inputdata.reason;
        try {
            const { data } = await axiosApi.put(`/api/delivery/notdelivered`,
                {
                    id: order._id,
                    reason
                },
                {
                    headers: {
                        token: deliveryAuth.token
                    }
                });
            if (data) {
                setNotDeliveryModal(false);
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Successfully updated with reason of faild delivery.
                        </div>
                    ),
                    className: 'message-success',
                });
                return router.back();
            }
        } catch (error) {
            setNotDeliveryModal(false);
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
    return (
        <>
            <Modal
                title="Provide reason to be not delivered"
                visible={notDeliveryModal}
                footer={null}
                closable={false}
                destroyOnClose={true}
            >
                <form onSubmit={handleSubmit(onDeliveryNotDelivered)}>
                    <div className="d-block">
                        <select className="form-control"
                            name="reason"
                            ref={register({
                                required: "Provide reason"
                            })}
                        >
                            <option value="">Select reason</option>
                            <option>No One At Home</option>
                            <option>Call Not Connected</option>
                            <option>Wrong Delivery Address</option>
                            <option>Other</option>
                        </select>
                        {errors.reason && <p className="errorMsg">{errors.reason.message}</p>}
                    </div>
                    <div className="d-block border-top mt-5 text-right">
                        <button type="button" onClick={handleNotDeliveryModalCancel} className="btn btn-lg c-btn-light font16 mt-4 mr-5">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-lg c-btn-primary font16 mt-4">
                            Submit
                        </button>
                    </div>
                </form>
            </Modal>
            <Wrapper onActive="deliveries" breadcrumb={["Deliveries", "Delievery Details"]}>
                <Head>
                    <title>Delieveries Details | BC Digital Delivery Center</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>
                <div className="d-none d-sm-flex justify-content-between text-uppercase mt-2">
                    <div>
                        <span className="font12 font-weight-bold mr-2">Order Placed:</span>
                        {moment(order.createdAt).format("DD MMM YYYY HH:mm")}
                    </div>
                    <div>
                        <span className="font12 font-weight-bold">Order</span>:
                        #{order.orders._id}
                    </div>
                </div>
                <div className="d-block d-sm-none mt-3">
                    <div className="font-weight-bold" style={{ fontWeight: 500 }}>
                        Ship To
                    </div>
                    <div className="mt-2">
                        <div className="font14">{deliveryAddress.name}</div>
                        <div className="font14">{order.deliveryMobile}</div>
                        <div className="font12 text-muted">
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
                    {order.trackingId &&
                        <div className="mt-3">
                            <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Tracking Id: {order.trackingId}</div>
                        </div>
                    }
                    <div className="mt-2">
                        <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Package Id: {order._id.toUpperCase()}</div>
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
                                    <div className="font14">{deliveryAddress.name}</div>
                                    <div className="font14">{order.deliveryMobile}</div>
                                    <div className="font12 text-muted">
                                        {deliveryAddress.street}
                                        {deliveryAddress.area ? deliveryAddress.area.city : ''}
                                        {',' + deliveryAddress.city.name + ', ' + deliveryAddress.region.name}
                                    </div>
                                </div>
                                {order.trackingId &&
                                    <div className="mt-3">
                                        <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Tracking Id: {order.trackingId}</div>
                                    </div>
                                }
                                <div className="mt-2">
                                    <div className="d-block font-weight-bold" style={{ fontWeight: 500 }}>Package Id: {order._id.toUpperCase()}</div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div className="d-block font-weight-bold">Delivery Details</div>
                                <div className="d-block">
                                    <span className="mr-2">Reached At City:</span>
                                    {moment(order.reachedDate).format("DD MMM YYYY HH:mm")}
                                </div>
                                {currentStatus === 'not_delivered' && order.notDelivered !== undefined &&
                                    <div className="d-block mt-3">
                                        <div className="font14">Deliveries Attempts</div>
                                        <div className="d-block">
                                            <div>
                                                Total Attempt: <b>{order.notDelivered.length}</b>
                                            </div>
                                            <div className=" border p-2 mt-2">
                                                <b>Attempts</b>
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {order.notDelivered.map(item =>
                                                            <tr key={item._id}>
                                                                <td>{moment(item.date).format("DD MMM YYYY HH:mm")}</td>
                                                                <td>{item.reason}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                            <div className="col-sm-4">
                                <div className="d-block font-weight-bold">Receiveable & Action</div>
                                <div className="d-flex justify-content-between font-weight-bold mt-2">
                                    <div className="font15">Receiveable:</div>
                                    <div className="font15" style={{ color: '#f33535' }}>
                                        Rs. {order.paymentType === "cashondelivery" ?
                                            getProductTotal(order.products, currentStatus) + order.shippingCharge
                                            : 0
                                        }
                                    </div>
                                </div>
                                {currentStatus === 'for_delivery' && userRole === "rider" &&
                                    <div className="d-flex justify-content-end mt-4">
                                        <Button type="primary" onClick={() => handleDeliveredConfirm(order._id)}>Receive Payment & Delivered</Button>
                                        <Button danger className="ml-2" onClick={() => setNotDeliveryModal(true)}>Not Delivered</Button>
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
                                filteredProducts.map(item => (
                                    <div key={item._id} className="pt-2 pb-2">
                                        <div className="row">
                                            <div className="col-12 col-sm-8 col-md-6">
                                                <div className="d-flex">
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
                                                                    {item.products[0].size !== 'nosize' ? `Size : ${item.products[0].size} ` : ''}
                                                                </div>
                                                                <div className="mt-1">
                                                                    <b>Qty</b>:{item.productQty}
                                                                </div>
                                                                {order.paymentType === "cashondelivery" &&
                                                                    <div className="mt-1" style={{ color: '#f33535' }}>
                                                                        <div className="font-weight-bold">Rs: {item.price}</div>
                                                                    </div>
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-none d-sm-block col-sm-4 col-md-2 text-right pr-4">
                                                {item.orderStatus !== 'not_confirmed' && item.orderStatus !== 'confirmed'
                                                    ?
                                                    item.orderStatus === 'for_delivery' ?
                                                        <span className="badge bg-warning">On The Way</span>
                                                        :
                                                        <span className="badge bg-success text-capitalize">{currentStatus}</span>
                                                    :
                                                    <span className="badge bg-warning">Processing</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
                <div className="d-block d-sm-none mt-3 mb-5">
                    <div
                        className="title border p-3 pl-4 font13"
                        style={{ backgroundColor: '#fafafa', borderRadius: '0.3rem' }}
                    >
                        <div className="d-block">
                            <h2 style={{ fontWeight: 400 }}>Receiveable</h2>
                        </div>

                        <div className="d-flex justify-content-between font-weight-bold">
                            <div className="font15">Total Price:</div>
                            <div className="font15" style={{ color: '#f33535' }}>
                                Rs. {order.paymentType === "cashondelivery" ?
                                    getProductTotal(order.products, currentStatus) + order.shippingCharge
                                    : 0
                                }
                            </div>
                        </div>
                        {currentStatus === 'for_delivery' && userRole === "rider" &&
                            <div className="d-flex justify-content-end mt-4">
                                <Button type="primary" onClick={() => handleDeliveredConfirm(order._id)}>Receive Payment & Delivered</Button>
                                <Button danger className="ml-2" onClick={() => setNotDeliveryModal(true)}>Not Delivered</Button>
                            </div>
                        }
                    </div>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;

        const { data } = await axios.get(`${process.env.api}/api/deliveries/package/${id}`, {
            headers: {
                token: cookies.del_token,
            },
        });
        return {
            props: {
                order: data,
                userRole: cookies.del_role
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/delivery/login',
                destination: '/delivery/login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default OrdersDetailsAtDelivery;
