"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Server, GitBranch, Target, Info, Play, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Types & Data                                                       */
/* ================================================================== */

interface Router {
  id: string;
  label: string;
  x: number;
  y: number;
  table: { dest: string; mask: string; nextHop: string; iface: string }[];
}

interface Link {
  from: string;
  to: string;
  cost: number;
}

const ROUTERS: Router[] = [
  {
    id: "R1", label: "R1", x: 80, y: 160,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "direct", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R2", iface: "eth1" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth2" },
    ],
  },
  {
    id: "R2", label: "R2", x: 280, y: 80,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R1", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "direct", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R4", iface: "eth2" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth3" },
    ],
  },
  {
    id: "R3", label: "R3", x: 280, y: 240,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R1", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth1" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "R4", iface: "eth2" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "direct", iface: "eth3" },
    ],
  },
  {
    id: "R4", label: "R4", x: 480, y: 160,
    table: [
      { dest: "10.0.0.0", mask: "/8", nextHop: "R2", iface: "eth0" },
      { dest: "172.16.0.0", mask: "/16", nextHop: "R2", iface: "eth0" },
      { dest: "192.168.0.0", mask: "/24", nextHop: "direct", iface: "eth1" },
      { dest: "0.0.0.0", mask: "/0", nextHop: "R3", iface: "eth2" },
    ],
  },
];

const LINKS: Link[] = [
  { from: "R1", to: "R2", cost: 2 },
  { from: "R1", to: "R3", cost: 5 },
  { from: "R2", to: "R3", cost: 1 },
  { from: "R2", to: "R4", cost: 3 },
  { from: "R3", to: "R4", cost: 4 },
];

function getRouter(id: string): Router | undefined {
  return ROUTERS.find((r) => r.id === id);
}

/* ================================================================== */
/*  Tab 1 — Routing Table & Packet Trace                               */
/* ================================================================== */

