import Router from 'next/router';
import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    USER_SIGIN_RESPONSE,
    USER_SIGIN_SUCCESS,
    USER_SIGIN_ERROR,
    USER_SIGNOUT,
    USER_SIGNUP_RESPONSE,
    USER_SIGNUP_SUCCESS,
    USER_SIGNUP_ERROR,
    USER_SIGNUP_SIGNOUT,
}
    from '../types/userType';
import { SMS_SEND_ERROR } from '../types/smsType';

export const userSignInOnChange = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_ERROR, payload: null });
}

export const userSignIn = (mobile, password) => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: { mobile, password } });

    try {
        const { data } = await axiosApi.post("api/login", { mobile, password });
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;

        const token = await user.getIdToken(true);
        const dispatchData = {
            user: data.name,
            token
        }
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: USER_SIGIN_ERROR, payload: d_error });
    }
}
export const userGoogleLogin = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: '' });
    try {
        const results = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const { user } = results;

        const token = await user.getIdToken(true);

        // get user is new or existing
        const isNewUserOrNot = results.additionalUserInfo.isNewUser;

        const phoneNumber = null;

        await axiosApi.post('/api/social', { isNewUser: isNewUserOrNot, phoneNumber },
            {
                headers: {
                    token
                }
            }
        )
        const dispatchData = {
            user: data.name,
            token
        }
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });


    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }
}

export const userFacebookLogin = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: '' });
    try {
        const results = await firebase.auth().signInWithPopup(new firebase.auth.FacebookAuthProvider());
        console.log(results);
        const { user } = results;

        const token = await user.getIdToken(true);

        // get user is new or existing
        const isNewUserOrNot = results.additionalUserInfo.isNewUser;

        //set for fb account by mobile number
        const phoneNumber = results.user.phoneNumber;
        await axiosApi.post('/api/social', { isNewUser: isNewUserOrNot, phoneNumber },
            {
                headers: {
                    token
                }
            }
        )
        const dispatchData = {
            user: data.name,
            token
        }
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });
    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }

}

export const userSignOut = () => async (dispatch) => {
    dispatch({ type: USER_SIGNOUT });
    dispatch({ type: USER_SIGNUP_SIGNOUT });
    await firebase.auth().signOut().then(
        Router.push('/')
    );
}

export const userSignUpOnChange = () => async (dispatch) => {
    dispatch({ type: USER_SIGNUP_ERROR, payload: null });
    dispatch({ type: SMS_SEND_ERROR, payload: null });
}

export const userSignUp = (fullname, mobile, verificationCode, password) => async (dispatch) => {
    dispatch({ type: USER_SIGNUP_RESPONSE, payload: { mobile } });

    try {
        const { data } = await axiosApi.post("api/signup", { fullname, mobile, verificationCode, password });

        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        // set full name of auth at firebase displayName
        user.updateProfile({
            displayName: data.name,
        });
        const token = await user.getIdToken(true);
        const dispatchData = {
            user: data.name,
            token
        }
        // auto sign in after sign up
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });

        dispatch({ type: USER_SIGNUP_SUCCESS, payload: dispatchData });

    } catch (error) {
        const d_error = error.response.data ? error.response.data : error.message;
        dispatch({ type: USER_SIGNUP_ERROR, payload: d_error });
    }
}