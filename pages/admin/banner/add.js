import React from 'react';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../components/admin/Wrapper';
import BannerForm from '../../../components/admin/forms/BannerForm';

const AddBrands = ({ sellers }) => {

    const { adminAuth } = useSelector(state => state.adminAuth);

    return (
        <Wrapper onActive="banners" breadcrumb={["Add Banner", "Banner"]}>
            <div className="d-block text-right">
                <Link href="/admin/banner">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <BannerForm
                Action="add_banner"
                sellers={sellers}
            />
        </Wrapper>
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
        return {
            props: {
                sellers: data
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