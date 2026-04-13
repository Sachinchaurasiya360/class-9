"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Shield, Lock, Unlock, Key, RefreshCw, ArrowRight, ArrowLeftRight } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ------------------------------------------------------------------ */
/*  Tab 1 — Symmetric Encryption                                       */
/* ------------------------------------------------------------------ */

function SymmetricTab() {
  const [plaintext, setPlaintext] = useState("HELLO");
  const [shift, setShift] = useState(3);
  const [animPhase, setAnimPhase] = useState<"idle" | "encrypting" | "done">("idle");
  const [morphProgress, setMorphProgress] = useState(0);
  const [showDecrypt, setShowDecrypt] = useState(false);
  const wheelRef = useRef<SVGGElement>(null);
  const [wheelAngle, setWheelAngle] = useState(0);

  const encrypt = useCallback(
    (char: string, s: number) => {
      const idx = ALPHABET.indexOf(char.toUpperCase());
      if (idx === -1) return char;
      return ALPHABET[(idx + s) % 26];
    },
    []
  );

  const ciphertext = plaintext
    .toUpperCase()
    .split("")
    .map((c) => encrypt(c, shift))
    .join("");

  const handleEncrypt = useCallback(() => {
    setShowDecrypt(false);
    setAnimPhase("encrypting");
    setMorphProgress(0);
    let frame = 0;
    const totalFrames = 30;
    const interval = setInterval(() => {
      frame++;
      setMorphProgress(frame / totalFrames);
      if (frame >= totalFrames) {
        clearInterval(interval);
        setAnimPhase("done");
      }
    }, 30);
  }, []);

  const handleDecrypt = useCallback(() => {
    setShowDecrypt(true);
  }, []);

  const handleReset = useCallback(() => {
    setAnimPhase("idle");
    setMorphProgress(0);
    setShowDecrypt(false);
  }, []);

  // Animate wheel rotation when shift changes
  useEffect(() => {
    setWheelAngle(shift * (360 / 26));
  }, [shift]);

  return (
    <div className="space-y-6">
      <div className="info-eng">
        <strong>Symmetric encryption</strong> uses the <em>same key</em> to both encrypt and decrypt.
        The Caesar Cipher shifts each letter by a fixed number of positions in the alphabet.
      </div>

      {/* Caesar Cipher Wheel SVG */}
      <div className="card-eng p-4">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          Caesar Cipher Wheel
        </h3>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 300 300" width="260" height="260" style={{ overflow: "visible" }}>
            {/* Outer ring — plain alphabet */}
            <circle cx="150" cy="150" r="130" fill="none" stroke="var(--eng-border)" strokeWidth="2" />
            <circle cx="150" cy="150" r="105" fill="none" stroke="var(--eng-border)" strokeWidth="1" strokeDasharray="2 4" />
            {ALPHABET.split("").map((char, i) => {
              const angle = (i * 360) / 26 - 90;
              const rad = (angle * Math.PI) / 180;
              const x = 150 + 118 * Math.cos(rad);
              const y = 150 + 118 * Math.sin(rad);
              return (
                <text
                  key={`outer-${i}`}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fontSize: "11px",
                    fontFamily: "var(--eng-font)",
                    fontWeight: 600,
                    fill: "var(--eng-text)",
                  }}
                >
                  {char}
                </text>
              );
            })}

            {/* Inner ring — shifted alphabet (rotates) */}
            <g
              ref={wheelRef}
              style={{
                transform: `rotate(${-wheelAngle}deg)`,
                transformOrigin: "150px 150px",
                transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              <circle cx="150" cy="150" r="88" fill="rgba(59,130,246,0.06)" stroke="var(--eng-primary)" strokeWidth="2" />
              {ALPHABET.split("").map((char, i) => {
                const angle = (i * 360) / 26 - 90;
                const rad = (angle * Math.PI) / 180;
                const x = 150 + 78 * Math.cos(rad);
                const y = 150 + 78 * Math.sin(rad);
                return (
                  <text
                    key={`inner-${i}`}
                    x={x}
                    y={y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--eng-font)",
                      fontWeight: 700,
                      fill: "var(--eng-primary)",
                    }}
                  >
                    {char}
                  </text>
                );
              })}
            </g>

            {/* Center label */}
            <circle cx="150" cy="150" r="40" fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth="1" />
            <text x="150" y="145" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>
              Shift
            </text>
            <text x="150" y="163" textAnchor="middle" style={{ fontSize: "18px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-primary)" }}>
              {shift}
            </text>
          </svg>
        </div>

        {/* Shift control */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginTop: 12 }}>
          <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>Key (shift):</span>
          <input
            type="range"
            min={1}
            max={25}
            value={shift}
            onChange={(e) => {
              setShift(Number(e.target.value));
              handleReset();
            }}
            style={{ width: 160, accentColor: "var(--eng-primary)" }}
          />
          <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
            {shift}
          </span>
        </div>
      </div>

      {/* Encryption visualizer */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          Encrypt a Message
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", display: "block", marginBottom: 4 }}>
              Plaintext:
            </label>
            <input
              type="text"
              value={plaintext}
              onChange={(e) => {
                setPlaintext(e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 12));
                handleReset();
              }}
              maxLength={12}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: 8,
                border: "1px solid var(--eng-border)",
                fontFamily: "monospace",
                fontSize: "1.2rem",
                letterSpacing: "0.15em",
                color: "var(--eng-text)",
                background: "var(--eng-surface)",
              }}
            />
          </div>

          {/* Character morph animation */}
          <div style={{ display: "flex", justifyContent: "center", gap: 4, flexWrap: "wrap", minHeight: 64 }}>
            {plaintext.split("").map((char, i) => {
              const encChar = encrypt(char, shift);
              const progress = animPhase === "idle" ? 0 : animPhase === "done" ? 1 : Math.min(1, Math.max(0, morphProgress * plaintext.length - i) / 1);
              const displayChar = progress >= 1 ? encChar : char;
              const bg = progress >= 1 ? "var(--eng-primary)" : progress > 0 ? "var(--eng-warning)" : "var(--eng-surface)";
              const color = progress >= 1 ? "#fff" : "var(--eng-text)";

              return (
                <div
                  key={i}
                  className="eng-fadeIn"
                  style={{
                    width: 40,
                    height: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    border: `2px solid ${progress > 0 ? "var(--eng-primary)" : "var(--eng-border)"}`,
                    background: bg,
                    color,
                    fontFamily: "monospace",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    transition: "all 0.3s ease",
                    transform: progress > 0 && progress < 1 ? "scale(1.1) rotateY(90deg)" : "scale(1) rotateY(0deg)",
                  }}
                >
                  {displayChar}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button className="btn-eng" onClick={handleEncrypt} disabled={animPhase !== "idle"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Lock className="w-4 h-4" /> Encrypt
            </button>
            {animPhase === "done" && !showDecrypt && (
              <button className="btn-eng-outline" onClick={handleDecrypt} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Unlock className="w-4 h-4" /> Decrypt
              </button>
            )}
            {(animPhase !== "idle") && (
              <button className="btn-eng-outline" onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            )}
          </div>

          {/* Result display */}
          {animPhase === "done" && (
            <div className="eng-fadeIn" style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>
                Ciphertext:
              </div>
              <div style={{
                fontFamily: "monospace",
                fontSize: "1.3rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "var(--eng-primary)",
                padding: "8px 16px",
                background: "var(--eng-primary-light)",
                borderRadius: 8,
                display: "inline-block",
              }}>
                {ciphertext}
              </div>
            </div>
          )}

          {showDecrypt && (
            <div className="eng-fadeIn" style={{ textAlign: "center" }}>
              <ArrowRight className="w-5 h-5 mx-auto" style={{ color: "var(--eng-success)", marginBottom: 4 }} />
              <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>
                Decrypted (same key, shift={shift}):
              </div>
              <div style={{
                fontFamily: "monospace",
                fontSize: "1.3rem",
                fontWeight: 700,
                letterSpacing: "0.15em",
                color: "var(--eng-success)",
                padding: "8px 16px",
                background: "rgba(16,185,129,0.1)",
                borderRadius: 8,
                display: "inline-block",
              }}>
                {plaintext}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="info-eng">
        <strong>Key Insight:</strong> In symmetric encryption (AES, DES, 3DES), both sender and receiver share the <em>same secret key</em>.
        It is fast but has the <strong>key distribution problem</strong> -- how do you safely share the key?
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Asymmetric Encryption                                      */
/* ------------------------------------------------------------------ */

function AsymmetricTab() {
  const [message, setMessage] = useState("SECRET");
  const [phase, setPhase] = useState<"idle" | "encrypting" | "encrypted" | "decrypting" | "decrypted">("idle");
  const [lockAnim, setLockAnim] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const handleEncrypt = useCallback(() => {
    cleanup();
    setPhase("encrypting");
    setLockAnim(0);
    let frame = 0;
    timerRef.current = setInterval(() => {
      frame++;
      setLockAnim(frame / 20);
      if (frame >= 20) {
        cleanup();
        setPhase("encrypted");
      }
    }, 40);
  }, [cleanup]);

  const handleDecrypt = useCallback(() => {
    cleanup();
    setPhase("decrypting");
    setLockAnim(1);
    let frame = 20;
    timerRef.current = setInterval(() => {
      frame--;
      setLockAnim(frame / 20);
      if (frame <= 0) {
        cleanup();
        setPhase("decrypted");
      }
    }, 40);
  }, [cleanup]);

  const handleReset = useCallback(() => {
    cleanup();
    setPhase("idle");
    setLockAnim(0);
  }, [cleanup]);

  // Scrambled version of message for "encrypted" display
  const scrambled = message
    .split("")
    .map((_, i) => String.fromCharCode(33 + ((message.charCodeAt(i) * 7 + 13) % 94)))
    .join("");

  return (
    <div className="space-y-6">
      <div className="info-eng">
        <strong>Asymmetric encryption</strong> uses a <em>key pair</em>: a <span style={{ color: "var(--eng-success)", fontWeight: 700 }}>public key</span> (shared openly) encrypts data, and only the matching <span style={{ color: "var(--eng-danger)", fontWeight: 700 }}>private key</span> (kept secret) can decrypt it.
      </div>

      {/* Key pair generation visual */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 16 }}>
          RSA Key Generation (Simplified)
        </h3>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 500 180" width="100%" style={{ maxWidth: 500 }}>
            {/* Step boxes */}
            {[
              { x: 10, label: "Pick two\nprimes p, q", detail: "p=61, q=53" },
              { x: 130, label: "Compute\nn = p * q", detail: "n = 3233" },
              { x: 250, label: "Compute\nphi(n)", detail: "phi = 3120" },
              { x: 370, label: "Choose e,\nfind d", detail: "e=17, d=2753" },
            ].map((step, i) => (
              <g key={i}>
                <rect
                  x={step.x}
                  y="20"
                  width="110"
                  height="60"
                  rx="8"
                  fill="var(--eng-surface)"
                  stroke="var(--eng-primary)"
                  strokeWidth="1.5"
                />
                <text x={step.x + 55} y="44" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>
                  {step.label.split("\n").map((line, j) => (
                    <tspan key={j} x={step.x + 55} dy={j === 0 ? 0 : 12}>{line}</tspan>
                  ))}
                </text>
                <text x={step.x + 55} y="70" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
                  {step.detail}
                </text>
                {i < 3 && (
                  <line x1={step.x + 110} y1="50" x2={step.x + 130} y2="50" stroke="var(--eng-primary)" strokeWidth="1.5" markerEnd="url(#arrowBlue)" />
                )}
              </g>
            ))}

            <defs>
              <marker id="arrowBlue" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-primary)" />
              </marker>
            </defs>

            {/* Output keys */}
            <rect x="80" y="110" width="140" height="50" rx="8" fill="rgba(16,185,129,0.1)" stroke="var(--eng-success)" strokeWidth="2" />
            <text x="150" y="130" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>
              Public Key
            </text>
            <text x="150" y="148" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
              (e=17, n=3233)
            </text>

            <rect x="280" y="110" width="140" height="50" rx="8" fill="rgba(239,68,68,0.1)" stroke="var(--eng-danger)" strokeWidth="2" />
            <text x="350" y="130" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>
              Private Key
            </text>
            <text x="350" y="148" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
              (d=2753, n=3233)
            </text>

            {/* Arrows from step 4 to keys */}
            <line x1="425" y1="80" x2="220" y2="110" stroke="var(--eng-success)" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="425" y1="80" x2="350" y2="110" stroke="var(--eng-danger)" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
        </div>
      </div>

      {/* Lock/Unlock animation */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 16 }}>
          Public Key Encrypts, Private Key Decrypts
        </h3>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <svg viewBox="0 0 460 200" width="100%" style={{ maxWidth: 460 }}>
            {/* Sender */}
            <rect x="10" y="50" width="100" height="100" rx="10" fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth="1.5" />
            <text x="60" y="90" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>Sender</text>
            <text x="60" y="108" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "monospace", fill: "var(--eng-text-muted)" }}>
              {phase === "idle" ? message : phase === "decrypted" ? message : scrambled}
            </text>

            {/* Lock icon in center */}
            <g style={{ transform: `translate(200px, 60px)` }}>
              {/* Lock body */}
              <rect x="0" y={30} width="60" height="40" rx="6" fill={lockAnim > 0.5 ? "var(--eng-danger)" : "var(--eng-success)"} style={{ transition: "fill 0.3s" }} />
              {/* Lock shackle */}
              <path
                d={lockAnim > 0.5
                  ? "M 12 30 L 12 18 A 18 18 0 0 1 48 18 L 48 30"
                  : "M 12 30 L 12 18 A 18 18 0 0 1 48 18 L 48 10"
                }
                fill="none"
                stroke={lockAnim > 0.5 ? "var(--eng-danger)" : "var(--eng-success)"}
                strokeWidth="5"
                strokeLinecap="round"
                style={{ transition: "all 0.5s ease" }}
              />
              {/* Keyhole */}
              <circle cx="30" cy="50" r="5" fill="white" />
              <rect x="28" y="50" width="4" height="10" rx="1" fill="white" />
              <text x="30" y="90" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-text)" }}>
                {phase === "idle" ? "Ready" : phase === "encrypting" ? "Locking..." : phase === "encrypted" ? "Locked" : phase === "decrypting" ? "Unlocking..." : "Unlocked"}
              </text>
            </g>

            {/* Receiver */}
            <rect x="350" y="50" width="100" height="100" rx="10" fill="var(--eng-surface)" stroke="var(--eng-border)" strokeWidth="1.5" />
            <text x="400" y="90" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>Receiver</text>
            <text x="400" y="108" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "monospace", fill: phase === "decrypted" ? "var(--eng-success)" : "var(--eng-text-muted)" }}>
              {phase === "decrypted" ? message : phase === "encrypted" || phase === "decrypting" ? scrambled : "---"}
            </text>

            {/* Arrows */}
            <line x1="110" y1="100" x2="195" y2="100" stroke="var(--eng-success)" strokeWidth="2" markerEnd="url(#arrowGreen)" strokeDasharray={phase === "encrypting" ? "6 4" : "0"}>
              {phase === "encrypting" && (
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.5s" repeatCount="indefinite" />
              )}
            </line>
            <line x1="265" y1="100" x2="345" y2="100" stroke="var(--eng-danger)" strokeWidth="2" markerEnd="url(#arrowRed)" strokeDasharray={phase === "decrypting" ? "6 4" : "0"}>
              {phase === "decrypting" && (
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="0.5s" repeatCount="indefinite" />
              )}
            </line>

            {/* Key labels */}
            <text x="155" y="85" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>
              Public Key
            </text>
            <text x="310" y="85" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>
              Private Key
            </text>

            <defs>
              <marker id="arrowGreen" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-success)" />
              </marker>
              <marker id="arrowRed" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--eng-danger)" />
              </marker>
            </defs>
          </svg>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          <button className="btn-eng" onClick={handleEncrypt} disabled={phase !== "idle"} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Lock className="w-4 h-4" /> Encrypt with Public Key
          </button>
          <button className="btn-eng-outline" onClick={handleDecrypt} disabled={phase !== "encrypted"} style={{ display: "flex", alignItems: "center", gap: 6, background: phase === "encrypted" ? "rgba(239,68,68,0.1)" : undefined }}>
            <Key className="w-4 h-4" /> Decrypt with Private Key
          </button>
          {phase !== "idle" && (
            <button className="btn-eng-outline" onClick={handleReset} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          )}
        </div>
      </div>

      <div className="info-eng">
        <strong>RSA</strong> is the most well-known asymmetric algorithm. Others include <strong>ECC</strong> (Elliptic Curve Cryptography) and <strong>Diffie-Hellman</strong> key exchange.
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Symmetric vs Asymmetric Comparison                         */
/* ------------------------------------------------------------------ */

