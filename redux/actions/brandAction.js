import axiosApi from '../../helpers/api';
import {
    BRAND_LIST_RESPONSE,
    BRAND_LIST_SUCCESS,
    BRAND_LIST_ERROR
}
    from '../types/brandType';

export const allBrands = () => async (dispatch) => {
    dispatch({ type: BRAND_LIST_RESPONSE });
    try {
        const { data } = await axiosApi.get('/api/brands');
        dispatch({ type: BRAND_LIST_SUCCESS, payload: data });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: BRAND_LIST_ERROR, payload: d_error });
    }
}