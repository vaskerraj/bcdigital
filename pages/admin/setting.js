import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { Tabs } from 'antd';
const { TabPane } = Tabs;

import Wrapper from '../../components/admin/Wrapper';

const Setting = () => {
    const [defaultTabKey, setDefaultTabKey] = useState(1);
    const dispatch = useDispatch();
    return (
        <Wrapper onActive="setting" breadcrumb={["Setting"]}>
            <div className="d-block setting-tab">
                <Tabs defaultActiveKey={defaultTabKey} >
                    <TabPane tab="Default Address" key="1">
                        Defult address
                    </TabPane>
                    <TabPane tab="Email Setup" key="2">
                        Email Setup
                    </TabPane>
                </Tabs>
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