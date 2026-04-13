"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Wifi,
  Radio,
  Server,
  Monitor,
  Clock,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Play,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type {
  EngTabDef,
  EngQuizQuestion,
} from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 — DHCP DORA Process Animated                                  */
/* ================================================================== */

interface DORAStep {
  phase: "D" | "O" | "R" | "A";
  label: string;
  fullLabel: string;
  type: "broadcast" | "unicast";
  from: "client" | "server";
  desc: string;
  color: string;
  details: string[];
}

const DORA_STEPS: DORAStep[] = [
  {
    phase: "D",
    label: "Discover",
    fullLabel: "DHCPDISCOVER",
    type: "broadcast",
    from: "client",
    desc: "New device sends a broadcast message: 'Is there a DHCP server on this network? I need an IP address!'",
    color: "#3b82f6",
    details: [
      "Source IP: 0.0.0.0 (no IP yet)",
      "Dest IP: 255.255.255.255 (broadcast)",
      "Source MAC: AA:BB:CC:DD:EE:FF",
      "Dest MAC: FF:FF:FF:FF:FF:FF",
      "UDP Port: 68 → 67",
    ],
  },
  {
    phase: "O",
    label: "Offer",
    fullLabel: "DHCPOFFER",
    type: "unicast",
    from: "server",
    desc: "DHCP server responds with an IP address offer: 'Here, you can use 192.168.1.100 with these settings.'",
    color: "#10b981",
    details: [
      "Offered IP: 192.168.1.100",
      "Subnet Mask: 255.255.255.0",
      "Default Gateway: 192.168.1.1",
      "DNS Server: 8.8.8.8",
      "Lease Time: 24 hours",
    ],
  },
  {
    phase: "R",
    label: "Request",
    fullLabel: "DHCPREQUEST",
    type: "broadcast",
    from: "client",
    desc: "Client broadcasts acceptance: 'I want the IP offered by server 192.168.1.1. All other servers, please withdraw.'",
    color: "#f59e0b",
    details: [
      "Source IP: 0.0.0.0 (still no IP)",
      "Dest IP: 255.255.255.255 (broadcast)",
      "Requested IP: 192.168.1.100",
      "Server ID: 192.168.1.1",
      "Broadcast so other DHCP servers know",
    ],
  },
  {
    phase: "A",
    label: "Acknowledge",
    fullLabel: "DHCPACK",
    type: "unicast",
    from: "server",
    desc: "Server confirms: 'IP 192.168.1.100 is officially yours for 24 hours. Welcome to the network!'",
    color: "#8b5cf6",
    details: [
      "Confirmed IP: 192.168.1.100",
      "Subnet Mask: 255.255.255.0",
      "Gateway: 192.168.1.1",
      "DNS: 8.8.8.8",
      "Lease starts now",
    ],
  },
];

