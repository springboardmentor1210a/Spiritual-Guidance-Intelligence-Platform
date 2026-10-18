import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import HeroVisual from "../components/feature/HeroVisual";

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl leading-tight mb-6">
            Discover Insights Through{" "}
            <span className="text-gold">Palmistry & Tarot</span>
          </h1>
          <p className="text-inkMuted text-lg mb-8 max-w-md">
            Explore personalized spiritual insights through AI-powered palm
            analysis and tarot readings.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register">
              <Button variant="primary">Start Your Reading</Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="secondary">Explore How It Works</Button>
            </a>
          </div>
        </div>

       <div className="flex justify-center">
  <div className="w-72 h-72 rounded-full bg-gradient-to-br from-violet/20 to-gold/10 border border-line flex items-center justify-center p-8">
    <HeroVisual />
  </div>
</div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl mb-12 text-center">How It Works</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            "Choose your reading",
            "Upload your palm or select tarot cards",
            "Let AI analyze the reading",
            "Explore your personalized insights",
          ].map((step, i) => (
            <Card key={i}>
              <span className="text-gold font-display text-2xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-3 text-sm text-inkMuted">{step}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl mb-12 text-center">Features</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            "AI Palm Analysis",
            "Interactive Tarot Reading",
            "Personality Insights",
            "Life Trend Analysis",
            "Personalized Recommendations",
            "Reading History",
          ].map((feature) => (
            <Card key={feature} hover>
              <h3 className="text-lg mb-2">{feature}</h3>
              <p className="text-sm text-inkMuted">
                Explore how this shapes your personalized journey.
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Use the Platform */}
      <section id="about" className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl mb-6">Why Use This Platform</h2>
        <p className="text-inkMuted text-lg">
          The platform combines computer vision, symbolic tarot analysis, AI
          interpretation, and personalized context to offer a reflective
          space for self-exploration — not scientific prediction.
        </p>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl mb-6">Ready to explore your insights?</h2>
        <Link to="/register">
          <Button variant="primary">Start Reading</Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap justify-between gap-4 text-sm text-inkMuted">
          <span>© 2026 Palmistry & Tarot Intelligence Platform</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-ink">Privacy</a>
            <a href="#" className="hover:text-ink">Terms</a>
            <a href="#" className="hover:text-ink">Disclaimer</a>
            <a href="#" className="hover:text-ink">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}