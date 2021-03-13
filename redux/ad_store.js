import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { adminAuthReducer } from './reducers/adminAuthReducer';

const initalState = {};

const reducer = combineReducers({
    adminAuth: adminAuthReducer

});

const ad_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default ad_store;