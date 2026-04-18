"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search,
  Database,
  Clock,
  Server,
  Layers,
  Info,
} from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type {
  EngTabDef,
  EngQuizQuestion,
} from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  useStepPlayer,
} from "@/components/engineering/algo";

/* ================================================================== */
/*  Tab 1 - DNS Hierarchy Tree                                         */
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
        <TreeNode x={400} y={40} label="." sublabel="Root" selected={selectedNode === "root"} onClick={() => setSelectedNode("root")} pulse={animPhase === 0} />

        <TreeLine x1={400} y1={60} x2={150} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={300} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={500} y2={130} phase={animPhase} threshold={1} />
        <TreeLine x1={400} y1={60} x2={650} y2={130} phase={animPhase} threshold={1} />

        <TreeNode x={150} y={140} label=".com" sublabel="TLD" selected={selectedNode === ".com"} onClick={() => setSelectedNode(".com")} pulse={animPhase === 1} />
        <TreeNode x={300} y={140} label=".org" sublabel="TLD" selected={selectedNode === ".org"} onClick={() => setSelectedNode(".org")} pulse={animPhase === 1} />
        <TreeNode x={500} y={140} label=".edu" sublabel="TLD" selected={selectedNode === ".edu"} onClick={() => setSelectedNode(".edu")} pulse={animPhase === 1} />
        <TreeNode x={650} y={140} label=".in" sublabel="ccTLD" selected={selectedNode === ".in"} onClick={() => setSelectedNode(".in")} pulse={animPhase === 1} />

        <TreeLine x1={150} y1={160} x2={100} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={150} y1={160} x2={210} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={300} y1={160} x2={300} y2={240} phase={animPhase} threshold={2} />
        <TreeLine x1={500} y1={160} x2={500} y2={240} phase={animPhase} threshold={2} />

        <TreeNode x={100} y={250} label="google.com" sublabel="Auth NS" selected={selectedNode === "google.com"} onClick={() => setSelectedNode("google.com")} pulse={animPhase === 2} small />
        <TreeNode x={210} y={250} label="github.com" sublabel="Auth NS" selected={selectedNode === "github.com"} onClick={() => setSelectedNode("github.com")} pulse={animPhase === 2} small />
        <TreeNode x={300} y={250} label="wikipedia.org" sublabel="Auth NS" selected={selectedNode === "wikipedia.org"} onClick={() => setSelectedNode("wikipedia.org")} pulse={animPhase === 2} small />
        <TreeNode x={500} y={250} label="mit.edu" sublabel="Auth NS" selected={selectedNode === "mit.edu"} onClick={() => setSelectedNode("mit.edu")} pulse={animPhase === 2} small />

        <text x={770} y={45} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">Root Level</text>
        <text x={770} y={145} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">TLD Level</text>
        <text x={770} y={255} fill="var(--eng-text-muted)" fontSize={11} fontFamily="var(--eng-font)" fontWeight={600} textAnchor="end">Authoritative</text>

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
/*  Tab 2 - DNS Resolution (AlgoCanvas)                                */
/* ================================================================== */

// Simulated DNS "universe" - domain -> IP (for didactic purposes)
const DNS_DB: Record<string, { ip: string; authNs: string }> = {
  "google.com":    { ip: "142.250.195.46",  authNs: "ns1.google.com" },
  "www.google.com":{ ip: "142.250.195.46",  authNs: "ns1.google.com" },
  "youtube.com":   { ip: "142.250.80.46",   authNs: "ns1.google.com" },
  "github.com":    { ip: "140.82.121.4",    authNs: "ns1.github.com" },
  "example.com":   { ip: "93.184.216.34",   authNs: "ns1.example.com" },
  "wikipedia.org": { ip: "208.80.154.224",  authNs: "ns1.wikimedia.org" },
  "mit.edu":       { ip: "23.6.229.197",    authNs: "ns1.mit.edu" },
  "stackoverflow.com": { ip: "151.101.193.69", authNs: "ns1.fastly.net" },
};

function parseDomain(d: string): { domain: string; tld: string; sld: string; apex: string } | null {
  const clean = d.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  const parts = clean.split(".");
  if (parts.length < 2) return null;
  const tld = parts[parts.length - 1];
  const sld = parts[parts.length - 2];
  const apex = `${sld}.${tld}`;
  return { domain: clean, tld: `.${tld}`, sld, apex };
}

type DNSNode = "client" | "resolver" | "root" | "tld" | "auth";

