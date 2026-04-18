"use client";

import { useState, useMemo, useEffect } from "react";
import { Layers, Network, Radio, Server, Cpu, Zap, Eye, ShieldCheck } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Shared device catalog                                              */
/* ================================================================== */

type DeviceId = "hub" | "bridge" | "switch" | "router" | "l3switch";

interface DeviceDef {
  id: DeviceId;
  label: string;
  layer: string;
  layerNum: number;
  decideOn: string;
  table: string;
  collisionDomains: string;
  broadcastDomains: string;
  oneLine: string;
  detail: string;
  icon: React.ReactNode;
  color: string;
}

const DEVICES: DeviceDef[] = [
  {
    id: "hub",
    label: "Hub",
    layer: "Physical",
    layerNum: 1,
    decideOn: "Nothing - repeats every bit",
    table: "None (no memory)",
    collisionDomains: "1 per hub",
    broadcastDomains: "1 per hub",
    oneLine: "A multi-port repeater. Whatever bit comes in, goes out every other port.",
    detail: "Hubs operate purely at Layer 1. They have no concept of frames or addresses - every bit on one port is amplified and re-broadcast on all other ports. All connected hosts share one collision domain, so on a busy hub you get CSMA/CD collisions and throughput collapses.",
    icon: <Radio className="w-4 h-4" />,
    color: "#94a3b8",
  },
  {
    id: "bridge",
    label: "Bridge",
    layer: "Data Link",
    layerNum: 2,
    decideOn: "Destination MAC address",
    table: "MAC table (small, few ports)",
    collisionDomains: "1 per port",
    broadcastDomains: "1 per bridge",
    oneLine: "A two-port (or few-port) Layer-2 device that splits collision domains by MAC.",
    detail: "Historically used to segment a large coax LAN into two collision domains. The bridge learns source MACs and only forwards a frame to the other side if the destination is there. Switches are essentially multi-port bridges built in hardware - bridges are mostly a textbook concept now.",
    icon: <Layers className="w-4 h-4" />,
    color: "#8b5cf6",
  },
  {
    id: "switch",
    label: "Switch (L2)",
    layer: "Data Link",
    layerNum: 2,
    decideOn: "Destination MAC address",
    table: "CAM/MAC table (thousands of entries)",
    collisionDomains: "1 per port",
    broadcastDomains: "1 per switch (or per VLAN)",
    oneLine: "A multi-port bridge that forwards frames by MAC. Each port = its own collision domain.",
    detail: "A modern Ethernet switch learns MAC addresses on each port. Known unicast → forward to the single correct port. Unknown unicast or broadcast → flood to all ports except source. Per-port collision domains mean full-duplex Gigabit on every link, no CSMA/CD needed. VLANs let one switch host multiple broadcast domains.",
    icon: <Network className="w-4 h-4" />,
    color: "#3b82f6",
  },
  {
    id: "router",
    label: "Router",
    layer: "Network",
    layerNum: 3,
    decideOn: "Destination IP (longest prefix match)",
    table: "Routing table + ARP cache",
    collisionDomains: "1 per port",
    broadcastDomains: "1 per port",
    oneLine: "A Layer-3 device that forwards packets between IP networks and blocks broadcasts.",
    detail: "Routers maintain a routing table indexed by IP prefix. They strip the incoming Ethernet frame, decrement TTL, look up the longest-prefix match, ARP for the next hop, then encapsulate into a new frame for the egress link. Each port is its own broadcast domain - broadcasts do NOT cross routers.",
    icon: <Server className="w-4 h-4" />,
    color: "#10b981",
  },
  {
    id: "l3switch",
    label: "L3 Switch",
    layer: "Network (in hardware)",
    layerNum: 3,
    decideOn: "MAC inside VLAN, IP across VLANs",
    table: "MAC table + routing table",
    collisionDomains: "1 per port",
    broadcastDomains: "1 per VLAN",
    oneLine: "A switch with a routing engine in silicon - wire-speed routing between VLANs.",
    detail: "An L3 switch behaves like a switch within each VLAN and like a router between VLANs. Because the routing logic is implemented in ASICs (not a CPU like a traditional router), it forwards at line rate. Common in campus distribution layers where you need router-like inter-VLAN routing without router-level latency.",
    icon: <Cpu className="w-4 h-4" />,
    color: "#f59e0b",
  },
];

