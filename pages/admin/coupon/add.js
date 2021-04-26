import React from 'react';
import Link from 'next/link'
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../components/admin/Wrapper';
import CouponForm from '../../../components/admin/forms/CouponForm';

const AddCoupon = () => {
    return (
        <Wrapper onActive="coupon" breadcrumb={["Coupon", "Add Coupon"]}>
            <div className="d-block text-right">
                <Link href="/admin/coupon/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <CouponForm
                action="add_coupon"
            />
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/admin/coupon`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {
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

export default AddCoupon;