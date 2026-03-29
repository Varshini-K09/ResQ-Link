// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyABxEaQqHyDpZioUKFR_hWJcDrh3O8m2g0",
  authDomain: "reaq-link.firebaseapp.com",
  projectId: "reaq-link",
  storageBucket: "reaq-link.firebasestorage.app",
  messagingSenderId: "467340223283",
  appId: "1:467340223283:web:e1bf220f2219683f2c9446"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
