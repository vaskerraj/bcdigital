import axiosApi from '../../helpers/api';
import {
    SMS_SEND_RESPONSE,
    SMS_SEND_SUCCESS,
    SMS_SEND_ERROR
}
    from '../types/smsType';

export const sendSMS = (mobile, method) => async (dispatch) => {
    dispatch({ type: SMS_SEND_RESPONSE });
    try {
        const { data } = await axiosApi.post('/api/smscode', { mobile, method });

        console.log(data);
        dispatch({ type: SMS_SEND_SUCCESS, payload: data });

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: SMS_SEND_ERROR, payload: d_error });
    }
}