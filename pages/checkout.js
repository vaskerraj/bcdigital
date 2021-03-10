import React from 'react';
import Head from 'next/head';
import Router from 'next/router';
import { parseCookies } from "nookies";
import axios from "axios";

const Checkout = () => {
    return (
        <div>
            <Head>
                <title>Checkout || BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div>Checkout</div>
        </div>
    )
};

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/checkout`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {}
        }
    } catch (err) {
        return {
            redirect: {
                source: `/login?redirect=checkout`,
                destination: '/login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Checkout;