interface DNSMessage {
  from: DNSNode;
  to: DNSNode;
  label: string;
  type: "query" | "referral" | "answer";
}

interface DNSFrame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  message: string;
  drawn: DNSMessage[];       // arrows drawn so far
  activeIdx: number | null;  // newest arrow (animated)
  cacheHit: boolean;
  finalIP: string | null;
  flashKeys?: string[];
}

const DNS_PSEUDO = [
  "function resolve(domain):",
  "  if cache.has(domain): return cache[domain]     // fast path",
  "  ask ROOT for TLD of domain",
  "  ROOT -> referral to TLD server",
  "  ask TLD for authoritative NS",
  "  TLD -> referral to auth NS",
  "  ask auth NS for A record",
  "  auth NS -> A record (IP)",
  "  cache[domain] = ip; return ip",
];

function buildDNSFrames(rawDomain: string, cacheHit: boolean): DNSFrame[] {
  const frames: DNSFrame[] = [];
  const parsed = parseDomain(rawDomain);
  if (!parsed) {
    frames.push({
      line: 0,
      vars: { error: "Invalid domain" },
      message: `"${rawDomain}" is not a valid domain name. Try something like example.com.`,
      drawn: [],
      activeIdx: null,
      cacheHit: false,
      finalIP: null,
    });
    return frames;
  }
  const { domain, tld, apex } = parsed;
  const rec = DNS_DB[domain] ?? DNS_DB[apex];
  const ip = rec?.ip ?? "(no record found)";
  const authNs = rec?.authNs ?? `ns1${apex}`;

  // Initial
  frames.push({
    line: 0,
    vars: { query: domain },
    message: `Your browser wants to visit ${domain}. First step: ask the local resolver (usually your ISP's or 8.8.8.8) for the IP.`,
    drawn: [],
    activeIdx: null,
    cacheHit,
    finalIP: null,
    flashKeys: ["query"],
  });

  const drawn: DNSMessage[] = [];

  // Client -> Resolver query
  drawn.push({ from: "client", to: "resolver", label: `Q: ${domain}?`, type: "query" });
  frames.push({
    line: 0,
    vars: { from: "client", to: "resolver", Q: domain },
    message: `Client sends the query to the local DNS resolver.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit,
    finalIP: null,
  });

  if (cacheHit) {
    // Fast path: resolver has the answer cached
    drawn.push({ from: "resolver", to: "client", label: `A: ${ip} (cached)`, type: "answer" });
    frames.push({
      line: 1,
      vars: { cache: "HIT", answer: ip, TTL: "valid" },
      message: `Resolver's cache has ${domain} -> ${ip}. Return the answer immediately. No recursion needed. This is the ~90% case in practice.`,
      drawn: drawn.slice(),
      activeIdx: drawn.length - 1,
      cacheHit: true,
      finalIP: ip,
      flashKeys: ["cache", "answer"],
    });
    return frames;
  }

  frames.push({
    line: 1,
    vars: { cache: "MISS" },
    message: `Resolver has no cached answer for ${domain}. It begins iterative resolution down the DNS hierarchy.`,
    drawn: drawn.slice(),
    activeIdx: null,
    cacheHit: false,
    finalIP: null,
    flashKeys: ["cache"],
  });

  // Resolver -> Root
  drawn.push({ from: "resolver", to: "root", label: `Q: ${domain}?`, type: "query" });
  frames.push({
    line: 2,
    vars: { step: "ask root", target: "one of 13 root servers" },
    message: `Resolver asks a Root server (e.g., a.root-servers.net) where ${domain} lives.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: null,
  });

  // Root -> Resolver referral
  drawn.push({ from: "root", to: "resolver", label: `Ref: ${tld} at TLD`, type: "referral" });
  frames.push({
    line: 3,
    vars: { root: "replies", referral: `${tld} TLD server` },
    message: `Root doesn't know ${domain}, but it knows the ${tld} TLD servers. It returns a REFERRAL: "ask the ${tld} TLD".`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: null,
    flashKeys: ["referral"],
  });

  // Resolver -> TLD
  drawn.push({ from: "resolver", to: "tld", label: `Q: ${domain}?`, type: "query" });
  frames.push({
    line: 4,
    vars: { step: "ask TLD", tld },
    message: `Resolver follows the referral and asks the ${tld} TLD server.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: null,
  });

  // TLD -> Resolver referral
  drawn.push({ from: "tld", to: "resolver", label: `Ref: ${authNs}`, type: "referral" });
  frames.push({
    line: 5,
    vars: { tld: "replies", authNS: authNs },
    message: `${tld} TLD doesn't hold the answer either. It refers the resolver to ${apex}'s authoritative nameserver: ${authNs}.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: null,
    flashKeys: ["authNS"],
  });

  // Resolver -> Auth
  drawn.push({ from: "resolver", to: "auth", label: `Q: ${domain}?`, type: "query" });
  frames.push({
    line: 6,
    vars: { step: "ask auth NS", server: authNs },
    message: `Resolver asks ${authNs} (the authoritative server for ${apex}) for the A record of ${domain}.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: null,
  });

  // Auth -> Resolver answer
  drawn.push({ from: "auth", to: "resolver", label: `A: ${ip}`, type: "answer" });
  frames.push({
    line: 7,
    vars: { answer: ip, TTL: "3600s" },
    message: `Authoritative server returns the A record: ${ip}. It also includes a TTL (usually 1 hour) for caching.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: ip,
    flashKeys: ["answer"],
  });

  // Resolver -> Client
  drawn.push({ from: "resolver", to: "client", label: `A: ${ip}`, type: "answer" });
  frames.push({
    line: 8,
    vars: { cache: "stored", returned: ip },
    message: `Resolver caches the mapping (so the next query hits fast) and returns ${ip} to the client. Browser can now open a TCP connection.`,
    drawn: drawn.slice(),
    activeIdx: drawn.length - 1,
    cacheHit: false,
    finalIP: ip,
    flashKeys: ["cache", "returned"],
  });

  return frames;
}

