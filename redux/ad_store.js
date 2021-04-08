import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { adminAuthReducer } from './reducers/adminAuthReducer';
import { categoriesReducer } from './reducers/categoryReducer';
import { sellerListReducer } from './reducers/sellerReducer';

const initalState = {};

const reducer = combineReducers({
    adminAuth: adminAuthReducer,
    categoryList: categoriesReducer,
    sellerList: sellerListReducer,
});

const ad_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default ad_store;