import React, { useState } from 'react';

import { Eye, EyeOff } from 'react-feather';

const register = () => {
    const [fullname, setFullname] = useState('');
    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [passwordShown, setPasswordShown] = useState(false);
    const togglePasswordVisiblity = () => {
        setPasswordShown(passwordShown ? false : true);
    };
    const handleSubmit = () => {

    }
    const style = {
        passwordToggle: {
            position: 'absolute',
            top: '38 %',
            right: '16 %'
        }
    }
    return (
        <div className="p-4">
            <div className="row">
                <div className="mx-auto my-4" style={{ maxWidth: '500px' }}>
                    <h3>Create your account</h3>
                    <div className="d-block bg-white p-5 mt-5">
                        <form autoComplete="new password" onSubmit={handleSubmit}>
                            <div className="d-block">
                                <label>Full Name</label>
                                <input type="text" className="form-control mt-1"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    autoComplete="off"
                                    autoCorrect="off"
                                />
                            </div>
                            <div className="d-block mt-4">
                                <label>Mobile number</label>
                                <input type="text" className="form-control mt-1"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    autoComplete="off"
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
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default register;
