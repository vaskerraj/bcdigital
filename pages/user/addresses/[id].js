import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { useForm } from 'react-hook-form';

import { Layout, Card, message } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import AddressForm from '../../../components/user/AddressForm';

const editaddress = ({ address }) => {
    const router = useRouter();
    // init default value at edit address
    const defaultValues = {
        fullname: address.name,
        mobile: address.mobile,
        addLabel: address.label,
        region: address.region,
        city: address.city,
        address: address.street,
    }
    const { register, handleSubmit, errors } = useForm({
        defaultValues: defaultValues,
    });

    const dispatch = useDispatch();

    const onSubmit = async (inputdata) => {

    }
    const onCancel = () => {
        return router.back();
    }
    return (
        <>
            <Head>
                <title>Addresss</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <Layout className="mt-5">
                    <UserSidebarNav onActive="addresses" />
                    <Layout className="site-layout">
                        <Content
                            style={{
                                margin: '0 0 0 15px'
                            }}
                        >
                            <Card style={{
                                minHeight: '60vh'
                            }}>
                                <div className="clearfix">
                                    <div className="d-flex page-header justify-content-between">
                                        <h1>Edit Address</h1>
                                    </div>
                                    <div className="d-block mt-5">
                                        <AddressForm
                                            formRegister={register}
                                            handleSubmit={handleSubmit(onSubmit)}
                                            errors={errors}
                                            onCancel={onCancel}
                                        />
                                    </div>
                                </div>
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { req } = context;
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/address/${id}`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
                address: data
            }
        }
    } catch (err) {
        return {
            redirect: {
                destination: '../../login',
                permanent: false,
            },
            props: {},
        };
    }
}
export default editaddress;
