import {
    SELLER_SIGIN_RESPONSE,
    SELLER_SIGIN_SUCCESS,
    SELLER_SIGIN_ERROR,
    SELLER_SIGNOUT

}
    from '../types/sellerAuthType';

const initialState = {
    sellerAuth: null,
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