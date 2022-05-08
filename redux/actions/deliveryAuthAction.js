import Router from 'next/router';
import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    DELIVERY_SIGIN_RESPONSE,
    DELIVERY_SIGIN_SUCCESS,
    DELIVERY_SIGIN_ERROR,
    DELIVERY_SIGNOUT,
    DELIVERY_SIGNUP_RESPONSE,
    DELIVERY_SIGNUP_SUCCESS,
    DELIVERY_SIGNUP_ERROR
}
    from '../types/deliveryAuthType'

export const inputOnChange = () => async (dispatch) => {
    dispatch({ type: DELIVERY_SIGIN_ERROR, payload: null });
}

export const signin = (email, password, platform) => async (dispatch) => {
    dispatch({ type: DELIVERY_SIGIN_RESPONSE, payload: { email, password } });

    try {
        const { data } = await axiosApi.post("/api/delivery/login", { email, password });
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        // set full name of auth at firebase displayName
        user.updateProfile({
            displayName: data.name
        });

        const token = await user.getIdToken(true);
        const dispatchData = {
            user: data.name,
            deliveryRole: data.deliveryRole,
            token
        }

        if (platform) {
            localStorage.setItem('authDeliveryUser', JSON.stringify({ email, password }));
        }

        dispatch({ type: DELIVERY_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        const d_error = error.response.data ? error.response.data : error.message;
        dispatch({ type: DELIVERY_SIGIN_ERROR, payload: d_error });
    }
}

export const signUp = (name, password, email, deliveryRole) => async (dispatch) => {
    dispatch({ type: DELIVERY_SIGNUP_RESPONSE, payload: { email } });

    try {
        const { data } = await axiosApi.post("/api/delivery/register", { name, password, email, deliveryRole, registerMethod: 'web' });

        dispatch({ type: DELIVERY_SIGNUP_SUCCESS, payload: { data } });

    } catch (error) {
        const d_error = error.response.data ? error.response.data : error.message;
        dispatch({ type: DELIVERY_SIGNUP_ERROR, payload: d_error });
    }
}

export const signout = (platform) => async (dispatch) => {
    dispatch({ type: DELIVERY_SIGNOUT });
    if (platform === 'mobile') {
        localStorage.removeItem('authDeliveryUser');
        await firebase.auth().signOut().then(
            Router.push('/delivery/mobile/login')
        );
    } else
        await firebase.auth().signOut().then(
            Router.push('/delivery/login')
        );
}