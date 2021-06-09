import {
    SEARCH_TAG_RESPONSE,
    SEARCH_TAG_SUCCESS,
    SEARCH_TAG_ERROR
}
    from '../types/searchTagType';

const initialState = {
    searchTags: null,
    loading: false,
    error: null
}
export const searchTagReducer = (state = initialState, action) => {
    switch (action.type) {
        case SEARCH_TAG_RESPONSE:
            return {
                loading: true,
                searchTags: null,
                error: null
            }
        case SEARCH_TAG_SUCCESS:
            return {
                loading: false,
                searchTags: action.payload,
                error: null
            }
        case SEARCH_TAG_ERROR:
            return {
                loading: false,
                searchTags: null,
                error: action.payload
            }
        default: return state;
    }
}