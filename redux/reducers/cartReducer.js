import { ADD_CART_RESPONSE, ADD_CART_SUCCESS, ADD_CART_ERROR, CART_ITEM_REMOVE } from "../types/cartType";

const initialState = {
    cartItem: [],
    loading: false,
    error: null
}
export const cartItemReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_CART_RESPONSE:
            return {
                loading: true,
                cartItem: [...state.cartItem],
                error: null
            }
        case ADD_CART_SUCCESS:
            const item = action.payload;
            const product = state.cartItem.find(x => x.productId === item.productId);
            if (product) {
                return {
                    loading: false,
                    cartItem: state.cartItem.map(x => x.productId === product.productId ? item : x),
                    error: null,
                }
            }

            return {
                loading: false,
                cartItem: [...state.cartItem, item],
                error: null
            }
        // return { ...state, cartItem: [...state.cartItem, item] }

        case ADD_CART_ERROR:
            return {
                loading: false,
                cartItem: [],
                error: action.payload
            }

        case CART_ITEM_REMOVE:
            const removeProductId = action.payload;
            return {
                loading: false,
                cartItem: state.cartItem.filter(x => x.productId !== removeProductId),
                error: null
            }
        default: return state;
    }
}