import { useState, useEffect } from "react";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../config/roles";
import { subscribeToUserReadings } from "../utils/readingsStorage";

const TABS = ["All", "Palm", "Tarot"];

export default function History() {
  const { role, user } = useAuth();
  const [activeTab, setActiveTab] = useState("All");
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const isReader = role === ROLES.TAROT_READER;

  useEffect(() => {
    if (!user?.uid) {
      setHistoryData([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = subscribeToUserReadings(
      user.uid,
      (data) => {
        const fetchedData = data.map((item) => ({
          id: item.id,
          type: item.type === "palm" ? "Palm" : "Tarot",
          date: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A",
          score: item.guidanceScore,
          status: "Completed",
          user: item.userName || user.displayName || user.email || "User",
          createdAt: item.createdAt
        }));
        setHistoryData(fetchedData);
        setLoading(false);
      },
      (e) => {
        console.error("Failed to fetch history:", e);
        setError("Failed to load history.");
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const filtered = activeTab === "All" ? historyData : historyData.filter((r) => r.type === activeTab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl mb-1">{isReader ? "Tarot Reading History" : "Reading History"}</h1>
        <p className="text-inkMuted text-sm">
          {isReader ? "Tarot readings you've conducted for users." : "A record of your past palm and tarot readings."}
        </p>
      </div>

      {!isReader && (
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-card text-sm transition-colors ${
                activeTab === tab
                  ? "bg-gold/10 text-gold border border-gold/40"
                  : "text-inkMuted border border-line hover:bg-surfaceHover"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="text-center py-6 text-inkMuted">Loading history...</div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-inkMuted border-b border-line">
                {isReader && <th className="pb-2 font-normal">User</th>}
                <th className="pb-2 font-normal">Type</th>
                <th className="pb-2 font-normal">Date</th>
                {!isReader && <th className="pb-2 font-normal">Score</th>}
                <th className="pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((reading) => (
                <tr key={reading.id} className="border-b border-line last:border-0">
                  {isReader && <td className="py-3">{reading.user}</td>}
                  <td className="py-3">{reading.type}</td>
                  <td className="py-3">{reading.date}</td>
                  {!isReader && <td className="py-3 text-gold">{reading.score}</td>}
                  <td className="py-3">{reading.status}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-inkMuted">No readings found.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}