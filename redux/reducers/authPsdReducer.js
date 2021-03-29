import {
    RECOVER_PASS_RESPONSE,
    RECOVER_PASS_SUCCESS,
    RECOVER_PASS_ERROR
}
    from '../types/authPsdType';

const initialState = {
    recoverPsd: null,
    loading: false,
    error: null
}
export const recoverPsdReducer = (state = initialState, action) => {
    switch (action.type) {
        case RECOVER_PASS_RESPONSE:
            return {
                loading: true,
                recoverPsd: null,
                error: null
            }
        case RECOVER_PASS_SUCCESS:
            return {
                loading: false,
                recoverPsd: action.payload,
                error: null
            }
        case RECOVER_PASS_ERROR:
            return {
                loading: false,
                recoverPsd: null,
                error: action.payload
            }
        default: return state;
    }
}