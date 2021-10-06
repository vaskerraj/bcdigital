import React from 'react';
import Link from 'next/link';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Button } from 'antd';

const complete = () => {
    return (
        <>
            <div className="container">
                <div className="text-center mt-4">
                    <h1 style={{ fontWeight: 400 }}>Congratulation.You are ready.</h1>
                    <Link href="/seller/mobile/">
                        <Button type="default" danger size="large" className="mt-5">Go To Dashboard</Button>
                    </Link>
                </div>
            </div>
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
                            source: '/seller/mobile/start/addresses',
                            destination: '/seller/mobile/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/mobile/start/bank',
                            destination: '/seller/mobile/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/mobile/start/company',
                    destination: '/seller/mobile/start/company',
                    permanent: false,
                }
            }
        }
        return {
            redirect: {
                source: '/seller/mobile/start/company',
                destination: '/seller/mobile/start/company',
                permanent: false,
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/mobile/login',
                destination: '/seller/mobile/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default complete;
