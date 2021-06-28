import axiosApi from '../../helpers/api';
import {
    ADR_ADD_RESPONSE,
    ADR_ADD_SUCCESS,
    ADR_ADD_ERROR,
    ADR_UPD_RESPONSE,
    ADR_UPD_SUCCESS,
    ADR_UPD_ERROR
}
    from '../types/addressType';

export const addAddress = (name, mobile, label, region, city, area, street) => async (dispatch, getState) => {
    dispatch({ type: ADR_ADD_RESPONSE });

    try {
        const { userAuth: { userInfo } } = getState();
        const { data } = await axiosApi.post("api/addresses", { name, mobile, label, region, city, area, street }, {
            headers: {
                token: userInfo.token
            }
        });
        dispatch({ type: ADR_ADD_SUCCESS, payload: data });

    } catch (error) {
        var d_error = error.response ? error.response.data : error.message;
        dispatch({ type: ADR_ADD_ERROR, payload: d_error });
    }
}

export const updateAddress = (id, name, mobile, label, region, city, area, street) => async (dispatch, getState) => {
    dispatch({ type: ADR_UPD_RESPONSE });

    try {
        const { userAuth: { userInfo } } = getState();
        const { data } = await axiosApi.put("api/address", { id, name, mobile, label, region, city, area, street }, {
            headers: {
                token: userInfo.token
            }
        });
        dispatch({ type: ADR_UPD_SUCCESS, payload: data });

    } catch (error) {
        var d_error = error.response ? error.response.data : error.message;
        dispatch({ type: ADR_UPD_ERROR, payload: d_error });
    }
}