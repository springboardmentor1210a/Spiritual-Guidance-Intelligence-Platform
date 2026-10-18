import { Link } from "react-router-dom";
import { Sparkles, ClipboardList, BarChart3, Users, Clock, FileText, Bell, UserCog } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/ui/NotificationBell";
import ChatNavIcon from "../components/chat/ChatNavIcon";
import { useEffect, useState } from "react";
import TodaySessionsBanner from "../components/expert/TodaySessionsBanner";
import InteractiveScheduleCalendar from "../components/expert/InteractiveScheduleCalendar";

export default function ReaderDashboard() {
  const { user, token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [pendingSessions, setPendingSessions] = useState(0);

  useEffect(() => {
    if (!token || !user?.uid) return;
    const fetchNotifications = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const { db } = await import("../firebase");

        // 1. Pending Guidance requests targeted to this reader
        let pendingGuidanceCount = 0;
        const seenG = new Set();
        
        const gSnap = await getDocs(collection(db, "guidance_requests"));
        gSnap.forEach(d => {
          const data = d.data();
          const isPending = data.status === "Awaiting Expert Response" || data.status === "pending";
          const isForMe = data.expertId === user.uid || (!data.expertId && (data.expertType === "Tarot Reader" || data.category === "Tarot Reader"));
          if (isPending && isForMe) {
            seenG.add(d.id);
            if (data.consultationId) seenG.add(data.consultationId);
            pendingGuidanceCount++;
          }
        });

        const cQ = query(collection(db, "consultations"), where("expertId", "==", user.uid), where("status", "==", "pending"));
        const cSnap = await getDocs(cQ);
        cSnap.forEach(d => {
          const data = d.data();
          if (data.type === "guidance" && !seenG.has(d.id)) {
            seenG.add(d.id);
            pendingGuidanceCount++;
          }
        });
        setPendingRequests(pendingGuidanceCount);

        // 2. Pending Sessions
        let pendingSessCount = 0;
        const seenS = new Set();

        const sSnap = await getDocs(collection(db, "sessions"));
        sSnap.forEach(d => {
          const data = d.data();
          const isPending = data.status === "pending";
          const isForMe = data.readerId === user.uid || data.expertId === user.uid;
          if (isPending && isForMe) {
            seenS.add(d.id);
            if (data.consultationId) seenS.add(data.consultationId);
            pendingSessCount++;
          }
        });

        cSnap.forEach(d => {
          const data = d.data();
          if (data.type !== "guidance" && !seenS.has(d.id)) {
            seenS.add(d.id);
            pendingSessCount++;
          }
        });
        setPendingSessions(pendingSessCount);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifications();
  }, [token, user]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl mb-1">Welcome back, {user?.name || 'Reader'} ✨</h1>
          <p className="text-inkMuted text-sm">Here's what needs your attention today.</p>
        </div>
        <div className="flex items-center gap-2">
          <ChatNavIcon />
          <NotificationBell count={pendingRequests + pendingSessions > 0 ? (pendingRequests + pendingSessions) : undefined} />
        </div>
      </div>

      {(pendingRequests > 0 || pendingSessions > 0) && (
        <Card className="bg-gold/10 border border-gold/40 flex items-center gap-4 py-4 px-5">
          <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center shrink-0 relative">
            <Bell size={20} className="text-gold" />
            {(pendingRequests + pendingSessions) > 0 && (
              <span
                className="notification-badge absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#ff0000] text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-surface shadow-sm leading-none"
                style={{ backgroundColor: "#ff0000", color: "#ffffff", fontWeight: "bold" }}
              >
                {(pendingRequests + pendingSessions) > 9 ? "9+" : (pendingRequests + pendingSessions)}
              </span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-gold font-medium text-lg">Notifications</h3>
            <p className="text-sm text-inkMuted mt-1">
              {pendingRequests > 0 && `You have ${pendingRequests} new guidance request${pendingRequests > 1 ? 's' : ''} waiting for your response.`}
              {pendingRequests > 0 && pendingSessions > 0 && <br />}
              {pendingSessions > 0 && `You got ${pendingSessions} new request${pendingSessions > 1 ? 's' : ''} regarding a session.`}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {pendingRequests > 0 && (
              <Link to="/reader-guidance">
                <Button variant="primary" className="text-xs py-1.5 px-3 whitespace-nowrap">View Requests</Button>
              </Link>
            )}
            {pendingSessions > 0 && (
              <Link to="/reader-sessions">
                <Button variant="secondary" className="text-xs py-1.5 px-3 whitespace-nowrap">View Sessions</Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link to="/reader-analytics">
          <Card hover className="h-full flex flex-col items-center justify-center text-center gap-2 py-6 border border-line shadow-sm hover:border-gold/50">
            <BarChart3 size={24} className="text-gold" />
            <p className="text-sm font-semibold">Reading Analytics</p>
          </Card>
        </Link>
        <Link to="/reader-engagement">
          <Card hover className="h-full flex flex-col items-center justify-center text-center gap-2 py-6 border border-line shadow-sm hover:border-gold/50">
            <Users size={24} className="text-gold" />
            <p className="text-sm font-semibold">Engagement Insights</p>
          </Card>
        </Link>
        <Link to="/reader-sessions">
          <Card hover className="h-full flex flex-col items-center justify-center text-center gap-2 py-6 border border-line shadow-sm hover:border-gold/50">
            <Clock size={24} className="text-gold" />
            <p className="text-sm font-semibold">Session Tracking</p>
          </Card>
        </Link>
        <Link to="/reader-guidance">
          <Card hover className="h-full flex flex-col items-center justify-center text-center gap-2 py-6 border border-line shadow-sm hover:border-gold/50">
            <FileText size={24} className="text-gold" />
            <p className="text-sm font-semibold">Guidance</p>
          </Card>
        </Link>
        <Link to="/profile">
          <Card hover className="h-full flex flex-col items-center justify-center text-center gap-2 py-6 border border-line shadow-sm hover:border-gold/50">
            <UserCog size={24} className="text-gold" />
            <p className="text-sm font-semibold">Reader Profile</p>
          </Card>
        </Link>
      </div>

      <Card hover className="flex flex-col gap-4">
        <Sparkles className="text-gold" size={28} />
        <div>
          <h3 className="text-lg mb-1">Conduct a Tarot Reading</h3>
          <p className="text-sm text-inkMuted">Start a new tarot reading session with a client.</p>
        </div>
        <Link to="/tarot-reading">
          <Button variant="primary">Start Reading</Button>
        </Link>
      </Card>

      {/* Your Sessions Today Banner */}
      <TodaySessionsBanner roleName="Tarot Reader" sessionsUrl="/reader-sessions" />

      {/* Interactive Schedule & Availability Calendar */}
      <InteractiveScheduleCalendar />
      
    </div>
  );
}