/* ================================================================== */
/*  Tab 1 - Devices Tour                                               */
/* ================================================================== */

function DevicesTourTab() {
  const [active, setActive] = useState<DeviceId>("hub");
  const dev = DEVICES.find((d) => d.id === active)!;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Five Devices, Five Layers of Smarts
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Pick a device. The same packet means different things to each one - a hub sees a stream of bits, a router sees an IP packet.
      </p>

      {/* Layer ladder */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {DEVICES.map((d) => {
          const sel = d.id === active;
          return (
            <button
              key={d.id}
              onClick={() => setActive(d.id)}
              className="card-eng"
              style={{
                padding: "10px 14px",
                cursor: "pointer",
                border: sel ? `2px solid ${d.color}` : "1px solid var(--eng-border)",
                background: sel ? `${d.color}14` : "var(--eng-surface)",
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontFamily: "var(--eng-font)",
                fontSize: "0.85rem",
                fontWeight: 600,
                color: sel ? d.color : "var(--eng-text)",
              }}
            >
              <span style={{ color: d.color }}>{d.icon}</span>
              {d.label}
              <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 4, background: `${d.color}22`, color: d.color }}>L{d.layerNum}</span>
            </button>
          );
        })}
      </div>

      <div className="card-eng" style={{ padding: 20, borderLeft: `4px solid ${dev.color}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${dev.color}1f`, color: dev.color, display: "flex", alignItems: "center", justifyContent: "center" }}>{dev.icon}</div>
          <div>
            <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.1rem", color: "var(--eng-text)", margin: 0 }}>{dev.label}</h3>
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>OSI Layer {dev.layerNum} - {dev.layer}</span>
          </div>
        </div>

        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.95rem", color: "var(--eng-text)", lineHeight: 1.6, margin: "0 0 12px", fontWeight: 500 }}>
          {dev.oneLine}
        </p>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", lineHeight: 1.65, margin: "0 0 16px" }}>
          {dev.detail}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
          {[
            { k: "Forwards based on", v: dev.decideOn },
            { k: "State kept", v: dev.table },
            { k: "Collision domains", v: dev.collisionDomains },
            { k: "Broadcast domains", v: dev.broadcastDomains },
          ].map((item) => (
            <div key={item.k} style={{ padding: 10, background: "var(--eng-surface)", border: "1px solid var(--eng-border)", borderRadius: 8 }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{item.k}</div>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", fontWeight: 600 }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="info-eng" style={{ marginTop: 16, fontSize: "0.85rem" }}>
        <strong>Rule of thumb:</strong> the higher the OSI layer a device understands, the more decisions it can make - and the more state it has to keep. A hub is dumb but instant; a router does work per packet but enables the entire Internet.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - Collision & Broadcast Domain Visualizer                    */
/* ================================================================== */

interface DomainHost { id: number; x: number; y: number; }

function DomainsTab() {
  const [topology, setTopology] = useState<"hub" | "switch" | "router" | "two-vlans">("hub");

  // 6 hosts arranged in a 2x3 grid for visualization
  const hosts: DomainHost[] = [
    { id: 1, x: 90, y: 80 },
    { id: 2, x: 230, y: 80 },
    { id: 3, x: 90, y: 200 },
    { id: 4, x: 230, y: 200 },
    { id: 5, x: 470, y: 80 },
    { id: 6, x: 470, y: 200 },
  ];

  // Each topology defines collision domains (sets of host ids) and broadcast domains
  const domains = useMemo(() => {
    switch (topology) {
      case "hub":
        return {
          collision: [[1, 2, 3, 4, 5, 6]],
          broadcast: [[1, 2, 3, 4, 5, 6]],
          desc: "All 6 hosts share one wire. One CSMA/CD collision domain, one broadcast domain. ALOHA-class throughput.",
        };
      case "switch":
        return {
          collision: [[1], [2], [3], [4], [5], [6]],
          broadcast: [[1, 2, 3, 4, 5, 6]],
          desc: "Switch gives each port its own collision domain (full-duplex Gigabit). But broadcasts still flood every port - 1 broadcast domain.",
        };
      case "router":
        return {
          collision: [[1, 2, 3], [4, 5, 6]],
          broadcast: [[1, 2, 3], [4, 5, 6]],
          desc: "Two hubs connected by a router. Each hub side is its own collision AND broadcast domain. Routers stop broadcasts.",
        };
      case "two-vlans":
        return {
          collision: [[1], [2], [3], [4], [5], [6]],
          broadcast: [[1, 2, 3], [4, 5, 6]],
          desc: "Single L3 switch with 2 VLANs (1–3 and 4–6). 6 collision domains (per port), 2 broadcast domains (per VLAN). Inter-VLAN traffic is routed in silicon.",
        };
    }
  }, [topology]);

  const collisionColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
  const broadcastColors = ["#fbbf24", "#22d3ee"];

  const collisionOf = (id: number) => domains.collision.findIndex((set) => set.includes(id));
  const broadcastOf = (id: number) => domains.broadcast.findIndex((set) => set.includes(id));

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Collision Domain vs Broadcast Domain
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Pick a topology. Coloured halos show collision domains. The dashed outer rings are broadcast domains. Same six hosts, very different blast radius for collisions and ARP/DHCP traffic.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {([
          { k: "hub" as const, l: "All on one Hub" },
          { k: "switch" as const, l: "All on one Switch" },
          { k: "router" as const, l: "Two Hubs + Router" },
          { k: "two-vlans" as const, l: "L3 Switch (2 VLANs)" },
        ]).map((opt) => {
          const sel = topology === opt.k;
          return (
            <button
              key={opt.k}
              onClick={() => setTopology(opt.k)}
              className={sel ? "btn-eng" : "btn-eng-outline"}
              style={{ fontSize: "0.8rem", padding: "6px 12px" }}
            >
              {opt.l}
            </button>
          );
        })}
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <svg viewBox="0 0 580 290" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
          {/* Broadcast domain rings (drawn first, behind everything) */}
          {domains.broadcast.map((set, i) => {
            const xs = set.map((id) => hosts.find((h) => h.id === id)!.x);
            const ys = set.map((id) => hosts.find((h) => h.id === id)!.y);
            const minX = Math.min(...xs) - 50;
            const maxX = Math.max(...xs) + 50;
            const minY = Math.min(...ys) - 45;
            const maxY = Math.max(...ys) + 45;
            return (
              <g key={`bc-${i}`}>
                <rect
                  x={minX}
                  y={minY}
                  width={maxX - minX}
                  height={maxY - minY}
                  rx={14}
                  fill="none"
                  stroke={broadcastColors[i % broadcastColors.length]}
                  strokeDasharray="6 4"
                  strokeWidth={2}
                  opacity={0.6}
                />
                <text
                  x={minX + 8}
                  y={minY - 6}
                  fontSize={10}
                  fontFamily="var(--eng-font)"
                  fontWeight={700}
                  fill={broadcastColors[i % broadcastColors.length]}
                >
                  Broadcast Domain {i + 1}
                </text>
              </g>
            );
          })}

          {/* Collision domain halos */}
          {domains.collision.map((set, i) => {
            if (set.length === 1) {
              const h = hosts.find((host) => host.id === set[0])!;
              return (
                <circle key={`co-${i}`} cx={h.x} cy={h.y} r={28} fill={collisionColors[i % collisionColors.length]} opacity={0.18} />
              );
            }
            const xs = set.map((id) => hosts.find((host) => host.id === id)!.x);
            const ys = set.map((id) => hosts.find((host) => host.id === id)!.y);
            const minX = Math.min(...xs) - 22;
            const maxX = Math.max(...xs) + 22;
            const minY = Math.min(...ys) - 22;
            const maxY = Math.max(...ys) + 22;
            return (
              <rect
                key={`co-${i}`}
                x={minX}
                y={minY}
                width={maxX - minX}
                height={maxY - minY}
                rx={20}
                fill={collisionColors[i % collisionColors.length]}
                opacity={0.16}
              />
            );
          })}

          {/* Central device(s) */}
          {topology === "hub" && (
            <DeviceBox x={310} y={130} w={70} h={36} label="HUB" color="#94a3b8" />
          )}
          {topology === "switch" && (
            <DeviceBox x={310} y={130} w={70} h={36} label="SWITCH" color="#3b82f6" />
          )}
          {topology === "router" && (
            <>
              <DeviceBox x={150} y={130} w={70} h={36} label="HUB A" color="#94a3b8" />
              <DeviceBox x={420} y={130} w={70} h={36} label="HUB B" color="#94a3b8" />
              <DeviceBox x={310} y={250} w={70} h={32} label="ROUTER" color="#10b981" />
              <line x1={185} y1={166} x2={310} y2={250} stroke="#10b981" strokeWidth={2} />
              <line x1={455} y1={166} x2={345} y2={250} stroke="#10b981" strokeWidth={2} />
            </>
          )}
          {topology === "two-vlans" && (
            <DeviceBox x={310} y={130} w={90} h={36} label="L3 SWITCH" color="#f59e0b" />
          )}

          {/* Wires from hosts to devices */}
          {hosts.map((h) => {
            let tx = 310, ty = 148;
            if (topology === "router") {
              tx = h.id <= 3 ? 185 : 455;
              ty = 148;
            }
            return (
              <line
                key={`wire-${h.id}`}
                x1={h.x}
                y1={h.y}
                x2={tx}
                y2={ty}
                stroke="var(--eng-border)"
                strokeWidth={1.2}
              />
            );
          })}

          {/* Hosts */}
          {hosts.map((h) => {
            const ci = collisionOf(h.id);
            return (
              <g key={`host-${h.id}`}>
                <circle cx={h.x} cy={h.y} r={16} fill="var(--eng-surface)" stroke={collisionColors[ci % collisionColors.length]} strokeWidth={2} />
                <text x={h.x} y={h.y + 4} textAnchor="middle" fontSize={11} fontFamily="var(--eng-font)" fontWeight={700} fill={collisionColors[ci % collisionColors.length]}>
                  H{h.id}
                </text>
              </g>
            );
          })}
        </svg>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginTop: 14 }}>
          <div style={{ padding: 10, borderRadius: 8, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Collision domains</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "1.4rem", fontWeight: 700, color: "var(--eng-text)" }}>{domains.collision.length}</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>Broadcast domains</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "1.4rem", fontWeight: 700, color: "var(--eng-text)" }}>{domains.broadcast.length}</div>
          </div>
          <div style={{ padding: 10, borderRadius: 8, background: "var(--eng-primary-light)", border: "1px solid var(--eng-primary)", gridColumn: "span 2" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-primary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>What's happening</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)" }}>{domains.desc}</div>
          </div>
        </div>
      </div>

      <div className="info-eng" style={{ marginTop: 16, fontSize: "0.85rem" }}>
        <strong>Memorize this:</strong> Switches split <em>collision</em> domains, routers split <em>broadcast</em> domains. VLANs let one switch act like multiple broadcast domains in software.
      </div>
    </div>
  );
}

function DeviceBox({ x, y, w, h, label, color }: { x: number; y: number; w: number; h: number; label: string; color: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={6} fill={color} opacity={0.85} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill="#fff">
        {label}
      </text>
    </g>
  );
}

/* ================================================================== */
/*  Tab 3 - Frame Decision Walkthrough                                 */
/* ================================================================== */

interface FrameStep {
  device: DeviceId;
  decision: string;
  action: string;
}

function DecisionTab() {
  const [scenario, setScenario] = useState<"unicast-known" | "unicast-unknown" | "broadcast" | "cross-network">("unicast-known");
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  const steps: Record<typeof scenario, FrameStep[]> = {
    "unicast-known": [
      { device: "hub", decision: "Sees bits on port 1.", action: "Repeats bits out of every other port. H2, H3, H4, H5, H6 all receive - even though only H4 is the target." },
      { device: "switch", decision: "Reads dest MAC = AA:..:04. Looks up CAM table → port 4.", action: "Forwards frame ONLY out of port 4. Other ports stay idle. No wasted bandwidth." },
      { device: "router", decision: "Reads dest IP. Looks up routing table → next hop on same subnet (no need to route).", action: "Drops the frame to the local switch - but if a router is between sender and dest, it would re-encapsulate and forward." },
    ],
    "unicast-unknown": [
      { device: "hub", decision: "No table to consult, never has been.", action: "Repeats bits to every port (same behaviour as always)." },
      { device: "switch", decision: "Dest MAC AA:..:99 not in CAM table.", action: "Floods the frame to all ports except the source - exactly like a hub for this one frame. The reply teaches the switch where AA:..:99 lives." },
      { device: "router", decision: "Routers don't flood unknown unicast - they ARP for the next hop's MAC.", action: "If ARP fails or no route exists, the router drops the packet and (optionally) sends ICMP Destination Unreachable." },
    ],
    "broadcast": [
      { device: "hub", decision: "Bits are bits.", action: "Repeated to all ports." },
      { device: "switch", decision: "Dest MAC = FF:FF:FF:FF:FF:FF, the broadcast address.", action: "Always floods to all ports except source - broadcast traffic propagates across the entire broadcast domain (the switch / VLAN)." },
      { device: "router", decision: "Default behaviour: drop link-layer broadcasts.", action: "Routers do NOT forward broadcasts. This is exactly why we say 'routers split broadcast domains'." },
    ],
    "cross-network": [
      { device: "hub", decision: "Doesn't understand IP - only sees bits.", action: "Repeats. Useless for cross-network logic." },
      { device: "switch", decision: "Dest MAC = the local router's MAC (sender ARPed for the gateway).", action: "Forwards frame to the router's port. Job done - switch doesn't peek into the IP header." },
      { device: "router", decision: "Strips the Ethernet frame, reads dest IP. Longest prefix match finds the egress interface.", action: "Decrements TTL, ARPs for the next hop, builds a NEW Ethernet frame with new src/dest MACs (IP unchanged), sends it out." },
    ],
  };

  const current = steps[scenario];

  useEffect(() => {
    if (!playing) return;
    if (step >= current.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 1500);
    return () => clearTimeout(id);
  }, [playing, step, current.length]);

  function reset() { setStep(0); setPlaying(false); }

  const scenarioMeta: Record<typeof scenario, { title: string; subtitle: string; color: string }> = {
    "unicast-known": { title: "Unicast - Destination Known", subtitle: "Frame to AA:..:04, switch already learned it", color: "#3b82f6" },
    "unicast-unknown": { title: "Unicast - Destination Unknown", subtitle: "Frame to AA:..:99, switch has never seen it", color: "#f59e0b" },
    "broadcast": { title: "Broadcast Frame (e.g. ARP request)", subtitle: "Dest MAC = FF:FF:FF:FF:FF:FF", color: "#ef4444" },
    "cross-network": { title: "Cross-Network Packet", subtitle: "Dest IP is on a different subnet", color: "#10b981" },
  };
  const meta = scenarioMeta[scenario];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Same Frame, Three Devices, Three Decisions
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Pick a frame scenario, then step through how a hub, switch, and router each handle it.
      </p>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
        {(Object.keys(scenarioMeta) as Array<typeof scenario>).map((k) => {
          const sel = scenario === k;
          return (
            <button
              key={k}
              onClick={() => { setScenario(k); reset(); }}
              className={sel ? "btn-eng" : "btn-eng-outline"}
              style={{ fontSize: "0.78rem", padding: "6px 10px" }}
            >
              {scenarioMeta[k].title}
            </button>
          );
        })}
      </div>

      <div className="card-eng" style={{ padding: 18, borderLeft: `4px solid ${meta.color}` }}>
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
            {meta.title}
          </h3>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>{meta.subtitle}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
          {current.map((s, i) => {
            const visible = i <= step;
            const dev = DEVICES.find((d) => d.id === s.device)!;
            return (
              <div
                key={i}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: `1.5px solid ${visible ? dev.color : "var(--eng-border)"}`,
                  background: visible ? `${dev.color}10` : "var(--eng-surface)",
                  opacity: visible ? 1 : 0.4,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ color: dev.color }}>{dev.icon}</span>
                  <strong style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: dev.color }}>
                    {dev.label}
                  </strong>
                  <span style={{ fontSize: "0.7rem", padding: "1px 6px", borderRadius: 4, background: `${dev.color}22`, color: dev.color, fontFamily: "var(--eng-font)" }}>L{dev.layerNum}</span>
                </div>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>
                  <Eye className="w-3 h-3 inline mr-1" /> {s.decision}
                </div>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)" }}>
                  <Zap className="w-3 h-3 inline mr-1" style={{ color: dev.color }} /> {s.action}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="btn-eng-outline" style={{ fontSize: "0.8rem", padding: "6px 12px" }} disabled={step === 0}>
            Prev
          </button>
          <button onClick={() => setStep((s) => Math.min(current.length - 1, s + 1))} className="btn-eng-outline" style={{ fontSize: "0.8rem", padding: "6px 12px" }} disabled={step >= current.length - 1}>
            Next
          </button>
          <button onClick={() => setPlaying((p) => !p)} className="btn-eng" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
            {playing ? "Pause" : "Auto-play"}
          </button>
          <button onClick={reset} className="btn-eng-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>
            Reset
          </button>
        </div>
      </div>

      <div className="info-eng" style={{ marginTop: 16, fontSize: "0.85rem" }}>
        <ShieldCheck className="w-4 h-4 inline mr-1" />
        <strong>Why this matters:</strong> in a real network, a single frame walks through several of these devices in sequence. The frame's MAC headers are rewritten at every router; only the IP header survives end-to-end.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Lesson definition                                                  */
/* ================================================================== */

const TABS: EngTabDef[] = [
  { id: "tour", label: "Devices Tour", icon: <Layers className="w-4 h-4" />, content: <DevicesTourTab /> },
  { id: "domains", label: "Domain Visualizer", icon: <Network className="w-4 h-4" />, content: <DomainsTab /> },
  { id: "decision", label: "Frame Decisions", icon: <Eye className="w-4 h-4" />, content: <DecisionTab /> },
];

const QUIZ: EngQuizQuestion[] = [
  {
    question: "You replace a hub connecting 8 hosts with a switch. What changes about the network?",
    options: [
      "Number of broadcast domains goes from 1 to 8",
      "Number of collision domains goes from 1 to 8, broadcast domains stays at 1",
      "Both collision and broadcast domains become 8",
      "Nothing - switches and hubs are functionally identical",
    ],
    correctIndex: 1,
    explanation: "A switch gives each port its own collision domain (so 8 ports → 8 collision domains), but broadcasts still flood the whole switch - only routers (or VLANs) can split broadcast domains.",
  },
  {
    question: "An L2 switch receives a unicast frame whose destination MAC is not in its CAM table. What does it do?",
    options: [
      "Drops the frame",
      "Sends ICMP Destination Unreachable",
      "Floods the frame out of every port except the one it arrived on",
      "Forwards only to the gateway port",
    ],
    correctIndex: 2,
    explanation: "Unknown unicast → flood. The reply will let the switch learn the source MAC and update its CAM table so future frames don't need flooding.",
  },
  {
    question: "Which device decrements the IP TTL field as a packet passes through?",
    options: ["Hub", "Bridge", "L2 Switch", "Router"],
    correctIndex: 3,
    explanation: "Only Layer-3 devices touch the IP header. Routers (and L3 switches when routing between VLANs) decrement TTL by 1 per hop and discard the packet if TTL reaches 0.",
  },
  {
    question: "A network has 4 VLANs configured on a single L3 switch with 24 ports total (6 per VLAN). How many broadcast domains exist?",
    options: ["1", "4", "6", "24"],
    correctIndex: 1,
    explanation: "Each VLAN is its own broadcast domain. 4 VLANs → 4 broadcast domains. Without VLANs you'd have 1; with a router on each VLAN, traffic between them must be routed (which the L3 switch does in hardware).",
  },
  {
    question: "Why does a frame's source and destination MAC change at every router hop, but the source and destination IP do not?",
    options: [
      "Because IP addresses are random and MACs are fixed",
      "Because Ethernet frames are link-local; IP is end-to-end. The router builds a new frame for each link.",
      "Because MAC addresses are stripped by switches",
      "Because routers translate IP via NAT on every hop",
    ],
    correctIndex: 1,
    explanation: "L2 framing is per-link: the router strips the incoming frame and encapsulates the IP packet into a new frame for the next link, with new src MAC (router's egress port) and new dest MAC (next hop's ARP'd MAC). The IP header is end-to-end.",
  },
  {
    question: "You see CSMA/CD collisions on a network segment. Which device replacement would eliminate them?",
    options: [
      "Replace hub with another hub of higher speed",
      "Replace hub with a switch (each port becomes its own collision domain, full-duplex eliminates CSMA/CD)",
      "Add a router in front of the hub",
      "Disable broadcast traffic",
    ],
    correctIndex: 1,
    explanation: "CSMA/CD only matters in shared (half-duplex) collision domains. A switch gives every port a private collision domain, and modern Gigabit links run full-duplex - no contention, no collisions.",
  },
];

export default function CN_L2_NetworkDevicesActivity() {
  return (
    <EngineeringLessonShell
      title="Network Devices - Hub vs Switch vs Router vs L3 Switch"
      level={2}
      lessonNumber={6}
      tabs={TABS}
      quiz={QUIZ}
      nextLessonHint="Network Layer - IPv4 addressing, where routers actually start doing their job."
    />
  );
}
