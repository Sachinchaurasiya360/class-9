"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Radio, Zap, ArrowDownUp, Play, RotateCcw, Pause, ToggleLeft, ToggleRight } from "lucide-react";
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

/* ================================================================== */
/*  Tab 1 -- Congestion Window Graph                                   */
/* ================================================================== */

function CongestionTab() {
  const [points, setPoints] = useState<{ rtt: number; cwnd: number }[]>([]);
  const [playing, setPlaying] = useState(false);
  const [ssthresh, setSsthresh] = useState(16);
  const tickRef = useRef(0);
  const cwndRef = useRef(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const graphW = 540;
  const graphH = 260;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;
  const plotW = graphW - padL - padR;
  const plotH = graphH - padT - padB;
  const maxRTT = 30;
  const maxCwnd = 40;

  const toSvgX = (rtt: number) => padL + (rtt / maxRTT) * plotW;
  const toSvgY = (cwnd: number) => padT + plotH - (Math.min(cwnd, maxCwnd) / maxCwnd) * plotH;

  const animate = useCallback(() => {
    tickRef.current += 1;
    const rtt = tickRef.current;
    const prevCwnd = cwndRef.current;

    // Slow start (exponential) until ssthresh, then congestion avoidance (linear)
    let newCwnd: number;
    if (prevCwnd < ssthresh) {
      newCwnd = prevCwnd * 2; // exponential
      if (newCwnd >= ssthresh) newCwnd = ssthresh;
    } else {
      newCwnd = prevCwnd + 1; // linear (additive increase)
    }

    cwndRef.current = newCwnd;
    setPoints((prev) => [...prev, { rtt, cwnd: newCwnd }]);

    if (rtt >= maxRTT) {
      setPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [ssthresh]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(animate, 300);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, animate]);

  const handlePlay = () => {
    setPoints([]);
    tickRef.current = 0;
    cwndRef.current = 1;
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setPoints([]);
    tickRef.current = 0;
    cwndRef.current = 1;
  };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP Congestion Window Growth
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        Watch how the congestion window (cwnd) grows exponentially during <strong>Slow Start</strong> and then linearly during <strong>Congestion Avoidance</strong>.
      </p>

      {/* ssthresh slider */}
      <div className="card-eng" style={{ padding: 12, marginBottom: 12, maxWidth: 400 }}>
        <label style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, display: "block", marginBottom: 4 }}>
          ssthresh (Slow Start Threshold): {ssthresh}
        </label>
        <input
          type="range"
          min={4}
          max={32}
          value={ssthresh}
          onChange={(e) => { setSsthresh(Number(e.target.value)); handleReset(); }}
          style={{ width: "100%", accentColor: "var(--eng-primary)" }}
        />
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} style={{ width: "100%", maxWidth: graphW, display: "block", margin: "0 auto" }}>
          {/* Grid lines */}
          {[0, 10, 20, 30, 40].map((v) => (
            <g key={`y-${v}`}>
              <line x1={padL} y1={toSvgY(v)} x2={graphW - padR} y2={toSvgY(v)} stroke={BORDER} strokeWidth={0.5} strokeDasharray="4,3" />
              <text x={padL - 8} y={toSvgY(v) + 4} textAnchor="end" style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}>{v}</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30].map((v) => (
            <g key={`x-${v}`}>
              <line x1={toSvgX(v)} y1={padT} x2={toSvgX(v)} y2={graphH - padB} stroke={BORDER} strokeWidth={0.5} strokeDasharray="4,3" />
              <text x={toSvgX(v)} y={graphH - padB + 16} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}>{v}</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <line x1={padL} y1={graphH - padB} x2={graphW - padR} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <text x={padL - 30} y={graphH / 2} textAnchor="middle" transform={`rotate(-90, ${padL - 30}, ${graphH / 2})`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>
            cwnd
          </text>
          <text x={graphW / 2} y={graphH - 4} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>
            RTT (round-trip times)
          </text>

          {/* ssthresh line */}
          <line x1={padL} y1={toSvgY(ssthresh)} x2={graphW - padR} y2={toSvgY(ssthresh)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="8,4" />
          <text x={graphW - padR + 2} y={toSvgY(ssthresh) + 4} style={{ fontFamily: FONT, fontSize: 8, fill: "#f59e0b", fontWeight: 600 }}>
            ssthresh={ssthresh}
          </text>

          {/* Phase labels */}
          {points.length > 2 && (
            <>
              <rect x={padL + 10} y={padT + 2} width={70} height={16} rx={3} fill="#3b82f6" opacity={0.1} />
              <text x={padL + 45} y={padT + 13} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fontWeight: 600, fill: "#3b82f6" }}>
                Slow Start
              </text>
            </>
          )}
          {points.some((p) => p.cwnd >= ssthresh) && (
            <>
              <rect x={toSvgX(Math.log2(ssthresh) + 2)} y={padT + 2} width={90} height={16} rx={3} fill="#10b981" opacity={0.1} />
              <text x={toSvgX(Math.log2(ssthresh) + 2) + 45} y={padT + 13} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fontWeight: 600, fill: "#10b981" }}>
                Congestion Avoidance
              </text>
            </>
          )}

          {/* Data line */}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${toSvgX(p.rtt)},${toSvgY(p.cwnd)}`).join(" ")}
              fill="none"
              stroke={PRIMARY}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          )}

          {/* Data dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={toSvgX(p.rtt)}
              cy={toSvgY(p.cwnd)}
              r={3}
              fill={p.cwnd < ssthresh ? "#3b82f6" : "#10b981"}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> {points.length > 0 ? "Replay" : "Animate"}
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      <div className="info-eng" style={{ maxWidth: 560, margin: "0 auto" }}>
        <strong>Key Insight:</strong> During Slow Start, cwnd doubles every RTT (exponential growth). Once cwnd reaches ssthresh, TCP switches to Congestion Avoidance where cwnd increases by 1 MSS per RTT (linear growth).
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 -- Events: Triple Dup ACK & Timeout (Reno vs Tahoe)          */
/* ================================================================== */

function EventsTab() {
  const [variant, setVariant] = useState<"reno" | "tahoe">("reno");
  const [points, setPoints] = useState<{ rtt: number; cwnd: number; event?: string }[]>([]);
  const [playing, setPlaying] = useState(false);
  const tickRef = useRef(0);
  const cwndRef = useRef(1);
  const ssthreshRef = useRef(16);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const graphW = 540;
  const graphH = 280;
  const padL = 50;
  const padB = 40;
  const padT = 20;
  const padR = 20;
  const plotW = graphW - padL - padR;
  const plotH = graphH - padT - padB;
  const maxRTT = 35;
  const maxCwnd = 40;

  const toSvgX = (rtt: number) => padL + (rtt / maxRTT) * plotW;
  const toSvgY = (cwnd: number) => padT + plotH - (Math.min(cwnd, maxCwnd) / maxCwnd) * plotH;

  // Event schedule: triple dup ACK at RTT=12, timeout at RTT=25
  const TRIPLE_DUP_RTT = 12;
  const TIMEOUT_RTT = 25;

  const animate = useCallback(() => {
    tickRef.current += 1;
    const rtt = tickRef.current;
    let prevCwnd = cwndRef.current;
    let event: string | undefined;

    // Check events
    if (rtt === TRIPLE_DUP_RTT) {
      event = "3 Dup ACK";
      if (variant === "reno") {
        // Reno: halve cwnd
        ssthreshRef.current = Math.max(2, Math.floor(prevCwnd / 2));
        prevCwnd = ssthreshRef.current;
      } else {
        // Tahoe: cwnd = 1
        ssthreshRef.current = Math.max(2, Math.floor(prevCwnd / 2));
        prevCwnd = 1;
      }
    } else if (rtt === TIMEOUT_RTT) {
      event = "Timeout";
      // Both: cwnd = 1
      ssthreshRef.current = Math.max(2, Math.floor(prevCwnd / 2));
      prevCwnd = 1;
    } else {
      // Normal growth
      if (prevCwnd < ssthreshRef.current) {
        prevCwnd = Math.min(prevCwnd * 2, ssthreshRef.current);
      } else {
        prevCwnd = prevCwnd + 1;
      }
    }

    cwndRef.current = prevCwnd;
    setPoints((prev) => [...prev, { rtt, cwnd: prevCwnd, event }]);

    if (rtt >= maxRTT) {
      setPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [variant]);

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(animate, 250);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, animate]);

  const handlePlay = () => {
    setPoints([]);
    tickRef.current = 0;
    cwndRef.current = 1;
    ssthreshRef.current = 16;
    setPlaying(true);
  };

  const handleReset = () => {
    setPlaying(false);
    setPoints([]);
    tickRef.current = 0;
    cwndRef.current = 1;
    ssthreshRef.current = 16;
  };

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Congestion Events: Reno vs Tahoe
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        See how TCP responds to loss events. Toggle between Reno and Tahoe to compare.
      </p>

      {/* Variant toggle */}
      <div className="flex gap-3 items-center" style={{ marginBottom: 16 }}>
        <button
          className={variant === "tahoe" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          onClick={() => { setVariant("tahoe"); handleReset(); }}
        >
          TCP Tahoe
        </button>
        <button
          className={variant === "reno" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          onClick={() => { setVariant("reno"); handleReset(); }}
        >
          TCP Reno
        </button>
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} style={{ width: "100%", maxWidth: graphW, display: "block", margin: "0 auto" }}>
          {/* Grid */}
          {[0, 10, 20, 30, 40].map((v) => (
            <g key={`y-${v}`}>
              <line x1={padL} y1={toSvgY(v)} x2={graphW - padR} y2={toSvgY(v)} stroke={BORDER} strokeWidth={0.5} strokeDasharray="4,3" />
              <text x={padL - 8} y={toSvgY(v) + 4} textAnchor="end" style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}>{v}</text>
            </g>
          ))}
          {[0, 5, 10, 15, 20, 25, 30, 35].map((v) => (
            <g key={`x-${v}`}>
              <line x1={toSvgX(v)} y1={padT} x2={toSvgX(v)} y2={graphH - padB} stroke={BORDER} strokeWidth={0.5} strokeDasharray="4,3" />
              <text x={toSvgX(v)} y={graphH - padB + 16} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 9, fill: MUTED }}>{v}</text>
            </g>
          ))}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <line x1={padL} y1={graphH - padB} x2={graphW - padR} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <text x={padL - 30} y={graphH / 2} textAnchor="middle" transform={`rotate(-90, ${padL - 30}, ${graphH / 2})`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>cwnd</text>
          <text x={graphW / 2} y={graphH - 4} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>RTT</text>

          {/* Line */}
          {points.length > 1 && (
            <polyline
              points={points.map((p) => `${toSvgX(p.rtt)},${toSvgY(p.cwnd)}`).join(" ")}
              fill="none"
              stroke={variant === "reno" ? "#3b82f6" : "#8b5cf6"}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          )}

          {/* Event markers */}
          {points.filter((p) => p.event).map((p, i) => (
            <g key={i}>
              <line x1={toSvgX(p.rtt)} y1={padT} x2={toSvgX(p.rtt)} y2={graphH - padB} stroke="#ef4444" strokeWidth={1} strokeDasharray="4,2" />
              <circle cx={toSvgX(p.rtt)} cy={toSvgY(p.cwnd)} r={5} fill="#ef4444" stroke="#fff" strokeWidth={2} />
              <text x={toSvgX(p.rtt)} y={padT - 4} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, fill: "#ef4444" }}>
                {p.event}
              </text>
            </g>
          ))}

          {/* Dots */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={toSvgX(p.rtt)}
              cy={toSvgY(p.cwnd)}
              r={2.5}
              fill={variant === "reno" ? "#3b82f6" : "#8b5cf6"}
            />
          ))}
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> {points.length > 0 ? "Replay" : "Animate"}
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Comparison table */}
      <div className="card-eng" style={{ padding: 16, maxWidth: 560, margin: "0 auto", overflowX: "auto" }}>
        <table style={{ width: "100%", fontFamily: FONT, fontSize: "0.8rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>Event</th>
              <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: "#8b5cf6" }}>Tahoe</th>
              <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: "#3b82f6" }}>Reno</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>3 Dup ACKs</td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center", color: MUTED }}>cwnd = 1</td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center", color: MUTED }}>cwnd = cwnd/2</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>Timeout</td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center", color: MUTED }}>cwnd = 1</td>
              <td style={{ padding: "6px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center", color: MUTED }}>cwnd = 1</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 8px", color: TEXT }}>ssthresh update</td>
              <td style={{ padding: "6px 8px", textAlign: "center", color: MUTED }}>cwnd/2 (both)</td>
              <td style={{ padding: "6px 8px", textAlign: "center", color: MUTED }}>cwnd/2 (both)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- Flow Control + AIMD                                       */
/* ================================================================== */

function FlowControlTab() {
  const [rwnd, setRwnd] = useState(20);
  const [cwnd, setCwnd] = useState(1);
  const [history, setHistory] = useState<{ rtt: number; cwnd: number; effective: number }[]>([]);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const maxSteps = 20;
  const lossAt = 14; // simulate loss at step 14

  useEffect(() => {
    if (playing && step < maxSteps) {
      timerRef.current = setInterval(() => {
        setStep((prev) => {
          const next = prev + 1;
          if (next >= maxSteps) {
            setPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return next;
        });
      }, 400);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing, step]);

  useEffect(() => {
    if (step === 0) {
      setCwnd(1);
      setHistory([]);
      return;
    }
    setCwnd((prev) => {
      let next: number;
      if (step === lossAt) {
        // Multiplicative decrease
        next = Math.max(1, Math.floor(prev / 2));
      } else {
        // Additive increase
        next = prev + 1;
      }
      const effective = Math.min(next, rwnd);
      setHistory((h) => [...h, { rtt: step, cwnd: next, effective }]);
      return next;
    });
  }, [step, rwnd]);

  const handlePlay = () => {
    setStep(0);
    setCwnd(1);
    setHistory([]);
    setTimeout(() => setPlaying(true), 100);
  };

  const handleReset = () => {
    setPlaying(false);
    setStep(0);
    setCwnd(1);
    setHistory([]);
  };

  const graphW = 540;
  const graphH = 220;
  const padL = 50;
  const padB = 36;
  const padT = 20;
  const padR = 20;
  const plotW = graphW - padL - padR;
  const plotH = graphH - padT - padB;

  const toSvgX = (rtt: number) => padL + (rtt / maxSteps) * plotW;
  const toSvgY = (v: number) => padT + plotH - (Math.min(v, 30) / 30) * plotH;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Flow Control & AIMD
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        The sender transmits at <strong>min(cwnd, rwnd)</strong>. Adjust the receiver window and see how it limits throughput. AIMD = Additive Increase, Multiplicative Decrease.
      </p>

      {/* rwnd slider */}
      <div className="card-eng" style={{ padding: 12, marginBottom: 12, maxWidth: 400 }}>
        <label style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, display: "block", marginBottom: 4 }}>
          Receiver Window (rwnd): {rwnd}
        </label>
        <input
          type="range"
          min={4}
          max={30}
          value={rwnd}
          onChange={(e) => { setRwnd(Number(e.target.value)); handleReset(); }}
          style={{ width: "100%", accentColor: "var(--eng-primary)" }}
        />
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} style={{ width: "100%", maxWidth: graphW, display: "block", margin: "0 auto" }}>
          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <line x1={padL} y1={graphH - padB} x2={graphW - padR} y2={graphH - padB} stroke={TEXT} strokeWidth={1.5} />
          <text x={padL - 28} y={graphH / 2} textAnchor="middle" transform={`rotate(-90, ${padL - 28}, ${graphH / 2})`} style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>Window</text>
          <text x={graphW / 2} y={graphH - 4} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: TEXT }}>RTT</text>

          {/* rwnd line */}
          <line x1={padL} y1={toSvgY(rwnd)} x2={graphW - padR} y2={toSvgY(rwnd)} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="8,4" />
          <text x={graphW - padR + 2} y={toSvgY(rwnd) + 4} style={{ fontFamily: FONT, fontSize: 8, fill: "#f59e0b", fontWeight: 600 }}>rwnd={rwnd}</text>

          {/* cwnd line */}
          {history.length > 1 && (
            <polyline
              points={history.map((h) => `${toSvgX(h.rtt)},${toSvgY(h.cwnd)}`).join(" ")}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="6,3"
            />
          )}

          {/* effective window line */}
          {history.length > 1 && (
            <polyline
              points={history.map((h) => `${toSvgX(h.rtt)},${toSvgY(h.effective)}`).join(" ")}
              fill="none"
              stroke="#10b981"
              strokeWidth={2.5}
            />
          )}

          {/* Loss marker */}
          {history.some((h) => h.rtt === lossAt) && (
            <g>
              <line x1={toSvgX(lossAt)} y1={padT} x2={toSvgX(lossAt)} y2={graphH - padB} stroke="#ef4444" strokeWidth={1} strokeDasharray="3,2" />
              <text x={toSvgX(lossAt)} y={padT - 4} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fontWeight: 700, fill: "#ef4444" }}>Loss</text>
            </g>
          )}

          {/* Legend */}
          <rect x={padL + 10} y={padT + 4} width={8} height={8} fill="#3b82f6" rx={1} />
          <text x={padL + 22} y={padT + 12} style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>cwnd</text>
          <rect x={padL + 60} y={padT + 4} width={8} height={8} fill="#10b981" rx={1} />
          <text x={padL + 72} y={padT + 12} style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>effective = min(cwnd, rwnd)</text>
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> Animate AIMD
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Current state */}
      <div className="flex gap-3 justify-center flex-wrap" style={{ marginBottom: 12 }}>
        <span className="tag-eng" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
          cwnd: {cwnd}
        </span>
        <span className="tag-eng" style={{ background: "rgba(245,158,11,0.1)", color: "#b45309" }}>
          rwnd: {rwnd}
        </span>
        <span className="tag-eng" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
          Send window: {Math.min(cwnd, rwnd)}
        </span>
      </div>

      <div className="info-eng" style={{ maxWidth: 560, margin: "0 auto" }}>
        <strong>AIMD:</strong> Additive Increase -- cwnd grows by 1 MSS each RTT. Multiplicative Decrease -- on loss, cwnd is halved. This creates the characteristic &quot;sawtooth&quot; pattern and ensures network fairness.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "During TCP Slow Start, how does the congestion window grow?",
    options: ["Linearly (+1 per RTT)", "Exponentially (doubles per RTT)", "Remains constant", "Decreases by half"],
    correctIndex: 1,
    explanation: "In Slow Start, cwnd doubles every RTT (increases by 1 MSS for each ACK received), giving exponential growth.",
  },
  {
    question: "What triggers the transition from Slow Start to Congestion Avoidance?",
    options: [
      "Receiving a FIN packet",
      "cwnd reaching the ssthresh value",
      "The connection being idle for too long",
      "A DNS lookup failure",
    ],
    correctIndex: 1,
    explanation: "When cwnd reaches the ssthresh (Slow Start Threshold), TCP switches from exponential to linear growth.",
  },
  {
    question: "In AIMD, what does 'Multiplicative Decrease' mean?",
    options: [
      "cwnd is set to 0",
      "cwnd decreases by 1",
      "cwnd is halved",
      "cwnd is reduced to 1 MSS",
    ],
    correctIndex: 2,
    explanation: "Multiplicative Decrease halves the congestion window on loss detection, creating the sawtooth pattern.",
  },
  {
    question: "How does TCP Tahoe respond to 3 duplicate ACKs?",
    options: [
      "cwnd = cwnd / 2 (like Reno)",
      "cwnd = 1 MSS (back to Slow Start)",
      "cwnd = ssthresh",
      "Ignores them and continues",
    ],
    correctIndex: 1,
    explanation: "Tahoe treats 3 dup ACKs the same as a timeout: it sets cwnd to 1 and re-enters Slow Start. Reno is more aggressive, halving cwnd instead.",
  },
  {
    question: "If cwnd = 12 and ssthresh = 8, a timeout occurs. What are the new values?",
    options: [
      "cwnd=1, ssthresh=6",
      "cwnd=6, ssthresh=6",
      "cwnd=1, ssthresh=12",
      "cwnd=8, ssthresh=4",
    ],
    correctIndex: 0,
    explanation: "On timeout: ssthresh = cwnd/2 = 12/2 = 6, and cwnd resets to 1 MSS. This applies to both Tahoe and Reno.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_TCPCongestionActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "congestion",
      label: "Congestion",
      icon: <Radio className="w-4 h-4" />,
      content: <CongestionTab />,
    },
    {
      id: "events",
      label: "Events",
      icon: <Zap className="w-4 h-4" />,
      content: <EventsTab />,
    },
    {
      id: "flow",
      label: "Flow Control",
      icon: <ArrowDownUp className="w-4 h-4" />,
      content: <FlowControlTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="TCP -- Congestion Control"
      level={4}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="UDP -- User Datagram Protocol"
      placementRelevance="Medium"
    />
  );
}
