// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCQBg5075SsOn-xZ4D8O7KelfvZ2_YXz_k",
    authDomain: "smuproject12-645b4.firebaseapp.com",
    projectId: "smuproject12-645b4",
    storageBucket: "smuproject12-645b4.firebasestorage.app",
    messagingSenderId: "977472397040",
    appId: "1:977472397040:web:f77e9b91feb20172bc2c35",
    measurementId: "G-WT7RC50GV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);