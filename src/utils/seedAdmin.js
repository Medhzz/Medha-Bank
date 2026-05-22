import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { privateAuth, privateDb } from "../firebase/privateApp";

const ADMIN_EMAIL = "medhaharini.d@gmail.com";
const ADMIN_PASSWORD = "medha123";

export const seedAdminUser = async () => {
  try {
    // First check Firestore — if admin doc already exists, skip all auth operations
    const q = query(
      collection(privateDb, "users"),
      where("email", "==", ADMIN_EMAIL),
      where("role", "==", "admin")
    );
    const snap = await getDocs(q);
    if (!snap.empty) return; // Admin already seeded, nothing to do

    // Admin not in Firestore — create Firebase Auth user
    let uid;
    try {
      const cred = await createUserWithEmailAndPassword(privateAuth, ADMIN_EMAIL, ADMIN_PASSWORD);
      uid = cred.user.uid;
    } catch (createErr) {
      if (createErr.code === "auth/email-already-in-use") {
        const cred = await signInWithEmailAndPassword(privateAuth, ADMIN_EMAIL, ADMIN_PASSWORD);
        uid = cred.user.uid;
      } else {
        throw createErr;
      }
    }

    // Write admin Firestore document
    const docRef = doc(privateDb, "users", uid);
    const existing = await getDoc(docRef);
    if (!existing.exists()) {
      await setDoc(docRef, {
        uid,
        name: "Admin",
        email: ADMIN_EMAIL,
        role: "admin",
        status: "approved",
        createdAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, { role: "admin", status: "approved" }, { merge: true });
    }

    // Sign out so we don't leave admin session open
    if (privateAuth.currentUser) {
      await signOut(privateAuth);
    }
  } catch (err) {
    console.warn("Admin seed skipped:", err.message);
  }
};