function CompareTab() {
  const [showProblem, setShowProblem] = useState(false);
  const [hybridStep, setHybridStep] = useState(0);

  const comparisonData = [
    { feature: "Keys", symmetric: "One shared key", asymmetric: "Key pair (public + private)" },
    { feature: "Speed", symmetric: "Very fast", asymmetric: "Slower (100-1000x)" },
    { feature: "Key Distribution", symmetric: "Difficult (must share secretly)", asymmetric: "Easy (public key is open)" },
    { feature: "Use Case", symmetric: "Bulk data encryption", asymmetric: "Key exchange, digital signatures" },
    { feature: "Examples", symmetric: "AES, DES, 3DES, ChaCha20", asymmetric: "RSA, ECC, Diffie-Hellman" },
    { feature: "Key Size", symmetric: "128 / 256 bits", asymmetric: "2048 / 4096 bits" },
  ];

  return (
    <div className="space-y-6">
      <div className="info-eng">
        In practice, most systems use <strong>hybrid encryption</strong>: asymmetric crypto to exchange a symmetric key, then symmetric crypto for the actual data.
      </div>

      {/* Side-by-side comparison table */}
      <div className="card-eng" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--eng-font)", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--eng-surface)" }}>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid var(--eng-border)", color: "var(--eng-text-muted)", fontWeight: 600, fontSize: "0.75rem" }}>Feature</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid var(--eng-primary)", color: "var(--eng-primary)", fontWeight: 600, fontSize: "0.75rem" }}>Symmetric</th>
              <th style={{ padding: "10px 14px", textAlign: "left", borderBottom: "2px solid var(--eng-danger)", color: "var(--eng-danger)", fontWeight: 600, fontSize: "0.75rem" }}>Asymmetric</th>
            </tr>
          </thead>
          <tbody>
            {comparisonData.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? "transparent" : "var(--eng-surface)" }}>
                <td style={{ padding: "8px 14px", fontWeight: 600, color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)" }}>{row.feature}</td>
                <td style={{ padding: "8px 14px", color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)" }}>{row.symmetric}</td>
                <td style={{ padding: "8px 14px", color: "var(--eng-text)", borderBottom: "1px solid var(--eng-border)" }}>{row.asymmetric}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Distribution Problem visualization */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          The Key Distribution Problem
          <button className="btn-eng-outline" onClick={() => setShowProblem(!showProblem)} style={{ fontSize: "0.75rem", padding: "4px 12px" }}>
            {showProblem ? "Hide" : "Show"} Problem
          </button>
        </h3>

        {showProblem && (
          <div className="eng-fadeIn">
            <svg viewBox="0 0 460 200" width="100%" style={{ maxWidth: 460 }}>
              {/* Alice */}
              <rect x="10" y="60" width="90" height="70" rx="10" fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth="1.5" />
              <text x="55" y="90" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>Alice</text>
              <text x="55" y="108" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Has key K</text>

              {/* Insecure channel */}
              <line x1="100" y1="95" x2="250" y2="95" stroke="var(--eng-danger)" strokeWidth="2" strokeDasharray="6 4" />
              <text x="175" y="85" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-danger)" }}>Insecure Channel</text>
              <text x="175" y="115" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Eavesdropper can see key!</text>

              {/* Eve */}
              <rect x="150" y="130" width="70" height="50" rx="8" fill="rgba(239,68,68,0.1)" stroke="var(--eng-danger)" strokeWidth="1.5" />
              <text x="185" y="155" textAnchor="middle" style={{ fontSize: "10px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-danger)" }}>Eve</text>
              <text x="185" y="170" textAnchor="middle" style={{ fontSize: "7px", fontFamily: "var(--eng-font)", fill: "var(--eng-danger)" }}>Attacker</text>
              <line x1="185" y1="130" x2="185" y2="100" stroke="var(--eng-danger)" strokeWidth="1" strokeDasharray="3 3" />

              {/* Bob */}
              <rect x="250" y="60" width="90" height="70" rx="10" fill="var(--eng-surface)" stroke="var(--eng-primary)" strokeWidth="1.5" />
              <text x="295" y="90" textAnchor="middle" style={{ fontSize: "11px", fontFamily: "var(--eng-font)", fontWeight: 600, fill: "var(--eng-text)" }}>Bob</text>
              <text x="295" y="108" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-text-muted)" }}>Needs key K</text>

              {/* Solution arrow */}
              <text x="395" y="55" textAnchor="middle" style={{ fontSize: "9px", fontFamily: "var(--eng-font)", fontWeight: 700, fill: "var(--eng-success)" }}>Solution:</text>
              <text x="395" y="70" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)" }}>Use asymmetric</text>
              <text x="395" y="83" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)" }}>to exchange the</text>
              <text x="395" y="96" textAnchor="middle" style={{ fontSize: "8px", fontFamily: "var(--eng-font)", fill: "var(--eng-success)" }}>symmetric key!</text>
            </svg>
          </div>
        )}
      </div>

      {/* Hybrid encryption steps */}
      <div className="card-eng p-5">
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1rem", color: "var(--eng-text)", marginBottom: 12 }}>
          Hybrid Encryption (TLS uses this!)
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { step: 1, label: "Bob sends his public key to Alice", color: "var(--eng-success)" },
            { step: 2, label: "Alice generates a random symmetric key (session key)", color: "var(--eng-primary)" },
            { step: 3, label: "Alice encrypts session key with Bob's public key", color: "var(--eng-warning)" },
            { step: 4, label: "Bob decrypts session key with his private key", color: "var(--eng-danger)" },
            { step: 5, label: "Both use the symmetric session key for fast communication", color: "var(--eng-success)" },
          ].map((item) => (
            <button
              key={item.step}
              className="eng-fadeIn"
              onClick={() => setHybridStep(item.step)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 8,
                border: `1.5px solid ${hybridStep >= item.step ? item.color : "var(--eng-border)"}`,
                background: hybridStep >= item.step ? `${item.color}11` : "var(--eng-surface)",
                cursor: "pointer",
                textAlign: "left",
                fontFamily: "var(--eng-font)",
                transition: "all 0.3s ease",
              }}
            >
              <span style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.8rem",
                fontWeight: 700,
                background: hybridStep >= item.step ? item.color : "var(--eng-border)",
                color: "#fff",
                flexShrink: 0,
              }}>
                {item.step}
              </span>
              <span style={{
                fontSize: "0.85rem",
                color: hybridStep >= item.step ? "var(--eng-text)" : "var(--eng-text-muted)",
                fontWeight: hybridStep === item.step ? 600 : 400,
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 12 }}>
          <button className="btn-eng-outline" onClick={() => setHybridStep(0)} style={{ fontSize: "0.8rem" }}>
            <RefreshCw className="w-3 h-3 inline mr-1" /> Reset Steps
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                                */
/* ------------------------------------------------------------------ */

