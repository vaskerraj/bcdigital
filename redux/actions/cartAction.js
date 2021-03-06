import axiosApi from '../../helpers/api';
import { setCookie } from 'nookies';

import {
    ADD_CART_RESPONSE,
    ADD_CART_SUCCESS,
    ADD_CART_ERROR,
    CART_ITEM_REMOVE,
    CART_QTY_UPD_RESPONSE,
    CART_QTY_UPD_SUCCESS,
    CART_QTY_UPD_ERROR
} from "../types/cartType";

export const addToCart = (productId, productQty) => async (dispatch, getState) => {
    dispatch({ type: ADD_CART_RESPONSE });
    try {
        const { data } = await axiosApi.get("api/product/cart/" + productId);
        const available = data.products[0].quantity - data.products[0].sold;
        if (available === 0) {
            dispatch({
                type: ADD_CART_ERROR, payload: {
                    message: 'outofstock',
                    productId: data.products[0]._id
                }
            });
        } else {
            dispatch({
                type: ADD_CART_SUCCESS, payload: {
                    productId: data.products[0]._id,
                    productQty
                }
            });
            const { cartItems: { cartItem } } = getState();
            // set cartItem to cookie
            setCookie(null, "cartItem", JSON.stringify(cartItem), {
                maxAge: 5 * 24 * 60 * 60,
                path: '/'
            });
        }
    } catch (error) {
        dispatch({ type: ADD_CART_ERROR, payload: error.message })
    }
}

export const updateCartQty = (productId, productQty) => async (dispatch, getState) => {
    dispatch({ type: CART_QTY_UPD_RESPONSE });
    try {
        const { data } = await axiosApi.get("api/product/cart/" + productId);
        const available = data.products[0].quantity - data.products[0].sold;
        if (available === 0) {
            dispatch({
                type: CART_QTY_UPD_ERROR, payload: {
                    message: 'outofstock',
                    productId: data.products[0]._id
                }
            });
        } else {
            dispatch({
                type: CART_QTY_UPD_SUCCESS, payload: {
                    productId: data.products[0]._id,
                    productQty
                }
            });
            const { cartItems: { cartItem } } = getState();

            // set cartItem to cookie
            setCookie(null, "cartItem", JSON.stringify(cartItem), {
                maxAge: 5 * 24 * 60 * 60,
                path: '/'
            });
        }
    } catch (error) {
        dispatch({ type: CART_QTY_UPD_ERROR, payload: error.message })
    }
}

export const removeOrderFromCart = (productId) => (dispatch, getState) => {
    dispatch({ type: CART_ITEM_REMOVE, payload: productId });

    const { cartItems: { cartItem } } = getState();
    // set cartItem to cookie
    setCookie(null, "cartItem", JSON.stringify(cartItem), {
        maxAge: 30 * 24 * 60 * 60,
        path: '/'
    });
}