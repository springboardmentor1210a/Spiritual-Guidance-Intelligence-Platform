import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";

import { apiRequest } from "../api/client";
import {
  saveTarotReading,
  createReadingReport,
} from "../api/tarot";
import {
  setActiveReadingSession,
} from "../services/activeReading";
const SPREADS = [
  {
    id: "single_card",
    name: "Single Card",
    description: "One card for focused guidance.",
    cards: 1,
  },
  {
    id: "three_card",
    name: "Three Card",
    description: "Past, Present and Future.",
    cards: 3,
  },
  {
    id: "relationship",
    name: "Relationship",
    description: "You, the other person and relationship energy.",
    cards: 3,
  },
  {
    id: "career",
    name: "Career",
    description: "Current career, challenge and guidance.",
    cards: 3,
  },
  {
    id: "celtic_cross",
    name: "Celtic Cross",
    description: "A detailed ten-card reading.",
    cards: 10,
  },
  {
    id: "life_path",
    name: "Life Path",
    description: "Seven cards exploring your path.",
    cards: 7,
  },
];


const CONTEXTS = [
  {
    id: "general",
    name: "General",
  },
  {
    id: "love",
    name: "Love",
  },
  {
    id: "career",
    name: "Career",
  },
  {
    id: "mood",
    name: "Mood",
  },
  {
    id: "spiritual",
    name: "Spiritual",
  },
];


export default function TarotReading() {

  const navigate = useNavigate();

  // =======================================================
  // Selection state
  // =======================================================

  const [spread, setSpread] = useState("three_card");

  const [context, setContext] = useState("general");


  // =======================================================
  // Tarot selection session
  // =======================================================

  const [session, setSession] = useState(null);

  const [selectedCards, setSelectedCards] = useState([]);


  // =======================================================
  // Reading state
  // =======================================================

  const [reading, setReading] = useState(null);


  // =======================================================
  // UI state
  // =======================================================

  const [loading, setLoading] = useState(false);

  const [selectingCard, setSelectingCard] = useState(null);

  const [generating, setGenerating] = useState(false);

  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);

  const [saving, setSaving] = useState(false);

  const [isShuffling, setIsShuffling] = useState(false);
  // =======================================================
  // Selected spread
  // =======================================================

  const selectedSpread = useMemo(
    () =>
      SPREADS.find(
        (item) => item.id === spread
      ),
    [spread]
  );


  // =======================================================
  // Start 78-card selection
  // =======================================================

  async function startReading() {

    setLoading(true);
    setError("");
    setSaved(false);
    setReading(null);
    setSelectedCards([]);
    setSession(null);

    try {

      const data = await apiRequest(
        "/api/v1/tarot/selection-session",
        {
          method: "POST",
          body: JSON.stringify({
            spread,
            context,
          }),
        }
      );

      setSession(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to start the Tarot reading."
      );

    } finally {

      setLoading(false);

    }
  }
