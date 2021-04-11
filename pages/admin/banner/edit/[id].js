import React from 'react';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../components/admin/Wrapper';
import BannerForm from '../../../../components/admin/BannerForm';

const EditBrand = ({ banner, sellers }) => {
    return (
        <Wrapper onActive="banners" breadcrumb={["Edit Banner", "Banner"]}>
            <div className="d-block text-right">
                <Link href="/admin/banner">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <BannerForm
                Action="edit_banner"
                bannerData={banner}
                sellers={sellers}
            />
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/admin/banner/${id}`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        const sellerData = await axios.get(`${process.env.api}/api/admingetseller`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        const sellers = sellerData.data;
        return {
            props: {
                banner: data,
                sellers
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

export default EditBrand;