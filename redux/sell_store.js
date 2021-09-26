import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { sellerAuthReducer, signupReducer } from './reducers/sellerAuthReducer';
import { categoriesReducer } from './reducers/categoryReducer';
import { brandListReducer } from './reducers/brandReducer';
import { smsSendReducer } from './reducers/smsReducer';

const initalState = {};

const reducer = combineReducers({
    sellerAuth: sellerAuthReducer,
    categoryList: categoriesReducer,
    brandList: brandListReducer,
    smsSender: smsSendReducer,
    sellerRegister: signupReducer,
});

const sell_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default sell_store;