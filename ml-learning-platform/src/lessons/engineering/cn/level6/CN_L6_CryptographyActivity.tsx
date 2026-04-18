"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Shield, Lock, Unlock, Key, RefreshCw, ArrowRight, ArrowLeftRight, Info } from "lucide-react";
import EngineeringLessonShell from "@/components/engineering/EngineeringLessonShell";
import type { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas,
  PseudocodePanel,
  VariablesPanel,
  InputEditor,
  useStepPlayer,
} from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

/* ------------------------------------------------------------------ */
/*  Tab 1 - Symmetric Encryption                                       */
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
            {/* Outer ring - plain alphabet */}
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

            {/* Inner ring - shifted alphabet (rotates) */}
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
/*  Tab 2 - Asymmetric Encryption                                      */
/* ------------------------------------------------------------------ */

/* ---------- RSA helpers ---------- */

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

function gcd(a: number, b: number): number {
  while (b !== 0) { [a, b] = [b, a % b]; }
  return a;
}

function modInverse(e: number, phi: number): number {
  // Extended Euclid
  let [oldR, r] = [e, phi];
  let [oldS, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(oldR / r);
    [oldR, r] = [r, oldR - q * r];
    [oldS, s] = [s, oldS - q * s];
  }
  return ((oldS % phi) + phi) % phi;
}

