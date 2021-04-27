import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import Wrapper from '../../../components/seller/Wrapper';

const AddProduct = () => {
    const dispatch = useDispatch();

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    return (
        <Wrapper onActive="addproduct" breadcrumb={["Product"]}>
            <div className="d-block">
                Add Product Page
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
        console.log(err)
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