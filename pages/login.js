import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

import { useForm } from "react-hook-form";

import { parseCookies } from 'nookies';
import axios from 'axios';
import { Eye, EyeOff } from 'react-feather';
import { Divider, message } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { userGoogleLogin, userSignIn, userFacebookLogin, userSignInOnChange } from '../redux/actions/userAction';
import Loading from '../components/Loading';
import SocialAuthButtons from '../components/SocialAuthButtons';

// config
message.config({
    top: '19vh',
    maxCount: 1,
});

const login = () => {
    const [passwordShown, setPasswordShown] = useState(false);

    const { register, handleSubmit, errors } = useForm();

    const router = useRouter();

    const { loading, userInfo, error } = useSelector(state => state.userAuth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (userInfo != undefined || userInfo != null) {
            if (router.query && router.query.redirect) {
                router.push(router.query.redirect);
            } else {
                router.push('/');
            }
        }
    }, [userInfo]);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const onSubmit = data => {
        dispatch(userSignIn(data.mobile, data.password));
    }

    const googleLogin = () => {
        dispatch(userGoogleLogin());
    }

    const facebookLogin = () => {
        dispatch(userFacebookLogin());
    }
    useEffect(() => {
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
            // auth error set not null after error display
            dispatch(userSignInOnChange());
        }

    }, [error]);

    return (
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                    <div className="d-flex justify-content-between">
                        <h3>Welcome Again, Please Login In</h3>
                        <div className="mt-1" style={{ fontSize: '1.2rem' }}>
                            New Member?
                            <Link href={{
                                pathname: '/register',
                                query: router.query,
                            }}>
                                <a className="text-info mr-1 ml-1">Register</a>
                            </Link>
                            here
                        </div>
                    </div>
                    <div className="d-block bg-white p-5 mt-5">
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="d-block">
                                <label>Mobile number</label>
                                <input type="number"
                                    name="mobile"
                                    className="form-control mt-1"
                                    autoComplete="off"
                                    placeholder="Please enter your mobile number"
                                    ref={register({
                                        required: true,
                                        minLength: 10,
                                        maxLength: 10
                                    })}
                                />
                                {errors.mobile && errors.mobile.type === "required" && (
                                    <p className="errorMsg">Please enter your mobile number</p>
                                )}
                                {errors.mobile && errors.mobile.type === "minLength" && (
                                    <p className="errorMsg">
                                        Invalid mobile number
                                    </p>
                                )}
                                {errors.mobile && errors.mobile.type === "maxLength" && (
                                    <p className="errorMsg">
                                        Invalid mobile number
                                    </p>
                                )}
                            </div>
                            <div className="d-block position-relative mt-4 pt-1">
                                <label>Password</label>
                                <input type={passwordShown ? "text" : "password"}
                                    name="password"
                                    className="form-control mt-1"
                                    placeholder="Please enter your password"
                                    autoComplete="off"
                                    ref={register({
                                        required: true
                                    })}
                                />
                                <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3.3rem', cursor: 'pointer' }}>
                                    {passwordShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                                {errors.password && errors.password.type === "required" && (
                                    <p className="errorMsg">Provide password</p>
                                )}
                            </div>
                            <div className="d-block mb-3 text-info fR">
                                <Link href="/user/forget-password">Forget Password?</Link>
                            </div>
                            <div className="d-block">
                                <button type="submit" className="btn btn-success btn-lg btn-block font16 mt-4 position-relative">
                                    {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('LOGIN IN')}

                                </button>
                            </div>
                            <Divider>OR</Divider>
                            <div className="d-block">
                                <SocialAuthButtons googleHandler={googleLogin} facebookHandler={facebookLogin} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
}

export async function getServerSideProps(context) {
    try {
        const { req } = context;
        const cookies = parseCookies(context);
        const { data } = await axios.get(`${process.env.api}/api/isuser`, {
            headers: {
                token: cookies.token,
            },
        });
        const redirectUrl = (req && req.query['redirect']) ? decodeURIComponent(req.query['redirect']) : '/'
        return {
            redirect: {
                destination: redirectUrl,
                permanent: false,
            },
            props: {}
        }
    } catch (err) {
        return {
            props: {},
        };
    }
}

export default login;
