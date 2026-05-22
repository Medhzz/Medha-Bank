import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const hubConfig = {
  apiKey: import.meta.env.VITE_HUB_API_KEY,
  authDomain: import.meta.env.VITE_HUB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_HUB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_HUB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_HUB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_HUB_APP_ID,
};

const hubApp = initializeApp(hubConfig, "hub");

export const hubDb = getFirestore(hubApp);
export const hubAuth = getAuth(hubApp);

export const signInToHub = async () => {
  try {
    const email = import.meta.env.VITE_HUB_BANK_EMAIL;
    const password = import.meta.env.VITE_HUB_BANK_PASSWORD;
    await signInWithEmailAndPassword(hubAuth, email, password);
  } catch (err) {
    console.error("Hub sign-in failed:", err.message);
  }
};

export default hubApp;
