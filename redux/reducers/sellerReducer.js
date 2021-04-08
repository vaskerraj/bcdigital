import {
    SELLER_LIST_RESPONSE,
    SELLER_LIST_SUCCESS,
    SELLER_LIST_ERROR
}
    from '../types/sellerType';

const initialState = {
    sellers: [],
    loading: false,
    error: null
}
export const sellerListReducer = (state = initialState, action) => {
    switch (action.type) {
        case SELLER_LIST_RESPONSE:
            return {
                loading: true,
                sellers: [],
                error: null
            }
        case SELLER_LIST_SUCCESS:
            return {
                loading: false,
                sellers: action.payload,
                error: null
            }
        case SELLER_LIST_ERROR:
            return {
                loading: false,
                sellers: [],
                error: action.payload
            }
        default: return state;
    }
}