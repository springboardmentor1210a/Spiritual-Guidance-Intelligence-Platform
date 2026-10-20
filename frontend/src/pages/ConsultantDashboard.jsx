import { useEffect, useMemo, useState } from "react";



import {



  Activity,
  Heart,
  MessageCircle,
  MessageSquare,
  ThumbsUp,
  TrendingUp,



  AlertTriangle,



  BarChart3,



  CheckCircle2,
  CalendarDays,
  Clock3,
  LoaderCircle,



  ChevronRight,



  ClipboardCheck,



  FileText,



  HeartHandshake,



  MessageSquareText,



  RefreshCw,



  Search,



  ShieldAlert,



  Sparkles,



  Target,



  UsersRound,



  XCircle,




  Sprout,

  Compass,

  BookOpen,

  Info,
} from "lucide-react";







import api from "../api/client";











const css = `



.consultant-page{max-width:1500px;margin:0 auto;padding:42px 44px 70px;color:#563a2a}



.consultant-page *{box-sizing:border-box}



.consultant-hero{display:flex;justify-content:space-between;gap:24px;align-items:flex-end;margin-bottom:24px}



.consultant-eyebrow{font-size:11px;font-weight:900;letter-spacing:.16em;color:#977052;text-transform:uppercase;margin:0 0 8px}



.consultant-title{font-family:Georgia,'Times New Roman',serif;font-size:46px;line-height:1.05;margin:0;color:#4a2d20}



.consultant-subtitle{max-width:820px;font-size:16px;line-height:1.65;color:#88654d;margin:13px 0 0}



.consultant-actions{display:flex;gap:10px;flex-wrap:wrap}



.consultant-btn{border:1px solid #d9c3a5;background:#fffaf2;color:#684932;border-radius:10px;padding:11px 15px;font-weight:800;font-size:12px;display:inline-flex;gap:8px;align-items:center;cursor:pointer}



.consultant-btn.primary{background:#71492f;color:#fff;border-color:#71492f}



.consultant-btn.danger{background:#fff0ec;color:#9a493e;border-color:#e6bdb5}



.consultant-btn:disabled{opacity:.5;cursor:not-allowed}



.consultant-banner{padding:13px 16px;border-radius:11px;border:1px solid #e3cfb5;background:#fbf4e9;color:#78583f;font-size:12px;line-height:1.6;margin-bottom:20px}



.consultant-banner.warning{background:#fff4ef;border-color:#e8c1b8;color:#8f4b40}



.consultant-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin-bottom:18px}



.consultant-card{background:#fffaf3;border:1px solid #e4d1b8;border-radius:16px;box-shadow:0 7px 24px rgba(77,51,34,.055)}



.metric-card{padding:18px;min-height:130px}



.metric-top{display:flex;align-items:center;justify-content:space-between;color:#927057;font-size:10px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}



.metric-icon{width:38px;height:38px;border-radius:11px;background:#efe1cd;display:grid;place-items:center;color:#765137}



.metric-value{font-family:Georgia,serif;font-size:31px;font-weight:700;color:#4d2f22;margin-top:13px}



.metric-note{font-size:11px;color:#9a7558;margin-top:5px;line-height:1.4}




.consultant-score-card{padding:17px 20px}
.insight-visual-layout{display:grid;grid-template-columns:145px minmax(0,1fr);gap:22px;align-items:center}
.insight-score-summary{display:flex;flex-direction:column;align-items:center;gap:9px;padding:5px 17px 5px 0;border-right:1px solid #eadac6}
.insight-score-ring{width:112px;height:112px;border-radius:50%;display:grid;place-items:center;position:relative;background:conic-gradient(#9a704d var(--ring-angle),#eadcc9 0);animation:insightRingReveal .9s ease-out both;box-shadow:0 8px 20px rgba(77,51,34,.08)}
.insight-score-ring:before{content:"";position:absolute;inset:8px;border-radius:50%;background:#fffaf3;border:1px solid #eadac6}
.insight-score-ring-inner{position:relative;z-index:1;text-align:center}
.insight-score-number{font-family:Georgia,serif;font-size:27px;line-height:1.05;font-weight:700;color:#4d2f22}
.insight-score-outof{font-size:9px;color:#977052;font-weight:800;margin-top:4px}
.insight-score-caption{font-size:10px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:#977052;text-align:center}
.insight-score-note{font-size:10px;line-height:1.45;color:#9a7558;text-align:center;max-width:150px}
.insight-score-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:20px}
.insight-score-row{margin:8px 0}
.insight-score-track{height:7px;background:#eadcc9}
.insight-score-fill{width:var(--bar-value);background:linear-gradient(90deg,#8c6040,#c39a70);animation:insightBarReveal .9s cubic-bezier(.2,.7,.2,1) both}
@keyframes insightBarReveal{from{width:0}to{width:var(--bar-value)}}
@keyframes insightRingReveal{from{opacity:.4;transform:scale(.86) rotate(-25deg)}to{opacity:1;transform:scale(1) rotate(0)}}
.daily-activity-chart{width:100%;min-width:0;overflow:hidden}
.daily-activity-svg{display:block;width:100%;height:auto;min-height:220px;overflow:visible}
.daily-activity-gridline{stroke:#eadac6;stroke-width:1;stroke-dasharray:4 5}
.daily-activity-area{fill:url(#dailyActivityFill);opacity:.7}
.daily-activity-line{fill:none;stroke:#805638;stroke-width:3.5;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1200;stroke-dashoffset:1200;animation:dailyLineDraw 1.6s cubic-bezier(.2,.7,.2,1) forwards}
.daily-activity-point{fill:#fffaf3;stroke:#805638;stroke-width:2.5;transform-box:fill-box;transform-origin:center;animation:dailyPointPop .45s ease-out both}
.daily-activity-point.today{fill:#805638;stroke:#fffaf3;stroke-width:3}
.daily-activity-label{font-size:10px;fill:#96745a;font-weight:700}
.daily-activity-count{font-size:10px;fill:#684932;font-weight:900}
.daily-activity-legend{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-top:10px;font-size:10px;color:#98745b}
.daily-activity-key{display:inline-flex;align-items:center;gap:7px}
.daily-activity-dot{width:8px;height:8px;border-radius:50%;background:#805638;display:inline-block}
@keyframes dailyLineDraw{to{stroke-dashoffset:0}}
@keyframes dailyPointPop{from{opacity:0;transform:scale(.2)}to{opacity:1;transform:scale(1)}}
@media(max-width:900px){.insight-visual-layout{grid-template-columns:1fr}.insight-score-summary{border-right:0;border-bottom:1px solid #eadac6;padding:0 0 15px}.insight-score-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.insight-score-ring,.insight-score-fill,.daily-activity-line,.daily-activity-point{animation:none;stroke-dashoffset:0}}
@media(max-width:900px){.insight-visual-layout{grid-template-columns:1fr}.insight-score-summary{border-right:0;border-bottom:1px solid #eadac6;padding:0 0 15px}.insight-score-grid{grid-template-columns:1fr}.daily-activity-svg{min-height:190px}}
@media(prefers-reduced-motion:reduce){.insight-score-ring,.insight-score-fill,.daily-activity-line,.daily-activity-point{animation:none;stroke-dashoffset:0}}




.score-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px}



.score-head h3{font-family:Georgia,serif;font-size:18px;margin:0;color:#4b2f22}



.score-big{font-family:Georgia,serif;font-size:31px;color:#6d452c;font-weight:700}



.score-row{margin:11px 0}



.score-label{display:flex;justify-content:space-between;font-size:11px;font-weight:800;color:#76563f;margin-bottom:6px}



.score-track{height:8px;background:#eadcc9;border-radius:99px;overflow:hidden}



.score-fill{height:100%;background:#9a704d;border-radius:99px}



.score-weight{font-size:9px;color:#a4876d;font-weight:700}



.consultant-grid-2{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(320px,.9fr);gap:18px;margin-bottom:18px}



.panel-head{padding:20px 20px 15px;border-bottom:1px solid #eadac6;display:flex;justify-content:space-between;gap:15px;align-items:flex-start}



.panel-head h2{font-family:Georgia,serif;font-size:23px;margin:0;color:#4d3023}



.panel-head p{font-size:11px;color:#98735a;margin:5px 0 0;line-height:1.5}



.panel-body{padding:18px 20px}



.activity-chart{display:grid;grid-template-columns:repeat(6,1fr);gap:13px;height:220px;align-items:end}



.activity-col{height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:7px}



.activity-value{font-size:10px;font-weight:900;color:#7b583d}



.activity-bar-wrap{width:100%;height:160px;display:flex;align-items:flex-end;justify-content:center}



.activity-bar{width:70%;max-width:55px;min-height:4px;background:#a67a54;border-radius:8px 8px 2px 2px}



.activity-label{font-size:10px;color:#96745a;font-weight:800}



.mix-row{display:grid;grid-template-columns:70px 1fr 45px;gap:10px;align-items:center;margin:18px 0}



.mix-label{font-size:11px;font-weight:900;color:#755238}



.mix-track{height:9px;background:#eadcc9;border-radius:99px;overflow:hidden}



.mix-fill{height:100%;background:#a77b55;border-radius:99px}



.mix-value{text-align:right;font-family:Georgia,serif;font-size:19px;color:#543527}



.theme-list{display:grid;gap:12px}



.theme-row{display:grid;grid-template-columns:110px 1fr 45px;gap:10px;align-items:center}



.theme-name{font-size:11px;font-weight:800;text-transform:capitalize}



.theme-count{font-size:11px;text-align:right;font-weight:900}



.consultant-tabs{display:flex;gap:4px;border-bottom:1px solid #dcc8ae;margin:22px 0 18px;overflow:auto}



.consultant-tab{border:0;background:transparent;padding:12px 15px;color:#927057;font-size:12px;font-weight:900;white-space:nowrap;cursor:pointer;border-bottom:2px solid transparent}



.consultant-tab.active{color:#5e3a26;border-bottom-color:#70472e}



.filters{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:15px}



.filter-control{border:1px solid #ddc9ae;background:#fffaf2;border-radius:9px;padding:10px 11px;color:#684932;font-size:11px;min-width:130px}



.filter-search{position:relative;flex:1;min-width:220px}



.filter-search input{width:100%;border:1px solid #ddc9ae;background:#fffaf2;border-radius:9px;padding:10px 11px 10px 35px;color:#684932;font-size:11px}



.filter-search svg{position:absolute;left:11px;top:10px;color:#9b775b}



.table-wrap{overflow:auto}



.consultant-table{width:100%;border-collapse:collapse;min-width:850px}



.consultant-table th{text-align:left;padding:11px 12px;background:#f8f0e5;color:#977258;font-size:10px;letter-spacing:.08em;text-transform:uppercase}



.consultant-table td{padding:13px 12px;border-bottom:1px solid #eee1d1;font-size:11px;vertical-align:top}



.client-name{font-weight:900;color:#563526}



.client-sub{font-size:10px;color:#a08169;margin-top:3px}



.type-pill,.status-pill,.flag-pill{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:5px 8px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.05em}



.type-pill.palm{background:#eee2d2;color:#745035}



.type-pill.tarot{background:#e7dccd;color:#63432e}



.status-pill.pending{background:#f5eadb;color:#8a6547}



.status-pill.approved{background:#e7f1e5;color:#42643e}



.status-pill.flagged{background:#fde9e4;color:#914a40}



.flag-pill{background:#fff0eb;color:#964b41}



.score-mini{font-family:Georgia,serif;font-size:16px;font-weight:700;color:#69432c}



.action-links{display:flex;gap:6px;flex-wrap:wrap}



.icon-btn{border:1px solid #ddc8ad;background:#fffaf2;color:#765238;border-radius:7px;padding:7px 8px;cursor:pointer}



.icon-btn:hover{background:#f1e4d2}



.review-layout{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(360px,.9fr);gap:16px}



.review-item{padding:15px;border-bottom:1px solid #eadbc8;cursor:pointer}



.review-item.selected{background:#f8efe2}



.review-item:last-child{border-bottom:0}



.review-item-top{display:flex;justify-content:space-between;gap:10px}



.review-title{font-weight:900;color:#573729;font-size:12px}



.review-preview{font-size:11px;color:#86634c;line-height:1.55;margin-top:7px}



.review-editor{padding:20px}



.review-editor h3{font-family:Georgia,serif;font-size:21px;margin:0 0 5px}



.review-editor .muted{font-size:11px;color:#957258}



.review-textarea{width:100%;min-height:330px;border:1px solid #ddc8ad;background:#fffdf8;border-radius:10px;padding:13px;color:#594031;line-height:1.65;font-size:12px;resize:vertical;margin-top:12px}



.review-buttons{display:flex;gap:8px;flex-wrap:wrap;margin-top:11px}



.flag-reasons{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}



.detail-card{padding:20px}



.detail-title{font-family:Georgia,serif;font-size:27px;color:#4d3023;margin:0}



.detail-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}



.detail-stat{background:#f8f0e5;border:1px solid #eadac5;border-radius:10px;padding:12px}



.detail-stat strong{font-family:Georgia,serif;font-size:20px;display:block}



.detail-stat span{font-size:9px;color:#98745b;text-transform:uppercase;font-weight:900}



.helpful-card{display:grid;grid-template-columns:1fr auto;gap:15px;align-items:center}

.outcome-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:16px 0}

.outcome-stat{background:#f8f0e5;border:1px solid #eadac5;border-radius:10px;padding:13px}

.outcome-stat-label{font-size:9px;color:#98745b;text-transform:uppercase;font-weight:900;letter-spacing:.05em}

.outcome-stat-value{font-family:Georgia,serif;font-size:24px;font-weight:700;color:#563526;margin-top:6px}

.outcome-stat-note{font-size:9px;color:#a0826b;margin-top:4px;line-height:1.4}

.outcome-section{margin-top:15px;padding:14px 16px;border:1px solid #e3cfb5;border-radius:11px;background:#fbf4e9}

.outcome-section-title{font-size:11px;font-weight:900;color:#684932;text-transform:uppercase;letter-spacing:.07em;margin-bottom:9px}

.outcome-progress-row{display:grid;grid-template-columns:145px 1fr 48px;gap:10px;align-items:center;margin:10px 0}

.outcome-progress-label{font-size:10px;font-weight:800;color:#76563f}

.outcome-progress-track{height:8px;background:#eadcc9;border-radius:99px;overflow:hidden}

.outcome-progress-fill{height:100%;background:#9a704d;border-radius:99px}

.outcome-empty{padding:12px 14px;border-radius:9px;background:#fffaf2;border:1px dashed #d9c3a5;color:#8a674e;font-size:11px;line-height:1.55}

.outcome-note{font-size:10px;color:#957258;line-height:1.55;margin:8px 0 0}


.consultation-request-list{display:grid;gap:13px;padding:18px 20px}
.consultation-request-card{border:1px solid #e4d1b8;background:#fffdf8;border-radius:13px;padding:17px}
.consultation-request-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.consultation-request-card h3{font-family:Georgia,serif;font-size:21px;color:#4d3023;margin:4px 0 8px}
.consultation-request-meta{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:11px;color:#8d6a51;margin:9px 0}
.consultation-request-message{font-size:12px;line-height:1.65;color:#75543d;margin:10px 0}
.consultation-response{display:grid;gap:6px;margin-top:12px;font-size:10px;font-weight:900;color:#87664d}
.consultation-response textarea{width:100%;min-height:76px;resize:vertical;border:1px solid #ddc8ad;background:#fffdf8;border-radius:9px;padding:10px;color:#594031;font:12px/1.5 inherit}
.consultation-request-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
.consultation-status{display:inline-flex;border-radius:999px;padding:5px 9px;font-size:9px;font-weight:900;text-transform:uppercase;letter-spacing:.04em;background:#f5eadb;color:#8a6547}
.consultation-status.accepted,.consultation-status.completed{background:#e7f1e5;color:#42643e}
.consultation-status.rejected{background:#fde9e4;color:#914a40}
.consultation-meet-link{display:inline-flex;align-items:center;gap:7px;margin-top:10px;padding:9px 12px;border-radius:8px;background:#e7f1e5;color:#42643e;font-size:11px;font-weight:900;text-decoration:none}
.consultation-request-error{margin:14px 20px;padding:12px;border-radius:9px;background:#fff0ed;border:1px solid #e7c0b7;color:#954b40;font-size:12px}
.consultation-request-count{display:inline-grid;place-items:center;min-width:20px;height:20px;margin-left:5px;padding:0 5px;border-radius:99px;background:#8b5c3b;color:white;font-size:10px}

@media(max-width:1100px){.outcome-grid{grid-template-columns:repeat(2,1fr)}}

@media(max-width:720px){.outcome-grid{grid-template-columns:repeat(2,1fr)}.outcome-progress-row{grid-template-columns:1fr}.outcome-progress-row .outcome-progress-label{margin-bottom:-4px}}





.helpful-number{font-family:Georgia,serif;font-size:28px;color:#5b3927}



.outcome-visual-card{min-width:0}

.guidance-insights-page{display:grid;gap:18px;animation:guidanceRise .55s ease both;color:#593923}
.guidance-hero-card{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:24px;min-height:190px;padding:28px 32px;background:radial-gradient(circle at 82% 45%,#f0ddc7 0,transparent 31%),linear-gradient(115deg,#fffaf4,#f7ead9)}
.guidance-hero-copy{position:relative;z-index:2;max-width:690px}.guidance-kicker{display:inline-flex;align-items:center;gap:7px;color:#956a47;font-size:10px;font-weight:850;letter-spacing:1.4px}.guidance-hero-copy h2{font-family:Georgia,serif;font-size:clamp(23px,2.5vw,34px);line-height:1.14;margin:10px 0;color:#593923}.guidance-hero-copy p{max-width:650px;color:#8c6b52;font-size:13px;line-height:1.65;margin:0 0 18px}.guidance-mode-switch{display:flex;flex-wrap:wrap;gap:7px}.guidance-mode-switch button,.guidance-signal-tabs button{display:inline-flex;align-items:center;gap:7px;border:1px solid #e7d1b8;border-radius:999px;padding:9px 13px;background:#fffaf4;color:#8a6446;font-size:12px;font-weight:750;cursor:pointer;transition:all .22s ease}.guidance-mode-switch button:hover,.guidance-mode-switch button.active,.guidance-signal-tabs button.active{background:#805638;color:#fff8ef;border-color:#805638;transform:translateY(-1px);box-shadow:0 5px 14px #80563820}
.guidance-hero-orbit{width:180px;height:150px;flex:0 0 180px;position:relative;display:grid;place-items:center}.guidance-orbit{position:absolute;border:1px solid #c6a17f80;border-radius:50%;transform:rotate(-25deg);animation:guidanceOrbit 14s linear infinite}.orbit-one{width:150px;height:75px}.orbit-two{width:135px;height:115px;transform:rotate(52deg);animation-direction:reverse}.guidance-orbit-core{width:76px;height:76px;border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;background:linear-gradient(145deg,#9e704c,#69472f);color:#fff2e2;box-shadow:0 0 0 9px #b98d6530,0 12px 28px #80563830;animation:guidancePulse 3.2s ease-in-out infinite}.guidance-orbit-core span{font-size:8px;font-weight:850;letter-spacing:1.3px}.orbit-star{position:absolute;color:#a47a56;font-style:normal;animation:guidanceTwinkle 2.5s ease-in-out infinite}.star-one{top:12px;right:27px}.star-two{bottom:16px;left:22px;font-size:21px;animation-delay:.7s}.star-three{top:45px;left:4px;font-size:12px;animation-delay:1.2s}
.guidance-signal-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(310px,.8fr);gap:18px;align-items:stretch}.guidance-constellation-card,.guidance-active-insight,.guidance-bottom-card{min-width:0}.guidance-radar-layout{display:grid;grid-template-columns:minmax(180px,.9fr) minmax(190px,1.1fr);gap:14px;align-items:center}.guidance-radar-wrap{display:grid;place-items:center;min-height:245px;border-radius:17px;background:radial-gradient(circle,#fffaf4 0,#f8ecde 72%)}.guidance-radar{width:100%;max-width:270px;overflow:visible}.guidance-radar-grid{fill:#ead8c5;fill-opacity:.3;stroke:#d9bea2;stroke-width:1}.guidance-radar-axis{stroke:#d7bea4;stroke-width:1;stroke-dasharray:3 4}.guidance-radar-area{fill:#b98b634c;stroke:#956a47;stroke-width:2.5;stroke-linejoin:round;transform-origin:112px 104px;animation:guidanceRadarDraw .9s cubic-bezier(.2,.8,.2,1) both}.guidance-radar-node circle{fill:#805638;stroke:#fff6eb;stroke-width:2;animation:guidanceNodeIn .55s ease both;transition:r .2s ease}.guidance-radar-node:hover circle{r:8}.guidance-radar-label{font-size:8px;font-weight:800;letter-spacing:.5px;fill:#896548}.guidance-radar-legend{display:grid;gap:8px}.guidance-signal-legend{display:flex;align-items:center;gap:10px;width:100%;padding:11px;border:1px solid transparent;border-radius:12px;background:#fffaf5;color:#67452d;text-align:left;cursor:pointer;transition:all .2s ease}.guidance-signal-legend:hover,.guidance-signal-legend.selected{border-color:#cba984;background:#f8ead9;transform:translateX(3px)}.guidance-legend-dot{width:10px;height:10px;border-radius:50%;flex:0 0 auto;background:#9b6d48}.dot-1{background:#bd936a}.dot-2{background:#795239}.guidance-signal-legend span:nth-child(2){display:flex;flex:1;align-items:center;justify-content:space-between;gap:10px}.guidance-signal-legend small{font-size:11px;color:#8b6a50}.guidance-signal-legend strong{font-size:13px}.guidance-radar-footnote{font-size:10px;line-height:1.5;color:#9a7b61;padding:7px 2px}.guidance-signal-tabs{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px}.guidance-active-score{display:flex;align-items:center;justify-content:space-between;padding:17px;border-radius:15px;background:linear-gradient(120deg,#f7eadb,#fffaf4);border:1px solid #ead6c0}.guidance-big-score{font:700 38px Georgia,serif;color:#68442b;margin-top:4px}.guidance-big-score small{font:600 17px Georgia,serif}.guidance-score-ring{width:76px;height:76px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#956a47 var(--score),#e8d7c4 0);position:relative}.guidance-score-ring:before{content:"";position:absolute;inset:7px;border-radius:50%;background:#fff8ef}.guidance-score-ring span{z-index:1;font-size:10px;font-weight:850;color:#805638}.guidance-insight-message{display:flex;gap:12px;padding:19px 0;border-bottom:1px solid #ead8c3}.guidance-insight-icon,.guidance-toolkit-icon{width:38px;height:38px;display:grid;place-items:center;flex:0 0 auto;border-radius:12px;background:#f0dfcd;color:#805638}.guidance-insight-message strong{font-size:13px}.guidance-insight-message p,.guidance-practice-box p{margin:5px 0 0;color:#89694f;font-size:12px;line-height:1.65}.guidance-practice-box{padding:16px;margin-top:14px;border-radius:14px;background:#f9efe3;border:1px solid #ead6c0}.guidance-practice-box>span{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:850;letter-spacing:.8px;color:#946a47}.guidance-practice-box .consultant-btn{margin-top:13px}.guidance-focus-view{display:grid;grid-template-columns:minmax(150px,.7fr) minmax(0,1.3fr);gap:22px}.guidance-focus-score{padding:20px;border-radius:16px;background:#f7eadb}.guidance-focus-score>span{font-size:12px;color:#8b674c;font-weight:700}.guidance-focus-score>strong{display:block;font:700 35px Georgia,serif;margin:10px 0;color:#67432b}.guidance-focus-score>strong small{font-size:16px}.guidance-focus-track{height:8px;border-radius:20px;background:#e6d4bf;overflow:hidden}.guidance-focus-track span{display:block;height:100%;border-radius:20px;background:linear-gradient(90deg,#805638,#c39a72);animation:guidanceFill .9s ease both}.guidance-focus-explanation p{font-size:12px;line-height:1.65;color:#89694f;margin:6px 0 16px}.guidance-practice-list{display:grid;gap:9px}.guidance-practice-item{display:flex;align-items:center;gap:12px;padding:15px;border:1px solid #ead6c0;border-radius:14px;background:#fffaf4;color:#63432c;text-align:left;cursor:pointer;transition:all .2s ease}.guidance-practice-item:hover,.guidance-practice-item.selected{border-color:#c49a72;background:#f8ecde;transform:translateY(-2px);box-shadow:0 8px 20px #80563812}.guidance-practice-number{width:36px;height:36px;display:grid;place-items:center;flex:0 0 auto;border-radius:11px;background:#efdfcc;color:#805638;font-weight:850}.guidance-practice-item>span:nth-child(2){flex:1}.guidance-practice-item strong{display:block;font-size:12px}.guidance-practice-item small{display:block;margin-top:5px;font-size:11px;line-height:1.5;color:#8c6b52}.guidance-toolkit-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.guidance-toolkit-item{padding:19px;border:1px solid #ead6c0;border-radius:16px;background:linear-gradient(150deg,#fffaf4,#f8ecde);animation:guidanceRise .5s ease both;transition:transform .2s ease,box-shadow .2s ease}.guidance-toolkit-item:hover{transform:translateY(-4px);box-shadow:0 10px 22px #80563814}.guidance-toolkit-icon{margin-bottom:14px}.guidance-toolkit-index{display:block;color:#a17a58;font-size:9px;font-weight:850;letter-spacing:1px}.guidance-toolkit-item h3{font:700 16px Georgia,serif;color:#5e3e27;margin:7px 0}.guidance-toolkit-item p{font-size:12px;line-height:1.65;color:#8c6b52;margin:0}.guidance-data-note{display:flex;align-items:flex-start;gap:8px;padding:12px 16px;border-top:1px solid #ead8c3;color:#96775d;font-size:10px;line-height:1.6}.guidance-data-note svg{flex:0 0 auto;margin-top:1px}
.guidance-todo-card{overflow:hidden}.guidance-todo-count{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:72px;padding:10px 14px;border-radius:14px;background:#f4e4d2;color:#805638}.guidance-todo-count strong{font:700 25px Georgia,serif}.guidance-todo-count span{font-size:10px;color:#987556}.guidance-todo-progress{height:7px;background:#ead8c3;border-radius:99px;overflow:hidden;margin-bottom:17px}.guidance-todo-progress span{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#805638,#c59a72);transition:width .35s ease}.guidance-todo-add{display:flex;gap:9px;margin-bottom:12px}.guidance-todo-add input{flex:1;min-width:0;border:1px solid #e6d1b9;border-radius:12px;background:#fffaf4;color:#5b3b26;padding:11px 13px;font:inherit;font-size:12px;outline:none}.guidance-todo-add input:focus{border-color:#a77a53;box-shadow:0 0 0 3px #b98b6320}.guidance-todo-list{display:grid;gap:8px}.guidance-todo-row{display:flex;align-items:center;gap:10px;padding:11px 12px;border:1px solid #ead8c4;border-radius:12px;background:#fffaf5;transition:background .2s,border-color .2s}.guidance-todo-row:hover{border-color:#cba984;background:#fcf3e9}.guidance-todo-row label{display:flex;align-items:center;gap:10px;flex:1;min-width:0;cursor:pointer}.guidance-todo-row label input{position:absolute;opacity:0;width:1px;height:1px}.guidance-todo-checkmark{display:grid;place-items:center;width:21px;height:21px;flex:0 0 auto;border:1.5px solid #c6a17f;border-radius:7px;color:#fffaf4;font-size:13px;font-weight:900}.guidance-todo-row.is-done .guidance-todo-checkmark{background:#805638;border-color:#805638}.guidance-todo-text{font-size:12px;line-height:1.5;color:#67462f}.guidance-todo-row.is-done .guidance-todo-text{text-decoration:line-through;color:#a58b74}.guidance-todo-remove{border:0;background:transparent;color:#a18164;font-size:22px;line-height:1;cursor:pointer;border-radius:7px;width:28px;height:28px}.guidance-todo-remove:hover{background:#f1dfcd;color:#6e482d}.guidance-todo-footer{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;padding-top:12px;border-top:1px solid #ead8c4;color:#9a7a60;font-size:10px}.guidance-todo-footer button{border:0;background:transparent;color:#805638;font:inherit;font-weight:800;cursor:pointer}.guidance-todo-footer button:disabled{opacity:.4;cursor:not-allowed}.guidance-todo-empty{font-size:12px;color:#98775c;padding:8px 0}@media(max-width:520px){.guidance-todo-add{flex-direction:column}.guidance-todo-footer{align-items:flex-start;flex-direction:column}}
@keyframes guidanceRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes guidanceOrbit{to{transform:rotate(335deg)}}@keyframes guidancePulse{0%,100%{box-shadow:0 0 0 7px #b98d6520,0 12px 28px #80563825}50%{box-shadow:0 0 0 13px #b98d6530,0 12px 32px #80563835}}@keyframes guidanceTwinkle{0%,100%{opacity:.45;transform:scale(.85)}50%{opacity:1;transform:scale(1.2)}}@keyframes guidanceRadarDraw{from{opacity:.1;transform:scale(.2)}to{opacity:1;transform:scale(1)}}@keyframes guidanceNodeIn{from{opacity:0;transform:scale(.3)}to{opacity:1;transform:scale(1)}}@keyframes guidanceFill{from{width:0}}
@media(max-width:900px){.guidance-signal-grid{grid-template-columns:1fr}.guidance-hero-orbit{width:125px;flex-basis:125px;transform:scale(.85)}}@media(max-width:620px){.guidance-hero-card{padding:22px;align-items:flex-start}.guidance-hero-orbit{display:none}.guidance-radar-layout{grid-template-columns:1fr}.guidance-radar-wrap{min-height:205px}.guidance-focus-view{grid-template-columns:1fr}.guidance-toolkit-grid{grid-template-columns:1fr}.guidance-hero-copy h2{font-size:25px}}@media(prefers-reduced-motion:reduce){.guidance-insights-page,.guidance-radar-area,.guidance-radar-node circle,.guidance-toolkit-item,.guidance-orbit,.guidance-orbit-core,.orbit-star{animation:none!important;transition:none!important}}

.outcome-chart-title{font-size:11px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:#8d684c;margin:2px 0 14px}
.outcome-chart-bars{display:grid;gap:15px}
.outcome-chart-row{display:grid;gap:7px}
.outcome-chart-meta,.outcome-activity-top{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:11px;color:#79573e}
.outcome-chart-meta strong,.outcome-activity-top strong{font-variant-numeric:tabular-nums;color:#4d2f22}
.outcome-chart-track{height:9px;overflow:hidden;border-radius:999px;background:#eadcc9}
.outcome-chart-fill{height:100%;width:var(--outcome-width);border-radius:inherit;background:linear-gradient(90deg,#8c6040,#c39a70);animation:outcomeBarRise .9s cubic-bezier(.2,.7,.2,1) both}
.outcome-activity-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 20px}
.outcome-activity-item{min-width:0;display:grid;gap:8px;padding:12px;border:1px solid #eadac6;border-radius:12px;background:#fffdf9}
@keyframes outcomeBarRise{from{width:0}to{width:var(--outcome-width)}}
@media(max-width:720px){.outcome-activity-grid{grid-template-columns:1fr}}
@media(prefers-reduced-motion:reduce){.outcome-chart-fill{animation:none}}

.consultant-portfolio-total{display:flex;align-items:baseline;gap:10px;margin:4px 0 18px;color:#98745b;font-size:11px}
.consultant-portfolio-total strong{font:700 35px Georgia,serif;color:#563526}
.consultant-portfolio-stack{display:flex;overflow:hidden;height:15px;border-radius:99px;background:#eadcc9}
.consultant-portfolio-stack span{height:100%;transition:width .7s ease}
.consultant-portfolio-stack span:first-child{background:#8c6040}
.consultant-portfolio-stack span:nth-child(2){background:#c39a70}
.consultant-portfolio-legend{display:grid;gap:12px;margin:19px 0}
.consultant-portfolio-legend>div{display:grid;grid-template-columns:10px 1fr auto 42px;gap:9px;align-items:center;font-size:11px;color:#79573e}
.consultant-portfolio-legend strong{font:700 17px Georgia,serif;color:#563526}
.consultant-portfolio-legend small{text-align:right;color:#98745b}
.consultant-legend-dot{width:9px;height:9px;border-radius:50%}.palm-dot{background:#8c6040}.tarot-dot{background:#c39a70}
.consultant-analytics-bars{display:grid;gap:18px;padding:5px 0 10px}
.consultant-analytics-bar-meta{display:flex;justify-content:space-between;gap:12px;margin-bottom:7px;font-size:11px;color:#79573e}
.consultant-analytics-bar-meta strong{color:#563526;font-variant-numeric:tabular-nums}
.consultant-analytics-track{height:10px;border-radius:99px;background:#eadcc9;overflow:hidden}
.consultant-analytics-track span{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#8c6040,#c39a70);transition:width .7s ease}
.consultant-score-chart{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:12px;align-items:end;min-height:220px;padding:8px 0 0}
.consultant-score-chart-item{display:grid;grid-template-rows:18px 150px 34px;gap:7px;min-width:0;text-align:center}
.consultant-score-chart-value{font-size:10px;font-weight:900;color:#765238}
.consultant-score-chart-track{display:flex;align-items:flex-end;justify-content:center;height:150px;border-bottom:1px solid #dcc8ae;background:repeating-linear-gradient(to top,transparent 0,transparent 36px,#eadac6 37px,#eadac6 38px)}
.consultant-score-chart-track span{display:block;width:min(70%,34px);min-height:2px;border-radius:7px 7px 0 0;background:linear-gradient(180deg,#c39a70,#805638);animation:outcomeBarRise .8s ease both}
.consultant-score-chart-label{font-size:9px;line-height:1.35;color:#98745b;overflow-wrap:anywhere}
@media(max-width:700px){.consultant-score-chart{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:20px}.consultant-score-chart-item{grid-template-rows:18px 120px 34px}.consultant-score-chart-track{height:120px}}

.empty-state{padding:45px 20px;text-align:center;color:#98745b;font-size:12px}



.loading-state{padding:35px;text-align:center;color:#98745b}



.error-state{padding:15px;background:#fff0ed;border:1px solid #e7c0b7;color:#954b40;border-radius:10px;font-size:12px}



.small-note{font-size:10px;color:#a0826b;line-height:1.5}



@media(max-width:1100px){



  .consultant-metrics{grid-template-columns:repeat(3,1fr)}



  .consultant-grid-2{grid-template-columns:1fr}



}



@media(max-width:720px){



  .consultant-page{padding:28px 16px 55px}



  .consultant-hero{display:block}



  .consultant-actions{margin-top:15px}



  .consultant-title{font-size:34px}



  .consultant-metrics{grid-template-columns:repeat(2,1fr)}



  .detail-grid{grid-template-columns:repeat(2,1fr)}



}



`;







