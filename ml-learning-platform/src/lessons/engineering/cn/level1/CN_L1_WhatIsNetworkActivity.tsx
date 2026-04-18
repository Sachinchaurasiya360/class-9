"use client";

import { useState, useEffect } from "react";
import {
  Network,
  Server,
  Globe,
  Building2,
  ArrowRightLeft,
  Users,
  CheckCircle2,
  XCircle,
  Laptop,
  BookOpen,
  Share2,
  MessageSquare,
  ShieldCheck,
  Play,
  Pause,
  RotateCw,
  Gauge,
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
/*  TAB 1 - Concept: What is a Computer Network?                       */
/* ================================================================== */

function NetworkConcept() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % 100), 40);
    return () => clearInterval(t);
  }, []);

  const progress = step / 100;

  const benefits: Array<{
    icon: React.ReactNode;
    title: string;
    desc: string;
    color: string;
    soft: string;
    kicker: string;
    chips: string[];
    visual: "share" | "comm" | "scale";
  }> = [
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Resource Sharing",
      desc: "One printer, one internet connection, one storage drive - accessed by everyone on the network, no copies needed.",
      color: "#3b82f6",
      soft: "#dbeafe",
      kicker: "Why #01",
      chips: ["Files", "Printers", "Internet", "Storage"],
      visual: "share",
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Communication",
      desc: "Email, video calls and chat work because machines keep sending small messages to each other - 24 hours a day.",
      color: "#8b5cf6",
      soft: "#ede9fe",
      kicker: "Why #02",
      chips: ["Email", "Video", "Chat", "Live"],
      visual: "comm",
    },
    {
      icon: <ShieldCheck className="w-5 h-5" />,
      title: "Reliability & Scale",
      desc: "Work is spread across many machines. If one fails, the others quietly take over - you never even notice.",
      color: "#10b981",
      soft: "#d1fae5",
      kicker: "Why #03",
      chips: ["Failover", "Load-split", "Uptime", "Growth"],
      visual: "scale",
    },
  ];

  const terms = [
    { term: "Node", meaning: "Any device on the network - PC, phone, server, router." },
    { term: "Link", meaning: "The medium that carries data - copper, fiber, or Wi-Fi radio." },
    { term: "Protocol", meaning: "A shared set of rules both devices follow so they understand each other (e.g., HTTP, TCP/IP)." },
    { term: "Bandwidth", meaning: "How much data a link can carry per second (e.g., 100 Mbps)." },
    { term: "Latency", meaning: "The time it takes for a packet to travel from sender to receiver." },
  ];

  return (
    <div>
      <h3 style={sectionTitle}>What is a Computer Network?</h3>
      <p style={sectionDesc}>
        A <strong style={{ color: "var(--eng-text)" }}>computer network</strong> is a collection of
        interconnected devices - called <em>nodes</em> - that share data and resources with each
        other by following a common set of rules known as <em>protocols</em>. The simplest network
        is just <strong>two devices connected by a link</strong>, exchanging messages back and forth.
      </p>

      {/* Minimal 2-node diagram */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <svg viewBox="0 0 580 260" style={{ width: "100%", height: "auto", display: "block" }}>
          <defs>
            <pattern id="conceptGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
            <filter id="conceptGlow">
              <feGaussianBlur stdDeviation="3" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <rect width="580" height="260" fill="#fafbfd" />
          <rect width="580" height="260" fill="url(#conceptGrid)" />

          {/* Link line */}
          <line x1={150} y1={130} x2={430} y2={130} stroke="#3b82f6" strokeWidth="2.5" strokeOpacity="0.35" strokeDasharray="6 4" />
          <text x={290} y={118} textAnchor="middle" fill="#64748b" style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", fontWeight: 600 }}>
            LINK (wired or wireless)
          </text>

          {/* Forward packet (A → B) */}
          {(() => {
            const p = (progress * 2) % 1;
            const showFwd = p < 0.5;
            const t = showFwd ? p * 2 : 0;
            return showFwd ? (
              <g>
                <circle cx={150 + (430 - 150) * t} cy={130} r="7" fill="#3b82f6" filter="url(#conceptGlow)" />
                <text x={150 + (430 - 150) * t} y={116} textAnchor="middle" fill="#3b82f6" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 700 }}>
                  Hello
                </text>
              </g>
            ) : null;
          })()}

          {/* Return packet (B → A) */}
          {(() => {
            const p = (progress * 2) % 1;
            const showBack = p >= 0.5;
            const t = showBack ? (p - 0.5) * 2 : 0;
            return showBack ? (
              <g>
                <circle cx={430 - (430 - 150) * t} cy={130} r="7" fill="#10b981" filter="url(#conceptGlow)" />
                <text x={430 - (430 - 150) * t} y={150} textAnchor="middle" fill="#10b981" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 700 }}>
                  Hi back!
                </text>
              </g>
            ) : null;
          })()}

          {/* Node A */}
          <g>
            <rect x={100} y={95} width={100} height={70} rx={10} fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth={2} />
            <rect x={120} y={110} width={60} height={36} rx={3} fill="none" stroke="#3b82f6" strokeWidth={1.5} />
            <line x1={116} y1={152} x2={184} y2={152} stroke="#3b82f6" strokeWidth={1.5} />
            <text x={150} y={186} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", fontWeight: 700 }}>
              Computer A
            </text>
            <text x={150} y={202} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem" }}>
              (node)
            </text>
          </g>

          {/* Node B */}
          <g>
            <rect x={380} y={95} width={100} height={70} rx={10} fill="var(--eng-surface)" stroke="#10b981" strokeWidth={2} />
            <rect x={400} y={110} width={60} height={36} rx={3} fill="none" stroke="#10b981" strokeWidth={1.5} />
            <line x1={396} y1={152} x2={464} y2={152} stroke="#10b981" strokeWidth={1.5} />
            <text x={430} y={186} textAnchor="middle" fill="var(--eng-text)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", fontWeight: 700 }}>
              Computer B
            </text>
            <text x={430} y={202} textAnchor="middle" fill="var(--eng-text-muted)" style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem" }}>
              (node)
            </text>
          </g>

          {/* Protocol label */}
          <g>
            <rect x={230} y={220} width={120} height={26} rx={13} fill="#f1f5f9" stroke="#cbd5e1" strokeWidth={1} />
            <text x={290} y={237} textAnchor="middle" fill="#475569" style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", fontWeight: 700 }}>
              PROTOCOL (rules)
            </text>
          </g>
        </svg>
      </div>

      {/* Benefits grid - Why do we need networks? */}
      <div style={{ marginBottom: 10 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "4px 12px",
            borderRadius: 999,
            background: "var(--eng-primary-light)",
            border: "1px solid var(--eng-border)",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--eng-primary)",
              display: "inline-block",
            }}
          />
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              color: "var(--eng-primary)",
              textTransform: "uppercase",
            }}
          >
            Why do we build networks?
          </span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 20,
        }}
      >
        {benefits.map((b) => (
          <div
            key={b.title}
            className="card-eng"
            style={{
              padding: 0,
              overflow: "hidden",
              position: "relative",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Accent ribbon */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: b.color,
              }}
            />

            {/* Visual header */}
            <div
              style={{
                position: "relative",
                height: 130,
                background: b.soft,
                borderBottom: `1px dashed ${b.color}40`,
                overflow: "hidden",
              }}
            >
              {/* Kicker badge */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  left: 12,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "3px 9px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: `1px solid ${b.color}30`,
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  color: b.color,
                  textTransform: "uppercase",
                  zIndex: 2,
                }}
              >
                <span
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    background: b.color,
                    display: "inline-block",
                  }}
                />
                {b.kicker}
              </div>

              {/* Floating icon */}
              <div
                style={{
                  position: "absolute",
                  top: 10,
                  right: 12,
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#ffffff",
                  border: `1px solid ${b.color}30`,
                  boxShadow: `0 4px 12px ${b.color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: b.color,
                  zIndex: 2,
                }}
              >
                {b.icon}
              </div>

              {/* Per-card SVG illustration */}
              <svg
                viewBox="0 0 300 130"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                {b.visual === "share" && (
                  <g>
                    {/* Central hub */}
                    <circle cx={150} cy={72} r={30} fill="#fff" stroke={b.color} strokeWidth={2} />
                    <circle cx={150} cy={72} r={38} fill="none" stroke={b.color} strokeWidth={1} strokeOpacity={0.3} strokeDasharray="4 4">
                      <animateTransform attributeName="transform" type="rotate" from="0 150 72" to="360 150 72" dur="20s" repeatCount="indefinite" />
                    </circle>
                    <text x={150} y={77} textAnchor="middle" fill={b.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 800 }}>
                      SHARED
                    </text>
                    {/* 4 orbit devices */}
                    {[
                      { x: 70, y: 72, label: "💾" },
                      { x: 150, y: 20, label: "🖨" },
                      { x: 230, y: 72, label: "🌐" },
                      { x: 150, y: 120, label: "📁" },
                    ].map((d, i) => (
                      <g key={i}>
                        <line x1={150} y1={72} x2={d.x} y2={d.y} stroke={b.color} strokeWidth={1.2} strokeOpacity={0.35} strokeDasharray="3 3" />
                        <circle cx={d.x} cy={d.y} r={14} fill="#fff" stroke={b.color} strokeWidth={1.5} />
                        <text x={d.x} y={d.y + 5} textAnchor="middle" style={{ fontSize: "0.85rem" }}>
                          {d.label}
                        </text>
                      </g>
                    ))}
                    {/* Traveling dot */}
                    <circle r="3" fill={b.color}>
                      <animateMotion dur="3s" repeatCount="indefinite" path="M 150 72 L 70 72 L 150 72 L 150 20 L 150 72 L 230 72 L 150 72 L 150 120 Z" />
                    </circle>
                  </g>
                )}

                {b.visual === "comm" && (
                  <g>
                    {/* Left device */}
                    <rect x={22} y={46} width={56} height={50} rx={8} fill="#fff" stroke={b.color} strokeWidth={2} />
                    <rect x={30} y={54} width={40} height={26} rx={2} fill="none" stroke={b.color} strokeWidth={1} />
                    <line x1={28} y1={88} x2={72} y2={88} stroke={b.color} strokeWidth={1.2} />
                    {/* Right device */}
                    <rect x={222} y={46} width={56} height={50} rx={8} fill="#fff" stroke={b.color} strokeWidth={2} />
                    <rect x={230} y={54} width={40} height={26} rx={2} fill="none" stroke={b.color} strokeWidth={1} />
                    <line x1={228} y1={88} x2={272} y2={88} stroke={b.color} strokeWidth={1.2} />
                    {/* Chat bubbles flying right */}
                    <g>
                      <rect x={80} y={30} width={40} height={22} rx={11} fill={b.color} opacity={0.9}>
                        <animate attributeName="x" values="80;180;180" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;0.9;0" dur="3s" repeatCount="indefinite" />
                      </rect>
                      <text x={100} y={45} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 800 }}>
                        <animate attributeName="x" values="100;200;200" dur="3s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite" />
                        HI
                      </text>
                    </g>
                    {/* Chat bubbles flying left */}
                    <g>
                      <rect x={180} y={92} width={40} height={22} rx={11} fill="#fff" stroke={b.color} strokeWidth={1.5}>
                        <animate attributeName="x" values="180;80;80" dur="3s" begin="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
                      </rect>
                      <text x={200} y={107} textAnchor="middle" fill={b.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 800 }}>
                        <animate attributeName="x" values="200;100;100" dur="3s" begin="1.5s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0;1;0" dur="3s" begin="1.5s" repeatCount="indefinite" />
                        OK!
                      </text>
                    </g>
                    {/* Signal waves */}
                    {[1, 2, 3].map((n) => (
                      <circle key={n} cx={150} cy={71} r={8 + n * 8} fill="none" stroke={b.color} strokeWidth={1} opacity={0.2}>
                        <animate attributeName="r" values={`${8 + n * 8};${20 + n * 8};${8 + n * 8}`} dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    ))}
                  </g>
                )}

                {b.visual === "scale" && (
                  <g>
                    {/* Load balancer */}
                    <rect x={125} y={18} width={50} height={26} rx={6} fill={b.color} />
                    <text x={150} y={35} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--eng-font)", fontSize: "0.6rem", fontWeight: 800 }}>
                      BALANCE
                    </text>
                    {/* 4 server stacks */}
                    {[40, 100, 160, 220].map((x, i) => {
                      const failed = i === 2;
                      return (
                        <g key={i}>
                          {/* Connector line */}
                          <line x1={150} y1={44} x2={x + 20} y2={70} stroke={failed ? "#ef4444" : b.color} strokeWidth={1.2} strokeOpacity={0.5} strokeDasharray={failed ? "2 3" : "3 3"} />
                          {/* Server box */}
                          <rect x={x} y={70} width={40} height={46} rx={4} fill="#fff" stroke={failed ? "#ef4444" : b.color} strokeWidth={1.8} opacity={failed ? 0.6 : 1} />
                          <line x1={x + 4} y1={80} x2={x + 36} y2={80} stroke={failed ? "#ef4444" : b.color} strokeWidth={1} opacity={0.6} />
                          <line x1={x + 4} y1={88} x2={x + 36} y2={88} stroke={failed ? "#ef4444" : b.color} strokeWidth={1} opacity={0.6} />
                          <line x1={x + 4} y1={96} x2={x + 36} y2={96} stroke={failed ? "#ef4444" : b.color} strokeWidth={1} opacity={0.6} />
                          {/* Status dot */}
                          {failed ? (
                            <g>
                              <circle cx={x + 32} cy={78} r={5} fill="#ef4444" />
                              <text x={x + 32} y={81} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", fontWeight: 800 }}>
                                ✕
                              </text>
                            </g>
                          ) : (
                            <circle cx={x + 32} cy={78} r={3.5} fill={b.color}>
                              <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" begin={`${i * 0.3}s`} />
                            </circle>
                          )}
                          {/* Traffic pulse */}
                          {!failed && (
                            <circle r="2.5" fill={b.color}>
                              <animateMotion dur={`${1.8 + i * 0.2}s`} repeatCount="indefinite" path={`M 150 44 L ${x + 20} 70`} />
                            </circle>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </div>

            {/* Content */}
            <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
              <h4
                style={{
                  fontFamily: "var(--eng-font)",
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "var(--eng-text)",
                  margin: "0 0 6px",
                }}
              >
                {b.title}
              </h4>
              <p
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.82rem",
                  color: "var(--eng-text-muted)",
                  lineHeight: 1.55,
                  margin: "0 0 12px",
                  flex: 1,
                }}
              >
                {b.desc}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {b.chips.map((c) => (
                  <span
                    key={c}
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: b.color,
                      background: `${b.color}12`,
                      border: `1px solid ${b.color}30`,
                      padding: "3px 8px",
                      borderRadius: 999,
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Terminology */}
      <div className="card-eng" style={{ padding: 20 }}>
        <h4
          style={{
            fontFamily: "var(--eng-font)",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "var(--eng-text)",
            margin: "0 0 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <BookOpen className="w-4 h-4" style={{ color: "var(--eng-primary)" }} />
          Key Terminology
        </h4>
        <div style={{ display: "grid", gap: 10 }}>
          {terms.map((t) => (
            <div
              key={t.term}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr",
                gap: 12,
                alignItems: "start",
                padding: "8px 0",
                borderBottom: "1px dashed var(--eng-border)",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--eng-font)",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  color: "var(--eng-primary)",
                }}
              >
                {t.term}
              </span>
              <span
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.82rem",
                  color: "var(--eng-text)",
                  lineHeight: 1.55,
                }}
              >
                {t.meaning}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 - Network Type Explorer                                      */
/* ================================================================== */

interface NetworkType {
  id: string;
  label: string;
  fullName: string;
  range: string;
  color: string;
  soft: string;
  tagline: string;
  description: string;
  examples: string[];
  deviceCount: string;
  speed: string;
  latency: string;
  ownedBy: string;
  technology: string;
  icon: React.ReactNode;
}

const NETWORK_TYPES: NetworkType[] = [
  {
    id: "lan",
    label: "LAN",
    fullName: "Local Area Network",
    range: "< 1 km",
    color: "#3b82f6",
    soft: "#dbeafe",
    tagline: "One building, one super-fast network",
    description:
      "A LAN connects devices within a small area like a room, building, or campus. Because everything is close together, it runs at very high speed with almost zero delay.",
    examples: ["Home Wi-Fi", "School computer lab", "Office floor"],
    deviceCount: "2 – 500",
    speed: "100 Mbps – 10 Gbps",
    latency: "< 1 ms",
    ownedBy: "Home / School / Office",
    technology: "Ethernet, Wi-Fi",
    icon: <Laptop className="w-5 h-5" />,
  },
  {
    id: "man",
    label: "MAN",
    fullName: "Metropolitan Area Network",
    range: "1 – 100 km",
    color: "#f59e0b",
    soft: "#fef3c7",
    tagline: "A whole city, stitched together",
    description:
      "A MAN spans a city or metropolitan area. It joins many LANs across buildings, campuses or districts using high-capacity fiber links laid underground across the city.",
    examples: ["City-wide cable TV", "University campuses in a city", "City government network"],
    deviceCount: "100 – 10,000+",
    speed: "100 Mbps – 1 Gbps",
    latency: "5 – 20 ms",
    ownedBy: "City / ISP / Large org",
    technology: "Fiber, MPLS, Metro-Ethernet",
    icon: <Building2 className="w-5 h-5" />,
  },
  {
    id: "wan",
    label: "WAN",
    fullName: "Wide Area Network",
    range: "> 100 km",
    color: "#10b981",
    soft: "#d1fae5",
    tagline: "Continents, oceans, and everything in between",
    description:
      "A WAN covers very large areas - countries and even continents. The Internet itself is the biggest WAN on the planet. WANs use leased lines, undersea cables and satellites.",
    examples: ["The Internet", "Bank ATM networks", "Multinational corporate networks"],
    deviceCount: "Millions+",
    speed: "Mbps – Tbps (total)",
    latency: "50 – 300 ms",
    ownedBy: "ISPs, Telecoms, Govts",
    technology: "Fiber, Satellite, Submarine cable",
    icon: <Globe className="w-5 h-5" />,
  },
];

const LAN_ICON_POOL = ["monitor", "laptop", "printer", "phone", "server", "phone", "laptop", "monitor", "printer", "phone"];
const LAN_LABEL_POOL = ["PC", "Laptop", "Printer", "Phone", "Server", "Tablet", "Laptop 2", "PC 2", "Printer 2", "Phone 2"];

function generateLanDevices(count: number) {
  const cx = 290;
  const cy = 160;
  const radius = 115;
  const out: { x: number; y: number; label: string; icon: string }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
    out.push({
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
      label: LAN_LABEL_POOL[i % LAN_LABEL_POOL.length],
      icon: LAN_ICON_POOL[i % LAN_ICON_POOL.length],
    });
  }
  return out;
}

function NetworkTypeExplorer() {
  const [selected, setSelected] = useState<string>("lan");
  const [animPhase, setAnimPhase] = useState(0);
  const [hoveredDevice, setHoveredDevice] = useState<number | null>(null);

  // LAN-tweakable controls (also used as animation controls for all types)
  const [lanDeviceCount, setLanDeviceCount] = useState(6);
  const [isPaused, setIsPaused] = useState(false);
  const [speedMult, setSpeedMult] = useState(1); // 0.5 / 1 / 2
  const [shuffleSeed, setShuffleSeed] = useState(0);

  useEffect(() => {
    setAnimPhase(0);
    const t1 = setTimeout(() => setAnimPhase(1), 100);
    const t2 = setTimeout(() => setAnimPhase(2), 400);
    const t3 = setTimeout(() => setAnimPhase(3), 700);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [selected, lanDeviceCount, shuffleSeed]);

  const nt = NETWORK_TYPES.find((n) => n.id === selected)!;

  // LAN uses a central router + ring of devices (star topology).
  // MAN/WAN keep static layouts.
  const LAN_ROUTER = { x: 290, y: 160 };

  const staticLayouts: Record<string, { x: number; y: number; label: string; icon: string }[]> = {
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

  const devices =
    selected === "lan"
      ? generateLanDevices(lanDeviceCount)
      : staticLayouts[selected];

  // Connections
  const connections: [number, number][] = [];
  if (selected === "lan") {
    // Star topology: every device connects to the router (index = devices.length -> router).
    for (let i = 0; i < devices.length; i++) connections.push([i, -1]); // -1 = router
  } else {
    for (let i = 0; i < devices.length - 1; i++) connections.push([i, i + 1]);
    if (devices.length > 2) connections.push([0, devices.length - 1]);
  }

  // Data packet animation
  const [packetPos, setPacketPos] = useState(0);
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setPacketPos((p) => (p + 1) % 100);
    }, Math.max(10, 30 / speedMult));
    return () => clearInterval(interval);
  }, [isPaused, speedMult]);

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

      {/* ---- Edit / Tweak controls ---- */}
      <div
        className="card-eng"
        style={{
          padding: "12px 16px",
          marginBottom: 14,
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
          alignItems: "center",
          background: "var(--eng-surface)",
        }}
      >
        {/* Device count - LAN only */}
        <div className="flex items-center gap-3" style={{ minWidth: 210 }}>
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.78rem",
              fontWeight: 600,
              color: selected === "lan" ? "var(--eng-text)" : "var(--eng-text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Devices: <span style={{ color: selected === "lan" ? nt.color : undefined }}>{selected === "lan" ? lanDeviceCount : devices.length}</span>
          </span>
          <input
            type="range"
            min={3}
            max={10}
            value={lanDeviceCount}
            disabled={selected !== "lan"}
            onChange={(e) => setLanDeviceCount(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: nt.color,
              cursor: selected === "lan" ? "pointer" : "not-allowed",
              opacity: selected === "lan" ? 1 : 0.4,
            }}
            aria-label="Number of devices"
          />
        </div>

        {/* Play / Pause */}
        <button
          onClick={() => setIsPaused((p) => !p)}
          className="btn-eng-outline"
          style={{
            fontSize: "0.78rem",
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          aria-label={isPaused ? "Resume animation" : "Pause animation"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {isPaused ? "Play" : "Pause"}
        </button>

        {/* Speed */}
        <div className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5" style={{ color: "var(--eng-text-muted)" }} />
          <span
            style={{
              fontFamily: "var(--eng-font)",
              fontSize: "0.72rem",
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
                  border: active ? `1.5px solid ${nt.color}` : "1px solid var(--eng-border)",
                  background: active ? `${nt.color}15` : "var(--eng-surface)",
                  color: active ? nt.color : "var(--eng-text-muted)",
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {s}×
              </button>
            );
          })}
        </div>

        {/* Shuffle - LAN re-angle / MAN-WAN re-replay */}
        <button
          onClick={() => setShuffleSeed((s) => s + 1)}
          className="btn-eng-outline"
          style={{
            fontSize: "0.78rem",
            padding: "6px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
          title="Replay animation"
        >
          <RotateCw className="w-3.5 h-3.5" />
          Replay
        </button>
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
            const db = b === -1 ? LAN_ROUTER : devices[b];
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
                {/* Animated data packet: for LAN one packet per connection (staggered) */}
                {animPhase >= 3 && selected === "lan" && (() => {
                  const offset = (i / Math.max(1, connections.length)) * 0.8;
                  const p = ((packetPos / 100) * 1.2 + offset) % 1;
                  const visible = p < 0.95;
                  if (!visible) return null;
                  // bounce direction: even connections go out, odd go back
                  const t = i % 2 === 0 ? p : 1 - p;
                  return (
                    <circle
                      cx={da.x + (db.x - da.x) * t}
                      cy={da.y + (db.y - da.y) * t}
                      r="4"
                      fill={nt.color}
                      filter="url(#glow)"
                      opacity={0.9}
                    />
                  );
                })()}
                {/* Animated data packet: MAN/WAN - two packets on long path */}
                {animPhase >= 3 && selected !== "lan" && i === 0 && (
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
                {animPhase >= 3 && selected !== "lan" && i === Math.min(2, connections.length - 1) && (
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

          {/* LAN - central router */}
          {selected === "lan" && (
            <g style={{ opacity: animPhase >= 1 ? 1 : 0, transition: "opacity 0.4s ease" }}>
              <circle cx={LAN_ROUTER.x} cy={LAN_ROUTER.y} r={28} fill={`${nt.color}18`} stroke={nt.color} strokeWidth={2} />
              {/* Router icon: simple antennae */}
              <rect x={LAN_ROUTER.x - 12} y={LAN_ROUTER.y - 4} width={24} height={10} rx={2} fill="none" stroke={nt.color} strokeWidth={1.6} />
              <circle cx={LAN_ROUTER.x - 6} cy={LAN_ROUTER.y + 1} r={1.4} fill={nt.color} />
              <circle cx={LAN_ROUTER.x + 6} cy={LAN_ROUTER.y + 1} r={1.4} fill={nt.color} />
              <line x1={LAN_ROUTER.x - 8} y1={LAN_ROUTER.y - 4} x2={LAN_ROUTER.x - 12} y2={LAN_ROUTER.y - 14} stroke={nt.color} strokeWidth={1.5} />
              <line x1={LAN_ROUTER.x + 8} y1={LAN_ROUTER.y - 4} x2={LAN_ROUTER.x + 12} y2={LAN_ROUTER.y - 14} stroke={nt.color} strokeWidth={1.5} />
              <text x={LAN_ROUTER.x} y={LAN_ROUTER.y + 44} textAnchor="middle" fill={nt.color} style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", fontWeight: 700 }}>
                Router / Switch
              </text>
            </g>
          )}

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
            {nt.fullName} - Range: {nt.range}
          </text>
        </svg>
      </div>

      {/* Info card - redesigned as a network profile panel */}
      <div
        className="card-eng eng-fadeIn"
        key={selected}
        style={{
          padding: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Top accent ribbon */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: nt.color,
          }}
        />

        {/* Header band */}
        <div
          style={{
            position: "relative",
            padding: "20px 22px 18px",
            background: nt.soft,
            borderBottom: `1px dashed ${nt.color}40`,
            overflow: "hidden",
          }}
        >
          {/* Decorative rotating ring */}
          <svg
            viewBox="0 0 120 120"
            style={{
              position: "absolute",
              top: -20,
              right: -20,
              width: 140,
              height: 140,
              opacity: 0.35,
              pointerEvents: "none",
            }}
          >
            <circle cx={60} cy={60} r={50} fill="none" stroke={nt.color} strokeWidth={1.5} strokeDasharray="5 6">
              <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="30s" repeatCount="indefinite" />
            </circle>
            <circle cx={60} cy={60} r={34} fill="none" stroke={nt.color} strokeWidth={1} strokeDasharray="3 5" opacity={0.6}>
              <animateTransform attributeName="transform" type="rotate" from="360 60 60" to="0 60 60" dur="24s" repeatCount="indefinite" />
            </circle>
          </svg>

          <div className="flex items-center gap-4 flex-wrap" style={{ position: "relative", zIndex: 1 }}>
            {/* Big label disc */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 16,
                background: "#ffffff",
                border: `2px solid ${nt.color}`,
                boxShadow: `0 8px 20px ${nt.color}30`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                color: nt.color,
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--eng-font)",
                  fontWeight: 900,
                  fontSize: "1.15rem",
                  letterSpacing: "0.02em",
                  lineHeight: 1,
                }}
              >
                {nt.label}
              </span>
              <span style={{ marginTop: 4 }}>{nt.icon}</span>
            </div>

            <div style={{ flex: 1, minWidth: 220 }}>
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: nt.color,
                  marginBottom: 4,
                }}
              >
                {nt.fullName}
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
                {nt.tagline}
              </div>
            </div>

            {/* Range pill */}
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "#ffffff",
                border: `1px solid ${nt.color}40`,
                textAlign: "center",
                boxShadow: `0 4px 12px ${nt.color}18`,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.6rem",
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--eng-text-muted)",
                  marginBottom: 2,
                }}
              >
                Range
              </div>
              <div
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.95rem",
                  fontWeight: 800,
                  color: nt.color,
                  lineHeight: 1,
                }}
              >
                {nt.range}
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
              margin: "0 0 16px",
            }}
          >
            {nt.description}
          </p>

          {/* 4 stat tiles */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              { label: "Speed", value: nt.speed },
              { label: "Latency", value: nt.latency },
              { label: "Devices", value: nt.deviceCount },
              { label: "Owner", value: nt.ownedBy },
            ].map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  background: `${nt.color}08`,
                  border: `1px solid ${nt.color}25`,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.6rem",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "var(--eng-text-muted)",
                    marginBottom: 3,
                  }}
                >
                  {s.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--eng-text)",
                    lineHeight: 1.25,
                  }}
                >
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Technology chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 10,
              background: "var(--eng-surface)",
              border: "1px dashed var(--eng-border)",
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "var(--eng-font)",
                fontSize: "0.7rem",
                fontWeight: 800,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--eng-text-muted)",
              }}
            >
              Tech:
            </span>
            <span
              style={{
                fontFamily: "var(--eng-font)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--eng-text)",
              }}
            >
              {nt.technology}
            </span>
          </div>

          {/* Examples section */}
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  width: 4,
                  height: 16,
                  borderRadius: 2,
                  background: nt.color,
                }}
              />
              <span
                style={{
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--eng-text)",
                }}
              >
                Real-world examples
              </span>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 8,
              }}
            >
              {nt.examples.map((ex, i) => (
                <div
                  key={ex}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "#ffffff",
                    border: `1px solid ${nt.color}25`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      background: `${nt.color}15`,
                      color: nt.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--eng-font)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "var(--eng-text)",
                    }}
                  >
                    {ex}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  TAB 2 - Client-Server vs Peer-to-Peer                             */
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
/*  TAB 3 - Practice: Classify Networks                                */
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
      id: "concept",
      label: "Concept",
      icon: <BookOpen className="w-4 h-4" />,
      content: <NetworkConcept />,
    },
    {
      id: "types",
      label: "Types",
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
      placementRelevance="Low"
    />
  );
}
