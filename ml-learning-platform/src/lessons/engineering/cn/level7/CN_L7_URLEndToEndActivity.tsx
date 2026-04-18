"use client";

import { useState, useEffect, useRef } from "react";
import { Globe, Clock, Layers, Play, Pause, RotateCcw, ChevronRight } from "lucide-react";
import EngineeringLessonShell, { type EngTabDef, type EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ========================================================================== */
/*  Stage data - the canonical chain                                          */
/* ========================================================================== */

interface Stage {
  id: string;
  title: string;
  short: string;
  layer: string;
  detail: string;
  protocol: string;
  baseMs: number;
  color: string;
}

const STAGES: Stage[] = [
  {
    id: "parse",
    title: "1. Browser parses URL",
    short: "Parse",
    layer: "Application",
    protocol: "URL/URI",
    detail: "The browser breaks the URL into scheme (https), host (www.example.com), port (443 implicit), path (/users), and query. It also checks HSTS preload list - if the host is on it, http→https is forced before any network call.",
    baseMs: 1,
    color: "#64748b",
  },
  {
    id: "dns",
    title: "2. DNS resolution",
    short: "DNS",
    layer: "Application (UDP/TCP 53)",
    protocol: "DNS",
    detail: "Browser cache → OS cache → router → recursive resolver (often 8.8.8.8 or ISP). If miss, resolver walks: root → .com TLD → example.com authoritative → returns A/AAAA record. Cached for the TTL. UDP usually; TCP if response > 512 bytes or DNSSEC.",
    baseMs: 30,
    color: "#3b82f6",
  },
  {
    id: "arp",
    title: "3. ARP - find next-hop MAC",
    short: "ARP",
    layer: "Link (L2)",
    protocol: "ARP",
    detail: "The OS now has the destination IP, but to put a frame on the LAN it needs the MAC of the next hop (the default gateway, not the destination - that's a different subnet). It checks ARP cache; if miss, broadcasts 'Who has 192.168.1.1?'. The router replies with its MAC. Cached.",
    baseMs: 2,
    color: "#8b5cf6",
  },
  {
    id: "tcp",
    title: "4. TCP 3-way handshake",
    short: "TCP",
    layer: "Transport (L4)",
    protocol: "TCP",
    detail: "Client → SYN (seq=x) → Server. Server → SYN-ACK (seq=y, ack=x+1) → Client. Client → ACK (ack=y+1) → Server. Connection established. Costs 1 RTT before any data can flow. TCP Fast Open can skip this on repeat visits.",
    baseMs: 50,
    color: "#10b981",
  },
  {
    id: "tls",
    title: "5. TLS handshake",
    short: "TLS",
    layer: "Presentation (L6) / TLS",
    protocol: "TLS 1.3",
    detail: "TLS 1.3: Client Hello (with key share + supported ciphers) → Server Hello + cert + Finished → Client verifies cert chain against root CAs, sends Finished. 1 RTT total (vs 2 RTT for TLS 1.2). Session resumption (PSK) → 0-RTT possible. ECDHE for forward secrecy; AES-GCM or ChaCha20 for symmetric.",
    baseMs: 50,
    color: "#f59e0b",
  },
  {
    id: "http",
    title: "6. HTTP request → response",
    short: "HTTP",
    layer: "Application (L7)",
    protocol: "HTTP/2 or HTTP/3",
    detail: "Browser sends GET /users HTTP/2 with headers (Host, User-Agent, Cookie, Accept-Encoding). Server processes (DB query, render template, gzip), sends 200 OK + headers + body. HTTP/2 multiplexes many requests over one TCP connection; HTTP/3 runs over QUIC (UDP) and avoids head-of-line blocking.",
    baseMs: 80,
    color: "#ef4444",
  },
  {
    id: "render",
    title: "7. Browser parses HTML",
    short: "Parse HTML",
    layer: "Application (Browser)",
    protocol: "HTML5",
    detail: "Browser tokenizes HTML → builds DOM tree. Hits <link rel=stylesheet> → fires off CSS request (blocking render). Hits <script> → blocks parser unless async/defer. Builds CSSOM. DOM + CSSOM → Render Tree.",
    baseMs: 30,
    color: "#06b6d4",
  },
  {
    id: "paint",
    title: "8. Layout, paint, composite",
    short: "Paint",
    layer: "Browser (rendering pipeline)",
    protocol: "-",
    detail: "Layout: compute geometry (where every box sits). Paint: fill pixels into layers. Composite: GPU stitches layers together. First Contentful Paint (FCP) and Largest Contentful Paint (LCP) are measured here - both Core Web Vitals. JavaScript may then mutate DOM, causing reflow/repaint cycles.",
    baseMs: 40,
    color: "#ec4899"
  },
];

/* ========================================================================== */
/*  Reusable bits                                                              */
/* ========================================================================== */

function StageBadge({ stage, active, done }: { stage: Stage; active: boolean; done: boolean }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        background: active ? `${stage.color}20` : done ? `${stage.color}10` : "var(--eng-surface)",
        border: active ? `2px solid ${stage.color}` : done ? `1.5px solid ${stage.color}` : "1px solid var(--eng-border)",
        transition: "all 0.3s",
        minWidth: 96,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: "0.7rem", fontWeight: 700, color: stage.color, marginBottom: 2 }}>{stage.short}</div>
      <div style={{ fontSize: "0.65rem", color: "var(--eng-text-muted)" }}>{stage.layer.split(" ")[0]}</div>
    </div>
  );
}

