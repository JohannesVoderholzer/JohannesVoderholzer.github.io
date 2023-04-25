import { initializeApp } from 'firebase/app';
import { getFirestore } from "firebase/firestore";
console.log("loaded firebaseInit.js");

export const firebaseApp = initializeApp({
    apiKey: "AIzaSyClVQdtoNgOYdyschXzGHf8GPJgstgj_XE",
    authDomain: "blogposts-3529f.firebaseapp.com",
    projectId: "blogposts-3529f",
    storageBucket: "blogposts-3529f.appspot.com",
    messagingSenderId: "734055283955",
    appId: "1:734055283955:web:cc15046810b339a90bcb86",
    measurementId: "G-8GTBSBPWYP"
});

export const db = getFirestore();