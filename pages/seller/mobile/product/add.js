import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';
import { Affix } from 'antd'

import { ChevronLeft } from 'react-feather';

import ProductForm from '../../../../components/forms/ProductForm';

const AddProduct = () => {
    const router = useRouter();

    return (
        <>
            <Affix>
                <div className="container-fluid backNav-container border-top cp" onClick={() => router.back()}>
                    <div className="d-flex mb-2 align-items-center">
                        <ChevronLeft size={26} className="mr-3" />
                        <div className="back-navigation">
                            Add Product
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="container mt-2 mb-4">
                <ProductForm
                    action="add_product"
                    platform="mobile"
                />
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
        return {
            props: {}
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

export default AddProduct;