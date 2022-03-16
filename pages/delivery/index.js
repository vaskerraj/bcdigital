import React, { useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';

import moment from 'moment';

import { Card, Tooltip, Popover, Tag } from 'antd';
import { InfoCircleOutlined, GoogleOutlined, FacebookFilled, RiseOutlined, FallOutlined, SwapOutlined } from '@ant-design/icons';


import Wrapper from '../../components/delivery/Wrapper';

const DeliveryDashbaord = () => {

    return (
        <Wrapper onActive="index" breadcrumb={["Dashboard"]} >
            hhsdshd
        </Wrapper>
    )
}

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);

        return {
            props: {
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/delivery/login',
                destination: '/delivery/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}

export default DeliveryDashbaord;