function shuffleDeck() {
  if (!session || isShuffling || selectingCard !== null) {
    return;
  }

  setIsShuffling(true);

  setTimeout(() => {
    setSession((currentSession) => {
      if (!currentSession) {
        return currentSession;
      }

      const shuffledCards = [
        ...currentSession.available_cards,
      ];

      for (
        let i = shuffledCards.length - 1;
        i > 0;
        i--
      ) {
        const j = Math.floor(
          Math.random() * (i + 1)
        );

        [
          shuffledCards[i],
          shuffledCards[j],
        ] = [
          shuffledCards[j],
          shuffledCards[i],
        ];
      }

      return {
        ...currentSession,
        available_cards: shuffledCards,
      };
    });

    setIsShuffling(false);
  }, 900);
}

  // =======================================================
  // Select one of the 78 cards
  // =======================================================

  async function selectCard(card) {

    if (!session) return;

    // Prevent duplicate selection
    if (
      selectedCards.some(
        (item) => item.card_id === card.card_id
      )
    ) {
      return;
    }

    // Do not allow more cards than required
    if (
      selectedCards.length >=
      session.card_count
    ) {
      return;
    }

    if (selectingCard !== null) {
      return;
    }

    setSelectingCard(card.card_id);
    setError("");

    try {

      const data = await apiRequest(
        `/api/v1/tarot/selection-session/${session.session_id}/select`,
        {
          method: "POST",
          body: JSON.stringify({
            card_id: card.card_id,
          }),
        }
      );

      setSelectedCards([
        ...selectedCards,
        data.card,
      ]);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to select this card."
      );

    } finally {

      setSelectingCard(null);

    }
  }


  // =======================================================
  // Remove selected card
  // =======================================================

  async function removeCard(card) {

    if (!session) return;

    setError("");

    try {

      await apiRequest(
        `/api/v1/tarot/selection-session/${session.session_id}/select/${card.card_id}`,
        {
          method: "DELETE",
        }
      );

      setSelectedCards(
        selectedCards.filter(
          (item) =>
            item.card_id !== card.card_id
        )
      );

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to remove this card."
      );
    }
  }


  // =======================================================
  // Generate completed reading
  // =======================================================

  async function generateReading() {

    if (!session) return;

    if (
      selectedCards.length !==
      session.card_count
    ) {
      setError(
        `Please select exactly ${session.card_count} ${
          session.card_count === 1
            ? "card"
            : "cards"
        } before generating the reading.`
      );

      return;
    }

    setGenerating(true);
    setError("");

    try {

      const data = await apiRequest(
        `/api/v1/tarot/selection-session/${session.session_id}/reading`
      );

      setReading(data);

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Unable to generate the Tarot reading."
      );

    } finally {

      setGenerating(false);

    }
  }


  // =======================================================
  // Reset everything
  // =======================================================

  function resetReading() {

    setSession(null);
    setSelectedCards([]);
    setReading(null);
    setSaved(false);
    setError("");
    setSelectingCard(null);
    setGenerating(false);
    setIsShuffling(false);
  }


  // =======================================================
  // Change spread before starting
  // =======================================================

  function changeSpread(value) {

    setSpread(value);

    setSession(null);
    setSelectedCards([]);
    setReading(null);
    setError("");
    setIsShuffling(false);
  }


  // =======================================================
  // Save reading + generate report
  // =======================================================

  async function saveReading() {

    if (!reading || !session || saving) {
      return;
    }

    try {

      setSaving(true);
      setError("");

      // 1. Save the generated Tarot reading
      const savedReading = await saveTarotReading(
        session.session_id
      );

      if (savedReading?.reading_session_id) {
      setActiveReadingSession(
      savedReading.reading_session_id
     );
    }
      if (savedReading?.reading_session_id) {
        localStorage.setItem(
        "latest_tarot_reading_session_id",
        String(savedReading.reading_session_id)
        );
      }
      const interpretation = await apiRequest(
        `/api/v1/ai-interpretations/reading-session/${savedReading.reading_session_id}`,
        {
        method: "POST",
        }
      );
      // 2. Generate a database report from that reading session
      const report = await createReadingReport(
        savedReading.reading_session_id
      );

      // 3. Open the generated report
      setSaved(true);

      navigate(`/reports/${report.id}`);

    } catch (err) {

      setError(
        err.message ||
        "Unable to save and generate the report."
      );

    } finally {

      setSaving(false);

    }
  }
  // =======================================================
  // COMPLETE READING
  // =======================================================

  if (reading) {

    return (
      <TarotResult
        reading={reading}
        onAgain={resetReading}
        onSave={saveReading}
        saved={saved}
      />
    );
  }


  // =======================================================
  // 78-CARD SELECTION SESSION
  // =======================================================

  if (session) {

    return (
      <TarotCardSelection
        session={session}
        selectedCards={selectedCards}
        selectingCard={selectingCard}
        generating={generating}
        error={error}
        isShuffling={isShuffling}
        onSelect={selectCard}
        onRemove={removeCard}
        onGenerate={generateReading}
        onReset={resetReading}
        onShuffle={shuffleDeck}
      />
    );
  }


  // =======================================================
  // SPREAD + CONTEXT SELECTION
  // =======================================================

  return (
    <div className="page-container">

      {/* ===================================================
          PAGE TITLE
          =================================================== */}

      <div className="page-title">

        <div className="page-title-icon">
          <BookOpen />
        </div>

        <div>

          <span className="section-kicker">
            TAROT INTELLIGENCE
          </span>

          <h1>
            Tarot Reading
          </h1>

          <p>
            Choose your spread and focus before
            selecting your cards.
          </p>

        </div>

      </div>


      {/* ===================================================
          DATASET BANNER
          =================================================== */}

      <section className="tarot-banner">

        <div>

          <Sparkles size={18} />

          <span>
            78-card Tarot dataset · Upright & Reversed
          </span>

        </div>

        <span>

          {selectedSpread?.cards}{" "}

          {selectedSpread?.cards === 1
            ? "card"
            : "cards"}

        </span>

      </section>


      {/* ===================================================
          STEP 1 — SPREAD
          =================================================== */}

      <section className="panel tarot-selection-panel">

        <div className="selection-header">

          <div>

            <span className="section-kicker">
              STEP 1 · THE SPREAD
            </span>

            <h2>
              How would you like to explore?
            </h2>

            <p>
              Choose a reading style that matches
              what you want to reflect on.
            </p>

          </div>


          <div className="selection-count">

            {selectedSpread?.cards}{" "}

            {selectedSpread?.cards === 1
              ? "card"
              : "cards"}

          </div>

        </div>


        <div className="spread-options">

          {SPREADS.map(
            (item, index) => (

              <button
                key={item.id}
                type="button"
                className={`spread-option ${
                  spread === item.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  changeSpread(item.id)
                }
              >

                <div className="spread-option-top">

                  <span className="spread-number">
                    0{index + 1}
                  </span>

                  <span className="spread-card-count">

                    {item.cards}{" "}

                    {item.cards === 1
                      ? "CARD"
                      : "CARDS"}

                  </span>

                </div>


                <div className="spread-icon">

                  {item.cards === 1
                    ? "✦"
                    : item.cards === 3
                    ? "✦ ✦ ✦"
                    : item.cards === 7
                    ? "✦ ✦ ✦"
                    : "✦"}

                </div>


                <strong>
                  {item.name}
                </strong>


                <span className="spread-description">
                  {item.description}
                </span>


                <div className="spread-select-indicator">

                  <span>

                    {spread === item.id
                      ? "Selected"
                      : "Select spread"}

                  </span>

                  <ArrowRight size={15} />

                </div>

              </button>

            )
          )}

        </div>

      </section>


      {/* ===================================================
          STEP 2 — CONTEXT
          =================================================== */}

      <section className="panel context-panel">

        <div className="selection-header">

          <div>

            <span className="section-kicker">
              STEP 2 · YOUR FOCUS
            </span>

            <h2>
              What would you like guidance on?
            </h2>

            <p>
              Select a context to make the
              interpretation more relevant.
            </p>

          </div>

        </div>


        <div className="context-options">

          {CONTEXTS.map(
            (item) => (

              <button
                key={item.id}
                type="button"
                className={`context-option ${
                  context === item.id
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  setContext(item.id)
                }
              >

                <span className="context-dot">

                  {context === item.id
                    ? "✓"
                    : ""}

                </span>

                <span>
                  {item.name}
                </span>

              </button>

            )
          )}

        </div>

      </section>


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (

        <section className="panel error-panel">

          <strong>
            Unable to start reading
          </strong>

          <p>
            {error}
          </p>

        </section>

      )}


      {/* ===================================================
          START READING
          =================================================== */}

      <section className="panel tarot-start">

        <div className="tarot-seal">
          ✦
        </div>


        <h2>
          Ready to choose your cards?
        </h2>


        <p>
          All 78 cards will be displayed.
          Choose {selectedSpread?.cards}{" "}
          {selectedSpread?.cards === 1
            ? "card"
            : "cards"}{" "}
          yourself and your selection order
          will determine the reading positions.
        </p>


        <button
          className="button primary"
          onClick={startReading}
          disabled={loading}
        >

          {loading ? (

            <>
              Preparing Deck...
            </>

          ) : (

            <>
              Begin Card Selection
              <ArrowRight size={17} />
            </>

          )}

        </button>

      </section>


      <p className="disclaimer">

        Tarot is a symbolic tradition used here for
        reflection and entertainment. The future outlook
        is not a guaranteed prediction or professional
        advice.

      </p>

    </div>
  );
}