function modPow(base: number, exp: number, mod: number): number {
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp & 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

/* ---------- RSA Frame Builder ---------- */

interface RSAFrame {
  line: number;
  vars: Record<string, string | number | boolean | undefined>;
  message: string;
  stage: "keygen" | "encrypt" | "decrypt" | "done";
  p: number;
  q: number;
  n: number;
  phi: number;
  e: number;
  d: number;
  M: number | null;
  C: number | null;
  recovered: number | null;
  flashKeys?: string[];
}

const RSA_PSEUDO = [
  "// KEY GENERATION",
  "pick primes p, q",
  "n   = p * q",
  "phi = (p-1) * (q-1)",
  "choose e with 1 < e < phi, gcd(e, phi) = 1",
  "d   = e^(-1) mod phi     // modular inverse",
  "publicKey  = (e, n)      // share openly",
  "privateKey = (d, n)      // keep secret",
  "// ENCRYPT  (with public key)",
  "C = M^e mod n",
  "// DECRYPT  (with private key)",
  "M = C^d mod n",
];

function buildRSAFrames(pIn: number, qIn: number, eIn: number, msg: number): RSAFrame[] {
  const frames: RSAFrame[] = [];

  // Validate inputs; fall back to sensible defaults for a stable demo
  const p = isPrime(pIn) && pIn > 1 ? pIn : 61;
  const q = isPrime(qIn) && qIn > 1 && qIn !== pIn ? qIn : 53;
  const n = p * q;
  const phi = (p - 1) * (q - 1);

  // Pick e: must be coprime with phi, 1 < e < phi
  let e = eIn;
  if (!(e > 1 && e < phi && gcd(e, phi) === 1)) {
    // Try small values
    const candidates = [17, 3, 5, 7, 11, 13, 23, 29];
    e = candidates.find((c) => c < phi && gcd(c, phi) === 1) ?? 3;
  }
  const d = modInverse(e, phi);

  const M = msg % n; // must be < n

  // Stage 0: pick p, q
  frames.push({
    line: 1,
    vars: { p, q },
    message: `Start RSA key generation. Pick two distinct primes: p=${p}, q=${q}. In real RSA these are ~2048-bit primes; we use small ones so the math fits on screen.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["p", "q"],
  });

  // Stage 1: compute n
  frames.push({
    line: 2,
    vars: { p, q, "n = p*q": `${p}*${q} = ${n}` },
    message: `Compute n = p * q = ${p} * ${q} = ${n}. This n is the modulus. Both public and private keys use it.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["n = p*q"],
  });

  // Stage 2: compute phi
  frames.push({
    line: 3,
    vars: { phi: `(${p}-1)*(${q}-1) = ${phi}` },
    message: `Compute Euler's totient phi(n) = (p-1)*(q-1) = ${p - 1}*${q - 1} = ${phi}. Factoring n to find phi is what attackers cannot do efficiently.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["phi"],
  });

  // Stage 3: choose e
  frames.push({
    line: 4,
    vars: { e, "gcd(e, phi)": gcd(e, phi) },
    message: `Pick e=${e}. Requirement: 1 < e < phi and gcd(e, phi)=1 so that e is invertible mod phi. Common choice is 65537 in real life.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["e"],
  });

  // Stage 4: compute d
  frames.push({
    line: 5,
    vars: { d, check: `${e}*${d} mod ${phi} = ${(e * d) % phi}` },
    message: `Compute d = e^(-1) mod phi = ${d}. This is the modular inverse: e*d ≡ 1 (mod phi). The Extended Euclidean algorithm finds it.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["d"],
  });

  // Stage 5: keys announced
  frames.push({
    line: 6,
    vars: { publicKey: `(e=${e}, n=${n})`, privateKey: `(d=${d}, n=${n})` },
    message: `Publish the public key (${e}, ${n}). Keep the private key (${d}, ${n}) secret. Discard p, q, phi.`,
    stage: "keygen",
    p, q, n, phi, e, d, M: null, C: null, recovered: null,
    flashKeys: ["publicKey", "privateKey"],
  });

  // Stage 6: encryption
  const C = modPow(M, e, n);
  frames.push({
    line: 9,
    vars: { M, e, n, formula: `${M}^${e} mod ${n}` },
    message: `Encrypt: plaintext M=${M}. Using the public key, compute C = M^e mod n.`,
    stage: "encrypt",
    p, q, n, phi, e, d, M, C: null, recovered: null,
    flashKeys: ["M", "formula"],
  });

  frames.push({
    line: 9,
    vars: { "ciphertext C": C },
    message: `C = ${M}^${e} mod ${n} = ${C}. This is the ciphertext. Anyone with the public key can encrypt; only the holder of d can decrypt.`,
    stage: "encrypt",
    p, q, n, phi, e, d, M, C, recovered: null,
    flashKeys: ["ciphertext C"],
  });

  // Stage 7: decryption
  const recovered = modPow(C, d, n);
  frames.push({
    line: 11,
    vars: { C, d, n, formula: `${C}^${d} mod ${n}` },
    message: `Decrypt: Alice uses her private key (d=${d}, n=${n}) to compute M = C^d mod n.`,
    stage: "decrypt",
    p, q, n, phi, e, d, M, C, recovered: null,
    flashKeys: ["C", "d"],
  });

  frames.push({
    line: 11,
    vars: { recovered, match: recovered === M ? "yes" : "no" },
    message: `M = ${C}^${d} mod ${n} = ${recovered}. ${recovered === M ? `Matches the original plaintext M=${M}. Success!` : `Something went wrong.`} The math works because of Euler's theorem.`,
    stage: "done",
    p, q, n, phi, e, d, M, C, recovered,
    flashKeys: ["recovered"],
  });

  return frames;
}

/* ---------- RSA Visualization ---------- */

function RSAVisualization({ frame }: { frame: RSAFrame }) {
  const stageColor = frame.stage === "keygen"
    ? "var(--eng-primary)"
    : frame.stage === "encrypt"
      ? "#f59e0b"
      : frame.stage === "decrypt"
        ? "var(--eng-danger)"
        : "var(--eng-success)";

  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--eng-radius)",
        background: "var(--eng-surface)",
        border: "1px solid var(--eng-border)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {/* Stage banner */}
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          background: `${stageColor}15`,
          border: `1px solid ${stageColor}`,
          fontFamily: "var(--eng-font)",
          fontSize: "0.82rem",
          fontWeight: 700,
          color: stageColor,
          textAlign: "center",
        }}
      >
        {frame.stage === "keygen" && "Stage: Key Generation"}
        {frame.stage === "encrypt" && "Stage: Encrypt with Public Key"}
        {frame.stage === "decrypt" && "Stage: Decrypt with Private Key"}
        {frame.stage === "done" && "Stage: Recovered Plaintext"}
      </div>

      {/* Key cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "rgba(16,185,129,0.08)",
            border: "2px solid var(--eng-success)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Unlock className="w-4 h-4" style={{ color: "var(--eng-success)" }} />
            <span style={{ fontFamily: "var(--eng-font)", fontWeight: 700, color: "var(--eng-success)", fontSize: "0.82rem" }}>
              Public Key (shared)
            </span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--eng-text)" }}>
            (e = {frame.e}, n = {frame.n})
          </div>
        </div>
        <div
          style={{
            padding: 12,
            borderRadius: 8,
            background: "rgba(239,68,68,0.08)",
            border: "2px solid var(--eng-danger)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Key className="w-4 h-4" style={{ color: "var(--eng-danger)" }} />
            <span style={{ fontFamily: "var(--eng-font)", fontWeight: 700, color: "var(--eng-danger)", fontSize: "0.82rem" }}>
              Private Key (secret)
            </span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--eng-text)" }}>
            (d = {frame.stage === "keygen" && frame.d === 0 ? "?" : frame.d}, n = {frame.n})
          </div>
        </div>
      </div>

      {/* Keygen math breakdown */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8 }}>
        <StatTile label="p" value={frame.p} active={frame.stage === "keygen"} />
        <StatTile label="q" value={frame.q} active={frame.stage === "keygen"} />
        <StatTile label="n = p·q" value={frame.n} active={frame.stage === "keygen"} />
        <StatTile label="φ(n)" value={frame.phi} active={frame.stage === "keygen"} />
        <StatTile label="e" value={frame.e} active={frame.stage !== "done"} />
        <StatTile label="d = e⁻¹ mod φ" value={frame.d} active={frame.stage === "decrypt" || frame.stage === "done"} />
      </div>

      {/* Message pipeline */}
      <div
        style={{
          padding: 14,
          borderRadius: 8,
          background: "var(--eng-bg)",
          border: "1px solid var(--eng-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          {/* Plaintext */}
          <MsgBox
            label="Plaintext M"
            value={frame.M !== null ? String(frame.M) : "?"}
            color="var(--eng-primary)"
            active={frame.stage === "encrypt" || frame.stage === "done"}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowRight className="w-4 h-4" style={{ color: stageColor }} />
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
              M^e mod n
            </span>
            <ArrowRight className="w-4 h-4" style={{ color: stageColor }} />
          </div>
          {/* Ciphertext */}
          <MsgBox
            label="Ciphertext C"
            value={frame.C !== null ? String(frame.C) : "?"}
            color="#f59e0b"
            active={frame.stage !== "keygen" && frame.C !== null}
          />
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <ArrowRight className="w-4 h-4" style={{ color: stageColor }} />
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--eng-text-muted)" }}>
              C^d mod n
            </span>
            <ArrowRight className="w-4 h-4" style={{ color: stageColor }} />
          </div>
          {/* Recovered */}
          <MsgBox
            label="Recovered M'"
            value={frame.recovered !== null ? String(frame.recovered) : "?"}
            color="var(--eng-success)"
            active={frame.stage === "done"}
          />
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, value, active }: { label: string; value: number; active: boolean }) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 6,
        background: active ? "rgba(59,130,246,0.08)" : "var(--eng-bg)",
        border: `1px solid ${active ? "var(--eng-primary)" : "var(--eng-border)"}`,
        transition: "all 0.25s ease",
      }}
    >
      <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 700, color: active ? "var(--eng-primary)" : "var(--eng-text)" }}>
        {value}
      </div>
    </div>
  );
}

