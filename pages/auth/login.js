import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff, Facebook } from 'react-feather';
import { Divider } from 'antd';
import GoogleIcon from '../../components/GoogleIcon';


import { useSelector, useDispatch } from 'react-redux';
import { userSignIn } from '../../redux/actions/userAction';

const login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);

    const router = useRouter();
    console.log(router);

    const { loading, userInfo, error } = useSelector(state => state.userAuth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (userInfo) {
            console.log("url redirect");
        }
    }, [userInfo]);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(userSignIn(mobile, password));
    }

    return (
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                    <div class="d-flex justify-content-between">
                        <h3>Welcome Again, Please Login In</h3>
                        <div className="mt-1" style={{ fontSize: '1.2rem' }}>
                            New Member?
                            <Link href="/auth/register" as="/register">
                                <a className="text-info mr-1 ml-1">Register</a>
                            </Link>
                            here
                        </div>
                    </div>
                    <div className="d-block bg-white p-5 mt-5">
                        <form onSubmit={handleSubmit}>
                            <div className="d-block">
                                <label>Mobile number</label>
                                <input type="text" className="form-control mt-1"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    autoComplete="off"
                                    placeholder="Please enter your mobile number"
                                />
                            </div>
                            <div className="d-block position-relative mt-4 pt-1">
                                <label>Password</label>
                                <input type={passwordShown ? "text" : "password"} className="form-control mt-1"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Please enter your password"
                                />
                                <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3.3rem', cursor: 'pointer' }}>
                                    {passwordShown ? (<EyeOff />) : (<Eye />)}
                                </i>
                            </div>
                            <div className="d-block mb-3 text-info fR">
                                <Link href="">Forget Password?</Link>
                            </div>
                            <div className="d-block">
                                <button type="submit" className="btn btn-success btn-lg btn-block font16 mt-4">LOGIN IN</button>
                            </div>
                            <Divider>OR</Divider>
                            <div className="d-block">
                                <button type="submit" className="btn btn-primary btn-lg btn-block font16">
                                    <Facebook />
                                    Facebook
                                </button>
                                <button type="submit" className="btn btn-danger btn-lg btn-block font16" style={{ marginTop: '1.5rem' }}>
                                    <GoogleIcon />
                                    <span className="ml-1">
                                        Google
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div >
    );
}

export default login;
