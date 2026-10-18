import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy
} from "firebase/firestore";

const RequestsContext = createContext(null);

export function GuidanceRequestsProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe in real-time to Firebase Firestore guidance_requests collection
  useEffect(() => {
    try {
      const q = query(
        collection(db, "guidance_requests"),
        orderBy("createdAt", "desc")
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data()
          }));
          setRequests(list);
          setLoading(false);
        },
        (err) => {
          console.warn("Firestore guidance_requests subscription fallback:", err);
          // Fallback query without orderBy in case index is building
          const unsubFallback = onSnapshot(
            collection(db, "guidance_requests"),
            (fallbackSnap) => {
              const list = fallbackSnap.docs.map((d) => ({
                id: d.id,
                ...d.data()
              }));
              setRequests(
                list.sort(
                  (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
                )
              );
              setLoading(false);
            },
            (fallbackErr) => {
              console.error("Failed to load guidance_requests from Firebase:", fallbackErr);
              setLoading(false);
            }
          );
          return () => unsubFallback();
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.error("Failed to initialize guidance_requests listener:", err);
      setLoading(false);
    }
  }, []);

  // Save new guidance request directly into Firebase Firestore
  const addRequest = async (request) => {
    try {
      const nowIso = new Date().toISOString();
      const newDoc = {
        userId: user?.uid || "anonymous",
        userName: user?.displayName || user?.name || user?.email || "User",
        userEmail: user?.email || "",
        description: request.description || "",
        category: request.category || "General Guidance",
        expertType: request.expertType || "Tarot Reader",
        status: "Awaiting Expert Response",
        createdAt: nowIso,
        submittedAt: nowIso,
        attachedReading: request.attachedReading || null,
        expertResponse: null,
        ...request
      };

      const docRef = await addDoc(collection(db, "guidance_requests"), newDoc);
      return docRef.id;
    } catch (err) {
      console.error("Failed to save guidance request to Firebase:", err);
      throw err;
    }
  };

  // Update request status directly in Firebase Firestore
  const updateStatus = async (id, status) => {
    try {
      if (typeof id === "string") {
        await updateDoc(doc(db, "guidance_requests", id), {
          status,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error("Failed to update status in Firebase:", err);
    }
  };

  // Add expert response directly into Firebase Firestore
  const addExpertResponse = async (id, responseText) => {
    try {
      const nowIso = new Date().toISOString();
      const expertName = user?.displayName || user?.name || user?.email || "Expert Guide";

      if (typeof id === "string") {
        await updateDoc(doc(db, "guidance_requests", id), {
          status: "Expert Responded",
          expertResponse: {
            text: responseText,
            expertName,
            expertId: user?.uid || null,
            respondedAt: nowIso
          },
          updatedAt: nowIso
        });
      }
    } catch (err) {
      console.error("Failed to save expert response to Firebase:", err);
    }
  };

  return (
    <RequestsContext.Provider
      value={{ requests, loading, addRequest, updateStatus, addExpertResponse }}
    >
      {children}
    </RequestsContext.Provider>
  );
}

export function useGuidanceRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error("useGuidanceRequests must be used within GuidanceRequestsProvider");
  return ctx;
}
