"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Network,
  Monitor,
  Smartphone,
  Server,
  Globe,
  Building2,
  MapPin,
  ArrowRightLeft,
  Users,
  CheckCircle2,
  XCircle,
  Wifi,
  Laptop,
  Printer,
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
/*  TAB 1 — Network Type Explorer                                      */
/* ================================================================== */

interface NetworkType {
  id: string;
  label: string;
  fullName: string;
  range: string;
  color: string;
  description: string;
  examples: string[];
  deviceCount: string;
  icon: React.ReactNode;
}

const NETWORK_TYPES: NetworkType[] = [
  {
    id: "lan",
    label: "LAN",
    fullName: "Local Area Network",
    range: "< 1 km",
    color: "#3b82f6",
    description:
      "A LAN connects devices within a small area like a room, building, or campus. It offers high speed and low latency because devices are close together.",
    examples: ["Home Wi-Fi", "School computer lab", "Office floor"],
    deviceCount: "2 - 500",
    icon: <Laptop className="w-5 h-5" />,
  },
  {
    id: "man",
    label: "MAN",
    fullName: "Metropolitan Area Network",
    range: "1 - 100 km",
    color: "#f59e0b",
    description:
      "A MAN spans a city or metropolitan area. It connects multiple LANs across buildings, campuses, or districts using high-capacity links.",
    examples: ["City-wide cable TV", "University campuses in a city", "City government network"],
    deviceCount: "100 - 10,000+",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "wan",
    label: "WAN",
    fullName: "Wide Area Network",
    range: "> 100 km",
    color: "#10b981",
    description:
      "A WAN covers large geographical areas, even spanning countries and continents. The Internet is the largest WAN. WANs often use leased lines and satellite links.",
    examples: ["The Internet", "Bank ATM networks", "Multinational corporate networks"],
    deviceCount: "Millions+",
    icon: <Globe className="w-5 h-5" />,
  },
];

