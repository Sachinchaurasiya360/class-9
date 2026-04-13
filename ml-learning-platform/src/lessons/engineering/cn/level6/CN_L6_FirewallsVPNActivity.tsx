"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Lock, Wifi, Globe, Server, CheckCircle2, XCircle, RefreshCw, ArrowRight, Eye } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface FirewallRule {
  id: number;
  src: string;
  dst: string;
  port: number;
  protocol: string;
  action: "ALLOW" | "DENY";
}

interface Packet {
  id: number;
  src: string;
  dst: string;
  port: number;
  protocol: string;
  x: number;
  status: "traveling" | "checking" | "allowed" | "denied";
  matchedRule: number | null;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Firewall                                                   */
/* ------------------------------------------------------------------ */

const FIREWALL_RULES: FirewallRule[] = [
  { id: 1, src: "Any", dst: "WebServer", port: 443, protocol: "TCP", action: "ALLOW" },
  { id: 2, src: "Any", dst: "WebServer", port: 80, protocol: "TCP", action: "ALLOW" },
  { id: 3, src: "Admin", dst: "WebServer", port: 22, protocol: "TCP", action: "ALLOW" },
  { id: 4, src: "Any", dst: "WebServer", port: 22, protocol: "TCP", action: "DENY" },
  { id: 5, src: "Any", dst: "Any", port: 0, protocol: "Any", action: "DENY" },
];

const SAMPLE_PACKETS = [
  { src: "User", dst: "WebServer", port: 443, protocol: "TCP" },
  { src: "User", dst: "WebServer", port: 22, protocol: "TCP" },
  { src: "Admin", dst: "WebServer", port: 22, protocol: "TCP" },
  { src: "User", dst: "WebServer", port: 3306, protocol: "TCP" },
  { src: "User", dst: "WebServer", port: 80, protocol: "TCP" },
];

function FirewallTab() {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [activePacketIdx, setActivePacketIdx] = useState(0);
  const [highlightedRule, setHighlightedRule] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const sendPacket = useCallback(() => {
    if (isAnimating || activePacketIdx >= SAMPLE_PACKETS.length) return;
    setIsAnimating(true);
    const pktData = SAMPLE_PACKETS[activePacketIdx];

    const newPacket: Packet = {
      id: Date.now(),
      ...pktData,
      x: 0,
      status: "traveling",
      matchedRule: null,
    };

    setPackets((prev) => [...prev, newPacket]);

    // Animate travel to firewall
    timerRef.current = setTimeout(() => {
      setPackets((prev) =>
        prev.map((p) => (p.id === newPacket.id ? { ...p, x: 50, status: "checking" } : p))
      );

      // Check rules sequentially
      let matchIdx = -1;
      for (let i = 0; i < FIREWALL_RULES.length; i++) {
        const rule = FIREWALL_RULES[i];
        const srcMatch = rule.src === "Any" || rule.src === pktData.src;
        const dstMatch = rule.dst === "Any" || rule.dst === pktData.dst;
        const portMatch = rule.port === 0 || rule.port === pktData.port;
        const protoMatch = rule.protocol === "Any" || rule.protocol === pktData.protocol;
        if (srcMatch && dstMatch && portMatch && protoMatch) {
          matchIdx = i;
          break;
        }
      }

      const matchedRule = matchIdx >= 0 ? FIREWALL_RULES[matchIdx] : null;
      setHighlightedRule(matchedRule ? matchedRule.id : null);

      timerRef.current = setTimeout(() => {
        const action = matchedRule ? matchedRule.action : "DENY";
        setPackets((prev) =>
          prev.map((p) =>
            p.id === newPacket.id
              ? {
                  ...p,
                  x: action === "ALLOW" ? 100 : 50,
                  status: action === "ALLOW" ? "allowed" : "denied",
                  matchedRule: matchedRule?.id ?? null,
                }
              : p
          )
        );

        timerRef.current = setTimeout(() => {
          setHighlightedRule(null);
          setIsAnimating(false);
          setActivePacketIdx((prev) => prev + 1);
        }, 800);
      }, 800);
    }, 600);
  }, [isAnimating, activePacketIdx, cleanup]);

  const handleReset = useCallback(() => {
    cleanup();
    setPackets([]);
    setActivePacketIdx(0);
    setHighlightedRule(null);
    setIsAnimating(false);
  }, [cleanup]);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        A <strong>firewall</strong> inspects network packets against a set of rules and decides whether to allow or deny each packet.
        Rules are checked top-to-bottom; the first matching rule applies.
      </div>

      {/* Firewall rule table */}
      <div className="card-eng" style={{ overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--eng-border)" }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            Firewall Rule Table
          </h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "var(--eng-surface)" }}>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>#</th>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>Source</th>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>Dest</th>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>Port</th>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>Proto</th>
              <th style={{ padding: "8px 10px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {FIREWALL_RULES.map((rule) => (
              <tr
                key={rule.id}
                style={{
                  background: highlightedRule === rule.id
                    ? rule.action === "ALLOW"
                      ? "rgba(16,185,129,0.15)"
                      : "rgba(239,68,68,0.15)"
                    : "transparent",
                  transition: "background 0.3s ease",
                }}
              >
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)", fontWeight: 600 }}>{rule.id}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)" }}>{rule.src}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)" }}>{rule.dst}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)", fontFamily: "monospace" }}>{rule.port === 0 ? "*" : rule.port}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)" }}>{rule.protocol}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid var(--eng-border)" }}>
                  <span className="tag-eng" style={{
                    background: rule.action === "ALLOW" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                    color: rule.action === "ALLOW" ? "var(--eng-success)" : "var(--eng-danger)",
                  }}>
                    {rule.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Packet animation area */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          Packet Filtering Simulation
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              className="btn-eng"
              onClick={sendPacket}
              disabled={isAnimating || activePacketIdx >= SAMPLE_PACKETS.length}
              style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}
            >
              <ArrowRight className="w-3.5 h-3.5" /> Send Packet {activePacketIdx < SAMPLE_PACKETS.length ? activePacketIdx + 1 : ""}
            </button>
            <button className="btn-eng-outline" onClick={handleReset} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </h3>

        <svg viewBox="0 0 500 180" width="100%" style={{ maxWidth: 500 }}>
          {/* Internet cloud */}
          <ellipse cx="60" cy="90" rx="50" ry="35" fill="rgba(59,130,246,0.08)" stroke="var(--eng-primary)" strokeWidth="1.5" />
          <text x="60" y="87" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-primary)" }}>Internet</text>
          <text x="60" y="100" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>(External)</text>

          {/* Firewall */}
          <rect x="200" y="50" width="60" height="80" rx="6" fill="rgba(245,158,11,0.1)" stroke="var(--eng-warning)" strokeWidth="2" />
          <text x="230" y="85" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }}>FIREWALL</text>
          <Shield className="w-4 h-4" style={{ color: "var(--eng-warning)" }} />
          {/* Flame-wall icon lines */}
          {[65, 75, 85, 95, 105, 115].map((y, i) => (
            <line key={i} x1="205" y1={y} x2="255" y2={y} stroke="var(--eng-warning)" strokeWidth="0.5" strokeDasharray="3 2" opacity="0.4" />
          ))}

          {/* Server */}
          <rect x="380" y="60" width="80" height="60" rx="8" fill="var(--eng-surface)" stroke="var(--eng-success)" strokeWidth="1.5" />
          <text x="420" y="87" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-success)" }}>Server</text>
          <text x="420" y="100" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>(Protected)</text>

          {/* Connection lines */}
          <line x1="110" y1="90" x2="200" y2="90" stroke="var(--eng-border)" strokeWidth="1.5" strokeDasharray="4 4" />
          <line x1="260" y1="90" x2="380" y2="90" stroke="var(--eng-border)" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Animated packets */}
          {packets.slice(-5).map((pkt) => {
            const xPos = pkt.x === 0 ? 130 : pkt.x === 50 ? 230 : pkt.x === 100 ? 370 : 230;
            const color = pkt.status === "allowed" ? "var(--eng-success)" : pkt.status === "denied" ? "var(--eng-danger)" : "var(--eng-primary)";

            return (
              <g key={pkt.id} style={{ transition: "all 0.5s ease" }}>
                <rect
                  x={xPos - 15}
                  y={40}
                  width={30}
                  height={18}
                  rx={4}
                  fill={color}
                  style={{ transition: "all 0.5s ease" }}
                />
                <text x={xPos} y={52} textAnchor="middle" style={{ fontSize: "6px", fontFamily: "monospace", fill: "#fff", fontWeight: 700 }}>
                  :{pkt.port}
                </text>
                {pkt.status === "denied" && (
                  <g className="eng-fadeIn">
                    <line x1={xPos - 10} y1={35} x2={xPos + 10} y2={55} stroke="var(--eng-danger)" strokeWidth="2" />
                    <line x1={xPos + 10} y1={35} x2={xPos - 10} y2={55} stroke="var(--eng-danger)" strokeWidth="2" />
                  </g>
                )}
                {pkt.status === "allowed" && (
                  <circle cx={xPos} cy={35} r="5" fill="var(--eng-success)" className="eng-fadeIn">
                    <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="1" />
                  </circle>
                )}
              </g>
            );
          })}
        </svg>

        {/* Packet log */}
        {packets.length > 0 && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
            {packets.map((pkt) => (
              <div
                key={pkt.id}
                className="eng-fadeIn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 10px",
                  borderRadius: 6,
                  background: pkt.status === "allowed" ? "rgba(16,185,129,0.08)" : pkt.status === "denied" ? "rgba(239,68,68,0.08)" : "var(--eng-surface)",
                  border: `1px solid ${pkt.status === "allowed" ? "rgba(16,185,129,0.3)" : pkt.status === "denied" ? "rgba(239,68,68,0.3)" : "var(--eng-border)"}`,
                  fontSize: "0.78rem",
                  fontFamily: "var(--eng-font)",
                }}
              >
                {pkt.status === "allowed" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-success)" }} />
                ) : pkt.status === "denied" ? (
                  <XCircle className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-danger)" }} />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--eng-primary)" }} />
                )}
                <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {pkt.src} -&gt; {pkt.dst}:{pkt.port}/{pkt.protocol}
                </span>
                <span style={{ marginLeft: "auto", fontWeight: 600, color: pkt.status === "allowed" ? "var(--eng-success)" : pkt.status === "denied" ? "var(--eng-danger)" : "var(--eng-text-muted)" }}>
                  {pkt.status === "allowed" ? "ALLOWED" : pkt.status === "denied" ? "DENIED" : pkt.status === "checking" ? "Checking..." : "Traveling..."}
                  {pkt.matchedRule && ` (Rule #${pkt.matchedRule})`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="info-eng">
        <strong>Firewall types:</strong> Packet-filtering (stateless), Stateful inspection, Application-layer (proxy), and Next-gen (NGFW) firewalls each offer different levels of inspection depth.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — VPN                                                        */
/* ------------------------------------------------------------------ */

function VPNTab() {
  const [showTunnel, setShowTunnel] = useState(false);
  const [packetPhase, setPacketPhase] = useState<"idle" | "encrypting" | "tunnel" | "decrypting" | "done">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const animatePacket = useCallback(() => {
    setPacketPhase("encrypting");
    timerRef.current = setTimeout(() => {
      setPacketPhase("tunnel");
      timerRef.current = setTimeout(() => {
        setPacketPhase("decrypting");
        timerRef.current = setTimeout(() => {
          setPacketPhase("done");
        }, 800);
      }, 1200);
    }, 800);
  }, []);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        A <strong>VPN (Virtual Private Network)</strong> creates an encrypted tunnel over the public Internet,
        making it appear as if you are directly connected to a private network.
      </div>

      {/* VPN Tunnel visualization */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          VPN Tunnel Visualization
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button
              className="btn-eng"
              onClick={() => { setShowTunnel(true); animatePacket(); }}
              disabled={packetPhase !== "idle" && packetPhase !== "done"}
              style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}
            >
              <Lock className="w-3.5 h-3.5" /> Send via VPN
            </button>
            <button className="btn-eng-outline" onClick={() => { cleanup(); setShowTunnel(false); setPacketPhase("idle"); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </h3>

        <svg viewBox="0 0 520 220" width="100%" style={{ maxWidth: 520 }}>
          {/* Site A */}
          <rect x="10" y="60" width="90" height="80" rx="10" fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth="1.5" />
          <text x="55" y="90" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-primary)" }}>Site A</text>
          <text x="55" y="105" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Private Net</text>
          <text x="55" y="118" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>192.168.1.0/24</text>

          {/* VPN Gateway A */}
          <rect x="110" y="75" width="50" height="50" rx="6" fill="rgba(245,158,11,0.1)" stroke="var(--eng-warning)" strokeWidth="1.5" />
          <text x="135" y="98" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }}>VPN</text>
          <text x="135" y="110" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-warning)" }}>GW</text>

          {/* Public Internet */}
          <ellipse cx="260" cy="100" rx="80" ry="50" fill="rgba(239,68,68,0.05)" stroke="var(--eng-danger)" strokeWidth="1" strokeDasharray="4 4" />
          <text x="260" y="97" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-danger)" }}>Public</text>
          <text x="260" y="112" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-danger)" }}>Internet</text>

          {/* VPN Gateway B */}
          <rect x="360" y="75" width="50" height="50" rx="6" fill="rgba(245,158,11,0.1)" stroke="var(--eng-warning)" strokeWidth="1.5" />
          <text x="385" y="98" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }}>VPN</text>
          <text x="385" y="110" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-warning)" }}>GW</text>

          {/* Site B */}
          <rect x="420" y="60" width="90" height="80" rx="10" fill="var(--eng-surface)" stroke="var(--eng-success)" strokeWidth="1.5" />
          <text x="465" y="90" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-success)" }}>Site B</text>
          <text x="465" y="105" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Private Net</text>
          <text x="465" y="118" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>10.0.0.0/24</text>

          {/* Encrypted tunnel (colored tube) */}
          {showTunnel && (
            <g className="eng-fadeIn">
              <rect x="160" y="82" width="200" height="36" rx="18" fill="rgba(16,185,129,0.12)" stroke="var(--eng-success)" strokeWidth="2" />
              <text x="260" y="77" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>
                Encrypted Tunnel
              </text>
              {/* Lock icons inside tunnel */}
              {[190, 230, 270, 310].map((x) => (
                <rect key={x} x={x} y="93" width="10" height="10" rx="2" fill="var(--eng-success)" opacity="0.3" />
              ))}
            </g>
          )}

          {/* Animated packet */}
          {packetPhase !== "idle" && (
            <g>
              <rect
                x={
                  packetPhase === "encrypting" ? 125
                    : packetPhase === "tunnel" ? 250
                    : packetPhase === "decrypting" ? 375
                    : 450
                }
                y={packetPhase === "tunnel" ? 90 : 48}
                width={24}
                height={16}
                rx={4}
                fill={
                  packetPhase === "encrypting" || packetPhase === "decrypting" ? "var(--eng-warning)"
                    : packetPhase === "tunnel" ? "var(--eng-success)"
                    : "var(--eng-primary)"
                }
                style={{ transition: "all 0.8s ease" }}
              />
              <text
                x={
                  (packetPhase === "encrypting" ? 125
                    : packetPhase === "tunnel" ? 250
                    : packetPhase === "decrypting" ? 375
                    : 450) + 12
                }
                y={(packetPhase === "tunnel" ? 90 : 48) + 11}
                textAnchor="middle"
                style={{ fontSize: "6px", fontFamily: "monospace", fill: "#fff", fontWeight: 700, transition: "all 0.8s ease" }}
              >
                PKT
              </text>
            </g>
          )}

          {/* Phase label */}
          <text x="260" y="195" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>
            {packetPhase === "idle" ? "Click 'Send via VPN' to start" :
             packetPhase === "encrypting" ? "Encrypting at VPN Gateway A..." :
             packetPhase === "tunnel" ? "Traveling through encrypted tunnel..." :
             packetPhase === "decrypting" ? "Decrypting at VPN Gateway B..." :
             "Packet delivered securely!"}
          </text>
        </svg>
      </div>

      {/* IPSec vs SSL VPN */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          IPSec VPN vs SSL VPN
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: "12px 14px", borderRadius: 8, border: "1.5px solid var(--eng-primary)", background: "rgba(59,130,246,0.04)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-primary)", marginBottom: 8 }}>
              IPSec VPN
            </div>
            <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>Network layer (Layer 3)</li>
              <li>Site-to-site or remote access</li>
              <li>Requires client software</li>
              <li>Full network access</li>
              <li>Tunnel + Transport mode</li>
            </ul>
          </div>
          <div style={{ padding: "12px 14px", borderRadius: 8, border: "1.5px solid var(--eng-success)", background: "rgba(16,185,129,0.04)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-success)", marginBottom: 8 }}>
              SSL VPN
            </div>
            <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>Application layer (Layer 7)</li>
              <li>Remote access (browser-based)</li>
              <li>No special client needed</li>
              <li>Per-application access</li>
              <li>Uses TLS/SSL protocol</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — DMZ Architecture                                           */
