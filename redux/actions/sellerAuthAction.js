import Router from 'next/router';
import { destroyCookie, setCookie } from 'nookies';
import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    SELLER_SIGIN_RESPONSE,
    SELLER_SIGIN_SUCCESS,
    SELLER_SIGIN_ERROR,
    SELLER_SIGNOUT
}
    from '../types/sellerAuthType'

export const sellerInputOnChange = () => async (dispatch) => {
    dispatch({ type: SELLER_SIGIN_ERROR, payload: null });
}

export const signin = (mobile, password, platform) => async (dispatch) => {
    dispatch({ type: SELLER_SIGIN_RESPONSE, payload: { mobile, password } });

    try {
        const { data } = await axiosApi.post("api/sellerlogin", { mobile, password });
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        // set full name of auth at firebase displayName
        user.updateProfile({
            displayName: data.name
        });

        const token = await user.getIdToken(true);
        const dispatchData = {
            user: data.name,
            picture: data.picture,
            token
        }

        if (platform) {
            localStorage.setItem('authUser', JSON.stringify({ mobile, password }));
        }

        dispatch({ type: SELLER_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        dispatch({ type: SELLER_SIGIN_ERROR, payload: error.response.data });
    }
}

export const signUp = (name, mobile, verificationCode, password, email) => async (dispatch) => {
    dispatch({ type: SELLER_SIGNUP_RESPONSE, payload: { mobile } });

    try {
        const { data } = await axiosApi.post("api/seller/register", { name, mobile, verificationCode, password, email, registerMethod: 'web' });

        dispatch({ type: SELLER_SIGNUP_SUCCESS, payload: { data } });

    } catch (error) {
        const d_error = error.response.data ? error.response.data : error.message;
        dispatch({ type: SELLER_SIGNUP_ERROR, payload: d_error });
    }
}

export const signout = (platform) => async (dispatch) => {
    dispatch({ type: SELLER_SIGNOUT });
    if (platform === 'mobile') {
        localStorage.removeItem('authUser');
        await firebase.auth().signOut().then(
            Router.push('/seller/mobile/login')
        );
    } else
        await firebase.auth().signOut().then(
            Router.push('/seller/login')
        );
}