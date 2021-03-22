import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { parseCookies } from 'nookies';
import axios from 'axios';
import axiosApi from '../../helpers/api';

import { useForm } from 'react-hook-form';

import { Eye, EyeOff } from 'react-feather';
import { Layout, Card, message } from 'antd';
const { Content } = Layout;
import UserSidebarNav from '../../components/nav/UserSidebarNav';

const changePassword = () => {
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

    const { userInfo } = useSelector(state => state.userAuth);

    const onSubmit = async (inputdata) => {
        try {
            const { data } = await axiosApi.post('/api/changePwd', {
                current: inputdata.currentpassword,
                password: inputdata.password,
                method: 'custom',
                role: 'subscriber'
            }, {
                headers: {
                    token: userInfo.token
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
                    router.push('/user/profile');
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
        <div>
            <Head>
                <title>Change Password</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container mt-5">
                <Layout className="mt-5">
                    <UserSidebarNav onActive="profile" />
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
                                        <h1>Change Password</h1>
                                    </div>
                                    <div className="d-block mt-5">
                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className="d-block">
                                                <strong style={{ fontSize: '1.5rem' }}>Current Password</strong>
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
                                                <strong style={{ fontSize: '1.5rem' }}>New Password</strong>
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
                                            <div className="d-block  mt-3 mb-5">
                                                <strong style={{ fontSize: '1.5rem' }}>Confirm New Password</strong>
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
                                            <div className="d-block mt-5">
                                                <button type="submit" className="btn btn-lg c-btn-primary font16">
                                                    CHANGE PASSWORD
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </Card>
                        </Content>
                    </Layout>
                </Layout>
            </div>
        </div>
    );
}
export async function getServerSideProps(context) {
    try {
        const cookies = parseCookies(context);
        await axios.get(`${process.env.api}/api/isuser`, {
            headers: {
                token: cookies.token,
            },
        });
        return {
            props: {
            }
        }
    } catch (err) {
        console.log(err)
        return {
            redirect: {
                destination: '../login',
                permanent: false,
            },
            props: {},
        };
    }
}
export default changePassword;
