import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SystemStatusBriefCard from "../components/admin/SystemStatusBriefCard";
import { useGuidanceRequests } from "../context/GuidanceRequestsContext";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const API_BASE = "http://localhost:3001";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReaders: 0,
    totalConsultants: 0,
    totalAdmins: 0,
    totalAccounts: 0,
    totalReadings: 0,
    palmReadings: 0,
    tarotReadings: 0,
  });

  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { requests, addExpertResponse } = useGuidanceRequests();

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchAdminStats() {
      try {
        const { collection, collectionGroup, getDocs } = await import("firebase/firestore");
        const { db } = await import("../firebase");
        
        // Fetch all users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = [];
        const roleCount = { user: 0, reader: 0, consultant: 0, admin: 0 };
        
        usersSnapshot.forEach(doc => {
          const u = { id: doc.id, ...doc.data() };
          usersList.push(u);
          const r = (u.role?.toLowerCase() || 'user').replace('tarot reader', 'reader').replace('spiritual consultant', 'consultant').replace('administrator', 'admin');
          if (roleCount[r] !== undefined) roleCount[r]++;
          else roleCount.user++; // fallback
        });
        
        // Fetch all general readings (mostly tarot now)
        const readingsSnapshot = await getDocs(collection(db, "readings"));
        let palmReadings = 0;
        let tarotReadings = 0;
        
        readingsSnapshot.forEach(doc => {
          const type = doc.data().type;
          if (type === 'palm') palmReadings++;
          else if (type === 'tarot') tarotReadings++;
        });

        // Fetch palm_readings collectionGroup
        const palmGroupSnapshot = await getDocs(collectionGroup(db, "palm_readings"));
        palmReadings += palmGroupSnapshot.size;

        // Fetch tarot_readings collectionGroup
        const tarotGroupSnapshot = await getDocs(collectionGroup(db, "tarot_readings"));
        tarotReadings += tarotGroupSnapshot.size;

        if (cancelled) return;

        setStats({
          totalUsers: roleCount.user,
          totalReaders: roleCount.reader,
          totalConsultants: roleCount.consultant,
          totalAdmins: roleCount.admin,
          totalAccounts: usersList.length,
          totalReadings: palmReadings + tarotReadings,
          palmReadings,
          tarotReadings
        });

        // Set recent users (exclude admin signups)
        const nonAdminUsers = usersList.filter((u) => {
          const r = (u.role || "").toLowerCase();
          return r !== "admin" && r !== "administrator";
        });

        setRecentUsers(
          nonAdminUsers
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 10)
        );

      } catch (err) {
        console.error(err);
        if (!cancelled) setError("Failed to fetch dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAdminStats();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const readingsTotal = stats.palmReadings + stats.tarotReadings;

  const palmPct = readingsTotal
    ? Math.round((stats.palmReadings / readingsTotal) * 100)
    : 0;

  const getRoleLabel = (backendRole) => {
    const roleLabels = {
      user: "Standard User",
      reader: "Tarot Reader",
      consultant: "Spiritual Consultant",
      admin: "Administrator",
    };

    return roleLabels[backendRole] || backendRole;
  };

  const formatDate = (iso) => {
    if (!iso) return "";

    const d = new Date(iso);

    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl mb-1">Platform Overview</h1>
          <p className="text-inkMuted text-sm">
            System-wide statistics and recent activity.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <p className="text-xs text-inkMuted uppercase tracking-wide mb-1">
            Total Users
          </p>
          <p className="text-2xl font-display text-gold">
            {stats.totalUsers}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-inkMuted uppercase tracking-wide mb-1">
            Total Tarot Readers
          </p>
          <p className="text-2xl font-display text-gold">
            {stats.totalReaders}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-inkMuted uppercase tracking-wide mb-1">
            Total Spiritual Consultants
          </p>
          <p className="text-2xl font-display text-gold">
            {stats.totalConsultants}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-inkMuted uppercase tracking-wide mb-1">
            Total Accounts
          </p>
          <p className="text-2xl font-display text-gold">
            {stats.totalAccounts}
          </p>
        </Card>
      </div>

      {/* Brief System Status Summary Card */}
      <SystemStatusBriefCard />

      <Card>
        <h3 className="text-lg mb-4">Palm vs Tarot Readings</h3>

        <div className="w-full h-3 bg-line rounded-full overflow-hidden flex">
          <div
            className="h-full bg-gold"
            style={{
              width: readingsTotal > 0 ? `${palmPct}%` : "0%",
            }}
          />

          <div
            className="h-full bg-violet"
            style={{
              width: readingsTotal > 0 ? `${100 - palmPct}%` : "100%",
            }}
          />
        </div>

        <div className="flex justify-between text-xs text-inkMuted mt-2">
          <span>
            Palm: {stats.palmReadings} ({palmPct}%)
          </span>

          <span>
            Tarot: {stats.tarotReadings} ({100 - palmPct}%)
          </span>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg mb-4">Recent User Signups</h3>

        {loading ? (
          <p className="text-sm text-inkMuted">Loading...</p>
        ) : recentUsers.length === 0 ? (
          <p className="text-sm text-inkMuted">No users yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex justify-between items-center border-b border-line last:border-0 pb-3 last:pb-0 text-sm"
              >
                <span>
                  {u.name} —{" "}
                  <span className="text-inkMuted">{u.email}</span>
                </span>

                <span className="text-xs px-2 py-0.5 rounded-full border text-gold border-gold/40 bg-gold/10">
                  {getRoleLabel(u.role)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        {requests.length === 0 ? (
          <p className="text-sm text-inkMuted">
            No requests found in the system.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {requests.map((r) => (
              <Card
                key={r.id}
                className="flex flex-col gap-2 shadow-sm border border-line"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold">
                      {r.userName}
                    </span>

                    <span className="text-xs text-inkMuted ml-2">
                      ({r.expertType})
                    </span>
                  </div>

                  <span className="text-xs px-2 py-0.5 rounded-full border text-gold border-gold/40 bg-gold/10">
                    {r.status}
                  </span>
                </div>

                <p className="text-xs text-inkMuted">
                  Category: {r.category} | Submitted:{" "}
                  {formatDate(r.submittedAt)}
                </p>

                {r.attachedReading && (
                  <div className="my-1 p-2 bg-line/20 rounded border border-line text-xs flex flex-col gap-1">
                    <p className="font-semibold text-gold">
                      Attached{" "}
                      {r.attachedReading.type === "palm"
                        ? "Palm"
                        : "Tarot"}{" "}
                      Reading
                    </p>

                    {r.attachedReading.type === "palm" ? (
                      <>
                        {r.attachedReading.image && (
                          <img
                            src={r.attachedReading.image}
                            alt="Palm"
                            className="w-16 h-16 object-cover rounded mb-2 border border-line"
                          />
                        )}

                        <p className="text-inkMuted">
                          Lines:{" "}
                          {r.attachedReading.analysis?.lines
                            ?.map((l) => l.name)
                            .join(", ")}
                        </p>

                        <p className="text-inkMuted italic">
                          Report:{" "}
                          {
                            r.attachedReading.analysis?.interpretation?.[0]
                          }
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex gap-2 mb-2">
                          {r.attachedReading.cards?.map((c) => (
                            <img
                              key={c.id}
                              src={c.image}
                              alt={c.name}
                              className={`w-8 h-12 object-cover rounded border border-line ${c.reversed ? "rotate-180" : ""
                                }`}
                            />
                          ))}
                        </div>

                        <p className="text-inkMuted">
                          Spread: {r.attachedReading.spread?.name}
                        </p>

                        <p className="text-inkMuted italic">
                          Report:{" "}
                          {r.attachedReading.reading?.synthesis?.[0]}
                        </p>
                      </>
                    )}
                  </div>
                )}

                <p className="text-sm mb-2 font-semibold">
                  User Question: {r.description}
                </p>

                {r.status === "Awaiting Expert Response" ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      addExpertResponse(
                        r.id,
                        e.target.elements.reply.value
                      );
                    }}
                  >
                    <textarea
                      name="reply"
                      className="w-full bg-void border border-line rounded p-2 text-sm outline-none focus:border-gold transition-colors mb-2 resize-none"
                      rows={3}
                      placeholder="Write admin/expert response here..."
                      required
                    />

                    <Button type="submit" variant="primary">
                      Submit Response
                    </Button>
                  </form>
                ) : r.expertResponse ? (
                  <div className="mt-2 p-3 bg-void rounded border border-gold/30">
                    <p className="text-xs text-gold uppercase tracking-wide mb-1">
                      Response
                    </p>

                    <p className="text-sm whitespace-pre-wrap">
                      {r.expertResponse.text}
                    </p>

                    <p className="text-xs text-inkMuted mt-2 text-right">
                      - {r.expertResponse.expertName},{" "}
                      {r.expertResponse.respondedAt}
                    </p>
                  </div>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}