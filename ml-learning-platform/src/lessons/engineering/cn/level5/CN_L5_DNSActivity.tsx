"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Globe,
  Search,
  Database,
  ArrowRight,
  ArrowDown,
  Clock,
  Server,
  RefreshCw,
  Layers,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type {
  EngTabDef,
  EngQuizQuestion,
} from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Tab 1 — DNS Hierarchy Tree                                         */
/* ================================================================== */

function DNSHierarchyTab() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [animPhase, setAnimPhase] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setAnimPhase((p) => (p + 1) % 4), 800);
    return () => clearInterval(id);
  }, []);

  const nodeInfo: Record<string, { title: string; desc: string; examples: string[] }> = {
    root: {
      title: "Root DNS Servers",
      desc: "13 logical root server clusters (A through M) managed by different organizations. They know the addresses of all TLD servers.",
      examples: ["a.root-servers.net", "b.root-servers.net", "m.root-servers.net"],
    },
    ".com": {
      title: ".com TLD Server",
      desc: "Managed by Verisign. Handles all .com domain queries and knows the authoritative nameservers for each .com domain.",
      examples: ["google.com", "amazon.com", "github.com"],
    },
    ".org": {
      title: ".org TLD Server",
      desc: "Managed by Public Interest Registry. Handles all .org domain queries.",
      examples: ["wikipedia.org", "mozilla.org", "apache.org"],
    },
    ".edu": {
      title: ".edu TLD Server",
      desc: "Managed by Educause. Reserved for accredited educational institutions.",
      examples: ["mit.edu", "stanford.edu", "harvard.edu"],
    },
    ".in": {
      title: ".in TLD Server (ccTLD)",
      desc: "Country code TLD for India, managed by NIXI. Includes .co.in, .ac.in, .gov.in.",
      examples: ["iitb.ac.in", "gov.in", "nic.in"],
    },
    "google.com": {
      title: "Authoritative NS for google.com",
      desc: "Google's own DNS servers (ns1.google.com - ns4.google.com) that hold the actual DNS records.",
      examples: ["A: 142.250.195.46", "MX: smtp.google.com", "AAAA: 2607:f8b0::"],
    },
    "github.com": {
      title: "Authoritative NS for github.com",
      desc: "GitHub's nameservers that hold DNS records for all github.com subdomains.",
      examples: ["A: 140.82.121.4", "CNAME: *.github.io", "MX: ..."],
    },
    "wikipedia.org": {
      title: "Authoritative NS for wikipedia.org",
      desc: "Wikimedia's nameservers serving records for wikipedia.org and its subdomains.",
      examples: ["A: 208.80.154.224", "en.wikipedia.org", "de.wikipedia.org"],
    },
    "mit.edu": {
      title: "Authoritative NS for mit.edu",
      desc: "MIT's DNS servers managing records for all mit.edu subdomains.",
      examples: ["A: 23.6.229.197", "web.mit.edu", "ocw.mit.edu"],
    },
  };

  const sel = selectedNode ? nodeInfo[selectedNode] : null;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DNS Hierarchy Tree
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        DNS is organized as an inverted tree. Click on any node to learn about its role.
      </p>

      <svg viewBox="0 0 800 480" style={{ width: "100%", maxWidth: 800, display: "block", margin: "0 auto 20px" }}>
        {/* Root */}
        <TreeNode x={400} y={40} label="." sublabel="Root" selected={selectedNode === "root"} onClick={() => setSelectedNode("root")} pulse={animPhase === 0} />

        {/* TLDs */}
        <TreeLine x1={400} y1={60} x2={150} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={300} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={500} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={650} y2={130} phase={animPhase} threshold={1} />

        <TreeNode x={150} y={140} label=".com" sublabel="TLD" selected={selectedNode === ".com"} onClick={() => setSelectedNode(".com")} pulse={animPhase === 1} />
        <TreeNode x={300} y={140} label=".org" sublabel="TLD" selected={selectedNode === ".org"} onClick={() => setSelectedNode(".org")} pulse={animPhase === 1} />
        <TreeNode x={500} y={140} label=".edu" sublabel="TLD" selected={selectedNode === ".edu"} onClick={() => setSelectedNode(".edu")} pulse={animPhase === 1} />
        <TreeNode x={650} y={140} label=".in" sublabel="ccTLD" selected={selectedNode === ".in"} onClick={() => setSelectedNode(".in")} pulse={animPhase === 1} />

        {/* Authoritative */}
        <TreeLine x1={150} y1={160} x2={100} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={150} y1={160} x2={210} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={300} y1={160} x2={300} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={500} y1={160} x2={500} y2={240} phase={animPhase} threshold={2} />

        <TreeNode x={100} y={250} label="google.com" sublabel="Auth NS" selected={selectedNode === "google.com"} onClick={() => setSelectedNode("google.com")} pulse={animPhase === 2} small />
        <TreeNode x={210} y={250} label="github.com" sublabel="Auth NS" selected={selectedNode === "github.com"} onClick={() => setSelectedNode("github.com")} pulse={animPhase === 2} small />
        <TreeNode x={300} y={250} label="wikipedia.org" sublabel="Auth NS" selected={selectedNode === "wikipedia.org"} onClick={() => setSelectedNode("wikipedia.org")} pulse={animPhase === 2} small />
        <TreeNode x={500} y={250} label="mit.edu" sublabel="Auth NS" selected={selectedNode === "mit.edu"} onClick={() => setSelectedNode("mit.edu")} pulse={animPhase === 2} small />

        {/* Layer labels */}
        <text x={770} y={45} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">Root Level</text>
        <text x={770} y={145} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">TLD Level</text>
        <text x={770} y={255} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">Authoritative</text>

        {/* Dashed zone separators */}
        <line x1={20} y1={90} x2={780} y2={90} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="6 4" />
        <line x1={20} y1={195} x2={780} y2={195} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="6 4" />
      </svg>

      {sel ? (
        <div className="card-eng p-5 eng-fadeIn" style={{ maxWidth: 600, margin: "0 auto" }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-primary)", margin: "0 0 6px" }}>
            {sel.title}
          </h4>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text)", margin: "0 0 10px", lineHeight: 1.6 }}>
            {sel.desc}
          </p>
          <div className="flex flex-wrap gap-2">
            {sel.examples.map((ex) => (
              <span key={ex} className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
                {ex}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="info-eng" style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            Click any node in the tree above to see details about that DNS level.
          </p>
        </div>
      )}
    </div>
  );
}

