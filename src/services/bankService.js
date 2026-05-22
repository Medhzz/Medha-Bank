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
import { hubDb } from "../firebase/hubApp";

export const getCustomers = async () => {
  const snap = await getDocs(
    query(collection(privateDb, "users"), where("role", "==", "customer"))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const updateAccountStatus = async (userId, status, remarks = "") => {
  await updateDoc(doc(privateDb, "users", userId), {
    status,
    adminRemarks: remarks,
    updatedAt: serverTimestamp(),
  });
};

export const getTransactions = async (userId) => {
  const snap = await getDocs(
    query(
      collection(privateDb, "transactions"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const transferMoney = async ({ senderId, receiverId, amount, description, isInterBank }) => {
  if (isInterBank) {
    await addDoc(collection(hubDb, "transfers"), {
      senderId,
      receiverId,
      amount,
      description,
      status: "pending",
      createdAt: serverTimestamp(),
    });
  } else {
    const senderSnap = await getDocs(
      query(collection(privateDb, "users"), where("uid", "==", senderId))
    );
    const receiverSnap = await getDocs(
      query(collection(privateDb, "users"), where("uid", "==", receiverId))
    );

    if (senderSnap.empty || receiverSnap.empty) throw new Error("Account not found.");

    const sender = senderSnap.docs[0];
    const receiver = receiverSnap.docs[0];

    if (sender.data().balance < amount) throw new Error("Insufficient balance.");

    await updateDoc(doc(privateDb, "users", sender.id), {
      balance: sender.data().balance - amount,
    });
    await updateDoc(doc(privateDb, "users", receiver.id), {
      balance: receiver.data().balance + amount,
    });

    await addDoc(collection(privateDb, "transactions"), {
      userId: senderId,
      type: "debit",
      amount,
      description: description || "Transfer",
      to: receiver.data().accountNumber,
      createdAt: serverTimestamp(),
    });
    await addDoc(collection(privateDb, "transactions"), {
      userId: receiverId,
      type: "credit",
      amount,
      description: description || "Transfer received",
      from: sender.data().accountNumber,
      createdAt: serverTimestamp(),
    });
  }
};

export const getHubBanks = async () => {
  const snap = await getDocs(collection(hubDb, "banks"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
