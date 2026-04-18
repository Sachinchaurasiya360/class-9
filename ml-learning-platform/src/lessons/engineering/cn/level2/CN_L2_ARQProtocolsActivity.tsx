"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight, Repeat, RefreshCw, BarChart3, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  useStepPlayer,
} from "@/components/engineering/algo";

/* ================================================================== */
/*  Shared sequence-diagram helpers                                    */
/* ================================================================== */

const DIAG_W = 700;
const SENDER_X = 90;
const RECEIVER_X = DIAG_W - 90;
const SLOT_HEIGHT = 34;
const TIMELINE_TOP = 50;

interface Arrow {
  from: "S" | "R";
  to: "S" | "R";
  slotFrom: number;
  slotTo: number;
  label: string;
  lost?: boolean;
  kind: "frame" | "ack" | "nak";
  active?: boolean;
}

interface Annotation {
  slot: number;
  side: "S" | "R" | "center";
  text: string;
  kind: "timeout" | "note";
  active?: boolean;
}

function SequenceDiagram({
  arrows,
  annotations,
  lastSlot,
}: {
  arrows: Arrow[];
  annotations: Annotation[];
  lastSlot: number;
}) {
  const height = TIMELINE_TOP + (lastSlot + 2) * SLOT_HEIGHT;
  return (
    <svg viewBox={`0 0 ${DIAG_W} ${height}`} width="100%" style={{ display: "block", background: "#fff" }}>
      {/* Headers */}
      <text x={SENDER_X} y={28} textAnchor="middle" fontSize={13} fontFamily="var(--eng-font)" fontWeight={800} fill="#3b82f6">Sender</text>
      <text x={RECEIVER_X} y={28} textAnchor="middle" fontSize={13} fontFamily="var(--eng-font)" fontWeight={800} fill="#10b981">Receiver</text>

      {/* Timelines */}
      <line x1={SENDER_X} y1={TIMELINE_TOP} x2={SENDER_X} y2={height - 10} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 4" />
      <line x1={RECEIVER_X} y1={TIMELINE_TOP} x2={RECEIVER_X} y2={height - 10} stroke="#10b981" strokeWidth={2} strokeDasharray="5 4" />

      {/* Time axis */}
      <text x={20} y={height / 2} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" transform={`rotate(-90, 20, ${height / 2})`} textAnchor="middle">
        Time ↓
      </text>

      {/* Arrows */}
      {arrows.map((ar, i) => {
        const fromX = ar.from === "S" ? SENDER_X : RECEIVER_X;
        const toX = ar.to === "S" ? SENDER_X : RECEIVER_X;
        const fromY = TIMELINE_TOP + ar.slotFrom * SLOT_HEIGHT;
        const toY = TIMELINE_TOP + ar.slotTo * SLOT_HEIGHT;
        const color = ar.lost ? "#ef4444" : ar.kind === "ack" ? "#10b981" : ar.kind === "nak" ? "#f59e0b" : "#3b82f6";
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        const tipX = ar.lost ? fromX + (toX - fromX) * 0.55 : toX;
        const tipY = ar.lost ? fromY + (toY - fromY) * 0.55 : toY;
        return (
          <g key={i} style={{ opacity: ar.active ? 1 : 0.28, transition: "opacity 0.3s" }}>
            <line
              x1={fromX}
              y1={fromY}
              x2={tipX}
              y2={tipY}
              stroke={color}
              strokeWidth={ar.active ? 2.5 : 1.8}
              strokeDasharray={ar.lost ? "5 4" : undefined}
              markerEnd={ar.lost ? undefined : ar.active ? "url(#arrowActive)" : "url(#arrowDim)"}
            />
            <text
              x={midX}
              y={midY - 6}
              textAnchor="middle"
              fontSize={10}
              fontFamily='"SF Mono", Menlo, Consolas, monospace'
              fontWeight={700}
              fill={color}
            >
              {ar.label}
            </text>
            {ar.lost && (
              <g>
                <line x1={tipX - 7} y1={tipY - 7} x2={tipX + 7} y2={tipY + 7} stroke="#ef4444" strokeWidth={2.5} />
                <line x1={tipX + 7} y1={tipY - 7} x2={tipX - 7} y2={tipY + 7} stroke="#ef4444" strokeWidth={2.5} />
              </g>
            )}
          </g>
        );
      })}

      {/* Annotations */}
      {annotations.map((an, i) => {
        const x = an.side === "S" ? SENDER_X - 80 : an.side === "R" ? RECEIVER_X + 80 : (SENDER_X + RECEIVER_X) / 2;
        const y = TIMELINE_TOP + an.slot * SLOT_HEIGHT;
        const color = an.kind === "timeout" ? "#f59e0b" : "#64748b";
        const bg = an.kind === "timeout" ? "rgba(245,158,11,0.12)" : "rgba(100,116,139,0.08)";
        return (
          <g key={`a-${i}`} style={{ opacity: an.active ? 1 : 0.4 }}>
            <rect x={x - 55} y={y - 10} width={110} height={20} rx={5} fill={bg} stroke={color} strokeWidth={1} />
            <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill={color}>
              {an.text}
            </text>
          </g>
        );
      })}

      <defs>
        <marker id="arrowActive" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#1e293b" />
        </marker>
        <marker id="arrowDim" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto">
          <polygon points="0 0, 7 3, 0 6" fill="#94a3b8" />
        </marker>
      </defs>
    </svg>
  );
}

