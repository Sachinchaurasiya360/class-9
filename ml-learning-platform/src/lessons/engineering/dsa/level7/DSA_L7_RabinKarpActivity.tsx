"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, MemoryCells,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Rabin-Karp with rolling hash                                       */
/* ------------------------------------------------------------------ */

const BASE = 31;
const MOD = 1009;

function charVal(c: string): number {
  return c.toUpperCase().charCodeAt(0) - 64; // A=1, B=2, ... simpler hashing
}

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  windowStart: number;      // start index of window in text
  windowHash: number;
  patternHash: number;
  phase: "init" | "slide" | "check" | "match" | "spurious" | "done";
  highlightKey?: string;
  found: number[];
  spurious: number[];       // positions where hash matched but chars didn't
}

const PSEUDO = [
  "# Rabin-Karp",
  "function rabinKarp(t, p):",
  "  m ← |p|; n ← |t|",
  "  patHash ← hash(p)",
  "  winHash ← hash(t[0..m-1])",
  "  for s from 0 to n-m:",
  "    if winHash = patHash:",
  "      if t[s..s+m-1] = p: report s",
  "      else: spurious hit",
  "    if s < n-m:",
  "      winHash ← roll(winHash, t[s], t[s+m])",
];

function initialHash(s: string, m: number): number {
  let h = 0;
  for (let i = 0; i < m; i++) {
    h = (h * BASE + charVal(s[i])) % MOD;
  }
  return h < 0 ? h + MOD : h;
}

// roll: remove leftmost, add new char
function rollHash(prevHash: number, outChar: string, inChar: string, highestPow: number): number {
  let h = prevHash;
  h = (h - (charVal(outChar) * highestPow) % MOD + MOD * MOD) % MOD;
  h = (h * BASE + charVal(inChar)) % MOD;
  return h;
}

function buildFrames(text: string, pattern: string): Frame[] {
  const frames: Frame[] = [];
  const n = text.length, m = pattern.length;
  let highestPow = 1;
  for (let i = 0; i < m - 1; i++) highestPow = (highestPow * BASE) % MOD;

  const patHash = initialHash(pattern, m);
  let winHash = initialHash(text, m);
  const found: number[] = [];
  const spurious: number[] = [];

  frames.push({
    line: 3, vars: { "|p|": m, "|t|": n, patHash, base: BASE, mod: MOD },
    message: `Compute pattern hash: hash("${pattern}") = ${patHash}.`,
    windowStart: 0, windowHash: 0, patternHash: patHash,
    phase: "init", found: [], spurious: [],
    highlightKey: "patHash",
  });
  frames.push({
    line: 4, vars: { winStart: 0, winHash, patHash },
    message: `Initial window hash: hash("${text.slice(0, m)}") = ${winHash}.`,
    windowStart: 0, windowHash: winHash, patternHash: patHash,
    phase: "init", found: [], spurious: [],
    highlightKey: "winHash",
  });

  for (let s = 0; s <= n - m; s++) {
    const hashMatch = winHash === patHash;
    frames.push({
      line: 6, vars: { s, winHash, patHash, match: hashMatch ? "yes" : "no" },
      message: hashMatch
        ? `Hash match at s=${s}! Need to verify characters.`
        : `Hashes differ (${winHash} vs ${patHash}). Skip.`,
      windowStart: s, windowHash: winHash, patternHash: patHash,
      phase: hashMatch ? "check" : "slide",
      found: [...found], spurious: [...spurious],
    });
    if (hashMatch) {
      const sub = text.slice(s, s + m);
      if (sub === pattern) {
        found.push(s);
        frames.push({
          line: 7, vars: { s, match: s },
          message: `✓ Verified match at index ${s}: "${sub}" = "${pattern}".`,
          windowStart: s, windowHash: winHash, patternHash: patHash,
          phase: "match", found: [...found], spurious: [...spurious],
        });
      } else {
        spurious.push(s);
        frames.push({
          line: 8, vars: { s, actual: sub, pattern },
          message: `✗ Spurious hit at s=${s}: hashes collided but "${sub}" ≠ "${pattern}".`,
          windowStart: s, windowHash: winHash, patternHash: patHash,
          phase: "spurious", found: [...found], spurious: [...spurious],
        });
      }
    }
    if (s < n - m) {
      const newHash = rollHash(winHash, text[s], text[s + m], highestPow);
      frames.push({
        line: 9, vars: { remove: text[s], add: text[s + m], old: winHash, "new": newHash },
        message: `Roll: drop '${text[s]}', add '${text[s + m]}' → new winHash = ${newHash}.`,
        windowStart: s + 1, windowHash: newHash, patternHash: patHash,
        phase: "slide", found: [...found], spurious: [...spurious],
        highlightKey: "winHash",
      });
      winHash = newHash;
    }
  }

  frames.push({
    line: 1, vars: { matches: found.length, spurious: spurious.length },
    message: `Done. Matches: [${found.join(", ") || "-"}]. Spurious hits: ${spurious.length}.`,
    windowStart: Math.max(0, n - m), windowHash: winHash, patternHash: patHash,
    phase: "done", found, spurious,
  });
  return frames;
}

