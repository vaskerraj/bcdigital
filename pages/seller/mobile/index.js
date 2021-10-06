import React from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Affix, Avatar } from 'antd';
import {
    PlusOutlined,
    ShoppingOutlined,
    ShoppingCartOutlined,
} from '@ant-design/icons';

import Mobilebottomtab from '../../../components/seller/MobileBottomTab';

const SellerDashbaord = () => {
    const dispatch = useDispatch();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <div className="d-block">
            <Mobilebottomtab active="home" />
            <Affix>
                <div className="container-fluid" style={{ backgroundColor: '#fff', boxShadow: '0 1px 6px 0 rgb(32 33 36 / 28%)' }}>
                    <div className="container">
                        <div className="d-flex align-items-center justify-content-between" style={{ height: '7rem' }}>
                            {sellerAuth &&
                                <div>
                                    {sellerAuth.picture ?
                                        <Avatar
                                            src={`/sellers/${sellerAuth.picture}`}
                                            className="mr-2"
                                        />
                                        :
                                        <Avatar
                                            className="mr-2"
                                            style={{ backgroundColor: '#87d068' }}
                                        >
                                            {sellerAuth.user.charAt(0).toUpperCase()}
                                        </Avatar>
                                    }
                                    {sellerAuth.user}
                                </div>
                            }
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="container mt-5 mb-5">
                <div className="row">
                    <div className="col-6">
                        <div className="bg-white pl-2 pr-2 pt-3 pb-3" style={{ borderRadius: '0.8rem', boxShadow: '0 1px 4px 0 rgba(0,0,0,.1)' }}>
                            <div className="d-flex justify-content-between">
                                <div className="text-center">
                                    <div className="font12">Pending Orders</div>
                                    <div className="font-weight-bold mt-1">9</div>
                                </div>
                                <div className="text-center">
                                    <div className="font12">Pending Products</div>
                                    <div className="font-weight-bold mt-1">9</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="bg-white pl-2 pr-2 pt-3 pb-3" style={{ borderRadius: '0.8rem', boxShadow: '0 1px 4px 0 rgba(0,0,0,.1)' }}>
                            <div className="d-flex justify-content-between">
                                <div className="text-center">
                                    <div className="font12">Approved Orders</div>
                                    <div className="font-weight-bold mt-1">9</div>
                                </div>
                                <div className="text-center">
                                    <div className="font12">Approved Products</div>
                                    <div className="font-weight-bold mt-1">9</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col mt-5">
                    <div className="bg-white p-4" style={{ borderRadius: '0.8rem', boxShadow: '0 1px 4px 0 rgba(0,0,0,.1)' }}>
                        <div className="row">
                            <div className="col-4 text-center">
                                <Link href="./mobile/product/add">
                                    <a>
                                        <PlusOutlined className="text-muted" style={{ fontSize: '3rem' }} />
                                        <div>Add Product</div>
                                    </a>
                                </Link>
                            </div>
                            <div className="col-4 text-center">
                                <Link href="./mobile/product/manage">
                                    <a>
                                        <ShoppingOutlined className="text-muted" style={{ fontSize: '3rem' }} />
                                        <div>Products</div>
                                    </a>
                                </Link>
                            </div>
                            <div className="col-4 text-center">
                                <Link href="">
                                    <a>
                                        <ShoppingCartOutlined className="text-muted" style={{ fontSize: '3rem' }} />
                                        <div>Orders</div>
                                    </a>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
                            source: './mobile/start/addresses',
                            destination: './mobile/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: './mobile/start/bank',
                            destination: './mobile/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: './mobile/start/company',
                    destination: './mobile/start/company',
                    permanent: false,
                }
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

export default SellerDashbaord;