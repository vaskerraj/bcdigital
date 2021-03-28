import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { useForm } from 'react-hook-form';

import { Eye, EyeOff } from 'react-feather';
import { message } from 'antd';

import { sendSMS } from '../../redux/actions/smsAction';
import Loading from '../../components/Loading';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
});

const forgetPassword = () => {
    const [sendSMSDisable, setSendSMSDisable] = useState(false);
    const [smsSend, setSmsSend] = useState(false);
    const [passwordShown, setPasswordShown] = useState(false);
    const [passwordMatchShown, setPasswordMatchShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
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
    password.current = watch("password", "");

    const dispatch = useDispatch();

    const { loading: smsSendLoading, smsSendInfo, error: smsSendError } = useSelector(state => state.smsSender);

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
        }

    }, [smsSendError]);

    const smsCodeHandler = (mobile) => {
        dispatch(sendSMS(mobile, 'password_recover')); // mobile number & method
        setSendSMSDisable(true);
    }

    const onNumberChange = () => {
        setSendSMSDisable(false);
        setSmsSend(false);
    }

    const onSubmit = data => {
        // new password logic
    }
    return (
        <div>
            <Head>
                <title>Forget Password?</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="p-4">
                <div className="row">
                    <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                        <div className="d-flex justify-content-between">
                            <h3>Forget Password?</h3>
                        </div>
                        <div className="d-block bg-white p-5 mt-5">
                            <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                                <div className="d-block position-relative">
                                    <label>Mobile number</label>
                                    <input
                                        name="mobile"
                                        className="form-control"
                                        placeholder="Please enter your mobile number"
                                        disabled={smsSend ? true : false}
                                        ref={register({
                                            required: true,
                                            minLength: 10,
                                            maxLength: 10
                                        })}
                                    />
                                    {smsSend &&
                                        <span onClick={onNumberChange}
                                            className="text-info"
                                            style={{
                                                position: 'absolute',
                                                right: '1rem',
                                                top: '3rem',
                                                cursor: 'pointer'
                                            }}>
                                            CHANGE
                                        </span>
                                    }
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
                                    <div className="d-block mt-4 mb-3">
                                        <button type="submit"
                                            disabled={sendSMSDisable}
                                            className="btn btn-info btn-lg btn-block font16 position-relative"
                                        >
                                            {smsSendLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Send SMS Code & Continue')}
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
                                            <label>New Password</label>
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
                                        <div className="d-block position-relative mt-4 mb-5">
                                            <lable>Confirm New Password</lable>
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
                                            <i onClick={togglePasswordMatchVisiblity} style={{ position: 'absolute', right: '1rem', top: '3rem', cursor: 'pointer' }}>
                                                {passwordMatchShown ? (<EyeOff />) : (<Eye />)}
                                            </i>
                                            {errors.password && <p className="errorMsg">{errors.password.message}</p>}
                                        </div>
                                        <div className="d-block mt-4">
                                            <button type="submit"
                                                className="btn btn-success btn-lg btn-block font16 mt-4 position-relative"
                                            >
                                                REST PASSWORD
                                                {/* {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('REST PASSWORD')} */}
                                            </button>
                                        </div>
                                    </>
                                }
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default forgetPassword;
