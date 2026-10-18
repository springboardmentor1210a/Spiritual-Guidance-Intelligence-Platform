import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";


const firebaseConfig = {
  apiKey: "AIzaSyBWXUimr3bVBNCd7BRBpn3d-ecW4t1vVGY",
  authDomain: "palmistry-tarot-64af9.firebaseapp.com",
  projectId: "palmistry-tarot-64af9",
  storageBucket: "palmistry-tarot-64af9.firebasestorage.app",
  messagingSenderId: "937449729280",
  appId: "1:937449729280:web:4464bb1f348f55d92997e5"
};


const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

