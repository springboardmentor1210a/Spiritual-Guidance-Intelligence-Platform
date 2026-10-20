

import { useEffect, useMemo, useState } from "react";

import {

  ArrowRight,

  BookOpen,

  CalendarDays,

  ChevronRight,

  Compass,

  Gift,

  Hand,

  HeartHandshake,

  History,

  Lightbulb,

  RefreshCw,

  Sparkles,

  Target,


  UserRound,



  BellRing,

} from "lucide-react";

import { Link } from "react-router-dom";



import api from "../api/client";

import { useAuth } from "../context/AuthContext";



const styles = `

.ud-page{max-width:1280px;margin:auto;padding:40px 28px 60px;color:#4d3427}

.ud-hero{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;padding:10px 0 28px}

.ud-eyebrow{margin:0 0 9px;color:#9a6b45;font-size:10px;font-weight:800;letter-spacing:.18em}

.ud-hero h1{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:43px;line-height:1.08;color:#4b3024}

.ud-hero p{max-width:760px;margin:11px 0 0;color:#85634d;font-size:14px;line-height:1.7}

.ud-actions-top{display:flex;gap:9px;flex-wrap:wrap}

.ud-btn{display:inline-flex;align-items:center;gap:7px;min-height:40px;padding:0 14px;border:1px solid #d9c2a6;border-radius:10px;background:#fffaf2;color:#674630;text-decoration:none;font-size:11px;font-weight:800;cursor:pointer}

.ud-btn.primary{background:#70482f;border-color:#70482f;color:#fffaf4}

.ud-status{display:inline-flex;align-items:center;gap:7px;margin-top:14px;padding:6px 10px;border-radius:99px;background:#eee2d0;color:#76553c;font-size:9px;font-weight:800}

.ud-dot{width:7px;height:7px;border-radius:50%;background:#6f9a69}

.ud-error{margin-bottom:18px;padding:12px 14px;border:1px solid #e5b9b0;border-radius:10px;background:#fff1ef;color:#9d4b3f;font-size:11px}

.ud-profile{display:grid;grid-template-columns:1.5fr .7fr .7fr;gap:13px;margin-bottom:16px}

.ud-card{border:1px solid #e3cfb5;border-radius:15px;background:#fffaf3;box-shadow:0 7px 20px rgba(74,47,34,.045)}

.ud-profile-card{padding:18px;min-height:102px}

.ud-profile-main{display:flex;align-items:center;gap:14px}

.ud-avatar{width:50px;height:50px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#ead9c0;color:#785438;flex-shrink:0}

.ud-profile-card h3{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:20px}

.ud-profile-card p{margin:5px 0 0;color:#94725b;font-size:10px;line-height:1.5}

.ud-label{color:#94725b;font-size:9px;font-weight:800;letter-spacing:.09em;text-transform:uppercase}

.ud-number{margin-top:7px;font-family:"Playfair Display",Georgia,serif;font-size:28px;color:#4b3024}

.ud-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:17px}

.ud-stat{padding:17px;border:1px solid #e3cfb5;border-radius:14px;background:#fffaf3}

.ud-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#efe1cf;color:#805a3e}

.ud-stat strong{display:block;margin-top:12px;font-family:"Playfair Display",Georgia,serif;font-size:28px}

.ud-stat span{display:block;margin-top:2px;color:#8d6c55;font-size:10px;font-weight:800}

.ud-stat small{display:block;margin-top:6px;color:#a17e64;font-size:9px}

.ud-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:17px;margin-bottom:17px}

.ud-head{display:flex;justify-content:space-between;gap:12px;padding:19px 20px 15px;border-bottom:1px solid #eadbc7}

.ud-head h2{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:21px;color:#4b3024}

.ud-head p{margin:5px 0 0;color:#94715a;font-size:10px;line-height:1.5}

.ud-link{display:inline-flex;align-items:center;gap:4px;color:#79553a;text-decoration:none;font-size:10px;font-weight:800;white-space:nowrap}

.ud-quick{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:18px}

.ud-action{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid #e7d7c1;border-radius:11px;background:#fffdf9;color:#5c402e;text-decoration:none}

.ud-action:hover{background:#f8efe2}

.ud-action-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#eee0cc;color:#765238;flex:0 0 36px}

.ud-action strong{display:block;font-size:11px}

.ud-action span{display:block;margin-top:3px;color:#987861;font-size:9px;line-height:1.4}

.ud-reflection{padding:18px 20px}

.ud-reflection-box{padding:15px;border-left:4px solid #a47752;border-radius:0 9px 9px 0;background:#f8f0e4}

.ud-reflection-box p{margin:0;color:#634832;font-size:11px;line-height:1.8}

.ud-note{margin-top:10px!important;color:#96755d!important;font-size:9px!important}

.ud-themes{padding:18px 20px}

.ud-theme{margin-bottom:13px}

.ud-theme:last-child{margin-bottom:0}

.ud-theme-row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:10px}

.ud-theme-row span{color:#9a795f}

.ud-bar{height:7px;border-radius:99px;background:#eadbc8;overflow:hidden}

.ud-bar span{display:block;height:100%;border-radius:99px;background:#a47752}

.ud-theme p{margin:5px 0 0;color:#92715a;font-size:9px;line-height:1.4}
.ud-mix-item{margin-bottom:20px}.ud-mix-top{display:flex;align-items:center;gap:10px;margin-bottom:9px}.ud-mix-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;background:#eee0cc;color:#765238;flex-shrink:0}.ud-mix-copy{min-width:0;flex:1}.ud-mix-copy strong{display:block;font-size:11px;color:#5b3d2b}.ud-mix-copy small{display:block;margin-top:3px;font-size:9px;color:#987861}.ud-mix-top b{font-family:"Playfair Display",Georgia,serif;font-size:22px;color:#4b3024}.ud-mix-summary{margin-top:10px;padding:13px;border-radius:10px;background:#f8f0e4}.ud-mix-summary strong{font-size:10px;color:#5b3d2b}.ud-mix-summary p{margin:5px 0 0;font-size:9px;line-height:1.5;color:#92715a}

.ud-months{display:grid;grid-template-columns:repeat(6,1fr);gap:7px;align-items:end;padding:20px;min-height:220px}

.ud-month{text-align:center}

.ud-count{font-size:9px;font-weight:800;color:#79563c}

.ud-barbox{height:125px;display:flex;align-items:flex-end;justify-content:center}

.ud-monthbar{width:34px;min-height:5px;border-radius:7px 7px 2px 2px;background:#a47752}

.ud-month label{display:block;margin-top:7px;font-size:9px;font-weight:800;color:#92715a}

.ud-month small{display:block;margin-top:3px;font-size:8px;color:#aa896f}

.ud-list{padding:0}

.ud-reading{display:grid;grid-template-columns:40px 1fr auto;gap:11px;align-items:center;padding:15px 18px;border-bottom:1px solid #eee1d0}

.ud-reading:last-child{border-bottom:0}

.ud-reading-icon{width:38px;height:38px;display:flex;align-items:center;justify-content:center;border-radius:9px;background:#eee0cc;color:#765238}

.ud-reading strong{display:block;font-size:11px;color:#5a3b2a}

.ud-reading time{display:block;margin-top:3px;color:#a17e64;font-size:9px}

.ud-reading p{margin:5px 0 0;color:#81624e;font-size:9px;line-height:1.4}

.ud-type{padding:5px 7px;border-radius:99px;background:#f0e4d4;color:#79563c;font-size:8px;font-weight:800;text-transform:uppercase}

.ud-two{display:grid;grid-template-columns:1fr 1fr;gap:17px;margin-bottom:17px}

.ud-insights,.ud-recs{padding:8px 19px 18px}

.ud-insight{padding:12px 0;border-bottom:1px solid #eee1d0}

.ud-insight:last-child{border:0}

.ud-insight h3{margin:0 0 4px;font-family:"Playfair Display",Georgia,serif;font-size:15px}

.ud-insight p,.ud-rec p{margin:0;color:#82634e;font-size:10px;line-height:1.6}

.ud-rec{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid #eee1d0}

.ud-rec:last-child{border:0}

.ud-recnum{width:26px;height:26px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:#eadac5;color:#79563c;font-size:9px;font-weight:800;flex:0 0 26px}

.ud-empty{padding:30px 18px;text-align:center;color:#92715a;font-size:10px}

.ud-empty strong{display:block;margin-bottom:6px;color:#5b3d2b}

.ud-fields{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:13px}

.ud-field{padding:9px 10px;border:1px solid #eadbc8;border-radius:8px;background:#fffdf9;color:#7d604b;font-size:9px}

.ud-field strong{display:block;color:#573a29;margin-bottom:3px}

.ud-footer{margin-top:20px;padding:12px;border:1px solid #e6d7c2;border-radius:10px;background:#fbf6ee;color:#94745d;font-size:9px;line-height:1.6;text-align:center}

.ud-loading{min-height:500px;display:flex;align-items:center;justify-content:center;color:#87664e;font-size:12px}

.ud-consult-card{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:23px}

.ud-consult-card h2{margin:0;font-family:"Playfair Display",Georgia,serif;font-size:23px;color:#4b3024}

.ud-consult-card p{max-width:680px;margin:8px 0 0;color:#85634d;font-size:11px;line-height:1.8}

.ud-consult-actions{display:flex;gap:9px;flex-wrap:wrap}

@media(max-width:950px){.ud-profile{grid-template-columns:1fr 1fr}.ud-profile-main{grid-column:1/-1}.ud-stats{grid-template-columns:1fr 1fr}.ud-grid,.ud-two{grid-template-columns:1fr}.ud-consult-card{grid-template-columns:1fr}}

@media(max-width:620px){.ud-page{padding:24px 14px 40px}.ud-hero{display:block}.ud-hero h1{font-size:34px}.ud-actions-top{margin-top:16px}.ud-profile,.ud-stats,.ud-quick,.ud-fields{grid-template-columns:1fr}.ud-profile-main{grid-column:auto}.ud-months{padding:15px 8px;gap:3px}.ud-monthbar{width:24px}.ud-reading{grid-template-columns:38px 1fr}.ud-type{display:none}.ud-consult-actions{flex-direction:column}}

`;



