import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../../helpers/api';

import { useForm } from 'react-hook-form';

import { Layout, Card, message, Affix } from 'antd';
const { Content } = Layout;
import { ArrowLeft } from 'react-feather';

import useWindowDimensions from '../../../helpers/useWindowDimensions';
import UserSidebarNav from '../../../components/nav/UserSidebarNav';
import AddressForm from '../../../components/user/AddressForm';
import AddressList from '../../../components/user/AddressList';
import { addAddress } from '../../../redux/actions/addressAction';
import Wrapper from '../../../components/Wrapper';

const Addresses = ({ addresses, defaultAddresses }) => {

    const { width } = useWindowDimensions();
    const [onlyMobile, setOnlyMoble] = useState(false);

    useEffect(() => {
        if (width <= 576) {
            setOnlyMoble(true);
        } else {
            setOnlyMoble(false);
        }
    }, [width])

    const [addAddressBlock, setAddAddressBlock] = useState(false);

    const { register, handleSubmit, errors } = useForm();

    const router = useRouter();

    const { userInfo } = useSelector(state => state.userAuth);
    const { adrInfo, error } = useSelector(state => state.addresses);
    useEffect(() => {
        if (adrInfo) {
            message.success({
                content: (
                    <div>
                        <div className="font-weight-bold">Success</div>
                        Address Added
                    </div>
                ),
                className: 'message-success',
            });
            setTimeout(() => {
                router.push(router.asPath);
                setAddAddressBlock(false);
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
    }, [adrInfo, error]);

    const dispatch = useDispatch();
    const onSubmit = (inputdata) => {
        dispatch(addAddress(
            inputdata.fullname,
            inputdata.mobile,
            inputdata.addLabel,
            inputdata.region,
            inputdata.city,
            inputdata.area,
            inputdata.address
        ))
    }

    const onCancel = () => {
        setAddAddressBlock(false);
    }
    const onDefaultAddress = async (_this, id) => {
        _this.target.checked = true;
        try {
            const { data } = await axiosApi.get(`/api/defaultaddress/${id}`, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                router.push(router.asPath);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const onAddressDelete = async (id) => {
        try {
            const { data } = await axiosApi.delete(`/api/address/${id}`, {
                headers: {
                    token: userInfo.token
                }
            });
            if (data) {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Address successfully deleted.
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push(router.asPath);
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }

    const popConfirm = (id) => {
        onAddressDelete(id)
    }
    const onAddressEdit = (id) => {
        router.push('/user/addresses/[id]', `/user/addresses/${id}`);
    };

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
                                    Addresses
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
                                            <h1>{!addAddressBlock ? 'Addresses' : 'Add New Address'}</h1>
                                        </div>
                                        <div className="d-block mt-5">
                                            {addAddressBlock &&
                                                <AddressForm
                                                    formRegister={register}
                                                    handleSubmit={handleSubmit(onSubmit)}
                                                    errors={errors}
                                                    onCancel={onCancel}
                                                    addresses={defaultAddresses}
                                                />
                                            }
                                            {!addAddressBlock && addresses.length ? (
                                                <div>
                                                    <AddressList
                                                        data={addresses}
                                                        makeDefault={onDefaultAddress}
                                                        popConfirm={popConfirm}
                                                        onAddressEdit={onAddressEdit}
                                                    />
                                                    <div className="d-block mt-5 text-center">
                                                        <button type="button" onClick={() => setAddAddressBlock(true)} className="btn btn-lg c-btn-primary font16">
                                                            Add New Address
                                                        </button>
                                                    </div>
                                                </div>
                                            )
                                                : null}

                                            {
                                                !addAddressBlock && !addresses.length ?
                                                    (
                                                        <div className="text-center">
                                                            <div className="font14 font-weight-bold text-muted">
                                                                No addresses. Add new address for shipping.
                                                            </div>
                                                            <div className="d-block mt-5">
                                                                <button type="button" onClick={() => setAddAddressBlock(true)} className="btn btn-lg c-btn-primary font16">
                                                                    Add New Address
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )
                                                    :
                                                    null
                                            }
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
        const { data } = await axios.get(`${process.env.api}/api/addresses`, {
            headers: {
                token: cookies.token,
            },
        });
        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);
        return {
            props: {
                addresses: data,
                defaultAddresses
            }
        }
    } catch (err) {
        return {
            redirect: {
                destination: '../login',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Addresses;
