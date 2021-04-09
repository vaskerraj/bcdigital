import React, { useState } from 'react';
import Link from 'next/link'
import Image from 'next/image'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import axiosApi from '../../../helpers/api';
import { Popconfirm, message } from 'antd';

import Wrapper from '../../../components/admin/Wrapper';
import BannerForm from '../../../components/admin/BannerForm';

const AddBrands = () => {

    const { adminAuth } = useSelector(state => state.adminAuth);

    return (
        <Wrapper onActive="banners" breadcrumb={["Add Banner", "Banner"]}>
            <BannerForm
                Action="add_banner"
            />
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isAdmin`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
                banner: data
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

export default AddBrands;