import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'react-feather';
import { message, Affix, Button } from 'antd';

import { useForm } from "react-hook-form";

import { useSelector, useDispatch } from 'react-redux';
import { signUp, sellerInputOnChange } from '../../redux/actions/sellerAuthAction';
import { sendSMS } from '../../redux/actions/smsAction';
import Loading from '../../components/Loading';

// config
message.config({
    top: '19vh',
    maxCount: 1,
});


const RegisterSeller = () => {
    const [passwordShown, setPasswordShown] = useState(false);
    const [sendSMSDisable, setSendSMSDisable] = useState(false);
    const [smsSend, setSmsSend] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const { register, handleSubmit, errors } = useForm();

    const { loading: smsSendLoading, smsSendInfo, error: smsSendError } = useSelector(state => state.smsSender);
    const { loading, regSellerInfo, error } = useSelector(state => state.sellerRegister);


    const dispatch = useDispatch();

    //define router
    const router = useRouter();
    useEffect(() => {
        if (regSellerInfo != undefined || regSellerInfo != null) {
            if (router.query && router.query.redirect) {
                router.push(router.query.redirect);
            } else {
                router.push('/seller/login');
            }
        }
    }, [regSellerInfo]);

    const smsCodeHandler = (mobile) => {
        dispatch(sendSMS(mobile, 'seller_registration')); //mobile number & method
        setSendSMSDisable(true);
    }

    const onSubmit = data => {
        if (!data.verificationCode) {
            smsCodeHandler(data.mobile);
        } else {
            dispatch(signUp(data.shopname, data.mobile, data.verificationCode, data.password, data.email));
        }
    }

    useEffect(() => {
        if (smsSendInfo) setSmsSend(true);
    }, [smsSendInfo]);

    useEffect(() => {
        if (smsSendError) {
            setSendSMSDisable(false);
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
            dispatch(sellerInputOnChange());
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
            dispatch(sellerInputOnChange());
        }

    }, [smsSendError, error]);
    return (
        <>
            <Head>
                <title>Seller Register || BC Digital</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Affix>
                <div className="container-fluid" style={{ backgroundColor: '#fff', boxShadow: '0 1px 6px 0 rgb(32 33 36 / 28%)' }}>
                    <div className="container">
                        <div className="d-flex align-items-center justify-content-between" style={{ height: '7rem' }}>
                            <Link href="/">
                                <a className="d-block">
                                    <img src="/logo192.png" height="53px" />
                                </a>
                            </Link>
                        </div>
                    </div>
                </div>
            </Affix>
            <div className="container-fluid" style={{ backgroundColor: '#ed1b24' }}>
                <div className="container">
                    <div className="col">
                        <div className="row">
                            <div className="d-none d-md-block col-md-8 mt-md-5">
                                <h1 style={{ color: '#fff', fontSize: '3.8rem', fontWeight: 400 }}>
                                    Open your store for Free and<br /> Start your business with
                                    BC Digital.
                                </h1>
                                <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: 400 }}>
                                    Reach customers across Nepal and grow faster.
                                </h2>
                                <div className="d-block text-center">
                                    <Image src="/store.png"
                                        layout="responsive"
                                        width="300px"
                                        height="150px"
                                        className="mr-2"
                                    />
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-4 mt-md-5">
                                <div className="login-container">
                                    <div className="p-4">
                                        <div className="text-center">
                                            <h1 className="mt-2" style={{ fontWeight: 400 }}>Register to Seller Centre</h1>
                                        </div>
                                        <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                                            <div className="d-block">
                                                <label>Shop name</label>
                                                <input type="text" className="form-control mt-1"
                                                    name="shopname"
                                                    autoComplete="off"
                                                    autoCorrect="off"
                                                    placeholder="Shop name"
                                                    ref={register({
                                                        required: true
                                                    })}
                                                />
                                                {errors.shopname && errors.shopname.type === "required" && (
                                                    <p className="errorMsg">Please enter your shop name</p>
                                                )}
                                            </div>
                                            <div className="d-block mt-4">
                                                <label>Mobile number</label>
                                                <input type="number" className="form-control mt-1"
                                                    name="mobile"
                                                    autoComplete="off"
                                                    placeholder="Mobile number"
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
                                                        {smsSendLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Next')}
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
                                                        <label>Email address</label>
                                                        <input type="text" className="form-control mt-1"
                                                            name="email"
                                                            autoComplete="off"
                                                            placeholder="Email address"
                                                            ref={register({
                                                                required: true
                                                            })}
                                                        />
                                                        {errors.email && errors.email.type === "required" && (
                                                            <p className="errorMsg">Provide email address</p>
                                                        )}
                                                    </div>
                                                    <div className="d-block mt-4">
                                                        <button type="submit"
                                                            className="btn btn-success btn-lg btn-block font16 mt-4 position-relative"
                                                        >
                                                            {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Register')}
                                                        </button>
                                                    </div>
                                                </>

                                            }

                                            <div className="d-block text-center mt-5 mb-3">
                                                Already registered?
                                                <Link href="/seller/register">
                                                    <Button type="danger" shape="round" className="ml-2">Login</Button>
                                                </Link>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default RegisterSeller;