function text(value, fallback = "") {

  if (value === null || value === undefined) return fallback;

  return String(value).trim() || fallback;

}



function date(value) {

  if (!value) return "";

  const d = new Date(value);

  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();

}



function short(value, n = 170) {

  const s = text(value);

  return s.length > n ? `${s.slice(0, n).trim()}…` : s;

}



function Stat({ Icon, value, label, note }) {

  return (

    <article className="ud-stat">

      <div className="ud-icon"><Icon size={18} /></div>

      <strong>{value}</strong>

      <span>{label}</span>

      <small>{note}</small>

    </article>

  );

}



function Reading({ item }) {

  const type = text(item?.reading_type, "reading").toLowerCase();



  return (

    <article className="ud-reading">

      <span className="ud-reading-icon">

        {type === "palm" ? <Hand size={18} /> : <BookOpen size={18} />}

      </span>

      <div>

        <strong>{text(item?.title, "Saved reading")}</strong>

        <time>{date(item?.created_at)}</time>

        <p>{short(item?.input_summary || item?.result_text || "Saved reading activity.")}</p>

      </div>

      <span className="ud-type">{type}</span>

    </article>

  );

}



export default function Dashboard() {

  const { user } = useAuth();



  const [data, setData] = useState(null);

  const [readings, setReadings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");



  async function load(showRefresh = false) {

    if (showRefresh) {

      setRefreshing(true);

    } else {

      setLoading(true);

    }



    setError("");



    try {

      const [dashboardResponse, readingsResponse] = await Promise.all([

        api.get("/api/intelligence/dashboard"),

        api.get("/api/readings/me"),

      ]);



      setData(dashboardResponse.data);

      setReadings(

        Array.isArray(readingsResponse.data?.items)

          ? readingsResponse.data.items

          : Array.isArray(readingsResponse.data)

            ? readingsResponse.data

            : []

      );

    } catch (err) {

      setError(

        err.response?.data?.detail ||

          "Unable to load your dashboard. Please check the backend."

      );

    } finally {

      setLoading(false);

      setRefreshing(false);

    }

  }



  useEffect(() => {

    load();

  }, []);



  const recent = useMemo(() => readings.slice(0, 5), [readings]);



  const readingMix = useMemo(() => {
    const counts = { palm: 0, tarot: 0 };
    readings.forEach((item) => {
      const type = text(item?.reading_type || item?.type || item?.title, "").toLowerCase();
      if (type.includes("palm")) counts.palm += 1;
      else if (type.includes("tarot") || type.includes("card")) counts.tarot += 1;
    });
    return [
      { label: "Palm readings", count: counts.palm, detail: "Visual hand reflections", icon: Hand },
      { label: "Tarot readings", count: counts.tarot, detail: "Card-based reflections", icon: BookOpen },
    ];
  }, [readings]);

  const maxMix = Math.max(1, ...readingMix.map((item) => item.count));

  const months = useMemo(() => {
    if (Array.isArray(data?.monthly_trends) && data.monthly_trends.length) {
      return data.monthly_trends.slice(-6);
    }
    const now = new Date();
    const lastSix = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const year = monthDate.getFullYear();
      const monthIndex = monthDate.getMonth();
      const matching = readings.filter((item) => {
        const d = new Date(item?.created_at || item?.date || "");
        return !Number.isNaN(d.getTime()) && d.getFullYear() === year && d.getMonth() === monthIndex;
      });
      lastSix.push({
        year,
        month: monthIndex + 1,
        label: monthDate.toLocaleString(undefined, { month: "short" }),
        total: matching.length,
        palm: matching.filter((item) => text(item?.reading_type || item?.type || item?.title, "").toLowerCase().includes("palm")).length,
        tarot: matching.filter((item) => {
          const type = text(item?.reading_type || item?.type || item?.title, "").toLowerCase();
          return type.includes("tarot") || type.includes("card");
        }).length,
      });
    }
    return lastSix;
  }, [data?.monthly_trends, readings]);

  const maxMonth = Math.max(1, ...months.map((item) => Number(item?.total || 0)));

  const savedReadingText = useMemo(
    () => readings
      .map((item) => text(item?.result_text || item?.interpretation || item?.input_summary || item?.title, ""))
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    [readings]
  );

  const derivedPersonality = useMemo(() => {
    if (!readings.length) return [];
    const categories = [
      { key: "relationships", title: "Connection & relationships", words: ["relationship", "heart", "love", "emotion", "connection", "communication"], fallback: "Your saved readings can help you reflect on how you communicate and maintain meaningful connections." },
      { key: "career", title: "Work & direction", words: ["career", "work", "goal", "leadership", "ambition", "purpose"], fallback: "Review the goals and responsibilities that matter most to you, then choose one practical next step." },
      { key: "growth", title: "Personal growth", words: ["growth", "learning", "strength", "challenge", "confidence", "change"], fallback: "Your reading history is a useful starting point for noticing strengths, challenges, and areas you want to develop." },
      { key: "balance", title: "Balance & wellbeing", words: ["balance", "rest", "stress", "energy", "routine", "wellness"], fallback: "Consider which routines help you feel grounded and which ones may need more attention." },
    ];
    const source = savedReadingText;
    const scored = categories.map((category) => ({
      ...category,
      score: category.words.reduce((total, word) => total + (source.match(new RegExp(`\\b${word}\\w*`, "g")) || []).length, 0),
    })).sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map((category) => ({
      title: category.title,
      text: category.score > 0
        ? `Your saved reading text returns to themes of ${category.words.filter((word) => source.includes(word)).slice(0, 3).join(", ") || category.title.toLowerCase()}. Use this as a reflection prompt, and compare it with your own experience.`
        : category.fallback,
    }));
  }, [readings.length, savedReadingText]);

  const apiPersonality = Array.isArray(data?.personality_insights) ? data.personality_insights : [];

  const derivedRecommendations = useMemo(() => {
    if (!readings.length) return [];
    const latest = readings[0] || {};
    const latestType = text(latest?.reading_type || latest?.type || latest?.title, "").toLowerCase();
    const latestText = text(latest?.result_text || latest?.interpretation || latest?.input_summary, "").toLowerCase();
    const suggestions = [];
    if (latestText.includes("relationship") || latestText.includes("heart") || latestText.includes("emotion")) {
      suggestions.push("Choose one important conversation and practise expressing what you need clearly and kindly.");
    }
    if (latestText.includes("career") || latestText.includes("work") || latestText.includes("goal")) {
      suggestions.push("Write down one current goal, the next small action, and a realistic date to review your progress.");
    }
    if (latestText.includes("change") || latestText.includes("challenge") || latestText.includes("growth")) {
      suggestions.push("Identify one change within your control and take a small, measurable step toward it this week.");
    }
    if (latestType.includes("palm")) {
      suggestions.push("Compare this palm reflection with your own lived experience; note which observations feel relevant and which do not.");
    } else {
      suggestions.push("Record the main message from your latest card reading and revisit it after a few days to see what remains useful.");
    }
    suggestions.push("Review your last few readings for a repeated topic, then choose one practical action rather than trying to change everything at once.");
    return [...new Set(suggestions)].slice(0, 4);
  }, [readings]);

  const apiRecommendations = Array.isArray(data?.recommendations) && data.recommendations.length
    ? data.recommendations
    : Array.isArray(data?.next_actions) && data.next_actions.length
      ? data.next_actions
      : [];

  // Once saved readings exist, derive these sections from current reading content
  // so they respond to new readings instead of remaining a static dashboard payload.
  const personality = readings.length ? derivedPersonality : apiPersonality;
  const recs = readings.length ? derivedRecommendations : apiRecommendations;

  const reflection =

    data?.personalized_interpretation?.interpretation ||

    data?.personalized_interpretation?.text ||

    "Save readings and complete your profile to build a more personalized reflection.";



  const completed = Boolean(data?.profile_completed);

  const totalReadings = data?.total_readings ?? readings.length;



  if (loading) {

    return (

      <div className="page-container">

        <style>{styles}</style>

        <div className="ud-loading">

          <Sparkles size={19} />

          &nbsp;&nbsp;Preparing your personal dashboard…

        </div>

      </div>

    );

  }



  return (

    <div className="page-container">

      <style>{styles}</style>



      <main className="ud-page">

        <section className="ud-hero">

          <div>

            <p className="ud-eyebrow">YOUR PERSONAL REFLECTION SPACE</p>



            <h1>

              Welcome back, {text(data?.name || user?.full_name, "there")}.

            </h1>



            <p>

              Review your saved palm and tarot activity, personalized

              reflections, recurring themes, life-trend activity and practical

              next steps from one dashboard.

            </p>



            <span className="ud-status">

              <span className="ud-dot" />

              Personal reflection workspace active

            </span>

          </div>



          <div className="ud-actions-top">

            <button

              className="ud-btn"

              onClick={() => load(true)}

              disabled={refreshing}

            >

              <RefreshCw size={14} />

              {refreshing ? "Refreshing…" : "Refresh"}

            </button>

          </div>

        </section>



        {error && <div className="ud-error">{error}</div>}



        <section className="ud-profile">

          <article className="ud-card ud-profile-card ud-profile-main">

            <span className="ud-avatar">

              <UserRound size={25} />

            </span>



            <div>

              <h3>{text(data?.name || user?.full_name, "Your profile")}</h3>

              <p>{text(user?.email, "Your account")}</p>

            </div>

          </article>



          <article className="ud-card ud-profile-card">

            <span className="ud-label">Profile status</span>

            <div className="ud-number">{completed ? "Ready" : "Start"}</div>

            <p>

              {completed

                ? "Personalized reflections are enabled."

                : "Add your interests and goals."}

            </p>

          </article>



          <article className="ud-card ud-profile-card">

            <span className="ud-label">Saved activity</span>

            <div className="ud-number">{totalReadings}</div>

            <p>Total palm and tarot readings saved.</p>

          </article>

        </section>



        <section className="ud-stats">

          <Stat

            Icon={BookOpen}

            value={totalReadings}

            label="Total readings"

            note="Palm + Tarot activity"

          />



          <Stat

            Icon={Hand}

            value={data?.palm_readings ?? 0}

            label="Palm readings"

            note="Saved palm sessions"

          />



          <Stat

            Icon={Sparkles}

            value={data?.tarot_readings ?? 0}

            label="Tarot readings"

            note="Saved tarot sessions"

          />



          <Stat

            Icon={Target}

            value={completed ? "Yes" : "No"}

            label="Profile completed"

            note={completed ? "Personalization available" : "Complete My profile"}

          />

        </section>



        <section className="ud-grid">

          <article className="ud-card">

            <div className="ud-head">

              <div>

                <h2>Start a reflection</h2>

                <p>Jump directly into the experiences you need.</p>

              </div>

            </div>



            <div className="ud-quick">

              <Link className="ud-action" to="/palm-reading">

                <span className="ud-action-icon"><Hand size={17} /></span>

                <span>

                  <strong>Palm reading</strong>

                  <span>Upload and reflect on a palm image.</span>

                </span>

              </Link>



              <Link className="ud-action" to="/tarot-reading">

                <span className="ud-action-icon"><BookOpen size={17} /></span>

                <span>

                  <strong>Tarot reading</strong>

                  <span>Choose cards and generate an AI reflection.</span>

                </span>

              </Link>



              <Link className="ud-action" to="/guidance">

                <span className="ud-action-icon"><Compass size={17} /></span>

                <span>

                  <strong>Guidance</strong>

                  <span>Turn reflections into practical steps.</span>

                </span>

              </Link>



              <Link className="ud-action" to="/history">

                <span className="ud-action-icon"><History size={17} /></span>

                <span>

                  <strong>Reading history</strong>

                  <span>Revisit your saved readings.</span>

                </span>

              </Link>

            </div>

          </article>



          <article className="ud-card">

            <div className="ud-head">

              <div>

                <h2>Personalized reflection</h2>

                <p>Context from your saved profile and activity.</p>

              </div>

              <Lightbulb size={18} color="#9a6b45" />

            </div>



            <div className="ud-reflection">

              <div className="ud-reflection-box">

                <p>{reflection}</p>

                <p className="ud-note">

                  This is a reflective interpretation of saved activity, not a

                  scientific prediction, diagnosis or guaranteed forecast.

                </p>

              </div>

            </div>

          </article>

        </section>



        <section className="ud-card" style={{ marginBottom: 17 }}>

          <div className="ud-head">

            <div>

              <h2>Personal consultation</h2>

              <p>

                Request a session with a Tarot Reader or Spiritual Consultant

                for focused, individual guidance.

              </p>

            </div>

            <HeartHandshake size={21} color="#9a6b45" />

          </div>



          <div className="ud-consult-card">

            <div>

              <h2>Talk with a specialist</h2>

              <p>

                Choose the kind of support you need, explain your question,

                and share a preferred session time. You can check the status

                of your requests and review responses in the consultation area.

              </p>



              <div className="ud-fields">

                <div className="ud-field">

                  <strong>Tarot Reader</strong>

                  Tarot interpretation and card-based reflection

                </div>



                <div className="ud-field">

                  <strong>Spiritual Consultant</strong>

                  Career, relationships, personal growth and life direction

                </div>

              </div>

            </div>



            <div className="ud-consult-actions">

              <Link className="ud-btn primary" to="/consultations">

                Request a session <ArrowRight size={14} />

              </Link>



              <Link className="ud-btn" to="/notifications">

                <BellRing size={14} /> Notifications

              </Link>

            </div>

          </div>

        </section>



        <section className="ud-grid">

          <article className="ud-card">
            <div className="ud-head">
              <div>
                <h2>Your reading mix</h2>
                <p>A quick visual summary of the readings saved to your account.</p>
              </div>
              <BookOpen size={18} color="#9a6b45" />
            </div>
            <div className="ud-themes">
              {readingMix.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="ud-mix-item" key={item.label}>
                    <div className="ud-mix-top">
                      <span className="ud-mix-icon"><Icon size={16} /></span>
                      <div className="ud-mix-copy">
                        <strong>{item.label}</strong>
                        <small>{item.detail}</small>
                      </div>
                      <b>{item.count}</b>
                    </div>
                    <div className="ud-bar">
                      <span style={{ width: `${item.count ? Math.max(8, (item.count / maxMix) * 100) : 0}%` }} />
                    </div>
                  </div>
                );
              })}
              <div className="ud-mix-summary">
                <strong>{readings.length ? `${readings.length} saved reading${readings.length === 1 ? "" : "s"}` : "Start your reading history"}</strong>
                <p>{readings.length
                  ? "This summary updates from your saved reading history whenever the dashboard refreshes."
                  : "Complete a palm or tarot reading and it will appear here automatically."}</p>
              </div>
            </div>
          </article>

          <article className="ud-card">

            <div className="ud-head">

              <div>

                <h2>Life trend activity</h2>

                <p>

                  Saved reading activity across the latest six calendar months.

                </p>

              </div>

              <CalendarDays size={18} color="#9a6b45" />

            </div>



            {months.length ? (

              <div className="ud-months">

                {months.map((month, index) => {

                  const total = Number(month?.total || 0);



                  return (

                    <div

                      className="ud-month"

                      key={`${month?.year || ""}-${month?.month || index}`}

                    >

                      <div className="ud-count">{total}</div>



                      <div className="ud-barbox">

                        <div

                          className="ud-monthbar"

                          style={{

                            height: `${Math.max(5, (total / maxMonth) * 100)}%`,

                          }}

                        />

                      </div>



                      <label>{text(month?.label, "Month")}</label>

                      <small>

                        P {month?.palm ?? 0} · T {month?.tarot ?? 0}

                      </small>

                    </div>

                  );

                })}

              </div>

            ) : (

              <div className="ud-empty">

                <strong>No monthly activity yet</strong>

                Complete a reading to start your trend history.

              </div>

            )}

          </article>

        </section>



        <section className="ud-card" style={{ marginBottom: 17 }}>

          <div className="ud-head">

            <div>

              <h2>Recent readings</h2>

              <p>Your latest saved palm and tarot sessions.</p>

            </div>



            <Link className="ud-link" to="/history">

              View complete history <ChevronRight size={13} />

            </Link>

          </div>



          <div className="ud-list">

            {recent.length ? (

              recent.map((item) => (

                <Reading item={item} key={item.id} />

              ))

            ) : (

              <div className="ud-empty">

                <strong>No readings saved yet</strong>

                Start with a palm or tarot reading to build your history.

              </div>

            )}

          </div>

        </section>



        <section className="ud-two">

          <article className="ud-card">

            <div className="ud-head">

              <div>

                <h2>Personality insights</h2>

                <p>Explainable observations from your profile and activity.</p>

              </div>

              <Lightbulb size={18} color="#9a6b45" />

            </div>



            <div className="ud-insights">

              {personality.length ? (

                personality.slice(0, 5).map((item, index) => (

                  <article className="ud-insight" key={index}>

                    <h3>{text(item?.title, "Reflection insight")}</h3>

                    <p>{text(item?.text, "No additional reflection is available.")}</p>

                  </article>

                ))

              ) : (

                <div className="ud-empty">

                  <strong>Insights will grow with your activity</strong>

                  Add profile details and save readings to build contextual

                  observations.

                </div>

              )}

            </div>

          </article>



          <article className="ud-card">

            <div className="ud-head">

              <div>

                <h2>Smart recommendations</h2>

                <p>Practical actions based on your current context.</p>

              </div>

              <Gift size={18} color="#9a6b45" />

            </div>



            <div className="ud-recs">

              {recs.length ? (

                recs.slice(0, 5).map((item, index) => (

                  <div className="ud-rec" key={index}>

                    <span className="ud-recnum">

                      {String(index + 1).padStart(2, "0")}

                    </span>

                    <p>

                      {typeof item === "string"

                        ? item

                        : text(

                            item?.action || item?.text,

                            "Explore this recommendation."

                          )}

                    </p>

                  </div>

                ))

              ) : (

                <div className="ud-empty">

                  <strong>No recommendations yet</strong>

                  Save readings and complete your profile to build suggestions.

                </div>

              )}

            </div>

          </article>

        </section>



        <section className="ud-card">

          <div className="ud-head">

            <div>

              <h2>Personalization</h2>

              <p>Your profile helps contextualize reflective outputs.</p>

            </div>



            <Link className="ud-link" to="/profile">

              Open My profile <ChevronRight size={13} />

            </Link>

          </div>



          <div className="ud-profile-card" style={{ border: 0, boxShadow: "none" }}>

            <div

              style={{

                display: "flex",

                justifyContent: "space-between",

                fontSize: 10,

                fontWeight: 800,

                color: "#775640",

                marginBottom: 7,

              }}

            >

              <span>Profile personalization</span>

              <span>{completed ? 100 : 35}%</span>

            </div>



            <div className="ud-bar">

              <span style={{ width: `${completed ? 100 : 35}%` }} />

            </div>



            <div className="ud-fields">

              <div className="ud-field">

                <strong>Profile record</strong>

                {completed ? "Completed" : "Add your details"}

              </div>



              <div className="ud-field">

                <strong>Reading context</strong>

                Preferences & goals

              </div>

            </div>

          </div>

        </section>



        <div className="ud-footer">

          <History

            size={12}

            style={{ verticalAlign: "middle", marginRight: 4 }}

          />

          This dashboard summarizes saved platform activity. Tarot and

          palmistry content is provided for cultural reflection and

          self-discovery, not scientifically validated prediction or

          professional advice.

        </div>

      </main>

    </div>

  );

}
