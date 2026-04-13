"use client";

import { useState, useEffect, useCallback } from "react";
import { Shield, Binary, Hash, CheckCircle2, XCircle, RotateCcw } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Tab 1: Error Detection - Parity Bit Demo                          */
/* ------------------------------------------------------------------ */

function ErrorDetectionTab() {
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1]);
  const [parityType, setParityType] = useState<"even" | "odd">("even");
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);
  const [showCheck, setShowCheck] = useState(false);
  const [animatingBit, setAnimatingBit] = useState<number | null>(null);

  const onesCount = bits.reduce((a, b) => a + b, 0);
  const parityBit = parityType === "even" ? onesCount % 2 : (onesCount + 1) % 2;
  const fullWord = [...bits, parityBit];

  const checkOnes = fullWord.reduce((a, b) => a + b, 0);
  const isValid = parityType === "even" ? checkOnes % 2 === 0 : checkOnes % 2 === 1;

  const handleFlipBit = useCallback((idx: number) => {
    setAnimatingBit(idx);
    setTimeout(() => setAnimatingBit(null), 400);

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
      <div className="flex gap-2" style={{ marginBottom: 20 }}>
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
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Binary stream visualization */}
      <div className="card-eng" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, flexWrap: "wrap" }}>
          {fullWord.map((bit, idx) => {
            const isParityBit = idx === fullWord.length - 1;
            const isFlipped = idx === flippedIdx;
            const isAnimating = idx === animatingBit;

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
                  transform: isAnimating ? "scale(1.2) rotateY(180deg)" : "scale(1) rotateY(0deg)",
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
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
        <div style={{ display: "flex", justifyContent: "center", gap: 24, marginTop: 16 }}>
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

/* ------------------------------------------------------------------ */
/*  Tab 2: CRC Polynomial Division Animation                          */
/* ------------------------------------------------------------------ */

function CRCTab() {
  const [dataInput, setDataInput] = useState("1101011");
  const [generatorInput, setGeneratorInput] = useState("1011");
  const [steps, setSteps] = useState<{ dividend: string; divisor: string; result: string; position: number }[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [remainder, setRemainder] = useState("");
  const [transmitted, setTransmitted] = useState("");
  const [isComputing, setIsComputing] = useState(false);

  const computeCRC = useCallback(() => {
    const data = dataInput.replace(/[^01]/g, "");
    const gen = generatorInput.replace(/[^01]/g, "");
    if (data.length < 2 || gen.length < 2) return;

    const paddedData = data + "0".repeat(gen.length - 1);
    const allSteps: { dividend: string; divisor: string; result: string; position: number }[] = [];

    let working = paddedData.split("").map(Number);
    const genBits = gen.split("").map(Number);

    for (let i = 0; i <= working.length - genBits.length; i++) {
      if (working[i] === 0) continue;

      const dividendStr = working.slice(i, i + genBits.length).join("");
      const resultBits: number[] = [];

      for (let j = 0; j < genBits.length; j++) {
        resultBits.push(working[i + j] ^ genBits[j]);
        working[i + j] = working[i + j] ^ genBits[j];
      }

      allSteps.push({
        dividend: dividendStr,
        divisor: gen,
        result: resultBits.join(""),
        position: i,
      });
    }

    const rem = working.slice(working.length - (gen.length - 1)).join("");
    const tx = data + rem;

    setSteps(allSteps);
    setRemainder(rem);
    setTransmitted(tx);
    setCurrentStep(-1);
    setIsComputing(true);

    // Animate steps
    allSteps.forEach((_, idx) => {
      setTimeout(() => setCurrentStep(idx), (idx + 1) * 800);
    });
  }, [dataInput, generatorInput]);

  return (
    <div>
      <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.15rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
        CRC Polynomial Division
      </h3>
      <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-text-muted)", margin: "0 0 16px", lineHeight: 1.6 }}>
        Enter a data word and generator polynomial to see CRC computation step by step with XOR operations.
      </p>

      {/* Input */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 12, marginBottom: 20 }}>
        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Data (binary)
          </label>
          <input
            type="text"
            value={dataInput}
            onChange={(e) => { setDataInput(e.target.value); setIsComputing(false); }}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: "1rem",
              border: "1px solid var(--eng-border)",
              borderRadius: 6,
              background: "var(--eng-surface)",
              color: "var(--eng-text)",
            }}
            placeholder="1101011"
          />
        </div>
        <div>
          <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
            Generator (binary)
          </label>
          <input
            type="text"
            value={generatorInput}
            onChange={(e) => { setGeneratorInput(e.target.value); setIsComputing(false); }}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontFamily: "monospace",
              fontSize: "1rem",
              border: "1px solid var(--eng-border)",
              borderRadius: 6,
              background: "var(--eng-surface)",
              color: "var(--eng-text)",
            }}
            placeholder="1011"
          />
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button onClick={computeCRC} className="btn-eng" style={{ fontSize: "0.85rem" }}>
            Compute CRC
          </button>
        </div>
      </div>

      {isComputing && (
        <div className="eng-fadeIn">
          {/* Step-by-step XOR visualization */}
          <div className="card-eng" style={{ padding: 20, marginBottom: 16, overflowX: "auto" }}>
            <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 12px" }}>
              XOR Division Steps
            </h4>

            <div style={{ fontFamily: "monospace", fontSize: "0.95rem", lineHeight: 2.2 }}>
              {/* Show padded data */}
              <div style={{ color: "var(--eng-text)", marginBottom: 4 }}>
                <span style={{ color: "var(--eng-primary)", fontWeight: 700 }}>{dataInput}</span>
                <span style={{ color: "var(--eng-danger)" }}>{"0".repeat(generatorInput.length - 1)}</span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", marginLeft: 12 }}>
                  (data + {generatorInput.length - 1} zeros)
                </span>
              </div>

              {/* Division steps */}
              {steps.map((step, idx) => {
                const visible = idx <= currentStep;
                return (
                  <div
                    key={idx}
                    className={visible ? "eng-fadeIn" : ""}
                    style={{
                      opacity: visible ? 1 : 0.15,
                      transition: "opacity 0.5s ease",
                      borderLeft: idx === currentStep ? "3px solid var(--eng-primary)" : "3px solid transparent",
                      paddingLeft: 8,
                      marginBottom: 4,
                    }}
                  >
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: step.position * 9.6, display: "inline-block" }} />
                      <span>
                        {step.dividend.split("").map((b, i) => (
                          <span
                            key={i}
                            style={{
                              color: b === "1" ? "var(--eng-primary)" : "var(--eng-text-muted)",
                              fontWeight: b === "1" ? 700 : 400,
                            }}
                          >
                            {b}
                          </span>
                        ))}
                      </span>
                      <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)", alignSelf: "center" }}>
                        XOR {step.divisor}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: step.position * 9.6, display: "inline-block" }} />
                      <span style={{ borderBottom: "1px solid var(--eng-border)", display: "inline-block" }}>
                        {step.divisor.split("").map((b, i) => (
                          <span key={i} style={{ color: "var(--eng-danger)", fontWeight: 600 }}>{b}</span>
                        ))}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span style={{ width: step.position * 9.6, display: "inline-block" }} />
                      <span>
                        {step.result.split("").map((b, i) => (
                          <span key={i} style={{ color: b === "1" ? "var(--eng-success)" : "var(--eng-text-muted)" }}>{b}</span>
                        ))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Result */}
          {currentStep >= steps.length - 1 && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card-eng eng-fadeIn" style={{ padding: 16, borderLeft: "3px solid var(--eng-primary)" }}>
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "0 0 4px" }}>CRC Remainder</p>
                <p style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: "var(--eng-primary)", margin: 0 }}>
                  {remainder}
                </p>
              </div>
              <div className="card-eng eng-fadeIn" style={{ padding: 16, borderLeft: "3px solid var(--eng-success)" }}>
                <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "0 0 4px" }}>Transmitted Word</p>
                <p style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: "var(--eng-success)", margin: 0 }}>
                  <span>{dataInput}</span>
                  <span style={{ color: "var(--eng-danger)" }}>{remainder}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="info-eng" style={{ fontSize: "0.85rem", marginTop: 16 }}>
        <strong>CRC (Cyclic Redundancy Check):</strong> The sender appends (generator length - 1) zeros to data, divides by the generator using XOR, and appends the remainder. The receiver divides the received word by the same generator - a zero remainder means no error.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3: Hamming Code Visualizer                                    */
