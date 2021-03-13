import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Eye, EyeOff } from 'react-feather';
import { message } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import Loading from '../../components/Loading';
import { inputOnChange, signin } from '../../redux/actions/adminAuthAction';

// config
message.config({
    top: '19vh',
    maxCount: 1,
});

const AdminLogin = () => {
    const [email, setEmail] = useState('admin@bcdigital.com');
    const [password, setPassword] = useState('admin@123');
    const [passwordShown, setPasswordShown] = useState(false);

    const router = useRouter();

    const { loading, adminAuth, error } = useSelector(state => state.adminAuth);
    const dispatch = useDispatch();

    console.log(adminAuth);

    useEffect(() => {
        if (adminAuth != undefined || adminAuth != null) {
            router.push('/admin/');
            // dispatch(userSignOut());
        }
    }, [adminAuth]);

    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };

    const handleChangeInput = e => {
        const { name, value } = e.target
        if (name === 'email') {
            setEmail(value)
        } else if (name === 'password') {
            setPassword(value);
        }
        dispatch(inputOnChange());
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(signin(email, password));
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
                    <div className="d-block bg-white p-5 mt-5">
                        {error ? showErrorMessage(error.error) : null}
                        <form onSubmit={handleSubmit}>
                            <div className="d-block">
                                <label>Email Address</label>
                                <input type="text"
                                    name="email"
                                    className="form-control mt-1"
                                    value={email}
                                    onChange={handleChangeInput}
                                    autoComplete="off"
                                    placeholder="Please enter your email address"
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

export default AdminLogin;
