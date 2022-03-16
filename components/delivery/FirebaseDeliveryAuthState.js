
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { setCookie, destroyCookie } from 'nookies';
import firebase from "../../firebase/firebaseClient";
import { DELIVERY_SIGIN_SUCCESS } from "../../redux/types/deliveryAuthType";

const FirebaseDeliveryAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {

                // cookies
                destroyCookie(null, "del_token");
                setCookie(null, "del_token", "", {
                    path: '/'
                });

                await firebase.auth().signOut();
            } else {
                const token = await user.getIdToken();

                // set token to cookie
                destroyCookie(null, "del_token");
                setCookie(null, "del_token", token, {
                    path: '/'
                });

                // dispatch login
                const dispatchData = {
                    user: user.displayName,
                    deliveryRole: user.deliveryRole,
                    token
                }
                dispatch({ type: DELIVERY_SIGIN_SUCCESS, payload: dispatchData })
            }
        });
    }, []);

    return <>{children}</>;
};

export default FirebaseDeliveryAuthState;
