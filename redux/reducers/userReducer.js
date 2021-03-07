import {
    USER_SIGIN_RESPONSE,
    USER_SIGIN_SUCCESS,
    USER_SIGIN_ERROR,
    USER_SIGNOUT
}
    from '../types/userType';

const initialState = {
    userInfo: null,
    loading: false,
    error: null
}

export const signinReducer = (state = initialState, action) => {
    switch (action.type) {
        case USER_SIGIN_RESPONSE:
            return {
                loading: true,
                userInfo: null,
                error: null
            }
        case USER_SIGIN_SUCCESS:
            return {
                loading: false,
                userInfo: action.payload,
                error: null
            }
        case USER_SIGIN_ERROR:
            return {
                loading: false,
                userInfo: null,
                error: action.payload
            }
        case USER_SIGNOUT:
            return {};
        default: return state;
    }
}