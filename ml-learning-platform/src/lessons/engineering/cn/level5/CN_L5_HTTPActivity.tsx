"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Send,
  ArrowRight,
  ArrowLeft,
  Layers,
  Server,
  Monitor,
  Zap,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type {
  EngTabDef,
  EngQuizQuestion,
} from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 — HTTP Request / Response Visualizer                         */
/* ================================================================== */

const METHODS = ["GET", "POST", "PUT", "DELETE"] as const;
const PATHS = ["/api/users", "/api/posts", "/api/auth/login", "/index.html", "/api/products/42"];
const COMMON_HEADERS: { key: string; value: string }[] = [
  { key: "Host", value: "api.example.com" },
  { key: "Content-Type", value: "application/json" },
  { key: "Authorization", value: "Bearer eyJhbG..." },
  { key: "Accept", value: "application/json" },
  { key: "User-Agent", value: "Mozilla/5.0" },
];

function HTTPRequestTab() {
  const [method, setMethod] = useState<typeof METHODS[number]>("GET");
  const [path, setPath] = useState(PATHS[0]);
  const [selectedHeaders, setSelectedHeaders] = useState<number[]>([0, 3]);
  const [animState, setAnimState] = useState<"idle" | "sending" | "processing" | "response">("idle");
  const [responseCode, setResponseCode] = useState(200);

  const toggleHeader = useCallback((idx: number) => {
    setSelectedHeaders((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  }, []);

  const sendRequest = useCallback(() => {
    setAnimState("sending");
    setTimeout(() => setAnimState("processing"), 1000);
    setTimeout(() => {
      const codes = method === "POST" ? 201 : method === "DELETE" ? 204 : 200;
      setResponseCode(codes);
      setAnimState("response");
    }, 2000);
  }, [method]);

  const reset = useCallback(() => setAnimState("idle"), []);

  const methodColors: Record<string, string> = {
    GET: "#3b82f6",
    POST: "#10b981",
    PUT: "#f59e0b",
    DELETE: "#ef4444",
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        HTTP Request/Response Builder
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Build an HTTP request visually, then watch it fly to the server and come back with a response.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Request builder */}
        <div className="card-eng p-4">
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
            Build Request
          </h4>

          {/* Method selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>Method</label>
            <div className="flex gap-2">
              {METHODS.map((m) => (
                <button
                  key={m}
                  onClick={() => { setMethod(m); setAnimState("idle"); }}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    border: method === m ? `2px solid ${methodColors[m]}` : "1px solid var(--eng-border)",
                    background: method === m ? `${methodColors[m]}15` : "var(--eng-surface)",
                    color: methodColors[m],
                    cursor: "pointer",
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Path selection */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>Path</label>
            <div className="flex flex-wrap gap-2">
              {PATHS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPath(p); setAnimState("idle"); }}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: "0.78rem",
                    border: path === p ? "2px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                    background: path === p ? "var(--eng-primary-light)" : "var(--eng-surface)",
                    color: "var(--eng-text)",
                    cursor: "pointer",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Headers */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>Headers (click to toggle)</label>
            <div className="space-y-1">
              {COMMON_HEADERS.map((h, i) => (
                <button
                  key={i}
                  onClick={() => toggleHeader(i)}
                  className="w-full text-left flex items-center gap-2"
                  style={{
                    padding: "4px 8px",
                    borderRadius: 4,
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    border: "none",
                    background: selectedHeaders.includes(i) ? "var(--eng-primary-light)" : "transparent",
                    color: selectedHeaders.includes(i) ? "var(--eng-primary)" : "var(--eng-text-muted)",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: "1.5px solid", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem" }}>
                    {selectedHeaders.includes(i) ? "x" : ""}
                  </span>
                  {h.key}: {h.value}
                </button>
              ))}
            </div>
          </div>

          <button onClick={animState === "idle" ? sendRequest : reset} className="btn-eng" style={{ width: "100%", fontSize: "0.85rem" }}>
            {animState === "idle" ? (
              <><Send className="w-4 h-4" style={{ marginRight: 4 }} /> Send Request</>
            ) : (
              <><RefreshCw className="w-4 h-4" style={{ marginRight: 4 }} /> Reset</>
            )}
          </button>
        </div>

        {/* Preview & animation */}
        <div>
          {/* Request preview */}
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: "0.78rem", color: "#e2e8f0", marginBottom: 12 }}>
            <div style={{ color: "#94a3b8", marginBottom: 4 }}>-- Request --</div>
            <div>
              <span style={{ color: methodColors[method], fontWeight: 700 }}>{method}</span>
              {" "}
              <span style={{ color: "#38bdf8" }}>{path}</span>
              {" "}
              <span style={{ color: "#94a3b8" }}>HTTP/1.1</span>
            </div>
            {selectedHeaders.map((hi) => (
              <div key={hi} style={{ color: "#a5b4fc" }}>
                {COMMON_HEADERS[hi].key}: <span style={{ color: "#4ade80" }}>{COMMON_HEADERS[hi].value}</span>
              </div>
            ))}
          </div>

          {/* Flight animation */}
          <svg viewBox="0 0 380 100" style={{ width: "100%", display: "block", margin: "0 auto 12px" }}>
            <rect x={10} y={25} width={80} height={50} rx={8} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={50} y={55} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">Client</text>

            <rect x={290} y={25} width={80} height={50} rx={8} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
            <text x={330} y={55} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill="var(--eng-text)">Server</text>

            {/* Request arrow */}
            {(animState === "sending" || animState === "processing" || animState === "response") && (
              <g>
                <line x1={90} y1={42} x2={290} y2={42} stroke={methodColors[method]} strokeWidth={2} strokeDasharray="6 3">
                  <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.6s" repeatCount="indefinite" />
                </line>
                <polygon points="285,37 295,42 285,47" fill={methodColors[method]} />
                <text x={190} y={36} textAnchor="middle" fontSize={8} fill={methodColors[method]} fontFamily="monospace" fontWeight={600}>
                  {method} {path}
                </text>
              </g>
            )}

            {/* Processing indicator */}
            {animState === "processing" && (
              <circle cx={330} cy={50} r={3} fill={methodColors[method]}>
                <animate attributeName="opacity" values="1;0.3;1" dur="0.6s" repeatCount="indefinite" />
              </circle>
            )}

            {/* Response arrow */}
            {animState === "response" && (
              <g>
                <line x1={290} y1={58} x2={90} y2={58} stroke="#10b981" strokeWidth={2} strokeDasharray="6 3">
                  <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.6s" repeatCount="indefinite" />
                </line>
                <polygon points="95,53 85,58 95,63" fill="#10b981" />
                <text x={190} y={72} textAnchor="middle" fontSize={8} fill="#10b981" fontFamily="monospace" fontWeight={600}>
                  HTTP {responseCode}
                </text>
              </g>
            )}
          </svg>

          {/* Response preview */}
          {animState === "response" && (
            <div className="eng-fadeIn" style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: "0.78rem", color: "#e2e8f0" }}>
              <div style={{ color: "#94a3b8", marginBottom: 4 }}>-- Response --</div>
              <div>
                <span style={{ color: "#94a3b8" }}>HTTP/1.1</span>
                {" "}
                <span style={{ color: "#4ade80", fontWeight: 700 }}>{responseCode} {responseCode === 200 ? "OK" : responseCode === 201 ? "Created" : "No Content"}</span>
              </div>
              <div style={{ color: "#a5b4fc" }}>Content-Type: <span style={{ color: "#4ade80" }}>application/json</span></div>
              <div style={{ color: "#a5b4fc" }}>Content-Length: <span style={{ color: "#4ade80" }}>142</span></div>
              <div style={{ marginTop: 6, color: "#fbbf24" }}>
                {`{ "status": "success", "data": {...} }`}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 — HTTP Methods & Status Codes                                 */
/* ================================================================== */

interface MethodDef {
  method: string;
  desc: string;
  idempotent: boolean;
  safe: boolean;
  body: boolean;
  color: string;
}

const HTTP_METHODS: MethodDef[] = [
  { method: "GET", desc: "Retrieve a resource. Should not change server state.", idempotent: true, safe: true, body: false, color: "#3b82f6" },
  { method: "POST", desc: "Submit data to create a new resource. Not idempotent.", idempotent: false, safe: false, body: true, color: "#10b981" },
  { method: "PUT", desc: "Replace an entire resource. Idempotent — same request gives same result.", idempotent: true, safe: false, body: true, color: "#f59e0b" },
  { method: "PATCH", desc: "Partially update a resource. Only sends the changed fields.", idempotent: false, safe: false, body: true, color: "#8b5cf6" },
  { method: "DELETE", desc: "Remove a resource. Idempotent — deleting twice has same effect.", idempotent: true, safe: false, body: false, color: "#ef4444" },
  { method: "HEAD", desc: "Same as GET but returns only headers, no body. Used for checking if resource exists.", idempotent: true, safe: true, body: false, color: "#64748b" },
  { method: "OPTIONS", desc: "Returns allowed methods for a resource. Used in CORS preflight requests.", idempotent: true, safe: true, body: false, color: "#06b6d4" },
];

interface StatusGroup {
  range: string;
  label: string;
  color: string;
  icon: React.ReactNode;
  codes: { code: number; text: string; desc: string }[];
}

const STATUS_GROUPS: StatusGroup[] = [
  {
    range: "2xx", label: "Success", color: "#10b981",
    icon: <CheckCircle2 className="w-4 h-4" />,
    codes: [
      { code: 200, text: "OK", desc: "Request succeeded" },
      { code: 201, text: "Created", desc: "Resource created successfully" },
      { code: 204, text: "No Content", desc: "Success, no body to return" },
    ],
  },
  {
    range: "3xx", label: "Redirection", color: "#3b82f6",
    icon: <ArrowRight className="w-4 h-4" />,
    codes: [
      { code: 301, text: "Moved Permanently", desc: "Resource moved to new URL forever" },
      { code: 302, text: "Found", desc: "Temporary redirect" },
      { code: 304, text: "Not Modified", desc: "Cached version is still valid" },
    ],
  },
  {
    range: "4xx", label: "Client Error", color: "#f59e0b",
    icon: <AlertTriangle className="w-4 h-4" />,
    codes: [
      { code: 400, text: "Bad Request", desc: "Malformed request syntax" },
      { code: 401, text: "Unauthorized", desc: "Authentication required" },
      { code: 403, text: "Forbidden", desc: "Authenticated but not authorized" },
      { code: 404, text: "Not Found", desc: "Resource does not exist" },
      { code: 429, text: "Too Many Requests", desc: "Rate limit exceeded" },
    ],
  },
  {
    range: "5xx", label: "Server Error", color: "#ef4444",
    icon: <XCircle className="w-4 h-4" />,
    codes: [
      { code: 500, text: "Internal Server Error", desc: "Generic server error" },
      { code: 502, text: "Bad Gateway", desc: "Invalid response from upstream" },
      { code: 503, text: "Service Unavailable", desc: "Server overloaded or in maintenance" },
    ],
  },
];

function HTTPMethodsTab() {
  const [selectedMethod, setSelectedMethod] = useState("GET");
  const [expandedGroup, setExpandedGroup] = useState<string | null>("2xx");

  const activeMeth = HTTP_METHODS.find((m) => m.method === selectedMethod)!;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        HTTP Methods & Status Codes
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Explore the HTTP verbs and understand what each status code range means.
      </p>

      {/* Methods */}
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
        HTTP Methods
      </h3>
      <div className="flex flex-wrap gap-2" style={{ marginBottom: 16 }}>
        {HTTP_METHODS.map((m) => (
          <button
            key={m.method}
            onClick={() => setSelectedMethod(m.method)}
            style={{
              padding: "6px 16px",
              borderRadius: 6,
              fontFamily: "monospace",
              fontSize: "0.85rem",
              fontWeight: 700,
              border: selectedMethod === m.method ? `2px solid ${m.color}` : "1px solid var(--eng-border)",
              background: selectedMethod === m.method ? `${m.color}15` : "var(--eng-surface)",
              color: m.color,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {m.method}
          </button>
        ))}
      </div>

      <div className="card-eng p-5 eng-fadeIn" key={selectedMethod} style={{ marginBottom: 24 }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
          <span style={{
            fontFamily: "monospace", fontWeight: 800, fontSize: "1.2rem", color: activeMeth.color,
            padding: "4px 12px", borderRadius: 6, background: `${activeMeth.color}15`,
          }}>
            {activeMeth.method}
          </span>
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 12px", lineHeight: 1.6 }}>
          {activeMeth.desc}
        </p>
        <div className="flex gap-3 flex-wrap">
          <PropertyBadge label="Idempotent" value={activeMeth.idempotent} />
          <PropertyBadge label="Safe" value={activeMeth.safe} />
          <PropertyBadge label="Has Body" value={activeMeth.body} />
        </div>
      </div>

      {/* Status codes */}
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
        HTTP Status Codes
      </h3>
      <div className="space-y-2">
        {STATUS_GROUPS.map((g) => (
          <div key={g.range} className="card-eng" style={{ overflow: "hidden" }}>
            <button
              onClick={() => setExpandedGroup(expandedGroup === g.range ? null : g.range)}
              className="w-full flex items-center gap-3 text-left"
              style={{
                padding: "12px 16px",
                border: "none",
                background: expandedGroup === g.range ? `${g.color}10` : "transparent",
                cursor: "pointer",
                fontFamily: "var(--eng-font)",
              }}
            >
              <span style={{ color: g.color }}>{g.icon}</span>
              <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "1rem", color: g.color }}>{g.range}</span>
              <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)" }}>{g.label}</span>
              <span style={{ marginLeft: "auto", color: "var(--eng-text-muted)" }}>
                {expandedGroup === g.range ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {expandedGroup === g.range && (
              <div className="eng-fadeIn" style={{ padding: "0 16px 12px" }}>
                {g.codes.map((c) => (
                  <div key={c.code} className="flex items-center gap-3" style={{ padding: "8px 0", borderTop: "1px solid var(--eng-border)" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 700, fontSize: "0.9rem", color: g.color, minWidth: 40 }}>
                      {c.code}
                    </span>
                    <span style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: "var(--eng-text)", minWidth: 140 }}>
                      {c.text}
                    </span>
                    <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)" }}>
                      {c.desc}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PropertyBadge({ label, value }: { label: string; value: boolean }) {
  return (
    <span
      className="tag-eng"
      style={{
        background: value ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
        color: value ? "#065f46" : "#991b1b",
        fontSize: "0.78rem",
      }}
    >
      {label}: {value ? "Yes" : "No"}
    </span>
  );
}

/* ================================================================== */
/*  Tab 3 — HTTP Versions Comparison                                    */
/* ================================================================== */

function HTTPVersionsTab() {
  const [activeVersion, setActiveVersion] = useState<"1.1" | "2" | "3">("1.1");
  const [holBlocking, setHolBlocking] = useState(false);
  const [muxStreams, setMuxStreams] = useState(false);

  // Head-of-line blocking simulation
  useEffect(() => {
    if (activeVersion !== "1.1") { setHolBlocking(false); return; }
    const id = setInterval(() => setHolBlocking((p) => !p), 2000);
    return () => clearInterval(id);
  }, [activeVersion]);

  // Multiplexed streams animation
  useEffect(() => {
    if (activeVersion !== "2") { setMuxStreams(false); return; }
    const id = setInterval(() => setMuxStreams((p) => !p), 1500);
    return () => clearInterval(id);
  }, [activeVersion]);

  const versions = [
    { v: "1.1" as const, label: "HTTP/1.1", year: "1997" },
    { v: "2" as const, label: "HTTP/2", year: "2015" },
    { v: "3" as const, label: "HTTP/3", year: "2022" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        HTTP Versions: Evolution
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        See how HTTP evolved from serial connections to multiplexed streams over QUIC.
      </p>

      <div className="flex gap-2" style={{ marginBottom: 20 }}>
        {versions.map((v) => (
          <button
            key={v.v}
            onClick={() => setActiveVersion(v.v)}
            className={activeVersion === v.v ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.85rem" }}
          >
            {v.label} <span style={{ opacity: 0.6, fontSize: "0.75rem" }}>({v.year})</span>
          </button>
        ))}
      </div>

      {/* Version-specific visualization */}
      {activeVersion === "1.1" && (
        <div className="eng-fadeIn">
          <div className="card-eng p-5" style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
              HTTP/1.1 — Head-of-Line Blocking
            </h4>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
              In HTTP/1.1, requests are sent one at a time per connection. A slow response blocks all subsequent requests on that connection. Browsers open 6-8 parallel connections as a workaround.
            </p>

            <svg viewBox="0 0 700 200" style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto" }}>
              {/* Connection lanes */}
              {[0, 1, 2].map((lane) => (
                <g key={lane}>
                  <text x={10} y={45 + lane * 60} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Conn {lane + 1}</text>
                  <line x1={70} y1={40 + lane * 60} x2={680} y2={40 + lane * 60} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="4 3" />

                  {/* Requests as sequential blocks */}
                  {[0, 1, 2].map((req) => {
                    const xStart = 80 + req * 200;
                    const width = lane === 0 && req === 0 && holBlocking ? 280 : 160;
                    const isBlocked = lane === 0 && req > 0 && holBlocking;
                    const colors = ["#3b82f6", "#10b981", "#f59e0b"];
                    return (
                      <g key={req}>
                        <rect
                          x={xStart}
                          y={25 + lane * 60}
                          width={isBlocked ? 0 : width}
                          height={30}
                          rx={4}
                          fill={isBlocked ? "#fee2e2" : `${colors[req]}25`}
                          stroke={isBlocked ? "#ef4444" : colors[req]}
                          strokeWidth={1.5}
                          style={{ transition: "width 0.5s" }}
                        />
                        <text x={xStart + 8} y={45 + lane * 60} fontSize={9} fontFamily="monospace" fill={isBlocked ? "#ef4444" : "var(--eng-text)"}>
                          {isBlocked ? "BLOCKED" : `GET /resource${lane * 3 + req + 1}`}
                        </text>
                      </g>
                    );
                  })}
                </g>
              ))}

              <text x={350} y={195} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" fontWeight={600}>
                Time ---&gt;
              </text>
            </svg>
          </div>

          <div className="info-eng">
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", margin: 0 }}>
              <strong>Key features:</strong> Persistent connections (keep-alive), chunked transfer encoding, content negotiation. But still limited by sequential request processing per connection.
            </p>
          </div>
        </div>
      )}

      {activeVersion === "2" && (
        <div className="eng-fadeIn">
          <div className="card-eng p-5" style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
              HTTP/2 — Multiplexed Streams
            </h4>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
              HTTP/2 uses a single TCP connection with multiplexed streams. Multiple requests and responses can be in-flight simultaneously, interleaved as binary frames.
            </p>

            <svg viewBox="0 0 700 180" style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto" }}>
              {/* Single connection */}
              <text x={10} y={55} fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)">Single TCP</text>
              <rect x={70} y={20} width={610} height={120} rx={8} fill="var(--eng-bg)" stroke="var(--eng-border)" strokeWidth={1.5} />

              {/* Multiplexed stream frames */}
              {[
                { stream: 1, color: "#3b82f6", offsets: [0, 3, 6] },
                { stream: 2, color: "#10b981", offsets: [1, 4, 7] },
                { stream: 3, color: "#f59e0b", offsets: [2, 5, 8] },
              ].map((s) => (
                <g key={s.stream}>
                  {s.offsets.map((off, i) => (
                    <rect
                      key={i}
                      x={85 + off * 64}
                      y={30 + (s.stream - 1) * 35}
                      width={55}
                      height={26}
                      rx={4}
                      fill={`${s.color}20`}
                      stroke={s.color}
                      strokeWidth={1.5}
                      opacity={muxStreams ? 1 : 0.4}
                      style={{ transition: "opacity 0.4s" }}
                    >
                      <animate attributeName="opacity" values={muxStreams ? "0.4;1;0.4" : "1;0.4;1"} dur="2s" repeatCount="indefinite" begin={`${off * 0.2}s`} />
                    </rect>
                  ))}
                  <text x={88} y={48 + (s.stream - 1) * 35} fontSize={8} fontFamily="monospace" fontWeight={600} fill={s.color}>
                    Stream {s.stream}
                  </text>
                </g>
              ))}

              <text x={350} y={170} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" fontWeight={600}>
                Frames interleaved on single connection
              </text>
            </svg>
          </div>

          <div className="info-eng">
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", margin: 0 }}>
              <strong>Key features:</strong> Binary framing, stream multiplexing, header compression (HPACK), server push, stream prioritization. Still uses TCP so TCP-level HOL blocking remains.
            </p>
          </div>
        </div>
      )}

      {activeVersion === "3" && (
        <div className="eng-fadeIn">
          <div className="card-eng p-5" style={{ marginBottom: 16 }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
              HTTP/3 — QUIC over UDP
            </h4>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.5 }}>
              HTTP/3 replaces TCP with QUIC (built on UDP). Each stream is independent — packet loss on one stream does not block others. Connection setup is faster (0-RTT possible).
            </p>

            <svg viewBox="0 0 700 200" style={{ width: "100%", maxWidth: 700, display: "block", margin: "0 auto" }}>
              {/* QUIC connection */}
              <rect x={70} y={10} width={610} height={150} rx={8} fill="var(--eng-bg)" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="none" />
              <text x={85} y={30} fontSize={10} fontFamily="var(--eng-font)" fontWeight={700} fill="#8b5cf6">QUIC (UDP)</text>

              {/* Independent streams */}
              {[
                { stream: 1, color: "#3b82f6", y: 40 },
                { stream: 2, color: "#10b981", y: 75 },
                { stream: 3, color: "#f59e0b", y: 110 },
              ].map((s) => (
                <g key={s.stream}>
                  <rect x={85} y={s.y} width={580} height={28} rx={6} fill={`${s.color}08`} stroke={s.color} strokeWidth={1} strokeDasharray="4 2" />
                  <text x={95} y={s.y + 18} fontSize={9} fontFamily="monospace" fontWeight={600} fill={s.color}>Stream {s.stream}</text>

                  {/* Data packets flowing */}
                  {[0, 1, 2, 3, 4].map((p) => (
                    <rect key={p} x={200 + p * 90} y={s.y + 4} width={60} height={20} rx={4} fill={`${s.color}25`} stroke={s.color} strokeWidth={1}>
                      <animate attributeName="x" from={String(200 + p * 90)} to={String(210 + p * 90)} dur="1s" repeatCount="indefinite" begin={`${p * 0.15}s`} values={`${200 + p * 90};${210 + p * 90};${200 + p * 90}`} />
                    </rect>
                  ))}
                </g>
              ))}

              <text x={350} y={190} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fill="var(--eng-text-muted)" fontWeight={600}>
                Independent streams - no HOL blocking at transport level
              </text>
            </svg>
          </div>

          <div className="info-eng">
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", margin: 0 }}>
              <strong>Key features:</strong> Built on QUIC/UDP, no TCP HOL blocking, 0-RTT connection resumption, connection migration (IP changes), QPACK header compression.
            </p>
          </div>
        </div>
      )}

      {/* Comparison table */}
      <div className="card-eng" style={{ marginTop: 20, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.82rem" }}>
          <thead>
            <tr style={{ background: "var(--eng-bg)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)" }}>Feature</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#3b82f6", borderBottom: "1px solid var(--eng-border)" }}>HTTP/1.1</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#10b981", borderBottom: "1px solid var(--eng-border)" }}>HTTP/2</th>
              <th style={{ padding: "10px 14px", textAlign: "center", fontWeight: 700, color: "#8b5cf6", borderBottom: "1px solid var(--eng-border)" }}>HTTP/3</th>
            </tr>
          </thead>
          <tbody>
            {[
              { feature: "Transport", v1: "TCP", v2: "TCP", v3: "QUIC (UDP)" },
              { feature: "Multiplexing", v1: "No", v2: "Yes", v3: "Yes" },
              { feature: "HOL Blocking", v1: "App + TCP", v2: "TCP only", v3: "None" },
              { feature: "Header Compression", v1: "None", v2: "HPACK", v3: "QPACK" },
              { feature: "Server Push", v1: "No", v2: "Yes", v3: "Deprecated" },
              { feature: "Connection Setup", v1: "1-2 RTT", v2: "1-2 RTT", v3: "0-1 RTT" },
              { feature: "Encoding", v1: "Text", v2: "Binary", v3: "Binary" },
            ].map((row) => (
              <tr key={row.feature}>
                <td style={{ padding: "8px 14px", fontWeight: 600, color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)" }}>{row.feature}</td>
                <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>{row.v1}</td>
                <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>{row.v2}</td>
                <td style={{ padding: "8px 14px", textAlign: "center", color: "var(--eng-text-muted)", borderBottom: "1px solid var(--eng-border)" }}>{row.v3}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                                */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "Which HTTP method is both safe and idempotent?",
    options: ["POST", "PUT", "GET", "DELETE"],
    correctIndex: 2,
    explanation: "GET is both safe (does not change server state) and idempotent (repeated calls give the same result).",
  },
  {
    question: "What does HTTP status code 401 mean?",
    options: ["Resource not found", "Bad request syntax", "Authentication required", "Server error"],
    correctIndex: 2,
    explanation: "401 Unauthorized means the client must authenticate to get the requested response.",
  },
  {
    question: "What transport protocol does HTTP/3 use?",
    options: ["TCP", "SCTP", "QUIC over UDP", "TLS over TCP"],
    correctIndex: 2,
    explanation: "HTTP/3 uses QUIC, which runs over UDP, eliminating TCP-level head-of-line blocking.",
  },
  {
    question: "What is head-of-line (HOL) blocking in HTTP/1.1?",
    options: [
      "Server refuses to process more than one request",
      "A slow response blocks subsequent requests on the same connection",
      "The first packet of a request is always dropped",
      "Headers cannot be compressed",
    ],
    correctIndex: 1,
    explanation: "In HTTP/1.1, requests on a single connection are processed sequentially, so a slow response blocks all requests behind it.",
  },
  {
    question: "Which HTTP header specifies the type of content being sent?",
    options: ["Accept", "Host", "Content-Type", "User-Agent"],
    correctIndex: 2,
    explanation: "Content-Type tells the server or client what media type the body contains (e.g., application/json, text/html).",
  },
];

/* ================================================================== */
/*  Main Export                                                         */
/* ================================================================== */

export default function CN_L5_HTTPActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "request",
      label: "Request",
      icon: <Send className="w-4 h-4" />,
      content: <HTTPRequestTab />,
    },
    {
      id: "methods",
      label: "Methods",
      icon: <Layers className="w-4 h-4" />,
      content: <HTTPMethodsTab />,
    },
    {
      id: "versions",
      label: "Versions",
      icon: <Zap className="w-4 h-4" />,
      content: <HTTPVersionsTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="HTTP — HyperText Transfer Protocol"
      level={5}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="SMTP, FTP & Email Protocols"
      gateRelevance="2-3 marks"
      placementRelevance="High"
    />
  );
}
