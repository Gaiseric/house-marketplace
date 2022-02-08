// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBeDYaJLs_Y-TbmF2VlTAi4Zi-18gdZ97Y",
    authDomain: "house-marketplace-app-a8ef8.firebaseapp.com",
    projectId: "house-marketplace-app-a8ef8",
    storageBucket: "house-marketplace-app-a8ef8.appspot.com",
    messagingSenderId: "794165683246",
    appId: "1:794165683246:web:4020b6d1ef938212c8abbf",
};

// Initialize Firebase
initializeApp(firebaseConfig);
export const db = getFirestore();
