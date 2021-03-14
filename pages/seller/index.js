import React from 'react';
import { useDispatch } from 'react-redux';
import nookies from 'nookies';
import axios from 'axios';
import { signout } from '../../redux/actions/sellerAuthAction';

const SellerDashbaord = () => {
    const dispatch = useDispatch();
    return (
        <div>
            Sellers pannel
            <button className="fR" onClick={() => dispatch(signout())}>logout</button>
        </div>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = nookies.get(context);
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
                permanent: false,
                destination: "/seller/login",
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default SellerDashbaord;