function DNSResolutionDiagram({ frame }: { frame: DNSFrame }) {
  const nodes: Record<DNSNode, { x: number; y: number; label: string; color: string }> = {
    client:   { x: 80,  y: 300, label: "Client",       color: "#6366f1" },
    resolver: { x: 260, y: 300, label: "Resolver",     color: "var(--eng-primary)" },
    root:     { x: 420, y: 80,  label: "Root",         color: "#ef4444" },
    tld:      { x: 580, y: 80,  label: "TLD",          color: "#f59e0b" },
    auth:     { x: 700, y: 300, label: "Auth NS",      color: "#10b981" },
  };

  const colorFor = (type: DNSMessage["type"]) =>
    type === "answer" ? "#10b981" : type === "referral" ? "#8b5cf6" : "var(--eng-primary)";

  return (
    <div
      style={{
        padding: 14,
        borderRadius: "var(--eng-radius)",
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
      }}
    >
      <svg viewBox="0 0 800 380" style={{ width: "100%", maxWidth: 800, display: "block", margin: "0 auto" }}>
        {/* Nodes */}
        {(Object.keys(nodes) as DNSNode[]).map((k) => {
          const s = nodes[k];
          const highlighted =
            frame.activeIdx !== null &&
            (frame.drawn[frame.activeIdx]?.from === k || frame.drawn[frame.activeIdx]?.to === k);
          return (
            <g key={k}>
              <rect
                x={s.x - 50}
                y={s.y - 30}
                width={100}
                height={60}
                rx={10}
                fill={highlighted ? s.color : "var(--eng-surface)"}
                stroke={s.color}
                strokeWidth={highlighted ? 2.5 : 1.8}
                opacity={highlighted ? 0.9 : 1}
                style={{ transition: "all 0.3s" }}
              />
              <Server
                x={s.x - 10}
                y={s.y - 16}
                width={20}
                height={20}
                style={{ color: highlighted ? "#fff" : s.color }}
              />
              <text
                x={s.x}
                y={s.y + 16}
                textAnchor="middle"
                fontSize={11}
                fontWeight={700}
                fontFamily="var(--eng-font)"
                fill={highlighted ? "#fff" : "var(--eng-text)"}
              >
                {s.label}
              </text>
            </g>
          );
        })}

        {/* Cache indicator */}
        <g>
          <rect
            x={210}
            y={250}
            width={100}
            height={18}
            rx={9}
            fill={frame.cacheHit ? "#10b981" : "var(--eng-warning)"}
            opacity={0.2}
            stroke={frame.cacheHit ? "#10b981" : "var(--eng-warning)"}
            strokeWidth={1}
          />
          <text
            x={260}
            y={263}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fontFamily="var(--eng-font)"
            fill={frame.cacheHit ? "#10b981" : "var(--eng-warning)"}
          >
            {frame.cacheHit ? "Cache HIT" : "Cache MISS"}
          </text>
        </g>

        {/* Arrows */}
        {frame.drawn.map((m, i) => {
          const fromN = nodes[m.from];
          const toN = nodes[m.to];
          const isActive = frame.activeIdx === i;
          const col = colorFor(m.type);
          // Curve control: arrows going up (y decreasing)
          const midX = (fromN.x + toN.x) / 2;
          const midY = (fromN.y + toN.y) / 2 - 15;

          return (
            <g key={i}>
              <defs>
                <marker
                  id={`dns-arr-${i}`}
                  markerWidth="10"
                  markerHeight="7"
                  refX="9"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon points="0 0, 10 3.5, 0 7" fill={col} />
                </marker>
              </defs>
              <path
                d={`M ${fromN.x},${fromN.y} Q ${midX},${midY} ${toN.x},${toN.y}`}
                stroke={col}
                strokeWidth={isActive ? 3 : 1.5}
                fill="none"
                opacity={isActive ? 1 : 0.5}
                markerEnd={`url(#dns-arr-${i})`}
                style={{ transition: "all 0.3s" }}
              />
              <text
                x={midX}
                y={midY - 2}
                textAnchor="middle"
                fontSize={9}
                fontWeight={600}
                fontFamily="var(--eng-font)"
                fill={col}
                opacity={isActive ? 1 : 0.7}
              >
                {m.label}
              </text>
            </g>
          );
        })}

        {/* Result banner */}
        {frame.finalIP && (
          <g>
            <rect
              x={250}
              y={340}
              width={300}
              height={30}
              rx={6}
              fill="#10b981"
              opacity={0.15}
              stroke="#10b981"
              strokeWidth={1.5}
            />
            <text
              x={400}
              y={360}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fontFamily="monospace"
              fill="#10b981"
            >
              Resolved: {frame.finalIP}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}

function DNSResolutionTab() {
  const [rawDomain, setRawDomain] = useState("example.com");
  const [cacheMode, setCacheMode] = useState<"miss" | "hit">("miss");
  const frames = useMemo(() => buildDNSFrames(rawDomain, cacheMode === "hit"), [rawDomain, cacheMode]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>
          Watch a DNS query traverse the hierarchy. Toggle cache HIT to see the fast path. Try different domains - only some are in the simulated database, others still go through the full chain.
        </span>
      </div>

      <div className="flex gap-2 flex-wrap" style={{ alignItems: "center" }}>
        <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text-muted)" }}>
          Cache state:
        </span>
        <button
          className={cacheMode === "miss" ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setCacheMode("miss")}
          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
        >
          MISS (full resolution)
        </button>
        <button
          className={cacheMode === "hit" ? "btn-eng" : "btn-eng-outline"}
          onClick={() => setCacheMode("hit")}
          style={{ fontSize: "0.75rem", padding: "4px 10px" }}
        >
          HIT (cached)
        </button>
      </div>

      <AlgoCanvas
        title={`Resolve ${rawDomain}${cacheMode === "hit" ? " (cache hit)" : ""}`}
        player={player}
        input={
          <InputEditor
            label="Domain"
            value={rawDomain}
            onApply={setRawDomain}
            presets={[
              { label: "example.com", value: "example.com" },
              { label: "google.com", value: "google.com" },
              { label: "wikipedia.org", value: "wikipedia.org" },
              { label: "mit.edu", value: "mit.edu" },
              { label: "github.com", value: "github.com" },
            ]}
            placeholder="e.g. example.com"
            helper="Enter any domain. Simulated DB has example.com, google.com, etc."
          />
        }
        pseudocode={<PseudocodePanel lines={DNS_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKeys} />}
        status={frame.message}
        legend={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <LegendSwatch color="var(--eng-primary)" label="Query" />
            <LegendSwatch color="#8b5cf6" label="Referral" />
            <LegendSwatch color="#10b981" label="Answer" />
          </div>
        }
      >
        <DNSResolutionDiagram frame={frame} />
      </AlgoCanvas>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--eng-font)", fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}

/* ================================================================== */
/*  Tab 3 - DNS Records & Cache                                        */
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

      <div className="card-eng p-5 eng-fadeIn" key={selectedRecord} style={{ marginBottom: 20 }}>
        <div className="flex items-start justify-between" style={{ marginBottom: 12 }}>
          <div>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: active.color, margin: "0 0 4px" }}>
              {active.type} Record - {active.fullName}
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
      title="DNS - Domain Name System"
      level={5}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="HTTP - HyperText Transfer Protocol"
      placementRelevance="High"
    />
  );
}