function DHCPDORATab() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [running, setRunning] = useState(false);

  const playAnim = useCallback(() => {
    setCurrentStep(-1);
    setRunning(true);
    setTimeout(() => setCurrentStep(0), 300);
  }, []);

  useEffect(() => {
    if (!running || currentStep < 0) return;
    if (currentStep >= DORA_STEPS.length) { setRunning(false); return; }
    const id = setTimeout(() => setCurrentStep((s) => s + 1), 2200);
    return () => clearTimeout(id);
  }, [currentStep, running]);

  const stepData = currentStep >= 0 && currentStep < DORA_STEPS.length ? DORA_STEPS[currentStep] : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DHCP DORA Process
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        When a new device joins a network, it goes through Discover, Offer, Request, Acknowledge to get an IP address automatically.
      </p>

      <button onClick={playAnim} className="btn-eng" style={{ fontSize: "0.85rem", marginBottom: 16 }}>
        <Play className="w-4 h-4" style={{ marginRight: 4 }} /> Play DORA Process
      </button>

      {/* DORA phase indicators */}
      <div className="flex gap-3" style={{ marginBottom: 20 }}>
        {DORA_STEPS.map((step, i) => (
          <div
            key={step.phase}
            className="flex-1 text-center"
            style={{
              padding: "12px 8px",
              borderRadius: 10,
              background: i === currentStep ? `${step.color}15` : i < currentStep ? `${step.color}08` : "var(--eng-bg)",
              border: i === currentStep ? `2px solid ${step.color}` : "1px solid var(--eng-border)",
              transition: "all 0.4s",
            }}
          >
            <div style={{
              width: 36, height: 36, borderRadius: "50%", margin: "0 auto 6px",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: i <= currentStep ? step.color : "var(--eng-border)",
              color: i <= currentStep ? "#fff" : "var(--eng-text-muted)",
              fontFamily: "var(--eng-font)", fontWeight: 800, fontSize: "1rem",
              transition: "background 0.4s",
            }}>
              {step.phase}
            </div>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.82rem", color: i <= currentStep ? step.color : "var(--eng-text-muted)" }}>
              {step.label}
            </div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", marginTop: 2 }}>
              {step.type}
            </div>
          </div>
        ))}
      </div>

      {/* Network diagram */}
      <svg viewBox="0 0 700 220" style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto 16px", background: "var(--eng-surface)", borderRadius: 12, border: "1px solid var(--eng-border)" }}>
        {/* Client device */}
        <g>
          <rect x={50} y={70} width={120} height={80} rx={12} fill="var(--eng-bg)" stroke={stepData && stepData.from === "client" ? stepData.color : "var(--eng-border)"} strokeWidth={stepData && stepData.from === "client" ? 2.5 : 1.5} style={{ transition: "stroke 0.3s" }} />
          <Monitor x={95} y={82} width={20} height={20} style={{ color: "var(--eng-text-muted)" }} />
          <text x={110} y={118} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="var(--eng-font)" fill="var(--eng-text)">New Device</text>
          <text x={110} y={132} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="var(--eng-text-muted)">
            {currentStep >= 3 ? "192.168.1.100" : "IP: ???"}
          </text>
          {currentStep >= 3 && (
            <CheckCircle2 x={148} y={72} width={16} height={16} style={{ color: "var(--eng-success)" }} />
          )}
        </g>

        {/* Network (broadcast domain) */}
        <g>
          <rect x={230} y={50} width={240} height={120} rx={16} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="6 4" />
          <text x={350} y={75} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Network: 192.168.1.0/24</text>

          {/* Broadcast wave animation */}
          {stepData && stepData.type === "broadcast" && (
            <>
              <circle cx={stepData.from === "client" ? 170 : 530} cy={110} r={15} fill="none" stroke={stepData.color} strokeWidth={2}>
                <animate attributeName="r" from="15" to="80" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={stepData.from === "client" ? 170 : 530} cy={110} r={15} fill="none" stroke={stepData.color} strokeWidth={1.5}>
                <animate attributeName="r" from="15" to="80" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
                <animate attributeName="opacity" from="0.6" to="0" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
              </circle>
            </>
          )}

          {/* Unicast arrow */}
          {stepData && stepData.type === "unicast" && (
            <g>
              <defs>
                <marker id="dora-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill={stepData.color} />
                </marker>
              </defs>
              <line
                x1={stepData.from === "server" ? 530 : 170}
                y1={110}
                x2={stepData.from === "server" ? 170 : 530}
                y2={110}
                stroke={stepData.color}
                strokeWidth={3}
                markerEnd="url(#dora-arrow)"
                strokeDasharray="10 5"
              >
                <animate attributeName="stroke-dashoffset" from="30" to="0" dur="1s" repeatCount="indefinite" />
              </line>
            </g>
          )}

          {/* Message label in network */}
          {stepData && (
            <g>
              <rect x={270} y={95} width={160} height={30} rx={6} fill={`${stepData.color}15`} stroke={stepData.color} strokeWidth={1.5}>
                <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
              </rect>
              <text x={350} y={115} textAnchor="middle" fontSize={10} fontFamily="monospace" fontWeight={700} fill={stepData.color}>
                {stepData.fullLabel}
              </text>
            </g>
          )}
        </g>

        {/* DHCP Server */}
        <g>
          <rect x={530} y={70} width={120} height={80} rx={12} fill="var(--eng-bg)" stroke={stepData && stepData.from === "server" ? stepData.color : "var(--eng-border)"} strokeWidth={stepData && stepData.from === "server" ? 2.5 : 1.5} style={{ transition: "stroke 0.3s" }} />
          <Server x={575} y={82} width={20} height={20} style={{ color: "var(--eng-primary)" }} />
          <text x={590} y={118} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="var(--eng-font)" fill="var(--eng-text)">DHCP Server</text>
          <text x={590} y={132} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="var(--eng-text-muted)">192.168.1.1</text>
        </g>

        {/* Status bar */}
        <rect x={50} y={185} width={600} height={25} rx={6} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1} />
        <text x={350} y={202} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill={stepData ? stepData.color : "var(--eng-text-muted)"}>
          {stepData ? `${stepData.label}: ${stepData.type === "broadcast" ? "Broadcast" : "Unicast"} from ${stepData.from}` : "Ready — click Play to start"}
        </text>
      </svg>

      {/* Step description + packet details */}
      {stepData ? (
        <div className="eng-fadeIn" key={currentStep}>
          <div className="info-eng" style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: stepData.color }}>{stepData.fullLabel}:</strong> {stepData.desc}
            </p>
          </div>
          <div className="card-eng p-4">
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
              Packet Details
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {stepData.details.map((d, i) => (
                <div
                  key={i}
                  style={{
                    padding: "6px 10px",
                    borderRadius: 6,
                    background: "var(--eng-bg)",
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    color: "var(--eng-text)",
                    border: "1px solid var(--eng-border)",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : currentStep >= DORA_STEPS.length ? (
        <div className="card-eng p-5 eng-fadeIn" style={{ textAlign: "center" }}>
          <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: "var(--eng-success)", marginBottom: 8 }} />
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-success)", margin: "0 0 4px" }}>
            DORA Complete!
          </h4>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0 }}>
            The device now has IP 192.168.1.100, subnet mask, gateway, and DNS configured automatically.
          </p>
        </div>
      ) : null}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 — IP Leasing & Renewal                                       */
