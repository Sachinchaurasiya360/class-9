"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Network, XCircle, LayoutGrid, Play, RotateCcw, Pause, Info } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Shared constants                                                   */
/* ================================================================== */

const PRIMARY = "var(--eng-primary)";
const SUCCESS = "var(--eng-success)";
const DANGER = "var(--eng-danger)";
const WARNING = "var(--eng-warning)";
const TEXT = "var(--eng-text)";
const MUTED = "var(--eng-text-muted)";
const SURFACE = "var(--eng-surface)";
const BORDER = "var(--eng-border)";
const FONT = "var(--eng-font)";

/* ================================================================== */
/*  Tab 1 -- TCP 3-Way Handshake                                       */
/* ================================================================== */

interface HandshakeStep {
  label: string;
  fromX: number;
  toX: number;
  y: number;
  color: string;
  seq: string;
  ack: string;
  flags: string;
  description: string;
}

const HANDSHAKE_STEPS: HandshakeStep[] = [
  {
    label: "SYN",
    fromX: 120,
    toX: 480,
    y: 120,
    color: "#3b82f6",
    seq: "Seq=100",
    ack: "Ack=0",
    flags: "SYN=1",
    description: "Client sends SYN with initial sequence number (ISN=100)",
  },
  {
    label: "SYN-ACK",
    fromX: 480,
    toX: 120,
    y: 200,
    color: "#8b5cf6",
    seq: "Seq=300",
    ack: "Ack=101",
    flags: "SYN=1, ACK=1",
    description: "Server responds with SYN-ACK, acknowledging client ISN+1",
  },
  {
    label: "ACK",
    fromX: 120,
    toX: 480,
    y: 280,
    color: "#10b981",
    seq: "Seq=101",
    ack: "Ack=301",
    flags: "ACK=1",
    description: "Client sends ACK, connection is now ESTABLISHED",
  },
];

