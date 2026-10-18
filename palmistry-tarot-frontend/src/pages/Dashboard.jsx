import { Link, useNavigate } from "react-router-dom";
import { Hand, Sparkles, MessageCircleQuestion, Zap } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/ui/NotificationBell";
import ChatNavIcon from "../components/chat/ChatNavIcon";
import { useState, useEffect } from "react";
import { subscribeToUserReadings } from "../utils/readingsStorage";

export default function Dashboard() {
  const { user } = useAuth();
  const [readings, setReadings] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleStartPalmReading = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    navigate("/palm-reading");
  };

  const handleStartTarotReading = (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    navigate("/tarot-reading");
  };

  useEffect(() => {
    if (!user?.uid) {
      setReadings([]);
      return;
    }
    const unsubscribe = subscribeToUserReadings(user.uid, (data) => {
      setReadings(data);
    });
    return () => unsubscribe();
  }, [user]);

  // Derive recommendations from the most recent reading that has them
  const latestWithRecs = readings.find(r => r.data?.recommendations?.length > 0);
  const recommendations = latestWithRecs?.data?.recommendations
    ?.slice(0, 3)
    .map((text, i) => ({ category: ["Action", "Reflection", "Growth"][i % 3], text })) || [];

  return (
    <div className="flex flex-col gap-8">

      {/* Welcome header row — greeting left, bell & chat right */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl mb-1">Welcome back, {user?.name || "User"} ✨</h1>
          <p className="text-inkMuted text-sm">
            Explore your latest insights and continue your journey of self-reflection.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChatNavIcon />
          <NotificationBell />
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card hover className="flex flex-col gap-4">
          <Hand className="text-gold" size={28} />
          <div>
            <h3 className="text-lg mb-1">Palm Reading</h3>
            <p className="text-sm text-inkMuted">
              Analyze your palm and explore personalized palmistry insights.
            </p>
          </div>
          <Button variant="primary" onClick={handleStartPalmReading} disabled={isSubmitting}>
            {isSubmitting ? "Opening..." : "Start Palm Reading"}
          </Button>
        </Card>

        <Card hover className="flex flex-col gap-4">
          <Sparkles className="text-gold" size={28} />
          <div>
            <h3 className="text-lg mb-1">Tarot Reading</h3>
            <p className="text-sm text-inkMuted">
              Choose a spread and explore an AI-assisted tarot interpretation.
            </p>
          </div>
          <Button variant="primary" onClick={handleStartTarotReading} disabled={isSubmitting}>
            {isSubmitting ? "Opening..." : "Start Tarot Reading"}
          </Button>
        </Card>
      </div>

      {/* Last Readings Summary */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center">
              <Hand size={16} className="text-gold" />
            </div>
            <h3 className="text-lg">Last Palm Reading</h3>
          </div>
          {readings.find(r => r.type === "palm") ? (
            <p className="text-sm text-inkMuted mt-2">
              Completed {new Date(readings.find(r => r.type === "palm").createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          ) : (
            <p className="text-sm text-inkMuted mt-2 opacity-60">No palm reading completed yet.</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-violet/20 flex items-center justify-center">
              <Sparkles size={16} className="text-violet" />
            </div>
            <h3 className="text-lg">Last Tarot Reading</h3>
          </div>
          {readings.find(r => r.type === "tarot") ? (
            <p className="text-sm text-inkMuted mt-2">
              Completed {new Date(readings.find(r => r.type === "tarot").createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          ) : (
            <p className="text-sm text-inkMuted mt-2 opacity-60">No tarot reading completed yet.</p>
          )}
        </Card>
      </div>

      {/* Request Expert Guidance */}
      <Card hover className="flex flex-col gap-4">
        <MessageCircleQuestion className="text-gold" size={28} />
        <div>
          <h3 className="text-lg mb-1">Request Expert Guidance</h3>
          <p className="text-sm text-inkMuted">
            Ask a Tarot Reader or Spiritual Consultant for personalized guidance.
          </p>
        </div>
        <Link to="/user-guidance">
          <Button variant="primary">Request Guidance &amp; Sessions</Button>
        </Link>
      </Card>

      {/* Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg">Recommendations</h3>
          {readings.length > 0 && (
            <Link to="/history" className="text-xs text-violet hover:underline flex items-center gap-1 transition-colors">
              View history <Zap size={12} />
            </Link>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {recommendations.length === 0 ? (
            <p className="text-sm text-inkMuted col-span-3">
              Complete a reading to see personalized recommendations.
            </p>
          ) : (
            recommendations.map((rec, i) => (
              <Card key={i}>
                <p className="text-xs text-gold uppercase tracking-wide mb-2">{rec.category}</p>
                <p className="text-sm text-inkMuted">{rec.text}</p>
              </Card>
            ))
          )}
        </div>
      </div>

    </div>
  );
}