function MsgBox({ label, value, color, active }: { label: string; value: string; color: string; active: boolean }) {
  return (
    <div
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        background: active ? `${color}14` : "var(--eng-surface)",
        border: `2px solid ${active ? color : "var(--eng-border)"}`,
        minWidth: 90,
        textAlign: "center",
        opacity: active ? 1 : 0.55,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ fontFamily: "var(--eng-font)", fontSize: "0.65rem", color: "var(--eng-text-muted)", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: active ? color : "var(--eng-text-muted)" }}>
        {value}
      </div>
    </div>
  );
}

function parseRSAInput(raw: string): { p: number; q: number; e: number; M: number } {
  const m = raw.trim().match(/p\s*=\s*(\d+)\s*,\s*q\s*=\s*(\d+)\s*,\s*e\s*=\s*(\d+)\s*,\s*M\s*=\s*(\d+)/i);
  if (m) return { p: Number(m[1]), q: Number(m[2]), e: Number(m[3]), M: Number(m[4]) };
  return { p: 61, q: 53, e: 17, M: 65 };
}

function AsymmetricTab() {
  const [raw, setRaw] = useState("p=61, q=53, e=17, M=65");
  const parsed = useMemo(() => parseRSAInput(raw), [raw]);
  const frames = useMemo(() => buildRSAFrames(parsed.p, parsed.q, parsed.e, parsed.M), [parsed]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <div className="eng-fadeIn" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="info-eng" style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
        <Info className="w-4 h-4 shrink-0" style={{ marginTop: 2, color: "var(--eng-primary)" }} />
        <span>
          Full RSA walkthrough with real modular arithmetic. Pick two primes p, q, a public exponent e, and a message M. Watch key generation, then encryption and decryption.
        </span>
      </div>

      <AlgoCanvas
        title={`RSA: p=${parsed.p}, q=${parsed.q}, e=${parsed.e}, M=${parsed.M}`}
        player={player}
        input={
          <InputEditor
            label="p, q, e, M"
            value={raw}
            onApply={setRaw}
            presets={[
              { label: "classic", value: "p=61, q=53, e=17, M=65" },
              { label: "small", value: "p=3, q=11, e=3, M=4" },
              { label: "medium", value: "p=17, q=23, e=7, M=100" },
              { label: "another", value: "p=13, q=31, e=11, M=50" },
            ]}
            placeholder="p=61, q=53, e=17, M=65"
            helper="Format: p=<prime>, q=<prime>, e=<coprime with phi>, M=<msg < n>"
          />
        }
        pseudocode={<PseudocodePanel lines={RSA_PSEUDO} activeLine={frame.line} />}
        variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKeys} />}
        status={frame.message}
        legend={
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Swatch color="var(--eng-success)" label="Public key" />
            <Swatch color="var(--eng-danger)" label="Private key" />
            <Swatch color="#f59e0b" label="Ciphertext" />
          </div>
        }
      >
        <RSAVisualization frame={frame} />
      </AlgoCanvas>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "var(--eng-font)", fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Symmetric vs Asymmetric Comparison                         */
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
      placementRelevance="Medium"
    />
  );
}
