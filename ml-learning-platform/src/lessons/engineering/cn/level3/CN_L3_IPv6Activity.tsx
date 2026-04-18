"use client";

import { useState, useCallback, useMemo } from "react";
import { Globe, ArrowLeftRight, Layers, Info, ArrowRight } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Helper Utilities                                                   */
/* ================================================================== */

function compressIPv6(input: string): string {
  // Normalize: expand shorthand groups, remove leading zeros per group
  const raw = input.trim().toLowerCase();
  let groups = raw.split(":");

  // Expand :: if present
  const dblIdx = raw.indexOf("::");
  if (dblIdx >= 0) {
    const left = raw.substring(0, dblIdx).split(":").filter(Boolean);
    const right = raw.substring(dblIdx + 2).split(":").filter(Boolean);
    const missing = 8 - left.length - right.length;
    groups = [...left, ...Array(missing).fill("0000"), ...right];
  }

  // Pad each group to 4 chars
  groups = groups.map((g) => g.padStart(4, "0"));

  // Remove leading zeros
  const stripped = groups.map((g) => g.replace(/^0+/, "") || "0");

  // Find longest run of consecutive "0" groups
  let bestStart = -1, bestLen = 0, curStart = -1, curLen = 0;
  for (let i = 0; i < stripped.length; i++) {
    if (stripped[i] === "0") {
      if (curStart === -1) curStart = i;
      curLen++;
      if (curLen > bestLen) { bestStart = curStart; bestLen = curLen; }
    } else {
      curStart = -1; curLen = 0;
    }
  }

  if (bestLen >= 2) {
    const left = stripped.slice(0, bestStart).join(":");
    const right = stripped.slice(bestStart + bestLen).join(":");
    return `${left}::${right}`;
  }

  return stripped.join(":");
}

function expandIPv6(input: string): string {
  const raw = input.trim().toLowerCase();
  let groups: string[];

  const dblIdx = raw.indexOf("::");
  if (dblIdx >= 0) {
    const left = raw.substring(0, dblIdx).split(":").filter(Boolean);
    const right = raw.substring(dblIdx + 2).split(":").filter(Boolean);
    const missing = 8 - left.length - right.length;
    groups = [...left, ...Array(missing).fill("0000"), ...right];
  } else {
    groups = raw.split(":");
  }

  return groups.map((g) => g.padStart(4, "0")).join(":");
}

/* ================================================================== */
/*  Tab 1 - IPv6 Format & Zero Compression                            */
/* ================================================================== */

