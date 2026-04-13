"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Wifi, Radio, BarChart3, Play, Pause, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SVG_W = 700;
const SVG_H = 340;
const CHANNEL_Y = 60;
const CHANNEL_H = 30;
const NODE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

/* ------------------------------------------------------------------ */
/*  Tab 1: ALOHA - Pure and Slotted                                   */
/* ------------------------------------------------------------------ */

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

    // Detect collisions
    for (let i = 0; i < newFrames.length; i++) {
      for (let j = i + 1; j < newFrames.length; j++) {
        const a = newFrames[i];
        const b = newFrames[j];
        const overlap =
          a.startTime < b.startTime + b.duration && b.startTime < a.startTime + a.duration;
        if (overlap) {
          newFrames[i].collided = true;
          newFrames[j].collided = true;
        }
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
      setTime((t) => {
        if (t >= 1) { setIsRunning(false); return 1; }
        return t + 0.005;
      });
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
        Nodes transmit whenever they have data. In Pure ALOHA, transmissions can start anytime. In Slotted ALOHA, transmissions align to time slots, reducing collisions.
      </p>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {(["pure", "slotted"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={mode === m ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", textTransform: "capitalize" }}
          >
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

      {/* Animation */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          {/* Channel label */}
          <text x={SVG_W / 2} y={25} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
            Shared Channel {mode === "slotted" ? "(Slotted)" : "(Pure)"} - Time →
          </text>

          {/* Time slots for slotted mode */}
          {mode === "slotted" && Array.from({ length: 10 }, (_, i) => {
            const x = 50 + (i / 10) * (SVG_W - 100);
            return (
              <g key={i}>
                <line x1={x} y1={CHANNEL_Y - 10} x2={x} y2={CHANNEL_Y + CHANNEL_H * 5 + 20} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="3,3" />
                <text x={x + 2} y={CHANNEL_Y - 2} fontSize={8} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                  S{i}
                </text>
              </g>
            );
          })}

          {/* Node rows */}
          {Array.from({ length: 4 }, (_, nodeId) => {
            const rowY = CHANNEL_Y + nodeId * (CHANNEL_H + 12);

            return (
              <g key={nodeId}>
                {/* Node label */}
                <text x={22} y={rowY + CHANNEL_H / 2 + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill={NODE_COLORS[nodeId]}>
                  N{nodeId}
                </text>

                {/* Channel line */}
                <line x1={40} y1={rowY + CHANNEL_H / 2} x2={SVG_W - 30} y2={rowY + CHANNEL_H / 2} stroke="var(--eng-border)" strokeWidth={0.5} />

                {/* Frames for this node */}
                {frames
                  .filter((f) => f.nodeId === nodeId)
                  .map((frame, fidx) => {
                    const x = 50 + frame.startTime * (SVG_W - 100);
                    const w = frame.duration * (SVG_W - 100);
                    const visible = frame.startTime <= time;

                    if (!visible) return null;

                    return (
                      <g key={fidx}>
                        <rect
                          x={x}
                          y={rowY + 2}
                          width={w}
                          height={CHANNEL_H - 4}
                          rx={4}
                          fill={frame.collided ? "var(--eng-danger)" : NODE_COLORS[nodeId]}
                          opacity={frame.collided ? 0.3 : 0.7}
                          stroke={frame.collided ? "var(--eng-danger)" : NODE_COLORS[nodeId]}
                          strokeWidth={1.5}
                          className="eng-fadeIn"
                        >
                          {frame.collided && (
                            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="0.5s" repeatCount="indefinite" />
                          )}
                        </rect>
                        {frame.collided && (
                          <text x={x + w / 2} y={rowY + CHANNEL_H / 2 + 3} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-danger)">
                            COLLISION
                          </text>
                        )}
                      </g>
                    );
                  })}
              </g>
            );
          })}

          {/* Current time marker */}
          <line
            x1={50 + time * (SVG_W - 100)}
            y1={CHANNEL_Y - 15}
            x2={50 + time * (SVG_W - 100)}
            y2={CHANNEL_Y + 4 * (CHANNEL_H + 12) + 10}
            stroke="var(--eng-primary)"
            strokeWidth={2}
            opacity={0.6}
          />

          {/* Stats */}
          <text x={50} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-success)">
            Success: {successCount}
          </text>
          <text x={200} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-danger)">
            Collisions: {collisionCount}
          </text>
          <text x={380} y={SVG_H - 30} fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            Max throughput: {mode === "pure" ? "18.4% (1/2e)" : "36.8% (1/e)"}
          </text>
        </svg>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Pure ALOHA:</strong> Max throughput 18.4%. <strong>Slotted ALOHA:</strong> Max throughput 36.8% (double).
        Slotting reduces the vulnerable period from 2T to T, halving collision probability.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2: CSMA/CD and CSMA/CA                                       */
/* ------------------------------------------------------------------ */

function CSMATab() {
  const [protocol, setProtocol] = useState<"cd" | "ca">("cd");
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const totalSteps = protocol === "cd" ? 7 : 8;

  useEffect(() => {
    setStep(0);
    setIsRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, [protocol]);

  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = window.setInterval(() => {
      setStep((s) => {
        if (s >= totalSteps) {
          setIsRunning(false);
          return s;
        }
        return s + 1;
      });
    }, 1200);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, totalSteps]);

  const cdSteps = [
    { label: "Node A senses channel...", nodeA: "sensing", nodeB: "idle", channel: "idle" },
    { label: "Channel is IDLE. Node A starts transmitting.", nodeA: "transmitting", nodeB: "idle", channel: "busy" },
    { label: "Node B also senses channel as idle (signal hasn't reached B yet).", nodeA: "transmitting", nodeB: "sensing", channel: "busy" },
    { label: "Node B starts transmitting too!", nodeA: "transmitting", nodeB: "transmitting", channel: "collision" },
    { label: "COLLISION DETECTED! Both nodes detect the collision.", nodeA: "collision", nodeB: "collision", channel: "collision" },
    { label: "Both send JAM signal and stop.", nodeA: "jam", nodeB: "jam", channel: "jam" },
    { label: "Exponential backoff: wait random time, then retry.", nodeA: "backoff", nodeB: "backoff", channel: "idle" },
    { label: "Node A retransmits successfully after backoff.", nodeA: "transmitting", nodeB: "idle", channel: "busy" },
  ];

  const caSteps = [
    { label: "Node A wants to send. Senses channel...", nodeA: "sensing", nodeB: "idle", channel: "idle" },
    { label: "Channel idle. Wait DIFS period.", nodeA: "wait-difs", nodeB: "idle", channel: "idle" },
    { label: "Send RTS (Request To Send) to receiver.", nodeA: "rts", nodeB: "idle", channel: "rts" },
    { label: "Receiver responds with CTS (Clear To Send).", nodeA: "waiting", nodeB: "idle", channel: "cts" },
    { label: "All other nodes hear CTS, set NAV timer (defer).", nodeA: "waiting", nodeB: "deferred", channel: "nav" },
    { label: "Node A transmits data frame.", nodeA: "transmitting", nodeB: "deferred", channel: "busy" },
    { label: "Receiver waits SIFS, sends ACK.", nodeA: "waiting", nodeB: "deferred", channel: "ack" },
    { label: "Transmission complete! NAV timer expires for others.", nodeA: "done", nodeB: "idle", channel: "idle" },
    { label: "Channel is free for other nodes.", nodeA: "idle", nodeB: "idle", channel: "idle" },
  ];

  const activeSteps = protocol === "cd" ? cdSteps : caSteps;
  const currentInfo = activeSteps[Math.min(step, activeSteps.length - 1)];

  const nodeStateColor = (state: string) => {
    switch (state) {
      case "transmitting": return "var(--eng-success)";
      case "collision": case "jam": return "var(--eng-danger)";
      case "sensing": case "wait-difs": return "var(--eng-warning)";
      case "rts": return "var(--eng-primary)";
      case "backoff": case "deferred": return "#8b5cf6";
      case "waiting": return "var(--eng-warning)";
      case "done": return "var(--eng-success)";
      default: return "var(--eng-border)";
    }
  };

  const channelColor = (state: string) => {
    switch (state) {
      case "busy": return "var(--eng-success)";
      case "collision": case "jam": return "var(--eng-danger)";
      case "rts": case "cts": case "nav": return "var(--eng-primary)";
      case "ack": return "var(--eng-success)";
      default: return "var(--eng-border)";
    }
  };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        CSMA/CD &amp; CSMA/CA
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        CSMA/CD (Collision Detection) is used in wired Ethernet. CSMA/CA (Collision Avoidance) is used in wireless (Wi-Fi) networks.
      </p>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {(["cd", "ca"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setProtocol(p)}
            className={protocol === p ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem" }}
          >
            {p === "cd" ? "CSMA/CD (Wired)" : "CSMA/CA (Wireless)"}
          </button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button onClick={() => { setStep(0); setIsRunning(true); }} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <Play className="w-3.5 h-3.5" /> Auto
          </button>
          <button
            onClick={() => setStep((s) => Math.min(s + 1, totalSteps))}
            className="btn-eng-outline"
            style={{ fontSize: "0.8rem" }}
            disabled={step >= totalSteps}
          >
            Step →
          </button>
          <button onClick={() => { setStep(0); setIsRunning(false); }} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Visualization */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} 260`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          {/* Channel */}
          <rect x={80} y={100} width={SVG_W - 160} height={24} rx={12} fill={`${channelColor(currentInfo.channel)}15`} stroke={channelColor(currentInfo.channel)} strokeWidth={2} />
          <text x={SVG_W / 2} y={117} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill={channelColor(currentInfo.channel)}>
            Channel: {currentInfo.channel.toUpperCase()}
          </text>

          {/* Node A */}
          <g>
            <rect x={30} y={30} width={80} height={50} rx={8} fill={`${nodeStateColor(currentInfo.nodeA)}15`} stroke={nodeStateColor(currentInfo.nodeA)} strokeWidth={2}>
              {currentInfo.nodeA === "collision" && (
                <animate attributeName="stroke-width" values="2;4;2" dur="0.3s" repeatCount="indefinite" />
              )}
            </rect>
            <text x={70} y={52} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill={nodeStateColor(currentInfo.nodeA)}>
              Node A
            </text>
            <text x={70} y={68} textAnchor="middle" fontSize={8} fontFamily="var(--eng-font)" fill={nodeStateColor(currentInfo.nodeA)}>
              {currentInfo.nodeA}
            </text>
            {/* Connection line */}
            <line x1={70} y1={80} x2={70} y2={100} stroke={nodeStateColor(currentInfo.nodeA)} strokeWidth={2} />
            {/* Transmission animation */}
            {(currentInfo.nodeA === "transmitting" || currentInfo.nodeA === "rts") && (
              <circle cx={70} cy={95} r={4} fill={nodeStateColor(currentInfo.nodeA)}>
                <animate attributeName="cy" values="80;100" dur="0.5s" repeatCount="indefinite" />
                <animate attributeName="r" values="3;5;3" dur="0.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>

          {/* Node B */}
          <g>
            <rect x={SVG_W - 110} y={30} width={80} height={50} rx={8} fill={`${nodeStateColor(currentInfo.nodeB)}15`} stroke={nodeStateColor(currentInfo.nodeB)} strokeWidth={2}>
              {currentInfo.nodeB === "collision" && (
                <animate attributeName="stroke-width" values="2;4;2" dur="0.3s" repeatCount="indefinite" />
              )}
            </rect>
            <text x={SVG_W - 70} y={52} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill={nodeStateColor(currentInfo.nodeB)}>
              Node B
            </text>
            <text x={SVG_W - 70} y={68} textAnchor="middle" fontSize={8} fontFamily="var(--eng-font)" fill={nodeStateColor(currentInfo.nodeB)}>
              {currentInfo.nodeB}
            </text>
            <line x1={SVG_W - 70} y1={80} x2={SVG_W - 70} y2={100} stroke={nodeStateColor(currentInfo.nodeB)} strokeWidth={2} />
            {currentInfo.nodeB === "transmitting" && (
              <circle cx={SVG_W - 70} cy={95} r={4} fill={nodeStateColor(currentInfo.nodeB)}>
                <animate attributeName="cy" values="80;100" dur="0.5s" repeatCount="indefinite" />
              </circle>
            )}
          </g>

          {/* Receiver (for CA) */}
          {protocol === "ca" && (
            <g>
              <rect x={SVG_W / 2 - 40} y={30} width={80} height={50} rx={8} fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth={1.5} />
              <text x={SVG_W / 2} y={52} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-success)">
                AP/Receiver
              </text>
              <line x1={SVG_W / 2} y1={80} x2={SVG_W / 2} y2={100} stroke="var(--eng-success)" strokeWidth={1.5} />
            </g>
          )}

          {/* Collision sparks */}
          {currentInfo.channel === "collision" && (
            <g>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <circle
                  key={i}
                  cx={SVG_W / 2 + Math.cos(i * Math.PI / 3) * 20}
                  cy={112 + Math.sin(i * Math.PI / 3) * 12}
                  r={3}
                  fill="var(--eng-danger)"
                >
                  <animate attributeName="r" values="2;5;2" dur="0.4s" repeatCount="indefinite" begin={`${i * 0.06}s`} />
                  <animate attributeName="opacity" values="1;0.3;1" dur="0.4s" repeatCount="indefinite" begin={`${i * 0.06}s`} />
                </circle>
              ))}
            </g>
          )}

          {/* RTS/CTS/ACK labels */}
          {currentInfo.channel === "rts" && (
            <text x={SVG_W / 2} y={148} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-primary)">
              ← RTS (Request To Send) →
            </text>
          )}
          {currentInfo.channel === "cts" && (
            <text x={SVG_W / 2} y={148} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-success)">
              ← CTS (Clear To Send) →
            </text>
          )}
          {currentInfo.channel === "ack" && (
            <text x={SVG_W / 2} y={148} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-success)">
              ← ACK →
            </text>
          )}

          {/* Step progress */}
          <g>
            {Array.from({ length: totalSteps + 1 }, (_, i) => (
              <circle
                key={i}
                cx={80 + (i / totalSteps) * (SVG_W - 160)}
                cy={200}
                r={i <= step ? 6 : 4}
                fill={i <= step ? "var(--eng-primary)" : "var(--eng-border)"}
                style={{ transition: "all 0.3s" }}
              />
            ))}
            <line x1={80} y1={200} x2={80 + (step / totalSteps) * (SVG_W - 160)} y2={200} stroke="var(--eng-primary)" strokeWidth={2} />
          </g>

          {/* Current step description */}
          <text x={SVG_W / 2} y={235} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text)" fontWeight={500}>
            {currentInfo.label}
          </text>
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card-eng" style={{ padding: 14, borderLeft: protocol === "cd" ? "3px solid var(--eng-primary)" : undefined }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 6px" }}>
            CSMA/CD (Ethernet)
          </h4>
          <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 14, lineHeight: 1.8 }}>
            <li>Listen before transmit</li>
            <li>Detect collision during TX</li>
            <li>Send jam signal</li>
            <li>Binary exponential backoff</li>
          </ul>
        </div>
        <div className="card-eng" style={{ padding: 14, borderLeft: protocol === "ca" ? "3px solid var(--eng-primary)" : undefined }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 6px" }}>
            CSMA/CA (Wi-Fi)
          </h4>
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

/* ------------------------------------------------------------------ */
/*  Tab 3: Throughput Comparison                                      */
/* ------------------------------------------------------------------ */

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

  // Throughput as function of offered load G
  const protocols = [
    {
      name: "Pure ALOHA",
      color: "#ef4444",
      maxThroughput: 0.184,
      formula: (G: number) => G * Math.exp(-2 * G),
    },
    {
      name: "Slotted ALOHA",
      color: "#f59e0b",
      maxThroughput: 0.368,
      formula: (G: number) => G * Math.exp(-G),
    },
    {
      name: "CSMA (1-persistent)",
      color: "#6366f1",
      maxThroughput: 0.53,
      formula: (G: number) => Math.min(0.53, G * Math.exp(-G) * 1.5),
    },
    {
      name: "CSMA/CD",
      color: "#10b981",
      maxThroughput: 0.85,
      formula: (G: number) => {
        if (G < 0.1) return G * 0.9;
        const peak = 0.85;
        return peak * (1 - Math.exp(-2 * G)) * Math.exp(-0.3 * Math.max(0, G - 1));
      },
    },
  ];

  const graphW = 600;
  const graphH = 250;
  const padL = 60;
  const padB = 40;
  const padT = 20;
  const padR = 20;

  const plotW = graphW - padL - padR;
  const plotH = graphH - padT - padB;

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Throughput vs Offered Load
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        See how each MAC protocol&apos;s throughput (S) varies with offered load (G). Higher is better at each load level.
      </p>

      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox={`0 0 ${graphW} ${graphH}`} width="100%" style={{ display: "block" }}>
          {/* Grid */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
            const y = padT + (1 - v) * plotH;
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={padL + plotW} y2={y} stroke="var(--eng-border)" strokeWidth={0.5} />
                <text x={padL - 8} y={y + 4} textAnchor="end" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                  {(v * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Axes */}
          <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="var(--eng-text-muted)" strokeWidth={1.5} />
          <line x1={padL} y1={padT + plotH} x2={padL + plotW} y2={padT + plotH} stroke="var(--eng-text-muted)" strokeWidth={1.5} />

          {/* X-axis labels */}
          {[0, 1, 2, 3, 4, 5].map((v) => {
            const x = padL + (v / 5) * plotW;
            return (
              <text key={v} x={x} y={padT + plotH + 20} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                {v}
              </text>
            );
          })}

          <text x={padL + plotW / 2} y={graphH - 2} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            Offered Load (G)
          </text>
          <text x={12} y={padT + plotH / 2} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" transform={`rotate(-90, 12, ${padT + plotH / 2})`} textAnchor="middle">
            Throughput (S)
          </text>

          {/* Protocol curves */}
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
              <g key={proto.name}>
                <polyline
                  points={points.join(" ")}
                  fill="none"
                  stroke={proto.color}
                  strokeWidth={isHovered ? 3 : 2}
                  opacity={hoverProtocol && !isHovered ? 0.3 : 1}
                  style={{ transition: "opacity 0.3s, stroke-width 0.3s" }}
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex gap-4 flex-wrap justify-center" style={{ marginTop: 12 }}>
          {protocols.map((proto) => (
            <div
              key={proto.name}
              className="flex items-center gap-2"
              style={{ cursor: "pointer" }}
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
        <strong>Key Takeaway:</strong> As protocols get smarter (sensing before transmitting, detecting collisions), throughput improves dramatically.
        CSMA/CD achieves the highest utilization by stopping collisions early.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz Questions                                                     */
/* ------------------------------------------------------------------ */

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
    explanation: "In wireless, a transmitting node's own signal overwhelms incoming signals, making collision detection impossible. This is the 'hidden terminal' problem.",
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
    explanation: "RTS/CTS allows the sender to reserve the channel. All nodes hearing CTS set their NAV timer and defer transmission, avoiding hidden terminal collisions.",
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
    explanation: "By synchronizing transmissions to slot boundaries, the vulnerable period is halved from 2T to T, doubling maximum throughput from 1/(2e) to 1/e.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs Definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "aloha",
    label: "ALOHA",
    icon: <Radio className="w-4 h-4" />,
    content: <ALOHATab />,
  },
  {
    id: "csma",
    label: "CSMA",
    icon: <Wifi className="w-4 h-4" />,
    content: <CSMATab />,
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

export default function CN_L2_MACProtocolsActivity() {
  return (
    <EngineeringLessonShell
      title="Medium Access Control Protocols"
      level={2}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Ethernet & LAN Standards"
      gateRelevance="2-3 marks"
      placementRelevance="Low"
    />
  );
}
