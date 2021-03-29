import axiosApi from '../../helpers/api';
import {
    RECOVER_PASS_RESPONSE,
    RECOVER_PASS_SUCCESS,
    RECOVER_PASS_ERROR
}
    from '../types/authPsdType';

export const recoverPassword = (mobile, verificationCode, password, method, role) => async (dispatch) => {
    dispatch({ type: RECOVER_PASS_RESPONSE });
    try {
        const { data } = await axiosApi.post('/api/recoverPassword', { mobile, verificationCode, password, smsmethod: method, role });

        dispatch({ type: RECOVER_PASS_SUCCESS, payload: data });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: RECOVER_PASS_ERROR, payload: d_error });
    }
}