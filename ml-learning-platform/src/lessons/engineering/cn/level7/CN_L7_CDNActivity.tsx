"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Globe, Server, Zap, Clock, MapPin, ArrowRight, BarChart3, RefreshCw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Shared data                                                        */
/* ------------------------------------------------------------------ */

interface ServerNode {
  id: string;
  x: number;
  y: number;
  label: string;
  region: string;
}

interface UserNode {
  id: string;
  x: number;
  y: number;
  label: string;
  region: string;
}

const ORIGIN: ServerNode = { id: "origin", x: 360, y: 120, label: "Origin Server", region: "US East" };

const EDGE_SERVERS: ServerNode[] = [
  { id: "edge-eu", x: 420, y: 80, label: "Edge EU", region: "Europe" },
  { id: "edge-asia", x: 590, y: 130, label: "Edge Asia", region: "Asia" },
  { id: "edge-sa", x: 280, y: 230, label: "Edge SA", region: "South America" },
  { id: "edge-af", x: 440, y: 200, label: "Edge Africa", region: "Africa" },
  { id: "edge-oc", x: 620, y: 230, label: "Edge Oceania", region: "Oceania" },
  { id: "edge-usw", x: 180, y: 110, label: "Edge US West", region: "US West" },
];

const USERS: UserNode[] = [
  { id: "user-london", x: 410, y: 60, label: "London", region: "Europe" },
  { id: "user-tokyo", x: 620, y: 100, label: "Tokyo", region: "Asia" },
  { id: "user-sydney", x: 650, y: 250, label: "Sydney", region: "Oceania" },
  { id: "user-brazil", x: 260, y: 250, label: "Sao Paulo", region: "South America" },
  { id: "user-la", x: 150, y: 130, label: "Los Angeles", region: "US West" },
  { id: "user-lagos", x: 420, y: 210, label: "Lagos", region: "Africa" },
];

