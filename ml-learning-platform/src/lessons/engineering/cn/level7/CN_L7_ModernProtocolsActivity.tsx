"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowRight, ArrowLeftRight, Radio, Network, Zap, MessageSquare, FileCode, BarChart3, Check } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1 - WebSocket vs REST                                         */
/* ------------------------------------------------------------------ */

function WebSocketTab() {
  const [mode, setMode] = useState<"rest" | "websocket">("rest");
  const [restMessages, setRestMessages] = useState<{ id: number; type: "req" | "res"; time: number }[]>([]);
  const [wsMessages, setWsMessages] = useState<{ id: number; direction: "client" | "server"; text: string; time: number }[]>([]);
  const [restRunning, setRestRunning] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsRunning, setWsRunning] = useState(false);
  const [restLatency, setRestLatency] = useState(0);
  const [wsLatency, setWsLatency] = useState(0);
  const nextId = useRef(0);

  // REST polling simulation
  useEffect(() => {
    if (!restRunning) return;
    let count = 0;
    const interval = setInterval(() => {
      const id = nextId.current++;
      setRestMessages((prev) => [...prev.slice(-8), { id, type: "req", time: Date.now() }]);
      setRestLatency((l) => l + 120);
      setTimeout(() => {
        const hasData = Math.random() > 0.6;
        setRestMessages((prev) => [...prev.slice(-8), { id: id + 0.5, type: "res", time: Date.now() }]);
        if (!hasData) setRestLatency((l) => l + 50);
      }, 400);
      count++;
      if (count > 10) { setRestRunning(false); clearInterval(interval); }
    }, 1000);
    return () => clearInterval(interval);
  }, [restRunning]);

  // WebSocket simulation
  useEffect(() => {
    if (!wsRunning || !wsConnected) return;
    const serverMsgs = [
      "New message from Alice",
      "User Bob went online",
      "Price update: $42.50",
      "Notification: 3 likes",
      "Chat: Hello there!",
      "System: Server healthy",
    ];
    let i = 0;
    const interval = setInterval(() => {
      const id = nextId.current++;
      const isServer = Math.random() > 0.3;
      setWsMessages((prev) => [...prev.slice(-8), {
        id,
        direction: isServer ? "server" : "client",
        text: isServer ? serverMsgs[i % serverMsgs.length] : "Typing...",
        time: Date.now(),
      }]);
      setWsLatency((l) => l + 15);
      i++;
      if (i > 10) { setWsRunning(false); clearInterval(interval); }
    }, 600);
    return () => clearInterval(interval);
  }, [wsRunning, wsConnected]);

  const startRest = () => {
    setRestMessages([]);
    setRestLatency(0);
    setRestRunning(true);
  };

  const startWs = () => {
    setWsMessages([]);
    setWsLatency(0);
    if (!wsConnected) {
      setWsConnected(true);
      setTimeout(() => setWsRunning(true), 500);
    } else {
      setWsRunning(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>REST Polling vs WebSocket:</strong> REST requires repeated request-response cycles
        to check for new data. WebSocket opens a persistent bidirectional channel after an initial
        HTTP upgrade handshake. Compare the overhead and latency!
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* REST Panel */}
        <div className="card-eng" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: 0 }}>
              REST Polling
            </h4>
            <button
              className="btn-eng-outline"
              onClick={startRest}
              disabled={restRunning}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >
              {restRunning ? "Polling..." : "Start Polling"}
            </button>
          </div>

          <svg viewBox="0 0 280 200" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
            {/* Client */}
            <rect x={10} y={20} width={60} height={160} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={40} y={14} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">Client</text>

            {/* Server */}
            <rect x={210} y={20} width={60} height={160} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={240} y={14} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">Server</text>

            {/* Message arrows */}
            {restMessages.slice(-6).map((msg, i) => {
              const y = 30 + i * 25;
              const isReq = msg.type === "req";
              return (
                <g key={msg.id} className="eng-fadeIn">
                  <line
                    x1={isReq ? 70 : 210} y1={y}
                    x2={isReq ? 210 : 70} y2={y}
                    stroke={isReq ? "var(--eng-primary)" : "var(--eng-success)"}
                    strokeWidth={1.5}
                    markerEnd={`url(#${isReq ? "restReqArrow" : "restResArrow"})`}
                  />
                  <text
                    x={140} y={y - 4}
                    textAnchor="middle" fontSize="7"
                    fill={isReq ? "var(--eng-primary)" : "var(--eng-success)"}
                    fontFamily="var(--eng-font)"
                  >
                    {isReq ? "GET /messages" : "200 OK"}
                  </text>
                </g>
              );
            })}

            <defs>
              <marker id="restReqArrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <path d="M0,0 L6,2.5 L0,5 Z" fill="var(--eng-primary)" />
              </marker>
              <marker id="restResArrow" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto">
                <path d="M6,0 L0,2.5 L6,5 Z" fill="var(--eng-success)" />
              </marker>
            </defs>
          </svg>

          <div style={{ marginTop: 8, fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
            Overhead: {restMessages.length} HTTP requests | Accumulated latency: ~{restLatency}ms
          </div>
        </div>

        {/* WebSocket Panel */}
        <div className="card-eng" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: 0 }}>
              WebSocket
            </h4>
            <button
              className="btn-eng-outline"
              onClick={startWs}
              disabled={wsRunning}
              style={{ fontSize: "0.75rem", padding: "4px 10px" }}
            >
              {wsRunning ? "Connected..." : wsConnected ? "Resume" : "Connect"}
            </button>
          </div>

          <svg viewBox="0 0 280 200" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
            {/* Client */}
            <rect x={10} y={20} width={60} height={160} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={40} y={14} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">Client</text>

            {/* Server */}
            <rect x={210} y={20} width={60} height={160} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={240} y={14} textAnchor="middle" fontSize="9" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">Server</text>

            {/* Upgrade handshake */}
            {wsConnected && (
              <g className="eng-fadeIn">
                <line x1={70} y1={30} x2={210} y2={30} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={140} y={26} textAnchor="middle" fontSize="7" fill="#8b5cf6" fontFamily="var(--eng-font)">
                  Upgrade: websocket
                </text>
                <line x1={210} y1={38} x2={70} y2={38} stroke="#8b5cf6" strokeWidth={1.5} strokeDasharray="3,2" />
                <text x={140} y={50} textAnchor="middle" fontSize="7" fill="#8b5cf6" fontFamily="var(--eng-font)">
                  101 Switching Protocols
                </text>

                {/* Persistent connection line */}
                <line x1={70} y1={55} x2={210} y2={55} stroke="var(--eng-success)" strokeWidth={2} />
                <line x1={70} y1={55} x2={70} y2={180} stroke="var(--eng-success)" strokeWidth={2} opacity={0.3} />
                <line x1={210} y1={55} x2={210} y2={180} stroke="var(--eng-success)" strokeWidth={2} opacity={0.3} />
              </g>
            )}

            {/* Bidirectional messages */}
            {wsMessages.slice(-5).map((msg, i) => {
              const y = 65 + i * 24;
              const isClient = msg.direction === "client";
              return (
                <g key={msg.id} className="eng-fadeIn">
                  <line
                    x1={isClient ? 70 : 210} y1={y}
                    x2={isClient ? 210 : 70} y2={y}
                    stroke={isClient ? "var(--eng-primary)" : "var(--eng-success)"}
                    strokeWidth={1.5}
                    markerEnd={`url(#${isClient ? "wsClientArrow" : "wsServerArrow"})`}
                  />
                  <text
                    x={140} y={y - 4}
                    textAnchor="middle" fontSize="6.5"
                    fill={isClient ? "var(--eng-primary)" : "var(--eng-success)"}
                    fontFamily="var(--eng-font)"
                  >
                    {msg.text}
                  </text>
                </g>
              );
            })}

            <defs>
              <marker id="wsClientArrow" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                <path d="M0,0 L6,2.5 L0,5 Z" fill="var(--eng-primary)" />
              </marker>
              <marker id="wsServerArrow" markerWidth="6" markerHeight="5" refX="0" refY="2.5" orient="auto">
                <path d="M6,0 L0,2.5 L6,5 Z" fill="var(--eng-success)" />
              </marker>
            </defs>
          </svg>

          <div style={{ marginTop: 8, fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
            1 connection, {wsMessages.length} messages | Accumulated latency: ~{wsLatency}ms
          </div>
        </div>
      </div>

      {/* Key differences */}
      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Key Differences
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ padding: 10, background: "rgba(59,130,246,0.05)", borderRadius: 8, border: "1px solid rgba(59,130,246,0.15)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 6 }}>REST Polling</div>
            <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>New HTTP connection per request</li>
              <li>High overhead (headers each time)</li>
              <li>Server cannot push data</li>
              <li>Simple to implement</li>
            </ul>
          </div>
          <div style={{ padding: 10, background: "rgba(16,185,129,0.05)", borderRadius: 8, border: "1px solid rgba(16,185,129,0.15)" }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 700, color: "var(--eng-success)", marginBottom: 6 }}>WebSocket</div>
            <ul style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: 0, paddingLeft: 16, lineHeight: 1.8 }}>
              <li>Single persistent connection</li>
              <li>Minimal overhead per message</li>
              <li>True bidirectional communication</li>
              <li>Perfect for real-time apps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - gRPC & Protocol Buffers                                    */
