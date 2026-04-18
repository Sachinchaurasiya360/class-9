"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Globe,
  Zap,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Scissors,
  Play,
  Pause,
  Gauge,
  Info,
  Target,
  Trophy,
  AlertCircle,
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
/*  Topology Definitions                                               */
/* ================================================================== */

type TopologyId = "bus" | "star" | "ring" | "mesh";

interface TopologyInfo {
  id: TopologyId;
  label: string;
  color: string;
  soft: string;
  tagline: string;
  description: string;
  bestFor: string;
  cost: number;           // 1 (cheap) – 5 (expensive)
  scalability: number;    // 1 – 5
  faultTolerance: number; // 1 – 5
  pros: string[];
  cons: string[];
}

const TOPOLOGIES: TopologyInfo[] = [
  {
    id: "bus",
    label: "Bus",
    color: "#3b82f6",
    soft: "#dbeafe",
    tagline: "One shared backbone for everyone",
    description: "All devices share a single central cable (backbone). Data travels in both directions along the bus. Terminators at each end absorb signals so they don't bounce back.",
    bestFor: "Very small, cheap networks",
    cost: 1,
    scalability: 2,
    faultTolerance: 1,
    pros: ["Simple to install", "Lowest cable cost", "Works well for tiny networks"],
    cons: ["Backbone break = entire network down", "Performance drops as devices grow", "Troubleshooting is painful"],
  },
  {
    id: "star",
    label: "Star",
    color: "#f59e0b",
    soft: "#fef3c7",
    tagline: "Everyone connects to one central brain",
    description: "All devices connect to a central hub or switch. Every message passes through the central node, which forwards it to the right destination. This is the most common topology in modern LANs.",
    bestFor: "Homes, offices, school labs",
    cost: 3,
    scalability: 4,
    faultTolerance: 3,
    pros: ["Easy to add or remove devices", "One broken link doesn't affect others", "Very easy to troubleshoot"],
    cons: ["Hub is a single point of failure", "More cable than bus", "Hub failure kills whole network"],
  },
  {
    id: "ring",
    label: "Ring",
    color: "#10b981",
    soft: "#d1fae5",
    tagline: "Data flows in a predictable loop",
    description: "Devices form a closed loop. Data travels in one direction around the ring. Each device has exactly two connections. A special 'token' frame controls who can transmit, so there are no collisions.",
    bestFor: "Deterministic industrial networks",
    cost: 2,
    scalability: 2,
    faultTolerance: 2,
    pros: ["Fair access for every device", "Zero collisions thanks to tokens", "Predictable, steady performance"],
    cons: ["One broken link can split the ring", "Hard to add or remove devices", "Slower - devices wait for the token"],
  },
  {
    id: "mesh",
    label: "Mesh",
    color: "#8b5cf6",
    soft: "#ede9fe",
    tagline: "Every node linked to every other",
    description: "Every device connects to every other device (full mesh) or to most others (partial mesh). This provides many redundant paths, so data can always route around failures.",
    bestFor: "Mission-critical backbones",
    cost: 5,
    scalability: 2,
    faultTolerance: 5,
    pros: ["Extremely fault-tolerant", "No single point of failure", "Many parallel paths for speed"],
    cons: ["Very expensive - lots of cable", "Complex to configure and manage", "Doesn't scale to many nodes"],
  },
];

/* ================================================================== */
/*  Helpers: Node positions for each topology                          */
/* ================================================================== */

