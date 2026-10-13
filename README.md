AI Palmistry & Tarot Intelligence Platform
A quiet-luxury, editorial-grade intelligence web application combining multi-modal computer vision palm line extraction with the full 78 Rider-Waite tarot system to deliver grounded, evidence-based self-reflection, multi-role clinical consultations, and executive platform governance.

🌟 System Architecture & Milestone 4 Capabilities
1. Multi-Modal AI Interpretation & Feature Engine
Palm Feature Extraction: Biometric line detection for Life Line, Head Line, Heart Line, Fate Line, and Hand Mounts from verified high-resolution palm images.
Strict Data Integrity: If no verified palm scan exists, the platform clearly renders an "Analysis Unavailable" state—never fabricating palm lines, synthetic markers, or claiming deterministic predictions.
78 Rider-Waite Tarot System: Complete implementation of all 22 Major Arcana and 56 Minor Arcana (Wands, Cups, Swords, Pentacles).
Supported Spreads: Strictly supports 1-Card Daily Focus, 3-Card (Past / Present / Future), and 5-Card (Strategic Alignment) spreads with orientation-aware (upright & reversed) position interpretations.
AI Interpretation (Palm + Tarot Fusion): Cross-references physical bodily line morphology with active card archetypes to identify harmonic synergies, constructive tensions, and grounded next steps.
2. Personalized Role-Based Dashboards
Separate, purpose-built dashboards designed under the quiet-luxury aesthetic system:

Client / User Dashboard (/dashboard):
Personal welcome with active spiritual/reflective preferences
Real-time palm scan analysis status and biometric detection summary
Tarot reading history & active cards
Latest AI Interpretation dossier & reflective insights
Evidence-grounded personality dimensions & strengths
Actionable recommendations with status tracking
Personal trend charts and reading archive
Direct PDF/Excel report export links
Excludes all practitioner and platform administration controls
Palmistry Reader Dashboard (/dashboard/palm-reader):
Assigned and queued client submissions for palm review
Biometric line confidence breakdown and structural contour inspections
Clinical consultation notes editor with direct database persistence
Verified client palm reports and review history
Reader workload and submission turnaround analytics
Strict privacy isolation: only authorized client sessions are accessible
Tarot Reader Dashboard (/dashboard/tarot-reader):
Active tarot consultation queue and client session intake
Interactive multi-spread workbench (1, 3, and 5-card spreads)
Card inversion and archetypal position telemetry
Clinical session notes and client context integration
Spread history and session archive
Reader activity analytics and reading volume metrics
Spiritual Consultant Dashboard (/dashboard/consultant):
Holistic cross-modal overview of authorized clients
Unified palm line morphology + tarot spread synthesis
Comprehensive clinical consultation notes with category tagging & recommendations
Longitudinal trend trajectory analysis and goal tracking
Session activity and client engagement insights
Administrator Executive Dashboard (/dashboard/admin):
REAL platform KPIs: Total Registered Users, Active Users, Total Readings, Palm vs Tarot breakdown, Completion Rate
User role distribution and account management
Reading modality trends and spread distribution charts
Audit trail viewer with security event tracking
AI provider health telemetry (Deterministic Rule Engine & LLM Gateway)
Live database data only — zero fabricated numbers or artificial metrics
3. Role-Based Access Control (RBAC) & Protected Routing
Dual-Layer RBAC: Enforced on both frontend routing via <ProtectedRoute allowedRoles={[...]} /> and backend database via PostgreSQL Row Level Security (RLS).
Role Invariance: Manually altering the URL route immediately triggers automatic redirection to the user's authorized role dashboard or displays an unauthorized feedback banner.
Public Registration & Role Switching: Public signups map to user (Client), palmist (Palmistry Reader), or tarot_reader (Tarot Reader). Spiritual Consultant (practitioner) and Administrator (admin) roles are managed through authorized administration.
Role Key	Dashboard Route	Authorized Access & Capabilities
user	/dashboard	Personal readings, palm scans, tarot, AI interpretation, personality, recommendations, trends, personal reports
palmist	/dashboard/palm-reader	Client palm submissions, feature confidence inspection, consultation notes, palm reports
tarot_reader	/dashboard/tarot-reader	Tarot reading queue, 1/3/5-card spreads, archetypal interpretations, session notes, tarot reports
practitioner	/dashboard/consultant	Combined palm + tarot dossiers, clinical consultation notes, holistic guidance, client trends
admin	/dashboard/admin	Executive KPIs, user management, audit logs, AI gateway health, platform reports
📊 Reports & Visualizations Module
The /reports module provides real-time database-driven export capabilities:

