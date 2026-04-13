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
  Info,
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
  description: string;
  pros: string[];
  cons: string[];
}

const TOPOLOGIES: TopologyInfo[] = [
  {
    id: "bus",
    label: "Bus",
    color: "#3b82f6",
    description: "All devices share a single central cable (backbone). Data travels in both directions along the bus. Terminators at each end absorb signals.",
    pros: ["Simple to install", "Low cost (less cable)", "Works well for small networks"],
    cons: ["Single point of failure (backbone)", "Performance drops with more devices", "Difficult to troubleshoot"],
  },
  {
    id: "star",
    label: "Star",
    color: "#f59e0b",
    description: "All devices connect to a central hub/switch. All data passes through the central node. Most common topology in modern LANs.",
    pros: ["Easy to add/remove devices", "Failure of one link doesn't affect others", "Easy to troubleshoot"],
    cons: ["Central hub is single point of failure", "More cable required", "Hub failure takes down entire network"],
  },
  {
    id: "ring",
    label: "Ring",
    color: "#10b981",
    description: "Devices form a closed loop. Data travels in one direction around the ring. Each device has exactly two connections. Token passing controls access.",
    pros: ["Equal access for all devices", "No collisions (token passing)", "Predictable performance"],
    cons: ["One break can disable network", "Difficult to add/remove devices", "Slower due to token waiting"],
  },
  {
    id: "mesh",
    label: "Mesh",
    color: "#8b5cf6",
    description: "Every device connects to every other device (full mesh) or most others (partial mesh). Provides maximum redundancy and fault tolerance.",
    pros: ["Highly fault-tolerant", "No single point of failure", "Multiple paths for data"],
    cons: ["Very expensive (many cables)", "Complex to manage", "Not practical for large networks"],
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
/*  TAB 1 — Topology Builder                                           */
/* ================================================================== */

function TopologyBuilder() {
  const [selected, setSelected] = useState<TopologyId>("bus");
  const [animPhase, setAnimPhase] = useState(0);
  const [packetStep, setPacketStep] = useState(0);
  const nodeCount = 6;

  useEffect(() => {
    setAnimPhase(0);
    const t1 = setTimeout(() => setAnimPhase(1), 80);
    const t2 = setTimeout(() => setAnimPhase(2), 350);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [selected]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPacketStep((s) => (s + 1) % 100);
    }, 35);
    return () => clearInterval(interval);
  }, []);

  const info = TOPOLOGIES.find((t) => t.id === selected)!;
  const nodes = getNodePositions(selected, nodeCount);
  const connections = getConnections(selected, nodeCount);

  // Packet animation along a connection
  const packetConn = connections[Math.floor((packetStep / 100) * connections.length) % connections.length];
  const pA = nodes[packetConn[0]];
  const pB = nodes[packetConn[1]];
  const packetProgress = (packetStep % 25) / 25;

  return (
    <div>
      <h3 style={sectionTitle}>Topology Explorer</h3>
      <p style={sectionDesc}>
        Click a topology to see how devices connect. Watch data flow through the network and learn the tradeoffs.
      </p>

      {/* Topology selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 20 }}>
        {TOPOLOGIES.map((t) => (
          <button
            key={t.id}
            onClick={() => setSelected(t.id)}
            style={{
              padding: "8px 18px",
              borderRadius: 8,
              border: selected === t.id ? `2px solid ${t.color}` : "1.5px solid var(--eng-border)",
              background: selected === t.id ? `${t.color}11` : "var(--eng-surface)",
              color: selected === t.id ? t.color : "var(--eng-text)",
              fontFamily: "var(--eng-font)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SVG visualization */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 560 310" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <filter id="topoGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="560" height="310" fill="#fafbfd" />

          {/* Bus backbone (special for bus topology) */}
          {selected === "bus" && animPhase >= 1 && (
            <line
              x1="40" y1={nodes[0].y}
              x2="520" y2={nodes[0].y}
              stroke={info.color}
              strokeWidth="4"
              strokeOpacity="0.25"
              strokeLinecap="round"
            />
          )}

          {/* Connection lines */}
          {connections.map(([a, b], i) => {
            const nA = nodes[a];
            const nB = nodes[b];
            return (
              <line
                key={`conn-${i}`}
                x1={nA.x} y1={nA.y}
                x2={animPhase >= 1 ? nB.x : nA.x}
                y2={animPhase >= 1 ? nB.y : nA.y}
                stroke={info.color}
                strokeWidth="2"
                strokeOpacity={animPhase >= 1 ? 0.4 : 0}
                style={{ transition: "all 0.5s ease" }}
              />
            );
          })}

          {/* Animated data packet */}
          {animPhase >= 2 && (
            <circle
              cx={pA.x + (pB.x - pA.x) * packetProgress}
              cy={pA.y + (pB.y - pA.y) * packetProgress}
              r="5"
              fill={info.color}
              filter="url(#topoGlow)"
            >
              <animate attributeName="opacity" values="1;0.6;1" dur="0.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Device nodes */}
          {nodes.map((n, i) => {
            const isHub = selected === "star" && i === 0;
            return (
              <g
                key={`node-${i}`}
                style={{
                  opacity: animPhase >= 1 ? 1 : 0,
                  transform: animPhase >= 1 ? "scale(1)" : "scale(0)",
                  transformOrigin: `${n.x}px ${n.y}px`,
                  transition: `all 0.3s ease ${i * 0.06}s`,
                }}
              >
                <circle
                  cx={n.x} cy={n.y}
                  r={isHub ? 22 : 16}
                  fill={isHub ? `${info.color}22` : "var(--eng-surface)"}
                  stroke={info.color}
                  strokeWidth={isHub ? 2.5 : 1.5}
                />
                {/* Device icon: simple rectangles */}
                {isHub ? (
                  <>
                    <rect x={n.x - 10} y={n.y - 7} width="20" height="6" rx="1" fill="none" stroke={info.color} strokeWidth="1.3" />
                    <rect x={n.x - 10} y={n.y + 1} width="20" height="6" rx="1" fill="none" stroke={info.color} strokeWidth="1.3" />
                    <text x={n.x} y={n.y + 36} textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 700 }}>Hub/Switch</text>
                  </>
                ) : (
                  <>
                    <rect x={n.x - 7} y={n.y - 5} width="14" height="10" rx="1.5" fill="none" stroke={info.color} strokeWidth="1.3" />
                    <text x={n.x} y={n.y + 28} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem" }}>
                      Node {selected === "star" ? i : i + 1}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Topology label */}
          <text x="280" y="298" textAnchor="middle" fill={info.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700 }}>
            {info.label} Topology
          </text>
        </svg>
      </div>

      {/* Info card */}
      <div className="card-eng eng-fadeIn" key={selected} style={{ padding: 20, borderLeft: `4px solid ${info.color}` }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", color: "var(--eng-text)", lineHeight: 1.6, margin: "0 0 16px" }}>
          {info.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h5 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.82rem", color: "var(--eng-success)", margin: "0 0 6px" }}>
              Advantages
            </h5>
            <ul style={{ margin: 0, padding: "0 0 0 16px", listStyle: "none" }}>
              {info.pros.map((p, i) => (
                <li key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-success)" }} />
                  {p}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h5 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.82rem", color: "var(--eng-danger)", margin: "0 0 6px" }}>
              Disadvantages
            </h5>
            <ul style={{ margin: 0, padding: "0 0 0 16px", listStyle: "none" }}>
              {info.cons.map((c, i) => (
                <li key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-danger)" }} />
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 — Fault Simulation                                           */
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

      {/* Insight box */}
      <div className="info-eng">
        <p style={{ margin: 0, fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6 }}>
          {topo === "bus" && "In a bus topology, cutting any link splits the network into two halves. There is no redundancy."}
          {topo === "star" && "In a star topology, cutting a spoke only disconnects one device. But if the central hub fails, everything goes down!"}
          {topo === "ring" && "In a ring topology, a single break disrupts the entire loop. Dual-ring designs add fault tolerance."}
          {topo === "mesh" && "In a full mesh, multiple links must be broken before a node loses connectivity. This is the most fault-tolerant topology."}
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 — Comparison Table                                           */
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
    explanation: "Ring topology uses token passing — a special frame circulates the ring, and only the device holding the token can transmit data.",
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
      nextLessonHint="The OSI Model — 7 Layers"
      gateRelevance="1 mark"
      placementRelevance="Low"
    />
  );
}
