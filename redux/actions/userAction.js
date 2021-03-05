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
        const { user } = await firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());

        dispatch({ type: USER_SIGIN_SUCCESS, payload: user });

        const token = await user.getIdToken(true);
        // console.log(token)
        await axiosApi.post('/api/social', {},
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