/* ================================================================== */
/*  Tab 1: Stop-and-Wait with frame-sync pseudocode                    */
/* ================================================================== */

interface SWFrame {
  line: number;
  message: string;
  vars: Record<string, string | number | boolean | undefined>;
  activeArrow: number;
  activeAnnotation: number | null;
  arrows: Arrow[];
  annotations: Annotation[];
}

const SW_PSEUDO = [
  "loop:",
  "  sender transmits Frame[seq]",
  "  start timer",
  "  wait for ACK[seq]",
  "  if ACK received before timeout:",
  "    seq ← 1 - seq   // toggle 0↔1",
  "  else:             // timeout",
  "    retransmit Frame[seq]",
];

function buildSWFrames(scenario: "normal" | "loss" | "ack-loss"): SWFrame[] {
  const arrows: Arrow[] = [];
  const annotations: Annotation[] = [];
  const frames: SWFrame[] = [];

  function snap(line: number, vars: Record<string, string | number | boolean | undefined>, message: string, activeArrow: number, activeAnnotation: number | null = null) {
    frames.push({
      line,
      message,
      vars: { ...vars },
      activeArrow,
      activeAnnotation,
      arrows: arrows.map((a, i) => ({ ...a, active: i === activeArrow })),
      annotations: annotations.map((a, i) => ({ ...a, active: i === activeAnnotation })),
    });
  }

  if (scenario === "normal") {
    arrows.push({ from: "S", to: "R", slotFrom: 0, slotTo: 1, label: "Frame 0", kind: "frame" });
    snap(1, { seq: 0, scenario: "normal" }, "Send Frame 0.", 0);
    snap(2, { seq: 0, timer: "started" }, "Start timer.", 0);
    snap(3, { seq: 0 }, "Wait for ACK 0.", 0);

    arrows.push({ from: "R", to: "S", slotFrom: 1, slotTo: 2, label: "ACK 0", kind: "ack" });
    snap(4, { seq: 0, ack: 0 }, "Receiver sends ACK 0.", 1);
    snap(5, { seq: 1 }, "ACK 0 received. Toggle seq: 0 → 1.", 1);

    arrows.push({ from: "S", to: "R", slotFrom: 3, slotTo: 4, label: "Frame 1", kind: "frame" });
    snap(1, { seq: 1 }, "Send Frame 1.", 2);
    arrows.push({ from: "R", to: "S", slotFrom: 4, slotTo: 5, label: "ACK 1", kind: "ack" });
    snap(3, { seq: 1 }, "Wait for ACK 1.", 3);
    snap(5, { seq: 0, ack: 1 }, "ACK 1 received. Toggle seq: 1 → 0.", 3);
  } else if (scenario === "loss") {
    arrows.push({ from: "S", to: "R", slotFrom: 0, slotTo: 1, label: "Frame 0", kind: "frame" });
    snap(1, { seq: 0, scenario: "frame loss" }, "Send Frame 0.", 0);
    arrows.push({ from: "R", to: "S", slotFrom: 1, slotTo: 2, label: "ACK 0", kind: "ack" });
    snap(4, { seq: 0, ack: 0 }, "ACK 0 received.", 1);
    snap(5, { seq: 1 }, "Toggle seq: 0 → 1.", 1);

    arrows.push({ from: "S", to: "R", slotFrom: 3, slotTo: 4, label: "Frame 1", kind: "frame", lost: true });
    snap(1, { seq: 1, timer: "started" }, "Send Frame 1.", 2);
    snap(3, { seq: 1 }, "Waiting for ACK 1 ...", 2);
    annotations.push({ slot: 5, side: "S", text: "TIMEOUT", kind: "timeout" });
    snap(6, { seq: 1, timer: "expired" }, "Timer expired. No ACK.", 2, 0);

    arrows.push({ from: "S", to: "R", slotFrom: 6, slotTo: 7, label: "Frame 1 (resend)", kind: "frame" });
    snap(7, { seq: 1 }, "Retransmit Frame 1.", 3);
    arrows.push({ from: "R", to: "S", slotFrom: 7, slotTo: 8, label: "ACK 1", kind: "ack" });
    snap(4, { seq: 1, ack: 1 }, "ACK 1 received after retransmit.", 4);
    snap(5, { seq: 0 }, "Toggle seq: 1 → 0.", 4);
  } else {
    arrows.push({ from: "S", to: "R", slotFrom: 0, slotTo: 1, label: "Frame 0", kind: "frame" });
    snap(1, { seq: 0, scenario: "ACK loss" }, "Send Frame 0.", 0);
    arrows.push({ from: "R", to: "S", slotFrom: 1, slotTo: 2, label: "ACK 0", kind: "ack", lost: true });
    snap(3, { seq: 0 }, "Receiver sends ACK 0 - but it is lost!", 1);

    annotations.push({ slot: 4, side: "S", text: "TIMEOUT", kind: "timeout" });
    snap(6, { seq: 0, timer: "expired" }, "Sender's timer expires.", 1, 0);
    arrows.push({ from: "S", to: "R", slotFrom: 5, slotTo: 6, label: "Frame 0 (duplicate)", kind: "frame" });
    snap(7, { seq: 0 }, "Retransmit Frame 0 (receiver will detect duplicate).", 2);
    arrows.push({ from: "R", to: "S", slotFrom: 6, slotTo: 7, label: "ACK 0", kind: "ack" });
    snap(4, { seq: 0, ack: 0 }, "Receiver sends ACK 0 again.", 3);
    snap(5, { seq: 1 }, "Toggle seq: 0 → 1.", 3);
  }

  return frames;
}

