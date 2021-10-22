import React, { useEffect } from 'react';
import Link from 'next/link'
import { parseCookies, destroyCookie } from 'nookies';

import axios from "axios";

const EsewaPaymentFailed = () => {
    return (
        <div className="container">

            <div className="d-flex flex-column min-vh-100 justify-content-center align-items-center">
                <div className="d-block">Something went wrong at E-sewa payment. Try another method for payment.</div>
                <div className="d-block mt-3">
                    <Link href="../checkout">
                        <button type="button" className="btn c-btn-primary">Continue</button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

export async function getServerSideProps(context) {
    try {
        const { token } = parseCookies(context);
        // while unauthorize user try to add product at cart
        const urlquery = context.query;
        const oid = urlquery.oid;
        const { data } = await axios.post(`${process.env.api}/api/orders/check-payment`,
            {
                orderId: oid,
                paymentType: 'esewa'
            },
            {
                headers: {
                    token
                }
            });
        if (data.msg === 'success') {
            // clear carttems cookie on successfull esewa payment
            destroyCookie(null, "cartItem");
            return {
                redirect: {
                    source: `../order-confirm?orderId=${oid}&payment=success`,
                    destination: `../order-confirm?orderId=${oid}&payment=success`,
                    permanent: false,
                },
            }
        }
        return {
            props: {
                oid
            }
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default EsewaPaymentFailed;
