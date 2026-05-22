import { generateAccountNumber } from "../utils/generateAccountNumber";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { privateAuth, privateDb } from "../firebase/privateApp";
import { signInToHub } from "../firebase/hubApp";
import { seedAdminUser } from "../utils/seedAdmin";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start hub sign-in and admin seed in background — do NOT await them
    signInToHub();
    seedAdminUser();

    // Set up auth listener immediately so loading resolves right away
    const unsubscribe = onAuthStateChanged(privateAuth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const docRef = doc(privateDb, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const result = await signInWithEmailAndPassword(privateAuth, email, password);
    const docRef = doc(privateDb, "users", result.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setUserProfile(docSnap.data());
      return docSnap.data();
    }
    throw new Error("User profile not found. Please contact support.");
  };

  const logout = () => {
    setUserProfile(null);
    return signOut(privateAuth);
  };

  const register = async (userData) => {
    const { email, password, ...rest } = userData;
    const result = await createUserWithEmailAndPassword(privateAuth, email, password);
const accountNumber = generateAccountNumber();


    const profile = {
      uid: result.user.uid,
      email,
      ...rest,
      role: "customer",
      status: "pending",
      balance: 1000,
      accountNumber,
      transferLimit: 10000,
      ifsc: import.meta.env.VITE_IFSC_CODE || "MNOP",
      bankId: import.meta.env.VITE_BANK_ID || "med404",
      bankName: import.meta.env.VITE_BANK_NAME || "Medha Bank",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(privateDb, "users", result.user.uid), profile);
    setUserProfile(profile);
    return profile;
  };

  const refreshProfile = async () => {
    if (currentUser) {
      const docRef = doc(privateDb, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        return docSnap.data();
      }
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    login,
    logout,
    register,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
