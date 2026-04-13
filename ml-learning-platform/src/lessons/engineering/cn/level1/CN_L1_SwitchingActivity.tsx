"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Radio,
  BarChart3,
  CheckCircle2,
  XCircle,
  Play,
  Pause,
  RotateCcw,
  Zap,
  ArrowRight,
  Settings,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Shared Styles                                                      */
/* ================================================================== */

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--eng-font)",
  fontWeight: 700,
  fontSize: "1.15rem",
  color: "var(--eng-text)",
  margin: "0 0 12px",
};

const sectionDesc: React.CSSProperties = {
  fontFamily: "var(--eng-font)",
  fontSize: "0.9rem",
  color: "var(--eng-text-muted)",
  margin: "0 0 20px",
  lineHeight: 1.6,
};

/* ================================================================== */
/*  Switching Type Data                                                */
/* ================================================================== */

type SwitchingType = "circuit" | "message" | "packet";

interface SwitchInfo {
  id: SwitchingType;
  label: string;
  color: string;
  description: string;
  pros: string[];
  cons: string[];
  example: string;
}

const SWITCHING_TYPES: SwitchInfo[] = [
  {
    id: "circuit",
    label: "Circuit Switching",
    color: "#f59e0b",
    description:
      "A dedicated communication path is established between sender and receiver for the entire duration of communication. The path remains reserved even during silence. Used in traditional telephone networks.",
    pros: ["Guaranteed bandwidth", "No congestion once connected", "Low and consistent latency"],
    cons: ["Wastes bandwidth during silence", "Setup time required", "Expensive for data communication"],
    example: "Traditional landline phone calls (PSTN)",
  },
  {
    id: "message",
    label: "Message Switching",
    color: "#8b5cf6",
    description:
      "The entire message is sent as a complete unit from node to node (store-and-forward). Each intermediate node stores the full message before forwarding it. No dedicated path is established.",
    pros: ["No dedicated path needed", "Efficient line sharing", "Message priority possible"],
    cons: ["High latency (store-and-forward delay)", "Requires large storage at nodes", "Not suitable for real-time"],
    example: "Email systems, early telegraph networks",
  },
  {
    id: "packet",
    label: "Packet Switching",
    color: "#3b82f6",
    description:
      "Messages are broken into small packets. Each packet can take a different route and is reassembled at the destination. This is the foundation of the modern Internet.",
    pros: ["Efficient bandwidth usage", "Fault-tolerant (packets reroute)", "Suitable for bursty data"],
    cons: ["Packet reordering needed", "Variable delay (jitter)", "Overhead from packet headers"],
    example: "The Internet, VoIP, streaming",
  },
];

/* ================================================================== */
/*  TAB 1 — Switching Visualizer                                       */
/* ================================================================== */

