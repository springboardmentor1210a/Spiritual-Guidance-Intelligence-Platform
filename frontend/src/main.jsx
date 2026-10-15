// src/main.jsx

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.jsx';

/*
 * ============================================================
 * LUNARA APPLICATION ENTRY POINT
 * ============================================================
 *
 * This file is responsible for:
 *
 * 1. Loading the global stylesheet.
 * 2. Loading the main App component.
 * 3. Mounting Lunara into the #root element.
 * 4. Running the application inside React StrictMode.
 *
 * No application logic should be placed here.
 *
 * ============================================================
 */

// ------------------------------------------------------------
// Locate the React root element
// ------------------------------------------------------------

const rootElement = document.getElementById('root');

// ------------------------------------------------------------
// Safety check
// ------------------------------------------------------------

if (!rootElement) {
  throw new Error(
    'Lunara could not start because the #root element was not found.'
  );
}

// ------------------------------------------------------------
// Create and mount the React application
// ------------------------------------------------------------

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);