/* ================================================================== */

function LeasingTab() {
  const [leaseTime] = useState(86400); // 24 hours
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [renewalTriggered, setRenewalTriggered] = useState(false);
  const [showMultiServer, setShowMultiServer] = useState(false);

  const speedFactor = 1000; // each real second = 1000 seconds of lease

  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + speedFactor;
        if (next >= leaseTime) {
          setTimerRunning(false);
          return leaseTime;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, leaseTime]);

  // Auto-renewal at T1 (50%)
  useEffect(() => {
    if (elapsed >= leaseTime * 0.5 && elapsed < leaseTime * 0.5 + speedFactor && !renewalTriggered) {
      setRenewalTriggered(true);
    }
  }, [elapsed, leaseTime, renewalTriggered]);

  const startTimer = useCallback(() => {
    setElapsed(0);
    setRenewalTriggered(false);
    setTimerRunning(true);
  }, []);

  const pct = Math.min((elapsed / leaseTime) * 100, 100);
  const t1Pct = 50; // T1 renewal at 50%
  const t2Pct = 87.5; // T2 rebinding at 87.5%

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DHCP Lease & Renewal
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        IP addresses from DHCP are leased for a limited time. The client must renew before the lease expires.
      </p>

      {/* Lease timer visualization */}
      <div className="card-eng p-5" style={{ marginBottom: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: 0 }}>
            IP Lease Timer — 192.168.1.100
          </h4>
          <button onClick={startTimer} className="btn-eng" style={{ fontSize: "0.8rem" }}>
            <RefreshCw className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Start Lease
          </button>
        </div>

        {/* Timer bar */}
        <div style={{ position: "relative", height: 40, background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)", marginBottom: 16, overflow: "hidden" }}>
          {/* Elapsed fill */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: `${pct}%`,
              background: pct > t2Pct ? "rgba(239,68,68,0.2)" : pct > t1Pct ? "rgba(245,158,11,0.2)" : "rgba(16,185,129,0.2)",
              borderRadius: "8px 0 0 8px",
              transition: "width 1s linear, background 0.5s",
            }}
          />

          {/* T1 marker */}
          <div style={{ position: "absolute", left: `${t1Pct}%`, top: 0, height: "100%", width: 2, background: "#f59e0b" }}>
            <div style={{ position: "absolute", top: -18, left: -10, fontSize: "0.7rem", fontFamily: "var(--eng-font)", fontWeight: 600, color: "#f59e0b", whiteSpace: "nowrap" }}>
              T1 (50%)
            </div>
          </div>

          {/* T2 marker */}
          <div style={{ position: "absolute", left: `${t2Pct}%`, top: 0, height: "100%", width: 2, background: "#ef4444" }}>
            <div style={{ position: "absolute", top: -18, left: -10, fontSize: "0.7rem", fontFamily: "var(--eng-font)", fontWeight: 600, color: "#ef4444", whiteSpace: "nowrap" }}>
              T2 (87.5%)
            </div>
          </div>

          {/* Time label */}
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: "var(--eng-text)" }}>
            {formatTime(elapsed)} / {formatTime(leaseTime)}
          </div>
        </div>

        {/* Phase description */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div style={{
            padding: "10px 12px", borderRadius: 8, textAlign: "center",
            background: pct <= t1Pct ? "rgba(16,185,129,0.1)" : "var(--eng-bg)",
            border: pct <= t1Pct ? "1.5px solid var(--eng-success)" : "1px solid var(--eng-border)",
          }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.82rem", color: "var(--eng-success)", marginBottom: 4 }}>Normal Usage</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>0% - 50% of lease</div>
          </div>
          <div style={{
            padding: "10px 12px", borderRadius: 8, textAlign: "center",
            background: pct > t1Pct && pct <= t2Pct ? "rgba(245,158,11,0.1)" : "var(--eng-bg)",
            border: pct > t1Pct && pct <= t2Pct ? "1.5px solid #f59e0b" : "1px solid var(--eng-border)",
          }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.82rem", color: "#f59e0b", marginBottom: 4 }}>T1: Renewal</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>Unicast DHCPREQUEST to original server</div>
          </div>
          <div style={{
            padding: "10px 12px", borderRadius: 8, textAlign: "center",
            background: pct > t2Pct ? "rgba(239,68,68,0.1)" : "var(--eng-bg)",
            border: pct > t2Pct ? "1.5px solid var(--eng-danger)" : "1px solid var(--eng-border)",
          }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.82rem", color: "var(--eng-danger)", marginBottom: 4 }}>T2: Rebinding</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>Broadcast to ANY DHCP server</div>
          </div>
        </div>

        {renewalTriggered && (
          <div className="info-eng eng-fadeIn" style={{ marginTop: 12 }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", margin: 0 }}>
              <strong>Renewal triggered at T1 (50%)!</strong> The client sends a unicast DHCPREQUEST to the original server to extend the lease. If no response by T2 (87.5%), it broadcasts to any DHCP server.
            </p>
          </div>
        )}
      </div>

      {/* Multiple DHCP servers scenario */}
      <div className="card-eng p-4">
        <button
          onClick={() => setShowMultiServer(!showMultiServer)}
          className="w-full flex items-center justify-between"
          style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        >
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: 0 }}>
            Multiple DHCP Servers
          </h4>
          <ChevronRight className="w-4 h-4" style={{ color: "var(--eng-text-muted)", transform: showMultiServer ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {showMultiServer && (
          <div className="eng-fadeIn" style={{ marginTop: 12 }}>
            <svg viewBox="0 0 600 200" style={{ width: "100%", maxWidth: 600, display: "block", margin: "0 auto 12px" }}>
              {/* Client */}
              <rect x={240} y={130} width={120} height={50} rx={10} fill="var(--eng-bg)" stroke="var(--eng-primary)" strokeWidth={2} />
              <text x={300} y={160} textAnchor="middle" fontSize={10} fontWeight={600} fontFamily="var(--eng-font)" fill="var(--eng-text)">New Client</text>

              {/* Broadcast wave */}
              <circle cx={300} cy={155} r={20} fill="none" stroke="var(--eng-primary)" strokeWidth={1.5}>
                <animate attributeName="r" from="20" to="100" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* Server 1 */}
              <rect x={60} y={20} width={120} height={50} rx={10} fill="rgba(16,185,129,0.1)" stroke="#10b981" strokeWidth={2} />
              <text x={120} y={45} textAnchor="middle" fontSize={10} fontWeight={600} fontFamily="var(--eng-font)" fill="var(--eng-text)">DHCP Server A</text>
              <text x={120} y={58} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="var(--eng-text-muted)">Offers .100</text>
              <line x1={180} y1={50} x2={240} y2={130} stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.8s" repeatCount="indefinite" />
              </line>

              {/* Server 2 */}
              <rect x={420} y={20} width={120} height={50} rx={10} fill="rgba(245,158,11,0.1)" stroke="#f59e0b" strokeWidth={2} />
              <text x={480} y={45} textAnchor="middle" fontSize={10} fontWeight={600} fontFamily="var(--eng-font)" fill="var(--eng-text)">DHCP Server B</text>
              <text x={480} y={58} textAnchor="middle" fontSize={8} fontFamily="monospace" fill="var(--eng-text-muted)">Offers .101</text>
              <line x1={420} y1={50} x2={360} y2={130} stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 3">
                <animate attributeName="stroke-dashoffset" from="14" to="0" dur="0.8s" repeatCount="indefinite" />
              </line>

              {/* Explanation */}
              <text x={300} y={195} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">
                Client picks the first offer received (usually Server A)
              </text>
            </svg>

            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
              When multiple DHCP servers exist on a network, the client receives multiple OFFERs. It typically accepts the <strong>first offer received</strong>. The REQUEST is broadcast so all other servers know to withdraw their offers and return those IPs to the pool.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 — Interactive DORA Practice                                   */
/* ================================================================== */

function PracticeTab() {
  const [practiceStep, setPracticeStep] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const scenarios = [
    {
      question: "A new laptop connects to the company WiFi. What message does it send first?",
      options: ["DHCPOFFER to the server", "DHCPDISCOVER as a broadcast", "DHCPREQUEST with a specific IP", "ARP request for the gateway"],
      correct: 1,
      explanation: "The device sends a DHCPDISCOVER broadcast because it has no IP address yet and doesn't know any DHCP server's address.",
    },
    {
      question: "The DHCP server sends back an offer. Is this message broadcast or unicast?",
      options: ["Broadcast to all devices", "Unicast to the client's MAC address", "Multicast to a group", "Anycast to the nearest device"],
      correct: 1,
      explanation: "The OFFER is typically unicast to the client's MAC address (the server learned it from the DISCOVER). Some implementations may broadcast.",
    },
    {
      question: "The client wants the offered IP. Why does it BROADCAST the DHCPREQUEST instead of unicasting to the server?",
      options: [
        "The client doesn't know the server's IP",
        "To inform other DHCP servers to withdraw their offers",
        "Broadcasting is faster than unicasting",
        "TCP requires a three-way handshake first",
      ],
      correct: 1,
      explanation: "The broadcast ensures ALL DHCP servers on the network know which offer was accepted, so other servers can release reserved IPs back to their pools.",
    },
    {
      question: "After receiving DHCPACK, what information does the client have? (Select the most complete answer)",
      options: [
        "Only the IP address",
        "IP address and subnet mask only",
        "IP address, subnet mask, default gateway, DNS server, and lease duration",
        "IP address and the server's MAC address",
      ],
      correct: 2,
      explanation: "DHCPACK provides the full network configuration: IP address, subnet mask, default gateway, DNS servers, lease time, and optionally domain name and more.",
    },
    {
      question: "A client's lease is at 60% used. What happens at this point?",
      options: [
        "Nothing — lease is still valid",
        "The client sends a unicast DHCPREQUEST to renew with the original server",
        "The client broadcasts to find a new server",
        "The IP address is immediately released",
      ],
      correct: 1,
      explanation: "At T1 (50% of lease), the client starts renewal by unicasting DHCPREQUEST to the original DHCP server. At 60%, renewal is already underway.",
    },
  ];

  const handleAnswer = useCallback((idx: number) => {
    if (answered) return;
    setSelectedAnswer(idx);
    setAnswered(true);
    if (idx === scenarios[practiceStep].correct) setScore((s) => s + 1);
  }, [answered, practiceStep, scenarios]);

  const handleNext = useCallback(() => {
    if (practiceStep < scenarios.length - 1) {
      setPracticeStep((s) => s + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  }, [practiceStep, scenarios.length]);

  const resetPractice = useCallback(() => {
    setPracticeStep(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScore(0);
    setFinished(false);
  }, []);

  if (finished) {
    return (
      <div>
        <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 20px" }}>
          Practice Scenario Complete!
        </h2>
        <div className="card-eng p-8 eng-fadeIn" style={{ textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
          <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: "var(--eng-success)", marginBottom: 12 }} />
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            {score >= 4 ? "Excellent!" : score >= 3 ? "Good job!" : "Keep practicing!"}
          </h3>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px" }}>
            You scored <strong>{score}/{scenarios.length}</strong>
          </p>
          <button onClick={resetPractice} className="btn-eng" style={{ fontSize: "0.85rem" }}>
            <RefreshCw className="w-4 h-4" style={{ marginRight: 4 }} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const scenario = scenarios[practiceStep];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DHCP Practice Scenario
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Walk through a real-world DHCP scenario and test your understanding of the DORA process.
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-2" style={{ marginBottom: 20 }}>
        {scenarios.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === practiceStep ? 24 : 10,
              height: 10,
              borderRadius: 5,
              background: i < practiceStep ? "var(--eng-success)" : i === practiceStep ? "var(--eng-primary)" : "var(--eng-border)",
              transition: "all 0.3s",
            }}
          />
        ))}
        <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginLeft: 8 }}>
          {practiceStep + 1} of {scenarios.length}
        </span>
      </div>

      {/* Scenario SVG context */}
      <svg viewBox="0 0 500 80" style={{ width: "100%", maxWidth: 500, display: "block", margin: "0 auto 16px" }}>
        <rect x={10} y={10} width={100} height={60} rx={10} fill="var(--eng-primary-light)" stroke="var(--eng-primary)" strokeWidth={1.5} />
        <Monitor x={45} y={22} width={20} height={20} style={{ color: "var(--eng-primary)" }} />
        <text x={60} y={55} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">Client</text>

        <line x1={110} y1={40} x2={200} y2={40} stroke="var(--eng-border)" strokeWidth={1.5} strokeDasharray="4 3" />
        <text x={155} y={32} textAnchor="middle" fontSize={8} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Network</text>

        <rect x={200} y={10} width={100} height={60} rx={10} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1.5} />
        <Wifi x={235} y={22} width={20} height={20} style={{ color: "var(--eng-text-muted)" }} />
        <text x={250} y={55} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">Switch</text>

        <line x1={300} y1={40} x2={390} y2={40} stroke="var(--eng-border)" strokeWidth={1.5} strokeDasharray="4 3" />

        <rect x={390} y={10} width={100} height={60} rx={10} fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth={1.5} />
        <Server x={425} y={22} width={20} height={20} style={{ color: "var(--eng-success)" }} />
        <text x={440} y={55} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">DHCP Srv</text>
      </svg>

      {/* Question */}
      <div className="card-eng p-5" style={{ maxWidth: 640, margin: "0 auto" }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
            Scenario {practiceStep + 1}
          </span>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Score: {score}
          </span>
        </div>

        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 16px", lineHeight: 1.5 }}>
          {scenario.question}
        </h4>

        <div className="space-y-2" style={{ marginBottom: 16 }}>
          {scenario.options.map((opt, idx) => {
            const isCorrect = idx === scenario.correct;
            const isSelected = idx === selectedAnswer;
            let bg = "var(--eng-surface)";
            let border = "1px solid var(--eng-border)";
            let color = "var(--eng-text)";

            if (answered) {
              if (isCorrect) { bg = "rgba(16,185,129,0.1)"; border = "1.5px solid var(--eng-success)"; color = "#065f46"; }
              else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "1.5px solid var(--eng-danger)"; color = "#991b1b"; }
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={answered}
                className="w-full text-left flex items-center gap-3 transition-all"
                style={{
                  padding: "10px 14px",
                  borderRadius: 8,
                  background: bg,
                  border,
                  color,
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.88rem",
                  cursor: answered ? "default" : "pointer",
                }}
              >
                <span style={{
                  width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
                  background: isSelected ? (answered ? (isCorrect ? "var(--eng-success)" : "var(--eng-danger)") : "var(--eng-primary)") : "#e2e8f0",
                  color: isSelected ? "#fff" : "var(--eng-text-muted)",
                }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="eng-fadeIn">
            <div className="info-eng" style={{ marginBottom: 12 }}>
              <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
                {scenario.explanation}
              </p>
            </div>
            <button onClick={handleNext} className="btn-eng" style={{ width: "100%", fontSize: "0.85rem" }}>
              {practiceStep < scenarios.length - 1 ? "Next Scenario" : "See Results"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                                */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What does DORA stand for in DHCP?",
    options: [
      "Data, Operation, Request, Acknowledge",
      "Discover, Offer, Request, Acknowledge",
      "Distribute, Offer, Respond, Accept",
      "Discover, Open, Request, Accept",
    ],
    correctIndex: 1,
    explanation: "DORA stands for Discover, Offer, Request, Acknowledge — the four-step process for obtaining an IP address from a DHCP server.",
  },
  {
    question: "Why is DHCPDISCOVER sent as a broadcast?",
    options: [
      "The client wants all devices to know its MAC address",
      "Broadcast is more reliable than unicast",
      "The client has no IP and doesn't know any DHCP server's address",
      "To test the network connectivity first",
    ],
    correctIndex: 2,
    explanation: "The client has no IP address (0.0.0.0) and doesn't know any DHCP server's address, so it must broadcast to 255.255.255.255 to reach any server.",
  },
  {
    question: "At what percentage of the lease time does a DHCP client first attempt renewal?",
    options: ["25% (T0)", "50% (T1)", "75%", "87.5% (T2)"],
    correctIndex: 1,
    explanation: "At T1 (50% of lease time), the client sends a unicast renewal request to the original DHCP server.",
  },
  {
    question: "What happens at T2 (87.5% of lease time)?",
    options: [
      "The lease expires immediately",
      "The client broadcasts a renewal to ANY DHCP server (rebinding)",
      "The client releases the IP address",
      "The server sends a new offer automatically",
    ],
    correctIndex: 1,
    explanation: "At T2, if T1 renewal failed, the client broadcasts DHCPREQUEST to any available DHCP server (rebinding phase).",
  },
  {
    question: "Why does the client broadcast the DHCPREQUEST (step 3) instead of unicasting to the server?",
    options: [
      "To confirm it received the offer correctly",
      "Because the client still has no IP address and needs to inform all servers",
      "Broadcasting uses less bandwidth",
      "The server requires a broadcast response",
    ],
    correctIndex: 1,
    explanation: "The broadcast DHCPREQUEST serves two purposes: (1) the client still has no IP so must broadcast, and (2) it informs other DHCP servers to withdraw their offers.",
  },
];

/* ================================================================== */
/*  Main Export                                                         */
/* ================================================================== */

export default function CN_L5_DHCPActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "dora",
      label: "DORA",
      icon: <Radio className="w-4 h-4" />,
      content: <DHCPDORATab />,
    },
    {
      id: "leasing",
      label: "Leasing",
      icon: <Clock className="w-4 h-4" />,
      content: <LeasingTab />,
    },
    {
      id: "practice",
      label: "Practice",
      icon: <Layers className="w-4 h-4" />,
      content: <PracticeTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="DHCP — Dynamic Host Configuration"
      level={5}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Network Security — Cryptography Basics"
      gateRelevance="1-2 marks"
      placementRelevance="Low"
    />
  );
}
