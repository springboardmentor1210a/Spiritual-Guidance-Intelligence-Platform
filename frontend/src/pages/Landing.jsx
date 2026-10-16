import { ArrowRight, BookOpen, Fingerprint, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  ["Palm Intelligence", "Explore structured palm features through an interactive analysis workflow.", Fingerprint],
  ["Tarot Guidance", "Draw three cards and explore traditional Past, Present and Future meanings.", BookOpen],
  ["Private Profile", "Keep your reading preferences and personal context in one secure profile.", ShieldCheck],
];

export default function Landing() {
  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> Spiritual intelligence, thoughtfully designed</div>
          <h1>Read the patterns.<br /><em>Reflect on the possibilities.</em></h1>
          <p>
            A modern palmistry and tarot experience combining structured reading
            workflows, personalized context and an elegant digital interface.
          </p>
          <div className="hero-actions">
            <Link className="button primary large" to="/register">Begin your journey <ArrowRight size={18} /></Link>
            <Link className="button ghost large" to="/login">Sign in</Link>
          </div>
          <div className="hero-note">Traditional interpretations are for reflection and entertainment, not guaranteed predictions.</div>
        </div>
        <div className="hero-orbit">
          <div className="orbit-card">
            <Sparkles size={25} />
            <span>Intuition</span>
          </div>
          <div className="orbit-center">✦</div>
          <div className="orbit-card lower">
            <BookOpen size={25} />
            <span>Insight</span>
          </div>
        </div>
      </section>

      <section className="feature-grid landing-features">
        {features.map(([title, text, Icon]) => (
          <div className="feature-card" key={title}>
            <div className="feature-icon"><Icon size={21} /></div>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </section>
    </div>
  );
}