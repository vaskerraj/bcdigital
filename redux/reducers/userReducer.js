import {
    USER_SIGIN_RESPONSE,
    USER_SIGIN_SUCCESS,
    USER_SIGIN_ERROR,
    USER_SIGNOUT,
    USER_SIGNUP_RESPONSE,
    USER_SIGNUP_SUCCESS,
    USER_SIGNUP_ERROR,
    USER_SIGNUP_SIGNOUT,
    SMS_SEND_RESPONSE,
    SMS_SEND_SUCCESS,
    SMS_SEND_ERROR

}
    from '../types/userType';

const initialState = {
    userInfo: null,
    smsSendInfo: null,
    regUserInfo: null,
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

export const signupReducer = (state = initialState, action) => {
    switch (action.type) {
        case USER_SIGNUP_RESPONSE:
            return {
                loading: true,
                regUserInfo: null,
                error: null
            }
        case USER_SIGNUP_SUCCESS:
            return {
                loading: false,
                regUserInfo: action.payload,
                error: null
            }
        case USER_SIGNUP_ERROR:
            return {
                loading: false,
                regUserInfo: null,
                error: action.payload
            }
        case USER_SIGNUP_SIGNOUT:
            return {}
        default: return state;
    }
}