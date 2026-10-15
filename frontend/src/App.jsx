import { Navigate, Route, BrowserRouter as Router, Routes, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import OAuthCallback from './components/OAuthCallback';

// These are separate components (not inline logic in App), so React
// re-invokes their function body every time the router re-renders due to
// navigation -- which means they read localStorage fresh each time,
// instead of using a value captured once when App first mounted.
// useLocation() is included defensively to guarantee a re-render on every
// route change.

function RequireAuth({ children }) {
  useLocation();
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/" replace />;
}

function RedirectIfAuthed({ children }) {
  useLocation();
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/oauth-callback"
          element={<OAuthCallback />}
        />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;