/* ========================================================================== */
/*  Tab 1: End-to-End Story                                                    */
/* ========================================================================== */

function EndToEndStoryTab() {
  const [stageIdx, setStageIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!playing) return;
    if (stageIdx >= STAGES.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = setTimeout(() => setStageIdx((i) => i + 1), 1400);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stageIdx]);

  const stage = STAGES[stageIdx];

  return (
    <div className="space-y-6">
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          The classic interview question
        </h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.55 }}>
          You type <code style={{ background: "var(--eng-bg)", padding: "1px 6px", borderRadius: 4, fontFamily: "monospace" }}>https://www.example.com/users</code> and hit Enter.
          What actually happens, end to end? Senior interviews expect you to chain DNS → ARP → TCP → TLS → HTTP → render and explain each layer.
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            className="btn-eng"
            onClick={() => setPlaying((p) => !p)}
            disabled={stageIdx >= STAGES.length - 1 && !playing}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? "Pause" : "Auto-play"}
          </button>
          <button
            className="btn-eng-outline"
            onClick={() => { setStageIdx(0); setPlaying(false); }}
            style={{ padding: "6px 14px", fontSize: "0.85rem" }}
          >
            <RotateCcw className="w-4 h-4" /> Restart
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn-eng-outline"
            onClick={() => setStageIdx((i) => Math.max(0, i - 1))}
            disabled={stageIdx === 0}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: "0.8rem", color: "var(--eng-text-muted)", minWidth: 60, textAlign: "center" }}>
            {stageIdx + 1} / {STAGES.length}
          </span>
          <button
            className="btn-eng-outline"
            onClick={() => setStageIdx((i) => Math.min(STAGES.length - 1, i + 1))}
            disabled={stageIdx === STAGES.length - 1}
            style={{ padding: "6px 12px", fontSize: "0.8rem" }}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Stage chain */}
      <div className="flex items-center gap-1 overflow-x-auto" style={{ paddingBottom: 8 }}>
        {STAGES.map((s, i) => (
          <div key={s.id} className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => { setStageIdx(i); setPlaying(false); }}
              style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer" }}
            >
              <StageBadge stage={s} active={i === stageIdx} done={i < stageIdx} />
            </button>
            {i < STAGES.length - 1 && (
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: i < stageIdx ? STAGES[i].color : "#cbd5e1" }} />
            )}
          </div>
        ))}
      </div>

      {/* Active stage detail */}
      <div className="card-eng eng-fadeIn" key={stage.id} style={{ padding: 20, borderLeft: `4px solid ${stage.color}` }}>
        <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 8 }}>
          <h3 style={{ fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: 0 }}>
            {stage.title}
          </h3>
          <span className="tag-eng" style={{ background: `${stage.color}15`, color: stage.color }}>
            {stage.layer}
          </span>
          <span className="tag-eng" style={{ background: "var(--eng-bg)", color: "var(--eng-text-muted)" }}>
            ~{stage.baseMs} ms
          </span>
        </div>
        <p style={{ fontSize: "0.92rem", color: "var(--eng-text)", margin: 0, lineHeight: 1.6 }}>
          {stage.detail}
        </p>
      </div>

      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        <strong>Interview tip:</strong> Don&apos;t just list stages - explain the <em>why</em>. Why does TLS need a separate handshake on top of TCP? (TCP gives a reliable byte stream; TLS adds confidentiality and identity.) Why does ARP exist? (IP needs L2 frames to actually move on the wire.) Why is DNS UDP by default? (Cheap, stateless, fits in one packet.)
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  Tab 2: Latency Budget                                                      */
/* ========================================================================== */

