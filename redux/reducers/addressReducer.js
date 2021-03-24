import {
    ADR_ADD_RESPONSE,
    ADR_ADD_SUCCESS,
    ADR_ADD_ERROR,
}
    from '../types/addressType';

const initialState = {
    adrInfo: null,
    loading: false,
    error: null
}

export const addressReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADR_ADD_RESPONSE:
            return {
                loading: true,
                adrInfo: null,
                error: null
            }
        case ADR_ADD_SUCCESS:
            return {
                loading: false,
                adrInfo: action.payload,
                error: null
            }
        case ADR_ADD_ERROR:
            return {
                loading: false,
                adrInfo: null,
                error: action.payload
            }
        default: return state;
    }
}