function RoutingTab() {
  const [hoveredRouter, setHoveredRouter] = useState<string | null>(null);
  const [destIP, setDestIP] = useState("192.168.0.5");
  const [packetPath, setPacketPath] = useState<string[]>([]);
  const [animStep, setAnimStep] = useState(-1);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tracePacket = useCallback(() => {
    // Simple longest prefix match simulation
    const path: string[] = ["R1"];
    let current = "R1";
    const visited = new Set<string>();

    for (let i = 0; i < 10; i++) {
      if (visited.has(current)) break;
      visited.add(current);

      const router = getRouter(current);
      if (!router) break;

      // Find longest prefix match
      let bestMatch = router.table.find((e) => e.dest === "0.0.0.0"); // default
      let bestLen = 0;
      for (const entry of router.table) {
        const prefLen = parseInt(entry.mask.replace("/", ""), 10);
        if (prefLen > bestLen && destIP.startsWith(entry.dest.split(".").slice(0, Math.ceil(prefLen / 8)).join("."))) {
          bestMatch = entry;
          bestLen = prefLen;
        }
      }

      if (bestMatch?.nextHop === "direct") break;
      if (bestMatch?.nextHop) {
        path.push(bestMatch.nextHop);
        current = bestMatch.nextHop;
      } else {
        break;
      }
    }

    setPacketPath(path);
    setAnimStep(0);

    if (animRef.current) clearInterval(animRef.current);
    let step = 0;
    animRef.current = setInterval(() => {
      step++;
      if (step >= path.length) {
        if (animRef.current) clearInterval(animRef.current);
        return;
      }
      setAnimStep(step);
    }, 800);
  }, [destIP]);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  const hovRouter = hoveredRouter ? getRouter(hoveredRouter) : null;

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Hover over routers to see their routing tables. Enter a destination IP and trace how the packet hops through the network using longest prefix match.</span>
      </div>

      {/* Network graph */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Destination IP
            </label>
            <input type="text" value={destIP} onChange={(e) => setDestIP(e.target.value)}
              style={{ width: "100%", padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
            />
          </div>
          <button className="btn-eng" onClick={tracePacket} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem" }}>
            <Play className="w-4 h-4" /> Trace Packet
          </button>
        </div>

        <svg viewBox="0 0 560 320" style={{ width: "100%", maxHeight: 340 }}>
          {/* Links */}
          {LINKS.map((link) => {
            const fromR = getRouter(link.from)!;
            const toR = getRouter(link.to)!;
            const isOnPath = packetPath.length > 0 &&
              packetPath.some((r, i) => i < packetPath.length - 1 &&
                ((r === link.from && packetPath[i + 1] === link.to) || (r === link.to && packetPath[i + 1] === link.from)));

            return (
              <g key={`${link.from}-${link.to}`}>
                <line
                  x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                  stroke={isOnPath ? "#3b82f6" : "var(--eng-border)"}
                  strokeWidth={isOnPath ? 3 : 1.5}
                  style={{ transition: "all 0.3s" }}
                />
                <text
                  x={(fromR.x + toR.x) / 2 + 8} y={(fromR.y + toR.y) / 2 - 8}
                  fontSize={10} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)" fontWeight={500}
                >
                  cost: {link.cost}
                </text>
              </g>
            );
          })}

          {/* Routers */}
          {ROUTERS.map((router) => {
            const isOnPath = packetPath.includes(router.id);
            const pathIdx = packetPath.indexOf(router.id);
            const isAnimated = animStep >= 0 && pathIdx >= 0 && pathIdx <= animStep;

            return (
              <g key={router.id}
                 onMouseEnter={() => setHoveredRouter(router.id)}
                 onMouseLeave={() => setHoveredRouter(null)}
                 style={{ cursor: "pointer" }}
              >
                <circle
                  cx={router.x} cy={router.y} r={isAnimated ? 26 : 22}
                  fill={isAnimated ? "#3b82f6" : isOnPath ? "#bfdbfe" : "var(--eng-surface)"}
                  stroke={isOnPath ? "#3b82f6" : "var(--eng-border)"}
                  strokeWidth={hoveredRouter === router.id ? 3 : 1.5}
                  style={{ transition: "all 0.3s" }}
                />
                <text x={router.x} y={router.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                  fill={isAnimated ? "#fff" : "var(--eng-text)"} fontFamily="var(--eng-font)">
                  {router.label}
                </text>
                {/* Packet indicator */}
                {isAnimated && pathIdx === animStep && (
                  <circle cx={router.x} cy={router.y - 30} r={6} fill="#f59e0b">
                    <animate attributeName="r" values="4;8;4" dur="0.6s" repeatCount="indefinite" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Network labels */}
          <text x={20} y={290} fontSize={10} fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={500}>10.0.0.0/8</text>
          <text x={240} y={30} fontSize={10} fill="#8b5cf6" fontFamily="var(--eng-font)" fontWeight={500}>172.16.0.0/16</text>
          <text x={440} y={290} fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={500}>192.168.0.0/24</text>
          <text x={240} y={310} fontSize={10} fill="#f59e0b" fontFamily="var(--eng-font)" fontWeight={500}>Internet (default)</text>
        </svg>
      </div>

      {/* Routing table tooltip */}
      {hovRouter && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16, borderLeft: "4px solid #3b82f6" }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            {hovRouter.label} Routing Table
          </h4>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                {["Destination", "Mask", "Next Hop", "Interface"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hovRouter.table.map((entry, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.dest}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.mask}</td>
                  <td style={{ padding: "6px 8px" }}>{entry.nextHop}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.iface}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Packet path result */}
      {packetPath.length > 0 && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16 }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
            Packet Path to {destIP}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
            {packetPath.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span className="tag-eng" style={{
                  background: i <= animStep ? "#3b82f6" : "var(--eng-border)",
                  color: i <= animStep ? "#fff" : "var(--eng-text-muted)",
                  transition: "all 0.3s",
                }}>
                  {r}
                </span>
                {i < packetPath.length - 1 && (
                  <span style={{ color: "var(--eng-text-muted)", fontSize: "0.8rem" }}>-&gt;</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 — Distance Vector vs Link State                              */
/* ================================================================== */

interface DVEntry {
  dest: string;
  cost: number;
  via: string;
}

function AlgorithmsTab() {
  const [algo, setAlgo] = useState<"dv" | "ls">("dv");
  const [round, setRound] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Distance Vector simulation state
  const [dvTables, setDvTables] = useState<Record<string, DVEntry[]>>(() => {
    const init: Record<string, DVEntry[]> = {};
    for (const r of ROUTERS) {
      init[r.id] = ROUTERS.map((dest) => ({
        dest: dest.id,
        cost: r.id === dest.id ? 0 : Infinity,
        via: r.id === dest.id ? "-" : "?",
      }));
      // Add direct neighbors
      for (const link of LINKS) {
        if (link.from === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.to);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.to; }
        } else if (link.to === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.from);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.from; }
        }
      }
    }
    return init;
  });

  const runDVRound = useCallback(() => {
    setDvTables((prev) => {
      const next: Record<string, DVEntry[]> = {};
      for (const r of ROUTERS) {
        next[r.id] = prev[r.id].map((entry) => ({ ...entry }));
      }

      for (const r of ROUTERS) {
        // Get neighbors
        const neighbors: { id: string; cost: number }[] = [];
        for (const link of LINKS) {
          if (link.from === r.id) neighbors.push({ id: link.to, cost: link.cost });
          else if (link.to === r.id) neighbors.push({ id: link.from, cost: link.cost });
        }

        for (const neighbor of neighbors) {
          const neighborTable = prev[neighbor.id];
          for (const nEntry of neighborTable) {
            if (nEntry.cost === Infinity) continue;
            const newCost = neighbor.cost + nEntry.cost;
            const existing = next[r.id].find((e) => e.dest === nEntry.dest);
            if (existing && newCost < existing.cost) {
              existing.cost = newCost;
              existing.via = neighbor.id;
            }
          }
        }
      }

      return next;
    });
    setRound((r) => r + 1);
  }, []);

  const handlePlay = useCallback(() => {
    if (isPlaying) {
      if (animRef.current) clearInterval(animRef.current);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    animRef.current = setInterval(() => {
      setRound((prev) => {
        if (prev >= 5) {
          if (animRef.current) clearInterval(animRef.current);
          setIsPlaying(false);
          return prev;
        }
        return prev; // actual increment done in runDVRound
      });
      runDVRound();
    }, 1200);
  }, [isPlaying, runDVRound]);

  const handleReset = useCallback(() => {
    if (animRef.current) clearInterval(animRef.current);
    setIsPlaying(false);
    setRound(0);
    const init: Record<string, DVEntry[]> = {};
    for (const r of ROUTERS) {
      init[r.id] = ROUTERS.map((dest) => ({
        dest: dest.id,
        cost: r.id === dest.id ? 0 : Infinity,
        via: r.id === dest.id ? "-" : "?",
      }));
      for (const link of LINKS) {
        if (link.from === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.to);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.to; }
        } else if (link.to === r.id) {
          const idx = init[r.id].findIndex((e) => e.dest === link.from);
          if (idx >= 0) { init[r.id][idx].cost = link.cost; init[r.id][idx].via = link.from; }
        }
      }
    }
    setDvTables(init);
  }, []);

  useEffect(() => {
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, []);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Compare Distance Vector (Bellman-Ford) and Link State (Dijkstra) routing algorithms. Watch routers exchange information and converge round by round.</span>
      </div>

      {/* Algorithm toggle */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className={algo === "dv" ? "btn-eng" : "btn-eng-outline"} onClick={() => setAlgo("dv")} style={{ fontSize: "0.85rem" }}>
          Distance Vector
        </button>
        <button className={algo === "ls" ? "btn-eng" : "btn-eng-outline"} onClick={() => setAlgo("ls")} style={{ fontSize: "0.85rem" }}>
          Link State
        </button>
      </div>

      {algo === "dv" ? (
        <>
          {/* DV Controls */}
          <div className="card-eng" style={{ padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
                Round {round}
              </span>
              <button className="btn-eng" onClick={runDVRound} style={{ fontSize: "0.8rem" }}>
                Step (1 Round)
              </button>
              <button className="btn-eng-outline" onClick={handlePlay} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                <Play className="w-3.5 h-3.5" /> {isPlaying ? "Pause" : "Auto Play"}
              </button>
              <button className="btn-eng-outline" onClick={handleReset} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* DV animation graph */}
          <div className="card-eng" style={{ padding: 20 }}>
            <svg viewBox="0 0 560 280" style={{ width: "100%", maxHeight: 280 }}>
              {/* Links with exchange arrows */}
              {LINKS.map((link) => {
                const fromR = getRouter(link.from)!;
                const toR = getRouter(link.to)!;
                return (
                  <g key={`${link.from}-${link.to}`}>
                    <line x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                      stroke="var(--eng-border)" strokeWidth={1.5} />
                    {round > 0 && (
                      <>
                        <circle r={4} fill="#f59e0b">
                          <animateMotion
                            path={`M${fromR.x},${fromR.y} L${toR.x},${toR.y}`}
                            dur="1s" repeatCount="indefinite"
                          />
                        </circle>
                        <circle r={4} fill="#8b5cf6">
                          <animateMotion
                            path={`M${toR.x},${toR.y} L${fromR.x},${fromR.y}`}
                            dur="1s" repeatCount="indefinite"
                          />
                        </circle>
                      </>
                    )}
                  </g>
                );
              })}
              {ROUTERS.map((router) => (
                <g key={router.id}>
                  <circle cx={router.x} cy={router.y} r={22} fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth={2} />
                  <text x={router.x} y={router.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                    fill="var(--eng-text)" fontFamily="var(--eng-font)">
                    {router.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* DV Tables */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {ROUTERS.map((router) => (
              <div key={router.id} className="card-eng" style={{ padding: 12 }}>
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700, color: "var(--eng-text)", marginBottom: 8 }}>
                  {router.label} Distance Vector
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.75rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1.5px solid var(--eng-border)" }}>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "var(--eng-text-muted)" }}>Dest</th>
                      <th style={{ padding: "4px 6px", textAlign: "center", color: "var(--eng-text-muted)" }}>Cost</th>
                      <th style={{ padding: "4px 6px", textAlign: "left", color: "var(--eng-text-muted)" }}>Via</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dvTables[router.id]?.map((entry) => (
                      <tr key={entry.dest} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                        <td style={{ padding: "4px 6px", fontWeight: 500 }}>{entry.dest}</td>
                        <td style={{ padding: "4px 6px", textAlign: "center", color: entry.cost === Infinity ? "var(--eng-danger)" : "var(--eng-success)", fontWeight: 600 }}>
                          {entry.cost === Infinity ? "INF" : entry.cost}
                        </td>
                        <td style={{ padding: "4px 6px" }}>{entry.via}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Link State comparison view */
        <div className="card-eng" style={{ padding: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#3b82f6", margin: "0 0 12px" }}>
                Distance Vector
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
                {[
                  { label: "Algorithm", value: "Bellman-Ford" },
                  { label: "Knowledge", value: "Neighbors only" },
                  { label: "Shares", value: "Full routing table" },
                  { label: "Convergence", value: "Slow (may loop)" },
                  { label: "Complexity", value: "O(V * E)" },
                  { label: "Problem", value: "Count-to-infinity" },
                  { label: "Example", value: "RIP" },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 8, borderRadius: 6, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
                    <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem" }}>{item.label}: </span>
                    <span style={{ color: "var(--eng-text)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#8b5cf6", margin: "0 0 12px" }}>
                Link State
              </h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
                {[
                  { label: "Algorithm", value: "Dijkstra" },
                  { label: "Knowledge", value: "Entire topology" },
                  { label: "Shares", value: "Link state info only" },
                  { label: "Convergence", value: "Fast (no loops)" },
                  { label: "Complexity", value: "O(V^2) or O(V log V)" },
                  { label: "Problem", value: "High memory/CPU" },
                  { label: "Example", value: "OSPF, IS-IS" },
                ].map((item) => (
                  <div key={item.label} style={{ padding: 8, borderRadius: 6, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
                    <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem" }}>{item.label}: </span>
                    <span style={{ color: "var(--eng-text)", fontWeight: 500 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SVG comparison */}
          <div style={{ marginTop: 20 }}>
            <svg viewBox="0 0 560 120" style={{ width: "100%" }}>
              {/* DV side */}
              <text x={140} y={15} textAnchor="middle" fontSize={10} fontWeight={600} fill="#3b82f6" fontFamily="var(--eng-font)">Distance Vector: Share table with neighbors</text>
              <rect x={40} y={25} width={40} height={30} rx={4} fill="#3b82f6" opacity={0.8} />
              <text x={60} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R1</text>
              <line x1={82} y1={40} x2={118} y2={40} stroke="#3b82f6" strokeWidth={1.5} markerEnd="url(#arrowDV)" />
              <rect x={120} y={25} width={40} height={30} rx={4} fill="#3b82f6" opacity={0.8} />
              <text x={140} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R2</text>
              <text x={100} y={68} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">[full table]</text>

              {/* LS side */}
              <text x={420} y={15} textAnchor="middle" fontSize={10} fontWeight={600} fill="#8b5cf6" fontFamily="var(--eng-font)">Link State: Flood link info to all</text>
              {[320, 370, 420, 470].map((x, i) => (
                <g key={i}>
                  <rect x={x} y={25} width={40} height={30} rx={4} fill="#8b5cf6" opacity={0.8} />
                  <text x={x + 20} y={44} textAnchor="middle" fontSize={9} fill="#fff" fontFamily="var(--eng-font)" fontWeight={600}>R{i + 1}</text>
                </g>
              ))}
              {/* Flood lines */}
              {[[340, 390], [340, 440], [340, 490], [390, 440], [390, 490], [440, 490]].map(([x1, x2], i) => (
                <line key={i} x1={x1} y1={57} x2={x2} y2={57} stroke="#8b5cf6" strokeWidth={0.8} opacity={0.5} />
              ))}
              <text x={420} y={80} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">[everyone knows topology]</text>

              <defs>
                <marker id="arrowDV" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                  <path d="M0,0 L6,2 L0,4" fill="#3b82f6" />
                </marker>
              </defs>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 — Practice: Edit Routing Tables                              */
/* ================================================================== */

function PracticeTab() {
  const [editableTable, setEditableTable] = useState([
    { dest: "10.0.0.0/8", nextHop: "R2", interface: "eth1" },
    { dest: "172.16.0.0/16", nextHop: "", interface: "" },
    { dest: "192.168.0.0/24", nextHop: "", interface: "" },
    { dest: "0.0.0.0/0", nextHop: "", interface: "" },
  ]);
  const [packetDest, setPacketDest] = useState("192.168.0.5");
  const [traceResult, setTraceResult] = useState<string>("");

  const handleTableChange = useCallback((idx: number, field: "nextHop" | "interface", value: string) => {
    setEditableTable((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  }, []);

  const handleTrace = useCallback(() => {
    // Simple matching
    let matchedEntry: typeof editableTable[0] | null = null;
    let bestLen = -1;

    for (const entry of editableTable) {
      const parts = entry.dest.split("/");
      const prefix = parseInt(parts[1], 10);
      if (prefix > bestLen && packetDest.startsWith(parts[0].split(".").slice(0, Math.ceil(prefix / 8)).join("."))) {
        matchedEntry = entry;
        bestLen = prefix;
      }
    }

    if (!matchedEntry) {
      // Try default
      matchedEntry = editableTable.find((e) => e.dest === "0.0.0.0/0") || null;
    }

    if (matchedEntry && matchedEntry.nextHop) {
      setTraceResult(`Packet to ${packetDest} matched "${matchedEntry.dest}" -> forwarded to ${matchedEntry.nextHop} via ${matchedEntry.interface || "?"}`);
    } else {
      setTraceResult("No matching route found or next hop is empty. Fill in the routing table entries!");
    }
  }, [editableTable, packetDest]);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Complete the routing table for R1 by filling in the next hop and interface fields. Then trace packets to see which route is matched.</span>
      </div>

      {/* Editable routing table */}
      <div className="card-eng" style={{ padding: 20, overflowX: "auto" }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          R1 Routing Table (Edit next hop and interface)
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              {["Destination", "Next Hop", "Interface"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.8rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editableTable.map((entry, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                <td style={{ padding: "8px 10px", fontFamily: "monospace", fontWeight: 500 }}>{entry.dest}</td>
                <td style={{ padding: "8px 10px" }}>
                  <input
                    type="text" value={entry.nextHop}
                    onChange={(e) => handleTableChange(i, "nextHop", e.target.value)}
                    placeholder="e.g. R2"
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 100, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
                  />
                </td>
                <td style={{ padding: "8px 10px" }}>
                  <input
                    type="text" value={entry.interface}
                    onChange={(e) => handleTableChange(i, "interface", e.target.value)}
                    placeholder="e.g. eth0"
                    style={{ padding: "4px 8px", borderRadius: 4, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 100, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Packet trace */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Trace a Packet
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text" value={packetDest} onChange={(e) => setPacketDest(e.target.value)}
            placeholder="Destination IP"
            style={{ flex: 1, minWidth: 160, padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
          />
          <button className="btn-eng" onClick={handleTrace} style={{ fontSize: "0.85rem" }}>Trace</button>
        </div>
        {traceResult && (
          <div className="eng-fadeIn" style={{
            marginTop: 12, padding: 12, borderRadius: 8,
            background: traceResult.includes("No matching") ? "rgba(239,68,68,0.08)" : "rgba(16,185,129,0.08)",
            border: `1px solid ${traceResult.includes("No matching") ? "var(--eng-danger)" : "var(--eng-success)"}`,
            fontFamily: "var(--eng-font)", fontSize: "0.85rem",
            color: traceResult.includes("No matching") ? "var(--eng-danger)" : "var(--eng-success)",
          }}>
            {traceResult}
          </div>
        )}
      </div>

      {/* Reference topology */}
      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
          Network Topology Reference
        </p>
        <svg viewBox="0 0 500 200" style={{ width: "100%", maxHeight: 200 }}>
          {/* Simple topology for reference */}
          {LINKS.map((link) => {
            const fromR = getRouter(link.from)!;
            const toR = getRouter(link.to)!;
            return (
              <line key={`${link.from}-${link.to}`} x1={fromR.x} y1={fromR.y} x2={toR.x} y2={toR.y}
                stroke="var(--eng-border)" strokeWidth={1.5} />
            );
          })}
          {ROUTERS.map((r) => (
            <g key={r.id}>
              <circle cx={r.x} cy={r.y} r={18} fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth={1.5} />
              <text x={r.x} y={r.y + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">{r.label}</text>
            </g>
          ))}
          <text x={20} y={200} fontSize={8} fill="#3b82f6" fontFamily="var(--eng-font)">10.0.0.0/8</text>
          <text x={240} y={15} fontSize={8} fill="#8b5cf6" fontFamily="var(--eng-font)">172.16.0.0/16</text>
          <text x={420} y={200} fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">192.168.0.0/24</text>
        </svg>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What does 'longest prefix match' mean in IP routing?",
    options: [
      "Match the route with the longest destination address",
      "Match the route with the most specific (longest) subnet mask",
      "Match the route that was added first",
      "Match the route with the longest path",
    ],
    correctIndex: 1,
    explanation: "Longest prefix match selects the routing entry with the most specific (longest) matching subnet prefix, providing the most accurate route.",
  },
  {
    question: "In Distance Vector routing, each router shares its routing table with:",
    options: ["All routers in the network", "Only its direct neighbors", "The central controller", "Only the destination router"],
    correctIndex: 1,
    explanation: "In Distance Vector routing (like RIP), each router shares its entire routing table only with its directly connected neighbors.",
  },
  {
    question: "Which routing algorithm uses Dijkstra's algorithm?",
    options: ["RIP", "OSPF", "BGP", "Static routing"],
    correctIndex: 1,
    explanation: "OSPF (Open Shortest Path First) is a link-state protocol that uses Dijkstra's shortest path algorithm.",
  },
  {
    question: "What is the 'count to infinity' problem associated with?",
    options: ["Link State routing", "Distance Vector routing", "Static routing", "Default routing"],
    correctIndex: 1,
    explanation: "The count-to-infinity problem occurs in Distance Vector routing when routers slowly increment the metric for an unreachable destination.",
  },
  {
    question: "Given a routing table with entries for 10.0.0.0/8 and 10.1.0.0/16, a packet to 10.1.5.3 will match:",
    options: ["10.0.0.0/8", "10.1.0.0/16", "Both equally", "Neither"],
    correctIndex: 1,
    explanation: "10.1.0.0/16 is a longer prefix match (more specific) than 10.0.0.0/8, so it takes priority.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "routing", label: "Routing", icon: <Server className="w-4 h-4" />, content: <RoutingTab /> },
  { id: "algorithms", label: "Algorithms", icon: <GitBranch className="w-4 h-4" />, content: <AlgorithmsTab /> },
  { id: "practice", label: "Practice", icon: <Target className="w-4 h-4" />, content: <PracticeTab /> },
];

export default function CN_L3_IPRoutingActivity() {
  return (
    <EngineeringLessonShell
      title="IP Routing & Forwarding"
      level={3}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="IPv6 Basics"
      gateRelevance="3-4 marks"
      placementRelevance="Medium"
    />
  );
}
