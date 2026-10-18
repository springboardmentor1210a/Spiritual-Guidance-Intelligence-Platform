import { auth, db } from "../firebase";
import { collection, getDocs, addDoc, onSnapshot } from "firebase/firestore";

export async function saveReading(type, data, userOrUid) {
  const uid = typeof userOrUid === "string" && !userOrUid.startsWith("eyJ")
    ? userOrUid
    : userOrUid?.uid || auth.currentUser?.uid;
  if (!uid) {
    console.warn("saveReading failed: No authenticated user.");
    return null;
  }
  const collectionName = type === "tarot" ? "tarot_readings" : "palm_readings";
  const readingPayload = {
    userId: uid,
    userName: auth.currentUser?.displayName || auth.currentUser?.email || "User",
    type,
    data,
    guidanceScore: data?.guidanceScore || 0,
    createdAt: new Date().toISOString()
  };

  const ref = collection(db, "users", uid, collectionName);
  const docRef = await addDoc(ref, readingPayload);

  // Mirror into global Firebase Firestore readings collection
  try {
    await addDoc(collection(db, "readings"), readingPayload);
  } catch (e) {
    // Non-blocking mirror
  }

  // Non-blocking SQLite backend sync
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";
      await fetch(`${API_BASE}/api/readings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ type, data, guidanceScore: data?.guidanceScore || 0 })
      });
    }
  } catch {
    // Retain Firestore record even if SQLite sync fails
  }

  return docRef;
}

export async function loadReadings(token, uid) {
  const currentUid = uid || auth.currentUser?.uid;
  if (!currentUid) return [];
  try {
    const data = [];

    // Fetch palm readings strictly from users/{currentUid}/palm_readings
    const palmRef = collection(db, "users", currentUid, "palm_readings");
    const snapshotPalm = await getDocs(palmRef);
    snapshotPalm.forEach((doc) => data.push({ id: doc.id, ...doc.data(), type: doc.data().type || "palm" }));

    // Fetch tarot readings strictly from users/{currentUid}/tarot_readings
    const tarotRef = collection(db, "users", currentUid, "tarot_readings");
    const snapshotTarot = await getDocs(tarotRef);
    snapshotTarot.forEach((doc) => data.push({ id: doc.id, ...doc.data(), type: doc.data().type || "tarot" }));

    return data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (err) {
    console.error("Failed to load readings from Firebase:", err);
    return [];
  }
}

/**
 * Real-time listener for user readings from users/{uid}/palm_readings and users/{uid}/tarot_readings
 */
export function subscribeToUserReadings(uid, onUpdate, onError) {
  const currentUid = uid || auth.currentUser?.uid;
  if (!currentUid) {
    if (onUpdate) onUpdate([]);
    return () => {};
  }

  let palmDocs = [];
  let tarotDocs = [];

  const emit = () => {
    const merged = [...palmDocs, ...tarotDocs].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    if (onUpdate) onUpdate(merged);
  };

  const palmRef = collection(db, "users", currentUid, "palm_readings");
  const tarotRef = collection(db, "users", currentUid, "tarot_readings");

  const unsubPalm = onSnapshot(
    palmRef,
    (snapshot) => {
      palmDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: doc.data().type || "palm",
      }));
      emit();
    },
    (err) => {
      console.error("Real-time palm_readings error:", err);
      if (onError) onError(err);
    }
  );

  const unsubTarot = onSnapshot(
    tarotRef,
    (snapshot) => {
      tarotDocs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: doc.data().type || "tarot",
      }));
      emit();
    },
    (err) => {
      console.error("Real-time tarot_readings error:", err);
      if (onError) onError(err);
    }
  );

  return () => {
    unsubPalm();
    unsubTarot();
  };
}

