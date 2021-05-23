import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import Wrapper from '../../../components/seller/Wrapper';
import ProductForm from '../../../components/forms/ProductForm';

const AddProduct = () => {
    const dispatch = useDispatch();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <Wrapper onActive="addproduct" breadcrumb={["Product", "Add Product"]}>
            <div className="d-block">
                <ProductForm
                    action="add_product"
                />
            </div>
        </Wrapper>
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