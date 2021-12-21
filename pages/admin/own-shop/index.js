import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link'
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { message } from 'antd';

import Wrapper from '../../../components/admin/Wrapper';
import baseUrl from '../../../helpers/baseUrl';
import { ReactTable } from '../../../components/helpers/ReactTable';
import OwnShopModal from '../../../components/admin/OwnShopModal';
import EditSellerAuthModal from '../../../components/admin/EditSellerAuthModal';

// steps
import OwnShopIntialStep from '../../../components/admin/ownshopsteps/Initial';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 3,
});

const OwnShopList = ({ sellers }) => {
    console.log(sellers)
    const [ownShopInitData, setOwnShopInitData] = useState([]);
    const [activeTab, setActiveTab] = useState('approved');

    const [visible, setVisible] = useState(false);
    const [visibleAuthModal, setVisibleAuthModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalAction, setModalAction] = useState('');
    const [dataForModal, setDataForModal] = useState('');

    const router = useRouter();
    const { adminAuth } = useSelector(state => state.adminAuth);

    return (
        <Wrapper onActive="ownShop" breadcrumb={["Own Seller"]}>

        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admingetseller`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        if (data.seller !== null) {
            if (data.details?.stepComplete) {
                return {
                    props: {}
                }
            } else {
                if (data.seller && data.details?.step === null) {
                    return {
                        redirect: {
                            source: '/admin/own-shop/company',
                            destination: '/admin/own-shop/company',
                            permanent: false,
                        }
                    }
                }
                else if (data.details?.step === 'company') {
                    return {
                        redirect: {
                            source: '/admin/own-shop/addresses',
                            destination: '/admin/own-shop/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.details?.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/admin/own-shop/bank',
                            destination: '/admin/own-shop/bank',
                            permanent: false,
                        }
                    }
                } else {
                    return {
                        redirect: {
                            source: '/admin/own-shop/company',
                            destination: '/admin/own-shop/company',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/admin/own-shop/initial',
                    destination: '/admin/own-shop/initial',
                    permanent: false,
                }
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/admin/login',
                destination: '/admin/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default OwnShopList;