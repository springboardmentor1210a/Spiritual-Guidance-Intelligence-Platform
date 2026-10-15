// src/firebase.js

import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/*
 * ============================================================
 * LUNARA FIREBASE CONFIGURATION
 * ============================================================
 *
 * Firebase services currently used by Lunara:
 *
 * 1. Firebase Authentication
 * 2. Cloud Firestore
 * 3. Firebase Analytics
 *
 * The configuration below belongs to the Lunara Firebase
 * project and should not be changed unless a different
 * Firebase project is being used.
 *
 * ============================================================
 */

const firebaseConfig = {
  apiKey: 'AIzaSyAEKxgr8JOLKeM-fu7E6HIm4L7jWQp99ck',
  authDomain: 'lunara-998c8.firebaseapp.com',
  projectId: 'lunara-998c8',
  storageBucket: 'lunara-998c8.firebasestorage.app',
  messagingSenderId: '696756863000',
  appId: '1:696756863000:web:f00d944d4a1e34d959036d',
  measurementId: 'G-1NM5WK1P6N',
};

// ------------------------------------------------------------
// Initialize Firebase
// ------------------------------------------------------------

const app = initializeApp(firebaseConfig);

// ------------------------------------------------------------
// Firebase Authentication
// ------------------------------------------------------------
//
// Exported so components can use:
//
// import { auth } from '../firebase';
//
// ------------------------------------------------------------

export const auth = getAuth(app);

// ------------------------------------------------------------
// Cloud Firestore
// ------------------------------------------------------------
//
// Exported so components can use:
//
// import { db } from '../firebase';
//
// ------------------------------------------------------------

export const db = getFirestore(app);

// ------------------------------------------------------------
// Firebase Analytics
// ------------------------------------------------------------
//
// Analytics is supported only in compatible browser
// environments. We check support before initializing it.
//
// This prevents Analytics from breaking the entire React
// application when running in an unsupported environment.
//
// ------------------------------------------------------------

let analytics = null;

isSupported()
  .then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  })
  .catch((error) => {
    console.warn(
      'Lunara Firebase Analytics is unavailable:',
      error
    );
  });

// Export Analytics in case another component needs it later.
export { analytics };

// ------------------------------------------------------------
// Default Firebase App
// ------------------------------------------------------------
//
// Keeping the app available makes it easier to access other
// Firebase services in the future without reinitializing Firebase.
//
// ------------------------------------------------------------

export default app;