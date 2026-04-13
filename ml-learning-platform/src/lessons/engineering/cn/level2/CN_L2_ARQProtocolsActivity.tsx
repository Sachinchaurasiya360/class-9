"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeftRight, Repeat, RefreshCw, BarChart3, Play, Pause, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Shared types and constants                                        */
/* ------------------------------------------------------------------ */

const SVG_W = 700;
const SVG_H = 400;
const SENDER_X = 80;
const RECEIVER_X = SVG_W - 80;
const TIMELINE_TOP = 60;
const TIMELINE_BOTTOM = SVG_H - 30;

type FrameState = "sending" | "sent" | "lost" | "acked" | "timeout" | "waiting";

interface FrameEvent {
  id: number;
  senderY: number;
  receiverY: number;
  state: FrameState;
  isAck?: boolean;
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Tab 1: Stop-and-Wait ARQ                                          */
/* ------------------------------------------------------------------ */

function StopAndWaitTab() {
  const [events, setEvents] = useState<FrameEvent[]>([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [scenario, setScenario] = useState<"normal" | "loss" | "ack-loss">("normal");
  const timerRef = useRef<number | null>(null);

  const resetSimulation = useCallback(() => {
    setTime(0);
    setIsRunning(false);
    if (timerRef.current) cancelAnimationFrame(timerRef.current);

    const baseEvents: FrameEvent[] = [];
    if (scenario === "normal") {
      baseEvents.push(
        { id: 0, senderY: 80, receiverY: 130, state: "sent", label: "Frame 0" },
        { id: 1, senderY: 130, receiverY: 80, state: "acked", isAck: true, label: "ACK 0" },
        { id: 2, senderY: 170, receiverY: 220, state: "sent", label: "Frame 1" },
        { id: 3, senderY: 220, receiverY: 170, state: "acked", isAck: true, label: "ACK 1" },
        { id: 4, senderY: 260, receiverY: 310, state: "sent", label: "Frame 0" },
        { id: 5, senderY: 310, receiverY: 260, state: "acked", isAck: true, label: "ACK 0" },
      );
    } else if (scenario === "loss") {
      baseEvents.push(
        { id: 0, senderY: 80, receiverY: 130, state: "sent", label: "Frame 0" },
        { id: 1, senderY: 130, receiverY: 80, state: "acked", isAck: true, label: "ACK 0" },
        { id: 2, senderY: 170, receiverY: 220, state: "lost", label: "Frame 1 (LOST)" },
        { id: 3, senderY: 240, receiverY: 240, state: "timeout", label: "Timeout!" },
        { id: 4, senderY: 260, receiverY: 310, state: "sent", label: "Frame 1 (Resend)" },
        { id: 5, senderY: 310, receiverY: 260, state: "acked", isAck: true, label: "ACK 1" },
      );
    } else {
      baseEvents.push(
        { id: 0, senderY: 80, receiverY: 130, state: "sent", label: "Frame 0" },
        { id: 1, senderY: 130, receiverY: 80, state: "lost", isAck: true, label: "ACK 0 (LOST)" },
        { id: 2, senderY: 200, receiverY: 200, state: "timeout", label: "Timeout!" },
        { id: 3, senderY: 220, receiverY: 270, state: "sent", label: "Frame 0 (Resend)" },
        { id: 4, senderY: 270, receiverY: 220, state: "acked", isAck: true, label: "ACK 0" },
      );
    }
    setEvents(baseEvents);
  }, [scenario]);

  useEffect(() => {
    resetSimulation();
  }, [resetSimulation]);

  useEffect(() => {
    if (!isRunning) return;
    const animate = () => {
      setTime((t) => {
        if (t >= 1) {
          setIsRunning(false);
          return 1;
        }
        return t + 0.004;
      });
      timerRef.current = requestAnimationFrame(animate);
    };
    timerRef.current = requestAnimationFrame(animate);
    return () => {
      if (timerRef.current) cancelAnimationFrame(timerRef.current);
    };
  }, [isRunning]);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Stop-and-Wait ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        The sender transmits one frame and waits for an ACK before sending the next. Watch how frame loss and ACK loss are handled with timeouts.
      </p>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {(["normal", "loss", "ack-loss"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScenario(s)}
            className={scenario === s ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem" }}
          >
            {s === "normal" ? "Normal" : s === "loss" ? "Frame Loss" : "ACK Loss"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button onClick={() => { resetSimulation(); setTimeout(() => setIsRunning(true), 50); }} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <Play className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsRunning(!isRunning)} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={resetSimulation} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sequence diagram */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          {/* Timeline labels */}
          <text x={SENDER_X} y={40} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-primary)">
            Sender
          </text>
          <text x={RECEIVER_X} y={40} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-success)">
            Receiver
          </text>

          {/* Vertical timelines */}
          <line x1={SENDER_X} y1={TIMELINE_TOP} x2={SENDER_X} y2={TIMELINE_BOTTOM} stroke="var(--eng-primary)" strokeWidth={2} strokeDasharray="4,4" />
          <line x1={RECEIVER_X} y1={TIMELINE_TOP} x2={RECEIVER_X} y2={TIMELINE_BOTTOM} stroke="var(--eng-success)" strokeWidth={2} strokeDasharray="4,4" />

          {/* Time arrow */}
          <text x={20} y={SVG_H / 2} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" transform={`rotate(-90, 20, ${SVG_H / 2})`} textAnchor="middle">
            Time →
          </text>

          {/* Events */}
          {events.map((ev, idx) => {
            const progress = Math.max(0, Math.min(1, (time - idx * 0.15) / 0.12));
            if (progress <= 0) return null;

            if (ev.state === "timeout") {
              return (
                <g key={ev.id} style={{ opacity: Math.min(1, progress) }}>
                  <rect x={SENDER_X - 50} y={ev.senderY - 10} width={100} height={20} rx={4} fill="rgba(245,158,11,0.15)" stroke="var(--eng-warning)" strokeWidth={1} />
                  <text x={SENDER_X} y={ev.senderY + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-warning)">
                    {ev.label}
                  </text>
                  {/* Clock icon */}
                  <circle cx={SENDER_X - 60} cy={ev.senderY} r={8} fill="none" stroke="var(--eng-warning)" strokeWidth={1.5} />
                  <line x1={SENDER_X - 60} y1={ev.senderY - 4} x2={SENDER_X - 60} y2={ev.senderY} stroke="var(--eng-warning)" strokeWidth={1.5} />
                  <line x1={SENDER_X - 60} y1={ev.senderY} x2={SENDER_X - 56} y2={ev.senderY + 2} stroke="var(--eng-warning)" strokeWidth={1.5} />
                </g>
              );
            }

            const isAck = ev.isAck;
            const fromX = isAck ? RECEIVER_X : SENDER_X;
            const toX = isAck ? SENDER_X : RECEIVER_X;
            const fromY = isAck ? ev.receiverY : ev.senderY;
            const toY = isAck ? ev.senderY : ev.receiverY;
            const isLost = ev.state === "lost";

            const currentX = fromX + (toX - fromX) * (isLost ? Math.min(progress, 0.5) : progress);
            const currentY = fromY + (toY - fromY) * (isLost ? Math.min(progress, 0.5) : progress);

            const color = isLost ? "var(--eng-danger)" : isAck ? "var(--eng-success)" : "var(--eng-primary)";

            return (
              <g key={ev.id} style={{ opacity: Math.min(1, progress * 2) }}>
                {/* Arrow line */}
                <line
                  x1={fromX}
                  y1={fromY}
                  x2={currentX}
                  y2={currentY}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray={isLost ? "4,3" : undefined}
                  markerEnd={progress >= 0.95 && !isLost ? "url(#arrowhead)" : undefined}
                />

                {/* Moving packet */}
                {progress < 1 && (
                  <circle cx={currentX} cy={currentY} r={5} fill={color}>
                    <animate attributeName="r" values="4;6;4" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Label */}
                <text
                  x={(fromX + toX) / 2}
                  y={(fromY + toY) / 2 - 8}
                  textAnchor="middle"
                  fontSize={9}
                  fontFamily="var(--eng-font)"
                  fontWeight={600}
                  fill={color}
                >
                  {ev.label}
                </text>

                {/* Loss X */}
                {isLost && progress >= 0.5 && (
                  <g>
                    <line x1={currentX - 8} y1={currentY - 8} x2={currentX + 8} y2={currentY + 8} stroke="var(--eng-danger)" strokeWidth={3} />
                    <line x1={currentX + 8} y1={currentY - 8} x2={currentX - 8} y2={currentY + 8} stroke="var(--eng-danger)" strokeWidth={3} />
                  </g>
                )}
              </g>
            );
          })}

          {/* Arrowhead marker */}
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <polygon points="0 0, 8 3, 0 6" fill="var(--eng-text-muted)" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Stop-and-Wait:</strong> Simple but inefficient. The sender is idle while waiting for ACK.
        Efficiency = L / (L + 2 * propagation delay), where L is frame transmission time.
        Utilization drops significantly on high-latency links.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2: Go-Back-N                                                  */
/* ------------------------------------------------------------------ */

function GoBackNTab() {
  const [windowSize, setWindowSize] = useState(4);
  const [frames, setFrames] = useState<{ id: number; state: "pending" | "sent" | "acked" | "lost" | "resent" }[]>([]);
  const [step, setStep] = useState(0);
  const [lossFrame, setLossFrame] = useState(2);

  const totalFrames = 8;

  const resetSim = useCallback(() => {
    setStep(0);
    setFrames(Array.from({ length: totalFrames }, (_, i) => ({ id: i, state: "pending" })));
  }, []);

  useEffect(() => { resetSim(); }, [resetSim]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      const ns = s + 1;
      setFrames((prev) => {
        const next = [...prev];

        if (ns === 1) {
          // Send first window
          for (let i = 0; i < windowSize && i < totalFrames; i++) {
            next[i] = { ...next[i], state: i === lossFrame ? "lost" : "sent" };
          }
        } else if (ns === 2) {
          // ACK frames before loss
          for (let i = 0; i < lossFrame; i++) {
            next[i] = { ...next[i], state: "acked" };
          }
        } else if (ns === 3) {
          // Timeout - mark lost and subsequent as pending, go back
          for (let i = lossFrame; i < totalFrames; i++) {
            next[i] = { ...next[i], state: "pending" };
          }
        } else if (ns === 4) {
          // Resend from lost frame
          for (let i = lossFrame; i < Math.min(lossFrame + windowSize, totalFrames); i++) {
            next[i] = { ...next[i], state: "resent" };
          }
        } else if (ns === 5) {
          // All acked
          for (let i = 0; i < totalFrames; i++) {
            next[i] = { ...next[i], state: "acked" };
          }
        }

        return next;
      });
      return Math.min(ns, 5);
    });
  }, [windowSize, lossFrame]);

  const stateColors: Record<string, string> = {
    pending: "var(--eng-border)",
    sent: "var(--eng-primary)",
    acked: "var(--eng-success)",
    lost: "var(--eng-danger)",
    resent: "var(--eng-warning)",
  };

  const stateLabels: Record<string, string> = {
    pending: "Pending",
    sent: "Sent",
    acked: "ACKed",
    lost: "Lost",
    resent: "Resent",
  };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Go-Back-N ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Sender can have up to N outstanding frames. If one is lost, all frames from the lost one onward must be resent.
      </p>

      {/* Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Window Size (N): {windowSize}
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={windowSize}
            onChange={(e) => { setWindowSize(Number(e.target.value)); resetSim(); }}
            style={{ width: "100%", accentColor: "var(--eng-primary)" }}
          />
        </div>
        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Loss at Frame: {lossFrame}
          </label>
          <input
            type="range"
            min={0}
            max={Math.min(windowSize - 1, totalFrames - 1)}
            value={lossFrame}
            onChange={(e) => { setLossFrame(Number(e.target.value)); resetSim(); }}
            style={{ width: "100%", accentColor: "var(--eng-danger)" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
          <button onClick={nextStep} className="btn-eng" style={{ fontSize: "0.8rem" }} disabled={step >= 5}>
            Next Step
          </button>
          <button onClick={resetSim} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Frame visualization */}
      <div className="card-eng" style={{ padding: 20 }}>
        {/* Window bracket */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <div className="flex gap-3 justify-center" style={{ position: "relative" }}>
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                className="eng-fadeIn"
                style={{
                  width: 64,
                  height: 72,
                  borderRadius: 8,
                  border: `2px solid ${stateColors[frame.state]}`,
                  background: `${stateColors[frame.state]}15`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.4s ease",
                  transform: frame.state === "lost" ? "translateY(4px)" : "translateY(0)",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: stateColors[frame.state] }}>
                  F{frame.id}
                </span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", color: stateColors[frame.state], marginTop: 2 }}>
                  {stateLabels[frame.state]}
                </span>
                {frame.state === "lost" && (
                  <span style={{ fontSize: "0.7rem", position: "absolute", top: -8, color: "var(--eng-danger)", fontWeight: 700 }}>
                    X
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Sliding window indicator */}
          {step >= 1 && step < 5 && (
            <div
              style={{
                position: "absolute",
                top: -8,
                left: `calc(50% - ${(totalFrames / 2) * 76}px + ${(step >= 3 ? lossFrame : 0) * 76}px)`,
                width: windowSize * 76 - 12,
                height: 88,
                border: "2px dashed var(--eng-primary)",
                borderRadius: 12,
                transition: "all 0.5s ease",
                pointerEvents: "none",
              }}
            >
              <span style={{
                position: "absolute",
                top: -14,
                left: "50%",
                transform: "translateX(-50%)",
                fontFamily: "var(--eng-font)",
                fontSize: "0.65rem",
                fontWeight: 700,
                color: "var(--eng-primary)",
                background: "var(--eng-surface)",
                padding: "0 6px",
              }}>
                Window (N={windowSize})
              </span>
            </div>
          )}
        </div>

        {/* Step description */}
        <div className="info-eng" style={{ fontSize: "0.8rem" }}>
          {step === 0 && "Click 'Next Step' to start the Go-Back-N simulation."}
          {step === 1 && `Sender sends frames 0 to ${windowSize - 1}. Frame ${lossFrame} is lost!`}
          {step === 2 && `Receiver ACKs frames 0 to ${lossFrame - 1} (before the loss).`}
          {step === 3 && `Timeout! Sender goes back to frame ${lossFrame}. All subsequent frames discarded.`}
          {step === 4 && `Sender resends frames ${lossFrame} to ${Math.min(lossFrame + windowSize - 1, totalFrames - 1)}.`}
          {step === 5 && "All frames successfully received and acknowledged!"}
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 flex-wrap" style={{ marginTop: 12 }}>
        {Object.entries(stateLabels).map(([state, label]) => (
          <div key={state} className="flex items-center gap-2">
            <div style={{ width: 12, height: 12, borderRadius: 3, background: stateColors[state] }} />
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Selective Repeat                                           */
/* ------------------------------------------------------------------ */

function SelectiveRepeatTab() {
  const [windowSize, setWindowSize] = useState(4);
  const [frames, setFrames] = useState<{ id: number; senderState: string; receiverState: string }[]>([]);
  const [step, setStep] = useState(0);
  const lossFrame = 2;
  const totalFrames = 8;

  const resetSim = useCallback(() => {
    setStep(0);
    setFrames(Array.from({ length: totalFrames }, (_, i) => ({
      id: i,
      senderState: "pending",
      receiverState: "empty",
    })));
  }, []);

  useEffect(() => { resetSim(); }, [resetSim]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      const ns = s + 1;
      setFrames((prev) => {
        const next = prev.map((f) => ({ ...f }));

        if (ns === 1) {
          // Send window
          for (let i = 0; i < windowSize; i++) {
            next[i].senderState = i === lossFrame ? "lost" : "sent";
          }
        } else if (ns === 2) {
          // Receiver gets all except lost, buffers out-of-order
          for (let i = 0; i < windowSize; i++) {
            if (i === lossFrame) {
              next[i].receiverState = "missing";
            } else if (i < lossFrame) {
              next[i].senderState = "acked";
              next[i].receiverState = "received";
            } else {
              next[i].receiverState = "buffered";
              next[i].senderState = "acked";
            }
          }
        } else if (ns === 3) {
          // NAK for lost frame, only that frame resent
          next[lossFrame].senderState = "resent";
        } else if (ns === 4) {
          // All complete, window slides
          for (let i = 0; i < windowSize; i++) {
            next[i].senderState = "acked";
            next[i].receiverState = "received";
          }
          // Send next batch
          for (let i = windowSize; i < Math.min(windowSize + windowSize, totalFrames); i++) {
            next[i].senderState = "sent";
          }
        } else if (ns === 5) {
          for (let i = 0; i < totalFrames; i++) {
            next[i].senderState = "acked";
            next[i].receiverState = "received";
          }
        }

        return next;
      });
      return Math.min(ns, 5);
    });
  }, [windowSize]);

  const sColors: Record<string, string> = {
    pending: "#e2e8f0",
    sent: "var(--eng-primary)",
    acked: "var(--eng-success)",
    lost: "var(--eng-danger)",
    resent: "var(--eng-warning)",
  };

  const rColors: Record<string, string> = {
    empty: "#e2e8f0",
    received: "var(--eng-success)",
    buffered: "var(--eng-warning)",
    missing: "var(--eng-danger)",
  };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Selective Repeat ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Unlike Go-Back-N, only the lost frame is retransmitted. The receiver buffers out-of-order frames.
      </p>

      {/* Controls */}
      <div className="flex gap-4 items-end" style={{ marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Window Size: {windowSize}
          </label>
          <input
            type="range"
            min={3}
            max={6}
            value={windowSize}
            onChange={(e) => { setWindowSize(Number(e.target.value)); resetSim(); }}
            style={{ width: "100%", accentColor: "var(--eng-primary)" }}
          />
        </div>
        <button onClick={nextStep} className="btn-eng" style={{ fontSize: "0.8rem" }} disabled={step >= 5}>
          Next Step
        </button>
        <button onClick={resetSim} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dual view: Sender + Receiver */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Sender view */}
        <div className="card-eng" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-primary)", margin: "0 0 12px" }}>
            Sender Window
          </h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {frames.map((f) => (
              <div
                key={f.id}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 6,
                  border: `2px solid ${sColors[f.senderState]}`,
                  background: `${sColors[f.senderState]}20`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.4s ease",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700, color: sColors[f.senderState] }}>
                  F{f.id}
                </span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", color: sColors[f.senderState] }}>
                  {f.senderState}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receiver view */}
        <div className="card-eng" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-success)", margin: "0 0 12px" }}>
            Receiver Buffer
          </h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {frames.map((f) => (
              <div
                key={f.id}
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 6,
                  border: `2px solid ${rColors[f.receiverState]}`,
                  background: `${rColors[f.receiverState]}20`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.4s ease",
                }}
              >
                <span style={{ fontFamily: "monospace", fontSize: "0.9rem", fontWeight: 700, color: rColors[f.receiverState] }}>
                  F{f.id}
                </span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", color: rColors[f.receiverState] }}>
                  {f.receiverState}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step description */}
      <div className="info-eng" style={{ fontSize: "0.8rem" }}>
        {step === 0 && "Click 'Next Step' to begin. Frame 2 will be simulated as lost."}
        {step === 1 && `Sender transmits frames 0-${windowSize - 1}. Frame ${lossFrame} is lost in transit!`}
        {step === 2 && `Receiver gets frames 0, 1, 3${windowSize > 4 ? ", ..." : ""}. Frames after loss are BUFFERED (not discarded like Go-Back-N).`}
        {step === 3 && `Only frame ${lossFrame} is retransmitted (selective!). No need to resend frames ${lossFrame + 1}-${windowSize - 1}.`}
        {step === 4 && "Frame 2 arrives, receiver delivers all buffered frames in order. Window slides forward."}
        {step === 5 && "All frames delivered successfully!"}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4: Comparison                                                 */
/* ------------------------------------------------------------------ */

function CompareTab() {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      setAnimProgress(Math.min(1, elapsed / 1500));
      if (elapsed < 1500) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const protocols = [
    { name: "Stop & Wait", efficiency: 0.2, color: "var(--eng-danger)", formula: "1 / (1 + 2a)" },
    { name: "Go-Back-N", efficiency: 0.65, color: "var(--eng-warning)", formula: "N / (1 + 2a)" },
    { name: "Selective Repeat", efficiency: 0.85, color: "var(--eng-success)", formula: "N / (1 + 2a), best" },
  ];

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Protocol Efficiency Comparison
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Compare the channel utilization efficiency of all three ARQ protocols. Here a = propagation delay / transmission time.
      </p>

      {/* Animated bar chart */}
      <div className="card-eng" style={{ padding: 24 }}>
        <svg viewBox="0 0 600 250" width="100%" style={{ display: "block" }}>
          {/* Axis */}
          <line x1={120} y1={20} x2={120} y2={220} stroke="var(--eng-border)" strokeWidth={1.5} />
          <line x1={120} y1={220} x2={580} y2={220} stroke="var(--eng-border)" strokeWidth={1.5} />

          {/* Y-axis label */}
          <text x={10} y={120} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" transform="rotate(-90, 10, 120)" textAnchor="middle">
            Protocol
          </text>

          {/* X-axis ticks */}
          {[0, 25, 50, 75, 100].map((v) => {
            const x = 120 + (v / 100) * 450;
            return (
              <g key={v}>
                <line x1={x} y1={220} x2={x} y2={224} stroke="var(--eng-border)" strokeWidth={1} />
                <text x={x} y={240} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                  {v}%
                </text>
              </g>
            );
          })}

          <text x={345} y={248} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            Channel Utilization (%)
          </text>

          {/* Bars */}
          {protocols.map((p, idx) => {
            const barY = 40 + idx * 65;
            const barWidth = p.efficiency * 450 * animProgress;

            return (
              <g key={p.name}>
                {/* Label */}
                <text x={115} y={barY + 22} textAnchor="end" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
                  {p.name}
                </text>

                {/* Bar background */}
                <rect x={120} y={barY} width={450} height={36} rx={4} fill="var(--eng-border)" opacity={0.15} />

                {/* Animated bar */}
                <rect
                  x={120}
                  y={barY}
                  width={barWidth}
                  height={36}
                  rx={4}
                  fill={p.color}
                  opacity={0.8}
                  style={{ transition: "width 0.3s ease" }}
                />

                {/* Percentage label */}
                <text
                  x={120 + barWidth + 8}
                  y={barY + 16}
                  fontSize={12}
                  fontFamily="var(--eng-font)"
                  fontWeight={700}
                  fill={p.color}
                >
                  {Math.round(p.efficiency * 100 * animProgress)}%
                </text>

                {/* Formula */}
                <text x={120 + barWidth + 8} y={barY + 30} fontSize={9} fontFamily="monospace" fill="var(--eng-text-muted)">
                  {p.formula}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Comparison table */}
      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--eng-text)" }}>Feature</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-danger)" }}>Stop &amp; Wait</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-warning)" }}>Go-Back-N</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-success)" }}>Selective Repeat</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Window Size", "1", "N", "N"],
              ["Retransmit on Loss", "1 frame", "N frames", "1 frame"],
              ["Receiver Buffer", "None", "None", "Required"],
              ["Receiver Complexity", "Low", "Low", "High"],
              ["Bandwidth Waste", "High", "Medium", "Low"],
              ["Sequence Bits", "1 bit", "ceil(log₂(N+1))", "ceil(log₂(2N))"],
            ].map(([feature, sw, gbn, sr], idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                <td style={{ padding: "8px 12px", fontWeight: 600, color: "var(--eng-text)" }}>{feature}</td>
                <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-text-muted)" }}>{sw}</td>
                <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-text-muted)" }}>{gbn}</td>
                <td style={{ padding: "8px 12px", textAlign: "center", color: "var(--eng-text-muted)" }}>{sr}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz Questions                                                     */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "In Go-Back-N with window size N=4, if frame 2 is lost, which frames must be retransmitted?",
    options: ["Only frame 2", "Frames 2, 3, 4, 5", "Frames 0, 1, 2, 3", "All frames"],
    correctIndex: 1,
    explanation: "In Go-Back-N, when frame 2 is lost, the sender goes back and retransmits frame 2 and all subsequent frames in the window (2, 3, 4, 5).",
  },
  {
    question: "What is the main advantage of Selective Repeat over Go-Back-N?",
    options: [
      "Simpler receiver design",
      "Only lost frames are retransmitted",
      "No need for sequence numbers",
      "Faster timeout detection",
    ],
    correctIndex: 1,
    explanation: "Selective Repeat only retransmits the specific lost frame, saving bandwidth. However, the receiver needs to buffer out-of-order frames.",
  },
  {
    question: "For Stop-and-Wait, if propagation delay is 5x the transmission time (a=5), what is the utilization?",
    options: ["~100%", "~50%", "~9%", "~45%"],
    correctIndex: 2,
    explanation: "Utilization = 1/(1 + 2a) = 1/(1 + 10) = 1/11 ≈ 9.1%. The sender spends most of the time idle waiting for ACKs.",
  },
  {
    question: "In Selective Repeat with window size N, the sequence number space must be at least:",
    options: ["N", "N + 1", "2N", "2^N"],
    correctIndex: 2,
    explanation: "For Selective Repeat, the sequence number space must be >= 2N to avoid ambiguity between new frames and retransmissions.",
  },
  {
    question: "Which ARQ protocol does NOT require the receiver to buffer out-of-order frames?",
    options: ["Selective Repeat", "Go-Back-N", "Both require buffering", "Neither requires buffering"],
    correctIndex: 1,
    explanation: "Go-Back-N discards out-of-order frames (the sender will resend them). Only Selective Repeat requires receiver-side buffering.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs Definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "stop-wait",
    label: "Stop & Wait",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    content: <StopAndWaitTab />,
  },
  {
    id: "go-back-n",
    label: "Go-Back-N",
    icon: <Repeat className="w-4 h-4" />,
    content: <GoBackNTab />,
  },
  {
    id: "selective-repeat",
    label: "Selective Repeat",
    icon: <RefreshCw className="w-4 h-4" />,
    content: <SelectiveRepeatTab />,
  },
  {
    id: "compare",
    label: "Compare",
    icon: <BarChart3 className="w-4 h-4" />,
    content: <CompareTab />,
  },
];

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L2_ARQProtocolsActivity() {
  return (
    <EngineeringLessonShell
      title="ARQ Protocols"
      level={2}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Medium Access Control Protocols"
      gateRelevance="3-4 marks"
      placementRelevance="Low"
    />
  );
}
