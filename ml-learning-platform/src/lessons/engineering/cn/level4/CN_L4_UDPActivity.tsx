"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Wifi, ArrowLeftRight, Gamepad2, Play, RotateCcw, Check, X } from "lucide-react";
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
/*  Tab 1 -- UDP Header Format                                         */
/* ================================================================== */

interface UdpField {
  name: string;
  bits: number;
  color: string;
  detail: string;
}

const UDP_FIELDS: UdpField[] = [
  { name: "Source Port", bits: 16, color: "#3b82f6", detail: "16-bit sender port number. Optional in some cases (set to 0 if not used)." },
  { name: "Destination Port", bits: 16, color: "#8b5cf6", detail: "16-bit receiver port number. Identifies the target application process." },
  { name: "Length", bits: 16, color: "#10b981", detail: "16-bit total length of UDP datagram (header + data). Minimum value is 8 bytes (header only)." },
  { name: "Checksum", bits: 16, color: "#f59e0b", detail: "16-bit checksum for error detection. Optional in IPv4, mandatory in IPv6." },
];

interface TcpCompareField {
  name: string;
  inTcp: boolean;
  inUdp: boolean;
}

const COMPARE_FIELDS: TcpCompareField[] = [
  { name: "Source Port", inTcp: true, inUdp: true },
  { name: "Destination Port", inTcp: true, inUdp: true },
  { name: "Sequence Number", inTcp: true, inUdp: false },
  { name: "Acknowledgment", inTcp: true, inUdp: false },
  { name: "Header Length", inTcp: true, inUdp: false },
  { name: "Flags (SYN/ACK/FIN)", inTcp: true, inUdp: false },
  { name: "Window Size", inTcp: true, inUdp: false },
  { name: "Length", inTcp: false, inUdp: true },
  { name: "Checksum", inTcp: true, inUdp: true },
  { name: "Urgent Pointer", inTcp: true, inUdp: false },
];

