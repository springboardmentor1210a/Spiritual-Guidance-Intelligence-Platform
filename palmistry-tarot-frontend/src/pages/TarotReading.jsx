import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import * as api from "../services/api";
import { TAROT_SPREADS } from "../data/tarotDataset";
import { useAuth } from "../context/AuthContext";

function shuffleDeck(deck) {
  const next = [...deck];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function CardFace({ card, className = "" }) {
  if (card?.image) {
    return (
      <img
        src={card.image}
        alt={card.name}
        className={`w-full h-full object-cover ${card.reversed ? "rotate-180" : ""} ${className}`}
      />
    );
  }
  return (
    <div className={`flex flex-col items-center justify-center p-2 text-center h-full ${className}`}>
      <Sparkles className="text-gold/70 mb-1" size={16} />
      <span className="text-xs">{card?.name}</span>
    </div>
  );
}

export default function TarotReading() {
  const { user } = useAuth();
  const [deck, setDeck] = useState([]);
  const [deckStatus, setDeckStatus] = useState("loading");
  const [spread, setSpread] = useState(null);
  const [stage, setStage] = useState("deck");
  const [drawnCards, setDrawnCards] = useState([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .getTarotDeck()
      .then((cards) => {
        if (cancelled) return;
        setDeck(cards);
        setDeckStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setDeckStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelectSpread = (option) => {
    if (!option || deck.length < option.cardCount) return;
    setSpread(option);
  };

  const handleShuffle = () => {
    if (!spread || deck.length < spread.cardCount || isSubmitting) return;
    setIsSubmitting(true);
    setStage("shuffling");
    setTimeout(() => {
      setDeck(shuffleDeck(deck));
      setStage("selecting");
      setDrawnCards([]);
      setIsSubmitting(false);
    }, 1600);
  };

  const handleSelectCard = (card) => {
    if (stage !== "selecting") return;
    if (drawnCards.find((c) => c.id === card.id)) return;
    
    const i = drawnCards.length;
    const newCard = {
      ...card,
      reversed: Math.random() < 0.3,
      position: spread.positions[i] || `Card ${i + 1}`,
    };
    
    const newDrawn = [...drawnCards, newCard];
    setDrawnCards(newDrawn);
    
    if (newDrawn.length >= spread.cardCount) {
      setStage("dealt");
      setRevealedCount(0);
    }
  };

  useEffect(() => {
    if (stage !== "dealt") return;
    if (revealedCount >= drawnCards.length) return;
    const t = setTimeout(() => setRevealedCount((c) => c + 1), 400);
    return () => clearTimeout(t);
  }, [stage, revealedCount, drawnCards.length]);

  const allDealt = stage === "dealt" && revealedCount >= drawnCards.length;

  const handleViewResults = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const selectedCards = drawnCards.map((c) => ({
        id: c.id,
        name: c.name,
        reversed: !!c.reversed,
        position: c.position,
        meaning: c.meaning,
        meaningReversed: c.meaningReversed,
      }));

      // Generate & save reading strictly once inside this user-initiated click trigger
      const result = await api.generateTarotSpread({
        cards: selectedCards,
        spreadType: spread?.id || "three",
        uid: user?.uid,
      });

      navigate("/tarot-results", {
        state: {
          spread,
          cards: drawnCards,
          reading: result,
          isSaved: true
        },
      });
    } catch (err) {
      console.error("Tarot generation error:", err);
      navigate("/tarot-results", {
        state: {
          spread,
          cards: drawnCards,
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetReading = () => {
    setStage("deck");
    setSpread(null);
    setDrawnCards([]);
    setRevealedCount(0);
    setIsSubmitting(false);
  };

  const getFanStyle = (i, total) => {
    const mid = (total - 1) / 2;
    const offset = i - mid;
    const angle = offset * 10;
    const lift = Math.abs(offset) * 6;
    return {
      transform: `rotate(${angle}deg) translateY(${lift}px)`,
      transformOrigin: "bottom center",
      zIndex: 10 - Math.abs(offset),
      marginLeft: i === 0 ? 0 : -20,
    };
  };



  return (
    <div className="max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-2xl mb-1">Tarot Reading</h1>
        <p className="text-inkMuted text-sm">
          Choose a spread (2–5 cards), then shuffle the live deck to reveal your reading.
        </p>
      </div>

      {deckStatus === "loading" && (
        <Card>
          <p className="text-sm text-inkMuted">Loading tarot dataset…</p>
        </Card>
      )}

      {deckStatus === "error" && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-red-400">Could not load the tarot deck.</p>
          <Button
            variant="secondary"
            onClick={() => {
              setDeckStatus("loading");
              api.getTarotDeck().then((cards) => {
                setDeck(cards);
                setDeckStatus("ready");
              }).catch(() => setDeckStatus("error"));
            }}
          >
            Try again
          </Button>
        </Card>
      )}

      {deckStatus === "ready" && (stage === "deck" || stage === "shuffling" || stage === "selecting") && (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-center gap-2 max-w-5xl mx-auto">
              {deck.map((card, i) => {
                const isSelected = drawnCards.some((c) => c.id === card.id);
                if (isSelected && stage === "selecting") {
                  return <div key={card.id} className="w-8 sm:w-10" />; // Empty space
                }
                return (
                <div key={card.id} className={`relative w-8 h-16 sm:w-10 sm:h-20 ${stage === "selecting" ? "hover:-translate-y-2 cursor-pointer" : ""}`} onClick={() => handleSelectCard(card)}>
                  <div
                    className={`absolute inset-0 rounded border border-gold bg-surface overflow-hidden ${
                      stage === "shuffling" ? "tarot-shuffle-card" : ""
                    }`}
                    style={{ animationDelay: `${(i % 8) * 0.04}s` }}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-void">
                      <Sparkles className="text-gold/40" size={12} />
                    </div>
                  </div>
                </div>
              )})}
            </div>



          {stage === "deck" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-inkMuted text-center">
                Select a spread — {deck.length} cards loaded
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {TAROT_SPREADS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectSpread(option)}
                    className={`text-left rounded-card border-2 p-4 transition-colors ${
                      spread?.id === option.id
                        ? "border-gold bg-gold/10"
                        : "border-line hover:border-gold/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{option.name}</span>
                      <span className="text-xs text-gold">{option.cardCount} cards</span>
                    </div>
                    <p className="text-xs text-inkMuted">{option.description}</p>
                  </button>
                ))}
              </div>
              {spread && (
                <div className="flex justify-center">
                  <Button variant="primary" onClick={handleShuffle} disabled={isSubmitting}>
                    {isSubmitting ? "Shuffling…" : "Shuffle Deck"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {stage === "shuffling" && (
            <p className="text-sm text-gold text-center">Shuffling the deck…</p>
          )}

          {stage === "selecting" && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-gold text-center">
                Select {spread.cardCount - drawnCards.length} more card{spread.cardCount - drawnCards.length !== 1 ? 's' : ''} for your {spread.name} spread
              </p>
            </div>
          )}
        </div>
      )}

      {stage === "dealt" && (
        <div className="flex flex-col gap-10">
          <p className="text-sm text-gold text-center">{spread?.name} spread</p>
          <div className="flex justify-center items-end py-6 flex-wrap">
            {drawnCards.map((card, i) => {
              const isRevealed = i < revealedCount;
              return (
                <div key={`${card.id}-${i}`} className="relative" style={getFanStyle(i, drawnCards.length)}>
                  <div className="w-20 sm:w-24 md:w-28 h-32 sm:h-36 md:h-44" style={{ perspective: "800px" }}>
                    <div
                      className="relative w-full h-full transition-transform duration-500"
                      style={{
                        transformStyle: "preserve-3d",
                        transform: isRevealed ? "rotateY(180deg)" : "rotateY(0deg)",
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-card border-2 border-gold bg-surface flex items-center justify-center shadow-md overflow-hidden"
                        style={{ backfaceVisibility: "hidden" }}
                      >
                        <Sparkles className="text-gold/50" size={20} />
                      </div>
                      <div
                        className="absolute inset-0 rounded-card border-2 border-gold bg-surface flex flex-col overflow-hidden shadow-md"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                      >
                        <div className="flex-1 min-h-0">
                          <CardFace card={card} />
                        </div>
                        <div className="px-1 py-1 bg-void/80 text-center">
                          <span className="text-[10px] sm:text-xs leading-tight block">{card.name}</span>
                          {card.reversed && (
                            <span className="text-[9px] text-violet">Reversed</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allDealt && (
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-lg mb-4 text-center">Your Selected Cards</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {drawnCards.map((card) => (
                    <Card key={`${card.id}-info`} className="flex gap-3">
                      <div className="w-14 h-20 rounded-card overflow-hidden border border-line shrink-0">
                        <CardFace card={card} />
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <span className="text-xs text-gold uppercase tracking-wide">{card.position}</span>
                        <span className="text-sm">
                          {card.name}
                          {card.reversed ? " · Reversed" : ""}
                        </span>
                        <p className="text-xs text-inkMuted">
                          {card.reversed && card.meaningReversed ? card.meaningReversed : card.meaning}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Card>
                <h3 className="text-sm text-gold uppercase tracking-wide mb-2">
                  Next step
                </h3>
                <p className="text-sm text-inkMuted leading-relaxed">
                  Cards are drawn from the live dataset. Open the full interpretation to generate an AI reading for this {spread?.name} spread.
                </p>
              </Card>

              <div className="flex justify-center gap-4">
                <Button variant="primary" onClick={handleViewResults} disabled={isSubmitting}>
                  {isSubmitting ? "Generating Reading…" : "View Full Interpretation"}
                </Button>
                <Button variant="ghost" onClick={resetReading}>
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
