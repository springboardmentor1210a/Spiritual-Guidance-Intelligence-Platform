// vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/*
 * ============================================================
 * LUNARA VITE CONFIGURATION
 * ============================================================
 *
 * Vite handles:
 *
 * - Development server
 * - React JSX transformation
 * - Production builds
 * - Hot Module Replacement
 * - Asset handling
 *
 * The configuration intentionally stays lightweight because
 * Lunara uses the standard Vite + React architecture.
 *
 * ============================================================
 */

export default defineConfig({
  // ----------------------------------------------------------
  // React plugin
  // ----------------------------------------------------------
  //
  // Enables JSX transformation and React Fast Refresh during
  // development.
  //
  plugins: [
    react(),
  ],

  // ----------------------------------------------------------
  // Development server
  // ----------------------------------------------------------
  //
  // Keep Vite's normal development behaviour.
  //
  server: {
    host: 'localhost',
  },

  // ----------------------------------------------------------
  // Production build
  // ----------------------------------------------------------
  //
  // Vite's default output directory is preserved so that the
  // existing ESLint configuration can continue ignoring it.
  //
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});