/* ------------------------------------------------------------------ */

function HammingTab() {
  const [dataBits, setDataBits] = useState([1, 0, 1, 1]);
  const [errorPos, setErrorPos] = useState<number | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [highlightGroup, setHighlightGroup] = useState<number | null>(null);

  // Hamming(7,4): positions 1-7, parity at 1,2,4
  const computeHamming = useCallback((data: number[]) => {
    const code = new Array(7).fill(0);
    // Data bits at positions 3,5,6,7 (1-indexed)
    code[2] = data[0]; // pos 3
    code[4] = data[1]; // pos 5
    code[5] = data[2]; // pos 6
    code[6] = data[3]; // pos 7

    // Parity bits
    code[0] = code[2] ^ code[4] ^ code[6]; // p1: covers 1,3,5,7
    code[1] = code[2] ^ code[5] ^ code[6]; // p2: covers 2,3,6,7
    code[3] = code[4] ^ code[5] ^ code[6]; // p4: covers 4,5,6,7

    return code;
  }, []);

  const hammingCode = computeHamming(dataBits);
  const displayCode = [...hammingCode];

  // Inject error
  if (errorPos !== null && errorPos >= 0 && errorPos < 7) {
    displayCode[errorPos] = displayCode[errorPos] ^ 1;
  }

  // Syndrome calculation
  const s1 = displayCode[0] ^ displayCode[2] ^ displayCode[4] ^ displayCode[6];
  const s2 = displayCode[1] ^ displayCode[2] ^ displayCode[5] ^ displayCode[6];
  const s4 = displayCode[3] ^ displayCode[4] ^ displayCode[5] ^ displayCode[6];
  const syndrome = s1 * 1 + s2 * 2 + s4 * 4;

  // Check groups (1-indexed positions covered by each parity bit)
  const checkGroups: Record<number, number[]> = {
    1: [0, 2, 4, 6], // p1: positions 1,3,5,7
    2: [1, 2, 5, 6], // p2: positions 2,3,6,7
    4: [3, 4, 5, 6], // p4: positions 4,5,6,7
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

      {/* Data bit input */}
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
                fontFamily: "monospace",
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

      {/* Hamming code display */}
      <div className="card-eng" style={{ padding: 20, marginBottom: 16 }}>
        <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "0.9rem", color: "var(--eng-text)", margin: "0 0 4px" }}>
          Hamming(7,4) Codeword
        </h4>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.75rem", color: "var(--eng-text-muted)", margin: "0 0 16px" }}>
          Click a bit to inject an error. Hover over check group buttons to highlight covered positions.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 20 }}>
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
                <span style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: isError ? "var(--eng-danger)" : "var(--eng-text)" }}>
                  {bit}
                </span>
                <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.55rem", color: isParity ? posColors[idx] : "var(--eng-text-muted)", fontWeight: isParity ? 700 : 400 }}>
                  {posLabels[idx]} (pos {idx + 1})
                </span>
              </div>
            );
          })}
        </div>

        {/* Check group buttons */}
        <div className="flex gap-2 justify-center" style={{ marginBottom: 16 }}>
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

        {/* Detect & Correct */}
        <div style={{ textAlign: "center" }}>
          <button onClick={() => setShowCorrection(true)} className="btn-eng" style={{ fontSize: "0.85rem" }}>
            Detect &amp; Correct Error
          </button>
        </div>
      </div>

      {/* Syndrome result */}
      {showCorrection && (
        <div className="card-eng eng-fadeIn" style={{ padding: 16, borderLeft: `3px solid ${syndrome === 0 ? "var(--eng-success)" : "var(--eng-warning)"}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.7rem", color: "var(--eng-text-muted)", margin: "0 0 2px" }}>Syndrome</p>
              <p style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: syndrome === 0 ? "var(--eng-success)" : "var(--eng-warning)", margin: 0 }}>
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

/* ------------------------------------------------------------------ */
/*  Quiz Questions                                                     */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Tabs Definition                                                    */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "error-detection",
    label: "Error Detection",
    icon: <Shield className="w-4 h-4" />,
    content: <ErrorDetectionTab />,
  },
  {
    id: "crc",
    label: "CRC",
    icon: <Hash className="w-4 h-4" />,
    content: <CRCTab />,
  },
  {
    id: "hamming",
    label: "Hamming",
    icon: <Binary className="w-4 h-4" />,
    content: <HammingTab />,
  },
];

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function CN_L2_FramingErrorActivity() {
  return (
    <EngineeringLessonShell
      title="Framing & Error Detection"
      level={2}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="ARQ Protocols"
      gateRelevance="3-4 marks"
      placementRelevance="Low"
    />
  );
}
