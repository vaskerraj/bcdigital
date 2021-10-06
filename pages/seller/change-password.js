import React, { useState, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import { useForm } from 'react-hook-form';


import { Eye, EyeOff } from 'react-feather';
import { message } from 'antd';

import Wrapper from '../../components/seller/Wrapper';

const SellerChangePassword = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const [passwordNewShown, setPasswordNewShown] = useState(false);
    const [passwordMatchShown, setPasswordMatchShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };
    const togglePasswordNewVisiblity = () => {
        setPasswordNewShown(passwordNewShown ? false : true);
    };
    const togglePasswordMatchVisiblity = () => {
        setPasswordMatchShown(passwordMatchShown ? false : true);
    };

    const router = useRouter();

    const { register, handleSubmit, errors, watch } = useForm({
        reValidateMode: 'onChange'
    });
    // password match
    const password = useRef();
    password.current = watch("newpassword", "");

    const { sellerAuth } = useSelector(state => state.sellerAuth);

    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/changePwd', {
                current: inputdata.currentpassword,
                password: inputdata.password,
                method: 'custom',
                role: 'seller'
            }, {
                headers: {
                    token: sellerAuth.token
                }
            });
            if (data.msg === 'success') {
                message.success({
                    content: (
                        <div>
                            <div className="font-weight-bold">Success</div>
                            Password succesffuly changed
                        </div>
                    ),
                    className: 'message-success',
                });
                setTimeout(() => {
                    router.push('/seller/');
                }, 2000);
            }
        } catch (error) {
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {error.response.data ? error.response.data.error : error.message}
                    </div>
                ),
                className: 'message-warning',
            });
        }
    }
    return (
        <>
            <Head>
                <title>BC Digital Seller Center</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Wrapper onActive="" breadcrumb={["Home", "Change Password"]}>
                <div className="mt-5">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="d-block">
                            <label>Current Password</label>
                            <div className="form-group col-12 col-sm-4 mt-sm-1 position-relative">
                                <input
                                    type={passwordShown ? "text" : "password"}
                                    name="currentpassword"
                                    className="form-control"
                                    ref={register({
                                        required: "Provide your current password"
                                    })}
                                />
                                <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '0.5rem', cursor: 'pointer' }}>
                                    {passwordShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                                {errors.currentpassword && <p className="errorMsg">{errors.currentpassword.message}</p>}
                            </div>
                        </div>
                        <div className="d-block mt-4">
                            <label>New Password</label>
                            <div className="form-group col-12 col-sm-4 mt-sm-1 position-relative">
                                <input
                                    type={passwordNewShown ? "text" : "password"}
                                    name="newpassword"
                                    className="form-control"
                                    ref={register({
                                        required: true,
                                        pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{5,}$/i,
                                        minLength: 5
                                    })}
                                />
                                <i onClick={togglePasswordNewVisiblity} style={{ position: 'absolute', right: '1rem', top: '0.5rem', cursor: 'pointer' }}>
                                    {passwordNewShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                                {errors.newpassword && errors.newpassword.type === "required" && (
                                    <p className="errorMsg">Provide new password</p>
                                )}
                                {errors.newpassword && errors.newpassword.type === "minLength" && (
                                    <p className="errorMsg">
                                        Password must be atleast 5 characters
                                    </p>
                                )}
                                {errors.newpassword && errors.newpassword.type === "pattern" && (
                                    <p className="errorMsg">
                                        Password should contain letter and number
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="d-block mt-4 mb-5">
                            <label>Confirm New Password</label>
                            <div className="form-group col-12 col-sm-4 mt-sm-1 position-relative">
                                <input
                                    type={passwordMatchShown ? "text" : "password"}
                                    name="password"
                                    className="form-control"
                                    ref={register({
                                        required: 'Provide password',
                                        validate: value =>
                                            value === password.current || "The passwords do not match"
                                    })}
                                />
                                <i onClick={togglePasswordMatchVisiblity} style={{ position: 'absolute', right: '1rem', top: '0.5rem', cursor: 'pointer' }}>
                                    {passwordMatchShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                                {errors.password && <p className="errorMsg">{errors.password.message}</p>}
                            </div>
                        </div>
                        <div className="col-12 col-sm-4 text-right mt-5">
                            <button type="submit" className="ant-btn ant-btn-danger ant-btn-lg ml-3">
                                CHANGE PASSWORD
                            </button>
                        </div>
                    </form>
                </div>
            </Wrapper>
        </>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isseller`, {
            headers: {
                token: cookies.sell_token,
            },
        });
        if (data) {
            if (data.stepComplete) {
                return {
                    props: {}
                }
            } else {
                if (data.step === 'company') {
                    return {
                        redirect: {
                            source: '/seller/start/addresses',
                            destination: '/seller/start/addresses',
                            permanent: false,
                        }
                    }
                } else if (data.step === 'addresses') {
                    return {
                        redirect: {
                            source: '/seller/start/bank',
                            destination: '/seller/start/bank',
                            permanent: false,
                        }
                    }
                }
            }
        } else {
            return {
                redirect: {
                    source: '/seller/start/company',
                    destination: '/seller/start/company',
                    permanent: false,
                }
            }
        }
    } catch (err) {
        return {
            redirect: {
                source: '/seller/login',
                destination: '/seller/login',
                permanent: false,
            },
            props: {
                tokenError: err.data
            },
        };
    }
}
export default SellerChangePassword;