/* ------------------------------------------------------------------ */
/*  Visualization                                                      */
/* ------------------------------------------------------------------ */

function Visualization({ frame, text, pattern }: { frame: Frame; text: string; pattern: string }) {
  const n = text.length;
  const m = pattern.length;
  const s = frame.windowStart;

  const textStates: (CellState | undefined)[] = new Array(n).fill(undefined);
  for (let k = 0; k < m; k++) {
    if (s + k < n) {
      if (frame.phase === "match") textStates[s + k] = "match";
      else if (frame.phase === "spurious") textStates[s + k] = "mismatch";
      else if (frame.phase === "check") textStates[s + k] = "window";
      else textStates[s + k] = "window";
    }
  }
  for (const f of frame.found) {
    for (let k = 0; k < m; k++) if (f + k < n && textStates[f + k] !== "match") textStates[f + k] = "done";
  }

  const glow =
    frame.phase === "match" ? "#10b981" :
    frame.phase === "spurious" ? "#f59e0b" :
    frame.phase === "check" ? "#fde047" :
    undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
      {/* Text */}
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", marginBottom: 2 }}>
          Text (sliding window = pattern length {m})
        </div>
        <div style={{
          display: "inline-block", borderRadius: 10,
          boxShadow: glow ? `0 0 0 3px ${glow}55` : "none",
          transition: "box-shadow 0.3s",
        }}>
          <MemoryCells
            values={text.split("").map((c) => (c === " " ? "·" : c))}
            states={textStates}
            cellWidth={34}
          />
        </div>
      </div>

      {/* Pattern */}
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "center", marginBottom: 2 }}>
          Pattern
        </div>
        <MemoryCells values={pattern.split("")} cellWidth={34} />
      </div>

      {/* Hash comparison panel */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <HashBox label="Window hash" value={frame.windowHash} highlight={frame.highlightKey === "winHash"} color="var(--eng-primary)" />
        <HashBox label="Pattern hash" value={frame.patternHash} highlight={frame.highlightKey === "patHash"} color="#8b5cf6" />
        <HashBox label="Equal?" value={frame.windowHash === frame.patternHash ? "YES" : "no"} color={frame.windowHash === frame.patternHash ? "#10b981" : "#64748b"} />
      </div>

      {/* Counters */}
      <div style={{ display: "flex", gap: 10, fontSize: "0.82rem" }}>
        <span style={{ fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: "rgba(16,185,129,0.1)", color: "var(--eng-success)" }}>
          matches: {frame.found.length}
        </span>
        <span style={{ fontWeight: 700, padding: "4px 12px", borderRadius: 6, background: "rgba(245,158,11,0.12)", color: "#b45309" }}>
          spurious: {frame.spurious.length}
        </span>
      </div>
    </div>
  );
}

