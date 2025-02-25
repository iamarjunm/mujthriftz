// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDxI2Y7fiOy7D5qLXfFT4CB0BmRvM_pOf8",
  authDomain: "mujthriftz.firebaseapp.com",
  projectId: "mujthriftz",
  storageBucket: "mujthriftz.firebasestorage.app",
  messagingSenderId: "157245187258",
  appId: "1:157245187258:web:47d0f9de2b16c57a9d8e83",
  measurementId: "G-PCY8813Y3Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
const db = getFirestore(app);

export { db };