function toDisplayPercent(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || value === null || value === undefined || value === "") return 0;
  return Math.max(0, Math.min(100, number >= 0 && number <= 1 ? number * 100 : number));
}

function ScoreBar({ label, value, weight }) {
  const percent = toDisplayPercent(value);
  return (
    <div className="score-row insight-score-row">
      <div className="score-label">
        <span>{label}</span>
        <span>{percent.toFixed(1)}%{weight ? <span className="score-weight"> · {weight}%</span> : null}</span>
      </div>
      <div className="score-track insight-score-track">
        <div className="score-fill insight-score-fill" style={{ "--bar-value": `${percent}%` }} />
      </div>
    </div>
  );
}







function Metric({ icon: Icon, label, value, note }) {



  return (



    <div className="consultant-card metric-card">



      <div className="metric-top">



        <span>{label}</span>



        <span className="metric-icon"><Icon size={18} /></span>



      </div>



      <div className="metric-value">{value}</div>



      <div className="metric-note">{note}</div>



    </div>



  );



}







function formatDate(value) {



  if (!value) return "—";



  const date = new Date(value);



  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();



}







function shortText(value, length = 180) {



  const text = String(value || "").replace(/\s+/g, " ").trim();



  return text.length > length ? `${text.slice(0, length)}…` : text;



}







