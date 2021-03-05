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

    } catch (error) {
        dispatch({ type: USER_SIGIN_ERROR, payload: error.message });
    }
}

export const userSignOut = () => (dispatch) => {
    dispatch({ type: USER_SIGNOUT });
}