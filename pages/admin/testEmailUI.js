import React from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';

import Wrapper from '../../components/admin/Wrapper'

import { paymentTypeText } from '../../helpers/functions';
import { orderConfirm } from '../../email/templets';

const TestEmailUI = ({ clientName, testConfirmedId, orderPackages, orderSummery }) => {
    const productsOfPackages = (products) => {
        console.log(products);
        return products && products.map(item =>
            <table>
                <tr>
                    <td>
                        <img src={`/uploads/products/${item.colour[0].images[0]}`} height="95" />
                    </td>
                    <td colSpan="3"></td>
                    <td>
                        ${item.name}
                        <div style={{ color: "#f33535" }}>
                            Rs. ${item.price}
                        </div>
                        <div>
                            Quantity: ${item.productQty}
                        </div>
                    </td>
                </tr>
            </table>
        )
    }
    const packageWithProductList = (packages) => {
        return packages && packages.map((item, index) =>
            <div>
                <div>Package {index + 1}</div>
                {productsOfPackages(item.products)}
                <br />
            </div>
        )
    }

    const subProductAtShipping = (products) => {
        const onlyShippedProducts = products.filter(item => item.orderStatus === 'shipped');
        return onlyShippedProducts.reduce((a, c) => (a + c.productQty * c.price), 0);
    }
    return (
        <Wrapper breadcrumb={["Test eamil UI"]}>
            <div>
                <div style={{ backgroundColor: "#f3f3f3", padding: '15px' }}>
                    <center style={{ fontSize: "16px", fontWeight: '400' }}>
                        Your Order Is Confirm
                    </center>
                    <br />
                    <div>Hello, <b>${clientName}</b></div>
                    <br />
                    <div>Thank you for your order! We hope you enjoyed shopping with us.</div>
                    <div style={{ marginTop: "15px" }}>You can view the status of your order <b>#${testConfirmedId}</b>.Orders from multiple seller will be deliver in separate packages and we’ll let you know once package(s) have dispatched..</div>
                    <br />
                    <div>
                        <strong>Package(s)</strong>
                        {packageWithProductList(orderPackages)}
                    </div>
                    <div>
                        <strong>Order Summery</strong>
                        <table>
                            <tr>
                                <td>Order Id:</td>
                                <td>#${testConfirmedId}</td>
                            </tr>
                            <tr>
                                <td>Sub Total:</td>
                                <td>Rs.${orderSummery?.subtotal}</td>
                            </tr>
                            <tr>
                                <td>Shipping Charge:</td>
                                <td>Rs.${orderSummery?.shippingCharge}</td>
                            </tr>
                            <tr>
                                <td><b>Order Total:</b></td>
                                <td>Rs.${orderSummery?.grandTotal}</td>
                            </tr>
                            <tr>
                                <td>Selected Payment Method:</td>
                                <td>${(orderSummery?.paymentMethod)}</td>
                            </tr>
                        </table>
                    </div>
                    <br />
                    <br />
                    <div>We hope to see you again soon.</div>
                    <div>BC Digital</div>
                </div>
            </div>
            <div style={{ backgroundColor: "#f3f3f3", padding: '15px' }}>
                <center style={{ fontSize: '16px', fontWeight: '400' }}>
                    Expect to see your package soon
                </center>
                <br />
                <div>Hello, <b>${clientName}</b></div>
                <br />
                <div>
                    Items(s) from order id #${testConfirmedId} has been <b>shipped</b>! You can click below to track your package, check delivery status or see more details.
                </div>
                <br />
                <div>
                    <strong>Product(s) inside package</strong>
                    {productsOfPackages(orderPackages[0].products)}
                </div>
                <br />
                <div>
                    <strong>Package Summery</strong>
                    <table>
                        <tr>
                            <td>Sub Total:</td>
                            <td>Rs.${subProductAtShipping(orderPackages[0].products)}</td>
                        </tr>
                        <tr>
                            <td>Shipping Charge:</td>
                            <td>Rs.${orderPackages[0]?.shippingCharge}</td>
                        </tr>
                        <tr>
                            <td><b>Total:</b></td>
                            <td>Rs.${orderPackages[0]?.packageTotal}</td>
                        </tr>
                        <tr>
                            <td>Selected Payment Method:</td>
                            <td>${(orderPackages[0]?.paymentMethod)}</td>
                        </tr>
                    </table>
                </div>
                <br />
                <div>We hope to see you again soon.</div>
                <div>BC Digital</div>
            </div>
            <div style={{ backgroundColor: "#f3f3f3", padding: '15px' }}>
                <center style={{ fontSize: '16px', fontWeight: '400' }}>
                    Expect to see your package soon
                </center>
                <br />
                <div>Hello, <b>${clientName}</b></div>
                <br />
                <div>
                    Cancelled
                </div>
            </div>
        </Wrapper>
    )
}


export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.query
        const testConfirmedId = id || "61FF435CC3A7541F3017DF57";
        const { data } = await axios.get(`${process.env.api}/api/admin/order/detail/${testConfirmedId}`, {
            headers: {
                token: cookies.ad_token,
            },
        });

        console.log(data);

        const clientName = "Dharma Raj Bhandari";
        //  confirmed order details
        const orderSummery = {
            subtotal: data.order.total,
            shippingCharge: data.order.shippingCharge,
            couponDiscount: data.order.couponDiscount,
            grandTotal: data.order.grandTotal,
            paymentMethod: data.order.paymentType,
        }

        return {
            props: {
                clientName,
                testConfirmedId,
                orderPackages: data.packages,
                orderSummery
            }
        }

    } catch (err) {
        // console.log(err) 
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default TestEmailUI