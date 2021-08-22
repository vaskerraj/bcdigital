import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { parseCookies } from "nookies";

import axios from "axios";

import { Affix } from 'antd';
import {
    ShoppingOutlined,
    RollbackOutlined,
    UserOutlined,
    CloseCircleOutlined,
    ProfileOutlined,
    StarOutlined
} from '@ant-design/icons';
import { ArrowLeft } from 'react-feather';

import { userSignOut } from '../../redux/actions/userAction';

const account = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    const { userInfo } = useSelector(state => state.userAuth);

    const signOutHandler = () => {
        dispatch(userSignOut());
    }
    return (
        <>
            <Head>
                <title>My Account | BC Digital</title>
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
            <Affix offsetTop={70}>
                <div className="row bg-white backNav-container border-top p-2">
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center mb-2">
                            <ArrowLeft className="mr-3" onClick={() => router.back()} />
                            My Account
                        </div>
                        <div className="font12">
                            Hello, {userInfo ? userInfo.user.split(" ")[0] : ''}
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="container-fluid">
                <div className="bg-white mt-2">
                    <div style={{ marginLeft: '-1.5rem', marginRight: '-1.5rem' }}>
                        <ul className="list-group list-group-flush">
                            <Link href="/user/orders">
                                <li className="list-group-item">
                                    <ShoppingOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Orders
                                </li>
                            </Link>
                            <Link href="/user/returnorder">
                                <li className="list-group-item">
                                    <RollbackOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Return Orders
                                </li>
                            </Link>
                            <Link href="/user/cancelorder">
                                <li className="list-group-item">
                                    <CloseCircleOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Cancel Orders
                                </li>
                            </Link>
                            <Link href="/user/reviews">
                                <li className="list-group-item">
                                    <StarOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Reviews
                                </li>
                            </Link>
                            <Link href="/user/addresses">
                                <li className="list-group-item">
                                    <ProfileOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Addresses
                                </li>
                            </Link>
                            <Link href="/user/profile">
                                <li className="list-group-item">
                                    <UserOutlined style={{ fontSize: '2rem', marginLeft: '1rem', marginRight: '1rem' }} />
                                    Profile
                                </li>
                            </Link>
                        </ul>
                    </div>
                </div>
                <div className="mt-3 p-2">
                    <button className="btn btn-block btn-lg btn-danger" onClick={signOutHandler}>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
}

// export async function getServerSideProps(context) {
//     try {
//         const { token } = parseCookies(context);

//         const { data: checkoutData } = await axios.get(`${process.env.api}/api/checkout`, {
//             headers: {
//                 token,
//             },
//         });


//     } catch (err) {
//         return {
//             redirect: {
//                 source: '/login?redirect=/user/account',
//                 destination: '/login?redirect=/user/account',
//                 permanent: false,
//             },
//             props: {},
//         };
//     }
// }

export default account;
