"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Wifi, Radio, BarChart3, Play, Pause, RotateCcw } from "lucide-react";
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
/*  Constants                                                          */
/* ================================================================== */

const SVG_W = 700;
const SVG_H = 340;
const CHANNEL_Y = 60;
const CHANNEL_H = 30;
const NODE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

/* ================================================================== */
/*  Tab 1: ALOHA - Pure and Slotted (unchanged)                        */
/* ================================================================== */

interface AlohaFrame {
  nodeId: number;
  startTime: number;
  duration: number;
  collided: boolean;
}

function ALOHATab() {
  const [mode, setMode] = useState<"pure" | "slotted">("pure");
  const [frames, setFrames] = useState<AlohaFrame[]>([]);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [generation, setGeneration] = useState(0);
  const timerRef = useRef<number | null>(null);

  const generateFrames = useCallback((alohaMode: "pure" | "slotted") => {
    const newFrames: AlohaFrame[] = [];
    const numNodes = 4;
    const duration = 0.08;
    const slotDuration = 0.1;

    for (let i = 0; i < 12; i++) {
      const nodeId = Math.floor(Math.random() * numNodes);
      let startTime: number;
      if (alohaMode === "pure") {
        startTime = Math.random() * 0.85;
      } else {
        const slot = Math.floor(Math.random() * 9);
        startTime = slot * slotDuration + 0.02;
      }
      newFrames.push({ nodeId, startTime, duration, collided: false });
    }

    for (let i = 0; i < newFrames.length; i++) {
      for (let j = i + 1; j < newFrames.length; j++) {
        const a = newFrames[i];
        const b = newFrames[j];
        const overlap = a.startTime < b.startTime + b.duration && b.startTime < a.startTime + a.duration;
        if (overlap) { newFrames[i].collided = true; newFrames[j].collided = true; }
      }
    }
    return newFrames;
  }, []);

  useEffect(() => {
    setFrames(generateFrames(mode));
    setTime(0);
    setIsRunning(false);
  }, [mode, generation, generateFrames]);

  useEffect(() => {
    if (!isRunning) return;
    const animate = () => {
      setTime((t) => { if (t >= 1) { setIsRunning(false); return 1; } return t + 0.005; });
      timerRef.current = requestAnimationFrame(animate);
    };
    timerRef.current = requestAnimationFrame(animate);
    return () => { if (timerRef.current) cancelAnimationFrame(timerRef.current); };
  }, [isRunning]);

  const successCount = frames.filter((f) => !f.collided && f.startTime + f.duration <= time).length;
  const collisionCount = frames.filter((f) => f.collided && f.startTime <= time).length;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        ALOHA Protocol
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Nodes transmit whenever they have data. In Pure ALOHA, transmissions can start anytime. In Slotted ALOHA, they align to time slots, reducing collisions.
      </p>

      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {(["pure", "slotted"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)} className={mode === m ? "btn-eng" : "btn-eng-outline"} style={{ fontSize: "0.8rem", textTransform: "capitalize" }}>
            {m} ALOHA
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button onClick={() => { setTime(0); setIsRunning(true); }} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <Play className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setIsRunning(!isRunning)} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setGeneration((g) => g + 1)} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          <text x={SVG_W / 2} y={25} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
            Shared Channel {mode === "slotted" ? "(Slotted)" : "(Pure)"} - Time →
          </text>

          {mode === "slotted" && Array.from({ length: 10 }, (_, i) => {
            const x = 50 + (i / 10) * (SVG_W - 100);
            return (
              <g key={i}>
                <line x1={x} y1={CHANNEL_Y - 10} x2={x} y2={CHANNEL_Y + CHANNEL_H * 5 + 20} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="3,3" />
                <text x={x + 2} y={CHANNEL_Y - 2} fontSize={8} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">S{i}</text>
              </g>
            );
          })}

          {Array.from({ length: 4 }, (_, nodeId) => {
            const rowY = CHANNEL_Y + nodeId * (CHANNEL_H + 12);
            return (
              <g key={nodeId}>
                <text x={22} y={rowY + CHANNEL_H / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill={NODE_COLORS[nodeId]}>
                  N{nodeId}
                </text>
                <line x1={40} y1={rowY + CHANNEL_H / 2} x2={SVG_W - 30} y2={rowY + CHANNEL_H / 2} stroke="var(--eng-border)" strokeWidth={0.5} />
                {frames.filter((f) => f.nodeId === nodeId).map((frame, fidx) => {
                  const x = 50 + frame.startTime * (SVG_W - 100);
                  const w = frame.duration * (SVG_W - 100);
                  const visible = frame.startTime <= time;
                  if (!visible) return null;
                  return (
                    <g key={fidx}>
                      <rect x={x} y={rowY + 2} width={w} height={CHANNEL_H - 4} rx={4}
                        fill={frame.collided ? "#ef4444" : NODE_COLORS[nodeId]}
                        opacity={frame.collided ? 0.3 : 0.7}
                        stroke={frame.collided ? "#ef4444" : NODE_COLORS[nodeId]}
                        strokeWidth={1.5} className="eng-fadeIn"
                      />
                      {frame.collided && (
                        <text x={x + w / 2} y={rowY + CHANNEL_H / 2 + 3} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={700} fill="#ef4444">
                          COLLISION
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          <line x1={50 + time * (SVG_W - 100)} y1={CHANNEL_Y - 15} x2={50 + time * (SVG_W - 100)} y2={CHANNEL_Y + 4 * (CHANNEL_H + 12) + 10} stroke="var(--eng-primary)" strokeWidth={2} opacity={0.6} />

          <text x={50} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-success)">Success: {successCount}</text>
          <text x={200} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-danger)">Collisions: {collisionCount}</text>
          <text x={380} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            Max throughput: {mode === "pure" ? "18.4% (1/2e)" : "36.8% (1/e)"}
          </text>
        </svg>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Pure ALOHA:</strong> Max throughput 18.4%. <strong>Slotted ALOHA:</strong> Max throughput 36.8% (double). Slotting halves the vulnerable period.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2: CSMA/CD with pseudocode sync + backoff algorithm            */
/* ================================================================== */

interface CSMAFrame {
  line: number;
  message: string;
  vars: Record<string, string | number | boolean | undefined>;
  nodes: {
    id: string;
    state: "idle" | "sensing" | "transmitting" | "collision" | "jam" | "backoff" | "success";
    label?: string;
  }[];
  channel: "idle" | "busy" | "collision" | "jam";
  backoffDraws?: { attempt: number; range: string; choice: number }[];
  activeNode?: string;
}

const CSMA_CD_PSEUDO = [
  "function CSMA_CD(node):",
  "  attempt ← 0",
  "  while attempt < 16:",
  "    wait until channel is idle   // carrier sense",
  "    start transmitting",
  "    if collision detected while sending:",
  "      send JAM signal",
  "      attempt ← attempt + 1",
  "      k ← min(attempt, 10)",
  "      wait random(0..2^k - 1) × slotTime   // backoff",
  "      continue",
  "    else:",
  "      return SUCCESS",
  "  return GIVE_UP",
];

function buildCSMAFrames(stations: number, seedLoss: boolean): CSMAFrame[] {
  const frames: CSMAFrame[] = [];
  const stationIds = Array.from({ length: stations }, (_, i) => `N${i}`);

  const mkNodes = (active: Record<string, CSMAFrame["nodes"][number]["state"]>) =>
    stationIds.map((id) => ({ id, state: active[id] ?? ("idle" as const) }));

  // Seed deterministic backoff picks for reproducibility
  const rng = mulberry32(seedLoss ? 7 : 42);

  frames.push({
    line: 1,
    message: "attempt = 0. Ready to transmit.",
    vars: { attempt: 0, channel: "idle" },
    nodes: mkNodes({}),
    channel: "idle",
  });

  // Attempt 1: two stations collide
  const a = stationIds[0];
  const b = stationIds[Math.min(1, stations - 1)];
  frames.push({
    line: 3,
    message: `${a}: sense channel - IDLE.`,
    vars: { attempt: 0, channel: "idle", node: a },
    nodes: mkNodes({ [a]: "sensing" }),
    channel: "idle",
    activeNode: a,
  });
  frames.push({
    line: 4,
    message: `${a}: channel idle → begin transmitting.`,
    vars: { attempt: 0, channel: "busy", node: a },
    nodes: mkNodes({ [a]: "transmitting" }),
    channel: "busy",
    activeNode: a,
  });
  if (stations > 1) {
    frames.push({
      line: 3,
      message: `${b}: has no signal yet (propagation delay) - senses IDLE too.`,
      vars: { attempt: 0, channel: "busy", node: b, warning: "hidden window" },
      nodes: mkNodes({ [a]: "transmitting", [b]: "sensing" }),
      channel: "busy",
      activeNode: b,
    });
    frames.push({
      line: 4,
      message: `${b}: starts transmitting. Both nodes now on the wire.`,
      vars: { attempt: 0, channel: "collision" },
      nodes: mkNodes({ [a]: "transmitting", [b]: "transmitting" }),
      channel: "collision",
    });
    frames.push({
      line: 5,
      message: "COLLISION DETECTED by both nodes.",
      vars: { attempt: 0, channel: "collision" },
      nodes: mkNodes({ [a]: "collision", [b]: "collision" }),
      channel: "collision",
    });
    frames.push({
      line: 6,
      message: "Both send JAM signal so everyone knows collision occurred.",
      vars: { attempt: 0, channel: "jam" },
      nodes: mkNodes({ [a]: "jam", [b]: "jam" }),
      channel: "jam",
    });
  }

  // Backoff loop
  const picks: { attempt: number; range: string; choice: number }[] = [];
  let attempt = 1;
  let resolved = false;
  while (attempt <= 4 && !resolved) {
    const k = Math.min(attempt, 10);
    const r = 1 << k;
    // Draw for both stations; if different, winner transmits; if same, collide again
    const cA = Math.floor(rng() * r);
    const cB = stations > 1 ? Math.floor(rng() * r) : cA;
    const pickA = { attempt, range: `0..${r - 1}`, choice: cA };
    picks.push({ attempt, range: `${a}: 0..${r - 1}`, choice: cA });
    if (stations > 1) picks.push({ attempt, range: `${b}: 0..${r - 1}`, choice: cB });

    frames.push({
      line: 7,
      message: `attempt = ${attempt}. k = min(${attempt}, 10) = ${k}. Range = 0..${r - 1}.`,
      vars: { attempt, k, range: `0..${r - 1}` },
      nodes: mkNodes({ [a]: "backoff", ...(stations > 1 ? { [b]: "backoff" } : {}) }),
      channel: "idle",
      backoffDraws: [...picks],
    });

    frames.push({
      line: 9,
      message: `${a} picks ${cA}${stations > 1 ? `, ${b} picks ${cB}` : ""}.`,
      vars: { attempt, [`${a}_wait`]: cA, ...(stations > 1 ? { [`${b}_wait`]: cB } : {}) },
      nodes: mkNodes({ [a]: "backoff", ...(stations > 1 ? { [b]: "backoff" } : {}) }),
      channel: "idle",
      backoffDraws: [...picks],
    });

    if (stations === 1 || cA !== cB) {
      const winner = cA < cB ? a : b;
      const loser = winner === a ? b : a;
      frames.push({
        line: 3,
        message: `${winner} wakes first → senses channel, idle → transmits.`,
        vars: { attempt, node: winner },
        nodes: mkNodes({ [winner]: "transmitting", ...(stations > 1 ? { [loser]: "backoff" } : {}) }),
        channel: "busy",
        activeNode: winner,
        backoffDraws: [...picks],
      });
      frames.push({
        line: 12,
        message: `${winner} completes transmission - SUCCESS.`,
        vars: { attempt, status: "SUCCESS" },
        nodes: mkNodes({ [winner]: "success", ...(stations > 1 ? { [loser]: "idle" } : {}) }),
        channel: "idle",
        backoffDraws: [...picks],
      });
      resolved = true;
      break;
    }

    // Still colliding
    frames.push({
      line: 5,
      message: `Both picked same slot (${cA}) - COLLISION again!`,
      vars: { attempt, collision: true },
      nodes: mkNodes({ [a]: "collision", [b]: "collision" }),
      channel: "collision",
      backoffDraws: [...picks],
    });
    attempt++;
  }

  if (!resolved) {
    frames.push({
      line: 13,
      message: "Attempt limit hit. Give up.",
      vars: { status: "GIVE_UP" },
      nodes: mkNodes({ [a]: "idle" }),
      channel: "idle",
      backoffDraws: [...picks],
    });
  }

  return frames;
}

// tiny seedable RNG
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function CSMATab() {
  const [inputStr, setInputStr] = useState("stations=2");
  const stations = useMemo(() => {
    const m = /stations\s*=\s*(\d+)/i.exec(inputStr);
    return m ? Math.max(1, Math.min(4, Number(m[1]))) : 2;
  }, [inputStr]);

  const frames = useMemo(() => buildCSMAFrames(stations, false), [stations]);
  const player = useStepPlayer(frames);
  const f = player.current!;

  const nodeColor: Record<string, string> = {
    idle: "#94a3b8",
    sensing: "#f59e0b",
    transmitting: "#10b981",
    collision: "#ef4444",
    jam: "#ef4444",
    backoff: "#8b5cf6",
    success: "#10b981",
  };
  const channelColor: Record<string, string> = {
    idle: "#cbd5e1",
    busy: "#10b981",
    collision: "#ef4444",
    jam: "#ef4444",
  };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        CSMA/CD - Binary Exponential Backoff
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Listen before you talk; if you crash, back off a random amount and try again - with the random range doubling on each collision.
      </p>

      <AlgoCanvas
        title="CSMA/CD Backoff Walkthrough"
        player={player}
        input={
          <InputEditor
            label="Scenario"
            value={inputStr}
            helper="Number of stations competing (1-4). Format: stations=N"
            placeholder="stations=2"
            presets={[
              { label: "1 station", value: "stations=1" },
              { label: "2 stations (collision)", value: "stations=2" },
              { label: "3 stations", value: "stations=3" },
              { label: "4 stations", value: "stations=4" },
            ]}
            onApply={setInputStr}
          />
        }
        pseudocode={<PseudocodePanel lines={CSMA_CD_PSEUDO} activeLine={f.line} />}
        variables={<VariablesPanel vars={f.vars} flashKeys={["attempt", "k", "status", "collision"]} />}
        legend={
          <span>
            <span style={{ color: "#f59e0b" }}>sensing</span> ·
            <span style={{ color: "#10b981", marginLeft: 6 }}>transmitting</span> ·
            <span style={{ color: "#ef4444", marginLeft: 6 }}>collision / jam</span> ·
            <span style={{ color: "#8b5cf6", marginLeft: 6 }}>backoff</span>
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          {/* Shared channel strip */}
          <div style={{ width: "100%", maxWidth: 560 }}>
            <div style={{
              height: 40, borderRadius: 20,
              border: `2px solid ${channelColor[f.channel]}`,
              background: `${channelColor[f.channel]}22`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.3s ease",
              fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 800,
              color: channelColor[f.channel],
              letterSpacing: "0.08em", textTransform: "uppercase",
            }}>
              Shared channel · {f.channel}
            </div>
          </div>

          {/* Station row */}
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            {f.nodes.map((n) => (
              <div key={n.id}
                style={{
                  width: 110, padding: "10px 8px",
                  borderRadius: 10,
                  border: `2px solid ${nodeColor[n.state]}`,
                  background: `${nodeColor[n.state]}18`,
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  boxShadow: n.state === "transmitting" || n.state === "success" ? "0 0 0 3px rgba(16,185,129,0.18)" : "none",
                }}
              >
                <div style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "1.1rem", fontWeight: 800, color: nodeColor[n.state] }}>
                  {n.id}
                </div>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: nodeColor[n.state], fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {n.state}
                </div>
              </div>
            ))}
          </div>

          {/* Backoff draw history */}
          {f.backoffDraws && f.backoffDraws.length > 0 && (
            <div className="card-eng" style={{ padding: "10px 14px", maxWidth: 560, width: "100%" }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                Backoff picks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {f.backoffDraws.map((d, i) => (
                  <div key={i} style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.78rem", color: "var(--eng-text)" }}>
                    attempt {d.attempt} · {d.range} → picked {d.choice}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AlgoCanvas>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card-eng" style={{ padding: 14, borderLeft: "3px solid var(--eng-primary)" }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 6px" }}>CSMA/CD (Ethernet)</h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 14, lineHeight: 1.8 }}>
            <li>Listen before transmit</li>
            <li>Detect collision during TX</li>
            <li>Send JAM signal</li>
            <li>Binary exponential backoff</li>
          </ul>
        </div>
        <div className="card-eng" style={{ padding: 14 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 6px" }}>CSMA/CA (Wi-Fi)</h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 14, lineHeight: 1.8 }}>
            <li>Cannot detect collision in wireless</li>
            <li>RTS/CTS handshake to reserve</li>
            <li>NAV timer defers other nodes</li>
            <li>ACK confirms reception</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3: Throughput Comparison (unchanged)                           */
/* ================================================================== */

function CompareTab() {
  const [animProgress, setAnimProgress] = useState(0);
  const [hoverProtocol, setHoverProtocol] = useState<string | null>(null);

  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const animate = (now: number) => {
      const p = Math.min(1, (now - start) / 2000);
      setAnimProgress(p);
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, []);

  const protocols = [
    { name: "Pure ALOHA", color: "#ef4444", maxThroughput: 0.184, formula: (G: number) => G * Math.exp(-2 * G) },
    { name: "Slotted ALOHA", color: "#f59e0b", maxThroughput: 0.368, formula: (G: number) => G * Math.exp(-G) },
    { name: "CSMA (1-persistent)", color: "#6366f1", maxThroughput: 0.53, formula: (G: number) => Math.min(0.53, G * Math.exp(-G) * 1.5) },
    {
      name: "CSMA/CD", color: "#10b981", maxThroughput: 0.85,
      formula: (G: number) => {
        if (G < 0.1) return G * 0.9;
        const peak = 0.85;
        return peak * (1 - Math.exp(-2 * G)) * Math.exp(-0.3 * Math.max(0, G - 1));
      },
    },
  ];

  const graphW = 600; const graphH = 250; const padL = 60; const padB = 40; const padT = 20; const padR = 20;
  const plotW = graphW - padL - padR; const plotH = graphH - padT - padB;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Throughput vs Offered Load
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        See how each MAC protocol&apos;s throughput (S) varies with offered load (G).
      </p>

      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} width="100%" style={{ display: "block" }}>
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
            const y = padT + (1 - v) * plotH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="var(--eng-border)" strokeWidth={0.5} />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">{(v * 100).toFixed(0)}%</text>
              </g>
            );
          })}

          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--eng-text-muted)" strokeWidth={1.5} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--eng-text-muted)" strokeWidth={1.5} />

          {[0, 1, 2, 3, 4, 5].map((v) => {
            const x = padL + (v / 5) * plotW;
            return (
              <text key={v} x={x} y={padT + plotH + 20} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">{v}</text>
            );
          })}

          <text x={padL + plotW / 2} y={graphH - 2} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Offered Load (G)</text>
          <text x={12} y={padT + plotH / 2} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" transform={`rotate(-90, 12, ${padT + plotH / 2})`} textAnchor="middle">Throughput (S)</text>

          {protocols.map((proto) => {
            const points: string[] = [];
            const numPoints = Math.floor(100 * animProgress);
            for (let i = 0; i <= numPoints; i++) {
              const G = (i / 100) * 5;
              const S = Math.min(1, proto.formula(G));
              const x = padL + (G / 5) * plotW;
              const y = padT + (1 - S) * plotH;
              points.push(`${x},${y}`);
            }
            const isHovered = hoverProtocol === proto.name;
            return (
              <polyline
                key={proto.name}
                points={points.join(" ")} fill="none" stroke={proto.color}
                strokeWidth={isHovered ? 3 : 2}
                opacity={hoverProtocol && !isHovered ? 0.3 : 1}
                style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
              />
            );
          })}
        </svg>

        <div className="flex gap-4 flex-wrap justify-center" style={{ marginTop: 12 }}>
          {protocols.map((proto) => (
            <div key={proto.name} className="flex items-center gap-2" style={{ cursor: "pointer" }}
              onMouseEnter={() => setHoverProtocol(proto.name)}
              onMouseLeave={() => setHoverProtocol(null)}
            >
              <div style={{ width: 16, height: 3, background: proto.color, borderRadius: 2 }} />
              <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text)", fontWeight: hoverProtocol === proto.name ? 700 : 400 }}>
                {proto.name} (max: {(proto.maxThroughput * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Key Takeaway:</strong> As protocols get smarter (sense first, detect collisions early), throughput improves dramatically.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz + Export                                                      */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the maximum throughput of Pure ALOHA?",
    options: ["18.4% (1/2e)", "36.8% (1/e)", "50%", "100%"],
    correctIndex: 0,
    explanation: "Pure ALOHA has maximum throughput of 1/(2e) ≈ 18.4%, achieved when offered load G = 0.5.",
  },
  {
    question: "Why can CSMA/CD not be used in wireless networks?",
    options: [
      "Wireless is too slow",
      "Signal strength varies; a node cannot detect collision while transmitting",
      "Wireless does not support carrier sensing",
      "Wireless uses digital signals only",
    ],
    correctIndex: 1,
    explanation: "In wireless, a transmitting node's own signal overwhelms incoming signals, making collision detection impossible. Hence RTS/CTS and CSMA/CA.",
  },
  {
    question: "In CSMA/CA, what is the purpose of the RTS/CTS handshake?",
    options: [
      "To encrypt the data",
      "To detect errors in frames",
      "To reserve the channel and avoid hidden terminal collisions",
      "To increase data rate",
    ],
    correctIndex: 2,
    explanation: "RTS/CTS allows the sender to reserve the channel. All nodes hearing CTS set their NAV timer and defer transmission.",
  },
  {
    question: "In CSMA/CD, after a collision, the binary exponential backoff algorithm:",
    options: [
      "Waits a fixed time period",
      "Chooses a random wait time from an exponentially increasing range",
      "Always retransmits immediately",
      "Drops the frame after first collision",
    ],
    correctIndex: 1,
    explanation: "After the nth collision, a node waits a random number of slot times chosen from {0, 1, ..., 2^n - 1}. The range doubles with each collision (up to a limit).",
  },
  {
    question: "How does Slotted ALOHA double the throughput of Pure ALOHA?",
    options: [
      "By using a faster clock",
      "By requiring all transmissions to start at slot boundaries",
      "By using larger frames",
      "By adding error correction",
    ],
    correctIndex: 1,
    explanation: "Slot alignment halves the vulnerable period from 2T to T, doubling maximum throughput from 1/(2e) to 1/e.",
  },
];

const tabs: EngTabDef[] = [
  { id: "aloha", label: "ALOHA", icon: <Radio className="w-4 h-4" />, content: <ALOHATab /> },
  { id: "csma", label: "CSMA/CD", icon: <Wifi className="w-4 h-4" />, content: <CSMATab /> },
  { id: "compare", label: "Compare", icon: <BarChart3 className="w-4 h-4" />, content: <CompareTab /> },
];

export default function CN_L2_MACProtocolsActivity() {
  return (
    <EngineeringLessonShell
      title="Medium Access Control Protocols"
      level={2}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Ethernet & LAN Standards"
      placementRelevance="Low"
    />
  );
}
