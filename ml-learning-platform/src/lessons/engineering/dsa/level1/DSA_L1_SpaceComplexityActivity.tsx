"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer, StackColumn,
} from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Frame model                                                        */
/* ------------------------------------------------------------------ */

interface CallRec { id: string; label: string; ret?: number; }
interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  stack: CallRec[];
  maxDepth: number;
  result?: number;
}

/* ------------------------------------------------------------------ */
/*  Recursive factorial: fact(n) - demonstrates O(n) stack             */
/* ------------------------------------------------------------------ */

const PSEUDO_REC_FACT = [
  "function fact(n):",
  "  if n <= 1:",
  "    return 1",
  "  return n * fact(n - 1)",
];

function buildRecFact(n0: number): Frame[] {
  const f: Frame[] = [];
  const stack: CallRec[] = [];
  let maxDepth = 0;
  const enter = (n: number, line: number, msg: string) => {
    stack.push({ id: `fact(${n})`, label: `fact(${n})` });
    maxDepth = Math.max(maxDepth, stack.length);
    f.push({ line, vars: { n, depth: stack.length }, message: msg, stack: [...stack], maxDepth });
  };
  const exit = (n: number, ret: number, line: number, msg: string) => {
    stack[stack.length - 1] = { ...stack[stack.length - 1], ret };
    f.push({ line, vars: { n, "returns": ret, depth: stack.length }, message: msg, stack: [...stack], maxDepth });
    stack.pop();
  };

  function go(n: number): number {
    enter(n, 0, `Call fact(${n}) - push a new stack frame.`);
    f.push({ line: 1, vars: { n, depth: stack.length }, message: `Check base case: is ${n} ≤ 1?`, stack: [...stack], maxDepth });
    if (n <= 1) {
      exit(n, 1, 2, `Base case hit. fact(${n}) = 1. Pop frame.`);
      return 1;
    }
    f.push({ line: 3, vars: { n, depth: stack.length }, message: `Recurse: need fact(${n - 1}) before multiplying.`, stack: [...stack], maxDepth });
    const sub = go(n - 1);
    const r = n * sub;
    exit(n, r, 3, `fact(${n}) = ${n} × ${sub} = ${r}. Pop frame.`);
    return r;
  }

  const finalAnswer = go(n0);
  f.push({
    line: 3, vars: { n: n0, result: finalAnswer, "max depth": maxDepth },
    message: `Done. Peak stack depth was ${maxDepth} - that is the auxiliary space O(n).`,
    stack: [], maxDepth, result: finalAnswer,
  });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Iterative factorial: O(1) stack                                    */
/* ------------------------------------------------------------------ */

const PSEUDO_ITER_FACT = [
  "function fact(n):",
  "  result ← 1",
  "  for i in 2..n:",
  "    result ← result * i",
  "  return result",
];

function buildIterFact(n0: number): Frame[] {
  const f: Frame[] = [];
  const stack: CallRec[] = [{ id: "main", label: "main()" }];
  f.push({ line: 0, vars: { n: n0 }, message: `Call fact(${n0}) - single frame on the stack.`, stack: [...stack], maxDepth: 1 });
  let result = 1;
  f.push({ line: 1, vars: { n: n0, result }, message: `Initialise result = 1.`, stack: [...stack], maxDepth: 1 });
  for (let i = 2; i <= n0; i++) {
    f.push({ line: 2, vars: { n: n0, i, result }, message: `Loop head: i = ${i}.`, stack: [...stack], maxDepth: 1 });
    result = result * i;
    f.push({ line: 3, vars: { n: n0, i, result }, message: `result ← result × ${i} = ${result}.`, stack: [...stack], maxDepth: 1 });
  }
  f.push({ line: 4, vars: { n: n0, result }, message: `Return ${result}. Stack never grew past 1 frame → O(1) auxiliary space.`, stack: [...stack], maxDepth: 1, result });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

type Mode = "rec" | "iter";

function VisualizeTab() {
  const [mode, setMode] = useState<Mode>("rec");
  const [n, setN] = useState(5);
  const [inputStr, setInputStr] = useState("5");

  const frames = useMemo(
    () => (mode === "rec" ? buildRecFact(n) : buildIterFact(n)),
    [mode, n]
  );
  const player = useStepPlayer(frames);
  const frame = player.current!;

  const spaceO = mode === "rec" ? `O(n) - grows with input` : `O(1) - single frame`;

  return (
    <AlgoCanvas
      title={`Factorial - ${mode === "rec" ? "Recursive" : "Iterative"}`}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <InputEditor
            label="Input n"
            value={inputStr}
            placeholder="e.g. 5"
            helper="We trace fact(n). Try both modes and compare the stack height."
            presets={[
              { label: "n = 1", value: "1" },
              { label: "n = 3", value: "3" },
              { label: "n = 5", value: "5" },
              { label: "n = 8", value: "8" },
            ]}
            onApply={(v) => {
              const x = Math.max(1, Math.min(10, Math.floor(Number(v) || 0)));
              if (x > 0) { setInputStr(String(x)); setN(x); }
            }}
            onRandom={() => {
              const x = 1 + Math.floor(Math.random() * 8);
              setInputStr(String(x));
              setN(x);
            }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {([["rec", "Recursive - O(n) stack"], ["iter", "Iterative - O(1) stack"]] as const).map(([id, label]) => (
              <button key={id}
                onClick={() => setMode(id)}
                style={{
                  padding: "5px 12px", fontSize: "0.75rem", fontWeight: 700,
                  borderRadius: 999,
                  border: mode === id ? "1.5px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                  background: mode === id ? "var(--eng-primary-light)" : "var(--eng-surface)",
                  color: mode === id ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                  transition: "all 0.15s",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      }
      pseudocode={<PseudocodePanel lines={mode === "rec" ? PSEUDO_REC_FACT : PSEUDO_ITER_FACT} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={["depth", "result", "i"]} />}
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center", justifyItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{
            fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-text-muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Auxiliary space
          </div>
          <div style={{
            padding: "8px 16px", borderRadius: 10,
            background: mode === "rec" ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)",
            border: `2px solid ${mode === "rec" ? "#ef4444" : "#10b981"}`,
            color: mode === "rec" ? "#991b1b" : "#065f46",
            fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            fontSize: "1.1rem", fontWeight: 800,
          }}>
            {spaceO}
          </div>
          <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", maxWidth: 260, textAlign: "center", lineHeight: 1.5 }}>
            Peak stack frames during this trace: <strong>{frame.maxDepth}</strong>
          </div>

          <div style={{
            background: "var(--eng-primary-light)",
            padding: "8px 14px", borderRadius: 8,
            borderLeft: "3px solid var(--eng-primary)",
            fontSize: "0.82rem", color: "var(--eng-text)", maxWidth: 360, textAlign: "center",
          }}>
            {frame.message}
          </div>
        </div>

        <StackColumn
          title="Call Stack"
          items={frame.stack.map((s) => ({
            value: s.ret !== undefined ? `${s.label} ↩ ${s.ret}` : s.label,
            color: s.ret !== undefined ? "#10b981" : undefined,
          }))}
          maxHeight={300}
          width={150}
          topLabel="top"
        />
      </div>
    </AlgoCanvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Space complexity</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          The total memory an algorithm uses as a function of the input size n. We split it into <strong>input space</strong> (the given data) and <strong>auxiliary space</strong> (anything extra the algorithm allocates). Interviews care about auxiliary space.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
        {[
          { t: "Variables are O(1)", b: "A fixed number of scalars (counters, accumulators) uses constant memory no matter how big n is." },
          { t: "New arrays are O(size)", b: "If you allocate a helper array of length n, you just added O(n) space." },
          { t: "Recursion costs stack frames", b: "Each unresolved recursive call keeps its locals alive on the call stack. Depth d → O(d) space." },
          { t: "Data structures count", b: "Hash maps, sets, matrices - their sizes all feed into auxiliary space." },
        ].map((c, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>{c.t}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{c.b}</div>
          </div>
        ))}
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Classic comparisons</h3>
        <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
          <tbody>
            <tr><td style={{ padding: 6 }}>Iterative factorial / Fibonacci</td><td style={{ padding: 6, fontFamily: "monospace", color: "var(--eng-primary)" }}>O(1)</td></tr>
            <tr><td style={{ padding: 6 }}>Recursive factorial / Fibonacci (no memo)</td><td style={{ padding: 6, fontFamily: "monospace", color: "var(--eng-primary)" }}>O(n)</td></tr>
            <tr><td style={{ padding: 6 }}>Merge sort auxiliary array</td><td style={{ padding: 6, fontFamily: "monospace", color: "var(--eng-primary)" }}>O(n)</td></tr>
            <tr><td style={{ padding: 6 }}>Quick sort (in-place)</td><td style={{ padding: 6, fontFamily: "monospace", color: "var(--eng-primary)" }}>O(log n)</td></tr>
            <tr><td style={{ padding: 6 }}>BFS on a graph (queue)</td><td style={{ padding: 6, fontFamily: "monospace", color: "var(--eng-primary)" }}>O(V)</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab                                                            */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { snippet: "for i in 0..n:\n  sum += a[i]", options: ["O(1)", "O(n)", "O(n²)"], answer: 0, explain: "A single accumulator sum is one scalar - constant auxiliary space." },
    { snippet: "copy ← new array of size n\nfor i in 0..n:\n  copy[i] ← a[i]", options: ["O(1)", "O(log n)", "O(n)"], answer: 2, explain: "Allocating a fresh size-n array adds O(n) auxiliary space." },
    { snippet: "function f(n):\n  if n == 0: return 0\n  return f(n-1) + 1", options: ["O(1)", "O(n)", "O(log n)"], answer: 1, explain: "Recursion depth is n → n stack frames alive at once." },
    { snippet: "function bs(a, lo, hi, x):\n  if lo > hi: return -1\n  mid ← (lo + hi) / 2\n  ...", options: ["O(1)", "O(log n)", "O(n)"], answer: 1, explain: "Binary search recursion halves each call → stack depth log₂ n." },
  ];
  const [picked, setPicked] = useState<(number | null)[]>(problems.map(() => null));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Pick the auxiliary space for each snippet. Input arrays do not count - only new allocations and stack frames.
      </div>
      {problems.map((p, i) => {
        const sel = picked[i];
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <pre style={{
              background: "#0f172a", color: "#e2e8f0", padding: 10, borderRadius: 8,
              fontSize: "0.82rem", fontFamily: '"SF Mono", Menlo, Consolas, monospace',
              margin: "0 0 10px", overflowX: "auto",
            }}>{p.snippet}</pre>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {p.options.map((o, idx) => {
                const correct = sel !== null && idx === p.answer;
                const wrong = sel !== null && idx === sel && idx !== p.answer;
                return (
                  <button key={idx}
                    onClick={() => { const v = [...picked]; v[i] = idx; setPicked(v); }}
                    style={{
                      padding: "6px 12px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700,
                      border: correct ? "1.5px solid var(--eng-success)" : wrong ? "1.5px solid var(--eng-danger)" : "1px solid var(--eng-border)",
                      background: correct ? "rgba(16,185,129,0.1)" : wrong ? "rgba(239,68,68,0.1)" : "var(--eng-surface)",
                      color: correct ? "#065f46" : wrong ? "#991b1b" : "var(--eng-text)",
                      cursor: "pointer", fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                    }}
                  >
                    {o}
                  </button>
                );
              })}
            </div>
            {sel !== null && (
              <div className="info-eng eng-fadeIn" style={{ fontSize: "0.82rem", marginTop: 10 }}>
                {p.explain}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Insight tab                                                        */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Time vs Space trade-offs</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          You can almost always trade one for the other. Memoisation turns exponential-time recursion into linear time - by spending O(n) extra space. Interviewers love this pattern; it shows up in DP, hashing, and caching.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Tail recursion caveat</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Some languages (Scheme, Scala) optimise tail calls to O(1) space. Mainstream Python / Java / C++ do <em>not</em>. In interviews, assume each recursive call costs a frame.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview-style checklist</h3>
        <ol style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Count all <em>new</em> data structures and multiply their sizes.</li>
          <li>Measure recursion depth. Each level = 1 frame.</li>
          <li>Add everything; drop constants and lower-order terms.</li>
          <li>State whether you are reporting input + auxiliary, or just auxiliary.</li>
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function DSA_L1_SpaceComplexityActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "A recursive function f(n) that calls itself once with argument n-1 uses how much auxiliary space?",
      options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
      correctIndex: 2,
      explanation: "Each call lives on the stack until its base case returns. Depth n → n frames → O(n).",
    },
    {
      question: "Which version of factorial uses O(1) auxiliary space?",
      options: ["Recursive with memoisation", "Plain recursive", "Iterative with a loop", "None - all factorial implementations need O(n)"],
      correctIndex: 2,
      explanation: "A simple for-loop with a single accumulator uses one frame and one scalar - constant space.",
    },
    {
      question: "Merge sort's extra array during merges makes its auxiliary space…",
      options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
      correctIndex: 2,
      explanation: "The temporary buffer holds up to n elements while merging, so auxiliary space is O(n).",
    },
    {
      question: "You trade O(1) space for O(n) space by memoising. What do you typically gain?",
      options: ["Simpler code", "A smaller stack", "Lower time complexity", "Easier debugging"],
      correctIndex: 2,
      explanation: "Memoisation caches results so exponential-time recursion collapses to polynomial-time - space-for-time trade.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Space Complexity"
      level={1}
      lessonNumber={3}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Expected whenever recursion or caching is discussed"
      nextLessonHint="Arrays - Fundamentals"
    />
  );
}
