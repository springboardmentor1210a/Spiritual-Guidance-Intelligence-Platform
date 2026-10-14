# Palmistry & Tarot Intelligence Platform

An enterprise-grade, AI-powered spiritual intelligence platform that harmonizes **Computer Vision Palm Analysis** and **78-Card Tarot Divination** to generate personalized spiritual insights, personality profiling, life trend forecasting, and actionable personal growth blueprints.

---

## 🌟 Key Capabilities & Implemented Modules

1. **User Authentication & Role-Based Access Control (RBAC)**:
   - Secure JWT token authentication with 4 roles: `User` (Seeker), `Tarot Reader`, `Spiritual Consultant`, `Administrator`.
   - Seamless role-switching bar with pre-configured seed accounts.
2. **User Profile Management**:
   - Custom spiritual goals, reading preferences, age group, and session history tracking.
3. **Computer Vision Palm Analysis Engine**:
   - Extraction of the **5 Core Lines**: *Life Line*, *Head Line*, *Heart Line*, *Fate Line*, and *Sun Line*.
   - Morphological edge gradients & **4 Elemental Hand Shape Classifications** (*Earth*, *Air*, *Fire*, *Water* hands).
   - **7 Planetary Mounts**: Jupiter, Saturn, Apollo/Sun, Mercury, Venus, Moon/Luna, and Mars.
   - Interactive HTML5 canvas & SVG line overlays with toggleable masks and confidence gauges.
4. **Full 78-Card Tarot Reading Engine**:
   - Complete 78-card deck (22 Major Arcana + 56 Minor Arcana across Wands, Cups, Swords, Pentacles).
   - 4 Deck Aesthetics: *Classic Rider-Waite*, *Mystic Celestial*, *Arcane Ethereal*, *Modern Minimalist*.
   - 3D tactile card shuffling and flip animations with upright and reversal mechanics.
   - **6 Specialized Spreads**:
     1. `Single Card Reading` (1 Card — Daily focus)
     2. `Three Card Reading` (3 Cards — Past / Present / Future)
     3. `Relationship Spread` (5 Cards — Soul bond & hidden friction)
     4. `Career Spread` (5 Cards — Professional growth & trajectory)
     5. `Celtic Cross Spread` (10 Cards — Master multi-dimensional view)
     6. `Life Path Spread` (7 Cards — Soul essence & life calling)
5. **AI Cross-Modality Interpretation & Synthesis Engine**:
   - Deep cross-modality synthesis linking palm mount vigor with tarot archetypes across **7 Life Categories**:
     - *Personality*, *Relationships*, *Career*, *Finance*, *Health & Wellness*, *Personal Growth*, *Life Opportunities*.
6. **Spiritual Guidance Weighted Scoring Model**:
   - Exact mathematical implementation of the specification formula:
     $$\text{Insight Score} = 0.30 \times \text{PalmConf} + 0.25 \times \text{TarotRel} + 0.20 \times \text{PersonalityAlign} + 0.15 \times \text{UserContext} + 0.10 \times \text{Consistency}$$
7. **Personality & Life Trend Observatory**:
   - Big Five Spiritual Quotient Radar Chart (Chart.js), 4-Element Balance Meters.
   - 30-Day, 90-Day, 6-Month, and 1-Year Life Trend timeline projections.
   - Astronomical Biorhythm cycles (Intuition, Emotional, Vitality, Material).
8. **Recommendation & Ritual Engine**:
   - Step-by-step action plans, crystal/color correspondences, affirmations, and meditation prompts.
9. **4 Dedicated Role Dashboards**:
   - **Seeker (User)**: Reading logs, spiritual streak, active goals.
   - **Tarot Reader**: Client session queue, archetype draw frequency heatmaps, reader notes.
   - **Spiritual Consultant**: Cohort seeker trend monitoring, guidance effectiveness (+18.4%), growth velocity.
   - **Administrator**: Platform health, active AI models, User RBAC management, security audit logs.
10. **Reports & Export System**:
    - **PDF Export**: Download styled, multi-page PDF reports via ReportLab.
    - **Excel Export**: Multi-tab formatted `.xlsx` workbooks via openpyxl.
11. **Notification & Engagement System**:
    - Unread alert drawer, daily wisdom trigger simulation, spiritual milestone badges.

---

## 🚀 Quick Start Guide

### 1. Local Run
```powershell
# Navigate to the project root
cd "C:\Users\IT LAB-1\.gemini\antigravity\scratch\palmistry_tarot_platform"

# Run tests
python -m pytest tests/ -v

# Start application server
python run.py
```
Open your browser at **`http://127.0.0.1:8000`** to access the web application, or **`http://127.0.0.1:8000/docs`** for the OpenAPI Swagger interface.

---

### 2. Seed Test Credentials

| Role | Email | Password | Persona |
| :--- | :--- | :--- | :--- |
| **User (Seeker)** | `user@mystic.io` | `SeekerPass2026!` | Aria Solstice |
| **Tarot Reader** | `reader@mystic.io` | `ReaderPass2026!` | Madame Seraphina |
| **Spiritual Consultant** | `consultant@mystic.io` | `ConsultantPass2026!` | Zachary Vance |
| **Administrator** | `admin@mystic.io` | `AdminPass2026!` | Grand Sovereign Admin |

*(Alternatively, use the 1-Click Google Account & Apple ID OAuth login buttons on the web interface).*

---

### 3. Docker Deployment

Deploying with Docker is fully containerized and reproducible across any operating system or cloud provider.

#### Option A: Docker Compose (Recommended)
```bash
# Build and launch the container in the background
docker compose up --build -d

# View live application logs
docker compose logs -f

# Stop the container
docker compose down
```

#### Option B: Standalone Docker Commands
```bash
# 1. Build the Docker image
docker build -t mystic-palmistry-tarot .

# 2. Run the container with volume persistence
docker run -d -p 8000:8000 -v $(pwd)/data:/app/data --name palmistry_tarot_platform mystic-palmistry-tarot

# 3. View logs
docker logs -f palmistry_tarot_platform
```

#### Option C: 1-Click Scripts
- **Windows**: Double-click `docker-run.bat`
- **Linux / macOS**: Run `./docker-run.sh`

Once running, access the platform at:
- **Web App**: http://localhost:8000
- **Interactive Swagger Docs**: http://localhost:8000/docs
- **Live link** : https://ai-palmistry-tarot-latest.onrender.com/
- 