function NetworkTypeExplorer() {
  const [selected, setSelected] = useState<string>("lan");
  const [animPhase, setAnimPhase] = useState(0);
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null);

  useEffect(() => {
    setAnimPhase(0);
    const t1 = setTimeout(() => setAnimPhase(1), 100);
    const t2 = setTimeout(() => setAnimPhase(2), 400);
    const t3 = setTimeout(() => setAnimPhase(3), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [selected]);

  const nt = NETWORK_TYPES.find((n) => n.id === selected)!;

  // Device positions for each network type
  const deviceLayouts: Record<string, { x: number; y: number; label: string; icon: string }[]> = {
    lan: [
      { x: 200, y: 100, label: "PC", icon: "monitor" },
      { x: 350, y: 80, label: "Laptop", icon: "laptop" },
      { x: 450, y: 150, label: "Printer", icon: "printer" },
      { x: 400, y: 260, label: "Phone", icon: "phone" },
      { x: 250, y: 250, label: "Server", icon: "server" },
      { x: 120, y: 200, label: "Tablet", icon: "phone" },
    ],
    man: [
      { x: 100, y: 90, label: "Campus A", icon: "building" },
      { x: 300, y: 60, label: "City Hall", icon: "building" },
      { x: 480, y: 100, label: "Campus B", icon: "building" },
      { x: 150, y: 250, label: "Hospital", icon: "building" },
      { x: 380, y: 260, label: "Library", icon: "building" },
    ],
    wan: [
      { x: 80, y: 120, label: "New York", icon: "globe" },
      { x: 280, y: 60, label: "London", icon: "globe" },
      { x: 480, y: 120, label: "Tokyo", icon: "globe" },
      { x: 180, y: 260, label: "Mumbai", icon: "globe" },
      { x: 400, y: 250, label: "Sydney", icon: "globe" },
    ],
  };

  const devices = deviceLayouts[selected];
  const connections: [number, number][] = [];
  // Generate connections
  if (selected === "lan") {
    // Star-like around center
    for (let i = 0; i < devices.length; i++) {
      for (let j = i + 1; j < devices.length; j++) {
        if (Math.random() < 0.4 || j === i + 1) connections.push([i, j]);
      }
    }
  } else {
    for (let i = 0; i < devices.length - 1; i++) {
      connections.push([i, i + 1]);
    }
    if (devices.length > 2) connections.push([0, devices.length - 1]);
  }

  // Data packet animation
  const [packetPos, setPacketPos] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setPacketPos((p) => (p + 1) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3 style={sectionTitle}>Network Types Explorer</h3>
      <p style={sectionDesc}>
        Click on a network type below to see how devices are connected in each. Watch how
        data flows between devices.
      </p>

      {/* Type selector buttons */}
      <div className="flex gap-3" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {NETWORK_TYPES.map((n) => (
          <button
            key={n.id}
            onClick={() => setSelected(n.id)}
            className="card-eng flex items-center gap-2"
            style={{
              padding: "10px 18px",
              cursor: "pointer",
              border: selected === n.id ? `2px solid ${n.color}` : "1px solid var(--eng-border)",
              background: selected === n.id ? `${n.color}11` : "var(--eng-surface)",
              borderRadius: 10,
              transition: "all 0.25s ease",
              transform: selected === n.id ? "scale(1.02)" : "scale(1)",
            }}
          >
            <span style={{ color: n.color }}>{n.icon}</span>
            <span
              style={{
                fontFamily: "var(--eng-font)",
                fontWeight: 700,
                fontSize: "0.95rem",
                color: selected === n.id ? n.color : "var(--eng-text)",
              }}
            >
              {n.label}
            </span>
            <span
              style={{
                fontFamily: "var(--eng-font)",
                fontSize: "0.75rem",
                color: "var(--eng-text-muted)",
              }}
            >
              {n.range}
            </span>
          </button>
        ))}
      </div>

      {/* SVG Visualization */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg
          viewBox="0 0 580 340"
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Background grid */}
          <defs>
            <pattern id="netGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`grad-${selected}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={nt.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={nt.color} stopOpacity="0.3" />
            </linearGradient>
          </defs>
          <rect width="580" height="340" fill="#fafbfd" />
          <rect width="580" height="340" fill="url(#netGrid)" />

          {/* Connection lines */}
          {connections.map(([a, b], i) => {
            const da = devices[a];
            const db = devices[b];
            return (
              <g key={`conn-${i}`}>
                <line
                  x1={da.x}
                  y1={da.y}
                  x2={db.x}
                  y2={db.y}
                  stroke={nt.color}
                  strokeWidth="2"
                  strokeOpacity={animPhase >= 2 ? 0.3 : 0}
                  style={{ transition: "stroke-opacity 0.5s ease" }}
                />
                {/* Animated data packet */}
                {animPhase >= 3 && i === 0 && (
                  <circle
                    cx={da.x + (db.x - da.x) * (packetPos / 100)}
                    cy={da.y + (db.y - da.y) * (packetPos / 100)}
                    r="4"
                    fill={nt.color}
                    filter="url(#glow)"
                  >
                    <animate
                      attributeName="opacity"
                      values="1;0.5;1"
                      dur="1s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                {/* Second packet on another connection */}
                {animPhase >= 3 && i === Math.min(2, connections.length - 1) && (
                  <circle
                    cx={db.x + (da.x - db.x) * (packetPos / 100)}
                    cy={db.y + (da.y - db.y) * (packetPos / 100)}
                    r="3.5"
                    fill={nt.color}
                    opacity="0.7"
                    filter="url(#glow)"
                  />
                )}
              </g>
            );
          })}

          {/* Device nodes */}
          {devices.map((d, i) => {
            const show = animPhase >= 1;
            const isHovered = hoveredDevice === i;
            return (
              <g
                key={`dev-${i}`}
                style={{
                  opacity: show ? 1 : 0,
                  transform: show ? "scale(1)" : "scale(0.5)",
                  transformOrigin: `${d.x}px ${d.y}px`,
                  transition: `opacity 0.4s ease ${i * 0.08}s, transform 0.4s ease ${i * 0.08}s`,
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredDevice(i)}
                onMouseLeave={() => setHoveredDevice(null)}
              >
                {/* Pulse ring on hover */}
                {isHovered && (
                  <circle cx={d.x} cy={d.y} r="28" fill="none" stroke={nt.color} strokeWidth="1.5" strokeOpacity="0.4">
                    <animate attributeName="r" values="22;30" dur="1s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.5;0" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle
                  cx={d.x}
                  cy={d.y}
                  r={isHovered ? 22 : 20}
                  fill={isHovered ? `${nt.color}22` : "var(--eng-surface)"}
                  stroke={nt.color}
                  strokeWidth={isHovered ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s ease" }}
                />
                {/* Device icon - simple shapes */}
                {d.icon === "monitor" && (
                  <rect x={d.x - 7} y={d.y - 6} width="14" height="10" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                )}
                {d.icon === "laptop" && (
                  <>
                    <rect x={d.x - 7} y={d.y - 5} width="14" height="8" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                    <line x1={d.x - 9} y1={d.y + 5} x2={d.x + 9} y2={d.y + 5} stroke={nt.color} strokeWidth="1.5" />
                  </>
                )}
                {d.icon === "printer" && (
                  <>
                    <rect x={d.x - 6} y={d.y - 3} width="12" height="7" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                    <rect x={d.x - 4} y={d.y - 7} width="8" height="5" rx="0.5" fill="none" stroke={nt.color} strokeWidth="1" />
                  </>
                )}
                {d.icon === "phone" && (
                  <rect x={d.x - 4} y={d.y - 7} width="8" height="14" rx="2" fill="none" stroke={nt.color} strokeWidth="1.5" />
                )}
                {d.icon === "server" && (
                  <>
                    <rect x={d.x - 6} y={d.y - 8} width="12" height="6" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                    <rect x={d.x - 6} y={d.y + 1} width="12" height="6" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                  </>
                )}
                {d.icon === "building" && (
                  <>
                    <rect x={d.x - 7} y={d.y - 8} width="14" height="16" rx="1" fill="none" stroke={nt.color} strokeWidth="1.5" />
                    <line x1={d.x - 3} y1={d.y - 3} x2={d.x - 3} y2={d.y - 1} stroke={nt.color} strokeWidth="1" />
                    <line x1={d.x + 3} y1={d.y - 3} x2={d.x + 3} y2={d.y - 1} stroke={nt.color} strokeWidth="1" />
                    <line x1={d.x - 3} y1={d.y + 2} x2={d.x - 3} y2={d.y + 4} stroke={nt.color} strokeWidth="1" />
                    <line x1={d.x + 3} y1={d.y + 2} x2={d.x + 3} y2={d.y + 4} stroke={nt.color} strokeWidth="1" />
                  </>
                )}
                {d.icon === "globe" && (
                  <>
                    <circle cx={d.x} cy={d.y} r="8" fill="none" stroke={nt.color} strokeWidth="1.5" />
                    <ellipse cx={d.x} cy={d.y} rx="4" ry="8" fill="none" stroke={nt.color} strokeWidth="0.8" />
                    <line x1={d.x - 8} y1={d.y} x2={d.x + 8} y2={d.y} stroke={nt.color} strokeWidth="0.8" />
                  </>
                )}
                {/* Label */}
                <text
                  x={d.x}
                  y={d.y + 32}
                  textAnchor="middle"
                  fill="var(--eng-text)"
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.65rem",
                    fontWeight: 500,
                  }}
                >
                  {d.label}
                </text>
              </g>
            );
          })}

          {/* Title */}
          <text x="290" y="330" textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem" }}>
            {nt.fullName} — Range: {nt.range}
          </text>
        </svg>
      </div>

      {/* Info card */}
      <div
        className="card-eng eng-fadeIn"
        key={selected}
        style={{ padding: 20, borderLeft: `4px solid ${nt.color}` }}
      >
        <h4
          style={{
            fontFamily: "var(--eng-font)",
            fontWeight: 700,
            fontSize: "1rem",
            color: nt.color,
            margin: "0 0 6px",
          }}
        >
          {nt.fullName} ({nt.label})
        </h4>
        <p
          style={{
            fontFamily: "var(--eng-font)",
            fontSize: "0.85rem",
            color: "var(--eng-text)",
            lineHeight: 1.6,
            margin: "0 0 12px",
          }}
        >
          {nt.description}
        </p>
        <div className="flex gap-4 flex-wrap" style={{ marginBottom: 10 }}>
          <span className="tag-eng" style={{ background: `${nt.color}15`, color: nt.color }}>
            Range: {nt.range}
          </span>
          <span className="tag-eng" style={{ background: `${nt.color}15`, color: nt.color }}>
            Devices: {nt.deviceCount}
          </span>
        </div>
        <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)" }}>
          <strong style={{ color: "var(--eng-text)" }}>Examples:</strong>{" "}
          {nt.examples.join(" | ")}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 — Client-Server vs Peer-to-Peer                             */
/* ================================================================== */

function ClientServerVsP2P() {
  const [mode, setMode] = useState<"cs" | "p2p">("cs");
  const [dataFlowStep, setDataFlowStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setDataFlowStep((s) => (s + 1) % 100);
    }, 40);
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    setDataFlowStep(0);
  }, [mode]);

  const csClients = [
    { x: 100, y: 70, label: "Client A" },
    { x: 100, y: 170, label: "Client B" },
    { x: 100, y: 270, label: "Client C" },
  ];
  const csServer = { x: 440, y: 170, label: "Server" };

  const p2pPeers = [
    { x: 150, y: 80, label: "Peer A" },
    { x: 420, y: 80, label: "Peer B" },
    { x: 120, y: 260, label: "Peer C" },
    { x: 450, y: 260, label: "Peer D" },
    { x: 290, y: 170, label: "Peer E" },
  ];

  const progress = dataFlowStep / 100;

  return (
    <div>
      <h3 style={sectionTitle}>Client-Server vs Peer-to-Peer</h3>
      <p style={sectionDesc}>
        Toggle between the two architectures and watch how data flows differently in each model.
      </p>

      <div className="flex gap-3" style={{ marginBottom: 20 }}>
        <button
          onClick={() => setMode("cs")}
          className={mode === "cs" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          <Server className="w-4 h-4" /> Client-Server
        </button>
        <button
          onClick={() => setMode("p2p")}
          className={mode === "p2p" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          <Users className="w-4 h-4" /> Peer-to-Peer
        </button>
      </div>

      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 560 340" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <marker id="arrowCS" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
            <marker id="arrowP2P" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#10b981" />
            </marker>
            <filter id="glowCS">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="560" height="340" fill="#fafbfd" />

          {mode === "cs" ? (
            <g>
              {/* Server */}
              <rect x={csServer.x - 30} y={csServer.y - 35} width="60" height="70" rx="8" fill="#3b82f611" stroke="#3b82f6" strokeWidth="2" />
              <rect x={csServer.x - 16} y={csServer.y - 20} width="32" height="12" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx={csServer.x + 10} cy={csServer.y - 14} r="2" fill="#3b82f6" />
              <rect x={csServer.x - 16} y={csServer.y - 3} width="32" height="12" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx={csServer.x + 10} cy={csServer.y + 3} r="2" fill="#3b82f6" />
              <rect x={csServer.x - 16} y={csServer.y + 14} width="32" height="12" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
              <circle cx={csServer.x + 10} cy={csServer.y + 20} r="2" fill="#3b82f6" />
              <text x={csServer.x} y={csServer.y + 52} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", fontWeight: 600 }}>
                {csServer.label}
              </text>

              {/* Clients and connections */}
              {csClients.map((c, i) => {
                const requestProgress = (progress * 3 - i * 0.3) % 1;
                const responseProgress = ((progress * 3 - i * 0.3) + 0.5) % 1;
                const showReq = requestProgress > 0 && requestProgress < 1;
                const showResp = responseProgress > 0 && responseProgress < 1;
                return (
                  <g key={i}>
                    {/* Connection line */}
                    <line x1={c.x + 30} y1={c.y} x2={csServer.x - 35} y2={csServer.y} stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 4" />

                    {/* Request packet (going right) */}
                    {showReq && (
                      <circle
                        cx={c.x + 30 + (csServer.x - 35 - c.x - 30) * Math.max(0, Math.min(1, requestProgress))}
                        cy={c.y + (csServer.y - c.y) * Math.max(0, Math.min(1, requestProgress))}
                        r="5"
                        fill="#3b82f6"
                        filter="url(#glowCS)"
                      />
                    )}

                    {/* Response packet (going left) */}
                    {showResp && (
                      <circle
                        cx={csServer.x - 35 + (c.x + 30 - csServer.x + 35) * Math.max(0, Math.min(1, responseProgress))}
                        cy={csServer.y + (c.y - csServer.y) * Math.max(0, Math.min(1, responseProgress))}
                        r="4"
                        fill="#10b981"
                        filter="url(#glowCS)"
                      />
                    )}

                    {/* Client device */}
                    <rect x={c.x - 22} y={c.y - 16} width="44" height="32" rx="6" fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth="1.5" />
                    <rect x={c.x - 12} y={c.y - 8} width="24" height="14" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1" />
                    <line x1={c.x - 14} y1={c.y + 10} x2={c.x + 14} y2={c.y + 10} stroke="#3b82f6" strokeWidth="1" />
                    <text x={c.x} y={c.y + 30} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 500 }}>
                      {c.label}
                    </text>
                  </g>
                );
              })}

              {/* Labels */}
              <text x="280" y="20" textAnchor="middle" fill="#3b82f6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700 }}>
                Client-Server Architecture
              </text>
              <g>
                <circle cx="200" cy="325" r="4" fill="#3b82f6" />
                <text x="210" y="329" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem" }}>Request</text>
                <circle cx="280" cy="325" r="4" fill="#10b981" />
                <text x="290" y="329" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem" }}>Response</text>
              </g>
            </g>
          ) : (
            <g>
              {/* P2P connections */}
              {p2pPeers.map((a, i) =>
                p2pPeers.map((b, j) => {
                  if (j <= i) return null;
                  // Only show some connections
                  if (Math.abs(i - j) > 2 && !(i === 0 && j === 3)) return null;
                  return (
                    <line
                      key={`p2p-${i}-${j}`}
                      x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                      stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    />
                  );
                })
              )}

              {/* Animated data packets on P2P */}
              {[
                [0, 4], [4, 1], [2, 4], [4, 3], [0, 2],
              ].map(([from, to], idx) => {
                const peerA = p2pPeers[from];
                const peerB = p2pPeers[to];
                const p = ((progress * 2 + idx * 0.2) % 1);
                return (
                  <circle
                    key={`pkt-${idx}`}
                    cx={peerA.x + (peerB.x - peerA.x) * p}
                    cy={peerA.y + (peerB.y - peerA.y) * p}
                    r="4"
                    fill="#10b981"
                    filter="url(#glowCS)"
                    opacity={0.8}
                  />
                );
              })}

              {/* Peer nodes */}
              {p2pPeers.map((p, i) => (
                <g key={`peer-${i}`}>
                  <circle cx={p.x} cy={p.y} r="24" fill="#10b98111" stroke="#10b981" strokeWidth="2" />
                  <rect x={p.x - 8} y={p.y - 8} width="16" height="12" rx="2" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <line x1={p.x - 10} y1={p.y + 6} x2={p.x + 10} y2={p.y + 6} stroke="#10b981" strokeWidth="1" />
                  <text x={p.x} y={p.y + 40} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 500 }}>
                    {p.label}
                  </text>
                </g>
              ))}

              <text x="280" y="20" textAnchor="middle" fill="#10b981" style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700 }}>
                Peer-to-Peer Architecture
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Comparison table */}
      <div className="card-eng" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>Feature</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "#3b82f6", fontWeight: 600, fontSize: "0.75rem" }}>Client-Server</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "#10b981", fontWeight: 600, fontSize: "0.75rem" }}>Peer-to-Peer</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Central Server", "Yes (dedicated)", "No (all peers equal)"],
              ["Scalability", "Limited by server", "Scales with more peers"],
              ["Single Point of Failure", "Yes (server down = system down)", "No (resilient)"],
              ["Cost", "High (server hardware)", "Low (shared resources)"],
              ["Security", "Easier to manage", "Harder to secure"],
              ["Example", "Web (HTTP), Email", "BitTorrent, Blockchain"],
            ].map(([feat, cs, p2p], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "var(--eng-surface)" : "#fafbfd" }}>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", fontWeight: 600, color: "var(--eng-text)" }}>{feat}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text)" }}>{cs}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text)" }}>{p2p}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 — Practice: Classify Networks                                */
