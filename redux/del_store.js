import { createStore, combineReducers, applyMiddleware } from 'redux';
import ThunkMiddleware from 'redux-thunk';
import { deliveryAuthReducer, signupReducer } from './reducers/deliveryAuthReducer';

const initalState = {};

const reducer = combineReducers({
    deliveryAuth: deliveryAuthReducer,
    deliveryRegister: signupReducer,
});

const del_store = createStore(reducer, initalState, applyMiddleware(ThunkMiddleware));

export default del_store;