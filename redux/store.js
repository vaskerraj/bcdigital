import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { addressReducer } from './reducers/addressReducer';
import { productListReducer } from './reducers/productListReducer';
import { signinReducer, signupReducer } from './reducers/userReducer';
import { smsSendReducer } from './reducers/smsReducer';
import { recoverPsdReducer } from './reducers/authPsdReducer';

// admin part
import { adminAuthReducer } from './reducers/adminAuthReducer';


// signInUser : { userInfo } => have to use `userInfo` while use useSelector from other component
const initalState = { cartItems: {} };

const reducer = combineReducers({
    productList: productListReducer,
    userAuth: signinReducer,
    smsSender: smsSendReducer,
    userRegister: signupReducer,
    addresses: addressReducer,
    recoverPsd: recoverPsdReducer,

    // admin part
    adminAuth: adminAuthReducer,
});

const store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default store;