import { useEffect, useMemo, useRef, useState } from "react";



import { Link } from "react-router-dom";



import { ArrowRight, Camera, CheckCircle2, CircleHelp, RefreshCw, Sparkles, Upload, X, Shuffle, Eye, Image as ImageIcon } from "lucide-react";



import api from "../api/client";



function PageHeading({ eyebrow = "YOUR PERSONAL SPACE", title, subtitle }) {







  return <div className="feature-heading"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{subtitle}</p></div>;







}







const LIFE_TRENDS_CSS = `



.life-trends-visuals{display:flex;flex-direction:column;gap:18px}



.life-trends-visuals .trend-summary{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}



.life-trends-visuals .trend-stat{padding:17px 18px;background:linear-gradient(145deg,#fffaf2,#f7ecdc);border:1px solid #e7d2b7;border-radius:14px;box-shadow:0 8px 22px rgba(92,64,43,.06)}



.life-trends-visuals .trend-stat span{display:block;color:#8d735b;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}



.life-trends-visuals .trend-stat strong{display:block;margin-top:7px;color:#4d3424;font-family:'Playfair Display',serif;font-size:28px;line-height:1}



.life-trends-visuals .trend-stat small{display:block;margin-top:7px;color:#927c66;font-size:10px}



.life-trends-visuals .trend-panel{padding:22px;background:#fffaf2;border:1px solid #ead9c2;border-radius:16px;overflow:hidden}



.life-trends-visuals .trend-panel-header{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;margin-bottom:18px}



.life-trends-visuals .trend-panel-header h2{margin:0;color:#4b3024;font-family:'Playfair Display',serif;font-size:21px}



.life-trends-visuals .trend-panel-header p{margin:5px 0 0;color:#8b735d;font-size:12px;line-height:1.55}



.life-trends-visuals .trend-badge{flex:none;padding:7px 10px;border-radius:999px;background:#efe0ca;color:#795438;font-size:10px;font-weight:800;letter-spacing:.06em;text-transform:uppercase}



.life-trends-visuals .daily-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;align-items:end}



.life-trends-visuals .day-column{min-width:0;text-align:center}



.life-trends-visuals .day-visual{height:150px;display:flex;align-items:flex-end;justify-content:center;padding:0 7px 8px;border-bottom:1px solid #e4d2bd;position:relative}



.life-trends-visuals .day-bar{width:min(42px,70%);min-height:6px;border-radius:10px 10px 3px 3px;background:linear-gradient(180deg,#9a6b49,#6f4932);box-shadow:0 5px 12px rgba(92,64,43,.13);transform-origin:bottom;animation:trendBarIn .75s cubic-bezier(.2,.8,.2,1) both;animation-delay:var(--delay)}



.life-trends-visuals .day-value{position:absolute;bottom:calc(var(--bar-height) + 15px);left:0;right:0;color:#6e4b34;font-size:10px;font-weight:800}



.life-trends-visuals .day-name{display:block;margin-top:9px;color:#62442f;font-size:11px;font-weight:800}



.life-trends-visuals .day-meta{display:block;margin-top:3px;color:#9a836e;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}



.life-trends-visuals .trend-line-wrap{position:relative;height:230px;border:1px solid #ead9c2;border-radius:13px;background:linear-gradient(180deg,#fffdf9,#faf1e5);overflow:hidden}



.life-trends-visuals .trend-line-wrap svg{width:100%;height:100%;display:block}



.life-trends-visuals .trend-grid-line{stroke:#eadbca;stroke-width:1}



.life-trends-visuals .trend-area{fill:rgba(154,107,73,.11)}



.life-trends-visuals .trend-line{fill:none;stroke:#704a32;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:900;stroke-dashoffset:900;animation:trendLineIn 1.25s ease forwards}



.life-trends-visuals .trend-point{fill:#fffaf2;stroke:#704a32;stroke-width:3;animation:trendPointIn .45s ease both;animation-delay:var(--delay)}



.life-trends-visuals .trend-label{fill:#8d735b;font-size:10px;font-weight:700}



.life-trends-visuals .trend-value-label{fill:#5c3e2b;font-size:10px;font-weight:800}



.life-trends-visuals .theme-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}



.life-trends-visuals .theme-row{padding:13px 14px;border:1px solid #ead9c2;border-radius:12px;background:#fffdf9}



.life-trends-visuals .theme-row-top{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px}



.life-trends-visuals .theme-name{color:#5c3e2b;font-size:12px;font-weight:800}



.life-trends-visuals .theme-count{color:#947b64;font-size:10px;font-weight:700}



.life-trends-visuals .theme-track{height:8px;background:#f0e3d3;border-radius:999px;overflow:hidden}



.life-trends-visuals .theme-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#9a6b49,#c09570);transform-origin:left;animation:themeFillIn .8s ease both;animation-delay:var(--delay)}



.life-trends-visuals .theme-note{margin:7px 0 0;color:#98816b;font-size:9px}



.life-trends-visuals .month-reading-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}



.life-trends-visuals .reading-signal{padding:13px 14px;border:1px solid #ead9c2;border-radius:12px;background:#fffdf9}



.life-trends-visuals .reading-signal strong{display:block;color:#5c3e2b;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}



.life-trends-visuals .reading-signal span{display:block;margin-top:4px;color:#9a836e;font-size:9px}



.life-trends-visuals .secondary-button{display:inline-flex;align-items:center;gap:7px;border:1px solid #b99773;border-radius:9px;padding:8px 12px;background:#eadbc6;color:#5c402b;font-size:11px;font-weight:700;cursor:pointer}.life-trends-visuals .secondary-button:disabled{opacity:.55;cursor:not-allowed}.life-trends-visuals .empty-trend{padding:28px;text-align:center;border:1px dashed #d9c3aa;border-radius:13px;color:#927c66;background:#fffdf9}



.life-trends-visuals .extra-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}

.life-trends-visuals .mix-chart{display:grid;grid-template-columns:150px 1fr;gap:20px;align-items:center}

.life-trends-visuals .donut{width:140px;height:140px;border-radius:50%;display:grid;place-items:center;position:relative;background:conic-gradient(#805638 0 var(--palm-share),#d9b895 var(--palm-share) 100%)}

.life-trends-visuals .donut:after{content:"";position:absolute;width:88px;height:88px;background:#fffaf2;border-radius:50%}

.life-trends-visuals .donut-center{position:relative;z-index:1;text-align:center;color:#5c3e2b;font-weight:800;font-size:22px}

.life-trends-visuals .donut-center small{display:block;font-size:10px;font-weight:700;color:#947b64}

.life-trends-visuals .legend-list{display:grid;gap:12px}.life-trends-visuals .legend-row{display:flex;justify-content:space-between;gap:12px;color:#62442f;font-size:12px;font-weight:700}.life-trends-visuals .legend-dot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;background:#805638}.life-trends-visuals .legend-dot.tarot{background:#d9b895}

.life-trends-visuals .weekday-bars{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:10px;align-items:end;height:190px}.life-trends-visuals .weekday-item{text-align:center;min-width:0}.life-trends-visuals .weekday-track{height:145px;display:flex;align-items:flex-end;justify-content:center;border-bottom:1px solid #e4d2bd}.life-trends-visuals .weekday-bar{width:min(28px,75%);border-radius:8px 8px 2px 2px;background:linear-gradient(180deg,#c09570,#704a32);min-height:4px}.life-trends-visuals .weekday-item strong{display:block;margin-top:8px;color:#62442f;font-size:11px}.life-trends-visuals .weekday-item small{color:#947b64;font-size:10px}


.life-trends-visuals .insight-chart-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.life-trends-visuals .signal-visual-card{padding:18px;border:1px solid #ead9c2;border-radius:14px;background:linear-gradient(150deg,#fffdf9,#faf0e3);min-width:0}
.life-trends-visuals .signal-visual-card h3{font-family:'Playfair Display',serif;color:#4b3024;font-size:16px;margin:0}
.life-trends-visuals .signal-visual-card p{font-size:11px;line-height:1.55;color:#8b735d;margin:6px 0 14px}
.life-trends-visuals .signal-bars{display:grid;gap:12px}
.life-trends-visuals .signal-bar-top{display:flex;justify-content:space-between;gap:8px;font-size:10px;color:#62442f;font-weight:800;margin-bottom:5px}
.life-trends-visuals .signal-track{height:9px;background:#f0e3d3;border-radius:99px;overflow:hidden}
.life-trends-visuals .signal-fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#9a6b49,#c09570);transform-origin:left;animation:themeFillIn .85s ease both;animation-delay:var(--delay)}
.life-trends-visuals .signal-visual-footer{font-size:9px;color:#98816b;margin-top:12px;line-height:1.5}
.life-trends-visuals .path-wheel{width:148px;height:148px;border-radius:50%;margin:4px auto 14px;display:grid;place-items:center;background:conic-gradient(#805638 0 30%,#c09570 30% 52%,#e4ceb5 52% 76%,#f1e5d5 76% 100%);animation:trendPointIn .8s ease both;position:relative}
.life-trends-visuals .path-wheel:after{content:"";position:absolute;inset:20px;border-radius:50%;background:#fffaf2}
.life-trends-visuals .path-wheel-center{position:relative;z-index:1;text-align:center;font:700 20px 'Playfair Display',serif;color:#5c3e2b}
.life-trends-visuals .path-wheel-center small{display:block;font:700 9px sans-serif;color:#947b64;margin-top:3px}
@media(max-width:760px){.life-trends-visuals .insight-chart-grid{grid-template-columns:1fr}}

@media(max-width:760px){.life-trends-visuals .extra-chart-grid{grid-template-columns:1fr}.life-trends-visuals .mix-chart{grid-template-columns:120px 1fr}.life-trends-visuals .donut{width:115px;height:115px}.life-trends-visuals .donut:after{width:72px;height:72px}}

@keyframes trendBarIn{from{transform:scaleY(0);opacity:.35}to{transform:scaleY(1);opacity:1}}



@keyframes trendLineIn{to{stroke-dashoffset:0}}



@keyframes trendPointIn{from{transform:scale(.2);opacity:0}to{transform:scale(1);opacity:1}}



@keyframes themeFillIn{from{transform:scaleX(0)}to{transform:scaleX(1)}}



@media(max-width:900px){.life-trends-visuals .trend-summary{grid-template-columns:repeat(2,minmax(0,1fr))}.life-trends-visuals .daily-grid{grid-template-columns:repeat(3,minmax(0,1fr));row-gap:20px}.life-trends-visuals .theme-grid,.life-trends-visuals .month-reading-list{grid-template-columns:1fr}}



@media(max-width:560px){.life-trends-visuals .trend-summary{grid-template-columns:1fr 1fr}.life-trends-visuals .daily-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.life-trends-visuals .trend-panel{padding:16px}.life-trends-visuals .trend-panel-header{display:block}.life-trends-visuals .trend-badge{display:inline-block;margin-top:10px}}



@media(prefers-reduced-motion:reduce){.life-trends-visuals *{animation:none!important;transition:none!important}}



`;







