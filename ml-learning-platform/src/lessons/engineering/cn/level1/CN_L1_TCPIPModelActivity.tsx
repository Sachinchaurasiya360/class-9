"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Server,
  Layers,
  ArrowLeftRight,
  Globe,
  Shield,
  Wifi,
  ChevronRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Network,
  Zap,
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
/*  TCP/IP Layer Data                                                  */
/* ================================================================== */

interface TCPIPLayer {
  number: number;
  name: string;
  color: string;
  osiMapping: string;
  description: string;
  protocols: { name: string; desc: string; color: string }[];
}

const TCPIP_LAYERS: TCPIPLayer[] = [
  {
    number: 4,
    name: "Application",
    color: "#ef4444",
    osiMapping: "Application + Presentation + Session (L7, L6, L5)",
    description:
      "Combines OSI layers 5-7. Provides process-to-process communication for applications. Handles high-level protocols, data representation, and session management.",
    protocols: [
      { name: "HTTP", desc: "Web page transfer (HyperText Transfer Protocol)", color: "#ef4444" },
      { name: "HTTPS", desc: "Secure web transfer using TLS", color: "#ef4444" },
      { name: "FTP", desc: "File Transfer Protocol", color: "#f97316" },
      { name: "SMTP", desc: "Simple Mail Transfer Protocol (sending email)", color: "#f97316" },
      { name: "DNS", desc: "Domain Name System (name to IP resolution)", color: "#f59e0b" },
      { name: "SSH", desc: "Secure Shell (remote access)", color: "#f59e0b" },
      { name: "DHCP", desc: "Dynamic Host Configuration Protocol", color: "#f59e0b" },
    ],
  },
  {
    number: 3,
    name: "Transport",
    color: "#10b981",
    osiMapping: "Transport (L4)",
    description:
      "Provides end-to-end communication between hosts. Responsible for segmentation, flow control, and reliability. Maps directly to OSI Layer 4.",
    protocols: [
      { name: "TCP", desc: "Transmission Control Protocol (reliable, connection-oriented)", color: "#10b981" },
      { name: "UDP", desc: "User Datagram Protocol (fast, connectionless)", color: "#059669" },
    ],
  },
  {
    number: 2,
    name: "Internet",
    color: "#3b82f6",
    osiMapping: "Network (L3)",
    description:
      "Handles logical addressing and routing across networks. Responsible for packaging data into packets and determining the best path. Maps to OSI Layer 3.",
    protocols: [
      { name: "IP (v4/v6)", desc: "Internet Protocol (addressing and routing)", color: "#3b82f6" },
      { name: "ICMP", desc: "Internet Control Message Protocol (error messages, ping)", color: "#6366f1" },
      { name: "ARP", desc: "Address Resolution Protocol (IP to MAC)", color: "#8b5cf6" },
      { name: "IGMP", desc: "Internet Group Management Protocol (multicast)", color: "#6366f1" },
    ],
  },
  {
    number: 1,
    name: "Network Access",
    color: "#8b5cf6",
    osiMapping: "Data Link + Physical (L2, L1)",
    description:
      "Combines OSI layers 1-2. Handles physical transmission and framing. Responsible for how data is physically sent across the network medium.",
    protocols: [
      { name: "Ethernet", desc: "Wired LAN standard (IEEE 802.3)", color: "#8b5cf6" },
      { name: "Wi-Fi", desc: "Wireless LAN (IEEE 802.11)", color: "#a855f7" },
      { name: "PPP", desc: "Point-to-Point Protocol (serial links)", color: "#7c3aed" },
      { name: "ARP*", desc: "Also operates at this level for MAC resolution", color: "#6d28d9" },
    ],
  },
];

/* ================================================================== */
/*  OSI Layer Data (for comparison)                                    */
/* ================================================================== */

interface OSICompareLayer {
  number: number;
  name: string;
  color: string;
  tcpipLayer: number; // which TCP/IP layer it maps to
}

const OSI_COMPARE: OSICompareLayer[] = [
  { number: 7, name: "Application", color: "#ef4444", tcpipLayer: 4 },
  { number: 6, name: "Presentation", color: "#f97316", tcpipLayer: 4 },
  { number: 5, name: "Session", color: "#f59e0b", tcpipLayer: 4 },
  { number: 4, name: "Transport", color: "#10b981", tcpipLayer: 3 },
  { number: 3, name: "Network", color: "#3b82f6", tcpipLayer: 2 },
  { number: 2, name: "Data Link", color: "#8b5cf6", tcpipLayer: 1 },
  { number: 1, name: "Physical", color: "#6b7280", tcpipLayer: 1 },
];

/* ================================================================== */
/*  Layer detail header                                                */
/* ================================================================== */

