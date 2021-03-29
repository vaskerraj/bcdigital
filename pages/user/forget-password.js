import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';

import { useForm } from 'react-hook-form';

import { Eye, EyeOff } from 'react-feather';
import { message } from 'antd';

import { sendSMS } from '../../redux/actions/smsAction';
import { recoverPassword } from '../../redux/actions/authPsdAction';
import Loading from '../../components/Loading';

// config antdesign message
message.config({
    top: '19vh',
    maxCount: 1,
    duration: 4,
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

    const { register, handleSubmit, errors, watch } = useForm();


    const dispatch = useDispatch();

    const { loading: smsSendLoading, smsSendInfo, error: smsSendError } = useSelector(state => state.smsSender);
    const { loading, recoverPsd, error } = useSelector(state => state.recoverPsd);
    useEffect(() => {
        if (recoverPsd != undefined || recoverPsd != null) {
            message.success({
                content: (
                    <div>
                        <div className="font-weight-bold">Success</div>
                        Password succesffuly recovered. Please use new password and login.
                    </div>
                ),
                className: 'message-success',
            });
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        }
    }, [recoverPsd]);

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
        }

    }, [smsSendError, error]);

    const smsCodeHandler = (mobile) => {
        dispatch(sendSMS(mobile, 'password_recover')); // mobile number & method
        setSendSMSDisable(true);
    }

    const onNumberChange = () => {
        setSendSMSDisable(false);
        setSmsSend(false);
    }

    const onSubmit = data => {
        if (!data.verificationCode) {
            smsCodeHandler(data.mobile);
        } else {
            dispatch(recoverPassword(data.mobile, data.verificationCode, data.password, 'password_recover', 'subscriber'));
            // mobile: username , verification code, new password, method(to check sms) & role(to update password base on role)
            // Note : same mobile number can be use as seller and subscriber so have to pass role
        }
    }
    return (
        <div>
            <Head>
                <title>Forget Password ?</title>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="p-4">
                <div className="row">
                    <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                        <div className="d-flex justify-content-between">
                            <h3>Forget Password ?</h3>
                        </div>
                        <div className="d-block bg-white p-5 mt-5">
                            <form autoComplete="new password" onSubmit={handleSubmit(onSubmit)}>
                                <div className="d-block position-relative">
                                    <label>Mobile number</label>
                                    <input
                                        name="mobile"
                                        type="number"
                                        className={`form-control ${smsSend ? 'disabled' : null}`}
                                        placeholder="Please enter your mobile number"
                                        ref={register({
                                            required: "Please enter your mobile number",
                                            minLength: {
                                                value: 10,
                                                message: "Invalid mobile number"
                                            },
                                            maxLength: {
                                                value: 10,
                                                message: "Invalid mobile number"
                                            }
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

                                    {errors.mobile && <p className="errorMsg">{errors.mobile.message}</p>}
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
                                                name="newpassword"
                                                ref={register({
                                                    required: "Provide password",
                                                    pattern: {
                                                        value: /^(?=.*\d)(?=.*[a-z])(?=.*[a-zA-Z]).{5,}$/i,
                                                        message: "Password should contain letter and number"
                                                    },
                                                    minLength: {
                                                        value: 5,
                                                        message: "Password must be atleast 5 characters"
                                                    }
                                                })}
                                            />
                                            <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3rem', cursor: 'pointer' }}>
                                                {passwordShown ? (<EyeOff />) : (<Eye />)}
                                            </i>
                                            {errors.newpassword && <p className="errorMsg">{errors.newpassword.message}</p>}
                                        </div>
                                        <div className="d-block position-relative mt-4 mb-5">
                                            <label>Confirm New Password</label>
                                            <input
                                                type={passwordMatchShown ? "text" : "password"}
                                                name="password"
                                                className="form-control"
                                                ref={register({
                                                    required: 'Provide password',
                                                    validate: (value) => value === watch('newpassword') || "The passwords do not match"
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
                                                {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('REST PASSWORD')}
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
