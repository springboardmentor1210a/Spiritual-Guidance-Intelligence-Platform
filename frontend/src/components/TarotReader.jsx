import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { downloadPdfReport } from '../utils/pdfReports';

/* =========================================================
   LUNARA TAROT READER
   Ancient manuscript aesthetic + futuristic interaction
   ========================================================= */

const TarotReader = () => {
  const [phase, setPhase] = useState('idle');
  const [spread, setSpread] = useState('Three Card Reading');
  const [pickedCards, setPickedCards] = useState([]);
  const [spreadCards, setSpreadCards] = useState([]);
  const [cardPool, setCardPool] = useState([]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredSpread, setHoveredSpread] = useState(false);

  const requiredPicks =
    spread === 'Single Card Reading'
      ? 1
      : spread === 'Three Card Reading'
        ? 3
        : spread === 'Celtic Cross Spread'
          ? 10
          : 5;

  const spreads = [
    'Single Card Reading',
    'Three Card Reading',
    'Relationship Spread',
    'Career Spread',
    'Life Path Spread',
    'Celtic Cross Spread'
  ];

  const spreadPositions = {
    'Single Card Reading': ['Outcome'],
    'Three Card Reading': ['Past', 'Present', 'Future'],
    'Relationship Spread': ['You', 'The Other', 'Connection', 'Challenge', 'Potential'],
    'Career Spread': ['Current Position', 'Strength', 'Challenge', 'Opportunity', 'Next Step'],
    'Life Path Spread': ['Foundation', 'Present Path', 'Opportunity', 'Challenge', 'Guidance'],
    'Celtic Cross Spread': ['Present', 'Challenge', 'Foundation', 'Recent Past', 'Possible Future', 'Advice', 'Self', 'Environment', 'Hopes and Fears', 'Outcome']
  };

  /* =======================================================
     FETCH TAROT DATASET
     ======================================================= */

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await api.get('/api/tarot-cards');
        setCardPool(response.data);
      } catch (error) {
        console.error('Failed to load tarot dataset:', error);
        setError(
          'The tarot archive could not be reached. Please check your connection and try again.'
        );
      }
    };

    fetchCards();
  }, []);

  /* =======================================================
     START SHUFFLE
     ======================================================= */

  const handleStartShuffle = () => {
    if (cardPool.length === 0) {
      alert('Dataset loading or backend disconnected.');
      return;
    }

    setPhase('shuffling');
    setPickedCards([]);
    setSpreadCards([]);
    setAnalysis(null);
    setError(null);
    setHoveredCard(null);

    setTimeout(() => {
      setSpreadCards(
        Array.from({ length: cardPool.length }).map((_, id) => ({
          id,
          isPicked: false
        }))
      );

      setPhase('picking');
    }, 2200);
  };

  /* =======================================================
     PICK CARD
     ======================================================= */

  const handlePickCard = (index) => {
    if (
      phase !== 'picking' ||
      spreadCards[index]?.isPicked ||
      pickedCards.length >= requiredPicks
    ) {
      return;
    }

    let randomCardData;
    let attempts = 0;

    do {
      const randomBuffer = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuffer);

      const randomIndex =
        randomBuffer[0] % cardPool.length;

      randomCardData = cardPool[randomIndex];
      attempts += 1;

      /*
       * The dataset should contain unique card names. The fallback
       * prevents an infinite loop if a malformed dataset contains
       * duplicate names.
       */
      if (attempts > cardPool.length * 2) {
        randomCardData = cardPool.find(
          (candidate) =>
            !pickedCards.some(
              (card) => card.name === candidate.name
            )
        );

        break;
      }
    } while (
      pickedCards.some(
        (card) => card.name === randomCardData.name
      )
    );

    if (!randomCardData) {
      setError(
        'The tarot deck could not provide another unique card. Please shuffle again.'
      );
      return;
    }

    const finalCardData = {
      ...randomCardData,
      position: spreadPositions[spread]?.[pickedCards.length] || `Position ${pickedCards.length + 1}`
    };

    const newSpread = [...spreadCards];
    newSpread[index].isPicked = true;

    setSpreadCards(newSpread);

    const newPicked = [...pickedCards, finalCardData];

    setPickedCards(newPicked);

    if (newPicked.length === requiredPicks) {
      setTimeout(() => {
        setPhase('complete');
      }, 1000);
    }
  };

  /* =======================================================
     DECODE TAROT
     ======================================================= */

  const handleDecode = async () => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await api.post('/api/analyze-tarot', {
        spread_type: spread,
        cards: pickedCards.map((c) => ({
          name: c.name,
          position: c.position
        }))
      });

      setAnalysis(response.data.analysis);
    } catch (err) {
      if (err.response?.status === 401) {
        setError(
          'Your session expired or you are not logged in. Please log in first.'
        );
      } else {
        setError(
          err.response?.data?.detail ||
            'The ethereal connection was lost. Try again.'
        );
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  /* =======================================================
     FORMAT ORACLE TEXT
     ======================================================= */

  const formatText = (text) => {
    if (!text) {
      return null;
    }

    return text.split('\n').map((line, idx) => (
      <p
        key={idx}
        style={{
          margin: '0.65rem 0',
          lineHeight: '1.85'
        }}
      >
        {line
          .split(/(\*\*.*?\*\*)/g)
          .map((chunk, j) => {
            if (
              chunk.startsWith('**') &&
              chunk.endsWith('**')
            ) {
              return (
                <strong
                  key={j}
                  style={{
                    color: '#5c3a21',
                    fontSize: '1.08em'
                  }}
                >
                  {chunk.slice(2, -2)}
                </strong>
              );
            }

            return chunk;
          })}
      </p>
    ));
  };

  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <div style={pageStyle}>
      {/* Ambient floating symbols */}
      <div style={ambientLayerStyle}>
        {Array.from({ length: 18 }).map((_, index) => (
          <motion.span
            key={index}
            animate={{
              y: [0, -20, 0],
              opacity: [0.08, 0.3, 0.08],
              rotate: [0, 90, 180]
            }}
            transition={{
              duration: 4 + index * 0.25,
              delay: index * 0.12,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              left: `${(index * 67) % 100}%`,
              top: `${(index * 43) % 100}%`,
              color: '#9c6c44',
              fontSize: index % 3 === 0 ? '13px' : '8px',
              pointerEvents: 'none'
            }}
          >
            {index % 3 === 0 ? '✦' : index % 2 === 0 ? '◆' : '·'}
          </motion.span>
        ))}
      </div>

      {/* Main manuscript */}
      <div style={manuscriptStyle}>
        <CornerDecoration
          position={{ top: '15px', left: '15px' }}
        />

        <CornerDecoration
          position={{
            top: '15px',
            right: '15px',
            transform: 'rotate(90deg)'
          }}
        />

        <CornerDecoration
          position={{
            bottom: '15px',
            left: '15px',
            transform: 'rotate(-90deg)'
          }}
        />

        <CornerDecoration
          position={{
            bottom: '15px',
            right: '15px',
            transform: 'rotate(180deg)'
          }}
        />

        {/* =================================================
            HEADER
           ================================================= */}

        <div style={headerStyle}>
          <motion.div
            animate={{
              rotate: [0, 4, -4, 0],
              scale: [1, 1.04, 1]
            }}
            transition={{
              duration: 5,
              repeat: Infinity
            }}
            style={headerSealStyle}
          >
            <span>✦</span>
          </motion.div>

          <div>
            <div style={eyebrowStyle}>
              LUNARA • ARCANA ARCHIVE
            </div>

            <h1 style={titleStyle}>
              Tarot Divination
            </h1>

            <div style={ornamentStyle}>
              <span>◆</span>
              <div />
              <span>✦</span>
              <div />
              <span>◆</span>
            </div>

            <p style={subtitleStyle}>
              Draw the cards. Listen to the symbols.
            </p>
          </div>
        </div>

        {/* =================================================
            SPREAD SELECTOR
           ================================================= */}

        {(phase === 'idle' || phase === 'complete') && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={controlPanelStyle}
          >
            <div style={smallLabelStyle}>
              SELECT YOUR DIVINATION PATH
            </div>

            <div style={selectWrapperStyle}>
              <span style={selectIconStyle}>◈</span>

              <select
                value={spread}
                onChange={(e) => setSpread(e.target.value)}
                disabled={isAnalyzing}
                style={selectStyle}
              >
                {spreads.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <span style={selectArrowStyle}>⌄</span>
            </div>

            <div style={spreadDescriptionStyle}>
              {getSpreadDescription(spread)}
            </div>

            <motion.button
              onClick={handleStartShuffle}
              disabled={isAnalyzing}
              onMouseEnter={() => setHoveredSpread(true)}
              onMouseLeave={() => setHoveredSpread(false)}
              whileHover={
                !isAnalyzing
                  ? {
                      scale: 1.035,
                      y: -3
                    }
                  : {}
              }
              whileTap={
                !isAnalyzing
                  ? {
                      scale: 0.97
                    }
                  : {}
              }
              style={{
                ...shuffleButtonStyle,
                opacity: isAnalyzing ? 0.5 : 1,
                boxShadow: hoveredSpread
                  ? '0 10px 30px rgba(44,26,15,0.35), 0 0 20px rgba(212,184,149,0.45)'
                  : shuffleButtonStyle.boxShadow
              }}
            >
              <span style={{ position: 'relative', zIndex: 2 }}>
                {phase === 'complete'
                  ? 'Draw Again'
                  : 'Shuffle & Deal'}
              </span>

              <motion.div
                animate={{
                  x: ['-120%', '220%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                style={buttonSweepStyle}
              />
            </motion.button>
          </motion.div>
        )}

        {/* =================================================
            STATUS DURING SHUFFLE / PICKING
           ================================================= */}

        {(phase === 'shuffling' || phase === 'picking') && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={statusPanelStyle}
          >
            <motion.div
              animate={{
                opacity: [0.45, 1, 0.45]
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity
              }}
              style={statusOrbStyle}
            >
              ✦
            </motion.div>

            <div>
              <div style={statusMainStyle}>
                {phase === 'shuffling'
                  ? 'Communing with the deck...'
                  : 'The cards await your hand.'}
              </div>

              <div style={statusSubStyle}>
                {phase === 'shuffling'
                  ? 'THE ARCANA ARE ALIGNING'
                  : `SELECT ${requiredPicks - pickedCards.length} MORE CARD${requiredPicks - pickedCards.length === 1 ? '' : 'S'}`}
              </div>
            </div>

            {phase === 'picking' && (
              <div style={pickCounterStyle}>
                <span>
                  {pickedCards.length}
                </span>
                <small style={pickCounterSmallStyle}>
                  / {requiredPicks}
                </small>
              </div>
            )}
          </motion.div>
        )}

        {/* =================================================
            SHUFFLING ANIMATION
           ================================================= */}

        {phase === 'shuffling' && (
          <div style={shuffleStageStyle}>
            <div style={energyRingOuterStyle} />
            <div style={energyRingMiddleStyle} />
            <div style={energyRingInnerStyle} />

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  x:
                    i % 2 === 0
                      ? [-75, 75, -75]
                      : [75, -75, 75],
                  y:
                    i % 3 === 0
                      ? [-18, 18, -18]
                      : [18, -18, 18],
                  rotateZ:
                    i % 2 === 0
                      ? [-22, 22, -22]
                      : [22, -22, 22],
                  zIndex: [1, 8, 1],
                  scale: [1, 1.08, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                  ease: 'easeInOut',
                  delay: i * 0.07
                }}
                style={{
                  position: 'absolute',
                  width: '92px',
                  height: '148px',
                  background:
                    'repeating-linear-gradient(45deg, #5c3a21, #5c3a21 9px, #3e2723 9px, #3e2723 18px)',
                  borderRadius: '7px',
                  border: '2px solid #d4b895',
                  boxShadow:
                    '0 8px 22px rgba(0,0,0,0.4), inset 0 0 15px rgba(244,232,193,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span style={cardBackSymbolStyle}>
                  ✦
                </span>
              </motion.div>
            ))}

            <motion.div
              animate={{
                scale: [0.8, 1.15, 0.8],
                opacity: [0.25, 0.75, 0.25]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity
              }}
              style={shuffleCoreStyle}
            >
              ✦
            </motion.div>
          </div>
        )}

        {/* =================================================
            PICKED CARDS
           ================================================= */}

        {pickedCards.length > 0 && (
          <div style={pickedSectionStyle}>
            <div style={sectionHeadingStyle}>
              <div style={sectionLabelStyle}>
                THE CHOSEN ARCANA
              </div>

              <h2 style={sectionTitleStyle}>
                Your Reading
              </h2>

              <div style={miniOrnamentStyle}>
                <span />
                <b>✦</b>
                <span />
              </div>
            </div>

            <div style={pickedCardsContainerStyle}>
              <AnimatePresence>
                {pickedCards.map((card, idx) => (
                  <motion.div
                    key={`${card.name}-${idx}`}
                    initial={{
                      opacity: 0,
                      scale: 0.2,
                      rotateY: 180,
                      rotateZ: 12,
                      y: 100
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotateY: 0,
                      rotateZ: 0,
                      y: 0
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 120,
                      damping: 15,
                      delay: idx * 0.08
                    }}
                    whileHover={{
                      y: -12,
                      rotateZ: idx % 2 === 0 ? -2 : 2,
                      scale: 1.035
                    }}
                    style={tarotCardOuterStyle}
                  >
                    {/* Card glow */}
                    <motion.div
                      animate={{
                        opacity: [0.2, 0.55, 0.2]
                      }}
                      transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        delay: idx * 0.3
                      }}
                      style={tarotCardGlowStyle}
                    />

                    <div style={tarotCardStyle}>
                      {/* Position */}
                      {requiredPicks > 1 && (
                        <div style={cardPositionStyle}>
                          {card.position}
                        </div>
                      )}

                      {/* Image */}
                      <div style={cardImageFrameStyle}>
                        {card.image ? (
                          <img
                            src={card.image}
                            alt={card.name}
                            referrerPolicy="no-referrer"
                            style={cardImageStyle}
                            onError={(e) => {
                              e.target.style.display = 'none';

                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display =
                                  'flex';
                              }
                            }}
                          />
                        ) : null}

                        <div
                          style={{
                            ...cardFallbackStyle,
                            display: card.image ? 'none' : 'flex'
                          }}
                        >
                          <span>🔮</span>
                          <small>ARCANA</small>
                        </div>

                        <div style={imageCornerTopStyle}>✦</div>
                        <div style={imageCornerBottomStyle}>✦</div>
                      </div>

                      <div style={cardNumberStyle}>
                        ARCANA {String(idx + 1).padStart(2, '0')}
                      </div>

                      <h3 style={cardNameStyle}>
                        {card.name}
                      </h3>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* =================================================
            DECK POOL
           ================================================= */}

        {phase === 'picking' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={deckSectionStyle}
          >
            <div style={deckHeaderStyle}>
              <div>
                <div style={sectionLabelStyle}>
                  THE MYSTIC DECK
                </div>

                <h3 style={deckTitleStyle}>
                  Choose a Card · {spread}
                </h3>
              </div>

              <div style={deckCountStyle}>
                {spreadCards.filter((c) => !c.isPicked).length}
                <span style={deckCountSpanStyle}>REMAINING</span>
              </div>
            </div>

            <div style={deckPoolStyle}>
              <AnimatePresence>
                {spreadCards.map((card, idx) =>
                  !card.isPicked ? (
                    <motion.div
                      key={card.id}
                      initial={{
                        opacity: 0,
                        y: -45,
                        rotateZ: idx % 2 === 0 ? -4 : 4
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        rotateZ: 0
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0,
                        rotateY: 180
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 25,
                        delay: idx * 0.012
                      }}
                      whileHover={{
                        y: -18,
                        scale: 1.16,
                        rotateZ: idx % 2 === 0 ? -3 : 3,
                        zIndex: 10,
                        boxShadow:
                          '0 18px 30px rgba(0,0,0,0.55)'
                      }}
                      onHoverStart={() =>
                        setHoveredCard(card.id)
                      }
                      onHoverEnd={() =>
                        setHoveredCard(null)
                      }
                      onClick={() =>
                        handlePickCard(idx)
                      }
                      style={{
                        ...deckCardStyle,
                        boxShadow:
                          hoveredCard === card.id
                            ? '0 18px 30px rgba(0,0,0,0.55), 0 0 15px rgba(212,184,149,0.3)'
                            : deckCardStyle.boxShadow
                      }}
                    >
                      <div style={deckCardPatternStyle}>
                        <div style={deckCardDiamondStyle}>
                          <span>✦</span>
                        </div>

                        <span style={deckEyeStyle}>
                          ◉
                        </span>
                      </div>
                    </motion.div>
                  ) : null
                )}
              </AnimatePresence>
            </div>

            <div style={deckInstructionStyle}>
              <motion.span
                animate={{
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity
                }}
              >
                ✦
              </motion.span>

              Trust your instinct. The card that calls to you
              is the card you seek.

              <motion.span
                animate={{
                  opacity: [1, 0.4, 1]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity
                }}
              >
                ✦
              </motion.span>
            </div>
          </motion.div>
        )}

        {/* =================================================
            DECODE BUTTON
           ================================================= */}

        {phase === 'complete' && !analysis && (
          <motion.div
            initial={{
              opacity: 0,
              y: 25,
              scale: 0.95
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1
            }}
            transition={{
              delay: 0.4,
              duration: 0.6
            }}
            style={decodeSectionStyle}
          >
            <motion.div
              animate={{
                rotate: [0, 360]
              }}
              transition={{
                duration: 18,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={decodeSealStyle}
            >
              ✦
            </motion.div>

            <div style={decodeLabelStyle}>
              THE CARDS HAVE BEEN CHOSEN
            </div>

            <h2 style={decodeTitleStyle}>
              Ready to Decode Your Destiny?
            </h2>

            <p style={decodeDescriptionStyle}>
              The arcana have aligned. Reveal the message hidden
              within your chosen cards.
            </p>

            <motion.button
              onClick={handleDecode}
              disabled={isAnalyzing}
              whileHover={
                !isAnalyzing
                  ? {
                      scale: 1.04,
                      y: -3
                    }
                  : {}
              }
              whileTap={
                !isAnalyzing
                  ? {
                      scale: 0.97
                    }
                  : {}
              }
              style={{
                ...decodeButtonStyle,
                opacity: isAnalyzing ? 0.7 : 1
              }}
            >
              <span style={{ position: 'relative', zIndex: 3 }}>
                {isAnalyzing
                  ? 'Channeling the Spirits...'
                  : 'Decode My Destiny'}
              </span>

              <motion.div
                animate={{
                  x: ['-120%', '220%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 0.8
                }}
                style={buttonSweepStyle}
              />
            </motion.button>

            {isAnalyzing && (
              <div style={channelingStyle}>
                <motion.span
                  animate={{
                    rotate: 360
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                >
                  ◌
                </motion.span>

                <span>
                  The oracle is interpreting the spread...
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* =================================================
            ERROR
           ================================================= */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: 10,
                height: 0
              }}
              animate={{
                opacity: 1,
                y: 0,
                height: 'auto'
              }}
              exit={{
                opacity: 0,
                y: -10,
                height: 0
              }}
              style={errorStyle}
            >
              <div style={errorIconStyle}>!</div>

              <div>
                <strong style={errorTitleStyle}>
                  ORACLE CONNECTION ERROR
                </strong>

                <div>{error}</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            ORACLE READING
           ================================================= */}

        <AnimatePresence>
          {analysis && (
            <motion.div
              initial={{
                height: 0,
                opacity: 0,
                scaleY: 0
              }}
              animate={{
                height: 'auto',
                opacity: 1,
                scaleY: 1
              }}
              transition={{
                duration: 1.5,
                ease: [0.25, 0.8, 0.25, 1]
              }}
              style={{
                overflow: 'hidden',
                marginTop: '3rem',
                transformOrigin: 'top center'
              }}
            >
              <div style={oracleReadingOuterStyle}>
                {/* Scroll top roll */}
                <div style={scrollRollTopStyle}>
                  <span>✦</span>
                  <div />
                  <span>✦</span>
                </div>

                <div style={oracleReadingInnerStyle}>
                  <motion.div
                    animate={{
                      opacity: [0.35, 0.8, 0.35],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity
                    }}
                    style={oracleSymbolStyle}
                  >
                    ✦
                  </motion.div>

                  <div style={oracleSmallLabelStyle}>
                    LUNARA ORACLE • REVEALED
                  </div>

                  <h2 style={oracleReadingTitleStyle}>
                    Your Oracle Reading
                  </h2>

                  <div style={oracleTitleDecorationStyle}>
                    <span />
                    <b>◆</b>
                    <span />
                  </div>

                  <div style={oracleTextStyle}>
                    {formatText(analysis)}
                  </div>

                  <button type="button" onClick={() => downloadPdfReport('Tarot Reading', [
                    { heading: 'Reading details', lines: [`Spread: ${spread}`, `Date: ${new Date().toLocaleString()}`, ...pickedCards.map((card) => `${card.position}: ${card.name}`)] },
                    { heading: 'Interpretation', lines: String(analysis).split('\n') },
                    { heading: 'Reflection note', lines: ['For reflection and personal insight. This reading is not a guaranteed prediction or professional medical, financial, or legal advice.'] },
                  ], `lunara-tarot-${new Date().toISOString().slice(0, 10)}.pdf`)} style={{ marginTop: 18, padding: '11px 18px', border: '1px solid #8b571d', borderRadius: 5, color: '#fff1c4', background: 'linear-gradient(135deg,#4a2412,#6b3518)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>Download Tarot report (PDF)</button>

                  <div style={oracleClosingStyle}>
                    <span>✦</span>
                    <div>
                      <strong>
                        THE CARDS HAVE SPOKEN
                      </strong>
                      <small>
                        Carry their message with intention.
                      </small>
                    </div>
                    <span>✦</span>
                  </div>
                </div>

                {/* Scroll bottom roll */}
                <div style={scrollRollBottomStyle}>
                  <span>✦</span>
                  <div />
                  <span>✦</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =================================================
            FOOTER
           ================================================= */}

        <div style={footerStyle}>
          <span>✦</span>
          <div />
          <span>LUNARA ARCANA</span>
          <div />
          <span>✦</span>
        </div>
      </div>

      {/* ===================================================
          RESPONSIVE / ANIMATION CSS
         =================================================== */}

      <style>{`
        @media (max-width: 760px) {
          .lunara-tarot-manuscript {
            margin: 20px 10px !important;
            padding: 22px 14px !important;
          }

          .lunara-tarot-title {
            font-size: 1.75rem !important;
            letter-spacing: 2px !important;
          }

          .lunara-tarot-header {
            flex-direction: column !important;
            text-align: center !important;
          }

          .lunara-tarot-picked-card {
            width: 135px !important;
            height: 235px !important;
          }

          .lunara-tarot-oracle {
            padding: 25px 18px !important;
          }
        }

        @media (max-width: 480px) {
          .lunara-tarot-manuscript {
            padding: 18px 10px !important;
          }

          .lunara-tarot-picked-card {
            width: 120px !important;
            height: 210px !important;
          }

          .lunara-tarot-deck-card {
            width: 38px !important;
            height: 64px !important;
          }

          .lunara-tarot-oracle {
            padding: 20px 12px !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

/* =========================================================
   SUPPORTING COMPONENTS
   ========================================================= */

const CornerDecoration = ({ position }) => (
  <div
    style={{
      position: 'absolute',
      width: '42px',
      height: '42px',
      pointerEvents: 'none',
      ...position
    }}
  >
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '1px',
        background: '#9c6c44'
      }}
    />

    <div
      style={{
        position: 'absolute',
        width: '1px',
        height: '100%',
        background: '#9c6c44'
      }}
    />

    <div
      style={{
        position: 'absolute',
        width: '7px',
        height: '7px',
        border: '1px solid #5c3a21',
        transform: 'rotate(45deg)',
        top: '18px',
        left: '18px',
        background: '#e8d5b5'
      }}
    />
  </div>
);

/* =========================================================
   SPREAD DESCRIPTION
   ========================================================= */

const getSpreadDescription = (spread) => {
  switch (spread) {
    case 'Single Card Reading':
      return 'One card. One message. One moment of clarity.';

    case 'Three Card Reading':
      return 'Explore the path connecting your past, present and future.';

    case 'Relationship Spread':
      return 'Reveal the energies, lessons and direction surrounding connection.';

    case 'Career Spread':
      return 'Examine the forces shaping your professional journey.';

    case 'Celtic Cross Spread':
      return 'A deeper ten-point exploration of your current life path.';

    default:
      return 'Choose the spread that speaks to your intuition.';
  }
};

/* =========================================================
   PAGE STYLES
   ========================================================= */

const pageStyle = {
  position: 'relative',
  maxWidth: '1120px',
  margin: '40px auto',
  padding: '0 14px 60px',
  fontFamily: 'serif',
  color: '#2c1a0f',
  boxSizing: 'border-box'
};

const ambientLayerStyle = {
  position: 'fixed',
  inset: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0
};

const manuscriptStyle = {
  position: 'relative',
  zIndex: 1,
  padding: '38px',
  overflow: 'hidden',
  boxSizing: 'border-box',
  border: '2px solid #5c3a21',
  borderRadius: '5px',
  background:
    'linear-gradient(135deg, rgba(244,232,193,0.98), rgba(232,213,181,0.98) 50%, rgba(214,187,145,0.96))',
  boxShadow:
    '0 22px 60px rgba(44,26,15,0.25), inset 0 0 70px rgba(156,108,68,0.08)'
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '20px',
  marginBottom: '30px',
  textAlign: 'center'
};

const headerSealStyle = {
  width: '68px',
  height: '68px',
  minWidth: '68px',
  borderRadius: '50%',
  border: '2px solid #5c3a21',
  background:
    'radial-gradient(circle, #f4e8c1, #d4b895)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.8rem',
  boxShadow:
    '0 0 0 5px rgba(156,108,68,0.12), 0 7px 20px rgba(44,26,15,0.18)'
};

const eyebrowStyle = {
  color: '#9c6c44',
  fontSize: '0.67rem',
  fontWeight: 'bold',
  letterSpacing: '3px',
  marginBottom: '4px'
};

const titleStyle = {
  margin: 0,
  color: '#3e2723',
  fontSize: '2.5rem',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  textShadow: '1px 1px rgba(255,255,255,0.4)'
};

const ornamentStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '9px',
  marginTop: '8px',
  color: '#9c6c44',
  fontSize: '0.6rem'
};

const subtitleStyle = {
  margin: '8px 0 0',
  color: '#735033',
  fontSize: '0.9rem',
  fontStyle: 'italic',
  letterSpacing: '1px'
};

const controlPanelStyle = {
  position: 'relative',
  maxWidth: '720px',
  margin: '0 auto 30px',
  padding: '27px',
  textAlign: 'center',
  background:
    'linear-gradient(145deg, rgba(232,213,181,0.85), rgba(244,232,193,0.72))',
  border: '1px solid #9c6c44',
  borderRadius: '5px',
  boxShadow:
    '0 8px 25px rgba(44,26,15,0.13), inset 0 0 25px rgba(156,108,68,0.05)'
};

const smallLabelStyle = {
  color: '#9c6c44',
  fontSize: '0.66rem',
  fontWeight: 'bold',
  letterSpacing: '2.5px',
  marginBottom: '11px'
};

const selectWrapperStyle = {
  position: 'relative',
  maxWidth: '430px',
  margin: '0 auto'
};

const selectIconStyle = {
  position: 'absolute',
  left: '14px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#8b0000',
  pointerEvents: 'none',
  zIndex: 2
};

const selectStyle = {
  width: '100%',
  appearance: 'none',
  WebkitAppearance: 'none',
  padding: '13px 42px 13px 42px',
  fontSize: '1rem',
  background:
    'linear-gradient(135deg, #d4b895, #ead8b9)',
  color: '#2c1a0f',
  border: '1px solid #5c3a21',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontWeight: 'bold',
  outline: 'none',
  boxShadow: 'inset 0 0 10px rgba(44,26,15,0.08)'
};

const selectArrowStyle = {
  position: 'absolute',
  right: '14px',
  top: '50%',
  transform: 'translateY(-55%)',
  color: '#5c3a21',
  pointerEvents: 'none',
  fontSize: '1.2rem'
};

const spreadDescriptionStyle = {
  margin: '12px auto 18px',
  color: '#765037',
  fontSize: '0.85rem',
  fontStyle: 'italic'
};

const shuffleButtonStyle = {
  position: 'relative',
  overflow: 'hidden',
  padding: '13px 30px',
  background:
    'linear-gradient(135deg, #5c3a21, #2c1a0f)',
  color: '#f4e8c1',
  border: '2px solid #3e2723',
  borderRadius: '4px',
  fontSize: '0.95rem',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  boxShadow: '0 5px 17px rgba(44,26,15,0.28)',
  transition: 'all 0.3s ease'
};

const buttonSweepStyle = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '35%',
  height: '100%',
  background:
    'linear-gradient(90deg, transparent, rgba(255,241,190,0.3), transparent)',
  transform: 'skewX(-20deg)',
  zIndex: 1
};

const statusPanelStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  margin: '25px auto',
  padding: '14px 20px',
  maxWidth: '650px',
  borderTop: '1px dashed rgba(156,108,68,0.5)',
  borderBottom: '1px dashed rgba(156,108,68,0.5)',
  background: 'rgba(212,184,149,0.18)'
};

const statusOrbStyle = {
  width: '38px',
  height: '38px',
  borderRadius: '50%',
  border: '1px solid #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  background: '#e8d5b5'
};

const statusMainStyle = {
  color: '#3e2723',
  fontWeight: 'bold',
  fontSize: '0.95rem'
};

const statusSubStyle = {
  color: '#9c6c44',
  fontSize: '0.63rem',
  letterSpacing: '2px',
  marginTop: '3px'
};

const pickCounterStyle = {
  marginLeft: 'auto',
  color: '#5c3a21',
  fontSize: '1.25rem',
  fontWeight: 'bold'
};

const pickCounterSmallStyle = {
  fontSize: '0.7rem'
};

const shuffleStageStyle = {
  position: 'relative',
  height: '290px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  margin: '1.5rem 0 2rem',
  perspective: '900px',
  overflow: 'hidden'
};

const energyRingOuterStyle = {
  position: 'absolute',
  width: '245px',
  height: '245px',
  border: '1px dashed rgba(156,108,68,0.45)',
  borderRadius: '50%'
};

const energyRingMiddleStyle = {
  position: 'absolute',
  width: '190px',
  height: '190px',
  border: '1px solid rgba(139,0,0,0.22)',
  borderRadius: '50%',
  transform: 'rotateX(65deg)'
};

const energyRingInnerStyle = {
  position: 'absolute',
  width: '120px',
  height: '120px',
  border: '1px dashed rgba(92,58,33,0.4)',
  borderRadius: '50%',
  transform: 'rotateY(65deg)'
};

const cardBackSymbolStyle = {
  color: '#d4b895',
  fontSize: '2rem',
  opacity: 0.7
};

const shuffleCoreStyle = {
  position: 'absolute',
  color: '#8b0000',
  fontSize: '2rem',
  textShadow: '0 0 15px rgba(139,0,0,0.35)'
};

const pickedSectionStyle = {
  marginTop: '20px'
};

const sectionHeadingStyle = {
  textAlign: 'center',
  marginBottom: '22px'
};

const sectionLabelStyle = {
  color: '#9c6c44',
  fontSize: '0.64rem',
  fontWeight: 'bold',
  letterSpacing: '3px'
};

const sectionTitleStyle = {
  margin: '5px 0 8px',
  color: '#3e2723',
  fontSize: '1.6rem',
  textTransform: 'uppercase',
  letterSpacing: '2px'
};

const miniOrnamentStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '9px',
  color: '#8b0000'
};

const pickedCardsContainerStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1.7rem',
  justifyContent: 'center',
  marginBottom: '2rem',
  minHeight: '270px',
  perspective: '1200px'
};

const tarotCardOuterStyle = {
  width: '155px',
  height: '270px',
  position: 'relative',
  transformStyle: 'preserve-3d'
};

const tarotCardGlowStyle = {
  position: 'absolute',
  inset: '-5px',
  borderRadius: '10px',
  background:
    'radial-gradient(circle, rgba(156,108,68,0.35), transparent 70%)',
  filter: 'blur(8px)',
  pointerEvents: 'none'
};

const tarotCardStyle = {
  position: 'absolute',
  inset: 0,
  padding: '7px',
  background:
    'linear-gradient(145deg, #f4e8c1, #d4b895)',
  border: '2px solid #5c3a21',
  borderRadius: '7px',
  boxSizing: 'border-box',
  textAlign: 'center',
  boxShadow:
    '0 10px 25px rgba(0,0,0,0.38), inset 0 0 15px rgba(92,58,33,0.12)',
  overflow: 'hidden'
};

const cardPositionStyle = {
  color: '#8b0000',
  fontSize: '0.63rem',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  marginBottom: '5px'
};

const cardImageFrameStyle = {
  position: 'relative',
  width: '100%',
  height: '158px',
  overflow: 'hidden',
  borderRadius: '4px',
  border: '1px solid #5c3a21',
  background: '#d4b895'
};

const cardImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block'
};

const cardFallbackStyle = {
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '5px',
  color: '#5c3a21',
  fontSize: '2.3rem'
};

const cardNumberStyle = {
  marginTop: '7px',
  color: '#9c6c44',
  fontSize: '0.57rem',
  fontWeight: 'bold',
  letterSpacing: '2px'
};

const cardNameStyle = {
  margin: '4px 0',
  fontSize: '0.92rem',
  color: '#2c1a0f',
  lineHeight: 1.2
};

const imageCornerTopStyle = {
  position: 'absolute',
  top: '3px',
  left: '4px',
  color: '#f4e8c1',
  fontSize: '0.55rem',
  textShadow: '0 1px 3px #2c1a0f'
};

const imageCornerBottomStyle = {
  position: 'absolute',
  bottom: '3px',
  right: '4px',
  color: '#f4e8c1',
  fontSize: '0.55rem',
  textShadow: '0 1px 3px #2c1a0f'
};

const deckSectionStyle = {
  marginTop: '10px',
  padding: '20px',
  background:
    'rgba(92,58,33,0.07)',
  borderRadius: '7px',
  border: '1px dashed rgba(92,58,33,0.35)'
};

const deckHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '15px'
};

const deckTitleStyle = {
  margin: '4px 0 0',
  color: '#3e2723',
  fontSize: '1.15rem',
  textTransform: 'uppercase',
  letterSpacing: '1.5px'
};

const deckCountStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  color: '#5c3a21',
  fontWeight: 'bold',
  fontSize: '1rem'
};

const deckCountSpanStyle = {
  fontSize: '0.55rem',
  letterSpacing: '1px'
};

const deckPoolStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '7px',
  justifyContent: 'center',
  padding: '18px 12px',
  background:
    'linear-gradient(145deg, rgba(44,26,15,0.08), rgba(212,184,149,0.15))',
  borderRadius: '6px',
  minHeight: '90px'
};

const deckCardStyle = {
  width: '45px',
  height: '75px',
  cursor: 'pointer',
  background:
    'repeating-linear-gradient(45deg, #5c3a21, #5c3a21 5px, #3e2723 5px, #3e2723 10px)',
  borderRadius: '4px',
  border: '1px solid #d4b895',
  boxShadow: '0 4px 8px rgba(0,0,0,0.4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transformStyle: 'preserve-3d'
};

const deckCardPatternStyle = {
  width: '80%',
  height: '86%',
  border: '1px solid rgba(212,184,149,0.65)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative'
};

const deckCardDiamondStyle = {
  width: '25px',
  height: '25px',
  border: '1px solid #d4b895',
  transform: 'rotate(45deg)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const deckEyeStyle = {
  position: 'absolute',
  color: '#d4b895',
  fontSize: '0.65rem'
};

const deckInstructionStyle = {
  textAlign: 'center',
  marginTop: '15px',
  color: '#765037',
  fontSize: '0.76rem',
  fontStyle: 'italic',
  display: 'flex',
  justifyContent: 'center',
  gap: '10px'
};

const decodeSectionStyle = {
  textAlign: 'center',
  marginTop: '25px',
  padding: '35px 20px',
  borderTop: '1px dashed rgba(156,108,68,0.55)',
  borderBottom: '1px dashed rgba(156,108,68,0.55)'
};

const decodeSealStyle = {
  width: '70px',
  height: '70px',
  margin: '0 auto 15px',
  borderRadius: '50%',
  border: '1px dashed #9c6c44',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#8b0000',
  fontSize: '1.7rem',
  background:
    'radial-gradient(circle, #f4e8c1, #d4b895)'
};

const decodeLabelStyle = {
  color: '#9c6c44',
  fontSize: '0.64rem',
  fontWeight: 'bold',
  letterSpacing: '3px'
};

const decodeTitleStyle = {
  margin: '8px 0 10px',
  color: '#3e2723',
  fontSize: '1.65rem',
  letterSpacing: '1px'
};

const decodeDescriptionStyle = {
  maxWidth: '570px',
  margin: '0 auto 20px',
  color: '#765037',
  fontSize: '0.92rem',
  lineHeight: 1.6,
  fontStyle: 'italic'
};

const decodeButtonStyle = {
  position: 'relative',
  overflow: 'hidden',
  padding: '15px 40px',
  borderRadius: '5px',
  border: '2px solid #2c1a0f',
  background:
    'linear-gradient(135deg, #2c1a0f, #4c2d19)',
  color: '#e8d5b5',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontFamily: 'serif',
  fontSize: '1.1rem',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  boxShadow:
    '0 6px 20px rgba(0,0,0,0.38)'
};

const channelingStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '9px',
  marginTop: '16px',
  color: '#8b0000',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  letterSpacing: '1px'
};

const errorStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
  marginTop: '20px',
  padding: '15px',
  backgroundColor: 'rgba(139,0,0,0.08)',
  color: '#8b0000',
  border: '1px solid #8b0000',
  borderRadius: '4px',
  fontSize: '0.85rem',
  fontWeight: 'bold'
};

const errorIconStyle = {
  width: '30px',
  height: '30px',
  minWidth: '30px',
  borderRadius: '50%',
  border: '1px solid #8b0000',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const errorTitleStyle = {
  display: 'block',
  fontSize: '0.67rem',
  letterSpacing: '1.5px',
  marginBottom: '3px'
};

const oracleReadingOuterStyle = {
  position: 'relative',
  background:
    'linear-gradient(to bottom, #d4b895, #e8d5b5, #d4b895)',
  borderLeft: '2px solid #5c3a21',
  borderRight: '2px solid #5c3a21',
  boxShadow:
    '0 12px 30px rgba(0,0,0,0.32)'
};

const oracleReadingInnerStyle = {
  padding: '35px 45px',
  textAlign: 'left',
  background:
    'linear-gradient(to bottom, rgba(244,232,193,0.95), rgba(232,213,181,0.96))',
  borderTop: '13px solid #3e2723',
  borderBottom: '13px solid #3e2723',
  boxShadow:
    'inset 0 0 35px rgba(92,58,33,0.2)'
};

const scrollRollTopStyle = {
  height: '17px',
  background:
    'linear-gradient(90deg, #3e2723, #8b6a4c, #3e2723)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 15px',
  color: '#d4b895'
};

const scrollRollBottomStyle = {
  height: '17px',
  background:
    'linear-gradient(90deg, #3e2723, #8b6a4c, #3e2723)',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '0 15px',
  color: '#d4b895'
};

const oracleSymbolStyle = {
  textAlign: 'center',
  color: '#8b0000',
  fontSize: '1.7rem',
  marginBottom: '5px'
};

const oracleSmallLabelStyle = {
  textAlign: 'center',
  color: '#9c6c44',
  fontSize: '0.64rem',
  fontWeight: 'bold',
  letterSpacing: '3px'
};

const oracleReadingTitleStyle = {
  margin: '7px 0 10px',
  textAlign: 'center',
  color: '#3e2723',
  fontSize: '2rem',
  textTransform: 'uppercase',
  letterSpacing: '3px'
};

const oracleTitleDecorationStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  color: '#8b0000',
  marginBottom: '20px'
};

const oracleTextStyle = {
  fontSize: '1.05rem',
  color: '#3e2723'
};

const oracleClosingStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '15px',
  marginTop: '30px',
  paddingTop: '18px',
  borderTop: '1px dashed rgba(156,108,68,0.55)',
  textAlign: 'center',
  color: '#6d4a2e'
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  marginTop: '30px',
  color: '#9c6c44',
  fontSize: '0.62rem',
  letterSpacing: '3px',
  fontWeight: 'bold'
};

export default TarotReader;
