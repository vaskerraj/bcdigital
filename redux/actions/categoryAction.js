import axiosApi from '../../helpers/api';
import {
    CAT_LIST_RESPONSE,
    CAT_LIST_SUCCESS,
    CAT_LIST_ERROR
}
    from '../types/categoryType';

export const allCategories = () => async (dispatch) => {
    dispatch({ type: CAT_LIST_RESPONSE });
    try {
        const { data } = await axiosApi.get('/api/categories');
        console.log(data);
        dispatch({ type: CAT_LIST_SUCCESS, payload: data });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: CAT_LIST_ERROR, payload: d_error });
    }
}