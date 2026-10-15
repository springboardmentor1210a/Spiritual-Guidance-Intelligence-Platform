// eslint.config.js

import js from '@eslint/js';
import globals from 'globals';

import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

import {
  defineConfig,
  globalIgnores,
} from 'eslint/config';

/*
 * ============================================================
 * LUNARA ESLINT CONFIGURATION
 * ============================================================
 *
 * This configuration provides:
 *
 * - JavaScript recommended rules
 * - React Hooks rules
 * - React Fast Refresh compatibility
 * - Browser globals
 * - JSX parsing
 * - Vite build directory exclusion
 *
 * The configuration intentionally remains lightweight so that
 * Lunara's animated React components can use Framer Motion
 * without unnecessary lint restrictions.
 *
 * ============================================================
 */

export default defineConfig([
  // ----------------------------------------------------------
  // Generated files
  // ----------------------------------------------------------
  //
  // Vite places production build files inside dist/.
  // These files should not be linted.
  //
  globalIgnores([
    'dist',
  ]),

  // ----------------------------------------------------------
  // React / JavaScript source files
  // ----------------------------------------------------------

  {
    files: [
      '**/*.{js,jsx}',
    ],

    // --------------------------------------------------------
    // Recommended rule sets
    // --------------------------------------------------------

    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],

    // --------------------------------------------------------
    // Browser environment
    // --------------------------------------------------------

    languageOptions: {
      globals: globals.browser,

      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',

        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    // --------------------------------------------------------
    // Project-specific rules
    // --------------------------------------------------------

    rules: {
      /*
       * Keep console output available during development.
       *
       * Several Lunara components may use console warnings
       * while communicating with the backend.
       */
      'no-console': 'off',

      /*
       * Vite's React Fast Refresh works best when component
       * exports remain clean. The recommended Vite rule is
       * already enabled above.
       */
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
    },
  },
]);