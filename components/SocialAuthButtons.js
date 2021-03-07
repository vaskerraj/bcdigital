import React from 'react';
import { Facebook } from 'react-feather';
import GoogleIcon from './GoogleIcon';

const SocialAuthButtons = ({ googleHandler, facebookHandler }) => {
    return (
        <div>
            <button type="button" onClick={googleHandler} className="btn btn-danger btn-lg btn-block font16" style={{ marginTop: '1.5rem' }}>
                <GoogleIcon />
                <span className="ml-1">
                    Google
                </span>
            </button>
            <button onClick={facebookHandler} type="submit" className="btn btn-primary btn-lg btn-block font16" style={{ marginTop: '1.5rem' }}>
                <Facebook />
                Facebook
            </button>
        </div>
    );
}

export default SocialAuthButtons;
