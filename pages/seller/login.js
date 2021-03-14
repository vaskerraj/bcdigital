import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'react-feather';
import { message } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { signin, sellerInputOnChange } from '../../redux/actions/sellerAuthAction';
import Loading from '../../components/Loading';

// config
message.config({
    top: '19vh',
    maxCount: 1,
});

const login = () => {
    const [mobile, setMobile] = useState('9840603614');
    const [password, setPassword] = useState('test123');
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
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '450px' }}>
                    <div className="d-flex justify-content-between">
                        <h3>Welcome Again, Please Login In</h3>
                        <div className="mt-1" style={{ fontSize: '1.2rem' }}>
                            New Member?
                            <Link href="/register">
                                <a className="text-info mr-1 ml-1">Register</a>
                            </Link>
                            here
                        </div>
                    </div>
                    <div className="d-block bg-white p-5 mt-5">
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
                                <Link href="">Forget Password?</Link>
                            </div>
                            <div className="d-block">
                                <button type="submit" className="btn btn-success btn-lg btn-block font16 mt-4 position-relative">
                                    {loading ? <Loading color="#fff" style={{ padding: '1.2rem' }} /> : ('LOGIN IN')}
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
