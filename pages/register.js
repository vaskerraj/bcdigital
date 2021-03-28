import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { useForm } from "react-hook-form";

import { parseCookies } from 'nookies';
import axios from 'axios';

import { Eye, EyeOff } from 'react-feather';
import { Divider, message } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { userSignUpOnChange, userGoogleLogin, userFacebookLogin, sendSMS, userSignUp } from '../redux/actions/userAction';

import SocialAuthButtons from '../components/SocialAuthButtons';
import Loading from '../components/Loading';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
});

const register = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const [sendSMSDisable, setSendSMSDisable] = useState(false);
    const [smsSend, setSmsSend] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const { register, handleSubmit, errors } = useForm();

    const { loading: smsSendLoading, smsSendInfo, error: smsSendError } = useSelector(state => state.smsSender);

    const { loading, regUserInfo, error } = useSelector(state => state.userRegister);

    const dispatch = useDispatch();

    //define router
    const router = useRouter();
    useEffect(() => {
        if (regUserInfo != undefined || regUserInfo != null) {
            if (router.query && router.query.redirect) {
                router.push(router.query.redirect);
            } else {
                router.push('/user/');
            }
        }
    }, [regUserInfo]);

    const smsCodeHandler = (mobile) => {
        dispatch(sendSMS(mobile));
        setSendSMSDisable(true);
    }

    const onSubmit = data => {
        if (!data.verificationCode) {
            smsCodeHandler(data.mobile);
        } else {
            dispatch(userSignUp(data.fullname, data.mobile, data.verificationCode, data.password));
        }
    }

    useEffect(() => {
        if (smsSendInfo) setSmsSend(true);
    }, [smsSendInfo]);

    const googleLogin = () => {
        dispatch(userGoogleLogin());
    }

    const facebookLogin = () => {
        dispatch(userFacebookLogin());
    }

    useEffect(() => {
        if (smsSendError) {
            setSendSMSDisable(true);
            message.warning({
                content: (
                    <div>
                        <div className="font-weight-bold">Error</div>
                        {smsSendError.error}
                    </div>
                ),
                className: 'message-warning',
            });
            // auth error set not null after error display
            dispatch(userSignUpOnChange());
        }

        if (error) {
            setSendSMSDisable(false);
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
            dispatch(userSignUpOnChange());
        }

    }, [smsSendError, error]);
    return (
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                    <div className="d-flex justify-content-between">
                        <h3>Create Your Account</h3>
                        <div className="mt-1" style={{ fontSize: '1.2rem' }}>
                            Already Member?
                            <Link href={{
                                pathname: '/login',
                                query: router.query,
                            }}>
                                <a className="text-info mr-1 ml-1">Login</a>
                            </Link>
                            here
                        </div>
                    </div>
                    <div className="d-block bg-white p-5 mt-5">
                        <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                            <div className="d-block">
                                <label>Full Name</label>
                                <input type="text" className="form-control mt-1"
                                    name="fullname"
                                    autoComplete="off"
                                    autoCorrect="off"
                                    placeholder="Please enter your full name"
                                    ref={register({
                                        required: true
                                    })}
                                />
                                {errors.fullname && errors.fullname.type === "required" && (
                                    <p className="errorMsg">Please enter your full name</p>
                                )}
                            </div>
                            <div className="d-block mt-4">
                                <label>Mobile number</label>
                                <input type="number" className="form-control mt-1"
                                    name="mobile"
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
                            {
                                !smsSend &&
                                <div className="d-block mt-4">
                                    <button type="submit"
                                        disabled={sendSMSDisable}
                                        className="btn btn-info btn-lg btn-block font16 position-relative"
                                    >
                                        {smsSendLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Send SMS Code & Sign Up')}
                                    </button>
                                </div>

                            }
                            {
                                smsSend &&
                                <>
                                    <div className="d-block mt-4">
                                        <label>Verification code</label>
                                        <input type="text" className="form-control mt-1"
                                            name="verificationCode"
                                            autoComplete="off"
                                            placeholder="SMS Verfication Code"
                                            ref={register({
                                                required: true
                                            })}
                                        />
                                        {errors.verificationCode && errors.verificationCode.type === "required" && (
                                            <p className="errorMsg">Provide SMS Verfication code</p>
                                        )}
                                    </div>
                                    <div className="d-block position-relative mt-4">
                                        <label>Password</label>
                                        <input
                                            type={passwordShown ? "text" : "password"}
                                            className="form-control mt-1"
                                            name="password"
                                            ref={register({
                                                required: true,
                                                pattern: /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{5,}$/i,
                                                minLength: 5
                                            })}
                                        />
                                        <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3rem', cursor: 'pointer' }}>
                                            {passwordShown ? (<EyeOff />) : (<Eye />)}
                                        </i>

                                        {errors.password && errors.password.type === "required" && (
                                            <p className="errorMsg">Provide password</p>
                                        )}
                                        {errors.password && errors.password.type === "minLength" && (
                                            <p className="errorMsg">
                                                Password must be atleast 5 characters
                                            </p>
                                        )}
                                        {errors.password && errors.password.type === "pattern" && (
                                            <p className="errorMsg">
                                                Password should contain letter and number
                                            </p>
                                        )}
                                    </div>
                                    <div className="d-block mt-4">
                                        <button type="submit"
                                            className="btn btn-success btn-lg btn-block font16 mt-4 position-relative"
                                        >
                                            {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('SIGN UP')}
                                        </button>
                                    </div>
                                </>

                            }
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

export default register;