function HandshakeTab() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= HANDSHAKE_STEPS.length) {
        setPlaying(false);
        setShowBanner(true);
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (playing && step < HANDSHAKE_STEPS.length - 1) {
      timerRef.current = setTimeout(advance, 1200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, step, advance]);

  const handlePlay = () => {
    if (step >= HANDSHAKE_STEPS.length - 1) {
      setStep(-1);
      setShowBanner(false);
      setTimeout(() => {
        setStep(0);
        setPlaying(true);
      }, 200);
    } else {
      if (step === -1) setStep(0);
      setPlaying(true);
    }
  };

  const handleReset = () => {
    setStep(-1);
    setPlaying(false);
    setShowBanner(false);
  };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP 3-Way Handshake
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 16px", lineHeight: 1.6 }}>
        Before any data flows, TCP establishes a reliable connection using three messages. Watch the sequence below.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 400" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          {/* Timeline labels */}
          <text x={120} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Client
          </text>
          <text x={480} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Server
          </text>

          {/* Vertical timelines */}
          <line x1={120} y1={55} x2={120} y2={360} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <line x1={480} y1={55} x2={480} y2={360} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />

          {/* Timeline dots */}
          <circle cx={120} cy={55} r={6} fill={PRIMARY} />
          <circle cx={480} cy={55} r={6} fill={PRIMARY} />

          {/* State labels */}
          {step >= 0 && (
            <text x={40} y={100} style={{ fontFamily: FONT, fontSize: 10, fill: "#3b82f6" }}>
              SYN_SENT
            </text>
          )}
          {step >= 1 && (
            <text x={510} y={180} style={{ fontFamily: FONT, fontSize: 10, fill: "#8b5cf6" }}>
              SYN_RCVD
            </text>
          )}
          {step >= 2 && (
            <>
              <text x={30} y={310} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>
                ESTABLISHED
              </text>
              <text x={510} y={310} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>
                ESTABLISHED
              </text>
            </>
          )}

          {/* Arrows */}
          {HANDSHAKE_STEPS.map((s, i) => {
            if (i > step) return null;
            const isAnimating = i === step;
            const midX = (s.fromX + s.toX) / 2;
            const goingRight = s.toX > s.fromX;
            return (
              <g key={i}>
                <defs>
                  <marker id={`arrow-${i}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={s.color} />
                  </marker>
                </defs>
                <line
                  x1={s.fromX}
                  y1={s.y}
                  x2={s.toX}
                  y2={s.y}
                  stroke={s.color}
                  strokeWidth={2.5}
                  markerEnd={`url(#arrow-${i})`}
                  style={{
                    opacity: isAnimating ? 0 : 1,
                    animation: isAnimating ? "engArrowDraw 0.6s ease-out forwards" : undefined,
                  }}
                />
                {/* Label above arrow */}
                <rect
                  x={midX - 40}
                  y={s.y - 30}
                  width={80}
                  height={20}
                  rx={4}
                  fill={s.color}
                  opacity={0.15}
                />
                <text
                  x={midX}
                  y={s.y - 16}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: s.color }}
                >
                  {s.label}
                </text>
                {/* Seq/Ack below */}
                <text
                  x={midX}
                  y={s.y + 15}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}
                >
                  {s.seq}, {s.ack}
                </text>
              </g>
            );
          })}

          {/* Established banner */}
          {showBanner && (
            <g>
              <rect x={150} y={330} width={300} height={36} rx={8} fill="#10b981" opacity={0.15} />
              <rect x={150} y={330} width={300} height={36} rx={8} stroke="#10b981" strokeWidth={2} fill="none" />
              <text x={300} y={354} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: "#10b981" }}>
                CONNECTION ESTABLISHED
              </text>
            </g>
          )}
        </svg>

        <style>{`
          @keyframes engArrowDraw {
            from { opacity: 0; stroke-dashoffset: 400; stroke-dasharray: 400; }
            to { opacity: 1; stroke-dashoffset: 0; stroke-dasharray: 400; }
          }
        `}</style>
      </div>

      {/* Controls */}
      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> {step >= HANDSHAKE_STEPS.length - 1 ? "Replay" : "Play"}
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Step description */}
      {step >= 0 && step < HANDSHAKE_STEPS.length && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto" }}>
          <strong>Step {step + 1}:</strong> {HANDSHAKE_STEPS[step].description}
          <br />
          <span style={{ fontSize: "0.8rem", color: MUTED }}>
            Flags: {HANDSHAKE_STEPS[step].flags}
          </span>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 -- TCP 4-Way Termination                                     */
/* ================================================================== */

interface TermStep {
  label: string;
  fromX: number;
  toX: number;
  y: number;
  color: string;
  description: string;
}

const TERM_STEPS: TermStep[] = [
  { label: "FIN", fromX: 120, toX: 480, y: 110, color: "#ef4444", description: "Client initiates close with FIN" },
  { label: "ACK", fromX: 480, toX: 120, y: 170, color: "#f59e0b", description: "Server acknowledges the FIN" },
  { label: "FIN", fromX: 480, toX: 120, y: 240, color: "#ef4444", description: "Server sends its own FIN" },
  { label: "ACK", fromX: 120, toX: 480, y: 300, color: "#f59e0b", description: "Client acknowledges -- enters TIME_WAIT" },
];

function TerminationTab() {
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerVal, setTimerVal] = useState(60);
  const [scenario, setScenario] = useState<"normal" | "synloss" | "simopen">("normal");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reset = useCallback(() => {
    setStep(-1);
    setPlaying(false);
    setShowTimer(false);
    setTimerVal(60);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countRef.current) clearInterval(countRef.current);
  }, []);

  const advance = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= TERM_STEPS.length) {
        setPlaying(false);
        setShowTimer(true);
        return prev;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (playing && step < TERM_STEPS.length - 1) {
      timerRef.current = setTimeout(advance, 1000);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, step, advance]);

  // TIME_WAIT countdown
  useEffect(() => {
    if (showTimer && timerVal > 0) {
      countRef.current = setInterval(() => {
        setTimerVal((v) => {
          if (v <= 1) {
            if (countRef.current) clearInterval(countRef.current);
            return 0;
          }
          return v - 5;
        });
      }, 200);
    }
    return () => { if (countRef.current) clearInterval(countRef.current); };
  }, [showTimer, timerVal]);

  const handlePlay = () => {
    reset();
    setTimeout(() => { setStep(0); setPlaying(true); }, 100);
  };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP 4-Way Termination
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        Closing a TCP connection requires four messages. The TIME_WAIT state ensures late packets are handled.
      </p>

      {/* Scenario selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
        {([["normal", "Normal Close"], ["synloss", "SYN Loss Scenario"], ["simopen", "Simultaneous Open"]] as const).map(([key, label]) => (
          <button
            key={key}
            className={scenario === key ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            onClick={() => { setScenario(key); reset(); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 400" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          <text x={120} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Client
          </text>
          <text x={480} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>
            Server
          </text>
          <line x1={120} y1={55} x2={120} y2={380} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <line x1={480} y1={55} x2={480} y2={380} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <circle cx={120} cy={55} r={6} fill={PRIMARY} />
          <circle cx={480} cy={55} r={6} fill={PRIMARY} />

          {/* Both ESTABLISHED initially */}
          <text x={30} y={80} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>ESTABLISHED</text>
          <text x={510} y={80} style={{ fontFamily: FONT, fontSize: 10, fill: "#10b981" }}>ESTABLISHED</text>

          {scenario === "normal" && TERM_STEPS.map((s, i) => {
            if (i > step) return null;
            const midX = (s.fromX + s.toX) / 2;
            return (
              <g key={i}>
                <defs>
                  <marker id={`tarrow-${i}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill={s.color} />
                  </marker>
                </defs>
                <line x1={s.fromX} y1={s.y} x2={s.toX} y2={s.y} stroke={s.color} strokeWidth={2.5} markerEnd={`url(#tarrow-${i})`} />
                <text x={midX} y={s.y - 8} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: s.color }}>
                  {s.label}
                </text>
              </g>
            );
          })}

          {scenario === "synloss" && (
            <g>
              <text x={300} y={160} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 13, fill: DANGER, fontWeight: 600 }}>
                SYN Lost! Retransmit after timeout
              </text>
              {step >= 0 && (
                <>
                  <line x1={120} y1={130} x2={300} y2={130} stroke="#ef4444" strokeWidth={2} strokeDasharray="8,4" />
                  <text x={310} y={128} style={{ fontFamily: FONT, fontSize: 20, fill: "#ef4444" }}>X</text>
                </>
              )}
              {step >= 1 && (
                <>
                  <defs>
                    <marker id="tarrow-retry" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                  </defs>
                  <line x1={120} y1={210} x2={480} y2={210} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#tarrow-retry)" />
                  <text x={300} y={200} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: "#3b82f6" }}>
                    SYN (Retransmit)
                  </text>
                </>
              )}
              {step >= 2 && (
                <>
                  <defs>
                    <marker id="tarrow-synack" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  <line x1={480} y1={270} x2={120} y2={270} stroke="#8b5cf6" strokeWidth={2.5} markerEnd="url(#tarrow-synack)" />
                  <text x={300} y={260} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: "#8b5cf6" }}>
                    SYN-ACK
                  </text>
                </>
              )}
            </g>
          )}

          {scenario === "simopen" && (
            <g>
              <text x={300} y={90} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fill: WARNING, fontWeight: 600 }}>
                Both sides send SYN simultaneously
              </text>
              {step >= 0 && (
                <>
                  <defs>
                    <marker id="tarrow-s1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
                    </marker>
                    <marker id="tarrow-s2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#8b5cf6" />
                    </marker>
                  </defs>
                  <line x1={120} y1={130} x2={480} y2={170} stroke="#3b82f6" strokeWidth={2.5} markerEnd="url(#tarrow-s1)" />
                  <text x={240} y={130} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#3b82f6" }}>SYN</text>
                  <line x1={480} y1={130} x2={120} y2={170} stroke="#8b5cf6" strokeWidth={2.5} markerEnd="url(#tarrow-s2)" />
                  <text x={360} y={130} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#8b5cf6" }}>SYN</text>
                </>
              )}
              {step >= 1 && (
                <>
                  <defs>
                    <marker id="tarrow-sa1" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                    <marker id="tarrow-sa2" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
                    </marker>
                  </defs>
                  <line x1={120} y1={220} x2={480} y2={260} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#tarrow-sa1)" />
                  <text x={240} y={220} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#10b981" }}>SYN-ACK</text>
                  <line x1={480} y1={220} x2={120} y2={260} stroke="#10b981" strokeWidth={2.5} markerEnd="url(#tarrow-sa2)" />
                  <text x={360} y={220} style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#10b981" }}>SYN-ACK</text>
                </>
              )}
              {step >= 2 && (
                <text x={300} y={320} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 13, fontWeight: 700, fill: "#10b981" }}>
                  Both sides ESTABLISHED
                </text>
              )}
            </g>
          )}

          {/* TIME_WAIT */}
          {showTimer && scenario === "normal" && (
            <g>
              <rect x={30} y={330} width={160} height={36} rx={6} fill="#f59e0b" opacity={0.12} stroke="#f59e0b" strokeWidth={1.5} />
              <text x={110} y={348} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: "#b45309" }}>
                TIME_WAIT
              </text>
              <text x={110} y={362} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: "#b45309" }}>
                {timerVal > 0 ? `${timerVal}s remaining (2MSL)` : "CLOSED"}
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay}>
          <Play className="w-4 h-4" /> Play
        </button>
        <button className="btn-eng-outline" onClick={reset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {step >= 0 && step < TERM_STEPS.length && scenario === "normal" && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto" }}>
          <strong>Step {step + 1}:</strong> {TERM_STEPS[step].description}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- TCP Header Diagram                                        */
/* ================================================================== */

interface HeaderField {
  name: string;
  bits: number;
  row: number;
  col: number;
  color: string;
  detail: string;
}

const TCP_FIELDS: HeaderField[] = [
  { name: "Source Port", bits: 16, row: 0, col: 0, color: "#3b82f6", detail: "16-bit port number of the sender. Identifies the sending application process." },
  { name: "Destination Port", bits: 16, row: 0, col: 16, color: "#8b5cf6", detail: "16-bit port number of the receiver. Routes data to the correct application." },
  { name: "Sequence Number", bits: 32, row: 1, col: 0, color: "#10b981", detail: "32-bit sequence number. Tracks the position of data bytes in the stream." },
  { name: "Acknowledgment Number", bits: 32, row: 2, col: 0, color: "#f59e0b", detail: "32-bit field. Indicates the next expected byte (cumulative acknowledgment)." },
  { name: "Data Offset", bits: 4, row: 3, col: 0, color: "#ef4444", detail: "4-bit header length field. Specifies the header size in 32-bit words (min 5 = 20 bytes)." },
  { name: "Reserved", bits: 3, row: 3, col: 4, color: "#94a3b8", detail: "3 reserved bits. Must be zero. Reserved for future use." },
  { name: "Flags", bits: 9, row: 3, col: 7, color: "#ec4899", detail: "9 control flags: NS, CWR, ECE, URG, ACK, PSH, RST, SYN, FIN. Control connection behavior." },
  { name: "Window Size", bits: 16, row: 3, col: 16, color: "#06b6d4", detail: "16-bit field. Advertises how many bytes the receiver is willing to accept (flow control)." },
  { name: "Checksum", bits: 16, row: 4, col: 0, color: "#f97316", detail: "16-bit checksum for error detection. Covers header + data + pseudo-header." },
  { name: "Urgent Pointer", bits: 16, row: 4, col: 16, color: "#a855f7", detail: "16-bit pointer. Valid only if URG flag is set. Points to urgent data boundary." },
];

function HeaderTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const cellW = 16.25; // width per bit in SVG units
  const rowH = 44;
  const padTop = 40;
  const svgW = 560;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP Header Structure
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        The TCP header is 20 bytes (160 bits) minimum. Click any field to see its purpose.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16, overflowX: "auto" }}>
        <svg viewBox={`0 0 ${svgW} 310`} style={{ width: "100%", maxWidth: svgW, display: "block", margin: "0 auto" }}>
          {/* Bit ruler */}
          {[0, 4, 8, 12, 16, 20, 24, 28, 31].map((b) => (
            <text key={b} x={20 + b * cellW} y={padTop - 8} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>
              {b}
            </text>
          ))}
          <text x={svgW / 2} y={padTop - 22} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: MUTED }}>
            Bit Position (0-31)
          </text>

          {/* Fields */}
          {TCP_FIELDS.map((f, i) => {
            const x = 4 + f.col * cellW;
            const y = padTop + f.row * rowH;
            const w = f.bits * cellW;
            const isSelected = selected === i;
            return (
              <g
                key={i}
                onClick={() => setSelected(isSelected ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={x}
                  y={y}
                  width={w}
                  height={rowH - 4}
                  rx={4}
                  fill={isSelected ? f.color : `${f.color}22`}
                  stroke={f.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text
                  x={x + w / 2}
                  y={y + rowH / 2 - 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontFamily: FONT,
                    fontSize: w < 80 ? 8 : 10,
                    fontWeight: 600,
                    fill: isSelected ? "#fff" : f.color,
                    transition: "fill 0.2s",
                  }}
                >
                  {f.name}
                </text>
                <text
                  x={x + w / 2}
                  y={y + rowH / 2 + 12}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 8, fill: isSelected ? "rgba(255,255,255,0.8)" : MUTED }}
                >
                  {f.bits} bits
                </text>
              </g>
            );
          })}

          {/* Total size label */}
          <text x={svgW / 2} y={padTop + 5 * rowH + 12} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: TEXT }}>
            Total Header: 20 bytes (160 bits) minimum
          </text>
        </svg>
      </div>

      {/* Detail panel */}
      {selected !== null && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: TCP_FIELDS[selected].color, display: "inline-block" }} />
            <strong>{TCP_FIELDS[selected].name}</strong>
            <span className="tag-eng" style={{ fontSize: "0.7rem" }}>{TCP_FIELDS[selected].bits} bits</span>
          </div>
          <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: TEXT, margin: 0, lineHeight: 1.5 }}>
            {TCP_FIELDS[selected].detail}
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the correct order of messages in the TCP 3-way handshake?",
    options: ["SYN, ACK, FIN", "SYN, SYN-ACK, ACK", "ACK, SYN, SYN-ACK", "FIN, FIN-ACK, ACK"],
    correctIndex: 1,
    explanation: "The 3-way handshake is: Client sends SYN, Server responds with SYN-ACK, Client sends final ACK.",
  },
  {
    question: "How many messages are exchanged during TCP connection termination?",
    options: ["2 (FIN, ACK)", "3 (FIN, FIN-ACK, ACK)", "4 (FIN, ACK, FIN, ACK)", "1 (RST)"],
    correctIndex: 2,
    explanation: "Normal TCP termination uses 4 messages: FIN from initiator, ACK from other side, FIN from other side, final ACK.",
  },
  {
    question: "What is the minimum size of a TCP header?",
    options: ["8 bytes", "16 bytes", "20 bytes", "32 bytes"],
    correctIndex: 2,
    explanation: "The TCP header has 5 mandatory 32-bit words = 20 bytes. Options can extend it up to 60 bytes.",
  },
  {
    question: "What is the purpose of the TIME_WAIT state in TCP?",
    options: [
      "To speed up future connections to the same server",
      "To ensure delayed packets from the old connection are handled properly",
      "To reduce bandwidth usage",
      "To authenticate the server",
    ],
    correctIndex: 1,
    explanation: "TIME_WAIT (lasting 2*MSL) ensures any delayed segments from the closed connection are discarded and the final ACK is retransmitted if lost.",
  },
  {
    question: "In the TCP handshake, if the client's ISN is 100, what Acknowledgment number does the server send in SYN-ACK?",
    options: ["100", "101", "200", "0"],
    correctIndex: 1,
    explanation: "The server ACKs the client's ISN + 1 (i.e., 101) because SYN consumes one sequence number.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_TCPConnectionActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "handshake",
      label: "Handshake",
      icon: <Network className="w-4 h-4" />,
      content: <HandshakeTab />,
    },
    {
      id: "termination",
      label: "Termination",
      icon: <XCircle className="w-4 h-4" />,
      content: <TerminationTab />,
    },
    {
      id: "header",
      label: "Header",
      icon: <LayoutGrid className="w-4 h-4" />,
      content: <HeaderTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="TCP -- Connection Management"
      level={4}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="TCP -- Reliable Data Transfer"
      gateRelevance="3-4 marks"
      placementRelevance="High"
    />
  );
}
