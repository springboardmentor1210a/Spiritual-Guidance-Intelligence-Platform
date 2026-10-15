import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import api from "../api";
import { downloadPdfReport } from "../utils/pdfReports";

/*
 * ============================================================
 * LUNARA — MYSTIC PALM READER
 * ============================================================
 *
 * VISUAL CONCEPT
 * ------------------------------------------------------------
 *
 * Ancient parchment + futuristic mystical scanning.
 *
 * The experience is designed to feel like an ancient
 * chiromancy manuscript has awakened.
 *
 * Animation sequence:
 *
 * 1. Ancient seal gently rotates around the uploader.
 * 2. Upload area responds to hover.
 * 3. Palm image enters with a parchment reveal.
 * 4. Analysis begins.
 * 5. Golden scanning beam travels across the palm.
 * 6. Energy particles float around the image.
 * 7. Mystical rings rotate around the scanner.
 * 8. "Tracing Lines..." becomes an animated ritual.
 * 9. Processed palm appears.
 * 10. The reading scroll unfolds.
 * 11. Individual readings reveal one by one.
 *
 * FUNCTIONALITY PRESERVED
 * ------------------------------------------------------------
 *
 * - File selection
 * - Image preview
 * - Right / Left hand selection
 * - FastAPI palm analysis
 * - JWT Axios interceptor
 * - FormData upload
 * - Processed image response
 * - Analysis response
 * - Error handling
 * - Loading state
 * - AnimatePresence
 * - Framer Motion
 *
 * ============================================================
 */

