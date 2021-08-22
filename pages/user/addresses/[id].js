import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';

import { useForm } from 'react-hook-form';

import { Layout, Card, message, Affix } from 'antd';
const { Content } = Layout;
import { ArrowLeft } from 'react-feather';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import AddressForm from '../../../components/user/AddressForm';
import { updateAddress } from '../../../redux/actions/addressAction';
import Wrapper from '../../../components/Wrapper';

const editaddress = ({ address, defaultAddresses }) => {

    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width])

    const [onSubmitTrigger, setOnSubmitTrigger] = useState(false);
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
    const { register, handleSubmit, errors, reset, getValues } = useForm({
        defaultValues: defaultValues,
    });

    const { updAdrInfo, error } = useSelector(state => state.addresses);

    useEffect(() => {
        if (updAdrInfo && onSubmitTrigger) {
            message.success({
                content: (
                    <div>
                        <div className="font-weight-bold">Success</div>
                        Address successfully updated
                    </div>
                ),
                className: 'message-success',
            });
            setTimeout(() => {
                router.push('/user/addresses');
            }, 2000);
        }
        if (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.error}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }, [onSubmitTrigger, updAdrInfo, error]);

    const dispatch = useDispatch();

    const onSubmit = (inputdata) => {
        dispatch(updateAddress(
            address._id,
            inputdata.fullname,
            inputdata.mobile,
            inputdata.addLabel,
            inputdata.region,
            inputdata.city,
            inputdata.address
        ));
        setOnSubmitTrigger(true);
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
            <Wrapper>
                {onlyMobile &&
                    <Affix offsetTop={70}>
                        <div className="row bg-white backNav-container border-top p-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center mb-2">
                                    <ArrowLeft className="mr-3" onClick={() => router.back()} />
                                    Edit Addresses
                                </div>
                            </div>
                        </div>
                    </Affix>
                }
                <div className="container mt-5">
                    <Layout className="mt-5">
                        {!onlyMobile &&
                            <UserSidebarNav onActive="addresses" />
                        }
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
                                                reset={reset}
                                                getValues={getValues}
                                                onCancel={onCancel}
                                                addresses={defaultAddresses}
                                            />
                                        </div>
                                    </div>
                                </Card>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { id } = context.params;
        const { data } = await axios.get(`${process.env.api}/api/address/${id}`, {
            headers: {
                token: cookies.token,
            },
        });
        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);
        return {
            props: {
                address: data,
                defaultAddresses
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
