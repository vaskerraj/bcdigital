import firebase from "firebase/app"
import "firebase/auth"

const firebaseConfig = {
    apiKey: "AIzaSyD1jF9BDvaxZg8e29K_z8sG_iU5q-z2hB4",
    authDomain: "bcdigital-auth.firebaseapp.com",
    projectId: "bcdigital-auth",
    storageBucket: "bcdigital-auth.appspot.com",
    messagingSenderId: "424777676703",
    appId: "1:424777676703:web:1ad148ac35ae07b2522faa"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export default firebase;