function getNodePositions(topo: TopologyId, nodeCount: number): { x: number; y: number }[] {
  const cx = 280, cy = 155;
  switch (topo) {
    case "bus": {
      const spacing = 440 / (nodeCount + 1);
      return Array.from({ length: nodeCount }, (_, i) => ({
        x: 60 + spacing * (i + 1),
        y: cy,
      }));
    }
    case "star": {
      const r = 100;
      const center = { x: cx, y: cy };
      const outer = Array.from({ length: nodeCount - 1 }, (_, i) => {
        const angle = (2 * Math.PI * i) / (nodeCount - 1) - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
      return [center, ...outer];
    }
    case "ring": {
      const r = 100;
      return Array.from({ length: nodeCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
    }
    case "mesh": {
      const r = 105;
      return Array.from({ length: nodeCount }, (_, i) => {
        const angle = (2 * Math.PI * i) / nodeCount - Math.PI / 2;
        return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
      });
    }
  }
}

function getConnections(topo: TopologyId, nodeCount: number): [number, number][] {
  const conns: [number, number][] = [];
  switch (topo) {
    case "bus":
      for (let i = 0; i < nodeCount - 1; i++) conns.push([i, i + 1]);
      break;
    case "star":
      for (let i = 1; i < nodeCount; i++) conns.push([0, i]);
      break;
    case "ring":
      for (let i = 0; i < nodeCount; i++) conns.push([i, (i + 1) % nodeCount]);
      break;
    case "mesh":
      for (let i = 0; i < nodeCount; i++)
        for (let j = i + 1; j < nodeCount; j++) conns.push([i, j]);
      break;
  }
  return conns;
}

/* ================================================================== */
/*  TAB 1 - Topology Builder                                           */
/* ================================================================== */

function TopologyBuilder() {
  const [selected, setSelected] = useState<TopologyId>("bus");
  const [animPhase, setAnimPhase] = useState(0);
  const [packetStep, setPacketStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1);
  const [nodeCount, setNodeCount] = useState(6);

  useEffect(() => {
    setAnimPhase(0);
    const t1 = setTimeout(() => setAnimPhase(1), 80);
    const t2 = setTimeout(() => setAnimPhase(2), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [selected, nodeCount]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPacketStep((s) => (s + 1) % 600);
    }, Math.max(10, 35 / speedMult));
    return () => clearInterval(interval);
  }, [isPaused, speedMult]);

  const info = TOPOLOGIES.find((t) => t.id === selected)!;
  const nodes = getNodePositions(selected, nodeCount);
  const connections = getConnections(selected, nodeCount);

  const t01 = (packetStep % 100) / 100; // 0..1 fast cycle
  const tSlow = (packetStep % 300) / 300; // 0..1 slow cycle

  // Determine "active" nodes for pulse glow (topology-specific)
  function isNodeActive(i: number): boolean {
    if (selected === "bus") {
      // Active when packet passes node's x-position on backbone
      const pkt = 60 + (560 - 120) * t01;
      return Math.abs(pkt - nodes[i].x) < 30;
    }
    if (selected === "star") {
      // Hub always active; others active in sequence
      if (i === 0) return true;
      const step = Math.floor(tSlow * (nodeCount - 1));
      return i - 1 === step % (nodeCount - 1);
    }
    if (selected === "ring") {
      const step = Math.floor(tSlow * nodeCount);
      return i === step % nodeCount;
    }
    if (selected === "mesh") {
      return ((packetStep + i * 7) % 60) < 10;
    }
    return false;
  }

  return (
    <div>
      <h3 style={sectionTitle}>Topology Explorer</h3>
      <p style={sectionDesc}>
        Click a topology to see how devices connect. Watch data flow through the network and learn the tradeoffs.
      </p>

      {/* Topology selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 14 }}>
        {TOPOLOGIES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: selected === t.id ? `2px solid ${t.color}` : "1.5px solid var(--eng-border)",
              background: selected === t.id ? `${t.color}12` : "var(--eng-surface)",
              color: selected === t.id ? t.color : "var(--eng-text)",
              fontFamily: "var(--eng-font)",
              fontWeight: 700,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                background: t.color,
                display: "inline-block",
                opacity: selected === t.id ? 1 : 0.4,
              }}
            />
            {t.label}
          </button>
        ))}
      </div>

      {/* Animation controls */}
      <div
        className="card-eng"
        style={{
          padding: "10px 14px",
          marginBottom: 14,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div className="flex items-center gap-3" style={{ minWidth: 200 }}>
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--eng-text)",
              whiteSpace: "nowrap",
            }}
          >
            Nodes: <span style={{ color: info.color }}>{nodeCount}</span>
          </span>
          <input
            type="range"
            min={4}
            max={8}
            value={nodeCount}
            onChange={(e) => setNodeCount(Number(e.target.value))}
            style={{ flex: 1, accentColor: info.color, cursor: "pointer" }}
            aria-label="Number of nodes"
          />
        </div>

        <button
          onClick={() => setIsPaused((p) => !p)}
          className="btn-eng-outline"
          style={{
            fontSize: "0.75rem",
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {isPaused ? "Play" : "Pause"}
        </button>

        <div className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5" style={{ color: "var(--eng-text-muted)" }} />
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.7rem",
              color: "var(--eng-text-muted)",
              marginRight: 4,
            }}
          >
            Speed
          </span>
          {[0.5, 1, 2].map((s) => {
            const active = speedMult === s;
            return (
              <button
                key={s}
                onClick={() => setSpeedMult(s)}
                style={{
                  padding: "4px 10px",
                  borderRadius: 6,
                  border: active ? `1.5px solid ${info.color}` : "1px solid var(--eng-border)",
                  background: active ? `${info.color}15` : "var(--eng-surface)",
                  color: active ? info.color : "var(--eng-text-muted)",
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                {s}×
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG visualization */}
      <div
        className="card-eng"
        style={{
          padding: 0,
          overflow: "hidden",
          marginBottom: 20,
          position: "relative",
          background: `${info.soft}40`,
        }}
      >
        {/* Floating topology chip */}
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 14,
            zIndex: 2,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 12px",
            background: "#ffffff",
            border: `1px solid ${info.color}40`,
            borderRadius: 999,
            boxShadow: `0 4px 12px ${info.color}22`,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: info.color,
              display: "inline-block",
            }}
          >
          </span>
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.7rem",
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: info.color,
            }}
          >
            {info.label} Topology
          </span>
        </div>

        <svg viewBox="0 0 560 310" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <filter id="topoGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="topoGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="topoNodeGrad">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor={info.color} stopOpacity="0.1" />
            </radialGradient>
          </defs>
          <rect width="560" height="310" fill="url(#topoGrid)" />

          {/* ==================================================== */}
          {/*  BUS - animated backbone with broadcast ripples       */}
          {/* ==================================================== */}
          {selected === "bus" && (
            <g>
              {/* Terminator caps */}
              <rect x={36} y={nodes[0].y - 12} width={8} height={24} rx={2} fill={info.color} opacity={0.7} />
              <rect x={516} y={nodes[0].y - 12} width={8} height={24} rx={2} fill={info.color} opacity={0.7} />
              <text x={40} y={nodes[0].y + 32} textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: 700 }}>TERM</text>
              <text x={520} y={nodes[0].y + 32} textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: 700 }}>TERM</text>

              {/* Backbone cable */}
              <line x1={44} y1={nodes[0].y} x2={516} y2={nodes[0].y} stroke={info.color} strokeWidth={5} strokeOpacity={0.18} strokeLinecap="round" />
              {/* Flowing dashed overlay */}
              <line x1={44} y1={nodes[0].y} x2={516} y2={nodes[0].y} stroke={info.color} strokeWidth={2.5} strokeLinecap="round" strokeDasharray="10 8" opacity={0.55}>
                <animate attributeName="stroke-dashoffset" values="0;-36" dur={`${1.4 / speedMult}s`} repeatCount="indefinite" />
              </line>

              {/* Tap stubs to each node */}
              {nodes.map((n, i) => (
                <line key={`stub-${i}`} x1={n.x} y1={nodes[0].y} x2={n.x} y2={n.y - 14} stroke={info.color} strokeWidth={1.8} opacity={0.4} />
              ))}

              {/* Moving backbone packet */}
              {animPhase >= 2 && (
                <g>
                  <circle r={7} fill={info.color} filter="url(#topoGlow)">
                    <animateMotion dur={`${2.6 / speedMult}s`} repeatCount="indefinite" path={`M 44 ${nodes[0].y} L 516 ${nodes[0].y}`} />
                  </circle>
                  <circle r={3} fill="#ffffff">
                    <animateMotion dur={`${2.6 / speedMult}s`} repeatCount="indefinite" path={`M 44 ${nodes[0].y} L 516 ${nodes[0].y}`} />
                  </circle>
                </g>
              )}
            </g>
          )}

          {/* ==================================================== */}
          {/*  STAR - pulses in/out of central hub                  */}
          {/* ==================================================== */}
          {selected === "star" && (
            <g>
              {/* Rotating ring around hub */}
              <circle cx={nodes[0].x} cy={nodes[0].y} r={36} fill="none" stroke={info.color} strokeWidth={1.2} strokeDasharray="4 5" opacity={0.4}>
                <animateTransform attributeName="transform" type="rotate" from={`0 ${nodes[0].x} ${nodes[0].y}`} to={`360 ${nodes[0].x} ${nodes[0].y}`} dur={`${18 / speedMult}s`} repeatCount="indefinite" />
              </circle>

              {/* Packets along each spoke (staggered) */}
              {connections.map(([, b], i) => {
                const nB = nodes[b];
                const phase = (tSlow + i / connections.length) % 1;
                const outbound = phase < 0.5;
                const lp = outbound ? phase * 2 : (phase - 0.5) * 2;
                const x = outbound
                  ? nodes[0].x + (nB.x - nodes[0].x) * lp
                  : nB.x + (nodes[0].x - nB.x) * lp;
                const y = outbound
                  ? nodes[0].y + (nB.y - nodes[0].y) * lp
                  : nB.y + (nodes[0].y - nB.y) * lp;
                return (
                  <circle
                    key={`star-pkt-${i}`}
                    cx={x}
                    cy={y}
                    r={4}
                    fill={outbound ? info.color : "#10b981"}
                    opacity={0.9}
                    filter="url(#topoGlow)"
                  />
                );
              })}
            </g>
          )}

          {/* ==================================================== */}
          {/*  RING - token + data packet circulating               */}
          {/* ==================================================== */}
          {selected === "ring" && (() => {
            const ringPath = nodes.map((n, i) => `${i === 0 ? "M" : "L"} ${n.x} ${n.y}`).join(" ") + " Z";
            return (
              <g>
                {/* Directional arrows along segments */}
                {connections.map(([a, b], i) => {
                  const nA = nodes[a];
                  const nB = nodes[b];
                  const mx = (nA.x + nB.x) / 2;
                  const my = (nA.y + nB.y) / 2;
                  const dx = nB.x - nA.x;
                  const dy = nB.y - nA.y;
                  const len = Math.sqrt(dx * dx + dy * dy);
                  const ux = dx / len;
                  const uy = dy / len;
                  const size = 6;
                  return (
                    <polygon
                      key={`arrow-${i}`}
                      points={`${mx + ux * size},${my + uy * size} ${mx - ux * size - uy * size * 0.6},${my - uy * size + ux * size * 0.6} ${mx - ux * size + uy * size * 0.6},${my - uy * size - ux * size * 0.6}`}
                      fill={info.color}
                      opacity={0.5}
                    />
                  );
                })}

                {/* TOKEN (yellow) */}
                {animPhase >= 2 && (
                  <g>
                    <circle r={9} fill="#fbbf24" filter="url(#topoGlow)" opacity={0.95}>
                      <animateMotion dur={`${5 / speedMult}s`} repeatCount="indefinite" path={ringPath} />
                    </circle>
                    <text fill="#78350f" textAnchor="middle" dy={3} style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: 900 }}>
                      <animateMotion dur={`${5 / speedMult}s`} repeatCount="indefinite" path={ringPath} />
                      T
                    </text>
                  </g>
                )}

                {/* DATA following token */}
                {animPhase >= 2 && (
                  <circle r={5} fill={info.color} opacity={0.85}>
                    <animateMotion dur={`${5 / speedMult}s`} begin={`-${0.4 / speedMult}s`} repeatCount="indefinite" path={ringPath} />
                  </circle>
                )}
              </g>
            );
          })()}

          {/* ==================================================== */}
          {/*  MESH - parallel packets on multiple paths            */}
          {/* ==================================================== */}
          {selected === "mesh" && (
            <g>
              {connections.map(([a, b], i) => {
                // Animate a subset of packets (every 2nd connection) to avoid clutter
                if (i % 2 !== 0) return null;
                const nA = nodes[a];
                const nB = nodes[b];
                const phase = (t01 + i / connections.length) % 1;
                return (
                  <circle
                    key={`mesh-pkt-${i}`}
                    cx={nA.x + (nB.x - nA.x) * phase}
                    cy={nA.y + (nB.y - nA.y) * phase}
                    r={3.5}
                    fill={info.color}
                    opacity={0.8}
                    filter="url(#topoGlow)"
                  />
                );
              })}
            </g>
          )}

          {/* Connection lines (drawn after special bus, to render over stubs for ring/mesh/star) */}
          {selected !== "bus" &&
            connections.map(([a, b], i) => {
              const nA = nodes[a];
              const nB = nodes[b];
              return (
                <line
                  key={`conn-${i}`}
                  x1={nA.x}
                  y1={nA.y}
                  x2={animPhase >= 1 ? nB.x : nA.x}
                  y2={animPhase >= 1 ? nB.y : nA.y}
                  stroke={info.color}
                  strokeWidth={selected === "mesh" ? 1.3 : 2}
                  strokeOpacity={animPhase >= 1 ? (selected === "mesh" ? 0.25 : 0.45) : 0}
                  style={{ transition: "all 0.5s ease" }}
                />
              );
            })}

          {/* Device nodes */}
          {nodes.map((n, i) => {
            const isHub = selected === "star" && i === 0;
            const active = isNodeActive(i);
            return (
              <g
                key={`node-${i}`}
                style={{
                  opacity: animPhase >= 1 ? 1 : 0,
                  transform: animPhase >= 1 ? "scale(1)" : "scale(0)",
                  transformOrigin: `${n.x}px ${n.y}px`,
                  transition: `all 0.35s ease ${i * 0.06}s`,
                }}
              >
                {/* Active pulse ring */}
                {active && !isPaused && (
                  <circle cx={n.x} cy={n.y} r={isHub ? 30 : 22} fill="none" stroke={info.color} strokeWidth={1.5} opacity={0.5}>
                    <animate attributeName="r" values={`${isHub ? 22 : 18};${isHub ? 34 : 28}`} dur="0.9s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0" dur="0.9s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Drop shadow */}
                <circle cx={n.x + 1} cy={n.y + 2} r={isHub ? 22 : 16} fill={info.color} opacity={0.12} />
                {/* Main node */}
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isHub ? 22 : 16}
                  fill={active ? `${info.color}2a` : "url(#topoNodeGrad)"}
                  stroke={info.color}
                  strokeWidth={isHub ? 2.8 : 1.8}
                />
                {/* Icon */}
                {isHub ? (
                  <>
                    <rect x={n.x - 10} y={n.y - 7} width={20} height={6} rx={1} fill="none" stroke={info.color} strokeWidth={1.4} />
                    <circle cx={n.x + 7} cy={n.y - 4} r={1.2} fill={info.color} />
                    <rect x={n.x - 10} y={n.y + 1} width={20} height={6} rx={1} fill="none" stroke={info.color} strokeWidth={1.4} />
                    <circle cx={n.x + 7} cy={n.y + 4} r={1.2} fill={info.color} />
                    <text x={n.x} y={n.y + 40} textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.62rem", fontWeight: 800 }}>
                      Hub / Switch
                    </text>
                  </>
                ) : (
                  <>
                    <rect x={n.x - 7} y={n.y - 5} width={14} height={8} rx={1.5} fill="none" stroke={info.color} strokeWidth={1.4} />
                    <line x1={n.x - 9} y1={n.y + 5} x2={n.x + 9} y2={n.y + 5} stroke={info.color} strokeWidth={1.4} />
                    <text x={n.x} y={n.y + 30} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.58rem", fontWeight: 600 }}>
                      {selected === "star" ? `N${i}` : `N${i + 1}`}
                    </text>
                  </>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ==================================================== */}
      {/*  Info card - rich panel                               */}
      {/* ==================================================== */}
      <div
        className="card-eng eng-fadeIn"
        key={selected}
        style={{
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top ribbon */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: info.color,
          }}
        />

        {/* Header band */}
        <div
          style={{
            position: "relative",
            padding: "20px 22px 18px",
            background: info.soft,
            borderBottom: `1px dashed ${info.color}40`,
            overflow: "hidden",
          }}
        >
          {/* Rotating decorative ring */}
          <svg
            viewBox="0 0 120 120"
            style={{
              position: "absolute",
              top: -18,
              right: -18,
              width: 130,
              height: 130,
              opacity: 0.3,
              pointerEvents: "none",
            }}
          >
            <circle cx={60} cy={60} r={48} fill="none" stroke={info.color} strokeWidth={1.3} strokeDasharray="5 6">
              <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="28s" repeatCount="indefinite" />
            </circle>
            <circle cx={60} cy={60} r={32} fill="none" stroke={info.color} strokeWidth={1} strokeDasharray="3 5">
              <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="22s" repeatCount="indefinite" />
            </circle>
          </svg>

          <div className="flex items-center gap-4 flex-wrap" style={{ position: "relative", zIndex: 1 }}>
            {/* Mini shape preview */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#ffffff",
                border: `2px solid ${info.color}`,
                boxShadow: `0 8px 20px ${info.color}30`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <TopologyMiniShape id={selected} color={info.color} />
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: info.color,
                  marginBottom: 4,
                }}
              >
                {info.label} Topology
              </div>
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "var(--eng-text)",
                  lineHeight: 1.3,
                }}
              >
                {info.tagline}
              </div>
            </div>

            {/* Best-for pill */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "#ffffff",
                border: `1px solid ${info.color}40`,
                boxShadow: `0 4px 12px ${info.color}18`,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Target className="w-4 h-4" style={{ color: info.color }} />
              <div>
                <div
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.58rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--eng-text-muted)",
                    marginBottom: 2,
                  }}
                >
                  Best for
                </div>
                <div
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "var(--eng-text)",
                    lineHeight: 1,
                  }}
                >
                  {info.bestFor}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "18px 22px 20px" }}>
          <p
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.88rem",
              color: "var(--eng-text)",
              lineHeight: 1.65,
              margin: "0 0 18px",
            }}
          >
            {info.description}
          </p>

          {/* Metric bars */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 12,
              marginBottom: 18,
            }}
          >
            {[
              { label: "Cost", value: info.cost, invert: true },
              { label: "Scalability", value: info.scalability },
              { label: "Fault Tolerance", value: info.faultTolerance },
            ].map((m) => (
              <div
                key={m.label}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: `${info.color}08`,
                  border: `1px solid ${info.color}25`,
                }}
              >
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                  <span
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--eng-text-muted)",
                    }}
                  >
                    {m.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      color: info.color,
                    }}
                  >
                    {m.value}/5
                  </span>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: i < m.value ? info.color : `${info.color}20`,
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pros / Cons grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "#f0fdf4",
                border: "1px solid #86efac",
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#16a34a",
                    color: "#fff",
                  }}
                >
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <span
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    color: "#14532d",
                    textTransform: "uppercase",
                  }}
                >
                  Advantages
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {info.pros.map((p) => (
                  <li
                    key={p}
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.82rem",
                      color: "#14532d",
                      padding: "5px 0",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      lineHeight: 1.45,
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#16a34a", marginTop: 1 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                padding: "14px 16px",
                borderRadius: 12,
                background: "#fef2f2",
                border: "1px solid #fca5a5",
              }}
            >
              <div className="flex items-center gap-2" style={{ marginBottom: 10 }}>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    background: "#dc2626",
                    color: "#fff",
                  }}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                </div>
                <span
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                    color: "#7f1d1d",
                    textTransform: "uppercase",
                  }}
                >
                  Trade-offs
                </span>
              </div>
              <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                {info.cons.map((c) => (
                  <li
                    key={c}
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.82rem",
                      color: "#7f1d1d",
                      padding: "5px 0",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      lineHeight: 1.45,
                    }}
                  >
                    <XCircle className="w-4 h-4 shrink-0" style={{ color: "#dc2626", marginTop: 1 }} />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Mini shape preview shown in the info card header */
function TopologyMiniShape({ id, color }: { id: TopologyId; color: string }) {
  if (id === "bus") {
    return (
      <svg viewBox="0 0 50 40" width={44} height={36}>
        <line x1={4} y1={20} x2={46} y2={20} stroke={color} strokeWidth={2} />
        {[10, 20, 30, 40].map((x) => (
          <g key={x}>
            <line x1={x} y1={20} x2={x} y2={10} stroke={color} strokeWidth={1.2} />
            <circle cx={x} cy={7} r={3} fill="#fff" stroke={color} strokeWidth={1.4} />
          </g>
        ))}
      </svg>
    );
  }
  if (id === "star") {
    return (
      <svg viewBox="0 0 50 50" width={44} height={40}>
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x = 25 + Math.cos(rad) * 18;
          const y = 25 + Math.sin(rad) * 18;
          return (
            <g key={a}>
              <line x1={25} y1={25} x2={x} y2={y} stroke={color} strokeWidth={1.2} />
              <circle cx={x} cy={y} r={3} fill="#fff" stroke={color} strokeWidth={1.4} />
            </g>
          );
        })}
        <circle cx={25} cy={25} r={5} fill={color} />
      </svg>
    );
  }
  if (id === "ring") {
    return (
      <svg viewBox="0 0 50 50" width={44} height={40}>
        <circle cx={25} cy={25} r={18} fill="none" stroke={color} strokeWidth={1.4} />
        {[0, 60, 120, 180, 240, 300].map((a) => {
          const rad = (a * Math.PI) / 180;
          const x = 25 + Math.cos(rad) * 18;
          const y = 25 + Math.sin(rad) * 18;
          return <circle key={a} cx={x} cy={y} r={3} fill="#fff" stroke={color} strokeWidth={1.4} />;
        })}
      </svg>
    );
  }
  // mesh
  return (
    <svg viewBox="0 0 50 50" width={44} height={40}>
      {[0, 72, 144, 216, 288].map((a, i) => {
        const rad = (a * Math.PI) / 180;
        const x = 25 + Math.cos(rad) * 18;
        const y = 25 + Math.sin(rad) * 18;
        return (
          <g key={i}>
            {[0, 72, 144, 216, 288].map((b, j) => {
              if (j <= i) return null;
              const rad2 = (b * Math.PI) / 180;
              const x2 = 25 + Math.cos(rad2) * 18;
              const y2 = 25 + Math.sin(rad2) * 18;
              return <line key={j} x1={x} y1={y} x2={x2} y2={y2} stroke={color} strokeWidth={0.8} opacity={0.7} />;
            })}
          </g>
        );
      })}
      {[0, 72, 144, 216, 288].map((a) => {
        const rad = (a * Math.PI) / 180;
        const x = 25 + Math.cos(rad) * 18;
        const y = 25 + Math.sin(rad) * 18;
        return <circle key={a} cx={x} cy={y} r={3} fill="#fff" stroke={color} strokeWidth={1.4} />;
      })}
    </svg>
  );
}