/* ------------------------------------------------------------------ */

function DMZTab() {
  const [activeZone, setActiveZone] = useState<"external" | "dmz" | "internal" | null>(null);
  const [showTraffic, setShowTraffic] = useState(false);
  const [trafficStep, setTrafficStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const animateTraffic = useCallback(() => {
    setShowTraffic(true);
    setTrafficStep(0);
    let step = 0;
    function next() {
      step++;
      if (step <= 4) {
        timerRef.current = setTimeout(() => {
          setTrafficStep(step);
          next();
        }, 700);
      }
    }
    next();
  }, []);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        A <strong>DMZ (Demilitarized Zone)</strong> is a network segment between the external Internet and the internal network.
        Public-facing servers (web, email, DNS) sit in the DMZ, shielded by two firewalls.
      </div>

      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          DMZ Architecture
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            <button className="btn-eng" onClick={animateTraffic} disabled={showTraffic} style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowRight className="w-3.5 h-3.5" /> Show Traffic Flow
            </button>
            <button className="btn-eng-outline" onClick={() => { cleanup(); setShowTraffic(false); setTrafficStep(0); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </h3>

        <svg viewBox="0 0 520 300" width="100%" style={{ maxWidth: 520 }}>
          {/* External zone */}
          <rect
            x="10"
            y="10"
            width="110"
            height="280"
            rx="12"
            fill={activeZone === "external" ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.03)"}
            stroke="var(--eng-danger)"
            strokeWidth="1.5"
            strokeDasharray="6 4"
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
            onClick={() => setActiveZone(activeZone === "external" ? null : "external")}
          />
          <text x="65" y="35" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>External</text>
          <text x="65" y="50" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>(Untrusted)</text>

          {/* Internet users */}
          <rect x="30" y="80" width="70" height="40" rx="6" fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth="1" />
          <text x="65" y="100" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text)" }}>Users</text>
          <text x="65" y="112" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Internet</text>

          <rect x="30" y="140" width="70" height="40" rx="6" fill="var(--eng-surface)" stroke="var(--eng-danger)" strokeWidth="1" />
          <text x="65" y="160" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Attackers</text>

          {/* Outer Firewall */}
          <rect x="135" y="80" width="40" height="140" rx="6" fill="rgba(245,158,11,0.15)" stroke="var(--eng-warning)" strokeWidth="2" />
          <text x="155" y="150" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }} transform="rotate(-90, 155, 150)">
            FIREWALL 1
          </text>

          {/* DMZ zone */}
          <rect
            x="190"
            y="10"
            width="130"
            height="280"
            rx="12"
            fill={activeZone === "dmz" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.03)"}
            stroke="var(--eng-warning)"
            strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
            onClick={() => setActiveZone(activeZone === "dmz" ? null : "dmz")}
          />
          <text x="255" y="35" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }}>DMZ</text>
          <text x="255" y="50" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>(Semi-trusted)</text>

          {/* DMZ servers */}
          {[
            { y: 70, label: "Web Server", sub: "Port 80, 443" },
            { y: 130, label: "Mail Server", sub: "Port 25" },
            { y: 190, label: "DNS Server", sub: "Port 53" },
          ].map((srv, i) => (
            <g key={i}>
              <rect x="210" y={srv.y} width="90" height="45" rx="6" fill="var(--eng-surface)" stroke="var(--eng-warning)" strokeWidth="1" />
              <text x="255" y={srv.y + 20} textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>
                {srv.label}
              </text>
              <text x="255" y={srv.y + 34} textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
                {srv.sub}
              </text>
            </g>
          ))}

          {/* Inner Firewall */}
          <rect x="335" y="80" width="40" height="140" rx="6" fill="rgba(245,158,11,0.15)" stroke="var(--eng-warning)" strokeWidth="2" />
          <text x="355" y="150" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-warning)" }} transform="rotate(-90, 355, 150)">
            FIREWALL 2
          </text>

          {/* Internal zone */}
          <rect
            x="390"
            y="10"
            width="120"
            height="280"
            rx="12"
            fill={activeZone === "internal" ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.03)"}
            stroke="var(--eng-success)"
            strokeWidth="1.5"
            style={{ cursor: "pointer", transition: "fill 0.3s" }}
            onClick={() => setActiveZone(activeZone === "internal" ? null : "internal")}
          />
          <text x="450" y="35" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>Internal</text>
          <text x="450" y="50" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>(Trusted)</text>

          {/* Internal servers */}
          {[
            { y: 80, label: "DB Server" },
            { y: 140, label: "App Server" },
            { y: 200, label: "Workstations" },
          ].map((srv, i) => (
            <g key={i}>
              <rect x="405" y={srv.y} width="90" height="40" rx="6" fill="var(--eng-surface)" stroke="var(--eng-success)" strokeWidth="1" />
              <text x="450" y={srv.y + 24} textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>
                {srv.label}
              </text>
            </g>
          ))}

          {/* Traffic flow arrows */}
          {showTraffic && trafficStep >= 1 && (
            <g className="eng-fadeIn">
              <line x1="100" y1="100" x2="135" y2="100" stroke="var(--eng-success)" strokeWidth="2" markerEnd="url(#dmzArrow)" />
              <text x="118" y="93" textAnchor="middle" style={{ fontSize: "6px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)" }}>HTTPS</text>
            </g>
          )}
          {showTraffic && trafficStep >= 2 && (
            <g className="eng-fadeIn">
              <line x1="175" y1="92" x2="210" y2="92" stroke="var(--eng-success)" strokeWidth="2" markerEnd="url(#dmzArrow)" />
              <text x="193" y="87" textAnchor="middle" style={{ fontSize: "6px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)" }}>OK</text>
            </g>
          )}
          {showTraffic && trafficStep >= 3 && (
            <g className="eng-fadeIn">
              <line x1="100" y1="160" x2="135" y2="160" stroke="var(--eng-danger)" strokeWidth="2" />
              <line x1="130" y1="155" x2="140" y2="165" stroke="var(--eng-danger)" strokeWidth="2" />
              <line x1="140" y1="155" x2="130" y2="165" stroke="var(--eng-danger)" strokeWidth="2" />
              <text x="118" y="153" textAnchor="middle" style={{ fontSize: "6px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>BLOCKED</text>
            </g>
          )}
          {showTraffic && trafficStep >= 4 && (
            <g className="eng-fadeIn">
              <line x1="300" y1="150" x2="335" y2="150" stroke="var(--eng-danger)" strokeWidth="2" />
              <line x1="330" y1="145" x2="340" y2="155" stroke="var(--eng-danger)" strokeWidth="2" />
              <line x1="340" y1="145" x2="330" y2="155" stroke="var(--eng-danger)" strokeWidth="2" />
              <text x="318" y="143" textAnchor="middle" style={{ fontSize: "6px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>NO DIRECT</text>
            </g>
          )}

          <defs>
            <marker id="dmzArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-success)" />
            </marker>
          </defs>
        </svg>

        {/* Zone descriptions */}
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
          {[
            { zone: "External", desc: "Untrusted public Internet traffic", color: "var(--eng-danger)" },
            { zone: "DMZ", desc: "Public-facing servers with limited access", color: "var(--eng-warning)" },
            { zone: "Internal", desc: "Sensitive data, no direct external access", color: "var(--eng-success)" },
          ].map((z) => (
            <div key={z.zone} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${z.color}22`, background: `${z.color}08` }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 700, color: z.color, fontFamily: "var(--eng-font)" }}>{z.zone}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>{z.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                                */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What does a packet-filtering firewall inspect?",
    options: [
      "Only the payload/data of each packet",
      "Source/destination IP, port, and protocol headers",
      "The user's browsing history",
      "DNS queries only",
    ],
    correctIndex: 1,
    explanation: "Packet-filtering firewalls examine header information: source/destination IP addresses, port numbers, and protocol type to decide whether to allow or deny traffic.",
  },
  {
    question: "What is the key difference between IPSec VPN and SSL VPN?",
    options: [
      "IPSec works at Layer 3 (network); SSL works at Layer 7 (application)",
      "IPSec is faster than SSL",
      "SSL VPN requires special client software; IPSec does not",
      "They are identical in all aspects",
    ],
    correctIndex: 0,
    explanation: "IPSec VPN operates at the network layer providing full network access, while SSL VPN operates at the application layer and can be browser-based.",
  },
  {
    question: "What is the purpose of a DMZ in network architecture?",
    options: [
      "To increase Internet speed",
      "To host public-facing servers in an isolated zone between two firewalls",
      "To replace the internal network",
      "To connect directly to the ISP",
    ],
    correctIndex: 1,
    explanation: "A DMZ isolates public-facing servers (web, mail, DNS) in a semi-trusted zone between the external Internet and the internal network, protected by two firewalls.",
  },
  {
    question: "In a stateful firewall, what additional information is tracked compared to a packet filter?",
    options: [
      "The physical cable type",
      "The state of active TCP connections",
      "The user's email address",
      "The server's CPU usage",
    ],
    correctIndex: 1,
    explanation: "Stateful firewalls track the state of active connections (established, related, new) and make decisions based on the context of the traffic flow, not just individual packets.",
  },
  {
    question: "In a VPN tunnel, packets are _____ at the entry point and _____ at the exit.",
    options: [
      "Compressed, decompressed",
      "Encrypted, decrypted",
      "Fragmented, reassembled",
      "Duplicated, merged",
    ],
    correctIndex: 1,
    explanation: "VPN tunnels encrypt packets at the entry gateway and decrypt them at the exit gateway, ensuring confidentiality across the public Internet.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs + Export                                                       */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "firewall",
    label: "Firewall",
    icon: <Shield className="w-4 h-4" />,
    content: <FirewallTab />,
  },
  {
    id: "vpn",
    label: "VPN",
    icon: <Lock className="w-4 h-4" />,
    content: <VPNTab />,
  },
  {
    id: "dmz",
    label: "DMZ",
    icon: <Server className="w-4 h-4" />,
    content: <DMZTab />,
  },
];

export default function CN_L6_FirewallsVPNActivity() {
  return (
    <EngineeringLessonShell
      title="Firewalls & VPN"
      level={6}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Network Attacks & Defenses"
      gateRelevance="1-2 marks"
      placementRelevance="Medium"
    />
  );
}
