"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer,
} from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Growth curves: plot O(1) .. O(n!) on a scaled SVG plane           */
/* ------------------------------------------------------------------ */

type Curve = { id: string; label: string; color: string; f: (n: number) => number; };

const CURVES: Curve[] = [
  { id: "c1",   label: "O(1)",       color: "#10b981", f: () => 1 },
  { id: "clog", label: "O(log n)",   color: "#06b6d4", f: (n) => Math.log2(Math.max(1, n)) },
  { id: "cn",   label: "O(n)",       color: "#3b82f6", f: (n) => n },
  { id: "cnln", label: "O(n log n)", color: "#8b5cf6", f: (n) => n * Math.log2(Math.max(1, n)) },
  { id: "cn2",  label: "O(n²)",      color: "#f59e0b", f: (n) => n * n },
  { id: "c2n",  label: "O(2ⁿ)",      color: "#ef4444", f: (n) => Math.pow(2, Math.min(40, n)) },
  { id: "cfact",label: "O(n!)",      color: "#be185d", f: (n) => { let p = 1; for (let i = 2; i <= Math.min(n, 18); i++) p *= i; return p; } },
];

function GrowthPlot({ nMax, enabled, highlight }: { nMax: number; enabled: Record<string, boolean>; highlight?: string }) {
  const W = 560, H = 300, PAD = 38;
  // Compress y-axis using log to fit all curves on the same plane.
  const yMax = Math.max(
    ...CURVES.filter((c) => enabled[c.id]).map((c) => Math.log10(c.f(nMax) + 1))
  );
  const yScale = (y: number) => H - PAD - (Math.log10(y + 1) / Math.max(0.0001, yMax)) * (H - PAD * 2);
  const xScale = (x: number) => PAD + (x / nMax) * (W - PAD * 2);

  const samples = 60;
  return (
    <svg width={W} height={H} style={{ background: "#fff", borderRadius: 8 }}>
      {/* grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={`gx${i}`} x1={PAD} y1={PAD + t * (H - PAD * 2)} x2={W - PAD} y2={PAD + t * (H - PAD * 2)}
          stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
        <line key={`gy${i}`} x1={PAD + t * (W - PAD * 2)} y1={PAD} x2={PAD + t * (W - PAD * 2)} y2={H - PAD}
          stroke="#e2e8f0" strokeWidth={1} />
      ))}
      {/* axes */}
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#334155" strokeWidth={1.5} />
      <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#334155" strokeWidth={1.5} />
      <text x={W / 2} y={H - 6} textAnchor="middle" fontSize="11" fill="#475569" fontFamily="var(--eng-font)">input size n (1 … {nMax})</text>
      <text x={12} y={H / 2} textAnchor="middle" fontSize="11" fill="#475569" fontFamily="var(--eng-font)" transform={`rotate(-90 12 ${H / 2})`}>operations (log scale)</text>

      {CURVES.filter((c) => enabled[c.id]).map((c) => {
        const pts: string[] = [];
        for (let i = 0; i <= samples; i++) {
          const n = 1 + (nMax - 1) * (i / samples);
          const y = c.f(n);
          pts.push(`${xScale(n).toFixed(1)},${yScale(y).toFixed(1)}`);
        }
        const isHi = highlight === c.id;
        return (
          <polyline
            key={c.id}
            points={pts.join(" ")}
            fill="none"
            stroke={c.color}
            strokeWidth={isHi ? 3.5 : 2}
            opacity={highlight && !isHi ? 0.35 : 1}
            style={{ transition: "opacity 0.25s, stroke-width 0.25s" }}
          />
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Loop analyzer: preset -> frames with line-synced pseudocode        */
/* ------------------------------------------------------------------ */

interface LoopPreset {
  id: string;
  label: string;
  pseudo: string[];
  bigO: string;
  build: (n: number) => LoopFrame[];
}

interface LoopFrame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  ops: number;
  activeCurve: string;
}

function buildSingle(n: number): LoopFrame[] {
  const f: LoopFrame[] = [];
  f.push({ line: 0, vars: { n, ops: 0 }, message: `Start a single loop over n = ${n}.`, ops: 0, activeCurve: "cn" });
  let ops = 0;
  const cap = Math.min(n, 10);
  for (let i = 0; i < cap; i++) {
    ops++;
    f.push({ line: 1, vars: { n, i, ops }, message: `Iteration ${i + 1}: one unit of work.`, ops, activeCurve: "cn" });
  }
  f.push({ line: 2, vars: { n, ops: n }, message: `Total ${n} iterations → work grows linearly. That is O(n).`, ops: n, activeCurve: "cn" });
  return f;
}

function buildNested(n: number): LoopFrame[] {
  const f: LoopFrame[] = [];
  f.push({ line: 0, vars: { n, ops: 0 }, message: `Two nested loops, each up to n.`, ops: 0, activeCurve: "cn2" });
  let ops = 0;
  const cap = Math.min(n, 5);
  for (let i = 0; i < cap; i++) {
    f.push({ line: 1, vars: { n, i, ops }, message: `Outer step i = ${i}. Inner loop will also run n times.`, ops, activeCurve: "cn2" });
    for (let j = 0; j < cap; j++) {
      ops++;
      f.push({ line: 2, vars: { n, i, j, ops }, message: `Inner step j = ${j}. Every outer step costs n inner steps.`, ops, activeCurve: "cn2" });
    }
  }
  f.push({ line: 3, vars: { n, ops: n * n }, message: `Total ≈ n × n = n² operations → O(n²).`, ops: n * n, activeCurve: "cn2" });
  return f;
}

function buildLog(n: number): LoopFrame[] {
  const f: LoopFrame[] = [];
  f.push({ line: 0, vars: { n, ops: 0 }, message: `Halving loop: i doubles each step.`, ops: 0, activeCurve: "clog" });
  let ops = 0;
  let i = 1;
  while (i < n) {
    ops++;
    f.push({ line: 1, vars: { n, i, ops }, message: `i = ${i}. Next iteration will double it.`, ops, activeCurve: "clog" });
    i *= 2;
  }
  const total = Math.max(1, Math.ceil(Math.log2(Math.max(2, n))));
  f.push({ line: 2, vars: { n, ops: total }, message: `Only about log₂(n) ≈ ${total} iterations → O(log n).`, ops: total, activeCurve: "clog" });
  return f;
}

function buildNLogN(n: number): LoopFrame[] {
  const f: LoopFrame[] = [];
  f.push({ line: 0, vars: { n, ops: 0 }, message: `Outer linear loop; inner doubling loop.`, ops: 0, activeCurve: "cnln" });
  let ops = 0;
  const cap = Math.min(n, 4);
  for (let i = 0; i < cap; i++) {
    f.push({ line: 1, vars: { n, i, ops }, message: `Outer i = ${i}. Inner runs log(n) times.`, ops, activeCurve: "cnln" });
    let j = 1;
    while (j < n) {
      ops++;
      f.push({ line: 2, vars: { n, i, j, ops }, message: `Inner j = ${j}, then doubles.`, ops, activeCurve: "cnln" });
      j *= 2;
    }
  }
  const total = Math.ceil(n * Math.log2(Math.max(2, n)));
  f.push({ line: 3, vars: { n, ops: total }, message: `Total ≈ n · log₂(n) operations → O(n log n).`, ops: total, activeCurve: "cnln" });
  return f;
}

const PRESETS: LoopPreset[] = [
  { id: "single", label: "Single loop", pseudo: ["for i in 0..n:", "  work()", "# done"], bigO: "O(n)", build: buildSingle },
  { id: "nested", label: "Nested loops", pseudo: ["for i in 0..n:", "  for j in 0..n:", "    work()", "# done"], bigO: "O(n²)", build: buildNested },
  { id: "log",    label: "Halving loop", pseudo: ["i ← 1", "while i < n:", "  i ← i * 2", "# done"], bigO: "O(log n)", build: buildLog },
  { id: "nln",    label: "Linear × log", pseudo: ["for i in 0..n:", "  j ← 1", "  while j < n: j ← j * 2", "# done"], bigO: "O(n log n)", build: buildNLogN },
];

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [n, setN] = useState(20);
  const [presetId, setPresetId] = useState("nested");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    c1: true, clog: true, cn: true, cnln: true, cn2: true, c2n: true, cfact: false,
  });
  const [inputStr, setInputStr] = useState("20");

  const preset = PRESETS.find((p) => p.id === presetId)!;
  const frames = useMemo(() => preset.build(n), [preset, n]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <AlgoCanvas
      title={`Loop Analyzer → ${preset.bigO}`}
      player={player}
      input={
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <InputEditor
            label="Input size n"
            value={inputStr}
            placeholder="e.g. 20"
            helper="Pick an n to trace. The loop analyzer runs up to a small cap so the frames stay readable."
            presets={[
              { label: "n = 8",   value: "8" },
              { label: "n = 20",  value: "20" },
              { label: "n = 100", value: "100" },
              { label: "n = 1000",value: "1000" },
            ]}
            onApply={(v) => {
              const x = Math.max(1, Math.min(1000, Math.floor(Number(v) || 0)));
              if (x > 0) { setInputStr(String(x)); setN(x); }
            }}
            onRandom={() => {
              const x = 1 + Math.floor(Math.random() * 100);
              setInputStr(String(x));
              setN(x);
            }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPresetId(p.id)}
                style={{
                  padding: "5px 10px", fontSize: "0.72rem", fontWeight: 700,
                  borderRadius: 999,
                  border: presetId === p.id ? "1.5px solid var(--eng-primary)" : "1px solid var(--eng-border)",
                  background: presetId === p.id ? "var(--eng-primary-light)" : "var(--eng-surface)",
                  color: presetId === p.id ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  cursor: "pointer", fontFamily: "var(--eng-font)",
                  transition: "all 0.15s",
                }}
              >
                {p.label} - <span style={{ fontWeight: 800 }}>{p.bigO}</span>
              </button>
            ))}
          </div>
        </div>
      }
      pseudocode={<PseudocodePanel lines={preset.pseudo} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={["ops"]} />}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <GrowthPlot nMax={Math.max(10, n)} enabled={enabled} highlight={frame.activeCurve} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
          {CURVES.map((c) => (
            <button key={c.id}
              onClick={() => setEnabled((e) => ({ ...e, [c.id]: !e[c.id] }))}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "4px 10px", borderRadius: 999,
                border: `1.5px solid ${enabled[c.id] ? c.color : "var(--eng-border)"}`,
                background: enabled[c.id] ? `${c.color}18` : "var(--eng-surface)",
                color: enabled[c.id] ? c.color : "var(--eng-text-muted)",
                fontSize: "0.72rem", fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--eng-font)",
                transition: "all 0.2s",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 2, background: c.color }} />
              {c.label}
            </button>
          ))}
        </div>

        <div style={{
          background: "var(--eng-primary-light)",
          padding: "8px 14px", borderRadius: 8, borderLeft: "3px solid var(--eng-primary)",
          fontSize: "0.82rem", color: "var(--eng-text)", textAlign: "center", maxWidth: 560,
        }}>
          {frame.message}
        </div>
      </div>
    </AlgoCanvas>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const rows = [
    { o: "O(1)",      name: "Constant",     ex: "Array index lookup a[i]" },
    { o: "O(log n)",  name: "Logarithmic",  ex: "Binary search in a sorted array" },
    { o: "O(n)",      name: "Linear",       ex: "Linear search, sum of an array" },
    { o: "O(n log n)",name: "Linearithmic", ex: "Merge sort, heap sort" },
    { o: "O(n²)",     name: "Quadratic",    ex: "Bubble sort, checking all pairs" },
    { o: "O(2ⁿ)",     name: "Exponential",  ex: "Naive recursive subsets, Fibonacci" },
    { o: "O(n!)",     name: "Factorial",    ex: "Generating all permutations" },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", margin: "0 0 6px" }}>Why Big-O?</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Big-O describes how the number of operations grows as the input size n grows. We ignore constants and lower-order terms and keep only the dominant term - because for large n, that term swallows everything else.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ background: "var(--eng-bg)" }}>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--eng-border)" }}>Big-O</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--eng-border)" }}>Name</th>
              <th style={{ textAlign: "left", padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--eng-border)" }}>Typical example</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.o}>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontWeight: 700, color: "var(--eng-primary)" }}>{r.o}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text)" }}>{r.name}</td>
                <td style={{ padding: "8px 14px", borderBottom: "1px solid var(--eng-border)", color: "var(--eng-text-muted)" }}>{r.ex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Three rules you will use every day</h3>
        <ol style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li><strong>Drop constants:</strong> 3n + 7 → O(n). A constant coefficient never changes the class.</li>
          <li><strong>Drop lower-order terms:</strong> n² + n + 100 → O(n²). The biggest term wins.</li>
          <li><strong>Nested loops multiply:</strong> a loop running m times inside one running n times is O(n·m).</li>
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab                                                            */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { snippet: "for i in 0..n:\n  for j in 0..n:\n    x += 1", options: ["O(1)", "O(n)", "O(n²)", "O(n log n)"], answer: 2, explain: "Two nested loops each of length n multiply → n × n = n²." },
    { snippet: "i ← 1\nwhile i < n:\n  i ← i * 2", options: ["O(n)", "O(log n)", "O(n²)", "O(1)"], answer: 1, explain: "Doubling i halves the remaining work each step → log₂(n) steps." },
    { snippet: "for i in 0..n:\n  sum += a[i]\nfor j in 0..n:\n  cnt += 1", options: ["O(n²)", "O(2n)", "O(n)", "O(log n)"], answer: 2, explain: "Two sequential loops of length n add: 2n → dropping constants gives O(n)." },
    { snippet: "for i in 0..n:\n  j ← 1\n  while j < n: j ← j * 2", options: ["O(n)", "O(n²)", "O(n log n)", "O(log n)"], answer: 2, explain: "Linear outer × log-inner → n · log n." },
  ];
  const [picked, setPicked] = useState<(number | null)[]>(problems.map(() => null));
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Classify each snippet. Numbers ignored, loops counted. Click an option, then see the explanation.
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
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Asymptotic vs actual time</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Big-O is about <em>growth rate</em>, not wall-clock time. An O(n²) algorithm can beat an O(n log n) one on tiny inputs. The promise of Big-O kicks in when n is large - which is exactly when performance matters.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Best / Average / Worst case</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Quick sort is O(n log n) on average but O(n²) on an already-sorted array. Interviewers usually mean worst-case Big-O unless they say otherwise. Always ask.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview-style mental model</h3>
        <ol style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Read the code and identify the deepest-nested loop.</li>
          <li>Multiply the counts of every enclosing loop.</li>
          <li>If a loop variable doubles / halves, count it as log n.</li>
          <li>Recursion? Write the recurrence (e.g., T(n) = 2T(n/2) + O(n) → O(n log n)).</li>
        </ol>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export default function DSA_L1_BigOActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "What is the time complexity of the following code?\n\nfor i in 0..n:\n  for j in i..n:\n    work()",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
      correctIndex: 2,
      explanation: "Even though the inner loop shrinks, the total work is n + (n-1) + ... + 1 = n(n+1)/2, which is O(n²).",
    },
    {
      question: "Which expression simplifies to O(n²)?",
      options: ["3n² + 500n + 1000", "n log n + n", "2ⁿ + n²", "n + log n"],
      correctIndex: 0,
      explanation: "Drop the constant 3 and the lower-order terms 500n + 1000. Only n² survives.",
    },
    {
      question: "Which loop body gives O(log n)?",
      options: ["for i in 0..n: ...", "while i < n: i ← i + 1", "while i < n: i ← i * 2", "for i in 0..n: for j in 0..n: ..."],
      correctIndex: 2,
      explanation: "Doubling i each step means only log₂(n) iterations before i reaches n.",
    },
    {
      question: "For very large n, which algorithm is unacceptably slow even though it is 'correct'?",
      options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
      correctIndex: 3,
      explanation: "Exponential time explodes: n=40 already means ~10¹² operations. Practical code must avoid O(2ⁿ) for large inputs.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Time Complexity & Big-O"
      level={1}
      lessonNumber={2}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Asked in every interview to classify candidate code"
      nextLessonHint="Space Complexity"
    />
  );
}