export default function ConsultantDashboard() {



  const [tab, setTab] = useState("overview");
  const [outcomeSignal, setOutcomeSignal] = useState("relevance");
  const [outcomeMode, setOutcomeMode] = useState("constellation");
  const [guidanceTodos, setGuidanceTodos] = useState(() => {
    try {
      const saved = window.localStorage.getItem("consultant-guidance-todos-v2");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [guidanceTodoReadingKey, setGuidanceTodoReadingKey] = useState("");
  const [guidanceTodoDraft, setGuidanceTodoDraft] = useState("");
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationWorking, setConsultationWorking] = useState(null);
  const [consultationResponses, setConsultationResponses] = useState({});
  const [consultationError, setConsultationError] = useState("");



  const [data, setData] = useState(null);
  const [dailyActivity15Day, setDailyActivity] = useState([]);



  const [reviews, setReviews] = useState([]);



  const [reviewFilter, setReviewFilter] = useState("pending");



  const [selectedReview, setSelectedReview] = useState(null);



  const [reviewText, setReviewText] = useState("");



  const [reviewReason, setReviewReason] = useState("");



  const [clients, setClients] = useState([]);



  const [selectedClient, setSelectedClient] = useState(null);



  const [clientDetail, setClientDetail] = useState(null);



  const [search, setSearch] = useState("");



  const [readingType, setReadingType] = useState("");



  const [fromDate, setFromDate] = useState("");



  const [toDate, setToDate] = useState("");



  const [loading, setLoading] = useState(true);



  const [saving, setSaving] = useState(false);



  const [error, setError] = useState("");
  const [impactView, setImpactView] = useState("overview");
  const [selectedImpact, setSelectedImpact] = useState("helpful");
  const [commentFilter, setCommentFilter] = useState("all");

  useEffect(() => {
    try {
      window.localStorage.setItem("consultant-guidance-todos-v2", JSON.stringify(guidanceTodos));
    } catch {
      // The checklist still works for this session if browser storage is unavailable.
    }
  }, [guidanceTodos]);

  // Build a small, reading-specific checklist from the newest saved reading.
  // Old generated suggestions are replaced when a genuinely new reading arrives;
  // custom tasks are kept, and duplicate suggestion text is removed.
  useEffect(() => {
    const readings = Array.isArray(data?.latest_readings) ? data.latest_readings : [];
    if (!readings.length) return;
    const latest = [...readings].sort((a, b) => {
      const aTime = new Date(a.created_at || a.createdAt || 0).getTime();
      const bTime = new Date(b.created_at || b.createdAt || 0).getTime();
      return bTime - aTime || Number(b.id || 0) - Number(a.id || 0);
    })[0];
    const readingKey = String(latest.id ?? latest.reading_id ?? latest.created_at ?? latest.createdAt ?? "latest-reading");
    if (readingKey === guidanceTodoReadingKey) return;

    const kind = String(latest.reading_type || latest.type || "reading").toLowerCase();
    const readingLabel = kind === "palm" ? "this palm reading" : kind === "tarot" ? "this tarot reading" : "the latest reading";
    const title = String(latest.title || (kind === "palm" ? "Palm reading" : kind === "tarot" ? "Tarot reading" : "Latest reading")).trim();
    const question = String(latest.input_summary || latest.question || title).replace(/\s+/g, " ").trim().slice(0, 110);
    const scoreValues = [
      { key: "relevance", value: Number(averages.guidance_relevance ?? 50), task: `For “${title}”, make the opening guidance answer “${question}” directly.` },
      { key: "growth", value: Number(averages.self_development ?? 50), task: `Add one optional, realistic reflection step to ${readingLabel} “${title}”.` },
      { key: "clarity", value: Number(averages.overall_insight_score ?? 50), task: `Rewrite the takeaway for “${title}” in one clear sentence and remove repeated advice.` },
    ];
    const suggestions = scoreValues
      .sort((a, b) => a.value - b.value)
      .slice(0, 2)
      .map((item) => ({ id: `suggested-${readingKey}-${item.key}`, text: item.task, done: false, generated: true, readingKey }));

    setGuidanceTodos((current) => {
      const custom = current.filter((item) => !item.generated && !String(item.id).startsWith("suggested-"));
      const combined = [...suggestions, ...custom];
      const seen = new Set();
      return combined.filter((item) => {
        const normalized = String(item.text || "").trim().toLowerCase();
        if (!normalized || seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      });
    });
    setGuidanceTodoReadingKey(readingKey);
  // Scores are refreshed alongside dashboard data; reading identity controls regeneration.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.latest_readings, guidanceTodoReadingKey]);







  const dashboardUrl = useMemo(() => {



    const params = new URLSearchParams();







    if (search.trim()) params.set("search", search.trim());



    if (readingType) params.set("reading_type", readingType);



    if (fromDate) params.set("from_date", fromDate);



    if (toDate) params.set("to_date", toDate);







    const query = params.toString();



    return `/api/consultant/dashboard${query ? `?${query}` : ""}`;



  }, [search, readingType, fromDate, toDate]);







  async function loadConsultationRequests() {
    setConsultationLoading(true);
    setConsultationError("");
    try {
      const response = await api.get("/api/consultations/incoming");
      const items = response.data?.items || [];
      setConsultationRequests(items);
      setConsultationResponses((current) => {
        const next = { ...current };
        items.forEach((item) => {
          if (next[item.id] === undefined) next[item.id] = item.response_message || "";
        });
        return next;
      });
    } catch (err) {
      setConsultationError(err.response?.data?.detail || "Unable to load consultant session requests.");
    } finally {
      setConsultationLoading(false);
    }
  }

  async function decideConsultation(id, status) {
    const responseMessage = String(consultationResponses[id] || "").trim();
    if (status === "rejected" && responseMessage.length < 8) {
      setConsultationError("Please explain why you cannot accept this requested date/time (at least 8 characters).");
      return;
    }
    setConsultationWorking(id);
    setConsultationError("");
    try {
      await api.post(`/api/consultations/${id}/decision`, {
        status,
        response_message: responseMessage || null,
      });
      await loadConsultationRequests();
    } catch (err) {
      setConsultationError(err.response?.data?.detail || "Unable to update this consultation request.");
    } finally {
      setConsultationWorking(null);
    }
  }

  async function loadDashboard() {




    setLoading(true);



    setError("");







    try {



      const [response, activityResponse] = await Promise.all([
        api.get(dashboardUrl),
        api.get("/api/consultant/activity?days=15"),
      ]);

      setDailyActivity((activityResponse.data?.items || []).map((item) => ({
        ...item,
        total: Number(item.total ?? item.count ?? 0),
        label: item.label || item.date || item.day || "",
      })));
      setData(response.data);



      setClients(response.data.client_trends || []);



    } catch (err) {



      setError(



        err.response?.data?.detail ||



        "Unable to load the Spiritual Consultant workspace."



      );



    } finally {



      setLoading(false);



    }



  }







  async function loadReviews() {



    try {



      const response = await api.get(



        `/api/consultant/reviews${reviewFilter ? `?status_filter=${reviewFilter}` : ""}`



      );



      setReviews(response.data.items || []);



    } catch (err) {



      setError(



        err.response?.data?.detail ||



        "Unable to load the review queue."



      );



    }



  }







  async function loadClient(userId) {



    setSelectedClient(userId);







    try {



      const response = await api.get(`/api/consultant/clients/${userId}`);



      setClientDetail(response.data);



      setTab("client");



    } catch (err) {



      setError(



        err.response?.data?.detail ||



        "Unable to load this client."



      );



    }



  }







  useEffect(() => {



    loadDashboard();



  }, [dashboardUrl]);

  useEffect(() => {
    loadConsultationRequests();
  }, []);

  useEffect(() => {
    if (tab === "requests") loadConsultationRequests();
  }, [tab]);







  function selectReview(item) {



    setSelectedReview(item);



    setReviewText(item.review?.edited_text || item.result_text || "");



    setReviewReason(item.review?.flag_reason || "");



  }







  async function updateReview(status) {



    if (!selectedReview) return;







    if (status === "flagged" && !reviewReason.trim()) {



      setError("Add a reason before flagging the reading.");



      return;



    }







    setSaving(true);



    setError("");







    try {



      await api.patch(`/api/consultant/reviews/${selectedReview.id}`, {



        status,



        edited_text: reviewText,



        flag_reason: reviewReason || null,



      });







      await loadReviews();



      await loadDashboard();







      const refreshed = reviews.find((item) => item.id === selectedReview.id);



      if (refreshed) selectReview(refreshed);



    } catch (err) {



      setError(



        err.response?.data?.detail ||



        "Unable to save the review."



      );



    } finally {



      setSaving(false);



    }



  }







  async function markFollowUp(id) {



    try {



      await api.patch(`/api/consultant/feedback/${id}/follow-up`);



      await loadDashboard();



    } catch (err) {



      setError(



        err.response?.data?.detail ||



        "Unable to complete the follow-up."



      );



    }



  }







  const metrics = data?.metrics || {};



  const scoring = data?.scoring || {};



  const averages = scoring.averages || {};







  return (



    <div className="consultant-page">



      <style>{`${css}\n.guidance-reading-context{display:grid;gap:4px;max-width:560px;margin-top:18px;padding:12px 14px;border:1px solid #ead5bd;border-radius:13px;background:#fffaf4}.guidance-reading-type{font-size:9px;letter-spacing:.12em;font-weight:800;color:#9a704d}.guidance-reading-context strong{font-size:13px;color:#573923}.guidance-reading-context small{font-size:10px;color:#9b7b61}.guidance-outcome-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px;margin:16px 0}.guidance-outcome-metric{display:grid;gap:8px;text-align:left;padding:16px;border:1px solid #ead5bd;border-radius:15px;background:#fffaf4;color:#65452e;cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s}.guidance-outcome-metric:hover,.guidance-outcome-metric.selected{transform:translateY(-2px);border-color:#ad8159;box-shadow:0 8px 20px #79523912}.guidance-outcome-metric-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#f1e2d0;color:#8c6342}.guidance-outcome-metric-label{font-size:11px;color:#947354}.guidance-outcome-metric strong{font:700 25px Georgia,serif;color:#573923}.guidance-outcome-metric-track{height:6px;border-radius:99px;background:#eadbc9;overflow:hidden}.guidance-outcome-metric-track i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#916441,#c39a72);transition:width .7s ease}.guidance-outcome-metric small{font-size:10px;line-height:1.5;color:#98775c}.guidance-outcome-main-grid{align-items:stretch}.guidance-priority-panel{display:flex;flex-direction:column;gap:12px}.guidance-priority-score{display:flex;align-items:baseline;gap:8px}.guidance-priority-score strong{font:700 36px Georgia,serif;color:#6f472b}.guidance-priority-score span{font-size:11px;color:#98775c}.guidance-priority-panel h3{margin:0;font-size:16px;color:#5d3c25}.guidance-priority-panel>p{font-size:12px;line-height:1.7;color:#8a684c;margin:0}.guidance-current-reading-note{padding:11px 13px;border-radius:10px;background:#f8efe4;color:#8b694c;font-size:11px;margin:12px 0}.guidance-current-reading-note strong{color:#65452e}.guidance-outcomes-refresh .guidance-radar-node{cursor:pointer;outline:none}.guidance-outcomes-refresh .guidance-radar-node:focus circle{stroke:#65452e;stroke-width:3}@media(max-width:800px){.guidance-outcome-metrics{grid-template-columns:1fr}.guidance-outcome-metric{grid-template-columns:auto 1fr auto;align-items:center}.guidance-outcome-metric-track,.guidance-outcome-metric small{grid-column:1/-1}}
.guidance-impact-chart{display:flex;align-items:center;justify-content:center;gap:26px;flex-wrap:wrap;padding:18px 0}.guidance-impact-donut{width:174px;height:174px;border-radius:50%;display:grid;place-items:center;animation:impactDonutIn .9s ease-out both;box-shadow:0 8px 24px #79523912}.guidance-impact-donut>div{width:118px;height:118px;border-radius:50%;background:#fffaf4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px}.guidance-impact-donut strong{font:700 30px Georgia,serif;color:#573923}.guidance-impact-donut span{font-size:9px;letter-spacing:.12em;font-weight:900;color:#98775c}.guidance-impact-legend{display:grid;gap:13px;min-width:190px;max-width:300px;flex:1}.guidance-impact-legend>div{display:grid;grid-template-columns:10px 1fr auto;align-items:center;gap:9px;font-size:12px;color:#79573e}.guidance-impact-legend strong{color:#4d2f22}.guidance-impact-dot{width:9px;height:9px;border-radius:50%}.guidance-impact-dot.helpful{background:#9a704d}.guidance-impact-dot.not-helpful{background:#e9d8c4;border:1px solid #c8aa89}.guidance-impact-legend p,.guidance-radar-footnote{font-size:10px;line-height:1.6;color:#98775c;margin:5px 0 0}.guidance-outcome-summary-row{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}.guidance-outcome-summary-row>div{display:grid;gap:7px;padding:14px;border:1px solid #ead5bd;border-radius:12px;background:#fffaf4}.guidance-outcome-summary-row span{font-size:10px;color:#947354}.guidance-outcome-summary-row strong{font:700 24px Georgia,serif;color:#573923}.guidance-outcome-summary-row small{font-size:10px;color:#98775c;line-height:1.4}@keyframes impactDonutIn{from{transform:scale(.88) rotate(-35deg);opacity:.3}to{transform:scale(1) rotate(0);opacity:1}}@media(max-width:800px){.guidance-outcome-summary-row{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(prefers-reduced-motion:reduce){.guidance-impact-donut{animation:none}}
\n
/* Guidance outcomes: interactive client-impact explorer */
.guidance-impact-explorer{display:grid;gap:16px;animation:impactFadeIn .45s ease both}
.impact-explorer-hero{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:24px 28px;min-height:180px;background:radial-gradient(circle at 85% 50%,#f1dcc4 0,transparent 32%),linear-gradient(115deg,#fffaf4,#f8ecdd)!important}
.impact-hero-content{position:relative;z-index:1;max-width:690px}
.impact-hero-content h2{font:700 clamp(24px,3vw,34px) Georgia,serif;color:#583a28;margin:12px 0 9px}
.impact-hero-content>p{max-width:620px;font-size:13px;line-height:1.65;color:#89674e;margin:0}
.impact-hero-pills{display:flex;gap:9px;flex-wrap:wrap;margin-top:16px}
.impact-hero-pills span{display:inline-flex;align-items:center;gap:6px;border:1px solid #ead3b9;border-radius:99px;padding:7px 10px;background:#fffaf5;color:#7e5b40;font-size:11px}
.impact-hero-art{position:relative;width:145px;height:145px;flex:0 0 145px;display:grid;place-items:center}
.impact-orbit{position:absolute;border:1px solid #d9bda0;border-radius:50%;width:112px;height:140px;animation:impactOrbit 12s linear infinite}
.impact-orbit-a{transform:rotate(35deg)}.impact-orbit-b{transform:rotate(-35deg);animation-direction:reverse;width:135px;height:105px}
.impact-orbit-center{position:relative;width:78px;height:78px;border-radius:50%;background:linear-gradient(145deg,#aa805b,#6f4930);box-shadow:0 8px 22px #79523930;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#fff5e8}
.impact-orbit-center small{font-size:8px;line-height:1.15;text-align:center;letter-spacing:.1em;font-weight:800}
.impact-spark{position:absolute;color:#b28a66;font-size:15px}.impact-spark-a{top:13px;right:10px}.impact-spark-b{bottom:14px;left:5px}.impact-spark-c{top:40px;left:2px}
.impact-explorer-tabs{display:flex;gap:6px;flex-wrap:wrap;border-bottom:1px solid #e4cdb4;padding:0 4px}
.impact-explorer-tabs button,.impact-comment-filters button{display:inline-flex;align-items:center;gap:7px;padding:11px 14px;border:0;border-bottom:2px solid transparent;background:transparent;color:#8d6b50;font-size:12px;cursor:pointer;transition:all .2s}
.impact-explorer-tabs button.active{color:#563722;border-bottom-color:#8c5c39;font-weight:750}.impact-explorer-tabs button:hover,.impact-comment-filters button:hover{background:#f7eadb}
.impact-explorer-tabs button span{border-radius:99px;background:#f0dfcd;padding:2px 6px;font-size:10px}
.impact-overview-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,.9fr);gap:16px}
.impact-main-card,.impact-next-step-card,.impact-timeline-card,.impact-comments-card{min-width:0}
.impact-helpfulness-layout{display:flex;align-items:center;justify-content:center;gap:26px;flex-wrap:wrap;padding:18px 0}
.impact-ring{width:174px;height:174px;flex:0 0 174px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#9b704d var(--impact-percent),#ead8c3 0);box-shadow:0 8px 24px #79523912;animation:impactRingIn .8s ease both}
.impact-ring-inner{width:118px;height:118px;border-radius:50%;background:#fffaf4;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}
.impact-ring-inner strong{font:700 30px Georgia,serif;color:#573923}.impact-ring-inner small{font-size:9px;letter-spacing:.12em;font-weight:900;color:#98775c}
.impact-response-list{display:grid;gap:9px;min-width:190px;flex:1}
.impact-response-list>button{position:relative;display:grid;grid-template-columns:12px 1fr auto;gap:7px;align-items:center;text-align:left;padding:10px;border:1px solid transparent;border-radius:10px;background:#fff8f0;color:#805c40;cursor:pointer}
.impact-response-list>button.selected{border-color:#d7b798;background:#f8ecde;box-shadow:0 3px 10px #7952390b}
.impact-response-list>button span{font-size:12px}.impact-response-list>button strong{font-size:15px;color:#503321}.impact-response-list>button small{grid-column:2/4;color:#a08369;font-size:10px}
.impact-dot{width:9px;height:9px;border-radius:50%}.impact-dot.positive{background:#9b704d}.impact-dot.neutral{background:#e1c8ac;border:1px solid #c6a482}
.impact-selected-detail{padding:11px 12px;border-left:2px solid #b88b63;margin-top:3px;background:#fbf2e7;border-radius:0 9px 9px 0;animation:impactFadeIn .25s ease}
.impact-selected-detail strong{font-size:11px;color:#5b3b26}.impact-selected-detail p{font-size:11px;line-height:1.55;color:#927258;margin:5px 0 0}
.impact-action-eyebrow{font-size:9px;font-weight:850;letter-spacing:.13em;color:#a17a57}
.impact-next-step-card .panel-body h3{font:700 21px Georgia,serif;color:#593b27;margin:9px 0}
.impact-next-step-card .panel-body>p{font-size:12px;line-height:1.7;color:#89674e;margin:0 0 14px}
.impact-action-checklist{display:grid;gap:8px;margin:14px 0}
.impact-action-checklist>div{display:flex;align-items:flex-start;gap:10px;padding:10px;border-radius:10px;background:#fbf2e7}
.impact-action-checklist>div>span{display:grid;place-items:center;width:25px;height:25px;flex:0 0 25px;border-radius:8px;background:#efdfcd;color:#805637;font-size:10px;font-weight:800}
.impact-action-checklist p{font-size:11px;line-height:1.5;color:#78573d;margin:3px 0 0}
.impact-action-note{display:flex;align-items:flex-start;gap:8px;padding:11px;border:1px solid #ead4bc;border-radius:10px;color:#987653;font-size:10px;line-height:1.55}
.impact-action-note svg{flex:0 0 auto}
.impact-mini-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
.impact-mini-metrics article{display:grid;gap:7px;padding:15px 17px;border:1px solid #ead5bd;border-radius:12px;background:#fffaf4}
.impact-mini-metrics article>span{font-size:11px;color:#8e6b4d}.impact-mini-metrics article>strong{font:700 26px Georgia,serif;color:#573923}.impact-mini-metrics article>small{font-size:10px;color:#a08369}
.impact-empty-state{min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:24px;max-width:540px;margin:auto}
.impact-empty-icon{width:48px;height:48px;border-radius:15px;background:#f2e3d1;color:#916846;display:grid;place-items:center;margin-bottom:12px}
.impact-empty-state h3{font:700 19px Georgia,serif;color:#593b27;margin:0 0 8px}.impact-empty-state p{font-size:12px;line-height:1.7;color:#98775c;margin:0}
.impact-timeline-chart{display:flex;align-items:stretch;gap:clamp(7px,1.5vw,18px);min-height:245px;padding:16px 10px 8px;border-bottom:1px solid #ead5bd;overflow-x:auto;background:linear-gradient(to bottom,transparent 24.8%,#eadac6 25%,transparent 25.3%,transparent 49.8%,#eadac6 50%,transparent 50.3%,transparent 74.8%,#eadac6 75%,transparent 75.3%)}
.impact-timeline-point{display:flex;flex:1 0 34px;min-width:34px;flex-direction:column;align-items:center;justify-content:flex-end;gap:8px;border:0;background:transparent;cursor:pointer;color:#997454;padding:0 2px}
.impact-timeline-bar-wrap{height:180px;width:100%;display:flex;align-items:flex-end;justify-content:center}
.impact-timeline-bar{display:block;width:min(30px,72%);height:var(--feedback-height);min-height:12px;border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,#b9916b,#805638);box-shadow:0 3px 8px #80563820;transform-origin:bottom;animation:impactBarGrow .8s cubic-bezier(.2,.7,.2,1) both;transition:filter .2s,transform .2s}
.impact-timeline-point.negative .impact-timeline-bar{background:linear-gradient(180deg,#e2c9ac,#b99470)}
.impact-timeline-point:hover .impact-timeline-bar{filter:saturate(1.25);transform:scaleX(1.12)}
.impact-timeline-point small{font-size:9px;white-space:nowrap}
.impact-timeline-note{font-size:10px;color:#98775c;line-height:1.6;margin:13px 0 0}
@keyframes impactBarGrow{from{transform:scaleY(.05);opacity:.35}to{transform:scaleY(1);opacity:1}}
.impact-comment-filters{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:14px}
.impact-comment-filters button{border:1px solid #ead5bd;border-radius:99px;padding:7px 11px}.impact-comment-filters button.active{background:#8f6647;color:#fff8ef;border-color:#8f6647}
.impact-comment-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.impact-comment-item{border:1px solid #ead5bd;border-radius:12px;padding:14px;background:#fffaf4;animation:impactFadeIn .3s ease both}
.impact-comment-status{display:inline-flex;padding:4px 7px;border-radius:99px;font-size:9px;font-weight:800}.impact-comment-status.positive{background:#eee0cf;color:#765235}.impact-comment-status.neutral{background:#f5eadc;color:#9a7654}
.impact-comment-item p{font-size:12px;line-height:1.65;color:#67482f;margin:10px 0}.impact-comment-item small{font-size:10px;color:#a08369}
@keyframes impactFadeIn{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
@keyframes impactRingIn{from{opacity:.2;transform:scale(.88) rotate(-20deg)}to{opacity:1;transform:scale(1) rotate(0)}}
@keyframes impactOrbit{from{transform:rotate(0)}to{transform:rotate(360deg)}}
@media(max-width:850px){.impact-overview-grid{grid-template-columns:1fr}.impact-hero-art{width:110px;height:110px;flex-basis:110px}.impact-ring{width:145px;height:145px;flex-basis:145px}.impact-ring-inner{width:98px;height:98px}.impact-ring-inner strong{font-size:25px}}
@media(max-width:600px){.impact-explorer-hero{padding:18px;align-items:flex-start}.impact-hero-art{display:none}.impact-hero-content h2{font-size:25px}.impact-mini-metrics{grid-template-columns:1fr}.impact-comment-list{grid-template-columns:1fr}.impact-explorer-tabs button{padding:10px 8px;font-size:11px}.impact-helpfulness-layout{gap:16px}}
@media(prefers-reduced-motion:reduce){.impact-orbit,.impact-ring,.impact-explorer-hero,.impact-comment-item,.impact-timeline-bar{animation:none}}
.consultant-insight-trend{width:100%;min-width:0}
.consultant-trend-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:18px}
.consultant-trend-summary>div{border:1px solid #eadac6;border-radius:12px;padding:12px 14px;background:#fffaf4;display:flex;flex-direction:column;gap:6px;min-width:0}
.consultant-trend-summary span{font-size:12px;color:#927057}
.consultant-trend-summary strong{font-size:23px;line-height:1.15;color:#513729}
.consultant-trend-summary strong small{font-size:12px;font-weight:500;margin-left:3px;color:#927057}
.consultant-insight-trend-svg{display:block;width:100%;height:260px;overflow:visible}
.consultant-trend-labels{display:grid;grid-template-columns:repeat(auto-fit,minmax(75px,1fr));gap:8px;margin-top:8px}
.consultant-trend-labels>div{min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;border-top:1px solid #eadac6;padding-top:8px;text-align:center}
.consultant-trend-labels strong{font-size:12px;color:#513729}
.consultant-trend-labels span{font-size:10px;color:#927057;overflow-wrap:anywhere;max-width:100%}
@media(max-width:700px){.consultant-trend-summary{grid-template-columns:1fr}.consultant-insight-trend-svg{height:210px}.consultant-trend-labels{grid-template-columns:repeat(2,minmax(0,1fr))}}
`}</style>







      <div className="consultant-hero">



        <div>



          <p className="consultant-eyebrow">SPIRITUAL CONSULTANT · ROLE WORKSPACE</p>



          <h1 className="consultant-title">Spiritual Consultant Dashboard</h1>



          <p className="consultant-subtitle">



            Review client trends, evaluate guidance effectiveness, and manage consultation sessions with clear outcome insights.



          </p>



        </div>







        <div className="consultant-actions">



          <button className="consultant-btn" onClick={loadDashboard} disabled={loading}>



            <RefreshCw size={15} /> Refresh



          </button>



        </div>



      </div>







      {error && (



        <div className="consultant-banner warning">



          {error}



        </div>



      )}







      <div className="consultant-banner">



        <strong>Spiritual Guidance Scoring Engine:</strong>{" "}



        the architecture's weighted insight model is implemented as an



        explainable dashboard score:



        <strong> Palm confidence 30% + Tarot relevance 25% + Personality



        alignment 20% + User context 15% + Reading consistency 10%.</strong>{" "}



        Guidance relevance and self-development are shown as additional



        consultant indicators. These are heuristic reflection metrics, not



        clinical or scientific measurements.



      </div>







      {loading && !data ? (



        <div className="consultant-card loading-state">



          Loading the Spiritual Consultant workspace…



        </div>



      ) : (



        <>



          <div className="consultant-metrics">



            <Metric icon={UsersRound} label="Clients" value={metrics.clients || 0} note="Unique clients in current filter" />



            <Metric icon={FileText} label="Readings" value={metrics.readings || 0} note={`${metrics.palm_readings || 0} palm · ${metrics.tarot_readings || 0} tarot`} />



            <Metric icon={HeartHandshake} label="Helpful rate" value={`${metrics.helpful_rate || 0}%`} note={`${metrics.feedback_count || 0} outcome responses`} />



          </div>







          <section className="consultant-card consultant-score-card insight-visual-layout" style={{ marginBottom: 18 }}>
            <div className="insight-score-summary">
              {(() => {
                const raw = Number(averages.overall_insight_score);
                const score = toDisplayPercent(raw);
                const hasScore = Number.isFinite(raw) && raw > 0;
                return (
                  <>
                    <div className="insight-score-ring" style={{ "--ring-angle": `${score * 3.6}deg` }}>
                      <div className="insight-score-ring-inner">
                        <div className="insight-score-number">{hasScore ? score.toFixed(1) : "—"}</div>
                        <div className="insight-score-outof">{hasScore ? "OUT OF 100" : "NO SCORE YET"}</div>
                      </div>
                    </div>
                    <div className="insight-score-caption">Overall insight score</div>
                    <div className="insight-score-note">{hasScore ? "Weighted score for the current filters." : "Scores appear when readings contain usable scoring data."}</div>
                  </>
                );
              })()}
            </div>
            <div>
              <div className="score-head" style={{ marginBottom: 6 }}>
                <div><h3>Insight signals</h3><div className="small-note">Compact animated breakdown · normalized 0–1 values are shown as percentages.</div></div>
                <Sparkles size={20} color="#927057" />
              </div>
              <div className="insight-score-grid">
                <ScoreBar label="Palm analysis confidence" value={averages.palm_analysis_confidence} weight="30" />
                <ScoreBar label="Tarot interpretation relevance" value={averages.tarot_interpretation_relevance} weight="25" />
                <ScoreBar label="Personality alignment" value={averages.personality_alignment} weight="20" />
                <ScoreBar label="User context relevance" value={averages.user_context_relevance} weight="15" />
                <ScoreBar label="Reading consistency" value={averages.reading_consistency} weight="10" />
                <ScoreBar label="Reading confidence" value={averages.reading_confidence} />
                <ScoreBar label="Guidance relevance" value={averages.guidance_relevance} />
                <ScoreBar label="Self-development" value={averages.self_development} />
              </div>
            </div>
          </section>







          <div className="consultant-tabs" role="tablist" aria-label="Spiritual Consultant workspace">



            {[



              ["overview", "Overview", BarChart3],



              ["requests", "Session requests", CalendarDays],

              ["clients", "Client trends", UsersRound],



              ["outcomes", "Guidance outcomes", HeartHandshake],



            ].map(([id, label, Icon]) => (



              <button



                key={id}



                role="tab"



                aria-selected={tab === id}



                className={`consultant-tab ${tab === id ? "active" : ""}`}



                onClick={() => setTab(id)}



              >



                                 <Icon size={15} /> {label}
                 {id === "requests" && consultationRequests.filter((item) => item.status === "pending").length > 0 && (
                   <span className="consultation-request-count">{consultationRequests.filter((item) => item.status === "pending").length}</span>
                 )}
               </button>



            ))}



          </div>







          {tab === "overview" && (



            <>



              <div className="consultant-grid-2">



                <section className="consultant-card">



                  <div className="panel-head">



                    <div>



                      <h2>Daily activity timeline</h2>



                      <p>Animated 15-day trend of saved palm and tarot readings, including days with zero activity.</p>



                    </div>



                    <Activity size={20} color="#927057" />



                  </div>



                  <div className="panel-body">



                    {(() => {
                      const days = dailyActivity15Day;
                      const width = 720;
                      const height = 230;
                      const left = 28;
                      const right = 16;
                      const top = 22;
                      const bottom = 34;
                      const plotWidth = width - left - right;
                      const plotHeight = height - top - bottom;
                      const max = Math.max(1, ...days.map((day) => Number(day.total || 0)));
                      const points = days.map((day, index) => {
                        const x = left + (days.length <= 1 ? plotWidth / 2 : index * plotWidth / (days.length - 1));
                        const y = top + plotHeight - (Number(day.total || 0) / max) * plotHeight;
                        return { ...day, x, y, total: Number(day.total || 0) };
                      });
                      const line = points.map((point) => `${point.x},${point.y}`).join(" ");
                      const area = points.length ? `${left},${top + plotHeight} ${line} ${left + plotWidth},${top + plotHeight}` : "";
                      const total = days.reduce((sum, day) => sum + Number(day.total || 0), 0);
                      return (
                        <>
                          {days.length ? (
                            <div className="daily-activity-chart" aria-label="Animated reading activity line chart for the last 15 days">
                              <svg className="daily-activity-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Saved palm and tarot readings per day over the last 15 days">
                                <defs>
                                  <linearGradient id="dailyActivityFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#b58a62" stopOpacity=".48" />
                                    <stop offset="100%" stopColor="#b58a62" stopOpacity=".02" />
                                  </linearGradient>
                                </defs>
                                {[0, 0.5, 1].map((fraction) => {
                                  const y = top + plotHeight * fraction;
                                  // Keep the count axis readable when every day has zero activity.
                                  // With max=1, rounding the midpoint produced duplicate "1" labels.
                                  const tickValue = max === 1
                                    ? (fraction === 0 ? "1" : fraction === 1 ? "0" : "")
                                    : String(Math.round(max * (1 - fraction)));
                                  return <g key={fraction}><line className="daily-activity-gridline" x1={left} y1={y} x2={width - right} y2={y} />{tickValue !== "" && <text className="daily-activity-label" x={left - 8} y={y + 3} textAnchor="end">{tickValue}</text>}</g>;
                                })}
                                {points.length > 1 && <polygon className="daily-activity-area" points={area} />}
                                {points.length > 1 && <polyline className="daily-activity-line" points={line} />}
                                {points.map((point, index) => (
                                  <g key={point.date || point.key}>
                                    <title>{`${point.date || point.key}: ${point.total} saved reading${point.total === 1 ? "" : "s"}`}</title>
                                    <circle className={`daily-activity-point ${index === points.length - 1 ? "today" : ""}`} cx={point.x} cy={point.y} r={index === points.length - 1 ? 5 : 3.5} style={{ animationDelay: `${index * 35}ms` }} />
                                    {(index % 2 === 0 || index === points.length - 1) && <text className="daily-activity-label" x={point.x} y={height - 10} textAnchor="middle">{point.label}</text>}
                                    {point.total > 0 && (index % 2 === 0 || index === points.length - 1) && <text className="daily-activity-count" x={point.x} y={Math.max(12, point.y - 10)} textAnchor="middle">{point.total}</text>}
                                  </g>
                                ))}
                              </svg>
                              <div className="daily-activity-legend">
                                <span className="daily-activity-key"><span className="daily-activity-dot" /> Saved palm + tarot readings · last 15 days</span>
                                <span>{total} readings · {days.length ? `${days[0].date} to ${days[days.length - 1].date}` : ""}</span>
                              </div>
                            </div>
                          ) : <div className="empty-state">No activity data is available yet.</div>}
                        </>
                      );
                    })()}



                  </div>



                </section>







                <section className="consultant-card">



                  <div className="panel-head">



                    <div>



                      <h2>Recurring client themes</h2>



                      <p>Explainable themes found in saved profile and reading text.</p>



                    </div>



                    <Target size={20} color="#927057" />



                  </div>



                  <div className="panel-body">



                    {(data?.themes || []).length ? (



                      <div className="theme-list">



                        {(data?.themes || []).map((theme) => {



                          const max = Math.max(...(data?.themes || []).map((item) => item.count), 1);



                          return (



                            <div className="theme-row" key={theme.theme}>



                              <span className="theme-name">{theme.theme.replace("_", " ")}</span>



                              <div className="score-track">



                                <div className="score-fill" style={{ width: `${Math.max(5, (theme.count / max) * 100)}%` }} />



                              </div>



                              <span className="theme-count">{theme.count}</span>



                            </div>



                          );



                        })}



                      </div>



                    ) : (



                      <div className="empty-state">No recurring themes yet.</div>



                    )}



                  </div>



                </section>



              </div>







              <div className="consultant-grid-2">
                <section className="consultant-card">
                  <div className="panel-head">
                    <div>
                      <h2>Reading portfolio</h2>
                      <p>How saved palm and tarot readings are distributed across the latest dashboard records.</p>
                    </div>
                    <BookOpen size={20} color="#927057" />
                  </div>
                  <div className="panel-body">
                    {(() => {
                      const rows = Array.isArray(data?.latest_readings) ? data.latest_readings : [];
                      const palm = rows.filter((item) => String(item.reading_type || item.type || "").toLowerCase().includes("palm")).length;
                      const tarot = rows.filter((item) => String(item.reading_type || item.type || "").toLowerCase().includes("tarot")).length;
                      const total = rows.length;
                      const palmPct = total ? (palm / total) * 100 : 0;
                      const tarotPct = total ? (tarot / total) * 100 : 0;
                      return total ? (
                        <>
                          <div className="consultant-portfolio-total"><strong>{total}</strong><span>latest records included</span></div>
                          <div className="consultant-portfolio-stack" aria-label={`Palm ${palm}, Tarot ${tarot}`}>
                            <span style={{ width: `${palmPct}%` }} title={`Palm: ${palm}`} />
                            <span style={{ width: `${tarotPct}%` }} title={`Tarot: ${tarot}`} />
                          </div>
                          <div className="consultant-portfolio-legend">
                            <div><i className="consultant-legend-dot palm-dot" /><span>Palm readings</span><strong>{palm}</strong><small>{palmPct.toFixed(0)}%</small></div>
                            <div><i className="consultant-legend-dot tarot-dot" /><span>Tarot readings</span><strong>{tarot}</strong><small>{tarotPct.toFixed(0)}%</small></div>
                          </div>
                          <p className="small-note">Distribution uses the latest readings returned by the dashboard, not a full database-wide total.</p>
                        </>
                      ) : <div className="empty-state">Reading mix will appear when readings are available.</div>;
                    })()}
                  </div>
                </section>
                <section className="consultant-card">
                  <div className="panel-head">
                    <div>
                      <h2>Average guidance indicators</h2>
                      <p>Compare the current scoring averages on a common 0–100 scale.</p>
                    </div>
                    <TrendingUp size={20} color="#927057" />
                  </div>
                  <div className="panel-body">
                    {(() => {
                      const indicators = [
                        ["Reading confidence", averages.reading_confidence],
                        ["Guidance relevance", averages.guidance_relevance],
                        ["Self-development", averages.self_development],
                        ["Overall insight", averages.overall_insight_score],
                      ].map(([label, raw]) => {
                        const n = Number(raw);
                        return { label, value: Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 0, available: raw !== null && raw !== undefined && raw !== "" && Number.isFinite(n) };
                      });
                      return (
                        <div className="consultant-analytics-bars">
                          {indicators.map((item) => (
                            <div className="consultant-analytics-bar-row" key={item.label}>
                              <div className="consultant-analytics-bar-meta"><span>{item.label}</span><strong>{item.available ? `${item.value.toFixed(1)}%` : "—"}</strong></div>
                              <div className="consultant-analytics-track"><span style={{ width: `${item.available ? item.value : 0}%` }} /></div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                    <p className="small-note">These are dashboard scoring indicators, not clinical or scientifically validated measurements.</p>
                  </div>
                </section>
              </div>

              <section className="consultant-card" style={{ marginBottom: 18 }}>
                <div className="panel-head">
                  <div>
                    <h2>Reading insight trend</h2>
                    <p>Trend of available overall insight scores across recent saved readings.</p>
                  </div>
                  <TrendingUp size={20} color="#927057" />
                </div>
                <div className="panel-body">
                  {(() => {
                    const rows = (Array.isArray(data?.latest_readings) ? data.latest_readings : [])
                      .filter((item) => item?.scores?.overall_insight_score !== null && item?.scores?.overall_insight_score !== undefined && item?.scores?.overall_insight_score !== "" && Number.isFinite(Number(item.scores.overall_insight_score)))
                      .slice(0, 10)
                      .reverse();
                    const values = rows.map((item, index) => ({
                      id: item.id ?? item.reading_id ?? `${item.created_at}-${index}`,
                      label: shortText(item.title || item.reading_type || `Reading ${index + 1}`, 18),
                      score: Math.max(0, Math.min(100, Number(item.scores.overall_insight_score))),
                    }));
                    if (!values.length) {
                      return <div className="empty-state">Insight trend will appear when saved readings have an available overall insight score.</div>;
                    }
                    const width = 900;
                    const height = 260;
                    const left = 42;
                    const right = 18;
                    const top = 18;
                    const bottom = 34;
                    const plotWidth = width - left - right;
                    const plotHeight = height - top - bottom;
                    const pointX = (index) => values.length === 1 ? left + plotWidth / 2 : left + (index / (values.length - 1)) * plotWidth;
                    const pointY = (score) => top + ((100 - score) / 100) * plotHeight;
                    const points = values.map((item, index) => `${pointX(index)},${pointY(item.score)}`).join(" ");
                    return (
                      <div className="consultant-insight-trend">
                        <div className="consultant-trend-summary">
                          <div><span>Readings scored</span><strong>{values.length}</strong></div>
                          <div><span>Average insight score</span><strong>{(values.reduce((sum, item) => sum + item.score, 0) / values.length).toFixed(1)}<small>/100</small></strong></div>
                          <div><span>Latest score</span><strong>{values[values.length - 1].score.toFixed(1)}<small>/100</small></strong></div>
                        </div>
                        <svg className="consultant-insight-trend-svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Line chart showing overall insight scores across recent readings" preserveAspectRatio="none">
                          {[0, 25, 50, 75, 100].map((tick) => {
                            const y = pointY(tick);
                            return <g key={tick}>
                              <line x1={left} y1={y} x2={width - right} y2={y} stroke="#eadac6" strokeWidth="1" strokeDasharray={tick === 0 ? "0" : "4 5"} />
                              <text x={left - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#927057">{tick}</text>
                            </g>;
                          })}
                          {values.length > 1 && <polyline points={points} fill="none" stroke="#9c704d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />}
                          {values.map((item, index) => <g key={item.id}>
                            <circle cx={pointX(index)} cy={pointY(item.score)} r="5.5" fill="#fffaf3" stroke="#9c704d" strokeWidth="3" />
                            <title>{`${item.label}: ${item.score.toFixed(1)}/100`}</title>
                          </g>)}
                        </svg>
                        <div className="consultant-trend-labels">
                          {values.map((item) => <div key={item.id} title={item.label}><strong>{item.score.toFixed(0)}</strong><span>{item.label}</span></div>)}
                        </div>
                        <p className="small-note">Only readings with a saved numeric insight score are included; missing scores are not shown as zero.</p>
                      </div>
                    );
                  })()}
                </div>
              </section>

              <section className="consultant-card">



                <div className="panel-head">



                  <div>



                    <h2>Latest consultation readings</h2>



                    <p>Recent saved readings with insight scores and guidance relevance.</p>



                  </div>



                </div>



                <ReadingTable items={data.latest_readings || []} onClient={loadClient} />



              </section>



            </>



          )}







          {tab === "clients" && (



            <section className="consultant-card">



              <div className="panel-head">



                <div>



                  <h2>Client drill-down</h2>



                  <p>Open a client to see history, recurring questions, themes and scores.</p>



                </div>



              </div>



              <div className="table-wrap">



                <table className="consultant-table">



                  <thead>



                    <tr>



                      <th>Client</th>



                      <th>Activity</th>



                      <th>Top themes</th>



                      <th>Insight score</th>



                      <th>Last activity</th>



                      <th />



                    </tr>



                  </thead>



                  <tbody>



                    {clients.length ? clients.map((client) => (



                      <tr key={client.user_id}>



                        <td>



                          <div className="client-name">{client.name}</div>



                          <div className="client-sub">{client.email}</div>



                        </td>



                        <td>



                          <strong>{client.reading_count}</strong> readings



                          <div className="client-sub">{client.palm_count} palm · {client.tarot_count} tarot</div>



                        </td>



                        <td>



                          {client.top_themes?.length



                            ? client.top_themes.map((item) => (



                              <span className="type-pill tarot" key={item.theme} style={{ margin: 2 }}>



                                {item.theme} · {item.count}



                              </span>



                            ))



                            : "—"}



                        </td>



                        <td><span className="score-mini">{client.average_insight_score}</span></td>



                        <td>{formatDate(client.last_activity)}</td>



                        <td>



                          <button className="icon-btn" onClick={() => loadClient(client.user_id)} title="Open client">



                            <ChevronRight size={15} />



                          </button>



                        </td>



                      </tr>



                    )) : (



                      <tr><td colSpan="6"><div className="empty-state">No clients match the current filters.</div></td></tr>



                    )}



                  </tbody>



                </table>



              </div>



            </section>



          )}







          {tab === "outcomes" && (() => {
            const outcome = data?.guidance_effectiveness || {};
            const feedbackRows = Array.isArray(data?.feedback_items)
              ? data.feedback_items
              : Array.isArray(data?.feedback)
                ? data.feedback
                : Array.isArray(data?.outcome_feedback)
                  ? data.outcome_feedback
                  : [];
            const feedbackCount = Number(outcome.feedback_count ?? metrics.feedback_count ?? feedbackRows.length ?? 0);
            const helpfulCount = Number(outcome.helpful_count ?? feedbackRows.filter((row) => row.helpful === true || row.helpful === 1 || row.helpful === "true").length ?? 0);
            const helpfulRateRaw = outcome.helpful_rate ?? metrics.helpful_rate;
            const helpfulRate = helpfulRateRaw === null || helpfulRateRaw === undefined
              ? (feedbackCount > 0 && feedbackRows.length ? (helpfulCount / feedbackCount) * 100 : null)
              : Math.max(0, Math.min(100, Number(helpfulRateRaw) || 0));
            const notHelpfulCount = Math.max(0, feedbackCount - helpfulCount);
            const datedFeedback = feedbackRows
              .filter((row) => row.created_at || row.updated_at)
              .map((row) => {
                const rawDate = row.created_at || row.updated_at;
                const date = new Date(rawDate);
                return {
                  ...row,
                  _date: date,
                  _day: Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
                  _helpful: row.helpful === true || row.helpful === 1 || row.helpful === "true",
                };
              })
              .filter((row) => row._day && !Number.isNaN(row._date.getTime()))
              .sort((a, b) => a._date - b._date);
            const actionCount = Number(outcome.action_count ?? 0);
            const completedActions = Number(outcome.completed_actions ?? 0);
            const completionRaw = outcome.action_completion_rate;
            const completionRate = completionRaw === null || completionRaw === undefined || actionCount === 0
              ? null
              : Math.max(0, Math.min(100, Number(completionRaw) || 0));
            const comments = feedbackRows
              .filter((row) => String(row.comment || "").trim())
              .filter((row) => commentFilter === "all" || (commentFilter === "helpful" ? (row.helpful === true || row.helpful === 1 || row.helpful === "true") : !(row.helpful === true || row.helpful === 1 || row.helpful === "true")));
            const feedbackAvailable = feedbackCount > 0;
            const improvementTitle = !feedbackAvailable
              ? "Start by collecting client feedback"
              : helpfulRate >= 75
                ? "Keep doing what clients find useful"
                : helpfulRate >= 50
                  ? "Make the next guidance more specific"
                  : "Review what clients say is missing";
            const improvementCopy = !feedbackAvailable
              ? "Ask users whether the Palm or Tarot guidance helped them. Their answers will power this explorer; until then, there is no measured impact to display."
              : helpfulRate >= 75
                ? `${helpfulCount} of ${feedbackCount} responses say the guidance helped. Preserve the parts that clients value and continue checking in.`
                : helpfulRate >= 50
                  ? `${notHelpfulCount} of ${feedbackCount} responses did not mark the guidance as helpful. Make interpretations more personal, answer the user's question directly, and offer one practical next step.`
                  : `${notHelpfulCount} of ${feedbackCount} responses did not mark the guidance as helpful. Review any written comments and clarify what the user needed but did not receive.`;
            return (
              <div className="guidance-impact-explorer">
                <section className="consultant-card impact-explorer-hero">
                  <div className="impact-hero-content">
                    <span className="guidance-kicker"><HeartHandshake size={14} /> GUIDANCE OUTCOMES</span>
                    <h2>Did the guidance actually help?</h2>
                    <p>Explore what clients reported, spot where guidance can improve, and use real feedback to shape the next reading.</p>
                    <div className="impact-hero-pills">
                      <span><MessageCircle size={13} /> {feedbackCount} responses</span>
                      <span><ThumbsUp size={13} /> {helpfulRate === null || !feedbackAvailable ? "Awaiting helpfulness data" : `${helpfulRate.toFixed(0)}% reported helpful`}</span>
                    </div>
                  </div>

                </section>

                <div className="impact-explorer-tabs" role="tablist" aria-label="Guidance outcome views">
                  <button type="button" className={impactView === "overview" ? "active" : ""} onClick={() => setImpactView("overview")}><Activity size={15} /> Impact overview</button>
                  <button type="button" className={impactView === "timeline" ? "active" : ""} onClick={() => setImpactView("timeline")}><TrendingUp size={15} /> Impact over time</button>
                  <button type="button" className={impactView === "comments" ? "active" : ""} onClick={() => setImpactView("comments")}><MessageSquare size={15} /> Feedback comments <span>{comments.length}</span></button>
                </div>

                {impactView === "overview" && (
                  <>
                    <div className="impact-overview-grid">
                      <section className="consultant-card impact-main-card">
                        <div className="panel-head"><div><h2>Client helpfulness</h2><p>What clients said about the guidance they received.</p></div><Heart size={19} color="#936b4a" /></div>
                        <div className="panel-body">
                          {feedbackAvailable ? (
                            <div className="impact-helpfulness-layout">
                              <div className="impact-ring" style={{ "--impact-percent": `${helpfulRate ?? 0}%` }}>
                                <div className="impact-ring-inner"><strong>{helpfulRate === null ? "—" : `${Math.round(helpfulRate)}%`}</strong><small>HELPFUL</small></div>
                              </div>
                              <div className="impact-response-list">
                                <button type="button" className={selectedImpact === "helpful" ? "selected" : ""} onClick={() => setSelectedImpact("helpful")}><i className="impact-dot positive" /><span>It helped</span><strong>{helpfulCount}</strong><small>Positive responses</small></button>
                                <button type="button" className={selectedImpact === "notHelpful" ? "selected" : ""} onClick={() => setSelectedImpact("notHelpful")}><i className="impact-dot neutral" /><span>Not really</span><strong>{notHelpfulCount}</strong><small>Needs more attention</small></button>
                                <div className="impact-selected-detail">
                                  <strong>{selectedImpact === "helpful" ? "What is working" : "Opportunity to improve"}</strong>
                                  <p>{selectedImpact === "helpful" ? "Keep the clear explanations and practical takeaways clients find useful. Check written comments for specific strengths." : "Look for missing context, vague interpretations, or next steps that did not fit the user's situation."}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="impact-empty-state"><div className="impact-empty-icon"><MessageCircle size={22} /></div><h3>Client feedback will appear here</h3><p>No client feedback has been recorded yet. Once users answer “Was this reading helpful?” after a Palm or Tarot reading, their real responses will appear here.</p></div>
                          )}
                        </div>
                      </section>
                      <section className="consultant-card impact-next-step-card">
                        <div className="panel-head"><div><h2>Insight to action</h2><p>A practical next step based on the current outcome.</p></div><Target size={19} color="#936b4a" /></div>
                        <div className="panel-body">
                          <span className="impact-action-eyebrow">{feedbackAvailable ? "RECOMMENDED FOCUS" : "FIRST STEP"}</span>
                          <h3>{improvementTitle}</h3>
                          <p>{improvementCopy}</p>
                          <div className="impact-action-checklist">
                            <div><span>01</span><p>Connect the interpretation directly to the user's question.</p></div>
                            <div><span>02</span><p>Offer one realistic step instead of several broad suggestions.</p></div>
                            <div><span>03</span><p>Invite the user to share what was useful or missing.</p></div>
                          </div>
                          <div className="impact-action-note"><Sparkles size={15} /><span>Outcome indicators reflect client-reported helpfulness, not a guarantee that guidance caused a life change.</span></div>
                        </div>
                      </section>
                    </div>
                    <div className="impact-mini-metrics">
                      <article><span>Client responses</span><strong>{feedbackCount}</strong><small>Feedback saved</small></article>
                      <article><span>Positive responses</span><strong>{feedbackAvailable ? helpfulCount : "—"}</strong><small>Clients who said it helped</small></article>
                      <article><span>Action follow-through</span><strong>{actionCount > 0 ? `${completedActions}/${actionCount}` : "—"}</strong><small>{completionRate === null ? "No tracked action data yet" : `${completionRate.toFixed(0)}% completed`}</small></article>
                    </div>
                  </>
                )}

                {impactView === "timeline" && (
                  <section className="consultant-card impact-timeline-card">
                    <div className="panel-head"><div><h2>How helpfulness changes over time</h2><p>Each point is based on feedback recorded on that date.</p></div><TrendingUp size={19} color="#936b4a" /></div>
                    <div className="panel-body">
                      {datedFeedback.length >= 2 ? (
                        <>
                          <div className="impact-timeline-chart">
                            {datedFeedback.slice(-15).map((row, index) => (
                              <button type="button" className={`impact-timeline-point ${row._helpful ? "positive" : "negative"}`} key={`${row.id ?? index}-${row._date.toISOString()}`} title={`${row._day}: ${row._helpful ? "Helpful response" : "Needs improvement response"}. Select to view comments.`} onClick={() => { setCommentFilter(row._helpful ? "helpful" : "notHelpful"); setImpactView("comments"); }}>
                                <span className="impact-timeline-bar-wrap"><i className="impact-timeline-bar" style={{ "--feedback-height": row._helpful ? "100%" : "42%", animationDelay: `${index * 45}ms` }} /></span>
                                <small>{row._day}</small>
                              </button>
                            ))}
                          </div>
                          <p className="impact-timeline-note">Each bar represents one real, dated client response: taller bars are marked helpful; shorter bars need improvement. Select a bar to filter the comments.</p>
                        </>
                      ) : (
                        <div className="impact-empty-state"><div className="impact-empty-icon"><TrendingUp size={22} /></div><h3>More dated responses are needed</h3><p>The timeline appears when at least two dated feedback records are available. Right now, the backend summary provides totals but not enough dated records to draw a trustworthy trend.</p></div>
                      )}
                    </div>
                  </section>
                )}

                {impactView === "comments" && (
                  <section className="consultant-card impact-comments-card">
                    <div className="panel-head"><div><h2>Feedback comments</h2><p>Review written feedback to understand what felt useful or what was missing.</p></div><MessageSquare size={19} color="#936b4a" /></div>
                    <div className="panel-body">
                      <div className="impact-comment-filters">
                        <button type="button" className={commentFilter === "all" ? "active" : ""} onClick={() => setCommentFilter("all")}>All comments</button>
                        <button type="button" className={commentFilter === "helpful" ? "active" : ""} onClick={() => setCommentFilter("helpful")}>Helpful</button>
                        <button type="button" className={commentFilter === "notHelpful" ? "active" : ""} onClick={() => setCommentFilter("notHelpful")}>Needs improvement</button>
                      </div>
                      {comments.length ? (
                        <div className="impact-comment-list">
                          {comments.map((row, index) => (
                            <article key={row.id ?? `${row.reading_id ?? "feedback"}-${index}`} className="impact-comment-item">
                              <span className={`impact-comment-status ${(row.helpful === true || row.helpful === 1 || row.helpful === "true") ? "positive" : "neutral"}`}>{(row.helpful === true || row.helpful === 1 || row.helpful === "true") ? "Helpful" : "Needs improvement"}</span>
                              <p>{String(row.comment).trim()}</p>
                              <small>{row.created_at ? new Date(row.created_at).toLocaleDateString() : "Date not available"}{row.rating ? ` · Rating ${row.rating}/5` : ""}</small>
                            </article>
                          ))}
                        </div>
                      ) : (
                        <div className="impact-empty-state"><div className="impact-empty-icon"><MessageSquare size={22} /></div><h3>No written comments available</h3><p>{feedbackAvailable ? "Clients have submitted feedback, but no written comments are available in the dashboard response yet." : "When users submit optional comments with their helpfulness feedback, you can review them here."}</p></div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            );
          })()}

           {tab === "requests" && (
             <section className="consultant-card">
               <div className="panel-head">
                 <div>
                   <h2>Incoming consultation requests</h2>
                   <p>Review session details, accept to create a Google Meet link, or decline with a reason. This is built into your dashboard, not a separate navigation page.</p>
                 </div>
                 <button className="consultant-btn" onClick={loadConsultationRequests} disabled={consultationLoading}>
                   <RefreshCw size={14} /> Refresh requests
                 </button>
               </div>
               {consultationError && <div className="consultation-request-error">{consultationError}</div>}
               {consultationLoading ? (
                 <div className="loading-state"><LoaderCircle size={18} /> Loading session requests…</div>
               ) : consultationRequests.length ? (
                 <div className="consultation-request-list">
                   {consultationRequests.map((item) => {
                     const status = String(item.status || "pending").toLowerCase();
                     const statusLabel = status.replaceAll("_", " ");
                     return (
                       <article className="consultation-request-card" key={item.id}>
                         <div className="consultation-request-top">
                           <div>
                             <p className="consultant-eyebrow">{item.reading_type ? `${item.reading_type === "palm" ? "PALM" : "TAROT"} CONTEXT` : "SPIRITUAL CONSULTATION"}</p>
                             <h3>{item.topic || "Consultation request"}</h3>
                           </div>
                           <span className={`consultation-status ${status}`}>{statusLabel}</span>
                         </div>
                         <div className="consultation-request-meta">
                           <span><strong>Client:</strong> {item.user_name || "Platform user"}</span>
                           {item.user_email && <span><strong>Email:</strong> {item.user_email}</span>}
                           <span><strong>Requested:</strong> {formatDate(item.created_at)}</span>
                           {item.preferred_time && <span><strong>Preferred session:</strong> {formatDate(item.preferred_time)}</span>}
                         </div>
                         <p className="consultation-request-message">{item.message || "No additional details provided."}</p>
                         {item.response_message && <div className="outcome-section"><strong>Previous response:</strong> {item.response_message}</div>}
                         {item.meet_link && (
                           <a className="consultation-meet-link" href={item.meet_link} target="_blank" rel="noreferrer">
                             <CalendarDays size={15} /> Join Google Meet <ChevronRight size={14} />
                           </a>
                         )}
                         <label className="consultation-response">
                           {status === "pending" ? "Response / decline reason" : "Message to client (optional)"}
                           <textarea
                             value={consultationResponses[item.id] ?? item.response_message ?? ""}
                             onChange={(event) => setConsultationResponses((current) => ({ ...current, [item.id]: event.target.value }))}
                             placeholder={status === "pending" ? "Add a message, or explain why this time is unavailable…" : "Optional update for the client…"}
                           />
                         </label>
                         <div className="consultation-request-actions">
                           {status === "pending" && <>
                             <button className="consultant-btn primary" disabled={consultationWorking === item.id} onClick={() => decideConsultation(item.id, "accepted")}>
                               {consultationWorking === item.id ? <LoaderCircle size={14} /> : <CheckCircle2 size={14} />} Accept & create Meet
                             </button>
                             <button className="consultant-btn danger" disabled={consultationWorking === item.id} onClick={() => decideConsultation(item.id, "rejected")}>
                               <XCircle size={14} /> Decline request
                             </button>
                           </>}
                           {status === "accepted" && <button className="consultant-btn" disabled={consultationWorking === item.id} onClick={() => decideConsultation(item.id, "in_progress")}><Clock3 size={14} /> Mark in progress</button>}
                           {status === "in_progress" && <button className="consultant-btn" disabled={consultationWorking === item.id} onClick={() => decideConsultation(item.id, "completed")}><CheckCircle2 size={14} /> Mark completed</button>}
                         </div>
                       </article>
                     );
                   })}
                 </div>
               ) : (
                 <div className="empty-state">No incoming consultation requests yet. New requests from users will appear here.</div>
               )}
             </section>
           )}





          {tab === "client" && clientDetail && (



            <section className="consultant-card detail-card">



              <div className="consultant-actions" style={{ justifyContent: "space-between", marginBottom: 18 }}>



                <div>



                  <p className="consultant-eyebrow">CLIENT PROFILE</p>



                  <h2 className="detail-title">{clientDetail.client.name}</h2>



                  <div className="client-sub">{clientDetail.client.email}</div>



                </div>



                <button className="consultant-btn" onClick={() => setTab("clients")}>Back to clients</button>



              </div>







              <div className="detail-grid">



                <div className="detail-stat"><strong>{clientDetail.summary.readings}</strong><span>Total readings</span></div>



                <div className="detail-stat"><strong>{clientDetail.summary.palm}</strong><span>Palm</span></div>



                <div className="detail-stat"><strong>{clientDetail.summary.tarot}</strong><span>Tarot</span></div>



                <div className="detail-stat"><strong>{clientDetail.summary.completed_actions}/{clientDetail.summary.actions}</strong><span>Actions complete</span></div>



              </div>







              <div className="consultant-grid-2">



                <div>



                  <h3>Profile context</h3>



                  <p className="small-note"><strong>Interests:</strong> {clientDetail.profile.interests || "Not provided"}</p>



                  <p className="small-note"><strong>Spiritual goals:</strong> {clientDetail.profile.spiritual_goals || "Not provided"}</p>



                  <p className="small-note"><strong>Reading preferences:</strong> {clientDetail.profile.reading_preferences || "Not provided"}</p>



                </div>



                <div>



                  <h3>Recurring questions</h3>



                  {clientDetail.recurring_questions?.length ? clientDetail.recurring_questions.map((question, index) => (



                    <p className="small-note" key={index}>• {question}</p>



                  )) : <p className="small-note">No recurring questions detected yet.</p>}



                </div>



              </div>







              <h3>Reading history</h3>



              <ReadingTable items={clientDetail.readings || []} onClient={() => {}} />



            </section>



          )}



        </>



      )}



    </div>



  );



}







function ReadingTable({ items, onClient }) {



  if (!items?.length) {



    return <div className="empty-state">No reading data is available for the selected view.</div>;



  }







  return (



    <div className="table-wrap">



      <table className="consultant-table">



        <thead>



          <tr>



            <th>Client</th>



            <th>Reading</th>



            <th>Insight score</th>



            <th>Guidance</th>



            <th>Created</th>



          </tr>



        </thead>



        <tbody>



          {items.map((item) => (



            <tr key={item.id}>



              <td>



                <button



                  className="icon-btn"



                  onClick={() => onClient(item.user_id)}



                  style={{ textAlign: "left" }}



                >



                  <span className="client-name">{item.client_name}</span>



                </button>



              </td>



              <td>



                <span className={`type-pill ${item.reading_type}`}>



                  {item.reading_type}



                </span>



                <div className="client-sub">{shortText(item.title, 80)}</div>



              </td>



              <td>



                <span className="score-mini">



                  {Number(item.scores?.overall_insight_score || 0).toFixed(1)}



                </span>



              </td>



              <td>{Number(item.scores?.guidance_relevance || 0).toFixed(1)}%</td>



              <td>{formatDate(item.created_at)}</td>



            </tr>



          ))}



        </tbody>



      </table>



    </div>



  );



}
