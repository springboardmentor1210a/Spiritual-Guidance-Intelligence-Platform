import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, Calendar, User, RefreshCw } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function ReaderRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const list = [];
      const seen = new Set();

      // 1. Check global consultations targeted to this reader
      const cQ = query(collection(db, "consultations"), where("expertId", "==", user.uid));
      const cSnap = await getDocs(cQ);
      cSnap.forEach(d => {
        const data = d.data();
        seen.add(d.id);
        list.push({
          id: d.id,
          user: data.userName || "Client",
          category: data.category || "Tarot Reading",
          status: data.status || "pending",
          description: data.description || "",
          type: data.type || "session",
          scheduledFor: data.scheduledFor,
          requested: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Recent"
        });
      });

      // 2. Check guidance_requests targeted to this reader
      const gSnap = await getDocs(collection(db, "guidance_requests"));
      gSnap.forEach(d => {
        const data = d.data();
        const isForMe = data.expertId === user.uid || (!data.expertId && (data.expertType === "Tarot Reader" || data.category === "Tarot Reader"));
        if (isForMe && !seen.has(d.id) && !seen.has(data.consultationId)) {
          seen.add(d.id);
          list.push({
            id: d.id,
            user: data.userName || "Client",
            category: data.category || "Tarot Guidance",
            status: data.status === "Awaiting Expert Response" ? "pending" : data.status,
            description: data.description || "",
            type: "guidance",
            requested: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : "Recent"
          });
        }
      });

      setRequests(list);
    } catch (err) {
      console.error("Failed to load reading requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl mb-1">Users / Reading Requests</h1>
          <p className="text-inkMuted text-sm">Users who have specifically requested a reading or guidance with you.</p>
        </div>
        <Button variant="secondary" onClick={fetchData} className="flex items-center gap-1.5 text-xs">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      {loading ? (
        <div className="h-32 bg-line/10 rounded animate-pulse" />
      ) : requests.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <Sparkles size={28} className="text-gold mx-auto mb-2 opacity-50" />
            <p className="text-inkMuted text-sm">No incoming reading requests assigned to your profile yet.</p>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {requests.map((t) => (
            <Card key={t.id} className="flex flex-col gap-3 border border-line">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={15} className="text-gold" />
                  <span className="text-sm font-semibold">{t.user}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  t.status?.toLowerCase() === "pending" || t.status === "Awaiting Expert Response"
                    ? "text-gold border-gold/40 bg-gold/10" 
                    : "text-green-400 border-green-500/40 bg-green-500/10"
                }`}>
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-inkMuted">Category: <span className="text-ink">{t.category}</span></p>
              {t.scheduledFor && (
                <p className="text-xs text-inkMuted flex items-center gap-1">
                  <Calendar size={13} className="text-gold" />
                  Scheduled: {new Date(t.scheduledFor).toLocaleString()}
                </p>
              )}
              {t.description && (
                <p className="text-xs text-inkMuted italic bg-surface p-2 rounded line-clamp-2">
                  "{t.description}"
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-inkMuted pt-2 border-t border-line/50 mt-1">
                <span>Requested: {t.requested}</span>
                {t.type === "guidance" ? (
                  <Link to="/reader-guidance">
                    <Button variant="primary" className="text-xs py-1 px-3">View Guidance</Button>
                  </Link>
                ) : (
                  <Link to="/tarot-reading">
                    <Button variant="primary" className="text-xs py-1 px-3">Conduct Reading</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}