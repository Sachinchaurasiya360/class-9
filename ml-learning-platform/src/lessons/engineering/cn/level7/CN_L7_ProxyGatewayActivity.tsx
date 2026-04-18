"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowRight, Globe, Server, Shield, Filter, Gauge, Key, Network, Eye, Layers, Cloud } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 - Forward Proxy                                              */
/* ================================================================== */

function ForwardProxyTab() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scenario, setScenario] = useState<"corp" | "blocked" | "anon">("corp");

  const scenarios: Record<typeof scenario, { title: string; steps: string[]; outcome: string }> = {
    corp: {
      title: "Corporate filter - employee browsing",
      steps: [
        "Employee laptop sends request to news.example.com.",
        "Browser is configured to use proxy.corp:3128 - request goes there first.",
        "Proxy checks company allow-list. news.example.com is allowed → proxy logs the user + URL.",
        "Proxy makes the outbound request to news.example.com on the employee's behalf.",
        "Origin's response goes back to proxy → proxy can scan/cache it → forwards to laptop.",
      ],
      outcome: "Origin sees the proxy's IP, not the employee's. The company gets logging, content filtering and a shared cache - all in one box.",
    },
    blocked: {
      title: "Site blocked by policy",
      steps: [
        "Employee tries to reach social.example.com.",
        "Browser sends request to proxy.corp:3128.",
        "Proxy looks up policy → social.example.com is on the deny-list.",
        "Proxy never contacts the origin.",
        "Proxy returns an HTTP 403 page: 'Blocked by company policy.'",
      ],
      outcome: "The origin server has no idea the request was even attempted. Egress filtering is the killer feature of a forward proxy.",
    },
    anon: {
      title: "Anonymizing proxy",
      steps: [
        "User in country A wants to read site.example.com that's geo-restricted.",
        "User configures browser to use proxy.elsewhere.net (in country B).",
        "Proxy receives the request, may strip identifying headers (X-Forwarded-For, User-Agent) or replace them.",
        "Proxy makes the request from its own IP - origin sees a country-B visitor.",
        "Response is forwarded back through the proxy to the user.",
      ],
      outcome: "VPNs do this at the network layer; forward HTTP proxies do it at the application layer. Origin sees the proxy as the client.",
    },
  };

  const current = scenarios[scenario];

  useEffect(() => {
    if (!playing) return;
    if (step >= current.steps.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(id);
  }, [playing, step, current.steps.length]);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Forward Proxy - Sits In Front of the Client
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
        A forward proxy is configured by clients on a private network. It speaks to the open Internet on their behalf - adding logging, filtering, caching, or anonymization.
      </p>

      <div className="card-eng" style={{ padding: 18, marginBottom: 16 }}>
        <svg viewBox="0 0 720 200" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
          {/* Client side bracket */}
          <text x={120} y={20} fontSize={11} fontWeight={700} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)" textAnchor="middle">PRIVATE NETWORK</text>
          <rect x={20} y={30} width={200} height={150} rx={10} fill="none" stroke="var(--eng-border)" strokeDasharray="4 4" />

          <ClientNode x={70} y={80} label="Laptop" highlight={step >= 0} />
          <ClientNode x={70} y={140} label="Phone" />

          {/* Proxy */}
          <g>
            <rect x={150} y={100} width={70} height={50} rx={8} fill={step >= 1 ? "#3b82f6" : "var(--eng-surface)"} stroke="#3b82f6" strokeWidth={2} />
            <text x={185} y={122} textAnchor="middle" fontSize={11} fontWeight={700} fill={step >= 1 ? "#fff" : "#3b82f6"} fontFamily="var(--eng-font)">Forward</text>
            <text x={185} y={138} textAnchor="middle" fontSize={11} fontWeight={700} fill={step >= 1 ? "#fff" : "#3b82f6"} fontFamily="var(--eng-font)">Proxy</text>
          </g>

          {/* Internet cloud */}
          <text x={580} y={20} fontSize={11} fontWeight={700} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)" textAnchor="middle">PUBLIC INTERNET</text>
          <rect x={420} y={30} width={280} height={150} rx={10} fill="none" stroke="var(--eng-border)" strokeDasharray="4 4" />
          <ServerNode x={490} y={80} label="news.example.com" highlight={step >= 3 && scenario !== "blocked"} />
          <ServerNode x={620} y={120} label="other.example" />

          {/* Arrows */}
          <ArrowSeg x1={95} y1={80} x2={150} y2={120} active={step >= 1} color="#3b82f6" label="HTTP request" />
          <ArrowSeg x1={220} y1={120} x2={465} y2={80} active={step >= 3 && scenario !== "blocked"} color="#10b981" label="Outbound on user's behalf" />
          {scenario === "blocked" && step >= 4 && (
            <g>
              <text x={185} y={170} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ef4444" fontFamily="var(--eng-font)">⛔ HTTP 403</text>
            </g>
          )}
        </svg>
      </div>

      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
        {(Object.keys(scenarios) as Array<typeof scenario>).map((k) => {
          const sel = scenario === k;
          return (
            <button key={k} onClick={() => { setScenario(k); setStep(0); setPlaying(false); }} className={sel ? "btn-eng" : "btn-eng-outline"} style={{ fontSize: "0.78rem", padding: "6px 10px" }}>
              {scenarios[k].title}
            </button>
          );
        })}
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {current.steps.map((s, i) => {
            const visible = i <= step;
            return (
              <div key={i} style={{ display: "flex", gap: 10, opacity: visible ? 1 : 0.35, transition: "opacity 0.3s" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: visible ? "#3b82f6" : "var(--eng-border)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0, fontFamily: "var(--eng-font)" }}>{i + 1}</div>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", color: "var(--eng-text)", lineHeight: 1.5 }}>{s}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="btn-eng-outline" style={{ fontSize: "0.8rem", padding: "6px 12px" }} disabled={step === 0}>Prev</button>
          <button onClick={() => setStep((s) => Math.min(current.steps.length - 1, s + 1))} className="btn-eng-outline" style={{ fontSize: "0.8rem", padding: "6px 12px" }} disabled={step >= current.steps.length - 1}>Next</button>
          <button onClick={() => setPlaying((p) => !p)} className="btn-eng" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>{playing ? "Pause" : "Auto-play"}</button>
          <button onClick={() => { setStep(0); setPlaying(false); }} className="btn-eng-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>Reset</button>
        </div>
        {step >= current.steps.length - 1 && (
          <div className="info-eng" style={{ fontSize: "0.85rem" }}>
            <strong>Outcome: </strong>{current.outcome}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - Reverse Proxy with Backend Pool                            */
/* ================================================================== */

interface BackendServer { id: string; load: number; healthy: boolean; }

function ReverseProxyTab() {
  const [servers, setServers] = useState<BackendServer[]>([
    { id: "S1", load: 0, healthy: true },
    { id: "S2", load: 0, healthy: true },
    { id: "S3", load: 0, healthy: true },
  ]);
  const [reqCount, setReqCount] = useState(0);
  const [cacheHits, setCacheHits] = useState(0);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [lastRoutedTo, setLastRoutedTo] = useState<string | null>(null);
  const [requestKind, setRequestKind] = useState<"static" | "dynamic">("static");

  function sendRequest() {
    setReqCount((c) => c + 1);
    // Cache hit only for static requests when cache enabled
    if (cacheEnabled && requestKind === "static" && Math.random() > 0.35) {
      setCacheHits((h) => h + 1);
      setLastRoutedTo("CACHE");
      return;
    }
    // Round-robin to healthy servers
    const healthy = servers.filter((s) => s.healthy);
    if (healthy.length === 0) { setLastRoutedTo("NONE"); return; }
    const target = healthy[reqCount % healthy.length];
    setServers((prev) => prev.map((s) => s.id === target.id ? { ...s, load: s.load + 1 } : s));
    setLastRoutedTo(target.id);
  }

  function toggleHealth(id: string) {
    setServers((prev) => prev.map((s) => s.id === id ? { ...s, healthy: !s.healthy } : s));
  }

  function reset() {
    setServers((prev) => prev.map((s) => ({ ...s, load: 0, healthy: true })));
    setReqCount(0);
    setCacheHits(0);
    setLastRoutedTo(null);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Reverse Proxy - Sits In Front of the Servers
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
        A reverse proxy is what clients <em>think</em> is the server. It hides a pool of backends and adds load-balancing, TLS termination, caching, and a single point of failure detection. nginx, HAProxy, Cloudflare and AWS ALB are all reverse proxies.
      </p>

      <div className="card-eng" style={{ padding: 18, marginBottom: 16 }}>
        <svg viewBox="0 0 720 240" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
          {/* Clients */}
          <ClientNode x={60} y={70} label="User A" />
          <ClientNode x={60} y={130} label="User B" />
          <ClientNode x={60} y={190} label="User C" />

          {/* Reverse proxy */}
          <g>
            <rect x={220} y={90} width={120} height={80} rx={10} fill="#10b981" opacity={0.92} />
            <text x={280} y={120} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff" fontFamily="var(--eng-font)">Reverse Proxy</text>
            <text x={280} y={138} textAnchor="middle" fontSize={10} fill="#fff" fontFamily="var(--eng-font)">api.example.com</text>
            <text x={280} y={156} textAnchor="middle" fontSize={9} fill="#d1fae5" fontFamily="var(--eng-font)">{cacheEnabled ? "+ cache" : "no cache"} · round-robin</text>
          </g>

          {/* Cache hit indicator */}
          {lastRoutedTo === "CACHE" && (
            <g>
              <rect x={220} y={180} width={120} height={28} rx={6} fill="#fbbf24" />
              <text x={280} y={199} textAnchor="middle" fontSize={11} fontWeight={700} fill="#78350f" fontFamily="var(--eng-font)">⚡ served from cache</text>
            </g>
          )}

          {/* Backends */}
          {servers.map((s, i) => {
            const y = 50 + i * 70;
            const active = lastRoutedTo === s.id;
            const color = s.healthy ? (active ? "#3b82f6" : "#64748b") : "#ef4444";
            return (
              <g key={s.id} style={{ cursor: "pointer" }} onClick={() => toggleHealth(s.id)}>
                <rect x={500} y={y} width={140} height={50} rx={8} fill={s.healthy ? "var(--eng-surface)" : "#fee2e2"} stroke={color} strokeWidth={active ? 3 : 1.5} />
                <text x={570} y={y + 22} textAnchor="middle" fontSize={12} fontWeight={700} fill={color} fontFamily="var(--eng-font)">Backend {s.id}</text>
                <text x={570} y={y + 38} textAnchor="middle" fontSize={10} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  {s.healthy ? `load: ${s.load}` : "DOWN - click to revive"}
                </text>
              </g>
            );
          })}

          {/* Arrows from clients to proxy */}
          {[70, 130, 190].map((y, i) => (
            <line key={i} x1={85} y1={y} x2={220} y2={130} stroke="var(--eng-border)" strokeWidth={1.5} />
          ))}

          {/* Arrows proxy → backends */}
          {servers.map((s, i) => {
            const y = 75 + i * 70;
            const active = lastRoutedTo === s.id;
            return (
              <line key={s.id} x1={340} y1={130} x2={500} y2={y} stroke={active ? "#3b82f6" : "var(--eng-border)"} strokeWidth={active ? 2.5 : 1.2} markerEnd={active ? "url(#arrhd)" : undefined} />
            );
          })}

          <defs>
            <marker id="arrhd" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
        <Stat label="Total requests" value={reqCount} />
        <Stat label="Cache hits" value={cacheHits} accent={cacheHits > 0 ? "#fbbf24" : undefined} />
        <Stat label="Cache hit ratio" value={reqCount > 0 ? `${Math.round((cacheHits / reqCount) * 100)}%` : "-"} />
        <Stat label="Backend hits" value={reqCount - cacheHits} />
      </div>

      <div className="card-eng" style={{ padding: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 10 }}>
          <button onClick={sendRequest} className="btn-eng" style={{ fontSize: "0.85rem" }}>Send request</button>
          <select
            value={requestKind}
            onChange={(e) => setRequestKind(e.target.value as "static" | "dynamic")}
            className="card-eng"
            style={{ padding: "6px 10px", fontSize: "0.82rem", fontFamily: "var(--eng-font)", border: "1px solid var(--eng-border)", borderRadius: 6 }}
          >
            <option value="static">GET /static/logo.png  (cacheable)</option>
            <option value="dynamic">POST /api/order  (must hit backend)</option>
          </select>
          <label style={{ display: "flex", gap: 6, alignItems: "center", fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text)" }}>
            <input type="checkbox" checked={cacheEnabled} onChange={(e) => setCacheEnabled(e.target.checked)} />
            Cache enabled
          </label>
          <button onClick={reset} className="btn-eng-ghost" style={{ fontSize: "0.8rem", padding: "6px 12px" }}>Reset</button>
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: 0 }}>
          Click any backend in the diagram to mark it down. The proxy will skip unhealthy nodes - that's the whole point of a health check.
        </p>
      </div>

      <div className="info-eng" style={{ marginTop: 16, fontSize: "0.85rem" }}>
        <strong>Forward vs reverse - don't memorize, reason:</strong> a forward proxy is for outbound traffic, configured by clients, hides clients from servers. A reverse proxy is for inbound traffic, deployed by the server operator, hides servers from clients.
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div style={{ padding: 10, borderRadius: 8, background: "var(--eng-surface)", border: "1px solid var(--eng-border)" }}>
      <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: "var(--eng-font)", fontSize: "1.4rem", fontWeight: 700, color: accent || "var(--eng-text)" }}>{value}</div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - API Gateway with policies                                  */
/* ================================================================== */

interface ApiRequest {
  id: number;
  path: string;
  token: string | null;
  status: "pending" | "auth-fail" | "rate-limited" | "routed";
  routedTo: string | null;
}

function ApiGatewayTab() {
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [requestId, setRequestId] = useState(1);
  const [bucket, setBucket] = useState(5); // simple token bucket - refills

  // Refill the bucket once per second up to 5
  useEffect(() => {
    const id = setInterval(() => setBucket((b) => Math.min(5, b + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const services: Record<string, { color: string; label: string }> = {
    "/users": { color: "#3b82f6", label: "users-service" },
    "/orders": { color: "#10b981", label: "orders-service" },
    "/billing": { color: "#f59e0b", label: "billing-service" },
  };

  function send(path: string, withAuth: boolean) {
    const id = requestId;
    setRequestId((i) => i + 1);

    const newReq: ApiRequest = { id, path, token: withAuth ? "Bearer abc.xyz" : null, status: "pending", routedTo: null };
    setRequests((rs) => [newReq, ...rs].slice(0, 6));

    // Apply gateway policies in order: auth → rate limit → route
    setTimeout(() => {
      if (path !== "/users" && !withAuth) {
        setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status: "auth-fail" } : r));
        return;
      }
      if (bucket <= 0) {
        setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status: "rate-limited" } : r));
        return;
      }
      setBucket((b) => b - 1);
      const svc = services[path];
      setRequests((rs) => rs.map((r) => r.id === id ? { ...r, status: "routed", routedTo: svc.label } : r));
    }, 350);
  }

  function reset() {
    setRequests([]);
    setRequestId(1);
    setBucket(5);
  }

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        API Gateway - A Reverse Proxy That Knows Your Business
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 18px", lineHeight: 1.6 }}>
        An API Gateway is a reverse proxy with three things bolted on: <strong>authentication</strong> (verify JWT/OAuth before letting a request reach a backend), <strong>rate limiting</strong> (token bucket per user), and <strong>path-based routing</strong> (different URL prefixes go to different microservices). It's the front door of a microservices architecture.
      </p>

      <div className="card-eng" style={{ padding: 18, marginBottom: 16 }}>
        <svg viewBox="0 0 720 280" style={{ width: "100%", maxWidth: 720, display: "block", margin: "0 auto" }}>
          {/* Client */}
          <ClientNode x={50} y={140} label="App / SPA" />

          {/* Gateway pipeline */}
          <g>
            <rect x={170} y={70} width={260} height={140} rx={12} fill="#8b5cf6" opacity={0.92} />
            <text x={300} y={92} textAnchor="middle" fontSize={12} fontWeight={700} fill="#fff" fontFamily="var(--eng-font)">API Gateway</text>

            {/* policy cards inside */}
            {[
              { y: 108, icon: "🔐", label: "1. Auth - verify Bearer token" },
              { y: 138, icon: "⏱", label: `2. Rate limit - ${bucket}/5 tokens left` },
              { y: 168, icon: "↪", label: "3. Route by path → backend service" },
            ].map((p) => (
              <g key={p.y}>
                <rect x={185} y={p.y - 10} width={230} height={22} rx={4} fill="rgba(255,255,255,0.12)" />
                <text x={196} y={p.y + 5} fontSize={11} fill="#fff" fontFamily="var(--eng-font)">{p.icon}  {p.label}</text>
              </g>
            ))}
          </g>

          {/* Microservices */}
          {Object.entries(services).map(([path, svc], i) => {
            const y = 60 + i * 65;
            return (
              <g key={path}>
                <rect x={530} y={y} width={170} height={48} rx={8} fill="var(--eng-surface)" stroke={svc.color} strokeWidth={1.5} />
                <text x={615} y={y + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill={svc.color} fontFamily="var(--eng-font)">{svc.label}</text>
                <text x={615} y={y + 38} textAnchor="middle" fontSize={10} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">handles {path}/*</text>
                <line x1={430} y1={140} x2={530} y2={y + 24} stroke="var(--eng-border)" strokeWidth={1.2} />
              </g>
            );
          })}

          <line x1={75} y1={140} x2={170} y2={140} stroke="#8b5cf6" strokeWidth={2} markerEnd="url(#gwArr)" />
          <defs>
            <marker id="gwArr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
              <polygon points="0 0, 6 3, 0 6" fill="#8b5cf6" />
            </marker>
          </defs>
        </svg>
      </div>

      <div className="card-eng" style={{ padding: 14, marginBottom: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: "0 0 10px" }}>
          Send a request. The gateway applies auth → rate limit → route, in that order. Spam the buttons to drain the rate-limit bucket.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {Object.entries(services).map(([path, svc]) => (
            <div key={path} style={{ display: "flex", gap: 4 }}>
              <button onClick={() => send(path, false)} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "6px 10px", borderColor: svc.color, color: svc.color }}>
                GET {path}
              </button>
              <button onClick={() => send(path, true)} className="btn-eng" style={{ fontSize: "0.78rem", padding: "6px 10px", background: svc.color }}>
                + token
              </button>
            </div>
          ))}
          <button onClick={reset} className="btn-eng-ghost" style={{ fontSize: "0.78rem", padding: "6px 10px" }}>Reset</button>
        </div>
      </div>

      <div className="card-eng" style={{ padding: 14 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 10px" }}>Request log</h4>
        {requests.length === 0 && (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: 0 }}>No requests yet - try sending one.</p>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {requests.map((r) => {
            const meta = {
              "pending": { color: "var(--eng-text-muted)", text: "…", icon: "⌛" },
              "auth-fail": { color: "#ef4444", text: "401 Unauthorized - gateway rejected, no backend touched", icon: "🚫" },
              "rate-limited": { color: "#f59e0b", text: "429 Too Many Requests - bucket empty, backend protected", icon: "🪣" },
              "routed": { color: "#10b981", text: `200 OK - routed to ${r.routedTo}`, icon: "✅" },
            }[r.status];
            return (
              <div key={r.id} style={{ display: "flex", gap: 10, alignItems: "center", padding: "6px 10px", borderRadius: 6, background: "var(--eng-surface)", border: `1px solid ${meta.color}33`, fontFamily: "var(--eng-font)", fontSize: "0.82rem" }}>
                <span style={{ fontWeight: 700, color: "var(--eng-text-muted)" }}>#{r.id}</span>
                <code style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)", padding: "1px 6px", borderRadius: 4 }}>{r.path}</code>
                <span style={{ color: "var(--eng-text-muted)", fontSize: "0.75rem" }}>{r.token ? "Bearer …" : "no auth"}</span>
                <span style={{ marginLeft: "auto", color: meta.color, fontWeight: 600 }}>{meta.icon} {meta.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 4 - Side-by-side comparison + use-case picker                  */
/* ================================================================== */

const COMPARISON_ROWS: Array<{ field: string; forward: string; reverse: string; gateway: string }> = [
  { field: "Sits in front of", forward: "Clients", reverse: "Servers", gateway: "Servers (with smarts)" },
  { field: "Configured by", forward: "Client / network admin", reverse: "Service operator", gateway: "Service operator" },
  { field: "Knows about", forward: "Outbound destinations", reverse: "Backend pool", gateway: "Backend pool + business logic" },
  { field: "Hides", forward: "Client identity from origin", reverse: "Server identity from client", gateway: "Server identity + microservice topology" },
  { field: "Typical features", forward: "Cache, content filter, logging, anonymity", reverse: "Load balance, TLS termination, cache, health checks", gateway: "Auth (JWT/OAuth), rate limit, throttling, request transformation, path routing, observability" },
  { field: "OSI layer", forward: "L7 (HTTP)", reverse: "L4 (TCP) or L7 (HTTP)", gateway: "L7 (HTTP/gRPC)" },
  { field: "Examples", forward: "Squid, corporate Zscaler, browser proxy", reverse: "nginx, HAProxy, AWS ALB, Cloudflare", gateway: "Kong, AWS API Gateway, Istio Ingress, Apigee" },
];

const USE_CASES: Array<{ id: string; label: string; correct: "forward" | "reverse" | "gateway"; why: string }> = [
  { id: "uc1", label: "Block social media for staff during work hours", correct: "forward", why: "Egress filtering on outbound traffic - that's a forward proxy's job." },
  { id: "uc2", label: "Distribute traffic for example.com across 3 web servers", correct: "reverse", why: "Pure load balancing in front of a backend pool - classic reverse proxy." },
  { id: "uc3", label: "Verify JWTs before requests reach any of your 12 microservices", correct: "gateway", why: "Centralized auth + per-service routing - that's the gateway pattern." },
  { id: "uc4", label: "Terminate TLS for api.example.com so backends only handle plain HTTP", correct: "reverse", why: "TLS offload at the edge of your infra is a textbook reverse-proxy job." },
  { id: "uc5", label: "Apply per-API-key rate limits before traffic reaches services", correct: "gateway", why: "Rate limiting tied to authenticated identity = API Gateway." },
  { id: "uc6", label: "Cache the public Internet for everyone in the office building", correct: "forward", why: "Shared cache for outbound web requests = forward proxy." },
];

function CompareTab() {
  const [pickedFor, setPickedFor] = useState<Record<string, "forward" | "reverse" | "gateway" | null>>({});
  const [revealed, setRevealed] = useState(false);

  const score = useMemo(() => {
    return USE_CASES.reduce((acc, uc) => acc + (pickedFor[uc.id] === uc.correct ? 1 : 0), 0);
  }, [pickedFor]);

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Picking the Right Tool
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        First a feature matrix. Then six real scenarios - pick the right tool, then reveal answers.
      </p>

      <div className="card-eng" style={{ padding: 0, overflowX: "auto", marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ background: "var(--eng-surface)", borderBottom: "2px solid var(--eng-border)" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 700, textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.05em" }}>Aspect</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#3b82f6", fontWeight: 700 }}>Forward Proxy</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#10b981", fontWeight: 700 }}>Reverse Proxy</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#8b5cf6", fontWeight: 700 }}>API Gateway</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_ROWS.map((row, i) => (
              <tr key={row.field} style={{ borderBottom: i === COMPARISON_ROWS.length - 1 ? "none" : "1px solid var(--eng-border)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--eng-text)" }}>{row.field}</td>
                <td style={{ padding: "10px 12px", color: "var(--eng-text)" }}>{row.forward}</td>
                <td style={{ padding: "10px 12px", color: "var(--eng-text)" }}>{row.reverse}</td>
                <td style={{ padding: "10px 12px", color: "var(--eng-text)" }}>{row.gateway}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
        Pick the right tool for each scenario
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
        {USE_CASES.map((uc) => {
          const picked = pickedFor[uc.id];
          const correct = picked === uc.correct;
          return (
            <div key={uc.id} className="card-eng" style={{ padding: 14, borderLeft: revealed && picked ? `4px solid ${correct ? "#10b981" : "#ef4444"}` : "4px solid var(--eng-border)" }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.88rem", color: "var(--eng-text)", marginBottom: 8 }}>{uc.label}</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(["forward", "reverse", "gateway"] as const).map((kind) => {
                  const sel = picked === kind;
                  const color = kind === "forward" ? "#3b82f6" : kind === "reverse" ? "#10b981" : "#8b5cf6";
                  const label = kind === "forward" ? "Forward Proxy" : kind === "reverse" ? "Reverse Proxy" : "API Gateway";
                  return (
                    <button
                      key={kind}
                      onClick={() => setPickedFor((p) => ({ ...p, [uc.id]: kind }))}
                      className={sel ? "btn-eng" : "btn-eng-outline"}
                      style={{ fontSize: "0.78rem", padding: "5px 10px", background: sel ? color : undefined, borderColor: color, color: sel ? "#fff" : color }}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {revealed && picked && (
                <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: correct ? "#065f46" : "#991b1b" }}>
                  {correct ? "Correct. " : `Should be ${uc.correct === "forward" ? "Forward Proxy" : uc.correct === "reverse" ? "Reverse Proxy" : "API Gateway"}. `}
                  {uc.why}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button onClick={() => setRevealed(true)} className="btn-eng" style={{ fontSize: "0.85rem" }} disabled={Object.keys(pickedFor).length < USE_CASES.length}>
          Reveal answers
        </button>
        <button onClick={() => { setRevealed(false); setPickedFor({}); }} className="btn-eng-ghost" style={{ fontSize: "0.85rem" }}>
          Reset
        </button>
        {revealed && (
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)", fontWeight: 600 }}>
            Score: {score}/{USE_CASES.length}
          </span>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tiny shared SVG nodes                                              */
/* ================================================================== */

function ClientNode({ x, y, label, highlight }: { x: number; y: number; label: string; highlight?: boolean }) {
  const c = highlight ? "#3b82f6" : "var(--eng-text-muted)";
  return (
    <g>
      <rect x={x - 25} y={y - 16} width={50} height={32} rx={6} fill="var(--eng-surface)" stroke={c} strokeWidth={1.5} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill={c}>{label}</text>
    </g>
  );
}

function ServerNode({ x, y, label, highlight }: { x: number; y: number; label: string; highlight?: boolean }) {
  const c = highlight ? "#10b981" : "var(--eng-text-muted)";
  return (
    <g>
      <rect x={x - 60} y={y - 18} width={120} height={36} rx={6} fill={highlight ? "rgba(16,185,129,0.15)" : "var(--eng-surface)"} stroke={c} strokeWidth={1.5} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={10} fontFamily="var(--eng-font)" fontWeight={600} fill={c}>{label}</text>
    </g>
  );
}

function ArrowSeg({ x1, y1, x2, y2, active, color, label }: { x1: number; y1: number; x2: number; y2: number; active: boolean; color: string; label?: string }) {
  return (
    <g opacity={active ? 1 : 0.3}>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={active ? 2.5 : 1.5} markerEnd={active ? `url(#arr-${color.replace("#", "")})` : undefined} />
      {label && (
        <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 - 6} textAnchor="middle" fontSize={9} fontFamily="var(--eng-font)" fontWeight={600} fill={color}>{label}</text>
      )}
      <defs>
        <marker id={`arr-${color.replace("#", "")}`} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill={color} />
        </marker>
      </defs>
    </g>
  );
}

/* ================================================================== */
/*  Lesson definition                                                  */
/* ================================================================== */

const TABS: EngTabDef[] = [
  { id: "forward", label: "Forward Proxy", icon: <Filter className="w-4 h-4" />, content: <ForwardProxyTab /> },
  { id: "reverse", label: "Reverse Proxy", icon: <Server className="w-4 h-4" />, content: <ReverseProxyTab /> },
  { id: "gateway", label: "API Gateway", icon: <Key className="w-4 h-4" />, content: <ApiGatewayTab /> },
  { id: "compare", label: "Pick the Tool", icon: <Layers className="w-4 h-4" />, content: <CompareTab /> },
];

const QUIZ: EngQuizQuestion[] = [
  {
    question: "From the origin server's perspective, which IP address shows up in the access log when a forward proxy is in use?",
    options: [
      "The client's real IP",
      "The proxy's IP",
      "Both, in two separate fields",
      "Neither - forward proxies hide all addresses",
    ],
    correctIndex: 1,
    explanation: "The proxy makes the outbound TCP connection, so the origin sees the proxy's IP. The real client IP may be added in an X-Forwarded-For header, but that's not the source address of the connection.",
  },
  {
    question: "Why is TLS termination almost always done at the reverse proxy rather than at each backend?",
    options: [
      "TLS only works at reverse proxies",
      "Centralizing it means one cert/private key to rotate, one place to enforce TLS policy, and backends serve plain HTTP for simpler debugging and lower CPU",
      "Backends cannot speak TLS",
      "Reverse proxies require TLS to function",
    ],
    correctIndex: 1,
    explanation: "Cert management is operationally painful. Doing TLS at the reverse proxy means one place to rotate certs and enforce ciphers; the proxy-to-backend hop typically rides a private network in plain HTTP for simpler observability.",
  },
  {
    question: "Which capability is the most defining feature of an API Gateway versus a plain reverse proxy?",
    options: [
      "Load balancing across backends",
      "Caching static assets",
      "Authentication, per-identity rate limiting, and request transformation tied to API contracts",
      "TLS termination",
    ],
    correctIndex: 2,
    explanation: "Reverse proxies do load balancing, caching and TLS termination. Gateways add API-aware concerns: validating JWTs, enforcing per-key rate limits, transforming requests, mapping URL paths to microservices, exposing OpenAPI-driven docs.",
  },
  {
    question: "An employee sets their browser to use proxy.corp:3128. The corporate DNS resolves only internal names. What stops them from reaching arbitrary websites?",
    options: [
      "Nothing - once configured, all sites are reachable",
      "The forward proxy enforces an allow-list / deny-list before it even attempts the outbound DNS lookup and connection",
      "The browser refuses non-whitelisted domains",
      "The OS firewall",
    ],
    correctIndex: 1,
    explanation: "The whole point of a corporate forward proxy is policy enforcement: it does the DNS lookup and TCP connection itself, so it can refuse based on domain, content type, or time of day before any traffic leaves the building.",
  },
  {
    question: "You add a new microservice. Where do you typically configure 'requests to /payments/* go to the new service'?",
    options: [
      "On every client",
      "On the API Gateway via a routing rule (no client change needed)",
      "On the DNS server",
      "On the backend service itself",
    ],
    correctIndex: 1,
    explanation: "Path-based routing is centralized at the gateway - clients keep talking to api.example.com and the gateway dispatches by URL prefix. Adding a service means a config change at one place.",
  },
  {
    question: "A reverse proxy in front of 4 backend servers is doing round-robin. One backend returns HTTP 500 for every request. What does a properly configured reverse proxy do?",
    options: [
      "Keeps round-robining and returns errors to 25% of users",
      "Marks the unhealthy backend as down (via active health checks or passive 5xx detection) and routes only to the remaining 3",
      "Forwards all traffic to the unhealthy backend",
      "Crashes",
    ],
    correctIndex: 1,
    explanation: "Health checks (active or passive) are core to a reverse proxy. The unhealthy node is removed from the pool until checks pass again - that's how load balancers actually deliver availability, not just distribute load.",
  },
];

export default function CN_L7_ProxyGatewayActivity() {
  return (
    <EngineeringLessonShell
      title="Forward Proxy vs Reverse Proxy vs API Gateway"
      level={7}
      lessonNumber={5}
      tabs={TABS}
      quiz={QUIZ}
      placementRelevance="High"
      nextLessonHint="Capstone - what really happens when you type a URL into your browser."
    />
  );
}
