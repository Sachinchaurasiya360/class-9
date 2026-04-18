"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, AlertTriangle, Sliders, Play, RotateCcw, Pause } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const FONT = "var(--eng-font)";
const TEXT = "var(--eng-text)";
const MUTED = "var(--eng-text-muted)";
const BORDER = "var(--eng-border)";
const PRIMARY = "var(--eng-primary)";
const SUCCESS = "var(--eng-success)";
const DANGER = "var(--eng-danger)";
const WARNING = "var(--eng-warning)";

/* ================================================================== */
/*  Tab 1 -- Normal Transfer Flow                                      */
/* ================================================================== */

interface Segment {
  id: number;
  seq: number;
  fromX: number;
  toX: number;
  y: number;
  label: string;
  color: string;
  type: "data" | "ack";
}

function buildNormalSegments(): Segment[] {
  const segs: Segment[] = [];
  let y = 100;
  for (let i = 0; i < 4; i++) {
    segs.push({
      id: i * 2,
      seq: i + 1,
      fromX: 120,
      toX: 480,
      y,
      label: `Seg ${i + 1} (Seq=${i * 100})`,
      color: "#3b82f6",
      type: "data",
    });
    y += 40;
    segs.push({
      id: i * 2 + 1,
      seq: i + 1,
      fromX: 480,
      toX: 120,
      y,
      label: `ACK ${(i + 1) * 100}`,
      color: "#10b981",
      type: "ack",
    });
    y += 40;
  }
  return segs;
}

