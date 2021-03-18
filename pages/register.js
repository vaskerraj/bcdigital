import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

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
    const [fullname, setFullname] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const [sendSMSDisable, setSendSMSDisable] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };
    const dispatch = useDispatch();

    const { loading: smsSendLoading, smsSendInfo, error: smsSendError } = useSelector(state => state.smsSender);

    const { loading, regUserInfo, error } = useSelector(state => state.userRegister);

    //definde router
    const router = useRouter();
    useEffect(() => {
        if (regUserInfo) {
            //    router redirect/push
        }
    }, [regUserInfo]);

    const handleChangeInput = e => {
        const { name, value } = e.target
        if (name === 'fullname') {
            setFullname(value)
        }
        else if (name === 'mobile') {
            setMobile(value)
        } else if (name === 'password') {
            setPassword(value);
        } else if (name === 'verificationCode') {
            setVerificationCode(value);
        }
        dispatch(userSignUpOnChange());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(userSignUp(fullname, mobile, verificationCode, password));
    }

    const smsCodeHandler = () => {
        setSendSMSDisable(true);
        dispatch(sendSMS(mobile));
    }
    useEffect(() => {
        if (smsSendError) setSendSMSDisable(false);
    }, [smsSendError]);


    const googleLogin = () => {
        dispatch(userGoogleLogin());
    }

    const facebookLogin = () => {
        dispatch(userFacebookLogin());
    }

    const showErrorMessage = (err) => {
        message.warning({
            content: (
                <div>
                    <div className="font-weight-bold">Error</div>
                    {err}
                </div>
            ),
            className: 'message-warning',
        });
        // auth error set not null after error display
        dispatch(userSignUpOnChange());
    }

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
                        {smsSendError ? showErrorMessage(smsSendError.error) : null}
                        {error ? showErrorMessage(error.error) : null}
                        <form autoComplete="new password" onSubmit={handleSubmit}>
                            <div className="d-block">
                                <label>Full Name</label>
                                <input type="text" className="form-control mt-1"
                                    name="fullname"
                                    value={fullname}
                                    onChange={handleChangeInput}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    placeholder="Please enter your full name"
                                />
                            </div>
                            <div className="d-block mt-4">
                                <label>Mobile number</label>
                                <input type="text" className="form-control mt-1"
                                    name="mobile"
                                    value={mobile}
                                    onChange={handleChangeInput}
                                    autoComplete="off"
                                    placeholder="Please enter you mobile number"
                                />
                            </div>
                            {
                                !smsSendInfo
                                    ?
                                    (
                                        <div className="d-block mt-4">
                                            <button type="button"
                                                onClick={smsCodeHandler}
                                                disabled={sendSMSDisable}
                                                className="btn btn-info btn-lg btn-block font16 position-relative"
                                            >
                                                {smsSendLoading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('Send SMS Code & Sign Up')}
                                            </button>
                                        </div>
                                    )
                                    :
                                    null
                            }
                            {
                                smsSendInfo
                                    ?
                                    (
                                        <>
                                            <div className="d-block mt-4">
                                                <label>Verification code</label>
                                                <input type="text" className="form-control mt-1"
                                                    name="verificationCode"
                                                    value={verificationCode}
                                                    onChange={handleChangeInput}
                                                    autoComplete="off"
                                                    placeholder="SMS Verfication Code"
                                                />
                                            </div>
                                            <div className="d-block position-relative mt-4">
                                                <label>Password</label>
                                                <input
                                                    type={passwordShown ? "text" : "password"}
                                                    className="form-control mt-1"
                                                    name="password"
                                                    value={password}
                                                    onChange={handleChangeInput}
                                                />
                                                <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3rem', cursor: 'pointer' }}>
                                                    {passwordShown ? (<EyeOff />) : (<Eye />)}
                                                </i>
                                            </div>
                                            <div className="d-block mt-4">
                                                <button type="submit"
                                                    className="btn btn-success btn-lg btn-block font16 mt-4 position-relative"
                                                >
                                                    {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('SIGN UP')}
                                                </button>
                                            </div>
                                        </>
                                    ) :
                                    null
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

export default register;
