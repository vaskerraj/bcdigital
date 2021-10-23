import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios'

import { parseCookies } from 'nookies';

import { paymentTypeText } from '../helpers/functions'

const PaymentIssue = ({ orderId, type, refId }) => {
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
                                Sorry. Your payment process got some issue. Please report this issue to our help center.
                            </div>
                            <div className="mt-5 text-center">
                                OrderId: <b className="text-uppercase">{orderId}</b>
                            </div>
                            <div className="mt-3 text-center">
                                Payment Method: <b className="text-uppercase">{paymentTypeText(type)}</b>
                            </div>
                            <div className="mt-3 text-center">
                                Payment Reference Id: <b className="text-uppercase">{refId}</b>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
export async function getServerSideProps(context) {
    try {
        const urlquery = context.query;
        const orderId = urlquery.id;
        const type = urlquery.type;
        const refId = urlquery.ref;

        const { token } = parseCookies(context);

        const { data } = await axios.post(`${process.env.api}/api/paymentissue`,
            {
                orderId,
                type,
                refId
            }, {
            headers: {
                token
            },
        });

        return {
            props: {
                orderId,
                type,
                refId
            }
        }

    } catch (err) {
        return {
            redirect: {
                source: '/login',
                destination: '/login',
                permanent: false,
            },
            props: {},
        };
    }
}
export default PaymentIssue
