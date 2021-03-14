import Router from 'next/router';
import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    USER_SIGIN_RESPONSE,
    USER_SIGIN_SUCCESS,
    USER_SIGIN_ERROR,
    USER_SIGNOUT
}
    from '../types/userType'

export const userSignInOnChange = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_ERROR, payload: null });
}

export const userSignIn = (mobile, password) => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: { mobile, password } });

    try {
        const { data } = await axiosApi.post("api/login", { mobile, password });
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
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });

    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.response.data });
    }
}
export const userGoogleLogin = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: '' });
    try {
        const results = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const { user } = results;


        const token = await user.getIdToken(true);

        const dispatchData = {
            user: data.name,
            token
        }

        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });

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

        const dispatchData = {
            user: data.name,
            token
        }
        dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData });

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
    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }

}

export const userSignOut = () => async (dispatch) => {
    dispatch({ type: USER_SIGNOUT });
    await firebase.auth().signOut().then(
        Router.push('/')
    );
}