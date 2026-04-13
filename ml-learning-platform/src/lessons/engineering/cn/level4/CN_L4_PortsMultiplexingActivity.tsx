"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Layers, ArrowDownToLine, HelpCircle, Play, RotateCcw, Check } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Constants                                                          */
/* ================================================================== */

const FONT = "var(--eng-font)";
const TEXT = "var(--eng-text)";
const MUTED = "var(--eng-text-muted)";
const BORDER = "var(--eng-border)";
const PRIMARY = "var(--eng-primary)";

/* ================================================================== */
/*  Tab 1 -- Server "Building" with Port Doors                         */
/* ================================================================== */

interface PortDoor {
  port: number;
  service: string;
  color: string;
  protocol: string;
}

const DOORS: PortDoor[] = [
  { port: 80, service: "HTTP", color: "#3b82f6", protocol: "TCP" },
  { port: 443, service: "HTTPS", color: "#10b981", protocol: "TCP" },
  { port: 22, service: "SSH", color: "#8b5cf6", protocol: "TCP" },
  { port: 25, service: "SMTP", color: "#f59e0b", protocol: "TCP" },
  { port: 53, service: "DNS", color: "#ef4444", protocol: "UDP/TCP" },
  { port: 21, service: "FTP", color: "#ec4899", protocol: "TCP" },
];

interface Client {
  id: number;
  label: string;
  targetPort: number;
  color: string;
}

const CLIENTS: Client[] = [
  { id: 0, label: "Browser", targetPort: 80, color: "#3b82f6" },
  { id: 1, label: "SSH Client", targetPort: 22, color: "#8b5cf6" },
  { id: 2, label: "Email App", targetPort: 25, color: "#f59e0b" },
  { id: 3, label: "DNS Resolver", targetPort: 53, color: "#ef4444" },
];

