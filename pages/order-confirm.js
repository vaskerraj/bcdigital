import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { parseCookies, destroyCookie } from "nookies";

import axios from "axios";
import axiosApi from '../helpers/api';
import { CheckCircle } from 'react-feather';

const OrderConfirm = () => {
    const router = useRouter();
    return (
        <>
            <Head>
                <title>Bcdigital.com</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container-fluid" style={{ backgroundColor: '#fff' }}>
                <div className="container">
                    <div className="d-flex align-items-center" style={{ height: '7rem' }}>
                        <Link href="/">
                            <a className="d-block">
                                <img src="/logo192.png" height="53px" />
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="container">
                <div className="p-4">
                    <div className="row">
                        <div className="mx-auto my-4 bg-white p-3" style={{ maxWidth: '550px' }}>
                            <div className="text-center text-success font-weight-bold font16 mt-3">
                                <CheckCircle className="mr-2" />
                                Congratulation
                            </div>
                            <div className="mt-5 text-center">
                                Your order id is <b className="text-uppercase">{router.query.orderId}</b>
                            </div>
                            <div className="border text-center mt-5 p-3">
                                We send order confirmation email to your email address with details.
                                <div>
                                    Thank you for shopping with us.
                                </div>
                            </div>
                            <div className="d-block text-center mt-5 mb-4">
                                <Link href={`/user/orders/${router.query.orderId}`}>
                                    <button className="btn c-btn-primary mt-3">
                                        View Order
                                    </button>
                                </Link>
                                <Link href="/">
                                    <button className="btn c-btn-primary mt-3 ml-3">
                                        Continue Shopping
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export async function getServerSideProps(context) {
    try {
        const urlquery = context.query;
        const cookies = parseCookies(context);

        await axios.get(`${process.env.api}/api/checkorder/${urlquery.orderId}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {

            }
        }

    } catch (err) {
        return {
            redirect: {
                source: '/',
                destination: '/',
                permanent: false,
            },
            props: {},
        };
    }
}

export default OrderConfirm;