/* =========================================================
   78-CARD TAROT SELECTION
   ========================================================= */

function TarotCardSelection({
  session,
  selectedCards,
  selectingCard,
  generating,
  error,
  isShuffling,
  onSelect,
  onRemove,
  onGenerate,
  onReset,
  onShuffle,
}) {

  const isComplete =
    selectedCards.length ===
    session.card_count;


  const selectedIds = new Set(
    selectedCards.map(
      (card) => card.card_id
    )
  );


  return (
    <div className="page-container">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="page-title">

        <div className="page-title-icon">
          <Sparkles />
        </div>

        <div>

          <span className="section-kicker">
            CARD SELECTION
          </span>

          <h1>
            {formatName(session.spread)}
          </h1>

          <p>

            Focus:{" "}

            <strong>
              {formatName(session.context)}
            </strong>

            {" · "}

            Select {session.card_count}{" "}
            {session.card_count === 1
              ? "card"
              : "cards"}

          </p>

        </div>

      </div>


      {/* ===================================================
          SELECTION STATUS
          =================================================== */}

      <section className="tarot-selection-status">

        <div>

          <span className="section-kicker">
            YOUR SELECTION
          </span>

          <strong>
            {selectedCards.length} /{" "}
            {session.card_count}
          </strong>

          <p>
            Choose the cards that feel right
            to you. Selection order determines
            the spread position.
          </p>

        </div>


        <div className="tarot-selection-status-right">

          <span>
            {isComplete
              ? "Selection complete"
              : `${session.card_count - selectedCards.length} ${
                  session.card_count - selectedCards.length === 1
                    ? "card"
                    : "cards"
                } remaining`}
          </span>

        </div>

      </section>


      {/* ===================================================
          SELECTED CARDS
          =================================================== */}

      {selectedCards.length > 0 && (

        <section className="panel">

          <div className="selection-header">

            <div>

              <span className="section-kicker">
                SELECTED IN ORDER
              </span>

              <h2>
                Your spread
              </h2>

              <p>
                Your selection order determines
                the positions in the reading.
              </p>

            </div>

          </div>


          <div className="tarot-selected-order">

            {selectedCards.map(
              (card, index) => (

                <div
                  className="tarot-selected-item"
                  key={card.card_id}
                >

                  <span className="tarot-selected-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>

                    <strong>
                      Card {String(index + 1).padStart(2, "0")}
                    </strong>

                    <span>
                      Selected · Position {String(index + 1).padStart(2, "0")}
                    </span>

                  </div>


                  <button
                    type="button"
                    onClick={() =>
                      onRemove(card)
                    }
                    disabled={generating}
                    aria-label={`Remove selected card ${index + 1}`}
                  >
                    ×
                  </button>

                </div>

              )
            )}

          </div> 

        </section>

      )}


      {/* ===================================================
          ERROR
          =================================================== */}

      {error && (

        <section className="panel error-panel">

          <strong>
            Card selection failed
          </strong>

          <p>
            {error}
          </p>

        </section>

      )}


      {/* ===================================================
          ALL 78 CARDS
          =================================================== */}

      <section className="panel">

          <div className="selection-header">

          <div>

            <span className="section-kicker">
              THE FULL DECK
            </span>

            <h2>
              Choose from all 78 cards
            </h2>

            <p>
              Select any card from the complete
              Tarot deck. There are no
              pre-selected cards.
            </p>

          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >

            <div className="selection-count">
              78 CARDS
            </div>

            <button
              type="button"
              className="button secondary"
              onClick={onShuffle}
              disabled={
                isShuffling ||
                selectingCard !== null ||
                generating
              }
            >

              <RotateCcw size={17} />

              {isShuffling
                ? "Shuffling..."
                : "Shuffle Deck"}

            </button>

          </div>

        </div>


        <div className="tarot-full-deck">

          {session.available_cards.map(
            (card) => {

              const selected =
                selectedIds.has(
                  card.card_id
                );

              const selectedIndex =
                selectedCards.findIndex(
                  (item) =>
                    item.card_id ===
                    card.card_id
                );

              const selectionDisabled =
                !selected &&
                selectedCards.length >=
                  session.card_count;


              return (

                <button
                  key={card.card_id}
                  type="button"
                  className={`tarot-deck-card ${
                    selected
                      ? "deck-selected"
                      : ""
                  }${
                    isShuffling
                      ? "deck-shuffling"
                      : ""
                  }`}
                  style={{
                    "--shuffle-delay": `${(session.available_cards.indexOf(card) % 12) * 0.04}s`,
                  }}
                  onClick={() => {

                    if (selected) {
                      onRemove(card);
                    } else if (!selectionDisabled) {
                      onSelect(card);
                    }

                  }}
                  disabled={
                    selectingCard !== null &&
                    selectingCard !== card.card_id
                  }
                  aria-label={
                    selected
                      ? `Remove card ${session.available_cards.indexOf(card) + 1}`
                      : `Select card ${session.available_cards.indexOf(card) + 1}`
                  }
                >

                  {/* =====================================
                      CARD TOP
                      ===================================== */}

                  <div className="deck-card-back">

                    <span className="deck-card-number">

                      {String(
                        session.available_cards.indexOf(card) + 1
                      ).padStart(2, "0")}

                    </span>


                    <div className="deck-card-symbol">
                      ✦
                    </div>


                    <span className="deck-card-arcana">
                      TAROT CARD
                    </span>

                  </div>


                  {/* =====================================
                      CARD INFORMATION
                      ===================================== */}

                  <div className="deck-card-info">

                    <strong>
                      Card {String(
                        session.available_cards.indexOf(card) + 1
                      ).padStart(2, "0")}
                    </strong>

                    <span>
                      Tap to select
                    </span>

                  </div>


                  {/* =====================================
                      SELECTED STATE
                      ===================================== */}

                  {selected && (

                    <div className="deck-selected-badge">

                      <Check size={12} />

                      <span>
                        {selectedIndex + 1}
                      </span>

                    </div>

                  )}


                  {/* =====================================
                      LOCKED STATE
                      ===================================== */}

                  {selectionDisabled && !selected && (

                    <div className="deck-locked">

                      <Lock size={12} />

                    </div>

                  )}

                </button>

              );

            }
          )}

        </div>

      </section>


      {/* ===================================================
          FOOTER / GENERATE
          =================================================== */}

      <section className="tarot-selection-footer">

        <div>

          <span className="section-kicker">
            READY WHEN YOU ARE
          </span>

          <strong>

            {isComplete
              ? "Your cards are selected."
              : `Select ${
                  session.card_count -
                  selectedCards.length
                } more ${
                  session.card_count -
                  selectedCards.length === 1
                    ? "card"
                    : "cards"
                }.`}

          </strong>

        </div>


        <button
          type="button"
          className="button primary"
          onClick={onGenerate}
          disabled={
            !isComplete ||
            generating ||
            selectingCard !== null
          }
        >

          {generating ? (

            <>
              Interpreting...
            </>

          ) : (

            <>
              Generate Reading
              <ArrowRight size={17} />
            </>

          )}

        </button>

      </section>


      {/* ===================================================
          ACTION
          =================================================== */}

      <div className="result-actions">

        <button
          className="button secondary"
          onClick={onReset}
          disabled={
            selectingCard !== null ||
            generating
          }
        >

          <RotateCcw size={17} />

          Start Over

        </button>

      </div>


      <p className="disclaimer">

        Tarot is a symbolic tradition used here for
        reflection and entertainment. The future outlook
        is not a guaranteed prediction or professional
        advice.

      </p>

    </div>
  );
}


