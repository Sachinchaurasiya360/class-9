"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Layers, Radio, Network, Info, Play, RotateCcw, Pause } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 - NAT Translation Animation                                 */
/* ================================================================== */

interface NATEntry {
  privateIP: string;
  privatePort: number;
  publicIP: string;
  publicPort: number;
  destIP: string;
  destPort: number;
}

function NATTab() {
  const [natTable, setNatTable] = useState<NATEntry[]>([]);
  const [animPhase, setAnimPhase] = useState<"idle" | "outgoing" | "translating" | "forwarded" | "reply">("idle");
  const [currentPacket, setCurrentPacket] = useState<{ src: string; srcPort: number; label: string } | null>(null);
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const devices = [
    { ip: "192.168.1.10", label: "PC-1", y: 60 },
    { ip: "192.168.1.20", label: "PC-2", y: 130 },
    { ip: "192.168.1.30", label: "Phone", y: 200 },
  ];

  const publicIP = "203.0.113.5";
  const destIP = "93.184.216.34";
  let portCounter = useRef(40001);

  const sendPacket = useCallback((deviceIdx: number) => {
    const device = devices[deviceIdx];
    const srcPort = 1024 + Math.floor(Math.random() * 60000);
    setCurrentPacket({ src: device.ip, srcPort, label: device.label });
    setAnimPhase("outgoing");

    if (animRef.current) clearTimeout(animRef.current);

    animRef.current = setTimeout(() => {
      setAnimPhase("translating");

      animRef.current = setTimeout(() => {
        const pubPort = portCounter.current++;
        const entry: NATEntry = {
          privateIP: device.ip,
          privatePort: srcPort,
          publicIP,
          publicPort: pubPort,
          destIP,
          destPort: 80,
        };
        setNatTable((prev) => [...prev.slice(-4), entry]);
        setAnimPhase("forwarded");

        animRef.current = setTimeout(() => {
          setAnimPhase("reply");

          animRef.current = setTimeout(() => {
            setAnimPhase("idle");
            setCurrentPacket(null);
          }, 1200);
        }, 1200);
      }, 1000);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const resetDemo = useCallback(() => {
    if (animRef.current) clearTimeout(animRef.current);
    setAnimPhase("idle");
    setCurrentPacket(null);
    setNatTable([]);
    portCounter.current = 40001;
  }, []);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Click a device to send a packet through NAT. Watch how the private IP/port is translated to a public IP/port. The NAT table records each translation.</span>
      </div>

      {/* NAT Animation */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="tag-eng" style={{
            background: animPhase === "idle" ? "var(--eng-surface)" : "var(--eng-primary-light)",
            color: animPhase === "idle" ? "var(--eng-text-muted)" : "var(--eng-primary)",
          }}>
            {animPhase === "idle" ? "Ready" : animPhase === "outgoing" ? "Sending..." : animPhase === "translating" ? "NAT Translating..." : animPhase === "forwarded" ? "Forwarded to Internet" : "Reply Incoming"}
          </span>
          <button className="btn-eng-outline" onClick={resetDemo} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>

        <svg viewBox="0 0 640 260" style={{ width: "100%", maxHeight: 280 }}>
          {/* Private network area */}
          <rect x={10} y={20} width={190} height={220} rx={8} fill="#3b82f608" stroke="#3b82f6" strokeWidth={1} strokeDasharray="4 4" />
          <text x={105} y={15} textAnchor="middle" fontSize={10} fontWeight={600} fill="#3b82f6" fontFamily="var(--eng-font)">Private Network</text>

          {/* Devices */}
          {devices.map((d, i) => (
            <g key={d.ip} onClick={() => animPhase === "idle" && sendPacket(i)} style={{ cursor: animPhase === "idle" ? "pointer" : "default" }}>
              <rect x={30} y={d.y - 15} width={140} height={36} rx={6}
                fill={currentPacket?.src === d.ip ? "#3b82f620" : "var(--eng-surface)"}
                stroke={currentPacket?.src === d.ip ? "#3b82f6" : "var(--eng-border)"}
                strokeWidth={currentPacket?.src === d.ip ? 2 : 1}
              />
              <text x={60} y={d.y + 3} fontSize={9} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                {d.label}
              </text>
              <text x={60} y={d.y + 15} fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">
                {d.ip}
              </text>
            </g>
          ))}

          {/* NAT Router */}
          <rect x={240} y={80} width={120} height={100} rx={10} fill="#f59e0b15" stroke="#f59e0b" strokeWidth={2} />
          <text x={300} y={110} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f59e0b" fontFamily="var(--eng-font)">NAT Router</text>
          <text x={260} y={135} fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">In: 192.168.1.1</text>
          <text x={260} y={150} fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">Out: {publicIP}</text>
          {animPhase === "translating" && (
            <circle cx={300} cy={165} r={4} fill="#f59e0b">
              <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Internet */}
          <rect x={420} y={80} width={200} height={100} rx={8} fill="#10b98108" stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" />
          <text x={520} y={75} textAnchor="middle" fontSize={10} fontWeight={600} fill="#10b981" fontFamily="var(--eng-font)">Internet</text>
          <rect x={460} y={110} width={120} height={40} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
          <text x={520} y={130} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">Web Server</text>
          <text x={520} y={143} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">{destIP}:80</text>

          {/* Animated packets */}
          {animPhase === "outgoing" && currentPacket && (
            <g>
              <rect width={24} height={12} rx={3} fill="#3b82f6">
                <animateMotion path="M170,130 L240,130" dur="0.8s" fill="freeze" />
              </rect>
            </g>
          )}
          {animPhase === "forwarded" && (
            <g>
              <rect width={24} height={12} rx={3} fill="#f59e0b">
                <animateMotion path="M360,130 L460,130" dur="0.8s" fill="freeze" />
              </rect>
            </g>
          )}
          {animPhase === "reply" && (
            <g>
              <rect width={24} height={12} rx={3} fill="#10b981">
                <animateMotion path="M460,130 L170,130" dur="1s" fill="freeze" />
              </rect>
            </g>
          )}

          {/* Packet header display */}
          {currentPacket && animPhase !== "idle" && (
            <g>
              <rect x={180} y={225} width={280} height={30} rx={4} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
              <text x={200} y={243} fontSize={7} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                {animPhase === "outgoing"
                  ? `Src: ${currentPacket.src}:${currentPacket.srcPort} -> Dst: ${destIP}:80`
                  : animPhase === "forwarded"
                    ? `Src: ${publicIP}:${portCounter.current - 1} -> Dst: ${destIP}:80`
                    : animPhase === "reply"
                      ? `Src: ${destIP}:80 -> Dst: ${publicIP}:${portCounter.current - 1}`
                      : "Translating headers..."
                }
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* NAT Table */}
      <div className="card-eng" style={{ padding: 16, overflowX: "auto" }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
          NAT Translation Table (PAT/NAPT)
        </p>
        {natTable.length === 0 ? (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Click a device to create a translation entry...
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.75rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                {["Private IP", "Private Port", "Public IP", "Public Port", "Dest IP", "Dest Port"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {natTable.map((entry, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)", background: i === natTable.length - 1 ? "#f59e0b08" : "transparent" }}>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.privateIP}</td>
                  <td style={{ padding: "6px 8px" }}>{entry.privatePort}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace", color: "#f59e0b" }}>{entry.publicIP}</td>
                  <td style={{ padding: "6px 8px", color: "#f59e0b" }}>{entry.publicPort}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.destIP}</td>
                  <td style={{ padding: "6px 8px" }}>{entry.destPort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - ICMP: Ping & Traceroute                                    */
/* ================================================================== */

function ICMPTab() {
  const [mode, setMode] = useState<"ping" | "traceroute">("ping");
  const [isRunning, setIsRunning] = useState(false);
  const [pingResults, setPingResults] = useState<{ seq: number; rtt: number; status: string }[]>([]);
  const [traceHops, setTraceHops] = useState<{ hop: number; ip: string; rtt: number; ttl: number; label: string }[]>([]);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const traceRoute = [
    { ip: "192.168.1.1", label: "Home Router" },
    { ip: "10.0.0.1", label: "ISP Gateway" },
    { ip: "72.14.209.89", label: "ISP Core" },
    { ip: "108.170.240.1", label: "Google Edge" },
    { ip: "8.8.8.8", label: "Destination" },
  ];

  const runPing = useCallback(() => {
    if (isRunning) {
      if (animRef.current) clearInterval(animRef.current);
      setIsRunning(false);
      return;
    }
    setPingResults([]);
    setIsRunning(true);
    let seq = 0;

    animRef.current = setInterval(() => {
      seq++;
      if (seq > 6) {
        if (animRef.current) clearInterval(animRef.current);
        setIsRunning(false);
        return;
      }
      const rtt = 10 + Math.random() * 40;
      setPingResults((prev) => [...prev, { seq, rtt: Math.round(rtt * 10) / 10, status: "Reply" }]);
    }, 700);
  }, [isRunning]);

  const runTraceroute = useCallback(() => {
    if (isRunning) {
      if (animRef.current) clearInterval(animRef.current);
      setIsRunning(false);
      return;
    }
    setTraceHops([]);
    setIsRunning(true);
    let hop = 0;

    animRef.current = setInterval(() => {
      if (hop >= traceRoute.length) {
        if (animRef.current) clearInterval(animRef.current);
        setIsRunning(false);
        return;
      }
      const r = traceRoute[hop];
      setTraceHops((prev) => [...prev, {
        hop: hop + 1,
        ip: r.ip,
        rtt: Math.round((15 + hop * 12 + Math.random() * 10) * 10) / 10,
        ttl: hop + 1,
        label: r.label,
      }]);
      hop++;
    }, 900);
  }, [isRunning]);

  useEffect(() => {
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, []);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>ICMP (Internet Control Message Protocol) provides network diagnostics. Ping tests reachability with echo request/reply. Traceroute maps the path using TTL expiry.</span>
      </div>

      {/* Mode selector */}
      <div style={{ display: "flex", gap: 8 }}>
        <button className={mode === "ping" ? "btn-eng" : "btn-eng-outline"} onClick={() => { setMode("ping"); setPingResults([]); setTraceHops([]); }} style={{ fontSize: "0.85rem" }}>
          Ping (Echo)
        </button>
        <button className={mode === "traceroute" ? "btn-eng" : "btn-eng-outline"} onClick={() => { setMode("traceroute"); setPingResults([]); setTraceHops([]); }} style={{ fontSize: "0.85rem" }}>
          Traceroute (TTL)
        </button>
      </div>

      {mode === "ping" ? (
        <div className="card-eng" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--eng-text)" }}>ping 8.8.8.8</span>
            <button className="btn-eng" onClick={runPing} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
              {isRunning ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5" /> Run</>}
            </button>
          </div>

          {/* Ping animation */}
          <svg viewBox="0 0 600 100" style={{ width: "100%", maxHeight: 100, marginBottom: 12 }}>
            {/* Source */}
            <rect x={30} y={30} width={80} height={40} rx={6} fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={70} y={50} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">Your PC</text>
            <text x={70} y={62} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">192.168.1.10</text>

            {/* Destination */}
            <rect x={490} y={30} width={80} height={40} rx={6} fill="var(--eng-surface)" stroke="#10b981" strokeWidth={1.5} />
            <text x={530} y={50} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">DNS Server</text>
            <text x={530} y={62} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">8.8.8.8</text>

            {/* Connection line */}
            <line x1={112} y1={50} x2={488} y2={50} stroke="var(--eng-border)" strokeWidth={1} />

            {/* Animated echo request */}
            {isRunning && (
              <>
                <circle r={5} fill="#3b82f6">
                  <animateMotion path="M112,50 L488,50" dur="0.5s" repeatCount="indefinite" />
                </circle>
                <circle r={5} fill="#10b981">
                  <animateMotion path="M488,50 L112,50" dur="0.5s" repeatCount="indefinite" />
                </circle>
              </>
            )}

            {/* Labels */}
            <text x={300} y={30} textAnchor="middle" fontSize={8} fill="#3b82f6" fontFamily="var(--eng-font)">Echo Request (Type 8)</text>
            <text x={300} y={80} textAnchor="middle" fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">Echo Reply (Type 0)</text>
          </svg>

          {/* Ping results */}
          {pingResults.length > 0 && (
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--eng-text)", background: "#0f172a", borderRadius: 8, padding: 12 }}>
              {pingResults.map((p) => (
                <div key={p.seq} style={{ color: "#10b981", marginBottom: 2 }}>
                  {p.status} from 8.8.8.8: icmp_seq={p.seq} ttl=117 time={p.rtt}ms
                </div>
              ))}
              {!isRunning && pingResults.length > 0 && (
                <div style={{ color: "#94a3b8", marginTop: 8, borderTop: "1px solid #334155", paddingTop: 8 }}>
                  --- 8.8.8.8 ping statistics ---
                  <br />
                  {pingResults.length} packets transmitted, {pingResults.length} received, 0% loss
                  <br />
                  avg rtt = {(pingResults.reduce((s, p) => s + p.rtt, 0) / pingResults.length).toFixed(1)}ms
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="card-eng" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--eng-text)" }}>traceroute 8.8.8.8</span>
            <button className="btn-eng" onClick={runTraceroute} style={{ fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 4 }}>
              {isRunning ? <><Pause className="w-3.5 h-3.5" /> Stop</> : <><Play className="w-3.5 h-3.5" /> Run</>}
            </button>
          </div>

          {/* Traceroute visualization */}
          <svg viewBox="0 0 600 140" style={{ width: "100%", maxHeight: 140, marginBottom: 12 }}>
            {traceRoute.map((hop, i) => {
              const x = 60 + i * 120;
              const discovered = i < traceHops.length;
              return (
                <g key={i}>
                  {i > 0 && (
                    <line x1={x - 60} y1={50} x2={x} y2={50}
                      stroke={discovered ? "#10b981" : "var(--eng-border)"}
                      strokeWidth={discovered ? 2 : 1}
                      style={{ transition: "all 0.3s" }}
                    />
                  )}
                  <circle cx={x} cy={50} r={discovered ? 16 : 12}
                    fill={discovered ? (i === traceRoute.length - 1 ? "#10b981" : "#3b82f6") : "var(--eng-surface)"}
                    stroke={discovered ? (i === traceRoute.length - 1 ? "#10b981" : "#3b82f6") : "var(--eng-border)"}
                    strokeWidth={1.5}
                    style={{ transition: "all 0.3s" }}
                  />
                  <text x={x} y={54} textAnchor="middle" fontSize={8} fontWeight={700}
                    fill={discovered ? "#fff" : "var(--eng-text-muted)"} fontFamily="var(--eng-font)">
                    {i + 1}
                  </text>
                  {discovered && (
                    <>
                      <text x={x} y={80} textAnchor="middle" fontSize={7} fill="var(--eng-text)" fontFamily="var(--eng-font)" fontWeight={500}>
                        {hop.label}
                      </text>
                      <text x={x} y={92} textAnchor="middle" fontSize={6.5} fill="var(--eng-text-muted)" fontFamily="monospace">
                        {hop.ip}
                      </text>
                    </>
                  )}
                  {/* TTL label */}
                  <text x={x} y={30} textAnchor="middle" fontSize={7} fill={discovered ? "#f59e0b" : "var(--eng-border)"} fontFamily="var(--eng-font)">
                    TTL={i + 1}
                  </text>
                </g>
              );
            })}
            {/* Animated packet with decrementing TTL */}
            {isRunning && traceHops.length < traceRoute.length && (
              <circle r={4} fill="#f59e0b">
                <animateMotion
                  path={`M60,50 L${60 + traceHops.length * 120},50`}
                  dur="0.7s" repeatCount="indefinite"
                />
              </circle>
            )}
          </svg>

          {/* Traceroute terminal output */}
          {traceHops.length > 0 && (
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "var(--eng-text)", background: "#0f172a", borderRadius: 8, padding: 12 }}>
              <div style={{ color: "#94a3b8", marginBottom: 4 }}>traceroute to 8.8.8.8, 30 hops max</div>
              {traceHops.map((h) => (
                <div key={h.hop} style={{ color: h.hop === traceRoute.length ? "#10b981" : "#3b82f6", marginBottom: 2 }}>
                  {h.hop}  {h.ip} ({h.label})  {h.rtt}ms  TTL={h.ttl}
                </div>
              ))}
            </div>
          )}

          {/* TTL explanation */}
          <div style={{ marginTop: 12, padding: 12, borderRadius: 8, border: "1px solid var(--eng-border)", background: "var(--eng-surface)", fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            <strong style={{ color: "var(--eng-text)" }}>How Traceroute Works:</strong> Sends packets with increasing TTL (1, 2, 3...). Each router decrements TTL by 1. When TTL reaches 0, the router sends back an ICMP Time Exceeded (Type 11) message, revealing its IP address.
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - ARP Request/Reply Animation                                */
/* ================================================================== */

function ARPTab() {
  const [arpTable, setArpTable] = useState<{ ip: string; mac: string; type: string }[]>([]);
  const [phase, setPhase] = useState<"idle" | "request" | "reply" | "done">("idle");
  const [targetIP, setTargetIP] = useState("192.168.1.20");
  const animRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const localDevices = [
    { ip: "192.168.1.10", mac: "AA:BB:CC:11:22:33", label: "Your PC", x: 100, y: 80 },
    { ip: "192.168.1.20", mac: "DD:EE:FF:44:55:66", label: "Server", x: 320, y: 80 },
    { ip: "192.168.1.30", mac: "11:22:33:AA:BB:CC", label: "Printer", x: 540, y: 80 },
    { ip: "192.168.1.1", mac: "44:55:66:DD:EE:FF", label: "Router", x: 320, y: 200 },
  ];

  const startARP = useCallback(() => {
    setPhase("request");
    setArpTable([]);

    if (animRef.current) clearTimeout(animRef.current);

    animRef.current = setTimeout(() => {
      setPhase("reply");

      animRef.current = setTimeout(() => {
        const target = localDevices.find((d) => d.ip === targetIP);
        if (target) {
          setArpTable([{ ip: target.ip, mac: target.mac, type: "Dynamic" }]);
        }
        setPhase("done");
      }, 1500);
    }, 1500);
  }, [targetIP]);

  useEffect(() => {
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  const resetARP = useCallback(() => {
    if (animRef.current) clearTimeout(animRef.current);
    setPhase("idle");
    setArpTable([]);
  }, []);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>ARP (Address Resolution Protocol) maps IP addresses to MAC addresses on a local network. It uses broadcast requests and unicast replies.</span>
      </div>

      {/* Controls */}
      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Target IP
            </label>
            <select
              value={targetIP}
              onChange={(e) => setTargetIP(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
            >
              {localDevices.filter((d) => d.ip !== "192.168.1.10").map((d) => (
                <option key={d.ip} value={d.ip}>{d.ip} ({d.label})</option>
              ))}
            </select>
          </div>
          <button className="btn-eng" onClick={startARP} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }} disabled={phase !== "idle" && phase !== "done"}>
            <Play className="w-4 h-4" /> Send ARP
          </button>
          <button className="btn-eng-outline" onClick={resetARP} style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 4 }}>
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* ARP Animation */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="tag-eng" style={{
            background: phase === "request" ? "#f59e0b20" : phase === "reply" ? "#10b98120" : phase === "done" ? "#3b82f620" : "var(--eng-surface)",
            color: phase === "request" ? "#f59e0b" : phase === "reply" ? "#10b981" : phase === "done" ? "#3b82f6" : "var(--eng-text-muted)",
          }}>
            {phase === "idle" ? "Ready" : phase === "request" ? "ARP Request (Broadcast)" : phase === "reply" ? "ARP Reply (Unicast)" : "ARP Table Updated"}
          </span>
        </div>

        <svg viewBox="0 0 640 260" style={{ width: "100%", maxHeight: 280 }}>
          {/* Network switch in center */}
          <rect x={270} y={130} width={100} height={30} rx={4} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
          <text x={320} y={150} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">Switch</text>

          {/* Devices */}
          {localDevices.map((d) => {
            const isSource = d.ip === "192.168.1.10";
            const isTarget = d.ip === targetIP;
            return (
              <g key={d.ip}>
                <rect x={d.x - 50} y={d.y - 20} width={100} height={46} rx={6}
                  fill={isSource ? "#3b82f610" : isTarget && (phase === "reply" || phase === "done") ? "#10b98110" : "var(--eng-surface)"}
                  stroke={isSource ? "#3b82f6" : isTarget ? "#10b981" : "var(--eng-border)"}
                  strokeWidth={isSource || isTarget ? 2 : 1}
                />
                <text x={d.x} y={d.y - 2} textAnchor="middle" fontSize={9} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                  {d.label}
                </text>
                <text x={d.x} y={d.y + 10} textAnchor="middle" fontSize={7} fill="var(--eng-text-muted)" fontFamily="monospace">
                  {d.ip}
                </text>
                <text x={d.x} y={d.y + 20} textAnchor="middle" fontSize={6} fill="var(--eng-text-muted)" fontFamily="monospace">
                  {d.mac}
                </text>
                {/* Connection to switch */}
                <line x1={d.x} y1={d.y + 26} x2={320} y2={130}
                  stroke="var(--eng-border)" strokeWidth={1} />
              </g>
            );
          })}

          {/* Broadcast animation */}
          {phase === "request" && (
            <>
              {localDevices.filter((d) => d.ip !== "192.168.1.10").map((d) => (
                <circle key={d.ip} r={5} fill="#f59e0b" opacity={0.8}>
                  <animateMotion
                    path={`M100,106 L320,130 L${d.x},${d.y + 26}`}
                    dur="1.2s" repeatCount="indefinite"
                  />
                </circle>
              ))}
              {/* Broadcast expanding ring */}
              <circle cx={320} cy={145} r={10} fill="none" stroke="#f59e0b" strokeWidth={1.5} opacity={0.6}>
                <animate attributeName="r" values="20;80" dur="1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
              </circle>
            </>
          )}

          {/* Unicast reply */}
          {phase === "reply" && (
            <circle r={6} fill="#10b981">
              <animateMotion
                path={`M${localDevices.find((d) => d.ip === targetIP)?.x || 320},${(localDevices.find((d) => d.ip === targetIP)?.y || 80) + 26} L320,130 L100,106`}
                dur="1.2s" repeatCount="indefinite"
              />
            </circle>
          )}

          {/* Packet info */}
          {phase === "request" && (
            <g>
              <rect x={170} y={225} width={300} height={28} rx={4} fill="#f59e0b10" stroke="#f59e0b" strokeWidth={1} />
              <text x={320} y={243} textAnchor="middle" fontSize={8} fill="#f59e0b" fontFamily="var(--eng-font)">
                ARP Request: &quot;Who has {targetIP}? Tell 192.168.1.10&quot; (Broadcast: FF:FF:FF:FF:FF:FF)
              </text>
            </g>
          )}
          {phase === "reply" && (
            <g>
              <rect x={170} y={225} width={300} height={28} rx={4} fill="#10b98110" stroke="#10b981" strokeWidth={1} />
              <text x={320} y={243} textAnchor="middle" fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">
                ARP Reply: &quot;{targetIP} is at {localDevices.find((d) => d.ip === targetIP)?.mac}&quot; (Unicast)
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* ARP Table */}
      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
          ARP Cache (Your PC)
        </p>
        {arpTable.length === 0 ? (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            ARP cache is empty. Send an ARP request to discover a MAC address.
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                {["IP Address", "MAC Address", "Type"].map((h) => (
                  <th key={h} style={{ padding: "6px 8px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {arpTable.map((entry, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace" }}>{entry.ip}</td>
                  <td style={{ padding: "6px 8px", fontFamily: "monospace", color: "#10b981" }}>{entry.mac}</td>
                  <td style={{ padding: "6px 8px" }}>{entry.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ARP Process Summary */}
      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
          ARP Process Summary
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { step: "1", text: "Host needs MAC for known IP", color: "#3b82f6" },
            { step: "2", text: "Sends ARP Request (broadcast)", color: "#f59e0b" },
            { step: "3", text: "Target sends ARP Reply (unicast)", color: "#10b981" },
            { step: "4", text: "Sender caches IP-MAC mapping", color: "#8b5cf6" },
          ].map((s) => (
            <div key={s.step} className="card-eng" style={{ flex: "1 1 140px", padding: 10, borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "1rem", fontWeight: 700, color: s.color, marginBottom: 4 }}>Step {s.step}</div>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>{s.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "In NAT (PAT/NAPT), what does the router change in outgoing packets?",
    options: [
      "Only the destination IP",
      "The source IP and port number",
      "Only the MAC address",
      "The TTL field only",
    ],
    correctIndex: 1,
    explanation: "In PAT (Port Address Translation), the NAT router replaces the private source IP and port with the public IP and a mapped port number.",
  },
  {
    question: "What ICMP message type is used for Ping echo request?",
    options: ["Type 0", "Type 3", "Type 8", "Type 11"],
    correctIndex: 2,
    explanation: "ICMP Type 8 is Echo Request (ping), and Type 0 is Echo Reply.",
  },
  {
    question: "How does traceroute discover each hop?",
    options: [
      "By sending packets with increasing TTL values",
      "By reading the routing table at each router",
      "By using ARP at each hop",
      "By using DNS lookups",
    ],
    correctIndex: 0,
    explanation: "Traceroute sends packets with TTL=1, TTL=2, etc. Each router decrements TTL and sends back ICMP Time Exceeded when TTL reaches 0.",
  },
  {
    question: "ARP Request messages are sent as:",
    options: ["Unicast", "Broadcast", "Multicast", "Anycast"],
    correctIndex: 1,
    explanation: "ARP Requests are broadcast (FF:FF:FF:FF:FF:FF) to all devices on the local network, since the sender does not know the target's MAC address.",
  },
  {
    question: "Which protocol operates between the Network layer and Data Link layer?",
    options: ["TCP", "UDP", "ARP", "ICMP"],
    correctIndex: 2,
    explanation: "ARP operates between Layer 2 (Data Link) and Layer 3 (Network), resolving IP addresses to MAC addresses.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "nat", label: "NAT", icon: <Layers className="w-4 h-4" />, content: <NATTab /> },
  { id: "icmp", label: "ICMP", icon: <Radio className="w-4 h-4" />, content: <ICMPTab /> },
  { id: "arp", label: "ARP", icon: <Network className="w-4 h-4" />, content: <ARPTab /> },
];

export default function CN_L3_NATICMPARPActivity() {
  return (
    <EngineeringLessonShell
      title="NAT, ICMP & ARP"
      level={3}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="TCP - Connection Management (Transport Layer)"
      placementRelevance="Medium"
    />
  );
}