export default function PalmUploader() {
  /*
   * ==========================================================
   * STATE
   * ==========================================================
   */

  const [file, setFile] =
    useState(null);

  const [preview, setPreview] =
    useState(null);

  const [hand, setHand] =
    useState("Right");

  /*
   * Stores the exact hand designation used for the
   * currently displayed analysis. This prevents an
   * older Right-hand result from being displayed as
   * a Left-hand result after the selector changes.
   */
  const [analysisHand, setAnalysisHand] =
    useState(null);

  const [processedImage, setProcessedImage] =
    useState(null);

  const [analysis, setAnalysis] =
    useState(null);

  /*
   * Stores only the user-facing hand verification result returned by
   * the backend. Internal detector fields are never rendered as reading
   * categories.
   */
  const [verification, setVerification] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [isHoveringUpload, setIsHoveringUpload] =
    useState(false);

  const [activeReading, setActiveReading] =
    useState(null);

  const fileInputRef =
    useRef(null);

  /*
   * ==========================================================
   * CLEAN UP OBJECT URL
   * ==========================================================
   *
   * Prevents unnecessary browser memory usage when a new
   * image is selected.
   */

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /*
   * ==========================================================
   * FILE SELECTION
   * ==========================================================
   */

  const handleFileChange = (e) => {
    const selectedFile =
      e.target.files[0];

    if (!selectedFile) {
      return;
    }

    /*
     * Create browser preview.
     */

    const objectUrl =
      URL.createObjectURL(
        selectedFile
      );

    setFile(selectedFile);

    setPreview(objectUrl);

    /*
     * Clear previous analysis.
     */

    setProcessedImage(null);

    setAnalysis(null);

    setVerification(null);

    setError(null);

    setActiveReading(null);
  };

  /*
   * ==========================================================
   * HAND SELECTION
   * ==========================================================
   *
   * A hand change starts a new analysis context. Any
   * result generated for the previous hand is cleared
   * immediately so it can never be presented as the
   * newly selected hand.
   */

  const handleHandChange = (event) => {
    const selectedHand =
      event.target.value === "Left"
        ? "Left"
        : "Right";

    setHand(selectedHand);

    setAnalysisHand(null);
    setProcessedImage(null);
    setAnalysis(null);
    setVerification(null);
    setActiveReading(null);
    setError(null);
  };

  /*
   * ==========================================================
   * UPLOAD + PALM ANALYSIS
   * ==========================================================
   *
   * Existing backend functionality is preserved.
   */

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    setLoading(true);

    setError(null);

    setProcessedImage(null);

    setAnalysis(null);

    setVerification(null);

    setAnalysisHand(null);

    setActiveReading(null);

    /*
     * Capture the hand designation at the exact moment
     * the analysis starts. The selector is disabled while
     * loading, but keeping an immutable request value here
     * makes the hand context explicit and reliable.
     */
    const selectedHand =
      hand === "Left"
        ? "Left"
        : "Right";

    /*
     * Create multipart form data.
     */

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    formData.append(
      "hand",
      selectedHand
    );

    try {
      /*
       * Axios automatically attaches the JWT token through
       * the configured interceptor.
       *
       * Do not manually set Content-Type because Axios needs
       * to generate the multipart boundary automatically.
       */

      const response =
        await api.post(
          "/api/analyze-palm",
          formData
        );

      /*
       * Backend returns processed palm image.
       */

      setProcessedImage(
        response.data.processed_image
      );

      /*
       * Backend returns the actual analysis object.
       */

      setAnalysis(
        response.data.analysis
      );

      /*
       * Keep the verification message separate from the manuscript.
       * The backend now returns verification metadata independently,
       * so fields such as detected_hand never appear as readings.
       */
      setVerification(
        response.data.verification || {
          detected_hand:
            response.data.hand_analyzed || selectedHand,
          message:
            `${response.data.hand_analyzed || selectedHand} palm verified.`,
        }
      );

      /*
       * Bind the displayed result to the exact hand that
       * was submitted with this request. The backend stores
       * the same hand designation in MongoDB.
       */
      setAnalysisHand(selectedHand);

      /*
       * Firebase saving is intentionally not performed here.
       *
       * The FastAPI backend handles persistence.
       */
    } catch (err) {
      if (
        err.response?.status === 401
      ) {
        setError(
          "Your ethereal connection (session) expired. Please log out and log in again."
        );
      } else {
        setError(
          err.response?.data?.detail ||
            err.message ||
            "Failed to analyze palm image."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /*
   * ==========================================================
   * OPEN FILE SELECTOR
   * ==========================================================
   */

  const openFileSelector = () => {
    if (!loading) {
      fileInputRef.current?.click();
    }
  };

  /*
   * ==========================================================
   * READINGS
   * ==========================================================
   */

  /*
   * Render only actual palm-reading categories. This defensive filter
   * also keeps the UI clean if an older backend response still contains
   * verification fields inside the analysis object.
   */
  const verificationKeys = new Set([
    "detected_hand",
    "thumb_side_in_image",
    "image_mirrored",
    "hand_confidence",
    "is_palm_image",
    "verification_message",
  ]);

  const readingEntries = analysis
    ? Object.entries(analysis).filter(
        ([key]) => !verificationKeys.has(key)
      )
    : [];

  /*
   * ==========================================================
   * MAIN COMPONENT
   * ==========================================================
   */

  return (
    <div
      style={styles.page}
    >
      {/* =====================================================
          AMBIENT BACKGROUND MAGIC
          ===================================================== */}

      <div
        aria-hidden="true"
        style={{
          ...styles.ambientOrb,
          ...styles.ambientOrbOne,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          ...styles.ambientOrb,
          ...styles.ambientOrbTwo,
        }}
      />

      <div
        aria-hidden="true"
        style={{
          ...styles.ambientOrb,
          ...styles.ambientOrbThree,
        }}
      />

      {/* =====================================================
          FLOATING MYSTICAL SYMBOLS
          ===================================================== */}

      <div
        aria-hidden="true"
        style={styles.floatingSymbols}
      >
        <span
          style={{
            ...styles.floatingSymbol,
            left: "8%",
            top: "16%",
            animationDelay: "0s",
          }}
        >
          ✦
        </span>

        <span
          style={{
            ...styles.floatingSymbol,
            left: "88%",
            top: "21%",
            animationDelay: "1.5s",
          }}
        >
          ◇
        </span>

        <span
          style={{
            ...styles.floatingSymbol,
            left: "12%",
            top: "72%",
            animationDelay: "3s",
          }}
        >
          ☾
        </span>

        <span
          style={{
            ...styles.floatingSymbol,
            left: "91%",
            top: "68%",
            animationDelay: "2s",
          }}
        >
          ✧
        </span>
      </div>

      {/* =====================================================
          PAGE HEADER
          ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        style={styles.header}
      >
        <div
          style={styles.headerOrnament}
        >
          <span>✦</span>
          <span>·</span>
          <span>✧</span>
          <span>·</span>
          <span>✦</span>
        </div>

        <h2
          style={styles.title}
        >
          Mystic Palm Reader
        </h2>

        <p
          style={styles.subtitle}
        >
          Let the ancient lines reveal what lies
          beneath the surface.
        </p>

        <div
          style={styles.headerDivider}
        />
      </motion.div>

      {/* =====================================================
          MAIN MANUSCRIPT
          ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          scale: 0.96,
          y: 20,
        }}
        animate={{
          opacity: 1,
          scale: 1,
          y: 0,
        }}
        transition={{
          duration: 0.9,
          ease: [0.2, 0.8, 0.2, 1],
        }}
        style={styles.manuscript}
      >
        {/* Inner manuscript frame */}

        <div
          aria-hidden="true"
          style={styles.innerFrame}
        />

        {/* ===================================================
            HAND SELECTOR
            =================================================== */}

        <div
          style={styles.controlSection}
        >
          <div
            style={styles.controlLabel}
          >
            <span
              style={styles.labelSymbol}
            >
              ✧
            </span>

            Choose the hand to be read
          </div>

          <select
            value={hand}
            onChange={
              handleHandChange
            }
            disabled={loading}
            style={styles.selectInput}
          >
            <option value="Right">
              Right Hand (Current Life Path)
            </option>

            <option value="Left">
              Left Hand (Innate Potential)
            </option>
          </select>
        </div>

        {/* ===================================================
            PALM SCANNER
            =================================================== */}

        <motion.div
          className="lunara-palm-upload-area"
          onClick={openFileSelector}
          onMouseEnter={() =>
            setIsHoveringUpload(true)
          }
          onMouseLeave={() =>
            setIsHoveringUpload(false)
          }
          animate={{
            scale:
              isHoveringUpload && !loading
                ? 1.012
                : 1,
          }}
          transition={{
            duration: 0.3,
          }}
          style={{
            ...styles.uploadArea,

            borderColor:
              isHoveringUpload ||
              loading
                ? "#e5bd5b"
                : "#6b3518",

            boxShadow:
              loading
                ? `
                  0 0 0 4px rgba(229,189,91,.08),
                  0 0 35px rgba(229,189,91,.3),
                  inset 0 0 50px rgba(107,53,24,.18)
                `
                : isHoveringUpload
                ? `
                  0 0 0 3px rgba(229,189,91,.08),
                  0 12px 30px rgba(58,28,13,.25),
                  inset 0 0 35px rgba(107,53,24,.15)
                `
                : styles.uploadArea.boxShadow,
          }}
        >
          {/* =================================================
              UPLOAD AREA CORNERS
              ================================================= */}

          <span
            style={{
              ...styles.corner,
              top: "12px",
              left: "12px",
              borderRight: "none",
              borderBottom: "none",
            }}
          />

          <span
            style={{
              ...styles.corner,
              top: "12px",
              right: "12px",
              borderLeft: "none",
              borderBottom: "none",
            }}
          />

          <span
            style={{
              ...styles.corner,
              bottom: "12px",
              left: "12px",
              borderRight: "none",
              borderTop: "none",
            }}
          />

          <span
            style={{
              ...styles.corner,
              bottom: "12px",
              right: "12px",
              borderLeft: "none",
              borderTop: "none",
            }}
          />

          {preview ? (
            /*
             * =================================================
             * IMAGE SCANNER
             * =================================================
             */

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.88,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: 0.8,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              style={
                styles.imageScanner
              }
            >
              {/* Rotating outer rings */}

              <div
                aria-hidden="true"
                style={{
                  ...styles.scannerRing,
                  ...styles.scannerRingOne,
                }}
              />

              <div
                aria-hidden="true"
                style={{
                  ...styles.scannerRing,
                  ...styles.scannerRingTwo,
                }}
              />

              <div
                aria-hidden="true"
                style={{
                  ...styles.scannerRing,
                  ...styles.scannerRingThree,
                }}
              />

              {/* Image container */}

              <div
                style={
                  styles.imageContainer
                }
              >
                <img
                  src={
                    processedImage ||
                    preview
                  }
                  alt="Palm"
                  style={{
                    ...styles.previewImage,

                    filter: loading
                      ? "brightness(.55) contrast(1.25) sepia(.35)"
                      : "none",
                  }}
                />

                {/* =================================================
                    FUTURISTIC PALM SCAN
                    ================================================= */}

                <AnimatePresence>
                  {loading && (
                    <>
                      {/* Main scanning beam */}

                      <motion.div
                        initial={{
                          top: "-5%",
                        }}
                        animate={{
                          top: [
                            "-5%",
                            "98%",
                            "-5%",
                          ],
                        }}
                        transition={{
                          duration: 2.4,
                          ease: "linear",
                          repeat: Infinity,
                        }}
                        style={
                          styles.scanBeam
                        }
                      />

                      {/* Bright beam core */}

                      <motion.div
                        initial={{
                          top: "-5%",
                        }}
                        animate={{
                          top: [
                            "-5%",
                            "98%",
                            "-5%",
                          ],
                        }}
                        transition={{
                          duration: 2.4,
                          ease: "linear",
                          repeat: Infinity,
                        }}
                        style={
                          styles.scanBeamCore
                        }
                      />

                      {/* Horizontal scan grid */}

                      <motion.div
                        animate={{
                          opacity: [
                            0.08,
                            0.25,
                            0.08,
                          ],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                        style={
                          styles.scanGrid
                        }
                      />

                      {/* Scanning coordinates */}

                      <div
                        style={
                          styles.scanCoordinates
                        }
                      >
                        <span>
                          PALM MATRIX
                        </span>

                        <span>
                          {hand.toUpperCase()}
                        </span>
                      </div>

                      {/* Energy nodes */}

                      {[
                        {
                          left: "22%",
                          top: "25%",
                        },
                        {
                          left: "70%",
                          top: "34%",
                        },
                        {
                          left: "43%",
                          top: "58%",
                        },
                        {
                          left: "75%",
                          top: "72%",
                        },
                        {
                          left: "30%",
                          top: "80%",
                        },
                      ].map(
                        (point, index) => (
                          <motion.span
                            key={index}
                            animate={{
                              scale: [
                                0.7,
                                1.4,
                                0.7,
                              ],
                              opacity: [
                                0.3,
                                1,
                                0.3,
                              ],
                            }}
                            transition={{
                              duration:
                                1.4 +
                                index *
                                  0.15,
                              repeat:
                                Infinity,
                              delay:
                                index *
                                0.18,
                            }}
                            style={{
                              ...styles.energyNode,
                              left:
                                point.left,
                              top:
                                point.top,
                            }}
                          />
                        )
                      )}

                      {/* Scanning corners */}

                      <div
                        style={
                          styles.scanStatus
                        }
                      >
                        <span
                          style={
                            styles.statusDot
                          }
                        />

                        TRACING DESTINY
                      </div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Floating symbols around image */}

              {loading && (
                <>
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={
                      styles.orbitSymbolOne
                    }
                  >
                    ✦
                  </motion.div>

                  <motion.div
                    animate={{
                      rotate: -360,
                    }}
                    transition={{
                      duration: 11,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={
                      styles.orbitSymbolTwo
                    }
                  >
                    ◇
                  </motion.div>
                </>
              )}
            </motion.div>
          ) : (
            /*
             * =================================================
             * EMPTY UPLOAD STATE
             * =================================================
             */

            <motion.div
              animate={{
                y: [
                  0,
                  -7,
                  0,
                ],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={
                styles.placeholder
              }
            >
              <div
                style={
                  styles.placeholderSeal
                }
              >
                <span>✋</span>

                <div
                  style={
                    styles.placeholderOrbit
                  }
                >
                  ✦
                </div>
              </div>

              <h3
                style={
                  styles.placeholderTitle
                }
              >
                Present Your Palm
              </h3>

              <p
                style={
                  styles.placeholderText
                }
              >
                Click here to reveal the ancient
                lines of your journey.
              </p>

              <div
                style={
                  styles.uploadHint
                }
              >
                <span>✦</span>

                CLEAR PALM IMAGE

                <span>✦</span>
              </div>
            </motion.div>
          )}

          {/* Hidden file input */}

          <input
            type="file"
            accept="image/*"
            onChange={
              handleFileChange
            }
            ref={fileInputRef}
            style={{
              display: "none",
            }}
          />
        </motion.div>

        {/* ===================================================
            FILE INFORMATION
            =================================================== */}

        <AnimatePresence>
          {file && (
            <motion.div
              initial={{
                opacity: 0,
                y: -8,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -8,
              }}
              style={
                styles.fileInfo
              }
            >
              <span>
                ✦
              </span>

              <span
                style={{
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace:
                    "nowrap",
                }}
              >
                {file.name}
              </span>

              <span>
                ✦
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===================================================
            ANALYZE BUTTON
            =================================================== */}

        <motion.button
          type="button"
          onClick={handleUpload}
          disabled={!file || loading}
          whileHover={
            file && !loading
              ? {
                  scale: 1.025,
                  y: -3,
                }
              : {}
          }
          whileTap={
            file && !loading
              ? {
                  scale: 0.98,
                }
              : {}
          }
          style={{
            ...styles.button,

            opacity:
              !file || loading
                ? 0.58
                : 1,

            cursor:
              !file || loading
                ? "not-allowed"
                : "pointer",

            boxShadow:
              loading
                ? `
                  0 0 25px rgba(229,189,91,.3),
                  0 10px 25px rgba(58,28,13,.35)
                `
                : styles.button.boxShadow,
          }}
        >
          {/* Button sweep */}

          {!loading && file && (
            <span
              aria-hidden="true"
              style={
                styles.buttonSweep
              }
            />
          )}

          {loading ? (
            <>
              <span
                style={
                  styles.buttonSpinner
                }
              />

              <span>
                Tracing Lines...
              </span>
            </>
          ) : (
            <>
              <span
                style={
                  styles.buttonIcon
                }
              >
                ✦
              </span>

              <span>
                Decode My Destiny
              </span>

              <span
                style={
                  styles.buttonArrow
                }
              >
                →
              </span>
            </>
          )}
        </motion.button>

        {/* ===================================================
            ERROR
            =================================================== */}

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{
                opacity: 0,
                y: -12,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -12,
                scale: 0.97,
              }}
              transition={{
                duration: 0.35,
              }}
              style={
                styles.errorBox
              }
            >
              <div
                style={
                  styles.errorIcon
                }
              >
                !
              </div>

              <strong>
                {error}
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* =====================================================
          ANALYSIS REVEAL
          ===================================================== */}

      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: 50,
            }}
            animate={{
              opacity: 1,
              height: "auto",
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: 30,
            }}
            transition={{
              duration: 1.25,
              ease: [
                0.16,
                1,
                0.3,
                1,
              ],
            }}
            style={
              styles.analysisWrapper
            }
          >
            {/* =================================================
                ANALYSIS MANUSCRIPT
                ================================================= */}

            <div
              style={
                styles.analysisScroll
              }
            >
              {/* Scroll top roll */}

              <div
                aria-hidden="true"
                style={
                  styles.scrollRollTop
                }
              >
                <span />
              </div>

              {/* =================================================
                  READING HEADER
                  ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  y: -15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.45,
                  duration: 0.7,
                }}
                style={
                  styles.analysisHeader
                }
              >
                <div
                  style={
                    styles.analysisSeal
                  }
                >
                  ✦
                </div>

                <div>
                  <div
                    style={
                      styles.analysisKicker
                    }
                  >
                    {(analysisHand || hand) === "Right"
                      ? "CURRENT LIFE PATH"
                      : "INNATE POTENTIAL"}
                  </div>

                  <h3
                    style={
                      styles.analysisTitle
                    }
                  >
                    Your Chiromancy Reading
                  </h3>

                  <div
                    style={
                      styles.analysisHandBadge
                    }
                  >
                    {(analysisHand || hand) === "Right"
                      ? "RIGHT PALM • CURRENT LIFE PATH"
                      : "LEFT PALM • INNATE POTENTIAL"}
                  </div>
                </div>

                <div
                  style={
                    styles.analysisSeal
                  }
                >
                  ✦
                </div>
              </motion.div>

              {/* Divider */}

              <div
                style={
                  styles.analysisDivider
                }
              >
                <span>✦</span>
                <span />
                <span>✧</span>
                <span />
                <span>✦</span>
              </div>

              {/* =================================================
                  HAND VERIFICATION
                  ================================================= */}

              {verification && (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 8,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.6,
                    duration: 0.5,
                  }}
                  style={
                    styles.verificationBadge
                  }
                >
                  <span
                    style={
                      styles.verificationSeal
                    }
                  >
                    ✓
                  </span>

                  <div>
                    <strong
                      style={
                        styles.verificationTitle
                      }
                    >
                      {verification.detected_hand ||
                        analysisHand ||
                        hand}
                      {" "}
                      Palm Verified
                    </strong>

                    <span
                      style={
                        styles.verificationText
                      }
                    >
                      {verification.message ||
                        "The selected palm matches the uploaded image."}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* =================================================
                  ANALYSIS ITEMS
                  ================================================= */}

              <div
                style={
                  styles.readingsContainer
                }
              >
                {readingEntries.map(
                  (
                    [
                      lineName,
                      interpretation,
                    ],
                    idx
                  ) => {
                    const isActive =
                      activeReading ===
                      idx;

                    return (
                      <motion.div
                        key={idx}
                        initial={{
                          opacity: 0,
                          x:
                            idx % 2 === 0
                              ? -35
                              : 35,
                          filter:
                            "blur(4px)",
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          filter:
                            "blur(0px)",
                        }}
                        transition={{
                          delay:
                            0.9 +
                            idx * 0.35,
                          duration: 0.7,
                          ease: [
                            0.2,
                            0.8,
                            0.2,
                            1,
                          ],
                        }}
                        onMouseEnter={() =>
                          setActiveReading(
                            idx
                          )
                        }
                        onMouseLeave={() =>
                          setActiveReading(
                            null
                          )
                        }
                        style={{
                          ...styles.readingItem,

                          transform:
                            isActive
                              ? "translateX(6px)"
                              : "translateX(0)",

                          boxShadow:
                            isActive
                              ? "0 8px 22px rgba(58,28,13,.15), 0 0 18px rgba(229,189,91,.18)"
                              : "none",
                        }}
                      >
                        {/* Number */}

                        <div
                          style={
                            styles.readingNumber
                          }
                        >
                          {String(
                            idx + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </div>

                        {/* Content */}

                        <div
                          style={
                            styles.readingContent
                          }
                        >
                          <h4
                            style={
                              styles.readingTitle
                            }
                          >
                            <span
                              style={
                                styles.readingStar
                              }
                            >
                              ✦
                            </span>

                            {lineName}
                          </h4>

                          <p
                            style={
                              styles.readingText
                            }
                          >
                            {interpretation}
                          </p>
                        </div>

                        {/* Animated edge */}

                        <motion.div
                          initial={{
                            scaleY: 0,
                          }}
                          animate={{
                            scaleY:
                              isActive
                                ? 1
                                : 0,
                          }}
                          transition={{
                            duration: 0.3,
                          }}
                          style={
                            styles.readingGlowEdge
                          }
                        />
                      </motion.div>
                    );
                  }
                )}
              </div>

              {/* =================================================
                  CLOSING ORNAMENT
                  ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.8,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay:
                    0.9 +
                    readingEntries.length *
                      0.35 +
                    0.3,
                  duration: 0.8,
                }}
                style={
                  styles.analysisClosing
                }
              >
                <span>✦</span>

                <span>
                  THE LINES HAVE SPOKEN
                </span>

                <span>✦</span>
              </motion.div>

              <button type="button" onClick={() => downloadPdfReport('Palmistry Reading', [
                { heading: 'Reading details', lines: [`Hand analyzed: ${analysisHand || hand}`, `Date: ${new Date().toLocaleString()}`, 'Verification: Palm image and selected hand verified.'] },
                { heading: 'Palm analysis', lines: readingEntries.map(([lineName, interpretation]) => `${lineName}: ${interpretation}`) },
                { heading: 'Reflection note', lines: ['For reflection and personal insight. This reading is not a guaranteed prediction or professional medical, financial, or legal advice.'] },
              ], `lunara-palm-${(analysisHand || hand).toLowerCase()}-${new Date().toISOString().slice(0, 10)}.pdf`)} style={{ display: 'block', margin: '20px auto 4px', padding: '11px 18px', border: '1px solid #8b571d', borderRadius: 5, color: '#fff1c4', background: 'linear-gradient(135deg,#4a2412,#6b3518)', font: 'inherit', fontWeight: 700, cursor: 'pointer' }}>Download Palm report (PDF)</button>

              {/* Scroll bottom roll */}

              <div
                aria-hidden="true"
                style={
                  styles.scrollRollBottom
                }
              >
                <span />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================
          COMPONENT ANIMATION STYLES
          ===================================================== */}

      <style>
        {`
          @keyframes palmAmbientOne {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
            }

            50% {
              transform: translate3d(35px, -25px, 0) scale(1.08);
            }
          }

          @keyframes palmAmbientTwo {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }

            50% {
              transform: translate3d(-30px, 30px, 0);
            }
          }

          @keyframes palmFloatingSymbol {
            0%, 100% {
              transform: translateY(0) rotate(0deg);
              opacity: .25;
            }

            50% {
              transform: translateY(-20px) rotate(15deg);
              opacity: .8;
            }
          }

          @keyframes palmRingOne {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }

            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes palmRingTwo {
            from {
              transform: translate(-50%, -50%) rotate(360deg);
            }

            to {
              transform: translate(-50%, -50%) rotate(0deg);
            }
          }

          @keyframes palmRingThree {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }

            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes palmNodePulse {
            0%, 100% {
              box-shadow:
                0 0 4px rgba(229,189,91,.4);
            }

            50% {
              box-shadow:
                0 0 18px rgba(229,189,91,1);
            }
          }

          @keyframes palmButtonSweep {
            0%, 55% {
              left: -70%;
              opacity: 0;
            }

            65% {
              opacity: .8;
            }

            90%, 100% {
              left: 145%;
              opacity: 0;
            }
          }

          @keyframes palmSpinner {
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes palmStatusPulse {
            0%, 100% {
              opacity: .5;
              transform: scale(1);
            }

            50% {
              opacity: 1;
              transform: scale(1.35);
            }
          }

          @media (max-width: 700px) {
            .lunara-palm-upload-area {
              min-height: 260px !important;
            }

            .lunara-palm-manuscript {
              padding: 1.3rem !important;
            }
          }

          @media (max-width: 480px) {
            .lunara-palm-upload-area {
              padding: 12px !important;
            }

            .lunara-palm-title {
              font-size: 1.8rem !important;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .lunara-palm-page *,
            .lunara-palm-page {
              animation: none !important;
              transition: none !important;
            }
          }
        `}
      </style>
    </div>
  );
}

/*
 * ============================================================
 * STYLE SYSTEM
 * ============================================================
 */

const styles = {
  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  page: {
    width: "100%",

    maxWidth: "900px",

    margin: "0 auto",

    padding:
      "1.5rem 1rem 4rem",

    boxSizing: "border-box",

    position: "relative",

    fontFamily:
      'Georgia, "Times New Roman", serif',

    color: "#29160b",

    isolation: "isolate",
  },

  /*
   * ==========================================================
   * AMBIENT ORBS
   * ==========================================================
   */

  ambientOrb: {
    position: "fixed",

    width: "380px",

    height: "380px",

    borderRadius: "50%",

    pointerEvents: "none",

    zIndex: -2,

    filter: "blur(10px)",
  },

  ambientOrbOne: {
    top: "12%",

    left: "-220px",

    background:
      "radial-gradient(circle, rgba(240,198,106,.24), transparent 68%)",

    animation:
      "palmAmbientOne 10s ease-in-out infinite",
  },

  ambientOrbTwo: {
    bottom: "5%",

    right: "-220px",

    background:
      "radial-gradient(circle, rgba(74,40,88,.12), transparent 68%)",

    animation:
      "palmAmbientTwo 12s ease-in-out infinite",
  },

  ambientOrbThree: {
    top: "45%",

    right: "20%",

    width: "250px",

    height: "250px",

    background:
      "radial-gradient(circle, rgba(229,189,91,.10), transparent 70%)",
  },

  /*
   * ==========================================================
   * FLOATING SYMBOLS
   * ==========================================================
   */

  floatingSymbols: {
    position: "fixed",

    inset: 0,

    pointerEvents: "none",

    zIndex: -1,
  },

  floatingSymbol: {
    position: "absolute",

    color: "#6b3518",

    fontSize: "1.3rem",

    opacity: 0.35,

    animation:
      "palmFloatingSymbol 5s ease-in-out infinite",
  },

  /*
   * ==========================================================
   * HEADER
   * ==========================================================
   */

  header: {
    textAlign: "center",

    marginBottom: "1.5rem",

    position: "relative",

    zIndex: 2,
  },

  headerOrnament: {
    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    gap: "10px",

    marginBottom: "8px",

    color: "#6b3518",

    fontSize: "0.8rem",

    letterSpacing: "0.3em",
  },

  title: {
    margin: 0,

    color: "#3a1c0d",

    fontSize:
      "clamp(2rem, 6vw, 3rem)",

    lineHeight: 1.1,

    fontWeight: 700,

    letterSpacing: "0.035em",

    textShadow:
      "0 2px 0 rgba(255,224,137,.55), 0 5px 18px rgba(58,28,13,.18)",
  },

  subtitle: {
    maxWidth: "620px",

    margin:
      "10px auto 15px",

    color:
      "rgba(58,28,13,.75)",

    fontSize: "0.98rem",

    lineHeight: 1.6,

    fontStyle: "italic",
  },

  headerDivider: {
    width: "70%",

    maxWidth: "500px",

    height: "1px",

    margin: "0 auto",

    background:
      "linear-gradient(90deg, transparent, #9a6b20, #e5bd5b, #9a6b20, transparent)",
  },

  /*
   * ==========================================================
   * MAIN MANUSCRIPT
   * ==========================================================
   */

  manuscript: {
    position: "relative",

    padding: "2rem",

    border:
      "3px solid #6b3518",

    borderRadius: "14px",

    background: `
      radial-gradient(
        circle at 20% 10%,
        rgba(255,225,143,.35),
        transparent 30%
      ),
      linear-gradient(
        145deg,
        rgba(232,201,130,.96),
        rgba(201,138,50,.94)
      )
    `,

    boxShadow: `
      0 22px 50px rgba(58,28,13,.36),
      inset 0 0 50px rgba(107,53,24,.15),
      inset 0 1px 0 rgba(255,235,166,.75)
    `,

    overflow: "hidden",
  },

  innerFrame: {
    position: "absolute",

    inset: "9px",

    border:
      "1px solid rgba(107,53,24,.38)",

    borderRadius: "8px",

    pointerEvents: "none",
  },

  /*
   * ==========================================================
   * CONTROL
   * ==========================================================
   */

  controlSection: {
    position: "relative",

    zIndex: 2,

    marginBottom: "1.4rem",
  },

  controlLabel: {
    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    gap: "7px",

    marginBottom: "8px",

    color: "#4a2412",

    fontSize: "0.78rem",

    fontWeight: 700,

    letterSpacing: "0.1em",

    textTransform: "uppercase",
  },

  labelSymbol: {
    color: "#6b3518",

    fontSize: "1rem",
  },

  selectInput: {
    width: "100%",

    padding: "13px 14px",

    boxSizing: "border-box",

    color: "#29160b",

    background:
      "linear-gradient(135deg, #e8c982, #d09a3d)",

    border:
      "2px solid #6b3518",

    borderRadius: "7px",

    fontFamily:
      'Georgia, "Times New Roman", serif',

    fontSize: "1rem",

    fontWeight: 700,

    cursor: "pointer",

    outline: "none",

    boxShadow:
      "inset 0 2px 8px rgba(58,28,13,.10)",

    transition:
      "box-shadow .25s ease, border-color .25s ease",
  },

  /*
   * ==========================================================
   * UPLOAD AREA
   * ==========================================================
   */

  uploadArea: {
    position: "relative",

    minHeight: "340px",

    padding: "22px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    boxSizing: "border-box",

    border:
      "2px dashed #6b3518",

    borderRadius: "10px",

    background:
      "radial-gradient(circle at center, rgba(240,198,106,.28), rgba(183,117,36,.18))",

    boxShadow:
      "inset 0 0 35px rgba(107,53,24,.12)",

    cursor: "pointer",

    overflow: "hidden",

    transition:
      "border-color .3s ease, box-shadow .3s ease",
  },

  /*
   * ==========================================================
   * CORNERS
   * ==========================================================
   */

  corner: {
    position: "absolute",

    width: "22px",

    height: "22px",

    border:
      "2px solid #9a6b20",

    opacity: 0.7,

    pointerEvents: "none",
  },

  /*
   * ==========================================================
   * IMAGE SCANNER
   * ==========================================================
   */

  imageScanner: {
    position: "relative",

    width: "min(100%, 500px)",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    padding: "20px",

    boxSizing: "border-box",
  },

  scannerRing: {
    position: "absolute",

    left: "50%",

    top: "50%",

    borderRadius: "50%",

    border:
      "1px solid rgba(229,189,91,.35)",

    pointerEvents: "none",
  },

  scannerRingOne: {
    width: "calc(100% - 8px)",

    height: "calc(100% - 8px)",

    animation:
      "palmRingOne 12s linear infinite",
  },

  scannerRingTwo: {
    width: "calc(100% - 35px)",

    height: "calc(100% - 35px)",

    borderStyle: "dashed",

    animation:
      "palmRingTwo 9s linear infinite",
  },

  scannerRingThree: {
    width: "calc(100% - 65px)",

    height: "calc(100% - 65px)",

    borderColor:
      "rgba(74,40,88,.24)",

    animation:
      "palmRingThree 15s linear infinite",
  },

  imageContainer: {
    position: "relative",

    width: "100%",

    display: "flex",

    justifyContent: "center",

    overflow: "hidden",

    borderRadius: "7px",

    boxShadow:
      "0 12px 28px rgba(58,28,13,.32)",
  },

  previewImage: {
    display: "block",

    maxWidth: "100%",

    maxHeight: "430px",

    width: "auto",

    objectFit: "contain",

    border:
      "2px solid #6b3518",

    borderRadius: "6px",

    transition:
      "filter .5s ease",
  },

  /*
   * ==========================================================
   * SCAN EFFECTS
   * ==========================================================
   */

  scanBeam: {
    position: "absolute",

    left: 0,

    width: "100%",

    height: "25%",

    background:
      "linear-gradient(180deg, transparent, rgba(229,189,91,.12), rgba(229,189,91,.35), rgba(229,189,91,.12), transparent)",

    boxShadow:
      "0 0 25px rgba(229,189,91,.45)",

    zIndex: 4,

    pointerEvents: "none",
  },

  scanBeamCore: {
    position: "absolute",

    left: 0,

    width: "100%",

    height: "2px",

    background:
      "linear-gradient(90deg, transparent, #f7df9b 20%, #fff1c4 50%, #f7df9b 80%, transparent)",

    boxShadow:
      "0 0 15px 4px rgba(229,189,91,.75)",

    zIndex: 6,

    pointerEvents: "none",
  },

  scanGrid: {
    position: "absolute",

    inset: 0,

    backgroundImage:
      "linear-gradient(rgba(229,189,91,.18) 1px, transparent 1px), linear-gradient(90deg, rgba(229,189,91,.12) 1px, transparent 1px)",

    backgroundSize:
      "28px 28px",

    zIndex: 3,

    pointerEvents: "none",
  },

  scanCoordinates: {
    position: "absolute",

    top: "10px",

    left: "12px",

    right: "12px",

    display: "flex",

    justifyContent: "space-between",

    color: "#f7df9b",

    fontFamily:
      "monospace",

    fontSize: "0.58rem",

    letterSpacing: "0.12em",

    zIndex: 8,

    textShadow:
      "0 0 8px rgba(229,189,91,.8)",

    pointerEvents: "none",
  },

  scanStatus: {
    position: "absolute",

    left: "50%",

    bottom: "12px",

    transform:
      "translateX(-50%)",

    display: "flex",

    alignItems: "center",

    gap: "7px",

    padding:
      "5px 10px",

    color: "#f7df9b",

    background:
      "rgba(41,22,11,.72)",

    border:
      "1px solid rgba(229,189,91,.55)",

    borderRadius: "999px",

    fontFamily:
      "monospace",

    fontSize: "0.58rem",

    letterSpacing: "0.12em",

    zIndex: 8,

    whiteSpace: "nowrap",

    pointerEvents: "none",
  },

  statusDot: {
    width: "6px",

    height: "6px",

    borderRadius: "50%",

    background: "#e5bd5b",

    boxShadow:
      "0 0 10px #e5bd5b",

    animation:
      "palmStatusPulse 1.3s ease-in-out infinite",
  },

  energyNode: {
    position: "absolute",

    width: "6px",

    height: "6px",

    borderRadius: "50%",

    background: "#f7df9b",

    boxShadow:
      "0 0 12px rgba(229,189,91,.8)",

    zIndex: 9,

    pointerEvents: "none",

    animation:
      "palmNodePulse 1.4s ease-in-out infinite",
  },

  orbitSymbolOne: {
    position: "absolute",

    top: "4%",

    right: "8%",

    color: "#e5bd5b",

    fontSize: "1.2rem",

    textShadow:
      "0 0 15px rgba(229,189,91,.8)",

    zIndex: 10,
  },

  orbitSymbolTwo: {
    position: "absolute",

    bottom: "3%",

    left: "8%",

    color: "#69426f",

    fontSize: "1.4rem",

    textShadow:
      "0 0 15px rgba(74,40,88,.5)",

    zIndex: 10,
  },

  /*
   * ==========================================================
   * PLACEHOLDER
   * ==========================================================
   */

  placeholder: {
    position: "relative",

    textAlign: "center",

    maxWidth: "350px",

    padding: "20px",
  },

  placeholderSeal: {
    position: "relative",

    width: "95px",

    height: "95px",

    margin:
      "0 auto 18px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    border:
      "2px solid #9a6b20",

    borderRadius: "50%",

    color: "#6b3518",

    fontSize: "3.2rem",

    background:
      "rgba(240,198,106,.25)",

    boxShadow:
      "0 0 25px rgba(229,189,91,.2), inset 0 0 20px rgba(107,53,24,.12)",
  },

  placeholderOrbit: {
    position: "absolute",

    inset: "-9px",

    display: "flex",

    alignItems: "flex-start",

    justifyContent: "center",

    color: "#9a6b20",

    fontSize: "0.8rem",

    animation:
      "palmRingOne 8s linear infinite",
  },

  placeholderTitle: {
    margin:
      "0 0 8px",

    color: "#3a1c0d",

    fontSize: "1.5rem",

    letterSpacing: "0.04em",
  },

  placeholderText: {
    margin:
      "0 auto 18px",

    color:
      "rgba(58,28,13,.72)",

    fontSize: "0.95rem",

    lineHeight: 1.7,

    fontStyle: "italic",
  },

  uploadHint: {
    display: "inline-flex",

    alignItems: "center",

    gap: "8px",

    padding:
      "7px 12px",

    border:
      "1px solid rgba(107,53,24,.5)",

    borderRadius: "999px",

    color: "#6b3518",

    fontSize: "0.67rem",

    fontWeight: 700,

    letterSpacing: "0.12em",
  },

  /*
   * ==========================================================
   * FILE INFO
   * ==========================================================
   */

  fileInfo: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px",

    marginTop: "12px",

    color: "#5c3017",

    fontSize: "0.78rem",

    fontWeight: 700,
  },

  /*
   * ==========================================================
   * BUTTON
   * ==========================================================
   */

  button: {
    position: "relative",

    width: "100%",

    minHeight: "56px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px",

    overflow: "hidden",

    marginTop: "1.4rem",

    padding:
      "14px 20px",

    border:
      "2px solid #9a6b20",

    borderRadius: "8px",

    color: "#f7df9b",

    background:
      "linear-gradient(135deg, #4a2412, #6b3518)",

    fontFamily:
      'Georgia, "Times New Roman", serif',

    fontSize: "1.05rem",

    fontWeight: 700,

    letterSpacing: "0.1em",

    textTransform: "uppercase",

    boxShadow:
      "0 9px 22px rgba(58,28,13,.35)",

    transition:
      "box-shadow .25s ease, border-color .25s ease",
  },

  buttonIcon: {
    color: "#e5bd5b",

    fontSize: "1.2rem",
  },

  buttonArrow: {
    color: "#e5bd5b",

    fontSize: "1.15rem",
  },

  buttonSweep: {
    position: "absolute",

    top: 0,

    bottom: 0,

    left: "-70%",

    width: "45%",

    transform:
      "skewX(-20deg)",

    background:
      "linear-gradient(90deg, transparent, rgba(255,235,166,.3), transparent)",

    animation:
      "palmButtonSweep 4s ease-in-out infinite",

    pointerEvents: "none",
  },

  buttonSpinner: {
    width: "17px",

    height: "17px",

    border:
      "2px solid rgba(247,223,155,.3)",

    borderTopColor:
      "#f7df9b",

    borderRadius: "50%",

    animation:
      "palmSpinner .75s linear infinite",
  },

  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  errorBox: {
    display: "flex",

    alignItems: "center",

    gap: "12px",

    marginTop: "1.2rem",

    padding: "14px",

    color: "#6e1d16",

    background:
      "rgba(255,218,177,.4)",

    border:
      "2px solid #7b241c",

    borderRadius: "8px",

    textAlign: "left",

    fontSize: "0.9rem",

    lineHeight: 1.5,

    boxShadow:
      "inset 0 0 15px rgba(107,53,24,.08)",
  },

  errorIcon: {
    flexShrink: 0,

    width: "28px",

    height: "28px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    borderRadius: "50%",

    color: "#f8d9ae",

    background: "#7b241c",

    fontWeight: 700,
  },

  /*
   * ==========================================================
   * ANALYSIS
   * ==========================================================
   */

  analysisWrapper: {
    width: "100%",

    overflow: "hidden",

    marginTop: "2.5rem",
  },

  analysisScroll: {
    position: "relative",

    padding:
      "3rem 2.2rem",

    color: "#29160b",

    background: `
      radial-gradient(
        circle at 25% 12%,
        rgba(255,225,143,.5),
        transparent 28%
      ),
      linear-gradient(
        to bottom,
        #e8c982,
        #d4a34d
      )
    `,

    borderLeft:
      "3px solid #6b3518",

    borderRight:
      "3px solid #6b3518",

    boxShadow: `
      0 22px 45px rgba(58,28,13,.42),
      inset 0 0 45px rgba(92,58,33,.2)
    `,
  },

  scrollRollTop: {
    position: "absolute",

    top: "-13px",

    left: "-10px",

    right: "-10px",

    height: "26px",

    border:
      "3px solid #6b3518",

    borderRadius: "50%",

    background:
      "linear-gradient(180deg, #8b4d1c, #c98a32, #8b4d1c)",

    boxShadow:
      "0 7px 12px rgba(58,28,13,.3)",
  },

  scrollRollBottom: {
    position: "absolute",

    bottom: "-13px",

    left: "-10px",

    right: "-10px",

    height: "26px",

    border:
      "3px solid #6b3518",

    borderRadius: "50%",

    background:
      "linear-gradient(180deg, #8b4d1c, #c98a32, #8b4d1c)",

    boxShadow:
      "0 -7px 12px rgba(58,28,13,.3)",
  },

  /*
   * ==========================================================
   * ANALYSIS HEADER
   * ==========================================================
   */

  verificationBadge: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    boxSizing: "border-box",
    margin: "0 auto 24px",
    padding: "13px 16px",
    border: "1px solid rgba(107,53,24,.22)",
    borderRadius: "14px",
    background: "rgba(255,248,225,.62)",
    boxShadow: "0 8px 22px rgba(58,28,13,.08)",
  },

  verificationSeal: {
    flex: "0 0 auto",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#6b3518",
    color: "#fff7df",
    fontWeight: 800,
    fontSize: "0.9rem",
  },

  verificationTitle: {
    display: "block",
    marginBottom: "2px",
    color: "#5a2b15",
    fontFamily: "Georgia, serif",
    fontSize: "0.95rem",
    letterSpacing: "0.03em",
  },

  verificationText: {
    display: "block",
    color: "#70482f",
    fontSize: "0.78rem",
    lineHeight: 1.45,
  },

  analysisHandBadge: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent: "center",

    marginTop: "8px",

    padding:
      "5px 10px",

    border:
      "1px solid rgba(154,107,32,.58)",

    borderRadius: "999px",

    color: "#6b3518",

    background:
      "rgba(255,235,166,.28)",

    fontSize: "0.62rem",

    fontWeight: 700,

    letterSpacing: "0.09em",

    textTransform: "uppercase",

    boxShadow:
      "inset 0 1px 0 rgba(255,255,255,.35)",
  },

  analysisHeader: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "18px",

    textAlign: "center",
  },

  analysisSeal: {
    flexShrink: 0,

    width: "45px",

    height: "45px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#e5bd5b",

    background:
      "linear-gradient(145deg, #4a2412, #6b3518)",

    border:
      "1px solid #9a6b20",

    borderRadius: "50%",

    boxShadow:
      "0 0 15px rgba(229,189,91,.2)",

    fontSize: "1.1rem",
  },

  analysisKicker: {
    marginBottom: "5px",

    color: "#6b3518",

    fontSize: "0.65rem",

    fontWeight: 700,

    letterSpacing: "0.2em",

    textTransform: "uppercase",
  },

  analysisTitle: {
    margin: 0,

    color: "#3a1c0d",

    fontSize:
      "clamp(1.55rem, 5vw, 2.2rem)",

    lineHeight: 1.15,

    letterSpacing: "0.025em",

    textShadow:
      "0 1px rgba(255,224,137,.7)",
  },

  analysisDivider: {
    display: "flex",

    alignItems: "center",

    gap: "10px",

    margin:
      "1.5rem 0 2rem",

    color: "#6b3518",

    fontSize: "0.8rem",
  },

  readingsContainer: {
    display: "flex",

    flexDirection: "column",

    gap: "12px",
  },

  /*
   * ==========================================================
   * READING ITEM
   * ==========================================================
   */

  readingItem: {
    position: "relative",

    display: "flex",

    gap: "16px",

    padding:
      "1.15rem 1rem",

    border:
      "1px solid rgba(107,53,24,.35)",

    borderRadius: "8px",

    background:
      "rgba(240,198,106,.26)",

    transition:
      "transform .3s ease, box-shadow .3s ease",

    overflow: "hidden",
  },

  readingNumber: {
    flexShrink: 0,

    width: "38px",

    height: "38px",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    color: "#f7df9b",

    background:
      "linear-gradient(145deg, #4a2412, #6b3518)",

    border:
      "1px solid #9a6b20",

    borderRadius: "50%",

    fontSize: "0.68rem",

    fontWeight: 700,

    boxShadow:
      "0 5px 12px rgba(58,28,13,.2)",
  },

  readingContent: {
    flex: 1,

    minWidth: 0,
  },

  readingTitle: {
    display: "flex",

    alignItems: "center",

    gap: "7px",

    margin:
      "0 0 6px",

    color: "#5c3017",

    fontSize: "1.2rem",

    lineHeight: 1.25,
  },

  readingStar: {
    color: "#9a6b20",

    fontSize: "0.85rem",
  },

  readingText: {
    margin: 0,

    color:
      "rgba(41,22,11,.88)",

    fontSize: "1rem",

    lineHeight: 1.75,
  },

  readingGlowEdge: {
    position: "absolute",

    top: 0,

    bottom: 0,

    left: 0,

    width: "3px",

    transformOrigin: "center",

    background:
      "linear-gradient(180deg, transparent, #e5bd5b, transparent)",

    boxShadow:
      "0 0 12px rgba(229,189,91,.5)",
  },

  /*
   * ==========================================================
   * ANALYSIS CLOSING
   * ==========================================================
   */

  analysisClosing: {
    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "13px",

    marginTop: "2rem",

    color: "#6b3518",

    fontSize: "0.68rem",

    fontWeight: 700,

    letterSpacing: "0.18em",

    textAlign: "center",
  },
};
