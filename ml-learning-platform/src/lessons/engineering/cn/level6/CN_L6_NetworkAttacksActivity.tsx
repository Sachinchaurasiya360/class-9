"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, AlertTriangle, Wifi, Server, Eye, RefreshCw, ArrowRight, XCircle, CheckCircle2, Zap } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1 — DDoS Attack                                                */
/* ------------------------------------------------------------------ */

function DDoSTab() {
  const [phase, setPhase] = useState<"idle" | "attacking" | "overwhelmed" | "defending" | "mitigated">("idle");
  const [botCount, setBotCount] = useState(0);
  const [serverLoad, setServerLoad] = useState(10);
  const [rateLimit, setRateLimit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startAttack = useCallback(() => {
    cleanup();
    setPhase("attacking");
    setBotCount(0);
    setServerLoad(10);
    setRateLimit(false);
    let bots = 0;
    let load = 10;
    timerRef.current = setInterval(() => {
      bots = Math.min(bots + 1, 8);
      load = Math.min(load + 12, 100);
      setBotCount(bots);
      setServerLoad(load);
      if (load >= 100) {
        cleanup();
        setPhase("overwhelmed");
      }
    }, 400);
  }, [cleanup]);

  const activateDefense = useCallback(() => {
    cleanup();
    setPhase("defending");
    setRateLimit(true);
    let load = serverLoad;
    timerRef.current = setInterval(() => {
      load = Math.max(load - 8, 15);
      setServerLoad(load);
      if (load <= 15) {
        cleanup();
        setPhase("mitigated");
      }
    }, 300);
  }, [cleanup, serverLoad]);

  const handleReset = useCallback(() => {
    cleanup();
    setPhase("idle");
    setBotCount(0);
    setServerLoad(10);
    setRateLimit(false);
  }, [cleanup]);

  const loadColor = serverLoad > 80 ? "var(--eng-danger)" : serverLoad > 50 ? "var(--eng-warning)" : "var(--eng-success)";

  return (
    <div className="space-y-6">
      <div className="info-eng">
        A <strong>DDoS (Distributed Denial of Service)</strong> attack floods a server with massive traffic from many compromised machines (bots),
        overwhelming its capacity and making it unavailable to legitimate users.
      </div>

      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          DDoS Attack Simulation
          <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
            {phase === "idle" && (
              <button className="btn-eng" onClick={startAttack} style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4, background: "var(--eng-danger)", borderColor: "var(--eng-danger)" }}>
                <AlertTriangle className="w-3.5 h-3.5" /> Launch Attack
              </button>
            )}
            {phase === "overwhelmed" && (
              <button className="btn-eng" onClick={activateDefense} style={{ fontSize: "0.75rem", padding: "4px 12px", display: "flex", alignItems: "center", gap: 4 }}>
                <Shield className="w-3.5 h-3.5" /> Activate Defense
              </button>
            )}
            {phase !== "idle" && (
              <button className="btn-eng-outline" onClick={handleReset} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </h3>

        <svg viewBox="0 0 500 280" width="100%" style={{ maxWidth: 500 }}>
          {/* Botnet machines */}
          {Array.from({ length: 8 }).map((_, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            const x = 20 + col * 55;
            const y = 20 + row * 70;
            const active = i < botCount;

            return (
              <g key={i} style={{ opacity: active ? 1 : 0.2, transition: "opacity 0.3s" }}>
                <rect x={x} y={y} width="45" height="35" rx="4" fill={active ? "rgba(239,68,68,0.15)" : "var(--eng-surface)"} stroke={active ? "var(--eng-danger)" : "var(--eng-border)"} strokeWidth="1" />
                <text x={x + 22} y={y + 18} textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: active ? "var(--eng-danger)" : "var(--eng-text-muted)" }}>
                  Bot {i + 1}
                </text>
                <text x={x + 22} y={y + 28} textAnchor="middle" style={{ fontSize: "6px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
                  {active ? "FLOOD" : "idle"}
                </text>
                {/* Attack arrows */}
                {active && phase !== "mitigated" && (
                  <line x1={x + 45} y1={y + 17} x2={310} y2={140} stroke="var(--eng-danger)" strokeWidth="0.8" opacity="0.4" strokeDasharray="4 3">
                    <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.6s" repeatCount="indefinite" />
                  </line>
                )}
                {/* Blocked arrows when defending */}
                {active && rateLimit && (
                  <line x1={x + 45} y1={y + 17} x2={280} y2={140} stroke="var(--eng-warning)" strokeWidth="1" opacity="0.5">
                    <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1s" repeatCount="indefinite" />
                  </line>
                )}
              </g>
            );
          })}

          {/* Attacker label */}
          <text x="120" y="175" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>
            Botnet ({botCount} bots)
          </text>

          {/* Rate limiter / Defense */}
          {rateLimit && (
            <g className="eng-fadeIn">
              <rect x="275" y="100" width="50" height="80" rx="6" fill="rgba(59,130,246,0.1)" stroke="var(--eng-primary)" strokeWidth="2" />
              <text x="300" y="140" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-primary)" }} transform="rotate(-90, 300, 140)">
                RATE LIMIT
              </text>
            </g>
          )}

          {/* Target server */}
          <rect x="350" y="90" width="120" height="100" rx="10" fill="var(--eng-surface)" stroke={phase === "overwhelmed" ? "var(--eng-danger)" : "var(--eng-border)"} strokeWidth={phase === "overwhelmed" ? 3 : 1.5}>
            {phase === "overwhelmed" && (
              <animate attributeName="stroke" values="var(--eng-danger);#ff000044;var(--eng-danger)" dur="0.5s" repeatCount="indefinite" />
            )}
          </rect>
          <text x="410" y="115" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>Target Server</text>

          {/* Server capacity bar */}
          <text x="410" y="135" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>
            Capacity: {serverLoad}%
          </text>
          <rect x="365" y="142" width="90" height="12" rx="3" fill="#e2e8f0" />
          <rect x="365" y="142" width={90 * serverLoad / 100} height="12" rx="3" fill={loadColor} style={{ transition: "width 0.3s, fill 0.3s" }} />

          {/* Server status */}
          <text x="410" y="175" textAnchor="middle" style={{
            fontSize: "9px",
            fontFamily: "var(--eng-font)",
            fontWeight: 700,
            fill: phase === "overwhelmed" ? "var(--eng-danger)" : phase === "mitigated" ? "var(--eng-success)" : "var(--eng-text)",
          }}>
            {phase === "idle" ? "Online" : phase === "attacking" ? "Under Attack..." : phase === "overwhelmed" ? "DOWN!" : phase === "defending" ? "Recovering..." : "Protected"}
          </text>

          {/* Legitimate user */}
          <rect x="355" y="220" width="110" height="35" rx="6" fill="var(--eng-surface)" stroke={phase === "overwhelmed" ? "var(--eng-danger)" : "var(--eng-success)"} strokeWidth="1" />
          <text x="410" y="240" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: phase === "overwhelmed" ? "var(--eng-danger)" : "var(--eng-success)" }}>
            {phase === "overwhelmed" ? "Cannot connect!" : "Legitimate User"}
          </text>
        </svg>
      </div>

      {/* DDoS types */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          Types of DDoS Attacks
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {[
            { name: "Volumetric", desc: "UDP floods, ICMP floods. Saturate bandwidth.", color: "var(--eng-danger)" },
            { name: "Protocol", desc: "SYN floods, Ping of Death. Exhaust server resources.", color: "var(--eng-warning)" },
            { name: "Application", desc: "HTTP floods, Slowloris. Target application layer.", color: "var(--eng-primary)" },
          ].map((type) => (
            <div key={type.name} style={{ padding: "10px 12px", borderRadius: 8, border: `1.5px solid ${type.color}`, background: `${type.color}08` }}>
              <div style={{ fontSize: "0.85rem", fontWeight: 700, color: type.color, fontFamily: "var(--eng-font)", marginBottom: 4 }}>{type.name}</div>
              <div style={{ fontSize: "0.78rem", color: "var(--eng-text-muted)", fontFamily: "var(--eng-font)" }}>{type.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — MITM, ARP Spoofing, DNS Poisoning                         */
/* ------------------------------------------------------------------ */

function MITMTab() {
  const [attackType, setAttackType] = useState<"mitm" | "arp" | "dns">("mitm");
  const [animStep, setAnimStep] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const playAnimation = useCallback(() => {
    setAnimStep(0);
    let step = 0;
    function next() {
      step++;
      const maxSteps = attackType === "mitm" ? 4 : attackType === "arp" ? 4 : 4;
      if (step <= maxSteps) {
        timerRef.current = setTimeout(() => {
          setAnimStep(step);
          next();
        }, 900);
      }
    }
    next();
  }, [attackType]);

  const handleSwitchType = useCallback((type: "mitm" | "arp" | "dns") => {
    cleanup();
    setAttackType(type);
    setAnimStep(0);
  }, [cleanup]);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        In a <strong>Man-in-the-Middle (MITM)</strong> attack, the attacker secretly intercepts and possibly alters communication between two parties.
        Common techniques include <strong>ARP spoofing</strong> and <strong>DNS poisoning</strong>.
      </div>

      {/* Attack type selector */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
        {[
          { key: "mitm" as const, label: "MITM Overview" },
          { key: "arp" as const, label: "ARP Spoofing" },
          { key: "dns" as const, label: "DNS Poisoning" },
        ].map((t) => (
          <button
            key={t.key}
            className={attackType === t.key ? "btn-eng" : "btn-eng-outline"}
            onClick={() => handleSwitchType(t.key)}
            style={{ fontSize: "0.8rem" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* MITM Overview */}
      {attackType === "mitm" && (
        <div className="card-eng p-5 eng-fadeIn">
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            Man-in-the-Middle Attack
            <button className="btn-eng" onClick={playAnimation} disabled={animStep > 0 && animStep < 4} style={{ fontSize: "0.75rem", padding: "4px 12px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowRight className="w-3.5 h-3.5" /> Animate
            </button>
            <button className="btn-eng-outline" onClick={() => { cleanup(); setAnimStep(0); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </h3>

          <svg viewBox="0 0 460 200" width="100%" style={{ maxWidth: 460 }}>
            {/* Client */}
            <rect x="10" y="70" width="90" height="60" rx="8" fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth="1.5" />
            <text x="55" y="97" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-primary)" }}>Client</text>
            <text x="55" y="115" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Alice</text>

            {/* Attacker */}
            <rect
              x="180"
              y="30"
              width="100"
              height="60"
              rx="8"
              fill={animStep >= 1 ? "rgba(239,68,68,0.1)" : "var(--eng-surface)"}
              stroke={animStep >= 1 ? "var(--eng-danger)" : "var(--eng-border)"}
              strokeWidth={animStep >= 1 ? 2 : 1}
              style={{ transition: "all 0.4s" }}
            />
            <text x="230" y="55" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: animStep >= 1 ? "var(--eng-danger)" : "var(--eng-text-muted)" }}>
              Attacker
            </text>
            <text x="230" y="73" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: animStep >= 1 ? "var(--eng-danger)" : "var(--eng-text-muted)" }}>
              Eve (MITM)
            </text>

            {/* Server */}
            <rect x="360" y="70" width="90" height="60" rx="8" fill="var(--eng-surface)" stroke="var(--eng-success)" strokeWidth="1.5" />
            <text x="405" y="97" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-success)" }}>Server</text>
            <text x="405" y="115" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Bob</text>

            {/* Normal path (dashed, hidden when attack is active) */}
            <line x1="100" y1="100" x2="360" y2="100" stroke="var(--eng-border)" strokeWidth="1" strokeDasharray="6 4" opacity={animStep === 0 ? 0.5 : 0.1} />

            {/* Attack paths */}
            {animStep >= 2 && (
              <g className="eng-fadeIn">
                <line x1="100" y1="95" x2="185" y2="65" stroke="var(--eng-danger)" strokeWidth="2" strokeDasharray="6 4">
                  <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
                <text x="140" y="70" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Intercept</text>
              </g>
            )}
            {animStep >= 3 && (
              <g className="eng-fadeIn">
                <line x1="280" y1="65" x2="365" y2="95" stroke="var(--eng-danger)" strokeWidth="2" strokeDasharray="6 4">
                  <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
                <text x="325" y="70" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Forward</text>
              </g>
            )}
            {animStep >= 4 && (
              <g className="eng-fadeIn">
                <text x="230" y="110" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>
                  Eve reads/modifies ALL data!
                </text>
                <Eye className="w-4 h-4" style={{ color: "var(--eng-danger)" }} />
                <rect x="200" y="115" width="60" height="20" rx="4" fill="rgba(239,68,68,0.1)" stroke="var(--eng-danger)" strokeWidth="1" />
                <text x="230" y="129" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-danger)", fontWeight: 700 }}>
                  sniffing...
                </text>
              </g>
            )}

            {/* Step labels */}
            {animStep >= 1 && (
              <text x="230" y="165" textAnchor="middle" className="eng-fadeIn" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>
                Step {animStep}: {
                  animStep === 1 ? "Attacker positions between client & server" :
                  animStep === 2 ? "Client's traffic is intercepted" :
                  animStep === 3 ? "Attacker forwards traffic (modified or not)" :
                  "All communication is compromised"
                }
              </text>
            )}
          </svg>
        </div>
      )}

      {/* ARP Spoofing */}
      {attackType === "arp" && (
        <div className="card-eng p-5 eng-fadeIn">
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            ARP Spoofing Attack
            <button className="btn-eng" onClick={playAnimation} disabled={animStep > 0 && animStep < 4} style={{ fontSize: "0.75rem", padding: "4px 12px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowRight className="w-3.5 h-3.5" /> Animate
            </button>
            <button className="btn-eng-outline" onClick={() => { cleanup(); setAnimStep(0); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </h3>

          {/* ARP Table visualization */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", fontFamily: "var(--eng-font)", marginBottom: 6 }}>
                Victim&apos;s ARP Table:
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace", fontSize: "0.75rem" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "4px 8px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)" }}>IP</th>
                    <th style={{ padding: "4px 8px", textAlign: "left", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)" }}>MAC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background: animStep >= 3 ? "rgba(239,68,68,0.15)" : "transparent", transition: "background 0.4s" }}>
                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--eng-border)" }}>192.168.1.1</td>
                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--eng-border)", color: animStep >= 3 ? "var(--eng-danger)" : "var(--eng-text)", fontWeight: animStep >= 3 ? 700 : 400 }}>
                      {animStep >= 3 ? "AA:BB:CC:DD:EE:FF" : "11:22:33:44:55:66"}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--eng-border)" }}>192.168.1.100</td>
                    <td style={{ padding: "4px 8px", borderBottom: "1px solid var(--eng-border)" }}>77:88:99:AA:BB:CC</td>
                  </tr>
                </tbody>
              </table>
              {animStep >= 3 && (
                <div className="eng-fadeIn" style={{ marginTop: 4, fontSize: "0.72rem", color: "var(--eng-danger)", fontFamily: "var(--eng-font)", fontWeight: 600 }}>
                  Gateway MAC replaced with attacker&apos;s MAC!
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", fontFamily: "var(--eng-font)", marginBottom: 2 }}>
                Attack Steps:
              </div>
              {[
                "Attacker sends fake ARP reply",
                "Claims to be the gateway (192.168.1.1)",
                "Victim updates ARP table with attacker's MAC",
                "All traffic now routed through attacker",
              ].map((step, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 10px",
                    borderRadius: 6,
                    border: `1px solid ${animStep > i ? "var(--eng-danger)" : "var(--eng-border)"}`,
                    background: animStep > i ? "rgba(239,68,68,0.05)" : "transparent",
                    opacity: animStep > i ? 1 : 0.4,
                    transition: "all 0.4s",
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    background: animStep > i ? "var(--eng-danger)" : "var(--eng-border)",
                    color: "#fff",
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </span>
                  <span style={{ fontSize: "0.78rem", fontFamily: "var(--eng-font)", color: animStep > i ? "var(--eng-text)" : "var(--eng-text-muted)" }}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DNS Poisoning */}
      {attackType === "dns" && (
        <div className="card-eng p-5 eng-fadeIn">
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            DNS Cache Poisoning
            <button className="btn-eng" onClick={playAnimation} disabled={animStep > 0 && animStep < 4} style={{ fontSize: "0.75rem", padding: "4px 12px", marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
              <ArrowRight className="w-3.5 h-3.5" /> Animate
            </button>
            <button className="btn-eng-outline" onClick={() => { cleanup(); setAnimStep(0); }} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </h3>

          <svg viewBox="0 0 480 240" width="100%" style={{ maxWidth: 480 }}>
            {/* User */}
            <rect x="10" y="90" width="80" height="50" rx="8" fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth="1.5" />
            <text x="50" y="115" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-primary)" }}>User</text>
            <text x="50" y="130" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>bank.com?</text>

            {/* DNS Server */}
            <rect x="180" y="80" width="100" height="60" rx="8"
              fill={animStep >= 2 ? "rgba(239,68,68,0.1)" : "var(--eng-surface)"}
              stroke={animStep >= 2 ? "var(--eng-danger)" : "var(--eng-border)"} strokeWidth="1.5"
              style={{ transition: "all 0.4s" }}
            />
            <text x="230" y="107" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>DNS Server</text>
            <text x="230" y="125" textAnchor="middle" style={{
              fontSize: "7px", fontFamily: "monospace",
              fill: animStep >= 2 ? "var(--eng-danger)" : "var(--eng-text-muted)",
              fontWeight: animStep >= 2 ? 700 : 400,
            }}>
              bank.com = {animStep >= 2 ? "6.6.6.6" : "1.2.3.4"}
            </text>

            {/* Real server */}
            <rect x="380" y="30" width="90" height="50" rx="8" fill="var(--eng-surface)" stroke="var(--eng-success)" strokeWidth="1.5"
              style={{ opacity: animStep >= 3 ? 0.3 : 1, transition: "opacity 0.4s" }}
            />
            <text x="425" y="55" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-success)" }}>Real Bank</text>
            <text x="425" y="70" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>1.2.3.4</text>

            {/* Attacker fake server */}
            <rect x="380" y="150" width="90" height="50" rx="8"
              fill={animStep >= 1 ? "rgba(239,68,68,0.1)" : "var(--eng-surface)"}
              stroke={animStep >= 1 ? "var(--eng-danger)" : "var(--eng-border)"} strokeWidth="1.5"
              style={{ transition: "all 0.4s" }}
            />
            <text x="425" y="175" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>Fake Bank</text>
            <text x="425" y="190" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "monospace", fill: "var(--eng-danger)" }}>6.6.6.6</text>

            {/* Step 1: Attacker injects poisoned response */}
            {animStep >= 1 && (
              <g className="eng-fadeIn">
                <line x1="380" y1="170" x2="280" y2="120" stroke="var(--eng-danger)" strokeWidth="1.5" strokeDasharray="4 3">
                  <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.8s" repeatCount="indefinite" />
                </line>
                <text x="330" y="155" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Poison!</text>
              </g>
            )}

            {/* Step 3: User goes to fake site */}
            {animStep >= 3 && (
              <g className="eng-fadeIn">
                <line x1="90" y1="115" x2="180" y2="110" stroke="var(--eng-primary)" strokeWidth="1.5" markerEnd="url(#dnsArrow)" />
                <line x1="280" y1="120" x2="380" y2="170" stroke="var(--eng-danger)" strokeWidth="2" markerEnd="url(#dnsArrowRed)">
                  <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.6s" repeatCount="indefinite" />
                </line>
                <text x="330" y="140" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>Redirected!</text>
              </g>
            )}

            {animStep >= 4 && (
              <text x="240" y="225" textAnchor="middle" className="eng-fadeIn" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>
                User unknowingly visits fake site! Credentials stolen.
              </text>
            )}

            <defs>
              <marker id="dnsArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-primary)" />
              </marker>
              <marker id="dnsArrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-danger)" />
              </marker>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Defenses                                                   */
/* ------------------------------------------------------------------ */

function DefensesTab() {
  const [activeDefense, setActiveDefense] = useState<string | null>(null);

  const defenses = [
    {
      id: "ids",
      name: "IDS/IPS",
      fullName: "Intrusion Detection / Prevention System",
      desc: "Monitors network traffic for suspicious patterns and known attack signatures. IDS alerts; IPS actively blocks.",
      mechanisms: ["Signature-based detection", "Anomaly-based detection", "Stateful protocol analysis", "Inline (IPS) or passive (IDS) deployment"],
      color: "var(--eng-primary)",
    },
    {
      id: "ratelimit",
      name: "Rate Limiting",
      fullName: "Request Rate Limiting & Traffic Shaping",
      desc: "Limits the number of requests from a single source per time window, preventing flood-based attacks.",
      mechanisms: ["IP-based rate limiting", "Token bucket algorithm", "SYN cookies for SYN floods", "CDN-based DDoS mitigation"],
      color: "var(--eng-warning)",
    },
    {
      id: "dnssec",
      name: "DNSSEC",
      fullName: "DNS Security Extensions",
      desc: "Adds digital signatures to DNS responses, allowing resolvers to verify that DNS data has not been tampered with.",
      mechanisms: ["RRSIG (Resource Record Signature)", "DNSKEY (public keys)", "DS (Delegation Signer)", "Chain of trust from root"],
      color: "var(--eng-success)",
    },
    {
      id: "arpguard",
      name: "ARP Security",
      fullName: "Dynamic ARP Inspection & Static ARP",
      desc: "Validates ARP packets against a trusted database (DHCP snooping table) to prevent ARP spoofing attacks.",
      mechanisms: ["Dynamic ARP Inspection (DAI)", "Static ARP entries for critical hosts", "DHCP snooping binding table", "Port security on switches"],
      color: "var(--eng-danger)",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="info-eng">
        Defense-in-depth: multiple layers of security mechanisms work together to protect the network.
        No single defense is perfect, so combining techniques provides robust protection.
      </div>

      {/* Defense mechanism visualization */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 16 }}>
          Defense Mechanisms
        </h3>

        <svg viewBox="0 0 460 180" width="100%" style={{ maxWidth: 460 }}>
          {/* Layered defense rings */}
          <ellipse cx="230" cy="90" rx="210" ry="80" fill="none" stroke="var(--eng-primary)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.3" />
          <text x="230" y="15" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-primary)", fontWeight: 600 }}>IDS/IPS (Outermost)</text>

          <ellipse cx="230" cy="90" rx="155" ry="60" fill="none" stroke="var(--eng-warning)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.4" />
          <text x="100" y="50" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-warning)", fontWeight: 600 }}>Rate Limiting</text>

          <ellipse cx="230" cy="90" rx="100" ry="40" fill="none" stroke="var(--eng-success)" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
          <text x="330" y="65" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)", fontWeight: 600 }}>DNSSEC</text>

          <ellipse cx="230" cy="90" rx="45" ry="20" fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth="2" />
          <text x="230" y="94" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>Server</text>

          {/* Attack arrows being blocked at each layer */}
          <g>
            <line x1="10" y1="60" x2="30" y2="70" stroke="var(--eng-danger)" strokeWidth="1.5" />
            <text x="5" y="55" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>DDoS</text>
            <line x1="440" y1="40" x2="420" y2="55" stroke="var(--eng-danger)" strokeWidth="1.5" />
            <text x="435" y="35" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>MITM</text>
            <line x1="10" y1="140" x2="30" y2="130" stroke="var(--eng-danger)" strokeWidth="1.5" />
            <text x="5" y="150" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>DNS Poison</text>
          </g>
        </svg>
      </div>

      {/* Defense detail cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {defenses.map((def) => (
          <div
            key={def.id}
            className="card-eng"
            style={{
              cursor: "pointer",
              border: activeDefense === def.id ? `2px solid ${def.color}` : undefined,
              transition: "all 0.3s ease",
            }}
            onClick={() => setActiveDefense(activeDefense === def.id ? null : def.id)}
          >
            <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: `${def.color}15`,
                flexShrink: 0,
              }}>
                <Shield className="w-5 h-5" style={{ color: def.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: def.color }}>
                  {def.name}
                </div>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.78rem", color: "var(--eng-text-muted)" }}>
                  {def.fullName}
                </div>
              </div>
              <ArrowRight className="w-4 h-4" style={{ color: "var(--eng-text-muted)", transform: activeDefense === def.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.3s" }} />
            </div>

            {activeDefense === def.id && (
              <div className="eng-fadeIn" style={{ padding: "0 16px 14px", borderTop: "1px solid var(--eng-border)" }}>
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)", margin: "10px 0", lineHeight: 1.6 }}>
                  {def.desc}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {def.mechanisms.map((mech, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem", fontFamily: "var(--eng-font)", color: "var(--eng-text-muted)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: def.color }} />
                      {mech}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="info-eng">
        <strong>Defense-in-depth:</strong> Combine firewall + IDS/IPS + rate limiting + DNSSEC + TLS + network segmentation
        for comprehensive protection. No single measure is sufficient.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                                */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "In a DDoS attack, what is a 'botnet'?",
    options: [
      "A network of legitimate servers",
      "A network of compromised machines controlled by the attacker",
      "A firewall defense mechanism",
      "A type of encryption algorithm",
    ],
    correctIndex: 1,
    explanation: "A botnet is a network of computers infected with malware, controlled remotely by an attacker to generate massive traffic for DDoS attacks.",
  },
  {
    question: "How does ARP spoofing enable a MITM attack?",
    options: [
      "It breaks encryption keys",
      "It floods the network with traffic",
      "It sends fake ARP replies to redirect traffic through the attacker",
      "It corrupts the routing table on routers",
    ],
    correctIndex: 2,
    explanation: "ARP spoofing sends forged ARP replies that map the gateway's IP to the attacker's MAC address, causing the victim to send all traffic through the attacker.",
  },
  {
    question: "What does DNS cache poisoning achieve?",
    options: [
      "Speeds up DNS resolution",
      "Injects false DNS records to redirect users to malicious sites",
      "Encrypts DNS queries",
      "Increases DNS server memory",
    ],
    correctIndex: 1,
    explanation: "DNS cache poisoning inserts false IP addresses into the DNS resolver's cache, redirecting users to attacker-controlled servers when they query legitimate domains.",
  },
  {
    question: "What is the primary difference between IDS and IPS?",
    options: [
      "IDS is hardware; IPS is software",
      "IDS only detects and alerts; IPS actively blocks malicious traffic",
      "IDS works at Layer 7; IPS at Layer 3",
      "IDS is newer than IPS",
    ],
    correctIndex: 1,
    explanation: "An Intrusion Detection System (IDS) monitors and alerts on suspicious activity, while an Intrusion Prevention System (IPS) actively blocks detected threats inline.",
  },
  {
    question: "How does DNSSEC protect against DNS poisoning?",
    options: [
      "By encrypting all DNS traffic",
      "By blocking all DNS queries",
      "By digitally signing DNS responses so resolvers can verify authenticity",
      "By using a VPN for DNS",
    ],
    correctIndex: 2,
    explanation: "DNSSEC adds digital signatures to DNS records, allowing resolvers to verify that the response came from the authoritative server and hasn't been tampered with.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs + Export                                                       */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "ddos",
    label: "DDoS",
    icon: <Zap className="w-4 h-4" />,
    content: <DDoSTab />,
  },
  {
    id: "mitm",
    label: "MITM",
    icon: <Eye className="w-4 h-4" />,
    content: <MITMTab />,
  },
  {
    id: "defenses",
    label: "Defenses",
    icon: <Shield className="w-4 h-4" />,
    content: <DefensesTab />,
  },
];

export default function CN_L6_NetworkAttacksActivity() {
  return (
    <EngineeringLessonShell
      title="Network Attacks & Defenses"
      level={6}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Software-Defined Networking (Level 7)"
      gateRelevance="1-2 marks"
      placementRelevance="Medium"
    />
  );
}
