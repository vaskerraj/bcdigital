import productApi from '../../helpers/api';
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
        const { data } = await productApi.post("api/login", { mobile, password });
        const result = await firebase.auth().signInWithCustomToken(data.token);

        const { user } = result;
        dispatch({ type: USER_SIGIN_SUCCESS, payload: user });

    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }
}

export const userSignOut = () => (dispatch) => {
    dispatch({ type: USER_SIGNOUT });
    await firebase.auth().signOut();
}