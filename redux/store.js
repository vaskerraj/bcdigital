import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { addressReducer } from './reducers/addressReducer';
import { productListReducer } from './reducers/productListReducer';
import { signinReducer, signupReducer } from './reducers/userReducer';
import { smsSendReducer } from './reducers/smsReducer';


// signInUser : { userInfo } => have to use `userInfo` while use useSelector from other component
const initalState = { cartItems: {} };

const reducer = combineReducers({
    productList: productListReducer,
    userAuth: signinReducer,
    smsSender: smsSendReducer,
    userRegister: signupReducer,
    addresses: addressReducer
});

const store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default store;