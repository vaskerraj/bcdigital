import {
    DEFAULT_ADD_RESPONSE,
    DEFAULT_ADD_SUCCESS,
    DEFAULT_ADD_ERROR,
}
    from '../types/defaultAddressType';

const initialState = {
    addresses: null,
    loading: false,
    error: null
}

export const defaultAddressReducer = (state = initialState, action) => {
    switch (action.type) {
        case DEFAULT_ADD_RESPONSE:
            return {
                loading: true,
                addresses: null,
                error: null
            }
        case DEFAULT_ADD_SUCCESS:
            return {
                loading: false,
                addresses: action.payload,
                error: null
            }
        case DEFAULT_ADD_ERROR:
            return {
                loading: false,
                addresses: null,
                error: action.payload
            }
        default: return state;
    }
}