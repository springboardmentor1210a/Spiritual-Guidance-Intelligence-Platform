import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { SIDEBAR_CONFIG } from "../../config/roles";

export default function Sidebar() {
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = SIDEBAR_CONFIG[role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-64 h-full bg-surface border-r border-line flex flex-col overflow-y-auto">
      {/* App title + role */}
      <div className="px-5 py-5 border-b border-line/40">
        <span className="font-display text-lg text-gold block">Palmistry &amp; Tarot</span>
        <p className="text-xs text-inkMuted uppercase tracking-widest font-medium mt-1">{role}</p>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-3">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors ${
                isActive ? "bg-gold/10 text-gold" : "text-inkMuted hover:bg-surfaceHover hover:text-ink"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-inkMuted hover:bg-surfaceHover hover:text-ink transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}