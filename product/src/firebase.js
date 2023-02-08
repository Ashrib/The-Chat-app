// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBZUi86hqSvHtTyaI8KmU-nbvXbLFNr3vk",
  authDomain: "fir-bucket-e9bc8.firebaseapp.com",
  projectId: "fir-bucket-e9bc8",
  storageBucket: "fir-bucket-e9bc8.appspot.com",
  messagingSenderId: "820047963456",
  appId: "1:820047963456:web:be5d19c5cefda019b646a5",
  measurementId: "G-HV11L65L35"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);