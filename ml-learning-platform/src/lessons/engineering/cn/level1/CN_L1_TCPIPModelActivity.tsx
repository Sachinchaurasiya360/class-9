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
/*  TAB 1 — TCP/IP Model Explorer                                     */
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
      <h3 style={sectionTitle}>TCP/IP Model — 4 Layers</h3>
      <p style={sectionDesc}>
        The TCP/IP model is a practical, implementation-focused model with 4 layers. Click each layer to explore its protocols and purpose.
      </p>

      {/* Visual layer stack as SVG */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 560 320" style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width="560" height="320" fill="#fafbfd" />

          <text x="280" y="24" textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", fontWeight: 700 }}>
            TCP/IP Protocol Suite
          </text>

          {TCPIP_LAYERS.map((l, idx) => {
            const yPos = 40 + idx * 68;
            const isSelected = selectedLayer === l.number;

            return (
              <g
                key={l.number}
                style={{ cursor: "pointer" }}
                onClick={() => setSelectedLayer(l.number)}
              >
                {/* Layer background */}
                <rect
                  x="60" y={yPos}
                  width="440" height="58"
                  rx="10"
                  fill={isSelected ? `${l.color}18` : `${l.color}08`}
                  stroke={isSelected ? l.color : `${l.color}40`}
                  strokeWidth={isSelected ? 2.5 : 1}
                  style={{ transition: "all 0.3s ease" }}
                />

                {/* Selection indicator */}
                {isSelected && (
                  <rect
                    x="60" y={yPos}
                    width="5" height="58"
                    rx="2"
                    fill={l.color}
                    className="eng-fadeIn"
                  />
                )}

                {/* Layer number */}
                <circle
                  cx="95" cy={yPos + 29}
                  r="15"
                  fill={isSelected ? l.color : `${l.color}30`}
                  style={{ transition: "fill 0.3s ease" }}
                />
                <text x="95" y={yPos + 33} textAnchor="middle" fill={isSelected ? "#fff" : l.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.72rem", fontWeight: 700 }}>
                  L{l.number}
                </text>

                {/* Layer name */}
                <text x="125" y={yPos + 25} fill={isSelected ? l.color : "var(--eng-text)"} style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", fontWeight: 700 }}>
                  {l.name}
                </text>

                {/* Protocol tags */}
                {l.protocols.slice(0, 4).map((p, pi) => (
                  <g key={pi}>
                    <rect
                      x={125 + pi * 65} y={yPos + 34}
                      width="58" height="18"
                      rx="4"
                      fill={isSelected ? `${p.color}20` : "#f1f5f9"}
                      stroke={isSelected ? `${p.color}60` : "#e2e8f0"}
                      strokeWidth="0.5"
                      style={{ transition: "all 0.3s ease" }}
                    />
                    <text
                      x={125 + pi * 65 + 29} y={yPos + 47}
                      textAnchor="middle"
                      fill={isSelected ? p.color : "var(--eng-text-muted)"}
                      style={{ fontFamily: "var(--eng-font)", fontSize: "0.48rem", fontWeight: 600 }}
                    >
                      {p.name}
                    </text>
                  </g>
                ))}
                {l.protocols.length > 4 && (
                  <text x={125 + 4 * 65 + 8} y={yPos + 47} fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.48rem" }}>
                    +{l.protocols.length - 4} more
                  </text>
                )}

                {/* Click hint */}
                {!isSelected && (
                  <text x="480" y={yPos + 33} textAnchor="end" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", opacity: 0.5 }}>
                    Click to explore
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected layer details */}
      <div
        className="card-eng eng-fadeIn"
        key={selectedLayer}
        style={{ padding: 20, borderLeft: `4px solid ${layer.color}` }}
      >
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: layer.color }}>
            Layer {layer.number}: {layer.name}
          </span>
          <span className="tag-eng" style={{ background: `${layer.color}15`, color: layer.color, fontSize: "0.65rem" }}>
            Maps to: {layer.osiMapping}
          </span>
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6, margin: "0 0 16px" }}>
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
/*  TAB 2 — OSI vs TCP/IP Comparison                                   */
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
/*  TAB 3 — Protocol Mini Demos                                        */
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
      "Client sends ACK (acknowledge) — connection established!",
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

function ProtocolMiniDemos() {
  const [selectedProto, setSelectedProto] = useState<string>("http");
  const [currentStep, setCurrentStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);

  const proto = PROTOCOL_DEMOS.find((p) => p.id === selectedProto)!;

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
    }, 1200);
    return () => clearInterval(interval);
  }, [autoPlay, proto.steps.length]);

  return (
    <div>
      <h3 style={sectionTitle}>Protocol Mini Demos</h3>
      <p style={sectionDesc}>
        Select a protocol to see a step-by-step animated demonstration of how it works.
      </p>

      {/* Protocol selector */}
      <div className="flex gap-2 flex-wrap" style={{ marginBottom: 20 }}>
        {PROTOCOL_DEMOS.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedProto(p.id)}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              border: selectedProto === p.id ? `2px solid ${p.color}` : "1.5px solid var(--eng-border)",
              background: selectedProto === p.id ? `${p.color}11` : "var(--eng-surface)",
              color: selectedProto === p.id ? p.color : "var(--eng-text)",
              fontFamily: "var(--eng-font)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Protocol info */}
      <div className="card-eng eng-fadeIn" key={selectedProto} style={{ padding: 20, borderLeft: `4px solid ${proto.color}`, marginBottom: 16 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
          <span style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: proto.color }}>
            {proto.name}
          </span>
          <span className="tag-eng" style={{ background: `${proto.color}15`, color: proto.color }}>
            {proto.layer}
          </span>
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0 }}>
          {proto.shortDesc}
        </p>
      </div>

      {/* SVG step animation */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <svg viewBox="0 0 560 200" style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width="560" height="200" fill="#fafbfd" />

          {/* Step indicators */}
          {proto.steps.map((_, i) => {
            const x = 40 + (i * (480 / (proto.steps.length - 1 || 1)));
            const isActive = i <= currentStep;
            const isCurrent = i === currentStep;

            return (
              <g key={i}>
                {/* Connection line to next step */}
                {i < proto.steps.length - 1 && (
                  <line
                    x1={x + 14}
                    y1="40"
                    x2={40 + ((i + 1) * (480 / (proto.steps.length - 1 || 1))) - 14}
                    y2="40"
                    stroke={i < currentStep ? proto.color : "#e2e8f0"}
                    strokeWidth="2"
                    style={{ transition: "stroke 0.4s ease" }}
                  />
                )}

                {/* Step circle */}
                <circle
                  cx={x} cy="40" r={isCurrent ? 16 : 12}
                  fill={isActive ? `${proto.color}20` : "#f1f5f9"}
                  stroke={isActive ? proto.color : "#e2e8f0"}
                  strokeWidth={isCurrent ? 2.5 : 1.5}
                  style={{ transition: "all 0.3s ease", cursor: "pointer" }}
                  onClick={() => setCurrentStep(i)}
                />
                <text
                  x={x} y="44"
                  textAnchor="middle"
                  fill={isActive ? proto.color : "var(--eng-text-muted)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: isCurrent ? "0.7rem" : "0.6rem", fontWeight: 700 }}
                >
                  {i + 1}
                </text>

                {/* Pulse ring on current step */}
                {isCurrent && (
                  <circle cx={x} cy="40" r="16" fill="none" stroke={proto.color} strokeWidth="1.5">
                    <animate attributeName="r" values="16;24" dur="1.2s" repeatCount="indefinite" />
                    <animate attributeName="stroke-opacity" values="0.5;0" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Current step text */}
          <foreignObject x="40" y="75" width="480" height="100">
            <div
              style={{
                fontFamily: "var(--eng-font)",
                fontSize: "0.88rem",
                color: "var(--eng-text)",
                lineHeight: 1.6,
                textAlign: "center",
                padding: "10px 20px",
              }}
            >
              <span style={{ fontWeight: 600, color: proto.color }}>Step {currentStep + 1}: </span>
              {proto.steps[currentStep]}
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
          className="btn-eng-outline"
          style={{ fontSize: "0.82rem", opacity: currentStep === 0 ? 0.4 : 1 }}
        >
          Previous
        </button>
        <button
          onClick={() => { setCurrentStep(0); setAutoPlay(true); }}
          className="btn-eng"
          style={{ fontSize: "0.82rem" }}
        >
          <Play className="w-3.5 h-3.5" /> Play All
        </button>
        <button
          onClick={() => setCurrentStep((s) => Math.min(proto.steps.length - 1, s + 1))}
          disabled={currentStep >= proto.steps.length - 1}
          className="btn-eng-outline"
          style={{ fontSize: "0.82rem", opacity: currentStep >= proto.steps.length - 1 ? 0.4 : 1 }}
        >
          Next
        </button>
      </div>
    </div>
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
      gateRelevance="1-2 marks"
      placementRelevance="Low"
    />
  );
}
