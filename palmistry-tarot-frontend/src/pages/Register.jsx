import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ROLES, DASHBOARD_PATH } from "../config/roles";

export default function Register() {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [error, setError] = useState(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoadingGoogle(true);
      setError(null);
      const role = await loginWithGoogle();
      navigate(DASHBOARD_PATH[role] || DASHBOARD_PATH[ROLES.USER]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const name = e.target.fullname.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;
    const role = e.target.role.value;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const returnedRole = await register(name, email, password, role);
      navigate(DASHBOARD_PATH[returnedRole] || DASHBOARD_PATH[ROLES.USER]);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
      <Card className="w-full max-w-sm">
        <h1 className="text-2xl mb-1">Create your account</h1>
        <p className="text-inkMuted text-sm mb-6">Begin your journey of self-reflection.</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <div>
            <label className="text-sm text-inkMuted block mb-1">Full Name</label>
            <input name="fullname" type="text" required className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors" placeholder="Jane Doe" />
          </div>

          <div>
            <label className="text-sm text-inkMuted block mb-1">Email</label>
            <input name="email" type="email" required className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors" placeholder="you@example.com" />
          </div>

          <div>
            <label className="text-sm text-inkMuted block mb-1">Password</label>
            <input name="password" type="password" required className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors" placeholder="••••••••" />
          </div>

          <div>
            <label className="text-sm text-inkMuted block mb-1">Confirm Password</label>
            <input name="confirmPassword" type="password" required className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors" placeholder="••••••••" />
          </div>

          <div>
            <label className="text-sm text-inkMuted block mb-1">Role</label>
            <select
              name="role"
              defaultValue={ROLES.USER}
              className="w-full bg-void border border-line rounded-card px-3 py-2 text-sm outline-none focus:border-gold transition-colors"
            >
              {Object.values(ROLES).map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2">
            Create Account
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
            {loadingGoogle ? "Signing in..." : "Sign up with Google"}
          </Button>
        </form>

        <p className="text-sm text-inkMuted text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-gold hover:underline">Login</Link>
        </p>
      </Card>
    </div>
  );
}