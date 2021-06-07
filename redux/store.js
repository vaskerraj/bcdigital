import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { parseCookies } from 'nookies';

import { addressReducer } from './reducers/addressReducer';
import { productListReducer } from './reducers/productListReducer';
import { signinReducer, signupReducer } from './reducers/userReducer';
import { smsSendReducer } from './reducers/smsReducer';
import { recoverPsdReducer } from './reducers/authPsdReducer';
import { categoriesReducer } from './reducers/categoryReducer';
import { cartItemReducer } from './reducers/cartReducer';

const { cartItem: parseCartItems } = parseCookies();

const cartItem = parseCartItems ? JSON.parse(parseCartItems) : [];

// signInUser : { userInfo } => have to use `userInfo` while use useSelector from other component
const initalState = { cartItems: { cartItem } };


const reducer = combineReducers({
    productList: productListReducer,
    userAuth: signinReducer,
    smsSender: smsSendReducer,
    userRegister: signupReducer,
    addresses: addressReducer,
    recoverPsd: recoverPsdReducer,
    categoryList: categoriesReducer,
    cartItems: cartItemReducer,
});

const store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default store;