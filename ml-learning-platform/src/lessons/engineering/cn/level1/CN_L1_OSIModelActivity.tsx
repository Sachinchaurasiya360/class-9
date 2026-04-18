"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Play,
  RotateCcw,
  ArrowDown,
  ArrowUp,
  Globe,
  Shield,
  Wifi,
  Monitor,
  FileText,
  Zap,
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
/*  OSI Layer Data                                                     */
/* ================================================================== */

interface OSILayer {
  number: number;
  name: string;
  pdu: string;
  color: string;
  mnemonic: string;
  description: string;
  functions: string[];
  devices: string[];
  protocols: { name: string; desc: string }[];
}

const OSI_LAYERS: OSILayer[] = [
  {
    number: 7, name: "Application", pdu: "Data", color: "#ef4444", mnemonic: "All",
    description: "The closest layer to the user. Provides network services directly to applications like web browsers and email clients.",
    functions: ["Provide user interface", "Email, file transfer, web browsing", "Network virtual terminal"],
    devices: ["Gateways", "Firewalls (L7)"],
    protocols: [
      { name: "HTTP/HTTPS", desc: "Web page transfer protocol" },
      { name: "FTP", desc: "File Transfer Protocol" },
      { name: "SMTP", desc: "Email sending protocol" },
      { name: "DNS", desc: "Domain name resolution" },
      { name: "SSH", desc: "Secure remote access" },
    ],
  },
  {
    number: 6, name: "Presentation", pdu: "Data", color: "#f97316", mnemonic: "People",
    description: "Translates data between the application layer and the network. Handles encryption, compression, and data formatting.",
    functions: ["Data encryption/decryption", "Data compression", "Format conversion (JPEG, ASCII, EBCDIC)"],
    devices: ["Software-based"],
    protocols: [
      { name: "SSL/TLS", desc: "Encryption protocols" },
      { name: "JPEG", desc: "Image compression" },
      { name: "MPEG", desc: "Video compression" },
      { name: "ASCII/Unicode", desc: "Character encoding" },
    ],
  },
  {
    number: 5, name: "Session", pdu: "Data", color: "#f59e0b", mnemonic: "Seem",
    description: "Manages sessions (connections) between applications. Controls dialogs, synchronization, and checkpointing.",
    functions: ["Session establishment & termination", "Synchronization & checkpointing", "Dialog control (half/full duplex)"],
    devices: ["Software-based"],
    protocols: [
      { name: "NetBIOS", desc: "Network Basic I/O System" },
      { name: "RPC", desc: "Remote Procedure Call" },
      { name: "PPTP", desc: "Point-to-Point Tunneling" },
    ],
  },
  {
    number: 4, name: "Transport", pdu: "Segment", color: "#10b981", mnemonic: "To",
    description: "Provides reliable end-to-end data delivery. Handles segmentation, flow control, and error recovery.",
    functions: ["Segmentation & reassembly", "Flow control", "Error detection & recovery", "Multiplexing (ports)"],
    devices: ["Load Balancers", "Firewalls (L4)"],
    protocols: [
      { name: "TCP", desc: "Reliable, connection-oriented" },
      { name: "UDP", desc: "Fast, connectionless" },
      { name: "SCTP", desc: "Stream Control Transmission" },
    ],
  },
  {
    number: 3, name: "Network", pdu: "Packet", color: "#3b82f6", mnemonic: "Need",
    description: "Handles logical addressing (IP) and routing. Determines the best path for data to travel across networks.",
    functions: ["Logical addressing (IP)", "Routing & forwarding", "Fragmentation", "Path determination"],
    devices: ["Routers", "L3 Switches"],
    protocols: [
      { name: "IP (v4/v6)", desc: "Internet Protocol" },
      { name: "ICMP", desc: "Error reporting (ping)" },
      { name: "ARP", desc: "Address Resolution" },
      { name: "OSPF", desc: "Routing protocol" },
    ],
  },
  {
    number: 2, name: "Data Link", pdu: "Frame", color: "#8b5cf6", mnemonic: "Data",
    description: "Provides node-to-node data transfer and handles error detection at the frame level. Divided into LLC and MAC sublayers.",
    functions: ["Framing", "Physical addressing (MAC)", "Error detection (CRC)", "Media access control"],
    devices: ["Switches", "Bridges", "NICs"],
    protocols: [
      { name: "Ethernet", desc: "Wired LAN standard" },
      { name: "Wi-Fi (802.11)", desc: "Wireless LAN" },
      { name: "PPP", desc: "Point-to-Point Protocol" },
    ],
  },
  {
    number: 1, name: "Physical", pdu: "Bits", color: "#6b7280", mnemonic: "Processing",
    description: "Deals with the physical transmission of raw bits over the medium. Defines cables, voltages, pin layouts, and signal encoding.",
    functions: ["Bit transmission", "Signal encoding", "Physical media specs", "Data rate & synchronization"],
    devices: ["Hubs", "Repeaters", "Cables", "Modems"],
    protocols: [
      { name: "Ethernet (Physical)", desc: "Cable specs (Cat5/6)" },
      { name: "USB", desc: "Universal Serial Bus" },
      { name: "Bluetooth", desc: "Short-range wireless" },
      { name: "DSL", desc: "Digital Subscriber Line" },
    ],
  },
];

