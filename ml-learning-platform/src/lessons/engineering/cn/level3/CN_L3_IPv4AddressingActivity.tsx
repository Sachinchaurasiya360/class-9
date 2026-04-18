"use client";

import { useState, useCallback, useEffect } from "react";
import { Binary, Layers, Radio, Globe, Info } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ================================================================== */
/*  Helper Utilities                                                   */
/* ================================================================== */

function octetToBinary(n: number): number[] {
  const bits: number[] = [];
  for (let i = 7; i >= 0; i--) bits.push((n >> i) & 1);
  return bits;
}

function binaryToOctet(bits: number[]): number {
  let val = 0;
  for (let i = 0; i < 8; i++) val += bits[i] * (1 << (7 - i));
  return val;
}

/* ================================================================== */
/*  Tab 1 - Binary IPv4 Visualizer                                     */
/* ================================================================== */

function BinaryTab() {
  const [octets, setOctets] = useState<number[][]>([
    [1, 1, 0, 0, 0, 0, 0, 0], // 192
    [1, 0, 1, 0, 1, 0, 0, 0], // 168
    [0, 0, 0, 0, 0, 0, 0, 1], // 1
    [0, 0, 0, 0, 0, 0, 0, 1], // 1
  ]);

  const decimals = octets.map(binaryToOctet);
  const dottedDecimal = decimals.join(".");

  const toggleBit = useCallback((octetIdx: number, bitIdx: number) => {
    setOctets((prev) => {
      const next = prev.map((o) => [...o]);
      next[octetIdx][bitIdx] = next[octetIdx][bitIdx] === 0 ? 1 : 0;
      return next;
    });
  }, []);

  const handleDecimalInput = useCallback((octetIdx: number, value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > 255) return;
    setOctets((prev) => {
      const next = prev.map((o) => [...o]);
      next[octetIdx] = octetToBinary(num);
      return next;
    });
  }, []);

  const octetColors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Click any bit to toggle it between 0 and 1 and watch the decimal value update in real time. Each octet is 8 bits (0-255).</span>
      </div>

      {/* Dotted decimal display */}
      <div className="card-eng" style={{ padding: 24, textAlign: "center" }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginBottom: 8 }}>
          IPv4 Address (Dotted Decimal)
        </p>
        <div style={{ fontFamily: "var(--eng-font)", fontSize: "2rem", fontWeight: 700, color: "var(--eng-text)", letterSpacing: 2 }}>
          {dottedDecimal}
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginTop: 8 }}>
          32-bit address = 4 octets separated by dots
        </p>
      </div>

      {/* Binary bit grid */}
      <div className="card-eng" style={{ padding: 20, overflow: "auto" }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 16 }}>
          32-Bit Binary Representation
        </p>

        {/* Bit position labels */}
        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 4, flexWrap: "wrap" }}>
          {octets.map((octet, oi) => (
            <div key={oi} style={{ display: "flex", gap: 2, marginRight: oi < 3 ? 12 : 0 }}>
              {octet.map((_, bi) => (
                <div
                  key={bi}
                  style={{
                    width: 32, textAlign: "center",
                    fontFamily: "var(--eng-font)", fontSize: "0.6rem", color: "var(--eng-text-muted)",
                  }}
                >
                  2<sup>{7 - bi}</sup>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Clickable bits */}
        <div style={{ display: "flex", justifyContent: "center", gap: 2, marginBottom: 12, flexWrap: "wrap" }}>
          {octets.map((octet, oi) => (
            <div key={oi} style={{ display: "flex", gap: 2, marginRight: oi < 3 ? 12 : 0 }}>
              {octet.map((bit, bi) => (
                <button
                  key={bi}
                  onClick={() => toggleBit(oi, bi)}
                  style={{
                    width: 32, height: 36, borderRadius: 6,
                    border: `2px solid ${bit === 1 ? octetColors[oi] : "var(--eng-border)"}`,
                    background: bit === 1 ? octetColors[oi] : "var(--eng-surface)",
                    color: bit === 1 ? "#fff" : "var(--eng-text-muted)",
                    fontFamily: "var(--eng-font)", fontSize: "0.9rem", fontWeight: 700,
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                >
                  {bit}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Per-octet decimal values */}
        <div style={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
          {octets.map((_, oi) => (
            <div key={oi} style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: oi < 3 ? 12 : 0 }}>
              <input
                type="number"
                min={0}
                max={255}
                value={decimals[oi]}
                onChange={(e) => handleDecimalInput(oi, e.target.value)}
                style={{
                  width: 8 * 32 + 7 * 2,
                  textAlign: "center",
                  fontFamily: "var(--eng-font)", fontSize: "1rem", fontWeight: 600,
                  padding: "4px 8px", borderRadius: 6,
                  border: `2px solid ${octetColors[oi]}`,
                  background: "var(--eng-surface)", color: "var(--eng-text)",
                  outline: "none",
                }}
              />
              <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: octetColors[oi], fontWeight: 600, marginTop: 4 }}>
                Octet {oi + 1}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick converter */}
      <div className="card-eng" style={{ padding: 16 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Bit Weight Reference
        </p>
        <div style={{ display: "flex", gap: 4, justifyContent: "center", flexWrap: "wrap" }}>
          {[128, 64, 32, 16, 8, 4, 2, 1].map((w) => (
            <div key={w} className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)", minWidth: 36, textAlign: "center" }}>
              {w}
            </div>
          ))}
        </div>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", marginTop: 8, textAlign: "center" }}>
          128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 255 (max value per octet)
        </p>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2 - IP Address Classes                                         */
/* ================================================================== */

interface ClassInfo {
  name: string;
  range: string;
  firstBits: string;
  defaultMask: string;
  privateRange: string;
  color: string;
  start: number;
  end: number;
}

const IP_CLASSES: ClassInfo[] = [
  { name: "A", range: "1.0.0.0 - 126.255.255.255", firstBits: "0xxxxxxx", defaultMask: "255.0.0.0 (/8)", privateRange: "10.0.0.0 - 10.255.255.255", color: "#3b82f6", start: 1, end: 126 },
  { name: "B", range: "128.0.0.0 - 191.255.255.255", firstBits: "10xxxxxx", defaultMask: "255.255.0.0 (/16)", privateRange: "172.16.0.0 - 172.31.255.255", color: "#8b5cf6", start: 128, end: 191 },
  { name: "C", range: "192.0.0.0 - 223.255.255.255", firstBits: "110xxxxx", defaultMask: "255.255.255.0 (/24)", privateRange: "192.168.0.0 - 192.168.255.255", color: "#f59e0b", start: 192, end: 223 },
  { name: "D", range: "224.0.0.0 - 239.255.255.255", firstBits: "1110xxxx", defaultMask: "Multicast", privateRange: "N/A", color: "#10b981", start: 224, end: 239 },
  { name: "E", range: "240.0.0.0 - 255.255.255.255", firstBits: "1111xxxx", defaultMask: "Reserved", privateRange: "N/A", color: "#ef4444", start: 240, end: 255 },
];

function ClassesTab() {
  const [testValue, setTestValue] = useState("");
  const [classResult, setClassResult] = useState<ClassInfo | null>(null);
  const [hoveredClass, setHoveredClass] = useState<string | null>(null);

  const classify = useCallback(() => {
    const first = parseInt(testValue.split(".")[0], 10);
    if (isNaN(first) || first < 0 || first > 255) { setClassResult(null); return; }
    const found = IP_CLASSES.find((c) => first >= c.start && first <= c.end);
    setClassResult(found ?? null);
  }, [testValue]);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>IPv4 addresses are divided into five classes based on their leading bits. Hover over each class zone and use the classifier below.</span>
      </div>

      {/* Number line visualization */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 16 }}>
          Address Space by First Octet (0-255)
        </p>
        <svg viewBox="0 0 640 80" style={{ width: "100%", maxHeight: 100 }}>
          {IP_CLASSES.map((cls) => {
            const x = (cls.start / 256) * 620 + 10;
            const w = ((cls.end - cls.start + 1) / 256) * 620;
            const isActive = hoveredClass === cls.name || classResult?.name === cls.name;
            return (
              <g key={cls.name}
                 onMouseEnter={() => setHoveredClass(cls.name)}
                 onMouseLeave={() => setHoveredClass(null)}
                 style={{ cursor: "pointer" }}
              >
                <rect x={x} y={20} width={w} height={36} rx={4}
                  fill={cls.color} opacity={isActive ? 0.95 : 0.6}
                  stroke={isActive ? cls.color : "none"} strokeWidth={isActive ? 2 : 0}
                  style={{ transition: "opacity 0.2s" }}
                />
                <text x={x + w / 2} y={43} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff"
                  fontFamily="var(--eng-font)">
                  Class {cls.name}
                </text>
                <text x={x + w / 2} y={72} textAnchor="middle" fontSize={9} fill="var(--eng-text-muted)"
                  fontFamily="var(--eng-font)">
                  {cls.start}-{cls.end}
                </text>
              </g>
            );
          })}
          {/* Axis */}
          <line x1={10} y1={58} x2={630} y2={58} stroke="var(--eng-border)" strokeWidth={1} />
        </svg>
      </div>

      {/* Classifier */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Classify an Address
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            type="text"
            value={testValue}
            onChange={(e) => setTestValue(e.target.value)}
            placeholder="e.g. 172.16.5.1"
            style={{
              flex: 1, minWidth: 180, padding: "8px 12px", borderRadius: 8,
              border: "1.5px solid var(--eng-border)", background: "var(--eng-surface)",
              fontFamily: "var(--eng-font)", fontSize: "0.9rem", color: "var(--eng-text)",
              outline: "none",
            }}
          />
          <button className="btn-eng" onClick={classify}>Classify</button>
        </div>
        {classResult && (
          <div className="eng-fadeIn" style={{ marginTop: 16, padding: 12, borderRadius: 8, border: `2px solid ${classResult.color}`, background: `${classResult.color}10` }}>
            <p style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: classResult.color, margin: "0 0 8px" }}>
              Class {classResult.name}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
              <div><span style={{ color: "var(--eng-text-muted)" }}>Range:</span> {classResult.range}</div>
              <div><span style={{ color: "var(--eng-text-muted)" }}>Leading bits:</span> {classResult.firstBits}</div>
              <div><span style={{ color: "var(--eng-text-muted)" }}>Default mask:</span> {classResult.defaultMask}</div>
              <div><span style={{ color: "var(--eng-text-muted)" }}>Private range:</span> {classResult.privateRange}</div>
            </div>
          </div>
        )}
      </div>

      {/* Classes detail table */}
      <div className="card-eng" style={{ padding: 20, overflowX: "auto" }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 12 }}>
          Class Summary
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.8rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--eng-border)" }}>
              {["Class", "First Octet Range", "Leading Bits", "Default Mask", "Private Range"].map((h) => (
                <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IP_CLASSES.map((cls) => (
              <tr key={cls.name} style={{ borderBottom: "1px solid var(--eng-border)" }}>
                <td style={{ padding: "8px 10px" }}>
                  <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: cls.color, marginRight: 8 }} />
                  Class {cls.name}
                </td>
                <td style={{ padding: "8px 10px" }}>{cls.start}-{cls.end}</td>
                <td style={{ padding: "8px 10px", fontFamily: "monospace" }}>{cls.firstBits}</td>
                <td style={{ padding: "8px 10px" }}>{cls.defaultMask}</td>
                <td style={{ padding: "8px 10px" }}>{cls.privateRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3 - Special Addresses                                          */
/* ================================================================== */

interface SpecialAddr {
  name: string;
  address: string;
  description: string;
  color: string;
  icon: string;
}

const SPECIAL_ADDRESSES: SpecialAddr[] = [
  { name: "Loopback", address: "127.0.0.0/8", description: "Used to test TCP/IP stack on localhost. 127.0.0.1 is the most common.", color: "#3b82f6", icon: "loop" },
  { name: "Broadcast", address: "255.255.255.255", description: "Limited broadcast to all hosts on the local network segment.", color: "#ef4444", icon: "broadcast" },
  { name: "Network Address", address: "x.x.x.0 (host bits all 0)", description: "Identifies the network itself. Cannot be assigned to a host.", color: "#f59e0b", icon: "network" },
  { name: "Private Class A", address: "10.0.0.0/8", description: "16 million+ addresses for large private networks.", color: "#8b5cf6", icon: "private" },
  { name: "Private Class B", address: "172.16.0.0/12", description: "1 million+ addresses for medium private networks.", color: "#8b5cf6", icon: "private" },
  { name: "Private Class C", address: "192.168.0.0/16", description: "65,536 addresses for small private networks (home/office).", color: "#8b5cf6", icon: "private" },
  { name: "APIPA", address: "169.254.0.0/16", description: "Link-local auto-config when DHCP fails.", color: "#10b981", icon: "auto" },
  { name: "Default Route", address: "0.0.0.0/0", description: "Represents all possible destinations (used in routing tables).", color: "#64748b", icon: "default" },
];

function SpecialTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>Some IP addresses are reserved for special purposes. Click on each address below to see its role in networking.</span>
      </div>

      {/* Interactive diagram */}
      <div className="card-eng" style={{ padding: 20 }}>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", fontWeight: 600, color: "var(--eng-text)", marginBottom: 16 }}>
          Special IPv4 Address Map
        </p>
        <svg viewBox="0 0 640 320" style={{ width: "100%", maxHeight: 340 }}>
          {/* Central host */}
          <rect x={270} y={130} width={100} height={60} rx={8} fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth={1.5} />
          <text x={320} y={158} textAnchor="middle" fontSize={10} fill="var(--eng-text)" fontFamily="var(--eng-font)" fontWeight={600}>
            Your Host
          </text>
          <text x={320} y={172} textAnchor="middle" fontSize={8} fill="var(--eng-text-muted)" fontFamily="var(--eng-font)">
            192.168.1.10
          </text>

          {/* Special address nodes positioned around */}
          {SPECIAL_ADDRESSES.map((addr, i) => {
            const angle = (i / SPECIAL_ADDRESSES.length) * Math.PI * 2 - Math.PI / 2;
            const cx = 320 + Math.cos(angle) * 140;
            const cy = 160 + Math.sin(angle) * 120;
            const isActive = selected === i;

            return (
              <g key={i}
                 onClick={() => setSelected(isActive ? null : i)}
                 style={{ cursor: "pointer" }}
              >
                {/* Connection line */}
                <line x1={320} y1={160} x2={cx} y2={cy}
                  stroke={isActive ? addr.color : "var(--eng-border)"}
                  strokeWidth={isActive ? 2 : 1}
                  strokeDasharray={isActive ? "0" : "4 4"}
                  style={{ transition: "all 0.3s" }}
                />
                {/* Node */}
                <circle cx={cx} cy={cy} r={isActive ? 22 : 18}
                  fill={isActive ? addr.color : "var(--eng-surface)"}
                  stroke={addr.color} strokeWidth={isActive ? 2 : 1.5}
                  style={{ transition: "all 0.2s" }}
                />
                <text x={cx} y={cy + 3} textAnchor="middle" fontSize={isActive ? 8 : 7}
                  fill={isActive ? "#fff" : "var(--eng-text-muted)"}
                  fontFamily="var(--eng-font)" fontWeight={600}
                >
                  {addr.name.length > 10 ? addr.name.slice(0, 8) + ".." : addr.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Details panel */}
      {selected !== null && (
        <div className="card-eng eng-fadeIn" style={{
          padding: 16, borderLeft: `4px solid ${SPECIAL_ADDRESSES[selected].color}`,
        }}>
          <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
            {SPECIAL_ADDRESSES[selected].name}
          </h4>
          <p style={{ fontFamily: "monospace", fontSize: "0.85rem", color: SPECIAL_ADDRESSES[selected].color, margin: "0 0 8px" }}>
            {SPECIAL_ADDRESSES[selected].address}
          </p>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: 0 }}>
            {SPECIAL_ADDRESSES[selected].description}
          </p>
        </div>
      )}

      {/* Reference grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
        {SPECIAL_ADDRESSES.map((addr, i) => (
          <div
            key={i}
            className="card-eng"
            onClick={() => setSelected(i)}
            style={{
              padding: 12, cursor: "pointer",
              borderLeft: `3px solid ${addr.color}`,
              background: selected === i ? `${addr.color}08` : "var(--eng-surface)",
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.8rem", color: "var(--eng-text)" }}>
              {addr.name}
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: addr.color, marginTop: 2 }}>
              {addr.address}
            </div>
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
    question: "How many bits are in an IPv4 address?",
    options: ["16 bits", "32 bits", "64 bits", "128 bits"],
    correctIndex: 1,
    explanation: "An IPv4 address is 32 bits long, divided into 4 octets of 8 bits each.",
  },
  {
    question: "Which class does the IP address 172.16.5.1 belong to?",
    options: ["Class A", "Class B", "Class C", "Class D"],
    correctIndex: 1,
    explanation: "Class B addresses start with 128-191 in the first octet. 172 falls in this range.",
  },
  {
    question: "What is the decimal value of the binary octet 11000000?",
    options: ["192", "128", "224", "240"],
    correctIndex: 0,
    explanation: "11000000 = 128 + 64 = 192.",
  },
  {
    question: "Which IP address range is reserved for loopback testing?",
    options: ["10.0.0.0/8", "127.0.0.0/8", "169.254.0.0/16", "192.168.0.0/16"],
    correctIndex: 1,
    explanation: "127.0.0.0/8 is the loopback range, with 127.0.0.1 being the most commonly used address.",
  },
  {
    question: "Which of the following is NOT a private IP address range?",
    options: ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16", "8.8.8.0/24"],
    correctIndex: 3,
    explanation: "8.8.8.0/24 is a public address range (used by Google DNS). The other three are RFC 1918 private ranges.",
  },
];

/* ================================================================== */
/*  Main Activity Component                                            */
/* ================================================================== */

const tabs: EngTabDef[] = [
  { id: "binary", label: "Binary", icon: <Binary className="w-4 h-4" />, content: <BinaryTab /> },
  { id: "classes", label: "Classes", icon: <Layers className="w-4 h-4" />, content: <ClassesTab /> },
  { id: "special", label: "Special", icon: <Radio className="w-4 h-4" />, content: <SpecialTab /> },
];

export default function CN_L3_IPv4AddressingActivity() {
  return (
    <EngineeringLessonShell
      title="IPv4 Addressing"
      level={3}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="Subnetting & CIDR"
      placementRelevance="Medium"
    />
  );
}
