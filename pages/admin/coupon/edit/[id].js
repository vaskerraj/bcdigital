import React from 'react';
import Link from 'next/link'
import { parseCookies } from 'nookies';
import axios from 'axios';

import { ChevronLeft } from 'react-feather';

import Wrapper from '../../../../components/admin/Wrapper';
import CouponForm from '../../../../components/admin/forms/CouponForm';

const EditAgent = ({ coupon }) => {
    return (
        <Wrapper onActive="coupon" breadcrumb={["Coupon", "Edit Coupon"]}>
            <div className="d-block text-right">
                <Link href="/admin/coupon/">
                    <a className="font16 mb-2">
                        <ChevronLeft size={20} />
                        Back
                    </a>
                </Link>
            </div>
            <CouponForm
                action="edit_coupon"
                couponData={coupon}
            />
        </Wrapper >
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/admin/coupon/${id}`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        if (data === '') {
            return {
                redirect: {
                    source: '/admin/coupon/',
                    destination: '/admin/coupon/',
                    permanent: false,
                },
            }
        }
        return {
            props: {
                coupon: data
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

export default EditAgent;