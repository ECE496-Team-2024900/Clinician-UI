// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
//import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC2vePds8qKmr7GcW4I2DT6tTJPYoX3tFQ",
  authDomain: "remotepdt-900.firebaseapp.com",
  projectId: "remotepdt-900",
  storageBucket: "remotepdt-900.firebasestorage.app",
  messagingSenderId: "238435772821",
  appId: "1:238435772821:web:888840ef138df2bd8eee9c",
  measurementId: "G-R3XMR2RDF0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);
//const analytics = getAnalytics(app);

export { app, auth };