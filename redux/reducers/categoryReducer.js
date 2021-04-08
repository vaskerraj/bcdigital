import {
    CAT_LIST_RESPONSE,
    CAT_LIST_SUCCESS,
    CAT_LIST_ERROR
}
    from '../types/categoryType';

const initialState = {
    categories: [],
    loading: false,
    error: null
}
export const categoriesReducer = (state = initialState, action) => {
    switch (action.type) {
        case CAT_LIST_RESPONSE:
            return {
                loading: true,
                categories: [],
                error: null
            }
        case CAT_LIST_SUCCESS:
            return {
                loading: false,
                categories: action.payload,
                error: null
            }
        case CAT_LIST_ERROR:
            return {
                loading: false,
                categories: [],
                error: action.payload
            }
        default: return state;
    }
}