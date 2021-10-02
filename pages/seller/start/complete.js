import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Button } from 'antd';

import Wrapper from '../../../components/seller/Wrapper';

const complete = () => {
    return (
        <>
            <Head>
                <title>BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper planView={true}>
                <div className="text-center mt-4">
                    <h1 style={{ fontWeight: 400 }}>Congratulation.You are ready.</h1>
                    <Link href="/seller">
                        <Button type="default" danger size="large" className="mt-5">Go To Dashboard</Button>
                    </Link>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isseller`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        if (data) {
            if (data.stepComplete) {
                return {
                    props: {}
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/start/addresses',
                            destination: '/seller/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/start/bank',
                            destination: '/seller/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/start/company',
                    destination: '/seller/start/company',
                    permanent: false,
                }
            }
        }
        return {
            redirect: {
                source: '/seller/start/company',
                destination: '/seller/start/company',
                permanent: false,
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default complete;
