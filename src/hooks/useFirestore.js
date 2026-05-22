import { useState, useEffect } from "react";
import { collection, onSnapshot, query } from "firebase/firestore";
import { privateDb } from "../firebase/privateApp";

export const useCollection = (collectionName, queryConstraints = []) => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ref = collection(privateDb, collectionName);
    const q = queryConstraints.length ? query(ref, ...queryConstraints) : ref;

    const unsub = onSnapshot(
      q,
      (snap) => {
        setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsub;
  }, [collectionName]);

  return { docs, loading, error };
};
