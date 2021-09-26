import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'react-feather';
import { message, Affix, Button } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { signin, sellerInputOnChange } from '../../redux/actions/sellerAuthAction';
import Loading from '../../components/Loading';

// config
message.config({
    top: '19vh',
    maxCount: 1,
});

const Login = () => {
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);

    const router = useRouter();

    const { loading, sellerAuth, error } = useSelector(state => state.sellerAuth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (sellerAuth != undefined || sellerAuth != null) {
            return router.push('./');
        }
    }, [sellerAuth]);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const handleChangeInput = e => {
        const { name, value } = e.target
        if (name === 'mobile') {
            setMobile(value)
        } else if (name === 'password') {
            setPassword(value);
        }
        dispatch(sellerInputOnChange());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(signin(mobile, password));
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
        })
    }
    return (
        <>
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
            <div className="container mt-5">
                <div className="col">
                    <div className="row">
                        <div className="d-none d-md-block col-md-8 mt-md-5">
                            <h1 style={{ fontSize: '3.8rem', fontWeight: 400 }}>
                                Open your store for Free and<br /> Start your business with
                                <span style={{ color: "#ed1b24" }}> BC Digital</span>.
                            </h1>
                            <h2 style={{ color: '#666', fontSize: '1.8rem', fontWeight: 400 }}>
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
                                        <h1 className="mt-2" style={{ fontWeight: 400 }}>Login to Seller Centre</h1>
                                    </div>
                                    {error ? showErrorMessage(error.error) : null}
                                    <form onSubmit={handleSubmit}>
                                        <div className="d-block">
                                            <label>Mobile number</label>
                                            <input type="text"
                                                name="mobile"
                                                className="form-control mt-1"
                                                value={mobile}
                                                onChange={handleChangeInput}
                                                autoComplete="off"
                                                placeholder="Please enter your mobile number"
                                            />
                                        </div>
                                        <div className="d-block position-relative mt-4 pt-1">
                                            <label>Password</label>
                                            <input type={passwordShown ? "text" : "password"}
                                                name="password"
                                                className="form-control mt-1"
                                                value={password}
                                                onChange={handleChangeInput}
                                                placeholder="Please enter your password"
                                                autoComplete="off"
                                            />
                                            <i onClick={togglePasswordVisiblity} style={{ position: 'absolute', right: '1rem', top: '3.3rem', cursor: 'pointer' }}>
                                                {passwordShown ? (<EyeOff />) : (<Eye />)}
                                            </i>
                                        </div>
                                        <div className="d-block mb-3 text-info fR">
                                            <Link href="/user/forget-password">Forget Password?</Link>
                                        </div>
                                        <div className="d-block">
                                            <button type="submit" className="btn btn-success btn-lg btn-block font16 mt-4 position-relative">
                                                {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('LOGIN IN')}
                                            </button>
                                        </div>
                                        <div className="d-block text-center mt-5 mb-3">
                                            Not registered yet?
                                            <Link href="/seller/register">
                                                <Button type="danger" shape="round" className="ml-2">Register Now</Button>
                                            </Link>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Login;
