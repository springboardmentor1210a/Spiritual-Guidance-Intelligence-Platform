import { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Bar } from "react-chartjs-2";
import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = "http://127.0.0.1:8001";

function App() {
  const [isRegister, setIsRegister] = useState(false);

  // =====================================================
  // LOGIN DATA
  // =====================================================

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  // =====================================================
  // REGISTER DATA
  // =====================================================

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role_id: "",
  });


  // Role picker modal
  const [showRolePicker, setShowRolePicker] = useState(false);

  // =====================================================
  // USER / PROFILE
  // =====================================================

  const [currentUser, setCurrentUser] = useState(null);

  const role = currentUser?.role_name;

  const [isEditingProfile, setIsEditingProfile] =
    useState(false);

  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    gender: "",
    age_group: "",
    interests: "",
    spiritual_goals: "",
    reading_preferences: "",
  });

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activePage, setActivePage] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [totalReadings, setTotalReadings] = useState(0);
  const [usersServed, setUsersServed] = useState(0);
  const [cardsUsed, setCardsUsed] = useState(0);
  const [scheduledSessions, setScheduledSessions] = useState(0);
  const [spreadUsage, setSpreadUsage] = useState([]);
  const [readingActivity, setReadingActivity] = useState({});
  const [activeUsers, setActiveUsers] = useState(0);
  const [readingParticipation, setReadingParticipation] = useState(0);
  const [repeatUsers, setRepeatUsers] = useState(0);
  const [averageReadingsPerUser, setAverageReadingsPerUser] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [sessionStatus, setSessionStatus] = useState("");
  const [recentSessions, setRecentSessions] = useState([]);
  const [sessionStatusSummary, setSessionStatusSummary] = useState({
    total_sessions: 0,
    scheduled_sessions: 0,
    pending_sessions: 0,
    invited_sessions: 0,
    rejected_sessions: 0,
  });
  const [tarotReports, setTarotReports] = useState([]);
  const [consultantUserTrends, setConsultantUserTrends] = useState(null);
  const [consultantUserTrendsLoading, setConsultantUserTrendsLoading] = useState(null);
  const [consultantUserTrendsError, setConsultantUserTrendsError] = useState("");
  const [guidanceEffectiveness, setGuidanceEffectiveness] = useState(null);
  const [guidanceEffectivenessLoading, setGuidanceEffectivenessLoading] = useState(false);
  const [guidanceEffectivenessError, setGuidanceEffectivenessError] = useState("");
  const [consultationInsights, setConsultationInsights] = useState(null);
  const [consultationInsightsLoading, setConsultationInsightsLoading] = useState(false);
  const [consultationInsightsError, setConsultationInsightsError] = useState("");
  const [adminUsers, setAdminUsers] = useState(null);
  const [adminUsersByRole, setAdminUsersByRole] = useState(null);
  const [adminRecentUsers, setAdminRecentUsers] = useState(null);
  const [adminUsersLoading, setAdminUsersLoading] = useState(false);
  const [adminUsersError, setAdminUsersError] = useState("");
  const [adminAnalytics, setAdminAnalytics] = useState(null);
  const [adminAnalyticsLoading, setAdminAnalyticsLoading] = useState(false);
  const [adminAnalyticsError, setAdminAnalyticsError] = useState("");
  const [adminReadingStats, setAdminReadingStats] = useState(null);
  const [adminReadingStatsLoading, setAdminReadingStatsLoading] = useState(false);
  const [adminReadingStatsError, setAdminReadingStatsError] = useState("");
  const [adminSystemReports, setAdminSystemReports] = useState(null);
  const [adminSystemReportsLoading, setAdminSystemReportsLoading] = useState(false);
  const [adminSystemReportsError, setAdminSystemReportsError] = useState("");

  // =====================================================
  // TAROT STATES
  // =====================================================

  const [tarotSpread, setTarotSpread] =
    useState("single_card");

  const [tarotIntention, setTarotIntention] =
    useState("general");

  const [tarotQuestion, setTarotQuestion] =
    useState("");

  const [tarotReadingStarted, setTarotReadingStarted] =
    useState(false);
  const [tarotReading, setTarotReading] = useState(0);
  const [tarotSession, setTarotSession] = useState(0);
  const [selectedTarotIndices, setSelectedTarotIndices] = useState([]);
  const [revealedTarotCards, setRevealedTarotCards] = useState([]);
  const [tarotLoading, setTarotLoading] = useState(false);
  const [tarotSelectionLoading, setTarotSelectionLoading] = useState(false);
  const [tarotError, setTarotError] = useState("");
  const [tarotShuffleCount, setTarotShuffleCount] = useState(0);
  const [tarotUsers, setTarotUsers] = useState([]);
  const [selectedTarotUserId, setSelectedTarotUserId] = useState("");
  const [tarotUsersLoading, setTarotUsersLoading] = useState(false);
  const [tarotReaders, setTarotReaders] = useState([]);
  const [selectedTarotReaderId, setSelectedTarotReaderId] = useState("");
  const [tarotReadersLoading, setTarotReadersLoading] = useState(false);
  const [activeTarotChatSession, setActiveTarotChatSession] = useState(null);
  const [tarotChatMessages, setTarotChatMessages] = useState([]);
  const [tarotChatDraft, setTarotChatDraft] = useState("");
  const [tarotChatLoading, setTarotChatLoading] = useState(false);
  const [tarotRescheduleProposals, setTarotRescheduleProposals] = useState([]);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const [userTarotSessionDate, setUserTarotSessionDate] = useState("");
  const [userTarotSessionTime, setUserTarotSessionTime] = useState("");

  const [userTarotRequestLoading, setUserTarotRequestLoading] = useState(false);
  const [userTarotRequestError, setUserTarotRequestError] = useState("");
  const [requestedTarotSession, setRequestedTarotSession] = useState(null);

  const [tarotSessionRequests,setTarotSessionRequests] = useState([]);
  const [tarotSessionRequestsLoading, setTarotSessionRequestsLoading] = useState(false);
  const [tarotSessionRequestsError, setTarotSessionRequestsError] = useState("");
  const [readerTarotSessions, setReaderTarotSessions] = useState([]);
  const [readerTarotSessionsLoading, setReaderTarotSessionsLoading] = useState(false);
  const [readerTarotSessionsError, setReaderTarotSessionsError] = useState("");
  const [myTarotSessions, setMyTarotSessions] = useState([]);
  const [myTarotSessionsLoading, setMyTarotSessionsLoading] = useState(false);
  const [myTarotSessionsError, setMyTarotSessionsError] = useState("");
  const [tarotInvitations, setTarotInvitations] = useState([]);
  const [tarotInvitationActionLoading, setTarotInvitationActionLoading] = useState(false);
  const [tarotInvitationError, setTarotInvitationError] = useState("");

  const [tarotSessionDate, setTarotSessionDate] = useState("");
  const [tarotSessionTime, setTarotSessionTime] = useState("");
  const [createdTarotSession, setCreatedTarotSession] = useState(null);


  const fetchMyTarotSessions = async () => {
    setMyTarotSessionsLoading(true);
    setMyTarotSessionsError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/my-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load Tarot sessions."
        );
      }

      setMyTarotSessions(data.sessions || []);
    } catch (error) {
      console.error(
        "Error loading my Tarot sessions:",
        error
      );

      setMyTarotSessions([]);
      setMyTarotSessionsError(
        error.message || "Unable to load Tarot sessions."
      );
    } finally {
      setMyTarotSessionsLoading(false);
    }
  };

  const fetchReaderTarotSessions = async () => {
    setReaderTarotSessionsLoading(true);
    setReaderTarotSessionsError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/reader-sessions`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load Reader sessions."
        );
      }

      setReaderTarotSessions(data.sessions || []);
    } catch (error) {
      console.error("Error loading Reader sessions:", error);
      setReaderTarotSessions([]);
      setReaderTarotSessionsError(
        error.message || "Unable to load Reader sessions."
      );
    } finally {
      setReaderTarotSessionsLoading(false);
    }
  };

  
  const fetchTarotChatMessages = async (sessionId) => {
    setTarotChatLoading(true);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/chat`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load chat messages."
        );
      }

      setTarotChatMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading Tarot chat:", error);
      setTarotChatMessages([]);
      alert(error.message || "Unable to load chat messages.");
    } finally {
      setTarotChatLoading(false);
    }
  };

  const sendTarotChatMessage = async () => {
    if (!activeTarotChatSession || !tarotChatDraft.trim()) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const sessionId = activeTarotChatSession.session_id;

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            message: tarotChatDraft.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to send message."
        );
      }

      setTarotChatDraft("");
      await fetchTarotChatMessages(sessionId);
    } catch (error) {
      console.error("Error sending Tarot chat message:", error);
      alert(error.message || "Unable to send message.");
    }
  };

  const fetchTarotRescheduleProposals = async (sessionId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/reschedules`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load rescheduling proposals."
        );
      }

      setTarotRescheduleProposals(data.proposals || []);
    } catch (error) {
      console.error("Error loading rescheduling proposals:", error);
      setTarotRescheduleProposals([]);
      alert(error.message || "Unable to load rescheduling proposals.");
    }
  };

  const proposeTarotReschedule = async () => {
    if (!activeTarotChatSession) return;

    if (!rescheduleDate || !rescheduleTime) {
      alert("Please select both a date and a time.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const sessionId = activeTarotChatSession.session_id;

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/reschedule`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            scheduled_date: rescheduleDate,
            scheduled_time: rescheduleTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to propose a new session time."
        );
      }

      setRescheduleDate("");
      setRescheduleTime("");

      await fetchTarotRescheduleProposals(sessionId);

      alert("Rescheduling proposal sent successfully.");
    } catch (error) {
      console.error("Error proposing reschedule:", error);
      alert(error.message || "Unable to propose a new session time.");
    }
  };

  const decideTarotReschedule = async (rescheduleId, decision) => {
    if (!activeTarotChatSession) return;

    try {
      const token = localStorage.getItem("access_token");
      const sessionId = activeTarotChatSession.session_id;

      const response = await fetch(
        `${API_URL}/tarot/reschedules/${rescheduleId}/decision?decision=${encodeURIComponent(decision)}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const detail = data.detail;

        const errorMessage =
          typeof detail === "string"
            ? detail
            : Array.isArray(detail)
            ? detail.map((item) => item.msg || JSON.stringify(item)).join(", ")
            : detail && typeof detail === "object"
            ? JSON.stringify(detail)
            : "Unable to process the proposal.";

        throw new Error(errorMessage);
      }

      await fetchTarotRescheduleProposals(sessionId);

      if (decision === "Accepted") {
        if (role === "User") {
          await fetchMyTarotSessions();
        }
        else if (role === "Tarot Reader") {
          await fetchReaderTarotSessions();
        }

        setActiveTarotChatSession((previous) =>
          previous
            ? {
                ...previous,
               scheduled_date: data.session?.scheduled_date || previous.scheduled_date,
               scheduled_time: data.session?.scheduled_time || previous.scheduled_time,
              }
            : null
        );
      }

      alert(
        decision === "Accepted"
          ? "New session time accepted."
          : "Rescheduling proposal rejected."
      );
    } catch (error) {
      console.error("Error deciding reschedule:", error);
      alert(error.message || "Unable to process the proposal.");
    }
  };

  useEffect(() => {
    if (activePage !== "create-tarot-session") {
      return;
    }

    const fetchTarotUsers = async () => {
      setTarotUsersLoading(true);

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        console.log("Users loaded for Tarot session:", data);

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load users"
          );
        }

        setTarotUsers(data.users || []);
      } catch (error) {
        console.error(
          "Error loading Tarot users:",
          error
        );
        setTarotUsers([]);
      } finally {
        setTarotUsersLoading(false);
      }
    };

    fetchTarotUsers();
  }, [activePage]);

  useEffect(() => {
    if (activeTarotChatSession?.session_id) {
      const sessionId = activeTarotChatSession.session_id;

      fetchTarotChatMessages(sessionId);
      fetchTarotRescheduleProposals(sessionId);
    } else {
      setTarotChatMessages([]);
      setTarotRescheduleProposals([]);
    }
  }, [activeTarotChatSession?.session_id]);



  useEffect(() => {
    if (role !== "User" || activePage !== "request-tarot-session") {
      return;
    }

    const fetchTarotReaders = async () => {
      setTarotReadersLoading(true);
      setUserTarotRequestError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/readers`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load Tarot Readers."
          );
        }

        setTarotReaders(data.readers || []);
      } catch (error) {
        console.error("Error loading Tarot Readers:", error);
        setTarotReaders([]);
        setUserTarotRequestError(
          error.message || "Unable to load Tarot Readers."
        );
      } finally {
        setTarotReadersLoading(false);
      }
    };

    fetchTarotReaders();
  }, [role, activePage]);

  useEffect(() => {
    if (
      role !== "Tarot Reader" ||
      activePage !== "create-tarot-session"
    ) {
      return;
    }

    const fetchTarotSessionRequests = async () => {
      setTarotSessionRequestsLoading(true);
      setTarotSessionRequestsError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/sessions/requests`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load session requests."
          );
        }

        setTarotSessionRequests(data.requests || []);
      } catch (error) {
        console.error(
          "Error loading Tarot session requests:",
          error
        );

        setTarotSessionRequests([]);
        setTarotSessionRequestsError(
          error.message || "Unable to load session requests."
        );
      } finally {
        setTarotSessionRequestsLoading(false);
      }
    };


    fetchTarotSessionRequests();
    fetchReaderTarotSessions();
  }, [role, activePage]);

  useEffect(() => {
    if (
      role !== "User" ||
      activePage !== "dashboard"
    ) {
      return;
    }

    fetchMyTarotSessions();
  }, [role, activePage]);

  useEffect(() => {
    if (
      role !== "User" ||
      activePage !== "dashboard"
    ) {
      return;
    }

    setTarotInvitationError("");
    fetchTarotInvitations();
  }, [role, activePage]);

  



  // =====================================================
  // PALM STATES
  // =====================================================

  const [palmImage, setPalmImage] = useState(null);
  const [palmPreview, setPalmPreview] = useState(null);
  const [palmAnalysisStarted, setPalmAnalysisStarted] =
    useState(false);
  const [palmAnalysis, setPalmAnalysis] = useState(null);
  const [palmLoading, setPalmLoading] = useState(false);

  const [aiInterpretation, setAiInterpretation] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  // =====================================================
  // READING HISTROY
  // =====================================================
  const[readingHistory, setReadingHistory] = useState([]);

  // =====================================================
  // PALM LINE VISUAL OVERLAY
  // =====================================================

  const palmCanvasRef = useRef(null);
  const palmImageRef = useRef(null);

  useEffect(() => {
    const image = palmImageRef.current;
    const canvas = palmCanvasRef.current;

    if (!image || !canvas || !palmAnalysis?.palm_lines?.lines) {
      return;
    }

    const drawOverlay = () => {
      if (!image.naturalWidth || !image.naturalHeight) {
        return;
      }

      const rect = image.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const colors = {
        heart: "#ff3b8d",
        head: "#7c3aed",
        life: "#16a34a",
        fate: "#f59e0b",
        sun: "#ef4444"
      };

      /*
       * Keep only the strongest detection for each palm-line class.
       * This prevents duplicate YOLO detections from drawing on top
       * of one another and making the overlay look messy.
       */
      const strongestByClass = {};

      (palmAnalysis.palm_lines.lines || []).forEach((line) => {
        const confidence = Number(line.confidence || 0);
        const key = line.line;

        if (!strongestByClass[key] ||
            confidence > Number(strongestByClass[key].confidence || 0)) {
          strongestByClass[key] = line;
        }
      });

      const lines = Object.values(strongestByClass);

      lines.forEach((line) => {
        const points = Array.isArray(line.keypoints)
          ? line.keypoints
          : [];

        if (points.length < 2) return;

        const color = colors[line.line] || "#6d28d9";

        const mappedPoints = points.map((point) => ({
          x: (Number(point.x) / image.naturalWidth) * rect.width,
          y: (Number(point.y) / image.naturalHeight) * rect.height
        }));

        /*
         * Draw a subtle under-line first.
         * It is intentionally much thinner than the old glow so
         * nearby palm lines remain visible.
         */
        ctx.save();
        ctx.beginPath();

        mappedPoints.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });

        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        /*
         * Main line: thin and smooth-looking.
         * We use quadratic curves between midpoint positions
         * instead of a thick straight polyline.
         */
        ctx.beginPath();

        if (mappedPoints.length === 2) {
          ctx.moveTo(mappedPoints[0].x, mappedPoints[0].y);
          ctx.lineTo(mappedPoints[1].x, mappedPoints[1].y);
        } else {
          ctx.moveTo(mappedPoints[0].x, mappedPoints[0].y);

          for (let i = 1; i < mappedPoints.length - 1; i++) {
            const current = mappedPoints[i];
            const next = mappedPoints[i + 1];

            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;

            ctx.quadraticCurveTo(
              current.x,
              current.y,
              midX,
              midY
            );
          }

          const last = mappedPoints[mappedPoints.length - 1];
          const previous = mappedPoints[mappedPoints.length - 2];

          ctx.quadraticCurveTo(
            last.x,
            last.y,
            last.x,
            last.y
          );
        }

        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();

        /*
         * Only tiny endpoint markers are shown.
         * We deliberately do NOT draw all 10 keypoint circles,
         * because those made the previous overlay look cluttered.
         */
        [mappedPoints[0], mappedPoints[mappedPoints.length - 1]]
          .forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2.8, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.95;
            ctx.fill();
          });

        ctx.restore();
      });
    };

    if (image.complete) {
      drawOverlay();
    } else {
      image.addEventListener("load", drawOverlay);
    }

    window.addEventListener("resize", drawOverlay);

    return () => {
      image.removeEventListener("load", drawOverlay);
      window.removeEventListener("resize", drawOverlay);
    };
  }, [palmAnalysis, palmPreview]);
  useEffect(() => {
    if (activePage !== "reading-analytics") {
      return;
    }

    const fetchTotalReadings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/total-readings`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch total readings."
          );
        }

        console.log("Total readings:", data);

        setTotalReadings(data.total_readings);
      } catch (error) {
        console.error("Total readings error:", error);
      }
    };

    fetchTotalReadings();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "reading-analytics") {
      return;
    }

    const fetchUsersServed = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/users-served`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch users served."
          );
        }

        console.log("Users served:", data);

        setUsersServed(data.users_served);
      } catch (error) {
        console.error("Users served error:", error);
      }
    };

    fetchUsersServed();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "reading-analytics") {
      return;
    }

    const fetchCardsUsed = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/cards-used`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch cards used."
          );
        }

        console.log("Cards used:", data);

        setCardsUsed(data.cards_used);
      } catch (error) {
        console.error("Cards used error:", error);
      }
    };

    fetchCardsUsed();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "reading-analytics") {
      return;
    }

    const fetchReadingActivity = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/reading-activity`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch reading activity."
          );
        }

        console.log("READING ACTIVITY API RESPONSE:", data);
        console.log("READING ACTIVITY DATA:", data.reading_activity);

        setReadingActivity(data.reading_activity || {});
      } catch (error) {
        console.error("Reading activity error:", error);
      }
    };

    fetchReadingActivity();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "reading-analytics") return;
    console.log("SCHEDULED SESSIONS EFFECT CALLED");

    const fetchScheduledSessions = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/scheduled-sessions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch scheduled sessions."
          );
        }

        console.log("Scheduled sessions:", data);

        setScheduledSessions(data.scheduled_sessions || 0);
      } catch (error) {
        console.error("Scheduled sessions error:", error);
        setScheduledSessions(0);
      }
    };

    fetchScheduledSessions();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "reading-analytics") return;

    const fetchSpreadUsage = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/spread-usage`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch spread usage."
          );
        }

        console.log("Spread usage:", data);

        setSpreadUsage(data.spread_usage || []);
      } catch (error) {
        console.error("Spread usage error:", error);
        setSpreadUsage([]);
      }
    };

    fetchSpreadUsage();
  }, [activePage]);

  

  useEffect(() => {
    if (activePage !== "user-engagement") {
      return;
    }

    const fetchActiveUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/active-users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch active users."
          );
        }

        console.log("Active users:", data);

        setActiveUsers(data.active_users || 0);
      } catch (error) {
        console.error("Active users error:", error);
        setActiveUsers(0);
      }
    };

    fetchActiveUsers();
  }, [activePage]);

 useEffect(() => {
    if (activePage !== "user-engagement") {
      return;
    }

    const fetchRepeatUsers = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/repeat-users`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch repeat users."
          );
        }

        console.log("Repeat users:", data);

        setRepeatUsers(data.repeat_users);
      } catch (error) {
        console.error("Repeat users error:", error);
      }
    };

    fetchRepeatUsers();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "user-engagement") {
      return;
    }

    const fetchAverageReadings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/average-readings-per-user`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch average readings."
          );
        }

        console.log("Average readings per user:", data);

        setAverageReadingsPerUser(
          data.average_readings_per_user
        );
      } catch (error) {
        console.error(
          "Average readings per user error:",
          error
        );
      }
    };

    fetchAverageReadings();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "session-tracking") {
      return;
    }

    const fetchTotalSessions = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/total-sessions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch total sessions."
          );
        }

        console.log("Total sessions:", data);

        setTotalSessions(data.total_sessions);
      } catch (error) {
        console.error("Total sessions error:", error);
      }
    };

    fetchTotalSessions();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "session-tracking") {
      return;
    }

    const fetchSessionStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/session-status`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch session status."
          );
        }

        console.log("Session status:", data);

        setSessionStatus(data.status);
      } catch (error) {
        console.error("Session status error:", error);
      }
    };

    fetchSessionStatus();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "session-tracking") {
      return;
    }

    const fetchRecentSessions = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/recent-sessions`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch recent sessions."
          );
        }

        console.log("Recent sessions:", data);

        setRecentSessions(data.recent_sessions);
      } catch (error) {
        console.error("Recent sessions error:", error);
      }
    };

    fetchRecentSessions();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "session-tracking") return;

    const fetchSessionStatusSummary = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/analytics/session-status-summary`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch session status summary."
          );
        }

        console.log("Session status summary:", data);

        setSessionStatusSummary(data);
      } catch (error) {
        console.error(
          "Session status summary error:",
          error
        );
      }
    };

    fetchSessionStatusSummary();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "report-management") {
      return;
    }

    const fetchTarotReports = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/tarot/reports`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to fetch Tarot reports."
          );
        }

        console.log("Tarot reports:", data);

        setTarotReports(data.reports || []);
      } catch (error) {
        console.error("Tarot reports error:", error);
      }
    };

    fetchTarotReports();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "consultant-user-trends") {
      return;
    }

    const fetchConsultantUserTrends = async () => {
      setConsultantUserTrendsLoading(true);
      setConsultantUserTrendsError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/consultant/user-trends`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load user trends."
          );
        }

        console.log(
          "Consultant user trends:",
          data
        );

        setConsultantUserTrends(data);

      } catch (error) {

        console.error(
          "Consultant user trends error:",
          error
        );

        setConsultantUserTrendsError(
          error.message ||
            "Unable to load user trends."
        );

      } finally {

        setConsultantUserTrendsLoading(false);

      }
    };

    fetchConsultantUserTrends();

  }, [activePage]);

  useEffect(() => {
    if (activePage !== "guidance-effectiveness") {
      return;
    }

    const fetchGuidanceEffectiveness = async () => {
      setGuidanceEffectivenessLoading(true);
      setGuidanceEffectivenessError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/consultant/guidance-effectiveness`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load guidance effectiveness."
          );
        }

        console.log(
          "Guidance effectiveness:",
          data
        );

        setGuidanceEffectiveness(data);

      } catch (error) {

        console.error(
          "Guidance effectiveness error:",
          error
        );

        setGuidanceEffectivenessError(
          error.message ||
          "Unable to load guidance effectiveness."
        );

      } finally {

        setGuidanceEffectivenessLoading(false);

      }
    };

    fetchGuidanceEffectiveness();

  }, [activePage]);

  useEffect(() => {
    if (activePage !== "consultation-insights") {
      return;
    }

    const fetchConsultationInsights = async () => {
      setConsultationInsightsLoading(true);
      setConsultationInsightsError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/consultant/consultation-insights`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load consultation insights."
          );
        }

        console.log(
          "Consultation insights:",
          data
        );

        setConsultationInsights(data);

      } catch (error) {

        console.error(
          "Consultation insights error:",
          error
        );

        setConsultationInsightsError(
          error.message ||
          "Unable to load consultation insights."
        );

      } finally {

        setConsultationInsightsLoading(false);

      }
    };

    fetchConsultationInsights();

  }, [activePage]);

  useEffect(() => {
    if (activePage !== "admin-user-management") {
      return;
    }

    const fetchAdminUsers = async () => {
      setAdminUsersLoading(true);
      setAdminUsersError("");

      try {
        const token = localStorage.getItem("access_token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [usersResponse, rolesResponse, recentResponse] =
          await Promise.all([
            fetch(`${API_URL}/admin/users`, {
              method: "GET",
              headers,
            }),

            fetch(`${API_URL}/admin/users-by-role`, {
              method: "GET",
              headers,
            }),

            fetch(`${API_URL}/admin/recent-users`, {
              method: "GET",
              headers,
            }),
          ]);

        const usersData = await usersResponse.json();
        const rolesData = await rolesResponse.json();
        const recentData = await recentResponse.json();

        if (!usersResponse.ok) {
          throw new Error(
            usersData.detail || "Failed to load users."
          );
        }

        if (!rolesResponse.ok) {
          throw new Error(
            rolesData.detail || "Failed to load user roles."
          );
        }

        if (!recentResponse.ok) {
          throw new Error(
            recentData.detail ||
              "Failed to load recent users."
          );
        }

        setAdminUsers(usersData);
        setAdminUsersByRole(rolesData);
        setAdminRecentUsers(recentData);

      } catch (error) {
        console.error(
          "Administrator user management error:",
          error
        );

        setAdminUsersError(
          error.message ||
            "Unable to load administrator user data."
        );
      } finally {
        setAdminUsersLoading(false);
      }
    };

    fetchAdminUsers();

  }, [activePage]);

  useEffect(() => {
    if (activePage !== "admin-platform-analytics") return;

    const fetchPlatformAnalytics = async () => {
      setAdminAnalyticsLoading(true);
      setAdminAnalyticsError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Not authenticated.");
        }

        const response = await fetch(
          `${API_URL}/admin/platform-analytics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load platform analytics."
          );
        }

        setAdminAnalytics(data);

      } catch (error) {
        console.error(
          "Platform analytics error:",
          error
        );

        setAdminAnalyticsError(
          error.message ||
            "Unable to load platform analytics."
        );

      } finally {
        setAdminAnalyticsLoading(false);
      }
    };

    fetchPlatformAnalytics();
  }, [activePage]);

  useEffect(() => {
    if (activePage !== "admin-reading-statistics") return;

    const fetchReadingStatistics = async () => {
      setAdminReadingStatsLoading(true);
      setAdminReadingStatsError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Not authenticated.");
        }

        const response = await fetch(
          `${API_URL}/admin/reading-statistics`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load reading statistics."
          );
        }

        setAdminReadingStats(data);

      } catch (error) {
        console.error(
          "Reading statistics error:",
          error
        );

        setAdminReadingStatsError(
          error.message ||
            "Unable to load reading statistics."
        );

      } finally {
        setAdminReadingStatsLoading(false);
      }
    };

    fetchReadingStatistics();

  }, [activePage]);

  useEffect(() => {
    if (
      activePage !== "admin-system-reports" &&
      activePage !== "admin-palm-reports" &&
      activePage !== "admin-tarot-reports"
    ) {
      return;
    }

    const fetchSystemReports = async () => {
      setAdminSystemReportsLoading(true);
      setAdminSystemReportsError("");

      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Not authenticated.");
        }

        const response = await fetch(
          `${API_URL}/admin/system-reports`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Failed to load system reports."
          );
        }

        setAdminSystemReports(data);

      } catch (error) {
        console.error(
          "System reports error:",
          error
        );

        setAdminSystemReportsError(
          error.message ||
          "Unable to load system reports."
        );

      } finally {
        setAdminSystemReportsLoading(false);
      }
    };

    fetchSystemReports();
  }, [activePage]);

  useEffect(() => {
    if (
      (role !== "User" && role !== "Tarot Reader") ||
      activePage !== "notifications"
    ) {
      return;
  }

    const fetchNotifications = async () => {
      setNotificationsLoading(true);
      setNotificationsError("");

      try {
        const token = localStorage.getItem("access_token");

        const response = await fetch(
          `${API_URL}/notifications/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Unable to load notifications."
          );
        }

        setNotifications(data.notifications || []);
      } catch (error) {
        console.error("Notifications error:", error);

        setNotifications([]);
        setNotificationsError(
          error.message || "Unable to load notifications."
        );
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [role, activePage]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to mark notification as read."
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) =>
          notification.notification_id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      );
    } catch (error) {
      console.error("Mark notification as read error:", error);
    }
  };

  const sendAnnouncement = async () => {
    if (!announcementTitle.trim() || !announcementMessage.trim()) {
      alert("Please enter both a title and a message.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/notifications/announcement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: announcementTitle,
            message: announcementMessage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to send announcement."
        );
      }

      alert("Announcement sent successfully.");

      setAnnouncementTitle("");
      setAnnouncementMessage("");

    } catch (error) {
      console.error(
        "Announcement error:",
        error
      );

      alert(
        error.message ||
        "Unable to send announcement."
      );
    }
  };

  const createDailyGuidance = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/notifications/daily-guidance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to generate daily guidance."
        );
      }

      setNotifications((previousNotifications) => [
        data.notification,
        ...previousNotifications,
      ]);

    } catch (error) {
      console.error(
        "Daily guidance error:",
        error
      );
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to mark all notifications as read."
        );
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
    } catch (error) {
      console.error(
        "Mark all notifications as read error:",
        error
      );
    }
  };

  // =====================================================

  // =====================================================
  // MESSAGES
  // =====================================================

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementMessage, setAnnouncementMessage] = useState("");

  // =====================================================
  // ROLE INFORMATION
  // =====================================================

  const roles = [
    {
      id: "1",
      icon: "👤",
      title: "User",
      shortTitle: "Explorer",
      description:
        "Get personalized tarot and palm readings for guidance and self-discovery.",
      tagline: "Discover your inner journey",
    },
    {
      id: "2",
      icon: "🔮",
      title: "Tarot Reader",
      shortTitle: "Card Reader",
      description:
        "Provide tarot readings and interpret cards to guide users.",
      tagline: "Reveal meaningful insights",
    },
    {
      id: "3",
      icon: "✨",
      title: "Spiritual Consultant",
      shortTitle: "Guide",
      description:
        "Offer spiritual guidance and personalized insights for personal growth.",
      tagline: "Guide meaningful journeys",
    },
    {
      id: "4",
      icon: "🛡️",
      title: "Administrator",
      shortTitle: "Platform Admin",
      description:
        "Manage users, readers, consultants, readings, and platform operations.",
      tagline: "Manage the platform",
    },
  ];

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const formData = new URLSearchParams();

      formData.append("username", loginData.username);
      formData.append("password", loginData.password);

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Login failed"
        );
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      );

      const profileResponse = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization:
              `Bearer ${data.access_token}`,
          },
        }
      );

      const profileData =
        await profileResponse.json();

      if (!profileResponse.ok) {
        throw new Error(
          profileData.detail ||
            "Failed to fetch profile"
        );
      }

      setCurrentUser(profileData);
      setActivePage("dashboard");
      setMessage("Login successful!");

      console.log(
        "Logged-in user:",
        profileData
      );

      console.log("USER ROLE NAME:",profileData?.role_name);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // REGISTRATION - STEP 1 VALIDATION
  // =====================================================

  const handleContinueRegistration = (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // Username
    if (!registerData.username.trim()) {
      setError("Please enter your username.");
      return;
    }

    // Email
    if (!registerData.email.trim()) {
      setError("Please enter your email.");
      return;
    }

    // Gender
    if (!registerData.gender) {
      setError("Please select your gender.");
      return;
    }

    // Password
    if (!registerData.password) {
      setError("Please create a password.");
      return;
    }

    // Confirm password
    if (!registerData.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    // Password match
    if (
      registerData.password !==
      registerData.confirmPassword
    ) {
      setError("Passwords do not match.");
      return;
    }

    // Role is selected through the role picker on this page.
    if (!registerData.role_id) {
      setError("Please select a role.");
      return;
    }

    handleRegister();
  };

  // =====================================================
  // REGISTRATION - FINAL SUBMIT
  // =====================================================

  const handleRegister = async (e) => {
    if (e) {
      e.preventDefault();
    }

    setMessage("");
    setError("");

    // Validate role
    if (!registerData.role_id) {
      setError("Please select a role.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/register`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            username: registerData.username,
            email: registerData.email,
            gender: registerData.gender,
            password: registerData.password,
            role_id: Number(
              registerData.role_id
            ),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Registration failed"
        );
      }

      setMessage(
        "Registration successful! You can now login."
      );

      setRegisterData({
        username: "",
        email: "",
        gender: "",
        password: "",
        confirmPassword: "",
        role_id: "",
      });

      
      setIsRegister(false);
      setShowRolePicker(false);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the server."
      );
    }
  };

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "access_token"
    );

    setCurrentUser(null);

    setLoginData({
      username: "",
      password: "",
    });

    setProfileData({
      username: "",
      email: "",
      gender: "",
      age_group: "",
      interests: "",
      spiritual_goals: "",
      reading_preferences: "",
    });

    setIsEditingProfile(false);
    setShowRolePicker(false);
    setActivePage("dashboard");

    setPalmImage(null);
    setPalmPreview(null);
    setPalmAnalysisStarted(false);

    setTarotReadingStarted(false);
    setTarotQuestion("");

    setMessage(
      "Logged out successfully."
    );

    setError("");
  };

  // =====================================================
  // UPDATE PROFILE
  // =====================================================

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const token =
      localStorage.getItem(
        "access_token"
      );

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/auth/profile`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            username: profileData.username,
            email: profileData.email,
            gender: profileData.gender,
            age_group: profileData.age_group,
            interests: profileData.interests,
            spiritual_goals: profileData.spiritual_goals,
            reading_preferences: profileData.reading_preferences,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Profile update failed"
        );
      }

      setCurrentUser(data);
      setIsEditingProfile(false);

      setMessage(
        "Profile updated successfully!"
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // PLATFORM ANALYTICS CHART DATA
  // =====================================================

  const activityTrend = adminAnalytics?.activity_trend ?? []; 
  const tarotSpreadUsage =
    adminReadingStats?.tarot_statistics?.spread_usage ?? [];

  const tarotSpreadChartData = {
    labels: tarotSpreadUsage.map(
      (item) => item.spread_name
    ),

    datasets: [
      {
        label: "Number of Readings",

        data: tarotSpreadUsage.map(
          (item) => item.count
        ),

        backgroundColor: "#6c4ce5",

        borderRadius: 8,

        barThickness: 50,
      },
    ],
  };

  const tarotSpreadChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Tarot Spread Usage",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} readings`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 5,
        },

        title: {
          display: true,
          text: "Number of Readings",
          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const cardCountDistribution =
    adminReadingStats?.tarot_statistics
      ?.card_count_distribution ?? [];

  const cardCountChartData = {
    labels: cardCountDistribution.map(
      (item) => `${item.card_count} Card${item.card_count !== 1 ? "s" : ""}`
    ),

    datasets: [
      {
        label: "Number of Readings",

        data: cardCountDistribution.map(
          (item) => item.reading_count
        ),

        backgroundColor: "#e67e22",

        borderRadius: 8,

        barThickness: 55,
      },
    ],
  };

  const cardCountChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Card Count Distribution",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} readings`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 5,
        },

        title: {
          display: true,
          text: "Number of Readings",
          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const palmShapeUsage =
    adminReadingStats?.palm_statistics
      ?.palm_shape_usage ?? [];

  const palmShapeChartData = {
    labels: palmShapeUsage.map(
      (item) => item.palm_shape
    ),

    datasets: [
      {
        label: "Number of Analyses",

        data: palmShapeUsage.map(
          (item) => item.count
        ),

        backgroundColor: "#6c4ce5",

        borderRadius: 8,

        barThickness: 50,
      },
    ],
  };

  const palmShapeChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Palm Shape Usage",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} analyses`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 1,
        },

        title: {
          display: true,
          text: "Number of Analyses",
          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const fingerStructureUsage =
    adminReadingStats?.palm_statistics
      ?.finger_structure_usage ?? [];

  const fingerStructureChartData = {
    labels: fingerStructureUsage.map(
      (item) => item.finger_structure
    ),

    datasets: [
      {
        label: "Number of Analyses",

        data: fingerStructureUsage.map(
          (item) => item.count
        ),

        backgroundColor: "#e67e22",

        borderRadius: 8,

        barThickness: 50,
      },
    ],
  };

  const fingerStructureChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Finger Structure Usage",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} analyses`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 1,
        },

        title: {
          display: true,
          text: "Number of Analyses",
          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const palmLineUsage =
    adminReadingStats?.palm_statistics
      ?.palm_line_usage ?? [];

  const palmLineChartData = {
    labels: palmLineUsage.map(
      (item) =>
        `${item.line.charAt(0).toUpperCase()}${item.line.slice(1)} Line`
    ),

    datasets: [
      {
        label: "Number of Analyses",

        data: palmLineUsage.map(
          (item) => item.count
        ),

        backgroundColor: "#6c4ce5",

        borderRadius: 8,

        barThickness: 50,
      },
    ],
  };

  const palmLineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Palm Line Usage",
        font: {
          size: 16,
          weight: "600",
        },
        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} analyses`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 1,
        },

        title: {
          display: true,
          text: "Number of Analyses",
          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const readingActivityData =
    adminReadingStats?.reading_activity ?? [];

  const readingActivityChartData = {
    labels: readingActivityData.map((item) => {
      const date = new Date(item.date);

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }),

    datasets: [
      {
        label: "Reading Activity",

        data: readingActivityData.map(
          (item) => item.count
        ),

        borderColor: "#6c4ce5",
        backgroundColor: "#6c4ce5",

        borderWidth: 3,

        pointRadius: 5,
        pointHoverRadius: 7,

        tension: 0.15,
      },
    ],
  };
  const readingActivityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",

        labels: {
          usePointStyle: true,
          pointStyle: "circle",

          padding: 20,

          font: {
            size: 13,
            weight: "600",
          },
        },
      },

      title: {
        display: true,

        text: "Reading Activity Over Time",

        font: {
          size: 16,
          weight: "600",
        },

        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} readings`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 5,
        },

        title: {
          display: true,

          text: "Number of Readings",

          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const activityChartData = {
    labels: activityTrend.map((item) => {
      const date = new Date(item.date);

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
      });
    }),

    datasets: [
      {
        label: "Palm Analyses",
        data: activityTrend.map((item) => item.palm),

        borderColor: "#6c4ce5",
        backgroundColor: "#6c4ce5",

        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,

        tension: 0.15,
      },

      {
        label: "Tarot Readings",
        data: activityTrend.map((item) => item.tarot),

        borderColor: "#e67e22",
        backgroundColor: "#e67e22",

        borderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,

        tension: 0.35,
      },
    ],
  };


  const activityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
      mode: "index",
      intersect: false,
    },

    plugins: {
      legend: {
        position: "top",

        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
          font: {
            size: 13,
            weight: "600",
          },
        },
      },

      title: {
        display: true,
        text: "Platform Activity Over Time",

        font: {
          size: 16,
          weight: "600",
        },

        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        backgroundColor: "rgba(30, 30, 40, 0.95)",

        titleFont: {
          size: 13,
          weight: "600",
        },

        bodyFont: {
          size: 13,
        },

        padding: 12,

        displayColors: true,
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 12,
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 5,
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },

        title: {
          display: true,
          text: "Number of Activities",

          font: {
            size: 12,
            weight: "600",
          },
        },
      },
    },
  };

  // =====================================================
  // ANALYSIS DISTRIBUTION CHART
  // =====================================================

  const analysisDistribution =
    adminAnalytics?.analysis_distribution ?? {};

  const analysisDistributionChartData = {
    labels: ["Palm Analysis", "Tarot Readings"],

    datasets: [
      {
        label: "Number of Readings",

        data: [
          analysisDistribution.palm_analysis ?? 0,
          analysisDistribution.tarot_readings ?? 0,
        ],

        backgroundColor: [
          "#6c4ce5",
          "#e67e22",
        ],

        borderRadius: 8,

        barThickness: 55,
      },
    ],
  };

  const analysisDistributionChartOptions = {
    responsive: true,

    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },

      title: {
        display: true,
        text: "Palm vs Tarot Activity",

        font: {
          size: 16,
          weight: "600",
        },

        padding: {
          bottom: 20,
        },
      },

      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.raw} readings`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },

        ticks: {
          font: {
            size: 13,
            weight: "600",
          },
        },
      },

      y: {
        beginAtZero: true,

        ticks: {
          precision: 0,
          stepSize: 5,
        },

        title: {
          display: true,
          text: "Number of Readings",

          font: {
            size: 12,
            weight: "600",
          },
        },

        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  const usersByRole = adminAnalytics?.users_by_role ?? [];
  const totalUsers =
    adminAnalytics?.overview?.total_users ?? 0;

  const totalAnalyses =
    adminAnalytics?.overview?.total_analyses ?? 0;

  const totalPalmAnalyses =
    adminAnalytics?.overview?.total_palm_analyses ?? 0;

  const totalTarotReadings =
    adminAnalytics?.overview?.total_tarot_readings ?? 0;

  const tarotPercentage =
    totalAnalyses > 0
      ? Math.round((totalTarotReadings / totalAnalyses) * 100)
      : 0;

  const topUserRole =
    usersByRole.length > 0
      ? usersByRole.reduce((highest, current) =>
          current.count > highest.count ? current : highest
        )
      : null;

  const peakActivity =
    activityTrend.length > 0
      ? activityTrend.reduce((highest, current) =>
          current.total > highest.total ? current : highest
        )
      : null;

const usersByRoleChartData = {
  labels: usersByRole.map((item) => item.role),

  datasets: [
    {
      label: "Number of Users",

      data: usersByRole.map((item) => item.count),

      backgroundColor: "#6c4ce5",

      borderRadius: 8,

      barThickness: 45,
    },
  ],
};

const usersByRoleChartOptions = {
  responsive: true,
  maintainAspectRatio: false,

  plugins: {
    legend: {
      display: false,
    },

    title: {
      display: true,
      text: "Users by Role",
      font: {
        size: 16,
        weight: "600",
      },
      padding: {
        bottom: 20,
      },
    },

    tooltip: {
      callbacks: {
        label: function (context) {
          return ` ${context.raw} users`;
        },
      },
    },
  },

  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        font: {
          size: 12,
          weight: "600",
        },
      },
    },

    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
        stepSize: 5,
      },
      title: {
        display: true,
        text: "Number of Users",
        font: {
          size: 12,
          weight: "600",
        },
      },
      grid: {
        color: "rgba(0, 0, 0, 0.08)",
      },
    },
  },
};

  // =====================================================
  // DASHBOARD
  // =====================================================

  const renderDashboard = () => {

    if (role === "Tarot Reader") {
      return (
        <div className="dashboard-content">

          <div className="system-reports-header">
            <div className="system-reports-title-area">

              <div className="system-reports-title-icon">
                🔮
              </div>

              <div>
                <span className="system-reports-label">
                  TAROT READER
                </span>

                <h2>
                  Tarot Reader Dashboard
                </h2>

                <p>
                  Manage readings, sessions, user engagement and reports.
                </p>
              </div>

            </div>
          </div>

          <div className="feature-grid">

            {/* Session Requests */}
            <div
              className="feature-card tarot-reader-card"
              onClick={() => setActivePage("create-tarot-session")}
            >
              <div className="feature-icon">📩</div>
              <h3>Session Requests</h3>
              <p>
                Review user requests and accept or reject Tarot sessions.
              </p>
            </div>


            {/* Reading Analytics */}
            <div
              className="feature-card tarot-reader-card"
              onClick={() => setActivePage("reading-analytics")}
            >
              <div className="feature-icon">📊</div>

              <h3>Reading Analytics</h3>

              <p>
                View tarot reading activity and reading statistics.
              </p>
            </div>


            {/* User Engagement */}
            <div
              className="feature-card tarot-reader-card"
              onClick={() => setActivePage("user-engagement")}
            >
              <div className="feature-icon">👥</div>

              <h3>User Engagement</h3>

              <p>
                Review user interaction and engagement with readings.
              </p>
            </div>


            {/* Session Tracking */}
            <div
              className="feature-card tarot-reader-card"
              onClick={() => setActivePage("session-tracking")}
            >
              <div className="feature-icon">🕒</div>

              <h3>Session Tracking</h3>

              <p>
                Track tarot reading sessions and their activity.
              </p>
            </div>


            {/* Report Management */}
            <div
              className="feature-card tarot-reader-card"
              onClick={() => setActivePage("report-management")}
            >
              <div className="feature-icon">📄</div>

              <h3>Report Management</h3>

              <p>
                Manage tarot reading reports and generated results.
              </p>
            </div>

          </div>

          <div className="insight-card">
            <h3>🔮 Tarot Reader Workspace</h3>

            <p>
              Use the dashboard to monitor readings, understand user
              engagement, track sessions and manage reports.
            </p>
          </div>

        </div>
      );
    }

    if (role === "Spiritual Consultant") {
      return (
        <div className="dashboard-content">

          <div className="system-reports-header">
            <div className="system-reports-title-area">

              <div className="system-reports-title-icon">
                ✨
              </div>

              <div>
                <span className="system-reports-label">
                  SPIRITUAL CONSULTANT
                </span>

                <h2>
                  Spiritual Consultant Dashboard
                </h2>

                <p>
                  Review user trends, guidance effectiveness and consultation insights.
                </p>
              </div>

            </div>
          </div>

          <div className="feature-grid">

            <div
              className="feature-card"
              onClick={() => setActivePage("consultant-user-trends")}
            >
              <div className="feature-icon">📈</div>

              <h3>User Trend Analysis</h3>

              <p>
                Review reading patterns, recurring themes and user growth trends.
              </p>
            </div>

            <div
              className="feature-card"
              onClick={() => setActivePage("guidance-effectiveness")}
            >
              <div className="feature-icon">🎯</div>

              <h3>Guidance Effectiveness</h3>

              <p>
                Review how guidance and recommendations are being used across readings.
              </p>
            </div>

            <div
              className="feature-card"
              onClick={() => setActivePage("consultation-insights")}
            >
              <div className="feature-icon">💡</div>

              <h3>Consultation Insights</h3>

              <p>
                Review consultation patterns, common themes and reading insights.
              </p>
            </div>

          </div>

          <div className="insight-card">
            <h3>✨ Consultant Workspace</h3>

            <p>
              Use this dashboard to understand user trends, review guidance
              effectiveness and explore consultation insights.
            </p>
          </div>

        </div>
      );
    }

    if (role === "Administrator") {
      return (
        <div className="dashboard-content">

          <div className="system-reports-header">
            <div className="system-reports-title-area">

              <div className="system-reports-title-icon">
                🛡️
              </div>

              <div>
                <span className="system-reports-label">
                  ADMINISTRATOR
                </span>

                <h2>
                  Administrator Dashboard
                </h2>

                <p>
                  Manage users, monitor platform activity,
                  review reading statistics and system reports.
                </p>
              </div>

            </div>
          </div>

          <div className="feature-grid">

            {/* User Management */}
            <div
              className="feature-card"
              onClick={() => setActivePage("admin-user-management")}
            >
              <div className="feature-icon">👥</div>

              <h3>User Management</h3>

              <p>
                Manage users, roles and recently registered accounts.
              </p>
            </div>

            {/* Platform Analytics */}
            <div
              className="feature-card"
              onClick={() => setActivePage("admin-platform-analytics")}
            >
              <div className="feature-icon">📊</div>

              <h3>Platform Analytics</h3>

              <p>
                Monitor overall platform activity across Palmistry and Tarot.
              </p>
            </div>

            {/* Reading Statistics */}
            <div
              className="feature-card"
              onClick={() => setActivePage("admin-reading-statistics")}
            >
              <div className="feature-icon">📈</div>

              <h3>Reading Statistics</h3>

              <p>
                Review Palm analysis and Tarot reading statistics.
              </p>
            </div>

            {/* System Reports */}
            <div
              className="feature-card"
              onClick={() => setActivePage("admin-system-reports")}
            >
              <div className="feature-icon">📄</div>

              <h3>System Reports</h3>

              <p>
                Review platform reports and generated reading information.
              </p>
            </div>

          </div>

          <div className="insight-card">
            <h3>🛡️ Administrator Workspace</h3>

            <p>
              Use this dashboard to manage the platform and monitor
              Palmistry and Tarot activity.
            </p>
          </div>

        </div>
      );
    }

    return (
      <div className="dashboard-content">

        <div className="dashboard-hero">

          <div>

            <span className="hero-label">
              ✨ PERSONALIZED EXPERIENCE
            </span>

            <h2>
              Welcome,{" "}
              {currentUser.username}
            </h2>

            <p>
              Explore your personalized
              spiritual insights through
              AI-powered palmistry and
              tarot experiences.
            </p>

          </div>

          <div className="hero-symbol">
            🔮
          </div>

        </div>

        <div className="section-title">

          <h3>
            Explore Your Journey
          </h3>

          <p>
            Choose an experience to
            begin your reading.
          </p>

        </div>

        <div className="feature-grid">

          {/* TAROT */}

          <div
            className="feature-card tarot-card"
            onClick={() =>
              setActivePage("tarot")
            }
          >

            <div className="feature-icon">
              🔮
            </div>

            <h3>
              Tarot Reading
            </h3>

            <p>
              Discover meaningful
              insights through an
              AI-powered tarot reading
              experience.
            </p>

            <button
              className="feature-button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("tarot");
              }}
            >
              Explore Tarot →
            </button>

          </div>

          {/* PALM */}

          <div
            className="feature-card palm-card"
            onClick={() =>
              setActivePage("palm")
            }
          >

            <div className="feature-icon">
              ✋
            </div>

            <h3>
              Palm Reading
            </h3>

            <p>
              Upload your palm image
              and discover personalized
              palmistry insights.
            </p>

            <button
              className="feature-button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("palm");
              }}
            >
              Explore Palmistry →
            </button>

          </div>

          {/* HISTORY */}

          <div
            className="feature-card history-card"
            onClick={() =>
              setActivePage("history")
            }
          >

            <div className="feature-icon">
              📜
            </div>

            <h3>
              Reading History
            </h3>

            <p>
              View and revisit your
              previous tarot and
              palmistry readings.
            </p>

            <button
              className="feature-button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("history");
              }}
            >
              View History →
            </button>

          </div>

          {/* REQUEST TAROT SESSION */}

          <div
            className="feature-card"
            onClick={() =>
              setActivePage("request-tarot-session")
            }
          >

            <div className="feature-icon">
              📅
            </div>

            <h3>
              Request Tarot Session
            </h3>

            <p>
              Schedule a Tarot session with
              a Tarot Reader at your preferred time.
            </p>

            <button
              className="feature-button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePage("request-tarot-session");
              }}
            >
              Request Session →
            </button>

          </div>

        </div>

        {/* =====================================================
            PERSONALIZED GUIDANCE
            ===================================================== */}

        {aiInterpretation?.recommendations?.length > 0 && (
          <div className="dashboard-guidance-card">

            <div className="dashboard-guidance-header">

              <div className="insight-icon">
                💡
              </div>

              <div>
                <h3>
                  Personalized Guidance
                </h3>

                <p>
                  AI-assisted guidance based on your
                  reading patterns and detected features.
                </p>
              </div>

            </div>

            {/* =====================================================
                SPIRITUAL GUIDANCE SCORE
                ===================================================== */}

            {aiInterpretation?.spiritual_guidance_score && (
              <div
                style={{
                  marginTop: "20px",
                  marginBottom: "20px",
                  padding: "20px",
                  borderRadius: "14px",
                  background: "#f8f7ff",
                  border: "1px solid #e5e0ff"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "18px"
                  }}
                >
                  <div>
                    <h4 style={{ margin: 0 }}>
                      🧘 Spiritual Guidance Score
                    </h4>

                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "13px",
                        opacity: 0.7
                      }}
                    >
                      Weighted score based on your current reading.
                    </p>
                  </div>

                  <strong
                    style={{
                      fontSize: "32px"
                    }}
                  >
                    {aiInterpretation.spiritual_guidance_score.overall_score}
                    <span style={{ fontSize: "16px" }}>
                      /100
                    </span>
                  </strong>
                </div>

                {/* SCORE BREAKDOWN */}

                {[
                  [
                    "Palm Analysis Confidence",
                    aiInterpretation.spiritual_guidance_score.palm_analysis_confidence,
                    "30%"
                  ],
                  [
                    "Tarot Interpretation Relevance",
                    aiInterpretation.spiritual_guidance_score.tarot_interpretation_relevance,
                    "25%"
                  ],
                  [
                    "Personality Alignment",
                    aiInterpretation.spiritual_guidance_score.personality_alignment,
                    "20%"
                  ],
                  [
                    "User Context Relevance",
                    aiInterpretation.spiritual_guidance_score.user_context_relevance,
                    "15%"
                  ],
                  [
                    "Reading Consistency",
                    aiInterpretation.spiritual_guidance_score.reading_consistency,
                    "10%"
                  ]
                ].map(([label, score, weight]) => (
                  <div
                    key={label}
                    style={{
                      marginBottom: "14px"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "5px",
                        fontSize: "13px"
                      }}
                    >
                      <span>
                        <strong>{label}</strong>
                        <span style={{ opacity: 0.6 }}>
                          {" "}({weight})
                        </span>
                      </span>

                      <strong>
                        {score}
                      </strong>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        background: "#e9e5f7",
                        borderRadius: "20px",
                        overflow: "hidden"
                      }}
                    >
                      <div
                        style={{
                          width: `${score}%`,
                          height: "100%",
                          background: "#6c4ce5",
                          borderRadius: "20px",
                          transition: "width 0.5s ease"
                        }}
                      />
                    </div>
                  </div>
                ))}

                <p
                  style={{
                    marginTop: "16px",
                    marginBottom: 0,
                    fontSize: "12px",
                    opacity: 0.65
                  }}
                >
                  This score is generated from the weighted guidance
                  factors defined by the project requirements.
                </p>
              </div>
            )}

            <div className="dashboard-guidance-list">

              {aiInterpretation.recommendations.map(
                (recommendation, index) => (
                  <div
                    className="dashboard-guidance-item"
                    key={index}
                  >

                    <span>•</span>

                    <p>
                      {recommendation}
                    </p>

                  </div>
                )
              )}

            </div>

          </div>
        )}

        {/* =====================================================
            LIFE TREND ANALYSIS
            ===================================================== */}

        {aiInterpretation?.life_trend_analysis && (
          <div className="dashboard-life-trend-card">

            <div className="dashboard-life-trend-header">

              <div className="insight-icon">
                📈
              </div>

              <div>
                <h3>Life Trend Analysis</h3>

                <p>
                  A visual summary of patterns detected from your
                  palm shape, finger struture, and palm lines.
                </p>
              </div>

            </div>

            {/* DETECTED PALM PATTERNS */}

            <div className="dashboard-life-trend-section">

              <h4>🔍 Detected Palm Patterns</h4>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px",
                  marginTop: "10px"
                }}
              >
                {palmAnalysis?.palm_shape?.palm_shape && (
                  <span
                    style={{
                      padding: "7px 12px",
                      background: "#ede9fe",
                      borderRadius: "20px",
                      fontSize: "12px",
                      color: "#312e81",
                      fontWeight: "600"
                    }}
                  >
                    Palm: {palmAnalysis.palm_shape.palm_shape}
                  </span>
                )}
                {palmAnalysis?.finger_analysis?.finger_structure && (
                  <span
                    style={{
                      padding: "7px 12px",
                      background: "#ede9fe",
                      borderRadius: "20px",
                      fontSize: "12px",
                      color: "#312e81",
                      fontWeight: "600"
                    }}
                  >
                    Fingers: {palmAnalysis.finger_analysis.finger_structure}
                  </span>
                )}
                {palmAnalysis?.palm_lines?.lines
                  ?.filter((line) => line?.length_category)
                  .map((line, index) => (
                    <span
                      key={index}
                      style={{
                        padding: "7px 12px",
                        background: "#f5f3ff",
                        borderRadius: "20px",
                        fontSize: "12px",
                        color: "#4c1d95",
                        fontWeight: "600"
                      }}
                    >
                      {line.line}: {line.length_category}
                    </span>
                  ))
                }
              </div>
            </div>

            {/* LIFE TREND VISUAL SUMMARY */}

            {aiInterpretation.life_trend_analysis.trend_scores && (
              <div className="dashboard-life-trend-section">

                <h4>📈 Life Trend Visual Summary</h4>

                <p style={{ marginBottom: "16px" }}>
                  These scores represent the strength of themes detected from
                  the current palm patterns. They are used for visual comparison,
                  not as specific mesurements or predictions.
                </p>

                {[
                  [
                    "Life Path",
                    aiInterpretation.life_trend_analysis.trend_scores.life_path
                  ],
                  [
                    "Opportunities",
                    aiInterpretation.life_trend_analysis.trend_scores.opportunities
                  ],
                  [
                    "Challenges",
                    aiInterpretation.life_trend_analysis.trend_scores.challenges
                  ],
                  [
                    "Current Trends",
                    aiInterpretation.life_trend_analysis.trend_scores.trends
                  ],
                  [
                    "Growth Potential",
                    aiInterpretation.life_trend_analysis.trend_scores.growth_potential
                  ]
                ].map(([label, score]) => {

                  const safeScore = Math.max(
                    0,
                    Math.min(100, Number(score) || 0)
                  );

                  return (
                    <div
                      key={label}
                      style={{
                        marginBottom: "14px"
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "6px"
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#4b5563",
                            fontWeight: "600"
                          }}
                        >
                          {label}
                        </span>

                        <span
                          style={{
                            fontSize: "13px",
                            color: "#312e81",
                            fontWeight: "700"
                          }}
                        >
                          {safeScore}%
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "10px",
                          background: "#eeeefb",
                          borderRadius: "10px",
                          overflow: "hidden"
                        }}
                      >

                        <div
                          style={{
                            width: `${safeScore}%`,
                            height: "100%",
                            background: "#7c3aed",
                            borderRadius: "10px",
                            transition: "width 0.5s ease"
                          }}
                        />

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

            {/* LIFE PATH */}

            {aiInterpretation.life_trend_analysis.life_path?.length > 0 && (
              <div className="dashboard-life-trend-section">

                <h4>🧭 Life Path Analysis</h4>

                {aiInterpretation.life_trend_analysis.life_path.map(
                  (item, index) => (
                    <p key={index}>• {item}</p>
                  )
                )}

              </div>
            )}

            {/* OPPORTUNITIES */}

            {aiInterpretation.life_trend_analysis.opportunities?.length > 0 && (
              <div className="dashboard-life-trend-section">

                <h4>✨ Opportunity Identification</h4>

                {aiInterpretation.life_trend_analysis.opportunities.map(
                  (item, index) => (
                    <p key={index}>• {item}</p>
                  )
                )}

              </div>
            )}

            {/* CHALLENGES */}

            {aiInterpretation.life_trend_analysis.challenges?.length > 0 && (
              <div className="dashboard-life-trend-section">

                <h4>⚠️ Challenge Forecasting</h4>

                {aiInterpretation.life_trend_analysis.challenges.map(
                  (item, index) => (
                    <p key={index}>• {item}</p>
                  )
                )}

              </div>
            )}

            {/* TRENDS */}

            {aiInterpretation.life_trend_analysis.trends?.length > 0 && (
              <div className="dashboard-life-trend-section">

                <h4>📊 Trend Monitoring</h4>

                {aiInterpretation.life_trend_analysis.trends.map(
                  (item, index) => (
                    <p key={index}>• {item}</p>
                  )
                )}

              </div>
            )}

            {/* GROWTH POTENTIAL */}

            {aiInterpretation.life_trend_analysis.growth_potential?.length > 0 && (
              <div className="dashboard-life-trend-section">

                <h4>🌱 Growth Potential Assessment</h4>

                {aiInterpretation.life_trend_analysis.growth_potential.map(
                  (item, index) => (
                    <p key={index}>• {item}</p>
                  )
                )}

              </div>
            )}

          </div>
        )}
        {/* =====================================================
            TAROT SESSION INVITATIONS
            ===================================================== */}

        <div className="insight-card" style={{ marginTop: "20px" }}>

          <h3>📩 Tarot Session Invitations</h3>

          {tarotInvitationError && (
            <p style={{ color: "#dc2626" }}>
              {tarotInvitationError}
            </p>
          )}

          {tarotInvitations.length === 0 ? (
            <p>No pending Tarot session invitations.</p>
          ) : (
            <div style={{ marginTop: "15px" }}>

              {tarotInvitations.map((invitation) => (
                <div
                  key={invitation.session_id}
                  style={{
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                >

                  <p>
                    <strong>Tarot Reader:</strong>{" "}
                    {invitation.reader_name}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {invitation.scheduled_date}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {invitation.scheduled_time}
                  </p>

                  <p>
                    <strong>Reading Type:</strong>{" "}
                    {invitation.spread_type === "not_selected"
                    ? "To be selected during reading"
                    : invitation.spread_type}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {invitation.status}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                      marginTop: "12px",
                    }}
                  >

                    <button
                      className="primary-button"
                      style={{
                        width: "100%",
                        margin: 0,
                        boxSizing: "border-box",
                      }}
                      disabled={tarotInvitationActionLoading}
                      onClick={() =>
                        handleTarotInvitationResponse(
                          invitation.session_id,
                          "Accepted"
                        )
                      }
                    >
                      ✅ Accept
                    </button>

                    <button
                      className="secondary-button"
                      style={{
                        width: "100%",
                        margin: 0,
                        boxSizing: "border-box",
                      }}
                      disabled={tarotInvitationActionLoading}
                      onClick={() =>
                        handleTarotInvitationResponse(
                          invitation.session_id,
                          "Rejected"
                        )
                      }
                    >
                      ❌ Decline
                    </button>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
        {/* =====================================================
            MY TAROT SESSIONS
            ===================================================== */}

        <div className="insight-card" style={{ marginTop: "20px" }}>

          <h3>📅 My Tarot Sessions</h3>

          {myTarotSessionsLoading ? (
            <p>Loading your Tarot sessions...</p>
          ) : myTarotSessionsError ? (
            <p style={{ color: "#dc2626" }}>
              {myTarotSessionsError}
            </p>
          ) : myTarotSessions.length === 0 ? (
            <p>No Tarot sessions found.</p>
          ) : (
            <div style={{ marginTop: "15px" }}>

              {myTarotSessions.map((session) => (
                <div
                  key={session.session_id}
                  style={{
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    marginBottom: "12px",
                  }}
                >

                  <p>
                    <strong>Tarot Reader:</strong>{" "}
                    {session.reader_name}
                  </p>

                  <p>
                    <strong>Date:</strong>{" "}
                    {session.scheduled_date}
                  </p>

                  <p>
                    <strong>Time:</strong>{" "}
                    {session.scheduled_time}
                  </p>

                  <p>
                    <strong>Reading Type:</strong>{" "}
                    {session.spread_type == "not_selected"
                    ? "To be selected during reading"
                    : session.spread_type}
                  </p>

                  <p style={{ marginBottom: 0 }}>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        fontWeight: "700",
                        color:
                          session.status === "Scheduled"
                            ? "#16a34a"
                            : session.status === "Rejected"
                            ? "#dc2626"
                            : "#d97706",
                      }}
                    >
                      {session.status}
                    </span>
                  </p>
                  {session.status === "Scheduled" && (
                    <button
                      onClick={() =>
                        setActiveTarotChatSession(session)
                      }
                      style={{
                        marginTop: "12px",
                        padding: "10px 16px",
                        background: "#7c3aed",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                      }}
                    >
                      💬 Open Chat
                    </button>
                  )}

                </div>
              ))}

            </div>
          )}

        </div>

        {activeTarotChatSession && (
          <div
            className="insight-card tarot-chat-container"
            style={{
              marginTop: "20px",
              padding: "24px",
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <h3>💬 Tarot Session Chat</h3>

              <button
                onClick={() => {
                  setActiveTarotChatSession(null);
                  setTarotChatMessages([]);
                  setTarotChatDraft("");
                }}
                style={{
                  padding: "8px 12px",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                ✕ Close
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                padding: "14px",
                marginBottom: "18px",
                background: "#f5f3ff",
                borderRadius: "12px",
              }}
            >
              <div>
                <p style={{ margin: "0 0 6px" }}>
                  <strong>Tarot Reader:</strong>{" "}
                  {activeTarotChatSession.reader_name}
                </p>

                <p style={{ margin: 0 }}>
                  <strong>Session:</strong>{" "}
                  {activeTarotChatSession.scheduled_date} at{" "}
                  {activeTarotChatSession.scheduled_time}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  fetchTarotChatMessages(activeTarotChatSession.session_id)
                }
                disabled={tarotChatLoading}
                style={{
                  padding: "10px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ddd6fe",
                  cursor: "pointer",
                }}
              >
                {tarotChatLoading ? "Loading..." : "🔄 Refresh"}
              </button>
            </div>

            <div
              style={{
                marginTop: "16px",
                marginBottom: "16px",
                padding: "12px",
                height: "280px",
                minHeight: "280px",
                flexShrink: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                alignSelf: "stretch",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                background: "#fafafa",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              {tarotChatLoading ? (
                <p>Loading messages...</p>
              ) : tarotChatMessages.length === 0 ? (
                <p>No messages yet. Start the conversation!</p>
              ) : (
                tarotChatMessages.map((msg) => (
                  <div
                    key={msg.message_id}
                    style={{
                      marginBottom: "0",
                      padding: "12px 14px",
                      width: "100%",
                      boxSizing: "border-box",
                      borderRadius: "12px",
                      background: "#f3f4f6",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <p style={{ margin: "0 0 5px" }}>
                      <strong>
                        {msg.sender_name ||
                          `User ${msg.sender_id}`}
                      </strong>
                    </p>
                    <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </p>
                    {msg.created_at && (
                      <small style={{ color: "#6b7280" }}>
                        {new Date(msg.created_at).toLocaleString()}
                      </small>
                    )}
                  </div>
                ))
              )}
            </div>

            <div
              style={{
                marginTop: "20px",
                marginBottom: "20px",
                padding: "20px",
                maxWidth: "760px",
                width: "100%",
                border: "1px solid #ddd6fe",
                borderRadius: "14px",
                background: "#faf8ff",
                boxSizing: "border-box",
              }}
            >
              <h4>📅 Propose a New Session Time</h4>

              <p>
                Choose a new date and time. The schedule changes only
                after the other participant accepts your proposal.
              </p>

              <div
                style={{
                  flex: "1",
                  minWidth: "160px",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  background: "#ffffff",
                }}
              >
                <input
                  type="date"
                  value={rescheduleDate}
                  min={new Date().toLocaleDateString("en-CA")}
                  onChange={(event) =>
                    setRescheduleDate(event.target.value)
                  }
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />

                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(event) =>
                    setRescheduleTime(event.target.value)
                  }
                  style={{
                    padding: "10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={proposeTarotReschedule}
                disabled={!rescheduleDate || !rescheduleTime}
                style={{
                  padding: "10px 16px",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Send Rescheduling Proposal
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4>📋 Rescheduling Proposals</h4>

              {tarotRescheduleProposals.length === 0 ? (
                <p>No rescheduling proposals yet.</p>
              ) : (
                tarotRescheduleProposals.map((proposal) => (
                  <div
                    key={proposal.reschedule_id}
                    style={{
                      padding: "14px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <p>
                      <strong>Proposed date:</strong>{" "}
                      {proposal.proposed_date}
                    </p>

                    <p>
                      <strong>Proposed time:</strong>{" "}
                      {proposal.proposed_time}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      {proposal.status}
                    </p>
                    
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendTarotChatMessage();
              }}
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "12px",
                flexWrap: "nowrap",
                width: "100%",
                boxSizing: "border-box",
                marginTop: "16px",
                padding: "10px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                background: "#ffffff",
              }}
            >
              <input
                type="text"
                value={tarotChatDraft}
                onChange={(event) =>
                  setTarotChatDraft(event.target.value)
                }
                placeholder="Type your message..."
                style={{
                  flex: "1 1 auto",
                  width: "0",
                  minWidth: 0,
                  padding: "12px 14px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              <button
                type="submit"
                disabled={!tarotChatDraft.trim()}
                style={{
                  flex: "0 0 auto",
                  width: "auto",
                  padding: "12px 20px",
                  background: "#7c3aed",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Send
              </button>
            </form>
          </div>
        )}

      </div>
      
    );
  };

// =====================================================
// AI INTERPRETATION
// =====================================================

  const handleGenerateAIInterpretation = async ({
    palm = null,
    tarot = null,
  }) => {
    if (!palm && !tarot) {
      return;
    }

    setAiLoading(true);
    setAiError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${API_URL}/ai/interpret`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
           Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          palm_analysis: palm,
          tarot_reading: tarot,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "AI interpretation failed."
        );
      }

      console.log("AI interpretation result:", data);

      setAiInterpretation(data);

    } 
    catch (err) {
      console.error(
        "AI interpretation error:",
        err
      );

      setAiError(
        err.message ||
        "Unable to generate AI interpretation."
      );

    } 
    finally {
      setAiLoading(false);
    }
  };

  // =====================================================
  // AI REPORT DOWNLOAD
  // =====================================================

  const handleDownloadAIReport = async ({
    endpoint,
    filename,
  }) => {
    try {
      if (!aiInterpretation?.success) {
        throw new Error(
          "AI interpretation is not available. Please generate your AI interpretation first."
        );
      }

      const token = localStorage.getItem("access_token");

      if (!token) {
        throw new Error("Not authenticated.");
      }

      setMessage("Generating your AI report...");

      const response = await fetch(
        `${API_URL}${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ai_interpretation: aiInterpretation,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = "Unable to generate report.";

        try {
          const data = await response.json();
          errorMessage = data.detail || errorMessage;
        } catch {
          // Response was not JSON
        }

        throw new Error(errorMessage);
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "Your AI report has been downloaded successfully."
      );

    } catch (error) {
      console.error(
        "AI report download error:",
        error
      );

      setMessage(
        error.message ||
        "Unable to generate AI report."
      );
    }
  };

  // =====================================================
  // TAROT PAGE
  // =====================================================

  const tarotSpreadConfig = {
    single_card: { label: "Single Card", icon: "🃏", description: "One card • Quick guidance" },
    three_card: { label: "Three Card", icon: "🃏 🃏 🃏", description: "Past • Present • Future" },
    relationship: { label: "Relationship", icon: "💞", description: "Your Energy • Their Energy • Dynamic" },
    career: { label: "Career", icon: "💼", description: "Situation • Challenge • Direction" },
    celtic_cross: { label: "Celtic Cross", icon: "✦", description: "10-card deep reading" },
    life_path: { label: "Life Path", icon: "🌙", description: "Direction • Growth • Potential" },
  };

  const intentionLabels = {
    general: "General Guidance",
    love: "Love & Relationships",
    career: "Career & Work",
    finance: "Finance & Abundance",
    personal: "Personal Growth",
  };

  const requiredTarotCards =
    tarotSession?.card_count ||
    ({ single_card: 1, three_card: 3, relationship: 3, career: 3, celtic_cross: 10, life_path: 3 }[tarotSpread] || 1);

  const resetTarotReading = () => {
    setTarotReadingStarted(false);
    setTarotReading(null);
    setTarotSession(null);
    setSelectedTarotIndices([]);
    setRevealedTarotCards([]);
    setTarotQuestion("");
    setTarotError("");
    setTarotLoading(false);
    setTarotSelectionLoading(false);
    setMessage("");
    setError("");
  };

  const fetchTarotInvitations = async () => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/my-requests`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to load Tarot invitations."
        );
      }

      const invitations = (data.sessions || []).filter(
        (session) =>
          session.created_by === "reader" &&
          session.status === "Invited"
      );

      setTarotInvitations(invitations);
    } catch (error) {
      console.error(
        "Error loading Tarot invitations:",
        error
      );

      setTarotInvitations([]);
      setTarotInvitationError(
        error.message || "Unable to load Tarot invitations."
      );
    }
  };

  const handleTarotInvitationResponse = async (sessionId, status) => {
    setTarotInvitationActionLoading(true);
    setTarotInvitationError("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/invitation-status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to update Tarot invitation."
        );
      }

      console.log(
        "Tarot invitation response:",
        data.session
      );

      // Remove the invitation after Accept/Decline
      setTarotInvitations((previousInvitations) =>
        previousInvitations.filter(
          (invitation) =>
            invitation.session_id !== sessionId
        )
      );

      // Refresh the user's session list
      setMyTarotSessions((previousSessions) => [
        data.session,
        ...previousSessions.filter(
          (session) =>
            session.session_id !== sessionId
        ),
      ]);

    } catch (error) {
      console.error(
        "Tarot invitation response error:",
        error
      );

      setTarotInvitationError(
        error.message ||
          "Unable to update Tarot invitation."
      );
    } finally {
      setTarotInvitationActionLoading(false);
    }
  };

  const handleRequestTarotSession = async () => {
    console.log("Handle Request Function called");
    console.log("Reader:", selectedTarotReaderId);
    console.log("Date:", userTarotSessionDate);
    console.log("Time:", userTarotSessionTime);
    console.log("Spread:", tarotSpread);
    if (!selectedTarotReaderId) {
      setUserTarotRequestError("Please select a Tarot Reader.");
      return;
    }

    if (!userTarotSessionDate) {
      setUserTarotRequestError("Please select a session date.");
      return;
    }

    if (!userTarotSessionTime) {
      setUserTarotRequestError("Please select a session time.");
      return;
    }

    setUserTarotRequestLoading(true);
    setUserTarotRequestError("");
    setRequestedTarotSession(null);

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reader_id: Number(selectedTarotReaderId),
            spread_type: tarotSpread,
            scheduled_date: userTarotSessionDate,
            scheduled_time: userTarotSessionTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to request Tarot session."
        );
      }

      setRequestedTarotSession(data.session);

      console.log(
        "Requested Tarot Session:",
        data.session
      );
    } catch (error) {
      console.error(
        "Tarot session request error:",
        error
      );

      setUserTarotRequestError(
        error.message || "Unable to request Tarot session."
      );
    } finally {
      setUserTarotRequestLoading(false);
    }
  };
  const handleCreateTarotSession = async () => {
    if (!selectedTarotUserId) {
      setTarotError("Please select a user first.");
      return;
    }

    if (!tarotSessionDate) {
      setTarotError("Please select a session date.");
      return;
    }

    if (!tarotSessionTime) {
      setTarotError("Please select a session time.");
      return;
    }

    setTarotLoading(true);
    setTarotError("");
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id: Number(selectedTarotUserId),
            spread_type: "not_selected",
            scheduled_date: tarotSessionDate,
            scheduled_time: tarotSessionTime,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to create Tarot session"
        );
      }

      setMessage(
        `Tarot session invitation created for ${data.session.username}.`
      );

      setCreatedTarotSession(data.session);

      console.log(
        "Created Tarot Session:",
        data.session
      );

    } catch (error) {
      setTarotError(
        error.message || "Unable to create Tarot session."
      );
    } finally {
      setTarotLoading(false);
    }
  };

  const handleStartTarotSession = async () => {
    setTarotLoading(true);
    setTarotError("");
    setMessage("");
    setError("");
    setSelectedTarotIndices([]);
    setRevealedTarotCards([]);
    setTarotReading(null);

    try {
      const response = await fetch(`${API_URL}/tarot/session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ spread_type: tarotSpread }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to create Tarot reading session.");
      }

      setTarotSession(data.session);
      setTarotReadingStarted(true);
      setMessage("Your blind Tarot deck is ready. Choose your cards.");
    } catch (err) {
      console.error("Tarot session error:", err);
      setTarotError(err.message || "Unable to connect to the Tarot backend.");
    } finally {
      setTarotLoading(false);
    }
  };

  const handleUpdateTarotSessionStatus = async (
    sessionId,
    status
  ) => {
    console.log("UPDATE SESSION FUNCTION CALLED:",sessionId,status);
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/sessions/${sessionId}/status?status=${status}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("STATUS UPDATE RESPONSE:",response.status);
      console.log("STATUS UPDATE DATA:",data);

      if (!response.ok) {
        throw new Error(
          data.detail || "Unable to update Tarot session."
        );
      }

      console.log(
        "Tarot Session Status Updated:",
        data.session
      );
      setTarotSessionRequests((previousRequests) =>
        previousRequests.filter(
          (request) => request.session_id !== sessionId
        )
      );

    } catch (error) {
      console.error(
        "Tarot session status update error:",
        error
      );
    }
  };

  const handleShuffleTarotDeck = () => {
    if (tarotSelectionLoading) return;

    // Do not shuffle after cards have already been selected
    if (selectedTarotIndices.length > 0) return;

    setTarotSession((current) => {
      if (!current || !current.available_cards) {
        return current;
      }

      const shuffledCards = [...current.available_cards];
      // Fisher-Yates shuffle
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [shuffledCards[i], shuffledCards[j]] = [
          shuffledCards[j],
          shuffledCards[i],
        ];
      }

      return {
        ...current,
        available_cards: shuffledCards,
      };
    });

    setTarotError("");
    setMessage("The deck has been shuffled. Choose your cards by intuition.");
    setTarotShuffleCount((count) => count+1);

  };

  const handleTarotCardSelect = (cardIndex) => {
    if (tarotSelectionLoading) return;

    if (selectedTarotIndices.includes(cardIndex)) {
      setSelectedTarotIndices((current) => current.filter((index) => index !== cardIndex));
      return;
    }

    if (selectedTarotIndices.length >= requiredTarotCards) {
      setTarotError(`This reading requires exactly ${requiredTarotCards} cards.`);
      return;
    }

    setTarotError("");
    setSelectedTarotIndices((current) => [...current, cardIndex]);
  };



  const handleConfirmTarotSelection = async () => {
    if (!tarotSession?.reading_id) {
      setTarotError("Your Tarot session is missing. Please start again.");
      return;
    }

    if (selectedTarotIndices.length !== requiredTarotCards) {
      setTarotError(`Please select exactly ${requiredTarotCards} card${requiredTarotCards > 1 ? "s" : ""}.`);
      return;
    }

    setTarotSelectionLoading(true);
    setTarotError("");
    setMessage("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/tarot/select`, {
        method: "POST",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          reading_id: tarotSession.reading_id,
          selected_indices: selectedTarotIndices,
          reader_session_id: createdTarotSession?.session_id || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Card selection failed.");
      }

      const cards = Array.isArray(data.cards) ? data.cards : [];
      setRevealedTarotCards(cards);

      setTarotReading({
        spread_type: tarotSession.spread_type,
        spread_name: tarotSession.spread_name,
        card_count: cards.length,
        orientation: "mixed",
        cards: cards,
        overall_reading: data.overall_reading || "",
      });

      // Generate AI interpretation for Tarot reading
      await handleGenerateAIInterpretation({
        palm: palmAnalysis,
        tarot: {
          spread_type: tarotSession.spread_type,
          spread_name: tarotSession.spread_name,
          card_count: cards.length,
          intention: tarotIntention,
          question: tarotQuestion,
          cards: cards,
          overall_reading: data.overall_reading || "",
        },
      });

      setTarotSession((current) =>
        current
          ? {
              ...current,
              selected_indices: selectedTarotIndices,
              revealed_cards: cards,
              overall_reading: data.overall_reading || "",
            }
          : current
      );

      setReadingHistory((current) => [
       {
          id: tarotSession.reading_id,
          type: "Tarot",
          title: "Tarot Reading",
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        description: `${tarotSession.spread_name} focused on ${tarotIntention}.`,
        meta: [
          `🃏 ${cards.length} Cards`,
          `✨ ${tarotIntention}`,
        ],
        page: "tarot",
      },
      ...current,
    ]);

      setMessage(
        cards.length
          ? "Your cards have been revealed and interpreted."
          : "No cards were returned from the backend."
      );
    } catch (err) {
      console.error("Tarot card selection error:", err);
      setTarotError(err.message || "Card selection failed.");
    } finally {
      setTarotSelectionLoading(false);
    }
  };

  const handleDownloadReport = async (readingId) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(
        `${API_URL}/tarot/report/${readingId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Unable to generate report.");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `tarot_reading_${readingId}.pdf`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Report download error:", error);
      setTarotError(
        error.message || "Unable to download report."
      );
    }
  };

  const handleGenerateTarotReport = async () => {
    if (!tarotSession?.reading_id) {
      setTarotError(
        "Your Tarot reading session is missing. Please start again."
      );
      return;
    }

    try {
      setTarotError("");
      setMessage("Generating your Tarot report...");

      const response = await fetch(
         `${API_URL}/tarot/report/${tarotSession.reading_id}`
      );

      if (!response.ok) {
        let errorMessage = "Unable to generate Tarot report.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
        // Response was not JSON
        }

        throw new Error(errorMessage);
      }

      // Convert response into a PDF blob
      const blob = await response.blob();

      // Create temporary download URL
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `tarot_reading_${tarotSession.reading_id}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage(
        "Your Tarot reading report has been downloaded successfully."
      );

    } 
    catch (err) {
      console.error("Tarot report error:", err);

      setTarotError(
        err.message || "Unable to generate Tarot report."
      );
    }
  };


  const renderTarot = () => {
    const selectedSpread =
      tarotSpreadConfig[tarotSession?.spread_type || tarotSpread] ||
      tarotSpreadConfig.single_card;

    if (tarotReadingStarted && tarotSession && revealedTarotCards.length > 0) {
      return (
        <div className="tarot-reading-page">
          <div className="tarot-reading-header">
            <span className="hero-label">✨ YOUR TAROT READING</span>
            <h2>Your Cards Are Revealed</h2>
            <p>
              Your selected cards are revealed according to their positions in the {selectedSpread.label} spread.
            </p>
          </div>

          <div className="tarot-reading-meta-card">
            <div><span>READING TYPE</span><strong>{selectedSpread.label}</strong></div>
            <div><span>CARDS SELECTED</span><strong>{revealedTarotCards.length}</strong></div>
            <div><span>INTENTION</span><strong>{intentionLabels[tarotIntention] || tarotIntention}</strong></div>
          </div>

          {tarotQuestion && (
            <div className="tarot-question-card">
              <span>YOUR QUESTION</span>
              <p>{tarotQuestion}</p>
            </div>
          )}

          <div className="tarot-revealed-grid">
            {revealedTarotCards.map((card, index) => (
              <div className="tarot-revealed-card" key={`${card.name || "card"}-${index}`}>
                <div className="tarot-revealed-position">{card.position || `Card ${index + 1}`}</div>
                <div className="tarot-card-face">
                  {card.image ? (
                    <img src={card.image} alt={card.name || "Tarot card"} />
                  ) : (
                    <div className="tarot-card-symbol">🃏</div>
                  )}
                </div>
                <h3>{card.name || "Tarot Card"}</h3>

                {card.orientation && (
                  <span className="tarot-orientation">
                    {String(card.orientation).toLowerCase() === "reversed" ? "↘ Reversed" : "↗ Upright"}
                  </span>
                )}

                {(card.arcana || card.suit) && (
                  <p className="tarot-card-category">
                    {card.arcana || "Tarot"}{card.suit ? ` • ${card.suit}` : ""}
                  </p>
                )}

                {Array.isArray(card.keywords) && card.keywords.length > 0 && (
                  <div className="tarot-keywords">
                    {card.keywords.map((keyword, i) => <span key={`${keyword}-${i}`}>{keyword}</span>)}
                  </div>
                )}

                {Array.isArray(card.meaning) && card.meaning.length > 0 && (
                  <div className="tarot-meaning">
                    <strong>Traditional Meaning</strong>
                    <ul>
                      {card.meaning.map((meaning, i) => <li key={`${meaning}-${i}`}>{meaning}</li>)}
                    </ul>
                  </div>
                )}

                {card.interpretation && (
                  <div className="tarot-card-interpretation">
                    <strong>Interpretation</strong>
                    <p>{card.interpretation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {tarotReading?.overall_reading && (
            <div className="tarot-overall-card">
              <span>✨ OVERALL READING</span>
              <h3>Your Reading at a Glance</h3>
              <p>{tarotReading.overall_reading}</p>
            </div>
          )}

          {/* =====================================================
           AI TAROT INTERPRETATION
           ===================================================== */}

          {aiLoading && (
            <div className="ai-interpretation-card">
              <h3>🔮 AI Tarot Interpretation</h3>
              <p>Analyzing your Tarot reading...</p>
            </div>
          )}

          {aiError && (
            <div className="ai-interpretation-card">
              <h3>🔮 AI Tarot Interpretation</h3>
              <p>{aiError}</p>
            </div>
          )}

          {aiInterpretation?.success && (
            <div className="ai-interpretation-card">
              <h3>🔮 AI Tarot Interpretation</h3>
              <p className="ai-intro">
                Based on your selected Tarot cards, here are personalized
                insights for reflection.
              </p>

              {aiInterpretation.personality?.length > 0 && (
                <div className="ai-section">
                  <h4>🧠 Personality</h4>
                  {aiInterpretation.personality.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </div>
              )}

              {aiInterpretation.relationships?.length > 0 && (
                <div className="ai-section">
                  <h4>❤️ Relationships</h4>
                  {aiInterpretation.relationships.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </div>
              )}

              {aiInterpretation.career?.length > 0 && (
                <div className="ai-section">
                  <h4>💼 Career</h4>
                    {aiInterpretation.career.map((item, index) => (
                      <p key={index}>• {item}</p>
                    ))}
                </div>
              )}

              {aiInterpretation.personal_growth?.length > 0 && (
                <div className="ai-section">
                  <h4>🌱 Personal Growth</h4>
                  {aiInterpretation.personal_growth.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </div>
              )}

              {aiInterpretation.opportunities?.length > 0 && (
                <div className="ai-section">
                  <h4>✨ Opportunities</h4>

                  {aiInterpretation.opportunities.map((item, index) => (
                    <p key={index}>• {item}</p>
                  ))}
                </div>
              )}

              {aiInterpretation.disclaimer && (
                <div className="ai-disclaimer">
                  <strong>Note:</strong>{" "}
                  {aiInterpretation.disclaimer}
                </div>
              )}
            </div>
          )}
          
          <div className="tarot-disclaimer">
            ✨ Tarot readings are intended for reflection and personal insight. They should not be treated as scientific predictions or professional advice.
          </div>

          <div className="tarot-action-buttons">

            {tarotSession?.reading_id && revealedTarotCards.length > 0 && (
              <button
                type="button"
                className="tarot-report-button"
                onClick={handleGenerateTarotReport}
              >
                📄 Generate Reading Report
              </button>
            )}

            <button
              className="secondary-button tarot-back-button"
              onClick={resetTarotReading}
            >
              ← Start a New Reading
            </button>

          </div>
        </div>
      );
    }

    if (tarotReadingStarted && tarotSession) {
      const availableCards = tarotSession.available_cards || [];

      return (
        <div className="tarot-selection-page">
          <div className="tarot-reading-header tarot-selection-header">
            <span className="hero-label">✨ BLIND CARD SELECTION</span>
            <h2>Choose Your Cards</h2>
            <p>
              The cards are face-down. Choose <strong>{requiredTarotCards}</strong> card
              {requiredTarotCards > 1 ? "s" : ""} by intuition. Their identities remain hidden until you confirm.
            </p>
          </div>

          <div className="tarot-selection-progress">
            <div>
              <span>YOUR SELECTION</span>
              <strong>{selectedTarotIndices.length} / {requiredTarotCards}</strong>
            </div>
            <div className="tarot-progress-track">
              <div
                className="tarot-progress-fill"
                style={{
                  width: `${Math.min(100, (selectedTarotIndices.length / requiredTarotCards) * 100)}%`,
                }}
              />
            </div>
            <small>
              {selectedTarotIndices.length === requiredTarotCards
                ? "Your selection is complete."
                : "Trust your intuition and choose your cards."}
            </small>
          </div>

          <div className="tarot-shuffle-action">
            <button
              type="button"
              className="tarot-shuffle-button"
              onClick={handleShuffleTarotDeck}
              disabled={
                tarotSelectionLoading ||
                selectedTarotIndices.length > 0
              }
            >
              🔀 Shuffle Deck
            </button>

            <small>
              Shuffle the deck before choosing your cards.
            </small>
          </div>

          {tarotError && <div className="error-message">{tarotError}</div>}

          <div className="tarot-selected-chips">
            {selectedTarotIndices.length === 0
              ? <span>No cards selected yet</span>
              : selectedTarotIndices.map((index, i) => <span key={index}>{i + 1}. Card selected</span>)}
          </div>

          <div className="blind-tarot-deck">
            {availableCards.map((card) => {
              const isSelected = selectedTarotIndices.includes(card.card_index);
              const selectionNumber = selectedTarotIndices.indexOf(card.card_index) + 1;

              return (
                <button
                  key={`${card.card_index}-${tarotShuffleCount}`}
                  type="button"
                  className={isSelected ? "blind-tarot-card selected" : "blind-tarot-card"}
                  onClick={() => handleTarotCardSelect(card.card_index)}
                  aria-label={isSelected ? `Selected Tarot card ${selectionNumber}` : "Face-down Tarot card"}
                >
                  <div className="tarot-card-back">
                    <div className="tarot-card-back-inner">
                      <span>✦</span><strong>AI</strong><small>TAROT</small><span>✦</span>
                    </div>
                  </div>
                  {isSelected && <div className="blind-card-selected-badge">{selectionNumber}</div>}
                </button>
              );
            })}
          </div>

          {availableCards.length === 0 && (
            <div className="tarot-empty-state">
              <span>🔮</span>
              <h3>Deck unavailable</h3>
              <p>The Tarot deck could not be loaded. Please start a new reading.</p>
            </div>
          )}

          <div className="tarot-selection-actions">
            <button type="button" className="secondary-button" onClick={resetTarotReading} disabled={tarotSelectionLoading}>
              ← Change Reading
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleConfirmTarotSelection}
              disabled={tarotSelectionLoading || selectedTarotIndices.length !== requiredTarotCards}
            >
              {tarotSelectionLoading
                ? "🔄 Revealing Cards..."
                : `✨ Reveal ${requiredTarotCards} Card${requiredTarotCards > 1 ? "s" : ""}`}
            </button>
          </div>

          <div className="tarot-selection-note">
            🔒 Card identities are kept on the backend until your selection is confirmed.
          </div>
        </div>
      );
    }

    return (
      <div className="tarot-page">
        <div className="tarot-page-header">
          <div className="tarot-page-icon">🔮</div>
          <div>
            <span className="hero-label">✨ AI-POWERED EXPERIENCE</span>
            <h2>Tarot Reading</h2>
            <p>
              Choose a reading style, focus on your intention, and select your cards intuitively from a blind Tarot deck.
            </p>
          </div>
        </div>

        <div className="tarot-setup-card">
          <div className="tarot-section-heading">
            <h3>Prepare Your Reading</h3>
            <p>Select a spread and focus your question before choosing your cards.</p>
          </div>

          <div className="tarot-form-group">
            <label>Choose Your Reading Type</label>
            <div className="spread-options">
              {Object.entries(tarotSpreadConfig).map(([spreadId, spread]) => (
                <button
                  key={spreadId}
                  type="button"
                  className={tarotSpread === spreadId ? "spread-option active" : "spread-option"}
                  onClick={() => {
                    setTarotSpread(spreadId);
                    setTarotSession(null);
                    setSelectedTarotIndices([]);
                    setRevealedTarotCards([]);
                    setTarotError("");
                  }}
                >
                  <span className="spread-icon">{spread.icon}</span>
                  <strong>{spread.label}</strong>
                  <small>{spread.description}</small>
                </button>
              ))}
            </div>
          </div>

          <div className="tarot-form-group">
            <label>What Would You Like Guidance On?</label>
            <select value={tarotIntention} onChange={(e) => setTarotIntention(e.target.value)}>
              <option value="general">General Guidance</option>
              <option value="love">Love & Relationships</option>
              <option value="career">Career & Work</option>
              <option value="finance">Finance & Abundance</option>
              <option value="personal">Personal Growth</option>
            </select>
          </div>

          <div className="tarot-form-group">
            <label>Your Question</label>
            <textarea
              placeholder="Ask a question or describe what you would like guidance about..."
              value={tarotQuestion}
              onChange={(e) => setTarotQuestion(e.target.value)}
              rows="4"
            />
            <span className="input-hint">You can leave this blank for a general reading.</span>
          </div>

          {tarotError && <div className="error-message">{tarotError}</div>}

          <button
            className="primary-button tarot-start-button"
            onClick={handleStartTarotSession}
            disabled={tarotLoading}
          >
            {tarotLoading
              ? "🔄 Preparing Your Deck..."
              : `🔮 Start ${tarotSpreadConfig[tarotSpread]?.label || "Tarot"} Reading`}
          </button>
        </div>

        <div className="tarot-feature-strip">
          <div><span>🂠</span><strong>Blind Selection</strong><small>Choose without seeing card identities</small></div>
          <div><span>🎴</span><strong>78-Card Deck</strong><small>Cards are shuffled for every session</small></div>
          <div><span>✨</span><strong>Contextual Reading</strong><small>Spread positions guide interpretation</small></div>
        </div>

        <div className="tarot-info-card">
          <div className="tarot-info-icon">✨</div>
          <div>
            <h3>A Moment for Reflection</h3>
            <p>Tarot readings are presented as a reflective experience. Focus on your question and choose the cards that feel meaningful to you.</p>
          </div>
        </div>

        <button className="secondary-button tarot-back-dashboard" onClick={() => setActivePage("dashboard")}>
          ← Back to Dashboard
        </button>
      </div>
    );
  };

  // PALM PAGE
  // =====================================================

  
  // =====================================================
  // PALM RESULT UI HELPERS
  // =====================================================

  const palmLineMeta = {
    heart: { icon: "❤️", label: "Heart Line", color: "#ff3b8d" },
    head: { icon: "🧠", label: "Head Line", color: "#7c3aed" },
    life: { icon: "🌱", label: "Life Line", color: "#16a34a" },
    fate: { icon: "⭐", label: "Fate Line", color: "#f59e0b" },
    sun: { icon: "☀️", label: "Sun Line", color: "#ef4444" }
  };

  const getPalmLineDetections = () => {
    const lines = palmAnalysis?.palm_lines?.lines || [];
    const strongest = {};

    lines.forEach((line) => {
      const confidence = Number(line.confidence || 0);
      if (
        !strongest[line.line] ||
        confidence > Number(strongest[line.line].confidence || 0)
      ) {
        strongest[line.line] = line;
      }
    });

    return Object.values(strongest);
  };

  const getConfidenceLabel = (confidence) => {
    const value = Number(confidence || 0) * 100;
    if (value >= 80) return "High confidence";
    if (value >= 60) return "Good confidence";
    if (value >= 40) return "Moderate confidence";
    return "Low confidence";
  };

const renderPalm = () => {

    const handlePalmImageChange = (e) => {

      const file =
        e.target.files[0];

      if (file) {

        const imageUrl =
          URL.createObjectURL(file);

        setPalmImage(file);
        setPalmPreview(imageUrl);
        setPalmAnalysisStarted(false);
        setPalmAnalysis(null);

        setMessage("");
        setError("");
      }
    };

    const handlePalmAnalysis = async () => {

      if (!palmImage) {

        setError(
          "Please upload a palm image first."
        );

        return;
      }

      setError("");
      setMessage("");
      setPalmLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", palmImage);

        const token = localStorage.getItem("access_token");

        if (!token) {
          throw new Error("Not authenticated. Please login again.");
        }

        const response = await fetch(
          `${API_URL}/palm/analyze`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.detail || "Palm analysis failed."
          );
        }

        console.log("Palm analysis result:", data);

        setPalmAnalysis(data.analysis);
        setPalmAnalysisStarted(true);

        //Generate AI interpretation from the Palm Analysis Result
        await handleGenerateAIInterpretation({
          palm: data.analysis,
          tarot: null,
        })
        // SAVE PALM READING TO HISTORY
        setReadingHistory((current) => [
          {
             id: `palm-${Date.now()}`,
             type: "Palmistry",
             title: "Palm Reading",
            date: new Date().toLocaleDateString("en-US", {
             year: "numeric",
              month: "long",
              day: "numeric",
            }),
            description:
              "AI-powered palm analysis providing personalized palmistry insights.",
            meta: [
              `✋ ${data.analysis?.palm_lines?.lines?.length || 0} Lines Detected`,
              `✨ ${data.analysis?.palm_shape?.palm_shape || "Palm Analysis"}`,
            ],
            page: "palm",
          },
          ...current,
        ]);
        setMessage("Palm analysis completed successfully!");
      } 
      catch (err) {
        console.error("Palm analysis error:", err);

        setError(
          err.message ||
            "Unable to connect to the palm analysis backend."
        );
      } finally {
        setPalmLoading(false);
      }
    };

  const handleGeneratePalmReport = async () => {
    if (!palmImage) {
      setError("Your palm image is missing. Please analyze your palm again.");
      return;
    }

    try {
      setError("");
      setMessage("Generating your Palm report...");

      const formData = new FormData();
      formData.append("file", palmImage);

      const response = await fetch(
        `${API_URL}/palm/report`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        let errorMessage = "Unable to generate Palm report.";

        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } 
        catch {
          // Response was not JSON
        }

        throw new Error(errorMessage);
      }

      // Convert response into a PDF blob
      const blob = await response.blob();

      // Create temporary download URL
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;

      const fileName =
        palmImage.name?.split(".")[0] || "palm";

      link.download = `palm_analysis_report_${fileName}.pdf`;

      document.body.appendChild(link);
      link.click();

      // Clean up
      link.remove();
      window.URL.revokeObjectURL(url);

      setMessage(
        "Your Palm analysis report has been downloaded successfully."
      );

    } 
    catch (err) {
      console.error("Palm report error:", err);

      setError(
        err.message ||
          "Unable to generate Palm report."
      );
    }
  };

    return (
      <div className="palm-page">

        <div className="palm-page-header">

          <div className="palm-page-icon">
            ✋
          </div>

          <div>

            <span className="hero-label">
              ✨ AI-POWERED EXPERIENCE
            </span>

            <h2>
              Palm Reading
            </h2>

            <p>
              Upload a clear image of your palm and
              explore personalized palmistry insights.
            </p>

          </div>

        </div>

        {!palmAnalysisStarted ? (

          <div className="palm-upload-card">

            <div className="palm-section-heading">

              <h3>
                Upload Your Palm Image
              </h3>

              <p>
                For the best results, upload a clear,
                well-lit image of your palm.
              </p>

            </div>

            {palmPreview ? (

              <div className="palm-preview-container">

                <img
                  src={palmPreview}
                  alt="Palm preview"
                  className="palm-preview"
                />

                <button
                  type="button"
                  className="remove-image-button"
                  onClick={() => {

                    setPalmImage(null);
                    setPalmPreview(null);

                    setMessage("");
                    setError("");

                  }}
                >
                  ✕ Remove Image
                </button>

              </div>

            ) : (

              <label
                htmlFor="palm-image-upload"
                className="palm-upload-area"
              >

                <div className="palm-upload-icon">
                  ✋
                </div>

                <h3>
                  Upload Palm Image
                </h3>

                <p>
                  Click here to select an image
                </p>

                <span>
                  JPG, JPEG or PNG
                </span>

              </label>

            )}

            <input
              id="palm-image-upload"
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              onChange={handlePalmImageChange}
              className="palm-file-input"
            />

            <div className="palm-guidelines">

              <div className="guideline-item">

                <span>
                  💡
                </span>

                <div>

                  <strong>
                    Good Lighting
                  </strong>

                  <p>
                    Make sure your palm is clearly visible.
                  </p>

                </div>

              </div>

              <div className="guideline-item">

                <span>
                  🖐️
                </span>

                <div>

                  <strong>
                    Open Palm
                  </strong>

                  <p>
                    Keep your fingers naturally separated.
                  </p>

                </div>

              </div>

              <div className="guideline-item">

                <span>
                  📷
                </span>

                <div>

                  <strong>
                    Clear Image
                  </strong>

                  <p>
                    Avoid blurry or low-quality photos.
                  </p>

                </div>

              </div>

            </div>

            <button
              className="primary-button palm-analyze-button"
              onClick={handlePalmAnalysis}
              disabled={!palmImage || palmLoading}
            >
              {palmLoading
                ? "🔄 Analyzing Palm..."
                : "✨ Analyze My Palm"}
            </button>

          </div>

        ) : (

          <div className="palm-result-page">

            <div className="palm-result-header">

              <span className="hero-label">
                ✨ PALM ANALYSIS
              </span>

              <h2>
                Your Palm Reading
              </h2>

              <p>
                Your personalized palmistry insights generated from the
                uploaded palm image.
              </p>

            </div>

            <div className="palm-result-card">

              <div
                className="palm-result-image-container"
                style={{
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                <img
                  ref={palmImageRef}
                  src={palmPreview}
                  alt="Uploaded palm"
                  className="palm-result-image"
                  style={{
                    display: "block",
                    width: "100%",
                    height: "auto",
                    objectFit: "contain"
                  }}
                />

                <canvas
                  ref={palmCanvasRef}
                  aria-label="AI detected palm lines overlay"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none"
                  }}
                />
              </div>

              <div className="palm-result-content">

                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                    padding: "7px 11px",
                    borderRadius: "999px",
                    background: "rgba(34, 197, 94, 0.10)",
                    color: "#15803d",
                    fontSize: "10px",
                    fontWeight: "800",
                    letterSpacing: "0.5px",
                    marginBottom: "12px"
                  }}
                >
                  <span>●</span>
                  AI ANALYSIS COMPLETE
                </div>

                <div className="result-icon">
                  ✨
                </div>

                <h3>
                  AI Palmistry Interpretation
                </h3>

                <p>
                  Your palm has been analyzed using hand landmarks,
                  palm-line detection and traditional palmistry interpretation.
                </p>

                <div className="palm-results-grid">
                  <div className="palm-results-column">
                    {/* ANALYSIS OVERVIEW */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: "8px",
                        margin: "16px 0"
                      }}
                    >
                      {[
                        [
                          "21",
                          "LANDMARKS",
                          "Hand points",
                          palmAnalysis?.hand_landmarks?.detected
                        ],
                        [
                          String(getPalmLineDetections().length),
                          "LINES FOUND",
                          "AI detections",
                          palmAnalysis?.palm_lines?.detected
                        ],
                        [
                          palmAnalysis?.palm_shape?.palm_shape || "—",
                          "PALM SHAPE",
                          "Detected structure",
                          Boolean(palmAnalysis?.palm_shape)
                        ]
                      ].map(([value, title, subtitle, active], index) => (
                        <div
                          key={title}
                          style={{
                            padding: "12px 9px",
                            borderRadius: "13px",
                            background: active
                              ? "rgba(111, 63, 218, 0.06)"
                              : "rgba(0,0,0,0.025)",
                            border: "1px solid rgba(111, 63, 218, 0.10)",
                            textAlign: "center",
                            minWidth: 0
                          }}
                        >
                          <div
                            style={{
                              fontSize: index === 2 ? "12px" : "21px",
                              fontWeight: "800",
                              lineHeight: "1.2",
                              wordBreak: "break-word"
                            }}
                          >
                            {value}
                          </div>
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "9px",
                              fontWeight: "800",
                              letterSpacing: "0.35px"
                            }}
                          >
                            {title}
                          </div>
                          <div
                            style={{
                              marginTop: "2px",
                              fontSize: "9px",
                              opacity: 0.6
                            }}
                          >
                            {subtitle}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* DETECTED LINE LEGEND */}
                    {getPalmLineDetections().length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "9px",
                          marginBottom: "15px",
                          padding: "9px 11px",
                          borderRadius: "12px",
                          background: "rgba(111, 63, 218, 0.04)",
                          border: "1px solid rgba(111, 63, 218, 0.09)"
                        }}
                      >
                        <span
                          style={{
                            fontSize: "9px",
                            fontWeight: "800",
                            letterSpacing: "0.4px"
                          }}
                        >
                          DETECTED
                        </span>

                        {getPalmLineDetections().map((line) => {
                          const meta =
                            palmLineMeta[line.line] || {
                              icon: "✨",
                              label: line.line,
                              color: "#6d28d9"
                            };

                          return (
                            <span
                              key={line.line}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                fontSize: "9px",
                                fontWeight: "700"
                              }}
                            >
                              <span
                                style={{
                                  width: "7px",
                                  height: "7px",
                                  borderRadius: "50%",
                                  background: meta.color
                                }}
                              />
                              {meta.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* STRUCTURE CARDS */}
                    {(palmAnalysis?.palm_shape ||
                      palmAnalysis?.finger_analysis) && (
                      <div style={{ marginBottom: "15px" }}>
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            letterSpacing: "0.5px",
                            marginBottom: "8px",
                            opacity: 0.72
                          }}
                        >
                          ✋ HAND STRUCTURE
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                            gap: "9px"
                          }}
                        >
                          {palmAnalysis?.palm_shape && (
                            <div
                              style={{
                                padding: "12px",
                                borderRadius: "13px",
                                background:
                                  "linear-gradient(135deg, rgba(124,58,237,0.08), rgba(124,58,237,0.025))",
                                border:
                                  "1px solid rgba(124,58,237,0.12)"
                              }}
                            >
                              <div style={{ fontSize: "20px" }}>✋</div>
                              <strong
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                  fontSize: "12px"
                                }}
                              >
                                Palm Shape
                              </strong>
                              <span
                                style={{
                                  display: "inline-block",
                                  marginTop: "5px",
                                  padding: "4px 7px",
                                  borderRadius: "7px",
                                  background: "rgba(124,58,237,0.10)",
                                  fontSize: "9px",
                                  fontWeight: "800"
                                }}
                              >
                                {palmAnalysis.palm_shape.palm_shape}
                              </span>
                            </div>
                          )}

                          {palmAnalysis?.finger_analysis && (
                            <div
                              style={{
                                padding: "12px",
                                borderRadius: "13px",
                                background:
                                  "linear-gradient(135deg, rgba(22,163,74,0.08), rgba(22,163,74,0.025))",
                                border:
                                  "1px solid rgba(22,163,74,0.12)"
                              }}
                            >
                              <div style={{ fontSize: "20px" }}>👆</div>
                              <strong
                                style={{
                                  display: "block",
                                  marginTop: "4px",
                                  fontSize: "12px"
                                }}
                              >
                                Finger Structure
                              </strong>
                              <span
                                style={{
                                  display: "inline-block",
                                  marginTop: "5px",
                                  padding: "4px 7px",
                                  borderRadius: "7px",
                                  background: "rgba(22,163,74,0.10)",
                                  fontSize: "9px",
                                  fontWeight: "800"
                                }}
                              >
                                {palmAnalysis.finger_analysis.finger_structure}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* AI DETECTION CARDS */}
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: "800",
                        letterSpacing: "0.5px",
                        marginBottom: "8px",
                        opacity: 0.72
                      }}
                    >
                      🔬 AI LINE DETECTION
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "9px"
                      }}
                    >
                      {getPalmLineDetections().map((line) => {
                        const meta =
                          palmLineMeta[line.line] || {
                            icon: "✨",
                            label: line.line,
                            color: "#6d28d9"
                          };

                        const confidence = Math.max(
                          0,
                          Math.min(100, Number(line.confidence || 0) * 100)
                        );

                        return (
                          <div
                            className="analysis-item"
                            key={line.line}
                            style={{
                              alignItems: "flex-start",
                              position: "relative",
                              overflow: "hidden"
                            }}
                          >
                            <span style={{ fontSize: "21px" }}>
                              {meta.icon}
                            </span>

                            <div style={{ width: "100%" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "10px"
                                }}
                              >
                                <strong>{meta.label}</strong>

                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    color: meta.color
                                  }}
                                >
                                  {confidence.toFixed(1)}%
                                </span>
                              </div>

                              <div
                                style={{
                                  height: "5px",
                                  marginTop: "7px",
                                  marginBottom: "5px",
                                  borderRadius: "999px",
                                  background: "rgba(0,0,0,0.07)",
                                  overflow: "hidden"
                                }}
                              >
                                <div
                                  style={{
                                    width: `${confidence}%`,
                                    height: "100%",
                                    borderRadius: "999px",
                                    background: meta.color,
                                    transition: "width 0.7s ease"
                                  }}
                                />
                              </div>

                              <small
                                style={{
                                  display: "block",
                                  opacity: 0.62,
                                  fontSize: "9px"
                                }}
                              >
                                {getConfidenceLabel(line.confidence)}
                              </small>
                            </div>
                          </div>
                        );
                      })}

                      {getPalmLineDetections().length === 0 && (
                        <div className="analysis-item">
                          <span>🔎</span>
                          <div>
                            <strong>No palm lines detected</strong>
                            <small>
                              Try a clearer, well-lit palm image with the full
                              palm visible.
                            </small>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="palm-results-column">

                    {/* TRADITIONAL INTERPRETATION */}
                    {palmAnalysis?.interpretations &&
                      Object.keys(palmAnalysis.interpretations).length > 0 && (
                        <div style={{ marginTop: "18px" }}>
                          <div
                            style={{
                              fontSize: "10px",
                              fontWeight: "800",
                              letterSpacing: "0.5px",
                              marginBottom: "8px",
                              opacity: 0.72
                            }}
                          >
                            🔮 TRADITIONAL PALMISTRY INTERPRETATION
                          </div>

                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              gap: "9px"
                            }}
                          >
                            {Object.entries(palmAnalysis.interpretations).map(
                              ([key, item]) => {
                                const meta =
                                  palmLineMeta[key.replace("_line", "")] || {
                                    icon:
                                      key === "palm_shape"
                                        ? "✋"
                                        : key === "finger_structure"
                                        ? "👆"
                                        : "✨",
                                    label:
                                      item.title ||
                                      key.replaceAll("_", " "),
                                    color: "#6d28d9"
                                  };

                                return (
                                  <div
                                    key={key}
                                    style={{
                                      padding: "13px",
                                      borderRadius: "13px",
                                      background:
                                        "rgba(111, 63, 218, 0.035)",
                                      border:
                                        "1px solid rgba(111, 63, 218, 0.09)"
                                    }}
                                  >
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px"
                                      }}
                                    >
                                      <span style={{ fontSize: "18px" }}>
                                        {meta.icon}
                                      </span>

                                      <div>
                                        <strong
                                          style={{
                                            fontSize: "12px"
                                          }}
                                        >
                                          {item.title ||
                                            meta.label}
                                        </strong>

                                        {item.type && (
                                          <span
                                            style={{
                                              display: "block",
                                              marginTop: "2px",
                                              fontSize: "9px",
                                              fontWeight: "700",
                                              opacity: 0.58
                                            }}
                                          >
                                            {item.type}
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <p
                                      style={{
                                        margin: "9px 0 0",
                                        fontSize: "11px",
                                        lineHeight: "1.55"
                                      }}
                                    >
                                      {item.interpretation}
                                    </p>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      )}

                    {/* READING AT A GLANCE */}
                    {palmAnalysis?.interpretations && (
                      <div
                        style={{
                          marginTop: "18px",
                          padding: "15px",
                          borderRadius: "15px",
                          background:
                            "linear-gradient(135deg, rgba(124,58,237,0.09), rgba(236,72,153,0.05))",
                          border:
                            "1px solid rgba(124,58,237,0.12)"
                        }}
                      >
                        <div
                          style={{
                            fontSize: "10px",
                            fontWeight: "800",
                            letterSpacing: "0.5px"
                          }}
                        >
                          ✨ READING AT A GLANCE
                        </div>

                        <p
                          style={{
                            margin: "8px 0 0",
                            fontSize: "11px",
                            lineHeight: "1.6"
                          }}
                        >
                          Your analysis indicates a{" "}
                          <strong>
                            {palmAnalysis?.palm_shape?.palm_shape || "detected"}
                          </strong>{" "}
                          with{" "}
                          <strong>
                            {palmAnalysis?.finger_analysis?.finger_structure ||
                              "detected"}
                          </strong>
                          .{" "}
                          {getPalmLineDetections().length > 0
                            ? `The AI detected ${getPalmLineDetections().length} palm-line ${
                                getPalmLineDetections().length === 1
                                  ? "feature"
                                  : "features"
                              }, which are shown directly on your palm image.`
                            : "No palm-line features were confidently detected in this image."}
                        </p>
                      </div>
                    )}


                    {/* TECHNICAL DETAILS */}
                    <details
                      style={{
                        marginTop: "14px",
                        borderRadius: "12px",
                        border: "1px solid rgba(111, 63, 218, 0.09)",
                        background: "rgba(0,0,0,0.018)"
                      }}
                    >
                      <summary
                        style={{
                          cursor: "pointer",
                          padding: "11px 12px",
                          fontSize: "10px",
                          fontWeight: "800"
                        }}
                      >
                        ⚙️ Technical Analysis Details
                      </summary>

                      <div
                        style={{
                          padding: "0 12px 12px",
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "7px 12px",
                          fontSize: "9px"
                        }}
                      >
                        <span>Image size</span>
                        <strong>
                          {palmAnalysis?.image_features?.image_width || "—"} ×{" "}
                          {palmAnalysis?.image_features?.image_height || "—"}
                        </strong>

                        <span>Hand landmarks</span>
                        <strong>
                          {palmAnalysis?.hand_landmarks?.count || 0}
                        </strong>

                        <span>Lines detected</span>
                        <strong>
                          {getPalmLineDetections().length}
                        </strong>

                        <span>Palm ratio</span>
                        <strong>
                          {palmAnalysis?.palm_shape?.length_width_ratio || "—"}
                        </strong>

                        <span>Contour ratio</span>
                        <strong>
                          {palmAnalysis?.image_features?.contour_area_ratio || "—"}
                        </strong>

                        <span>Finger structure</span>
                        <strong>
                          {palmAnalysis?.finger_analysis?.finger_structure || "—"}
                        </strong>
                      </div>
                    </details>

                    {/* RESPONSIBLE USE */}
                    <div
                      style={{
                        marginTop: "14px",
                        padding: "10px 12px",
                        borderRadius: "11px",
                        background: "rgba(245,158,11,0.06)",
                        border: "1px solid rgba(245,158,11,0.12)",
                        fontSize: "9px",
                        lineHeight: "1.5",
                        opacity: 0.78
                      }}
                    >
                      💡 <strong>For self-reflection & entertainment:</strong>{" "}
                      palmistry interpretations are traditional perspectives and
                      should not be treated as scientific predictions or
                      professional advice.
                    </div>

                  </div>
                </div>
              </div>

          <div className="ai-interpretation-full-width">
            {/* =====================================================
                AI PERSONALIZED INTERPRETATION
                ===================================================== */}

            {aiLoading && (
              <div className="ai-interpretation-card">
                <h3>🤖 AI Personalized Interpretation</h3>
                <p>Analyzing your palm results...</p>
              </div>
            )}

            {aiError && (
              <div className="ai-interpretation-card">
                <h3>🤖 AI Personalized Interpretation</h3>
                <p>{aiError}</p>
              </div>
            )}

            {aiInterpretation?.success && (
              <div className="ai-interpretation-card">
                  <h3>🤖 AI Personalized Interpretation</h3>
                  <p className="ai-intro">
                    Based on your palm analysis, here are personalized
                    insights for reflection.
                  </p>


                  {aiInterpretation.relationships?.length > 0 && (
                    <div className="ai-section">
                      <h4>❤️ Relationships</h4>

                      {aiInterpretation.relationships.map(
                        (item, index) => (
                          <p key={index}>• {item}</p>
                        )
                      )}
                    </div>
                  )}

                  {aiInterpretation.career?.length > 0 && (
                    <div className="ai-section">
                      <h4>💼 Career</h4>

                      {aiInterpretation.career.map(
                        (item, index) => (
                          <p key={index}>• {item}</p>
                        )
                      )}
                    </div>
                  )}

                  {aiInterpretation.personal_growth?.length > 0 && (
                    <div className="ai-section">
                      <h4>🌱 Personal Growth</h4>

                      {aiInterpretation.personal_growth.map(
                        (item, index) => (
                          <p key={index}>• {item}</p>
                        ) 
                      )}
                    </div>
                  )}

                  {aiInterpretation.opportunities?.length > 0 && (
                    <div className="ai-section">
                      <h4>✨ Opportunities</h4>

                      {aiInterpretation.opportunities.map(
                        (item, index) => (
                          <p key={index}>• {item}</p>
                        )
                      )}
                    </div>
                  )}

                  {aiInterpretation.recommendations?.length > 0 && (
                    <div className="ai-section">
                      <h4>💡 Personalized Recommendations</h4>

                      {aiInterpretation.recommendations.map((item, index) => (
                        <p key={index}>• {item}</p>
                      ))}
                    </div>
                  )}

                  {/* =====================================================
                      AI REPORTS
                      ===================================================== */}

                  <div
                    style={{
                      marginTop: "24px",
                      padding: "18px",
                      borderRadius: "14px",
                      background: "#f8f7ff",
                      border: "1px solid #e5e0ff"
                    }}
                  >
                    <h4 style={{ marginTop: 0 }}>
                      📄 Download AI Reports
                    </h4>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "16px"
                      }}
                    >
                      Download detailed reports based on your current AI interpretation.
                    </p>

                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "10px"
                      }}
                    >

                      {/* PERSONALITY REPORT */}
                      <button
                        className="feature-button"
                        onClick={() =>
                          handleDownloadAIReport({
                            endpoint: "/ai/personality-report",
                            filename: "personality_intelligence_report.pdf"
                          })
                        }
                      >
                        🧠 Personality Report
                      </button>


                      {/* SPIRITUAL GUIDANCE REPORT */}
                        <button
                          className="feature-button"
                          onClick={() =>
                            handleDownloadAIReport({
                              endpoint: "/ai/spiritual-guidance-report",
                              filename: "spiritual_guidance_report.pdf"
                            })
                          }
                        >
                          ✨ Spiritual Guidance Report
                        </button>


                        {/* INSIGHT TREND REPORT */}
                        <button
                          className="feature-button"
                          onClick={() =>
                            handleDownloadAIReport({
                              endpoint: "/ai/insight-trend-report",
                              filename: "insight_trend_report.pdf"
                            })
                          }
                        >
                          📈 Insight Trend Report
                        </button>

                    </div>
                  </div>

                  {aiInterpretation.disclaimer && (
                    <div className="ai-disclaimer">
                      <strong>Note:</strong>{" "}
                      {aiInterpretation.disclaimer}
                    </div>
                  )}

              </div>
            )}
          </div>

          <div className="palm-action-buttons">

            <button
              type="button"
              className="palm-report-button"
              onClick={handleGeneratePalmReport}
            >
              📄 Generate Palm Report
            </button>

            <button
              type="button"
              className="secondary-button palm-new-reading-button"
              onClick={() => {
                  setPalmImage(null);
                  setPalmPreview(null);
                  setPalmAnalysisStarted(false);
                  setPalmAnalysis(null);

                  setMessage("");
                  setError("");
              }}
            >
               ← Analyze Another Palm
            </button>

             <button
                type="button"
                className="secondary-button palm-back-dashboard"
                onClick={() => {
                  setPalmImage(null);
                  setPalmPreview(null);
                  setPalmAnalysisStarted(false);
                  setPalmAnalysis(null);

                  setActivePage("dashboard");
                }}
            >
               ← Back to Dashboard
            </button>

          </div>
          </div>

        </div>

        )}

      </div>
    );



  };

  // =====================================================
  // HISTORY PAGE
  // =====================================================

  const renderHistory = () => {

    return (
      <div className="history-page">

        <div className="history-page-header">

          <div className="history-page-icon">
            📜
          </div>

          <div>

            <span className="hero-label">
              ✨ YOUR JOURNEY
            </span>

            <h2>
              Reading History
            </h2>

            <p>
              Revisit your previous tarot and palmistry
              readings and reflect on your personal insights.
            </p>

          </div>

        </div>

        <div className="history-content">

          <div className="history-section-heading">

            <div>

              <h3>
                Previous Readings
              </h3>

              <p>
                Your recent spiritual readings will appear here.
              </p>

            </div>

            <span className="history-count">
              {readingHistory.length}{" "}
              {readingHistory.length === 1 ? "Reading" : "Readings"}
            </span>

          </div>

          <div className="history-list">

            {readingHistory.length === 0 ? (
              <div className="history-empty-state">
                <div className="history-empty-icon">
                  📜
                </div>

                <h3>
                  No Readings Yet
                </h3>

                <p>
                  Complete a Tarot reading or Palm analysis and
                   your reading will appear here.
                </p>
              </div>
            ) : (
              readingHistory.map((reading) => (
                <div
                  className="history-card-item"
                  key={reading.id}
                >

                  <div
                    className={`history-card-icon ${
                      reading.type === "Tarot"
                        ? "tarot-history-icon"
                        : "palm-history-icon"
                    }`}
                  >
                    {reading.type === "Tarot" ? "🔮" : "✋"}
                  </div>

                  <div className="history-card-details">

                    <div className="history-card-top">

                      <div>
                        <h3>
                          {reading.title}
                        </h3>

                        <span className="history-date">
                          {reading.date}
                        </span>
                      </div>

                      <span
                        className={`history-type ${
                          reading.type === "Tarot"
                            ? "tarot-type"
                            : "palm-type"
                        }`}
                      >
                        {reading.type}
                      </span>

                    </div>

                     <p>
                      {reading.description}
                    </p>

                    <div className="history-card-meta">

                      {reading.meta?.map((item, index) => (
                        <span key={index}>
                          {item}
                        </span>
                      ))}

                    </div>

                  </div>

                  <button
                    className="history-view-button"
                    onClick={() =>
                      setActivePage(reading.page)
                    }
                  >
                    View →
                  </button>

                </div>
              ))
            )}

          </div>

          <div className="history-info-card">

            <div className="history-info-icon">
              💫
            </div>

            <div>

              <h3>
                Your readings are saved for reflection
              </h3>

              <p>
                As you continue using the platform, your
                tarot and palmistry readings will be stored
                here so you can revisit them whenever you wish.
              </p>

            </div>

          </div>

        </div>

        <button
          className="secondary-button history-back-button"
          onClick={() =>
            setActivePage("dashboard")
          }
        >
          ← Back to Dashboard
        </button>

      </div>
    );
  };

  // =====================================================
  // PERSONALITY PROFILE PAGE
  // =====================================================

  const renderPersonalityProfile = () => {

    const personality =
      aiInterpretation?.personality_intelligence;

    const tarotPersonality =
      aiInterpretation?.tarot_personality_intelligence;

    console.log(
      "TAROT PERSONALITY:",
      aiInterpretation?.tarot_personality_intelligence
    );

    const displayedPersonality = {
      profile: [
        personality?.profile
          ? `Palm-based insight: ${personality.profile}`
          : null,

        tarotPersonality?.profile &&
        !tarotPersonality.profile.toLowerCase().includes("no tarot")
          ? `Tarot-based insight: ${tarotPersonality.profile}`
          : null
      ].filter(Boolean).join(" "),

      strengths: [
        ...(personality?.strengths || []),
        ...(tarotPersonality?.strengths || [])
      ],

      areas_for_development: [
        ...(personality?.areas_for_development || []),
        ...(tarotPersonality?.areas_for_development || [])
      ],

      behavioral_insights: [
        ...(personality?.behavioral_insights || []),
        ...(tarotPersonality?.behavioral_insights || [])
      ],

      personal_development: [
        ...(personality?.personal_development || []),
        ...(tarotPersonality?.personal_development || [])
      ],

      personal_tendencies: {
        ...(personality?.personal_tendencies || {}),
        ...(tarotPersonality?.personal_tendencies || {})
      }
    };


    return (
      <div className="personality-profile-page">

        <div className="palm-page-header">

          <div className="palm-page-icon">
            🧠
          </div>

          <div>
            <span className="hero-label">
              ✨ AI PERSONALITY INTELLIGENCE
            </span>

            <h2>
              Your Personality Profile
            </h2>

            <p>
              Explore your personality insights,
              strengths, behavioral patterns, and
              personal development themes.
            </p>
          </div>

        </div>

        {!personality && !tarotPersonality ? (

          <div className="insight-card">
            <div className="insight-icon">
              🧠
            </div>

            <div>
              <h3>
                Your Personality Profile Is Not Available Yet
              </h3>

              <p>
                Complete a Palm or Tarot reading to
                generate your personalized personality
                insights.
              </p>
            </div>
          </div>

        ) : (

          <div className="ai-interpretation-card">

            {displayedPersonality.profile && (
              <div className="ai-section">

                <h4>✨ Profile</h4>

                <p>
                  {displayedPersonality.profile}
                </p>

              </div>
            )}

            {displayedPersonality.strengths?.length > 0 && (
              <div className="ai-section">

                <h4>💪 Strengths</h4>

                {displayedPersonality.strengths.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}

              </div>
            )}

            {displayedPersonality.areas_for_development?.length > 0 && (
              <div className="ai-section">

                <h4>🌱 Areas for Development</h4>

                {displayedPersonality.areas_for_development.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}

              </div>
            )}

            {displayedPersonality.behavioral_insights?.length > 0 && (
              <div className="ai-section">

                <h4>🧩 Behavioral Insights</h4>

                {displayedPersonality.behavioral_insights.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}

              </div>
            )}

            {displayedPersonality.personal_development?.length > 0 && (
              <div className="ai-section">

                <h4>🚀 Personal Development</h4>

                {displayedPersonality.personal_development.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}

              </div>
            )}

            {displayedPersonality.personal_tendencies && (
              <div className="ai-section">

                <h4>🎯 Personal Tendencies</h4>

                {Object.entries(
                  displayedPersonality.personal_tendencies
                ).map(([key, value]) => (

                  <p key={key}>

                    <strong>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (letter) =>
                          letter.toUpperCase()
                        )}
                      :
                    </strong>{" "}

                    {value}

                  </p>

                ))}

              </div>
            )}

          </div>

        )}

        <button
          className="secondary-button"
          onClick={() => setActivePage("dashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>
    );
  };

  // =====================================================
  // PROFILE PAGE
  // =====================================================

  const renderProfile = () => {

    return (
      <div className="profile-section">

        {!isEditingProfile ? (

          <>

            <div className="profile-avatar">
              {currentUser.username
                .charAt(0)
                .toUpperCase()}
            </div>

            <h2>
              {currentUser.username}
            </h2>

            <p>
              <strong>
                User ID:
              </strong>{" "}
              {currentUser.user_id}
            </p>

            <p>
              <strong>
                Email:
              </strong>{" "}
              {currentUser.email}
            </p>

            <p>
              <strong>
                Gender:
              </strong>{" "}
              {currentUser.gender || "Not provided"}
            </p>

            <p>
              <strong>Age Group:</strong>{" "}
              {currentUser.age_group || "Not provided"}
            </p>

            <p>
              <strong>Interests:</strong>{" "}
              {currentUser.interests || "Not provided"}
            </p>

            <p>
              <strong>Spiritual Goals:</strong>{" "}
              {currentUser.spiritual_goals || "Not provided"}
            </p>

            <p>
              <strong>Reading Preferences:</strong>{" "}
              {currentUser.reading_preferences || "Not provided"}
            </p>

            <p>
              <strong>
                Role:
              </strong>{" "}
              {currentUser.role_name}
            </p>

            <p>
              <strong>
                Account Created:
              </strong>{" "}
              {new Date(
                currentUser.created_at
              ).toLocaleString()}
            </p>

            <button
              className="primary-button"
              onClick={() => {

                setProfileData({
                  username: currentUser.username || "",
                  email: currentUser.email || "",
                  gender: currentUser.gender || "",
                  age_group: currentUser.age_group || "",
                  interests: currentUser.interests || "",
                  spiritual_goals: currentUser.spiritual_goals || "",
                  reading_preferences: currentUser.reading_preferences || "",
                });

                setIsEditingProfile(true);

                setMessage("");
                setError("");

              }}
            >
              Edit Profile
            </button>

          </>

        ) : (

          <>

            <h2>
              Edit Profile
            </h2>

            <form
              onSubmit={
                handleUpdateProfile
              }
            >

              <label>
                Username
              </label>

              <input
                type="text"
                value={
                  profileData.username
                }
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    username:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Email
              </label>

              <input
                type="email"
                value={
                  profileData.email
                }
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    email:
                      e.target.value,
                  })
                }
                required
              />

              <label>
                Gender
              </label>

              <select
                value={profileData.gender}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    gender: e.target.value,
                  })
                }
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">
                  Prefer not to say
                </option>
              </select>

              <label>
                Age Group
              </label>

              <select
                value={profileData.age_group}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    age_group: e.target.value,
                  })
                }
              >
                <option value="">Select age group</option>
                <option value="Under 18">Under 18</option>
                <option value="18-25">18-25</option>
                <option value="26-35">26-35</option>
                <option value="36-50">36-50</option>
                <option value="51+">51+</option>
              </select>

              <label>
                Interests
              </label>

              <textarea
                value={profileData.interests}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    interests: e.target.value,
                  })
                }
                placeholder="Example: Meditation, Tarot, Career, Relationships"
              />

              <label>
                Spiritual Goals
              </label>

              <textarea
                value={profileData.spiritual_goals}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    spiritual_goals: e.target.value,
                  })
                }
                placeholder="Example: Personal growth, inner peace, self-awareness"
              />

              <label>
                Reading Preferences
              </label>

              <textarea
                value={profileData.reading_preferences}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    reading_preferences: e.target.value,
                  })
                }
                placeholder="Example: Detailed readings, career-focused guidance"
              />

              <button
                type="submit"
                className="primary-button"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="secondary-button"
                onClick={() => {

                  setIsEditingProfile(false);

                  setMessage("");
                  setError("");

                }}
              >
                Cancel
              </button>

            </form>

            <p>
              <strong>
                Role:
              </strong>{" "}
              {currentUser.role_name}
            </p>

            <p>
              <strong>
                User ID:
              </strong>{" "}
              {currentUser.user_id}
            </p>

          </>

        )}

      </div>
    );
  };

  // =====================================================
  // REGISTRATION STEP 1 PAGE
  // =====================================================

  const renderRegistrationDetails = () => {

    return (
      <>

        <div className="welcome">

          <div className="auth-icon">
            🌙
          </div>

          <span className="registration-step-label">
            STEP 1 OF 2
          </span>

          <h2>
            Create Account
          </h2>

          <p>
            Tell us a little about yourself
            to begin your personalized
            spiritual journey.
          </p>

        </div>



        <form
          onSubmit={
            handleContinueRegistration
          }
        >

          {/* USERNAME */}

          <label>
            Username
          </label>

          <input
            type="text"
            placeholder="Enter your username"
            value={
              registerData.username
            }
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                username:
                  e.target.value,
              })
            }
            required
          />

          {/* EMAIL */}

          <label>
            Email
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={
              registerData.email
            }
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                email:
                  e.target.value,
              })
            }
            required
          />

          <label>
            Gender
          </label>

          <select
            value={profileData.gender}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                gender: e.target.value,
              })
            }
          >
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer not to say">
              Prefer not to say
            </option>
          </select>

          <label>
            Age Group
          </label>

          <select
            value={profileData.age_group}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                age_group: e.target.value,
              })
            }
          >
            <option value="">Select age group</option>
            <option value="Under 18">Under 18</option>
            <option value="18-25">18-25</option>
            <option value="26-35">26-35</option>
            <option value="36-50">36-50</option>
            <option value="51+">51+</option>
          </select>

          <label>
            Interests
          </label>

          <textarea
            value={profileData.interests}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                interests: e.target.value,
              })
            }
            placeholder="Example: Meditation, Tarot, Career, Relationships"
          />

          <label>
            Spiritual Goals
          </label>

          <textarea
            value={profileData.spiritual_goals}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                spiritual_goals: e.target.value,
              })
            }
            placeholder="Example: Personal growth, inner peace, self-awareness"
          />

          <label>
            Reading Preferences
          </label>

          <textarea
            value={profileData.reading_preferences}
            onChange={(e) =>
              setProfileData({
                ...profileData,
                reading_preferences: e.target.value,
              })
            }
            placeholder="Example: Detailed readings, career-focused guidance"
          />

          

          {/* GENDER */}

          <label>
            Gender
          </label>

          <div className="gender-options">

            <button
              type="button"
              className={
                registerData.gender ===
                "male"
                  ? "gender-option active"
                  : "gender-option"
              }
              onClick={() =>
                setRegisterData({
                  ...registerData,
                  gender: "male",
                })
              }
            >
              <span>
                👨
              </span>

              <strong>
                Male
              </strong>
            </button>

            <button
              type="button"
              className={
                registerData.gender ===
                "female"
                  ? "gender-option active"
                  : "gender-option"
              }
              onClick={() =>
                setRegisterData({
                  ...registerData,
                  gender: "female",
                })
              }
            >
              <span>
                👩
              </span>

              <strong>
                Female
              </strong>
            </button>

            <button
              type="button"
              className={
                registerData.gender ===
                "other"
                  ? "gender-option active"
                  : "gender-option"
              }
              onClick={() =>
                setRegisterData({
                  ...registerData,
                  gender: "other",
                })
              }
            >
              <span>
                🧑
              </span>

              <strong>
                Other
              </strong>
            </button>

          </div>

          {/* ROLE */}

          <label>
            Choose Role
          </label>

          <button
            type="button"
            className="role-picker-trigger"
            onClick={() => {
              setShowRolePicker(true);
              setError("");
            }}
          >
            <span className="role-picker-trigger-icon">
              {roles.find((role) => role.id === registerData.role_id)?.icon || "✨"}
            </span>

            <span className="role-picker-trigger-content">
              <strong>
                {roles.find((role) => role.id === registerData.role_id)?.title || "Select a role"}
              </strong>

              <small>
                {roles.find((role) => role.id === registerData.role_id)?.description ||
                  "Choose how you would like to use the platform."}
              </small>
            </span>

            <span className="role-picker-arrow">
              ›
            </span>
          </button>

          {/* PASSWORD */}

          <label>
            Password
          </label>

          <input
            type="password"
            placeholder="Create password"
            value={
              registerData.password
            }
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                password:
                  e.target.value,
              })
            }
            required
          />

          {/* CONFIRM PASSWORD */}

          <label>
            Confirm Password
          </label>

          <input
            type="password"
            placeholder="Re-enter your password"
            value={
              registerData.confirmPassword
            }
            onChange={(e) =>
              setRegisterData({
                ...registerData,
                confirmPassword:
                  e.target.value,
              })
            }
            required
          />

          {/* PASSWORD MATCH */}

          {registerData.confirmPassword &&
            registerData.password !==
              registerData.confirmPassword && (
              <small className="password-error">
                ⚠ Passwords do not match
              </small>
            )}

          {registerData.confirmPassword &&
            registerData.password ===
              registerData.confirmPassword && (
              <small className="password-success">
                ✓ Passwords match
              </small>
            )}

          {/* CREATE ACCOUNT */}

          <button
            type="submit"
            className="primary-button continue-button"
          >
            Create Account →
          </button>

        </form>

        <div className="switch">

          <p>
            Already have an
            account?
          </p>

          <button
            className="secondary-button"
            onClick={() => {

              setIsRegister(false);
              

              setMessage("");
              setError("");

            }}
          >
            Back to Login
          </button>

        </div>

      </>
    );
  };

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="app">

      {/* =================================================
          NOT LOGGED IN
      ================================================= */}

      {!currentUser ? (

        <>

          {/* HEADER */}

          <header className="header">

            <div className="logo-section">

              <div className="logo">
                🌿
              </div>

              <div>

                <h1>
                  AI Palmistry & Tarot
                </h1>

                <p>
                  Intelligence Platform
                </p>

              </div>

            </div>

          </header>

          {/* AUTH */}

          <main className="auth-container">

            <div
              className="auth-card"
            >

              {/* =================================================
                  LOGIN
              ================================================= */}

              {!isRegister ? (

                <>

                  <div className="welcome">

                    <div className="auth-icon">
                      🔮
                    </div>

                    <h2>
                      Welcome Back
                    </h2>

                    <p>
                      Sign in to access your
                      personalized palmistry
                      and tarot insights.
                    </p>

                  </div>

                  <form
                    onSubmit={handleLogin}
                  >

                    <label>
                      Username
                    </label>

                    <input
                      type="text"
                      placeholder="Enter your username"
                      value={
                        loginData.username
                      }
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          username:
                            e.target.value,
                        })
                      }
                      required
                    />

                    <label>
                      Password
                    </label>

                    <input
                      type="password"
                      placeholder="Enter your password"
                      value={
                        loginData.password
                      }
                      onChange={(e) =>
                        setLoginData({
                          ...loginData,
                          password:
                            e.target.value,
                        })
                      }
                      required
                    />

                    <button
                      type="submit"
                      className="primary-button"
                    >
                      Sign In
                    </button>

                  </form>

                  <div className="switch">

                    <p>
                      Don't have an
                      account?
                    </p>

                    <button
                      className="secondary-button"
                      onClick={() => {

                        setIsRegister(true);

                        

                        setMessage("");
                        setError("");

                      }}
                    >
                      Create Account
                    </button>

                  </div>

                </>

              ) : (

                /* =================================================
                   REGISTER
                ================================================= */

                renderRegistrationDetails()

              )}

              {/* =================================================
                  MESSAGES
              ================================================= */}

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

            </div>

            {/* ROLE PICKER MODAL */}

            {showRolePicker && (
              <div
                className="role-picker-overlay"
                onClick={() => setShowRolePicker(false)}
              >
                <div
                  className="role-picker-modal"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="role-picker-header">
                    <div>
                      <span className="role-picker-eyebrow">
                        ✨ PERSONALIZE YOUR EXPERIENCE
                      </span>

                      <h2>
                        Choose Your Role
                      </h2>

                      <p>
                        Select the role that best matches how you want to use the platform.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="role-picker-close"
                      aria-label="Close role picker"
                      onClick={() => setShowRolePicker(false)}
                    >
                      ×
                    </button>
                  </div>

                  <div className="role-picker-grid">
                    {roles.map((role) => {
                      const isSelected =
                        registerData.role_id === role.id;

                      return (
                        <button
                          type="button"
                          key={role.id}
                          className={
                            isSelected
                              ? "role-picker-card selected"
                              : "role-picker-card"
                          }
                          onClick={() => {
                            setRegisterData({
                              ...registerData,
                              role_id: role.id,
                            });

                            setShowRolePicker(false);
                            setError("");
                          }}
                        >
                          <div className="role-card-visual">
                            <span className="role-card-picture">
                              {role.icon}
                            </span>

                            {isSelected && (
                              <span className="role-card-check">
                                ✓
                              </span>
                            )}
                          </div>

                          <div className="role-card-copy">
                            <span className="role-card-tag">
                              {role.shortTitle}
                            </span>

                            <h3>
                              {role.title}
                            </h3>

                            <p>
                              {role.description}
                            </p>
                          </div>

                          <span className="role-card-action">
                            {isSelected ? "Selected ✓" : "Select Role"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          </main>

          <footer>

            <p>
              AI Palmistry & Tarot
              Intelligence Platform
            </p>

          </footer>

        </>

      ) : (

        /* =================================================
           LOGGED IN DASHBOARD
        ================================================= */

        <>

          <header className="dashboard-header">

            <div className="logo-section">

              <div className="logo">
                🌿
              </div>

              <div>

                <h1>
                  AI Palmistry & Tarot
                </h1>

                <p>
                  Intelligence Platform
                </p>

              </div>

            </div>

            <div className="user-header">

              <div className="user-avatar">

                {currentUser.username
                  .charAt(0)
                  .toUpperCase()}

              </div>

              <div className="user-header-info">

                <strong>
                  {currentUser.username}
                </strong>

                <span>
                  {currentUser.role_name}
                </span>

              </div>

            </div>

          </header>

          <div className="dashboard-layout">

            {/* SIDEBAR */}

            <aside className="sidebar">

              <div className="sidebar-title">
                <span>
                  MENU
                </span>
              </div>

              <button
                className={
                  activePage === "dashboard"
                    ? "nav-item active"
                    : "nav-item"
                }
                onClick={() =>
                  setActivePage("dashboard")
                }
              >
                🏠
                <span>
                  Dashboard
                </span>
              </button>

              {role ==="User" && (
                <>
                  <button
                    className={
                      activePage === "tarot"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("tarot")
                    }
                  >
                    🔮
                    <span>
                      Tarot Reading
                    </span>
                  </button>

                  <button
                    className={
                      activePage === "palm"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("palm")
                    }
                  >
                    ✋
                    <span>
                      Palm Reading
                    </span>
                  </button>

                  <button
                    className={
                      activePage === "history"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("history")
                    }
                  >
                    📜
                    <span>
                      Reading History
                    </span>
                  </button>

                  <button
                    className={
                      activePage === "request-tarot-session"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("request-tarot-session")}
                  >
                    📅
                    <span>Request Tarot Session</span>
                  </button>
                  <button
                    className={
                      activePage === "notifications"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("notifications")}
                  >
                    🔔
                    <span>Notifications</span>
                  </button>

                  <button
                    className={
                      activePage === "personality"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("personality")
                    }
                  >
                    🧠
                    <span>
                      Personality Profile
                    </span>
                  </button>

                  <div className="sidebar-divider">
                  </div>

                  <button
                    className={
                      activePage === "profile"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("profile")
                    }
                  >
                    👤 
                    <span>
                      My Profile
                    </span>
                  </button>
                </>
              )}

              {role === "Tarot Reader" && (
                <>
                  
                  <button
                    className={
                      activePage === "create-tarot-session"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("create-tarot-session")}
                  >
                    📩
                    <span>Session Requests</span>
                  </button>

                  <button
                    className={
                      activePage === "reading-analytics"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("reading-analytics")}
                  >
                    📊
                    <span>Reading Analytics</span>
                  </button>

                  <button
                    className={
                      activePage === "user-engagement"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("user-engagement")}
                  >
                    👥
                    <span>User Engagement</span>
                  </button>

                  <button
                    className={
                      activePage === "session-tracking"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("session-tracking")}
                  >
                    🕒
                    <span>Session Tracking</span>
                  </button>

                  <button
                    className={
                      activePage === "report-management"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("report-management")}
                  >
                    📄
                    <span>Report Management</span>
                  </button>

                  <button
                    className={
                      activePage === "notifications"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("notifications")}
                  >
                    🔔
                    <span>Notifications</span>
                  </button>

                  <div className="sidebar-divider"></div>

                  <button
                    className={
                      activePage === "profile"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("profile")}
                  >
                    👤
                    <span>My Profile</span>
                  </button>
                </>
              )}

              {role === "Spiritual Consultant" && (
                <>
                  <button
                    className={
                      activePage === "consultant-user-trends"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("consultant-user-trends")
                    }
                  >
                    📈
                    <span>User Trend Analysis</span>
                  </button>

                  <button
                    className={
                      activePage === "guidance-effectiveness"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("guidance-effectiveness")
                    }
                  >
                    🎯
                    <span>Guidance Effectiveness</span>
                  </button>

                  <button
                    className={
                      activePage === "consultation-insights"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("consultation-insights")
                    }
                  >
                    💡
                    <span>Consultation Insights</span>
                  </button>

                  <div className="sidebar-divider"></div>

                  <button
                    className={
                      activePage === "profile"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() =>
                      setActivePage("profile")
                    }
                  >
                    👤
                    <span>My Profile</span>
                  </button>
                </>
              )}

              {role === "Administrator" && (
                <>
                  <button
                    className={
                      activePage === "admin-user-management"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("admin-user-management")}
                  >
                    👥
                    <span>User Management</span>
                  </button>

                  <button
                    className={
                      activePage === "admin-platform-analytics"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("admin-platform-analytics")}
                  >
                    📊
                    <span>Platform Analytics</span>
                  </button>

                  <button
                    className={
                      activePage === "admin-reading-statistics"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("admin-reading-statistics")}
                  >
                    📈
                    <span>Reading Statistics</span>
                  </button>

                  <button
                    className={
                      activePage === "admin-system-reports"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("admin-system-reports")}
                  >
                    📄
                    <span>System Reports</span>
                  </button>
                  <button
                    className={
                      activePage === "admin-announcements"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("admin-announcements")}
                  >
                    📢
                    <span>Platform Announcements</span>
                  </button>

                  <div className="sidebar-divider"></div>

                  <button
                    className={
                      activePage === "profile"
                        ? "nav-item active"
                        : "nav-item"
                    }
                    onClick={() => setActivePage("profile")}
                  >
                    👤
                    <span>My Profile</span>
                  </button>
                </>
              )}
              <button
                className="nav-item logout-item"
                onClick={
                  handleLogout
                }
              >
                🚪
                <span>
                  Logout
                </span>
              </button>

            </aside>

            {/* MAIN */}

            <main className="dashboard-main">

              {activePage ==="dashboard" &&
                renderDashboard()
              }

              {activePage === "notifications" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">
                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        🔔
                      </div>

                      <div>
                        <span className="system-reports-label">
                          NOTIFICATIONS
                        </span>

                        <h2>
                          Notification Center
                        </h2>

                        <p>
                          View your session invitations, AI insights,
                          spiritual growth alerts and important updates.
                        </p>
                      </div>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="feature-button"
                        onClick={createDailyGuidance}
                      >
                        🌞 Today's Guidance
                      </button>

                      <button
                        className="feature-button"
                        onClick={markAllNotificationsAsRead}
                        disabled={
                          notifications.length === 0 ||
                          notifications.every(
                            (notification) => notification.is_read
                          )
                        }
                      >
                        ✓ Mark All as Read
                      </button>
                    </div>

                  </div>
                  

                  {notificationsLoading && (
                    <div className="feature-card">
                      <h3>Loading notifications...</h3>
                    </div>
                  )}

                  {notificationsError && (
                    <div className="feature-card">
                      <h3>Unable to load notifications</h3>
                      <p>{notificationsError}</p>
                    </div>
                  )}

                  {!notificationsLoading &&
                    !notificationsError &&
                    notifications.length === 0 && (
                      <div className="feature-card">
                        <div className="feature-icon">🔔</div>
                        <h3>No Notifications</h3>
                        <p>
                          You don't have any notifications right now.
                        </p>
                      </div>
                    )}

                  {!notificationsLoading &&
                    !notificationsError &&
                    notifications.length > 0 && (
                      <div className="feature-grid">

                        {notifications.map((notification) => (
                          <div
                              key={notification.notification_id}
                              className="feature-card"
                              onClick={() => {
                                if (!notification.is_read) {
                                  markNotificationAsRead(notification.notification_id);
                                }
                              }}
                              style={{
                                cursor: notification.is_read ? "default" : "pointer",
                              }}
                            >
                            <div className="feature-icon">
                              {notification.notification_type === "reading_reminder"
                                ? "🔮"
                                : notification.notification_type === "spiritual_growth"
                                ? "🌱"
                                : notification.notification_type === "insight_update"
                                ? "🧠"
                                : notification.notification_type === "announcement"
                                ? "📢"
                                : notification.notification_type === "daily_guidance"
                                ? "🌞"
                                : "🔔"}
                            </div>

                            <h3>{notification.title}</h3>

                            <p>
                              {notification.message}
                            </p>

                            <small>
                              {new Date(
                                notification.created_at
                              ).toLocaleString()}
                            </small>

                            {!notification.is_read && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  fontWeight: "600",
                                }}
                              >
                                🟢 New
                              </div>
                            )}
                          </div>
                        ))}

                      </div>
                    )}

                </div>
              )}


              {activePage === "admin-user-management" && (
                <div className="dashboard-content">

                  {/* USER MANAGEMENT HEADER */}
                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        👥
                      </div>
 
                      <div>

                        <span className="system-reports-label">
                          ADMINISTRATOR
                        </span>

                        <h2>
                          User Management
                        </h2>

                        <p>
                          Manage users, roles and recently registered accounts.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* USER STATISTICS */}
                  <div className="admin-user-stats-grid">

                    {/* TOTAL USERS */}
                    <div className="admin-user-stat-card">

                      <div className="admin-user-stat-icon">
                        👥
                      </div>

                      <div className="admin-user-stat-content">
                        <span>Total Users</span>

                        <strong>
                          {adminUsers?.total_users ?? "Loading..."}
                        </strong>

                        <small>All registered accounts</small>
                      </div>

                    </div>


                    {/* USERS */}
                    <div className="admin-user-stat-card">

                      <div className="admin-user-stat-icon">
                        👤
                      </div>

                      <div className="admin-user-stat-content">
                        <span>Users</span>

                        <strong>
                          {adminUsersByRole?.users_by_role?.find(
                            (item) => item.role === "User"
                          )?.count ?? 0}
                        </strong>

                        <small>Regular users</small>
                      </div>

                    </div>


                    {/* TAROT READERS */}
                    <div className="admin-user-stat-card">

                      <div className="admin-user-stat-icon">
                        🔮
                      </div>

                      <div className="admin-user-stat-content">
                        <span>Tarot Readers</span>

                        <strong>
                          {adminUsersByRole?.users_by_role?.find(
                            (item) => item.role === "Tarot Reader"
                          )?.count ?? 0}
                        </strong>

                        <small>Reading specialists</small>
                      </div>

                    </div>


                    {/* SPIRITUAL CONSULTANTS */}
                    <div className="admin-user-stat-card">

                      <div className="admin-user-stat-icon">
                        ✨
                      </div>

                      <div className="admin-user-stat-content">
                        <span>Spiritual Consultants</span>

                        <strong>
                          {adminUsersByRole?.users_by_role?.find(
                            (item) => item.role === "Spiritual Consultant"
                          )?.count ?? 0}
                        </strong>

                        <small>Guidance specialists</small>
                      </div>

                    </div>

                  </div>

                  {/* ALL USERS */}
                  <div className="admin-users-panel">

                    <div className="admin-panel-header">
                      <div>
                        <h3>👥 All Users</h3>
                        <p>View registered users and their platform roles.</p>
                      </div>
                    </div>

                    {adminUsersLoading ? (
                      <p>Loading users...</p>
                    ) : adminUsersError ? (
                      <p>{adminUsersError}</p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>

                        <table style={{ width: "100%", borderCollapse: "collapse" }}>

                          <thead>
                            <tr>
                              <th style={{ textAlign: "left", padding: "10px" }}>
                                ID
                              </th>

                              <th style={{ textAlign: "left", padding: "10px" }}>
                                Username
                              </th>

                              <th style={{ textAlign: "left", padding: "10px" }}>
                                Email
                              </th>

                              <th style={{ textAlign: "left", padding: "10px" }}>
                                Gender
                              </th>

                              <th style={{ textAlign: "left", padding: "10px" }}>
                                Role
                              </th>

                              <th style={{ textAlign: "left", padding: "10px" }}>
                                Registered
                              </th>
                            </tr>
                          </thead>

                          <tbody>

                            {adminUsers?.users?.map((user) => (
                              <tr key={user.user_id}>

                                <td style={{ padding: "10px" }}>
                                  {user.user_id}
                                </td>

                                <td style={{ padding: "10px" }}>
                                  {user.username}
                                </td>

                                <td style={{ padding: "10px" }}>
                                  {user.email}
                                </td>

                                <td style={{ padding: "10px" }}>
                                  {user.gender || "—"}
                                </td>

                                <td style={{ padding: "10px" }}>
                                  {user.role}
                                </td>

                                <td style={{ padding: "10px" }}>
                                  {user.created_at
                                    ? new Date(
                                        user.created_at
                                      ).toLocaleDateString()
                                    : "—"}
                                </td>

                              </tr>
                            ))}

                          </tbody>

                        </table>

                      </div>
                    )}

                  </div>

                  {/* RECENT REGISTRATIONS */}
                  <div className="admin-users-panel">

                    <div>
                      <h3>🆕 Recently Registered Users</h3>
                      <p>Latest accounts registered on the platform.</p>
                    </div>

                    {adminRecentUsers?.recent_users?.length > 0 ? (

                      adminRecentUsers.recent_users.map((user) => (

                        <div
                          key={user.user_id}
                          style={{
                            padding: "12px 0",
                            borderBottom: "1px solid #eee"
                          }}
                        >

                          <strong>{user.username}</strong>

                          <p style={{ margin: "4px 0" }}>
                            {user.email}
                          </p>

                          <small>
                            {user.role} •{" "}
                            {user.created_at
                              ? new Date(
                                  user.created_at
                                ).toLocaleDateString()
                              : "—"}
                          </small>

                        </div>

                      ))

                    ) : (
                      <p>No recent registrations found.</p>
                    )}

                  </div>

                </div>
              )}

              {activePage === "admin-platform-analytics" && (
                <div className="dashboard-content">

                  {/* PLATFORM ANALYTICS HEADER */}
                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        📊
                      </div>

                      <div>

                        <span className="system-reports-label">
                          ADMINISTRATOR
                        </span>

                        <h2>
                          Platform Analytics
                        </h2>

                        <p>
                          Overview of platform users, Palm analyses, and Tarot readings.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* LOADING */}
                  {adminAnalyticsLoading && (
                    <div className="feature-card">
                      <h3>Loading analytics...</h3>
                      <p>Please wait while the platform statistics are loaded.</p>
                    </div>
                  )}

                  {/* ERROR */}
                  {adminAnalyticsError && (
                    <div className="feature-card">
                      <h3>Unable to load analytics</h3>
                      <p>{adminAnalyticsError}</p>
                    </div>
                  )}

                  {/* ANALYTICS */}
                  {!adminAnalyticsLoading &&
                    !adminAnalyticsError &&
                    adminAnalytics && (
                      <>
                        {/* OVERVIEW CARDS */}
                        <div 
                          className="feature-grid"
                          style={{
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "20px",
                          }}
                        >

                          <div className="feature-card">
                            <div className="feature-icon">👥</div>

                            <h3>Total Users</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {adminAnalytics.overview?.total_users ?? 0}
                            </p>

                            <p>
                              Registered platform users
                            </p>
                          </div>


                          <div className="feature-card">
                            <div className="feature-icon">🖐️</div>

                            <h3>Palm Analyses</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {adminAnalytics.overview?.total_palm_analyses ?? 0}
                            </p>

                            <p>
                              Palm analyses performed
                            </p>
                          </div>


                          <div className="feature-card">
                            <div className="feature-icon">🃏</div>

                            <h3>Tarot Readings</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {adminAnalytics.overview?.total_tarot_readings ?? 0}
                            </p>

                            <p>
                              Tarot readings performed
                            </p>
                          </div>


                          <div className="feature-card">
                            <div className="feature-icon">📈</div>

                            <h3>Total Analyses</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {adminAnalytics.overview?.total_analyses ?? 0}
                            </p>

                            <p>
                              Palm + Tarot activity
                            </p>
                          </div>

                        </div>


                        {/* ANALYSIS DISTRIBUTION */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>📊 Analysis Distribution</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={analysisDistributionChartData}
                              options={analysisDistributionChartOptions}
                            />
                          </div>
                        </div>

                        {/* PLATFORM ACTIVITY TREND */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>📈 Platform Activity Trend</h3>

                          <div
                            style={{
                              height: "360px",
                              marginTop: "20px",
                            }}
                          >
                            <Line
                              data={activityChartData}
                              options={activityChartOptions}
                            />
                          </div>
                        </div>

                        {/* USERS BY ROLE */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>👥 Users by Role</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={usersByRoleChartData}
                              options={usersByRoleChartOptions}
                            />
                          </div>
                        </div>

                        {/* KEY PLATFORM INSIGHTS */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>💡 Key Platform Insights</h3>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              gap: "20px",
                              marginTop: "20px",
                            }}
                          >

                            <div
                              style={{
                                padding: "18px",
                                borderRadius: "12px",
                                background: "#f8f7ff",
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                👥 <strong>Total Users</strong>
                              </p>

                              <p
                                style={{
                                  fontSize: "28px",
                                  fontWeight: "700",
                                  margin: "8px 0 0",
                                }}
                              >
                                {totalUsers}
                              </p>
                            </div>


                            <div
                              style={{
                                padding: "18px",
                                borderRadius: "12px",
                                background: "#f8f7ff",
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                📊 <strong>Total Analyses</strong>
                              </p>

                              <p
                                style={{
                                  fontSize: "28px",
                                  fontWeight: "700",
                                  margin: "8px 0 0",
                                }}
                              >
                                {totalAnalyses}
                              </p>
                            </div>


                            <div
                              style={{
                                padding: "18px",
                                borderRadius: "12px",
                                background: "#f8f7ff",
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                🃏 <strong>Tarot Activity</strong>
                              </p>

                              <p
                                style={{
                                  fontSize: "28px",
                                  fontWeight: "700",
                                  margin: "8px 0 0",
                                }}
                              >
                                {tarotPercentage}%
                              </p>
                            </div>


                            <div
                              style={{
                                padding: "18px",
                                borderRadius: "12px",
                                background: "#f8f7ff",
                              }}
                            >
                              <p style={{ margin: 0 }}>
                                👤 <strong>Largest User Role</strong>
                              </p>

                              <p
                                style={{
                                  fontSize: "20px",
                                  fontWeight: "700",
                                  margin: "8px 0 0",
                                }}
                              >
                                {topUserRole?.role ?? "—"}
                              </p>

                              <small>
                                {topUserRole?.count ?? 0} users
                              </small>
                            </div>

                          </div>

                          {peakActivity && (
                            <p
                              style={{
                                marginTop: "20px",
                                marginBottom: 0,
                              }}
                            >
                              📈 <strong>Peak Activity:</strong>{" "}
                              {peakActivity.date} with{" "}
                              {peakActivity.total} activities
                            </p>
                          )}

                        </div>

                      </>
                    )}

                </div>
              )}

              {activePage === "admin-reading-statistics" && (
                <div className="dashboard-content">

                  {/* READING STATISTICS HEADER */}
                  <div className="system-reports-header">
                    <div className="system-reports-title-area">
                      <div className="system-reports-title-icon">
                        📈
                      </div>
                      <div>
                        <span className="system-reports-label">
                          ADMINISTRATOR
                        </span>

                        <h2>
                          Reading Statistics
                        </h2>

                        <p>
                          Detailed statistics about Tarot readings and Palm analysis patterns.
                        </p>

                      </div>

                    </div>

                  </div>

                  {/* LOADING */}
                  {adminReadingStatsLoading && (
                    <div className="feature-card">
                      <h3>Loading reading statistics...</h3>

                      <p>
                        Please wait while the statistics are being loaded.
                      </p>
                    </div>
                  )}

                  {/* ERROR */}
                  {adminReadingStatsError && (
                    <div className="feature-card">
                      <h3>Unable to load reading statistics</h3>

                      <p>
                        {adminReadingStatsError}
                      </p>
                    </div>
                  )}

                  {/* STATISTICS */}
                  {!adminReadingStatsLoading &&
                    !adminReadingStatsError &&
                    adminReadingStats && (
                      <>

                        {/* ================================================= */}
                        {/* TAROT STATISTICS */}
                        {/* ================================================= */}

                        <div
                          className="feature-card"
                          style={{ marginBottom: "24px" }}
                        >

                          <h3>🃏 Tarot Statistics</h3>

                          <p>
                            Understand how Tarot readings are being used
                            across the platform.
                          </p>

                        </div>


                        {/* TAROT OVERVIEW */}
                        <div className="feature-grid">

                          {/* AVERAGE CARDS */}
                          <div className="feature-card">

                            <div className="feature-icon">
                              🃏
                            </div>

                            <h3>Average Cards per Reading</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {
                                adminReadingStats
                                  .tarot_statistics
                                  ?.average_cards_per_reading ?? 0
                              }
                            </p>

                            <p>
                              Average number of cards used
                            </p>

                          </div>


                          {/* MOST USED SPREAD */}
                          <div className="feature-card">

                            <div className="feature-icon">
                              🔮
                            </div>

                            <h3>Most Used Spread</h3>

                            <p
                              style={{
                                fontSize: "26px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {
                                adminReadingStats
                                  .tarot_statistics
                                  ?.spread_usage?.[0]
                                  ?.spread_name || "No data"
                              }
                            </p>

                            <p>
                              Most frequently selected Tarot spread
                            </p>

                          </div>

                        </div>


                        {/* TAROT SPREAD USAGE */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>🔮 Tarot Spread Usage</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={tarotSpreadChartData}
                              options={tarotSpreadChartOptions}
                            />
                          </div>
                        </div>

                        {/* CARD COUNT DISTRIBUTION */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>📊 Card Count Distribution</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={cardCountChartData}
                              options={cardCountChartOptions}
                            />
                          </div>
                        </div>

                        {/* ================================================= */}
                        {/* PALM STATISTICS */}
                        {/* ================================================= */}

                        <div
                          className="feature-card"
                          style={{
                            marginTop: "32px",
                            marginBottom: "24px"
                          }}
                        >

                          <h3>🖐️ Palm Analysis Statistics</h3>

                          <p>
                            Review common palm patterns detected during
                            Palm analysis.
                          </p>

                        </div>


                        {/* PALM OVERVIEW */}
                        <div className="feature-grid">

                          {/* PALM SHAPES */}
                          <div className="feature-card">

                            <div className="feature-icon">
                              ✋
                            </div>

                            <h3>Palm Shapes</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {
                                adminReadingStats
                                  .palm_statistics
                                  ?.palm_shape_usage
                                  ?.length ?? 0
                              }
                            </p>

                            <p>
                              Palm shape patterns detected
                            </p>

                          </div>


                          {/* FINGER STRUCTURES */}
                          <div className="feature-card">

                            <div className="feature-icon">
                              🖐️
                            </div>

                            <h3>Finger Structures</h3>

                            <p
                              style={{
                                fontSize: "32px",
                                fontWeight: "700",
                                marginTop: "10px"
                              }}
                            >
                              {
                                adminReadingStats
                                  .palm_statistics
                                  ?.finger_structure_usage
                                  ?.length ?? 0
                              }
                            </p>

                            <p>
                              Finger patterns detected
                            </p>

                          </div>

                        </div>

                        {/* PALM SHAPE USAGE */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>✋ Palm Shape Usage</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={palmShapeChartData}
                              options={palmShapeChartOptions}
                            />
                          </div>
                        </div>

                        {/* FINGER STRUCTURE USAGE */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>🖐️ Finger Structure Usage</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={fingerStructureChartData}
                              options={fingerStructureChartOptions}
                            />
                          </div>
                        </div>

                        {/* PALM LINE USAGE */}
                        <div
                          className="feature-card"
                          style={{ marginTop: "24px" }}
                        >
                          <h3>〰️ Palm Line Usage</h3>

                          <div
                            style={{
                              height: "320px",
                              marginTop: "20px",
                            }}
                          >
                            <Bar
                              data={palmLineChartData}
                              options={palmLineChartOptions}
                            />
                          </div>
                        </div>


                        {/* READING ACTIVITY */}
                        <div
                          className="insight-card"
                          style={{
                            marginTop: "32px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "10px",
                            }}
                          >
                            <div>
                              <h3 style={{ marginBottom: "6px" }}>
                                📈 Reading Activity
                              </h3>

                              <p style={{ margin: 0 }}>
                                Tarot reading activity over time.
                              </p>
                            </div>

                            <div
                              style={{
                                padding: "8px 14px",
                                borderRadius: "8px",
                                background: "#f3f4f6",
                                fontSize: "13px",
                                fontWeight: "600",
                              }}
                            >
                              Activity Trend
                            </div>
                          </div>

                          <div
                            style={{
                              height: "360px",
                              marginTop: "20px",
                            }}
                          >
                            <Line
                              data={readingActivityChartData}
                              options={readingActivityChartOptions}
                            />
                          </div>
                        </div>
                      </>
                    )}

                </div>
              )}

              {activePage === "admin-system-reports" && (
                <div className="admin-page">

                  {/* SYSTEM REPORTS HEADER */}
                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        📄
                      </div>

                      <div>
                        <span className="system-reports-label">
                          ADMINISTRATOR
                        </span>

                        <h2>
                          System Reports
                        </h2>

                        <p>
                          Platform reports, reading records and activity overview.
                        </p>
                      </div>

                    </div>

                    {/* EXPORT EXCEL BUTTON */}
                    <button
                      className="report-view-button"
                      style={{
                        marginLeft: "auto",
                        whiteSpace: "nowrap"
                      }}
                      onClick={async () => {

                        try {

                          const token =
                            localStorage.getItem("access_token");

                          if (!token) {
                            throw new Error("Not authenticated.");
                          }

                          const response = await fetch(
                            `${API_URL}/admin/system-reports/export-excel`,
                            {
                              method: "GET",
                              headers: {
                                Authorization: `Bearer ${token}`,
                              },
                            }
                          );

                          if (!response.ok) {

                            let message =
                              "Unable to export system reports.";

                            try {

                              const data =
                                await response.json();

                              message =
                                data.detail || message;

                            } catch {
                              // Response was not JSON
                            }

                            throw new Error(message);
                          }

                          const blob =
                            await response.blob();

                          const url =
                            window.URL.createObjectURL(blob);

                          const link =
                            document.createElement("a");

                          link.href = url;
                          link.download = "system_reports.xlsx";

                          document.body.appendChild(link);

                          link.click();

                          link.remove();

                          window.URL.revokeObjectURL(url);

                        } catch (error) {

                          console.error(
                            "Excel export error:",
                            error
                          );

                          alert(
                            error.message ||
                            "Unable to export system reports."
                          );

                        }

                      }}
                    >
                      📊 Export Excel
                    </button>

                  </div>


                  {/* LOADING */}
                  {adminSystemReportsLoading && (
                    <div className="loading-message">
                      Loading system reports...
                    </div>
                  )}


                  {/* ERROR */}
                  {adminSystemReportsError && (
                    <div className="error-message">
                      {adminSystemReportsError}
                    </div>
                  )}


                  {/* CONTENT */}
                  {!adminSystemReportsLoading &&
                    !adminSystemReportsError &&
                    adminSystemReports && (

                    <>
                      {/* SUMMARY CARDS */}
                      <div className="system-summary-grid">

                        {/* TOTAL USERS */}
                        <div className="system-summary-card">
                          <div className="system-summary-icon">
                            👥
                          </div>

                          <div className="system-summary-content">
                            <span>Total Users</span>
                            <strong>
                              {adminSystemReports.summary.total_users}
                            </strong>
                            <small>Registered users</small>
                          </div>
                        </div>


                        {/* PALM REPORTS */}
                        <div className="system-summary-card">
                          <div className="system-summary-icon">
                            🖐
                          </div>

                          <div className="system-summary-content">
                            <span>Palm Reports</span>
                            <strong>
                              {adminSystemReports.summary.total_palm_reports}
                            </strong>
                            <small>Palm analyses</small>
                          </div>
                        </div>


                        {/* TAROT REPORTS */}
                        <div className="system-summary-card">
                          <div className="system-summary-icon">
                            🃏
                          </div>

                          <div className="system-summary-content">
                            <span>Tarot Reports</span>
                            <strong>
                              {adminSystemReports.summary.total_tarot_reports}
                            </strong>
                            <small>Tarot readings</small>
                          </div>
                        </div>


                        {/* TOTAL REPORTS */}
                        <div className="system-summary-card">
                          <div className="system-summary-icon">
                            📄
                          </div>

                          <div className="system-summary-content">
                            <span>Total Reports</span>
                            <strong>
                              {adminSystemReports.summary.total_reports}
                            </strong>
                            <small>Palm + Tarot</small>
                          </div>
                        </div>

                      </div>

                      {/* PALMISTRY REPORTS */}
                      <div className="system-reports-section">

                        <div className="system-section-heading">
                          <div>
                            <h3>🖐 Palmistry Reports</h3>

                            <p>
                              View saved  results and detected features.
                            </p>
                          </div>
                        </div>


                        <div className="system-activity-card">

                          <div className="system-activity-table-wrapper">

                            <table className="system-activity-table">

                              <thead>
                                <tr>
                                  <th>Analysis ID</th>
                                  <th>User ID</th>
                                  <th>Palm Shape</th>
                                  <th>Finger Structure</th>
                                  <th>Date</th>
                                  <th>Action</th>
                                </tr>
                              </thead>


                              <tbody>

                                {adminSystemReports?.palm_reports?.length > 0 ? (

                                  adminSystemReports.palm_reports.map((report) => (

                                    <tr key={report.analysis_id}>

                                      {/* Analysis ID */}
                                      <td>
                                        #{report.analysis_id}
                                      </td>


                                      {/* User ID */}
                                      <td>
                                        {report.user_id ?? "Unknown"}
                                      </td>


                                      {/* Palm Shape */}
                                      <td>
                                        <span className="report-value-badge">
                                          {report.palm_shape || "Not available"}
                                        </span>
                                      </td>


                                      {/* Finger Structure */}
                                      <td>
                                        <span className="report-value-badge">
                                          {report.finger_structure || "Not available"}
                                        </span>
                                      </td>


                                      {/* Date */}
                                      <td>
                                        {report.created_at
                                          ? new Date(
                                              report.created_at
                                            ).toLocaleDateString(
                                              "en-IN",
                                              {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                              }
                                            )
                                          : "Unknown"}
                                      </td>


                                      {/* Action */}
                                      <td>

                                        <button
                                          className="report-view-button"
                                          onClick={async () => {

                                            try {

                                              const token =
                                                localStorage.getItem(
                                                  "access_token"
                                                );

                                              if (!token) {
                                                throw new Error(
                                                  "Not authenticated."
                                                );
                                              }


                                              const response =
                                                await fetch(
                                                  `${API_URL}/admin/palm-report/${report.analysis_id}`,
                                                  {
                                                    method: "GET",

                                                    headers: {
                                                      Authorization:
                                                        `Bearer ${token}`,
                                                    },
                                                  }
                                                );


                                              if (!response.ok) {

                                                let message =
                                                  "Unable to generate Palm report.";

                                                try {

                                                  const data =
                                                    await response.json();

                                                  message =
                                                    data.detail ||
                                                    message;

                                                } catch {
                                                  // Response was not JSON
                                                }

                                                throw new Error(message);
                                              }


                                              const blob =
                                                await response.blob();


                                              const url =
                                                window.URL.createObjectURL(
                                                  blob
                                                );


                                              window.open(
                                                url,
                                                "_blank"
                                              );


                                              setTimeout(() => {

                                                window.URL.revokeObjectURL(
                                                  url
                                                );

                                              }, 10000);


                                            } catch (error) {

                                              console.error(
                                                "Admin Palm report error:",
                                                error
                                              );


                                              alert(
                                                error.message ||
                                                "Unable to open Palm report."
                                              );

                                            }

                                          }}
                                        >
                                          View Report
                                        </button>

                                      </td>

                                    </tr>

                                  ))

                                ) : (

                                  <tr>

                                    <td
                                      colSpan="6"
                                      className="empty-state"
                                    >
                                      No Palmistry reports found.
                                    </td>

                                  </tr>

                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                      </div>

                      {/* TAROT REPORTS */}
                      <div className="system-reports-section">

                        <div className="system-section-heading">
                          <div>
                            <h3>🃏 Tarot Reports</h3>

                            <p>
                              View saved tarot reading reports and reading details.
                            </p>
                          </div>
                        </div>


                        <div className="system-activity-card">

                          <div className="system-activity-table-wrapper">

                            <table className="system-activity-table">

                              <thead>
                                <tr>
                                  <th>Reading ID</th>
                                  <th>User ID</th>
                                  <th>Spread</th>
                                  <th>Type</th>
                                  <th>Cards</th>
                                  <th>Date</th>
                                  <th>Action</th>
                                </tr>
                              </thead>


                              <tbody>

                                {adminSystemReports?.tarot_reports?.length > 0 ? (

                                  adminSystemReports.tarot_reports.map((report) => (

                                    <tr key={report.reading_id}>

                                      {/* Reading ID */}
                                      <td>
                                        #{report.reading_id}
                                      </td>


                                      {/* User ID */}
                                      <td>
                                        {report.user_id ?? "Unknown"}
                                      </td>


                                      {/* Spread Name */}
                                      <td>
                                        <span className="report-value-badge">
                                          {report.spread_name || "Not available"}
                                        </span>
                                      </td>


                                      {/* Spread Type */}
                                      <td>
                                        {report.spread_type || "Not available"}
                                      </td>


                                      {/* Card Count */}
                                      <td>
                                        {report.card_count ?? "Unknown"}
                                      </td>


                                      {/* Date */}
                                      <td>
                                        {report.created_at
                                          ? new Date(
                                              report.created_at
                                            ).toLocaleDateString(
                                              "en-IN",
                                              {
                                                day: "2-digit",
                                                month: "short",
                                                year: "numeric"
                                              }
                                            )
                                          : "Unknown"}
                                      </td>


                                      {/* Action */}
                                      <td>

                                        <button
                                          className="report-view-button"
                                          onClick={async () => {

                                            try {

                                              const token =
                                                localStorage.getItem(
                                                  "access_token"
                                                );

                                              if (!token) {
                                                throw new Error(
                                                  "Not authenticated."
                                                );
                                              }


                                              const response =
                                                await fetch(
                                                  `${API_URL}/tarot/report/${report.reading_id}`,
                                                  {
                                                    method: "GET",

                                                    headers: {
                                                      Authorization:
                                                        `Bearer ${token}`,
                                                    },
                                                  }
                                                );


                                              if (!response.ok) {

                                                let message =
                                                  "Unable to generate Tarot report.";

                                                try {

                                                  const data =
                                                    await response.json();

                                                  message =
                                                    data.detail ||
                                                    message;

                                                } catch {
                                                  // Response was not JSON
                                                }

                                                throw new Error(message);
                                              }


                                              const blob =
                                                await response.blob();


                                              const url =
                                                window.URL.createObjectURL(
                                                  blob
                                                );


                                              window.open(
                                                url,
                                                "_blank"
                                              );


                                              setTimeout(() => {

                                                window.URL.revokeObjectURL(
                                                  url
                                                );

                                              }, 10000);


                                            } catch (error) {

                                              console.error(
                                                "Admin Tarot report error:",
                                                error
                                              );


                                              alert(
                                                error.message ||
                                                "Unable to open Tarot report."
                                              );

                                            }

                                          }}
                                        >
                                          View Report
                                        </button>

                                      </td>

                                    </tr>

                                  ))

                                ) : (

                                  <tr>

                                    <td
                                      colSpan="7"
                                      className="empty-state"
                                    >
                                      No Tarot reports found.
                                    </td>

                                  </tr>

                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                      </div>

                      {/* PLATFORM ACTIVITY */}
                      <div className="system-reports-section">

                        <div className="system-section-heading">
                          <div>
                            <h3>📊 Platform Activity</h3>

                            <p>
                              Palm and Tarot activity by date.
                            </p>
                          </div>
                        </div>


                        <div className="system-activity-card">

                          <div className="system-activity-table-wrapper">

                            <table className="system-activity-table">

                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Total Activity</th>
                                </tr>
                              </thead>


                              <tbody>

                                {adminSystemReports?.platform_activity?.length > 0 ? (

                                  adminSystemReports.platform_activity.map(
                                    (activity) => (

                                      <tr key={activity.date}>

                                        <td>
                                          {new Date(
                                            `${activity.date}T00:00:00`
                                          ).toLocaleDateString(
                                            "en-IN",
                                            {
                                              day: "2-digit",
                                              month: "short",
                                              year: "numeric"
                                            }
                                          )}
                                        </td>

                                        <td>
                                          <span className="report-value-badge">
                                            {activity.count}
                                          </span>
                                        </td>

                                      </tr>

                                    )
                                  )

                                ) : (

                                  <tr>

                                    <td
                                      colSpan="2"
                                      className="empty-state"
                                    >
                                      No platform activity found.
                                    </td>

                                  </tr>

                                )}

                              </tbody>

                            </table>

                          </div>

                        </div>

                      </div>
                    </>
                  )}

                </div>
              )}

              {activePage === "admin-announcements" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">
                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        📢
                      </div>

                      <div>
                        <span className="system-reports-label">
                          ADMINISTRATOR
                        </span>

                        <h2>
                          Platform Announcements
                        </h2>

                        <p>
                          Send important announcements and system updates to users.
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="feature-card">

                    <h3>
                      📢 Create Announcement
                    </h3>

                    <p>
                      Send an important message to all users of the platform.
                    </p>

                    <div style={{ marginTop: "20px" }}>

                      <label>
                        <strong>Announcement Title</strong>
                      </label>

                      <input
                        type="text"
                        placeholder="Example: System Maintenance"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginTop: "8px",
                          marginBottom: "18px",
                          borderRadius: "8px",
                          border: "1px solid #ddd"
                        }}
                      />

                      <label>
                        <strong>Announcement Message</strong>
                      </label>

                      <textarea
                        placeholder="Enter the announcement message..."
                        value={announcementMessage}
                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                        rows="5"
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginTop: "8px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                          resize: "vertical"
                        }}
                      />

                      <button
                        className="feature-button"
                        style={{ marginTop: "18px" }}
                        onClick={sendAnnouncement}
                      >
                        📢 Send Announcement
                      </button>

                    </div>

                  </div>

                </div>
              )}
              
              {activePage === "consultant-user-trends" && (
                <div className="dashboard-content">

                  {/* USER TREND ANALYSIS HEADER */}
                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        📈
                      </div>

                      <div>
                        <span className="system-reports-label">
                          SPIRITUAL CONSULTANT
                        </span>

                        <h2>
                          User Trend Analysis
                        </h2>

                        <p>
                          Review reading patterns, recurring themes, growth trends and user activity.
                        </p>
                      </div>

                    </div>

                </div>

                  {consultantUserTrendsLoading && (
                    <div className="insight-card">
                      <p>Loading user trend data...</p>
                    </div>
                  )}

                  {consultantUserTrendsError && (
                    <div className="insight-card">
                      <h3>⚠️ Unable to Load Data</h3>
                      <p>{consultantUserTrendsError}</p>
                    </div>
                  )}

                  {consultantUserTrends && !consultantUserTrendsLoading && (
                    <div className="feature-grid">

                      {/* 1. READING PATTERNS */}

                      <div className="feature-card">
                        <div className="feature-icon">🔮</div>

                        <h3>Reading Patterns</h3>

                        <p>
                          Most used reading types across the platform.
                        </p>

                        <div
                          style={{
                            height: "280px",
                            marginTop: "20px"
                          }}
                        >
                          {consultantUserTrends.reading_patterns?.length > 0 ? (

                            <Bar
                              data={{
                                labels: consultantUserTrends.reading_patterns.map(
                                  (item) => item.name
                                ),

                                datasets: [
                                  {
                                    label: "Number of Readings",

                                    data: consultantUserTrends.reading_patterns.map(
                                      (item) => item.count
                                    ),

                                    backgroundColor: "#6c4ce5",
                                    borderRadius: 8,
                                    barThickness: 50
                                  }
                                ]
                              }}

                              options={{
                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                  legend: {
                                    display: false
                                  },

                                  title: {
                                    display: true,
                                    text: "Reading Pattern Usage",
                                    font: {
                                      size: 16,
                                      weight: "600"
                                    },
                                    padding: {
                                      bottom: 20
                                    }
                                  },

                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return ` ${context.raw} readings`;
                                      }
                                    }
                                  }
                                },

                                scales: {
                                  x: {
                                    grid: {
                                      display: false
                                    },

                                    ticks: {
                                      font: {
                                        size: 12,
                                        weight: "600"
                                      }
                                    }
                                  },

                                  y: {
                                    beginAtZero: true,

                                    ticks: {
                                      precision: 0,
                                      stepSize: 5
                                    },

                                    title: {
                                      display: true,
                                      text: "Number of Readings",
                                      font: {
                                        size: 12,
                                        weight: "600"
                                      }
                                    },

                                    grid: {
                                      color: "rgba(0, 0, 0, 0.08)"
                                    }
                                  }
                                }
                              }}
                            />

                          ) : (

                            <p>No reading pattern data available.</p>

                          )}
                        </div>
                      </div>


                      {/* 2. RECURRING THEMES */}

                      <div className="feature-card">
                        <div className="feature-icon">📊</div>

                        <h3>Recurring Themes</h3>

                        <p>
                          Common themes appearing across user readings.
                        </p>

                        <div
                          style={{
                            height: "280px",
                            marginTop: "20px"
                          }}
                        >
                          {consultantUserTrends.recurring_themes?.length > 0 ? (

                            <Bar
                              data={{
                                labels: consultantUserTrends.recurring_themes.map(
                                  (item) => item.theme
                                ),

                                datasets: [
                                  {
                                    label: "Theme Frequency",

                                    data: consultantUserTrends.recurring_themes.map(
                                      (item) => item.count
                                    ),

                                    backgroundColor: "#e67e22",
                                    borderRadius: 8,
                                    barThickness: 28
                                  }
                                ]
                              }}

                              options={{
                                indexAxis: "y",

                                responsive: true,
                                maintainAspectRatio: false,

                                plugins: {
                                  legend: {
                                    display: false
                                  },

                                  title: {
                                    display: true,
                                    text: "Recurring Theme Frequency",
                                    font: {
                                      size: 16,
                                      weight: "600"
                                    },
                                    padding: {
                                      bottom: 20
                                    }
                                  },

                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return ` ${context.raw} occurrences`;
                                      }
                                    }
                                  }
                                },

                                scales: {
                                  x: {
                                    beginAtZero: true,

                                    ticks: {
                                      precision: 0,
                                      stepSize: 5
                                    },

                                    title: {
                                      display: true,
                                      text: "Number of Occurrences",
                                      font: {
                                        size: 12,
                                        weight: "600"
                                      }
                                    },

                                    grid: {
                                      color: "rgba(0, 0, 0, 0.08)"
                                    }
                                  },

                                  y: {
                                    grid: {
                                      display: false
                                    },

                                    ticks: {
                                      font: {
                                        size: 12,
                                        weight: "600"
                                      }
                                    }
                                  }
                                }
                              }}
                            />

                          ) : (

                            <p>No recurring theme data available.</p>

                          )}
                        </div>
                      </div>


                      {/* 3. GROWTH TRENDS */}

                      <div className="feature-card">
                        <div className="feature-icon">🌱</div>

                        <h3>Growth Trends</h3>

                        <p>
                          Reading activity comparison between the current
                          and previous 30-day periods.
                        </p>

                        <div
                          style={{
                            height: "260px",
                            marginTop: "20px"
                          }}
                        >
                          <Bar
                            data={{
                              labels: [
                                "Current 30 Days",
                                "Previous 30 Days"
                              ],

                              datasets: [
                                {
                                  label: "Reading Activity",

                                  data: [
                                    consultantUserTrends.growth_trends?.current_30_days ?? 0,
                                    consultantUserTrends.growth_trends?.previous_30_days ?? 0
                                  ],

                                  backgroundColor: [
                                    "#6c4ce5",
                                    "#e67e22"
                                  ],

                                  borderRadius: 8,
                                  barThickness: 55
                                }
                              ]
                            }}

                            options={{
                              responsive: true,
                              maintainAspectRatio: false,

                              plugins: {
                                legend: {
                                  display: false
                                },

                                title: {
                                  display: true,
                                  text: "30-Day Reading Activity Comparison",
                                  font: {
                                    size: 16,
                                    weight: "600"
                                  },
                                  padding: {
                                    bottom: 20
                                  }
                                },

                                tooltip: {
                                  callbacks: {
                                    label: function (context) {
                                      return ` ${context.raw} readings`;
                                    }
                                  }
                                }
                              },

                              scales: {
                                x: {
                                  grid: {
                                    display: false
                                  },

                                  ticks: {
                                    font: {
                                      size: 12,
                                      weight: "600"
                                    }
                                  }
                                },

                                y: {
                                  beginAtZero: true,

                                  ticks: {
                                    precision: 0,
                                    stepSize: 5
                                  },

                                  title: {
                                    display: true,
                                    text: "Number of Readings",
                                    font: {
                                      size: 12,
                                      weight: "600"
                                    }
                                  },

                                  grid: {
                                    color: "rgba(0, 0, 0, 0.08)"
                                  }
                                }
                              }
                            }}
                          />
                        </div>

                        <div
                          style={{
                            marginTop: "15px",
                            textAlign: "center"
                          }}
                        >
                          <span style={{ fontWeight: "600" }}>
                            Change:{" "}
                          </span>

                          <strong>
                            {consultantUserTrends.growth_trends?.previous_30_days === 0
                              ? "N/A"
                              : `${consultantUserTrends.growth_trends?.growth_percentage ?? 0}%`}
                          </strong>
                        </div>

                      </div>


                      {/* 4. USER ACTIVITY */}

                      <div className="feature-card">
                        <div className="feature-icon">👥</div>

                        <h3>User Activity</h3>

                        <p>
                          Overview of users and their reading activity.
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "14px",
                            marginTop: "20px"
                          }}
                        >

                          {/* TOTAL USERS */}
                          <div
                            style={{
                              padding: "18px",
                              borderRadius: "12px",
                              background: "rgba(108, 76, 229, 0.08)",
                              textAlign: "center"
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                              }}
                            >
                              Total Users
                            </span>

                            <strong
                              style={{
                                display: "block",
                                fontSize: "28px"
                              }}
                            >
                              {consultantUserTrends.user_activity?.total_users ?? 0}
                            </strong>
                          </div>


                          {/* REPEAT USERS */}
                          <div
                            style={{
                              padding: "18px",
                              borderRadius: "12px",
                              background: "rgba(230, 126, 34, 0.08)",
                              textAlign: "center"
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                              }}
                            >
                              Repeat Users
                            </span>

                            <strong
                              style={{
                                display: "block",
                                fontSize: "28px"
                              }}
                            >
                              {consultantUserTrends.user_activity?.repeat_users ?? 0}
                            </strong>
                          </div>


                          {/* TOTAL READINGS */}
                          <div
                            style={{
                              padding: "18px",
                              borderRadius: "12px",
                              background: "rgba(108, 76, 229, 0.08)",
                              textAlign: "center"
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                              }}
                            >
                              Total Readings
                            </span>

                            <strong
                              style={{
                                display: "block",
                                fontSize: "28px"
                              }}
                            >
                              {consultantUserTrends.user_activity?.total_readings ?? 0}
                            </strong>
                          </div>


                          {/* AVERAGE READINGS */}
                          <div
                            style={{
                              padding: "18px",
                              borderRadius: "12px",
                              background: "rgba(230, 126, 34, 0.08)",
                              textAlign: "center"
                            }}
                          >
                            <span
                              style={{
                                display: "block",
                                fontSize: "13px",
                                fontWeight: "600",
                                marginBottom: "8px"
                              }}
                            >
                              Avg. Readings/User
                            </span>

                            <strong
                              style={{
                                display: "block",
                                fontSize: "28px"
                              }}
                            >
                              {consultantUserTrends.user_activity?.average_readings_per_user ?? 0}
                            </strong>
                          </div>

                        </div>

                      </div>

                    </div>
                  )}



                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("dashboard")}
                  >
                    ← Back to Dashboard
                  </button>

                </div>
              )}

              {activePage === "guidance-effectiveness" && (
                <div className="dashboard-content">

                  {/* GUIDANCE EFFECTIVENESS HEADER */}
                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        🎯
                      </div>

                      <div>
                        <span className="system-reports-label">
                          SPIRITUAL CONSULTANT
                        </span>

                        <h2>
                          Guidance Effectiveness
                        </h2>

                        <p>
                          Review guidance relevance, recommendation signals, personal growth insights and overall insight score.
                        </p>
                      </div>

                    </div>

                  </div>

                  {guidanceEffectivenessLoading && (
                    <div className="insight-card">
                      <p>Loading guidance effectiveness...</p>
                    </div>
                  )}

                  {guidanceEffectivenessError && (
                    <div className="insight-card">
                      <h3>⚠️ Unable to Load Data</h3>
                      <p>{guidanceEffectivenessError}</p>
                    </div>
                  )}

                  {guidanceEffectiveness &&
                    !guidanceEffectivenessLoading && (
                      <div className="feature-grid">

                        {/* 1. GUIDANCE RELEVANCE */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            🎯
                          </div>

                          <h3>
                            Guidance Relevance
                          </h3>

                          <p>
                            Percentage of readings containing
                            guidance-related signals.
                          </p>

                          <div
                            style={{
                              marginTop: "20px"
                            }}
                          >

                            {/* SCORE */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "6px",
                                marginBottom: "12px"
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "34px"
                                }}
                              >
                                {guidanceEffectiveness.guidance_relevance?.score ?? 0}%
                              </strong>

                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: 0.7
                                }}
                              >
                                relevance score
                              </span>
                            </div>


                            {/* PROGRESS BAR */}
                            <div
                              style={{
                                width: "100%",
                                height: "12px",
                                background: "rgba(108, 76, 229, 0.12)",
                                borderRadius: "20px",
                                overflow: "hidden"
                              }}
                            >
                              <div
                                style={{
                                  width: `${guidanceEffectiveness.guidance_relevance?.score ?? 0}%`,
                                  height: "100%",
                                  background: "#6c4ce5",
                                  borderRadius: "20px",
                                  transition: "width 0.5s ease"
                                }}
                              />
                            </div>


                            {/* READING COUNT */}
                            <p
                              style={{
                                marginTop: "12px"
                              }}
                            >
                              <strong>
                                {guidanceEffectiveness.guidance_relevance?.readings_with_guidance ?? 0}
                              </strong>{" "}
                              of{" "}
                              <strong>
                                {guidanceEffectiveness.guidance_relevance?.total_readings ?? 0}
                              </strong>{" "}
                              readings contain guidance-related signals.
                            </p>

                          </div>

                        </div>


                        {/* 2. RECOMMENDATION USAGE */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            💡
                          </div>

                          <h3>
                            Recommendation Usage
                          </h3>

                          <p>
                            Readings containing recommendation
                            or action-oriented signals.
                          </p>

                          <div
                            style={{
                              marginTop: "20px"
                            }}
                          >

                            {/* SCORE */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "6px",
                                marginBottom: "12px"
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "34px"
                                }}
                              >
                                {guidanceEffectiveness.recommendation_usage?.percentage ?? 0}%
                              </strong>

                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: 0.7
                                }}
                              >
                                usage score
                              </span>
                            </div>


                            {/* PROGRESS BAR */}
                            <div
                              style={{
                                width: "100%",
                                height: "12px",
                                background: "rgba(230, 126, 34, 0.12)",
                                borderRadius: "20px",
                                overflow: "hidden"
                              }}
                            >
                              <div
                                style={{
                                  width: `${guidanceEffectiveness.recommendation_usage?.percentage ?? 0}%`,
                                  height: "100%",
                                  background: "#e67e22",
                                  borderRadius: "20px",
                                  transition: "width 0.5s ease"
                                }}
                              />
                            </div>


                            {/* READING COUNT */}
                            <p
                              style={{
                                marginTop: "12px"
                              }}
                            >
                              <strong>
                                {guidanceEffectiveness.recommendation_usage?.readings_with_recommendation_signals ?? 0}
                              </strong>{" "}
                              of{" "}
                              <strong>
                                {guidanceEffectiveness.recommendation_usage?.total_readings ?? 0}
                              </strong>{" "}
                              readings contain recommendation or action-oriented signals.
                            </p>

                          </div>
                        </div>


                        {/* 3. PERSONAL GROWTH INSIGHTS */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            🌱
                          </div>

                          <h3>
                            Personal Growth Insights
                          </h3>

                          <p>
                            Readings containing personal-growth
                            and self-development signals.
                          </p>

                          <div
                            style={{
                              marginTop: "20px"
                            }}
                          >

                            {/* SCORE */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "6px",
                                marginBottom: "12px"
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "34px"
                                }}
                              >
                                {guidanceEffectiveness.personal_growth_insights?.percentage ?? 0}%
                              </strong>

                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: 0.7
                                }}
                              >
                                growth insight score
                              </span>
                            </div>


                            {/* PROGRESS BAR */}
                            <div
                              style={{
                                width: "100%",
                                height: "12px",
                                background: "rgba(108, 76, 229, 0.12)",
                                borderRadius: "20px",
                                overflow: "hidden"
                              }}
                            >
                              <div
                                style={{
                                  width: `${guidanceEffectiveness.personal_growth_insights?.percentage ?? 0}%`,
                                  height: "100%",
                                  background: "#6c4ce5",
                                  borderRadius: "20px",
                                  transition: "width 0.5s ease"
                                }}
                              />
                            </div>


                            {/* READING COUNT */}
                            <p
                              style={{
                                marginTop: "12px"
                              }}
                            >
                              <strong>
                                {guidanceEffectiveness.personal_growth_insights?.readings_with_growth_signals ?? 0}
                              </strong>{" "}
                              of{" "}
                              <strong>
                                {guidanceEffectiveness.personal_growth_insights?.total_readings ?? 0}
                              </strong>{" "}
                              readings contain personal-growth and self-development signals.
                            </p>

                          </div>
                        </div>


                        {/* 4. OVERALL INSIGHT SCORE */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            ⭐
                          </div>

                          <h3>
                            Overall Insight Score
                          </h3>

                          <p>
                            Prototype score calculated from the
                            available guidance signals.
                          </p>

                          <div
                            style={{
                              marginTop: "20px"
                            }}
                          >

                            {/* SCORE */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "baseline",
                                gap: "6px",
                                marginBottom: "12px"
                              }}
                            >
                              <strong
                                style={{
                                  fontSize: "34px"
                                }}
                              >
                                {guidanceEffectiveness.overall_insight_score?.score ?? 0}
                              </strong>

                              <span
                                style={{
                                  fontSize: "13px",
                                  fontWeight: "600",
                                  opacity: 0.7
                                }}
                              >
                                overall insight score
                              </span>
                            </div>


                            {/* PROGRESS BAR */}
                            <div
                              style={{
                                width: "100%",
                                height: "12px",
                                background: "rgba(230, 126, 34, 0.12)",
                                borderRadius: "20px",
                                overflow: "hidden"
                              }}
                            >
                              <div
                                style={{
                                  width: `${guidanceEffectiveness.overall_insight_score?.score ?? 0}%`,
                                  height: "100%",
                                  background: "#e67e22",
                                  borderRadius: "20px",
                                  transition: "width 0.5s ease"
                                }}
                              />
                            </div>


                            {/* STATUS */}
                            <p
                              style={{
                                marginTop: "12px"
                              }}
                            >
                              Status:{" "}
                              <strong>
                                {guidanceEffectiveness.overall_insight_score?.label ?? "No Data"}
                              </strong>
                            </p>

                          </div>

                        </div>

                      </div>
                    )}

                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("dashboard")}
                  >
                    ← Back to Dashboard
                  </button>

                </div>
              )}

              {activePage === "consultation-insights" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">

                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        💡
                      </div>

                      <div>
                        <span className="system-reports-label">
                          SPIRITUAL CONSULTANT
                        </span>

                        <h2>
                          Consultation Insights
                        </h2>

                        <p>
                          Review consultation patterns, user guidance needs and consultation insights.
                        </p>
                      </div>

                    </div>

                  </div>

                  {consultationInsightsLoading && (
                    <div className="insight-card">
                      <p>Loading consultation insights...</p>
                    </div>
                  )}

                  {consultationInsightsError && (
                    <div className="insight-card">
                      <h3>⚠️ Unable to Load Data</h3>

                      <p>
                        {consultationInsightsError}
                      </p>
                    </div>
                  )}

                  {consultationInsights &&
                    !consultationInsightsLoading && (

                      <div className="feature-grid">

                        {/* 1. CONSULTATION SUMMARY */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            📝
                          </div>

                          <h3>
                            Consultation Summary
                          </h3>

                          <p>
                            Overview of consultations conducted
                            across the platform.
                          </p>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "repeat(3, 1fr)",
                              gap: "12px",
                              marginTop: "20px",
                            }}
                          >
                            {/* Total Consultations */}
                            <div
                              style={{
                                padding: "16px",
                                borderRadius: "12px",
                                background: "#f5f2ff",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "28px",
                                  fontWeight: "bold",
                                  color: "#6c4ce5",
                                }}
                              >
                                {consultationInsights
                                  .consultation_summary
                                  ?.total_consultations ?? 0}
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  marginTop: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                Total Consultations
                              </div>
                            </div>

                            {/* Users Served */}
                            <div
                              style={{
                                padding: "16px",
                                borderRadius: "12px",
                                background: "#fff4e8",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "28px",
                                  fontWeight: "bold",
                                  color: "#e67e22",
                                }}
                              >
                                {consultationInsights
                                  .consultation_summary
                                  ?.users_served ?? 0}
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  marginTop: "6px",
                                  fontWeight: "600",
                                }}
                              >
                                Users Served
                              </div>
                            </div>

                            {/* Most Common Reading */}
                            <div
                              style={{
                                padding: "16px",
                                borderRadius: "12px",
                                background: "#f5f2ff",
                                textAlign: "center",
                              }}
                            >
                              <div
                                style={{
                                  fontSize: "18px",
                                  fontWeight: "bold",
                                  color: "#6c4ce5",
                                  marginTop: "5px",
                                }}
                              >
                                {consultationInsights
                                  .consultation_summary
                                  ?.most_common_reading || "No data"}
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  marginTop: "10px",
                                  fontWeight: "600",
                                }}
                              >
                                Most Common Reading
                              </div>
                            </div>
                          </div>

                        </div>


                        {/* 2. COMMON TOPICS */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            📌
                          </div>

                          <h3>
                            Common Topics
                          </h3>

                          <p>
                            Frequently detected topics across
                            consultation readings.
                          </p>

                          <div
                            style={{
                              marginTop: "15px",
                              height: "260px",
                            }}
                          >

                            {
                              consultationInsights
                                .common_topics
                                ?.length > 0 ? (

                                <Bar
                                  data={{
                                    labels: consultationInsights.common_topics.map(
                                      (topic) => topic.topic
                                    ),

                                    datasets: [
                                      {
                                        label: "Consultations",

                                        data: consultationInsights.common_topics.map(
                                          (topic) => topic.count
                                        ),

                                        backgroundColor: "#e67e22",

                                        borderRadius: 8,

                                        barThickness: 28,
                                      },
                                    ],
                                  }}

                                  options={{
                                    indexAxis: "y",

                                    responsive: true,

                                    maintainAspectRatio: false,

                                    plugins: {
                                      legend: {
                                        display: false,
                                      },

                                      title: {
                                        display: true,

                                        text: "Most Common Consultation Topics",

                                        font: {
                                          size: 16,
                                          weight: "600",
                                        },

                                        padding: {
                                          bottom: 20,
                                        },
                                      },

                                      tooltip: {
                                        callbacks: {
                                          label: function (context) {
                                            return ` ${context.raw} consultations`;
                                          },
                                        },
                                      },
                                    },

                                    scales: {
                                      x: {
                                        beginAtZero: true,

                                        ticks: {
                                          precision: 0,
                                          stepSize: 5,
                                        },

                                        title: {
                                          display: true,

                                          text: "Number of Consultations",

                                          font: {
                                            size: 12,
                                            weight: "600",
                                          },
                                        },

                                        grid: {
                                          color: "rgba(0, 0, 0, 0.08)",
                                        },
                                      },

                                      y: {
                                        grid: {
                                          display: false,
                                        },

                                        ticks: {
                                          font: {
                                            size: 12,
                                            weight: "600",
                                          },
                                        },
                                      },
                                    },
                                  }}
                                />

                              ) : (

                                <p>
                                  No topic data available.
                                </p>

                              )
                            }

                          </div>

                        </div>


                        {/* 3. RECENT CONSULTATIONS */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            🕒
                          </div>

                          <h3>
                            Recent Consultations
                          </h3>

                          <p>
                            Most recent consultation readings.
                          </p>

                          <div
                            style={{
                              marginTop: "15px",
                              maxHeight: "330px",
                              overflowY: "auto",
                              paddingRight: "5px",
                            }}
                          >
                            {consultationInsights
                              .recent_consultations
                              ?.length > 0 ? (

                              consultationInsights.recent_consultations.map(
                                (consultation) => (

                                  <div
                                    key={consultation.reading_id}
                                    style={{
                                      marginBottom: "12px",
                                      padding: "14px",
                                      borderRadius: "12px",
                                      background: "#f8f7ff",
                                      borderLeft: "4px solid #6c4ce5",
                                    }}
                                  >

                                    {/* Reading Name */}
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        marginBottom: "6px",
                                      }}
                                    >
                                      <strong
                                        style={{
                                          fontSize: "15px",
                                          color: "#3d3575",
                                        }}
                                      >
                                        {consultation.spread_name}
                                      </strong>

                                      <span
                                        style={{
                                          fontSize: "11px",
                                          color: "#777",
                                        }}
                                      >
                                        {consultation.created_at
                                          ? new Date(
                                              consultation.created_at
                                            ).toLocaleString()
                                          : "Date unavailable"}
                                      </span>
                                    </div>

                                    {/* Consultation Summary */}
                                    <p
                                      style={{
                                        fontSize: "12px",
                                        lineHeight: "1.5",
                                        margin: "0",
                                        color: "#666",
                                      }}
                                    >
                                      {consultation.summary}
                                    </p>

                                  </div>
                                )
                              )

                            ) : (

                              <p>
                                No recent consultations.
                              </p>

                            )}
                          </div>

                        </div>


                        {/* 4. KEY INSIGHTS */}

                        <div className="feature-card">

                          <div className="feature-icon">
                            💡
                          </div>

                          <h3>
                            Key Insights
                          </h3>

                          <p>
                            Important observations from
                            consultation activity.
                          </p>

                          <div
                            style={{
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "12px",
                              marginTop: "20px",
                            }}
                          >
                            {consultationInsights.key_insights?.length > 0 ? (

                              consultationInsights.key_insights.map(
                                (insight, index) => (

                                  <div
                                    key={index}
                                    style={{
                                      padding: "16px",
                                      borderRadius: "12px",
                                      background:
                                        index % 2 === 0
                                          ? "#f5f2ff"
                                          : "#fff4e8",
                                      borderLeft:
                                        index % 2 === 0
                                          ? "4px solid #6c4ce5"
                                          : "4px solid #e67e22",
                                    }}
                                  >

                                    <strong
                                      style={{
                                        fontSize: "14px",
                                        color: "#3d3575",
                                        display: "block",
                                        marginBottom: "8px",
                                      }}
                                    >
                                      {insight.title}
                                    </strong>

                                    <p
                                      style={{
                                        fontSize: "12px",
                                        lineHeight: "1.5",
                                        margin: 0,
                                        color: "#666",
                                      }}
                                    >
                                      {insight.description}
                                    </p>

                                  </div>

                                )
                              )

                            ) : (

                              <p>
                                No key insights available.
                              </p>

                            )}
                          </div>

                        </div>

                      </div>
                    )}

                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("dashboard")}
                  >
                    ← Back to Dashboard
                  </button>

                </div>
              )}

              {activePage === "request-tarot-session" && (
                <div className="dashboard-content">

                  <div className="dashboard-header">
                    <div>
                      <h2>📅 Request Tarot Session</h2>
                      <p>
                        Request a Tarot session from a Tarot Reader.
                      </p>
                    </div>
                  </div>

                  <div className="insight-card">
                    <h3>🔮 Select Tarot Reader</h3>

                    {tarotReadersLoading ? (
                      <p>Loading Tarot Readers...</p>
                    ) : tarotReaders.length === 0 ? (
                      <p>No Tarot Readers available.</p>
                    ) : (
                      <select
                        value={selectedTarotReaderId}
                        onChange={(e) =>
                          setSelectedTarotReaderId(e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "12px",
                          marginTop: "15px",
                          borderRadius: "10px",
                          border: "1px solid #d1d5db",
                          fontSize: "14px",
                        }}
                      >
                        <option value="">
                          Select a Tarot Reader
                        </option>

                        {tarotReaders.map((reader) => (
                          <option
                            key={reader.user_id}
                            value={reader.user_id}
                          >
                            {reader.username} - {reader.email}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div
                    className="insight-card"
                    style={{ marginTop: "20px" }}
                  >
                    <h3>📅 Schedule Session</h3>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "15px",
                        marginTop: "15px",
                      }}
                    >

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                          }}
                        >
                          Session Date
                        </label>

                        <input
                          type="date"
                          value={userTarotSessionDate}
                          onChange={(e) =>
                            setUserTarotSessionDate(e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            fontSize: "14px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "8px",
                            fontWeight: "600",
                          }}
                        >
                          Session Time
                        </label>

                        <input
                          type="time"
                          value={userTarotSessionTime}
                          onChange={(e) =>
                            setUserTarotSessionTime(e.target.value)
                          }
                          style={{
                            width: "100%",
                            padding: "12px",
                            borderRadius: "10px",
                            border: "1px solid #d1d5db",
                            fontSize: "14px",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                    </div>
                  </div>

                  <div
                    className="insight-card"
                    style={{ marginTop: "20px" }}
                  >
                    <h3>🃏 Select Reading Type</h3>

                    <select
                      value={tarotSpread}
                      onChange={(e) =>
                        setTarotSpread(e.target.value)
                      }
                      style={{
                        width: "100%",
                        padding: "12px",
                        marginTop: "15px",
                        borderRadius: "10px",
                        border: "1px solid #d1d5db",
                        fontSize: "14px",
                      }}
                    >
                      <option value="single_card">
                        Single Card
                      </option>

                      <option value="three_card">
                        Three Card
                      </option>

                      <option value="career">
                        Career
                      </option>
                    </select>
                  </div>

                  {userTarotRequestError && (
                    <p
                      style={{
                        color: "#dc2626",
                        marginTop: "15px",
                      }}
                    >
                      {userTarotRequestError}
                    </p>
                  )}

                  <button
                    className="primary-button"
                    style={{ marginTop: "20px" }}
                    onClick={handleRequestTarotSession}
                    disabled={
                      tarotReadersLoading ||
                      userTarotRequestLoading ||
                      !selectedTarotReaderId ||
                      !userTarotSessionDate ||
                      !userTarotSessionTime
                    }
                  >
                    {userTarotRequestLoading
                      ? "🔄 Sending Request..."
                      : "📅 Request Tarot Session"}
                  </button>

                  {requestedTarotSession && (
                    <div
                      className="insight-card"
                      style={{
                        marginTop: "20px",
                        borderLeft: "5px solid #7c3aed",
                      }}
                    >
                      <h3>✅ Tarot Session Request Sent</h3>

                      <p>
                        <strong>Tarot Reader:</strong>{" "}
                        {requestedTarotSession.reader_name}
                      </p>

                      <p>
                        <strong>Date:</strong>{" "}
                        {requestedTarotSession.scheduled_date}
                      </p>

                      <p>
                        <strong>Time:</strong>{" "}
                        {requestedTarotSession.scheduled_time}
                      </p>

                      <p>
                        <strong>Reading Type:</strong>{" "}
                        {requestedTarotSession.spread_type}
                      </p>

                      <p>
                        <strong>Status:</strong>{" "}
                        {requestedTarotSession.status}
                      </p>

                      <p style={{ marginBottom: 0 }}>
                        Your request has been sent to the Tarot Reader.
                      </p>
                    </div>
                  )}

                </div>
              )}

              {activePage === "create-tarot-session" && (
                
                <div className="dashboard-content">

                  {/* PENDING TAROT SESSION REQUESTS */}
                  <div className="insight-card" style={{ marginBottom: "20px" }}>
                    <h3>🔔 Pending Tarot Session Requests</h3>

                    {tarotSessionRequestsLoading ? (
                      <p>Loading session requests...</p>
                    ) : tarotSessionRequestsError ? (
                      <p style={{ color: "#dc2626" }}>
                        {tarotSessionRequestsError}
                      </p>
                    ) : tarotSessionRequests.length === 0 ? (
                      <p>No pending Tarot session requests.</p>
                    ) : (
                      <div style={{ marginTop: "15px" }}>
                        {tarotSessionRequests.map((request) => (
                          <div
                            key={request.session_id}
                            style={{
                              padding: "18px",
                              border: "1px solid #e5e7eb",
                              borderRadius: "12px",
                              marginBottom: "12px",
                            }}
                          >
                            <p>
                              <strong>User:</strong> {request.username}
                            </p>

                            <p>
                              <strong>Date:</strong> {request.scheduled_date}
                            </p>

                            <p>
                              <strong>Time:</strong> {request.scheduled_time}
                            </p>

                            <p>
                              <strong>Reading Type:</strong>{" "}
                              {request.spread_type}
                            </p>

                            <p>
                              <strong>Status:</strong> {request.status}
                            </p>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "10px",
                                marginTop: "10px",
                                width: "100%",
                              }}
                            >
                              <button
                                className="primary-button"
                                style={{
                                  width: "100%",
                                  minWidth: 0,
                                  margin: 0,
                                  boxSizing: "border-box",
                                }}
                                onClick={() =>
                                  handleUpdateTarotSessionStatus(
                                    request.session_id,
                                    "Accepted"
                                  )
                                }
                              >
                                ✅ Accept
                              </button>

                              <button
                                className="secondary-button"
                                style={{
                                  width: "100%",
                                  minWidth: 0,
                                  margin: 0,
                                  boxSizing: "border-box",
                                }}
                                onClick={() =>
                                  handleUpdateTarotSessionStatus(
                                    request.session_id,
                                    "Rejected"
                                  )
                                }
                              >
                                ❌ Reject
                              </button>
                            </div>

                            {["Accepted", "Scheduled"].includes(request.status) && (
                              <button
                                type="button"
                                className="primary-button"
                                style={{
                                  width: "100%",
                                  marginTop: "10px",
                                  boxSizing: "border-box",
                                }}
                                onClick={() => {
                                  console.log("Reader opened session:",session);
                                  setActiveTarotChatSession({
                                    ...request,
                                    session_id: request.session_id,
                                    reader_name: "You",
                                    user_name: request.username,
                                  });
                                }}
                              >
                                💬 Open Chat
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* ACCEPTED / SCHEDULED TAROT SESSIONS */}
                  <div className="insight-card" style={{ marginBottom: "20px" }}>
                    <h3>💬 Accepted / Scheduled Sessions</h3>

                    {readerTarotSessionsLoading ? (
                      <p>Loading sessions...</p>
                    ) : readerTarotSessionsError ? (
                      <p style={{ color: "#dc2626" }}>
                        {readerTarotSessionsError}
                      </p>
                    ) : readerTarotSessions.length === 0 ? (
                      <p>No accepted or scheduled sessions yet.</p>
                    ) : (
                      readerTarotSessions.map((session) => (
                        <div
                          key={session.session_id}
                          style={{
                            padding: "18px",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            marginBottom: "12px",
                          }}
                        >
                          <p><strong>User:</strong> {session.username}</p>
                          <p><strong>Date:</strong> {session.scheduled_date}</p>
                          <p><strong>Time:</strong> {session.scheduled_time}</p>
                          <p><strong>Status:</strong> {session.status}</p>

                          <button
                            type="button"
                            className="primary-button"
                            style={{ width: "100%", marginTop: "10px" }}
                            onClick={() => {
                              setActiveTarotChatSession({
                                ...session,
                                reader_name: "You",
                                user_name: session.username,
                              });
                            }}
                          >
                            💬 Open Chat
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {activeTarotChatSession && (
                    <div
                      className="insight-card tarot-chat-container"
                      style={{
                        marginTop: "20px",
                        padding: "24px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    >
                      <h3>💬 Tarot Session Chat</h3>

                      <p>
                        <strong>User:</strong>{" "}
                        {activeTarotChatSession.user_name}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          fetchTarotChatMessages(
                            activeTarotChatSession.session_id
                          )
                        }
                        disabled={tarotChatLoading}
                      >
                        {tarotChatLoading ? "Loading..." : "🔄 Refresh Messages"}
                      </button>

                      <div
                        style={{
                          marginTop: "16px",
                          padding: "12px",
                          height: "280px",
                          overflowY: "auto",
                          border: "1px solid #e5e7eb",
                          borderRadius: "10px",
                        }}
                      >
                        {tarotChatLoading ? (
                          <p>Loading messages...</p>
                        ) : tarotChatMessages.length === 0 ? (
                          <p>No messages yet. Start the conversation!</p>
                        ) : (
                          tarotChatMessages.map((msg) => (
                            <div
                              key={msg.message_id}
                              style={{
                                padding: "12px",
                                marginBottom: "10px",
                                background: "#f3f4f6",
                                borderRadius: "10px",
                                overflowWrap: "anywhere",
                              }}
                            >
                              <strong>
                                {msg.sender_name || `User ${msg.sender_id}`}
                              </strong>
                              <p style={{ whiteSpace: "pre-wrap" }}>
                                {msg.message}
                              </p>
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                        <h4>📋 Rescheduling Proposals</h4>

                        {tarotRescheduleProposals.length === 0 ? (
                          <p>No rescheduling proposals yet.</p>
                        ) : (
                          tarotRescheduleProposals.map((proposal) => (
                            <div
                              key={proposal.reschedule_id}
                              style={{
                                padding: "14px",
                                border: "1px solid #e5e7eb",
                                borderRadius: "10px",
                                marginBottom: "10px",
                              }}
                            >
                              <p>
                                <strong>Requested by:</strong>{" "}
                                {(proposal.proposer_username || `User ${proposal.proposed_by}`)
                                  .replace(/^User\s+/i,"")}
                              </p>
                              <p>
                                <strong>Proposed date:</strong> {proposal.proposed_date}
                              </p>
                              <p>
                                <strong>Proposed time:</strong> {proposal.proposed_time}
                              </p>
                              <p>
                                <strong>Status:</strong> {proposal.status}
                              </p>

                              {proposal.status === "Pending" && (
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      decideTarotReschedule(
                                        proposal.reschedule_id,
                                        "Accepted"
                                      )
                                    }
                                    style={{
                                      padding: "9px 18px",
                                      background: "#16a34a",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "8px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✓ Accept
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      decideTarotReschedule(
                                        proposal.reschedule_id,
                                        "Rejected"
                                      )
                                    }
                                    style={{
                                      padding: "9px 18px",
                                      background: "#dc2626",
                                      color: "#ffffff",
                                      border: "none",
                                      borderRadius: "8px",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✕ Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          sendTarotChatMessage();
                        }}
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          gap: "12px",
                          width:"100%",
                          boxSizing: "border-box",
                          marginTop: "16px",
                        }}
                      >
                        <input
                          type="text"
                          value={tarotChatDraft}
                          onChange={(event) =>
                            setTarotChatDraft(event.target.value)
                          }
                          placeholder="Type your message..."
                          style={{
                            flex: 1,
                            minWidth: 0,
                            padding: "12px",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                          }}
                        />

                        <button
                          type="submit"
                          disabled={!tarotChatDraft.trim()}
                          style={{
                            flex: "0 0 auto",
                            padding: "12px 24px",
                            background: "#7c3aed",
                            color: "#fff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                          }}
                        >
                          Send
                        </button>

                      </form>
                    </div>
                  )}
                </div>
              )}




              {activePage === "reading-analytics" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">
                    <div className="system-reports-title-area">

                      <div className="system-reports-title-icon">
                        📊
                      </div>

                      <div>
                        <span className="system-reports-label">
                          TAROT READER
                        </span>

                        <h2>
                          Reading Analytics
                        </h2>

                        <p>
                          Monitor Tarot reading activity, user engagement and reading patterns.
                        </p>
                      </div>

                    </div>
                  </div>
                  <div className="feature-grid"
                    style={{
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: "20px",
                    }}
                  >

                    {/* TOTAL READINGS */}
                    <div className="feature-card">
                      <div className="feature-icon">🔮</div>

                      <h3>Total Readings</h3>

                      <div
                        style={{
                          fontSize: "34px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {totalReadings}
                      </div>

                      <p>
                        Total Tarot readings conducted by this Tarot Reader.
                      </p>
                    </div>


                    {/* USERS SERVED */}
                    <div className="feature-card">
                      <div className="feature-icon">👥</div>

                      <h3>Users Served</h3>

                      <div
                        style={{
                          fontSize: "34px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {usersServed}
                      </div>

                      <p>
                        Unique users who received Tarot readings.
                      </p>
                    </div>


                    {/* CARDS USED */}
                    <div className="feature-card">
                      <div className="feature-icon">🃏</div>

                      <h3>Cards Used</h3>

                      <div
                        style={{
                          fontSize: "34px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {cardsUsed}
                      </div>

                      <p>
                        Total Tarot cards used across readings.
                      </p>
                    </div>


                    {/* SCHEDULED SESSIONS */}
                    <div className="feature-card">
                      <div className="feature-icon">📅</div>

                      <h3>Scheduled Sessions</h3>

                      <div
                        style={{
                          fontSize: "34px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {scheduledSessions}
                      </div>

                      <p>
                        Tarot sessions currently scheduled with users.
                      </p>
                    </div>

                  </div>

                  {/* READING ACTIVITY */}
                  <div
                    className="insight-card"
                    style={{
                      marginTop: "32px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                    >
                      <div>
                        <h3 style={{ marginBottom: "6px" }}>
                          📈 Reading Activity
                        </h3>

                        <p style={{ margin: 0 }}>
                          Tarot reading activity over time.
                        </p>
                      </div>

                      <div
                        style={{
                          padding: "8px 14px",
                          borderRadius: "8px",
                          background: "#f3f4f6",
                          fontSize: "13px",
                          fontWeight: "600",
                        }}
                      >
                        Activity Trend
                      </div>
                    </div>

                    <div
                      style={{
                        height: "360px",
                        marginTop: "20px",
                      }}
                    >
                      <Line
                        data={readingActivityChartData}
                        options={readingActivityChartOptions}
                      />
                    </div>
                  </div>

                  {/* TAROT SPREAD USAGE */}
                  <div
                    className="insight-card"
                    style={{
                      marginTop: "32px",
                      display: "block",
                      width: "100%",
                    }}
                  >
                    <h3 style={{ marginBottom: "6px" }}>
                      🃏 Tarot Spread Usage
                    </h3>

                    <p style={{ marginTop: 0 }}>
                      Distribution of Tarot readings by spread type.
                    </p>

                    <div
                      style={{
                        height: "320px",
                        width: "100%",
                        marginTop: "20px",
                      }}
                    >
                      <Bar
                        data={{
                          labels: spreadUsage.map((item) => {
                            return item.spread_type
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (letter) => letter.toUpperCase());
                          }),

                          datasets: [
                            {
                              label: "Number of Readings",

                              data: spreadUsage.map(
                                (item) => item.count
                              ),

                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,

                          plugins: {
                            legend: {
                              display: true,
                            },

                            title: {
                              display: true,
                              text: "Tarot Spread Usage",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>


                  {/* Analytics Overview */}
                  <div className="insight-card">
                    <h3>📊 Analytics Overview</h3>

                    <p>
                      Reading analytics provide insights into tarot reading
                      activity, user engagement and reading patterns.
                    </p>
                  </div>

                </div>
              )}

              {activePage === "total-readings" && (
                <div className="dashboard-content">

                  <div className="dashboard-header">
                    <div>
                      <h2>🔮 Total Readings</h2>
                      <p>Overview of tarot readings conducted on the platform.</p>
                    </div>
                  </div>

                  <div className="insight-card">
                    <h3>📊 Total Tarot Readings</h3>

                    <div
                      style={{
                        fontSize: "42px",
                        fontWeight: "bold",
                        margin: "20px 0",
                      }}
                    >
                      {totalReadings}
                    </div>

                    <p>
                      Total number of tarot readings conducted on the platform.
                    </p>
                  </div>

                  <button
                    className="secondary-button"
                    onClick={() => setActivePage("reading-analytics")}
                  >
                    ← Back to Reading Analytics
                  </button>

                </div>
              )}

              {activePage === "user-engagement" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">
                    <div className="system-reports-title-area">
                      <div className="system-reports-title-icon">👥</div>

                      <div>
                        <span className="system-reports-label">
                          TAROT READER
                        </span>

                        <h2>User Engagement</h2>

                        <p>
                          Monitor user activity, repeat engagement and Tarot reading frequency.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="feature-grid"
                    style={{
                      gridTemplateColumns: "repeat(3,1fr)",
                      gap: "20px",
                    }}
                  >

                    <div className="feature-card">
                      <div className="feature-icon">👤</div>
                      <h3>Active Users</h3>
                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          margin: "12px 0",
                        }}
                      >
                        {activeUsers}
                      </div>
                      <p>
                        Users who actively interact with tarot reading features.
                      </p>
                    </div>

                    <div className="feature-card">
                      <div className="feature-icon">🔄</div>

                      <h3>Repeat Users</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "bold",
                          margin: "12px 0",
                        }}
                      >
                        {repeatUsers}
                      </div>

                      <p>
                        Users who conducted more than one tarot reading.
                      </p>
                    </div>

                    <div className="feature-card">
                      <div className="feature-icon">📊</div>
                      <div style={{ marginTop: "12px" }}>
                        <strong>Average Readings per User</strong>
                      </div>

                      <div
                        style={{
                          fontSize: "28px",
                          fontWeight: "bold",
                          margin: "8px 0",
                        }}
                      >
                        {averageReadingsPerUser}
                      </div>

                      <p>
                        Average number of tarot readings completed by each active user.
                      </p>
                    </div>

                  </div>

                  <div
                    className="insight-card"
                    style={{
                      marginTop: "32px",
                    }}
                  >
                    <h3 style={{ marginBottom: "8px" }}>
                      👥 Engagement Overview
                    </h3>

                    <p style={{ marginTop: 0 }}>
                      Summary of user participation and repeat reading behavior.
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "20px",
                        marginTop: "24px",
                      }}
                    >
                      {/* Repeat User Rate */}
                      <div
                        style={{
                          padding: "20px",
                          borderRadius: "12px",
                          background: "#f8f7ff",
                        }}
                      >
                        <h4 style={{ marginBottom: "8px" }}>
                          🔄 Repeat User Rate
                        </h4>

                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "700",
                          }}
                        >
                          {activeUsers > 0
                            ? ((repeatUsers / activeUsers) * 100).toFixed(1)
                            : "0.0"}%
                        </div>

                        <p style={{ marginBottom: 0 }}>
                          Percentage of active users who completed more than one reading.
                        </p>
                      </div>

                      {/* Reading Frequency */}
                      <div
                        style={{
                          padding: "20px",
                          borderRadius: "12px",
                          background: "#f8f7ff",
                        }}
                      >
                        <h4 style={{ marginBottom: "8px" }}>
                          📊 Reading Frequency
                        </h4>

                        <div
                          style={{
                            fontSize: "28px",
                            fontWeight: "700",
                          }}
                        >
                          {averageReadingsPerUser}
                        </div>

                        <p style={{ marginBottom: 0 }}>
                          Average number of Tarot readings per active user.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* USER ENGAGEMENT COMPARISON */}
                  <div
                    className="insight-card"
                    style={{
                      marginTop: "32px",
                    }}
                  >
                    <h3 style={{ marginBottom: "6px" }}>
                      📊 User Engagement Comparison
                    </h3>

                    <p style={{ marginTop: 0 }}>
                      Comparison of active users and repeat users.
                    </p>

                    <div
                      style={{
                        height: "320px",
                        width: "100%",
                        marginTop: "20px",
                      }}
                    >
                      <Bar
                        data={{
                          labels: ["Active Users", "Repeat Users"],

                          datasets: [
                            {
                              label: "Users",
                              data: [activeUsers, repeatUsers],
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,

                          plugins: {
                            legend: {
                              display: true,
                            },

                            title: {
                              display: true,
                              text: "User Engagement",
                            },
                          },

                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                stepSize: 1,
                              },
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                </div>
              )}


              {activePage === "session-tracking" && (
                <div className="dashboard-content">

                  <div className="system-reports-header">
                    <div className="system-reports-title-area">
                      <div className="system-reports-title-icon">📅</div>

                      <div>
                        <span className="system-reports-label">
                          TAROT READER
                        </span>

                        <h2>Session Tracking</h2>

                        <p>
                          Monitor scheduled, completed and recent Tarot sessions.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="feature-grid"
                    style={{
                      gridTemplateColumns: "repeat(4,1fr)",
                      gap: "20px",
                    }}
                  >

                    {/* TOTAL SESSIONS */}
                    <div className="feature-card">
                      <div className="feature-icon">📅</div>

                      <h3>Total Sessions</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {sessionStatusSummary.total_sessions}
                      </div>

                      <p>Total Tarot sessions created for this reader.</p>
                    </div>


                    {/* SCHEDULED */}
                    <div className="feature-card">
                      <div className="feature-icon">✅</div>

                      <h3>Scheduled Sessions</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {sessionStatusSummary.scheduled_sessions}
                      </div>

                      <p>Sessions currently scheduled with users.</p>
                    </div>


                    {/* PENDING */}
                    <div className="feature-card">
                      <div className="feature-icon">⏳</div>

                      <h3>Pending Requests</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {sessionStatusSummary.pending_sessions}
                      </div>

                      <p>Session requests awaiting a response.</p>
                    </div>


                    {/* REJECTED */}
                    <div className="feature-card">
                      <div className="feature-icon">❌</div>

                      <h3>Rejected Sessions</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {sessionStatusSummary.rejected_sessions}
                      </div>

                      <p>Sessions that were rejected or declined.</p>
                    </div>

                    {/* SESSION STATUS OVERVIEW */}
                    <div
                      className="insight-card"
                      style={{
                        marginTop: "32px",
                        width: "100%",
                        gridColumn: "1 / -1",
                      }}
                    >
                      <h3 style={{ marginBottom: "6px" }}>
                        📊 Session Status Overview
                      </h3>

                      <p style={{ marginTop: 0 }}>
                        Distribution of Tarot sessions by current status.
                      </p>

                      <div
                        style={{
                          height: "320px",
                          width: "100%",
                          marginTop: "20px",
                        }}
                      >
                        <Bar
                          data={{
                            labels: [
                              "Scheduled",
                              "Pending",
                              "Rejected",
                            ],

                            datasets: [
                              {
                                label: "Sessions",

                                data: [
                                  sessionStatusSummary.scheduled_sessions,
                                  sessionStatusSummary.pending_sessions,
                                  sessionStatusSummary.rejected_sessions,
                                ],

                                borderWidth: 1,
                              },
                            ],
                          }}
                          options={{
                            responsive: true,

                            plugins: {
                              legend: {
                                display: true,
                              },

                              title: {
                                display: true,
                                text: "Session Status Distribution",
                              },
                            },

                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1,
                                },
                              },
                            },
                          }}
                        />
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="feature-card"
                      style={{
                        gridColumn: "1 / -1",
                        marginTop: "0px",
                      }}
                    >
                      <div className="feature-icon">📅</div>

                      <h3>Recent Readings</h3>

                      <div style={{ marginTop: "12px" }}>
                        {recentSessions.length > 0 ? (
                          recentSessions.map((session) => (
                            <div
                              key={session.reading_id}
                              style={{
                                marginBottom: "12px",
                                paddingBottom: "10px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              <strong>
                                🔮 {session.spread_name}
                              </strong>

                              <div>
                                🃏 {session.card_count} cards
                              </div>

                              <div>
                                📅{" "}
                                {new Date(
                                  session.created_at
                                ).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p>No recent sessions found.</p>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="insight-card">
                    <h3>🕒 Session Overview</h3>

                    <p>
                      Session tracking provides an overview of tarot
                      reading sessions and their activity on the platform.
                    </p>
                  </div>

                </div>
              )}

              {activePage === "report-management" && (
                <div className="dashboard-content">

                  {/* HEADER */}
                  <div className="system-reports-header">
                    <div className="system-reports-title-area">
                      <div className="system-reports-title-icon">📄</div>

                      <div>
                        <span className="system-reports-label">
                          TAROT READER
                        </span>

                        <h2>Report Management</h2>

                        <p>
                          Manage Tarot reading reports and generated results.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div
                    className="feature-grid"
                    style={{
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "20px",
                    }}
                  >

                    {/* TOTAL REPORTS */}
                    <div className="feature-card">
                      <div className="feature-icon">📄</div>

                      <h3>Total Reports</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {tarotReports.length}
                      </div>

                      <p>
                        Total Tarot reading reports available.
                      </p>
                    </div>

                    {/* LATEST REPORT */}
                    <div className="feature-card">
                      <div className="feature-icon">🔮</div>

                      <h3>Latest Report</h3>

                      <div
                        style={{
                          fontSize: "22px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {tarotReports.length > 0
                          ? tarotReports[0].spread_name
                          : "No reports"}
                      </div>

                      <p>
                        Most recently generated Tarot report.
                      </p>
                    </div>

                    {/* CARDS USED */}
                    <div className="feature-card">
                      <div className="feature-icon">🃏</div>

                      <h3>Cards Used</h3>

                      <div
                        style={{
                          fontSize: "32px",
                          fontWeight: "700",
                          margin: "12px 0",
                        }}
                      >
                        {tarotReports.reduce(
                          (total, report) =>
                            total + (report.card_count || 0),
                          0
                        )}
                      </div>

                      <p>
                        Total cards included across reports.
                      </p>
                    </div>

                  </div>

                  {/* READING REPORTS */}
                  <div
                    className="feature-card"
                    style={{
                      marginTop: "24px",
                      width: "100%",
                    }}
                  >
                    <div className="feature-icon">📋</div>

                    <h3>Reading Reports</h3>

                    <p>
                      View and download generated Tarot reading reports.
                    </p>

                    <div style={{ marginTop: "16px" }}>

                      {tarotReports.length > 0 ? (
                        tarotReports.map((report) => (
                          <div
                            key={report.reading_id}
                            style={{
                              marginBottom: "14px",
                              padding: "14px",
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                            }}
                          >

                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                gap: "15px",
                                flexWrap: "wrap",
                              }}
                            >

                              <div>
                                <strong>
                                  🔮 {report.spread_name}
                                </strong>

                                <div style={{ marginTop: "6px" }}>
                                  🃏 {report.card_count} cards
                                </div>

                                <div style={{ marginTop: "4px" }}>
                                  📅{" "}
                                  {report.created_at
                                    ? new Date(
                                        report.created_at
                                      ).toLocaleString()
                                    : "Date unavailable"}
                                </div>

                                <div style={{ marginTop: "4px" }}>
                                  🆔 {report.reading_id}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDownloadReport(
                                    report.reading_id
                                  )
                                }
                                style={{
                                  padding: "9px 14px",
                                  cursor: "pointer",
                                }}
                              >
                                📄 Download Report
                              </button>

                            </div>

                          </div>
                        ))
                      ) : (
                        <p>No Tarot reports available.</p>
                      )}

                    </div>
                  </div>

                  {/* REPORT OVERVIEW */}
                  <div
                    className="insight-card"
                    style={{
                      marginTop: "24px",
                    }}
                  >
                    <h3>📊 Report Overview</h3>

                    <p>
                      Summary of generated Tarot reports available
                      on the platform.
                    </p>

                    <div style={{ marginTop: "12px" }}>
                      <strong>Total Reports:</strong>{" "}
                      {tarotReports.length}
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <strong>Latest Report:</strong>{" "}
                      {tarotReports.length > 0
                        ? tarotReports[0].spread_name
                        : "No reports available"}
                    </div>

                    <div style={{ marginTop: "8px" }}>
                      <strong>Latest Report Date:</strong>{" "}
                      {tarotReports.length > 0 &&
                      tarotReports[0].created_at
                        ? new Date(
                            tarotReports[0].created_at
                          ).toLocaleString()
                        : "Date unavailable"}
                    </div>
                  </div>

                </div>
              )}

              {activePage ===
                "tarot" &&
                renderTarot()}

              {activePage ===
                "palm" &&
                renderPalm()}

              {activePage ===
                "history" &&
                renderHistory()}

              {activePage ===
                "profile" &&
                renderProfile()}
              
              {activePage ===
                "personality" &&
                renderPersonalityProfile()}

              {message && (
                <div className="success-message">
                  {message}
                </div>
              )}

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}


            </main>

          </div>

        </>

      )}

    </div>
  );
}

export default App;