/* ================================================================== */

interface Scenario {
  id: number;
  description: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 1,
    description: "A school has 50 computers connected in a single building using Ethernet cables and a switch.",
    options: ["LAN", "MAN", "WAN"],
    correctIndex: 0,
    explanation: "This is a LAN (Local Area Network) because all devices are in one building within a small area.",
  },
  {
    id: 2,
    description: "A city government connects its offices across different parts of the city using fiber optics.",
    options: ["LAN", "MAN", "WAN"],
    correctIndex: 1,
    explanation: "This is a MAN (Metropolitan Area Network) because it spans a city-wide area.",
  },
  {
    id: 3,
    description: "A multinational company connects its offices in New York, London, and Tokyo through the internet.",
    options: ["LAN", "MAN", "WAN"],
    correctIndex: 2,
    explanation: "This is a WAN (Wide Area Network) because it connects offices across countries and continents.",
  },
  {
    id: 4,
    description: "Users download files directly from other users' computers without any central server.",
    options: ["Client-Server", "Peer-to-Peer"],
    correctIndex: 1,
    explanation: "This is a Peer-to-Peer network because there's no central server; all nodes share resources equally (like BitTorrent).",
  },
  {
    id: 5,
    description: "You open a website in your browser and the webpage is loaded from a data center.",
    options: ["Client-Server", "Peer-to-Peer"],
    correctIndex: 0,
    explanation: "This is Client-Server architecture. Your browser is the client requesting data from the web server.",
  },
  {
    id: 6,
    description: "A hospital connects all its departments (labs, wards, admin) within its campus using Wi-Fi and switches.",
    options: ["LAN", "MAN", "WAN"],
    correctIndex: 0,
    explanation: "A hospital campus network is a LAN because everything is within a single site/campus.",
  },
];

