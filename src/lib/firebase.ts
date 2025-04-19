
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC14s3NMpMSIgQ-9X9Q6W1aDd4wIoImCuU",
  authDomain: "retail-parmecy.firebaseapp.com",
  projectId: "retail-parmecy",
  storageBucket: "retail-parmecy.firebasestorage.app",
  messagingSenderId: "744635770752",
  appId: "1:744635770752:web:bfd751cb72f48d8f2c0365",
  measurementId: "G-2TM1DEVT4Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

export default app;
