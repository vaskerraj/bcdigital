import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { parseCookies } from "nookies";

import axios from "axios";
import axiosApi from '../helpers/api';

import moment from 'moment';

import { Select, Collapse, message, Radio, Affix, Popover } from 'antd';

import { MapPin, Phone } from 'react-feather';

import { useForm } from 'react-hook-form';

import AddressForm from '../components/user/AddressForm';
import { addAddress } from '../redux/actions/addressAction';

const Checkout = ({ cartDetails, shipping, defaultAddresses, addresses }) => {
    console.log(cartDetails)
    console.log(shipping)
    console.log(addresses)


    const router = useRouter();

    const dispatch = useDispatch();
    const { adrInfo, error } = useSelector(state => state.addresses);
    useEffect(() => {
        if (adrInfo) {
            router.push(router.asPath);
        }
        if (error) {
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
    }, [adrInfo, error]);

    const choosenAddress = addresses.filter(add => add.isDefault !== 'false');
    console.log(choosenAddress)

    const { register, handleSubmit, errors } = useForm();

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
    return (
        <>
            <Head>
                <title>Checkout | BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container">
                <div className="row">
                    <div className="col-sm-12 col-md-8 mt-5">
                        <div className="d-block bg-white">
                            <div className="title border-bottom d-flex justify-content-between p-3 pl-4">
                                <h4>Ship To</h4>
                            </div>
                            <div className="col-12 p-4">
                                {shipping.as === 'default' ?
                                    (
                                        <div className="d-block pb-5">
                                            <AddressForm
                                                formRegister={register}
                                                handleSubmit={handleSubmit(onSubmit)}
                                                errors={errors}
                                                addresses={defaultAddresses}
                                                cancelButton={false}
                                            />
                                        </div>
                                    )
                                    :
                                    (
                                        <div className="d-block pb-5">
                                            <div className="d-flex">
                                                <div className="">
                                                    <MapPin size={20} />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="d-block  font-weight-bold">
                                                        {choosenAddress[0].name}
                                                        <span className="badge bg-warning ml-3">{choosenAddress[0].label}</span>
                                                        <span className="text-info font-weight-normal ml-3 cp">Change</span>
                                                    </div>
                                                    <div className="d-block">
                                                        {choosenAddress[0].street}
                                                        {choosenAddress[0].area ? ',' + choosenAddress[0].area.name : ''},
                                                        {choosenAddress[0].city.name + ',' + choosenAddress[0].region.name}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex align-item-center mt-3">
                                                <div className="">
                                                    <Phone size={20} />
                                                </div>
                                                <div className="ml-3">
                                                    <div className="d-block  font-weight-bold">
                                                        {choosenAddress[0].mobile}
                                                        <span className="text-info font-weight-normal ml-3 cp">Change</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                    <div className="col-sm-12 col-md-4 mt-5">
                        <Affix offsetTop={70}>
                            <div className="summery bg-white p-4">
                                <h4>SUMMERY</h4>
                                <div className="clearfix mt-5">
                                    <div className="d-flex justify-content-between">
                                        <span>Product Total</span>
                                        <span>Rs.{cartDetails.total}</span>
                                    </div>
                                    {cartDetails.shippingCharge !== 0 &&
                                        <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                                            <span>Shipping Charge</span>
                                            <span>Rs.{cartDetails.shippingCharge}</span>
                                        </div>
                                    }
                                    {cartDetails.couponDiscount !== 0 &&
                                        <div className="d-flex justify-content-between mt-3 pt-4 border-top border-gray align-items-center">
                                            <span>Coupon Discount</span>
                                            <span>Rs.{cartDetails.couponDiscount}</span>
                                        </div>
                                    }
                                    <div className="d-flex justify-content-between mt-4 pt-3 border-top border-gray align-items-center">
                                        <span className="font-weight-bold">Total</span>
                                        <span className="grandtotal font-weight-normal" style={{ fontSize: '2.0rem' }}>Rs.{cartDetails.grandTotal}</span>
                                    </div>
                                    <div className="d-block mt-5">
                                        <button onClick={''} className={`btn btn-danger btn-block btn-lg position-relative`} style={{ fontSize: '2.0rem' }}>
                                            Submit Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Affix>
                    </div>
                </div>
            </div>
        </>
    )
};

export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data: cartDetails } = await axios.get(`${process.env.api}/api/checkout`, {
            headers: {
                token: cookies.token,
            },
        });
        const { data: shipping } = await axios.get(`${process.env.api}/api/shipping`, {
            headers: {
                token: cookies.token,
            },
        });

        const { data: defaultAddresses } = await axios.get(`${process.env.api}/api/defaultaddress`);

        let addresses = null;
        if (shipping.as === 'user') {
            addresses = await axios.get(`${process.env.api}/api/addresses`, {
                headers: {
                    token: cookies.token,
                },
            });
        }
        return {
            props: {
                cartDetails,
                shipping,
                defaultAddresses,
                addresses: addresses ? addresses.data : null
            }
        }

    } catch (err) {
        return {
            redirect: {
                source: '/login?redirect=checkout',
                destination: '/login?redirect=checkout',
                permanent: false,
            },
            props: {},
        };
    }
}

export default Checkout;