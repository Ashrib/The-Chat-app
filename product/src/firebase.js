// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDA6gHTvwUMXrVph3Mrt9uAiIKhTR_ucN0",
  authDomain: "twitter-files-uploading.firebaseapp.com",
  projectId: "twitter-files-uploading",
  storageBucket: "twitter-files-uploading.appspot.com",
  messagingSenderId: "285264843611",
  appId: "1:285264843611:web:baabe0014e1f2f04edc07e",
  measurementId: "G-JZ6S2F3YVQ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);