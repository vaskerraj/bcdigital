import {
    PRODUCT_LIST_RESPONSE,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_ERROR,
} from "../types/productListType";

const initialState = {
    products: [],
    loading: false,
    error: ''
}
export const productListReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_LIST_RESPONSE:
            return {
                loading: true,
                products: [],
                error: ''
            }
        case PRODUCT_LIST_SUCCESS:
            return {
                loading: false,
                products: action.payload,
                error: ''
            }
        case PRODUCT_LIST_ERROR:
            return {
                loading: false,
                products: [],
                error: action.payload
            }
        default: return state;
    }
}