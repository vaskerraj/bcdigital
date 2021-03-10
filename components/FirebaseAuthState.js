
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import { setCookie, destroyCookie } from 'nookies';
import firebase from "../firebase/firebaseClient";
import { USER_SIGIN_SUCCESS } from "../redux/types/userType";

const FirebaseAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {

                // cookies
                destroyCookie(null, "token");
                setCookie(null, "token", "", {});

                // dispatch logout
                await firebase.auth().signOut();
            } else {
                const token = await user.getIdToken();

                // set token to cookie
                destroyCookie(null, "token");
                setCookie(null, "token", token, {});

                // dispatch login
                const dispatchData = {
                    user: user.displayName,
                    token
                }
                dispatch({ type: USER_SIGIN_SUCCESS, payload: dispatchData })
            }
        });
    }, []);

    return <>{children}</>;
};

export default FirebaseAuthState;
