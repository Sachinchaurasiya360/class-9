"use client";

import { useState, useCallback, useMemo } from "react";
import { Network, Sliders, Target, Info, CheckCircle2, XCircle } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  useStepPlayer,
} from "@/components/engineering/algo";

/* ================================================================== */
/*  Helper Utilities                                                   */
/* ================================================================== */

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return NaN;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function intToIp(n: number): string {
  return `${(n >>> 24) & 255}.${(n >>> 16) & 255}.${(n >>> 8) & 255}.${n & 255}`;
}

function maskFromPrefix(prefix: number): number {
  if (prefix === 0) return 0;
  return (0xffffffff << (32 - prefix)) >>> 0;
}

function intToBits(n: number): number[] {
  const bits: number[] = [];
  for (let i = 31; i >= 0; i--) bits.push((n >>> i) & 1);
  return bits;
}

function parseInput(raw: string): { ip: string; prefix: number } | null {
  const trimmed = raw.trim();
  const m = trimmed.match(/^(\d+\.\d+\.\d+\.\d+)\s*\/\s*(\d+)$/);
  if (!m) return null;
  const ip = m[1];
  const prefix = Number(m[2]);
  if (isNaN(ipToInt(ip))) return null;
  if (prefix < 0 || prefix > 32) return null;
  return { ip, prefix };
}

/* ================================================================== */
/*  Subnet Frame-Builder                                              */
/* ================================================================== */

type BitCell = { value: 0 | 1; role: "net" | "host" | "both"; highlight: boolean };

interface SubnetFrame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  message: string;
  ipBits: BitCell[];
  maskBits: BitCell[];
  resultBits: BitCell[] | null;
  broadcastBits: BitCell[] | null;
  flashKeys?: string[];
}

const SUBNET_PSEUDO = [
  "function subnet(ip, prefix):",
  "  mask  = (0xFFFFFFFF << (32 - prefix)) & 0xFFFFFFFF",
  "  net   = ip AND mask",
  "  bcast = net OR (NOT mask)",
  "  firstHost = net + 1",
  "  lastHost  = bcast - 1",
  "  numHosts  = 2^(32 - prefix) - 2",
  "  return { net, bcast, firstHost, lastHost, numHosts }",
];

function mkCells(bits: number[], mark: (i: number) => { role: "net" | "host" | "both"; highlight: boolean }): BitCell[] {
  return bits.map((b, i) => {
    const { role, highlight } = mark(i);
    return { value: b as 0 | 1, role, highlight };
  });
}