/* ================================================================== */
/*  TAB 2 - Fault Simulation                                           */
/* ================================================================== */

function FaultSimulation() {
  const [topo, setTopo] = useState<TopologyId>("star");
  const nodeCount = 6;
  const [brokenLinks, setBrokenLinks] = useState<Set<string>>(new Set());
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const nodes = getNodePositions(topo, nodeCount);
  const connections = getConnections(topo, nodeCount);
  const info = TOPOLOGIES.find((t) => t.id === topo)!;

  useEffect(() => {
    setBrokenLinks(new Set());
  }, [topo]);

  function linkId(a: number, b: number) {
    return `${Math.min(a, b)}-${Math.max(a, b)}`;
  }

  function toggleLink(a: number, b: number) {
    const id = linkId(a, b);
    setBrokenLinks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // BFS to check connectivity from node 0
  const connected = useCallback(() => {
    const activeConns = connections.filter(([a, b]) => !brokenLinks.has(linkId(a, b)));
    const adj: Map<number, number[]> = new Map();
    for (let i = 0; i < nodeCount; i++) adj.set(i, []);
    for (const [a, b] of activeConns) {
      adj.get(a)!.push(b);
      adj.get(b)!.push(a);
    }
    const visited = new Set<number>();
    const queue = [0];
    visited.add(0);
    while (queue.length > 0) {
      const cur = queue.shift()!;
      for (const neighbor of adj.get(cur)!) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return visited;
  }, [connections, brokenLinks, nodeCount]);

  const connectedNodes = connected();
  const disconnectedCount = nodeCount - connectedNodes.size;

  return (
    <div>
      <h3 style={sectionTitle}>Fault Tolerance Simulator</h3>
      <p style={sectionDesc}>
        Click on connections (links) to break them and see which devices lose connectivity. Compare how different topologies handle failures.
      </p>

      {/* Topology selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        {TOPOLOGIES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTopo(t.id)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              border: topo === t.id ? `2px solid ${t.color}` : "1.5px solid var(--eng-border)",
              background: topo === t.id ? `${t.color}11` : "var(--eng-surface)",
              color: topo === t.id ? t.color : "var(--eng-text)",
              fontFamily: "var(--eng-font)",
              fontWeight: 600,
              fontSize: "0.82rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
        {brokenLinks.size > 0 && (
          <button
            onClick={() => setBrokenLinks(new Set())}
            className="btn-eng-outline"
            style={{ fontSize: "0.82rem", padding: "7px 14px" }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Status bar */}
      <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
        <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
          Links broken: {brokenLinks.size}
        </span>
        <span
          className="tag-eng"
          style={{
            background: disconnectedCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            color: disconnectedCount > 0 ? "var(--eng-danger)" : "var(--eng-success)",
          }}
        >
          {disconnectedCount > 0
            ? `${disconnectedCount} device${disconnectedCount > 1 ? "s" : ""} disconnected!`
            : "All devices connected"}
        </span>
      </div>

      {/* SVG */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 560 310" style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width="560" height="310" fill="#fafbfd" />

          {/* Connections */}
          {connections.map(([a, b], i) => {
            const nA = nodes[a];
            const nB = nodes[b];
            const lid = linkId(a, b);
            const isBroken = brokenLinks.has(lid);
            const isHovered = hoveredLink === lid;

            return (
              <g key={`link-${i}`}>
                {/* Clickable area (wider invisible line) */}
                <line
                  x1={nA.x} y1={nA.y}
                  x2={nB.x} y2={nB.y}
                  stroke="transparent"
                  strokeWidth="16"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleLink(a, b)}
                  onMouseEnter={() => setHoveredLink(lid)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
                {/* Visible line */}
                <line
                  x1={nA.x} y1={nA.y}
                  x2={nB.x} y2={nB.y}
                  stroke={isBroken ? "var(--eng-danger)" : isHovered ? info.color : `${info.color}66`}
                  strokeWidth={isBroken ? 3 : isHovered ? 3 : 2}
                  strokeDasharray={isBroken ? "6 4" : "none"}
                  strokeOpacity={isBroken ? 0.6 : 1}
                  style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                  onClick={() => toggleLink(a, b)}
                  onMouseEnter={() => setHoveredLink(lid)}
                  onMouseLeave={() => setHoveredLink(null)}
                />
                {/* Broken X mark */}
                {isBroken && (
                  <g
                    style={{ pointerEvents: "none" }}
                    className="eng-fadeIn"
                  >
                    <circle cx={(nA.x + nB.x) / 2} cy={(nA.y + nB.y) / 2} r="10" fill="var(--eng-danger)" opacity="0.15" />
                    <text
                      x={(nA.x + nB.x) / 2}
                      y={(nA.y + nB.y) / 2 + 4}
                      textAnchor="middle"
                      fill="var(--eng-danger)"
                      style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", fontWeight: 700 }}
                    >
                      X
                    </text>
                  </g>
                )}
                {/* Hover scissors icon hint */}
                {isHovered && !isBroken && (
                  <text
                    x={(nA.x + nB.x) / 2}
                    y={(nA.y + nB.y) / 2 - 10}
                    textAnchor="middle"
                    fill={info.color}
                    style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 600, pointerEvents: "none" }}
                  >
                    Click to cut
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((n, i) => {
            const isReachable = connectedNodes.has(i);
            const isHub = topo === "star" && i === 0;
            return (
              <g key={`node-${i}`}>
                {/* Disconnection pulse */}
                {!isReachable && (
                  <circle cx={n.x} cy={n.y} r="22" fill="none" stroke="var(--eng-danger)" strokeWidth="1.5">
                    <animate attributeName="r" values="18;24" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.6;0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={n.x} cy={n.y}
                  r={isHub ? 20 : 15}
                  fill={isReachable ? "var(--eng-surface)" : "rgba(239,68,68,0.1)"}
                  stroke={isReachable ? info.color : "var(--eng-danger)"}
                  strokeWidth="2"
                  style={{ transition: "all 0.3s ease" }}
                />
                {isHub ? (
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isReachable ? info.color : "var(--eng-danger)"} style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 700 }}>
                    HUB
                  </text>
                ) : (
                  <text x={n.x} y={n.y + 4} textAnchor="middle" fill={isReachable ? info.color : "var(--eng-danger)"} style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 600 }}>
                    {i + 1}
                  </text>
                )}
                <text x={n.x} y={n.y + (isHub ? 34 : 30)} textAnchor="middle" fill={isReachable ? "var(--eng-text-muted)" : "var(--eng-danger)"} style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem" }}>
                  {isReachable ? (isHub ? "Switch" : `Node ${topo === "star" ? i : i + 1}`) : "Disconnected!"}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Insight panel */}
      <TopologyInsight topo={topo} accent={info.color} />
    </div>
  );
}

/* ================================================================== */
/*  Topology Insight Panel                                             */
/* ================================================================== */

const TOPO_INSIGHTS: Record<TopologyId, {
  headline: string;
  body: string;
  strengths: string[];
  watchOuts: string[];
  failureMode: string;
  resilienceScore: number;
}> = {
  bus: {
    headline: "A single shared wire is fragile by design",
    body: "Every device taps into one backbone cable. Cut it anywhere and the network splits into two isolated halves - there is no alternate path for traffic to take.",
    strengths: ["Cheapest to install", "Simple to understand", "Works for small LANs"],
    watchOuts: ["No redundancy", "Any cut kills the segment", "Hard to troubleshoot at scale"],
    failureMode: "Single backbone = single point of failure",
    resilienceScore: 15,
  },
  star: {
    headline: "The hub giveth, and the hub taketh away",
    body: "Spokes fail independently - cutting one only isolates that device. But every packet flows through the hub, so if the hub dies, every node goes dark simultaneously.",
    strengths: ["Spoke failures are isolated", "Easy to add/remove devices", "Centralised monitoring"],
    watchOuts: ["Hub is a single point of failure", "Hub cost grows with scale", "Total bandwidth capped by hub"],
    failureMode: "Hub down = whole network down",
    resilienceScore: 65,
  },
  ring: {
    headline: "One break stops the music",
    body: "Data travels in a closed loop, so a single broken link interrupts the entire cycle. Dual-ring and token-passing designs add a redundant reverse path to survive one failure.",
    strengths: ["Predictable latency", "Fair bandwidth sharing", "Dual-ring adds fault tolerance"],
    watchOuts: ["Single-ring breaks cripple everything", "Adding nodes disrupts the loop", "Harder to diagnose"],
    failureMode: "One cut disrupts the whole ring",
    resilienceScore: 20,
  },
  mesh: {
    headline: "Redundancy at the cost of cable",
    body: "Every node connects to every other node, so traffic always has an alternate path. It takes multiple simultaneous failures to isolate a single device - the gold standard for reliability.",
    strengths: ["Survives multiple failures", "No single point of failure", "Lowest latency paths"],
    watchOuts: ["O(n²) cable complexity", "Expensive at scale", "Harder to configure"],
    failureMode: "Needs multiple cuts to disconnect anyone",
    resilienceScore: 95,
  },
};

function TopologyInsight({ topo, accent }: { topo: TopologyId; accent: string }) {
  const insight = TOPO_INSIGHTS[topo];
  const score = insight.resilienceScore;
  const scoreColor =
    score >= 75 ? "var(--eng-success)" :
    score >= 40 ? "var(--eng-warning)" :
    "var(--eng-danger)";
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const segments = 20;
  const filled = Math.round((score / 100) * segments);

  return (
    <div
      className="eng-fadeIn"
      key={topo}
      style={{
        position: "relative",
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
        borderRadius: "var(--eng-radius)",
        overflow: "hidden",
        boxShadow: "var(--eng-shadow)",
        display: "grid",
        gridTemplateColumns: "minmax(180px, 210px) 1fr",
      }}
    >
      {/* LEFT RAIL - display stat */}
      <div
        style={{
          padding: "22px 18px 22px 22px",
          borderRight: "1px solid var(--eng-border)",
          background: "var(--eng-bg)",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        <div>
          <div style={{ fontFamily: mono, fontSize: "0.66rem", fontWeight: 600, letterSpacing: "0.12em", color: "var(--eng-text-muted)", marginBottom: 4 }}>
            TOPOLOGY
          </div>
          <div
            style={{
              fontFamily: mono,
              fontSize: "2.1rem",
              fontWeight: 800,
              color: accent,
              letterSpacing: "-0.02em",
              lineHeight: 1,
              textTransform: "lowercase",
            }}
          >
            {topo}
            <span style={{ color: "var(--eng-text-muted)", fontWeight: 400 }}>()</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* Vertical resilience meter */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontFamily: mono, fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--eng-text-muted)" }}>
              RESILIENCE
            </span>
            <span style={{ fontFamily: mono, fontSize: "1.15rem", fontWeight: 700, color: scoreColor, lineHeight: 1 }}>
              {score}
              <span style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", fontWeight: 400 }}>/100</span>
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${segments}, 1fr)`, gap: 2 }}>
            {Array.from({ length: segments }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: 14,
                  background: i < filled ? scoreColor : "var(--eng-border)",
                  opacity: i < filled ? 1 : 0.4,
                  borderRadius: 1,
                  transition: "background 0.4s ease, opacity 0.4s ease",
                  transitionDelay: `${i * 15}ms`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT - editorial content */}
      <div style={{ padding: "22px 24px 20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Pull-quote headline */}
        <div style={{ position: "relative", paddingLeft: 28 }}>
          <span
            aria-hidden
            style={{
              position: "absolute",
              left: -4,
              top: -14,
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "3.6rem",
              lineHeight: 1,
              color: accent,
              opacity: 0.25,
              fontWeight: 700,
              userSelect: "none",
            }}
          >
            &ldquo;
          </span>
          <h4
            style={{
              margin: 0,
              fontFamily: "var(--eng-font)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--eng-text)",
              lineHeight: 1.3,
              letterSpacing: "-0.01em",
            }}
          >
            {insight.headline}
          </h4>
        </div>

        {/* Body */}
        <p
          style={{
            margin: 0,
            fontFamily: "var(--eng-font)",
            fontSize: "0.88rem",
            color: "var(--eng-text)",
            lineHeight: 1.65,
          }}
        >
          {insight.body}
        </p>

        {/* Inline pros/cons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
          {insight.strengths.map((s) => (
            <span
              key={s}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                fontFamily: mono,
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "var(--eng-text)",
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 4,
              }}
            >
              <span style={{ color: "var(--eng-success)", fontWeight: 700 }}>+</span>
              {s}
            </span>
          ))}
          {insight.watchOuts.map((w) => (
            <span
              key={w}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "4px 9px",
                fontFamily: mono,
                fontSize: "0.72rem",
                fontWeight: 500,
                color: "var(--eng-text)",
                background: "rgba(245,158,11,0.08)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: 4,
              }}
            >
              <span style={{ color: "var(--eng-warning)", fontWeight: 700 }}>-</span>
              {w}
            </span>
          ))}
        </div>

        {/* Failure-mode footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
            paddingTop: 12,
            borderTop: "1px dashed var(--eng-border)",
          }}
        >
          <span style={{ fontFamily: mono, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--eng-danger)" }}>
            FAILURE MODE
          </span>
          <span style={{ color: "var(--eng-text-muted)", fontSize: "0.8rem" }}>&rarr;</span>
          <span style={{ fontSize: "0.85rem", color: "var(--eng-text)", fontWeight: 500 }}>
            {insight.failureMode}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 - Comparison Table                                           */
/* ================================================================== */

function TopologyComparison() {
  const [highlightedRow, setHighlightedRow] = useState<number | null>(null);

  const metrics = [
    { metric: "Cable Required", bus: "Low", star: "Moderate", ring: "Moderate", mesh: "Very High", busScore: 90, starScore: 60, ringScore: 65, meshScore: 15 },
    { metric: "Installation Cost", bus: "Low", star: "Moderate", ring: "Moderate", mesh: "Very High", busScore: 85, starScore: 55, ringScore: 60, meshScore: 10 },
    { metric: "Fault Tolerance", bus: "Poor", star: "Good*", ring: "Poor", mesh: "Excellent", busScore: 15, starScore: 65, ringScore: 20, meshScore: 95 },
    { metric: "Scalability", bus: "Poor", star: "Easy", ring: "Difficult", mesh: "Very Difficult", busScore: 20, starScore: 85, ringScore: 25, meshScore: 15 },
    { metric: "Performance", bus: "Degrades", star: "Good", ring: "Moderate", mesh: "Excellent", busScore: 25, starScore: 75, ringScore: 55, meshScore: 90 },
    { metric: "Troubleshooting", bus: "Difficult", star: "Easy", ring: "Moderate", mesh: "Difficult", busScore: 25, starScore: 90, ringScore: 50, meshScore: 30 },
  ];

  function ScoreBar({ score, color }: { score: number; color: string }) {
    const [width, setWidth] = useState(0);
    useEffect(() => {
      const t = setTimeout(() => setWidth(score), 200);
      return () => clearTimeout(t);
    }, [score]);
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{ width: 60, height: 6, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", flexShrink: 0 }}>
          <div
            style={{
              width: `${width}%`,
              height: "100%",
              background: color,
              borderRadius: 3,
              transition: "width 0.8s ease",
            }}
          />
        </div>
        <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)", minWidth: 24 }}>
          {score}%
        </span>
      </div>
    );
  }

  return (
    <div>
      <h3 style={sectionTitle}>Topology Comparison</h3>
      <p style={sectionDesc}>
        Compare all four topologies across key metrics. Hover over rows to highlight them.
      </p>

      <div className="card-eng" style={{ overflow: "auto" }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "12px 14px", textAlign: "left", borderBottom: "2px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.72rem" }}>Metric</th>
              {TOPOLOGIES.map((t) => (
                <th key={t.id} style={{ padding: "12px 14px", textAlign: "left", borderBottom: `2px solid ${t.color}`, color: t.color, fontWeight: 700, fontSize: "0.72rem" }}>
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, idx) => (
              <tr
                key={idx}
                style={{
                  background: highlightedRow === idx ? "var(--eng-primary-light)" : idx % 2 === 0 ? "var(--eng-surface)" : "#fafbfd",
                  transition: "background 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={() => setHighlightedRow(idx)}
                onMouseLeave={() => setHighlightedRow(null)}
              >
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)", fontWeight: 600, color: "var(--eng-text)" }}>
                  {row.metric}
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)" }}>
                  <div style={{ color: "var(--eng-text)", marginBottom: 4 }}>{row.bus}</div>
                  <ScoreBar score={row.busScore} color={TOPOLOGIES[0].color} />
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)" }}>
                  <div style={{ color: "var(--eng-text)", marginBottom: 4 }}>{row.star}</div>
                  <ScoreBar score={row.starScore} color={TOPOLOGIES[1].color} />
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)" }}>
                  <div style={{ color: "var(--eng-text)", marginBottom: 4 }}>{row.ring}</div>
                  <ScoreBar score={row.ringScore} color={TOPOLOGIES[2].color} />
                </td>
                <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--eng-border)" }}>
                  <div style={{ color: "var(--eng-text)", marginBottom: 4 }}>{row.mesh}</div>
                  <ScoreBar score={row.meshScore} color={TOPOLOGIES[3].color} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="info-eng" style={{ marginTop: 16 }}>
        <p style={{ margin: 0, fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)", lineHeight: 1.6 }}>
          <strong>*Star (Fault Tolerance):</strong> Individual link failures are isolated, but the central hub/switch is a single point of failure. In practice, modern switches rarely fail, making star the most popular choice for LANs.
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  QUIZ                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "In which topology does every device connect directly to a central hub or switch?",
    options: ["Bus", "Ring", "Star", "Mesh"],
    correctIndex: 2,
    explanation: "In a star topology, all devices connect to a central hub or switch. This makes it easy to add/remove devices and isolate faults.",
  },
  {
    question: "Which topology provides the highest fault tolerance?",
    options: ["Bus", "Star", "Ring", "Full Mesh"],
    correctIndex: 3,
    explanation: "Full mesh topology provides maximum redundancy because every device connects to every other device, offering multiple paths for data.",
  },
  {
    question: "In a bus topology, what happens when the backbone cable is cut?",
    options: [
      "Only the nearest device is affected",
      "The network splits into two isolated segments",
      "Nothing, data finds alternate path",
      "All devices reconnect automatically",
    ],
    correctIndex: 1,
    explanation: "When the bus backbone is cut, the network splits into two segments. Devices on one side cannot communicate with the other.",
  },
  {
    question: "Which topology uses token passing to manage access?",
    options: ["Star", "Bus", "Ring", "Mesh"],
    correctIndex: 2,
    explanation: "Ring topology uses token passing - a special frame circulates the ring, and only the device holding the token can transmit data.",
  },
  {
    question: "A company wants to connect 100 computers cheaply in one floor. Which topology is best?",
    options: ["Full Mesh", "Bus", "Star", "Ring"],
    correctIndex: 2,
    explanation: "Star topology is the best practical choice for a LAN. It's affordable (uses a switch), easy to manage, and individual link failures don't affect others.",
  },
];

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export default function CN_L1_TopologiesActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "explore",
      label: "Explore",
      icon: <Globe className="w-4 h-4" />,
      content: <TopologyBuilder />,
    },
    {
      id: "fault",
      label: "Fault Sim",
      icon: <AlertTriangle className="w-4 h-4" />,
      content: <FaultSimulation />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <TopologyComparison />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Network Topologies"
      level={1}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="The OSI Model - 7 Layers"
      placementRelevance="Low"
    />
  );
}