function UDPHeaderTab() {
  const [selected, setSelected] = useState<number | null>(null);
  const cellW = 16.25;
  const rowH = 50;
  const padTop = 40;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        UDP Header Format
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        UDP has a minimal 8-byte header -- just 4 fields. Click each field to learn more.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 560 160" style={{ width: "100%", maxWidth: 560, display: "block", margin: "0 auto" }}>
          {/* Bit ruler */}
          {[0, 8, 16, 24, 31].map((b) => (
            <text key={b} x={20 + b * cellW} y={padTop - 8} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>{b}</text>
          ))}
          <text x={280} y={padTop - 22} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: MUTED }}>
            Bit Position (0-31)
          </text>

          {/* Row 1: Src Port + Dest Port */}
          {UDP_FIELDS.slice(0, 2).map((f, i) => {
            const x = 4 + i * 16 * cellW;
            const y = padTop;
            const w = f.bits * cellW;
            const isSelected = selected === i;
            return (
              <g key={i} onClick={() => setSelected(isSelected ? null : i)} style={{ cursor: "pointer" }}>
                <rect x={x} y={y} width={w} height={rowH - 4} rx={4}
                  fill={isSelected ? f.color : `${f.color}22`}
                  stroke={f.color} strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text x={x + w / 2} y={y + rowH / 2 - 2} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: isSelected ? "#fff" : f.color }}
                >{f.name}</text>
                <text x={x + w / 2} y={y + rowH / 2 + 14} textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 8, fill: isSelected ? "rgba(255,255,255,0.8)" : MUTED }}
                >{f.bits} bits</text>
              </g>
            );
          })}

          {/* Row 2: Length + Checksum */}
          {UDP_FIELDS.slice(2, 4).map((f, i) => {
            const idx = i + 2;
            const x = 4 + i * 16 * cellW;
            const y = padTop + rowH;
            const w = f.bits * cellW;
            const isSelected = selected === idx;
            return (
              <g key={idx} onClick={() => setSelected(isSelected ? null : idx)} style={{ cursor: "pointer" }}>
                <rect x={x} y={y} width={w} height={rowH - 4} rx={4}
                  fill={isSelected ? f.color : `${f.color}22`}
                  stroke={f.color} strokeWidth={isSelected ? 2.5 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text x={x + w / 2} y={y + rowH / 2 - 2} textAnchor="middle" dominantBaseline="central"
                  style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: isSelected ? "#fff" : f.color }}
                >{f.name}</text>
                <text x={x + w / 2} y={y + rowH / 2 + 14} textAnchor="middle"
                  style={{ fontFamily: FONT, fontSize: 8, fill: isSelected ? "rgba(255,255,255,0.8)" : MUTED }}
                >{f.bits} bits</text>
              </g>
            );
          })}

          <text x={280} y={padTop + 2 * rowH + 14} textAnchor="middle"
            style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, fill: TEXT }}
          >Total Header: 8 bytes (64 bits)</text>
        </svg>
      </div>

      {selected !== null && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 560, margin: "0 auto 16px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: UDP_FIELDS[selected].color, display: "inline-block" }} />
            <strong>{UDP_FIELDS[selected].name}</strong>
          </div>
          <p style={{ fontFamily: FONT, fontSize: "0.85rem", color: TEXT, margin: 0 }}>{UDP_FIELDS[selected].detail}</p>
        </div>
      )}

      {/* Side-by-side comparison */}
      <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1rem", color: TEXT, margin: "0 0 8px" }}>
        TCP vs UDP Header Comparison
      </h3>
      <div className="card-eng" style={{ padding: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", fontFamily: FONT, fontSize: "0.8rem", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: TEXT }}>Field</th>
              <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: "#3b82f6" }}>TCP</th>
              <th style={{ textAlign: "center", padding: "6px 8px", borderBottom: `2px solid ${BORDER}`, color: "#10b981" }}>UDP</th>
            </tr>
          </thead>
          <tbody>
            {COMPARE_FIELDS.map((f, i) => (
              <tr key={i}>
                <td style={{ padding: "5px 8px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>{f.name}</td>
                <td style={{ padding: "5px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>
                  {f.inTcp ? <Check className="w-4 h-4 inline" style={{ color: "#3b82f6" }} /> : <X className="w-4 h-4 inline" style={{ color: "#cbd5e1" }} />}
                </td>
                <td style={{ padding: "5px 8px", borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>
                  {f.inUdp ? <Check className="w-4 h-4 inline" style={{ color: "#10b981" }} /> : <X className="w-4 h-4 inline" style={{ color: "#cbd5e1" }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 -- TCP vs UDP Animation                                      */
/* ================================================================== */

interface Packet {
  id: number;
  x: number;
  lost: boolean;
  delivered: boolean;
}

function CompareTab() {
  const [lossRate, setLossRate] = useState(20);
  const [tcpPackets, setTcpPackets] = useState<Packet[]>([]);
  const [udpPackets, setUdpPackets] = useState<Packet[]>([]);
  const [running, setRunning] = useState(false);
  const [tcpDelivered, setTcpDelivered] = useState(0);
  const [udpDelivered, setUdpDelivered] = useState(0);
  const [tcpTime, setTcpTime] = useState(0);
  const [udpTime, setUdpTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);

  const totalPackets = 10;

  const startSimulation = useCallback(() => {
    setRunning(true);
    setTcpDelivered(0);
    setUdpDelivered(0);
    setTcpTime(0);
    setUdpTime(0);
    tickRef.current = 0;

    // Pre-compute which packets are lost
    const tcpInit: Packet[] = [];
    const udpInit: Packet[] = [];
    for (let i = 0; i < totalPackets; i++) {
      const isLost = Math.random() * 100 < lossRate;
      tcpInit.push({ id: i, x: 0, lost: isLost, delivered: false });
      udpInit.push({ id: i, x: 0, lost: isLost, delivered: false });
    }
    setTcpPackets(tcpInit);
    setUdpPackets(udpInit);

    timerRef.current = setInterval(() => {
      tickRef.current += 1;
      const t = tickRef.current;

      // UDP: all packets move at same speed, lost ones disappear
      setUdpPackets((prev) => prev.map((p) => {
        if (p.delivered) return p;
        const newX = Math.min(p.x + 12, 100);
        if (p.lost && newX > 50) return { ...p, x: newX, delivered: true };
        if (newX >= 100) return { ...p, x: 100, delivered: true };
        return { ...p, x: newX };
      }));

      // TCP: slower but retransmits
      setTcpPackets((prev) => prev.map((p) => {
        if (p.delivered && !p.lost) return p;
        const newX = Math.min(p.x + 8, 100);
        if (p.lost && newX > 50) {
          // Retransmit: reset position
          return { ...p, x: 0, lost: false };
        }
        if (newX >= 100) return { ...p, x: 100, delivered: true, lost: false };
        return { ...p, x: newX };
      }));

      setTcpTime(t);
      setUdpTime(Math.min(t, Math.ceil(totalPackets * 100 / 12)));

      if (t > 40) {
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
      }
    }, 150);
  }, [lossRate]);

  useEffect(() => {
    const td = tcpPackets.filter((p) => p.delivered && !p.lost).length;
    setTcpDelivered(td);
  }, [tcpPackets]);

  useEffect(() => {
    const ud = udpPackets.filter((p) => p.delivered && !p.lost).length;
    setUdpDelivered(ud);
  }, [udpPackets]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        TCP vs UDP: Side by Side
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 12px", lineHeight: 1.6 }}>
        TCP is reliable but slower. UDP is fast but some packets may be lost. Adjust the loss rate to see the tradeoff.
      </p>

      <div className="card-eng" style={{ padding: 12, marginBottom: 12, maxWidth: 400 }}>
        <label style={{ fontFamily: FONT, fontSize: "0.85rem", fontWeight: 600, color: TEXT, display: "block", marginBottom: 4 }}>
          Packet Loss Rate: {lossRate}%
        </label>
        <input
          type="range"
          min={0}
          max={60}
          step={5}
          value={lossRate}
          onChange={(e) => setLossRate(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--eng-primary)" }}
        />
      </div>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <svg viewBox="0 0 560 220" style={{ width: "100%", maxWidth: 560, display: "block", margin: "0 auto" }}>
          {/* TCP side */}
          <text x={280} y={20} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: "#3b82f6" }}>
            TCP (Reliable)
          </text>
          <rect x={20} y={30} width={520} height={60} rx={6} fill="#3b82f622" stroke="#3b82f6" strokeWidth={1} />
          <text x={30} y={52} style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Sender</text>
          <text x={510} y={52} textAnchor="end" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Receiver</text>

          {tcpPackets.map((p) => (
            <rect
              key={`tcp-${p.id}`}
              x={30 + p.x * 4.8}
              y={42}
              width={16}
              height={16}
              rx={3}
              fill={p.delivered && !p.lost ? "#10b981" : p.lost && p.x > 40 ? "#ef4444" : "#3b82f6"}
              style={{ transition: "x 0.15s" }}
            />
          ))}

          {/* UDP side */}
          <text x={280} y={120} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fontWeight: 700, fill: "#10b981" }}>
            UDP (Fast)
          </text>
          <rect x={20} y={130} width={520} height={60} rx={6} fill="#10b98122" stroke="#10b981" strokeWidth={1} />
          <text x={30} y={152} style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Sender</text>
          <text x={510} y={152} textAnchor="end" style={{ fontFamily: FONT, fontSize: 8, fill: MUTED }}>Receiver</text>

          {udpPackets.map((p) => {
            if (p.lost && p.x > 50) return null; // disappeared
            return (
              <rect
                key={`udp-${p.id}`}
                x={30 + p.x * 4.8}
                y={142}
                width={16}
                height={16}
                rx={3}
                fill={p.delivered ? "#10b981" : p.lost && p.x > 30 ? "#ef444488" : "#10b981"}
                style={{ transition: "x 0.15s" }}
              />
            );
          })}

          {/* Stats */}
          <text x={280} y={210} textAnchor="middle" style={{ fontFamily: FONT, fontSize: 10, fill: TEXT }}>
            TCP: {tcpDelivered}/{totalPackets} delivered | UDP: {udpDelivered}/{totalPackets} delivered
          </text>
        </svg>
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 16 }}>
        <button className="btn-eng" onClick={startSimulation} disabled={running}>
          <Play className="w-4 h-4" /> {tcpPackets.length > 0 ? "Re-run" : "Start"}
        </button>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <div className="card-eng" style={{ padding: 12, flex: "1 1 200px", maxWidth: 260 }}>
          <p style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, color: "#3b82f6", margin: "0 0 4px" }}>TCP</p>
          <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: MUTED, margin: 0 }}>
            Reliable delivery. Retransmits lost packets. Higher latency. Used for: file transfer, web pages, email.
          </p>
        </div>
        <div className="card-eng" style={{ padding: 12, flex: "1 1 200px", maxWidth: 260 }}>
          <p style={{ fontFamily: FONT, fontSize: "0.8rem", fontWeight: 700, color: "#10b981", margin: "0 0 4px" }}>UDP</p>
          <p style={{ fontFamily: FONT, fontSize: "0.75rem", color: MUTED, margin: 0 }}>
            Best-effort delivery. No retransmission. Lower latency. Used for: video calls, live streaming, gaming, DNS.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 -- Application Matcher                                       */
/* ================================================================== */

interface AppItem {
  name: string;
  icon: string;
  correct: "tcp" | "udp";
  reason: string;
}

const APPS: AppItem[] = [
  { name: "Video Call", icon: "cam", correct: "udp", reason: "Real-time communication prioritizes low latency over reliability." },
  { name: "File Download", icon: "file", correct: "tcp", reason: "File integrity requires reliable, ordered delivery of all bytes." },
  { name: "DNS Lookup", icon: "dns", correct: "udp", reason: "DNS queries are small and need fast responses. Retries happen at application level." },
  { name: "Online Game", icon: "game", correct: "udp", reason: "Games need low latency. A dropped frame is better than a delayed one." },
  { name: "Email (SMTP)", icon: "mail", correct: "tcp", reason: "Email messages must arrive completely and correctly." },
  { name: "Web Page", icon: "web", correct: "tcp", reason: "HTTP runs over TCP to ensure all page content loads correctly." },
  { name: "Live Streaming", icon: "stream", correct: "udp", reason: "Live video tolerates some loss but cannot tolerate buffering delays." },
  { name: "File Sync", icon: "sync", correct: "tcp", reason: "Syncing files requires every byte to be identical on both sides." },
];

function AppIcon({ type }: { type: string }) {
  const size = 28;
  const icons: Record<string, React.ReactNode> = {
    cam: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><rect x={2} y={5} width={14} height={14} rx={2} /><path d="M22 7l-6 5 6 5V7z" /></svg>,
    file: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>,
    dns: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><circle cx={12} cy={12} r={10} /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
    game: <Gamepad2 size={size} />,
    mail: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><rect x={2} y={4} width={20} height={16} rx={2} /><polyline points="22 4 12 13 2 4" /></svg>,
    web: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={3} width={18} height={18} rx={2} /><line x1={3} y1={9} x2={21} y2={9} /><circle cx={7} cy={6} r={0.5} fill="currentColor" /><circle cx={10} cy={6} r={0.5} fill="currentColor" /></svg>,
    stream: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    sync: <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 2v6h-6M3 22v-6h6" /><path d="M3 12a9 9 0 0115.4-6.4L21 8M21 12a9 9 0 01-15.4 6.4L3 16" /></svg>,
  };
  return <span style={{ color: "var(--eng-text)" }}>{icons[type] ?? null}</span>;
}

function AppsTab() {
  const [answers, setAnswers] = useState<Record<number, "tcp" | "udp">>({});
  const [showResults, setShowResults] = useState(false);

  const handleAssign = (index: number, protocol: "tcp" | "udp") => {
    if (showResults) return;
    setAnswers((prev) => ({ ...prev, [index]: protocol }));
  };

  const handleCheck = () => setShowResults(true);

  const handleReset = () => {
    setAnswers({});
    setShowResults(false);
  };

  const score = Object.entries(answers).filter(
    ([idx, ans]) => APPS[Number(idx)].correct === ans
  ).length;

  return (
    <div className="eng-fadeIn">
      <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.25rem", color: TEXT, margin: "0 0 8px" }}>
        Application Protocol Matcher
      </h2>
      <p style={{ fontFamily: FONT, fontSize: "0.9rem", color: MUTED, margin: "0 0 16px", lineHeight: 1.6 }}>
        Assign each application to TCP or UDP. Think about whether it needs reliability or speed.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12, marginBottom: 16 }}>
        {APPS.map((app, i) => {
          const userAnswer = answers[i];
          const isCorrect = showResults && userAnswer === app.correct;
          const isWrong = showResults && userAnswer !== undefined && userAnswer !== app.correct;
          let borderColor = BORDER;
          if (isCorrect) borderColor = "#10b981";
          if (isWrong) borderColor = "#ef4444";

          return (
            <div
              key={i}
              className="card-eng"
              style={{
                padding: 12,
                border: `2px solid ${borderColor}`,
                transition: "border-color 0.2s",
              }}
            >
              <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                <AppIcon type={app.icon} />
                <span style={{ fontFamily: FONT, fontSize: "0.9rem", fontWeight: 600, color: TEXT }}>{app.name}</span>
              </div>
              <div className="flex gap-2">
                <button
                  className={userAnswer === "tcp" ? "btn-eng" : "btn-eng-outline"}
                  style={{ flex: 1, fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => handleAssign(i, "tcp")}
                >
                  TCP
                </button>
                <button
                  className={userAnswer === "udp" ? "btn-eng" : "btn-eng-outline"}
                  style={{ flex: 1, fontSize: "0.75rem", padding: "4px 8px" }}
                  onClick={() => handleAssign(i, "udp")}
                >
                  UDP
                </button>
              </div>
              {showResults && (
                <p className="eng-fadeIn" style={{ fontFamily: FONT, fontSize: "0.7rem", color: isCorrect ? "#10b981" : "#ef4444", margin: "6px 0 0", lineHeight: 1.4 }}>
                  {isCorrect ? "Correct! " : `Wrong -- answer is ${app.correct.toUpperCase()}. `}{app.reason}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 justify-center" style={{ marginBottom: 12 }}>
        <button className="btn-eng" onClick={handleCheck} disabled={showResults || Object.keys(answers).length < APPS.length}>
          <Check className="w-4 h-4" /> Check Answers
        </button>
        <button className="btn-eng-outline" onClick={handleReset}>
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>

      {showResults && (
        <div className="info-eng eng-fadeIn" style={{ maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
          <strong>Score: {score}/{APPS.length}</strong>
          {score === APPS.length && <span style={{ color: "#10b981", marginLeft: 8 }}>Perfect!</span>}
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the size of a UDP header?",
    options: ["4 bytes", "8 bytes", "20 bytes", "32 bytes"],
    correctIndex: 1,
    explanation: "UDP has a minimal 8-byte header with only 4 fields: source port, destination port, length, and checksum.",
  },
  {
    question: "Which of these is NOT provided by UDP?",
    options: ["Port-based multiplexing", "Error detection (checksum)", "Guaranteed delivery", "Fast transmission"],
    correctIndex: 2,
    explanation: "UDP does not guarantee delivery. It provides best-effort service -- packets may be lost, duplicated, or reordered.",
  },
  {
    question: "Which application would typically use UDP?",
    options: ["File transfer (FTP)", "Email (SMTP)", "Video conferencing", "Web browsing (HTTP)"],
    correctIndex: 2,
    explanation: "Video conferencing needs low latency. A few lost frames are acceptable, but delays cause poor user experience.",
  },
  {
    question: "Which field exists in UDP but NOT in TCP?",
    options: ["Source Port", "Checksum", "Length (of datagram)", "Destination Port"],
    correctIndex: 2,
    explanation: "UDP has an explicit Length field. TCP does not -- TCP derives its data length from the IP header total length minus header lengths.",
  },
  {
    question: "Why does DNS typically use UDP instead of TCP?",
    options: [
      "DNS data is encrypted and needs UDP",
      "DNS queries are small and need fast response; retry is handled at application level",
      "TCP cannot handle DNS packet sizes",
      "DNS servers do not have TCP ports",
    ],
    correctIndex: 1,
    explanation: "DNS queries/responses are typically small (fit in one UDP datagram). The speed of UDP is preferred, and the DNS application handles retries if needed.",
  },
];

/* ================================================================== */
/*  Export                                                             */
/* ================================================================== */

export default function CN_L4_UDPActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "udp",
      label: "UDP",
      icon: <Wifi className="w-4 h-4" />,
      content: <UDPHeaderTab />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      content: <CompareTab />,
    },
    {
      id: "apps",
      label: "Apps",
      icon: <Gamepad2 className="w-4 h-4" />,
      content: <AppsTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="UDP -- User Datagram Protocol"
      level={4}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Port Numbers & Multiplexing"
      gateRelevance="1-2 marks"
      placementRelevance="Medium"
    />
  );
}
