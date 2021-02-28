import createDataContext from './createDataContext';
import productApi from '../helpers/api';


const ProductReducer = (state, action) => {
    switch (action.type) {
        case 'getproduct':
            return { ...state, products: action.payload, errorMessage: null }
        case 'getproduct_error':
            return { ...state, errorMessage: action.payload, product: [] }
        default:
            return state;
    }
};

const getProduct = dispatch => async () => {
    try {
        const { data } = await productApi.get('/api/products');
        console.log(data);

        dispatch({ type: 'getproduct', payload: data });

        // navigate after signup
    } catch (error) {
        dispatch({ type: 'getproduct_error', payload: 'some error while fetching product' })
    }
}



export const { Context, Provider } = createDataContext(
    ProductReducer,
    { getProduct },
    { products: [], errorMessage: '' }
)