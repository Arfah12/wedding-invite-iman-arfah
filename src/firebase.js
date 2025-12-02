// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMllnEAzc8Cc3WqUBrg3IeKcKjS_BFNh4",
  authDomain: "wedding-card-65c68.firebaseapp.com",
  projectId: "wedding-card-65c68",
  storageBucket: "wedding-card-65c68.firebasestorage.app",
  messagingSenderId: "820287179156",
  appId: "1:820287179156:web:0428b8e57202421792e781"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);