function LatencyBudgetTab() {
  const [rtt, setRtt] = useState(20); // network RTT in ms
  const [dnsCached, setDnsCached] = useState(false);
  const [tlsResumed, setTlsResumed] = useState(false);
  const [serverMs, setServerMs] = useState(80);
  const [pageBytes, setPageBytes] = useState(500); // KB
  const [bandwidth, setBandwidth] = useState(20); // Mbps

  // Compute breakdown
  // DNS: 0 if cached, else 1 RTT (~rtt) for resolver to authoritative
  const dnsMs = dnsCached ? 0 : Math.max(5, rtt * 1.5);
  const arpMs = 2;
  const tcpMs = rtt; // 1 RTT for handshake (SYN-ACK part)
  const tlsMs = tlsResumed ? 0 : rtt; // TLS 1.3 = 1 RTT, resumed = 0-RTT
  const httpRequestMs = rtt / 2; // half RTT to send request
  const serverProcessMs = serverMs;
  const httpResponseMs = rtt / 2; // half RTT for first byte back
  // download: bytes / bandwidth → ms
  const downloadMs = Math.round(((pageBytes * 8) / bandwidth) * 1000 / 1000);
  const renderMs = 50;

  const total =
    dnsMs + arpMs + tcpMs + tlsMs + httpRequestMs + serverProcessMs + httpResponseMs + downloadMs + renderMs;

  const items = [
    { label: "DNS", ms: dnsMs, color: "#3b82f6" },
    { label: "ARP", ms: arpMs, color: "#8b5cf6" },
    { label: "TCP handshake", ms: tcpMs, color: "#10b981" },
    { label: "TLS handshake", ms: tlsMs, color: "#f59e0b" },
    { label: "Request travel", ms: httpRequestMs, color: "#06b6d4" },
    { label: "Server process", ms: serverProcessMs, color: "#ef4444" },
    { label: "First byte back", ms: httpResponseMs, color: "#06b6d4" },
    { label: "Download body", ms: downloadMs, color: "#ec4899" },
    { label: "Render & paint", ms: renderMs, color: "#64748b" },
  ];

  const maxMs = Math.max(...items.map((i) => i.ms), 1);

  return (
    <div className="space-y-5">
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          Where does the time go?
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.55 }}>
          A single page load is a sum of network RTTs, server work, and bytes-over-pipe. Move the sliders and watch the breakdown.
        </p>
      </div>

      {/* Sliders */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
              Network RTT: <strong>{rtt} ms</strong>
            </label>
            <input type="range" min={5} max={300} value={rtt} onChange={(e) => setRtt(Number(e.target.value))} style={{ width: "100%" }} />
            <div style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)" }}>5ms = same city · 100ms = continent · 300ms = mobile/satellite</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
              Server processing: <strong>{serverMs} ms</strong>
            </label>
            <input type="range" min={5} max={500} value={serverMs} onChange={(e) => setServerMs(Number(e.target.value))} style={{ width: "100%" }} />
            <div style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)" }}>Database query, template render, etc.</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
              Page size: <strong>{pageBytes} KB</strong>
            </label>
            <input type="range" min={50} max={5000} step={50} value={pageBytes} onChange={(e) => setPageBytes(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
              Bandwidth: <strong>{bandwidth} Mbps</strong>
            </label>
            <input type="range" min={1} max={500} value={bandwidth} onChange={(e) => setBandwidth(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
        </div>

        <div className="flex flex-wrap gap-3" style={{ marginTop: 16 }}>
          <label className="flex items-center gap-2" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
            <input type="checkbox" checked={dnsCached} onChange={(e) => setDnsCached(e.target.checked)} />
            DNS cached (skip resolver)
          </label>
          <label className="flex items-center gap-2" style={{ fontSize: "0.85rem", cursor: "pointer" }}>
            <input type="checkbox" checked={tlsResumed} onChange={(e) => setTlsResumed(e.target.checked)} />
            TLS session resumed (0-RTT)
          </label>
        </div>
      </div>

      {/* Breakdown chart */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <h4 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: 0 }}>Latency breakdown</h4>
          <div style={{ fontSize: "0.85rem", color: "var(--eng-text)" }}>
            Total: <strong style={{ fontSize: "1.1rem", color: "var(--eng-primary)" }}>{Math.round(total)} ms</strong>
          </div>
        </div>
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-center gap-2">
              <div style={{ minWidth: 110, fontSize: "0.78rem", color: "var(--eng-text-muted)" }}>{it.label}</div>
              <div style={{ flex: 1, height: 18, background: "var(--eng-bg)", borderRadius: 4, position: "relative", border: "1px solid var(--eng-border)" }}>
                <div
                  style={{
                    width: `${(it.ms / maxMs) * 100}%`,
                    height: "100%",
                    background: it.color,
                    borderRadius: 3,
                    transition: "width 0.25s",
                    minWidth: it.ms > 0 ? 2 : 0,
                  }}
                />
              </div>
              <div style={{ minWidth: 60, textAlign: "right", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)" }}>
                {Math.round(it.ms)} ms
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--eng-border)", fontSize: "0.78rem", color: "var(--eng-text-muted)", lineHeight: 1.6 }}>
          <strong style={{ color: "var(--eng-text)" }}>What this teaches:</strong> on a slow network, RTT dominates - that&apos;s why CDNs exist (cut RTT). On a fast network with a heavy page, bandwidth dominates - that&apos;s why we minify and image-compress. Server time is your code; everything else is physics.
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  Tab 3: Layer Trace                                                         */
/* ========================================================================== */

interface LayerTrace {
  stage: string;
  app: boolean;
  presentation: boolean;
  session: boolean;
  transport: boolean;
  network: boolean;
  link: boolean;
  physical: boolean;
  notes: string;
}

const LAYER_TRACES: LayerTrace[] = [
  { stage: "Parse URL", app: true, presentation: false, session: false, transport: false, network: false, link: false, physical: false, notes: "Pure browser logic, no network." },
  { stage: "DNS query",  app: true, presentation: false, session: false, transport: true, network: true, link: true, physical: true, notes: "DNS app → UDP/TCP → IP → frame → wire." },
  { stage: "ARP",        app: false, presentation: false, session: false, transport: false, network: false, link: true, physical: true, notes: "Pure L2 - no IP header. Ethernet frame only." },
  { stage: "TCP handshake", app: false, presentation: false, session: false, transport: true, network: true, link: true, physical: true, notes: "SYN/SYN-ACK/ACK live in TCP segments." },
  { stage: "TLS handshake", app: true, presentation: true, session: true, transport: true, network: true, link: true, physical: true, notes: "TLS spans presentation+session in OSI; runs over TCP." },
  { stage: "HTTP request",  app: true, presentation: true, session: true, transport: true, network: true, link: true, physical: true, notes: "All seven layers active for actual data." },
  { stage: "Render", app: true, presentation: false, session: false, transport: false, network: false, link: false, physical: false, notes: "Browser internal pipeline." },
];

const LAYER_LABELS = [
  { key: "app", name: "Application", n: 7, color: "#ef4444" },
  { key: "presentation", name: "Presentation", n: 6, color: "#f59e0b" },
  { key: "session", name: "Session", n: 5, color: "#eab308" },
  { key: "transport", name: "Transport", n: 4, color: "#10b981" },
  { key: "network", name: "Network", n: 3, color: "#06b6d4" },
  { key: "link", name: "Link", n: 2, color: "#3b82f6" },
  { key: "physical", name: "Physical", n: 1, color: "#8b5cf6" },
] as const;

function LayerTraceTab() {
  const [selected, setSelected] = useState(0);
  const trace = LAYER_TRACES[selected];

  return (
    <div className="space-y-5">
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          Which OSI layers fire at each stage?
        </h3>
        <p style={{ fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.55 }}>
          A common interview trap: &quot;ARP is on which layer?&quot; (L2 - it doesn&apos;t use IP.) &quot;Where does TLS live?&quot; (Presentation/Session in OSI; between TCP and HTTP in TCP/IP.) Click each stage to see the layers it touches.
        </p>
      </div>

      {/* Stage selector */}
      <div className="flex flex-wrap gap-2">
        {LAYER_TRACES.map((t, i) => (
          <button
            key={t.stage}
            onClick={() => setSelected(i)}
            className={i === selected ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.78rem", padding: "5px 12px" }}
          >
            {t.stage}
          </button>
        ))}
      </div>

      {/* OSI stack viz */}
      <div className="card-eng" style={{ padding: 20 }}>
        <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          OSI stack - <span style={{ color: "var(--eng-primary)" }}>{trace.stage}</span>
        </h4>
        <div className="space-y-1.5">
          {LAYER_LABELS.map((layer) => {
            const active = trace[layer.key as keyof LayerTrace] as boolean;
            return (
              <div
                key={layer.key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: active ? `${layer.color}15` : "var(--eng-bg)",
                  border: active ? `1.5px solid ${layer.color}` : "1px solid var(--eng-border)",
                  opacity: active ? 1 : 0.4,
                  transition: "all 0.25s",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: active ? layer.color : "#cbd5e1",
                  color: "#fff", fontSize: "0.8rem", fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  L{layer.n}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.9rem", fontWeight: 600, color: active ? "var(--eng-text)" : "var(--eng-text-muted)" }}>
                    {layer.name}
                  </div>
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: active ? layer.color : "#94a3b8" }}>
                  {active ? "Active" : "Inactive"}
                </div>
              </div>
            );
          })}
        </div>

        <div className="info-eng" style={{ marginTop: 14, fontSize: "0.85rem" }}>
          <strong>Note:</strong> {trace.notes}
        </div>
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <h4 style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          OSI vs TCP/IP - quick mapping
        </h4>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", fontSize: "0.82rem", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--eng-bg)", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>OSI (7 layers)</th>
                <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>TCP/IP (4 layers)</th>
                <th style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Examples</th>
              </tr>
            </thead>
            <tbody>
              <tr><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Application, Presentation, Session</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Application</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>HTTP, DNS, TLS, FTP</td></tr>
              <tr><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Transport</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Transport</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>TCP, UDP, QUIC</td></tr>
              <tr><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Network</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>Internet</td><td style={{ padding: "8px 12px", borderBottom: "1px solid var(--eng-border)" }}>IP, ICMP, ARP*</td></tr>
              <tr><td style={{ padding: "8px 12px" }}>Data Link, Physical</td><td style={{ padding: "8px 12px" }}>Network Access</td><td style={{ padding: "8px 12px" }}>Ethernet, Wi-Fi, MAC</td></tr>
            </tbody>
          </table>
          <p style={{ fontSize: "0.72rem", color: "var(--eng-text-muted)", marginTop: 6 }}>
            *ARP is technically L2.5 - it operates between Link and Network. Different textbooks place it differently.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  Quiz                                                                       */
/* ========================================================================== */

const QUIZ: EngQuizQuestion[] = [
  {
    question: "When the browser issues an ARP request for a host on a different subnet, whose MAC address comes back?",
    options: [
      "The destination host's MAC",
      "The default gateway's MAC",
      "The DNS server's MAC",
      "ARP fails - you can't ARP across subnets",
    ],
    correctIndex: 1,
    explanation: "ARP is L2 and only works within a single broadcast domain. To reach another subnet you ARP the default gateway, then the gateway routes the packet onward (and ARPs further hops on its side).",
  },
  {
    question: "TLS 1.3 cuts the handshake to 1 RTT (vs 2 RTT in TLS 1.2). What's the main reason?",
    options: [
      "It removes server certificates entirely",
      "Client sends key share + cipher list in the first message, so server can finish key exchange in one round trip",
      "It uses UDP instead of TCP",
      "It pre-shares keys with every server",
    ],
    correctIndex: 1,
    explanation: "TLS 1.3 collapses the negotiation: the client guesses supported groups and sends a key share immediately. Server picks one and responds with its key share + cert + Finished - done in 1 RTT. Resumed sessions can be 0-RTT.",
  },
  {
    question: "A user reports that example.com loads slowly on the first visit but is fast on reload. Which of these is the LEAST likely contributor?",
    options: [
      "DNS caching",
      "TCP connection reuse / keep-alive",
      "TLS session resumption",
      "ARP cache miss on the gateway",
    ],
    correctIndex: 3,
    explanation: "ARP entries on the local subnet are cheap (one broadcast on the LAN, sub-millisecond) and cached for minutes. DNS, TCP, and TLS each save tens to hundreds of milliseconds when warm - those dominate the first-vs-cached gap.",
  },
  {
    question: "An interviewer asks: \"Why does HTTP/3 use UDP when reliability is the whole point of HTTP?\"",
    options: [
      "UDP is faster than TCP at the kernel level so it always wins",
      "QUIC (running on UDP) implements its own reliability + congestion control in user space, which lets it solve TCP's head-of-line blocking and ship updates without OS changes",
      "Because TCP can't carry TLS",
      "HTTP/3 doesn't actually need reliability - it's used for streaming only",
    ],
    correctIndex: 1,
    explanation: "TCP's in-order byte stream means one lost packet stalls all multiplexed streams (head-of-line blocking). QUIC moves reliability into user space per-stream, so a lost packet only stalls its own stream. Bonus: deploying a TCP change needs OS updates; QUIC ships in the browser/server.",
  },
  {
    question: "Which sequence correctly orders what happens BEFORE the first HTTP byte is sent on a fresh connection to https://example.com?",
    options: [
      "DNS → TCP → TLS → ARP",
      "ARP → DNS → TCP → TLS",
      "DNS → ARP → TCP → TLS",
      "TCP → DNS → TLS → ARP",
    ],
    correctIndex: 2,
    explanation: "DNS first (to get the IP). ARP next (to know which MAC to send the first packet to - usually the gateway). Then TCP handshake. Then TLS handshake. Only then does HTTP travel.",
  },
  {
    question: "On a 100ms-RTT mobile connection, you load a 200KB page from a server that takes 50ms to respond. With cold DNS and TLS 1.3 (no resumption), roughly what dominates total time?",
    options: [
      "Server processing (50ms is the longest single piece)",
      "Bandwidth - the 200KB body download",
      "Round trips - DNS + TCP + TLS each cost ~1 RTT, totalling ~300ms before the request even goes out",
      "ARP + render",
    ],
    correctIndex: 2,
    explanation: "On high-RTT networks, RTT count dwarfs everything. DNS lookup (~1 RTT) + TCP handshake (1 RTT) + TLS 1.3 handshake (1 RTT) = ~300ms before the GET is sent. This is exactly why CDNs (cut RTT), connection reuse, and TLS resumption matter so much on mobile.",
  },
];

/* ========================================================================== */
/*  Default export                                                              */
/* ========================================================================== */

export default function CN_L7_URLEndToEndActivity() {
  const tabs: EngTabDef[] = [
    { id: "story", label: "End-to-End Story", icon: <Globe className="w-4 h-4" />, content: <EndToEndStoryTab /> },
    { id: "latency", label: "Latency Budget", icon: <Clock className="w-4 h-4" />, content: <LatencyBudgetTab /> },
    { id: "layers", label: "Layer Trace", icon: <Layers className="w-4 h-4" />, content: <LayerTraceTab /> },
  ];

  return (
    <EngineeringLessonShell
      title="What Happens When You Type a URL?"
      level={7}
      lessonNumber={6}
      tabs={tabs}
      quiz={QUIZ}
      placementRelevance="Capstone interview classic"
      nextLessonHint="You've now seen every layer in action - review with the spaced-repetition deck."
    />
  );
}
