import {
    SELLER_SIGIN_RESPONSE,
    SELLER_SIGIN_SUCCESS,
    SELLER_SIGIN_ERROR,
    SELLER_SIGNOUT,
    SELLER_SIGNUP_RESPONSE,
    SELLER_SIGNUP_SUCCESS,
    SELLER_SIGNUP_ERROR
}
    from '../types/sellerAuthType';

const initialState = {
    sellerAuth: null,
    regSellerInfo: null,
    loading: false,
    error: null
}

export const sellerAuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case SELLER_SIGIN_RESPONSE:
            return {
                loading: true,
                sellerAuth: null,
                error: null
            }
        case SELLER_SIGIN_SUCCESS:
            return {
                loading: false,
                sellerAuth: action.payload,
                error: null
            }
        case SELLER_SIGIN_ERROR:
            return {
                loading: false,
                sellerAuth: null,
                error: action.payload
            }
        case SELLER_SIGNOUT:
            return {};
        default: return state;
    }
}

export const signupReducer = (state = initialState, action) => {
    switch (action.type) {
        case SELLER_SIGNUP_RESPONSE:
            return {
                loading: true,
                regSellerInfo: null,
                error: null
            }
        case SELLER_SIGNUP_SUCCESS:
            return {
                loading: false,
                regSellerInfo: action.payload,
                error: null
            }
        case SELLER_SIGNUP_ERROR:
            return {
                loading: false,
                regSellerInfo: null,
                error: action.payload
            }
        default: return state;
    }
}