function buildLifeTrendModel(readings, fallback) {

  const now = new Date();

  const days = Array.from({ length: 14 }, (_, index) => {

    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (13 - index));

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const dayNumber = date.getDate();

    const ordinal = dayNumber % 100 >= 11 && dayNumber % 100 <= 13

      ? `${dayNumber}th`

      : `${dayNumber}${({ 1: "st", 2: "nd", 3: "rd" }[dayNumber % 10] || "th")}`;

    return {

      date,

      key,

      name: `${ordinal} ${date.toLocaleDateString(undefined, { month: "short" })}`,

      fullName: date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),

      count: 0,

      palm: 0,

      tarot: 0

    };

  });

  const months = Array.from({ length: 6 }, (_, index) => {

    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);

    return { date, key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`, name: date.toLocaleDateString(undefined, { month: "short" }), fullName: date.toLocaleDateString(undefined, { month: "long", year: "numeric" }), count: 0, palm: 0, tarot: 0 };

  });

  const dayMap = new Map(days.map(day => [day.key, day]));

  const monthMap = new Map(months.map(month => [month.key, month]));

  const themeRules = [

    ["Career", ["career", "work", "job", "project", "professional", "success"]],

    ["Relationships", ["relationship", "love", "partner", "connection", "collaboration", "friend"]],

    ["Confidence", ["confidence", "courage", "strength", "self-belief", "self belief", "assurance"]],

    ["Learning", ["learn", "learning", "study", "education", "knowledge", "skill"]],

    ["Wellbeing", ["wellbeing", "well-being", "health", "balance", "rest", "energy", "peace"]],

    ["Change", ["change", "transition", "growth", "new path", "new beginning", "adapt"]]

  ];

  const themeCounts = Object.fromEntries(themeRules.map(([name]) => [name, 0]));

  const usable = Array.isArray(readings) ? readings : [];

  usable.forEach(item => {

    const date = new Date(item.created_at);

    if (Number.isNaN(date.getTime())) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const day = dayMap.get(key);

    if (day) {

      day.count += 1;

      if (item.reading_type === "palm") day.palm += 1;

      if (item.reading_type === "tarot") day.tarot += 1;

    }

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    const month = monthMap.get(monthKey);

    if (month) {

      month.count += 1;

      if (item.reading_type === "palm") month.palm += 1;

      if (item.reading_type === "tarot") month.tarot += 1;

    }

    const text = `${item.title || ""} ${item.input_summary || ""} ${item.result_text || ""}`.toLowerCase();

    themeRules.forEach(([name, words]) => { if (words.some(word => text.includes(word))) themeCounts[name] += 1; });

  });

  if (!usable.length && fallback) {

    days[days.length - 1].count = fallback.total_readings || 0;

    days[days.length - 1].palm = fallback.palm_readings || 0;

    days[days.length - 1].tarot = fallback.tarot_readings || 0;

    months[5].count = fallback.total_readings || 0;

    months[5].palm = fallback.palm_readings || 0;

    months[5].tarot = fallback.tarot_readings || 0;

    (fallback.themes || []).forEach(theme => { if (themeCounts[theme] !== undefined) themeCounts[theme] = 1; });

  }

  const maxDay = Math.max(1, ...days.map(day => day.count));

  const maxMonth = Math.max(1, ...months.map(month => month.count));

  const themes = Object.entries(themeCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const total = days.reduce((sum, day) => sum + day.count, 0);

  const recent = days[days.length - 1].count;

  const previous = days[days.length - 2]?.count || 0;

  const momentum = recent > previous ? "Rising" : recent < previous ? "Cooling" : "Steady";

  const palmTotal = days.reduce((sum, day) => sum + day.palm, 0);

  const tarotTotal = days.reduce((sum, day) => sum + day.tarot, 0);

  const weekdayCounts = Array.from({ length: 7 }, (_, weekday) => ({

    name: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][weekday],

    count: usable.filter(item => { const d = new Date(item.created_at); return !Number.isNaN(d.getTime()) && d.getDay() === weekday; }).length

  }));

  return { days, maxDay, months, maxMonth, themes, total, recent, momentum, palmTotal, tarotTotal, weekdayCounts, latestReadings: usable.slice().sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6) };

}





function LifeTrendLine({months,maxMonth}){



  const width=900,height=230,padX=42,padTop=24,padBottom=36;



  const innerW=width-padX*2,innerH=height-padTop-padBottom;



  const points=months.map((m,i)=>({x:padX+(months.length===1?innerW/2:i*(innerW/(months.length-1))),y:padTop+innerH-(m.count/maxMonth)*innerH,count:m.count}));



  const line=points.map((p,i)=>`${i===0?"M":"L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");



  const area=`${line} L ${points[points.length-1].x} ${height-padBottom} L ${points[0].x} ${height-padBottom} Z`;



  return <div className="trend-line-wrap"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Daily reading activity for the last 14 calendar days"><line x1={padX} y1={padTop} x2={width-padX} y2={padTop} className="trend-grid-line"/><line x1={padX} y1={padTop+innerH/2} x2={width-padX} y2={padTop+innerH/2} className="trend-grid-line"/><line x1={padX} y1={height-padBottom} x2={width-padX} y2={height-padBottom} className="trend-grid-line"/><path d={area} className="trend-area"/><path d={line} className="trend-line"/>{points.map((p,i)=><g key={months[i].key}><circle cx={p.x} cy={p.y} r="5" className="trend-point" style={{"--delay":`${i*90}ms`}}/><text x={p.x} y={p.y-12} textAnchor="middle" className="trend-value-label">{p.count}</text><text x={p.x} y={height-13} textAnchor="middle" className="trend-label">{months[i].name}</text></g>)}</svg></div>;



}











export function LifeTrends(){



  const [data,setData]=useState(null);



  const [readings,setReadings]=useState([]);



  const [error,setError]=useState("");



  const [busy,setBusy]=useState(true);



  const [refreshing,setRefreshing]=useState(false);







  async function load(){



    setError("");



    try{



      const [trendResponse,historyResponse]=await Promise.allSettled([



        api.get("/api/insights/life-trends"),



        api.get("/api/readings/me")



      ]);



      if(trendResponse.status==="fulfilled") setData(trendResponse.value.data);



      if(historyResponse.status==="fulfilled") setReadings(historyResponse.value.data?.items||[]);



      if(trendResponse.status==="rejected" && historyResponse.status==="rejected") throw trendResponse.reason;



    }catch(e){setError(e.response?.data?.detail||"Unable to load your life trends.");}



    finally{setBusy(false);setRefreshing(false);}



  }







  useEffect(()=>{load();},[]);







  const model=useMemo(()=>buildLifeTrendModel(readings,data),[readings,data]);



  const maxTheme=Math.max(1,...model.themes.map(x=>x.count));



  const topThemes=model.themes.filter(x=>x.count>0).slice(0,6);







  return <div className="page-container feature-page">



    <style>{LIFE_TRENDS_CSS}</style>



    <PageHeading eyebrow="PATTERNS & REFLECTION" title="Life trends" subtitle="An animated visual view of how your saved palm and tarot readings have changed over time. This reflects your reading activity, not a prediction of the future."/>



    {busy?<div className="feature-panel">Building your personal trend visuals...</div>:error?<div className="alert">{error}</div>:<div className="life-trends-visuals">



      <div className="trend-summary">



        <article className="trend-stat"><span>Total readings</span><strong>{model.total}</strong><small>Across the last 7 days</small></article>



        <article className="trend-stat"><span>Latest day</span><strong>{model.recent}</strong><small>Saved palm + tarot sessions today</small></article>



        <article className="trend-stat"><span>Activity signal</span><strong>{model.momentum}</strong><small>Compared with the previous day</small></article>



        <article className="trend-stat"><span>Top theme</span><strong>{topThemes[0]?.name||"—"}</strong><small>{topThemes[0]?.count||0} reading signal{topThemes[0]?.count===1?"":"s"}</small></article>



      </div>







      
      <section className="trend-panel">
        <div className="trend-panel-header"><div><h2>Life path analysis</h2><p>A visual map of the recurring areas represented in your saved reading history.</p></div><span className="trend-badge">Reflection map</span></div>
        <div className="insight-chart-grid">
          <article className="signal-visual-card">
            <h3>Life path balance</h3><p>Distribution of themes found in your saved readings, not a fixed life-path score.</p>
            <div className="path-wheel"><div className="path-wheel-center">{model.total}<small>RECENT READINGS</small></div></div>
            <div className="signal-visual-footer">Career, relationships, confidence, learning, wellbeing and change are inferred from reading text.</div>
          </article>
          <article className="signal-visual-card">
            <h3>Opportunity identification</h3><p>Topics with the strongest recurring signals may be useful areas to reflect on or explore.</p>
            {topThemes.length ? <div className="signal-bars">{topThemes.slice(0,5).map((theme,index)=><div key={theme.name}><div className="signal-bar-top"><span>{theme.name}</span><span>{theme.count}</span></div><div className="signal-track"><div className="signal-fill" style={{width:`${Math.max(5,theme.count/maxTheme*100)}%`,"--delay":`${index*100}ms`}}/></div></div>)}</div> : <div className="empty-trend">Save a reading to identify recurring topics.</div>}
            <div className="signal-visual-footer">Repeated themes are prompts for reflection, not guaranteed opportunities.</div>
          </article>
          <article className="signal-visual-card">
            <h3>Challenge forecasting</h3><p>Highlights themes that may deserve more attention based on language in saved readings.</p>
            {(() => { const challengeNames=["Wellbeing","Change","Relationships","Confidence"]; const found=challengeNames.map(name=>({name,count:model.themes.find(t=>t.name===name)?.count||0})).sort((a,b)=>b.count-a.count).slice(0,3); const max=Math.max(1,...found.map(x=>x.count)); return <div className="signal-bars">{found.map((item,index)=><div key={item.name}><div className="signal-bar-top"><span>{item.name}</span><span>{item.count ? "Signal found" : "No clear signal"}</span></div><div className="signal-track"><div className="signal-fill" style={{width:`${item.count?Math.max(7,item.count/max*100):3}%`,"--delay":`${index*120}ms`}}/></div></div>)}</div>; })()}
            <div className="signal-visual-footer">This is a reflection aid based on past reading text, not a prediction of future events.</div>
          </article>
          <article className="signal-visual-card">
            <h3>Growth potential assessment</h3><p>Shows the breadth of different themes appearing in your recent saved readings.</p>
            {(() => { const active=model.themes.filter(t=>t.count>0).length; const pct=Math.round(active/Math.max(1,model.themes.length)*100); return <><div className="path-wheel" style={{background:`conic-gradient(#805638 0 ${pct}%,#e4ceb5 ${pct}% 100%)`}}><div className="path-wheel-center">{pct}%<small>THEME BREADTH</small></div></div><div className="signal-visual-footer">{active} of {model.themes.length} tracked themes have appeared in saved reading text. Broader coverage means more themes to reflect on, not a measured personal ability.</div></>; })()}
          </article>
        </div>
      </section>








      <section className="trend-panel">



        <div className="trend-panel-header"><div><h2>Daily reading activity</h2><p>Daily saved-reading counts for the last 14 consecutive calendar days through today. Days without readings are shown as zero.</p></div></div>



        <LifeTrendLine months={model.days} maxMonth={model.maxDay}/>



      </section>







      <section className="trend-panel">



        <div className="trend-panel-header"><div><h2>Trending themes</h2><p>The themes below are extracted from the language in your saved palm and tarot reading records. They change as your readings change.</p></div><span className="trend-badge">Personalised</span></div>



        {topThemes.length?<div className="theme-grid">{topThemes.map((theme,index)=><article className="theme-row" key={theme.name}><div className="theme-row-top"><span className="theme-name">{theme.name}</span><span className="theme-count">{theme.count} signal{theme.count===1?"":"s"}</span></div><div className="theme-track"><div className="theme-fill" style={{width:`${Math.max(7,Math.round((theme.count/maxTheme)*100))}%`,"--delay":`${index*80}ms`}}/></div><p className="theme-note">Appeared in your saved reading content</p></article>)}</div>:<div className="empty-trend">Complete a palm or tarot reading to begin building your personal theme trend.</div>}



      </section>







      <div className="extra-chart-grid">

        <section className="trend-panel">

          <div className="trend-panel-header"><div><h2>Palm vs Tarot mix</h2><p>Reading types saved during the last 14 calendar days.</p></div><span className="trend-badge">Reading split</span></div>

          {model.total ? <div className="mix-chart"><div className="donut" style={{ "--palm-share": `${(model.palmTotal / Math.max(1, model.palmTotal + model.tarotTotal)) * 100}%` }}><div className="donut-center">{model.total}<small>readings</small></div></div><div className="legend-list"><div className="legend-row"><span><i className="legend-dot"/>Palm readings</span><strong>{model.palmTotal}</strong></div><div className="legend-row"><span><i className="legend-dot tarot"/>Tarot readings</span><strong>{model.tarotTotal}</strong></div></div></div> : <div className="empty-trend">No readings recorded in the last seven days yet.</div>}

        </section>

        
        <section className="trend-panel">
          <div className="trend-panel-header"><div><h2>Trend monitoring</h2><p>Animated visual indicators from your latest 14 days of saved palm and tarot readings.</p></div><span className="trend-badge">Recent signals</span></div>
          <div className="insight-chart-grid">
            <article className="signal-visual-card">
              <h3>Reading momentum</h3><p>Compares the last seven days with the seven days before them.</p>
              {(() => { const recent=model.days.slice(-7).reduce((sum,d)=>sum+d.count,0); const prior=model.days.slice(0,7).reduce((sum,d)=>sum+d.count,0); const max=Math.max(1,recent,prior); const change=prior===0?(recent>0?100:0):Math.round((recent-prior)/prior*100); return <><div className="signal-bars"><div><div className="signal-bar-top"><span>Previous 7 days</span><span>{prior}</span></div><div className="signal-track"><div className="signal-fill" style={{width:`${prior/max*100}%`,"--delay":"0ms"}}/></div></div><div><div className="signal-bar-top"><span>Latest 7 days</span><span>{recent}</span></div><div className="signal-track"><div className="signal-fill" style={{width:`${recent/max*100}%`,"--delay":"120ms"}}/></div></div></div><div className="signal-visual-footer">Activity change: {change>0?"+":""}{change}% compared with the previous seven-day window. This measures saved readings only.</div></>; })()}
            </article>
            <article className="signal-visual-card">
              <h3>Growth focus signals</h3><p>Visual shortlist of areas most frequently represented in recent reading text.</p>
              {topThemes.length ? <div className="signal-bars">{topThemes.slice(0,4).map((theme,index)=><div key={theme.name}><div className="signal-bar-top"><span>{theme.name}</span><span>{Math.round(theme.count/maxTheme*100)}%</span></div><div className="signal-track"><div className="signal-fill" style={{width:`${Math.max(5,theme.count/maxTheme*100)}%`,"--delay":`${index*100}ms`}}/></div></div>)}</div> : <div className="empty-trend">Save readings to begin monitoring recurring focus areas.</div>}
              <div className="signal-visual-footer">Percentages show each theme relative to the most frequent theme in this view, not a success probability.</div>
            </article>
          </div>
        </section>


      </div>



      <section className="trend-panel">



        <div className="trend-panel-header"><div><h2>Latest reading signals</h2><p>Your most recent sessions that contribute to the visual trend profile.</p></div></div>



        {model.latestReadings.length?<div className="month-reading-list">{model.latestReadings.map(item=><article className="reading-signal" key={item.id}><strong>{item.title||`${item.reading_type} reading`}</strong><span>{String(item.reading_type||"").toUpperCase()} · {new Date(item.created_at).toLocaleDateString()}</span></article>)}</div>:<div className="empty-trend">No saved readings yet. Start with a palm or tarot reading and return here to see the visuals update.</div>}



      </section>







      <section className="feature-panel insight-panel"><div className="section-heading compact"><div><h2>Your reflection themes</h2><p className="muted">{data?.message||"These visuals are based on your saved reading activity."}</p></div><button type="button" className="secondary-button" onClick={()=>{setRefreshing(true);load();}} disabled={refreshing}><RefreshCw size={15} className={refreshing?"spin":""}/>{refreshing?"Refreshing...":"Refresh trends"}</button></div>{data?.themes?.length?<div className="chip-row">{data.themes.map(x=><span className="insight-chip" key={x}>{x}</span>)}</div>:<p className="muted">Your themes will appear after your first reading.</p>}</section>



    </div>}



  </div>;



}