function SwitchingVisualizer() {
  const [selected, setSelected] = useState<SwitchingType>("circuit");
  const [animStep, setAnimStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const animRef = useRef<number | null>(null);

  const info = SWITCHING_TYPES.find((s) => s.id === selected)!;

  // Nodes: sender -> 3 intermediate switches -> receiver
  const nodes = [
    { x: 50, y: 150, label: "Sender" },
    { x: 170, y: 80, label: "Switch A" },
    { x: 290, y: 150, label: "Switch B" },
    { x: 170, y: 220, label: "Switch C" },
    { x: 410, y: 80, label: "Switch D" },
    { x: 510, y: 150, label: "Receiver" },
  ];

  // Paths for different switching types
  const circuitPath = [0, 1, 2, 4, 5]; // dedicated golden path
  const messagePath = [0, 1, 2, 4, 5]; // same path, store-and-forward
  const packetPaths = [
    [0, 1, 4, 5], // packet 1
    [0, 1, 2, 4, 5], // packet 2
    [0, 3, 2, 4, 5], // packet 3
  ];

  // All possible links
  const allLinks: [number, number][] = [
    [0, 1], [0, 3], [1, 2], [1, 4], [2, 4], [3, 2], [4, 5],
  ];

  useEffect(() => {
    setAnimStep(0);
  }, [selected]);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimStep((s) => (s + 1) % 200);
    }, 30);
    return () => clearInterval(interval);
  }, [isPlaying]);

  function getActivePath(): number[][] {
    if (selected === "circuit") return [circuitPath];
    if (selected === "message") return [messagePath];
    return packetPaths;
  }

  const activePaths = getActivePath();

  // For circuit: highlight the dedicated path
  function isLinkOnPath(a: number, b: number): boolean {
    for (const path of activePaths) {
      for (let i = 0; i < path.length - 1; i++) {
        if ((path[i] === a && path[i + 1] === b) || (path[i] === b && path[i + 1] === a)) return true;
      }
    }
    return false;
  }

  // Packet positions along their paths
  function getPacketPosition(pathIdx: number): { x: number; y: number; visible: boolean } {
    const path = activePaths[pathIdx];
    const totalSegments = path.length - 1;
    let progress: number;

    if (selected === "circuit") {
      // Continuous flow
      progress = (animStep % 100) / 100;
    } else if (selected === "message") {
      // Store and forward: step by step with pauses
      const segDuration = 40; // frames per segment
      const segIdx = Math.floor(animStep / segDuration) % totalSegments;
      const segProgress = (animStep % segDuration) / segDuration;
      progress = (segIdx + segProgress) / totalSegments;
    } else {
      // Packets: offset by pathIdx
      const offset = pathIdx * 30;
      progress = ((animStep + offset) % 120) / 120;
    }

    if (progress < 0 || progress > 1) return { x: 0, y: 0, visible: false };

    const segFloat = progress * totalSegments;
    const segIdx = Math.min(Math.floor(segFloat), totalSegments - 1);
    const segProgress = segFloat - segIdx;

    const from = nodes[path[segIdx]];
    const to = nodes[path[segIdx + 1]];

    return {
      x: from.x + (to.x - from.x) * segProgress,
      y: from.y + (to.y - from.y) * segProgress,
      visible: true,
    };
  }

  const packetColors = ["#3b82f6", "#10b981", "#f59e0b"];

  return (
    <div>
      <h3 style={sectionTitle}>Switching Techniques</h3>
      <p style={sectionDesc}>
        See how data travels through the network using different switching methods. Watch the animated comparison.
      </p>

      {/* Selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {SWITCHING_TYPES.map((s) => (
          <button
            key={s.id}
            onClick={() => { setSelected(s.id); setIsPlaying(true); }}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: selected === s.id ? `2px solid ${s.color}` : "1.5px solid var(--eng-border)",
              background: selected === s.id ? `${s.color}11` : "var(--eng-surface)",
              color: selected === s.id ? s.color : "var(--eng-text)",
              fontFamily: "var(--eng-font)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="btn-eng-outline"
          style={{ fontSize: "0.82rem", marginLeft: "auto" }}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* SVG Visualization */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 560 300" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <filter id="switchGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {/* Circuit switching: golden glow on dedicated path */}
            <filter id="goldGlow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="560" height="300" fill="#fafbfd" />

          {/* Title */}
          <text x="280" y="22" textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", fontWeight: 700 }}>
            {info.label}
          </text>

          {/* All possible links (faded) */}
          {allLinks.map(([a, b], i) => {
            const nA = nodes[a];
            const nB = nodes[b];
            const onPath = isLinkOnPath(a, b);

            return (
              <g key={`link-${i}`}>
                <line
                  x1={nA.x} y1={nA.y}
                  x2={nB.x} y2={nB.y}
                  stroke={onPath ? info.color : "#e2e8f0"}
                  strokeWidth={onPath ? (selected === "circuit" ? 4 : 2.5) : 1}
                  strokeOpacity={onPath ? (selected === "circuit" ? 0.5 : 0.35) : 0.6}
                  style={{ transition: "all 0.3s ease" }}
                />
                {/* Golden glow for circuit switching */}
                {selected === "circuit" && onPath && (
                  <line
                    x1={nA.x} y1={nA.y}
                    x2={nB.x} y2={nB.y}
                    stroke="#f59e0b"
                    strokeWidth="6"
                    strokeOpacity="0.15"
                    filter="url(#goldGlow)"
                  />
                )}
              </g>
            );
          })}

          {/* Animated data flow line for circuit switching */}
          {selected === "circuit" && (
            <g>
              {circuitPath.slice(0, -1).map((nodeIdx, i) => {
                const from = nodes[nodeIdx];
                const to = nodes[circuitPath[i + 1]];
                return (
                  <line
                    key={`circuit-flow-${i}`}
                    x1={from.x} y1={from.y}
                    x2={to.x} y2={to.y}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="8 4"
                    className="eng-packet-flow"
                  />
                );
              })}
            </g>
          )}

          {/* Animated packets */}
          {activePaths.map((_, pathIdx) => {
            const pos = getPacketPosition(pathIdx);
            if (!pos.visible) return null;

            if (selected === "circuit") {
              // Continuous data flow indicator
              return (
                <circle
                  key={`pkt-${pathIdx}`}
                  cx={pos.x} cy={pos.y}
                  r="6"
                  fill="#f59e0b"
                  filter="url(#goldGlow)"
                >
                  <animate attributeName="opacity" values="1;0.6;1" dur="0.8s" repeatCount="indefinite" />
                </circle>
              );
            }

            if (selected === "message") {
              // Larger message block
              return (
                <g key={`pkt-${pathIdx}`}>
                  <rect
                    x={pos.x - 14} y={pos.y - 8}
                    width="28" height="16"
                    rx="4"
                    fill="#8b5cf6"
                    filter="url(#switchGlow)"
                  />
                  <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--eng-font)", fontSize: "0.45rem", fontWeight: 700 }}>
                    MSG
                  </text>
                </g>
              );
            }

            // Packet switching: small colored packets
            const pktColor = packetColors[pathIdx % packetColors.length];
            return (
              <g key={`pkt-${pathIdx}`}>
                <rect
                  x={pos.x - 10} y={pos.y - 6}
                  width="20" height="12"
                  rx="3"
                  fill={pktColor}
                  filter="url(#switchGlow)"
                />
                <text x={pos.x} y={pos.y + 3} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--eng-font)", fontSize: "0.4rem", fontWeight: 700 }}>
                  P{pathIdx + 1}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n, i) => {
            const isEndpoint = i === 0 || i === nodes.length - 1;
            return (
              <g key={`node-${i}`}>
                <circle
                  cx={n.x} cy={n.y}
                  r={isEndpoint ? 20 : 14}
                  fill={isEndpoint ? `${info.color}15` : "var(--eng-surface)"}
                  stroke={isEndpoint ? info.color : "var(--eng-border)"}
                  strokeWidth={isEndpoint ? 2 : 1.5}
                />
                {isEndpoint ? (
                  // Sender/Receiver icons
                  <>
                    <rect x={n.x - 8} y={n.y - 6} width="16" height="12" rx="2" fill="none" stroke={info.color} strokeWidth="1.3" />
                    <line x1={n.x - 10} y1={n.y + 8} x2={n.x + 10} y2={n.y + 8} stroke={info.color} strokeWidth="1" />
                  </>
                ) : (
                  // Switch icon
                  <>
                    <rect x={n.x - 7} y={n.y - 4} width="14" height="4" rx="1" fill="none" stroke="var(--eng-text-muted)" strokeWidth="1" />
                    <rect x={n.x - 7} y={n.y + 1} width="14" height="4" rx="1" fill="none" stroke="var(--eng-text-muted)" strokeWidth="1" />
                  </>
                )}
                <text
                  x={n.x} y={n.y + (isEndpoint ? 35 : 28)}
                  textAnchor="middle"
                  fill="var(--eng-text)"
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.58rem", fontWeight: isEndpoint ? 600 : 400 }}
                >
                  {n.label}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          {selected === "packet" && (
            <g>
              {packetPaths.map((_, i) => (
                <g key={i}>
                  <rect x={170 + i * 70} y="272" width="14" height="10" rx="2" fill={packetColors[i]} />
                  <text x={190 + i * 70} y="280" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem" }}>
                    Packet {i + 1}
                  </text>
                </g>
              ))}
            </g>
          )}
          {selected === "circuit" && (
            <text x="280" y="280" textAnchor="middle" fill="#f59e0b" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontStyle: "italic" }}>
              Dedicated path glows gold - reserved for entire communication
            </text>
          )}
          {selected === "message" && (
            <text x="280" y="280" textAnchor="middle" fill="#8b5cf6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontStyle: "italic" }}>
              Entire message stored at each hop before forwarding
            </text>
          )}
        </svg>
      </div>

      {/* Info card */}
      <div className="card-eng eng-fadeIn" key={selected} style={{ padding: 20, borderLeft: `4px solid ${info.color}` }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", color: "var(--eng-text)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {info.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 12 }}>
          <div>
            <h5 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.82rem", color: "var(--eng-success)", margin: "0 0 6px" }}>Advantages</h5>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {info.pros.map((p, i) => (
                <li key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-success)" }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.82rem", color: "var(--eng-danger)", margin: "0 0 6px" }}>Disadvantages</h5>
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {info.cons.map((c, i) => (
                <li key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-danger)" }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="info-eng" style={{ background: `${info.color}08`, borderLeftColor: info.color }}>
          <p style={{ margin: 0, fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)" }}>
            <strong>Real-world example:</strong> {info.example}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 — Timeline Comparison                                        */
/* ================================================================== */

function TimelineComparison() {
  const [messageSize, setMessageSize] = useState(4); // in "units"
  const [linkSpeed, setLinkSpeed] = useState(2); // units per tick
  const [hops, setHops] = useState(3);
  const [animProgress, setAnimProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const setupTime = 2; // for circuit switching
  const packetSize = 1; // each packet is 1 unit

  // Calculate total times
  const circuitTime = setupTime + Math.ceil(messageSize / linkSpeed) + hops; // setup + transmit + propagation
  const messageTime = hops * (Math.ceil(messageSize / linkSpeed) + 1); // store-forward at each hop
  const packetCount = messageSize;
  const packetTransTime = Math.ceil(packetSize / linkSpeed);
  const packetTime = packetTransTime * packetCount + (hops - 1) * packetTransTime + hops; // pipelining

  const maxTime = Math.max(circuitTime, messageTime, packetTime);

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setAnimProgress((p) => {
        if (p >= 100) { setIsPlaying(false); return 100; }
        return p + 1;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  function handleStart() {
    setAnimProgress(0);
    setIsPlaying(true);
  }

  const barHeight = 28;
  const svgHeight = 230;
  const barStartX = 140;
  const barMaxWidth = 370;

  function timeToX(t: number) {
    return barStartX + (t / maxTime) * barMaxWidth;
  }

  const animTime = (animProgress / 100) * maxTime;

  return (
    <div>
      <h3 style={sectionTitle}>Transmission Time Comparison</h3>
      <p style={sectionDesc}>
        Adjust the message size and link speed to see how each switching method performs. Click Play to watch the timeline animate.
      </p>

      {/* Controls */}
      <div className="card-eng" style={{ padding: 16, marginBottom: 20 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4, fontWeight: 600 }}>
              Message Size: {messageSize} units
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={messageSize}
              onChange={(e) => { setMessageSize(Number(e.target.value)); setAnimProgress(0); setIsPlaying(false); }}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4, fontWeight: 600 }}>
              Link Speed: {linkSpeed} units/tick
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={linkSpeed}
              onChange={(e) => { setLinkSpeed(Number(e.target.value)); setAnimProgress(0); setIsPlaying(false); }}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4, fontWeight: 600 }}>
              Hops: {hops}
            </label>
            <input
              type="range"
              min="1"
              max="6"
              value={hops}
              onChange={(e) => { setHops(Number(e.target.value)); setAnimProgress(0); setIsPlaying(false); }}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Play button */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button onClick={handleStart} className="btn-eng" style={{ fontSize: "0.82rem" }}>
          <Play className="w-3.5 h-3.5" /> {isPlaying ? "Restart" : "Play Animation"}
        </button>
        {isPlaying && (
          <button onClick={() => setIsPlaying(false)} className="btn-eng-outline" style={{ fontSize: "0.82rem" }}>
            <Pause className="w-3.5 h-3.5" /> Pause
          </button>
        )}
      </div>

      {/* SVG Timeline */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox={`0 0 560 ${svgHeight}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width="560" height={svgHeight} fill="#fafbfd" />

          {/* Time axis */}
          <line x1={barStartX} y1={svgHeight - 30} x2={barStartX + barMaxWidth} y2={svgHeight - 30} stroke="var(--eng-border)" strokeWidth="1" />
          {Array.from({ length: 6 }, (_, i) => {
            const t = (maxTime * i) / 5;
            const x = timeToX(t);
            return (
              <g key={i}>
                <line x1={x} y1={svgHeight - 34} x2={x} y2={svgHeight - 26} stroke="var(--eng-text-muted)" strokeWidth="0.5" />
                <text x={x} y={svgHeight - 16} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem" }}>
                  {Math.round(t)}
                </text>
              </g>
            );
          })}
          <text x={barStartX + barMaxWidth / 2} y={svgHeight - 4} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem" }}>
            Time (ticks)
          </text>

          {/* Circuit Switching bar */}
          <g>
            <text x="10" y="40" fill="#f59e0b" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 600 }}>Circuit</text>
            <text x="10" y="52" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem" }}>
              Total: {circuitTime} ticks
            </text>
            {/* Setup phase */}
            <rect
              x={barStartX} y={30}
              width={Math.min(timeToX(Math.min(setupTime, animTime)) - barStartX, timeToX(setupTime) - barStartX)}
              height={barHeight}
              rx="4"
              fill="#f59e0b55"
              stroke="#f59e0b"
              strokeWidth="0.5"
            />
            {animTime >= setupTime && (
              <text x={barStartX + (timeToX(setupTime) - barStartX) / 2} y="48" textAnchor="middle" fill="#92400e" style={{ fontFamily: "var(--eng-font)", fontSize: "0.45rem", fontWeight: 600 }}>
                Setup
              </text>
            )}
            {/* Transfer phase */}
            {animTime > setupTime && (
              <rect
                x={timeToX(setupTime)} y={30}
                width={Math.min(timeToX(Math.min(circuitTime, animTime)) - timeToX(setupTime), timeToX(circuitTime) - timeToX(setupTime))}
                height={barHeight}
                rx="4"
                fill="#f59e0b"
                style={{ transition: "width 0.05s linear" }}
              />
            )}
            {animTime >= circuitTime && (
              <text x={timeToX(circuitTime) + 5} y="48" fill="#f59e0b" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", fontWeight: 700 }}>
                Done!
              </text>
            )}
          </g>

          {/* Message Switching bar */}
          <g>
            <text x="10" y="100" fill="#8b5cf6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 600 }}>Message</text>
            <text x="10" y="112" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem" }}>
              Total: {messageTime} ticks
            </text>
            {/* Progressive blocks per hop */}
            {Array.from({ length: hops }, (_, h) => {
              const hopStart = h * (Math.ceil(messageSize / linkSpeed) + 1);
              const hopEnd = hopStart + Math.ceil(messageSize / linkSpeed);
              const barX = timeToX(hopStart);
              const barW = timeToX(Math.min(hopEnd, animTime)) - barX;
              if (animTime < hopStart) return null;
              return (
                <rect
                  key={h}
                  x={barX} y={90}
                  width={Math.max(0, barW)}
                  height={barHeight}
                  rx="4"
                  fill={h % 2 === 0 ? "#8b5cf6" : "#a78bfa"}
                />
              );
            })}
            {animTime >= messageTime && (
              <text x={timeToX(messageTime) + 5} y="108" fill="#8b5cf6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", fontWeight: 700 }}>
                Done!
              </text>
            )}
          </g>

          {/* Packet Switching bar */}
          <g>
            <text x="10" y="160" fill="#3b82f6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 600 }}>Packet</text>
            <text x="10" y="172" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem" }}>
              Total: {packetTime} ticks
            </text>
            {/* Show pipelined packets */}
            {Array.from({ length: packetCount }, (_, pi) => {
              const pktStart = pi * packetTransTime;
              const pktEnd = pktStart + packetTransTime * hops + hops;
              const barX = timeToX(pktStart);
              const barW = timeToX(Math.min(pktEnd, animTime)) - barX;
              if (animTime < pktStart) return null;
              const colors = ["#3b82f6", "#60a5fa", "#93c5fd", "#2563eb", "#1d4ed8"];
              return (
                <rect
                  key={pi}
                  x={barX} y={150}
                  width={Math.max(0, barW)}
                  height={barHeight / 2}
                  rx="2"
                  fill={colors[pi % colors.length]}
                  opacity="0.8"
                />
              );
            })}
            {animTime >= packetTime && (
              <text x={timeToX(packetTime) + 5} y="168" fill="#3b82f6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.5rem", fontWeight: 700 }}>
                Done!
              </text>
            )}
          </g>

          {/* Current time indicator */}
          {animProgress > 0 && (
            <line
              x1={timeToX(animTime)} y1="25"
              x2={timeToX(animTime)} y2={svgHeight - 35}
              stroke="var(--eng-danger)"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
          )}
        </svg>
      </div>

      {/* Results summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Circuit", time: circuitTime, color: "#f59e0b" },
          { label: "Message", time: messageTime, color: "#8b5cf6" },
          { label: "Packet", time: packetTime, color: "#3b82f6" },
        ].map((item) => {
          const isFastest = item.time === Math.min(circuitTime, messageTime, packetTime);
          return (
            <div
              key={item.label}
              className="card-eng"
              style={{
                padding: "12px 16px",
                textAlign: "center",
                borderColor: isFastest ? item.color : "var(--eng-border)",
                borderWidth: isFastest ? 2 : 1,
              }}
            >
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.72rem", color: "var(--eng-text-muted)", marginBottom: 4, fontWeight: 600 }}>
                {item.label}
              </div>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "1.2rem", color: item.color, fontWeight: 700 }}>
                {item.time}
              </div>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)" }}>
                ticks
              </div>
              {isFastest && (
                <span className="tag-eng" style={{ background: `${item.color}15`, color: item.color, marginTop: 6, display: "inline-block" }}>
                  Fastest
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 — Practice: Choose the Right Switching                       */
/* ================================================================== */

interface PracticeScenario {
  id: number;
  description: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const PRACTICE_SCENARIOS: PracticeScenario[] = [
  {
    id: 1,
    description: "A real-time voice call between two people needs consistent quality with no interruptions.",
    options: ["Circuit Switching", "Message Switching", "Packet Switching"],
    correctIndex: 0,
    explanation: "Circuit switching is ideal for real-time voice calls because it provides a dedicated path with guaranteed bandwidth and consistent latency — just like traditional telephone networks.",
  },
  {
    id: 2,
    description: "You want to send a large email with attachments. Speed is not critical, but reliability is.",
    options: ["Circuit Switching", "Message Switching", "Packet Switching"],
    correctIndex: 2,
    explanation: "Packet switching is best for email. The message is broken into packets, each routed efficiently. TCP ensures reliability with retransmission of lost packets.",
  },
  {
    id: 3,
    description: "A telegram office needs to forward complete telegrams to the next city, one at a time.",
    options: ["Circuit Switching", "Message Switching", "Packet Switching"],
    correctIndex: 1,
    explanation: "This is a classic message switching scenario — the store-and-forward approach where each office stores the complete telegram before forwarding it to the next.",
  },
  {
    id: 4,
    description: "Millions of users browse websites simultaneously, with bursty traffic patterns.",
    options: ["Circuit Switching", "Message Switching", "Packet Switching"],
    correctIndex: 2,
    explanation: "Packet switching handles bursty web traffic efficiently. Bandwidth is shared dynamically — no resources are wasted during idle periods between requests.",
  },
  {
    id: 5,
    description: "A video conference between 2 offices requires low latency and dedicated bandwidth for 1 hour.",
    options: ["Circuit Switching", "Message Switching", "Packet Switching"],
    correctIndex: 0,
    explanation: "For a long, continuous video conference requiring consistent quality, circuit switching (or virtual circuit) provides dedicated bandwidth with predictable low latency.",
  },
];

function PracticeScenarios() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = PRACTICE_SCENARIOS[currentIdx];

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if (idx === scenario.correctIndex) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentIdx < PRACTICE_SCENARIOS.length - 1) {
      setCurrentIdx((c) => c + 1);
      setSelectedOption(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }

  function handleReset() {
    setCurrentIdx(0);
    setSelectedOption(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }

  if (finished) {
    const pct = Math.round((score / PRACTICE_SCENARIOS.length) * 100);
    return (
      <div className="card-eng p-8 text-center eng-fadeIn" style={{ maxWidth: 500, margin: "0 auto" }}>
        <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--eng-success)", marginBottom: 12 }} />
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          Practice Complete!
        </h3>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px" }}>
          You scored <strong>{score}/{PRACTICE_SCENARIOS.length}</strong> ({pct}%)
        </p>
        <button onClick={handleReset} className="btn-eng">Try Again</button>
      </div>
    );
  }

  const switchColors = ["#f59e0b", "#8b5cf6", "#3b82f6"];

  return (
    <div>
      <h3 style={sectionTitle}>Choose the Best Switching Method</h3>
      <p style={sectionDesc}>
        Read each scenario and pick the most suitable switching technique. Think about latency, bandwidth, and traffic patterns.
      </p>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
            Scenario {currentIdx + 1} of {PRACTICE_SCENARIOS.length}
          </span>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Score: {score}
          </span>
        </div>
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(currentIdx / PRACTICE_SCENARIOS.length) * 100}%`, height: "100%", background: "var(--eng-primary)", borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
      </div>

      <div className="card-eng eng-fadeIn" key={currentIdx} style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
        <div style={{ background: "#f8fafc", borderRadius: 8, padding: "16px 20px", marginBottom: 20, borderLeft: "3px solid var(--eng-primary)" }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)", lineHeight: 1.6, margin: 0 }}>
            {scenario.description}
          </p>
        </div>

        <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
          {scenario.options.map((opt, idx) => {
            const isCorrect = idx === scenario.correctIndex;
            const isSelected = idx === selectedOption;
            let bg = "var(--eng-surface)";
            let border = `1.5px solid ${switchColors[idx]}33`;
            let color = "var(--eng-text)";

            if (answered) {
              if (isCorrect) { bg = "rgba(16,185,129,0.1)"; border = "2px solid var(--eng-success)"; color = "#065f46"; }
              else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "2px solid var(--eng-danger)"; color = "#991b1b"; }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                style={{
                  padding: "10px 20px",
                  borderRadius: 8,
                  background: bg,
                  border,
                  color,
                  fontFamily: "var(--eng-font)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: answered ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  flex: "1 1 auto",
                  textAlign: "center",
                }}
              >
                {opt}
                {answered && isCorrect && <CheckCircle2 className="w-4 h-4 inline ml-2" />}
                {answered && isSelected && !isCorrect && <XCircle className="w-4 h-4 inline ml-2" />}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="info-eng eng-fadeIn" style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6 }}>
              {scenario.explanation}
            </p>
          </div>
        )}

        {answered && (
          <button onClick={handleNext} className="btn-eng" style={{ width: "100%" }}>
            {currentIdx < PRACTICE_SCENARIOS.length - 1 ? "Next Scenario" : "See Results"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  QUIZ                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "In circuit switching, what happens to the dedicated path when no data is being transmitted?",
    options: [
      "It is released for other users",
      "It remains reserved (wasted bandwidth)",
      "It automatically switches to packet mode",
      "Other users can share it dynamically",
    ],
    correctIndex: 1,
    explanation: "In circuit switching, the dedicated path remains reserved for the entire duration of the connection, even during silent periods. This wastes bandwidth.",
  },
  {
    question: "Packet switching is the basis of which major network?",
    options: ["PSTN (telephone)", "The Internet", "Broadcast TV", "AM/FM Radio"],
    correctIndex: 1,
    explanation: "The Internet is based on packet switching. Data is broken into packets that can take different routes and are reassembled at the destination.",
  },
  {
    question: "What is the main disadvantage of message switching?",
    options: [
      "No error detection",
      "Requires dedicated path",
      "High latency due to store-and-forward at each hop",
      "Cannot handle large messages",
    ],
    correctIndex: 2,
    explanation: "Message switching has high latency because each intermediate node must store the entire message before forwarding it to the next node.",
  },
  {
    question: "In packet switching, what problem occurs when packets take different routes?",
    options: [
      "Packets are always lost",
      "Packets may arrive out of order",
      "The connection is dropped",
      "Bandwidth is wasted",
    ],
    correctIndex: 1,
    explanation: "Since packets can take different routes, they may arrive at the destination out of order. The Transport layer (TCP) handles reordering.",
  },
  {
    question: "A virtual circuit in packet switching differs from circuit switching because:",
    options: [
      "It uses a physical dedicated wire",
      "It establishes a logical path but shares bandwidth",
      "It has no path at all",
      "It only works for voice calls",
    ],
    correctIndex: 1,
    explanation: "A virtual circuit establishes a logical (predetermined) path for packets but shares the bandwidth with other traffic. It combines benefits of both circuit and packet switching.",
  },
];

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export default function CN_L1_SwitchingActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "explore",
      label: "Explore",
      icon: <Radio className="w-4 h-4" />,
      content: <SwitchingVisualizer />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <TimelineComparison />,
    },
    {
      id: "practice",
      label: "Practice",
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: <PracticeScenarios />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Switching Techniques"
      level={1}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Physical Layer — Signals"
      gateRelevance="2-3 marks"
      placementRelevance="Low"
    />
  );
}
