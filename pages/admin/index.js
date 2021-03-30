import React from 'react';
import { useDispatch } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import Wrapper from '../../components/admin/Wrapper';

const AdminIndex = () => {
    const dispatch = useDispatch();
    return (
        <Wrapper onActive="index" breadcrumb={["Dashboard"]}>
            <div className="d-block">
                Dashboard page
            </div>
        </Wrapper>
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