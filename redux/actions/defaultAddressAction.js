import axiosApi from '../../helpers/api';
import {
    DEFAULT_ADD_RESPONSE,
    DEFAULT_ADD_SUCCESS,
    DEFAULT_ADD_ERROR,
}
    from '../types/defaultAddressType';

export const addressList = () => async (dispatch) => {
    dispatch({ type: DEFAULT_ADD_RESPONSE });

    try {
        const { data } = await axiosApi.get("/api/defaultaddress");
        dispatch({ type: DEFAULT_ADD_SUCCESS, payload: data });

    } catch (error) {
        var d_error = error.response ? error.response.data : error.message;
        dispatch({ type: DEFAULT_ADD_ERROR, payload: d_error });
    }
}
