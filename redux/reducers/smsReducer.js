import {
    SMS_SEND_RESPONSE,
    SMS_SEND_SUCCESS,
    SMS_SEND_ERROR
}
    from '../types/smsType';

const initialState = {
    smsSendInfo: null,
    loading: false,
    error: null
}
export const smsSendReducer = (state = initialState, action) => {
    switch (action.type) {
        case SMS_SEND_RESPONSE:
            return {
                loading: true,
                smsSendInfo: null,
                error: null
            }
        case SMS_SEND_SUCCESS:
            return {
                loading: false,
                smsSendInfo: action.payload,
                error: null
            }
        case SMS_SEND_ERROR:
            return {
                loading: false,
                smsSendInfo: null,
                error: action.payload
            }
        default: return state;
    }
}