function distance(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function latencyFromDist(dist: number): number {
  return Math.round(dist * 0.8 + 20);
}

/* ------------------------------------------------------------------ */
/*  World Map SVG backdrop                                             */
/* ------------------------------------------------------------------ */

function WorldMapBg() {
  return (
    <g opacity={0.12}>
      {/* Simplified continent outlines */}
      {/* North America */}
      <path d="M100,70 Q130,50 180,55 Q220,60 240,80 Q250,100 230,120 Q210,140 180,150 Q150,150 120,140 Q100,120 95,100 Z" fill="var(--eng-primary)" />
      {/* South America */}
      <path d="M230,180 Q260,170 280,190 Q290,220 280,260 Q260,280 240,270 Q220,250 220,220 Q215,200 230,180 Z" fill="var(--eng-primary)" />
      {/* Europe */}
      <path d="M380,50 Q410,40 440,50 Q460,65 450,80 Q435,90 410,85 Q390,80 380,65 Z" fill="var(--eng-primary)" />
      {/* Africa */}
      <path d="M400,120 Q430,110 460,130 Q470,170 460,210 Q440,240 420,230 Q400,210 390,180 Q385,150 400,120 Z" fill="var(--eng-primary)" />
      {/* Asia */}
      <path d="M480,50 Q530,40 580,55 Q620,70 640,100 Q650,130 630,150 Q600,160 560,150 Q520,140 500,120 Q480,100 470,75 Z" fill="var(--eng-primary)" />
      {/* Oceania */}
      <path d="M600,210 Q630,200 660,215 Q670,235 650,255 Q625,260 605,250 Q590,235 600,210 Z" fill="var(--eng-primary)" />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — The Problem (no CDN)                                       */
/* ------------------------------------------------------------------ */

function ProblemTab() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState<"idle" | "request" | "response">("idle");
  const [latency, setLatency] = useState<number | null>(null);
  const [latencyCounter, setLatencyCounter] = useState(0);
  const counterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleUserClick = useCallback((userId: string) => {
    if (animPhase !== "idle") return;
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUser(userId);
    setAnimPhase("request");
    setLatencyCounter(0);

    const dist = distance(user.x, user.y, ORIGIN.x, ORIGIN.y);
    const lat = latencyFromDist(dist);

    // Counter animation
    counterRef.current = setInterval(() => {
      setLatencyCounter((c) => Math.min(c + 3, lat));
    }, 20);

    setTimeout(() => {
      setAnimPhase("response");
      setTimeout(() => {
        setLatency(lat);
        if (counterRef.current) clearInterval(counterRef.current);
        setLatencyCounter(lat);
        setTimeout(() => {
          setAnimPhase("idle");
        }, 2000);
      }, lat * 4);
    }, lat * 4);
  }, [animPhase]);

  useEffect(() => {
    return () => {
      if (counterRef.current) clearInterval(counterRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>The Problem:</strong> With a single origin server, users far away experience high latency.
        A request from Sydney to a server in the US East coast must travel across the entire globe and back.
        Click on a user to see the request path and latency!
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            Single Origin Server
          </h3>
          {latencyCounter > 0 && (
            <div className="tag-eng eng-fadeIn" style={{ background: "rgba(239,68,68,0.1)", color: "var(--eng-danger)", fontSize: "0.85rem", fontWeight: 700 }}>
              <Clock className="w-3.5 h-3.5" style={{ marginRight: 4 }} />
              {latencyCounter} ms
            </div>
          )}
        </div>

        <svg viewBox="0 0 740 300" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          <WorldMapBg />

          {/* Origin server */}
          <g>
            <rect x={ORIGIN.x - 28} y={ORIGIN.y - 16} width={56} height={32} rx={6} fill="var(--eng-primary)" stroke="var(--eng-primary)" strokeWidth={2} />
            <text x={ORIGIN.x} y={ORIGIN.y + 2} textAnchor="middle" fontSize="8" fill="#fff" fontWeight={700} fontFamily="var(--eng-font)">
              Origin
            </text>
            <text x={ORIGIN.x} y={ORIGIN.y + 12} textAnchor="middle" fontSize="6" fill="#dbeafe" fontFamily="var(--eng-font)">
              US East
            </text>
          </g>

          {/* Animated request/response paths */}
          {selectedUser && animPhase !== "idle" && (() => {
            const user = USERS.find((u) => u.id === selectedUser)!;
            return (
              <g>
                {/* Path line */}
                <line
                  x1={user.x} y1={user.y} x2={ORIGIN.x} y2={ORIGIN.y}
                  stroke={animPhase === "request" ? "var(--eng-warning)" : "var(--eng-success)"}
                  strokeWidth={2}
                  strokeDasharray="6,3"
                >
                  <animate attributeName="strokeDashoffset" from="0" to="-18" dur="0.5s" repeatCount="indefinite" />
                </line>
                {/* Animated packet */}
                <circle r="5" fill={animPhase === "request" ? "var(--eng-warning)" : "var(--eng-success)"}>
                  {animPhase === "request" ? (
                    <animateMotion
                      path={`M${user.x},${user.y} L${ORIGIN.x},${ORIGIN.y}`}
                      dur="1.5s" repeatCount="indefinite"
                    />
                  ) : (
                    <animateMotion
                      path={`M${ORIGIN.x},${ORIGIN.y} L${user.x},${user.y}`}
                      dur="1.5s" repeatCount="indefinite"
                    />
                  )}
                </circle>
              </g>
            );
          })()}

          {/* Users */}
          {USERS.map((user) => {
            const isSelected = selectedUser === user.id;
            return (
              <g
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                style={{ cursor: animPhase === "idle" ? "pointer" : "default" }}
              >
                <circle
                  cx={user.x} cy={user.y} r={12}
                  fill={isSelected ? "#fef3c7" : "var(--eng-surface)"}
                  stroke={isSelected ? "#f59e0b" : "var(--eng-border)"}
                  strokeWidth={2}
                />
                <text x={user.x} y={user.y + 3} textAnchor="middle" fontSize="7" fill="var(--eng-text)" fontWeight={600}>
                  U
                </text>
                <text x={user.x} y={user.y + 24} textAnchor="middle" fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {user.label}
                </text>
              </g>
            );
          })}

          <text x={370} y={290} textAnchor="middle" fontSize="10" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            Click a user to see the long journey to the single origin server
          </text>
        </svg>
      </div>

      {latency && (
        <div className="card-eng eng-fadeIn" style={{ padding: 14, borderLeft: "3px solid var(--eng-danger)" }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", margin: 0 }}>
            <strong>Result:</strong> The user in <strong>{USERS.find((u) => u.id === selectedUser)?.label}</strong> experienced
            a round-trip latency of <strong style={{ color: "var(--eng-danger)" }}>{latency} ms</strong>.
            The further the user is from the origin, the worse the experience.
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — CDN (edge servers + caching)                               */
/* ------------------------------------------------------------------ */

function CDNTab() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "dns" | "edge-check" | "cache-hit" | "cache-miss-fetch" | "cache-miss-serve">("idle");
  const [nearestEdge, setNearestEdge] = useState<ServerNode | null>(null);
  const [cacheHit, setCacheHit] = useState(true);
  const [edgeCaches, setEdgeCaches] = useState<Set<string>>(new Set(["edge-eu", "edge-usw"]));
  const [cdnLatency, setCdnLatency] = useState<number | null>(null);
  const [noCdnLatency, setNoCdnLatency] = useState<number | null>(null);

  const findNearestEdge = (user: UserNode): ServerNode => {
    let nearest = EDGE_SERVERS[0];
    let minDist = Infinity;
    for (const edge of EDGE_SERVERS) {
      const d = distance(user.x, user.y, edge.x, edge.y);
      if (d < minDist) { minDist = d; nearest = edge; }
    }
    return nearest;
  };

  const handleUserClick = useCallback((userId: string) => {
    if (phase !== "idle") return;
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;

    setSelectedUser(userId);
    const edge = findNearestEdge(user);
    setNearestEdge(edge);
    const hit = edgeCaches.has(edge.id);
    setCacheHit(hit);

    const distToOrigin = distance(user.x, user.y, ORIGIN.x, ORIGIN.y);
    const distToEdge = distance(user.x, user.y, edge.x, edge.y);
    setNoCdnLatency(latencyFromDist(distToOrigin));

    setPhase("dns");
    setTimeout(() => {
      setPhase("edge-check");
      setTimeout(() => {
        if (hit) {
          setPhase("cache-hit");
          setCdnLatency(latencyFromDist(distToEdge));
          setTimeout(() => setPhase("idle"), 2500);
        } else {
          setPhase("cache-miss-fetch");
          setTimeout(() => {
            setEdgeCaches((prev) => new Set([...prev, edge.id]));
            setPhase("cache-miss-serve");
            setCdnLatency(latencyFromDist(distToEdge) + latencyFromDist(distance(edge.x, edge.y, ORIGIN.x, ORIGIN.y)) * 0.5);
            setTimeout(() => setPhase("idle"), 2500);
          }, 1500);
        }
      }, 800);
    }, 800);
  }, [phase, edgeCaches]);

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>CDN Architecture:</strong> Edge servers are placed near users worldwide.
        DNS routes users to the nearest edge. If cached (hit), content is served instantly.
        If not cached (miss), the edge fetches from origin, caches it, then serves the user.
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            CDN with Edge Servers
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {phase !== "idle" && (
              <span className="tag-eng eng-fadeIn" style={{
                background: phase === "dns" ? "rgba(139,92,246,0.1)" :
                  phase === "cache-hit" ? "rgba(16,185,129,0.1)" :
                  phase.startsWith("cache-miss") ? "rgba(245,158,11,0.1)" : "rgba(59,130,246,0.1)",
                color: phase === "dns" ? "#8b5cf6" :
                  phase === "cache-hit" ? "var(--eng-success)" :
                  phase.startsWith("cache-miss") ? "#b45309" : "var(--eng-primary)",
                fontSize: "0.8rem",
              }}>
                {phase === "dns" && "DNS Resolution..."}
                {phase === "edge-check" && "Checking edge cache..."}
                {phase === "cache-hit" && "Cache HIT! Fast serve"}
                {phase === "cache-miss-fetch" && "Cache MISS - Fetching from origin..."}
                {phase === "cache-miss-serve" && "Cached & served!"}
              </span>
            )}
            <button
              className="btn-eng-outline"
              onClick={() => { setEdgeCaches(new Set(["edge-eu", "edge-usw"])); setCdnLatency(null); setNoCdnLatency(null); }}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >
              <RefreshCw className="w-3 h-3" style={{ marginRight: 3 }} /> Reset Caches
            </button>
          </div>
        </div>

        <svg viewBox="0 0 740 300" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          <WorldMapBg />

          {/* Origin server */}
          <g>
            <rect x={ORIGIN.x - 28} y={ORIGIN.y - 16} width={56} height={32} rx={6} fill="var(--eng-primary)" stroke="var(--eng-primary)" strokeWidth={2} />
            <text x={ORIGIN.x} y={ORIGIN.y + 2} textAnchor="middle" fontSize="8" fill="#fff" fontWeight={700} fontFamily="var(--eng-font)">Origin</text>
            <text x={ORIGIN.x} y={ORIGIN.y + 12} textAnchor="middle" fontSize="6" fill="#dbeafe" fontFamily="var(--eng-font)">US East</text>
          </g>

          {/* Edge servers */}
          {EDGE_SERVERS.map((edge) => {
            const isCached = edgeCaches.has(edge.id);
            const isNearest = nearestEdge?.id === edge.id && phase !== "idle";
            return (
              <g key={edge.id}>
                <rect
                  x={edge.x - 22} y={edge.y - 12} width={44} height={24} rx={5}
                  fill={isNearest ? (cacheHit ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)") : "var(--eng-surface)"}
                  stroke={isNearest ? (cacheHit ? "var(--eng-success)" : "#f59e0b") : "var(--eng-border)"}
                  strokeWidth={isNearest ? 2 : 1}
                >
                  {isNearest && (
                    <animate attributeName="strokeWidth" values="2;3;2" dur="0.8s" repeatCount="indefinite" />
                  )}
                </rect>
                <text x={edge.x} y={edge.y + 2} textAnchor="middle" fontSize="6" fill="var(--eng-text)" fontWeight={600} fontFamily="var(--eng-font)">
                  {edge.region}
                </text>
                {isCached && (
                  <circle cx={edge.x + 20} cy={edge.y - 10} r={4} fill="var(--eng-success)">
                    <title>Cached</title>
                  </circle>
                )}
              </g>
            );
          })}

          {/* Cache miss: fetch from origin to edge */}
          {nearestEdge && (phase === "cache-miss-fetch" || phase === "cache-miss-serve") && (
            <g>
              <line
                x1={nearestEdge.x} y1={nearestEdge.y} x2={ORIGIN.x} y2={ORIGIN.y}
                stroke="#f59e0b" strokeWidth={2} strokeDasharray="5,3"
              >
                <animate attributeName="strokeDashoffset" from="0" to="-16" dur="0.6s" repeatCount="indefinite" />
              </line>
              <circle r="4" fill="#f59e0b">
                <animateMotion
                  path={phase === "cache-miss-fetch"
                    ? `M${nearestEdge.x},${nearestEdge.y} L${ORIGIN.x},${ORIGIN.y}`
                    : `M${ORIGIN.x},${ORIGIN.y} L${nearestEdge.x},${nearestEdge.y}`}
                  dur="1s" repeatCount="indefinite"
                />
              </circle>
            </g>
          )}

          {/* User to edge line */}
          {selectedUser && nearestEdge && phase !== "idle" && phase !== "dns" && (
            <g>
              <line
                x1={USERS.find((u) => u.id === selectedUser)!.x}
                y1={USERS.find((u) => u.id === selectedUser)!.y}
                x2={nearestEdge.x}
                y2={nearestEdge.y}
                stroke="var(--eng-success)" strokeWidth={2} strokeDasharray="5,3"
              >
                <animate attributeName="strokeDashoffset" from="0" to="-16" dur="0.5s" repeatCount="indefinite" />
              </line>
            </g>
          )}

          {/* Users */}
          {USERS.map((user) => {
            const isSelected = selectedUser === user.id;
            return (
              <g
                key={user.id}
                onClick={() => handleUserClick(user.id)}
                style={{ cursor: phase === "idle" ? "pointer" : "default" }}
              >
                <circle
                  cx={user.x} cy={user.y} r={12}
                  fill={isSelected ? "#fef3c7" : "var(--eng-surface)"}
                  stroke={isSelected ? "#f59e0b" : "var(--eng-border)"}
                  strokeWidth={2}
                />
                <text x={user.x} y={user.y + 3} textAnchor="middle" fontSize="7" fill="var(--eng-text)" fontWeight={600}>U</text>
                <text x={user.x} y={user.y + 24} textAnchor="middle" fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {user.label}
                </text>
              </g>
            );
          })}

          {/* Legend */}
          <g>
            <circle cx={25} cy={276} r={4} fill="var(--eng-success)" />
            <text x={35} y={279} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">= Cached</text>
            <rect x={80} y={272} width={16} height={8} rx={2} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
            <text x={102} y={279} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">= Edge Server</text>
          </g>
        </svg>
      </div>

      {/* Latency comparison */}
      {cdnLatency && noCdnLatency && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
            Latency Comparison
          </h4>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>Without CDN</div>
              <div style={{ height: 24, background: "#fecaca", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                <div style={{ width: "100%", height: "100%", background: "var(--eng-danger)", borderRadius: 4 }} />
                <span style={{ position: "absolute", top: 4, right: 8, fontSize: "0.75rem", fontWeight: 700, color: "#fff" }}>{noCdnLatency} ms</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 160 }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>With CDN {cacheHit ? "(cache hit)" : "(cache miss)"}</div>
              <div style={{ height: 24, background: "#d1fae5", borderRadius: 4, position: "relative", overflow: "hidden" }}>
                <div style={{ width: `${(cdnLatency / noCdnLatency) * 100}%`, height: "100%", background: "var(--eng-success)", borderRadius: 4, transition: "width 0.5s ease" }} />
                <span style={{ position: "absolute", top: 4, right: 8, fontSize: "0.75rem", fontWeight: 700, color: "#065f46" }}>{Math.round(cdnLatency)} ms</span>
              </div>
            </div>
          </div>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-success)", marginTop: 8, fontWeight: 600 }}>
            CDN saved {Math.round(((noCdnLatency - cdnLatency) / noCdnLatency) * 100)}% latency!
          </p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Explore (interactive multi-user)                           */
/* ------------------------------------------------------------------ */

function ExploreTab() {
  const [results, setResults] = useState<{ user: string; withCdn: number; withoutCdn: number; edge: string }[]>([]);
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  const handleUserClick = (userId: string) => {
    const user = USERS.find((u) => u.id === userId);
    if (!user) return;

    setActiveUser(userId);

    const distToOrigin = distance(user.x, user.y, ORIGIN.x, ORIGIN.y);
    let nearestEdge = EDGE_SERVERS[0];
    let minDist = Infinity;
    for (const edge of EDGE_SERVERS) {
      const d = distance(user.x, user.y, edge.x, edge.y);
      if (d < minDist) { minDist = d; nearestEdge = edge; }
    }

    const withoutCdn = latencyFromDist(distToOrigin);
    const withCdn = latencyFromDist(minDist);

    setResults((prev) => {
      const existing = prev.findIndex((r) => r.user === userId);
      const entry = { user: userId, withCdn, withoutCdn, edge: nearestEdge.region };
      if (existing >= 0) {
        const copy = [...prev];
        copy[existing] = entry;
        return copy;
      }
      return [...prev, entry];
    });
  };

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Explore CDN Performance:</strong> Click on different user locations to see which edge server
        they get routed to and compare latency savings. Try all locations!
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox="0 0 740 300" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          <WorldMapBg />

          {/* Origin */}
          <g>
            <rect x={ORIGIN.x - 28} y={ORIGIN.y - 16} width={56} height={32} rx={6} fill="var(--eng-primary)" stroke="var(--eng-primary)" strokeWidth={2} />
            <text x={ORIGIN.x} y={ORIGIN.y + 2} textAnchor="middle" fontSize="8" fill="#fff" fontWeight={700} fontFamily="var(--eng-font)">Origin</text>
          </g>

          {/* Edge servers */}
          {EDGE_SERVERS.map((edge) => {
            const isActive = activeUser && (() => {
              const user = USERS.find((u) => u.id === activeUser);
              if (!user) return false;
              let nearest = EDGE_SERVERS[0];
              let minD = Infinity;
              for (const e of EDGE_SERVERS) {
                const d = distance(user.x, user.y, e.x, e.y);
                if (d < minD) { minD = d; nearest = e; }
              }
              return nearest.id === edge.id;
            })();

            return (
              <g key={edge.id}>
                <rect
                  x={edge.x - 22} y={edge.y - 12} width={44} height={24} rx={5}
                  fill={isActive ? "rgba(16,185,129,0.15)" : "var(--eng-surface)"}
                  stroke={isActive ? "var(--eng-success)" : "var(--eng-border)"}
                  strokeWidth={isActive ? 2.5 : 1}
                />
                <text x={edge.x} y={edge.y + 2} textAnchor="middle" fontSize="6" fill="var(--eng-text)" fontWeight={600} fontFamily="var(--eng-font)">
                  {edge.region}
                </text>
              </g>
            );
          })}

          {/* Active user to edge line */}
          {activeUser && (() => {
            const user = USERS.find((u) => u.id === activeUser);
            if (!user) return null;
            let nearest = EDGE_SERVERS[0];
            let minD = Infinity;
            for (const e of EDGE_SERVERS) {
              const d = distance(user.x, user.y, e.x, e.y);
              if (d < minD) { minD = d; nearest = e; }
            }
            return (
              <g>
                <line x1={user.x} y1={user.y} x2={nearest.x} y2={nearest.y} stroke="var(--eng-success)" strokeWidth={2} strokeDasharray="5,3">
                  <animate attributeName="strokeDashoffset" from="0" to="-16" dur="0.6s" repeatCount="indefinite" />
                </line>
                <line x1={user.x} y1={user.y} x2={ORIGIN.x} y2={ORIGIN.y} stroke="var(--eng-danger)" strokeWidth={1} strokeDasharray="4,4" opacity={0.4} />
              </g>
            );
          })()}

          {/* Users */}
          {USERS.map((user) => {
            const isActive = activeUser === user.id;
            const hasResult = results.some((r) => r.user === user.id);
            return (
              <g key={user.id} onClick={() => handleUserClick(user.id)} style={{ cursor: "pointer" }}>
                <circle
                  cx={user.x} cy={user.y} r={14}
                  fill={isActive ? "#fef3c7" : hasResult ? "rgba(16,185,129,0.1)" : "var(--eng-surface)"}
                  stroke={isActive ? "#f59e0b" : hasResult ? "var(--eng-success)" : "var(--eng-border)"}
                  strokeWidth={2}
                />
                <text x={user.x} y={user.y + 3} textAnchor="middle" fontSize="7" fill="var(--eng-text)" fontWeight={600}>U</text>
                <text x={user.x} y={user.y + 28} textAnchor="middle" fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {user.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Results table */}
      {results.length > 0 && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: 0 }}>
              <BarChart3 className="w-4 h-4" style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: "var(--eng-primary)" }} />
              Latency Results ({results.length}/{USERS.length} locations tested)
            </h4>
            <button
              className="btn-eng-outline"
              onClick={() => setShowComparison(!showComparison)}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >
              {showComparison ? "Hide" : "Show"} Graph
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", fontFamily: "var(--eng-font)", fontSize: "0.8rem", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--eng-text-muted)" }}>User Location</th>
                  <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--eng-text-muted)" }}>Nearest Edge</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--eng-danger)" }}>No CDN</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--eng-success)" }}>With CDN</th>
                  <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--eng-primary)" }}>Savings</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const user = USERS.find((u) => u.id === r.user)!;
                  const savings = Math.round(((r.withoutCdn - r.withCdn) / r.withoutCdn) * 100);
                  return (
                    <tr key={r.user} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                      <td style={{ padding: "6px 8px", fontWeight: 600 }}>{user.label}</td>
                      <td style={{ padding: "6px 8px" }}>{r.edge}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--eng-danger)" }}>{r.withoutCdn} ms</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--eng-success)" }}>{r.withCdn} ms</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--eng-primary)", fontWeight: 700 }}>{savings}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Visual bar chart comparison */}
          {showComparison && (
            <div className="eng-fadeIn" style={{ marginTop: 16 }}>
              {results.map((r) => {
                const user = USERS.find((u) => u.id === r.user)!;
                const maxLat = Math.max(...results.map((x) => x.withoutCdn));
                return (
                  <div key={r.user} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
                      {user.label}
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <div style={{ width: 60, fontSize: "0.65rem", color: "var(--eng-danger)" }}>No CDN</div>
                      <div style={{ flex: 1, height: 12, background: "#fee2e2", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${(r.withoutCdn / maxLat) * 100}%`, height: "100%", background: "var(--eng-danger)", borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", width: 45, textAlign: "right" }}>{r.withoutCdn}ms</span>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center", marginTop: 2 }}>
                      <div style={{ width: 60, fontSize: "0.65rem", color: "var(--eng-success)" }}>CDN</div>
                      <div style={{ flex: 1, height: 12, background: "#d1fae5", borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: `${(r.withCdn / maxLat) * 100}%`, height: "100%", background: "var(--eng-success)", borderRadius: 3, transition: "width 0.5s" }} />
                      </div>
                      <span style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)", width: 45, textAlign: "right" }}>{r.withCdn}ms</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the main purpose of a Content Delivery Network (CDN)?",
    options: [
      "To replace the origin server entirely",
      "To reduce latency by serving content from servers closer to users",
      "To encrypt all network traffic",
      "To block malicious users",
    ],
    correctIndex: 1,
    explanation: "CDNs place edge servers around the world so users can get content from a nearby server instead of the distant origin, dramatically reducing latency.",
  },
  {
    question: "What happens during a CDN cache hit?",
    options: [
      "The edge server fetches content from the origin",
      "The user is redirected to the origin server",
      "The edge server serves the cached content directly to the user",
      "The content is deleted from the cache",
    ],
    correctIndex: 2,
    explanation: "A cache hit means the edge server already has the requested content and can serve it directly to the user without contacting the origin server.",
  },
  {
    question: "What happens during a CDN cache miss?",
    options: [
      "The request fails completely",
      "The edge server fetches content from origin, caches it, then serves the user",
      "The user must wait and retry later",
      "The content is permanently unavailable",
    ],
    correctIndex: 1,
    explanation: "On a cache miss, the edge server fetches the content from the origin server, stores a copy locally (caches it), and then serves it to the user. Future requests will get a cache hit.",
  },
  {
    question: "How does a CDN route users to the nearest edge server?",
    options: [
      "Users manually select a server",
      "DNS-based routing resolves the CDN domain to the nearest edge server IP",
      "All users connect to the same server",
      "The origin server forwards the request",
    ],
    correctIndex: 1,
    explanation: "CDNs use DNS-based routing (and sometimes Anycast) to resolve their domain names to the IP address of the edge server geographically closest to the user.",
  },
  {
    question: "Which of the following is NOT a benefit of using a CDN?",
    options: [
      "Reduced latency for end users",
      "Less load on the origin server",
      "Eliminates the need for an origin server completely",
      "Better handling of traffic spikes",
    ],
    correctIndex: 2,
    explanation: "CDNs still need an origin server as the source of truth. Edge servers cache content from the origin but cannot completely replace it, especially for dynamic content.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L7_CDNActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "problem",
      label: "Problem",
      icon: <Clock className="w-4 h-4" />,
      content: <ProblemTab />,
    },
    {
      id: "cdn",
      label: "CDN",
      icon: <Globe className="w-4 h-4" />,
      content: <CDNTab />,
    },
    {
      id: "explore",
      label: "Explore",
      icon: <MapPin className="w-4 h-4" />,
      content: <ExploreTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Content Delivery Networks (CDN)"
      level={7}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Cloud Networking — VPCs, load balancers, and auto-scaling"
      gateRelevance="1 mark"
      placementRelevance="High"
    />
  );
}
