import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ROLES, DASHBOARD_PATH } from "../config/roles";

export default function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      setError(null);
      const role = await loginWithGoogle();
      navigate(DASHBOARD_PATH[role] || DASHBOARD_PATH.USER);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
           // Role is now automatically determined from the authenticated JWT payload
      // and the database record upon successful login, then used for role-based
      // dashboard redirection
      const role = await login(email, password);
      navigate(DASHBOARD_PATH[role] || DASHBOARD_PATH.USER);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl mb-1">Welcome back</h1>
        <p className="text-inkMuted text-sm mb-6">
          Log in to continue your journey of self-reflection.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          
          <div>
            <label className="text-sm text-inkMuted block mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
              placeholder="demo@gmail.com"
            />
          </div>

          <div>
            <label className="text-sm text-inkMuted block mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm text-inkMuted">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="accent-gold" />
              Remember me
            </label>
            <a href="#" className="hover:text-gold">Forgot password?</a>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Login
          </Button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-line"></div>
            <span className="flex-shrink-0 mx-4 text-inkMuted text-sm">or</span>
            <div className="flex-grow border-t border-line"></div>
          </div>

          <Button 
            type="button" 
            variant="secondary" 
            className="w-full bg-void border border-line text-ink hover:bg-line/50 transition-colors"
            onClick={handleGoogleLogin}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? "Signing in..." : "Sign in with Google"}
          </Button>
        </form>

        <p className="text-sm text-inkMuted text-center mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-gold hover:underline">
            Register
          </Link>
        </p>
      </Card>
    </div>
  );
}