function PortsTab() {
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [connectedClients, setConnectedClients] = useState<Set<number>>(new Set());
  const [animating, setAnimating] = useState(false);
  const [step, setStep] = useState(-1);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleAnimate = () => {
    setConnectedClients(new Set());
    setStep(-1);
    setAnimating(true);
    let s = 0;

    const advance = () => {
      if (s >= CLIENTS.length) {
        setAnimating(false);
        return;
      }
      setStep(s);
      setConnectedClients((prev) => new Set([...prev, s]));
      s++;
      timerRef.current = setTimeout(advance, 800);
    };
    advance();
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleReset = () => {
    setConnectedClients(new Set());
    setStep(-1);
    setAnimating(false);
    setSelectedDoor(null);
  };

  // SVG layout
  const svgW = 600;
  const svgH = 420;
  const buildingX = 320;
  const buildingW = 240;
  const doorH = 50;
  const doorGap = 8;
  const buildingTop = 30;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Port Numbers -- The Server Building
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        Think of a server as a building with numbered doors. Each door (port) leads to a different service. Clients connect to specific ports to reach the right application.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", maxWidth: svgW, display: "block", margin: "0 auto" }}>
          {/* Building */}
          <rect
            x={buildingX}
            y={buildingTop}
            width={buildingW}
            height={DOORS.length * (doorH + doorGap) + 30}
            rx={8}
            fill="var(--eng-surface)"
            stroke={BORDER}
            strokeWidth={2}
          />
          <text
            x={buildingX + buildingW / 2}
            y={buildingTop + 18}
            textAnchor="middle"
            style={{ fontFamily: FONT, fontSize: 12, fontWeight: 700, fill: TEXT }}
          >
            SERVER
          </text>

          {/* Doors */}
          {DOORS.map((door, i) => {
            const doorY = buildingTop + 28 + i * (doorH + doorGap);
            const isSelected = selectedDoor === i;
            const isConnected = [...connectedClients].some(
              (cIdx) => CLIENTS[cIdx]?.targetPort === door.port
            );
            return (
              <g key={door.port} onClick={() => setSelectedDoor(isSelected ? null : i)} style={{ cursor: "pointer" }}>
                <rect
                  x={buildingX + 10}
                  y={doorY}
                  width={buildingW - 20}
                  height={doorH}
                  rx={6}
                  fill={isConnected ? `${door.color}33` : isSelected ? `${door.color}22` : "var(--eng-bg)"}
                  stroke={door.color}
                  strokeWidth={isSelected || isConnected ? 2.5 : 1.5}
                  style={{ transition: "all 0.3s" }}
                />
                {/* Port number badge */}
                <rect x={buildingX + 16} y={doorY + 6} width={40} height={18} rx={4} fill={door.color} />
                <text
                  x={buildingX + 36}
                  y={doorY + 18}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: "#fff" }}
                >
                  :{door.port}
                </text>
                {/* Service name */}
                <text
                  x={buildingX + 66}
                  y={doorY + 20}
                  style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: door.color }}
                >
                  {door.service}
                </text>
                {/* Protocol tag */}
                <text
                  x={buildingX + buildingW - 30}
                  y={doorY + 42}
                  textAnchor="end"
                  style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}
                >
                  {door.protocol}
                </text>
                {/* Connection indicator */}
                {isConnected && (
                  <circle cx={buildingX + buildingW - 18} y={doorY + 12} cy={doorY + 25} r={5} fill={door.color}>
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Clients */}
          {CLIENTS.map((client, i) => {
            const clientY = buildingTop + 40 + i * 80;
            const isConnected = connectedClients.has(i);
            const targetDoorIdx = DOORS.findIndex((d) => d.port === client.targetPort);
            const targetDoorY = buildingTop + 28 + targetDoorIdx * (doorH + doorGap) + doorH / 2;

            return (
              <g key={client.id}>
                {/* Client box */}
                <rect
                  x={20}
                  y={clientY}
                  width={100}
                  height={40}
                  rx={6}
                  fill={isConnected ? `${client.color}22` : "var(--eng-surface)"}
                  stroke={client.color}
                  strokeWidth={1.5}
                />
                <text
                  x={70}
                  y={clientY + 16}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: client.color }}
                >
                  {client.label}
                </text>
                <text
                  x={70}
                  y={clientY + 30}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}
                >
                  :{49152 + i * 111}
                </text>

                {/* Connection line */}
                {isConnected && (
                  <line
                    x1={120}
                    y1={clientY + 20}
                    x2={buildingX + 10}
                    y2={targetDoorY}
                    stroke={client.color}
                    strokeWidth={2}
                    strokeDasharray={animating && step === i ? "400" : "0"}
                    strokeDashoffset={animating && step === i ? "400" : "0"}
                    style={{
                      animation: step === i ? "engLineDraw 0.6s ease-out forwards" : undefined,
                      opacity: 0.7,
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        <style>{`
          @keyframes engLineDraw {
            from { stroke-dashoffset: 400; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 12 }}>
        <button className="btn-eng" onClick={handleAnimate} disabled={animating}>
          <Play className="w-4 h-4" /> Connect Clients
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Detail for selected door */}
      {selectedDoor !== null && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 500, margin: "0 auto" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: DOORS[selectedDoor].color, display: "inline-block" }} />
            <strong>Port {DOORS[selectedDoor].port} -- {DOORS[selectedDoor].service}</strong>
          </div>
          <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: TEXT, margin: 0 }}>
            {DOORS[selectedDoor].service} runs on well-known port {DOORS[selectedDoor].port} ({DOORS[selectedDoor].protocol}). Clients connect using ephemeral ports (49152-65535) on their side.
          </p>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 -- Demultiplexing Animation                                  */
/* ================================================================== */

interface IncomingPacket {
  id: number;
  srcPort: number;
  dstPort: number;
  service: string;
  color: string;
  y: number;
  routed: boolean;
}

function MultiplexTab() {
  const [packets, setPackets] = useState<IncomingPacket[]>([]);
  const [step, setStep] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const INCOMING: Omit<IncomingPacket, "y" | "routed">[] = [
    { id: 0, srcPort: 50001, dstPort: 80, service: "HTTP", color: "#3b82f6" },
    { id: 1, srcPort: 50002, dstPort: 22, service: "SSH", color: "#8b5cf6" },
    { id: 2, srcPort: 50003, dstPort: 443, service: "HTTPS", color: "#10b981" },
    { id: 3, srcPort: 50004, dstPort: 53, service: "DNS", color: "#ef4444" },
    { id: 4, srcPort: 50005, dstPort: 80, service: "HTTP", color: "#3b82f6" },
  ];

  const handlePlay = () => {
    const init = INCOMING.map((p, i) => ({ ...p, y: 30 + i * 40, routed: false }));
    setPackets(init);
    setStep(-1);
    setPlaying(true);

    let s = 0;
    const advance = () => {
      if (s >= INCOMING.length) {
        setPlaying(false);
        return;
      }
      setStep(s);
      setPackets((prev) => prev.map((p, i) => i === s ? { ...p, routed: true } : p));
      s++;
      timerRef.current = setTimeout(advance, 900);
    };
    timerRef.current = setTimeout(advance, 500);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleReset = () => {
    setPackets([]);
    setStep(-1);
    setPlaying(false);
  };

  // Socket table
  const socketTable = [
    { local: "0.0.0.0:80", remote: "*:*", state: "LISTEN", service: "HTTP" },
    { local: "0.0.0.0:22", remote: "*:*", state: "LISTEN", service: "SSH" },
    { local: "0.0.0.0:443", remote: "*:*", state: "LISTEN", service: "HTTPS" },
    { local: "0.0.0.0:53", remote: "*:*", state: "LISTEN", service: "DNS" },
    ...(packets.filter((p) => p.routed).map((p) => ({
      local: `192.168.1.1:${p.dstPort}`,
      remote: `10.0.0.1:${p.srcPort}`,
      state: "ESTABLISHED",
      service: p.service,
    }))),
  ];

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Demultiplexing -- Routing to the Right Service
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        When data arrives, the transport layer reads the destination port and routes the packet to the correct application process.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 600 280" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto" }}>
          {/* Incoming packets column */}
          <text x={60} y={18} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: TEXT }}>
            Incoming
          </text>
          {packets.map((p, i) => (
            <g key={p.id}>
              <rect
                x={10}
                y={p.y}
                width={100}
                height={32}
                rx={5}
                fill={p.routed ? `${p.color}11` : `${p.color}22`}
                stroke={p.color}
                strokeWidth={p.routed ? 1 : 2}
                style={{ transition: "all 0.3s", opacity: p.routed ? 0.4 : 1 }}
              />
              <text
                x={60}
                y={p.y + 14}
                textAnchor="middle"
                style={{ fontFamily: FONT, fontSize: 8, fontWeight: 600, fill: p.color }}
              >
                src:{p.srcPort}
              </text>
              <text
                x={60}
                y={p.y + 26}
                textAnchor="middle"
                style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}
              >
                dst:{p.dstPort}
              </text>
            </g>
          ))}

          {/* Transport Layer box */}
          <rect x={180} y={60} width={120} height={160} rx={8} fill="var(--eng-surface)" stroke={PRIMARY} strokeWidth={2} />
          <text x={240} y={85} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: PRIMARY }}>
            Transport
          </text>
          <text x={240} y={98} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: PRIMARY }}>
            Layer
          </text>
          <text x={240} y={120} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>
            Read dst port
          </text>
          <text x={240} y={132} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>
            Route to service
          </text>

          {/* Arrows from incoming to transport */}
          {packets.filter((p) => p.routed).map((p) => (
            <line
              key={`in-${p.id}`}
              x1={110}
              y1={p.y + 16}
              x2={180}
              y2={140}
              stroke={p.color}
              strokeWidth={1.5}
              strokeDasharray="4,2"
              opacity={0.5}
            />
          ))}

          {/* Service boxes */}
          {[
            { label: "HTTP :80", color: "#3b82f6", y: 40 },
            { label: "SSH :22", color: "#8b5cf6", y: 100 },
            { label: "HTTPS :443", color: "#10b981", y: 160 },
            { label: "DNS :53", color: "#ef4444", y: 220 },
          ].map((svc) => {
            const hasConnection = packets.some((p) => p.routed && p.service === svc.label.split(" ")[0]);
            return (
              <g key={svc.label}>
                <rect
                  x={370}
                  y={svc.y}
                  width={100}
                  height={36}
                  rx={6}
                  fill={hasConnection ? `${svc.color}22` : "var(--eng-surface)"}
                  stroke={svc.color}
                  strokeWidth={hasConnection ? 2 : 1}
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={420}
                  y={svc.y + 22}
                  textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 10, fontWeight: 600, fill: svc.color }}
                >
                  {svc.label}
                </text>
                {/* Arrow from transport to service */}
                {hasConnection && (
                  <line x1={300} y1={140} x2={370} y2={svc.y + 18} stroke={svc.color} strokeWidth={1.5} opacity={0.6} />
                )}
                {/* Active indicator */}
                {hasConnection && (
                  <circle cx={478} cy={svc.y + 18} r={4} fill={svc.color}>
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          <text x={420} y={18} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: TEXT }}>
            Services
          </text>
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={handlePlay} disabled={playing}>
          <Play className="w-4 h-4" /> Animate
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {/* Socket table */}
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: TEXT, margin: "0 0 8px" }}>
        Active Socket Table
      </h3>
      <div className="card-eng" style={{ padding: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", fontFamily: FONT, fontSize: "0.75rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "5px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>Local Address</th>
              <th style={{ textAlign: "left", padding: "5px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>Remote Address</th>
              <th style={{ textAlign: "center", padding: "5px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>State</th>
              <th style={{ textAlign: "center", padding: "5px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>Service</th>
            </tr>
          </thead>
          <tbody>
            {socketTable.map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, color: MUTED, fontFamily: "monospace", fontSize: "0.7rem" }}>{row.local}</td>
                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, color: MUTED, fontFamily: "monospace", fontSize: "0.7rem" }}>{row.remote}</td>
                <td style={{
                  padding: "4px 8px",
                  borderBottom: `1px solid ${BORDER}`,
                  textAlign: "center",
                  color: row.state === "ESTABLISHED" ? "#10b981" : "#f59e0b",
                  fontWeight: 600,
                }}>{row.state}</td>
                <td style={{ padding: "4px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center", color: MUTED }}>{row.service}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- Port Quiz & Socket Exercises                              */
/* ================================================================== */

interface PortQ {
  question: string;
  answer: string;
  hint: string;
}

const PORT_QUESTIONS: PortQ[] = [
  { question: "What port does HTTP use?", answer: "80", hint: "It's the most common web port" },
  { question: "What port does HTTPS use?", answer: "443", hint: "Secure web traffic" },
  { question: "What port does SSH use?", answer: "22", hint: "Secure shell for remote access" },
  { question: "What port does DNS use?", answer: "53", hint: "Domain name resolution" },
  { question: "What port does SMTP use?", answer: "25", hint: "Sending email" },
  { question: "What port does FTP (control) use?", answer: "21", hint: "File transfer protocol" },
];

interface SocketQ {
  description: string;
  options: string[];
  correctIdx: number;
}

const SOCKET_QUESTIONS: SocketQ[] = [
  {
    description: "A web browser on 10.0.0.5:52341 connects to a web server on 192.168.1.1:80. What uniquely identifies this connection?",
    options: [
      "Just the destination port 80",
      "The 4-tuple: (10.0.0.5, 52341, 192.168.1.1, 80)",
      "Just the source IP 10.0.0.5",
      "The protocol type (TCP)",
    ],
    correctIdx: 1,
  },
  {
    description: "Ports 0-1023 are called:",
    options: ["Ephemeral ports", "Well-known ports", "Dynamic ports", "Private ports"],
    correctIdx: 1,
  },
  {
    description: "Which port range do client operating systems typically assign for outgoing connections?",
    options: ["0-1023", "1024-49151", "49152-65535", "0-65535"],
    correctIdx: 2,
  },
];

function PracticeTab() {
  const [portAnswers, setPortAnswers] = useState<Record<number, string>>({});
  const [portChecked, setPortChecked] = useState(false);
  const [socketAnswers, setSocketAnswers] = useState<Record<number, number>>({});
  const [socketChecked, setSocketChecked] = useState(false);
  const [showHints, setShowHints] = useState<Set<number>>(new Set());

  const portScore = Object.entries(portAnswers).filter(
    ([idx, ans]) => ans.trim() === PORT_QUESTIONS[Number(idx)].answer
  ).length;

  const socketScore = Object.entries(socketAnswers).filter(
    ([idx, ans]) => Number(ans) === SOCKET_QUESTIONS[Number(idx)].correctIdx
  ).length;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Practice: Ports & Sockets
      </h2>

      {/* Port number quiz */}
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: TEXT, margin: "16px 0 8px" }}>
        Well-Known Port Numbers
      </h3>
      <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: MUTED, margin: "0 0 12px" }}>
        Type the port number for each service.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10, marginBottom: 12 }}>
        {PORT_QUESTIONS.map((q, i) => {
          const userAns = portAnswers[i] ?? "";
          const isCorrect = portChecked && userAns.trim() === q.answer;
          const isWrong = portChecked && userAns.trim() !== q.answer;
          return (
            <div key={i} className="card-eng" style={{ padding: 10, border: `1.5px solid ${isCorrect ? "#10b981" : isWrong ? "#ef4444" : BORDER}` }}>
              <p style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: TEXT, margin: "0 0 6px" }}>
                {q.question}
              </p>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={userAns}
                  onChange={(e) => setPortAnswers((prev) => ({ ...prev, [i]: e.target.value }))}
                  disabled={portChecked}
                  placeholder="Port #"
                  style={{
                    fontFamily: FONT,
                    fontSize: "0.85rem",
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: `1px solid ${BORDER}`,
                    width: 80,
                    background: "var(--eng-bg)",
                    color: TEXT,
                  }}
                />
                <button
                  onClick={() => setShowHints((prev) => { const n = new Set(prev); n.add(i); return n; })}
                  style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, padding: 2 }}
                  title="Show hint"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              {showHints.has(i) && (
                <p style={{ fontFamily: FONT, fontSize: "0.7rem", color: "#f59e0b", margin: "4px 0 0" }}>
                  Hint: {q.hint}
                </p>
              )}
              {isWrong && (
                <p style={{ fontFamily: FONT, fontSize: "0.7rem", color: "#ef4444", margin: "4px 0 0" }}>
                  Answer: {q.answer}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3" style={{ marginBottom: 24 }}>
        <button className="btn-eng" onClick={() => setPortChecked(true)} disabled={portChecked} style={{ fontSize: "0.8rem" }}>
          <Check className="w-4 h-4" /> Check
        </button>
        <button className="btn-eng-outline" onClick={() => { setPortAnswers({}); setPortChecked(false); setShowHints(new Set()); }} style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {portChecked && (
          <span style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: portScore === PORT_QUESTIONS.length ? "#10b981" : TEXT, alignSelf: "center" }}>
            {portScore}/{PORT_QUESTIONS.length}
          </span>
        )}
      </div>

      {/* Socket identification */}
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: TEXT, margin: "0 0 8px" }}>
        Socket Identification
      </h3>

      <div className="space-y-3" style={{ marginBottom: 12 }}>
        {SOCKET_QUESTIONS.map((q, i) => {
          const userAns = socketAnswers[i];
          return (
            <div key={i} className="card-eng" style={{ padding: 12 }}>
              <p style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, margin: "0 0 8px", lineHeight: 1.5 }}>
                {q.description}
              </p>
              <div className="space-y-1">
                {q.options.map((opt, oi) => {
                  const isSelected = userAns === oi;
                  const isCorrectOpt = socketChecked && oi === q.correctIdx;
                  const isWrongSel = socketChecked && isSelected && oi !== q.correctIdx;
                  let bg = "var(--eng-surface)";
                  let border = `1px solid ${BORDER}`;
                  if (isCorrectOpt) { bg = "rgba(16,185,129,0.1)"; border = "1.5px solid #10b981"; }
                  else if (isWrongSel) { bg = "rgba(239,68,68,0.1)"; border = "1.5px solid #ef4444"; }
                  else if (isSelected) { bg = "var(--eng-primary-light, rgba(99,102,241,0.1))"; border = `1.5px solid ${PRIMARY}`; }

                  return (
                    <button
                      key={oi}
                      onClick={() => { if (!socketChecked) setSocketAnswers((prev) => ({ ...prev, [i]: oi })); }}
                      disabled={socketChecked}
                      className="w-full text-left flex items-center gap-2"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 6,
                        background: bg,
                        border,
                        fontFamily: FONT,
                        fontSize: "0.8rem",
                        color: TEXT,
                        cursor: socketChecked ? "default" : "pointer",
                      }}
                    >
                      <span style={{
                        width: 20, height: 20, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.65rem", fontWeight: 700, flexShrink: 0,
                        background: isSelected ? PRIMARY : "#e2e8f0",
                        color: isSelected ? "#fff" : MUTED,
                      }}>
                        {String.fromCharCode(65 + oi)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button className="btn-eng" onClick={() => setSocketChecked(true)} disabled={socketChecked || Object.keys(socketAnswers).length < SOCKET_QUESTIONS.length} style={{ fontSize: "0.8rem" }}>
          <Check className="w-4 h-4" /> Check
        </button>
        <button className="btn-eng-outline" onClick={() => { setSocketAnswers({}); setSocketChecked(false); }} style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
        {socketChecked && (
          <span style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 600, color: socketScore === SOCKET_QUESTIONS.length ? "#10b981" : TEXT, alignSelf: "center" }}>
            {socketScore}/{SOCKET_QUESTIONS.length}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "Which port number is used by HTTPS?",
    options: ["80", "443", "22", "8080"],
    correctIndex: 1,
    explanation: "HTTPS (HTTP Secure) uses port 443 by default. Port 80 is used for plain HTTP.",
  },
  {
    question: "What is an ephemeral port?",
    options: [
      "A port reserved for system services (0-1023)",
      "A temporary port assigned by the OS for outgoing connections (49152-65535)",
      "A port used only by UDP",
      "A port that expires after 60 seconds",
    ],
    correctIndex: 1,
    explanation: "Ephemeral (temporary) ports in the range 49152-65535 are automatically assigned by the OS for client-side connections.",
  },
  {
    question: "What uniquely identifies a TCP connection (socket)?",
    options: [
      "Destination IP and port only",
      "Source IP only",
      "The 4-tuple: source IP, source port, destination IP, destination port",
      "The MAC address",
    ],
    correctIndex: 2,
    explanation: "A TCP connection is uniquely identified by the 4-tuple: (source IP, source port, destination IP, destination port).",
  },
  {
    question: "What does demultiplexing mean in the transport layer?",
    options: [
      "Splitting a large packet into smaller fragments",
      "Delivering data to the correct application process based on port number",
      "Encrypting data before transmission",
      "Compressing data to save bandwidth",
    ],
    correctIndex: 1,
    explanation: "Demultiplexing is the process of examining the destination port in a segment and routing it to the correct application socket.",
  },
  {
    question: "Port 53 is used by which service?",
    options: ["SSH", "HTTP", "FTP", "DNS"],
    correctIndex: 3,
    explanation: "DNS (Domain Name System) uses port 53 for both UDP queries and TCP zone transfers.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_PortsMultiplexingActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "ports",
      label: "Ports",
      icon: <Layers className="w-4 h-4" />,
      content: <PortsTab />,
    },
    {
      id: "multiplex",
      label: "Multiplex",
      icon: <ArrowDownToLine className="w-4 h-4" />,
      content: <MultiplexTab />,
    },
    {
      id: "practice",
      label: "Practice",
      icon: <HelpCircle className="w-4 h-4" />,
      content: <PracticeTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Port Numbers & Multiplexing"
      level={4}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="DNS -- Domain Name System"
      gateRelevance="1 mark"
      placementRelevance="Low"
    />
  );
}