/* ---- Tree helper components ---- */

function TreeNode({ x, y, label, sublabel, selected, onClick, pulse, small }: {
  x: number; y: number; label: string; sublabel: string;
  selected: boolean; onClick: () => void; pulse?: boolean; small?: boolean;
}) {
  const r = small ? 28 : 32;
  return (
    <g onClick={onClick} style={{ cursor: "pointer" }}>
      {pulse && (
        <circle cx={x} cy={y} r={r + 8} fill="none" stroke="var(--eng-primary)" strokeWidth={1.5} opacity={0.3}>
          <animate attributeName="r" from={String(r)} to={String(r + 16)} dur="1.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        cx={x} cy={y} r={r}
        fill={selected ? "var(--eng-primary)" : "var(--eng-surface)"}
        stroke={selected ? "var(--eng-primary)" : "var(--eng-border)"}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <text
        x={x} y={y - (small ? 3 : 4)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={small ? 9 : 12} fontWeight={700}
        fontFamily="var(--eng-font)"
        fill={selected ? "#fff" : "var(--eng-text)"}
      >
        {label}
      </text>
      <text
        x={x} y={y + (small ? 9 : 12)}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={small ? 7 : 9}
        fontFamily="var(--eng-font)"
        fill={selected ? "rgba(255,255,255,0.7)" : "var(--eng-text-muted)"}
      >
        {sublabel}
      </text>
    </g>
  );
}

function TreeLine({ x1, y1, x2, y2, phase, threshold }: {
  x1: number; y1: number; x2: number; y2: number; phase: number; threshold: number;
}) {
  const active = phase >= threshold;
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={active ? "var(--eng-primary)" : "var(--eng-border)"}
      strokeWidth={active ? 2 : 1}
      strokeDasharray={active ? "none" : "4 3"}
      style={{ transition: "stroke 0.5s, stroke-width 0.3s" }}
    />
  );
}

/* ================================================================== */
/*  Tab 2 — DNS Resolution Animation                                    */
/* ================================================================== */

function DNSResolutionTab() {
  const [mode, setMode] = useState<"recursive" | "iterative">("recursive");
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const recursiveSteps = [
    { from: "client", to: "resolver", label: "Query: www.example.com?", desc: "Client sends query to local DNS resolver (configured via DHCP)" },
    { from: "resolver", to: "root", label: "Query: www.example.com?", desc: "Resolver asks root server — root replies with .com TLD server address" },
    { from: "root", to: "resolver", label: "Referral: .com TLD at 192.5.6.30", desc: "Root server refers resolver to the .com TLD nameserver" },
    { from: "resolver", to: "tld", label: "Query: www.example.com?", desc: "Resolver asks .com TLD — TLD replies with authoritative NS for example.com" },
    { from: "tld", to: "resolver", label: "Referral: example.com NS at 93.184.216.34", desc: "TLD refers resolver to example.com's authoritative nameserver" },
    { from: "resolver", to: "auth", label: "Query: www.example.com?", desc: "Resolver asks authoritative server for the final answer" },
    { from: "auth", to: "resolver", label: "Answer: A 93.184.216.34", desc: "Authoritative server returns the IP address record" },
    { from: "resolver", to: "client", label: "Answer: 93.184.216.34", desc: "Resolver caches the result and returns it to the client" },
  ];

  const iterativeSteps = [
    { from: "client", to: "resolver", label: "Query: www.example.com?", desc: "Client sends query to local DNS resolver" },
    { from: "resolver", to: "root", label: "Query: www.example.com?", desc: "Resolver asks root server" },
    { from: "root", to: "resolver", label: "Referral: ask .com TLD", desc: "Root says 'I don't know, but ask .com TLD server'" },
    { from: "resolver", to: "tld", label: "Query: www.example.com?", desc: "Resolver follows the referral and asks TLD" },
    { from: "tld", to: "resolver", label: "Referral: ask example.com NS", desc: "TLD says 'ask example.com's authoritative NS'" },
    { from: "resolver", to: "auth", label: "Query: www.example.com?", desc: "Resolver follows referral to authoritative" },
    { from: "auth", to: "resolver", label: "Answer: A 93.184.216.34", desc: "Authoritative returns the IP address" },
    { from: "resolver", to: "client", label: "Answer: 93.184.216.34", desc: "Resolver returns the answer to client" },
  ];

  const steps = mode === "recursive" ? recursiveSteps : iterativeSteps;

  const playAnim = useCallback(() => {
    setStep(0);
    setRunning(true);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (step >= steps.length) { setRunning(false); return; }
    const id = setTimeout(() => setStep((s) => s + 1), 1200);
    return () => clearTimeout(id);
  }, [step, running, steps.length]);

  const servers: Record<string, { x: number; y: number; label: string; color: string }> = {
    client: { x: 80, y: 300, label: "Client", color: "#6366f1" },
    resolver: { x: 250, y: 300, label: "Local Resolver", color: "var(--eng-primary)" },
    root: { x: 420, y: 80, label: "Root Server", color: "#ef4444" },
    tld: { x: 580, y: 80, label: ".com TLD", color: "#f59e0b" },
    auth: { x: 700, y: 300, label: "Auth NS", color: "#10b981" },
  };

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DNS Resolution Process
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Watch how a DNS query traverses the hierarchy to resolve a domain name into an IP address.
      </p>

      {/* Mode toggle */}
      <div className="flex gap-2" style={{ marginBottom: 16 }}>
        <button
          onClick={() => { setMode("recursive"); setStep(0); setRunning(false); }}
          className={mode === "recursive" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          Recursive Query
        </button>
        <button
          onClick={() => { setMode("iterative"); setStep(0); setRunning(false); }}
          className={mode === "iterative" ? "btn-eng" : "btn-eng-outline"}
          style={{ fontSize: "0.85rem" }}
        >
          Iterative Query
        </button>
        <button onClick={playAnim} className="btn-eng-outline" style={{ fontSize: "0.85rem", marginLeft: "auto" }}>
          <RefreshCw className="w-4 h-4" style={{ marginRight: 4 }} /> Play
        </button>
      </div>

      <svg viewBox="0 0 800 400" style={{ width: "100%", maxWidth: 800, display: "block", margin: "0 auto 16px", background: "var(--eng-surface)", borderRadius: 12, border: "1px solid var(--eng-border)" }}>
        {/* Server nodes */}
        {Object.entries(servers).map(([key, s]) => (
          <g key={key}>
            <rect x={s.x - 45} y={s.y - 28} width={90} height={56} rx={10} fill="var(--eng-surface)" stroke={s.color} strokeWidth={2} />
            <Server x={s.x - 8} y={s.y - 14} width={16} height={16} style={{ color: s.color }} />
            <text x={s.x} y={s.y + 10} textAnchor="middle" fontSize={10} fontWeight={600} fontFamily="var(--eng-font)" fill="var(--eng-text)">
              {s.label}
            </text>
          </g>
        ))}

        {/* Animated arrows for completed steps */}
        {steps.slice(0, step).map((st, i) => {
          const fromS = servers[st.from];
          const toS = servers[st.to];
          const isReply = st.label.startsWith("Answer") || st.label.startsWith("Referral");
          const offset = isReply ? 12 : -12;
          return (
            <g key={i}>
              <defs>
                <marker id={`arrow-dns-${i}`} markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                  <path d="M0,0 L8,3 L0,6 Z" fill={isReply ? "#10b981" : "var(--eng-primary)"} />
                </marker>
              </defs>
              <line
                x1={fromS.x} y1={fromS.y + offset}
                x2={toS.x} y2={toS.y + offset}
                stroke={isReply ? "#10b981" : "var(--eng-primary)"}
                strokeWidth={2}
                markerEnd={`url(#arrow-dns-${i})`}
                opacity={0}
              >
                <animate attributeName="opacity" from="0" to="1" dur="0.4s" fill="freeze" />
              </line>
              <text
                x={(fromS.x + toS.x) / 2}
                y={(fromS.y + toS.y) / 2 + offset - 8}
                textAnchor="middle" fontSize={8} fontFamily="var(--eng-font)" fontWeight={500}
                fill={isReply ? "#10b981" : "var(--eng-primary)"}
              >
                {st.label}
              </text>
            </g>
          );
        })}

        {/* DNS message section preview */}
        {step > 0 && step <= steps.length && (
          <g>
            <rect x={20} y={360} width={760} height={30} rx={6} fill="var(--eng-primary-light)" stroke="var(--eng-primary)" strokeWidth={1} />
            <text x={30} y={380} fontSize={10} fontFamily="monospace" fill="var(--eng-primary)" fontWeight={600}>
              {step <= steps.length ? `Step ${step}: ${steps[step - 1].label}` : "Resolution complete!"}
            </text>
          </g>
        )}
      </svg>

      {/* Step description */}
      {step > 0 && step <= steps.length && (
        <div className="info-eng eng-fadeIn" key={step}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", margin: 0 }}>
            <strong>Step {step}:</strong> {steps[step - 1].desc}
          </p>
        </div>
      )}

      <div className="card-eng p-4" style={{ marginTop: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          {mode === "recursive" ? "Recursive" : "Iterative"} Resolution
        </h4>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.6 }}>
          {mode === "recursive"
            ? "In recursive resolution, the local resolver does all the heavy lifting. The client sends one query and gets back the final answer. The resolver contacts root, TLD, and authoritative servers on behalf of the client."
            : "In iterative resolution, each server tells the resolver where to look next (a referral). The resolver does the work of following each referral. This is the default behavior between DNS servers (server-to-server)."
          }
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 — DNS Records & Cache                                        */
/* ================================================================== */

interface DNSRecord {
  type: string;
  fullName: string;
  desc: string;
  example: { name: string; value: string; ttl: number };
  color: string;
}

const DNS_RECORDS: DNSRecord[] = [
  { type: "A", fullName: "Address (IPv4)", desc: "Maps a domain name to an IPv4 address.", example: { name: "example.com", value: "93.184.216.34", ttl: 3600 }, color: "#3b82f6" },
  { type: "AAAA", fullName: "Address (IPv6)", desc: "Maps a domain name to an IPv6 address.", example: { name: "example.com", value: "2606:2800:220:1:248:1893:25c8:1946", ttl: 3600 }, color: "#6366f1" },
  { type: "CNAME", fullName: "Canonical Name", desc: "Creates an alias from one domain to another. Cannot coexist with other record types for the same name.", example: { name: "www.example.com", value: "example.com", ttl: 86400 }, color: "#10b981" },
  { type: "MX", fullName: "Mail Exchange", desc: "Specifies the mail server for a domain, with a priority value. Lower priority number = higher preference.", example: { name: "example.com", value: "10 mail.example.com", ttl: 3600 }, color: "#f59e0b" },
  { type: "NS", fullName: "Name Server", desc: "Delegates a DNS zone to an authoritative nameserver.", example: { name: "example.com", value: "ns1.example.com", ttl: 86400 }, color: "#ef4444" },
  { type: "TXT", fullName: "Text Record", desc: "Stores arbitrary text. Used for SPF, DKIM, domain verification, etc.", example: { name: "example.com", value: "\"v=spf1 include:_spf.google.com ~all\"", ttl: 3600 }, color: "#8b5cf6" },
];

function DNSRecordsTab() {
  const [selectedRecord, setSelectedRecord] = useState<string>("A");
  const [cacheEntries, setCacheEntries] = useState<{ type: string; name: string; value: string; ttl: number; remaining: number }[]>([]);

  // Cache TTL countdown
  useEffect(() => {
    const id = setInterval(() => {
      setCacheEntries((prev) =>
        prev.map((e) => ({ ...e, remaining: Math.max(0, e.remaining - 1) })).filter((e) => e.remaining > 0)
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const addToCache = useCallback((rec: DNSRecord) => {
    setCacheEntries((prev) => {
      const exists = prev.find((e) => e.type === rec.type && e.name === rec.example.name);
      if (exists) return prev;
      return [...prev, { type: rec.type, name: rec.example.name, value: rec.example.value, ttl: rec.example.ttl, remaining: 30 }];
    });
  }, []);

  const active = DNS_RECORDS.find((r) => r.type === selectedRecord)!;

  return (
    <div>
      <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        DNS Record Types
      </h2>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text-muted)", margin: "0 0 20px", lineHeight: 1.6 }}>
        Click a record type to see its details. Add records to the cache and watch their TTL countdown.
      </p>

      {/* Record type cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 20 }}>
        {DNS_RECORDS.map((rec) => (
          <button
            key={rec.type}
            onClick={() => setSelectedRecord(rec.type)}
            className="card-eng eng-fadeIn"
            style={{
              padding: "14px 12px",
              textAlign: "center",
              border: selectedRecord === rec.type ? `2px solid ${rec.color}` : "1px solid var(--eng-border)",
              cursor: "pointer",
              background: selectedRecord === rec.type ? `${rec.color}10` : "var(--eng-surface)",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: "1.2rem", color: rec.color, marginBottom: 4 }}>
              {rec.type}
            </div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)" }}>
              {rec.fullName}
            </div>
          </button>
        ))}
      </div>

      {/* Selected record details */}
      <div className="card-eng p-5 eng-fadeIn" key={selectedRecord} style={{ marginBottom: 20 }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
          <div>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: active.color, margin: "0 0 4px" }}>
              {active.type} Record — {active.fullName}
            </h4>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0, lineHeight: 1.5 }}>
              {active.desc}
            </p>
          </div>
          <button onClick={() => addToCache(active)} className="btn-eng" style={{ fontSize: "0.8rem", whiteSpace: "nowrap" }}>
            + Cache
          </button>
        </div>

        <div style={{ background: "#1e293b", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: "0.82rem", color: "#e2e8f0" }}>
          <div style={{ color: "#94a3b8", marginBottom: 4 }}>; DNS Record Example</div>
          <div>
            <span style={{ color: "#38bdf8" }}>{active.example.name}</span>
            {" "}
            <span style={{ color: "#94a3b8" }}>{active.example.ttl}</span>
            {" IN "}
            <span style={{ color: "#fbbf24" }}>{active.type}</span>
            {" "}
            <span style={{ color: "#4ade80" }}>{active.example.value}</span>
          </div>
        </div>
      </div>

      {/* Cache panel */}
      <div className="card-eng p-4">
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Clock className="w-4 h-4" style={{ color: "var(--eng-primary)" }} />
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: 0 }}>
            DNS Cache (TTL Countdown)
          </h4>
        </div>
        {cacheEntries.length === 0 ? (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.82rem", color: "var(--eng-text-muted)", textAlign: "center", margin: "12px 0" }}>
            Click &quot;+ Cache&quot; on a record to add it here and watch the TTL timer count down.
          </p>
        ) : (
          <div className="space-y-2">
            {cacheEntries.map((entry, i) => {
              const pct = (entry.remaining / 30) * 100;
              const recColor = DNS_RECORDS.find((r) => r.type === entry.type)?.color || "var(--eng-primary)";
              return (
                <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "var(--eng-bg)", border: "1px solid var(--eng-border)" }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
                    <div style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>
                      <span style={{ color: recColor, fontWeight: 700 }}>{entry.type}</span>
                      {" "}
                      <span style={{ color: "var(--eng-text)" }}>{entry.name}</span>
                      {" -> "}
                      <span style={{ color: "var(--eng-text-muted)" }}>{entry.value}</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: pct < 30 ? "var(--eng-danger)" : "var(--eng-text-muted)" }}>
                      {entry.remaining}s
                    </span>
                  </div>
                  <div style={{ height: 4, background: "var(--eng-border)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: pct < 30 ? "var(--eng-danger)" : recColor, borderRadius: 2, transition: "width 1s linear" }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                                */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "In the DNS hierarchy, what sits at the very top of the tree?",
    options: ["TLD servers", "Root DNS servers", "Authoritative nameservers", "Local resolver"],
    correctIndex: 1,
    explanation: "The 13 root server clusters sit at the top of the DNS hierarchy. They know the addresses of all TLD servers.",
  },
  {
    question: "In recursive DNS resolution, who does most of the work?",
    options: ["The client application", "The local DNS resolver", "The root server", "The authoritative server"],
    correctIndex: 1,
    explanation: "In recursive resolution, the local resolver contacts root, TLD, and authoritative servers on behalf of the client, doing all the heavy lifting.",
  },
  {
    question: "Which DNS record type maps a domain name to an IPv4 address?",
    options: ["AAAA", "CNAME", "A", "MX"],
    correctIndex: 2,
    explanation: "The A (Address) record maps a domain name to an IPv4 address. AAAA is for IPv6.",
  },
  {
    question: "What does TTL (Time To Live) control in DNS?",
    options: ["Maximum number of hops a packet can take", "How long a DNS record is cached before re-querying", "The timeout for a DNS connection", "The priority of a mail server"],
    correctIndex: 1,
    explanation: "TTL specifies how many seconds a DNS resolver should cache a record before querying the authoritative server again.",
  },
  {
    question: "Which DNS record type is used to specify mail servers for a domain?",
    options: ["A", "NS", "MX", "TXT"],
    correctIndex: 2,
    explanation: "MX (Mail Exchange) records specify the mail servers for a domain, along with priority values.",
  },
];

/* ================================================================== */
/*  Main Export                                                         */
/* ================================================================== */

export default function CN_L5_DNSActivity() {
  const tabs: EngTabDef[] = [
    {
      id: "hierarchy",
      label: "Hierarchy",
      icon: <Layers className="w-4 h-4" />,
      content: <DNSHierarchyTab />,
    },
    {
      id: "resolution",
      label: "Resolution",
      icon: <Search className="w-4 h-4" />,
      content: <DNSResolutionTab />,
    },
    {
      id: "records",
      label: "Records",
      icon: <Database className="w-4 h-4" />,
      content: <DNSRecordsTab />,
    },
  ];

  return (
    <EngineeringLessonShell
      title="DNS — Domain Name System"
      level={5}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="HTTP — HyperText Transfer Protocol"
      gateRelevance="2-3 marks"
      placementRelevance="High"
    />
  );
}
