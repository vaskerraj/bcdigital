import Router from 'next/router';
import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    ADMIN_SIGIN_RESPONSE,
    ADMIN_SIGIN_SUCCESS,
    ADMIN_SIGIN_ERROR,
    ADMIN_SIGNOUT
}
    from '../types/adminAuthType'

export const inputOnChange = () => async (dispatch) => {
    dispatch({ type: ADMIN_SIGIN_ERROR, payload: null });
}

export const signin = (email, password) => async (dispatch) => {
    dispatch({ type: ADMIN_SIGIN_RESPONSE, payload: { email, password } });

    try {
        const { data } = await axiosApi.post("api/alogin", { email, password });
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        // set full name of auth at firebase displayName
        user.updateProfile({
            displayName: data.name,
            email: email
        });

        const token = await user.getIdToken(true);
        const dispatchData = {
            user: data.name,
            token
        }
        dispatch({ type: ADMIN_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        dispatch({ type: ADMIN_SIGIN_ERROR, payload: error.response.data });
    }
}

export const signout = () => async (dispatch) => {
    dispatch({ type: ADMIN_SIGNOUT });
    await firebase.auth().signOut().then(
        Router.push('/admin/login')
    );
}