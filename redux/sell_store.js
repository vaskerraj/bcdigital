import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { sellerAuthReducer } from './reducers/sellerAuthReducer';

const initalState = {};

const reducer = combineReducers({
    sellerAuth: sellerAuthReducer

});

const sell_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default sell_store;