function FormatTab() {
  const [inputAddr, setInputAddr] = useState("2001:0db8:0000:0000:0000:0000:0000:0001");
  const [showSteps, setShowSteps] = useState(false);

  const expanded = useMemo(() => expandIPv6(inputAddr), [inputAddr]);
  const compressed = useMemo(() => compressIPv6(inputAddr), [inputAddr]);

  const groups = expanded.split(":");

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Type an IPv6 address and see how zero compression (::) and leading zero removal work. The address is 128 bits = 8 groups of 16 bits in colon-hexadecimal notation.</span>
      </div>

      {/* Input */}
      <div className="card-eng" style={{ padding: 20 }}>
        <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 6 }}>
          Enter IPv6 Address (full or shorthand)
        </label>
        <input
          type="text"
          value={inputAddr}
          onChange={(e) => setInputAddr(e.target.value)}
          placeholder="2001:0db8:0000:0000:0000:0000:0000:0001"
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            border: "1.5px solid var(--eng-border)", background: "var(--eng-surface)",
            fontFamily: "monospace", fontSize: "1rem", color: "var(--eng-text)", outline: "none",
          }}
        />
      </div>

      {/* 128-bit visualization */}
      <div className="card-eng" style={{ padding: 20, overflow: "auto" }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 16 }}>
          8 Groups of 16 Bits (128 bits total)
        </p>
        <svg viewBox="0 0 680 80" style={{ width: "100%", minWidth: 500 }}>
          {groups.map((group, i) => {
            const isZero = group === "0000";
            const x = 10 + i * 82;
            const color = isZero ? "#94a3b8" : ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"][i];
            return (
              <g key={i}>
                <rect x={x} y={15} width={76} height={36} rx={6}
                  fill={isZero ? "var(--eng-surface)" : `${color}15`}
                  stroke={color} strokeWidth={1.5}
                />
                <text x={x + 38} y={38} textAnchor="middle" fontSize={13} fontWeight={600}
                  fill={color} fontFamily="monospace">
                  {group}
                </text>
                <text x={x + 38} y={64} textAnchor="middle" fontSize={8}
                  fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
                  Group {i + 1}
                </text>
                {/* Colon separator */}
                {i < 7 && (
                  <text x={x + 79} y={38} textAnchor="middle" fontSize={16} fontWeight={700}
                    fill="var(--eng-text-muted)">:</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Compression results */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Notation Forms
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ padding: 12, borderRadius: 8, border: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>Full (expanded):</span>
            <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 600, color: "#3b82f6", marginTop: 4 }}>
              {expanded}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ArrowRight className="w-5 h-5" style={{ color: "var(--eng-text-muted)" }} />
          </div>
          <div style={{ padding: 12, borderRadius: 8, border: "2px solid var(--eng-success)", background: "rgba(16,185,129,0.05)" }}>
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>Compressed (shorthand):</span>
            <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: "var(--eng-success)", marginTop: 4 }}>
              {compressed}
            </div>
          </div>
        </div>

        <button className="btn-eng-outline" onClick={() => setShowSteps(!showSteps)} style={{ marginTop: 16, fontSize: "0.85rem" }}>
          {showSteps ? "Hide Steps" : "Show Compression Steps"}
        </button>

        {showSteps && (
          <div className="eng-fadeIn" style={{ marginTop: 12, padding: 12, borderRadius: 8, border: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", margin: "0 0 8px" }}>Compression Rules:</p>
            <ol style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", paddingLeft: 20, margin: 0 }}>
              <li style={{ marginBottom: 4 }}>Remove leading zeros from each group: 0db8 becomes db8, 0000 becomes 0</li>
              <li style={{ marginBottom: 4 }}>Replace the longest consecutive run of all-zero groups with :: (only once!)</li>
              <li>If multiple runs of equal length, replace the first one</li>
            </ol>
          </div>
        )}
      </div>

      {/* Quick examples */}
      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>Try These Examples:</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            "2001:0db8:0000:0000:0000:0000:0000:0001",
            "fe80:0000:0000:0000:0000:0000:0000:0001",
            "2001:0db8:85a3:0000:0000:8a2e:0370:7334",
            "0000:0000:0000:0000:0000:0000:0000:0001",
          ].map((addr) => (
            <button key={addr}
              className="btn-eng-outline"
              onClick={() => setInputAddr(addr)}
              style={{ fontSize: "0.7rem", fontFamily: "monospace", padding: "4px 8px" }}
            >
              {compressIPv6(addr)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - IPv4 vs IPv6 Comparison                                    */
/* ================================================================== */

function CompareTab() {
  const [showAddressSpace, setShowAddressSpace] = useState(false);

  const comparisons = [
    { feature: "Address Length", ipv4: "32 bits", ipv6: "128 bits", icon: "length" },
    { feature: "Address Space", ipv4: "~4.3 billion", ipv6: "~3.4 x 10^38", icon: "space" },
    { feature: "Notation", ipv4: "Dotted decimal (192.168.1.1)", ipv6: "Colon hex (2001:db8::1)", icon: "format" },
    { feature: "Header Size", ipv4: "20-60 bytes (variable)", ipv6: "40 bytes (fixed)", icon: "header" },
    { feature: "Fragmentation", ipv4: "Routers and sender", ipv6: "Sender only", icon: "frag" },
    { feature: "Checksum", ipv4: "In header", ipv6: "Removed (handled by upper layers)", icon: "check" },
    { feature: "Broadcast", ipv4: "Supported", ipv6: "Replaced by multicast", icon: "broadcast" },
    { feature: "IPSec", ipv4: "Optional", ipv6: "Built-in (mandatory)", icon: "security" },
    { feature: "DHCP", ipv4: "Required for auto-config", ipv6: "SLAAC (stateless auto-config)", icon: "config" },
    { feature: "NAT", ipv4: "Widely used", ipv6: "Not needed (enough addresses)", icon: "nat" },
  ];

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>IPv6 was designed to address the limitations of IPv4. Compare the two protocols side by side.</span>
      </div>

      {/* Address space visualization */}
      <div className="card-eng" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Address Space Comparison
        </h4>
        <svg viewBox="0 0 600 200" style={{ width: "100%", maxHeight: 220 }}>
          {/* IPv4 tiny dot */}
          <text x={150} y={25} textAnchor="middle" fontSize={12} fontWeight={600} fill="#3b82f6" fontFamily="var(--eng-font)">
            IPv4: 2^32
          </text>
          <text x={150} y={42} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            ~4.3 billion addresses
          </text>
          <circle cx={150} cy={100} r={3} fill="#3b82f6" />
          <circle cx={150} cy={100} r={8} fill="none" stroke="#3b82f6" strokeWidth={1} strokeDasharray="2 2" />
          <text x={150} y={130} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            (this tiny dot)
          </text>

          {/* IPv6 massive area */}
          <text x={450} y={25} textAnchor="middle" fontSize={12} fontWeight={600} fill="#10b981" fontFamily="var(--eng-font)">
            IPv6: 2^128
          </text>
          <text x={450} y={42} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            ~340 undecillion addresses
          </text>
          <rect x={320} y={55} width={260} height={120} rx={8} fill="#10b981" opacity={0.15} stroke="#10b981" strokeWidth={2} />
          <text x={450} y={110} textAnchor="middle" fontSize={9} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={500}>
            Enough for every grain of sand
          </text>
          <text x={450} y={125} textAnchor="middle" fontSize={9} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={500}>
            on Earth to have trillions of IPs
          </text>

          {/* Scale indicator */}
          <line x1={165} y1={100} x2={315} y2={100} stroke="var(--eng-border)" strokeWidth={1} strokeDasharray="3 3" />
          <text x={240} y={95} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            ~10^29x larger
          </text>

          {/* Bottom labels */}
          <text x={300} y={195} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            IPv4 exhausted in 2011. IPv6 is the future.
          </text>
        </svg>
      </div>

      {/* Comparison table */}
      <div className="card-eng" style={{ padding: 20, overflowX: "auto" }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Feature Comparison
        </h4>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600 }}>Feature</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#3b82f6", fontWeight: 600 }}>IPv4</th>
              <th style={{ padding: "10px 12px", textAlign: "left", color: "#10b981", fontWeight: 600 }}>IPv6</th>
            </tr>
          </thead>
          <tbody>
            {comparisons.map((row) => (
              <tr key={row.feature} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--eng-text)" }}>{row.feature}</td>
                <td style={{ padding: "10px 12px", color: "var(--eng-text)" }}>{row.ipv4}</td>
                <td style={{ padding: "10px 12px", color: "var(--eng-text)" }}>{row.ipv6}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Header comparison */}
      <div className="card-eng" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "0.95rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Header Simplification
        </h4>
        <svg viewBox="0 0 600 140" style={{ width: "100%", maxHeight: 160 }}>
          {/* IPv4 header - complex */}
          <text x={150} y={15} textAnchor="middle" fontSize={11} fontWeight={600} fill="#3b82f6" fontFamily="var(--eng-font)">IPv4 Header (12+ fields)</text>
          {["Ver", "IHL", "TOS", "Total Len", "ID", "Flags", "Frag Off", "TTL", "Proto", "Checksum", "Src", "Dst"].map((f, i) => {
            const row = Math.floor(i / 4);
            const col = i % 4;
            return (
              <g key={f}>
                <rect x={15 + col * 70} y={22 + row * 28} width={66} height={24} rx={3}
                  fill="#3b82f620" stroke="#3b82f6" strokeWidth={0.8} />
                <text x={15 + col * 70 + 33} y={38 + row * 28} textAnchor="middle" fontSize={7}
                  fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={500}>{f}</text>
              </g>
            );
          })}

          {/* IPv6 header - simpler */}
          <text x={450} y={15} textAnchor="middle" fontSize={11} fontWeight={600} fill="#10b981" fontFamily="var(--eng-font)">IPv6 Header (8 fields, fixed)</text>
          {["Ver", "Traffic", "Flow", "Payload Len", "Next Hdr", "Hop Limit", "Source (128b)", "Dest (128b)"].map((f, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const w = i >= 6 ? 200 : 88;
            const xPos = i >= 6 ? 315 + ((i - 6) * 210) : 315 + col * 92;
            return (
              <g key={f}>
                <rect x={xPos} y={22 + row * 28} width={Math.min(w, 200)} height={24} rx={3}
                  fill="#10b98120" stroke="#10b981" strokeWidth={0.8} />
                <text x={xPos + Math.min(w, 200) / 2} y={38 + row * 28} textAnchor="middle" fontSize={7}
                  fill="#10b981" fontFamily="var(--eng-font)" fontWeight={500}>{f}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - Transition Mechanisms                                      */
/* ================================================================== */

function TransitionTab() {
  const [activeMechanism, setActiveMechanism] = useState<"dual" | "tunnel" | "nat64">("dual");

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>IPv4 and IPv6 must coexist during the transition period. Three main mechanisms enable this: Dual Stack, Tunneling, and NAT64.</span>
      </div>

      {/* Mechanism selector */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { key: "dual" as const, label: "Dual Stack", color: "#3b82f6" },
          { key: "tunnel" as const, label: "Tunneling", color: "#8b5cf6" },
          { key: "nat64" as const, label: "NAT64", color: "#f59e0b" },
        ].map((m) => (
          <button
            key={m.key}
            className={activeMechanism === m.key ? "btn-eng" : "btn-eng-outline"}
            onClick={() => setActiveMechanism(m.key)}
            style={{ fontSize: "0.85rem" }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Dual Stack */}
      {activeMechanism === "dual" && (
        <div className="card-eng eng-fadeIn" style={{ padding: 20 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#3b82f6", margin: "0 0 12px" }}>
            Dual Stack: Run Both Protocols
          </h4>
          <svg viewBox="0 0 600 220" style={{ width: "100%", maxHeight: 240 }}>
            {/* Device */}
            <rect x={220} y={20} width={160} height={70} rx={8} fill="var(--eng-surface)" stroke="#3b82f6" strokeWidth={2} />
            <text x={300} y={48} textAnchor="middle" fontSize={11} fontWeight={600} fill="var(--eng-text)" fontFamily="var(--eng-font)">Dual-Stack Host</text>
            <text x={260} y={70} textAnchor="middle" fontSize={9} fill="#3b82f6" fontFamily="var(--eng-font)">IPv4</text>
            <text x={340} y={70} textAnchor="middle" fontSize={9} fill="#10b981" fontFamily="var(--eng-font)">IPv6</text>
            <rect x={235} y={60} width={50} height={16} rx={3} fill="#3b82f620" stroke="#3b82f6" strokeWidth={0.8} />
            <rect x={315} y={60} width={50} height={16} rx={3} fill="#10b98120" stroke="#10b981" strokeWidth={0.8} />

            {/* IPv4 path */}
            <line x1={260} y1={92} x2={120} y2={150} stroke="#3b82f6" strokeWidth={2} />
            <rect x={50} y={140} width={140} height={50} rx={6} fill="#3b82f615" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={120} y={162} textAnchor="middle" fontSize={10} fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={600}>IPv4 Network</text>
            <text x={120} y={178} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">192.168.1.0/24</text>

            {/* IPv6 path */}
            <line x1={340} y1={92} x2={480} y2={150} stroke="#10b981" strokeWidth={2} />
            <rect x={410} y={140} width={140} height={50} rx={6} fill="#10b98115" stroke="#10b981" strokeWidth={1.5} />
            <text x={480} y={162} textAnchor="middle" fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={600}>IPv6 Network</text>
            <text x={480} y={178} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">2001:db8::/32</text>

            {/* Animated packets */}
            <circle r={5} fill="#3b82f6">
              <animateMotion path="M260,92 L120,150" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r={5} fill="#10b981">
              <animateMotion path="M340,92 L480,150" dur="2s" repeatCount="indefinite" />
            </circle>

            <text x={300} y={215} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
              Host runs both stacks, chooses protocol based on destination
            </text>
          </svg>
        </div>
      )}

      {/* Tunneling */}
      {activeMechanism === "tunnel" && (
        <div className="card-eng eng-fadeIn" style={{ padding: 20 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#8b5cf6", margin: "0 0 12px" }}>
            Tunneling: IPv6 over IPv4
          </h4>
          <svg viewBox="0 0 600 200" style={{ width: "100%", maxHeight: 220 }}>
            {/* IPv6 islands */}
            <rect x={20} y={40} width={120} height={60} rx={8} fill="#10b98115" stroke="#10b981" strokeWidth={1.5} />
            <text x={80} y={65} textAnchor="middle" fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={600}>IPv6 Island A</text>
            <text x={80} y={82} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">2001:db8:a::/48</text>

            <rect x={460} y={40} width={120} height={60} rx={8} fill="#10b98115" stroke="#10b981" strokeWidth={1.5} />
            <text x={520} y={65} textAnchor="middle" fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={600}>IPv6 Island B</text>
            <text x={520} y={82} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">2001:db8:b::/48</text>

            {/* IPv4 tunnel */}
            <rect x={160} y={30} width={280} height={80} rx={8} fill="#3b82f610" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="6 3" />
            <text x={300} y={52} textAnchor="middle" fontSize={10} fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={600}>IPv4 Network (Tunnel)</text>

            {/* Tunnel endpoints */}
            <rect x={175} y={60} width={60} height={30} rx={4} fill="#8b5cf620" stroke="#8b5cf6" strokeWidth={1.5} />
            <text x={205} y={80} textAnchor="middle" fontSize={8} fill="#8b5cf6" fontFamily="var(--eng-font)" fontWeight={600}>TE-A</text>

            <rect x={365} y={60} width={60} height={30} rx={4} fill="#8b5cf620" stroke="#8b5cf6" strokeWidth={1.5} />
            <text x={395} y={80} textAnchor="middle" fontSize={8} fill="#8b5cf6" fontFamily="var(--eng-font)" fontWeight={600}>TE-B</text>

            {/* Tunnel line */}
            <line x1={237} y1={75} x2={363} y2={75} stroke="#8b5cf6" strokeWidth={2} />

            {/* Animated encapsulated packet */}
            <g>
              <rect width={30} height={14} rx={3} fill="#10b981">
                <animateMotion path="M142,63 L370,63" dur="3s" repeatCount="indefinite" />
              </rect>
            </g>

            {/* Encapsulation explanation */}
            <text x={300} y={130} textAnchor="middle" fontSize={9} fill="var(--eng-text)" fontFamily="var(--eng-font)" fontWeight={500}>
              Encapsulation Process:
            </text>
            <g>
              <rect x={150} y={140} width={60} height={22} rx={3} fill="#10b98130" stroke="#10b981" strokeWidth={1} />
              <text x={180} y={155} textAnchor="middle" fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">IPv6 pkt</text>
              <text x={220} y={155} textAnchor="middle" fontSize={10} fill="var(--eng-text-muted)">+</text>
              <rect x={230} y={140} width={60} height={22} rx={3} fill="#3b82f630" stroke="#3b82f6" strokeWidth={1} />
              <text x={260} y={155} textAnchor="middle" fontSize={8} fill="#3b82f6" fontFamily="var(--eng-font)">IPv4 hdr</text>
              <text x={300} y={155} textAnchor="middle" fontSize={10} fill="var(--eng-text-muted)">=</text>
              <rect x={310} y={136} width={130} height={30} rx={4} fill="var(--eng-surface)" stroke="#8b5cf6" strokeWidth={1.5} />
              <rect x={314} y={140} width={40} height={22} rx={2} fill="#3b82f630" />
              <rect x={358} y={140} width={78} height={22} rx={2} fill="#10b98130" />
              <text x={334} y={155} textAnchor="middle" fontSize={7} fill="#3b82f6" fontFamily="var(--eng-font)">v4</text>
              <text x={397} y={155} textAnchor="middle" fontSize={7} fill="#10b981" fontFamily="var(--eng-font)">v6 payload</text>
            </g>

            <text x={300} y={190} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
              IPv6 packet is encapsulated inside IPv4 to traverse the IPv4 network
            </text>
          </svg>
        </div>
      )}

      {/* NAT64 */}
      {activeMechanism === "nat64" && (
        <div className="card-eng eng-fadeIn" style={{ padding: 20 }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "#f59e0b", margin: "0 0 12px" }}>
            NAT64: Translation Between Protocols
          </h4>
          <svg viewBox="0 0 600 200" style={{ width: "100%", maxHeight: 220 }}>
            {/* IPv6 side */}
            <rect x={20} y={50} width={140} height={60} rx={8} fill="#10b98115" stroke="#10b981" strokeWidth={1.5} />
            <text x={90} y={75} textAnchor="middle" fontSize={10} fill="#10b981" fontFamily="var(--eng-font)" fontWeight={600}>IPv6-Only Client</text>
            <text x={90} y={92} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">2001:db8::1</text>

            {/* NAT64 translator */}
            <rect x={220} y={40} width={160} height={80} rx={8} fill="#f59e0b15" stroke="#f59e0b" strokeWidth={2} />
            <text x={300} y={65} textAnchor="middle" fontSize={12} fontWeight={700} fill="#f59e0b" fontFamily="var(--eng-font)">NAT64</text>
            <text x={300} y={80} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">Protocol Translator</text>
            <text x={260} y={100} textAnchor="middle" fontSize={8} fill="#10b981" fontFamily="var(--eng-font)">IPv6</text>
            <text x={300} y={100} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">--&gt;</text>
            <text x={340} y={100} textAnchor="middle" fontSize={8} fill="#3b82f6" fontFamily="var(--eng-font)">IPv4</text>

            {/* IPv4 side */}
            <rect x={440} y={50} width={140} height={60} rx={8} fill="#3b82f615" stroke="#3b82f6" strokeWidth={1.5} />
            <text x={510} y={75} textAnchor="middle" fontSize={10} fill="#3b82f6" fontFamily="var(--eng-font)" fontWeight={600}>IPv4-Only Server</text>
            <text x={510} y={92} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">93.184.216.34</text>

            {/* Connection arrows */}
            <line x1={162} y1={80} x2={218} y2={80} stroke="#10b981" strokeWidth={2} />
            <line x1={382} y1={80} x2={438} y2={80} stroke="#3b82f6" strokeWidth={2} />

            {/* Animated packets */}
            <circle r={5} fill="#10b981">
              <animateMotion path="M162,80 L218,80" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle r={5} fill="#3b82f6">
              <animateMotion path="M382,80 L438,80" dur="1.5s" repeatCount="indefinite" />
            </circle>

            {/* DNS64 label */}
            <rect x={230} y={140} width={140} height={30} rx={6} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1} />
            <text x={300} y={159} textAnchor="middle" fontSize={9} fill="var(--eng-text)" fontFamily="var(--eng-font)" fontWeight={500}>
              DNS64 synthesizes AAAA
            </text>

            <text x={300} y={195} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
              Translates IPv6 packets to IPv4 and vice versa for seamless communication
            </text>
          </svg>
        </div>
      )}

      {/* Summary card */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
        {[
          { name: "Dual Stack", desc: "Both IPv4 and IPv6 on same device", color: "#3b82f6" },
          { name: "Tunneling", desc: "IPv6 encapsulated in IPv4", color: "#8b5cf6" },
          { name: "NAT64", desc: "Protocol translation at gateway", color: "#f59e0b" },
        ].map((m) => (
          <div key={m.name} className="card-eng" style={{ padding: 12, borderLeft: `3px solid ${m.color}` }}>
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.85rem", color: m.color }}>{m.name}</div>
            <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginTop: 4 }}>{m.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "How many bits are in an IPv6 address?",
    options: ["32 bits", "64 bits", "128 bits", "256 bits"],
    correctIndex: 2,
    explanation: "An IPv6 address is 128 bits long, divided into 8 groups of 16 bits each.",
  },
  {
    question: "What does :: in an IPv6 address represent?",
    options: [
      "The end of the address",
      "One or more consecutive groups of all zeros",
      "A wildcard for any value",
      "A private address indicator",
    ],
    correctIndex: 1,
    explanation: "The :: notation replaces one or more consecutive groups of all-zero 16-bit values. It can only appear once in an address.",
  },
  {
    question: "Which IPv6 transition mechanism encapsulates IPv6 packets inside IPv4?",
    options: ["Dual Stack", "Tunneling", "NAT64", "DNS64"],
    correctIndex: 1,
    explanation: "Tunneling wraps IPv6 packets with an IPv4 header to traverse IPv4 networks.",
  },
  {
    question: "Which field was removed in the IPv6 header compared to IPv4?",
    options: ["Source Address", "Version", "Header Checksum", "Hop Limit"],
    correctIndex: 2,
    explanation: "IPv6 removed the header checksum to reduce router processing overhead. Error detection is handled by upper-layer protocols like TCP/UDP.",
  },
  {
    question: "What is the compressed form of 2001:0db8:0000:0000:0000:0000:0000:0001?",
    options: ["2001:db8::1", "2001:db8:0:0:0:0:0:1", "2001:db8:1", "2001::db8::1"],
    correctIndex: 0,
    explanation: "Remove leading zeros (0db8 -> db8), then replace the longest run of consecutive all-zero groups with ::. Note that :: can only appear once.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "format", label: "Format", icon: <Globe className="w-4 h-4" />, content: <FormatTab /> },
  { id: "compare", label: "Compare", icon: <ArrowLeftRight className="w-4 h-4" />, content: <CompareTab /> },
  { id: "transition", label: "Transition", icon: <Layers className="w-4 h-4" />, content: <TransitionTab /> },
];

export default function CN_L3_IPv6Activity() {
  return (
    <EngineeringLessonShell
      title="IPv6 Basics"
      level={3}
      lessonNumber={4}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="NAT, ICMP & ARP"
      placementRelevance="Low"
    />
  );
}
