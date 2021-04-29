import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { sellerAuthReducer } from './reducers/sellerAuthReducer';
import { categoriesReducer } from './reducers/categoryReducer';
import { brandListReducer } from './reducers/brandReducer';

const initalState = {};

const reducer = combineReducers({
    sellerAuth: sellerAuthReducer,
    categoryList: categoriesReducer,
    brandList: brandListReducer
});

const sell_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default sell_store;