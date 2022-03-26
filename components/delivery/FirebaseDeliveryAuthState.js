
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
                destroyCookie(null, "del_role");

                await firebase.auth().signOut();
            } else {
                const idTokenResult = user.getIdTokenResult();
                // Note: () position is very important
                const deliveryRole = (await idTokenResult).claims?.deliveryRole;
                const token = (await idTokenResult).token;


                // set token to cookie
                destroyCookie(null, "del_token");
                destroyCookie(null, "del_role");
                setCookie(null, "del_token", token, {
                    path: '/'
                });
                setCookie(null, "del_role", deliveryRole, {
                    path: '/'
                });

                // dispatch login
                const dispatchData = {
                    user: user.displayName,
                    deliveryRole,
                    token
                }
                dispatch({ type: DELIVERY_SIGIN_SUCCESS, payload: dispatchData });
            }
        });
    }, []);

    return <>{children}</>;
};

export default FirebaseDeliveryAuthState;
