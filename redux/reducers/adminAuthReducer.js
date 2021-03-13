import {
    ADMIN_SIGIN_RESPONSE,
    ADMIN_SIGIN_SUCCESS,
    ADMIN_SIGIN_ERROR,
    ADMIN_SIGNOUT

}
    from '../types/adminAuthType';

const initialState = {
    adminAuth: null,
    loading: false,
    error: null
}

export const adminAuthReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADMIN_SIGIN_RESPONSE:
            return {
                loading: true,
                adminAuth: null,
                error: null
            }
        case ADMIN_SIGIN_SUCCESS:
            return {
                loading: false,
                adminAuth: action.payload,
                error: null
            }
        case ADMIN_SIGIN_ERROR:
            return {
                loading: false,
                adminAuth: null,
                error: action.payload
            }
        case ADMIN_SIGNOUT:
            return {};
        default: return state;
    }
}