/* ================================================================== */
/*  Mnemonic Strip                                                     */
/* ================================================================== */

function MnemonicStrip({ layers }: { layers: OSILayer[] }) {
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const phrase = layers.map((l) => l.mnemonic).join(" ");

  return (
    <div
      style={{
        marginBottom: 20,
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
        borderRadius: "var(--eng-radius)",
        overflow: "hidden",
        boxShadow: "var(--eng-shadow)",
      }}
    >
      {/* Header band */}
      <div
        style={{
          padding: "10px 16px",
          background: "var(--eng-bg)",
          borderBottom: "1px solid var(--eng-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: mono, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", color: "var(--eng-text-muted)" }}>
            MNEMONIC
          </span>
          <span style={{ fontFamily: mono, fontSize: "0.7rem", color: "var(--eng-text-muted)", opacity: 0.7 }}>
            L7 &rarr; L1 &middot; top to bottom
          </span>
        </div>
        <span style={{ fontSize: "0.78rem", color: "var(--eng-text)", fontStyle: "italic", fontWeight: 500 }}>
          &ldquo;{phrase}&rdquo;
        </span>
      </div>

      {/* Chip row */}
      <div
        style={{
          padding: "18px 16px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "stretch",
          justifyContent: "center",
          gap: 6,
        }}
      >
        {layers.map((layer, i) => (
          <div key={layer.number} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              className="eng-fadeIn"
              style={{
                width: 82,
                padding: "10px 6px 8px",
                background: `${layer.color}10`,
                border: `1px solid ${layer.color}50`,
                borderRadius: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                animationDelay: `${i * 40}ms`,
              }}
            >
              {/* Big first letter */}
              <div
                style={{
                  fontFamily: mono,
                  fontSize: "1.9rem",
                  fontWeight: 800,
                  color: layer.color,
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {layer.mnemonic[0]}
              </div>
              {/* Word with first letter emphasized */}
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                  color: "var(--eng-text)",
                  lineHeight: 1.1,
                  marginTop: 2,
                }}
              >
                {layer.mnemonic}
              </div>
              {/* Divider */}
              <div style={{ width: 20, height: 1, background: `${layer.color}60`, margin: "6px 0 4px" }} />
              {/* Layer label */}
              <div style={{ fontFamily: mono, fontSize: "0.6rem", fontWeight: 700, color: layer.color, letterSpacing: "0.04em" }}>
                L{layer.number}
              </div>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.64rem", color: "var(--eng-text-muted)", lineHeight: 1.15, textAlign: "center" }}>
                {layer.name}
              </div>
            </div>
            {i < layers.length - 1 && (
              <span
                aria-hidden
                style={{
                  color: "var(--eng-text-muted)",
                  fontSize: "0.9rem",
                  opacity: 0.45,
                  userSelect: "none",
                }}
              >
                &rarr;
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 1 - Interactive 7-Layer Cake                                   */
/* ================================================================== */

function OSILayerCake() {
  const [expanded, setExpanded] = useState<number | null>(null);

  function toggleLayer(num: number) {
    setExpanded((prev) => (prev === num ? null : num));
  }

  return (
    <div>
      <h3 style={sectionTitle}>The OSI Model - 7 Layers</h3>
      <p style={sectionDesc}>
        Click on each layer to explore its purpose, PDU, protocols, and devices. The layers are ordered top to bottom (Application to Physical).
      </p>

      {/* Mnemonic card */}
      <MnemonicStrip layers={OSI_LAYERS} />

      {/* Layer stack */}
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        {OSI_LAYERS.map((layer) => {
          const isExpanded = expanded === layer.number;
          return (
            <div
              key={layer.number}
              className="eng-fadeIn"
              style={{
                marginBottom: isExpanded ? 8 : 2,
                transition: "margin 0.3s ease",
              }}
            >
              {/* Layer bar */}
              <button
                onClick={() => toggleLayer(layer.number)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 16px",
                  background: isExpanded ? `${layer.color}15` : "var(--eng-surface)",
                  border: `1.5px solid ${isExpanded ? layer.color : "var(--eng-border)"}`,
                  borderRadius: isExpanded ? "10px 10px 0 0" : 10,
                  cursor: "pointer",
                  transition: "all 0.25s ease",
                  fontFamily: "var(--eng-font)",
                }}
              >
                {/* Layer number badge */}
                <span
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: layer.color,
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    flexShrink: 0,
                  }}
                >
                  {layer.number}
                </span>

                {/* Layer name */}
                <span style={{ flex: 1, textAlign: "left", fontWeight: 600, fontSize: "0.92rem", color: "var(--eng-text)" }}>
                  {layer.name} Layer
                </span>

                {/* PDU badge */}
                <span
                  className="tag-eng"
                  style={{
                    background: `${layer.color}18`,
                    color: layer.color,
                    fontSize: "0.68rem",
                    fontWeight: 700,
                  }}
                >
                  PDU: {layer.pdu}
                </span>

                {/* Mnemonic */}
                <span style={{ fontSize: "0.72rem", color: "var(--eng-text-muted)", fontStyle: "italic" }}>
                  {layer.mnemonic}
                </span>

                {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: layer.color }} /> : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "var(--eng-text-muted)" }} />}
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div
                  className="eng-fadeIn"
                  style={{
                    border: `1.5px solid ${layer.color}`,
                    borderTop: "none",
                    borderRadius: "0 0 10px 10px",
                    padding: "16px 20px",
                    background: "var(--eng-surface)",
                  }}
                >
                  <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6, margin: "0 0 14px" }}>
                    {layer.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Functions */}
                    <div>
                      <h6 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.75rem", color: layer.color, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Key Functions
                      </h6>
                      <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                        {layer.functions.map((f, i) => (
                          <li key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text)", marginBottom: 3, paddingLeft: 12, position: "relative" }}>
                            <span style={{ position: "absolute", left: 0, color: layer.color }}>-</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Devices */}
                    <div>
                      <h6 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.75rem", color: layer.color, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Devices
                      </h6>
                      <div className="flex gap-2 flex-wrap">
                        {layer.devices.map((d, i) => (
                          <span key={i} className="tag-eng" style={{ background: `${layer.color}12`, color: layer.color }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Protocols */}
                    <div>
                      <h6 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.75rem", color: layer.color, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                        Protocols
                      </h6>
                      <div className="flex gap-1 flex-wrap">
                        {layer.protocols.map((p, i) => (
                          <span key={i} className="tag-eng" style={{ background: "#f8fafc", color: "var(--eng-text)", fontSize: "0.68rem" }} title={p.desc}>
                            {p.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 - Encapsulation / Decapsulation Animation                    */
/* ================================================================== */

function EncapsulationDemo() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [autoPlay, setAutoPlay] = useState(false);

  const maxStepDown = 7; // 0 = message only, 1..7 = encapsulation per layer (7->1)
  const maxStepUp = 7; // decapsulation

  const maxStep = direction === "down" ? maxStepDown : maxStepUp;

  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setStep((s) => {
        if (s >= maxStep) {
          setAutoPlay(false);
          return s;
        }
        return s + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [autoPlay, maxStep]);

  function handleNext() {
    if (step < maxStep) setStep((s) => s + 1);
  }

  function handlePrev() {
    if (step > 0) setStep((s) => s - 1);
  }

  function handleReset() {
    setStep(0);
    setAutoPlay(false);
  }

  function toggleDirection() {
    setDirection((d) => (d === "down" ? "up" : "down"));
    setStep(0);
    setAutoPlay(false);
  }

  // Which layers have been encapsulated/decapsulated at this step
  // Encapsulation: step 1 = Layer 7 header added, step 7 = Layer 1 (bits)
  // Decapsulation: step 1 = Layer 1 removed, step 7 = Layer 7 removed (data extracted)
  const layerOrder = direction === "down" ? [7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7];

  const svgWidth = 560;
  const svgHeight = 400;
  const messageY = 40;
  const layerHeight = 36;
  const layerGap = 6;
  const startY = 80;

  // PDU widths grow as encapsulation wraps
  const baseMsgWidth = 120;
  const headerWidth = 30;

  return (
    <div>
      <h3 style={sectionTitle}>Encapsulation &amp; Decapsulation</h3>
      <p style={sectionDesc}>
        Watch how a message gets wrapped with headers as it travels down the OSI layers (encapsulation), and unwrapped at the receiver (decapsulation).
      </p>

      {/* Controls */}
      <div className="flex gap-2 flex-wrap items-center" style={{ marginBottom: 16 }}>
        <button onClick={toggleDirection} className="btn-eng-outline" style={{ fontSize: "0.82rem" }}>
          {direction === "down" ? <ArrowDown className="w-3.5 h-3.5" /> : <ArrowUp className="w-3.5 h-3.5" />}
          {direction === "down" ? "Encapsulation (Sender)" : "Decapsulation (Receiver)"}
        </button>
        <button onClick={handlePrev} disabled={step === 0} className="btn-eng-outline" style={{ fontSize: "0.82rem", opacity: step === 0 ? 0.4 : 1 }}>
          Prev
        </button>
        <button onClick={handleNext} disabled={step >= maxStep} className="btn-eng-outline" style={{ fontSize: "0.82rem", opacity: step >= maxStep ? 0.4 : 1 }}>
          Next
        </button>
        <button onClick={() => setAutoPlay(true)} disabled={autoPlay || step >= maxStep} className="btn-eng" style={{ fontSize: "0.82rem", opacity: autoPlay || step >= maxStep ? 0.5 : 1 }}>
          <Play className="w-3.5 h-3.5" /> Auto Play
        </button>
        <button onClick={handleReset} className="btn-eng-outline" style={{ fontSize: "0.82rem" }}>
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Progress indicator */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ height: 4, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(step / maxStep) * 100}%`, height: "100%", background: "var(--eng-primary)", borderRadius: 2, transition: "width 0.3s ease" }} />
        </div>
        <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.72rem", color: "var(--eng-text-muted)", marginTop: 4, textAlign: "center" }}>
          Step {step} of {maxStep}
        </div>
      </div>

      {/* SVG animation */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 16 }}>
        <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "auto", display: "block" }}>
          <rect width={svgWidth} height={svgHeight} fill="#fafbfd" />

          {/* Direction label */}
          <text x="280" y="22" textAnchor="middle" fill="var(--eng-primary)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", fontWeight: 700 }}>
            {direction === "down" ? "Sender - Encapsulation" : "Receiver - Decapsulation"}
          </text>

          {/* Layer rows */}
          {OSI_LAYERS.map((layer, idx) => {
            const layerNum = layer.number;
            const yPos = startY + idx * (layerHeight + layerGap);
            const orderIdx = layerOrder.indexOf(layerNum);
            const isActive = step > orderIdx;
            const isCurrent = step === orderIdx + 1;

            // How many headers are visible at this layer
            let headersVisible: number;
            if (direction === "down") {
              headersVisible = isActive ? (7 - layerNum + 1) : Math.max(0, 7 - layerNum);
              if (step === 0) headersVisible = 0;
            } else {
              // Decapsulation: start full, remove from bottom
              headersVisible = Math.max(0, 7 - (isActive ? orderIdx + 1 : orderIdx));
              if (step === 0) headersVisible = 7;
            }

            const totalWidth = baseMsgWidth + headersVisible * headerWidth;
            const xStart = (svgWidth - totalWidth) / 2;

            return (
              <g key={layerNum}>
                {/* Layer label */}
                <rect
                  x="10" y={yPos}
                  width="90" height={layerHeight}
                  rx="6"
                  fill={isCurrent ? `${layer.color}25` : `${layer.color}08`}
                  stroke={isCurrent ? layer.color : `${layer.color}40`}
                  strokeWidth={isCurrent ? 2 : 1}
                  style={{ transition: "all 0.4s ease" }}
                />
                <text
                  x="55" y={yPos + layerHeight / 2 + 4}
                  textAnchor="middle"
                  fill={isCurrent ? layer.color : "var(--eng-text-muted)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: isCurrent ? 700 : 500, transition: "all 0.3s ease" }}
                >
                  L{layerNum} {layer.name}
                </text>

                {/* PDU visualization */}
                {/* Headers */}
                {Array.from({ length: headersVisible }, (_, hi) => {
                  const hx = xStart + hi * headerWidth;
                  const headerLayerNum = 7 - hi;
                  const headerLayer = OSI_LAYERS.find((l) => l.number === headerLayerNum)!;
                  return (
                    <g key={`h-${hi}`}>
                      <rect
                        x={hx + 110} y={yPos + 4}
                        width={headerWidth - 2} height={layerHeight - 8}
                        rx="3"
                        fill={`${headerLayer.color}30`}
                        stroke={headerLayer.color}
                        strokeWidth="1"
                        style={{
                          opacity: 1,
                          transition: "opacity 0.4s ease",
                        }}
                      />
                      <text
                        x={hx + 110 + (headerWidth - 2) / 2}
                        y={yPos + layerHeight / 2 + 3}
                        textAnchor="middle"
                        fill={headerLayer.color}
                        style={{ fontFamily: "var(--eng-font)", fontSize: "0.45rem", fontWeight: 600 }}
                      >
                        H{headerLayerNum}
                      </text>
                    </g>
                  );
                })}

                {/* Message/Data block */}
                <rect
                  x={xStart + headersVisible * headerWidth + 110}
                  y={yPos + 4}
                  width={baseMsgWidth - 2}
                  height={layerHeight - 8}
                  rx="3"
                  fill="var(--eng-primary-light)"
                  stroke="var(--eng-primary)"
                  strokeWidth="1"
                />
                <text
                  x={xStart + headersVisible * headerWidth + 110 + (baseMsgWidth - 2) / 2}
                  y={yPos + layerHeight / 2 + 3}
                  textAnchor="middle"
                  fill="var(--eng-primary)"
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: 600 }}
                >
                  {layer.pdu === "Bits" ? "Bit Stream" : "Data"}
                </text>

                {/* PDU label on right */}
                <text
                  x={xStart + headersVisible * headerWidth + 110 + baseMsgWidth + 10}
                  y={yPos + layerHeight / 2 + 4}
                  fill={isCurrent ? layer.color : "var(--eng-text-muted)"}
                  style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: isCurrent ? 700 : 400, transition: "all 0.3s ease" }}
                >
                  {layer.pdu}
                </text>

                {/* Current step arrow indicator */}
                {isCurrent && (
                  <g className="eng-fadeIn">
                    <polygon
                      points={`${svgWidth - 30},${yPos + layerHeight / 2 - 5} ${svgWidth - 20},${yPos + layerHeight / 2} ${svgWidth - 30},${yPos + layerHeight / 2 + 5}`}
                      fill={layer.color}
                    />
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Current step explanation */}
      {step > 0 && step <= maxStep && (
        <div className="info-eng eng-fadeIn" key={`${direction}-${step}`}>
          <p style={{ margin: 0, fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", lineHeight: 1.6 }}>
            {direction === "down" ? (
              <>
                <strong>Step {step}:</strong> Layer {layerOrder[step - 1]} ({OSI_LAYERS.find((l) => l.number === layerOrder[step - 1])!.name}) adds its header.
                The PDU becomes a <strong>{OSI_LAYERS.find((l) => l.number === layerOrder[step - 1])!.pdu}</strong>.
                {layerOrder[step - 1] === 2 && " A trailer (CRC) is also added for error detection."}
                {layerOrder[step - 1] === 1 && " The frame is converted to raw bits for physical transmission."}
              </>
            ) : (
              <>
                <strong>Step {step}:</strong> Layer {layerOrder[step - 1]} ({OSI_LAYERS.find((l) => l.number === layerOrder[step - 1])!.name}) removes its header.
                {layerOrder[step - 1] === 7 && " The original application data is extracted!"}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  TAB 3 - Protocol Browser                                           */
/* ================================================================== */

function ProtocolBrowser() {
  const [selectedLayer, setSelectedLayer] = useState<number>(7);
  const [hoveredProtocol, setHoveredProtocol] = useState<string | null>(null);

  const layer = OSI_LAYERS.find((l) => l.number === selectedLayer)!;

  return (
    <div>
      <h3 style={sectionTitle}>Protocol Browser</h3>
      <p style={sectionDesc}>
        Click a layer to explore its protocols. Each protocol serves a specific purpose at that layer.
      </p>

      {/* Layer selector - vertical stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: layer selector */}
        <div>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 10px" }}>
            Select a Layer
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {OSI_LAYERS.map((l) => {
              const isActive = selectedLayer === l.number;
              return (
                <button
                  key={l.number}
                  onClick={() => setSelectedLayer(l.number)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 14px",
                    borderRadius: 8,
                    border: isActive ? `2px solid ${l.color}` : "1px solid var(--eng-border)",
                    background: isActive ? `${l.color}12` : "var(--eng-surface)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    fontFamily: "var(--eng-font)",
                  }}
                >
                  <span
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive ? l.color : "#e2e8f0",
                      color: isActive ? "#fff" : "var(--eng-text-muted)",
                      fontWeight: 700,
                      fontSize: "0.72rem",
                      flexShrink: 0,
                    }}
                  >
                    {l.number}
                  </span>
                  <span style={{ fontSize: "0.82rem", fontWeight: isActive ? 600 : 400, color: isActive ? l.color : "var(--eng-text)" }}>
                    {l.name}
                  </span>
                  <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "var(--eng-text-muted)" }}>
                    {l.protocols.length} protocols
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: protocol details */}
        <div>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: layer.color, margin: "0 0 10px" }}>
            Layer {layer.number}: {layer.name} Protocols
          </h4>
          <div className="eng-fadeIn" key={selectedLayer} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {layer.protocols.map((p) => {
              const isHovered = hoveredProtocol === p.name;
              return (
                <div
                  key={p.name}
                  className="card-eng"
                  style={{
                    padding: "12px 16px",
                    borderLeft: `3px solid ${isHovered ? layer.color : "transparent"}`,
                    transition: "all 0.2s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={() => setHoveredProtocol(p.name)}
                  onMouseLeave={() => setHoveredProtocol(null)}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="tag-eng"
                      style={{
                        background: `${layer.color}15`,
                        color: layer.color,
                        fontWeight: 700,
                        fontSize: "0.72rem",
                      }}
                    >
                      {p.name}
                    </span>
                    <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)" }}>
                      {p.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Layer info box */}
          <div
            className="info-eng"
            style={{
              marginTop: 16,
              borderLeftColor: layer.color,
            }}
          >
            <p style={{ margin: 0, fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)", lineHeight: 1.5 }}>
              <strong>PDU:</strong> {layer.pdu} | <strong>Devices:</strong> {layer.devices.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  QUIZ                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "Which OSI layer is responsible for routing and logical addressing (IP)?",
    options: ["Transport (Layer 4)", "Network (Layer 3)", "Data Link (Layer 2)", "Session (Layer 5)"],
    correctIndex: 1,
    explanation: "The Network layer (Layer 3) handles logical addressing using IP and determines the best route for packets to travel across networks.",
  },
  {
    question: "What is the PDU (Protocol Data Unit) at the Transport layer?",
    options: ["Packet", "Frame", "Segment", "Data"],
    correctIndex: 2,
    explanation: "The Transport layer PDU is called a Segment. Layer 3 has Packets, Layer 2 has Frames, and Layer 1 has Bits.",
  },
  {
    question: "During encapsulation, what happens as data moves from Layer 7 to Layer 1?",
    options: [
      "Headers are removed at each layer",
      "Headers are added at each layer",
      "Data is encrypted at each layer",
      "Data size decreases at each layer",
    ],
    correctIndex: 1,
    explanation: "During encapsulation (sender side), each layer adds its own header to the data. This process wraps the data with protocol information needed for transmission.",
  },
  {
    question: "Which layer handles encryption and data compression?",
    options: ["Application (Layer 7)", "Presentation (Layer 6)", "Session (Layer 5)", "Transport (Layer 4)"],
    correctIndex: 1,
    explanation: "The Presentation layer (Layer 6) handles data translation, encryption/decryption, and compression. It ensures data is in a format the Application layer can understand.",
  },
  {
    question: "MAC addresses operate at which OSI layer?",
    options: ["Network (Layer 3)", "Transport (Layer 4)", "Data Link (Layer 2)", "Physical (Layer 1)"],
    correctIndex: 2,
    explanation: "MAC (Media Access Control) addresses are physical addresses used at the Data Link layer (Layer 2) for node-to-node communication within a network segment.",
  },
];

/* ================================================================== */
/*  MAIN EXPORT                                                        */
/* ================================================================== */

export default function CN_L1_OSIModelActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "layers",
      label: "Layers",
      icon: <Layers className="w-4 h-4" />,
      content: <OSILayerCake />,
    },
    {
      id: "encapsulation",
      label: "Encapsulation",
      icon: <ArrowDown className="w-4 h-4" />,
      content: <EncapsulationDemo />,
    },
    {
      id: "protocols",
      label: "Protocols",
      icon: <Globe className="w-4 h-4" />,
      content: <ProtocolBrowser />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="The OSI Model - 7 Layers"
      level={1}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="The TCP/IP Model"
      placementRelevance="Medium"
    />
  );
}
