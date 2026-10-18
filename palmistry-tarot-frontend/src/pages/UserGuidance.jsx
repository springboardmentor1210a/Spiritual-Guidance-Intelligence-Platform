import { useState, useEffect, useCallback } from "react";
import { Video, Calendar, Clock, MessageSquare, FileText, Check, Star, Trash2, RotateCcw, User, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SessionNotesModal from "../components/ui/SessionNotesModal";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

const TOPIC_AREAS = [
  "Career & Calling",
  "Love & Relationships",
  "Personal Growth & Clarity",
  "Wellness & Energy",
  "Spiritual Development & Destiny"
];

export default function UserGuidance() {
  const { token, user } = useAuth();
  const { openChat } = useChat();

  const [activeTab, setActiveTab] = useState("guidance"); // "guidance" or "sessions"
  const [sessionFilter, setSessionFilter] = useState("upcoming"); // "upcoming" or "past"

  // Guidance state
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [guidanceForm, setGuidanceForm] = useState({
    category: "",
    expertId: "",
    topic: TOPIC_AREAS[0],
    description: "",
  });

  // Session state
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessionForm, setSessionForm] = useState({
    category: "",
    expertId: "",
    date: "",
    time: ""
  });

  const [experts, setExperts] = useState([]);
  const [deletingId, setDeletingId] = useState(null);

  // Dynamic unique categories derived from real experts in Firestore
  const dynamicCategories = Array.from(
    new Set(
      experts
        .map(exp => (exp.specialty || exp.role || "").trim())
        .filter(Boolean)
    )
  ).sort();

  // Category matching helper
  const matchesCategory = (exp, cat) => {
    if (!cat) return false;
    const target = cat.toLowerCase().trim();
    const spec = (exp.specialty || "").toLowerCase().trim();
    const role = (exp.role || "").toLowerCase().trim();
    const specs = Array.isArray(exp.specialties) ? exp.specialties.map(s => s.toLowerCase().trim()) : [];

    if (spec === target || role === target || specs.includes(target)) return true;
    if (target.includes("tarot")) {
      return spec.includes("tarot") || role.includes("tarot") || specs.some(s => s.includes("tarot"));
    }
    if (target.includes("palm")) {
      return spec.includes("palm") || role.includes("palm") || specs.some(s => s.includes("palm"));
    }
    if (target.includes("spiritual")) {
      return spec.includes("spiritual") || role.includes("spiritual") || specs.some(s => s.includes("spiritual"));
    }
    return spec.includes(target) || role.includes(target) || specs.some(s => s.includes(target));
  };

  const filteredGuidanceExperts = guidanceForm.category
    ? experts.filter(exp => matchesCategory(exp, guidanceForm.category))
    : [];

  const filteredSessionExperts = sessionForm.category
    ? experts.filter(exp => matchesCategory(exp, sessionForm.category))
    : [];

  const selectedGuidanceExpert = experts.find(exp => exp.id === guidanceForm.expertId);
  const selectedSessionExpert = experts.find(exp => exp.id === sessionForm.expertId);

  // Date and time picker helpers
  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const isPastSelectedDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return false;
    const dt = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(dt.getTime())) return false;
    return dt.getTime() <= Date.now();
  };

  const formatPreviewDateTime = (dateStr, timeStr) => {
    if (!dateStr || !timeStr) return "";
    const dt = new Date(`${dateStr}T${timeStr}`);
    if (isNaN(dt.getTime())) return "";
    return dt.toLocaleString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  // Notes Modal state
  const [activeModalSession, setActiveModalSession] = useState(null);

  // Helper to extract numeric epoch timestamp from a session
  const getSessionTimestamp = (s) => {
    const val = s.scheduledTime || s.scheduledFor || (s.date && s.time ? `${s.date}T${s.time}` : null) || s.date;
    if (!val) return null;
    const t = new Date(val).getTime();
    return isNaN(t) ? null : t;
  };

  const isSessionPast = (s, curTime = Date.now()) => {
    const status = (s.status || "").toLowerCase();
    if (status === "completed" || status === "missed") return true;
    const timestamp = getSessionTimestamp(s);
    if (timestamp && timestamp <= curTime) return true;
    return false;
  };

  const isSessionUpcoming = (s, curTime = Date.now()) => {
    if (isSessionPast(s, curTime)) return false;
    const status = (s.status || "").toLowerCase();
    if (status === "completed" || status === "missed" || status === "declined") return false;
    return true;
  };

  const isMeetLinkActive = (s, curTime = Date.now()) => {
    if (!s.meetLink && !s.meetingLink) return false;
    const status = (s.status || "").toLowerCase();
    if (status === "completed" || status === "missed" || status === "declined") return false;
    if (status === "active") return true;
    const timestamp = getSessionTimestamp(s);
    if (timestamp && timestamp <= curTime) return false;
    return true;
  };

  // Fetch real backend data
  const fetchData = useCallback(async () => {
    try {
      const { collection, query, where, getDocs } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      if (user?.uid) {
        // Fetch Guidance Requests
        const reqQ = query(collection(db, "guidance_requests"), where("userId", "==", user.uid));
        const reqSnap = await getDocs(reqQ);
        const reqList = [];
        reqSnap.forEach(doc => reqList.push({ id: doc.id, ...doc.data() }));

        // Also check consultations collection for any guidance requests
        try {
          const consultReqQ = query(collection(db, "consultations"), where("userId", "==", user.uid));
          const cSnap = await getDocs(consultReqQ);
          cSnap.forEach(doc => {
            const d = doc.data();
            if (d.type === "guidance" && !reqList.some(r => r.id === doc.id || r.consultationId === doc.id)) {
              reqList.push({
                id: doc.id,
                ...d,
                expertType: d.category,
                status: d.status === "completed" ? "Expert Responded" : "Awaiting Expert Response"
              });
            }
          });
        } catch {
          // Consultations collection fallback
        }

        setRequests(reqList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));

        // Fetch Sessions
        const sessQ = query(collection(db, "sessions"), where("userId", "==", user.uid));
        const sessSnap = await getDocs(sessQ);
        const sessList = [];
        sessSnap.forEach(doc => sessList.push({ id: doc.id, ...doc.data() }));

        // Also check consultations collection for any sessions linked to this user
        try {
          const consultQ = query(collection(db, "consultations"), where("userId", "==", user.uid));
          const consultSnap = await getDocs(consultQ);
          consultSnap.forEach(doc => {
            const d = doc.data();
            if (d.type !== "guidance" && !sessList.some(s => s.id === doc.id || s.consultationId === doc.id)) {
              sessList.push({ id: doc.id, ...d });
            }
          });
        } catch {
          // Consultations collection fallback
        }

        // Check users/{userId}/session_notes for any notes stored under user subcollection
        try {
          const notesSnap = await getDocs(collection(db, "users", user.uid, "session_notes"));
          const notesMap = {};
          notesSnap.forEach(doc => {
            notesMap[doc.id] = doc.data();
          });
          sessList.forEach(s => {
            if (notesMap[s.id]) {
              s.notes = notesMap[s.id].notes || "";
              s.notesUpdatedAt = notesMap[s.id].updatedAt || notesMap[s.id].notesUpdatedAt || null;
            } else if (s.notes) {
              // Migrate legacy notes from shared session doc into users/{user.uid}/session_notes/{s.id}
              const legacyNotes = s.notes;
              const legacyUpdatedAt = s.notesUpdatedAt || new Date().toISOString();
              s.notes = legacyNotes;
              s.notesUpdatedAt = legacyUpdatedAt;
              import("firebase/firestore").then(({ doc, setDoc, deleteField, updateDoc }) => {
                setDoc(doc(db, "users", user.uid, "session_notes", s.id), {
                  notes: legacyNotes,
                  sessionId: s.id,
                  userId: user.uid,
                  updatedAt: legacyUpdatedAt,
                  notesUpdatedAt: legacyUpdatedAt
                }, { merge: true }).catch(() => { });
                updateDoc(doc(db, "sessions", s.id), { notes: deleteField(), notesUpdatedAt: deleteField() }).catch(() => { });
                updateDoc(doc(db, "consultations", s.id), { notes: deleteField(), notesUpdatedAt: deleteField() }).catch(() => { });
              });
            } else {
              s.notes = "";
              s.notesUpdatedAt = null;
            }
          });
        } catch {
          // session_notes subcollection fallback
        }

        // Automated Status Completion & Migration
        const now = Date.now();
        for (const s of sessList) {
          const sched = getSessionTimestamp(s);
          const status = (s.status || "").toLowerCase();
          if (sched && sched <= now && status !== "completed" && status !== "missed") {
            s.status = "completed";
            s.completedAt = new Date().toISOString();
            try {
              const { doc, updateDoc, setDoc } = await import("firebase/firestore");
              await updateDoc(doc(db, "sessions", s.id), {
                status: "completed",
                completedAt: s.completedAt
              });
              try {
                await setDoc(doc(db, "consultations", s.id), {
                  status: "completed",
                  completedAt: s.completedAt
                }, { merge: true });
              } catch {
                // consultations merge
              }
            } catch (err) {
              console.warn("Could not auto-update expired session:", err);
            }
          }
        }

        setSessions(sessList.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)));
      }

      setLoadingRequests(false);
      setLoadingSessions(false);

      // Fetch experts dynamically from Firestore (consultants & users collections)
      const expertMap = new Map();

      try {
        const consultSnap = await getDocs(collection(db, "consultants"));
        consultSnap.forEach(docSnap => {
          const data = docSnap.data();
          if (data.active !== false) {
            expertMap.set(docSnap.id, {
              id: docSnap.id,
              ...data,
              name: data.displayName || data.name || "Expert",
              displayName: data.displayName || data.name || "Expert",
              role: data.role || data.specialty || "Consultant",
              specialty: data.specialty || data.role || "Spiritual Consultant",
              avatar: data.avatarUrl || data.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              avatarUrl: data.avatarUrl || data.avatar,
              bio: data.bio || "",
              rating: data.rating || 4.9,
              experience: data.experienceYears ? `${data.experienceYears} years` : (data.experience || "5+ years"),
              experienceYears: data.experienceYears,
            });
          }
        });
      } catch (e) {
        console.warn("Could not query consultants:", e);
      }

      try {
        const usersSnap = await getDocs(collection(db, "users"));
        usersSnap.forEach(docSnap => {
          const data = docSnap.data();
          const roleLower = (data.role || "").toLowerCase();
          const isExpert = roleLower.includes("reader") || roleLower.includes("consultant") || Boolean(data.specialty);
          if (isExpert && data.active !== false) {
            const existing = expertMap.get(docSnap.id) || {};
            expertMap.set(docSnap.id, {
              id: docSnap.id,
              ...existing,
              ...data,
              name: data.displayName || data.name || existing.name || "Expert",
              displayName: data.displayName || data.name || existing.name || "Expert",
              role: data.role || existing.role || "Consultant",
              specialty: data.specialty || existing.specialty || data.role || "Spiritual Consultant",
              avatar: data.avatarUrl || data.avatar || existing.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
              avatarUrl: data.avatarUrl || data.avatar || existing.avatarUrl,
              bio: data.bio || existing.bio || "",
              rating: data.rating || existing.rating || 4.9,
              experience: data.experienceYears ? `${data.experienceYears} years` : (data.experience || existing.experience || "5+ years"),
              experienceYears: data.experienceYears || existing.experienceYears,
            });
          }
        });
      } catch (e) {
        console.warn("Could not query users:", e);
      }

      setExperts(Array.from(expertMap.values()));
    } catch (err) {
      console.error(err);
      setLoadingRequests(false);
      setLoadingSessions(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    // Attach real-time Firestore listeners so expert updates immediately propagate
    let unsubUsers = () => {};
    let unsubConsultants = () => {};

    import("firebase/firestore").then(({ collection, onSnapshot }) => {
      import("../firebase").then(({ db }) => {
        try {
          unsubUsers = onSnapshot(collection(db, "users"), () => {
            fetchData();
          }, (err) => console.warn("Live users snapshot error:", err));
        } catch (e) {
          console.warn("Could not attach users snapshot:", e);
        }

        try {
          unsubConsultants = onSnapshot(collection(db, "consultants"), () => {
            fetchData();
          }, (err) => console.warn("Live consultants snapshot error:", err));
        } catch (e) {
          console.warn("Could not attach consultants snapshot:", e);
        }
      });
    });

    const interval = setInterval(fetchData, 15000); // Polling backup
    return () => {
      clearInterval(interval);
      unsubUsers();
      unsubConsultants();
    };
  }, [fetchData]);

  // Real-time evaluation: automatically migrate expired sessions while page is active
  useEffect(() => {
    if (!sessions.length) return;

    const interval = setInterval(async () => {
      const now = Date.now();
      let hasExpired = false;

      const updated = await Promise.all(
        sessions.map(async (s) => {
          const sched = getSessionTimestamp(s);
          const status = (s.status || "").toLowerCase();
          if (sched && sched <= now && status !== "completed" && status !== "missed") {
            hasExpired = true;
            const completedAt = new Date().toISOString();
            try {
              const { doc, updateDoc, setDoc } = await import("firebase/firestore");
              const { db } = await import("../firebase");
              await updateDoc(doc(db, "sessions", s.id), {
                status: "completed",
                completedAt
              });
              try {
                await setDoc(doc(db, "consultations", s.id), {
                  status: "completed",
                  completedAt
                }, { merge: true });
              } catch {
                // Ignore
              }
            } catch (err) {
              console.warn("Real-time migration error:", err);
            }
            return { ...s, status: "completed", completedAt };
          }
          return s;
        })
      );

      if (hasExpired) {
        setSessions(updated);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [sessions]);

  // Guidance Submit Handler
  const handleGuidanceSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      alert("Please log in to submit a guidance request.");
      return;
    }
    if (!guidanceForm.category) {
      alert("Please select a specialty category.");
      return;
    }
    const selectedExpert = experts.find(exp => exp.id === guidanceForm.expertId);
    if (!selectedExpert) {
      alert("Please select an expert from the list.");
      return;
    }

    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const nowIso = new Date().toISOString();
      const clientName = user.displayName || user.name || user.email || "Unknown User";

      // 1. Save directly into global consultations collection
      const consultRef = await addDoc(collection(db, "consultations"), {
        expertId: selectedExpert.id,
        expertName: selectedExpert.name || "Expert",
        category: guidanceForm.category,
        status: "pending",
        type: "guidance",
        topic: guidanceForm.topic,
        description: guidanceForm.description,
        userId: user.uid,
        userName: clientName,
        userEmail: user.email || "",
        createdAt: nowIso
      });

      // 2. Mirror into guidance_requests collection
      await addDoc(collection(db, "guidance_requests"), {
        consultationId: consultRef.id,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name || "Expert",
        category: guidanceForm.category,
        expertType: selectedExpert.role || guidanceForm.category,
        topic: guidanceForm.topic,
        description: guidanceForm.description,
        status: "Awaiting Expert Response",
        userId: user.uid,
        userName: clientName,
        userEmail: user.email || "",
        createdAt: nowIso
      });

      // 3. Expert Notification Feed sync
      await addDoc(collection(db, "users", selectedExpert.id, "notifications"), {
        title: "New Guidance Request",
        message: `${clientName} requested guidance on ${guidanceForm.category}.`,
        category: guidanceForm.category,
        consultationId: consultRef.id,
        userId: user.uid,
        read: false,
        createdAt: nowIso
      });

      setGuidanceForm(prev => ({
        ...prev,
        category: "",
        expertId: "",
        description: ""
      }));
      fetchData();
      alert(`Guidance request submitted successfully to ${selectedExpert.name}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request: " + err.message);
    }
  };

  // Session Booking Submit Handler
  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) {
      alert("Please log in to request a session.");
      return;
    }
    if (!sessionForm.category) {
      alert("Please select a specialty category.");
      return;
    }
    const selectedExpert = experts.find(exp => exp.id === sessionForm.expertId);
    if (!selectedExpert) {
      alert("Please select an expert from the list.");
      return;
    }
    if (!sessionForm.date || !sessionForm.time) {
      alert("Please select both a date and time for your session.");
      return;
    }

    const scheduledDateTime = new Date(`${sessionForm.date}T${sessionForm.time}`);
    if (isNaN(scheduledDateTime.getTime())) {
      alert("Please select a valid date and time.");
      return;
    }

    if (scheduledDateTime.getTime() <= Date.now()) {
      alert("Please select a future date and time for your session. Past dates or times cannot be scheduled.");
      return;
    }

    const scheduledIso = scheduledDateTime.toISOString();

    try {
      const { collection, addDoc } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const nowIso = new Date().toISOString();
      const clientName = user.displayName || user.name || user.email || "Unknown User";
      const sessionCategory = sessionForm.category;

      // 1. Save directly into global consultations collection
      const consultRef = await addDoc(collection(db, "consultations"), {
        expertId: selectedExpert.id,
        expertName: selectedExpert.name || "Expert",
        category: sessionCategory,
        status: "pending",
        type: "session",
        readerId: selectedExpert.id,
        readerName: selectedExpert.name || "Expert",
        scheduledFor: scheduledIso,
        scheduledTime: scheduledIso,
        userId: user.uid,
        userName: clientName,
        userEmail: user.email || "",
        createdAt: nowIso
      });

      // 2. Mirror into sessions collection
      await addDoc(collection(db, "sessions"), {
        consultationId: consultRef.id,
        expertId: selectedExpert.id,
        expertName: selectedExpert.name || "Expert",
        category: sessionCategory,
        readerId: selectedExpert.id,
        readerName: selectedExpert.name || "Expert",
        scheduledFor: scheduledIso,
        scheduledTime: scheduledIso,
        status: "pending",
        userId: user.uid,
        userName: clientName,
        userEmail: user.email || "",
        createdAt: nowIso
      });

      // 3. Expert Notification Feed sync
      await addDoc(collection(db, "users", selectedExpert.id, "notifications"), {
        title: "New Session Booking Request",
        message: `${clientName} requested a live session for ${scheduledDateTime.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}.`,
        category: sessionCategory,
        consultationId: consultRef.id,
        userId: user.uid,
        read: false,
        createdAt: nowIso
      });

      setSessionForm({
        category: "",
        expertId: "",
        date: "",
        time: ""
      });
      fetchData();
      alert(`Live session requested successfully with ${selectedExpert.name}!`);
    } catch (err) {
      console.error(err);
      alert("Failed to request session: " + err.message);
    }
  };

  const handleModalNoteSaved = (sessionId, newNotes, updatedAt) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, notes: newNotes, notesUpdatedAt: updatedAt }
        : s
    ));
    if (activeModalSession?.id === sessionId) {
      setActiveModalSession(prev => prev ? { ...prev, notes: newNotes, notesUpdatedAt: updatedAt } : null);
    }
  };

  // Unsend / Delete Guidance Request
  const handleUnsendGuidanceRequest = async (req) => {
    const isPending = req.status === "Awaiting Expert Response" || req.status === "pending";
    const confirmMessage = isPending
      ? "Are you sure you want to unsend this guidance request? The expert will no longer receive or see this request."
      : "Are you sure you want to delete this guidance request?";
    if (!window.confirm(confirmMessage)) return;

    setDeletingId(req.id);
    try {
      const { doc, deleteDoc, collection, query, where, getDocs } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const consultId = req.consultationId || req.id;
      const gId = req.id;

      // 1. Delete from guidance_requests
      if (gId) {
        try {
          await deleteDoc(doc(db, "guidance_requests", gId));
        } catch (e) {
          console.warn("Delete guidance_requests by id error:", e);
        }
      }
      if (consultId && consultId !== gId) {
        try {
          await deleteDoc(doc(db, "guidance_requests", consultId));
        } catch { }
      }

      // Also clean any mirror docs in guidance_requests with matching consultationId
      if (consultId) {
        try {
          const gQ = query(collection(db, "guidance_requests"), where("consultationId", "==", consultId));
          const gSnap = await getDocs(gQ);
          gSnap.forEach(async (d) => {
            try { await deleteDoc(doc(db, "guidance_requests", d.id)); } catch { }
          });
        } catch { }
      }

      // 2. Delete from consultations
      if (consultId) {
        try {
          await deleteDoc(doc(db, "consultations", consultId));
        } catch (e) {
          console.warn("Delete consultations error:", e);
        }
      }

      // 3. Remove notification from expert's feed
      const expertId = req.expertId || req.readerId;
      if (expertId && consultId) {
        try {
          const notifQ = query(
            collection(db, "users", expertId, "notifications"),
            where("consultationId", "==", consultId)
          );
          const notifSnap = await getDocs(notifQ);
          notifSnap.forEach(async (d) => {
            try { await deleteDoc(doc(db, "users", expertId, "notifications", d.id)); } catch { }
          });
        } catch (e) {
          console.warn("Delete expert notification error:", e);
        }
      }

      // 4. Update local state
      setRequests(prev => prev.filter(r => r.id !== gId && r.consultationId !== consultId && r.id !== consultId));
      alert(isPending ? "Guidance request has been successfully unsent." : "Guidance request deleted.");
    } catch (err) {
      console.error("Failed to unsend guidance request:", err);
      alert("Failed to unsend request: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Unsend / Delete Live Session Booking Request
  const handleUnsendSessionRequest = async (sess) => {
    const isPending = (sess.status || "").toLowerCase() === "pending";
    const confirmMessage = isPending
      ? "Are you sure you want to unsend this session request? The expert will no longer see this booking request."
      : "Are you sure you want to delete this session?";
    if (!window.confirm(confirmMessage)) return;

    setDeletingId(sess.id);
    try {
      const { doc, deleteDoc, collection, query, where, getDocs } = await import("firebase/firestore");
      const { db } = await import("../firebase");

      const consultId = sess.consultationId || sess.id;
      const sId = sess.id;

      // 1. Delete from sessions
      if (sId) {
        try {
          await deleteDoc(doc(db, "sessions", sId));
        } catch (e) {
          console.warn("Delete session by id error:", e);
        }
      }
      if (consultId && consultId !== sId) {
        try {
          await deleteDoc(doc(db, "sessions", consultId));
        } catch { }
      }

      // Also clean any mirror docs in sessions with matching consultationId
      if (consultId) {
        try {
          const sQ = query(collection(db, "sessions"), where("consultationId", "==", consultId));
          const sSnap = await getDocs(sQ);
          sSnap.forEach(async (d) => {
            try { await deleteDoc(doc(db, "sessions", d.id)); } catch { }
          });
        } catch { }
      }

      // 2. Delete from consultations
      if (consultId) {
        try {
          await deleteDoc(doc(db, "consultations", consultId));
        } catch (e) {
          console.warn("Delete consultations error:", e);
        }
      }

      // 3. Remove notification from expert's feed
      const expertId = sess.expertId || sess.readerId;
      if (expertId && consultId) {
        try {
          const notifQ = query(
            collection(db, "users", expertId, "notifications"),
            where("consultationId", "==", consultId)
          );
          const notifSnap = await getDocs(notifQ);
          notifSnap.forEach(async (d) => {
            try { await deleteDoc(doc(db, "users", expertId, "notifications", d.id)); } catch { }
          });
        } catch (e) {
          console.warn("Delete expert notification error:", e);
        }
      }

      // 4. Clean up private session notes if any
      if (user?.uid && sId) {
        try {
          await deleteDoc(doc(db, "users", user.uid, "session_notes", sId));
        } catch { }
      }

      // 5. Update local state
      setSessions(prev => prev.filter(s => s.id !== sId && s.consultationId !== consultId && s.id !== consultId));
      alert(isPending ? "Session request has been successfully unsent." : "Session removed.");
    } catch (err) {
      console.error("Failed to unsend session request:", err);
      alert("Failed to unsend session: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const upcomingSessions = sessions.filter(s => isSessionUpcoming(s));
  const pastSessions = sessions.filter(s => isSessionPast(s));
  const displayedSessions = sessionFilter === "upcoming" ? upcomingSessions : pastSessions;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl mb-1">Guidance & Sessions</h1>
        <p className="text-inkMuted text-sm">
          Request personalized advice or book a live 1-on-1 session with an expert.
        </p>
      </div>

      <div className="flex gap-4 border-b border-line pb-2">
        <button
          onClick={() => setActiveTab("guidance")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "guidance" ? "text-gold border-b-2 border-gold" : "text-inkMuted hover:text-ink"
            }`}
        >
          Guidance Requests
        </button>
        <button
          onClick={() => setActiveTab("sessions")}
          className={`pb-2 px-1 text-sm font-medium transition-colors ${activeTab === "sessions" ? "text-gold border-b-2 border-gold" : "text-inkMuted hover:text-ink"
            }`}
        >
          Live Sessions
        </button>
      </div>

      {activeTab === "guidance" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg">Submit New Request</h2>
            <Card>
              <form className="flex flex-col gap-4" onSubmit={handleGuidanceSubmit}>
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">Specialty Category</label>
                  <select
                    value={guidanceForm.category}
                    onChange={(e) => setGuidanceForm(prev => ({ ...prev, category: e.target.value, expertId: "" }))}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Select Specialty</option>
                    {dynamicCategories.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Dropdown-Based Expert Selection */}
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                    SELECT EXPERT
                  </label>
                  <select
                    value={guidanceForm.expertId}
                    onChange={(e) => setGuidanceForm(prev => ({ ...prev, expertId: e.target.value }))}
                    disabled={!guidanceForm.category}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!guidanceForm.category
                        ? "Select a specialty first"
                        : filteredGuidanceExperts.length === 0
                          ? "No experts available for this specialty"
                          : "Select Expert"}
                    </option>
                    {filteredGuidanceExperts.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name} — {exp.specialty || exp.role} {exp.rating ? `(★ ${exp.rating})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Expert Profile Preview Card with Avatar Icon (no photo) */}
                {selectedGuidanceExpert && (
                  <div className="p-3.5 rounded-card border border-gold/30 bg-gold/5 flex items-start gap-3 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 mt-0.5">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-ink truncate">{selectedGuidanceExpert.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/40 text-gold bg-gold/10 font-medium shrink-0">
                          {selectedGuidanceExpert.specialty || selectedGuidanceExpert.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-inkMuted mt-0.5">
                        {selectedGuidanceExpert.rating && <span className="text-gold font-medium">★ {selectedGuidanceExpert.rating}</span>}
                        {selectedGuidanceExpert.rating && selectedGuidanceExpert.experience && <span>•</span>}
                        {selectedGuidanceExpert.experience && <span>{selectedGuidanceExpert.experience}</span>}
                      </div>
                      {selectedGuidanceExpert.bio && (
                        <p className="text-xs text-inkMuted mt-1 line-clamp-2 italic leading-relaxed">
                          "{selectedGuidanceExpert.bio}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">Focus Topic</label>
                  <select
                    value={guidanceForm.topic}
                    onChange={(e) => setGuidanceForm({ ...guidanceForm, topic: e.target.value })}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
                  >
                    {TOPIC_AREAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">Describe what you'd like guidance on</label>
                  <textarea
                    required
                    rows={3}
                    value={guidanceForm.description}
                    onChange={(e) => setGuidanceForm({ ...guidanceForm, description: e.target.value })}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors resize-none"
                    placeholder="e.g. I'd like help understanding my career direction and life paths."
                  />
                </div>
                <Button type="submit" variant="primary" className="w-full mt-1">Submit Guidance Request</Button>
              </form>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="text-lg">My Requests & Replies</h2>
            {loadingRequests ? <p className="text-sm text-inkMuted">Loading...</p> : (
              requests.length === 0 ? <p className="text-sm text-inkMuted">No guidance requests yet.</p> : (
                <div className="flex flex-col gap-4">
                  {requests.map(r => {
                    const isPending = r.status === 'Awaiting Expert Response' || r.status === 'pending';
                    const isDeleting = deletingId === r.id;

                    return (
                      <Card key={r.id} className="border border-line shadow-sm flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{r.expertName || r.expertType || "Expert Guidance"}</span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full border border-gold/30 text-gold bg-gold/5">
                              {r.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${r.status === 'Expert Responded' ? 'text-gold border-gold/40 bg-gold/10' : 'text-inkMuted border-line bg-void'}`}>
                              {r.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUnsendGuidanceRequest(r)}
                              disabled={isDeleting}
                              className="p-1 rounded text-inkMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title={isPending ? "Unsend request to expert" : "Delete guidance record"}
                            >
                              <Trash2 size={14} className={isDeleting ? "animate-spin" : ""} />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-inkMuted">
                          {r.topic && <span>Topic: {r.topic}</span>}
                          <span>{formatDate(r.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-1">{r.description}</p>

                        {r.expertResponse && (
                          <div className="mt-4 p-4 bg-void rounded border border-gold/30">
                            <h4 className="text-xs text-gold uppercase tracking-wide mb-2">Expert Response</h4>
                            <p className="text-sm whitespace-pre-wrap">{r.expertResponse}</p>
                            <p className="text-xs text-inkMuted mt-3 text-right">
                              - {r.expertName || r.Expert?.name || "Expert"}, {formatDate(r.respondedAt)}
                            </p>
                          </div>
                        )}

                        {isPending && (
                          <div className="mt-2 pt-2 border-t border-line/40 flex justify-end">
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleUnsendGuidanceRequest(r)}
                              disabled={isDeleting}
                              className="text-xs py-1 px-3 border-line text-inkMuted hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 flex items-center gap-1.5 transition-colors"
                              title="Unsend this guidance request sent to the expert"
                            >
                              <RotateCcw size={12} className={isDeleting ? "animate-spin" : ""} />
                              <span>{isDeleting ? "Unsending..." : "Unsend Request"}</span>
                            </Button>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-4">
            <h2 className="text-lg">Request a Session</h2>
            <Card>
              <form className="flex flex-col gap-4" onSubmit={handleSessionSubmit}>
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">Specialty Category</label>
                  <select
                    value={sessionForm.category}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, category: e.target.value, expertId: "" }))}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
                  >
                    <option value="">Select Specialty</option>
                    {dynamicCategories.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                {/* Dropdown-Based Expert Selection */}
                <div>
                  <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold">
                    SELECT EXPERT
                  </label>
                  <select
                    value={sessionForm.expertId}
                    onChange={(e) => setSessionForm(prev => ({ ...prev, expertId: e.target.value }))}
                    disabled={!sessionForm.category}
                    className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!sessionForm.category
                        ? "Select a specialty first"
                        : filteredSessionExperts.length === 0
                          ? "No experts available for this specialty"
                          : "Select Expert"}
                    </option>
                    {filteredSessionExperts.map((exp) => (
                      <option key={exp.id} value={exp.id}>
                        {exp.name} — {exp.specialty || exp.role} {exp.rating ? `(★ ${exp.rating})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Expert Profile Preview Card with Avatar Icon (no photo) */}
                {selectedSessionExpert && (
                  <div className="p-3.5 rounded-card border border-gold/30 bg-gold/5 flex items-start gap-3 transition-all">
                    <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center text-gold shrink-0 mt-0.5">
                      <User size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-semibold text-ink truncate">{selectedSessionExpert.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/40 text-gold bg-gold/10 font-medium shrink-0">
                          {selectedSessionExpert.specialty || selectedSessionExpert.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-inkMuted mt-0.5">
                        {selectedSessionExpert.rating && <span className="text-gold font-medium">★ {selectedSessionExpert.rating}</span>}
                        {selectedSessionExpert.rating && selectedSessionExpert.experience && <span>•</span>}
                        {selectedSessionExpert.experience && <span>{selectedSessionExpert.experience}</span>}
                      </div>
                      {selectedSessionExpert.bio && (
                        <p className="text-xs text-inkMuted mt-1 line-clamp-2 italic leading-relaxed">
                          "{selectedSessionExpert.bio}"
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Calendar Date & Time Pickers */}
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Interactive Calendar Date Picker */}
                    <div>
                      <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold flex items-center gap-1.5">
                        <Calendar size={13} className="text-gold" />
                        <span>Session Date</span>
                      </label>
                      <input
                        type="date"
                        min={getTodayLocalDate()}
                        value={sessionForm.date}
                        onChange={(e) => setSessionForm(prev => ({ ...prev, date: e.target.value }))}
                        required
                        className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer [color-scheme:dark]"
                      />
                    </div>

                    {/* Time Picker */}
                    <div>
                      <label className="text-xs text-inkMuted uppercase tracking-wider block mb-1.5 font-semibold flex items-center gap-1.5">
                        <Clock size={13} className="text-gold" />
                        <span>Session Time</span>
                      </label>
                      <input
                        type="time"
                        value={sessionForm.time}
                        onChange={(e) => setSessionForm(prev => ({ ...prev, time: e.target.value }))}
                        required
                        className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm text-ink outline-none focus:border-gold transition-colors cursor-pointer [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  {/* Quick Time Slots Selection */}
                  <div>
                    <span className="text-[11px] text-inkMuted block mb-1.5 font-medium">Suggested Time Slots:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { time: "10:00", label: "10:00 AM" },
                        { time: "11:30", label: "11:30 AM" },
                        { time: "14:00", label: "02:00 PM" },
                        { time: "15:30", label: "03:30 PM" },
                        { time: "17:00", label: "05:00 PM" },
                        { time: "18:30", label: "06:30 PM" }
                      ].map(({ time, label }) => {
                        const isSelected = sessionForm.time === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSessionForm(prev => ({ ...prev, time }))}
                            className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                              isSelected
                                ? "border-gold text-gold bg-gold/15 font-medium shadow-sm"
                                : "border-line text-inkMuted hover:border-gold/50 hover:text-ink bg-void/50"
                            }`}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Live Scheduled Time Feedback & Past Date Warning */}
                  {sessionForm.date && sessionForm.time && (
                    <div
                      className={`text-xs p-2.5 rounded-card border flex items-center gap-2 ${
                        isPastSelectedDateTime(sessionForm.date, sessionForm.time)
                          ? "border-red-500/40 bg-red-500/10 text-red-400"
                          : "border-gold/30 bg-gold/5 text-ink"
                      }`}
                    >
                      {isPastSelectedDateTime(sessionForm.date, sessionForm.time) ? (
                        <>
                          <AlertCircle size={14} className="text-red-400 shrink-0" />
                          <span>Selected date/time is in the past. Please choose a future slot.</span>
                        </>
                      ) : (
                        <>
                          <Calendar size={14} className="text-gold shrink-0" />
                          <span>
                            Scheduled for:{" "}
                            <strong className="text-gold font-medium">
                              {formatPreviewDateTime(sessionForm.date, sessionForm.time)}
                            </strong>
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <Button type="submit" variant="primary" className="w-full mt-1">Request Live Session</Button>
              </form>
            </Card>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg">My Sessions</h2>
            </div>

            {/* Selectable tabs / filters for My Sessions */}
            <div className="flex gap-4 border-b border-line pb-1">
              <button
                type="button"
                onClick={() => setSessionFilter("upcoming")}
                className={`pb-1.5 px-1 text-xs font-medium transition-colors ${sessionFilter === "upcoming"
                    ? "text-gold border-b-2 border-gold font-semibold"
                    : "text-inkMuted hover:text-ink"
                  }`}
              >
                Upcoming Sessions ({upcomingSessions.length})
              </button>
              <button
                type="button"
                onClick={() => setSessionFilter("past")}
                className={`pb-1.5 px-1 text-xs font-medium transition-colors ${sessionFilter === "past"
                    ? "text-gold border-b-2 border-gold font-semibold"
                    : "text-inkMuted hover:text-ink"
                  }`}
              >
                Past Sessions ({pastSessions.length})
              </button>
            </div>

            {loadingSessions ? (
              <p className="text-sm text-inkMuted">Loading sessions...</p>
            ) : displayedSessions.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-line rounded-lg">
                <p className="text-inkMuted text-sm">
                  {sessionFilter === "upcoming" ? "No upcoming sessions scheduled." : "No past sessions found."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {displayedSessions.map((s) => {
                  const isPast = isSessionPast(s);
                  const isPending = (s.status || "").toLowerCase() === "pending";
                  const isDeleting = deletingId === s.id;
                  const meetActive = isMeetLinkActive(s);
                  const sessionTime = s.scheduledTime || s.scheduledFor;

                  return (
                    <Card key={s.id} className="border border-line shadow-sm flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold">{s.readerName || s.Reader?.name || "Expert"}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${s.status === 'active'
                              ? 'text-violet border-violet/40 bg-violet/10'
                              : s.status === 'completed'
                                ? 'text-inkMuted border-line bg-void'
                                : s.status === 'missed'
                                  ? 'text-red-400 border-red-500/30 bg-red-500/10'
                                  : 'text-gold border-gold/40 bg-gold/10'
                            }`}>
                            {s.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUnsendSessionRequest(s)}
                            disabled={isDeleting}
                            className="p-1 rounded text-inkMuted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title={isPending ? "Unsend session request to expert" : "Delete session record"}
                          >
                            <Trash2 size={14} className={isDeleting ? "animate-spin" : ""} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-inkMuted">
                        <Calendar size={14} className="text-gold" />
                        <span>Scheduled: {formatDate(sessionTime)}</span>
                      </div>

                      <div className="mt-2 pt-3 border-t border-line/60 flex items-center gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => openChat(s)}
                          className="flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 border-gold/40 text-gold hover:bg-gold/10"
                          title="Chat with consultation expert"
                        >
                          <MessageSquare size={14} /> Chat
                        </Button>

                        {/* Google Meet / Zoom join link: rendered ONLY when upcoming or active, auto-removed when past */}
                        {meetActive && (
                          <a
                            href={s.meetLink || s.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-violet/20 hover:bg-violet/30 text-violet rounded transition-colors text-xs font-medium"
                          >
                            <Video size={14} /> Join Meet
                          </a>
                        )}

                        {/* Unsend Request button for pending session requests */}
                        {isPending && (
                          <Button
                            variant="secondary"
                            onClick={() => handleUnsendSessionRequest(s)}
                            disabled={isDeleting}
                            className="flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 border-line text-inkMuted hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/10 transition-colors"
                            title="Unsend this pending session request so the expert no longer sees it"
                          >
                            <RotateCcw size={13} className={isDeleting ? "animate-spin" : ""} />
                            <span>{isDeleting ? "Unsending..." : "Unsend Request"}</span>
                          </Button>
                        )}

                        {/* Notes button: opens Pop-up Modal for completed sessions in Past Sessions */}
                        {isPast && (
                          <Button
                            variant="secondary"
                            onClick={() => setActiveModalSession(s)}
                            className={`flex-1 text-xs py-1.5 flex items-center justify-center gap-1.5 transition-colors ${s.notes
                                ? "border-gold/50 text-gold hover:bg-gold/10"
                                : "border-line text-inkMuted hover:text-ink hover:bg-void"
                              }`}
                            title="Open personal session notes modal"
                          >
                            <FileText size={14} className={s.notes ? "text-gold" : "text-inkMuted"} />
                            {s.notes ? "Notes" : "Add Notes"}
                          </Button>
                        )}
                      </div>

                      {/* Notes snippet preview if notes exist: clicking opens Pop-up Modal */}
                      {isPast && s.notes && (
                        <div
                          onClick={() => setActiveModalSession(s)}
                          className="p-2.5 bg-void/80 border border-line/40 rounded-card cursor-pointer hover:border-gold/40 transition-colors group"
                          title="Click to view full notes in modal"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-semibold text-gold flex items-center gap-1">
                              <FileText size={11} /> Notes Preview
                            </span>
                            <span className="text-[10px] text-inkMuted group-hover:text-gold transition-colors flex items-center gap-0.5">
                              View Full Details &rarr;
                            </span>
                          </div>
                          <p className="text-xs text-inkMuted italic line-clamp-2">"{s.notes}"</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Notes Pop-up Modal */}
      <SessionNotesModal
        isOpen={Boolean(activeModalSession)}
        onClose={() => setActiveModalSession(null)}
        session={activeModalSession}
        user={user}
        onNoteSaved={handleModalNoteSaved}
        formatDate={formatDate}
      />
    </div>
  );
}