function PracticeClassify() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[currentIdx];

  function handleAnswer(idx: number) {
    if (answered) return;
    setSelectedOption(idx);
    setAnswered(true);
    if (idx === scenario.correctIndex) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentIdx < SCENARIOS.length - 1) {
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
    const pct = Math.round((score / SCENARIOS.length) * 100);
    return (
      <div className="card-eng p-8 text-center eng-fadeIn" style={{ maxWidth: 500, margin: "0 auto" }}>
        <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--eng-success)", marginBottom: 12 }} />
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          Practice Complete!
        </h3>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px" }}>
          You scored <strong>{score}/{SCENARIOS.length}</strong> ({pct}%)
        </p>
        <button onClick={handleReset} className="btn-eng">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h3 style={sectionTitle}>Classify the Network</h3>
      <p style={sectionDesc}>
        Read each scenario and classify it. Test your understanding of network types and architectures.
      </p>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
            Scenario {currentIdx + 1} of {SCENARIOS.length}
          </span>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Score: {score}
          </span>
        </div>
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              width: `${(currentIdx / SCENARIOS.length) * 100}%`,
              height: "100%",
              background: "var(--eng-primary)",
              borderRadius: 2,
              transition: "width 0.3s ease",
            }}
          />
        </div>
      </div>

      <div className="card-eng eng-fadeIn" key={currentIdx} style={{ padding: 24, maxWidth: 600, margin: "0 auto" }}>
        {/* Scenario description */}
        <div style={{
          background: "#f8fafc",
          borderRadius: 8,
          padding: "16px 20px",
          marginBottom: 20,
          borderLeft: "3px solid var(--eng-primary)",
        }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)", lineHeight: 1.6, margin: 0 }}>
            {scenario.description}
          </p>
        </div>

        {/* Options */}
        <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
          {scenario.options.map((opt, idx) => {
            const isCorrect = idx === scenario.correctIndex;
            const isSelected = idx === selectedOption;
            let bg = "var(--eng-surface)";
            let border = "1.5px solid var(--eng-border)";
            let color = "var(--eng-text)";

            if (answered) {
              if (isCorrect) {
                bg = "rgba(16,185,129,0.1)";
                border = "2px solid var(--eng-success)";
                color = "#065f46";
              } else if (isSelected) {
                bg = "rgba(239,68,68,0.1)";
                border = "2px solid var(--eng-danger)";
                color = "#991b1b";
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                style={{
                  padding: "10px 24px",
                  borderRadius: 8,
                  background: bg,
                  border,
                  color,
                  fontFamily: "var(--eng-font)",
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  cursor: answered ? "default" : "pointer",
                  transition: "all 0.2s ease",
                  flex: "1 1 auto",
                  minWidth: 100,
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

        {/* Explanation */}
        {answered && (
          <div className="info-eng eng-fadeIn" style={{ marginBottom: 16 }}>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6 }}>
              {scenario.explanation}
            </p>
          </div>
        )}

        {/* Next button */}
        {answered && (
          <button onClick={handleNext} className="btn-eng" style={{ width: "100%" }}>
            {currentIdx < SCENARIOS.length - 1 ? "Next Scenario" : "See Results"}
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
    question: "Which type of network typically covers a single building or campus?",
    options: ["WAN", "MAN", "LAN", "PAN"],
    correctIndex: 2,
    explanation: "A LAN (Local Area Network) covers a small geographical area like a room, building, or campus, typically within 1 km.",
  },
  {
    question: "What is the key difference between client-server and peer-to-peer architecture?",
    options: [
      "Client-server uses wireless; P2P uses wired",
      "Client-server has a dedicated server; P2P has equal nodes",
      "P2P is always faster than client-server",
      "Client-server only works within LAN",
    ],
    correctIndex: 1,
    explanation: "In client-server, a dedicated server provides services to clients. In P2P, all nodes are equal and can act as both client and server.",
  },
  {
    question: "The Internet is an example of which type of network?",
    options: ["LAN", "MAN", "WAN", "PAN"],
    correctIndex: 2,
    explanation: "The Internet is the world's largest WAN (Wide Area Network), spanning the entire globe.",
  },
  {
    question: "BitTorrent file sharing is an example of which architecture?",
    options: ["Client-Server", "Peer-to-Peer", "Hybrid", "Mainframe-Terminal"],
    correctIndex: 1,
    explanation: "BitTorrent is a classic peer-to-peer system where users download files from and upload to other peers without a central server.",
  },
  {
    question: "A city-wide cable TV network connecting multiple neighborhoods is best classified as:",
    options: ["LAN", "MAN", "WAN", "Personal Area Network"],
    correctIndex: 1,
    explanation: "A city-wide cable TV network spans a metropolitan area (1-100 km), making it a MAN (Metropolitan Area Network).",
  },
];

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export default function CN_L1_WhatIsNetworkActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "explore",
      label: "Explore",
      icon: <Network className="w-4 h-4" />,
      content: <NetworkTypeExplorer />,
    },
    {
      id: "models",
      label: "Models",
      icon: <ArrowRightLeft className="w-4 h-4" />,
      content: <ClientServerVsP2P />,
    },
    {
      id: "practice",
      label: "Practice",
      icon: <CheckCircle2 className="w-4 h-4" />,
      content: <PracticeClassify />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="What is a Computer Network?"
      level={1}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Network Topologies"
      gateRelevance="1 mark"
      placementRelevance="Low"
    />
  );
}
