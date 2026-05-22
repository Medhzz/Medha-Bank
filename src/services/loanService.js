import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { privateDb } from "../firebase/privateApp";

export const applyForLoan = async ({ userId, userName, amount, purpose, tenure }) => {
  const emi = (amount * (1 + (12 / 100) * (tenure / 12))) / tenure;
  await addDoc(collection(privateDb, "loans"), {
    userId,
    userName,
    amount,
    purpose,
    tenure,
    emi: Math.round(emi),
    status: "pending",
    appliedAt: serverTimestamp(),
  });
};

export const getUserLoans = async (userId) => {
  const snap = await getDocs(
    query(
      collection(privateDb, "loans"),
      where("userId", "==", userId),
      orderBy("appliedAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllLoans = async () => {
  const snap = await getDocs(collection(privateDb, "loans"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateLoanStatus = async (loanId, status) => {
  await updateDoc(doc(privateDb, "loans", loanId), {
    status,
    reviewedAt: serverTimestamp(),
  });
};
