import axiosApi from '../../helpers/api';
import { setCookie, parseCookies } from 'nookies';

import {
    SEARCH_TAG_RESPONSE,
    SEARCH_TAG_SUCCESS,
    SEARCH_TAG_ERROR
}
    from '../types/searchTagType';

export const storeSearchTag = (searchTag) => async (dispatch) => {
    dispatch({ type: SEARCH_TAG_RESPONSE });
    try {
        const { data } = await axiosApi.post('/api/tags', { tag: searchTag });
        dispatch({ type: SEARCH_TAG_SUCCESS, payload: data });

        if (data.msg === "success") {

            const { searchTagHistory } = parseCookies();

            const parseSearchTagHistory = searchTagHistory === undefined ?
                tag.split()
                : JSON.parse(searchTagHistory);

            const combineSearchTagHistory = searchTagHistory === undefined ?
                tag.split()
                : [...tag.split(), ...parseSearchTagHistory];

            const uniqueSearchTagHistory = Array.from(new Set(combineSearchTagHistory)).slice(0, 6);

            // store history
            setCookie(null, "searchTagHistory", JSON.stringify(uniqueSearchTagHistory), {
                path: '/'
            });
        }

    } catch (error) {
        const d_error = error.response ? error.response.data : error.message;
        dispatch({ type: SEARCH_TAG_ERROR, payload: d_error });
    }
}