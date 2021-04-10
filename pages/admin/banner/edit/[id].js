import React from 'react';
import { parseCookies } from 'nookies';
import axios from 'axios';

import Wrapper from '../../../../components/admin/Wrapper';
import BannerForm from '../../../../components/admin/BannerForm';

const EditBrand = ({ banner }) => {
    return (
        <Wrapper onActive="banners" breadcrumb={["Edit Banner", "Banner"]}>
            <BannerForm
                Action="edit_banner"
                bannerData={banner}
            />
        </Wrapper>
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

export default EditBrand;