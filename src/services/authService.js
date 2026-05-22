import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { privateAuth, privateDb } from "../firebase/privateApp";

export const loginUser = async (email, password) => {
  const result = await signInWithEmailAndPassword(privateAuth, email, password);
  const snap = await getDoc(doc(privateDb, "users", result.user.uid));
  if (!snap.exists()) throw new Error("User profile not found.");
  return snap.data();
};

export const logoutUser = () => signOut(privateAuth);

export const registerUser = async (userData) => {
  const { email, password, ...rest } = userData;
  const result = await createUserWithEmailAndPassword(privateAuth, email, password);
  const profile = {
    uid: result.user.uid,
    email,
    ...rest,
    role: "customer",
    status: "pending",
    balance: 1000,
    accountNumber: `ACC${Date.now()}`,
    transferLimit: 10000,
    ifsc: import.meta.env.VITE_IFSC_CODE || "MNOP",
    bankId: import.meta.env.VITE_BANK_ID || "med404",
    bankName: import.meta.env.VITE_BANK_NAME || "Medha Bank",
    createdAt: serverTimestamp(),
  };
  await setDoc(doc(privateDb, "users", result.user.uid), profile);
  return profile;
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(privateDb, "users", uid));
  return snap.exists() ? snap.data() : null;
};
