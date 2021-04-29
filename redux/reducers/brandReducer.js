import {
    BRAND_LIST_RESPONSE,
    BRAND_LIST_SUCCESS,
    BRAND_LIST_ERROR
}
    from '../types/brandType';

const initialState = {
    brands: [],
    loading: false,
    error: null
}
export const brandListReducer = (state = initialState, action) => {
    switch (action.type) {
        case BRAND_LIST_RESPONSE:
            return {
                loading: true,
                brands: [],
                error: null
            }
        case BRAND_LIST_SUCCESS:
            return {
                loading: false,
                brands: action.payload,
                error: null
            }
        case BRAND_LIST_ERROR:
            return {
                loading: false,
                brands: [],
                error: action.payload
            }
        default: return state;
    }
}