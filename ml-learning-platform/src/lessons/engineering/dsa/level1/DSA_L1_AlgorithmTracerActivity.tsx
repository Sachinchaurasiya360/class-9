"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, useStepPlayer,
} from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Algorithm: find max of 3 numbers (the classic intro)                */
/* ------------------------------------------------------------------ */

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  highlightKey?: string | null;
}

const PSEUDO = [
  "function findMax(a, b, c):",
  "  max ← a",
  "  if b > max:",
  "    max ← b",
  "  if c > max:",
  "    max ← c",
  "  return max",
];

function buildFrames(a: number, b: number, c: number): Frame[] {
  const f: Frame[] = [];
  f.push({ line: 0, vars: { a, b, c, max: undefined }, message: `Inputs a=${a}, b=${b}, c=${c}` });
  let max = a;
  f.push({ line: 1, vars: { a, b, c, max }, highlightKey: "max", message: `Start: assume max = a = ${a}` });
  f.push({ line: 2, vars: { a, b, c, max }, message: `Check: is b (${b}) > max (${max})?` });
  if (b > max) {
    max = b;
    f.push({ line: 3, vars: { a, b, c, max }, highlightKey: "max", message: `Yes - update max to b = ${b}` });
  } else {
    f.push({ line: 2, vars: { a, b, c, max }, message: `No - keep max = ${max}` });
  }
  f.push({ line: 4, vars: { a, b, c, max }, message: `Check: is c (${c}) > max (${max})?` });
  if (c > max) {
    max = c;
    f.push({ line: 5, vars: { a, b, c, max }, highlightKey: "max", message: `Yes - update max to c = ${c}` });
  } else {
    f.push({ line: 4, vars: { a, b, c, max }, message: `No - keep max = ${max}` });
  }
  f.push({ line: 6, vars: { a, b, c, max }, message: `Return max = ${max}` });
  return f;
}

function parseThree(s: string): [number, number, number] | null {
  const nums = s.split(/[,\s]+/).map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));
  if (nums.length !== 3) return null;
  return [nums[0], nums[1], nums[2]];
}

/* ------------------------------------------------------------------ */
/*  Visualize tab                                                      */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [inputStr, setInputStr] = useState("7, 12, 4");
  const parsed = parseThree(inputStr);
  const [a, b, c] = parsed ?? [7, 12, 4];
  const frames = useMemo(() => buildFrames(a, b, c), [a, b, c]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <AlgoCanvas
      title="Find Max of Three"
      player={player}
      input={
        <InputEditor
          label="Inputs (three numbers)"
          value={inputStr}
          placeholder="e.g. 7, 12, 4"
          helper="Comma or space separated. Exactly three numbers."
          presets={[
            { label: "Ascending", value: "1, 2, 3" },
            { label: "Descending", value: "9, 5, 1" },
            { label: "Middle wins", value: "3, 8, 2" },
            { label: "All equal", value: "5, 5, 5" },
          ]}
          onApply={(v) => { if (parseThree(v)) setInputStr(v); }}
          onRandom={() => {
            const r = () => Math.floor(Math.random() * 20) - 5;
            setInputStr(`${r()}, ${r()}, ${r()}`);
          }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={frame.highlightKey ? [frame.highlightKey] : []} />}
    >
      <VisualTracer frame={frame} a={a} b={b} c={c} />
    </AlgoCanvas>
  );
}