function HashBox({ label, value, highlight, color }: { label: string; value: number | string; highlight?: boolean; color: string }) {
  return (
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: 8,
      padding: "6px 12px",
      background: `${color}10`,
      minWidth: 110,
      textAlign: "center",
      boxShadow: highlight ? `0 0 0 3px ${color}44` : "none",
      transition: "box-shadow 0.3s, background 0.3s",
    }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </div>
      <div style={{ fontFamily: '"SF Mono", monospace', fontSize: "1.1rem", fontWeight: 800, color }}>
        {value}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                          */
/* ------------------------------------------------------------------ */

function parsePair(s: string): { text: string; pattern: string } | null {
  const parts = s.split(/\s*\|\s*/);
  if (parts.length !== 2) return null;
  const [text, pattern] = parts;
  if (!text || !pattern || pattern.length > text.length || pattern.length > 8 || text.length > 20) return null;
  if (!/^[A-Za-z]+$/.test(text) || !/^[A-Za-z]+$/.test(pattern)) return null;
  return { text, pattern };
}

function VisualizeTab() {
  const [src, setSrc] = useState("ABRACADABRA | ABRA");
  const parsed = parsePair(src);
  const { text, pattern } = parsed ?? { text: "ABRACADABRA", pattern: "ABRA" };
  const frames = useMemo(() => buildFrames(text, pattern), [text, pattern]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <AlgoCanvas
      title="Rabin-Karp - Rolling Hash Pattern Match"
      player={player}
      input={
        <InputEditor
          label="Text | Pattern  (letters only)"
          value={src}
          placeholder="ABRACADABRA | ABRA"
          helper={`Hash base=${BASE}, mod=${MOD}. Max text 20 chars, pattern 8 chars.`}
          presets={[
            { label: "Classic", value: "ABRACADABRA | ABRA" },
            { label: "Repetitive", value: "AAAAABAAA | AAAB" },
            { label: "Likely spurious", value: "AABCAABCBB | ABCB" },
            { label: "No match", value: "HELLOWORLD | XYZ" },
          ]}
          onApply={(v) => { if (parsePair(v)) setSrc(v); }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={frame.highlightKey ? [frame.highlightKey] : []} />}
      legend={
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          <span><b style={{ color: "#8b5cf6" }}>window</b> - current slice</span>
          <span><b style={{ color: "#fde047" }}>glow</b> - hash matched, verify chars</span>
          <span><b style={{ color: "#10b981" }}>match</b> - confirmed</span>
          <span><b style={{ color: "#f59e0b" }}>spurious</b> - hash collision</span>
        </div>
      }
    >
      <Visualization frame={frame} text={text} pattern={pattern} />
    </AlgoCanvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn / Try / Insight                                              */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    { title: "The idea", body: "Hash the pattern once. Hash the first window of the text. Compare hashes; only on hash match, compare characters. Slide and repeat." },
    { title: "Rolling hash", body: "Instead of re-hashing every window from scratch (O(m) each), update in O(1): subtract the leaving char's contribution, shift the rest up by the base, add the incoming char." },
    { title: "Spurious hits", body: "Different strings can have the same hash (collision). So hash equality only triggers a full character check. Choosing large prime mod keeps collisions rare." },
    { title: "Average vs worst case", body: "Expected O(n + m). Worst case (adversarial strings that constantly collide): O(n·m) - same as brute force. KMP avoids this worst case deterministically." },
    { title: "Multi-pattern win", body: "Rabin-Karp excels when you search many patterns at once: hash them all, hash each window once, check set membership - O(n + total pattern length)." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Think of the pattern as a &quot;fingerprint&quot; (a number). Scan the text and compute the fingerprint of each window in constant time by rolling. Compare fingerprints first - it's a cheap filter.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TryTab() {
  const problems = [
    { q: "Worst-case time complexity of Rabin-Karp?", answer: "O(nm)" },
    { q: "Expected time complexity with a good hash function?", answer: "O(n+m)" },
    { q: "What makes Rabin-Karp especially useful compared to KMP?", answer: "multi-pattern" },
  ];
  const [guesses, setGuesses] = useState<string[]>(problems.map(() => ""));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>Short-answer questions - write the key phrase.</div>
      {problems.map((p, i) => (
        <div key={i} className="card-eng" style={{ padding: 14 }}>
          <div style={{ fontSize: "0.88rem", marginBottom: 8 }}>{p.q}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={guesses[i]}
              onChange={(e) => { const g = [...guesses]; g[i] = e.target.value; setGuesses(g); }}
              placeholder="your answer"
              style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", monospace', width: 220 }}
            />
            <button
              onClick={() => { const s = [...shown]; s[i] = true; setShown(s); }}
              className="btn-eng-outline"
              style={{ fontSize: "0.78rem", padding: "5px 12px" }}
            >Reveal</button>
            {shown[i] && (
              <span style={{
                fontSize: "0.82rem", fontWeight: 700,
                color: "var(--eng-text)",
                padding: "3px 10px", borderRadius: 6,
                background: "rgba(59,130,246,0.1)",
              }}>
                Answer: {p.answer}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>The rolling-hash formula</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          hash(s[i+1..i+m]) = (hash(s[i..i+m-1]) − s[i]·B^(m-1)) · B + s[i+m], all mod M. Precompute B^(m-1) once. That subtraction / multiply / add is O(1).
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Picking hash constants</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Use a large prime modulus (e.g. 10^9 + 7) to minimize collisions. The base should be larger than the alphabet size (256 for ASCII, 31 for letters). For security-sensitive uses, pick a random prime at runtime to thwart adversaries.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                            */
/* ------------------------------------------------------------------ */

export default function DSA_L7_RabinKarpActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "The key operation enabling Rabin-Karp's O(n) expected time is:",
      options: ["Binary search on hash values", "Rolling hash update in O(1) per window", "KMP's failure table", "Trie traversal"],
      correctIndex: 1,
      explanation: "Recomputing hash from scratch per window would be O(m) × n = O(nm). Rolling hash drops that to O(1) per slide.",
    },
    {
      question: "A 'spurious hit' in Rabin-Karp means:",
      options: ["A character mismatch without checking the hash", "Two windows with the same hash but different strings", "A missed true match", "A cache miss"],
      correctIndex: 1,
      explanation: "Hash collisions - different strings, same hash - force a full character compare to confirm or reject the match.",
    },
    {
      question: "Worst-case (adversarial collisions) time complexity of Rabin-Karp is:",
      options: ["O(n + m)", "O(n log m)", "O(n·m)", "O(m²)"],
      correctIndex: 2,
      explanation: "In the worst case every window spuriously hits and requires a full O(m) comparison → O(n·m), same as brute force.",
    },
    {
      question: "Why is Rabin-Karp attractive for multi-pattern search?",
      options: [
        "Its hashes are trivially invertible",
        "Hashing all patterns once lets each window be checked against the whole set in O(1) average",
        "It avoids modular arithmetic",
        "It uses less memory than KMP",
      ],
      correctIndex: 1,
      explanation: "Store all pattern hashes in a set; each window hash is queried once - total O(n + sum of pattern lengths) average.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Rabin-Karp - Rolling Hash"
      level={7}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Low - useful for multi-pattern and plagiarism detection"
      nextLessonHint="Bit Manipulation - Working at the Binary Level"
    />
  );
}
