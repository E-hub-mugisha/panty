// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2I4skQgj-bDms9rC1b31_b6sYpzEVlH0",
  authDomain: "inventory-management-app-59458.firebaseapp.com",
  projectId: "inventory-management-app-59458",
  storageBucket: "inventory-management-app-59458.appspot.com",
  messagingSenderId: "238453615186",
  appId: "1:238453615186:web:6a0dde9921f96eaf6d0d8b",
  measurementId: "G-8FVWD6L874"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
export { firestore };