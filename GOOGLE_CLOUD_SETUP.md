# Google Cloud Platform Setup Guide

**Project:** AI Palmistry & Tarot Intelligence Platform  
**Target:** Google Sign-In & Google Meet / Calendar Integration  

---

## Overview

All code required for **Google Login (ID Token verification)**, **Google Calendar event creation**, and **Google Meet conference generation** has been implemented in the backend and frontend.

To connect your deployment with Google services, you must obtain authorized OAuth credentials from the Google Cloud Console. Follow the step-by-step instructions below.

---

## Step 1: Create or Select a Google Cloud Project

1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. In the top navigation bar, click the project dropdown and select **New Project**.
3. Enter a project name (e.g., `ai-palmistry-tarot-platform`).
4. Leave Organization unselected (or choose your organization) and click **Create**.
5. Ensure the newly created project is selected in the top bar.

---

## Step 2: Configure the OAuth Consent Screen

1. In the Google Cloud Console left menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select **User Type**:
   - Choose **External** (allows any Google account to sign in).
   - Click **Create**.
3. Fill in the **App information**:
   - **App name**: `AI Palmistry & Tarot Intelligence Platform`
   - **User support email**: Select your email address.
   - **Developer contact information**: Enter your email address.
4. Click **Save and Continue**.
5. In **Scopes**:
   - Click **Add or Remove Scopes**.
   - Select the following scopes:
     - `.../auth/userinfo.email` (View your email address)
     - `.../auth/userinfo.profile` (View your basic profile)
     - `openid` (Associate you with your personal info on Google)
     - `https://www.googleapis.com/auth/calendar.events` (Create and update Google Calendar & Meet events)
   - Click **Update** and then **Save and Continue**.
6. In **Test users** (while app is in Testing mode):
   - Click **Add Users**.
   - Add the Gmail addresses you will use for testing (both client and professional accounts).
   - Click **Save and Continue**.
7. Click **Back to Dashboard**.

---

## Step 3: Enable the Google Calendar API

1. In the left navigation, go to **APIs & Services** > **Library**.
2. In the search box, type `Google Calendar API`.
3. Click on **Google Calendar API** from the results.
4. Click the **Enable** button.

---

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** at the top and select **OAuth client ID**.
3. In **Application type**, select **Web application**.
4. Set **Name**: `AI Palmistry Web Client`.
5. Under **Authorized JavaScript origins**, click **+ Add URI** and add:
   - `http://localhost:5173` (Frontend Vite development server)
   - `http://localhost:8000` (Backend FastAPI server)
6. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   - `http://localhost:8000/api/google/calendar/callback`
7. Click **Create**.
8. A modal will display your:
   - **Client ID** (e.g., `1234567890-abcdefg.apps.googleusercontent.com`)
   - **Client secret** (e.g., `GOCSPX-xxxxxxxxxxxxxx`)
9. Copy these values securely.

---

## Step 5: Configure Backend Environment Variables

1. In your project, copy `backend/.env.example` to `backend/.env` (or create `.env` in `backend/`):
   ```bash
   cp backend/.env.example backend/.env
   ```
2. Open `backend/.env` and insert your credentials:
   ```env
   # Application Timezone
   APP_TIMEZONE=Asia/Kolkata

   # Google Cloud OAuth 2.0 Credentials
   GOOGLE_CLIENT_ID=your-actual-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-client-secret

   # Google Calendar & Meet OAuth Redirect URI
   GOOGLE_REDIRECT_URI=http://localhost:8000/api/google/calendar/callback

   # Frontend Origin
   FRONTEND_URL=http://localhost:5173
   ```
3. Restart the backend server so the environment variables take effect.

---

## Step 6: Test Locally

### A. Testing Google Sign-In
1. Open the application at `http://localhost:5173`.
2. Choose the **User** role.
3. Click **Continue with Google**.
4. When prompted by Google Identity Services, select your test Google account.
5. The backend verifies the token directly with Google's official verification endpoint, creates the account in `users.json`, and signs you into the User Dashboard.
6. Check role security: notice that Google login automatically assigns the standard `User` role. Privileged roles (`Tarot Reader`, `Spiritual Consultant`, `Administrator`) cannot be obtained through self-service Google registration.

### B. Testing Google Calendar & Meet Integration
1. As a User, go to **Spiritual Consultation**, select appointment date & future time in `Asia/Kolkata`, choose **Online / Google Meet**, and submit an appointment request.
2. Log in as the **Spiritual Consultant** or **Tarot Reader**.
3. In the appointment card, click **Accept Appointment**.
4. The backend calls Google Calendar API with `conferenceDataVersion=1`, creates the calendar event, and retrieves the Google Meet URL (`meet.google.com/...`).
5. Both the User and Professional dashboards immediately show:
   - Meeting Platform: Google Meet
   - Meeting Link: the actual generated Google Meet URL
   - A clickable `[Join Google Meet]` button.
6. If credentials are not yet configured or authorization is pending, the backend provides an honest status message and a `[Generate / Retry Google Meet Link]` button.

---

## Step 7: Configuring Production URLs Securely

When deploying to production:
1. In the Google Cloud Console under **Authorized JavaScript origins**, add your production frontend domain (e.g., `https://yourdomain.com`).
2. Under **Authorized redirect URIs**, add `https://api.yourdomain.com/api/google/calendar/callback`.
3. In your production environment, set `GOOGLE_REDIRECT_URI` to `https://api.yourdomain.com/api/google/calendar/callback` and `FRONTEND_URL` to `https://yourdomain.com`.
4. Ensure your production domains use HTTPS.
5. In the OAuth consent screen, submit for verification before moving out of Testing mode if you wish to allow public users outside your Test User list.
