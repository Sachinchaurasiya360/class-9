"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Cloud, Server, Shield, Zap, BarChart3, Activity, ArrowRight, Plus, Minus, RefreshCw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1 — VPC Visualization                                         */
/* ------------------------------------------------------------------ */

function VPCTab() {
  const [trafficActive, setTrafficActive] = useState(false);
  const [targetServer, setTargetServer] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!trafficActive) return;
    const interval = setInterval(() => {
      setTargetServer((t) => (t + 1) % 3);
      setTick((t) => t + 1);
    }, 1200);
    return () => clearInterval(interval);
  }, [trafficActive]);

  const publicServers = [
    { x: 360, y: 170, label: "Web 1" },
    { x: 480, y: 170, label: "Web 2" },
    { x: 600, y: 170, label: "Web 3" },
  ];

  const privateServers = [
    { x: 400, y: 290, label: "DB Primary" },
    { x: 560, y: 290, label: "DB Replica" },
  ];

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Virtual Private Cloud (VPC):</strong> An isolated virtual network in the cloud.
        It contains public subnets (internet-facing) and private subnets (internal only).
        A load balancer distributes incoming traffic across servers in the public subnet.
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>
            VPC Architecture
          </h3>
          <button
            className={trafficActive ? "btn-eng" : "btn-eng-outline"}
            onClick={() => setTrafficActive(!trafficActive)}
            style={{ fontSize: "0.8rem", padding: "6px 14px" }}
          >
            <Zap className="w-3.5 h-3.5" style={{ marginRight: 4 }} />
            {trafficActive ? "Stop Traffic" : "Send Traffic"}
          </button>
        </div>

        <svg viewBox="0 0 720 400" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* VPC boundary */}
          <rect x={240} y={40} width={440} height={340} rx={12} fill="none" stroke="var(--eng-primary)" strokeWidth={2} strokeDasharray="8,4" />
          <text x={260} y={62} fontSize="12" fontWeight={700} fill="var(--eng-primary)" fontFamily="var(--eng-font)">VPC (10.0.0.0/16)</text>

          {/* Public subnet */}
          <rect x={260} y={120} width={400} height={90} rx={8} fill="rgba(16,185,129,0.06)" stroke="var(--eng-success)" strokeWidth={1.5} strokeDasharray="5,3" />
          <text x={280} y={142} fontSize="10" fontWeight={600} fill="var(--eng-success)" fontFamily="var(--eng-font)">
            Public Subnet (10.0.1.0/24)
          </text>

          {/* Private subnet */}
          <rect x={260} y={240} width={400} height={80} rx={8} fill="rgba(239,68,68,0.04)" stroke="var(--eng-danger)" strokeWidth={1.5} strokeDasharray="5,3" />
          <text x={280} y={262} fontSize="10" fontWeight={600} fill="var(--eng-danger)" fontFamily="var(--eng-font)">
            Private Subnet (10.0.2.0/24)
          </text>

          {/* Internet Gateway */}
          <rect x={80} y={66} width={100} height={36} rx={8} fill="#ede9fe" stroke="#8b5cf6" strokeWidth={2} />
          <text x={130} y={82} textAnchor="middle" fontSize="9" fontWeight={700} fill="#8b5cf6" fontFamily="var(--eng-font)">Internet</text>
          <text x={130} y={94} textAnchor="middle" fontSize="8" fill="#7c3aed" fontFamily="var(--eng-font)">Gateway</text>

          {/* Arrow from IGW to LB */}
          <line x1={180} y1={84} x2={240} y2={84} stroke="#8b5cf6" strokeWidth={2} markerEnd="url(#arrowHead)" />

          {/* Load Balancer */}
          <rect x={250} y={72} width={120} height={36} rx={8} fill="var(--eng-primary)" stroke="var(--eng-primary)" strokeWidth={2} />
          <text x={310} y={88} textAnchor="middle" fontSize="9" fontWeight={700} fill="#fff" fontFamily="var(--eng-font)">Load Balancer</text>
          <text x={310} y={100} textAnchor="middle" fontSize="7" fill="#dbeafe" fontFamily="var(--eng-font)">ALB / NLB</text>

          {/* User */}
          <g>
            <circle cx={130} cy={30} r={16} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={2} />
            <text x={130} y={34} textAnchor="middle" fontSize="9" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">User</text>
            <line x1={130} y1={46} x2={130} y2={66} stroke="var(--eng-border)" strokeWidth={2} />
          </g>

          {/* LB to server lines */}
          {publicServers.map((srv, i) => (
            <line
              key={i}
              x1={310} y1={108} x2={srv.x} y2={srv.y - 18}
              stroke={trafficActive && targetServer === i ? "var(--eng-success)" : "var(--eng-border)"}
              strokeWidth={trafficActive && targetServer === i ? 2.5 : 1}
              strokeDasharray={trafficActive && targetServer === i ? "none" : "4,3"}
            />
          ))}

          {/* Animated traffic packet */}
          {trafficActive && (
            <circle r="5" fill="var(--eng-success)" opacity={0.9}>
              <animateMotion
                key={tick}
                path={`M310,108 L${publicServers[targetServer].x},${publicServers[targetServer].y - 18}`}
                dur="0.8s"
                fill="freeze"
              />
            </circle>
          )}

          {/* Public servers */}
          {publicServers.map((srv, i) => (
            <g key={i}>
              <rect
                x={srv.x - 28} y={srv.y - 16} width={56} height={32} rx={6}
                fill={trafficActive && targetServer === i ? "rgba(16,185,129,0.15)" : "var(--eng-surface)"}
                stroke={trafficActive && targetServer === i ? "var(--eng-success)" : "var(--eng-border)"}
                strokeWidth={trafficActive && targetServer === i ? 2 : 1.5}
              />
              <text x={srv.x} y={srv.y + 2} textAnchor="middle" fontSize="8" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                {srv.label}
              </text>
            </g>
          ))}

          {/* Lines from public to private */}
          {publicServers.map((srv, i) => (
            <g key={`link-${i}`}>
              {privateServers.map((db, j) => (
                <line
                  key={j}
                  x1={srv.x} y1={srv.y + 16} x2={db.x} y2={db.y - 16}
                  stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="3,3" opacity={0.4}
                />
              ))}
            </g>
          ))}

          {/* Private servers */}
          {privateServers.map((srv, i) => (
            <g key={i}>
              <rect x={srv.x - 36} y={srv.y - 14} width={72} height={28} rx={6} fill="var(--eng-surface)" stroke="var(--eng-danger)" strokeWidth={1.5} />
              <text x={srv.x} y={srv.y + 2} textAnchor="middle" fontSize="8" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                {srv.label}
              </text>
            </g>
          ))}

          {/* NAT Gateway */}
          <rect x={560} y={340} width={80} height={26} rx={6} fill="#fef3c7" stroke="#f59e0b" strokeWidth={1.5} />
          <text x={600} y={357} textAnchor="middle" fontSize="8" fontWeight={600} fill="#92400e" fontFamily="var(--eng-font)">
            NAT Gateway
          </text>

          {/* Security group indicators */}
          <g opacity={0.6}>
            <rect x={345} y={150} width={16} height={16} rx={3} fill="none" stroke="var(--eng-warning)" strokeWidth={1} />
            <text x={353} y={161} textAnchor="middle" fontSize="8" fill="var(--eng-warning)">SG</text>
          </g>

          {/* Arrow marker */}
          <defs>
            <marker id="arrowHead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="#8b5cf6" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Key concepts */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
        {[
          { title: "Public Subnet", desc: "Internet-accessible via Internet Gateway. Hosts web servers, load balancers.", color: "var(--eng-success)", icon: <Cloud className="w-4 h-4" /> },
          { title: "Private Subnet", desc: "No direct internet access. Hosts databases, internal services. Outbound via NAT.", color: "var(--eng-danger)", icon: <Shield className="w-4 h-4" /> },
          { title: "Load Balancer", desc: "Distributes incoming traffic across multiple targets. Health checks ensure only healthy instances receive traffic.", color: "var(--eng-primary)", icon: <BarChart3 className="w-4 h-4" /> },
          { title: "Security Groups", desc: "Virtual firewalls that control inbound and outbound traffic at the instance level.", color: "var(--eng-warning)", icon: <Shield className="w-4 h-4" /> },
        ].map((c) => (
          <div key={c.title} className="card-eng eng-fadeIn" style={{ padding: 14, borderLeft: `3px solid ${c.color}` }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
              <span style={{ color: c.color }}>{c.icon}</span>
              <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.85rem", color: "var(--eng-text)", margin: 0 }}>
                {c.title}
              </h4>
            </div>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.5 }}>
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Load Balancing Algorithms                                  */
/* ------------------------------------------------------------------ */

interface LBServer {
  id: number;
  connections: number;
  requests: number;
}

function LoadBalancingTab() {
  const [algorithm, setAlgorithm] = useState<"round-robin" | "least-conn" | "ip-hash">("round-robin");
  const [servers, setServers] = useState<LBServer[]>([
    { id: 0, connections: 2, requests: 0 },
    { id: 1, connections: 5, requests: 0 },
    { id: 2, connections: 1, requests: 0 },
    { id: 3, connections: 3, requests: 0 },
  ]);
  const [rrIndex, setRrIndex] = useState(0);
  const [lastTarget, setLastTarget] = useState<number | null>(null);
  const [autoRun, setAutoRun] = useState(false);
  const [clientIP, setClientIP] = useState("192.168.1.42");

  const sendRequest = useCallback(() => {
    let target: number;

    switch (algorithm) {
      case "round-robin":
        target = rrIndex % servers.length;
        setRrIndex((i) => i + 1);
        break;
      case "least-conn":
        target = servers.reduce((min, s) => s.connections < servers[min].connections ? s.id : min, 0);
        break;
      case "ip-hash": {
        const hash = clientIP.split(".").reduce((sum, octet) => sum + parseInt(octet, 10), 0);
        target = hash % servers.length;
        break;
      }
      default:
        target = 0;
    }

    setLastTarget(target);
    setServers((prev) => prev.map((s) =>
      s.id === target
        ? { ...s, connections: s.connections + 1, requests: s.requests + 1 }
        : s
    ));
  }, [algorithm, rrIndex, servers, clientIP]);

  useEffect(() => {
    if (!autoRun) return;
    const interval = setInterval(sendRequest, 800);
    return () => clearInterval(interval);
  }, [autoRun, sendRequest]);

  const resetServers = () => {
    setServers([
      { id: 0, connections: 2, requests: 0 },
      { id: 1, connections: 5, requests: 0 },
      { id: 2, connections: 1, requests: 0 },
      { id: 3, connections: 3, requests: 0 },
    ]);
    setRrIndex(0);
    setLastTarget(null);
  };

  const algorithms = [
    { id: "round-robin" as const, label: "Round Robin", desc: "Cycle through servers in order" },
    { id: "least-conn" as const, label: "Least Connections", desc: "Pick the server with fewest active connections" },
    { id: "ip-hash" as const, label: "IP Hash", desc: "Hash client IP to pick a consistent server" },
  ];

  const maxConns = Math.max(...servers.map((s) => s.connections), 1);

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Load Balancing:</strong> Distributes incoming requests across multiple servers.
        Different algorithms suit different scenarios. Try each one and see how traffic is distributed!
      </div>

      {/* Algorithm selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
        {algorithms.map((a) => (
          <button
            key={a.id}
            className={algorithm === a.id ? "btn-eng" : "btn-eng-outline"}
            onClick={() => { setAlgorithm(a.id); resetServers(); setAutoRun(false); }}
            style={{ fontSize: "0.8rem", padding: "8px 12px", textAlign: "left" }}
          >
            <div style={{ fontWeight: 600 }}>{a.label}</div>
            <div style={{ fontSize: "0.7rem", opacity: 0.8, marginTop: 2 }}>{a.desc}</div>
          </button>
        ))}
      </div>

      {/* IP Hash client IP input */}
      {algorithm === "ip-hash" && (
        <div className="card-eng eng-fadeIn" style={{ padding: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)" }}>
            Client IP:
          </label>
          <input
            type="text"
            value={clientIP}
            onChange={(e) => setClientIP(e.target.value)}
            style={{
              fontFamily: "monospace", fontSize: "0.85rem", padding: "4px 10px", borderRadius: 6,
              border: "1px solid var(--eng-border)", background: "var(--eng-bg)", color: "var(--eng-text)",
            }}
          />
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
            Hash: {clientIP.split(".").reduce((sum, o) => sum + parseInt(o, 10) || 0, 0)} % {servers.length} = Server {clientIP.split(".").reduce((sum, o) => sum + parseInt(o, 10) || 0, 0) % servers.length}
          </span>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button className="btn-eng" onClick={sendRequest} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
          <Zap className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Send Request
        </button>
        <button
          className={autoRun ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setAutoRun(!autoRun)}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          <Activity className="w-3.5 h-3.5" style={{ marginRight: 4 }} />
          {autoRun ? "Stop Auto" : "Auto Send"}
        </button>
        <button className="btn-eng-outline" onClick={resetServers} style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
          <RefreshCw className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Reset
        </button>
      </div>

      {/* Server visualization */}
      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox="0 0 700 240" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* Load Balancer */}
          <rect x={30} y={85} width={100} height={50} rx={8} fill="var(--eng-primary)" />
          <text x={80} y={108} textAnchor="middle" fontSize="10" fontWeight={700} fill="#fff" fontFamily="var(--eng-font)">
            Load Balancer
          </text>
          <text x={80} y={122} textAnchor="middle" fontSize="8" fill="#dbeafe" fontFamily="var(--eng-font)">
            {algorithms.find((a) => a.id === algorithm)?.label}
          </text>

          {/* Incoming request arrow */}
          <line x1={0} y1={110} x2={30} y2={110} stroke="var(--eng-text-muted)" strokeWidth={2} markerEnd="url(#lbArrow)" />
          <text x={5} y={100} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">Requests</text>

          {/* Arrows to servers */}
          {servers.map((srv, i) => {
            const y = 30 + i * 52;
            const isTarget = lastTarget === i;
            return (
              <g key={srv.id}>
                <line
                  x1={130} y1={110} x2={220} y2={y + 22}
                  stroke={isTarget ? "var(--eng-success)" : "var(--eng-border)"}
                  strokeWidth={isTarget ? 2.5 : 1}
                  strokeDasharray={isTarget ? "none" : "4,3"}
                />
                {isTarget && (
                  <circle r="4" fill="var(--eng-success)">
                    <animateMotion path={`M130,110 L220,${y + 22}`} dur="0.5s" fill="freeze" />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Servers with connection bars */}
          {servers.map((srv, i) => {
            const y = 30 + i * 52;
            const isTarget = lastTarget === i;
            const barWidth = (srv.connections / Math.max(maxConns, 1)) * 200;
            return (
              <g key={srv.id}>
                <rect
                  x={220} y={y} width={120} height={44} rx={6}
                  fill={isTarget ? "rgba(16,185,129,0.12)" : "var(--eng-surface)"}
                  stroke={isTarget ? "var(--eng-success)" : "var(--eng-border)"}
                  strokeWidth={isTarget ? 2 : 1.5}
                >
                  {isTarget && (
                    <animate attributeName="strokeWidth" values="2;3;2" dur="0.5s" repeatCount="1" />
                  )}
                </rect>
                <text x={280} y={y + 18} textAnchor="middle" fontSize="9" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                  Server {i}
                </text>
                <text x={280} y={y + 32} textAnchor="middle" fontSize="7" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  Conns: {srv.connections} | Reqs: {srv.requests}
                </text>

                {/* Connection bar */}
                <rect x={360} y={y + 8} width={220} height={10} rx={3} fill="#e2e8f0" />
                <rect
                  x={360} y={y + 8}
                  width={barWidth}
                  height={10} rx={3}
                  fill={isTarget ? "var(--eng-success)" : "var(--eng-primary)"}
                  style={{ transition: "width 0.3s ease" }}
                />
                <text x={360 + barWidth + 8} y={y + 16} fontSize="7" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {srv.connections}
                </text>

                {/* Request counter */}
                <rect x={600} y={y + 6} width={44} height={18} rx={4} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1} />
                <text x={622} y={y + 18} textAnchor="middle" fontSize="8" fontWeight={700} fill="var(--eng-primary)" fontFamily="var(--eng-font)">
                  {srv.requests}
                </text>
              </g>
            );
          })}

          <defs>
            <marker id="lbArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
              <path d="M0,0 L8,3 L0,6 Z" fill="var(--eng-text-muted)" />
            </marker>
          </defs>
        </svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Auto-scaling & Availability Zones                          */
/* ------------------------------------------------------------------ */

interface ScalingInstance {
  id: number;
  cpu: number;
  zone: string;
  spawning?: boolean;
}

function ScalingTab() {
  const [instances, setInstances] = useState<ScalingInstance[]>([
    { id: 1, cpu: 30, zone: "AZ-1" },
    { id: 2, cpu: 25, zone: "AZ-2" },
  ]);
  const [threshold, setThreshold] = useState(70);
  const [trafficMultiplier, setTrafficMultiplier] = useState(1);
  const [autoScale, setAutoScale] = useState(true);
  const [events, setEvents] = useState<string[]>([]);
  const nextId = useRef(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setInstances((prev) => {
        const updated = prev.map((inst) => ({
          ...inst,
          cpu: Math.min(100, Math.max(5, inst.cpu + (Math.random() - 0.3) * 8 * trafficMultiplier)),
          spawning: false,
        }));

        if (autoScale) {
          const avgCpu = updated.reduce((sum, i) => sum + i.cpu, 0) / updated.length;

          if (avgCpu > threshold && updated.length < 6) {
            const zone = updated.length % 2 === 0 ? "AZ-1" : "AZ-2";
            const newInst: ScalingInstance = { id: nextId.current++, cpu: 15, zone, spawning: true };
            setEvents((e) => [`Scale UP: New instance in ${zone} (avg CPU: ${Math.round(avgCpu)}%)`, ...e.slice(0, 9)]);
            return [...updated, newInst];
          }

          if (avgCpu < threshold * 0.4 && updated.length > 2) {
            const removed = updated[updated.length - 1];
            setEvents((e) => [`Scale DOWN: Removed instance ${removed.id} (avg CPU: ${Math.round(avgCpu)}%)`, ...e.slice(0, 9)]);
            return updated.slice(0, -1);
          }
        }

        return updated;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [trafficMultiplier, threshold, autoScale]);

  const avgCpu = instances.length > 0 ? instances.reduce((sum, i) => sum + i.cpu, 0) / instances.length : 0;
  const az1Instances = instances.filter((i) => i.zone === "AZ-1");
  const az2Instances = instances.filter((i) => i.zone === "AZ-2");

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Auto-Scaling:</strong> When server CPU usage exceeds a threshold, new instances spawn automatically.
        Instances are spread across Availability Zones for fault tolerance.
        Simulate a traffic spike and watch the system respond!
      </div>

      {/* Controls */}
      <div className="card-eng" style={{ padding: 16, display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Traffic Load
          </label>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button
              className="btn-eng-outline"
              onClick={() => setTrafficMultiplier(Math.max(0.5, trafficMultiplier - 0.5))}
              style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            >
              <Minus className="w-3 h-3" />
            </button>
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", fontWeight: 700, color: "var(--eng-text)", minWidth: 30, textAlign: "center" }}>
              {trafficMultiplier}x
            </span>
            <button
              className="btn-eng-outline"
              onClick={() => setTrafficMultiplier(Math.min(5, trafficMultiplier + 0.5))}
              style={{ padding: "4px 8px", fontSize: "0.8rem" }}
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            CPU Threshold: {threshold}%
          </label>
          <input
            type="range" min={30} max={90} value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            style={{ width: 120 }}
          />
        </div>

        <button
          className={autoScale ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setAutoScale(!autoScale)}
          style={{ fontSize: "0.8rem", padding: "6px 14px" }}
        >
          Auto-Scale: {autoScale ? "ON" : "OFF"}
        </button>

        <button
          className="btn-eng"
          onClick={() => setTrafficMultiplier(4)}
          style={{ fontSize: "0.8rem", padding: "6px 14px", background: "var(--eng-danger)", border: "none" }}
        >
          <Zap className="w-3.5 h-3.5" style={{ marginRight: 4 }} /> Traffic Spike!
        </button>

        <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <span style={{ color: "var(--eng-text-muted)" }}>Instances: </span>
          <span style={{ fontWeight: 700, color: "var(--eng-primary)" }}>{instances.length}</span>
          <span style={{ color: "var(--eng-text-muted)", marginLeft: 12 }}>Avg CPU: </span>
          <span style={{ fontWeight: 700, color: avgCpu > threshold ? "var(--eng-danger)" : "var(--eng-success)" }}>
            {Math.round(avgCpu)}%
          </span>
        </div>
      </div>

      {/* Availability Zones visualization */}
      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox="0 0 700 280" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* AZ-1 */}
          <rect x={20} y={30} width={320} height={230} rx={10} fill="rgba(59,130,246,0.04)" stroke="var(--eng-primary)" strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={40} y={52} fontSize="11" fontWeight={700} fill="var(--eng-primary)" fontFamily="var(--eng-font)">
            Availability Zone 1
          </text>

          {/* AZ-2 */}
          <rect x={360} y={30} width={320} height={230} rx={10} fill="rgba(139,92,246,0.04)" stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="6,3" />
          <text x={380} y={52} fontSize="11" fontWeight={700} fill="#8b5cf6" fontFamily="var(--eng-font)">
            Availability Zone 2
          </text>

          {/* Cross-zone replication arrow */}
          <line x1={340} y1={140} x2={360} y2={140} stroke="var(--eng-warning)" strokeWidth={2} strokeDasharray="4,2">
            <animate attributeName="strokeDashoffset" from="0" to="-12" dur="1s" repeatCount="indefinite" />
          </line>
          <text x={350} y={130} textAnchor="middle" fontSize="7" fill="var(--eng-warning)" fontFamily="var(--eng-font)">
            Sync
          </text>

          {/* AZ-1 instances */}
          {az1Instances.map((inst, i) => {
            const x = 40 + (i % 3) * 100;
            const y = 70 + Math.floor(i / 3) * 90;
            const cpuColor = inst.cpu > threshold ? "var(--eng-danger)" : inst.cpu > threshold * 0.6 ? "var(--eng-warning)" : "var(--eng-success)";
            return (
              <g key={inst.id} className={inst.spawning ? "eng-fadeIn" : ""}>
                <rect x={x} y={y} width={80} height={70} rx={6} fill="var(--eng-surface)" stroke={cpuColor} strokeWidth={1.5} />
                <text x={x + 40} y={y + 16} textAnchor="middle" fontSize="8" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                  Instance {inst.id}
                </text>
                {/* CPU gauge */}
                <rect x={x + 8} y={y + 24} width={64} height={8} rx={3} fill="#e2e8f0" />
                <rect x={x + 8} y={y + 24} width={64 * (inst.cpu / 100)} height={8} rx={3} fill={cpuColor} style={{ transition: "width 0.5s" }} />
                <text x={x + 40} y={y + 46} textAnchor="middle" fontSize="8" fontWeight={700} fill={cpuColor} fontFamily="var(--eng-font)">
                  CPU: {Math.round(inst.cpu)}%
                </text>
                {/* Threshold line */}
                <line x1={x + 8 + 64 * (threshold / 100)} y1={y + 22} x2={x + 8 + 64 * (threshold / 100)} y2={y + 34} stroke="var(--eng-danger)" strokeWidth={1.5} />
                <text x={x + 40} y={y + 60} textAnchor="middle" fontSize="7" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {inst.zone}
                </text>
              </g>
            );
          })}

          {/* AZ-2 instances */}
          {az2Instances.map((inst, i) => {
            const x = 380 + (i % 3) * 100;
            const y = 70 + Math.floor(i / 3) * 90;
            const cpuColor = inst.cpu > threshold ? "var(--eng-danger)" : inst.cpu > threshold * 0.6 ? "var(--eng-warning)" : "var(--eng-success)";
            return (
              <g key={inst.id} className={inst.spawning ? "eng-fadeIn" : ""}>
                <rect x={x} y={y} width={80} height={70} rx={6} fill="var(--eng-surface)" stroke={cpuColor} strokeWidth={1.5} />
                <text x={x + 40} y={y + 16} textAnchor="middle" fontSize="8" fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                  Instance {inst.id}
                </text>
                <rect x={x + 8} y={y + 24} width={64} height={8} rx={3} fill="#e2e8f0" />
                <rect x={x + 8} y={y + 24} width={64 * (inst.cpu / 100)} height={8} rx={3} fill={cpuColor} style={{ transition: "width 0.5s" }} />
                <text x={x + 40} y={y + 46} textAnchor="middle" fontSize="8" fontWeight={700} fill={cpuColor} fontFamily="var(--eng-font)">
                  CPU: {Math.round(inst.cpu)}%
                </text>
                <line x1={x + 8 + 64 * (threshold / 100)} y1={y + 22} x2={x + 8 + 64 * (threshold / 100)} y2={y + 34} stroke="var(--eng-danger)" strokeWidth={1.5} />
                <text x={x + 40} y={y + 60} textAnchor="middle" fontSize="7" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {inst.zone}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Event log */}
      {events.length > 0 && (
        <div className="card-eng eng-fadeIn" style={{ padding: 14 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
            <Activity className="w-4 h-4" style={{ display: "inline", verticalAlign: "middle", marginRight: 6, color: "var(--eng-primary)" }} />
            Auto-Scaling Events
          </h4>
          <div style={{ maxHeight: 120, overflowY: "auto", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
            {events.map((e, i) => (
              <div key={i} style={{ padding: "3px 0", borderBottom: "1px solid var(--eng-border)" }}>
                <span style={{ color: e.includes("UP") ? "var(--eng-success)" : "var(--eng-warning)" }}>
                  {e.includes("UP") ? "+" : "-"}
                </span>{" "}
                {e}
              </div>
            ))}
          </div>
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
    question: "What is a Virtual Private Cloud (VPC)?",
    options: [
      "A physical server room",
      "An isolated virtual network within a cloud provider's infrastructure",
      "A type of VPN connection",
      "A content delivery network",
    ],
    correctIndex: 1,
    explanation: "A VPC is a logically isolated virtual network that you define within a cloud provider. It includes subnets, route tables, and gateways, giving you full control over your network environment.",
  },
  {
    question: "Which load balancing algorithm picks the server with the fewest active connections?",
    options: [
      "Round Robin",
      "IP Hash",
      "Least Connections",
      "Random",
    ],
    correctIndex: 2,
    explanation: "The Least Connections algorithm directs traffic to the server with the fewest active connections, ensuring more evenly distributed load when request durations vary.",
  },
  {
    question: "What triggers auto-scaling to add new instances?",
    options: [
      "When the network cable is unplugged",
      "When server CPU/memory usage exceeds a defined threshold",
      "Every hour automatically",
      "When the admin logs in",
    ],
    correctIndex: 1,
    explanation: "Auto-scaling monitors metrics like CPU and memory utilization. When these metrics exceed configured thresholds, new instances are automatically launched to handle the increased load.",
  },
  {
    question: "Why are instances spread across multiple Availability Zones?",
    options: [
      "To reduce licensing costs",
      "For fault tolerance - if one AZ fails, the other keeps running",
      "To make the application slower",
      "It is required by law",
    ],
    correctIndex: 1,
    explanation: "Availability Zones are physically separate data centers. Spreading instances across AZs means that if one zone experiences a failure, your application continues running in the other zone(s).",
  },
  {
    question: "What is the difference between a public and private subnet in a VPC?",
    options: [
      "Public subnets use IPv6, private use IPv4",
      "Public subnets have a route to an Internet Gateway; private subnets do not",
      "Private subnets are faster",
      "There is no difference",
    ],
    correctIndex: 1,
    explanation: "A public subnet has a route table entry pointing to an Internet Gateway, making resources directly accessible from the internet. Private subnets have no such route, keeping resources internal-only.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L7_CloudNetworkingActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "vpc",
      label: "VPC",
      icon: <Cloud className="w-4 h-4" />,
      content: <VPCTab />,
    },
    {
      id: "load-balancing",
      label: "Load Balancing",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <LoadBalancingTab />,
    },
    {
      id: "scaling",
      label: "Scaling",
      icon: <Activity className="w-4 h-4" />,
      content: <ScalingTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="Cloud Networking"
      level={7}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="WebSockets, gRPC & Modern Protocols"
      gateRelevance="0-1 marks"
      placementRelevance="Very High"
    />
  );
}
