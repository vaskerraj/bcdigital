
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { setCookie, destroyCookie } from 'nookies';

import axiosApi from '../../helpers/api';

import firebase from "../../firebase/firebaseClient";
import { SELLER_SIGIN_SUCCESS } from "../../redux/types/sellerAuthType";

const FirebaseSellerAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {

                // cookies
                destroyCookie(null, "sell_token");
                setCookie(null, "sell_token", "", {
                    path: '/'
                });

                // dispatch logout
                await firebase.auth().signOut();
            } else {
                const token = await user.getIdToken();

                // set token to cookie
                destroyCookie(null, "sell_token");
                setCookie(null, "sell_token", token, {
                    path: '/'
                });

                // dispatch login
                const dispatchData = {
                    user: user.displayName,
                    token
                }
                dispatch({ type: SELLER_SIGIN_SUCCESS, payload: dispatchData })
            }
        });
    }, []);

    // force refresh the token every 10 minutes
    useEffect(() => {
        const handle = setInterval(async () => {
            const user = firebase.auth().currentUser;
            if (user) {
                const token = await user.getIdToken(true);

                // cookies
                destroyCookie(null, "sell_token");
                setCookie(null, "sell_token", "", {
                    path: '/'
                });

                // get user info from backend, not firebase
                const { data } = await axiosApi.get(`/api/verifyToken`, {
                    headers: {
                        token
                    }
                });
                console.log("force refresh", data)
                // dispatch login
                const dispatchData = {
                    user: data.user,
                    token: data.token
                }
                dispatch({ type: SELLER_SIGIN_SUCCESS, payload: dispatchData })
            }
        }, 10 * 60 * 1000);

        return () => clearInterval(handle);
    }, []);

    return <>{children}</>;
};

export default FirebaseSellerAuthState;