function TransferTab() {
  const segments = useRef(buildNormalSegments()).current;
  const [visibleCount, setVisibleCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = useCallback(() => {
    setVisibleCount((prev) => {
      if (prev >= segments.length) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [segments.length]);

  useEffect(() => {
    if (playing && visibleCount < segments.length) {
      timerRef.current = setTimeout(advance, 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, visibleCount, advance, segments.length]);

  const handlePlay = () => {
    if (visibleCount >= segments.length) {
      setVisibleCount(0);
      setTimeout(() => { setVisibleCount(1); setPlaying(true); }, 100);
    } else {
      if (visibleCount === 0) setVisibleCount(1);
      setPlaying(true);
    }
  };

  const handleReset = () => { setVisibleCount(0); setPlaying(false); };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Normal Data Transfer
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        TCP numbers each segment and requires acknowledgment. Watch the sender transmit numbered segments and the receiver confirm with cumulative ACKs.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 460" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          <text x={120} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>Sender</text>
          <text x={480} y={40} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>Receiver</text>

          <line x1={120} y1={55} x2={120} y2={440} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <line x1={480} y1={55} x2={480} y2={440} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <circle cx={120} cy={55} r={6} fill={PRIMARY} />
          <circle cx={480} cy={55} r={6} fill={PRIMARY} />

          {/* Receiver buffer visualization */}
          {[0, 1, 2, 3].map((i) => {
            const received = visibleCount >= (i * 2 + 2);
            return (
              <rect
                key={i}
                x={520}
                y={100 + i * 30}
                width={50}
                height={24}
                rx={3}
                fill={received ? "#10b98122" : "var(--eng-surface)"}
                stroke={received ? "#10b981" : BORDER}
                strokeWidth={1.5}
              />
            );
          })}
          <text x={545} y={88} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Buffer</text>

          {segments.map((seg, i) => {
            if (i >= visibleCount) return null;
            const midX = (seg.fromX + seg.toX) / 2;
            return (
              <g key={seg.id}>
                <defs>
                  <marker id={`seg-arr-${seg.id}`} markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill={seg.color} />
                  </marker>
                </defs>
                <line
                  x1={seg.fromX} y1={seg.y} x2={seg.toX} y2={seg.y}
                  stroke={seg.color} strokeWidth={2}
                  markerEnd={`url(#seg-arr-${seg.id})`}
                />
                <rect x={midX - 55} y={seg.y - 14} width={110} height={16} rx={3} fill={seg.color} opacity={0.1} />
                <text x={midX} y={seg.y - 3} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: seg.color }}>
                  {seg.label}
                </text>
              </g>
            );
          })}

          {visibleCount >= segments.length && (
            <g>
              <rect x={180} y={420} width={240} height={28} rx={6} fill="#10b981" opacity={0.12} stroke="#10b981" strokeWidth={1.5} />
              <text x={300} y={438} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: "#10b981" }}>
                All segments delivered successfully
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> {visibleCount >= segments.length ? "Replay" : "Play"}
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="info-eng" style={{ maxWidth: 560, margin: "0 auto" }}>
        <strong>Cumulative ACK:</strong> Each ACK tells the sender &quot;I have received all bytes up to this number.&quot; For example, ACK 300 means bytes 0-299 are confirmed.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 -- Loss Recovery                                             */
/* ================================================================== */

function RecoveryTab() {
  const [mode, setMode] = useState<"segLoss" | "ackLoss" | "timeout">("segLoss");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rttEstimate, setRttEstimate] = useState(100);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const maxSteps = mode === "timeout" ? 6 : 7;

  useEffect(() => {
    if (playing && step < maxSteps) {
      timerRef.current = setTimeout(() => setStep((s) => s + 1), 900);
    } else if (step >= maxSteps) {
      setPlaying(false);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, step, maxSteps]);

  const reset = () => { setStep(0); setPlaying(false); };
  const play = () => { reset(); setTimeout(() => { setStep(1); setPlaying(true); }, 100); };

  // EWMA RTT update
  useEffect(() => {
    if (step > 0 && step <= 4) {
      const sample = 80 + Math.random() * 40;
      setRttEstimate((prev) => Math.round(0.875 * prev + 0.125 * sample));
    }
  }, [step]);

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Loss Recovery Mechanisms
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        When segments or ACKs are lost, TCP recovers using retransmission. Select a scenario below.
      </p>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
        {([["segLoss", "Segment Loss (Fast Retransmit)"], ["ackLoss", "ACK Loss"], ["timeout", "Timeout Retransmit"]] as const).map(([key, label]) => (
          <button
            key={key}
            className={mode === key ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            onClick={() => { setMode(key); reset(); }}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 420" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          <text x={120} y={30} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>Sender</text>
          <text x={480} y={30} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, fill: TEXT }}>Receiver</text>
          <line x1={120} y1={45} x2={120} y2={400} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <line x1={480} y1={45} x2={480} y2={400} stroke={BORDER} strokeWidth={2} strokeDasharray="6,4" />
          <circle cx={120} cy={45} r={6} fill={PRIMARY} />
          <circle cx={480} cy={45} r={6} fill={PRIMARY} />

          {mode === "segLoss" && (
            <g>
              {/* Seg 1 OK */}
              {step >= 1 && (
                <g>
                  <defs><marker id="sr1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={70} x2={480} y2={70} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#sr1)" />
                  <text x={300} y={64} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 1 (Seq=0)</text>
                </g>
              )}
              {/* ACK 1 */}
              {step >= 2 && (
                <g>
                  <defs><marker id="sa1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10b981" /></marker></defs>
                  <line x1={480} y1={100} x2={120} y2={100} stroke="#10b981" strokeWidth={2} markerEnd="url(#sa1)" />
                  <text x={300} y={94} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#10b981" }}>ACK 100</text>
                </g>
              )}
              {/* Seg 2 LOST */}
              {step >= 2 && (
                <g>
                  <line x1={120} y1={130} x2={300} y2={130} stroke="#ef4444" strokeWidth={2} strokeDasharray="8,4" />
                  <text x={310} y={128} style={{ fontFamily: FONT, fontSize: 16, fill: "#ef4444", fontWeight: 700 }}>X</text>
                  <text x={200} y={124} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#ef4444" }}>Seg 2 LOST</text>
                </g>
              )}
              {/* Seg 3, 4 arrive -> dup ACKs */}
              {step >= 3 && (
                <g>
                  <defs><marker id="sr3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={160} x2={480} y2={160} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#sr3)" />
                  <text x={300} y={154} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 3 (Seq=200)</text>
                </g>
              )}
              {step >= 3 && (
                <g>
                  <defs><marker id="da1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b" /></marker></defs>
                  <line x1={480} y1={190} x2={120} y2={190} stroke="#f59e0b" strokeWidth={2} markerEnd="url(#da1)" />
                  <text x={300} y={184} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#f59e0b" }}>Dup ACK 100 (#1)</text>
                </g>
              )}
              {step >= 4 && (
                <g>
                  <defs><marker id="sr4" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={220} x2={480} y2={220} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#sr4)" />
                  <text x={300} y={214} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 4 (Seq=300)</text>
                </g>
              )}
              {step >= 4 && (
                <g>
                  <defs><marker id="da2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b" /></marker></defs>
                  <line x1={480} y1={250} x2={120} y2={250} stroke="#f59e0b" strokeWidth={2} markerEnd="url(#da2)" />
                  <text x={300} y={244} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#f59e0b" }}>Dup ACK 100 (#2)</text>
                </g>
              )}
              {step >= 5 && (
                <g>
                  <defs><marker id="da3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#f59e0b" /></marker></defs>
                  <line x1={480} y1={280} x2={120} y2={280} stroke="#f59e0b" strokeWidth={2} markerEnd="url(#da3)" />
                  <text x={300} y={274} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#f59e0b" }}>Dup ACK 100 (#3)</text>
                  <text x={120} y={296} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: "#ef4444" }}>3 Dup ACKs!</text>
                </g>
              )}
              {/* Fast retransmit */}
              {step >= 6 && (
                <g>
                  <defs><marker id="sr2r" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#ef4444" /></marker></defs>
                  <line x1={120} y1={320} x2={480} y2={320} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#sr2r)" />
                  <text x={300} y={314} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, fill: "#ef4444" }}>FAST RETRANSMIT Seg 2</text>
                </g>
              )}
              {step >= 7 && (
                <g>
                  <defs><marker id="sa4" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10b981" /></marker></defs>
                  <line x1={480} y1={350} x2={120} y2={350} stroke="#10b981" strokeWidth={2} markerEnd="url(#sa4)" />
                  <text x={300} y={344} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, fill: "#10b981" }}>ACK 400 (cumulative)</text>
                  <rect x={180} y={370} width={240} height={24} rx={6} fill="#10b981" opacity={0.12} stroke="#10b981" strokeWidth={1.5} />
                  <text x={300} y={386} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 11, fontWeight: 700, fill: "#10b981" }}>Recovery complete</text>
                </g>
              )}
            </g>
          )}

          {mode === "ackLoss" && (
            <g>
              {step >= 1 && (
                <g>
                  <defs><marker id="al1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={80} x2={480} y2={80} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#al1)" />
                  <text x={300} y={74} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 1</text>
                </g>
              )}
              {step >= 2 && (
                <g>
                  <line x1={480} y1={120} x2={300} y2={120} stroke="#ef4444" strokeWidth={2} strokeDasharray="8,4" />
                  <text x={290} y={118} style={{ fontFamily: FONT, fontSize: 16, fill: "#ef4444", fontWeight: 700 }}>X</text>
                  <text x={390} y={114} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#ef4444" }}>ACK LOST</text>
                </g>
              )}
              {step >= 3 && (
                <g>
                  <defs><marker id="al2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={170} x2={480} y2={170} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#al2)" />
                  <text x={300} y={164} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 2</text>
                </g>
              )}
              {step >= 4 && (
                <g>
                  <defs><marker id="al3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10b981" /></marker></defs>
                  <line x1={480} y1={210} x2={120} y2={210} stroke="#10b981" strokeWidth={2} markerEnd="url(#al3)" />
                  <text x={300} y={204} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, fill: "#10b981" }}>ACK 200 (cumulative)</text>
                </g>
              )}
              {step >= 5 && (
                <text x={300} y={270} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, fill: "#10b981" }}>
                  Cumulative ACK covers the lost ACK!
                </text>
              )}
            </g>
          )}

          {mode === "timeout" && (
            <g>
              {step >= 1 && (
                <g>
                  <defs><marker id="to1" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#3b82f6" /></marker></defs>
                  <line x1={120} y1={80} x2={480} y2={80} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#to1)" />
                  <text x={300} y={74} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#3b82f6" }}>Seg 1</text>
                </g>
              )}
              {step >= 1 && (
                <g>
                  <line x1={120} y1={120} x2={300} y2={120} stroke="#ef4444" strokeWidth={2} strokeDasharray="8,4" />
                  <text x={310} y={118} style={{ fontFamily: FONT, fontSize: 16, fill: "#ef4444", fontWeight: 700 }}>X</text>
                  <text x={200} y={114} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#ef4444" }}>Seg 2 LOST</text>
                </g>
              )}
              {/* Timer countdown */}
              {step >= 2 && step < 5 && (
                <g>
                  <rect x={30} y={150} width={80} height={60} rx={6} fill="#f59e0b" opacity={0.1} stroke="#f59e0b" strokeWidth={1.5} />
                  <text x={70} y={170} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill: "#b45309" }}>RTO Timer</text>
                  <text x={70} y={195} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, fill: "#b45309" }}>
                    {Math.max(0, 3 - (step - 2))}s
                  </text>
                </g>
              )}
              {step >= 5 && (
                <g>
                  <rect x={30} y={150} width={80} height={60} rx={6} fill="#ef4444" opacity={0.1} stroke="#ef4444" strokeWidth={2} />
                  <text x={70} y={175} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: "#ef4444" }}>TIMEOUT!</text>
                  <text x={70} y={195} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Retransmit</text>
                </g>
              )}
              {step >= 5 && (
                <g>
                  <defs><marker id="to2" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#ef4444" /></marker></defs>
                  <line x1={120} y1={240} x2={480} y2={240} stroke="#ef4444" strokeWidth={2.5} markerEnd="url(#to2)" />
                  <text x={300} y={234} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, fill: "#ef4444" }}>RETRANSMIT Seg 2</text>
                </g>
              )}
              {step >= 6 && (
                <g>
                  <defs><marker id="to3" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#10b981" /></marker></defs>
                  <line x1={480} y1={280} x2={120} y2={280} stroke="#10b981" strokeWidth={2} markerEnd="url(#to3)" />
                  <text x={300} y={274} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 700, fill: "#10b981" }}>ACK 200</text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 12 }}>
        <button className="btn-eng" onClick={play} disabled={playing}>
          <Play className="w-4 h-4" /> Play
        </button>
        <button className="btn-eng-outline" onClick={reset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* RTT Estimator */}
      <div className="card-eng" style={{ padding: 12, maxWidth: 400, margin: "0 auto 12px" }}>
        <p style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: TEXT, margin: "0 0 6px" }}>
          RTT Estimation (EWMA)
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ flex: 1, background: "var(--eng-surface)", borderRadius: 6, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${Math.min(100, rttEstimate / 2)}%`, height: "100%", background: PRIMARY, borderRadius: 6, transition: "width 0.4s" }} />
          </div>
          <span style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: PRIMARY, minWidth: 50 }}>
            {rttEstimate}ms
          </span>
        </div>
        <p style={{ fontFamily: FONT, fontSize: "0.7rem", color: MUTED, margin: "4px 0 0" }}>
          EstimatedRTT = 0.875 * EstimatedRTT + 0.125 * SampleRTT
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- Interactive Scenario Builder                              */
/* ================================================================== */

interface ScenarioSeg {
  seq: number;
  status: "sent" | "lost" | "acked" | "retransmit";
}

function ExploreTab() {
  const [windowSize, setWindowSize] = useState(4);
  const [lossPoints, setLossPoints] = useState<Set<number>>(new Set([2]));
  const [segments, setSegments] = useState<ScenarioSeg[]>([]);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSegs = 8;

  const toggleLoss = (seq: number) => {
    setLossPoints((prev) => {
      const next = new Set(prev);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  };

  const runSimulation = useCallback(() => {
    setRunning(true);
    setTick(0);
    const result: ScenarioSeg[] = [];
    for (let i = 1; i <= totalSegs; i++) {
      result.push({
        seq: i,
        status: lossPoints.has(i) ? "lost" : "sent",
      });
    }
    // Add retransmits for lost segments
    lossPoints.forEach((lp) => {
      result.push({ seq: lp, status: "retransmit" });
    });
    setSegments(result);

    let t = 0;
    timerRef.current = setInterval(() => {
      t++;
      setTick(t);
      if (t >= result.length) {
        if (timerRef.current) clearInterval(timerRef.current);
        // Mark all as acked
        setSegments((prev) => prev.map((s) => ({
          ...s,
          status: s.status === "lost" ? "lost" : "acked",
        })));
        setRunning(false);
      }
    }, 500);
  }, [lossPoints]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Scenario Builder
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 16px", lineHeight: 1.6 }}>
        Configure window size and loss points, then watch TCP recover.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        {/* Window size slider */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, display: "block", marginBottom: 6 }}>
            Window Size: {windowSize} segments
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={windowSize}
            onChange={(e) => setWindowSize(Number(e.target.value))}
            style={{ width: "100%", accentColor: "var(--eng-primary)" }}
          />
        </div>

        {/* Loss point selector */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, display: "block", marginBottom: 6 }}>
            Click to toggle loss (red = will be lost):
          </label>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: totalSegs }, (_, i) => i + 1).map((seq) => (
              <button
                key={seq}
                onClick={() => toggleLoss(seq)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 8,
                  border: `2px solid ${lossPoints.has(seq) ? "#ef4444" : BORDER}`,
                  background: lossPoints.has(seq) ? "rgba(239,68,68,0.1)" : "var(--eng-surface)",
                  fontFamily: FONT,
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: lossPoints.has(seq) ? "#ef4444" : TEXT,
                  cursor: "pointer",
                }}
              >
                {seq}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-eng" onClick={runSimulation} disabled={running} style={{ marginBottom: 16 }}>
          <Play className="w-4 h-4" /> Run Simulation
        </button>

        {/* Visualization */}
        {segments.length > 0 && (
          <svg viewBox="0 0 600 120" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
            {segments.map((seg, i) => {
              const visible = i < tick || !running;
              if (!visible && running) return null;
              const x = 20 + (i % 10) * 58;
              const y = i < totalSegs ? 20 : 70;
              const fill = seg.status === "lost" ? "#ef4444" :
                           seg.status === "retransmit" ? "#f59e0b" :
                           seg.status === "acked" ? "#10b981" : "#3b82f6";
              return (
                <g key={`${seg.seq}-${i}`}>
                  <rect x={x} y={y} width={50} height={32} rx={6} fill={`${fill}22`} stroke={fill} strokeWidth={1.5} />
                  <text x={x + 25} y={y + 14} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fontWeight: 600, fill }}>
                    Seg {seg.seq}
                  </text>
                  <text x={x + 25} y={y + 26} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 7, fill: MUTED }}>
                    {seg.status === "lost" ? "LOST" : seg.status === "retransmit" ? "RETX" : seg.status === "acked" ? "ACK" : "SENT"}
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>

      <div className="info-eng" style={{ maxWidth: 560, margin: "0 auto" }}>
        <strong>Window effect:</strong> With window size {windowSize}, the sender can have up to {windowSize} unacknowledged segments in flight. Larger windows improve throughput but need more buffering.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "How many duplicate ACKs trigger TCP Fast Retransmit?",
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    explanation: "TCP Fast Retransmit is triggered after receiving 3 duplicate ACKs (i.e., 4 ACKs total with the same acknowledgment number).",
  },
  {
    question: "What does a cumulative ACK with number 500 mean?",
    options: [
      "Only byte 500 was received",
      "All bytes up to and including 499 have been received",
      "500 bytes are still missing",
      "The receiver needs 500 more bytes",
    ],
    correctIndex: 1,
    explanation: "Cumulative ACK 500 means all bytes from 0 to 499 have been successfully received. The next expected byte is 500.",
  },
  {
    question: "What happens when the Retransmission Timeout (RTO) expires?",
    options: [
      "The connection is immediately closed",
      "The sender retransmits the oldest unacknowledged segment",
      "The receiver sends a NACK",
      "The window size doubles",
    ],
    correctIndex: 1,
    explanation: "When RTO expires, TCP assumes the segment was lost and retransmits the oldest unacknowledged segment.",
  },
  {
    question: "In TCP RTT estimation using EWMA, what weight is given to the new sample?",
    options: ["0.5 (50%)", "0.25 (25%)", "0.125 (12.5%)", "0.875 (87.5%)"],
    correctIndex: 2,
    explanation: "The standard formula uses alpha=0.125 for the new sample: EstimatedRTT = (1-0.125)*EstimatedRTT + 0.125*SampleRTT.",
  },
  {
    question: "Why is Fast Retransmit faster than timeout-based retransmission?",
    options: [
      "It uses UDP instead of TCP",
      "It doesn't wait for the RTO timer to expire",
      "It sends data at a higher speed",
      "It skips the acknowledgment process",
    ],
    correctIndex: 1,
    explanation: "Fast Retransmit detects loss through duplicate ACKs and retransmits immediately, without waiting for the potentially long RTO timer.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_TCPReliableTransferActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "transfer",
      label: "Transfer",
      icon: <Shield className="w-4 h-4" />,
      content: <TransferTab />,
    },
    {
      id: "recovery",
      label: "Recovery",
      icon: <AlertTriangle className="w-4 h-4" />,
      content: <RecoveryTab />,
    },
    {
      id: "explore",
      label: "Explore",
      icon: <Sliders className="w-4 h-4" />,
      content: <ExploreTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="TCP -- Reliable Data Transfer"
      level={4}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="TCP -- Congestion Control"
      placementRelevance="Medium"
    />
  );
}
