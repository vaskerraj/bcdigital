import React, { useEffect } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../../helpers/api';

import Wrapper from '../../../../components/seller/Wrapper';
import EditProductForm from '../../../../components/forms/EditProductForm';

const AddProduct = ({ product }) => {
    const dispatch = useDispatch();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <Wrapper onActive="manageproduct" breadcrumb={["Product", "Manage Product", "Edit Product"]}>
            <div className="d-block">
                <EditProductForm
                    action="edit_product"
                    productData={product}
                />
            </div>
        </Wrapper>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/product/${id}`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        return {
            props: {
                product: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default AddProduct;