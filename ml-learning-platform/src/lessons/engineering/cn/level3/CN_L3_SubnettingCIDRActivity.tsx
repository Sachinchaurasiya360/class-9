"use client";

import { useState, useCallback, useMemo } from "react";
import { Network, Sliders, Target, Info, CheckCircle2, XCircle } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Helper Utilities                                                   */
/* ================================================================== */

function ipToInt(ip: string): number {
  const parts = ip.split(".").map(Number);
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

/* ================================================================== */
/*  Tab 1 — Subnet Calculator                                         */
/* ================================================================== */

function SubnetTab() {
  const [ipInput, setIpInput] = useState("192.168.1.100");
  const [prefix, setPrefix] = useState(24);

  const calc = useMemo(() => {
    const ipNum = ipToInt(ipInput);
    if (isNaN(ipNum)) return null;

    const mask = maskFromPrefix(prefix);
    const network = (ipNum & mask) >>> 0;
    const broadcast = (network | (~mask >>> 0)) >>> 0;
    const firstHost = prefix < 31 ? network + 1 : network;
    const lastHost = prefix < 31 ? broadcast - 1 : broadcast;
    const totalHosts = prefix >= 31 ? (prefix === 32 ? 1 : 2) : Math.pow(2, 32 - prefix) - 2;

    return {
      networkAddr: intToIp(network),
      broadcastAddr: intToIp(broadcast),
      firstHostAddr: intToIp(firstHost),
      lastHostAddr: intToIp(lastHost),
      subnetMask: intToIp(mask),
      totalHosts: Math.max(0, totalHosts),
      ipBits: intToBits(ipNum),
      maskBits: intToBits(mask),
    };
  }, [ipInput, prefix]);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Enter an IP address and drag the prefix slider to change the subnet boundary. The 32 bits are divided into network (blue) and host (green) portions.</span>
      </div>

      {/* IP input and prefix slider */}
      <div className="card-eng" style={{ padding: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              IP Address
            </label>
            <input
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8,
                border: "1.5px solid var(--eng-border)", background: "var(--eng-surface)",
                fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)", outline: "none",
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Prefix Length: /{prefix}
            </label>
            <input
              type="range"
              min={0}
              max={32}
              value={prefix}
              onChange={(e) => setPrefix(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--eng-primary)" }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)" }}>
              <span>/0</span>
              <span>/8</span>
              <span>/16</span>
              <span>/24</span>
              <span>/32</span>
            </div>
          </div>
        </div>

        {/* 32-bit visualization */}
        {calc && (
          <div style={{ overflow: "auto" }}>
            <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 8 }}>
              32-Bit Breakdown: Network vs Host
            </p>
            <svg viewBox="0 0 680 70" style={{ width: "100%", minWidth: 500 }}>
              {calc.ipBits.map((bit, i) => {
                const isNetwork = i < prefix;
                const x = 10 + i * 20 + Math.floor(i / 8) * 6;
                return (
                  <g key={i}>
                    <rect
                      x={x} y={10} width={18} height={26} rx={3}
                      fill={isNetwork ? "#3b82f6" : "#10b981"}
                      opacity={0.85}
                    />
                    <text x={x + 9} y={27} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff"
                      fontFamily="var(--eng-font)">
                      {bit}
                    </text>
                    {/* Boundary marker */}
                    {i === prefix - 1 && prefix < 32 && (
                      <line x1={x + 20} y1={5} x2={x + 20} y2={60} stroke="var(--eng-danger)" strokeWidth={2} strokeDasharray="3 2" />
                    )}
                  </g>
                );
              })}
              {/* Labels */}
              <text x={10 + (prefix * 20 + Math.floor(prefix / 8) * 6) / 2} y={55} textAnchor="middle" fontSize={9} fill="#3b82f6" fontWeight={600} fontFamily="var(--eng-font)">
                Network ({prefix} bits)
              </text>
              {prefix < 32 && (
                <text x={10 + (prefix * 20 + Math.floor(prefix / 8) * 6) + ((32 - prefix) * 20 + Math.floor((32 - prefix) / 8) * 6) / 2} y={55} textAnchor="middle" fontSize={9} fill="#10b981" fontWeight={600} fontFamily="var(--eng-font)">
                  Host ({32 - prefix} bits)
                </text>
              )}
            </svg>
          </div>
        )}
      </div>

      {/* Computed results */}
      {calc && (
        <div className="card-eng" style={{ padding: 20 }}>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
            Subnet Details
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[
              { label: "Network Address", value: calc.networkAddr, color: "#3b82f6" },
              { label: "Broadcast Address", value: calc.broadcastAddr, color: "#ef4444" },
              { label: "First Host", value: calc.firstHostAddr, color: "#10b981" },
              { label: "Last Host", value: calc.lastHostAddr, color: "#10b981" },
              { label: "Subnet Mask", value: calc.subnetMask, color: "#8b5cf6" },
              { label: "Usable Hosts", value: calc.totalHosts.toLocaleString(), color: "#f59e0b" },
            ].map((item) => (
              <div key={item.label} style={{ padding: 12, borderRadius: 8, border: "1px solid var(--eng-border)", background: "var(--eng-surface)" }}>
                <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.95rem", fontWeight: 600, color: item.color }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 — VLSM Visual Allocator                                     */
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
    // Sort by required hosts descending (VLSM strategy)
    const sorted = [...subnets].sort((a, b) => b.hosts - a.hosts);
    const blocks: VLSMBlock[] = [];
    let currentAddr = ipToInt(baseIP);
    const totalSpace = Math.pow(2, 32 - basePrefix);
    let usedSpace = 0;

    for (let i = 0; i < sorted.length; i++) {
      const needed = sorted[i].hosts + 2; // +2 for network + broadcast
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

      {/* Base network config */}
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

      {/* Subnet requirements input */}
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

      {/* Block diagram */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 4 }}>
          VLSM Allocation Diagram
        </p>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginBottom: 12 }}>
          Used: {usedAddresses + allocation.length * 2} / {totalSpace} addresses ({Math.round(((usedAddresses + allocation.length * 2) / totalSpace) * 100)}%)
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

        {/* Allocation table */}
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
/*  Tab 3 — Practice Problems                                          */
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
  const [answers, setAnswers] = useState<string[]>([]);
  const [checked, setChecked] = useState<boolean[]>([]);
  const [showSolution, setShowSolution] = useState(false);

  const problem = PROBLEMS[currentProblem];

  const initProblem = useCallback((idx: number) => {
    setCurrentProblem(idx);
    setAnswers(PROBLEMS[idx].steps.map(() => ""));
    setChecked([]);
    setShowSolution(false);
  }, []);

  // Initialize on first render
  useState(() => {
    setAnswers(problem.steps.map(() => ""));
  });

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

      {/* Problem selector */}
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

      {/* Problem card */}
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
      gateRelevance="4-5 marks"
      placementRelevance="High"
    />
  );
}
