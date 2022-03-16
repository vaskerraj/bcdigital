import {
    DELIVERY_SIGIN_RESPONSE,
    DELIVERY_SIGIN_SUCCESS,
    DELIVERY_SIGIN_ERROR,
    DELIVERY_SIGNOUT,
    DELIVERY_SIGNUP_RESPONSE,
    DELIVERY_SIGNUP_SUCCESS,
    DELIVERY_SIGNUP_ERROR
}
    from '../types/deliveryAuthType';

const initialState = {
    deliveryAuth: null,
    regDeliveryInfo: null,
    loading: false,
    error: null
}

export const deliveryAuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case DELIVERY_SIGIN_RESPONSE:
            return {
                loading: true,
                deliveryAuth: null,
                error: null
            }
        case DELIVERY_SIGIN_SUCCESS:
            return {
                loading: false,
                deliveryAuth: action.payload,
                error: null
            }
        case DELIVERY_SIGIN_ERROR:
            return {
                loading: false,
                deliveryAuth: null,
                error: action.payload
            }
        case DELIVERY_SIGNOUT:
            return {};
        default: return state;
    }
}

export const signupReducer = (state = initialState, action) => {
    switch (action.type) {
        case DELIVERY_SIGNUP_RESPONSE:
            return {
                loading: true,
                regDeliveryInfo: null,
                error: null
            }
        case DELIVERY_SIGNUP_SUCCESS:
            return {
                loading: false,
                regDeliveryInfo: action.payload,
                error: null
            }
        case DELIVERY_SIGNUP_ERROR:
            return {
                loading: false,
                regDeliveryInfo: null,
                error: action.payload
            }
        default: return state;
    }
}