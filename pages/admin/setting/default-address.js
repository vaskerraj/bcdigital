import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import Wrapper from '../../../components/admin/Wrapper';
import SettingTab from '../../../components/admin/SettingTab';
import DeafultAddressModal from '../../../components/admin/DeafultAddressModal';

const Setting = () => {
    const [visible, setVisible] = useState(false);
    const dispatch = useDispatch();
    return (
        <Wrapper onActive="setting" breadcrumb={["Setting"]}>
            <SettingTab />
            <div className="d-block">
                <div className="d-block text-right">
                    <button className="btn c-btn-primary" onClick={() => setVisible(true)}>Add Default Address</button>
                </div>
            </div>
        </Wrapper >
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

export default Setting;