Available Formats: In-browser client-side compilation to PDF (via jsPDF & autoTable) and Excel (.xlsx) (via SheetJS).
Report Scopes:
All Readings History — complete chronological archive of sessions
Palmistry Biometric Report — physical line features, confidence, and hand mounts
Tarot Spread & Archetype Report — card positions, inversions, and symbolic archetypes
AI Interpretation Dossier — cross-modal synthesis narrative, synergies, and tensions
Reflective Personality Insights — cognitive dimensions and observational evidence
Practitioner & Consultation Notes — clinical session records and recommendations
Administrator Executive Analytics — platform user growth, readings volume, and security audit events
Visualizations:
Reading activity over time (Area Chart)
Palm vs. Tarot vs. AI Synthesis usage distribution (Donut / Pie Chart)
Interactive multi-dimensional radar charts for personality profiles
🔐 Security, Privacy & Ethical Safety
Client Confidentiality: Practitioners only access clients who have consented and booked active consultations.
Deterministic Rules & Secret Hygiene: Client bundles never expose third-party API master keys. AI Gateway calls route through Supabase Edge Functions with token injection.
Mandatory Safety Disclaimer:
"These readings and insights are AI-assisted symbolic interpretations offered strictly for entertainment, personal reflection, and self-discovery. They do not constitute scientific, medical, psychological, legal, or financial advice, nor deterministic predictions of future events."

🐳 Production Deployment & Docker Setup
Multi-Stage Dockerfile
Build Stage: Node.js 20 Alpine with pnpm caching, compiling optimized Vite static assets.
Runner Stage: High-performance Alpine NGINX serving static files with SPA fallback routing, gzip compression, non-root user execution, and strict security headers (X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff, X-XSS-Protection, Referrer-Policy).
Quick Start with Docker Compose
# 1. Clone repository and copy environment configuration
cp .env.example .env

# 2. Build and run in detached container mode
docker-compose up -d --build

# 3. Check health status
docker-compose ps
curl http://localhost:8080/healthz
# Response: OK
Environment Variables (.env)
Variable	Description	Default
NODE_ENV	Runtime environment	production
PORT	Host exposed web port	8080
DOMAIN	Domain host header for ingress	localhost
VITE_APP_NAME	Platform branding	Palmistry & Tarot Intelligence
VITE_APP_VERSION	Semantic release version	1.0.0
VITE_AI_PROVIDER	Engine mode (rule_engine | hybrid)	rule_engine
VITE_ENABLE_ANALYTICS	Toggle database analytics collection	true
VITE_ENABLE_MULTI_MODAL_SYNTHESIS	Enable cross-modal fusion	true
VITE_SHOW_ENTERTAINMENT_DISCLAIMER	Ethical advisory banner	true
🧪 Automated Testing & Verification
The test suite validates the core engine, deck integrity, spread constraints, and multi-modal pipeline:

# Run TypeScript & engine verification suite (27 tests)
npx tsx tests/run_tests.ts

# Run static analysis and linting (120 files)
npm run lint
Test Suite Coverage:
Test Group 1: 78 Rider-Waite Tarot Deck Integrity (22 Majors, 56 Minors, 14 per suit)
Test Group 2: Supported Spreads (1, 3, and 5 cards strictly; Celtic Cross & 10-card excluded)
Test Group 3: Tarot Interpretation Engine (Structured evidence and archetypes)
Test Group 4: Palm Feature Engine (Real data integrity; missing image returns Analysis Unavailable)
Test Group 5: Multi-Modal AI Synthesis (Palm + Tarot cross-modal fusion)
Test Group 6: Reflective Personality Profiler (Strengths, growth areas, observational evidence)
Test Group 7: Dynamic Recommendations Engine (Actionable reasons & steps)
Test Group 8: Longitudinal Life Trend Analyzer (Empty state handling & time spans)
🛠️ End-to-End Workflow
Registration / Login
      │
      ▼
Role-Based Dashboard (Client / Palm Reader / Tarot Reader / Consultant / Admin)
      │
      ├───────────────────────────────────────────────┐
      ▼                                               ▼
Palm Biometric Analysis                       78-Card Tarot Experience
(Life/Head/Heart Line detection)              (1, 3, or 5-card spreads)
      │                                               │
      └──────────────────────┬────────────────────────┘
                             ▼
                 Multi-Modal AI Synthesis
              (Cross-Modal Harmonic Fusion)
                             │
                             ▼
              Reflective Personality & Themes
                             │
                             ▼
              Evidence-Based Recommendations
                             │
                             ▼
                   Personal / Role History
                             │
                             ▼
               Reports & Analytical Export
                   (PDF / Excel Dossiers)
                             │
                             ▼
               Executive Platform Governance
                  (Health, Audits, KPIs)