function VisualTracer({ frame, a, b, c }: { frame: Frame; a: number; b: number; c: number }) {
  const max = frame.vars.max;
  const values: { key: string; v: number; label: string }[] = [
    { key: "a", v: a, label: "a" },
    { key: "b", v: b, label: "b" },
    { key: "c", v: c, label: "c" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
      <div style={{ display: "flex", gap: 16 }}>
        {values.map((it) => {
          const isMax = max === it.v;
          const cond = frame.line === 2 && it.key === "b" || frame.line === 4 && it.key === "c";
          return (
            <div key={it.key} style={{
              width: 96, padding: "12px 8px",
              borderRadius: 10,
              border: `2.5px solid ${cond ? "#f59e0b" : isMax ? "#10b981" : "var(--eng-border)"}`,
              background: cond ? "rgba(245,158,11,0.08)" : isMax ? "rgba(16,185,129,0.08)" : "var(--eng-surface)",
              transition: "all 0.3s ease",
              textAlign: "center",
              boxShadow: isMax ? "0 0 0 3px rgba(16,185,129,0.18)" : "none",
            }}>
              <div style={{
                fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text-muted)",
                textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4,
              }}>{it.label}</div>
              <div style={{
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontSize: "1.6rem", fontWeight: 800, color: isMax ? "#10b981" : "var(--eng-text)",
              }}>
                {it.v}
              </div>
            </div>
          );
        })}
      </div>

      {/* The max box */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: "0.85rem", color: "var(--eng-text-muted)", fontWeight: 600 }}>current max</span>
        <div style={{
          minWidth: 80, padding: "8px 14px",
          borderRadius: 8,
          background: max !== undefined ? "var(--eng-primary)" : "var(--eng-border)",
          color: "#fff",
          fontFamily: '"SF Mono", Menlo, Consolas, monospace',
          fontSize: "1.2rem", fontWeight: 800, textAlign: "center",
          transition: "all 0.3s ease",
          boxShadow: frame.highlightKey === "max" ? "0 0 0 3px rgba(59,130,246,0.3)" : "none",
        }}>
          {max ?? "-"}
        </div>
      </div>

      <div style={{
        fontSize: "0.82rem", color: "var(--eng-text)",
        background: "var(--eng-primary-light)",
        padding: "8px 14px", borderRadius: 8,
        borderLeft: "3px solid var(--eng-primary)",
        maxWidth: 520, textAlign: "center",
      }}>
        {frame.message}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn tab                                                          */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    {
      title: "What is an algorithm?",
      body: "A finite, step-by-step procedure that takes some input and produces a correct output. Think of it as an unambiguous recipe a computer can follow without creativity.",
    },
    {
      title: "Algorithm vs Program",
      body: "An algorithm is language-agnostic - pseudocode or English is enough. A program is an algorithm written in a specific language (Python, C++, Java). The same algorithm can be written as many different programs.",
    },
    {
      title: "Four essential properties",
      body: "(1) Input - zero or more well-defined inputs. (2) Output - at least one. (3) Definiteness - each step is unambiguous. (4) Finiteness - it terminates. Add correctness and you have the five classical criteria.",
    },
    {
      title: "How we 'trace' an algorithm",
      body: "Tracing means walking through each instruction and tracking what every variable holds at every step. Interviewers ask you to trace because it proves you understand - not just memorize - the logic.",
    },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 6px" }}>
          Mental model
        </h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Before you learn any data structure or pattern, you need one habit: read a procedure, pretend you are the CPU, and track every variable in a table. Every interview problem starts here.
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>
              0{i + 1}
            </div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>
              {s.title}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>
              {s.body}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try tab: simple "predict the output" exercise                      */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { inputs: "2, 9, 5", answer: 9 },
    { inputs: "-3, -7, -1", answer: -1 },
    { inputs: "4, 4, 4", answer: 4 },
  ];
  const [guesses, setGuesses] = useState<(string | null)[]>(problems.map(() => null));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Trace each call to <code style={{ fontFamily: "monospace", background: "#fff", padding: "1px 4px", borderRadius: 3 }}>findMax</code> on paper. Write your predicted return value, then reveal.
      </div>
      {problems.map((p, i) => {
        const g = guesses[i];
        const revealed = shown[i];
        const correct = g !== null && Number(g) === p.answer;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--eng-text-muted)" }}>#{i + 1}</span>
              <code style={{
                fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                fontSize: "0.9rem", background: "var(--eng-bg)", padding: "4px 10px",
                borderRadius: 6, border: "1px solid var(--eng-border)",
              }}>
                findMax({p.inputs})
              </code>
              <input
                type="text"
                placeholder="your guess"
                value={g ?? ""}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                style={{
                  width: 80, padding: "6px 8px", borderRadius: 6,
                  border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                  fontSize: "0.85rem",
                }}
              />
              <button
                onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }}
                className="btn-eng-outline"
                style={{ fontSize: "0.78rem", padding: "5px 12px" }}
              >
                Reveal
              </button>
              {revealed && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {correct ? `✓ Correct - ${p.answer}` : `Answer: ${p.answer}`}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                            */
/* ------------------------------------------------------------------ */

export default function DSA_L1_AlgorithmTracerActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];

  const quiz: EngQuizQuestion[] = [
    {
      question: "Which of the following is NOT a required property of an algorithm?",
      options: ["Finiteness", "Definiteness", "Speed in milliseconds", "Well-defined input"],
      correctIndex: 2,
      explanation: "Algorithms are defined by correctness and termination, not a specific runtime measured in milliseconds. Complexity (Big-O) is a separate analytical tool.",
    },
    {
      question: "What does 'tracing' an algorithm mean?",
      options: [
        "Writing it in pseudocode",
        "Running the code on a CPU and reading the output",
        "Walking through instructions step-by-step and tracking variable values",
        "Printing every line with a logger",
      ],
      correctIndex: 2,
      explanation: "Tracing is simulating execution by hand and recording what each variable holds after each step - a skill interviewers test directly.",
    },
    {
      question: "Trace findMax(-2, -9, -5). What is returned?",
      options: ["-9", "-5", "-2", "0"],
      correctIndex: 2,
      explanation: "Start max = -2. Is -9 > -2? No. Is -5 > -2? No. Return -2.",
    },
    {
      question: "If we removed the first 'if b > max' check entirely, when would findMax still be correct?",
      options: [
        "Always",
        "Only when b ≤ a",
        "Only when a is the largest",
        "Never",
      ],
      correctIndex: 1,
      explanation: "Without that check, b is never considered. The function returns max(a, c). It happens to be correct when a is already ≥ b, i.e., b ≤ a.",
    },
  ];

  return (
    <EngineeringLessonShell
      title="What is an Algorithm?"
      level={1}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Foundational for every coding interview"
      nextLessonHint="Time Complexity & Big-O Notation"
    />
  );
}

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why this lesson matters more than it looks</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Every hard topic later - recursion, DP, graph algorithms - becomes tractable once you reflexively trace. When you get stuck in an interview, the recovery move is: <em>pick an input, trace it by hand, write down every variable</em>. This is the move.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview-style trace template</h3>
        <ol style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>List all variables as column headers.</li>
          <li>Number the pseudocode lines; write line index in the first column.</li>
          <li>After each line that changes state, add a new row with the updated values.</li>
          <li>The last row's output column is your answer.</li>
        </ol>
      </div>
    </div>
  );
}
