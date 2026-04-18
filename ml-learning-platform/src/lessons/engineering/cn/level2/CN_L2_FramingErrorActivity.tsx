"use client";

import { useCallback, useMemo, useState } from "react";
import { Shield, Binary, Hash, CheckCircle2, XCircle } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  MemoryCells,
  useStepPlayer,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ================================================================== */
/*  Tab 1: Error Detection - Parity Bit Demo                          */
/* ================================================================== */

function ErrorDetectionTab() {
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1]);
  const [parityType, setParityType] = useState<"even" | "odd">("even");
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);

  const onesCount = bits.reduce((a, b) => a + b, 0);
  const parityBit = parityType === "even" ? onesCount % 2 : (onesCount + 1) % 2;
  const fullWord = [...bits, parityBit];

  const checkOnes = fullWord.reduce((a, b) => a + b, 0);
  const isValid = parityType === "even" ? checkOnes % 2 === 0 : checkOnes % 2 === 1;

  const handleFlipBit = useCallback((idx: number) => {
    if (idx < bits.length) {
      setBits((prev) => {
        const next = [...prev];
        next[idx] = next[idx] === 0 ? 1 : 0;
        return next;
      });
      setFlippedIdx(idx);
    }
    setShowCheck(false);
  }, [bits.length]);

  const handleReset = useCallback(() => {
    setBits([1, 0, 1, 1, 0, 0, 1]);
    setFlippedIdx(null);
    setShowCheck(false);
  }, []);

  const handleRandomize = useCallback(() => {
    const newBits = Array.from({ length: 7 }, () => Math.random() > 0.5 ? 1 : 0);
    setBits(newBits);
    setFlippedIdx(null);
    setShowCheck(false);
  }, []);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Parity Bit Error Detection
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Click any data bit to flip it (simulate an error), then check if parity can detect the corruption.
      </p>

      {/* Parity type toggle */}
      <div className="flex gap-2" style={{ marginBottom: 20, flexWrap: "wrap" }}>
        {(["even", "odd"] as const).map((p) => (
          <button
            key={p}
            onClick={() => { setParityType(p); setShowCheck(false); }}
            className={parityType === p ? "btn-eng" : "btn-eng-outline"}
            style={{ fontSize: "0.8rem", textTransform: "capitalize" }}
          >
            {p} Parity
          </button>
        ))}
        <button onClick={handleRandomize} className="btn-eng-outline" style={{ fontSize: "0.8rem", marginLeft: "auto" }}>
          Randomize
        </button>
        <button onClick={handleReset} className="btn-eng-outline" style={{ fontSize: "0.8rem" }}>
          Reset
        </button>
      </div>

      {/* Binary stream visualization */}
      <div className="card-eng" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
          {fullWord.map((bit, idx) => {
            const isParityBit = idx === fullWord.length - 1;
            const isFlipped = idx === flippedIdx;
            return (
              <div
                key={idx}
                onClick={() => !isParityBit && handleFlipBit(idx)}
                style={{
                  width: 56,
                  height: 56,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: `2px solid ${isParityBit ? "var(--eng-primary)" : isFlipped ? "var(--eng-danger)" : "var(--eng-border)"}`,
                  background: isParityBit
                    ? "rgba(99,102,241,0.08)"
                    : isFlipped
                      ? "rgba(239,68,68,0.08)"
                      : "var(--eng-surface)",
                  cursor: isParityBit ? "default" : "pointer",
                  transition: "all 0.3s ease",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: isFlipped ? "var(--eng-danger)" : isParityBit ? "var(--eng-primary)" : "var(--eng-text)",
                  }}
                >
                  {bit}
                </span>
                <span
                  style={{
                    fontFamily: "var(--eng-font)",
                    fontSize: "0.55rem",
                    color: "var(--eng-text-muted)",
                    position: "absolute",
                    bottom: 3,
                  }}
                >
                  {isParityBit ? "P" : `D${idx}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            1s count: <strong style={{ color: "var(--eng-text)" }}>{checkOnes}</strong>
          </span>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Parity: <strong style={{ color: "var(--eng-primary)" }}>{parityType}</strong>
          </span>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            Parity bit: <strong style={{ color: "var(--eng-primary)" }}>{parityBit}</strong>
          </span>
        </div>
      </div>

      {/* Check button */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <button onClick={() => setShowCheck(true)} className="btn-eng" style={{ fontSize: "0.85rem" }}>
          Check for Errors
        </button>
      </div>

      {/* Result */}
      {showCheck && (
        <div
          className="card-eng eng-fadeIn"
          style={{
            padding: 16,
            textAlign: "center",
            borderLeft: `3px solid ${isValid ? "var(--eng-success)" : "var(--eng-danger)"}`,
          }}
        >
          <div className="flex items-center justify-center gap-2" style={{ marginBottom: 8 }}>
            {isValid ? (
              <CheckCircle2 className="w-5 h-5" style={{ color: "var(--eng-success)" }} />
            ) : (
              <XCircle className="w-5 h-5" style={{ color: "var(--eng-danger)" }} />
            )}
            <span style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.95rem", color: isValid ? "var(--eng-success)" : "var(--eng-danger)" }}>
              {isValid ? "No Error Detected" : "Error Detected!"}
            </span>
          </div>
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0 }}>
            {isValid
              ? flippedIdx !== null
                ? "Hmm, the parity check passed but there was a flip! Parity can miss 2-bit errors."
                : "The parity check confirms no single-bit error in the data."
              : "The parity check found that the number of 1s is inconsistent. A single-bit error occurred!"}
          </p>
        </div>
      )}

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Limitation:</strong> Simple parity can only detect an odd number of bit errors. If 2 bits flip, parity remains unchanged and the error goes undetected.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 2: CRC Polynomial Division (AlgoCanvas)                        */
/* ================================================================== */

interface CRCFrame {
  line: number;
  message: string;
  vars: Record<string, string | number | boolean | undefined>;
  bits: string[];                        // current working buffer, one bit per cell
  states: (CellState | undefined)[];     // per-bit highlight
  pointer: number | null;                // current leading-1 position
  remainder?: string;
  transmitted?: string;
}

const CRC_PSEUDO = [
  "function CRC(data, gen):",
  "  buffer ← data + '0' × (len(gen) - 1)",
  "  for i ← 0 to len(buffer) - len(gen):",
  "    if buffer[i] == 1:",
  "      for j ← 0 to len(gen) - 1:",
  "        buffer[i+j] ← buffer[i+j] XOR gen[j]",
  "  remainder ← last (len(gen) - 1) bits of buffer",
  "  return data + remainder",
];

function buildCRCFrames(dataRaw: string, genRaw: string): CRCFrame[] {
  const data = dataRaw.replace(/[^01]/g, "") || "1101011";
  const gen = genRaw.replace(/[^01]/g, "") || "1011";
  const g = gen.length;
  const frames: CRCFrame[] = [];

  const initial = data + "0".repeat(g - 1);
  const buf = initial.split("");

  frames.push({
    line: 0,
    message: `CRC computation: data = ${data}, generator = ${gen}`,
    vars: { data, gen, dataLen: data.length, genLen: g },
    bits: [...buf],
    states: buf.map(() => undefined),
    pointer: null,
  });

  frames.push({
    line: 1,
    message: `Append ${g - 1} zeros to data - this is what we divide.`,
    vars: { data, gen, buffer: buf.join("") },
    bits: [...buf],
    states: buf.map((_, i) => (i < data.length ? "active" : "compare")),
    pointer: null,
  });

  for (let i = 0; i <= buf.length - g; i++) {
    frames.push({
      line: 2,
      message: `i = ${i}: examine bit at position ${i}.`,
      vars: { i, bit: buf[i], buffer: buf.join("") },
      bits: [...buf],
      states: buf.map((_, k) => (k === i ? "active" : undefined)),
      pointer: i,
    });

    if (buf[i] !== "1") {
      frames.push({
        line: 3,
        message: `buffer[${i}] is 0 - skip. No XOR needed.`,
        vars: { i, bit: 0, buffer: buf.join("") },
        bits: [...buf],
        states: buf.map((_, k) => (k === i ? "mismatch" : undefined)),
        pointer: i,
      });
      continue;
    }

    frames.push({
      line: 3,
      message: `buffer[${i}] is 1 - XOR generator ${gen} here.`,
      vars: { i, bit: 1, buffer: buf.join("") },
      bits: [...buf],
      states: buf.map((_, k) => (k >= i && k < i + g ? "compare" : undefined)),
      pointer: i,
    });

    frames.push({
      line: 4,
      message: `Align generator ${gen} under positions [${i}..${i + g - 1}] and XOR bit-by-bit.`,
      vars: { i, generator: gen, buffer: buf.join("") },
      bits: [...buf],
      states: buf.map((_, k) => (k >= i && k < i + g ? "compare" : undefined)),
      pointer: i,
    });

    for (let j = 0; j < g; j++) {
      const oldBit = buf[i + j];
      const newBit = String(Number(buf[i + j]) ^ Number(gen[j]));
      buf[i + j] = newBit;
      frames.push({
        line: 5,
        message: `XOR: buffer[${i + j}] = ${oldBit} ⊕ ${gen[j]} = ${newBit}`,
        vars: { i, j, xor: `${oldBit}⊕${gen[j]}=${newBit}`, buffer: buf.join("") },
        bits: [...buf],
        states: buf.map((_, k) => {
          if (k === i + j) return "swap";
          if (k >= i && k < i + g) return "compare";
          return undefined;
        }),
        pointer: i,
      });
    }
  }

  const rem = buf.slice(buf.length - (g - 1)).join("");
  const tx = data + rem;

  frames.push({
    line: 6,
    message: `Remainder = last ${g - 1} bits = ${rem}`,
    vars: { remainder: rem, buffer: buf.join("") },
    bits: [...buf],
    states: buf.map((_, k) => (k >= buf.length - (g - 1) ? "done" : undefined)),
    pointer: null,
    remainder: rem,
  });

  frames.push({
    line: 7,
    message: `Transmit: data (${data}) + CRC (${rem}) = ${tx}`,
    vars: { remainder: rem, transmitted: tx },
    bits: tx.split(""),
    states: tx.split("").map((_, k) => (k < data.length ? "active" : "done")),
    pointer: null,
    remainder: rem,
    transmitted: tx,
  });

  return frames;
}

function CRCTab() {
  const [inputStr, setInputStr] = useState("1101011 | 1011");

  const [data, gen] = useMemo(() => {
    const parts = inputStr.split("|").map((s) => s.trim());
    return [parts[0] || "1101011", parts[1] || "1011"];
  }, [inputStr]);

  const frames = useMemo(() => buildCRCFrames(data, gen), [data, gen]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  const flashKeys = useMemo(() => {
    const out: string[] = [];
    if (frame.vars.xor !== undefined) out.push("xor");
    if (frame.vars.remainder !== undefined) out.push("remainder");
    if (frame.vars.transmitted !== undefined) out.push("transmitted");
    return out;
  }, [frame]);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        CRC Polynomial Division
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Enter a data word and generator (binary), then step through modulo-2 division XOR-by-XOR. The remainder is the CRC.
      </p>

      <AlgoCanvas
        title="CRC Computation"
        player={player}
        input={
          <InputEditor
            label="Data | Generator (both binary)"
            value={inputStr}
            helper="Format: data | generator, e.g. 1101011 | 1011"
            placeholder="1101011 | 1011"
            presets={[
              { label: "Classic", value: "1101011 | 1011" },
              { label: "CRC-3", value: "10110 | 1101" },
              { label: "CRC-4", value: "10011010 | 10011" },
              { label: "All ones", value: "11111111 | 1101" },
            ]}
            onApply={(v) => {
              if (/\|/.test(v)) setInputStr(v);
            }}
            onRandom={() => {
              const dlen = 6 + Math.floor(Math.random() * 4);
              const glen = 3 + Math.floor(Math.random() * 2);
              const d = Array.from({ length: dlen }, () => (Math.random() > 0.5 ? "1" : "0")).join("");
              let gg = "1" + Array.from({ length: glen - 1 }, () => (Math.random() > 0.5 ? "1" : "0")).join("");
              if (gg[gg.length - 1] === "0") gg = gg.slice(0, -1) + "1";
              setInputStr(`${d} | ${gg}`);
            }}
          />
        }
        pseudocode={<PseudocodePanel lines={CRC_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={flashKeys} />}
        legend={
          <span>
            <span style={{ color: "#3b82f6", fontWeight: 700 }}>active</span> = current leading bit ·
            <span style={{ color: "#f59e0b", fontWeight: 700, marginLeft: 6 }}>compare</span> = generator window ·
            <span style={{ color: "#ef4444", fontWeight: 700, marginLeft: 6 }}>XOR</span> = bit being flipped ·
            <span style={{ color: "#10b981", fontWeight: 700, marginLeft: 6 }}>done</span> = remainder / CRC
          </span>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <MemoryCells
            values={frame.bits}
            states={frame.states}
            pointers={frame.pointer !== null ? { "i": frame.pointer } : {}}
            cellWidth={36}
          />
          {frame.remainder !== undefined && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
              <div
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "2px solid #10b981",
                  background: "rgba(16,185,129,0.08)",
                  fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  color: "#047857",
                }}
              >
                CRC remainder = {frame.remainder}
              </div>
              {frame.transmitted && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 8,
                    border: "2px solid var(--eng-primary)",
                    background: "var(--eng-primary-light)",
                    fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--eng-primary)",
                  }}
                >
                  Transmit = {frame.transmitted}
                </div>
              )}
            </div>
          )}
        </div>
      </AlgoCanvas>

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>CRC (Cyclic Redundancy Check):</strong> sender appends (len(gen)-1) zeros, performs XOR division, and sends data+remainder. Receiver re-divides; a zero remainder means no error.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Tab 3: Hamming(7,4) Code Visualizer                                */
/* ================================================================== */

function HammingTab() {
  const [dataBits, setDataBits] = useState([1, 0, 1, 1]);
  const [errorPos, setErrorPos] = useState<number | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [highlightGroup, setHighlightGroup] = useState<number | null>(null);

  // Hamming(7,4): positions 1-7 (0-indexed 0..6), parity at 1,2,4 (indexes 0,1,3)
  const computeHamming = useCallback((data: number[]) => {
    const code = new Array(7).fill(0);
    code[2] = data[0];
    code[4] = data[1];
    code[5] = data[2];
    code[6] = data[3];
    code[0] = code[2] ^ code[4] ^ code[6];
    code[1] = code[2] ^ code[5] ^ code[6];
    code[3] = code[4] ^ code[5] ^ code[6];
    return code;
  }, []);

  const hammingCode = computeHamming(dataBits);
  const displayCode = [...hammingCode];
  if (errorPos !== null && errorPos >= 0 && errorPos < 7) {
    displayCode[errorPos] = displayCode[errorPos] ^ 1;
  }

  const s1 = displayCode[0] ^ displayCode[2] ^ displayCode[4] ^ displayCode[6];
  const s2 = displayCode[1] ^ displayCode[2] ^ displayCode[5] ^ displayCode[6];
  const s4 = displayCode[3] ^ displayCode[4] ^ displayCode[5] ^ displayCode[6];
  const syndrome = s1 * 1 + s2 * 2 + s4 * 4;

  const checkGroups: Record<number, number[]> = {
    1: [0, 2, 4, 6],
    2: [1, 2, 5, 6],
    4: [3, 4, 5, 6],
  };

  const posLabels = ["P1", "P2", "D1", "P4", "D2", "D3", "D4"];
  const posColors = ["var(--eng-primary)", "var(--eng-warning)", "var(--eng-text)", "var(--eng-danger)", "var(--eng-text)", "var(--eng-text)", "var(--eng-text)"];
  const groupColors: Record<number, string> = { 1: "rgba(99,102,241,0.15)", 2: "rgba(245,158,11,0.15)", 4: "rgba(239,68,68,0.15)" };

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        Hamming(7,4) Code Visualizer
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        See how Hamming code encodes 4 data bits into 7 bits with 3 parity bits, detects and corrects single-bit errors.
      </p>

      <div className="card-eng" style={{ padding: 16, marginBottom: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
          Input Data Bits (4 bits)
        </h4>
        <div className="flex gap-3 items-center justify-center">
          {dataBits.map((bit, idx) => (
            <button
              key={idx}
              onClick={() => {
                const next = [...dataBits];
                next[idx] = next[idx] ^ 1;
                setDataBits(next);
                setErrorPos(null);
                setShowCorrection(false);
              }}
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                border: "2px solid var(--eng-border)",
                background: "var(--eng-surface)",
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--eng-text)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {bit}
            </button>
          ))}
        </div>
      </div>

      <div className="card-eng" style={{ padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          Hamming(7,4) Codeword
        </h4>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "0 0 16px" }}>
          Click a bit to inject an error. Hover over check group buttons to highlight covered positions.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {displayCode.map((bit, idx) => {
            const isError = idx === errorPos;
            const isParity = idx === 0 || idx === 1 || idx === 3;
            const isHighlighted = highlightGroup !== null && checkGroups[highlightGroup]?.includes(idx);
            const isSyndromeTarget = showCorrection && syndrome > 0 && idx === syndrome - 1;

            return (
              <div
                key={idx}
                onClick={() => {
                  setErrorPos(errorPos === idx ? null : idx);
                  setShowCorrection(false);
                }}
                style={{
                  width: 56,
                  height: 64,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 8,
                  border: `2px solid ${isSyndromeTarget ? "var(--eng-success)" : isError ? "var(--eng-danger)" : isParity ? posColors[idx] : "var(--eng-border)"}`,
                  background: isSyndromeTarget
                    ? "rgba(16,185,129,0.15)"
                    : isHighlighted
                      ? groupColors[highlightGroup!] ?? "var(--eng-surface)"
                      : isError
                        ? "rgba(239,68,68,0.1)"
                        : "var(--eng-surface)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform: isSyndromeTarget ? "scale(1.1)" : "scale(1)",
                  position: "relative",
                }}
              >
                <span style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "1.4rem", fontWeight: 700, color: isError ? "var(--eng-danger)" : "var(--eng-text)" }}>
                  {bit}
                </span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", color: isParity ? posColors[idx] : "var(--eng-text-muted)", fontWeight: isParity ? 700 : 400 }}>
                  {posLabels[idx]} (pos {idx + 1})
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2 justify-center" style={{ marginBottom: 16, flexWrap: "wrap" }}>
          {([1, 2, 4] as const).map((g) => (
            <button
              key={g}
              className="btn-eng-outline"
              style={{ fontSize: "0.75rem" }}
              onMouseEnter={() => setHighlightGroup(g)}
              onMouseLeave={() => setHighlightGroup(null)}
            >
              Check Group P{g} (positions: {checkGroups[g].map((i) => i + 1).join(",")})
            </button>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowCorrection(true)} className="btn-eng" style={{ fontSize: "0.85rem" }}>
            Detect &amp; Correct Error
          </button>
        </div>
      </div>

      {showCorrection && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16, borderLeft: `3px solid ${syndrome === 0 ? "var(--eng-success)" : "var(--eng-warning)"}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", margin: "0 0 2px" }}>Syndrome</p>
              <p style={{ fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "1.5rem", fontWeight: 700, color: syndrome === 0 ? "var(--eng-success)" : "var(--eng-warning)", margin: 0 }}>
                {s4}{s2}{s1} = {syndrome}
              </p>
            </div>
            <div>
              {syndrome === 0 ? (
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-success)", margin: 0, fontWeight: 600 }}>
                  No error detected! The codeword is valid.
                </p>
              ) : (
                <div>
                  <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-warning)", margin: "0 0 4px", fontWeight: 600 }}>
                    Error detected at position {syndrome}!
                  </p>
                  <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", margin: 0 }}>
                    Flip bit at position {syndrome} to correct: {displayCode[syndrome - 1]} → {displayCode[syndrome - 1] ^ 1}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>Hamming Code:</strong> Parity bits at positions that are powers of 2 (1, 2, 4). Each checks a specific group of positions.
        The syndrome (combined parity check results) directly gives the error position. Can detect and correct any single-bit error.
      </div>
    </div>
  );
}

/* ================================================================== */
/*  Quiz + Export                                                      */
/* ================================================================== */

const quiz: EngQuizQuestion[] = [
  {
    question: "CRC uses which mathematical operation for error detection?",
    options: ["Addition", "Multiplication", "XOR (modulo-2 division)", "Subtraction"],
    correctIndex: 2,
    explanation: "CRC performs modulo-2 division (XOR) of the data by a generator polynomial. The remainder is the CRC checksum.",
  },
  {
    question: "In Hamming(7,4) code, how many parity bits are added to 4 data bits?",
    options: ["1", "2", "3", "4"],
    correctIndex: 2,
    explanation: "Hamming(7,4) uses 3 parity bits (at positions 1, 2, 4) to protect 4 data bits, forming a 7-bit codeword.",
  },
  {
    question: "Simple (single-bit) parity can detect which types of errors?",
    options: ["All errors", "Only even number of bit errors", "Only odd number of bit errors", "Only burst errors"],
    correctIndex: 2,
    explanation: "Single-bit parity can only detect an odd number of errors. If an even number of bits flip, the parity remains unchanged.",
  },
  {
    question: "If the CRC generator polynomial is x³ + x + 1, what is its binary representation?",
    options: ["1011", "1101", "1001", "1111"],
    correctIndex: 0,
    explanation: "x³ + x + 1 = 1*x³ + 0*x² + 1*x¹ + 1*x⁰ = 1011 in binary.",
  },
  {
    question: "Hamming code can detect up to how many bit errors and correct how many?",
    options: ["Detect 1, correct 0", "Detect 2, correct 1", "Detect 3, correct 2", "Detect 1, correct 1"],
    correctIndex: 1,
    explanation: "Standard Hamming code can detect up to 2-bit errors and correct 1-bit errors. With SECDED (additional parity), it can detect 2 and correct 1.",
  },
];

const tabs: EngTabDef[] = [
  { id: "error-detection", label: "Error Detection", icon: <Shield className="w-4 h-4" />, content: <ErrorDetectionTab /> },
  { id: "crc", label: "CRC", icon: <Hash className="w-4 h-4" />, content: <CRCTab /> },
  { id: "hamming", label: "Hamming", icon: <Binary className="w-4 h-4" />, content: <HammingTab /> },
];

export default function CN_L2_FramingErrorActivity() {
  return (
    <EngineeringLessonShell
      title="Framing & Error Detection"
      level={2}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="ARQ Protocols"
      placementRelevance="Low"
    />
  );
}
