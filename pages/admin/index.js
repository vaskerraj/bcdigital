import React from 'react';
import { useDispatch } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import { signout } from '../../redux/actions/adminAuthAction';

const AdminIndex = () => {
    const dispatch = useDispatch();
    return (
        <div>
            Admin pannel
            <button className="fR" onClick={() => dispatch(signout())}>logout</button>
        </div>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isadmin`, {
            headers: {
                token: cookies.ad_token,
            },
        });
        return {
            props: {}
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

export default AdminIndex;