function parseOsiMapping(s: string): { numbers: number[]; names: string } {
  const match = s.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (!match) return { numbers: [], names: s };
  const names = match[1].trim();
  const numbers = Array.from(match[2].matchAll(/L(\d+)/g)).map((m) => parseInt(m[1], 10));
  return { numbers, names };
}

function LayerDetailHeader({ layer }: { layer: TCPIPLayer }) {
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const { numbers, names } = parseOsiMapping(layer.osiMapping);

  return (
    <div style={{ display: "flex", alignItems: "stretch", gap: 16 }}>
      {/* Display stat: big layer number */}
      <div
        style={{
          flexShrink: 0,
          width: 72,
          padding: "8px 0",
          background: `${layer.color}10`,
          border: `1px solid ${layer.color}40`,
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <span style={{ fontFamily: mono, fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.14em", color: layer.color, opacity: 0.8 }}>
          LAYER
        </span>
        <span style={{ fontFamily: mono, fontSize: "2rem", fontWeight: 800, color: layer.color, lineHeight: 1, letterSpacing: "-0.02em" }}>
          {layer.number}
        </span>
      </div>

      {/* Title + OSI mapping */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 8 }}>
        <h4
          style={{
            margin: 0,
            fontFamily: "var(--eng-font)",
            fontSize: "1.35rem",
            fontWeight: 700,
            color: "var(--eng-text)",
            letterSpacing: "-0.01em",
            lineHeight: 1.15,
          }}
        >
          {layer.name}
        </h4>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span style={{ fontFamily: mono, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", color: "var(--eng-text-muted)" }}>
            MAPS TO OSI
          </span>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
            {numbers.map((n, i) => (
              <span key={n} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    padding: "3px 8px",
                    fontFamily: mono,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: layer.color,
                    background: `${layer.color}14`,
                    border: `1px solid ${layer.color}50`,
                    borderRadius: 4,
                  }}
                >
                  L{n}
                </span>
                {i < numbers.length - 1 && (
                  <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem", opacity: 0.6 }}>+</span>
                )}
              </span>
            ))}
          </div>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)", fontStyle: "italic" }}>
            {names}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Protocol Stack (Tab 1 visualization)                               */
/* ================================================================== */

const TCPIP_PDU: Record<number, string> = {
  4: "Data",
  3: "Segment / Datagram",
  2: "Packet",
  1: "Frame",
};

function ProtocolStack({
  layers,
  selected,
  onSelect,
  animPhase,
}: {
  layers: TCPIPLayer[];
  selected: number;
  onSelect: (n: number) => void;
  animPhase: number;
}) {
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const [direction, setDirection] = useState<"send" | "receive">("send");

  return (
    <div
      style={{
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
        borderRadius: "var(--eng-radius)",
        overflow: "hidden",
        marginBottom: 20,
        boxShadow: "var(--eng-shadow)",
      }}
    >
      {/* Header band */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 18px",
          borderBottom: "1px solid var(--eng-border)",
          background: "var(--eng-bg)",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: mono, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: "var(--eng-text-muted)" }}>
            PROTOCOL SUITE
          </span>
          <span style={{ fontFamily: mono, fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-text)" }}>
            TCP/IP &middot; 4 layers
          </span>
        </div>
        <div
          style={{
            display: "inline-flex",
            padding: 2,
            background: "var(--eng-surface)",
            border: "1px solid var(--eng-border)",
            borderRadius: 6,
          }}
        >
          {(["send", "receive"] as const).map((d) => {
            const active = direction === d;
            return (
              <button
                key={d}
                onClick={() => setDirection(d)}
                style={{
                  padding: "4px 10px",
                  fontFamily: mono,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  border: "none",
                  borderRadius: 4,
                  background: active ? "var(--eng-primary)" : "transparent",
                  color: active ? "#fff" : "var(--eng-text-muted)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {d === "send" ? "▼ send" : "▲ receive"}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stack body */}
      <div style={{ display: "grid", gridTemplateColumns: "52px 1fr", padding: "18px 18px 22px" }}>
        {/* Left rail: flow indicator */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 10 }}>
          <div style={{ fontFamily: mono, fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--eng-text-muted)", marginBottom: 6, writingMode: "horizontal-tb" }}>
            FLOW
          </div>
          <div
            style={{
              flex: 1,
              width: 2,
              background: "var(--eng-border)",
              position: "relative",
              overflow: "hidden",
              borderRadius: 1,
            }}
          >
            <div
              key={`flow-${direction}-${animPhase}`}
              style={{
                position: "absolute",
                left: -3,
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--eng-primary)",
                animation: `flow-${direction} 2.4s ease-in-out infinite`,
              }}
            />
          </div>
          <style>{`
            @keyframes flow-send {
              0% { top: 0%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 100%; opacity: 0; }
            }
            @keyframes flow-receive {
              0% { top: 100%; opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { top: 0%; opacity: 0; }
            }
          `}</style>
        </div>

        {/* Right: layer plates */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {layers.map((l, i) => {
            const isSelected = selected === l.number;
            const pdu = TCPIP_PDU[l.number];
            return (
              <button
                key={l.number}
                onClick={() => onSelect(l.number)}
                aria-pressed={isSelected}
                style={{
                  position: "relative",
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "68px 1fr auto",
                  alignItems: "stretch",
                  gap: 14,
                  padding: "14px 16px",
                  background: isSelected ? `${l.color}0e` : "var(--eng-surface)",
                  border: isSelected ? `1.5px solid ${l.color}` : "1px solid var(--eng-border)",
                  borderRadius: 10,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  transform: isSelected ? "translateX(2px)" : "none",
                  boxShadow: isSelected ? `0 2px 10px ${l.color}22` : "none",
                  fontFamily: "var(--eng-font)",
                  animationDelay: `${i * 60}ms`,
                }}
                className="eng-fadeIn"
              >
                {/* Display number */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingRight: 12,
                    borderRight: `1px solid ${isSelected ? `${l.color}40` : "var(--eng-border)"}`,
                  }}
                >
                  <span style={{ fontFamily: mono, fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.12em", color: l.color }}>
                    LAYER
                  </span>
                  <span style={{ fontFamily: mono, fontSize: "1.75rem", fontWeight: 800, color: l.color, lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {l.number}
                  </span>
                </div>

                {/* Center: name + protocols */}
                <div style={{ minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <h4 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 700, color: isSelected ? l.color : "var(--eng-text)", letterSpacing: "-0.01em" }}>
                      {l.name}
                    </h4>
                    <span style={{ fontFamily: mono, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.1em", color: "var(--eng-text-muted)" }}>
                      PDU &middot; <span style={{ color: "var(--eng-text)" }}>{pdu}</span>
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {l.protocols.map((p) => (
                      <span
                        key={p.name}
                        style={{
                          padding: "2px 7px",
                          fontFamily: mono,
                          fontSize: "0.68rem",
                          fontWeight: 600,
                          color: isSelected ? p.color : "var(--eng-text-muted)",
                          background: isSelected ? `${p.color}12` : "var(--eng-bg)",
                          border: `1px solid ${isSelected ? `${p.color}50` : "var(--eng-border)"}`,
                          borderRadius: 3,
                          transition: "all 0.25s ease",
                        }}
                      >
                        {p.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right: indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {isSelected ? (
                    <span
                      style={{
                        fontFamily: mono,
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        color: l.color,
                        padding: "3px 8px",
                        background: `${l.color}12`,
                        border: `1px solid ${l.color}50`,
                        borderRadius: 4,
                      }}
                    >
                      ACTIVE
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--eng-text-muted)", opacity: 0.5 }} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 1 - TCP/IP Model Explorer                                     */
/* ================================================================== */

function TCPIPModelExplorer() {
  const [selectedLayer, setSelectedLayer] = useState<number>(4);
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    setAnimPhase(0);
    const t = setTimeout(() => setAnimPhase(1), 150);
    return () => clearTimeout(t);
  }, [selectedLayer]);

  const layer = TCPIP_LAYERS.find((l) => l.number === selectedLayer)!;

  return (
    <div>
      <h3 style={sectionTitle}>TCP/IP Model - 4 Layers</h3>
      <p style={sectionDesc}>
        The TCP/IP model is a practical, implementation-focused model with 4 layers. Click each layer to explore its protocols and purpose.
      </p>

      {/* Protocol stack */}
      <ProtocolStack
        layers={TCPIP_LAYERS}
        selected={selectedLayer}
        onSelect={setSelectedLayer}
        animPhase={animPhase}
      />

      {/* Selected layer details */}
      <div className="card-eng eng-fadeIn" key={selectedLayer} style={{ padding: 20 }}>
        <LayerDetailHeader layer={layer} />
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", color: "var(--eng-text)", lineHeight: 1.65, margin: "16px 0 18px" }}>
          {layer.description}
        </p>

        {/* Protocol grid */}
        <h5 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.8rem", color: "var(--eng-text)", margin: "0 0 10px" }}>
          Protocols at this layer:
        </h5>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {layer.protocols.map((p) => (
            <div
              key={p.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 8,
                background: "#f8fafc",
                border: "1px solid var(--eng-border)",
              }}
            >
              <span className="tag-eng" style={{ background: `${p.color}15`, color: p.color, fontWeight: 700, fontSize: "0.7rem", flexShrink: 0 }}>
                {p.name}
              </span>
              <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)" }}>
                {p.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 - OSI vs TCP/IP Comparison                                   */
/* ================================================================== */

function OSIvsTCPIPComparison() {
  const [showMapping, setShowMapping] = useState(false);
  const [hoveredOSI, setHoveredOSI] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowMapping(true), 500);
    return () => clearTimeout(t);
  }, []);

  const svgWidth = 560;
  const svgHeight = 440;
  const osiX = 80;
  const tcpipX = 380;
  const layerWidth = 150;

  // OSI layer heights (top to bottom)
  const osiLayers = OSI_COMPARE;
  const osiLayerH = 42;
  const osiGap = 4;
  const osiStartY = 50;

  // TCP/IP layer heights (variable to show mapping)
  const tcpipLayerHeights = [
    { layer: TCPIP_LAYERS[0], height: osiLayerH * 3 + osiGap * 2, y: osiStartY }, // Application (maps to 3 OSI layers)
    { layer: TCPIP_LAYERS[1], height: osiLayerH, y: osiStartY + (osiLayerH + osiGap) * 3 }, // Transport
    { layer: TCPIP_LAYERS[2], height: osiLayerH, y: osiStartY + (osiLayerH + osiGap) * 4 }, // Internet
    { layer: TCPIP_LAYERS[3], height: osiLayerH * 2 + osiGap, y: osiStartY + (osiLayerH + osiGap) * 5 }, // Network Access
  ];

  return (
    <div>
      <h3 style={sectionTitle}>OSI vs TCP/IP Comparison</h3>
      <p style={sectionDesc}>
        See how the 7 OSI layers map to the 4 TCP/IP layers. Hover over OSI layers to highlight the mapping.
      </p>

      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width={svgWidth} height={svgHeight} fill="#fafbfd" />

          {/* Headers */}
          <text x={osiX + layerWidth / 2} y="35" textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 700 }}>
            OSI Model (7 Layers)
          </text>
          <text x={tcpipX + layerWidth / 2} y="35" textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 700 }}>
            TCP/IP Model (4 Layers)
          </text>

          {/* OSI Layers */}
          {osiLayers.map((l, idx) => {
            const yPos = osiStartY + idx * (osiLayerH + osiGap);
            const isHovered = hoveredOSI === l.number;
            const tcpipTarget = TCPIP_LAYERS.find((t) => t.number === l.tcpipLayer)!;

            return (
              <g
                key={l.number}
                onMouseEnter={() => setHoveredOSI(l.number)}
                onMouseLeave={() => setHoveredOSI(null)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x={osiX} y={yPos}
                  width={layerWidth} height={osiLayerH}
                  rx="6"
                  fill={isHovered ? `${l.color}25` : `${l.color}12`}
                  stroke={isHovered ? l.color : `${l.color}50`}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: "all 0.2s ease" }}
                />
                <text
                  x={osiX + 10} y={yPos + 17}
                  fill={isHovered ? l.color : "var(--eng-text)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.62rem", fontWeight: 600 }}
                >
                  Layer {l.number}
                </text>
                <text
                  x={osiX + 10} y={yPos + 32}
                  fill={isHovered ? l.color : "var(--eng-text-muted)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.58rem" }}
                >
                  {l.name}
                </text>
              </g>
            );
          })}

          {/* TCP/IP Layers */}
          {tcpipLayerHeights.map((item) => {
            const l = item.layer;
            const isHighlighted = hoveredOSI !== null && OSI_COMPARE.find((o) => o.number === hoveredOSI)?.tcpipLayer === l.number;

            return (
              <g key={l.number}>
                <rect
                  x={tcpipX} y={item.y}
                  width={layerWidth} height={item.height}
                  rx="6"
                  fill={isHighlighted ? `${l.color}25` : `${l.color}12`}
                  stroke={isHighlighted ? l.color : `${l.color}50`}
                  strokeWidth={isHighlighted ? 2.5 : 1}
                  style={{ transition: "all 0.2s ease" }}
                />
                <text
                  x={tcpipX + layerWidth / 2}
                  y={item.y + item.height / 2 - 4}
                  textAnchor="middle"
                  fill={isHighlighted ? l.color : "var(--eng-text)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.68rem", fontWeight: 700, transition: "fill 0.2s ease" }}
                >
                  Layer {l.number}
                </text>
                <text
                  x={tcpipX + layerWidth / 2}
                  y={item.y + item.height / 2 + 12}
                  textAnchor="middle"
                  fill={isHighlighted ? l.color : "var(--eng-text-muted)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", transition: "fill 0.2s ease" }}
                >
                  {l.name}
                </text>
              </g>
            );
          })}

          {/* Mapping lines */}
          {showMapping && osiLayers.map((l, idx) => {
            const osiYCenter = osiStartY + idx * (osiLayerH + osiGap) + osiLayerH / 2;
            const tcpipItem = tcpipLayerHeights.find((t) => t.layer.number === l.tcpipLayer)!;
            const tcpipYCenter = tcpipItem.y + tcpipItem.height / 2;
            const isHovered = hoveredOSI === l.number;

            return (
              <line
                key={`map-${l.number}`}
                x1={osiX + layerWidth}
                y1={osiYCenter}
                x2={tcpipX}
                y2={tcpipYCenter}
                stroke={isHovered ? l.color : `${l.color}30`}
                strokeWidth={isHovered ? 2.5 : 1}
                strokeDasharray={isHovered ? "none" : "4 4"}
                style={{
                  transition: "all 0.3s ease",
                  opacity: showMapping ? 1 : 0,
                }}
              />
            );
          })}

          {/* Legend */}
          <text x="280" y={svgHeight - 20} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem" }}>
            Hover over OSI layers to see the mapping
          </text>
        </svg>
      </div>

      {/* Key differences table */}
      <div className="card-eng" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid var(--eng-border)", fontWeight: 600, fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>Feature</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid #3b82f6", fontWeight: 600, fontSize: "0.72rem", color: "#3b82f6" }}>OSI Model</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid #10b981", fontWeight: 600, fontSize: "0.72rem", color: "#10b981" }}>TCP/IP Model</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Layers", "7 layers", "4 layers"],
              ["Nature", "Theoretical/Reference", "Practical/Implementation"],
              ["Developed by", "ISO", "DARPA (US DoD)"],
              ["Layer Independence", "Each layer strictly defined", "Layers more loosely defined"],
              ["Transport", "Connection-oriented only", "Both connection-oriented (TCP) and connectionless (UDP)"],
              ["Used in", "Teaching & reference", "Real-world Internet"],
            ].map(([feat, osi, tcpip], i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "var(--eng-surface)" : "#fafbfd" }}>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", fontWeight: 600, color: "var(--eng-text)" }}>{feat}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text)" }}>{osi}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text)" }}>{tcpip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 - Protocol Mini Demos                                        */
/* ================================================================== */

interface ProtocolDemo {
  id: string;
  name: string;
  layer: string;
  color: string;
  shortDesc: string;
  steps: string[];
}

const PROTOCOL_DEMOS: ProtocolDemo[] = [
  {
    id: "http",
    name: "HTTP",
    layer: "Application",
    color: "#ef4444",
    shortDesc: "Web browser requests a page from a server",
    steps: [
      "Client sends HTTP GET request to server",
      "Request travels through Transport (TCP), Internet (IP), Network Access layers",
      "Server processes request, finds the webpage",
      "Server sends HTTP 200 OK response with HTML content",
      "Browser renders the webpage",
    ],
  },
  {
    id: "tcp",
    name: "TCP",
    layer: "Transport",
    color: "#10b981",
    shortDesc: "Reliable connection with 3-way handshake",
    steps: [
      "Client sends SYN (synchronize) packet to server",
      "Server responds with SYN-ACK (synchronize-acknowledge)",
      "Client sends ACK (acknowledge) - connection established!",
      "Data transfer begins with acknowledgment for each segment",
      "Connection closed with FIN/ACK exchange (4-way handshake)",
    ],
  },
  {
    id: "ip",
    name: "IP",
    layer: "Internet",
    color: "#3b82f6",
    shortDesc: "Routes packets across networks using IP addresses",
    steps: [
      "Source device creates a packet with source and destination IP",
      "Packet reaches the router at the local network",
      "Router examines destination IP, looks up routing table",
      "Packet is forwarded hop-by-hop across routers",
      "Packet arrives at destination network and is delivered",
    ],
  },
  {
    id: "arp",
    name: "ARP",
    layer: "Internet/Network Access",
    color: "#8b5cf6",
    shortDesc: "Resolves IP addresses to MAC addresses",
    steps: [
      "Device knows destination IP but needs the MAC address",
      "Sends ARP broadcast: 'Who has IP 192.168.1.5?'",
      "All devices on LAN receive the broadcast",
      "Device with that IP responds: 'I have it! My MAC is AA:BB:CC:DD:EE:FF'",
      "Sender caches the MAC address for future use",
    ],
  },
  {
    id: "icmp",
    name: "ICMP",
    layer: "Internet",
    color: "#6366f1",
    shortDesc: "Error reporting and diagnostics (ping/traceroute)",
    steps: [
      "You run 'ping google.com' in the terminal",
      "ICMP Echo Request packet is sent to Google's server",
      "The packet traverses multiple routers across the Internet",
      "Google's server receives it and sends ICMP Echo Reply",
      "Round-trip time is calculated and displayed (e.g., 15ms)",
    ],
  },
];

/* Sequence-diagram metadata per protocol */
interface SeqMeta {
  actors: [string, string];
  directions: ("ltr" | "rtl" | "self-l" | "self-r")[];
  labels: string[];
}
const SEQ_DIAGRAMS: Record<string, SeqMeta> = {
  http: {
    actors: ["Browser", "Web Server"],
    directions: ["ltr", "ltr", "self-r", "rtl", "self-l"],
    labels: ["GET /", "TCP/IP stack", "lookup", "200 OK", "render"],
  },
  tcp: {
    actors: ["Client", "Server"],
    directions: ["ltr", "rtl", "ltr", "ltr", "rtl"],
    labels: ["SYN", "SYN-ACK", "ACK", "data + ack", "FIN"],
  },
  ip: {
    actors: ["Host A", "Host B"],
    directions: ["self-l", "ltr", "self-r", "ltr", "rtl"],
    labels: ["pack", "→ router", "route", "hop-by-hop", "deliver"],
  },
  arp: {
    actors: ["Device", "LAN"],
    directions: ["self-l", "ltr", "self-r", "rtl", "self-l"],
    labels: ["need MAC", "ARP broadcast", "all receive", "I have it!", "cache"],
  },
  icmp: {
    actors: ["Your PC", "google.com"],
    directions: ["self-l", "ltr", "ltr", "rtl", "self-l"],
    labels: ["ping cmd", "Echo Request", "via routers", "Echo Reply", "RTT shown"],
  },
};

function ProtocolMiniDemos() {
  const [selectedProto, setSelectedProto] = useState<string>("http");
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const mono = '"SF Mono", Menlo, Consolas, monospace';

  const proto = PROTOCOL_DEMOS.find((p) => p.id === selectedProto)!;
  const seq = SEQ_DIAGRAMS[selectedProto];

  useEffect(() => {
    setCurrentStep(0);
    setAutoPlay(false);
  }, [selectedProto]);

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCurrentStep((s) => {
        if (s >= proto.steps.length - 1) {
          setAutoPlay(false);
          return s;
        }
        return s + 1;
      });
    }, 1400);
    return () => clearInterval(interval);
  }, [autoPlay, proto.steps.length]);

  return (
    <div>
      <h3 style={sectionTitle}>Protocol Mini Demos</h3>
      <p style={sectionDesc}>
        Select a protocol to follow a sequence diagram of how it actually works on the wire.
      </p>

      {/* Segmented protocol selector */}
      <div
        role="tablist"
        style={{
          display: "inline-flex",
          padding: 3,
          background: "var(--eng-bg)",
          border: "1px solid var(--eng-border)",
          borderRadius: 8,
          marginBottom: 20,
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        {PROTOCOL_DEMOS.map((p) => {
          const active = selectedProto === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={active}
              onClick={() => setSelectedProto(p.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                border: "none",
                background: active ? "var(--eng-surface)" : "transparent",
                boxShadow: active ? "var(--eng-shadow)" : "none",
                color: active ? p.color : "var(--eng-text-muted)",
                fontFamily: mono,
                fontWeight: 700,
                fontSize: "0.78rem",
                letterSpacing: "0.03em",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Main layout */}
      <div
        className="eng-fadeIn"
        key={selectedProto}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(260px, 320px) 1fr",
          gap: 16,
          marginBottom: 16,
        }}
      >
        {/* LEFT: step list */}
        <div
          style={{
            background: "var(--eng-surface)",
            border: "1px solid var(--eng-border)",
            borderRadius: "var(--eng-radius)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Protocol header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--eng-border)", background: "var(--eng-bg)" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
              <span style={{ fontFamily: mono, fontSize: "1.05rem", fontWeight: 800, color: proto.color, letterSpacing: "-0.01em" }}>
                {proto.name}
              </span>
              <span style={{ fontFamily: mono, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.12em", color: "var(--eng-text-muted)" }}>
                {proto.layer.toUpperCase()}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--eng-text-muted)", lineHeight: 1.45 }}>
              {proto.shortDesc}
            </p>
          </div>

          {/* Step list */}
          <ol style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {proto.steps.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              return (
                <li key={i}>
                  <button
                    onClick={() => setCurrentStep(i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: "10px 14px",
                      border: "none",
                      borderLeft: active ? `3px solid ${proto.color}` : "3px solid transparent",
                      borderBottom: i < proto.steps.length - 1 ? "1px solid var(--eng-border)" : "none",
                      background: active ? `${proto.color}0c` : "transparent",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      fontFamily: "var(--eng-font)",
                    }}
                  >
                    <span
                      style={{
                        flexShrink: 0,
                        width: 22,
                        height: 22,
                        borderRadius: 4,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: mono,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: done || active ? "white" : "var(--eng-text-muted)",
                        background: done ? `${proto.color}99` : active ? proto.color : "var(--eng-border)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {done ? "✓" : String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: active ? "var(--eng-text)" : done ? "var(--eng-text-muted)" : "var(--eng-text)",
                        lineHeight: 1.5,
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {step}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* RIGHT: sequence diagram */}
        <div
          style={{
            background: "var(--eng-surface)",
            border: "1px solid var(--eng-border)",
            borderRadius: "var(--eng-radius)",
            overflow: "hidden",
          }}
        >
          <SequenceDiagram seq={seq} currentStep={currentStep} color={proto.color} />
        </div>
      </div>

      {/* Controls row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          padding: "10px 14px",
          background: "var(--eng-surface)",
          border: "1px solid var(--eng-border)",
          borderRadius: "var(--eng-radius)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: mono, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--eng-text-muted)" }}>
            STEP
          </span>
          <span style={{ fontFamily: mono, fontSize: "0.95rem", fontWeight: 700, color: proto.color }}>
            {String(currentStep + 1).padStart(2, "0")}
            <span style={{ color: "var(--eng-text-muted)", fontWeight: 400 }}>/{String(proto.steps.length).padStart(2, "0")}</span>
          </span>
          <div style={{ width: 120, height: 4, background: "var(--eng-bg)", border: "1px solid var(--eng-border)", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${((currentStep + 1) / proto.steps.length) * 100}%`,
                height: "100%",
                background: proto.color,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => { setCurrentStep(0); setAutoPlay(false); }}
            className="btn-eng-outline"
            style={{ fontSize: "0.78rem", padding: "5px 10px" }}
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="btn-eng-outline"
            style={{ fontSize: "0.78rem", padding: "5px 12px", opacity: currentStep === 0 ? 0.4 : 1 }}
          >
            Prev
          </button>
          <button
            onClick={() => {
              if (autoPlay) { setAutoPlay(false); return; }
              if (currentStep >= proto.steps.length - 1) setCurrentStep(0);
              setAutoPlay(true);
            }}
            className="btn-eng"
            style={{ fontSize: "0.78rem", padding: "5px 12px", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            {autoPlay ? <><Pause className="w-3.5 h-3.5" /> Pause</> : <><Play className="w-3.5 h-3.5" /> Play</>}
          </button>
          <button
            onClick={() => setCurrentStep((s) => Math.min(proto.steps.length - 1, s + 1))}
            disabled={currentStep >= proto.steps.length - 1}
            className="btn-eng-outline"
            style={{ fontSize: "0.78rem", padding: "5px 12px", opacity: currentStep >= proto.steps.length - 1 ? 0.4 : 1 }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

function SequenceDiagram({ seq, currentStep, color }: { seq: SeqMeta; currentStep: number; color: string }) {
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const width = 520;
  const headerY = 46;
  const rowH = 48;
  const stepsCount = seq.directions.length;
  const height = headerY + 30 + stepsCount * rowH + 30;
  const leftX = 110;
  const rightX = width - 110;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "auto", display: "block", background: "var(--eng-bg)" }}>
      {/* Actor headers */}
      {[{ x: leftX, label: seq.actors[0] }, { x: rightX, label: seq.actors[1] }].map((a) => (
        <g key={a.label}>
          <rect x={a.x - 70} y={18} width={140} height={28} rx={6} fill="var(--eng-surface)" stroke={color} strokeWidth={1.5} />
          <text x={a.x} y={36} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: mono, fontSize: "0.72rem", fontWeight: 700 }}>
            {a.label}
          </text>
        </g>
      ))}

      {/* Lifelines */}
      <line x1={leftX} y1={headerY} x2={leftX} y2={height - 20} stroke="var(--eng-border)" strokeWidth="1" strokeDasharray="4 4" />
      <line x1={rightX} y1={headerY} x2={rightX} y2={height - 20} stroke="var(--eng-border)" strokeWidth="1" strokeDasharray="4 4" />

      {/* Arrow marker */}
      <defs>
        <marker id={`arrow-${color.replace("#", "")}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
        <marker id={`arrow-muted`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
        </marker>
      </defs>

      {/* Arrows per step */}
      {seq.directions.map((dir, i) => {
        const y = headerY + 30 + i * rowH + rowH / 2;
        const done = i < currentStep;
        const active = i === currentStep;
        const upcoming = i > currentStep;
        const stroke = active ? color : done ? `${color}80` : "#cbd5e1";
        const marker = upcoming ? "arrow-muted" : `arrow-${color.replace("#", "")}`;
        const opacity = upcoming ? 0.5 : 1;
        const strokeW = active ? 2.5 : 1.5;
        const label = seq.labels[i];

        let x1 = leftX, x2 = rightX;
        let selfLoop = false;
        let selfSide: "l" | "r" = "l";
        if (dir === "ltr") { x1 = leftX; x2 = rightX; }
        else if (dir === "rtl") { x1 = rightX; x2 = leftX; }
        else if (dir === "self-l") { selfLoop = true; selfSide = "l"; }
        else if (dir === "self-r") { selfLoop = true; selfSide = "r"; }

        if (selfLoop) {
          const cx = selfSide === "l" ? leftX : rightX;
          const loopSize = 22;
          const loopX = selfSide === "l" ? cx + 6 : cx - 6 - loopSize;
          return (
            <g key={i} style={{ opacity, transition: "opacity 0.3s ease" }}>
              <path
                d={`M ${cx} ${y - 10} C ${loopX + (selfSide === "l" ? loopSize : -loopSize) * (selfSide === "l" ? 1.5 : -1.5)} ${y - 14}, ${loopX + (selfSide === "l" ? loopSize : -loopSize) * (selfSide === "l" ? 1.5 : -1.5)} ${y + 14}, ${cx} ${y + 10}`}
                fill="none"
                stroke={stroke}
                strokeWidth={strokeW}
                markerEnd={`url(#${marker})`}
                style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
              />
              <text
                x={selfSide === "l" ? cx + 30 : cx - 30}
                y={y + 3}
                textAnchor={selfSide === "l" ? "start" : "end"}
                fill={active ? color : "var(--eng-text-muted)"}
                style={{ fontFamily: mono, fontSize: "0.7rem", fontWeight: active ? 700 : 500 }}
              >
                {label}
              </text>
            </g>
          );
        }

        const midX = (x1 + x2) / 2;
        return (
          <g key={i} style={{ opacity, transition: "opacity 0.3s ease" }}>
            <line
              x1={x1}
              y1={y}
              x2={x2}
              y2={y}
              stroke={stroke}
              strokeWidth={strokeW}
              markerEnd={`url(#${marker})`}
              style={{ transition: "stroke 0.3s ease, stroke-width 0.3s ease" }}
            />
            <rect
              x={midX - label.length * 3.6 - 6}
              y={y - 16}
              width={label.length * 7.2 + 12}
              height={16}
              rx={3}
              fill="var(--eng-surface)"
              stroke={active ? color : "var(--eng-border)"}
              strokeWidth={active ? 1.5 : 1}
            />
            <text
              x={midX}
              y={y - 5}
              textAnchor="middle"
              fill={active ? color : "var(--eng-text)"}
              style={{ fontFamily: mono, fontSize: "0.7rem", fontWeight: active ? 700 : 500 }}
            >
              {label}
            </text>
            {active && (
              <circle cx={dir === "ltr" ? x2 : x1} cy={y} r="6" fill={color} opacity="0.4">
                <animate attributeName="r" values="6;14" dur="1.2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="1.2s" repeatCount="indefinite" />
              </circle>
            )}
            <text
              x={x1 < x2 ? x1 - 6 : x1 + 6}
              y={y + 4}
              textAnchor={x1 < x2 ? "end" : "start"}
              fill={active ? color : "var(--eng-text-muted)"}
              style={{ fontFamily: mono, fontSize: "0.6rem", fontWeight: 700 }}
            >
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ================================================================== */
/*  QUIZ                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "How many layers does the TCP/IP model have?",
    options: ["3", "4", "5", "7"],
    correctIndex: 1,
    explanation: "The TCP/IP model has 4 layers: Application, Transport, Internet, and Network Access.",
  },
  {
    question: "Which TCP/IP layer combines OSI layers 5, 6, and 7?",
    options: ["Transport", "Internet", "Application", "Network Access"],
    correctIndex: 2,
    explanation: "The TCP/IP Application layer combines the functions of the OSI Session, Presentation, and Application layers into one.",
  },
  {
    question: "The TCP/IP Internet layer corresponds to which OSI layer?",
    options: ["Transport (L4)", "Network (L3)", "Data Link (L2)", "Session (L5)"],
    correctIndex: 1,
    explanation: "The TCP/IP Internet layer maps directly to the OSI Network layer (Layer 3), handling IP addressing and routing.",
  },
  {
    question: "Which protocol operates at the TCP/IP Transport layer and provides reliable delivery?",
    options: ["IP", "HTTP", "TCP", "ARP"],
    correctIndex: 2,
    explanation: "TCP (Transmission Control Protocol) operates at the Transport layer and provides reliable, connection-oriented data delivery with error checking and flow control.",
  },
  {
    question: "Which is true about the TCP/IP model compared to the OSI model?",
    options: [
      "TCP/IP is theoretical only",
      "TCP/IP was developed after OSI",
      "TCP/IP is the practical model used on the Internet",
      "TCP/IP has more layers than OSI",
    ],
    correctIndex: 2,
    explanation: "The TCP/IP model is the practical, implementation-based model that actually runs the Internet. OSI is more of a theoretical reference model.",
  },
];

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export default function CN_L1_TCPIPModelActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "model",
      label: "Model",
      icon: <Layers className="w-4 h-4" />,
      content: <TCPIPModelExplorer />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      content: <OSIvsTCPIPComparison />,
    },
    {
      id: "protocols",
      label: "Protocols",
      icon: <Globe className="w-4 h-4" />,
      content: <ProtocolMiniDemos />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="The TCP/IP Model"
      level={1}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Switching Techniques"
      placementRelevance="Low"
    />
  );
}
