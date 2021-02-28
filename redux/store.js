import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { productListReducer } from './reducers/productListReducer';


// signInUser : { userInfo } => have to use `userInfo` while use useSelector from other component
const initalState = { cartItems: {}, signInUser: {} };

const reducer = combineReducers({
    productList: productListReducer,

});

const store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default store;