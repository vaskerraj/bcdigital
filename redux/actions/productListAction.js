import productApi from '../../helpers/api';
import {
    PRODUCT_LIST_RESPONSE,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_ERROR,
} from "../types/productListType";

export const listProducts = () => async (dispatch) => {
    try {
        dispatch({ type: PRODUCT_LIST_RESPONSE });
        const { data } = await productApi.get('/api/products');
        dispatch({ type: PRODUCT_LIST_SUCCESS, payload: data });
    }
    catch (error) {
        dispatch({ type: PRODUCT_LIST_ERROR, payload: error.message });
    }
};