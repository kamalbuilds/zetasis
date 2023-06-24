// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD83n59yrjwZGq9Bjrh5KM9qhnUlLSPGoE",
  authDomain: "silicate-484ae.firebaseapp.com",
  projectId: "silicate-484ae",
  storageBucket: "silicate-484ae.appspot.com",
  messagingSenderId: "1028417075648",
  appId: "1:1028417075648:web:16ecadf741a727ed0ab025",
  measurementId: "G-8YFV328KT7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default getFirestore();
