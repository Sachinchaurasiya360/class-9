"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { MonitorSmartphone, Layers, Network, Play, Pause, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SVG_W = 700;
const SVG_H = 320;

/* ------------------------------------------------------------------ */
/*  Tab 1: Ethernet Frame Dissector                                   */
/* ------------------------------------------------------------------ */

interface FrameField {
  name: string;
  bytes: string;
  color: string;
  width: number; // relative width
  description: string;
}

function FrameDissectorTab() {
  const [hoveredField, setHoveredField] = useState<FrameField | null>(null);
  const [animatedIn, setAnimatedIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedIn(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const fields: FrameField[] = [
    { name: "Preamble", bytes: "7 bytes", color: "#8b5cf6", width: 7, description: "Alternating 1s and 0s (10101010...) for clock synchronization. Helps the receiver lock onto the bit timing." },
    { name: "SFD", bytes: "1 byte", color: "#a78bfa", width: 1, description: "Start Frame Delimiter (10101011). The last two 1-bits signal that the actual frame data begins next." },
    { name: "Dest MAC", bytes: "6 bytes", color: "#6366f1", width: 6, description: "Destination MAC address (48 bits). Can be unicast, multicast, or broadcast (FF:FF:FF:FF:FF:FF)." },
    { name: "Src MAC", bytes: "6 bytes", color: "#3b82f6", width: 6, description: "Source MAC address (48 bits). The hardware address of the sending network interface card (NIC)." },
    { name: "EtherType", bytes: "2 bytes", color: "#0ea5e9", width: 2, description: "Identifies the upper layer protocol. 0x0800 = IPv4, 0x0806 = ARP, 0x86DD = IPv6." },
    { name: "Payload", bytes: "46-1500 bytes", color: "#10b981", width: 20, description: "The actual data from the network layer. Minimum 46 bytes (padded if shorter), maximum 1500 bytes (MTU)." },
    { name: "FCS", bytes: "4 bytes", color: "#f59e0b", width: 4, description: "Frame Check Sequence - 32-bit CRC computed over the entire frame. Receiver recalculates and compares to detect errors." },
  ];

  const totalWidth = fields.reduce((a, f) => a + f.width, 0);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Ethernet II Frame Structure
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Hover over each field to learn its purpose. The Ethernet frame encapsulates data for transmission on a LAN.
      </p>

      {/* Frame visualization */}
      <div className="card-eng" style={{ padding: 24, marginBottom: 16 }}>
        <svg viewBox={`0 0 ${SVG_W} 180`} width="100%" style={{ display: "block" }}>
          {/* Frame bar */}
          {(() => {
            let xOffset = 20;
            return fields.map((field, idx) => {
              const w = (field.width / totalWidth) * (SVG_W - 40);
              const x = xOffset;
              xOffset += w;
              const isHovered = hoveredField?.name === field.name;

              return (
                <g
                  key={field.name}
                  onMouseEnter={() => setHoveredField(field)}
                  onMouseLeave={() => setHoveredField(null)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Field rectangle */}
                  <rect
                    x={x}
                    y={40}
                    width={w}
                    height={60}
                    rx={idx === 0 ? 6 : idx === fields.length - 1 ? 6 : 0}
                    fill={isHovered ? field.color : `${field.color}40`}
                    stroke={field.color}
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    style={{
                      transition: "all 0.3s ease",
                      transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                      transformOrigin: `${x + w / 2}px 70px`,
                    }}
                  />

                  {/* Field name */}
                  <text
                    x={x + w / 2}
                    y={65}
                    textAnchor="middle"
                    fontSize={w > 40 ? 10 : 7}
                    fontFamily="var(--eng-font)"
                    fontWeight={700}
                    fill={isHovered ? "#fff" : field.color}
                    style={{ transition: "fill 0.3s" }}
                  >
                    {field.name}
                  </text>

                  {/* Byte count */}
                  <text
                    x={x + w / 2}
                    y={82}
                    textAnchor="middle"
                    fontSize={w > 40 ? 8 : 6}
                    fontFamily="var(--eng-font)"
                    fill={isHovered ? "rgba(255,255,255,0.8)" : "var(--eng-text-muted)"}
                    style={{ transition: "fill 0.3s" }}
                  >
                    {field.bytes}
                  </text>

                  {/* Top bracket indicator */}
                  <line x1={x} y1={30} x2={x} y2={38} stroke={field.color} strokeWidth={1} opacity={0.5} />
                  <line x1={x + w} y1={30} x2={x + w} y2={38} stroke={field.color} strokeWidth={1} opacity={0.5} />
                  <line x1={x} y1={30} x2={x + w} y2={30} stroke={field.color} strokeWidth={1} opacity={0.5} />

                  {/* Animation on load */}
                  {animatedIn && (
                    <rect
                      x={x}
                      y={40}
                      width={w}
                      height={60}
                      rx={idx === 0 ? 6 : idx === fields.length - 1 ? 6 : 0}
                      fill={field.color}
                      opacity={0}
                    >
                      <animate attributeName="opacity" from="0.3" to="0" dur="0.8s" begin={`${idx * 0.1}s`} fill="freeze" />
                    </rect>
                  )}
                </g>
              );
            });
          })()}

          {/* Arrows */}
          <text x={20} y={125} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            ← Header →
          </text>
          <text x={SVG_W / 2} y={125} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            ← Data →
          </text>
          <text x={SVG_W - 60} y={125} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
            ← Trailer
          </text>

          {/* Total size */}
          <text x={SVG_W / 2} y={155} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">
            Total: 72 - 1526 bytes (including preamble)
          </text>
        </svg>
      </div>

      {/* Detail panel */}
      <div
        className="card-eng"
        style={{
          padding: 16,
          minHeight: 80,
          borderLeft: hoveredField ? `3px solid ${hoveredField.color}` : "3px solid var(--eng-border)",
          transition: "border-color 0.3s",
        }}
      >
        {hoveredField ? (
          <div className="eng-fadeIn">
            <div className="flex items-center gap-2" style={{ marginBottom: 8 }}>
              <span className="tag-eng" style={{ background: `${hoveredField.color}20`, color: hoveredField.color, fontWeight: 700 }}>
                {hoveredField.name}
              </span>
              <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
                ({hoveredField.bytes})
              </span>
            </div>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", margin: 0, lineHeight: 1.6 }}>
              {hoveredField.description}
            </p>
          </div>
        ) : (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0, textAlign: "center" }}>
            Hover over a field in the frame to see details
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2: ARP Animation                                              */
/* ------------------------------------------------------------------ */

function ARPTab() {
  const [step, setStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [arpTable, setArpTable] = useState<{ ip: string; mac: string }[]>([]);
  const timerRef = useRef<number | null>(null);

  const hosts = [
    { id: "A", ip: "192.168.1.10", mac: "AA:BB:CC:DD:EE:01", x: 100, y: 160, color: "#6366f1" },
    { id: "B", ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:02", x: 350, y: 80, color: "#10b981" },
    { id: "C", ip: "192.168.1.30", mac: "AA:BB:CC:DD:EE:03", x: 350, y: 240, color: "#f59e0b" },
    { id: "D", ip: "192.168.1.40", mac: "AA:BB:CC:DD:EE:04", x: 600, y: 160, color: "#ef4444" },
  ];

  const stepDescriptions = [
    "Host A wants to send data to Host B (192.168.1.20) but doesn't know B's MAC address.",
    "Host A broadcasts an ARP Request: \"Who has 192.168.1.20? Tell 192.168.1.10\"",
    "All hosts on the LAN receive the broadcast. Only Host B recognizes its IP.",
    "Host B sends a unicast ARP Reply to A: \"192.168.1.20 is at AA:BB:CC:DD:EE:02\"",
    "Host A updates its ARP table with B's mapping. Future frames go directly to B!",
  ];

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = window.setInterval(() => {
      setStep((s) => {
        const ns = s + 1;
        if (ns >= 5) {
          setIsRunning(false);
          setArpTable([{ ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:02" }]);
          return 4;
        }
        if (ns === 4) {
          setArpTable([{ ip: "192.168.1.20", mac: "AA:BB:CC:DD:EE:02" }]);
        }
        return ns;
      });
    }, 1800);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const reset = useCallback(() => {
    setStep(0);
    setIsRunning(false);
    setArpTable([]);
  }, []);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        ARP - Address Resolution Protocol
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        ARP resolves IP addresses to MAC addresses on a local network. Watch the broadcast request and unicast reply process.
      </p>

      {/* Controls */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button onClick={() => { reset(); setTimeout(() => setIsRunning(true), 50); }} className="btn-eng" style={{ fontSize: "0.8rem" }}>
          <Play className="w-3.5 h-3.5" /> Run ARP
        </button>
        <button
          onClick={() => setStep((s) => Math.min(s + 1, 4))}
          className="btn-eng-outline"
          style={{ fontSize: "0.8rem" }}
          disabled={step >= 4}
        >
          Step →
        </button>
        <button onClick={reset} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Network diagram */}
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
          {/* Network connections (star topology through a switch-like center) */}
          {hosts.map((h) => (
            <line key={h.id} x1={350} y1={160} x2={h.x} y2={h.y} stroke="var(--eng-border)" strokeWidth={1.5} />
          ))}

          {/* Switch in center */}
          <rect x={325} y={140} width={50} height={40} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
          <text x={350} y={164} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text-muted)">
            Switch
          </text>

          {/* Hosts */}
          {hosts.map((h) => {
            const isSource = h.id === "A";
            const isTarget = h.id === "B";
            const isHighlighted = (step >= 1 && step <= 2) || (step >= 3 && (isSource || isTarget));

            return (
              <g key={h.id}>
                <rect
                  x={h.x - 40}
                  y={h.y - 30}
                  width={80}
                  height={60}
                  rx={8}
                  fill={`${h.color}15`}
                  stroke={h.color}
                  strokeWidth={isHighlighted ? 2.5 : 1.5}
                  style={{ transition: "stroke-width 0.3s" }}
                />
                <text x={h.x} y={h.y - 10} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill={h.color}>
                  Host {h.id}
                </text>
                <text x={h.x} y={h.y + 6} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="var(--eng-text-muted)">
                  {h.ip}
                </text>
                <text x={h.x} y={h.y + 18} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="var(--eng-text-muted)">
                  {h.mac.substring(12)}
                </text>
              </g>
            );
          })}

          {/* ARP Broadcast wave (steps 1-2) */}
          {(step === 1 || step === 2) && (
            <g>
              {[30, 60, 90, 120].map((r, i) => (
                <circle
                  key={i}
                  cx={hosts[0].x}
                  cy={hosts[0].y}
                  r={r}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={1.5}
                  opacity={0}
                >
                  <animate attributeName="r" from={r - 20} to={r + 40} dur="1.5s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
                </circle>
              ))}
              <text x={200} y={45} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="#6366f1">
                ARP Request (Broadcast)
              </text>
              <text x={200} y={60} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="#6366f1">
                &quot;Who has 192.168.1.20?&quot;
              </text>
            </g>
          )}

          {/* Host B highlight for step 2 */}
          {step === 2 && (
            <circle cx={hosts[1].x} cy={hosts[1].y} r={40} fill="none" stroke="#10b981" strokeWidth={2}>
              <animate attributeName="r" values="35;45;35" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="1;0.4;1" dur="1s" repeatCount="indefinite" />
            </circle>
          )}

          {/* ARP Reply (step 3) */}
          {step >= 3 && (
            <g>
              {/* Animated reply line from B to A */}
              <line
                x1={hosts[1].x}
                y1={hosts[1].y}
                x2={hosts[0].x}
                y2={hosts[0].y}
                stroke="#10b981"
                strokeWidth={2.5}
                strokeDasharray="8,4"
              >
                <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.5s" repeatCount="indefinite" />
              </line>
              <text x={220} y={100} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="#10b981">
                ARP Reply (Unicast)
              </text>
              <text x={220} y={115} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="#10b981">
                &quot;192.168.1.20 is at ...EE:02&quot;
              </text>
            </g>
          )}

          {/* Step indicator */}
          <text x={SVG_W / 2} y={SVG_H - 12} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fill="var(--eng-text)" fontWeight={500}>
            {stepDescriptions[step]}
          </text>
        </svg>
      </div>

      {/* ARP Table */}
      <div className="card-eng" style={{ padding: 16, marginTop: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Host A&apos;s ARP Table
        </h4>
        {arpTable.length === 0 ? (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, textAlign: "center", padding: "12px 0" }}>
            (empty - no mappings yet)
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                <th style={{ padding: "6px 12px", textAlign: "left", color: "var(--eng-text)" }}>IP Address</th>
                <th style={{ padding: "6px 12px", textAlign: "left", color: "var(--eng-text)" }}>MAC Address</th>
                <th style={{ padding: "6px 12px", textAlign: "left", color: "var(--eng-text)" }}>Type</th>
              </tr>
            </thead>
            <tbody>
              {arpTable.map((entry, i) => (
                <tr key={i} className="eng-fadeIn" style={{ borderBottom: "1px solid var(--eng-border)" }}>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace", color: "var(--eng-primary)" }}>{entry.ip}</td>
                  <td style={{ padding: "6px 12px", fontFamily: "monospace", color: "var(--eng-success)" }}>{entry.mac}</td>
                  <td style={{ padding: "6px 12px" }}>
                    <span className="tag-eng" style={{ background: "rgba(16,185,129,0.1)", color: "var(--eng-success)" }}>Dynamic</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Switch MAC Learning Animation                              */
/* ------------------------------------------------------------------ */

function SwitchingTab() {
  const [step, setStep] = useState(0);
  const [macTable, setMacTable] = useState<{ mac: string; port: number }[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);

  const ports = [
    { id: 1, host: "A", mac: "AA:11", x: 180, y: 50, color: "#6366f1" },
    { id: 2, host: "B", mac: "BB:22", x: 520, y: 50, color: "#10b981" },
    { id: 3, host: "C", mac: "CC:33", x: 180, y: 250, color: "#f59e0b" },
    { id: 4, host: "D", mac: "DD:44", x: 520, y: 250, color: "#ef4444" },
  ];

  const steps = [
    { desc: "Switch starts with an empty MAC table. No addresses learned yet.", action: "none", from: -1, to: -1, decision: "" },
    { desc: "Host A sends frame to Host B. Switch learns A's MAC on Port 1.", action: "flood", from: 0, to: 1, decision: "FLOOD (unknown destination)" },
    { desc: "Since B's MAC is unknown, switch floods to all ports except Port 1.", action: "flood", from: 0, to: -1, decision: "All ports receive the frame" },
    { desc: "Host B responds to A. Switch learns B's MAC on Port 2.", action: "forward", from: 1, to: 0, decision: "FORWARD to Port 1 (A's MAC is known)" },
    { desc: "A sends to B again. Switch knows both MACs now.", action: "forward", from: 0, to: 1, decision: "FORWARD to Port 2 (B's MAC is known!)" },
    { desc: "C sends to A. Switch learns C and forwards to Port 1.", action: "forward", from: 2, to: 0, decision: "FORWARD to Port 1" },
  ];

  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = window.setInterval(() => {
      setStep((s) => {
        const ns = s + 1;
        if (ns >= steps.length) {
          setIsRunning(false);
          return steps.length - 1;
        }

        // Update MAC table
        if (ns === 1) setMacTable([{ mac: "AA:11", port: 1 }]);
        if (ns === 3) setMacTable([{ mac: "AA:11", port: 1 }, { mac: "BB:22", port: 2 }]);
        if (ns === 5) setMacTable([{ mac: "AA:11", port: 1 }, { mac: "BB:22", port: 2 }, { mac: "CC:33", port: 3 }]);

        return ns;
      });
    }, 2000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, steps.length]);

  const reset = useCallback(() => {
    setStep(0);
    setMacTable([]);
    setIsRunning(false);
  }, []);

  const currentStep = steps[step];

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Switch MAC Address Learning
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Watch how a switch learns MAC addresses by inspecting the source address of incoming frames, then makes forward/filter/flood decisions.
      </p>

      {/* Controls */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button onClick={() => { reset(); setTimeout(() => setIsRunning(true), 50); }} className="btn-eng" style={{ fontSize: "0.8rem" }}>
          <Play className="w-3.5 h-3.5" /> Auto Run
        </button>
        <button
          onClick={() => {
            setStep((s) => {
              const ns = Math.min(s + 1, steps.length - 1);
              if (ns === 1) setMacTable([{ mac: "AA:11", port: 1 }]);
              if (ns === 3) setMacTable((t) => [...t.filter((e) => e.mac !== "BB:22"), { mac: "BB:22", port: 2 }]);
              if (ns === 5) setMacTable((t) => [...t.filter((e) => e.mac !== "CC:33"), { mac: "CC:33", port: 3 }]);
              return ns;
            });
          }}
          className="btn-eng-outline"
          style={{ fontSize: "0.8rem" }}
          disabled={step >= steps.length - 1}
        >
          Step →
        </button>
        <button onClick={reset} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {/* Network visualization */}
        <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
          <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} width="100%" style={{ display: "block", background: "var(--eng-bg)" }}>
            {/* Switch */}
            <rect x={290} y={120} width={120} height={60} rx={8} fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth={2} />
            <text x={350} y={148} textAnchor="middle" fontSize={12} fontFamily="var(--eng-font)" fontWeight={700} fill="var(--eng-primary)">
              Switch
            </text>
            <text x={350} y={165} textAnchor="middle" fontSize={8} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
              4 ports
            </text>

            {/* Hosts and connections */}
            {ports.map((port) => (
              <g key={port.id}>
                {/* Connection line */}
                <line
                  x1={port.x}
                  y1={port.y + 20}
                  x2={350}
                  y2={150}
                  stroke="var(--eng-border)"
                  strokeWidth={1.5}
                />

                {/* Port label */}
                <text
                  x={(port.x + 350) / 2}
                  y={(port.y + 20 + 150) / 2 - 6}
                  textAnchor="middle"
                  fontSize={8}
                  fontFamily="var(--eng-font)"
                  fontWeight={600}
                  fill="var(--eng-text-muted)"
                >
                  Port {port.id}
                </text>

                {/* Host */}
                <rect
                  x={port.x - 35}
                  y={port.y - 15}
                  width={70}
                  height={40}
                  rx={6}
                  fill={`${port.color}15`}
                  stroke={port.color}
                  strokeWidth={1.5}
                />
                <text x={port.x} y={port.y + 3} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill={port.color}>
                  Host {port.host}
                </text>
                <text x={port.x} y={port.y + 16} textAnchor="middle" fontSize={7} fontFamily="monospace" fill="var(--eng-text-muted)">
                  {port.mac}
                </text>
              </g>
            ))}

            {/* Animated frame transfer */}
            {currentStep.from >= 0 && (
              <g>
                {currentStep.action === "flood" && currentStep.to === -1 ? (
                  // Flood: animate from switch to all other ports
                  ports.filter((_, i) => i !== currentStep.from).map((port) => (
                    <line
                      key={port.id}
                      x1={350}
                      y1={150}
                      x2={port.x}
                      y2={port.y + 20}
                      stroke={ports[currentStep.from].color}
                      strokeWidth={2.5}
                      strokeDasharray="6,4"
                    >
                      <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.6s" repeatCount="indefinite" />
                    </line>
                  ))
                ) : (
                  // Forward: animate from source to destination
                  <>
                    {/* Source to switch */}
                    <line
                      x1={ports[currentStep.from].x}
                      y1={ports[currentStep.from].y + 20}
                      x2={350}
                      y2={150}
                      stroke={ports[currentStep.from].color}
                      strokeWidth={2.5}
                      strokeDasharray="6,4"
                    >
                      <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.6s" repeatCount="indefinite" />
                    </line>
                    {currentStep.to >= 0 && (
                      <line
                        x1={350}
                        y1={150}
                        x2={ports[currentStep.to].x}
                        y2={ports[currentStep.to].y + 20}
                        stroke={ports[currentStep.from].color}
                        strokeWidth={2.5}
                        strokeDasharray="6,4"
                      >
                        <animate attributeName="stroke-dashoffset" from="10" to="0" dur="0.6s" repeatCount="indefinite" />
                      </line>
                    )}
                  </>
                )}
              </g>
            )}

            {/* Decision label */}
            {currentStep.decision && (
              <g>
                <rect x={170} y={SVG_H - 50} width={360} height={28} rx={6} fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth={1} />
                <text x={350} y={SVG_H - 32} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-primary)">
                  Decision: {currentStep.decision}
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* MAC Table */}
        <div className="card-eng" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
            MAC Address Table
          </h4>
          {macTable.length === 0 ? (
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, textAlign: "center", padding: 12 }}>
              (empty)
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {macTable.map((entry, i) => (
                <div
                  key={i}
                  className="eng-fadeIn"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "var(--eng-bg)",
                    border: "1px solid var(--eng-border)",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  <span style={{ color: "var(--eng-primary)", fontWeight: 600 }}>{entry.mac}</span>
                  <span style={{ color: "var(--eng-text-muted)" }}>Port {entry.port}</span>
                </div>
              ))}
            </div>
          )}

          {/* Step description */}
          <div style={{ marginTop: 16, padding: 10, borderRadius: 6, background: "var(--eng-bg)", border: "1px solid var(--eng-border)" }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text)", margin: 0, lineHeight: 1.5 }}>
              {currentStep.desc}
            </p>
          </div>
        </div>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Switch Operations:</strong> <em>Forward</em> - send to known port. <em>Filter</em> - drop if same port. <em>Flood</em> - send to all ports (unknown destination or broadcast).
        The MAC table entries have a TTL and are refreshed when traffic is seen.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz Questions                                                     */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the minimum payload size in an Ethernet frame?",
    options: ["0 bytes", "46 bytes", "64 bytes", "1500 bytes"],
    correctIndex: 1,
    explanation: "The minimum payload is 46 bytes. If the data is less, it is padded. This ensures the minimum frame size of 64 bytes (excluding preamble) for collision detection in CSMA/CD.",
  },
  {
    question: "ARP resolves which type of address to which?",
    options: ["MAC to IP", "IP to MAC", "IP to hostname", "Port to IP"],
    correctIndex: 1,
    explanation: "ARP (Address Resolution Protocol) resolves a known IP address to its corresponding MAC address on the local network.",
  },
  {
    question: "When a switch receives a frame for an unknown destination MAC, what does it do?",
    options: ["Drop the frame", "Forward to Port 1 only", "Flood to all ports except the source", "Send an error back"],
    correctIndex: 2,
    explanation: "If the destination MAC is not in its table, the switch floods the frame to all ports except the port it arrived on, similar to a hub for that particular frame.",
  },
  {
    question: "What is the MAC address FF:FF:FF:FF:FF:FF used for?",
    options: ["Default gateway", "Loopback address", "Broadcast - all hosts on the LAN", "Multicast group"],
    correctIndex: 2,
    explanation: "FF:FF:FF:FF:FF:FF is the Ethernet broadcast address. Frames sent to this address are received by all hosts on the local network segment.",
  },
  {
    question: "How does a switch learn MAC addresses?",
    options: [
      "Manual configuration by admin",
      "By inspecting the SOURCE MAC address of incoming frames",
      "By inspecting the DESTINATION MAC address",
      "Via DHCP protocol",
    ],
    correctIndex: 1,
    explanation: "A switch learns MAC addresses by reading the source MAC address of each incoming frame and associating it with the port the frame arrived on.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs Definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "frame",
    label: "Frame",
    icon: <Layers className="w-4 h-4" />,
    content: <FrameDissectorTab />,
  },
  {
    id: "arp",
    label: "ARP",
    icon: <Network className="w-4 h-4" />,
    content: <ARPTab />,
  },
  {
    id: "switching",
    label: "Switching",
    icon: <MonitorSmartphone className="w-4 h-4" />,
    content: <SwitchingTab />,
  },
];

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L2_EthernetLANActivity() {
  return (
    <EngineeringLessonShell
      title="Ethernet & LAN Standards"
      level={2}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="IPv4 Addressing (Network Layer)"
      placementRelevance="Low"
    />
  );
}