const quiz: EngQuizQuestion[] = [
  {
    question: "In symmetric encryption, how many keys are used?",
    options: ["One shared key", "Two keys (public + private)", "Three keys", "No keys"],
    correctIndex: 0,
    explanation: "Symmetric encryption uses a single shared key for both encryption and decryption.",
  },
  {
    question: "What is the main advantage of asymmetric over symmetric encryption?",
    options: ["It is faster", "Solves the key distribution problem", "Uses smaller keys", "It is simpler to implement"],
    correctIndex: 1,
    explanation: "Asymmetric encryption solves the key distribution problem because the public key can be shared openly.",
  },
  {
    question: "Which of these is a symmetric encryption algorithm?",
    options: ["RSA", "AES", "ECC", "Diffie-Hellman"],
    correctIndex: 1,
    explanation: "AES (Advanced Encryption Standard) is a symmetric encryption algorithm. RSA, ECC, and Diffie-Hellman are asymmetric.",
  },
  {
    question: "In RSA, which key is used to encrypt a message to someone?",
    options: ["Your own private key", "The receiver's public key", "The receiver's private key", "A shared secret key"],
    correctIndex: 1,
    explanation: "You encrypt with the receiver's public key so only their private key can decrypt it.",
  },
  {
    question: "Why do most real-world systems use hybrid encryption?",
    options: [
      "Symmetric is too insecure",
      "Asymmetric is too fast",
      "Asymmetric for key exchange + symmetric for data (speed + security)",
      "It is required by law",
    ],
    correctIndex: 2,
    explanation: "Hybrid encryption uses asymmetric crypto for secure key exchange and symmetric crypto for fast bulk data encryption.",
  },
];

/* ------------------------------------------------------------------ */
/*  Tabs + Export                                                       */
/* ------------------------------------------------------------------ */

const tabs: EngTabDef[] = [
  {
    id: "symmetric",
    label: "Symmetric",
    icon: <Key className="w-4 h-4" />,
    content: <SymmetricTab />,
  },
  {
    id: "asymmetric",
    label: "Asymmetric",
    icon: <Lock className="w-4 h-4" />,
    content: <AsymmetricTab />,
  },
  {
    id: "compare",
    label: "Compare",
    icon: <ArrowLeftRight className="w-4 h-4" />,
    content: <CompareTab />,
  },
];

export default function CN_L6_CryptographyActivity() {
  return (
    <EngineeringLessonShell
      title="Cryptography Basics"
      level={6}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      nextLessonHint="TLS/SSL -- Secure Communication"
      gateRelevance="2-3 marks"
      placementRelevance="Medium"
    />
  );
}
