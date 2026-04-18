"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, MemoryCells,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  values: string[];
  states: (CellState | undefined)[];
  pointers: Record<string, number>;
  // For substring search we render the pattern strip as well
  patternValues?: string[];
  patternStates?: (CellState | undefined)[];
  patternOffset?: number;
}

/* ------------------------------------------------------------------ */
/*  Reverse (two-pointer swap)                                         */
/* ------------------------------------------------------------------ */

const PSEUDO_REVERSE = [
  "function reverse(s):",
  "  i ← 0, j ← n - 1",
  "  while i < j:",
  "    swap s[i] and s[j]",
  "    i ← i + 1, j ← j - 1",
];

function buildReverse(text: string): Frame[] {
  const f: Frame[] = [];
  const a = text.split("");
  const n = a.length;
  f.push({
    line: 0, vars: { n }, message: `Reverse the string "${text}" in place.`,
    values: [...a], states: a.map(() => "default"), pointers: {},
  });
  let i = 0, j = n - 1;
  f.push({
    line: 1, vars: { i, j }, message: `Place two pointers at the ends.`,
    values: [...a], states: a.map(() => "default"), pointers: { i, j },
  });
  while (i < j) {
    f.push({
      line: 2, vars: { i, j }, message: `Condition i < j holds (${i} < ${j}); swap the ends.`,
      values: [...a], states: a.map((_, k) => (k === i || k === j ? "compare" : "default")), pointers: { i, j },
    });
    [a[i], a[j]] = [a[j], a[i]];
    f.push({
      line: 3, vars: { i, j }, message: `Swapped. The string is now "${a.join("")}".`,
      values: [...a], states: a.map((_, k) => (k === i || k === j ? "swap" : k < i || k > j ? "done" : "default")), pointers: { i, j },
    });
    i++; j--;
    f.push({
      line: 4, vars: { i, j }, message: `Move the pointers inward.`,
      values: [...a], states: a.map((_, k) => (k < i || k > j ? "done" : "default")), pointers: { i, j },
    });
  }
  f.push({
    line: 2, vars: { i, j }, message: `Pointers met. Reversal complete: "${a.join("")}". O(n) time, O(1) extra space.`,
    values: [...a], states: a.map(() => "done"), pointers: {},
  });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Palindrome check                                                   */
/* ------------------------------------------------------------------ */

const PSEUDO_PALI = [
  "function isPalindrome(s):",
  "  i ← 0, j ← n - 1",
  "  while i < j:",
  "    if s[i] != s[j]: return false",
  "    i ← i + 1, j ← j - 1",
  "  return true",
];

function buildPalindrome(text: string): Frame[] {
  const f: Frame[] = [];
  const a = text.split("");
  const n = a.length;
  f.push({
    line: 0, vars: { n }, message: `Check whether "${text}" is a palindrome.`,
    values: [...a], states: a.map(() => "default"), pointers: {},
  });
  let i = 0, j = n - 1;
  f.push({
    line: 1, vars: { i, j }, message: `Pointers at the ends.`,
    values: [...a], states: a.map(() => "default"), pointers: { i, j },
  });
  while (i < j) {
    f.push({
      line: 2, vars: { i, j }, message: `i < j - continue inspection.`,
      values: [...a], states: a.map((_, k) => (k === i || k === j ? "compare" : k < i || k > j ? "done" : "default")), pointers: { i, j },
    });
    f.push({
      line: 3, vars: { i, j }, message: `Compare s[${i}] ('${a[i]}') with s[${j}] ('${a[j]}').`,
      values: [...a], states: a.map((_, k) => (k === i || k === j ? "compare" : k < i || k > j ? "done" : "default")), pointers: { i, j },
    });
    if (a[i] !== a[j]) {
      f.push({
        line: 3, vars: { i, j, result: "false" }, message: `Mismatch! Not a palindrome.`,
        values: [...a], states: a.map((_, k) => (k === i || k === j ? "mismatch" : k < i || k > j ? "done" : "default")), pointers: { i, j },
      });
      return f;
    }
    f.push({
      line: 4, vars: { i, j }, message: `Match. Move the pointers inward.`,
      values: [...a], states: a.map((_, k) => (k === i || k === j ? "match" : k < i || k > j ? "done" : "default")), pointers: { i, j },
    });
    i++; j--;
  }
  f.push({
    line: 5, vars: { i, j, result: "true" }, message: `All pairs matched. "${text}" is a palindrome.`,
    values: [...a], states: a.map(() => "match"), pointers: {},
  });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Brute-force substring search                                       */
/* ------------------------------------------------------------------ */

const PSEUDO_BRUTE = [
  "function search(text, pat):",
  "  for i in 0..n-m:",
  "    j ← 0",
  "    while j < m and text[i+j] == pat[j]:",
  "      j ← j + 1",
  "    if j == m: return i",
  "  return -1",
];

function buildBrute(text: string, pat: string): Frame[] {
  const f: Frame[] = [];
  const n = text.length;
  const m = pat.length;
  const ta = text.split("");
  if (m === 0 || m > n) {
    f.push({ line: 0, vars: { n, m }, message: `Pattern is empty or longer than text.`, values: ta, states: ta.map(() => "default"), pointers: {} });
    return f;
  }
  f.push({
    line: 0, vars: { n, m }, message: `Slide the pattern across the text; compare character by character.`,
    values: ta, states: ta.map(() => "default"), pointers: {},
    patternValues: pat.split(""), patternStates: pat.split("").map(() => "default"), patternOffset: 0,
  });
  for (let i = 0; i <= n - m; i++) {
    f.push({
      line: 1, vars: { i }, message: `Try aligning the pattern at position ${i}.`,
      values: ta, states: ta.map((_, k) => (k >= i && k < i + m ? "window" : "default")), pointers: { i },
      patternValues: pat.split(""), patternStates: pat.split("").map(() => "default"), patternOffset: i,
    });
    let j = 0;
    f.push({
      line: 2, vars: { i, j }, message: `Reset inner cursor j to 0.`,
      values: ta, states: ta.map((_, k) => (k >= i && k < i + m ? "window" : "default")), pointers: { i },
      patternValues: pat.split(""), patternStates: pat.split("").map(() => "default"), patternOffset: i,
    });
    while (j < m) {
      f.push({
        line: 3, vars: { i, j }, message: `Compare text[${i + j}] ('${ta[i + j]}') with pat[${j}] ('${pat[j]}').`,
        values: ta, states: ta.map((_, k) => (k === i + j ? "compare" : k >= i && k < i + m ? "window" : "default")), pointers: { i, "i+j": i + j },
        patternValues: pat.split(""), patternStates: pat.split("").map((_, k) => (k === j ? "compare" : "default")), patternOffset: i,
      });
      if (ta[i + j] !== pat[j]) {
        f.push({
          line: 3, vars: { i, j }, message: `Mismatch. Shift the pattern one step right.`,
          values: ta, states: ta.map((_, k) => (k === i + j ? "mismatch" : k >= i && k < i + m ? "window" : "default")), pointers: { i, "i+j": i + j },
          patternValues: pat.split(""), patternStates: pat.split("").map((_, k) => (k === j ? "mismatch" : "default")), patternOffset: i,
        });
        break;
      }
      f.push({
        line: 4, vars: { i, j }, message: `Match. Advance j.`,
        values: ta, states: ta.map((_, k) => (k === i + j ? "match" : k >= i && k < i + m ? "window" : "default")), pointers: { i, "i+j": i + j },
        patternValues: pat.split(""), patternStates: pat.split("").map((_, k) => (k === j ? "match" : k < j ? "match" : "default")), patternOffset: i,
      });
      j++;
    }
    if (j === m) {
      f.push({
        line: 5, vars: { i, found: i }, message: `Full match at index ${i}! Return ${i}.`,
        values: ta, states: ta.map((_, k) => (k >= i && k < i + m ? "match" : "default")), pointers: { i },
        patternValues: pat.split(""), patternStates: pat.split("").map(() => "match"), patternOffset: i,
      });
      return f;
    }
  }
  f.push({
    line: 6, vars: { found: -1 }, message: `Pattern not found. Worst-case time is O(n · m).`,
    values: ta, states: ta.map(() => "default"), pointers: {},
    patternValues: pat.split(""), patternStates: pat.split("").map(() => "default"), patternOffset: 0,
  });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                          */
/* ------------------------------------------------------------------ */

type Op = "reverse" | "palindrome" | "search";

function VisualizeTab() {
  const [op, setOp] = useState<Op>("reverse");
  const [text, setText] = useState("racecar");
  const [pat, setPat] = useState("ace");

  const { pseudo, frames } = useMemo(() => {
    if (op === "reverse")    return { pseudo: PSEUDO_REVERSE, frames: buildReverse(text) };
    if (op === "palindrome") return { pseudo: PSEUDO_PALI,    frames: buildPalindrome(text) };
    return { pseudo: PSEUDO_BRUTE, frames: buildBrute(text, pat) };
  }, [op, text, pat]);

  const player = useStepPlayer(frames);
  const frame = player.current!;

  const opLabels: Record<Op, string> = {
    reverse: "Reverse - two pointer swap",
    palindrome: "Palindrome - converging pointers",
    search: "Brute force substring - O(n · m)",
  };

  return (
    <AlgoCanvas
      title={opLabels[op]}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InputEditor
            label="Text"
            value={text}
            placeholder="e.g. racecar"
            presets={[
              { label: "Palindrome", value: "racecar" },
              { label: "Normal", value: "abracadabra" },
              { label: "Even", value: "abba" },
              { label: "Single", value: "x" },
            ]}
            onApply={(v) => { if (v.length > 0) setText(v.slice(0, 24)); }}
            onRandom={() => {
              const alpha = "abcdefgh";
              const n = 5 + Math.floor(Math.random() * 6);
              const s = Array.from({ length: n }, () => alpha[Math.floor(Math.random() * alpha.length)]).join("");
              setText(s);
            }}
          />
          {op === "search" && (
            <InputEditor
              label="Pattern"
              value={pat}
              placeholder="e.g. ace"
              presets={[
                { label: "ace", value: "ace" },
                { label: "ab", value: "ab" },
                { label: "xyz", value: "xyz" },
              ]}
              onApply={(v) => { if (v.length > 0) setPat(v.slice(0, 8)); }}
            />
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(Object.keys(opLabels) as Op[]).map((id) => (
              <button key={id}
                onClick={() => setOp(id)}
                style={{
                  padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700,
                  borderRadius: 999,
                  border: op === id ? "1.5px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                  background: op === id ? "var(--eng-primary-light)" : "var(--eng-surface)",
                  color: op === id ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                }}
              >
                {opLabels[id]}
              </button>
            ))}
          </div>
        </div>
      }
      pseudocode={<PseudocodePanel lines={pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={["i", "j", "found", "result"]} />}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <MemoryCells
          values={frame.values}
          states={frame.states}
          pointers={frame.pointers}
          cellWidth={42}
        />
        {frame.patternValues && (
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            marginLeft: (frame.patternOffset ?? 0) * 42,
            transition: "margin-left 0.3s ease",
          }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              pattern
            </span>
            <MemoryCells
              values={frame.patternValues}
              states={frame.patternStates}
              cellWidth={42}
            />
          </div>
        )}
        <div style={{
          background: "var(--eng-primary-light)",
          padding: "8px 14px", borderRadius: 8, borderLeft: "3px solid var(--eng-primary)",
          fontSize: "0.82rem", color: "var(--eng-text)", maxWidth: 560, textAlign: "center",
        }}>
          {frame.message}
        </div>
      </div>
    </AlgoCanvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn                                                              */
/* ------------------------------------------------------------------ */

function LearnTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Strings are arrays of characters</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Every algorithm you learned for arrays works on strings - indexing, scanning, two-pointer sweeps. The twist is that strings are often <em>immutable</em> in high-level languages (Java, Python, JS), so even a one-character change costs O(n) to build a new string.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {[
          { t: "Reverse", b: "Swap ends, move inward. O(n) time, O(1) space with two pointers." },
          { t: "Palindrome", b: "Compare ends; any mismatch is a definitive no. Short-circuits on first mismatch." },
          { t: "Substring search", b: "Slide a window of size m; compare character by character. Brute force is O(n · m)." },
          { t: "Anagram / frequency", b: "Count each character into a 26-sized array; compare counts. O(n) time." },
        ].map((c, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>{c.t}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{c.b}</div>
          </div>
        ))}
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Brute-force substring match - pseudocode</h3>
        <pre style={{
          background: "#0f172a", color: "#e2e8f0",
          padding: 10, borderRadius: 6, fontSize: "0.82rem", margin: 0,
          fontFamily: '"SF Mono", Menlo, Consolas, monospace', overflowX: "auto",
        }}>{`for i in 0..n - m:
  j ← 0
  while j < m and text[i + j] == pat[j]:
    j ← j + 1
  if j == m: return i   # match found
return -1               # not found`}</pre>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try                                                                */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "How many swap operations does reverse('abcdef') perform?", options: ["2", "3", "5", "6"], ans: 1, exp: "n = 6, so ⌊n/2⌋ = 3 swaps (pairs a-f, b-e, c-d)." },
    { q: "Which of these is NOT a palindrome?", options: ["racecar", "abba", "abcba", "abcda"], ans: 3, exp: "'abcda' reversed is 'adcba' - different." },
    { q: "Worst-case comparisons of brute-force search for pat 'aab' in 'aaaaab' (n=6, m=3)?", options: ["3", "6", "12", "18"], ans: 2, exp: "Each of the 4 alignments may compare up to m=3 chars, so up to 12 comparisons." },
    { q: "Which approach is O(n) space because strings are immutable in Python?", options: ["In-place reverse with two pointers", "Building a reversed copy via concatenation", "Checking palindrome with two pointers", "Indexing s[i]"], ans: 1, exp: "Creating a new string costs O(n) memory; in-place algorithms over immutable strings copy the whole thing." },
  ];
  const [picked, setPicked] = useState<(number | null)[]>(problems.map(() => null));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      {problems.map((p, i) => {
        const sel = picked[i];
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.9rem", color: "var(--eng-text)", marginBottom: 10 }}>
              <strong>#{i + 1}.</strong> {p.q}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {p.options.map((o, idx) => {
                const correct = sel !== null && idx === p.ans;
                const wrong = sel !== null && idx === sel && idx !== p.ans;
                return (
                  <button key={idx}
                    onClick={() => { const v = [...picked]; v[i] = idx; setPicked(v); }}
                    style={{
                      padding: "6px 14px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700,
                      border: correct ? "1.5px solid var(--eng-success)" : wrong ? "1.5px solid var(--eng-danger)" : "1px solid var(--eng-border)",
                      background: correct ? "rgba(16,185,129,0.1)" : wrong ? "rgba(239,68,68,0.1)" : "var(--eng-surface)",
                      color: correct ? "#065f46" : wrong ? "#991b1b" : "var(--eng-text)",
                      cursor: "pointer",
                    }}
                  >{o}</button>
                );
              })}
            </div>
            {sel !== null && (
              <div className="info-eng eng-fadeIn" style={{ fontSize: "0.82rem", marginTop: 10 }}>{p.exp}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight                                                            */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why brute force is O(n · m)</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          There are up to (n − m + 1) alignments of the pattern, and each alignment may need up to m comparisons. In the worst case (e.g. text = &quot;aaaa…ab&quot;, pattern = &quot;aab&quot;), we re-scan almost everything at every shift.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Better algorithms exist</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          KMP, Z-algorithm, and Rabin–Karp all run in O(n + m) time by avoiding redundant comparisons after a mismatch. You will meet KMP in Level 7 - brute force is the baseline you improve on.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Immutable-string trap</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          In Python/Java, <code>s = s + c</code> inside a loop is O(n²) - each iteration copies the whole string. Always use a list/StringBuilder and join at the end.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function DSA_L1_StringsActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "In-place reverse with two pointers has what time and auxiliary space?",
      options: ["O(n), O(n)", "O(n), O(1)", "O(n²), O(1)", "O(log n), O(1)"],
      correctIndex: 1,
      explanation: "We touch each character once and need only the two pointers - O(n) time, O(1) space.",
    },
    {
      question: "The two-pointer palindrome check halts early when…",
      options: ["The pointers cross", "A mismatch is found", "The string length is even", "A vowel appears"],
      correctIndex: 1,
      explanation: "One mismatch proves it is not a palindrome, so we return immediately.",
    },
    {
      question: "For brute-force substring search on a text of length n and pattern of length m, the worst-case time is…",
      options: ["O(n + m)", "O(n log m)", "O(n · m)", "O(m²)"],
      correctIndex: 2,
      explanation: "Up to (n − m + 1) alignments each doing up to m comparisons → O(n · m).",
    },
    {
      question: "Which of the following is O(n²) in Python because of string immutability?",
      options: [
        "Iterating once with s[i]",
        "Comparing s == t",
        "Concatenating one character per loop iteration: out = out + c",
        "Slicing s[0:5]",
      ],
      correctIndex: 2,
      explanation: "Each concatenation copies the whole accumulated string. Use a list and ''.join(...) for O(n).",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Strings & Pattern Matching"
      level={1}
      lessonNumber={5}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="String manipulation is half of every easy/medium interview"
      nextLessonHint="Two Pointer & Sliding Window"
    />
  );
}