function StopAndWaitTab() {
  const [scenario, setScenario] = useState<"normal" | "loss" | "ack-loss">("normal");
  const frames = useMemo(() => buildSWFrames(scenario), [scenario]);
  const player = useStepPlayer(frames);
  const f = player.current!;
  const lastSlot = Math.max(...f.arrows.map((a) => Math.max(a.slotFrom, a.slotTo)), ...f.annotations.map((a) => a.slot), 0);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Stop-and-Wait ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Sender transmits one frame and waits for an ACK before sending the next. Step through to see how frame loss and ACK loss are handled with timeouts.
      </p>

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
      </div>

      <AlgoCanvas
        title={`Stop-and-Wait - ${scenario}`}
        player={player}
        pseudocode={<PseudocodePanel lines={SW_PSEUDO} activeLine={f.line} />}
        variables={<VariablesPanel vars={f.vars} flashKeys={f.vars.seq !== undefined ? ["seq"] : []} />}
        legend={
          <span>
            <span style={{ color: "#3b82f6" }}>blue</span> = data frame ·
            <span style={{ color: "#10b981", marginLeft: 6 }}>green</span> = ACK ·
            <span style={{ color: "#ef4444", marginLeft: 6 }}>red dashed ✗</span> = lost in transit ·
            <span style={{ color: "#f59e0b", marginLeft: 6 }}>amber</span> = sender timeout
          </span>
        }
      >
        <SequenceDiagram arrows={f.arrows} annotations={f.annotations} lastSlot={lastSlot} />
      </AlgoCanvas>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Efficiency:</strong> Utilisation = 1 / (1 + 2a), where a = propagation / transmission time. On a high-latency link, the sender is idle most of the time.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2: Go-Back-N                                                    */
/* ================================================================== */

interface GBNFrame {
  line: number;
  message: string;
  vars: Record<string, string | number | boolean | undefined>;
  // Per-frame state at each time step
  frameState: ("pending" | "sent" | "acked" | "lost" | "resent")[];
  windowBase: number;
  windowSize: number;
}

const GBN_PSEUDO = [
  "base ← 0",
  "while base < N_total:",
  "  while nextSeq < base + WINDOW and nextSeq < N_total:",
  "    send Frame[nextSeq]; nextSeq++",
  "  on ACK[k]:  base ← k + 1",
  "  on timeout: nextSeq ← base   // go back",
];

function buildGBNFrames(windowSize: number, totalFrames: number, lossFrame: number): GBNFrame[] {
  const frames: GBNFrame[] = [];
  const N = Math.max(6, totalFrames);
  const lf = Math.max(0, Math.min(lossFrame, windowSize - 1));
  let state: ("pending" | "sent" | "acked" | "lost" | "resent")[] = Array(N).fill("pending");

  const snap = (line: number, message: string, vars: Record<string, string | number | boolean | undefined>, windowBase: number) => {
    frames.push({ line, message, vars: { ...vars }, frameState: [...state], windowBase, windowSize });
  };

  snap(0, "Initialise: base = 0, nextSeq = 0.", { base: 0, nextSeq: 0, WINDOW: windowSize }, 0);
  snap(1, `Main loop: frames 0..${N - 1} to send.`, { base: 0, nextSeq: 0 }, 0);

  // Send first window
  for (let i = 0; i < windowSize && i < N; i++) {
    state[i] = i === lf ? "lost" : "sent";
    snap(3, `Send Frame ${i}${i === lf ? " (LOST in transit!)" : ""}.`, { base: 0, nextSeq: i + 1 }, 0);
  }

  // ACKs for frames before loss arrive
  for (let i = 0; i < lf; i++) {
    state[i] = "acked";
    snap(4, `ACK ${i} received - slide base to ${i + 1}.`, { base: i + 1, nextSeq: Math.min(windowSize, N) }, i + 1);
  }

  // Timeout
  snap(5, `Timeout for Frame ${lf}. Go back: nextSeq ← base = ${lf}.`, { base: lf, nextSeq: lf, timeout: true }, lf);

  // Discard all after base as pending
  for (let i = lf; i < Math.min(lf + windowSize, N); i++) {
    state[i] = "pending";
  }

  // Retransmit window from base
  for (let i = lf; i < Math.min(lf + windowSize, N); i++) {
    state[i] = "resent";
    snap(3, `Resend Frame ${i}.`, { base: lf, nextSeq: i + 1 }, lf);
  }

  // ACKs arrive, advance base
  for (let i = lf; i < Math.min(lf + windowSize, N); i++) {
    state[i] = "acked";
    snap(4, `ACK ${i} received - slide base to ${i + 1}.`, { base: i + 1, nextSeq: Math.min(lf + windowSize, N) }, i + 1);
  }

  // Remaining frames
  const done = Math.min(lf + windowSize, N);
  if (done < N) {
    for (let i = done; i < N; i++) {
      state[i] = "sent";
      snap(3, `Send Frame ${i}.`, { base: done, nextSeq: i + 1 }, done);
    }
    for (let i = done; i < N; i++) {
      state[i] = "acked";
      snap(4, `ACK ${i} received.`, { base: i + 1, nextSeq: N }, i + 1);
    }
  }

  snap(1, `All ${N} frames delivered.`, { base: N, nextSeq: N }, N);
  return frames;
}

function GoBackNTab() {
  const [inputStr, setInputStr] = useState("N=4, lossAt=2, total=8");
  const { windowSize, lossFrame, totalFrames } = useMemo(() => {
    const m = /N\s*=\s*(\d+).*lossAt\s*=\s*(\d+).*total\s*=\s*(\d+)/i.exec(inputStr);
    if (!m) return { windowSize: 4, lossFrame: 2, totalFrames: 8 };
    return { windowSize: Number(m[1]), lossFrame: Number(m[2]), totalFrames: Number(m[3]) };
  }, [inputStr]);

  const frames = useMemo(
    () => buildGBNFrames(windowSize, totalFrames, lossFrame),
    [windowSize, totalFrames, lossFrame]
  );
  const player = useStepPlayer(frames);
  const f = player.current!;

  const stateColors: Record<string, string> = {
    pending: "#cbd5e1",
    sent: "#3b82f6",
    acked: "#10b981",
    lost: "#ef4444",
    resent: "#f59e0b",
  };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Go-Back-N ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Sender keeps up to N outstanding frames. On a loss, it resends the lost frame and every frame after it.
      </p>

      <AlgoCanvas
        title="Go-Back-N"
        player={player}
        input={
          <InputEditor
            label="Config (N, loss position, total frames)"
            value={inputStr}
            helper="Format: N=<window>, lossAt=<index>, total=<count>"
            placeholder="N=4, lossAt=2, total=8"
            presets={[
              { label: "Small window", value: "N=3, lossAt=1, total=6" },
              { label: "Medium", value: "N=4, lossAt=2, total=8" },
              { label: "Large window", value: "N=6, lossAt=3, total=10" },
              { label: "Early loss", value: "N=5, lossAt=0, total=8" },
            ]}
            onApply={setInputStr}
          />
        }
        pseudocode={<PseudocodePanel lines={GBN_PSEUDO} activeLine={f.line} />}
        variables={<VariablesPanel vars={f.vars} flashKeys={Object.keys(f.vars).filter((k) => k === "base" || k === "nextSeq")} />}
        legend={
          <span>
            <span style={{ color: "#3b82f6" }}>blue</span> sent ·
            <span style={{ color: "#10b981", marginLeft: 6 }}>green</span> ACKed ·
            <span style={{ color: "#ef4444", marginLeft: 6 }}>red</span> lost ·
            <span style={{ color: "#f59e0b", marginLeft: 6 }}>amber</span> resent
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", position: "relative", padding: "20px 8px 8px" }}>
            {f.frameState.map((s, i) => {
              const inWindow = i >= f.windowBase && i < f.windowBase + f.windowSize;
              return (
                <div key={i}
                  style={{
                    width: 58, height: 58, position: "relative",
                    borderRadius: 8,
                    border: `2px solid ${stateColors[s]}`,
                    background: `${stateColors[s]}1a`,
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    transition: "all 0.3s ease",
                    boxShadow: inWindow ? "0 0 0 3px rgba(59,130,246,0.18)" : "none",
                  }}
                >
                  <span style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.95rem", fontWeight: 800, color: stateColors[s] }}>
                    F{i}
                  </span>
                  <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.58rem", color: stateColors[s], fontWeight: 700, textTransform: "uppercase" }}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: "0.76rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>
            Window [base={f.windowBase} .. base+N={f.windowBase + f.windowSize}) highlighted
          </div>
        </div>
      </AlgoCanvas>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Go-Back-N:</strong> simple receiver (no buffering) at the cost of bandwidth - every frame after the loss is retransmitted.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3: Selective Repeat (kept with improved state visualisation)   */
/* ================================================================== */

function SelectiveRepeatTab() {
  const [windowSize, setWindowSize] = useState(4);
  const [frames, setFrames] = useState<{ id: number; senderState: string; receiverState: string }[]>([]);
  const [step, setStep] = useState(0);
  const lossFrame = 2;
  const totalFrames = 8;

  const resetSim = useCallback(() => {
    setStep(0);
    setFrames(
      Array.from({ length: totalFrames }, (_, i) => ({
        id: i,
        senderState: "pending",
        receiverState: "empty",
      }))
    );
  }, []);

  useEffect(() => { resetSim(); }, [resetSim]);

  const nextStep = useCallback(() => {
    setStep((s) => {
      const ns = s + 1;
      setFrames((prev) => {
        const next = prev.map((f) => ({ ...f }));
        if (ns === 1) {
          for (let i = 0; i < windowSize; i++) next[i].senderState = i === lossFrame ? "lost" : "sent";
        } else if (ns === 2) {
          for (let i = 0; i < windowSize; i++) {
            if (i === lossFrame) next[i].receiverState = "missing";
            else if (i < lossFrame) { next[i].senderState = "acked"; next[i].receiverState = "received"; }
            else { next[i].receiverState = "buffered"; next[i].senderState = "acked"; }
          }
        } else if (ns === 3) {
          next[lossFrame].senderState = "resent";
        } else if (ns === 4) {
          for (let i = 0; i < windowSize; i++) { next[i].senderState = "acked"; next[i].receiverState = "received"; }
          for (let i = windowSize; i < Math.min(windowSize + windowSize, totalFrames); i++) next[i].senderState = "sent";
        } else if (ns === 5) {
          for (let i = 0; i < totalFrames; i++) { next[i].senderState = "acked"; next[i].receiverState = "received"; }
        }
        return next;
      });
      return Math.min(ns, 5);
    });
  }, [windowSize]);

  const sColors: Record<string, string> = { pending: "#cbd5e1", sent: "#3b82f6", acked: "#10b981", lost: "#ef4444", resent: "#f59e0b" };
  const rColors: Record<string, string> = { empty: "#cbd5e1", received: "#10b981", buffered: "#f59e0b", missing: "#ef4444" };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Selective Repeat ARQ
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Unlike Go-Back-N, only the lost frame is retransmitted. The receiver buffers out-of-order frames.
      </p>

      <div className="flex gap-4 items-end" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Window Size: {windowSize}
          </label>
          <input
            type="range" min={3} max={6} value={windowSize}
            onChange={(e) => { setWindowSize(Number(e.target.value)); resetSim(); }}
            style={{ width: "100%", accentColor: "var(--eng-primary)" }}
          />
        </div>
        <button onClick={nextStep} className="btn-eng" style={{ fontSize: "0.8rem" }} disabled={step >= 5}>Next Step</button>
        <button onClick={resetSim} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <div className="card-eng" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "#3b82f6", margin: "0 0 12px" }}>Sender Window</h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {frames.map((f) => (
              <div key={f.id}
                style={{
                  width: 52, height: 52, borderRadius: 6,
                  border: `2px solid ${sColors[f.senderState]}`, background: `${sColors[f.senderState]}22`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transition: "all 0.35s ease",
                }}
              >
                <span style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.9rem", fontWeight: 700, color: sColors[f.senderState] }}>F{f.id}</span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", color: sColors[f.senderState] }}>{f.senderState}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card-eng" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "#10b981", margin: "0 0 12px" }}>Receiver Buffer</h4>
          <div className="flex gap-2 flex-wrap justify-center">
            {frames.map((f) => (
              <div key={f.id}
                style={{
                  width: 52, height: 52, borderRadius: 6,
                  border: `2px solid ${rColors[f.receiverState]}`, background: `${rColors[f.receiverState]}22`,
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transition: "all 0.35s ease",
                }}
              >
                <span style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.9rem", fontWeight: 700, color: rColors[f.receiverState] }}>F{f.id}</span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", color: rColors[f.receiverState] }}>{f.receiverState}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

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

/* ================================================================== */
/*  Tab 4: Comparison                                                   */
/* ================================================================== */

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
    { name: "Stop & Wait", efficiency: 0.2, color: "#ef4444", formula: "1 / (1 + 2a)" },
    { name: "Go-Back-N", efficiency: 0.65, color: "#f59e0b", formula: "N / (1 + 2a)" },
    { name: "Selective Repeat", efficiency: 0.85, color: "#10b981", formula: "N / (1 + 2a), best" },
  ];

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Protocol Efficiency Comparison
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Compare the channel utilization of all three ARQ protocols. Here a = propagation delay / transmission time.
      </p>

      <div className="card-eng" style={{ padding: 24 }}>
        <svg viewBox="0 0 600 250" width="100%" style={{ display: "block" }}>
          <line x1={120} y1={20} x2={120} y2={220} stroke="var(--eng-border)" strokeWidth={1.5} />
          <line x1={120} y1={220} x2={580} y2={220} stroke="var(--eng-border)" strokeWidth={1.5} />
          {[0, 25, 50, 75, 100].map((v) => {
            const x = 120 + (v / 100) * 450;
            return (
              <g key={v}>
                <line x1={x} y1={220} x2={x} y2={224} stroke="var(--eng-border)" strokeWidth={1} />
                <text x={x} y={240} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">{v}%</text>
              </g>
            );
          })}
          <text x={345} y={248} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Channel Utilization (%)</text>

          {protocols.map((p, idx) => {
            const barY = 40 + idx * 65;
            const barWidth = p.efficiency * 450 * animProgress;
            return (
              <g key={p.name}>
                <text x={115} y={barY + 22} textAnchor="end" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">{p.name}</text>
                <rect x={120} y={barY} width={450} height={36} rx={4} fill="#e2e8f0" opacity={0.5} />
                <rect x={120} y={barY} width={barWidth} height={36} rx={4} fill={p.color} opacity={0.85} style={{ transition: "width 0.3s ease" }} />
                <text x={120 + barWidth + 8} y={barY + 16} fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill={p.color}>
                  {Math.round(p.efficiency * 100 * animProgress)}%
                </text>
                <text x={120 + barWidth + 8} y={barY + 30} fontSize={9} fontFamily='"SF Mono", Menlo, Consolas, monospace' fill="var(--eng-text-muted)">{p.formula}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ overflowX: "auto", marginTop: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--eng-text)" }}>Feature</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "#ef4444" }}>Stop &amp; Wait</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "#f59e0b" }}>Go-Back-N</th>
              <th style={{ padding: "8px 12px", textAlign: "center", color: "#10b981" }}>Selective Repeat</th>
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

/* ================================================================== */
/*  Quiz + Export                                                       */
/* ================================================================== */

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

const tabs: EngTabDef[] = [
  { id: "stop-wait", label: "Stop & Wait", icon: <ArrowLeftRight className="w-4 h-4" />, content: <StopAndWaitTab /> },
  { id: "go-back-n", label: "Go-Back-N", icon: <Repeat className="w-4 h-4" />, content: <GoBackNTab /> },
  { id: "selective-repeat", label: "Selective Repeat", icon: <RefreshCw className="w-4 h-4" />, content: <SelectiveRepeatTab /> },
  { id: "compare", label: "Compare", icon: <BarChart3 className="w-4 h-4" />, content: <CompareTab /> },
];

export default function CN_L2_ARQProtocolsActivity() {
  return (
    <EngineeringLessonShell
      title="ARQ Protocols"
      level={2}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Medium Access Control Protocols"
      placementRelevance="Low"
    />
  );
}