/* ------------------------------------------------------------------ */

function GRPCTab() {
  const [showComparison, setShowComparison] = useState(false);
  const [activeStream, setActiveStream] = useState<number | null>(null);
  const [streamMessages, setStreamMessages] = useState<{ stream: number; msg: string }[]>([]);

  useEffect(() => {
    if (activeStream === null) return;
    const msgs = [
      ["GetUser", "UserResponse{id:1,name:'Alice'}"],
      ["ListOrders", "Order{id:101,total:42.5}"],
      ["ListOrders", "Order{id:102,total:18.9}"],
      ["UpdateStatus", "Status{ok:true}"],
    ];
    let i = 0;
    const interval = setInterval(() => {
      if (i >= msgs.length) { clearInterval(interval); setActiveStream(null); return; }
      setStreamMessages((prev) => [...prev, { stream: i % 2, msg: `Stream ${i % 2}: ${msgs[i][0]} -> ${msgs[i][1]}` }]);
      i++;
    }, 700);
    return () => clearInterval(interval);
  }, [activeStream]);

  const jsonExample = `{
  "user": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "age": 25,
    "active": true
  }
}`;

  const protoExample = `message User {
  int32 id = 1;
  string name = 2;
  string email = 3;
  int32 age = 4;
  bool active = 5;
}`;

  const protoBinary = "08 01 12 05 41 6C 69 63 65 1A 11 ...";

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>gRPC (Google Remote Procedure Call):</strong> Uses Protocol Buffers for compact binary
        serialization and HTTP/2 for multiplexed streams. Much faster and more efficient than JSON over REST.
      </div>

      {/* Protobuf vs JSON comparison */}
      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: 0 }}>
            Protocol Buffers vs JSON
          </h4>
          <button
            className="btn-eng-outline"
            onClick={() => setShowComparison(!showComparison)}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            {showComparison ? "Hide" : "Show"} Size Comparison
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", marginBottom: 4 }}>
              JSON (text format) - {jsonExample.length} bytes
            </div>
            <pre style={{
              fontFamily: "monospace", fontSize: "0.7rem", color: "var(--eng-text)",
              background: "var(--eng-bg)", padding: 10, borderRadius: 6,
              border: "1px solid var(--eng-border)", overflow: "auto", margin: 0,
            }}>
              {jsonExample}
            </pre>
          </div>
          <div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", marginBottom: 4 }}>
              Proto Definition
            </div>
            <pre style={{
              fontFamily: "monospace", fontSize: "0.7rem", color: "var(--eng-text)",
              background: "var(--eng-bg)", padding: 10, borderRadius: 6,
              border: "1px solid var(--eng-border)", overflow: "auto", margin: 0,
            }}>
              {protoExample}
            </pre>
          </div>
        </div>

        {showComparison && (
          <div className="eng-fadeIn" style={{ marginTop: 16 }}>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", marginBottom: 8 }}>
              Wire format comparison:
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--eng-danger)", marginBottom: 4, fontFamily: "var(--eng-font)" }}>JSON: ~{jsonExample.length} bytes (text)</div>
                <div style={{ height: 20, background: "#fee2e2", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: "100%", height: "100%", background: "var(--eng-danger)", borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.7rem", color: "var(--eng-success)", marginBottom: 4, fontFamily: "var(--eng-font)" }}>Protobuf: ~22 bytes (binary)</div>
                <div style={{ height: 20, background: "#d1fae5", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: `${(22 / jsonExample.length) * 100}%`, height: "100%", background: "var(--eng-success)", borderRadius: 4 }} />
                </div>
              </div>
            </div>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-success)", marginTop: 8, fontWeight: 600 }}>
              Protobuf is ~{Math.round((1 - 22 / jsonExample.length) * 100)}% smaller!
            </p>
            <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "var(--eng-text-muted)", marginTop: 4, background: "var(--eng-bg)", padding: 6, borderRadius: 4 }}>
              Binary: {protoBinary}
            </div>
          </div>
        )}
      </div>

      {/* HTTP/2 Multiplexing */}
      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: 0 }}>
            HTTP/2 Multiplexed Streams
          </h4>
          <button
            className="btn-eng"
            onClick={() => { setStreamMessages([]); setActiveStream(0); }}
            disabled={activeStream !== null}
            style={{ fontSize: "0.75rem", padding: "4px 10px" }}
          >
            <Zap className="w-3 h-3" style={{ marginRight: 3 }} />
            {activeStream !== null ? "Streaming..." : "Start Streams"}
          </button>
        </div>

        <svg viewBox="0 0 600 180" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {/* Client */}
          <rect x={20} y={40} width={80} height={100} rx={8} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
          <text x={60} y={30} textAnchor="middle" fontSize="10" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">gRPC Client</text>

          {/* Server */}
          <rect x={500} y={40} width={80} height={100} rx={8} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
          <text x={540} y={30} textAnchor="middle" fontSize="10" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">gRPC Server</text>

          {/* Single TCP connection */}
          <rect x={120} y={70} width={360} height={40} rx={6} fill="rgba(59,130,246,0.06)" stroke="var(--eng-primary)" strokeWidth={1} strokeDasharray="6,3" />
          <text x={300} y={65} textAnchor="middle" fontSize="8" fill="var(--eng-primary)" fontFamily="var(--eng-font)" fontWeight={600}>
            Single TCP Connection (HTTP/2)
          </text>

          {/* Stream 0 */}
          <line x1={130} y1={80} x2={470} y2={80} stroke="var(--eng-success)" strokeWidth={2}>
            {activeStream !== null && (
              <animate attributeName="strokeDasharray" values="0,600;600,0" dur="1.5s" repeatCount="indefinite" />
            )}
          </line>
          <text x={300} y={78} textAnchor="middle" fontSize="7" fill="var(--eng-success)" fontFamily="var(--eng-font)">Stream 0: GetUser</text>

          {/* Stream 1 */}
          <line x1={130} y1={100} x2={470} y2={100} stroke="#8b5cf6" strokeWidth={2}>
            {activeStream !== null && (
              <animate attributeName="strokeDasharray" values="0,600;600,0" dur="1.2s" repeatCount="indefinite" />
            )}
          </line>
          <text x={300} y={98} textAnchor="middle" fontSize="7" fill="#8b5cf6" fontFamily="var(--eng-font)">Stream 1: ListOrders (server streaming)</text>

          {/* Animated frames */}
          {activeStream !== null && (
            <>
              <rect r="0" width="12" height="8" rx="2" fill="var(--eng-success)">
                <animateMotion path="M130,76 L470,76" dur="0.8s" repeatCount="indefinite" />
              </rect>
              <rect width="12" height="8" rx="2" fill="#8b5cf6">
                <animateMotion path="M470,96 L130,96" dur="0.6s" repeatCount="indefinite" />
              </rect>
            </>
          )}

          {/* Labels */}
          <text x={300} y={135} textAnchor="middle" fontSize="9" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            Multiple streams share one connection - no head-of-line blocking
          </text>
        </svg>

        {/* Stream log */}
        {streamMessages.length > 0 && (
          <div className="eng-fadeIn" style={{ marginTop: 12, maxHeight: 100, overflowY: "auto", fontFamily: "monospace", fontSize: "0.7rem", background: "var(--eng-bg)", padding: 8, borderRadius: 6, border: "1px solid var(--eng-border)" }}>
            {streamMessages.map((m, i) => (
              <div key={i} style={{ color: m.stream === 0 ? "var(--eng-success)" : "#8b5cf6", padding: "2px 0" }}>
                {m.msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* gRPC service definition */}
      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          gRPC Service Definition
        </h4>
        <pre style={{
          fontFamily: "monospace", fontSize: "0.75rem", color: "var(--eng-text)",
          background: "var(--eng-bg)", padding: 12, borderRadius: 6,
          border: "1px solid var(--eng-border)", overflow: "auto", margin: 0, lineHeight: 1.6,
        }}>
{`service UserService {
  rpc GetUser(UserRequest) returns (User);           // Unary
  rpc ListUsers(Filter) returns (stream User);       // Server streaming
  rpc UploadPhotos(stream Photo) returns (Summary);  // Client streaming
  rpc Chat(stream Msg) returns (stream Msg);         // Bidirectional
}`}
        </pre>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginTop: 8 }}>
          gRPC supports four patterns: unary, server streaming, client streaming, and bidirectional streaming.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Protocol Comparison                                        */
/* ------------------------------------------------------------------ */

interface ProtocolInfo {
  name: string;
  color: string;
  latency: number;    // ms relative
  bandwidth: number;  // relative 1-10
  bidirectional: boolean;
  persistent: boolean;
  bestFor: string[];
}

const protocols: ProtocolInfo[] = [
  {
    name: "REST",
    color: "var(--eng-primary)",
    latency: 80,
    bandwidth: 7,
    bidirectional: false,
    persistent: false,
    bestFor: ["CRUD APIs", "Public APIs", "Simple integrations"],
  },
  {
    name: "WebSocket",
    color: "var(--eng-success)",
    latency: 15,
    bandwidth: 3,
    bidirectional: true,
    persistent: true,
    bestFor: ["Chat apps", "Gaming", "Live collaboration"],
  },
  {
    name: "SSE",
    color: "#f59e0b",
    latency: 30,
    bandwidth: 4,
    bidirectional: false,
    persistent: true,
    bestFor: ["Live dashboards", "Notifications", "Stock tickers"],
  },
  {
    name: "gRPC",
    color: "#8b5cf6",
    latency: 20,
    bandwidth: 2,
    bidirectional: true,
    persistent: true,
    bestFor: ["Microservices", "Real-time services", "Mobile backends"],
  },
];

function CompareTab() {
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const useCases = [
    { label: "Chat Application", icon: <MessageSquare className="w-3.5 h-3.5" />, best: "WebSocket", reason: "Needs real-time bidirectional messaging between users." },
    { label: "File Upload API", icon: <FileCode className="w-3.5 h-3.5" />, best: "REST", reason: "Simple request-response pattern is perfect for file uploads." },
    { label: "Real-time Dashboard", icon: <BarChart3 className="w-3.5 h-3.5" />, best: "SSE", reason: "Server pushes data updates to client; no need for client-to-server messages." },
    { label: "Microservice-to-Microservice", icon: <Network className="w-3.5 h-3.5" />, best: "gRPC", reason: "High-performance binary serialization with strong typing between internal services." },
    { label: "Public REST API", icon: <FileCode className="w-3.5 h-3.5" />, best: "REST", reason: "Widely understood, cacheable, works with any HTTP client." },
    { label: "Online Multiplayer Game", icon: <Radio className="w-3.5 h-3.5" />, best: "WebSocket", reason: "Ultra-low latency bidirectional communication needed for game state sync." },
  ];

  const maxLatency = Math.max(...protocols.map((p) => p.latency));
  const maxBw = Math.max(...protocols.map((p) => p.bandwidth));

  return (
    <div className="space-y-6">
      <div className="info-eng" style={{ fontSize: "0.9rem" }}>
        <strong>Protocol Comparison:</strong> Each protocol has different strengths. REST for simplicity,
        WebSocket for bidirectional real-time, SSE for server-push only, gRPC for high-performance internal services.
      </div>

      {/* Comparison panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        {protocols.map((p) => (
          <div key={p.name} className="card-eng eng-fadeIn" style={{ padding: 14, borderTop: `3px solid ${p.color}` }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: p.color, margin: "0 0 8px" }}>
              {p.name}
            </h4>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", lineHeight: 1.8 }}>
              <div className="flex items-center gap-1">
                <span style={{ fontWeight: 600 }}>Bidirectional:</span>
                <span style={{ color: p.bidirectional ? "var(--eng-success)" : "var(--eng-danger)" }}>
                  {p.bidirectional ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span style={{ fontWeight: 600 }}>Persistent:</span>
                <span style={{ color: p.persistent ? "var(--eng-success)" : "var(--eng-danger)" }}>
                  {p.persistent ? "Yes" : "No"}
                </span>
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              {p.bestFor.map((use) => (
                <span key={use} className="tag-eng" style={{ fontSize: "0.65rem", margin: "2px 2px", display: "inline-block", background: `${p.color}15`, color: p.color }}>
                  {use}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Latency & Bandwidth Chart */}
      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 16px" }}>
          Latency & Bandwidth Comparison
        </h4>
        <svg viewBox="0 0 600 200" style={{ width: "100%", background: "var(--eng-bg)", borderRadius: 8, border: "1px solid var(--eng-border)" }}>
          {protocols.map((p, i) => {
            const x = 80 + i * 140;
            const latencyHeight = (p.latency / maxLatency) * 100;
            const bwHeight = (p.bandwidth / maxBw) * 100;
            return (
              <g key={p.name}>
                {/* Latency bar */}
                <rect x={x} y={150 - latencyHeight} width={40} height={latencyHeight} rx={4} fill={p.color} opacity={0.8}>
                  <animate attributeName="height" from="0" to={`${latencyHeight}`} dur="0.8s" fill="freeze" />
                  <animate attributeName="y" from="150" to={`${150 - latencyHeight}`} dur="0.8s" fill="freeze" />
                </rect>
                <text x={x + 20} y={145 - latencyHeight} textAnchor="middle" fontSize="8" fontWeight={700} fill={p.color} fontFamily="var(--eng-font)">
                  {p.latency}ms
                </text>

                {/* Bandwidth bar */}
                <rect x={x + 50} y={150 - bwHeight} width={40} height={bwHeight} rx={4} fill={p.color} opacity={0.4}>
                  <animate attributeName="height" from="0" to={`${bwHeight}`} dur="0.8s" fill="freeze" />
                  <animate attributeName="y" from="150" to={`${150 - bwHeight}`} dur="0.8s" fill="freeze" />
                </rect>
                <text x={x + 70} y={145 - bwHeight} textAnchor="middle" fontSize="8" fontWeight={600} fill={p.color} fontFamily="var(--eng-font)">
                  {p.bandwidth}x
                </text>

                {/* Protocol name */}
                <text x={x + 45} y={170} textAnchor="middle" fontSize="10" fontWeight={700} fill="var(--eng-text)" fontFamily="var(--eng-font)">
                  {p.name}
                </text>
              </g>
            );
          })}

          {/* Y-axis labels */}
          <text x={10} y={155} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">0</text>
          <text x={10} y={55} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">High</text>
          <line x1={40} y1={150} x2={560} y2={150} stroke="var(--eng-border)" strokeWidth={1} />

          {/* Legend */}
          <rect x={420} y={10} width={12} height={12} rx={2} fill="var(--eng-primary)" opacity={0.8} />
          <text x={438} y={20} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">Latency (lower = better)</text>
          <rect x={420} y={28} width={12} height={12} rx={2} fill="var(--eng-primary)" opacity={0.4} />
          <text x={438} y={38} fontSize="8" fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">Bandwidth (lower = better)</text>
        </svg>
      </div>

      {/* Use Case Matcher */}
      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Use Case Matcher - Pick the Right Protocol
        </h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          {useCases.map((uc) => {
            const isSelected = selectedUseCase === uc.label;
            return (
              <button
                key={uc.label}
                className={isSelected ? "btn-eng" : "btn-eng-outline"}
                onClick={() => {
                  setSelectedUseCase(uc.label);
                  setRecommendation(uc.best);
                }}
                style={{ fontSize: "0.8rem", padding: "8px 12px", textAlign: "left", display: "flex", alignItems: "center", gap: 8 }}
              >
                {uc.icon}
                <span>{uc.label}</span>
              </button>
            );
          })}
        </div>

        {selectedUseCase && recommendation && (
          <div className="info-eng eng-fadeIn" style={{ marginTop: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Check className="w-4 h-4" style={{ color: "var(--eng-success)" }} />
              <strong style={{ color: "var(--eng-text)" }}>
                Best protocol for &quot;{selectedUseCase}&quot;: {recommendation}
              </strong>
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0 }}>
              {useCases.find((u) => u.label === selectedUseCase)?.reason}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the main advantage of WebSocket over REST for real-time applications?",
    options: [
      "WebSocket uses less storage",
      "WebSocket provides a persistent bidirectional connection instead of repeated request-response cycles",
      "WebSocket is more secure",
      "WebSocket works without a server",
    ],
    correctIndex: 1,
    explanation: "WebSocket maintains a persistent connection after an initial handshake, allowing both client and server to send messages at any time without the overhead of repeated HTTP requests.",
  },
  {
    question: "What serialization format does gRPC use by default?",
    options: [
      "JSON",
      "XML",
      "Protocol Buffers (Protobuf)",
      "YAML",
    ],
    correctIndex: 2,
    explanation: "gRPC uses Protocol Buffers (Protobuf) for serialization. Protobuf produces compact binary data that is much smaller and faster to parse than text-based formats like JSON.",
  },
  {
    question: "What is Server-Sent Events (SSE) best suited for?",
    options: [
      "Bidirectional chat between two users",
      "Server pushing updates to the client (one-way from server)",
      "Large file uploads",
      "Database queries",
    ],
    correctIndex: 1,
    explanation: "SSE provides a one-way channel from server to client over a persistent HTTP connection. It's ideal for server-push scenarios like live dashboards, notifications, and stock tickers.",
  },
  {
    question: "How does WebSocket establish its connection?",
    options: [
      "Through a DNS query",
      "Using an HTTP Upgrade handshake, then switching to the WebSocket protocol",
      "By opening a raw TCP socket directly",
      "Through a special WebSocket DNS record",
    ],
    correctIndex: 1,
    explanation: "WebSocket starts with a regular HTTP request with an 'Upgrade: websocket' header. The server responds with '101 Switching Protocols', and the connection is then upgraded to WebSocket.",
  },
  {
    question: "For internal microservice communication requiring high performance, which protocol is most appropriate?",
    options: [
      "REST with JSON",
      "WebSocket",
      "gRPC with Protocol Buffers",
      "FTP",
    ],
    correctIndex: 2,
    explanation: "gRPC with Protobuf is ideal for internal microservice communication because it offers compact binary serialization, HTTP/2 multiplexing, strong typing, and code generation for multiple languages.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L7_ModernProtocolsActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "websocket",
      label: "WebSocket",
      icon: <ArrowLeftRight className="w-4 h-4" />,
      content: <WebSocketTab />,
    },
    {
      id: "grpc",
      label: "gRPC",
      icon: <Zap className="w-4 h-4" />,
      content: <GRPCTab />,
    },
    {
      id: "compare",
      label: "Compare",
      icon: <BarChart3 className="w-4 h-4" />,
      content: <CompareTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="WebSockets, gRPC & Modern Protocols"
      level={7}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Very High"
    />
  );
}
