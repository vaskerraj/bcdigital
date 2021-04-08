import axiosApi from '../../helpers/api';
import {
    SELLER_LIST_RESPONSE,
    SELLER_LIST_SUCCESS,
    SELLER_LIST_ERROR
}
    from '../types/sellerType';

export const allSellers = () => async (dispatch, getState) => {
    dispatch({ type: SELLER_LIST_RESPONSE });
    try {
        const { adminAuth: { adminAuth } } = getState();
        const { data } = await axiosApi.get('/api/admingetseller',
            {
                headers: {
                    token: adminAuth.token
                }
            });
        dispatch({ type: SELLER_LIST_SUCCESS, payload: data });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: SELLER_LIST_ERROR, payload: d_error });
    }
}