/* =========================================================
   TAROT RESULT
   ========================================================= */

function TarotResult({
  reading,
  onAgain,
  onSave,
  saved,
}) {

  return (
    <div className="page-container">

      {/* ===================================================
          HEADER
          =================================================== */}

      <div className="page-title">

        <div className="page-title-icon">
          <Sparkles />
        </div>

        <div>

          <span className="section-kicker">
            YOUR READING
          </span>

          <h1>
            {formatName(reading.spread)}
          </h1>

          <p>

            Context:{" "}

            <strong>
              {formatName(reading.context)}
            </strong>

            {" · "}

            {reading.card_count} cards

          </p>

        </div>

      </div>


      {/* ===================================================
          COMPLETED READING MESSAGE
          =================================================== */}

      <section className="panel reading-complete-banner">

        <div className="complete-icon">
          <Check size={18} />
        </div>

        <div>

          <strong>
            Your card draw is complete
          </strong>

          <p>
            All {reading.card_count} cards have been
            revealed and interpreted using the Tarot
            dataset.
          </p>

        </div>

      </section>


      {/* ===================================================
          RESULT CARDS
          =================================================== */}

      <section className="result-cards">

        {reading.cards.map(
          (item, index) => (

            <div
              className="result-card"
              key={`${item.card.card_id}-${index}`}
            >

              <div className="result-position">

                {String(index + 1).padStart(
                  2,
                  "0"
                )}

                {" · "}

                {item.position.toUpperCase()}

              </div>


              <div
                className={`tarot-result-card ${
                  item.card.orientation ===
                  "reversed"
                    ? "result-card-reversed"
                    : ""
                }`}
              >

                <div className="card-symbol">

                  {item.card.orientation ===
                  "reversed"
                    ? "↕"
                    : "✦"}

                </div>


                <span>

                  {item.card.arcana}

                  {item.card.suit
                    ? ` · ${item.card.suit}`
                    : ""}

                </span>


                <strong>
                  {item.card.name}
                </strong>


                <small>
                  {item.card.orientation.toUpperCase()}
                </small>

              </div>


              <div className="result-copy">

                <h2>
                  {item.card.name}
                </h2>


                <div className="orientation-badge">

                  {item.card.orientation ===
                  "upright"
                    ? "Upright"
                    : "Reversed"}

                </div>


                <div className="keyword-row">

                  {item.card.keywords?.map(
                    (keyword) => (

                      <span key={keyword}>
                        {keyword}
                      </span>

                    )
                  )}

                </div>


                <h3>
                  Meaning
                </h3>


                <p>
                  {item.card.meaning}
                </p>


                {item.card.context_meaning && (

                  <div className="future-box">

                    <Sparkles size={16} />

                    <div>

                      <strong>

                        {formatName(
                          reading.context
                        )}

                        {" "}context

                      </strong>


                      <p>
                        {item.card.context_meaning}
                      </p>

                    </div>

                  </div>

                )}


                <div className="card-metadata">

                  {item.card.element && (

                    <span>
                      Element:{" "}
                      {item.card.element}
                    </span>

                  )}


                  {item.card.planet && (

                    <span>
                      Planet:{" "}
                      {item.card.planet}
                    </span>

                  )}


                  {item.card.zodiac && (

                    <span>
                      Zodiac:{" "}
                      {item.card.zodiac}
                    </span>

                  )}


                  {item.card.yes_no && (

                    <span>
                      Yes/No:{" "}
                      {item.card.yes_no}
                    </span>

                  )}

                </div>

              </div>

            </div>

          )
        )}

      </section>


      {/* ===================================================
          SUMMARY
          =================================================== */}

      <section className="panel synthesis">

        <span className="section-kicker">
          READING SUMMARY
        </span>


        <h2>
          Symbolic progression
        </h2>


        <p>

          This reading combines{" "}

          <strong>
            {reading.card_count}
          </strong>{" "}

          cards using the{" "}

          <strong>
            {formatName(reading.spread)}
          </strong>{" "}

          spread and{" "}

          <strong>
            {formatName(reading.context)}
          </strong>{" "}

          context. Each card has been interpreted
          using its orientation and the corresponding
          dataset meaning.

        </p>

      </section>


      {/* ===================================================
          ACTIONS
          =================================================== */}

      <div className="result-actions">

        <button
          className="button secondary"
          onClick={onAgain}
        >

          <RotateCcw size={17} />

          New Reading

        </button>


        <button
          className="button primary"
          onClick={onSave}
          disabled={saved}
        >

          {saved ? (

            <>
              <Check size={17} />
              Saved
            </>

          ) : (

            <>
              Save Reading
              <ArrowRight size={17} />
            </>

          )}

        </button>

      </div>


      <p className="disclaimer">

        Tarot is a symbolic tradition used here for
        reflection and entertainment. The future outlook
        is not a guaranteed prediction or professional
        advice.

      </p>

    </div>
  );
}


/* =========================================================
   FORMAT NAME
   ========================================================= */

function formatName(value) {

  if (!value) return "";

  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");

}