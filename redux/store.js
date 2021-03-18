import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { productListReducer } from './reducers/productListReducer';
import { signinReducer, smsSendReducer } from './reducers/userReducer';


// signInUser : { userInfo } => have to use `userInfo` while use useSelector from other component
const initalState = { cartItems: {} };

const reducer = combineReducers({
    productList: productListReducer,
    userAuth: signinReducer,
    smsSender: smsSendReducer

});

const store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default store;