function buildSubnetFrames(ipStr: string, prefix: number): SubnetFrame[] {
  const frames: SubnetFrame[] = [];
  const ipNum = ipToInt(ipStr);
  const mask = maskFromPrefix(prefix);
  const network = (ipNum & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const firstHost = prefix < 31 ? network + 1 : network;
  const lastHost = prefix < 31 ? broadcast - 1 : broadcast;
  const numHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;

  const ipBits = intToBits(ipNum);
  const maskBits = intToBits(mask);
  const netBits = intToBits(network);
  const bcastBits = intToBits(broadcast);

  const plainIp: BitCell[] = mkCells(ipBits, () => ({ role: "both", highlight: false }));
  const plainMask: BitCell[] = mkCells(maskBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false }));

  // Frame 0 - show the input IP alone
  frames.push({
    line: 0,
    vars: { ip: ipStr, prefix: `/${prefix}` },
    message: `Parse the input: IP = ${ipStr}, prefix = /${prefix}. The prefix tells us how many of the 32 bits identify the network.`,
    ipBits: plainIp,
    maskBits: plainMask.map((c) => ({ ...c, highlight: false })),
    resultBits: null,
    broadcastBits: null,
  });

  // Frame 1 - derive the mask (first `prefix` bits = 1, rest = 0)
  frames.push({
    line: 1,
    vars: { ip: ipStr, prefix: `/${prefix}`, mask: intToIp(mask) },
    message: `Build the subnet mask by setting the leftmost ${prefix} bits to 1 and the remaining ${32 - prefix} bits to 0. That gives ${intToIp(mask)}.`,
    ipBits: plainIp,
    maskBits: mkCells(maskBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: i < prefix })),
    resultBits: null,
    broadcastBits: null,
    flashKeys: ["mask"],
  });

  // Frame 2..(prefix+1) - run the AND bit-by-bit for the network portion
  // Rather than 32 frames, collapse per-byte (4 frames), but keep precision by showing each net-bit AND as it's computed
  // For readability, group by byte.
  const resultSoFar: BitCell[] = Array(32)
    .fill(null)
    .map(() => ({ value: 0, role: "host" as const, highlight: false }));

  for (let byte = 0; byte < 4; byte++) {
    const byteStart = byte * 8;
    const byteEnd = byteStart + 8;
    // Apply the AND for this byte
    for (let i = byteStart; i < byteEnd; i++) {
      resultSoFar[i] = {
        value: ((ipBits[i] & maskBits[i]) as 0 | 1),
        role: i < prefix ? "net" : "host",
        highlight: false,
      };
    }
    const highlightedIp: BitCell[] = plainIp.map((c, i) => ({
      ...c,
      highlight: i >= byteStart && i < byteEnd,
    }));
    const highlightedMask: BitCell[] = mkCells(maskBits, (i) => ({
      role: i < prefix ? "net" : "host",
      highlight: i >= byteStart && i < byteEnd,
    }));
    const currResult: BitCell[] = resultSoFar.map((c, i) => ({
      ...c,
      highlight: i >= byteStart && i < byteEnd,
    }));
    const octetIpVal = (ipNum >>> (24 - byte * 8)) & 0xff;
    const octetMaskVal = (mask >>> (24 - byte * 8)) & 0xff;
    const octetNetVal = (network >>> (24 - byte * 8)) & 0xff;

    frames.push({
      line: 2,
      vars: {
        byte: byte + 1,
        "IP octet": octetIpVal,
        "mask octet": octetMaskVal,
        "net octet": octetNetVal,
      },
      message: `AND octet ${byte + 1}: ${octetIpVal} AND ${octetMaskVal} = ${octetNetVal}. Wherever the mask is 0 the result becomes 0 - host bits are erased.`,
      ipBits: highlightedIp,
      maskBits: highlightedMask,
      resultBits: currResult,
      broadcastBits: null,
      flashKeys: ["net octet"],
    });
  }

  // Frame: show the complete network address
  frames.push({
    line: 2,
    vars: { network: intToIp(network) },
    message: `All four octets AND'ed. Network address = ${intToIp(network)}. This is the "name" of the subnet.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: null,
    flashKeys: ["network"],
  });

  // Frame: compute broadcast = net OR (NOT mask)  (set all host bits to 1)
  frames.push({
    line: 3,
    vars: { network: intToIp(network), broadcast: intToIp(broadcast) },
    message: `Broadcast = network OR (NOT mask). Flip every host bit to 1. That gives ${intToIp(broadcast)}.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: mkCells(bcastBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: i >= prefix })),
    flashKeys: ["broadcast"],
  });

  // Frame: derive first/last host
  frames.push({
    line: 4,
    vars: {
      network: intToIp(network),
      firstHost: intToIp(firstHost),
      broadcast: intToIp(broadcast),
    },
    message: `First usable host = network + 1 = ${intToIp(firstHost)}. Network address itself is reserved.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: mkCells(bcastBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    flashKeys: ["firstHost"],
  });

  frames.push({
    line: 5,
    vars: {
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      broadcast: intToIp(broadcast),
    },
    message: `Last usable host = broadcast − 1 = ${intToIp(lastHost)}. Broadcast address itself is reserved.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: mkCells(bcastBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    flashKeys: ["lastHost"],
  });

  frames.push({
    line: 6,
    vars: {
      prefix: `/${prefix}`,
      "host bits": 32 - prefix,
      numHosts: numHosts.toLocaleString(),
    },
    message: `Usable hosts = 2^${32 - prefix} − 2 = ${numHosts.toLocaleString()}. We subtract 2 for network + broadcast addresses.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: mkCells(bcastBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    flashKeys: ["numHosts"],
  });

  frames.push({
    line: 7,
    vars: {
      network: intToIp(network),
      firstHost: intToIp(firstHost),
      lastHost: intToIp(lastHost),
      broadcast: intToIp(broadcast),
      numHosts: numHosts.toLocaleString(),
    },
    message: `Done. ${intToIp(network)}/${prefix} holds addresses ${intToIp(network)} – ${intToIp(broadcast)}, with ${numHosts.toLocaleString()} usable hosts.`,
    ipBits: plainIp,
    maskBits: plainMask,
    resultBits: mkCells(netBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
    broadcastBits: mkCells(bcastBits, (i) => ({ role: i < prefix ? "net" : "host", highlight: false })),
  });

  return frames;
}

/* ================================================================== */
/*  Bit-Row Renderer                                                  */
/* ================================================================== */

function BitRow({
  label,
  bits,
  prefix,
  mono,
}: {
  label: string;
  bits: BitCell[];
  prefix: number;
  mono: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div
        style={{
          fontFamily: "var(--eng-font)",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: "var(--eng-text-muted)",
          width: 78,
          flexShrink: 0,
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", gap: 2, flexWrap: "nowrap" }}>
        {bits.map((c, i) => {
          const isBoundary = i === prefix - 1 && prefix > 0 && prefix < 32;
          const isOctetEnd = i % 8 === 7 && i !== 31;
          const bg =
            c.role === "net" ? "#3b82f6" : c.role === "host" ? "#10b981" : "#64748b";
          return (
            <div key={i} style={{ display: "flex", gap: 2 }}>
              <div
                style={{
                  width: 16,
                  height: 22,
                  borderRadius: 3,
                  background: bg,
                  opacity: c.highlight ? 1 : 0.75,
                  border: c.highlight ? "2px solid var(--eng-warning)" : "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                  fontFamily: mono,
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.25s ease",
                }}
              >
                {c.value}
              </div>
              {isBoundary && (
                <div
                  style={{
                    width: 2,
                    background: "var(--eng-danger)",
                    marginLeft: 1,
                    marginRight: 1,
                  }}
                  title="Network / host boundary"
                />
              )}
              {isOctetEnd && !isBoundary && (
                <div style={{ width: 6 }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 1 - Subnet Calculator (AlgoCanvas)                            */
/* ================================================================== */

function SubnetTab() {
  const [raw, setRaw] = useState("192.168.1.100/24");
  const parsed = useMemo(() => parseInput(raw) ?? { ip: "192.168.1.100", prefix: 24 }, [raw]);
  const frames = useMemo(() => buildSubnetFrames(parsed.ip, parsed.prefix), [parsed]);
  const player = useStepPlayer(frames);
  const frame = player.current!;
  const mono = '"SF Mono", Menlo, Consolas, monospace';

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>
          Enter an IP in <code>x.x.x.x/prefix</code> form. Each step shows the binary AND being applied octet-by-octet, then derives broadcast and host range.
        </span>
      </div>

      <AlgoCanvas
        title={`Subnet ${parsed.ip}/${parsed.prefix}`}
        player={player}
        input={
          <InputEditor
            label="IP / prefix"
            value={raw}
            onApply={setRaw}
            presets={[
              { label: "/24", value: "192.168.1.100/24" },
              { label: "/26", value: "10.0.0.50/26" },
              { label: "/20", value: "172.16.5.200/20" },
              { label: "/28", value: "192.168.10.5/28" },
              { label: "/30", value: "10.1.2.3/30" },
            ]}
            placeholder="e.g. 192.168.1.100/24"
            helper="Format: dotted-quad IP / prefix (0–32)."
          />
        }
        pseudocode={<PseudocodePanel lines={SUBNET_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKeys} />}
        status={frame.message}
        legend={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <LegendSwatch color="#3b82f6" label="Network bit" />
            <LegendSwatch color="#10b981" label="Host bit" />
            <LegendSwatch color="var(--eng-warning)" label="Active octet" />
          </div>
        }
      >
        <div
          style={{
            padding: 18,
            borderRadius: "var(--eng-radius)",
            background: "var(--eng-surface)",
            border: "1px solid var(--eng-border)",
            overflowX: "auto",
          }}
        >
          <BitRow label="IP" bits={frame.ipBits} prefix={parsed.prefix} mono={mono} />
          <BitRow label="Mask" bits={frame.maskBits} prefix={parsed.prefix} mono={mono} />
          {frame.resultBits && (
            <>
              <div
                style={{
                  height: 1,
                  background: "var(--eng-border)",
                  margin: "6px 0 8px 88px",
                }}
              />
              <BitRow label="Network" bits={frame.resultBits} prefix={parsed.prefix} mono={mono} />
            </>
          )}
          {frame.broadcastBits && (
            <BitRow label="Broadcast" bits={frame.broadcastBits} prefix={parsed.prefix} mono={mono} />
          )}

          {/* Dotted-quad summary card at bottom */}
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
              gap: 10,
            }}
          >
            <SummaryCard label="Subnet mask" value={intToIp(maskFromPrefix(parsed.prefix))} color="#8b5cf6" />
            {frame.resultBits && (
              <SummaryCard
                label="Network"
                value={intToIp(ipToInt(parsed.ip) & maskFromPrefix(parsed.prefix))}
                color="#3b82f6"
              />
            )}
            {frame.broadcastBits && (
              <SummaryCard
                label="Broadcast"
                value={intToIp(
                  ((ipToInt(parsed.ip) & maskFromPrefix(parsed.prefix)) | (~maskFromPrefix(parsed.prefix) >>> 0)) >>> 0,
                )}
                color="#ef4444"
              />
            )}
            {frame.line >= 6 && (
              <SummaryCard
                label="Usable hosts"
                value={(parsed.prefix >= 31
                  ? parsed.prefix === 32
                    ? 1
                    : 2
                  : Math.pow(2, 32 - parsed.prefix) - 2
                ).toLocaleString()}
                color="#f59e0b"
              />
            )}
          </div>
        </div>
      </AlgoCanvas>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--eng-font)", fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      style={{
        padding: 10,
        borderRadius: 8,
        border: "1px solid var(--eng-border)",
        background: "var(--eng-bg)",
      }}
    >
      <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.88rem", fontWeight: 700, color }}>
        {value}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - VLSM Visual Allocator                                     */
/* ================================================================== */

interface VLSMBlock {
  name: string;
  required: number;
  allocated: number;
  prefix: number;
  networkAddr: string;
  broadcastAddr: string;
  color: string;
}

const VLSM_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899", "#06b6d4", "#84cc16"];

function VLSMTab() {
  const [baseIP, setBaseIP] = useState("192.168.1.0");
  const [basePrefix, setBasePrefix] = useState(24);
  const [subnets, setSubnets] = useState<{ name: string; hosts: number }[]>([
    { name: "HR", hosts: 50 },
    { name: "Sales", hosts: 25 },
    { name: "IT", hosts: 10 },
    { name: "Mgmt", hosts: 5 },
  ]);
  const [newName, setNewName] = useState("");
  const [newHosts, setNewHosts] = useState("");

  const addSubnet = useCallback(() => {
    const h = parseInt(newHosts, 10);
    if (!newName.trim() || isNaN(h) || h < 1) return;
    setSubnets((prev) => [...prev, { name: newName.trim(), hosts: h }]);
    setNewName("");
    setNewHosts("");
  }, [newName, newHosts]);

  const removeSubnet = useCallback((idx: number) => {
    setSubnets((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const allocation = useMemo((): VLSMBlock[] => {
    const sorted = [...subnets].sort((a, b) => b.hosts - a.hosts);
    const blocks: VLSMBlock[] = [];
    let currentAddr = ipToInt(baseIP);
    const totalSpace = Math.pow(2, 32 - basePrefix);
    let usedSpace = 0;

    for (let i = 0; i < sorted.length; i++) {
      const needed = sorted[i].hosts + 2;
      let hostBits = 0;
      while (Math.pow(2, hostBits) < needed) hostBits++;
      const blockSize = Math.pow(2, hostBits);
      const subPrefix = 32 - hostBits;

      if (usedSpace + blockSize > totalSpace) break;

      const netAddr = currentAddr;
      const bcastAddr = netAddr + blockSize - 1;

      blocks.push({
        name: sorted[i].name,
        required: sorted[i].hosts,
        allocated: blockSize - 2,
        prefix: subPrefix,
        networkAddr: intToIp(netAddr),
        broadcastAddr: intToIp(bcastAddr),
        color: VLSM_COLORS[i % VLSM_COLORS.length],
      });

      currentAddr += blockSize;
      usedSpace += blockSize;
    }

    return blocks;
  }, [subnets, baseIP, basePrefix]);

  const totalSpace = Math.pow(2, 32 - basePrefix);
  const usedAddresses = allocation.reduce((sum, b) => sum + b.allocated + 2, 0);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>VLSM (Variable Length Subnet Masking) allocates different-sized subnets from a single network. Define your required subnet sizes below and see optimal allocation.</span>
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>Base Network</label>
            <input type="text" value={baseIP} onChange={(e) => setBaseIP(e.target.value)}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 140, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
            />
          </div>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>Prefix</label>
            <select value={basePrefix} onChange={(e) => setBasePrefix(Number(e.target.value))}
              style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}>
              {[16, 17, 18, 19, 20, 21, 22, 23, 24].map((p) => (
                <option key={p} value={p}>/{p} ({Math.pow(2, 32 - p)} addresses)</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Subnet Requirements
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {subnets.map((s, i) => (
            <div key={i} className="tag-eng" style={{ display: "flex", alignItems: "center", gap: 6, background: `${VLSM_COLORS[i % VLSM_COLORS.length]}15`, color: VLSM_COLORS[i % VLSM_COLORS.length], border: `1px solid ${VLSM_COLORS[i % VLSM_COLORS.length]}40` }}>
              {s.name}: {s.hosts} hosts
              <button onClick={() => removeSubnet(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, fontSize: "1rem", lineHeight: 1 }}>x</button>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Subnet name"
            style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 120, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
          />
          <input type="number" value={newHosts} onChange={(e) => setNewHosts(e.target.value)} placeholder="Hosts needed" min={1}
            style={{ padding: "6px 10px", borderRadius: 6, border: "1.5px solid var(--eng-border)", fontFamily: "var(--eng-font)", fontSize: "0.85rem", width: 120, background: "var(--eng-surface)", color: "var(--eng-text)", outline: "none" }}
          />
          <button className="btn-eng" onClick={addSubnet} style={{ fontSize: "0.8rem" }}>Add</button>
        </div>
      </div>

      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
          VLSM Allocation Diagram
        </p>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 12 }}>
          Used: {usedAddresses} / {totalSpace} addresses ({Math.round((usedAddresses / totalSpace) * 100)}%)
        </p>
        <svg viewBox="0 0 640 60" style={{ width: "100%", marginBottom: 12 }}>
          <rect x={0} y={10} width={640} height={40} rx={4} fill="var(--eng-border)" opacity={0.3} />
          {allocation.map((block, i) => {
            const blockSize = block.allocated + 2;
            const offset = allocation.slice(0, i).reduce((s, b) => s + b.allocated + 2, 0);
            const x = (offset / totalSpace) * 640;
            const w = Math.max(2, (blockSize / totalSpace) * 640);
            return (
              <g key={i}>
                <rect x={x} y={10} width={w} height={40} rx={2} fill={block.color} opacity={0.85} />
                {w > 40 && (
                  <text x={x + w / 2} y={34} textAnchor="middle" fontSize={9} fontWeight={600} fill="#fff" fontFamily="var(--eng-font)">
                    {block.name}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
                {["Subnet", "Required", "Allocated", "Prefix", "Network", "Broadcast"].map((h) => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocation.map((block, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                  <td style={{ padding: "8px 10px" }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: block.color, marginRight: 8 }} />
                    {block.name}
                  </td>
                  <td style={{ padding: "8px 10px" }}>{block.required}</td>
                  <td style={{ padding: "8px 10px" }}>{block.allocated}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>/{block.prefix}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{block.networkAddr}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{block.broadcastAddr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - Practice Problems                                          */
/* ================================================================== */

interface SubnetProblem {
  question: string;
  ip: string;
  prefix: number;
  steps: { label: string; answer: string }[];
}

const PROBLEMS: SubnetProblem[] = [
  {
    question: "Given 10.0.0.0/26, find the network details.",
    ip: "10.0.0.0",
    prefix: 26,
    steps: [
      { label: "Subnet Mask", answer: "255.255.255.192" },
      { label: "Number of usable hosts", answer: "62" },
      { label: "Broadcast Address", answer: "10.0.0.63" },
      { label: "First usable host", answer: "10.0.0.1" },
    ],
  },
  {
    question: "Given 172.16.0.0/20, find the network details.",
    ip: "172.16.0.0",
    prefix: 20,
    steps: [
      { label: "Subnet Mask", answer: "255.255.240.0" },
      { label: "Number of usable hosts", answer: "4094" },
      { label: "Broadcast Address", answer: "172.16.15.255" },
      { label: "First usable host", answer: "172.16.0.1" },
    ],
  },
  {
    question: "Given 192.168.10.0/28, find the network details.",
    ip: "192.168.10.0",
    prefix: 28,
    steps: [
      { label: "Subnet Mask", answer: "255.255.255.240" },
      { label: "Number of usable hosts", answer: "14" },
      { label: "Broadcast Address", answer: "192.168.10.15" },
      { label: "First usable host", answer: "192.168.10.1" },
    ],
  },
];

function PracticeTab() {
  const [currentProblem, setCurrentProblem] = useState(0);
  const [answers, setAnswers] = useState<string[]>(() => PROBLEMS[0].steps.map(() => ""));
  const [checked, setChecked] = useState<boolean[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const problem = PROBLEMS[currentProblem];

  const initProblem = useCallback((idx: number) => {
    setCurrentProblem(idx);
    setAnswers(PROBLEMS[idx].steps.map(() => ""));
    setChecked([]);
    setShowSolution(false);
  }, []);

  const handleCheck = useCallback(() => {
    const results = problem.steps.map((step, i) =>
      (answers[i] || "").trim().toLowerCase() === step.answer.toLowerCase()
    );
    setChecked(results);
  }, [answers, problem.steps]);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Solve subnetting problems step by step. Enter your answers and check them against the correct values.</span>
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {PROBLEMS.map((_, i) => (
          <button
            key={i}
            className={currentProblem === i ? "btn-eng" : "btn-eng-outline"}
            onClick={() => initProblem(i)}
            style={{ fontSize: "0.8rem" }}
          >
            Problem {i + 1}
          </button>
        ))}
      </div>

      <div className="card-eng" style={{ padding: 20 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          Problem {currentProblem + 1}
        </h4>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 16px" }}>
          {problem.question}
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {problem.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 500, color: "var(--eng-text-muted)", minWidth: 180 }}>
                {step.label}:
              </label>
              <input
                type="text"
                value={answers[i] || ""}
                onChange={(e) => {
                  const next = [...answers];
                  next[i] = e.target.value;
                  setAnswers(next);
                }}
                placeholder="Your answer"
                style={{
                  flex: 1, minWidth: 150, padding: "6px 10px", borderRadius: 6,
                  border: checked.length > 0
                    ? `2px solid ${checked[i] ? "var(--eng-success)" : "var(--eng-danger)"}`
                    : "1.5px solid var(--eng-border)",
                  background: "var(--eng-surface)", fontFamily: "var(--eng-font)", fontSize: "0.85rem",
                  color: "var(--eng-text)", outline: "none",
                }}
              />
              {checked.length > 0 && (
                checked[i]
                  ? <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--eng-success)" }} />
                  : <XCircle className="w-5 h-5 shrink-0" style={{ color: "var(--eng-danger)" }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button className="btn-eng" onClick={handleCheck}>Check Answers</button>
          <button className="btn-eng-outline" onClick={() => setShowSolution(!showSolution)}>
            {showSolution ? "Hide Solution" : "Show Solution"}
          </button>
        </div>

        {showSolution && (
          <div className="eng-fadeIn" style={{ marginTop: 16, padding: 12, borderRadius: 8, border: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>Solution:</p>
            {problem.steps.map((step, i) => (
              <div key={i} style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text)", marginBottom: 4 }}>
                <span style={{ color: "var(--eng-text-muted)" }}>{step.label}:</span>{" "}
                <span style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--eng-success)" }}>{step.answer}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz                                                               */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "What is the subnet mask for a /20 prefix?",
    options: ["255.255.0.0", "255.255.240.0", "255.255.248.0", "255.255.255.0"],
    correctIndex: 1,
    explanation: "/20 means 20 network bits: 255.255.11110000.0 = 255.255.240.0",
  },
  {
    question: "How many usable host addresses are in a /26 subnet?",
    options: ["30", "62", "64", "126"],
    correctIndex: 1,
    explanation: "/26 has 6 host bits: 2^6 - 2 = 62 usable host addresses (minus network and broadcast).",
  },
  {
    question: "In VLSM, subnets are allocated starting with the:",
    options: ["Smallest subnet first", "Largest subnet first", "Alphabetical order", "Random order"],
    correctIndex: 1,
    explanation: "VLSM allocates the largest subnet first to minimize wasted address space.",
  },
  {
    question: "What does CIDR stand for?",
    options: [
      "Classless Inter-Domain Routing",
      "Classful Internet Domain Routing",
      "Computed Inter-Domain Resolution",
      "Classless Internet Data Routing",
    ],
    correctIndex: 0,
    explanation: "CIDR (Classless Inter-Domain Routing) replaced classful addressing to allow flexible subnet sizing.",
  },
  {
    question: "Given 192.168.10.0/28, what is the broadcast address?",
    options: ["192.168.10.15", "192.168.10.16", "192.168.10.31", "192.168.10.255"],
    correctIndex: 0,
    explanation: "/28 gives a block size of 16 (2^4). Starting from .0, the broadcast is .0 + 16 - 1 = .15.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "subnet", label: "Subnet", icon: <Sliders className="w-4 h-4" />, content: <SubnetTab /> },
  { id: "vlsm", label: "VLSM", icon: <Network className="w-4 h-4" />, content: <VLSMTab /> },
  { id: "practice", label: "Practice", icon: <Target className="w-4 h-4" />, content: <PracticeTab /> },
];

export default function CN_L3_SubnettingCIDRActivity() {
  return (
    <EngineeringLessonShell
      title="Subnetting & CIDR"
      level={3}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="IP Routing & Forwarding"
      placementRelevance="High"
    />
  );
}
