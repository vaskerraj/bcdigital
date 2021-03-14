
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { setCookie, destroyCookie } from 'nookies';
import firebase from "../../firebase/firebaseClient";
import { SELLER_SIGIN_SUCCESS } from "../../redux/types/sellerAuthType";

const FirebaseSellerAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {

                // cookies
                destroyCookie(null, "sell_token");
                setCookie(null, "sell_token", "", {});

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

    return <>{children}</>;
};

export default FirebaseSellerAuthState;
