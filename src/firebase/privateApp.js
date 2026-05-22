import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PRIVATE_API_KEY,
  authDomain: import.meta.env.VITE_PRIVATE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PRIVATE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PRIVATE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PRIVATE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PRIVATE_APP_ID,
};

const privateApp = initializeApp(firebaseConfig, "private");

export const privateAuth = getAuth(privateApp);
export const privateDb = getFirestore(privateApp);
export const privateStorage = getStorage(privateApp);

export default privateApp;
