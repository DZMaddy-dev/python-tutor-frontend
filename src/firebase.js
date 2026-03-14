
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBi32IAS8_tmjuFWZAWQiuUNklefenuoZU",
  authDomain: "python-ai-tutor-37ba0.firebaseapp.com",
  projectId: "python-ai-tutor-37ba0",
  storageBucket: "python-ai-tutor-37ba0.firebasestorage.app",
  messagingSenderId: "352790376312",
  appId: "1:352790376312:web:def414962e58571cfee28d",
  measurementId: "G-1QNNW2F8HL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const provider = new GoogleAuthProvider();