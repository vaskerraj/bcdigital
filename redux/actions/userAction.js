import axiosApi from '../../helpers/api';
import firebase from '../../firebase/firebaseClient';
import {
    USER_SIGIN_RESPONSE,
    USER_SIGIN_SUCCESS,
    USER_SIGIN_ERROR,
    USER_SIGNOUT
}
    from '../types/userType'

export const userSignIn = (mobile, password) => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: { mobile, password } });

    try {
        const { data } = await axiosApi.post("api/login", { mobile, password });
        console.log(data);
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        dispatch({ type: USER_SIGIN_SUCCESS, payload: user });

    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }
}
export const userGoogleLogin = () => async (dispatch) => {
    dispatch({ type: USER_SIGIN_RESPONSE, payload: '' });
    try {
        const results = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
        const { user } = results;

        dispatch({ type: USER_SIGIN_SUCCESS, payload: user });

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

        dispatch({ type: USER_SIGIN_SUCCESS, payload: user });


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
    await firebase.auth().signOut();
}