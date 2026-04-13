"use client";

import { useState, useEffect, useCallback } from "react";
import { Brain, Cpu, ArrowDown, ArrowUp, Layers, Network, Zap, Settings } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1 — Traditional Networking                                     */
/* ------------------------------------------------------------------ */

interface TraditionalRouter {
  id: string;
  x: number;
  y: number;
  label: string;
  table: string[];
}

function TraditionalTab() {
  const [activeRouter, setActiveRouter] = useState<string | null>(null);
  const [packetPos, setPacketPos] = useState<{ x: number; y: number } | null>(null);
  const [animating, setAnimating] = useState(false);
  const [step, setStep] = useState(0);

  const routers: TraditionalRouter[] = [
    { id: "r1", x: 120, y: 80, label: "Router A", table: ["10.0.1.0/24 -> port 1", "10.0.2.0/24 -> port 2", "default -> port 3"] },
    { id: "r2", x: 350, y: 60, label: "Router B", table: ["10.0.1.0/24 -> port 1", "10.0.3.0/24 -> port 2", "default -> port 3"] },
    { id: "r3", x: 560, y: 80, label: "Router C", table: ["10.0.2.0/24 -> port 1", "10.0.3.0/24 -> port 2", "default -> port 1"] },
    { id: "r4", x: 240, y: 240, label: "Router D", table: ["10.0.1.0/24 -> port 1", "10.0.4.0/24 -> port 2", "default -> port 3"] },
    { id: "r5", x: 460, y: 240, label: "Router E", table: ["10.0.3.0/24 -> port 1", "10.0.4.0/24 -> port 2", "default -> port 1"] },
  ];

  const links = [
    ["r1", "r2"], ["r2", "r3"], ["r1", "r4"], ["r4", "r5"], ["r3", "r5"], ["r2", "r5"],
  ];

  const getRouter = (id: string) => routers.find((r) => r.id === id)!;

  const animatePacket = useCallback(() => {
    if (animating) return;
    setAnimating(true);
    setStep(0);
    const path = [routers[0], routers[1], routers[4], routers[2]];
    let i = 0;
    setActiveRouter(path[0].id);
    setPacketPos({ x: path[0].x, y: path[0].y });

    const interval = setInterval(() => {
      i++;
      if (i < path.length) {
        setActiveRouter(path[i].id);
        setPacketPos({ x: path[i].x, y: path[i].y });
        setStep(i);
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setAnimating(false);
          setActiveRouter(null);
          setPacketPos(null);
          setStep(0);
        }, 1200);
      }
    }, 1000);
  }, [animating]);

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Traditional Networking:</strong> Each router maintains its own control plane (brain).
        Routers independently compute forwarding tables using protocols like OSPF or BGP.
        There is no central authority -- every router makes its own decisions.
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            Distributed Control Plane
          </h3>
          <button
            className="btn-eng"
            onClick={animatePacket}
            disabled={animating}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ marginRight: 4 }} />
            {animating ? "Routing..." : "Send Packet"}
          </button>
        </div>

        <svg viewBox="0 0 700 320" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* Links */}
          {links.map(([a, b], i) => {
            const ra = getRouter(a);
            const rb = getRouter(b);
            return (
              <line
                key={i}
                x1={ra.x} y1={ra.y} x2={rb.x} y2={rb.y}
                stroke="var(--eng-border)"
                strokeWidth={2}
                strokeDasharray="6,4"
              />
            );
          })}

          {/* Routers */}
          {routers.map((r) => {
            const isActive = activeRouter === r.id;
            return (
              <g
                key={r.id}
                onClick={() => setActiveRouter(activeRouter === r.id ? null : r.id)}
                style={{ cursor: "pointer" }}
              >
                {/* Router body */}
                <rect
                  x={r.x - 36} y={r.y - 24} width={72} height={48} rx={8}
                  fill={isActive ? "var(--eng-primary)" : "var(--eng-surface)"}
                  stroke={isActive ? "var(--eng-primary)" : "var(--eng-border)"}
                  strokeWidth={2}
                >
                  {isActive && (
                    <animate attributeName="opacity" values="1;0.7;1" dur="0.8s" repeatCount="indefinite" />
                  )}
                </rect>
                {/* Brain icon (control plane) */}
                <circle
                  cx={r.x} cy={r.y - 36} r={10}
                  fill={isActive ? "#fbbf24" : "#e2e8f0"}
                  stroke={isActive ? "#f59e0b" : "#94a3b8"}
                  strokeWidth={1.5}
                />
                <text x={r.x} y={r.y - 33} textAnchor="middle" fontSize="9" fill={isActive ? "#78350f" : "#64748b"} fontWeight={700}>
                  CP
                </text>
                {/* Router label */}
                <text
                  x={r.x} y={r.y + 4} textAnchor="middle"
                  fontSize="11" fontWeight={600}
                  fill={isActive ? "#fff" : "var(--eng-text)"}
                  fontFamily="var(--eng-font)"
                >
                  {r.label}
                </text>
                {/* Data plane label */}
                <text x={r.x} y={r.y + 16} textAnchor="middle" fontSize="8" fill={isActive ? "#dbeafe" : "var(--eng-text-muted)"}>
                  Data Plane
                </text>
              </g>
            );
          })}

          {/* Animated packet */}
          {packetPos && (
            <g className="eng-fadeIn">
              <rect
                x={packetPos.x - 8} y={packetPos.y - 44} width={16} height={10} rx={3}
                fill="var(--eng-success)"
                stroke="#065f46"
                strokeWidth={1}
              >
                <animate attributeName="y" values={`${packetPos.y - 48};${packetPos.y - 44};${packetPos.y - 48}`} dur="0.6s" repeatCount="indefinite" />
              </rect>
              <text x={packetPos.x} y={packetPos.y - 37} textAnchor="middle" fontSize="6" fill="#fff" fontWeight={700}>
                PKT
              </text>
            </g>
          )}

          {/* Legend */}
          <g>
            <circle cx={30} cy={300} r={7} fill="#e2e8f0" stroke="#94a3b8" strokeWidth={1} />
            <text x={30} y={303} textAnchor="middle" fontSize="6" fill="#64748b" fontWeight={700}>CP</text>
            <text x={46} y={304} fontSize="9" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">= Control Plane (brain)</text>
          </g>
        </svg>
      </div>

      {/* Forwarding table display */}
      {activeRouter && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            <Brain className="w-4 h-4" style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: "var(--eng-primary)" }} />
            {getRouter(activeRouter).label} -- Forwarding Table
          </h4>
          <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--eng-text-muted)", background: "var(--eng-bg)", padding: 12, borderRadius: 6, border: "1px solid var(--eng-border)" }}>
            {getRouter(activeRouter).table.map((entry, i) => (
              <div key={i} style={{ padding: "3px 0" }}>{entry}</div>
            ))}
          </div>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginTop: 8 }}>
            Each router computes this table independently using routing protocols.
          </p>
        </div>
      )}

      {step > 0 && (
        <div className="info-eng eng-fadeIn" style={{ fontSize: "0.85rem" }}>
          <strong>Hop {step}:</strong> The packet reached the next router. Each router consulted
          its own forwarding table to decide where to send the packet next.
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — SDN Architecture                                           */
/* ------------------------------------------------------------------ */

function SDNTab() {
  const [phase, setPhase] = useState<"traditional" | "lifting" | "sdn">("traditional");
  const [flowMessage, setFlowMessage] = useState<string | null>(null);
  const [appInstruction, setAppInstruction] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (phase === "lifting") {
      const timer = setTimeout(() => setPhase("sdn"), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === "sdn") {
      const interval = setInterval(() => setTick((t) => (t + 1) % 3), 1200);
      return () => clearInterval(interval);
    }
  }, [phase]);

  const startAnimation = () => {
    setPhase("traditional");
    setTimeout(() => setPhase("lifting"), 600);
    setFlowMessage(null);
    setAppInstruction(null);
  };

  const switches = [
    { id: "s1", x: 100, y: 280, label: "Switch 1" },
    { id: "s2", x: 280, y: 280, label: "Switch 2" },
    { id: "s3", x: 460, y: 280, label: "Switch 3" },
    { id: "s4", x: 640, y: 280, label: "Switch 4" },
  ];

  const controllerY = phase === "sdn" ? 120 : phase === "lifting" ? 180 : 280;

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Software-Defined Networking (SDN):</strong> Separates the control plane from the data plane.
        A centralized controller programs all switches via a protocol like OpenFlow.
        Applications on top of the controller can dynamically manage the entire network.
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            SDN Architecture Evolution
          </h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-eng-outline" onClick={startAnimation} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              <Zap className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Animate Separation
            </button>
            {phase === "sdn" && (
              <button
                className="btn-eng"
                onClick={() => {
                  setAppInstruction("Block traffic from 10.0.1.5");
                  setTimeout(() => setFlowMessage("Install: drop 10.0.1.5 -> *"), 800);
                  setTimeout(() => { setFlowMessage(null); setAppInstruction(null); }, 3000);
                }}
                style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              >
                <Settings className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Push Flow Rule
              </button>
            )}
          </div>
        </div>

        <svg viewBox="0 0 740 380" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* Application Layer (only in SDN phase) */}
          {phase === "sdn" && (
            <g className="eng-fadeIn">
              <rect x={270} y={10} width={200} height={44} rx={8} fill="#ede9fe" stroke="#8b5cf6" strokeWidth={1.5} />
              <text x={370} y={28} textAnchor="middle" fontSize="10" fill="#8b5cf6" fontWeight={700} fontFamily="var(--eng-font)">
                Application Layer
              </text>
              <text x={370} y={42} textAnchor="middle" fontSize="8" fill="#7c3aed" fontFamily="var(--eng-font)">
                (Traffic Eng, Firewall, LB)
              </text>
              {appInstruction && (
                <g className="eng-fadeIn">
                  <rect x={490} y={15} width={200} height={30} rx={6} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
                  <text x={590} y={34} textAnchor="middle" fontSize="8" fill="#92400e" fontFamily="var(--eng-font)">
                    {appInstruction}
                  </text>
                </g>
              )}
              {/* Northbound API line */}
              <line x1={370} y1={54} x2={370} y2={controllerY - 28} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="4,3" />
              <text x={390} y={80} fontSize="8" fill="#8b5cf6" fontFamily="var(--eng-font)">Northbound API</text>
            </g>
          )}

          {/* Controller (appears during lifting/sdn) */}
          {phase !== "traditional" && (
            <g style={{ transition: "transform 1s ease" }}>
              <rect
                x={300} y={controllerY - 24} width={140} height={48} rx={10}
                fill="var(--eng-primary)" stroke="var(--eng-primary)" strokeWidth={2}
              >
                {phase === "lifting" && (
                  <animate attributeName="y" from="256" to={`${controllerY - 24}`} dur="1.5s" fill="freeze" />
                )}
              </rect>
              <text x={370} y={controllerY - 4} textAnchor="middle" fontSize="12" fill="#fff" fontWeight={700} fontFamily="var(--eng-font)">
                SDN Controller
              </text>
              <text x={370} y={controllerY + 12} textAnchor="middle" fontSize="8" fill="#dbeafe" fontFamily="var(--eng-font)">
                (Global View)
              </text>
            </g>
          )}

          {/* OpenFlow lines (sdn phase) */}
          {phase === "sdn" && switches.map((sw, i) => (
            <g key={sw.id}>
              <line
                x1={370} y1={controllerY + 24}
                x2={sw.x} y2={sw.y - 24}
                stroke="var(--eng-success)"
                strokeWidth={1.5}
                strokeDasharray="5,3"
              >
                <animate
                  attributeName="strokeDashoffset"
                  from="0" to="-16"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </line>
              {i === 1 && (
                <text x={280} y={200} fontSize="8" fill="var(--eng-success)" fontFamily="var(--eng-font)">
                  OpenFlow
                </text>
              )}
            </g>
          ))}

          {/* Flow message animation */}
          {flowMessage && phase === "sdn" && switches.map((sw) => (
            <g key={`flow-${sw.id}`} className="eng-fadeIn">
              <rect x={sw.x - 55} y={sw.y - 60} width={110} height={22} rx={4} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1} />
              <text x={sw.x} y={sw.y - 45} textAnchor="middle" fontSize="7" fill="#92400e" fontFamily="monospace">
                {flowMessage}
              </text>
            </g>
          ))}

          {/* Switch links */}
          {[0, 1, 2].map((i) => (
            <line
              key={`link-${i}`}
              x1={switches[i].x} y1={switches[i].y}
              x2={switches[i + 1].x} y2={switches[i + 1].y}
              stroke="var(--eng-border)" strokeWidth={2}
            />
          ))}

          {/* Switches */}
          {switches.map((sw) => {
            const showBrain = phase === "traditional";
            return (
              <g key={sw.id}>
                <rect
                  x={sw.x - 36} y={sw.y - 24} width={72} height={48} rx={8}
                  fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={2}
                />
                {showBrain && (
                  <g>
                    <circle cx={sw.x} cy={sw.y - 36} r={9} fill="#fbbf24" stroke="#f59e0b" strokeWidth={1.5}>
                      {phase === "traditional" && (
                        <animate attributeName="opacity" values="1;0.4;1" dur="2s" begin="0.5s" repeatCount="1" />
                      )}
                    </circle>
                    <text x={sw.x} y={sw.y - 33} textAnchor="middle" fontSize="7" fill="#78350f" fontWeight={700}>
                      CP
                    </text>
                  </g>
                )}
                <text
                  x={sw.x} y={sw.y + 4} textAnchor="middle" fontSize="10" fontWeight={600}
                  fill="var(--eng-text)" fontFamily="var(--eng-font)"
                >
                  {sw.label}
                </text>
                <text x={sw.x} y={sw.y + 16} textAnchor="middle" fontSize="7" fill="var(--eng-text-muted)">
                  {phase === "sdn" ? "Data Plane Only" : "Control + Data"}
                </text>
              </g>
            );
          })}

          {/* Phase label */}
          <text x={370} y={365} textAnchor="middle" fontSize="11" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">
            {phase === "traditional" ? "Traditional: Each switch has its own brain" :
             phase === "lifting" ? "Separating control planes..." :
             "SDN: Centralized intelligence, dumb switches"}
          </text>

          {/* Animated pulse for SDN communication */}
          {phase === "sdn" && (
            <circle r="4" fill="var(--eng-success)" opacity={0.7}>
              <animateMotion
                path={`M370,${controllerY + 24} L${switches[tick].x},${switches[tick].y - 24}`}
                dur="0.8s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>
      </div>

      {/* SDN Planes explanation */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { title: "Application Plane", desc: "Network apps (firewall, load balancer, traffic engineering) that program the network.", color: "#8b5cf6", icon: <Settings className="w-4 h-4" /> },
          { title: "Control Plane", desc: "Central SDN controller with a global view. Computes forwarding rules for all switches.", color: "var(--eng-primary)", icon: <Brain className="w-4 h-4" /> },
          { title: "Data Plane", desc: "Switches forward packets according to flow rules installed by the controller.", color: "var(--eng-success)", icon: <Network className="w-4 h-4" /> },
        ].map((plane) => (
          <div key={plane.title} className="card-eng eng-fadeIn" style={{ padding: 14, borderLeft: `3px solid ${plane.color}` }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
              <span style={{ color: plane.color }}>{plane.icon}</span>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.85rem", color: "var(--eng-text)", margin: 0 }}>
                {plane.title}
              </h4>
            </div>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.5 }}>
              {plane.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — SDN Benefits (flow rule programming)                       */
/* ------------------------------------------------------------------ */

function BenefitsTab() {
  const [rule, setRule] = useState<"normal" | "block" | "redirect" | "balance">("normal");
  const [packetPaths, setPacketPaths] = useState<number[][]>([[0, 1, 2, 3]]);

  const nodes = [
    { id: 0, x: 80, y: 160, label: "Source" },
    { id: 1, x: 240, y: 80, label: "Switch A" },
    { id: 2, x: 400, y: 80, label: "Switch B" },
    { id: 3, x: 560, y: 160, label: "Dest" },
    { id: 4, x: 240, y: 240, label: "Switch C" },
    { id: 5, x: 400, y: 240, label: "Switch D" },
  ];

  const allLinks = [
    [0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 3], [1, 4], [2, 5],
  ];

  useEffect(() => {
    switch (rule) {
      case "normal":
        setPacketPaths([[0, 1, 2, 3]]);
        break;
      case "block":
        setPacketPaths([]);
        break;
      case "redirect":
        setPacketPaths([[0, 4, 5, 3]]);
        break;
      case "balance":
        setPacketPaths([[0, 1, 2, 3], [0, 4, 5, 3]]);
        break;
    }
  }, [rule]);

  const rules = [
    { id: "normal" as const, label: "Normal Route", desc: "Source -> A -> B -> Dest", color: "var(--eng-primary)" },
    { id: "block" as const, label: "Block Traffic", desc: "Drop all packets from Source", color: "var(--eng-danger)" },
    { id: "redirect" as const, label: "Redirect Path", desc: "Source -> C -> D -> Dest", color: "var(--eng-warning)" },
    { id: "balance" as const, label: "Load Balance", desc: "Split across both paths", color: "var(--eng-success)" },
  ];

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Programmable Networks:</strong> With SDN, you can modify flow rules from a central point
        and instantly change how the entire network forwards traffic. Try different rules below!
      </div>

      {/* Rule selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 8 }}>
        {rules.map((r) => (
          <button
            key={r.id}
            className={rule === r.id ? "btn-eng" : "btn-eng-outline"}
            onClick={() => setRule(r.id)}
            style={{ fontSize: "0.8rem", padding: "8px 12px", textAlign: "left" }}
          >
            <div style={{ fontWeight: 600 }}>{r.label}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: 2 }}>{r.desc}</div>
          </button>
        ))}
      </div>

      {/* Network visualization */}
      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox="0 0 640 320" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* All links */}
          {allLinks.map(([a, b], i) => {
            const na = nodes[a];
            const nb = nodes[b];
            const isActive = packetPaths.some((path) => {
              for (let j = 0; j < path.length - 1; j++) {
                if ((path[j] === a && path[j + 1] === b) || (path[j] === b && path[j + 1] === a)) return true;
              }
              return false;
            });
            return (
              <line
                key={i}
                x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke={isActive ? "var(--eng-primary)" : "var(--eng-border)"}
                strokeWidth={isActive ? 3 : 1.5}
                strokeDasharray={isActive ? "none" : "6,4"}
                opacity={isActive ? 1 : 0.4}
              />
            );
          })}

          {/* Animated packets along paths */}
          {packetPaths.map((path, pi) => {
            const pathStr = path.map((nid) => `${nodes[nid].x},${nodes[nid].y}`).join(" L");
            return (
              <circle key={pi} r="6" fill="var(--eng-success)" opacity={0.9}>
                <animateMotion
                  path={`M${pathStr}`}
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}

          {/* Block X */}
          {rule === "block" && (
            <g className="eng-fadeIn">
              <line x1={110} y1={130} x2={170} y2={190} stroke="var(--eng-danger)" strokeWidth={4} />
              <line x1={170} y1={130} x2={110} y2={190} stroke="var(--eng-danger)" strokeWidth={4} />
              <text x={140} y={215} textAnchor="middle" fontSize="10" fill="var(--eng-danger)" fontWeight={700} fontFamily="var(--eng-font)">
                BLOCKED
              </text>
            </g>
          )}

          {/* Nodes */}
          {nodes.map((n) => (
            <g key={n.id}>
              <circle
                cx={n.x} cy={n.y} r={24}
                fill={n.id === 0 || n.id === 3 ? "#ede9fe" : "var(--eng-surface)"}
                stroke={n.id === 0 || n.id === 3 ? "#8b5cf6" : "var(--eng-border)"}
                strokeWidth={2}
              />
              <text
                x={n.x} y={n.y + 4} textAnchor="middle" fontSize="9" fontWeight={600}
                fill="var(--eng-text)" fontFamily="var(--eng-font)"
              >
                {n.label}
              </text>
            </g>
          ))}

          {/* Controller */}
          <rect x={240} y={10} width={160} height={36} rx={8} fill="var(--eng-primary)" />
          <text x={320} y={33} textAnchor="middle" fontSize="11" fill="#fff" fontWeight={700} fontFamily="var(--eng-font)">
            SDN Controller
          </text>

          {/* Rule display */}
          <rect x={180} y={275} width={280} height={30} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
          <text x={320} y={294} textAnchor="middle" fontSize="10" fill="var(--eng-text)" fontWeight={600} fontFamily="var(--eng-font)">
            Active Rule: {rules.find((r) => r.id === rule)?.label}
          </text>
        </svg>
      </div>

      {/* Key benefits */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { title: "Centralized Control", desc: "Single point of management for the entire network. No need to configure each device individually." },
          { title: "Programmability", desc: "APIs allow dynamic network management. Automate responses to traffic patterns or security events." },
          { title: "Vendor Neutral", desc: "OpenFlow is an open standard. Mix switches from different vendors under one controller." },
          { title: "Rapid Innovation", desc: "New network features are software updates to the controller, not firmware upgrades to every switch." },
        ].map((b) => (
          <div key={b.title} className="card-eng eng-fadeIn" style={{ padding: 14 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.85rem", color: "var(--eng-primary)", margin: "0 0 4px" }}>
              {b.title}
            </h4>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.5 }}>
              {b.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the key idea behind Software-Defined Networking (SDN)?",
    options: [
      "Using only wireless connections",
      "Separating the control plane from the data plane",
      "Making every router more powerful",
      "Removing all network protocols",
    ],
    correctIndex: 1,
    explanation: "SDN decouples the control plane (decision-making) from the data plane (packet forwarding), centralizing network intelligence in a controller.",
  },
  {
    question: "In SDN architecture, what are the three planes from top to bottom?",
    options: [
      "Physical, Logical, Virtual",
      "Application, Control, Data",
      "Hardware, Software, Network",
      "Input, Processing, Output",
    ],
    correctIndex: 1,
    explanation: "The SDN architecture has an Application Plane (network apps), Control Plane (SDN controller), and Data Plane (switches that forward packets).",
  },
  {
    question: "What protocol does the SDN controller use to communicate with switches?",
    options: [
      "HTTP",
      "SMTP",
      "OpenFlow",
      "FTP",
    ],
    correctIndex: 2,
    explanation: "OpenFlow is the standard southbound protocol used by SDN controllers to install flow rules on switches.",
  },
  {
    question: "What is a major benefit of SDN over traditional networking?",
    options: [
      "Faster physical cables",
      "No need for electricity",
      "Centralized programmable control of the entire network",
      "Automatic hardware repair",
    ],
    correctIndex: 2,
    explanation: "SDN allows network administrators to programmatically control and reconfigure the entire network from a central controller, enabling rapid changes and automation.",
  },
  {
    question: "In traditional networking, where does each router compute its forwarding table?",
    options: [
      "At a central server",
      "Locally, using its own control plane",
      "In the cloud",
      "It doesn't compute one",
    ],
    correctIndex: 1,
    explanation: "In traditional networking, each router runs its own control plane (routing protocols like OSPF/BGP) to independently compute its forwarding table.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L7_SDNActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "traditional",
      label: "Traditional",
      icon: <Cpu className="w-4 h-4" />,
      content: <TraditionalTab />,
    },
    {
      id: "sdn",
      label: "SDN",
      icon: <Brain className="w-4 h-4" />,
      content: <SDNTab />,
    },
    {
      id: "benefits",
      label: "Benefits",
      icon: <Zap className="w-4 h-4" />,
      content: <BenefitsTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Software-Defined Networking (SDN)"
      level={7}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Content Delivery Networks — Speed up the web globally"
      gateRelevance="1 mark"
      placementRelevance="Medium"
    />
  );
}
