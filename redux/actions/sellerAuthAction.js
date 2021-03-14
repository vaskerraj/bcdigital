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

export const signin = (mobile, password) => async (dispatch) => {
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
            token
        }

        dispatch({ type: SELLER_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        dispatch({ type: SELLER_SIGIN_ERROR, payload: error.response.data });
    }
}
export const signout = () => async (dispatch) => {
    dispatch({ type: SELLER_SIGNOUT });
    await firebase.auth().signOut().then(
        Router.push('/seller/login')
    );
}