
import React, { useEffect } from "react";
import firebase from "../firebase/firebaseClient";
import tokenApi from '../helpers/api';

const FirebaseAuthState = ({ children }) => {

    useEffect(() => {
        return firebase.auth().onIdTokenChanged(async (user) => {
            if (!user) {
                console.log(`no user`)
                // dispatch logout
            } else {
                const { token } = await user.getIdTokenResult();

                tokenApi.post("/api/verifyToken", {},
                    {
                        headers: {
                            token: token
                        }
                    }
                ).then((res) => {
                    // dispatch login
                });
            }
        });
    }, []);

    return <>{children}</>;
};

export default FirebaseAuthState;
