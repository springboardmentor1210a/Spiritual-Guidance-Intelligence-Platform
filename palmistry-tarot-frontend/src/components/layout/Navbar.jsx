import { Link } from "react-router-dom";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="w-full border-b border-line bg-void/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-gold">
          Palmistry & Tarot
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-inkMuted">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
          <a href="#features" className="hover:text-ink transition-colors">Features</a>
          <a href="#about" className="hover:text-ink transition-colors">About</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary">Get Started</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}