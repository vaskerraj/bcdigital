
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { setCookie, destroyCookie } from 'nookies';
import firebase from "../../firebase/firebaseClient";
import { ADMIN_SIGIN_SUCCESS } from "../../redux/types/adminAuthType";

const FirebaseAdminAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {

                // cookies
                destroyCookie(null, "ad_token");
                setCookie(null, "ad_token", "", {});

                // dispatch logout
                console.log('sing out at firebase auth state');
                await firebase.auth().signOut();
            } else {
                const token = await user.getIdToken();

                console.log(`token cookies====>${token}`);
                // set token to cookie
                destroyCookie(null, "ad_token");
                setCookie(null, "ad_token", token, {});

                // dispatch login
                const dispatchData = {
                    user: user.displayName,
                    token
                }
                dispatch({ type: ADMIN_SIGIN_SUCCESS, payload: dispatchData })
            }
        });
    }, []);

    return <>{children}</>;
};

export default FirebaseAdminAuthState;
