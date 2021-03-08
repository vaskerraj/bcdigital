
import React, { useEffect } from "react";
import { useDispatch } from 'react-redux';
import firebase from "../firebase/firebaseClient";
import { USER_SIGIN_SUCCESS } from "../redux/types/userType";

const FirebaseAuthState = ({ children }) => {
    const dispatch = useDispatch();
    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {
                // dispatch logout
                await firebase.auth().signOut().then(() => {
                    //router.push("/");
                });
            } else {
                const token = await user.getIdToken();
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
