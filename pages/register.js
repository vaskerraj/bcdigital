import React, { useState } from 'react';
import Link from 'next/link';

import { Eye, EyeOff } from 'react-feather';
import { Divider } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { userGoogleLogin, userFacebookLogin } from '../redux/actions/userAction';

import SocialAuthButtons from '../components/SocialAuthButtons';

const register = () => {
    const [fullname, setFullname] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const dispatch = useDispatch();

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    const googleLogin = () => {
        dispatch(userGoogleLogin());
    }

    const facebookLogin = () => {
        dispatch(userFacebookLogin());
    }

    return (
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                    <div class="d-flex justify-content-between">
                        <h3>Create Your Account</h3>
                        <div className="mt-1" style={{ fontSize: '1.2rem' }}>
                            Already Member?
                            <Link href="/login">
                                <a className="text-info mr-1 ml-1">Login</a>
                            </Link>
                            here
                        </div>
                    </div>
                    <div className="d-block bg-white p-5 mt-5">
                        <form autoComplete="new password" onSubmit={handleSubmit}>
                            <div className="d-block">
                                <label>Full Name</label>
                                <input type="text" className="form-control mt-1"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    autoComplete="off"
                                    autoCorrect="off"
                                    placeholder="Please enter your full name"
                                />
                            </div>
                            <div className="d-block mt-4">
                                <label>Mobile number</label>
                                <input type="text" className="form-control mt-1"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    autoComplete="off"
                                    placeholder="Please enter you mobile number"
                                />
                            </div>
                            <div className="d-block position-relative mt-4">
                                <label>Password</label>
                                <input type={passwordShown ? "text" : "password"} className="form-control mt-1"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3rem', cursor: 'pointer' }}>
                                    {passwordShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                            </div>
                            <div className="d-block mt-4">
                                <button type="submit" className="btn btn-success btn-lg btn-block font16 mt-4">SIGN UP</button>
                            </div>
                            <Divider>OR</Divider>
                            <div className="d-block">
                                <SocialAuthButtons googleHandler={googleLogin} facebookHandler={facebookLogin} />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default register;
