"use client";

import { useMemo, useState } from "react";
import { BookOpen, Play, Target, Lightbulb } from "lucide-react";
import EngineeringLessonShell, { EngTabDef, EngQuizQuestion } from "@/components/engineering/EngineeringLessonShell";
import {
  AlgoCanvas, PseudocodePanel, VariablesPanel, InputEditor, MemoryCells, useStepPlayer,
} from "@/components/engineering/algo";
import type { CellState } from "@/components/engineering/algo";

/* ------------------------------------------------------------------ */
/*  Algorithm: Longest substring without repeating characters          */
/* ------------------------------------------------------------------ */

interface Frame {
  line: number;
  vars: Record<string, string | number | undefined>;
  message: string;
  left: number;
  right: number;
  states: CellState[];
  freq: Record<string, number>;
  best: string;
  bestLo: number;
  bestHi: number;
  flashKey?: string;
}

const PSEUDO = [
  "function longestUnique(s):",
  "  left ← 0; best ← 0; bestLo ← 0",
  "  freq ← {}",
  "  for right in 0..len(s)-1:",
  "    freq[s[right]] += 1",
  "    while freq[s[right]] > 1:",
  "      freq[s[left]] -= 1",
  "      left += 1",
  "    if right - left + 1 > best:",
  "      best ← right - left + 1; bestLo ← left",
  "  return best",
];

function buildFrames(s: string): Frame[] {
  const f: Frame[] = [];
  const n = s.length;
  if (n === 0) {
    f.push({ line: 0, vars: { s: "''", left: 0, right: "-", best: 0 }, message: "Empty string - nothing to scan.", left: 0, right: -1, states: [], freq: {}, best: "", bestLo: 0, bestHi: -1 });
    return f;
  }
  const states = (lo: number, hi: number): CellState[] =>
    Array.from({ length: n }, (_, i) => (i >= lo && i <= hi ? "window" : "default"));

  let left = 0;
  let best = 0;
  let bestLo = 0;
  let bestHi = -1;
  const freq: Record<string, number> = {};

  f.push({
    line: 0, vars: { s: `"${s}"`, n, left: 0, right: "-", best: 0 },
    message: `Scan "${s}" - grow right, shrink left whenever a character repeats.`,
    left: 0, right: -1, states: states(0, -1), freq: {}, best: "", bestLo: 0, bestHi: -1,
  });
  f.push({
    line: 1, vars: { s: `"${s}"`, left, best, bestLo }, flashKey: "left",
    message: "Initialize: left=0, best=0, bestLo=0.",
    left, right: -1, states: states(left, -1), freq: {}, best: "", bestLo, bestHi: -1,
  });
  f.push({
    line: 2, vars: { s: `"${s}"`, left, best, bestLo }, flashKey: "freq",
    message: "freq is an empty character-frequency map.",
    left, right: -1, states: states(left, -1), freq: {}, best: "", bestLo, bestHi: -1,
  });

  for (let right = 0; right < n; right++) {
    const ch = s[right];
    f.push({
      line: 3, vars: { right, ch: `'${ch}'`, left, best },
      message: `Extend right to ${right} (char '${ch}').`,
      left, right, states: states(left, right - 1), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
    });
    freq[ch] = (freq[ch] || 0) + 1;
    f.push({
      line: 4, vars: { right, ch: `'${ch}'`, left, [`freq['${ch}']`]: freq[ch] }, flashKey: `freq['${ch}']`,
      message: `Add '${ch}' to window - freq['${ch}']=${freq[ch]}.`,
      left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
    });

    while (freq[ch] > 1) {
      f.push({
        line: 5, vars: { right, ch: `'${ch}'`, left, [`freq['${ch}']`]: freq[ch] },
        message: `Duplicate! freq['${ch}']=${freq[ch]} > 1 - shrink from left.`,
        left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
      });
      const leaving = s[left];
      freq[leaving]--;
      f.push({
        line: 6, vars: { left, leaving: `'${leaving}'`, [`freq['${leaving}']`]: freq[leaving] }, flashKey: `freq['${leaving}']`,
        message: `Drop '${leaving}' from left - freq['${leaving}']=${freq[leaving]}.`,
        left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
      });
      left++;
      f.push({
        line: 7, vars: { left }, flashKey: "left",
        message: `left → ${left}.`,
        left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
      });
    }

    const winLen = right - left + 1;
    f.push({
      line: 8, vars: { left, right, winLen, best },
      message: `Window length = ${winLen}. Current best = ${best}.`,
      left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
    });
    if (winLen > best) {
      best = winLen;
      bestLo = left;
      bestHi = right;
      f.push({
        line: 9, vars: { best, bestLo, bestHi }, flashKey: "best",
        message: `New best! "${s.slice(bestLo, bestHi + 1)}" length=${best}.`,
        left, right, states: states(left, right), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
      });
    }
  }

  f.push({
    line: 10, vars: { best, bestSubstring: `"${s.slice(bestLo, bestHi + 1)}"` }, flashKey: "best",
    message: `Done. Longest unique substring = "${s.slice(bestLo, bestHi + 1)}" (length ${best}).`,
    left, right: n - 1, states: states(left, n - 1), freq: { ...freq }, best: s.slice(bestLo, bestHi + 1), bestLo, bestHi,
  });
  return f;
}

/* ------------------------------------------------------------------ */
/*  Visualize                                                          */
/* ------------------------------------------------------------------ */

function VisualizeTab() {
  const [inputStr, setInputStr] = useState("abcabcbb");
  const s = inputStr.slice(0, 18);
  const frames = useMemo(() => buildFrames(s), [s]);
  const player = useStepPlayer(frames);
  const frame = player.current!;

  return (
    <AlgoCanvas
      title="Longest Substring Without Repeating Characters"
      player={player}
      input={
        <InputEditor
          label="Input string"
          value={inputStr}
          placeholder="e.g. abcabcbb"
          helper="Up to 18 characters. Watch the window slide & shrink."
          presets={[
            { label: "abcabcbb", value: "abcabcbb" },
            { label: "bbbbb", value: "bbbbb" },
            { label: "pwwkew", value: "pwwkew" },
            { label: "dvdf", value: "dvdf" },
            { label: "all unique", value: "abcdefg" },
          ]}
          onApply={(v) => setInputStr(v)}
          onRandom={() => {
            const chars = "abcde";
            const L = 6 + Math.floor(Math.random() * 6);
            let out = "";
            for (let i = 0; i < L; i++) out += chars[Math.floor(Math.random() * chars.length)];
            setInputStr(out);
          }}
        />
      }
      pseudocode={<PseudocodePanel lines={PSEUDO} activeLine={frame.line} />}
      variables={<VariablesPanel vars={frame.vars} flashKeys={frame.flashKey ? [frame.flashKey] : []} />}
    >
      <SlidingWindowViz frame={frame} s={s} />
    </AlgoCanvas>
  );
}

function SlidingWindowViz({ frame, s }: { frame: Frame; s: string }) {
  const chars = s.split("");
  const pointers: Record<string, number> = {};
  if (frame.left >= 0 && frame.left < s.length) pointers["left"] = frame.left;
  if (frame.right >= 0 && frame.right < s.length) pointers["right"] = frame.right;

  const freqEntries = Object.entries(frame.freq).filter(([, v]) => v > 0);
  const maxF = Math.max(1, ...freqEntries.map(([, v]) => v));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <MemoryCells values={chars} states={frame.states} pointers={pointers} cellWidth={44} />

      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: 14 }}>
        <div style={{
          border: "1px solid var(--eng-border)", borderRadius: 10, padding: 12,
          background: "var(--eng-surface)",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Window State
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: "0.7rem", color: "var(--eng-text-muted)" }}>Current:</span>
            <span style={{
              fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "1rem", fontWeight: 700,
              color: "var(--eng-primary)",
              background: "rgba(139,92,246,0.12)", padding: "2px 8px", borderRadius: 6,
              border: "1px solid rgba(139,92,246,0.3)",
            }}>
              {frame.right >= frame.left ? `"${s.slice(frame.left, frame.right + 1)}"` : "\"\""}
            </span>
            <span style={{ fontSize: "0.72rem", color: "var(--eng-text-muted)" }}>
              len = {Math.max(0, frame.right - frame.left + 1)}
            </span>
          </div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
            Char Frequency
          </div>
          {freqEntries.length === 0 ? (
            <div style={{ fontSize: "0.75rem", color: "var(--eng-text-muted)", fontStyle: "italic" }}>empty</div>
          ) : (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, minHeight: 68 }}>
              {freqEntries.map(([c, v]) => {
                const h = 14 + (v / maxF) * 42;
                const dup = v > 1;
                return (
                  <div key={c} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                    <div style={{
                      width: 26, height: h,
                      background: dup ? "var(--eng-danger)" : "var(--eng-primary)",
                      borderRadius: "4px 4px 0 0",
                      transition: "height 0.3s ease, background 0.3s ease",
                      color: "#fff", fontSize: "0.7rem", fontWeight: 800, fontFamily: '"SF Mono", Menlo, Consolas, monospace',
                      display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 3,
                    }}>
                      {v}
                    </div>
                    <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--eng-text)", fontFamily: '"SF Mono", Menlo, Consolas, monospace' }}>
                      '{c}'
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{
          border: "2px solid var(--eng-success)", borderRadius: 10, padding: 12,
          background: "rgba(16,185,129,0.06)",
        }}>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--eng-success)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Best Answer So Far
          </div>
          <div style={{
            fontFamily: '"SF Mono", Menlo, Consolas, monospace',
            fontSize: "1.4rem", fontWeight: 800, color: "var(--eng-success)",
            marginBottom: 4,
          }}>
            {frame.best ? `"${frame.best}"` : "-"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
            length = <b style={{ color: "var(--eng-text)" }}>{frame.best.length}</b>
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--eng-text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Updated only when a new window strictly beats the previous record.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learn                                                              */
/* ------------------------------------------------------------------ */

function LearnTab() {
  const sections = [
    { title: "What is an advanced sliding window?", body: "Fixed-size windows are easy - you slide a ruler of width k across the array. 'Advanced' means the window's width is not fixed; it grows while a condition holds and shrinks the instant the condition breaks. Two pointers, one moving pattern." },
    { title: "The grow–shrink loop", body: "Right pointer extends by 1 each outer iteration. If the window now violates the invariant (duplicate char, sum over budget, more than k distinct chars, …), the left pointer advances until the invariant is restored. Every index is visited at most twice → O(n)." },
    { title: "The state you must track", body: "A hash map (character frequency, sum, count of distinct) that updates in O(1) when right adds a char and when left removes one. This auxiliary structure is what lets 'check the condition' stay constant-time." },
    { title: "Classic variants", body: "Longest substring without repeats, minimum window substring (Leetcode hard), longest substring with at most k distinct, smallest subarray with sum ≥ S, fruit into baskets, permutation-in-string. Same skeleton, different invariant." },
  ];
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="card-eng" style={{ padding: 18 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 6px" }}>Mental model</h3>
        <p style={{ fontSize: "0.9rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Imagine a rubber band stretched across two fingers on a row of beads. The right finger advances bead-by-bead; whenever the beads inside the band break a rule, the left finger catches up until the rule is restored. The band is your &ldquo;window of validity.&rdquo;
        </p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {sections.map((s, i) => (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--eng-primary)", marginBottom: 4 }}>0{i + 1}</div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--eng-text)", marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--eng-text-muted)", lineHeight: 1.55 }}>{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Try                                                                */
/* ------------------------------------------------------------------ */

function TryTab() {
  const problems = [
    { q: "Longest unique substring of \"abba\".", a: "2" },
    { q: "Longest unique substring of \"tmmzuxt\".", a: "5" },
    { q: "For \"aabacbebebe\", length of longest substring with exactly 3 distinct chars?", a: "7" },
    { q: "Smallest subarray length with sum ≥ 11 from [1,4,4,2,3,2].", a: "3" },
  ];
  const [guesses, setGuesses] = useState<string[]>(problems.map(() => ""));
  const [shown, setShown] = useState<boolean[]>(problems.map(() => false));

  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="info-eng" style={{ fontSize: "0.85rem" }}>
        Trace the window mentally: start with left = right = 0, grow right, shrink left when the invariant breaks.
      </div>
      {problems.map((p, i) => {
        const correct = guesses[i].trim() === p.a;
        return (
          <div key={i} className="card-eng" style={{ padding: 14 }}>
            <div style={{ fontSize: "0.88rem", color: "var(--eng-text)", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: "var(--eng-text-muted)" }}>#{i + 1}. </span>{p.q}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <input
                type="text" value={guesses[i]}
                onChange={(e) => { const v = [...guesses]; v[i] = e.target.value; setGuesses(v); }}
                placeholder="your answer"
                style={{ width: 100, padding: "6px 8px", borderRadius: 6, border: "1px solid var(--eng-border)", fontFamily: '"SF Mono", Menlo, Consolas, monospace', fontSize: "0.85rem" }}
              />
              <button onClick={() => { const v = [...shown]; v[i] = true; setShown(v); }} className="btn-eng-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }}>
                Reveal
              </button>
              {shown[i] && (
                <span style={{
                  fontSize: "0.82rem", fontWeight: 700,
                  color: correct ? "var(--eng-success)" : "var(--eng-danger)",
                  padding: "3px 10px", borderRadius: 6,
                  background: correct ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                }}>
                  {correct ? `Correct - ${p.a}` : `Answer: ${p.a}`}
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
/*  Insight                                                            */
/* ------------------------------------------------------------------ */

function InsightTab() {
  return (
    <div style={{ fontFamily: "var(--eng-font)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Why it&apos;s O(n), not O(n²)</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          The inner <code style={{ fontFamily: "monospace" }}>while</code> loop looks scary, but <code style={{ fontFamily: "monospace" }}>left</code> only ever moves forward - never reset. Across the whole scan, <code style={{ fontFamily: "monospace" }}>left</code> advances at most n times, <code style={{ fontFamily: "monospace" }}>right</code> advances at most n times. Total work is 2n, not n × n.
        </p>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview playbook</h3>
        <ul style={{ fontSize: "0.86rem", color: "var(--eng-text-muted)", lineHeight: 1.7, paddingLeft: 20, margin: 0 }}>
          <li>Identify the invariant (&ldquo;all chars unique&rdquo;, &ldquo;sum ≤ k&rdquo;).</li>
          <li>Pick a state summary that updates in O(1) when right adds / left removes.</li>
          <li>Outer loop: right 0..n−1. Inner while: shrink until invariant restored.</li>
          <li>Update the best answer after every valid extension.</li>
        </ul>
      </div>
      <div className="card-eng" style={{ padding: 16 }}>
        <h3 style={{ fontWeight: 700, fontSize: "1rem", margin: "0 0 6px" }}>Interview trap</h3>
        <p style={{ fontSize: "0.88rem", color: "var(--eng-text-muted)", lineHeight: 1.6, margin: 0 }}>
          Many students count the worst case as O(n²) by multiplying outer and inner loops. Amortized analysis (pointer never decreases) gives the correct O(n). Be ready to justify this out loud.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Activity                                                           */
/* ------------------------------------------------------------------ */

export default function DSA_L8_SlidingWindowAdvancedActivity() {
  const tabs: EngTabDef[] = [
    { id: "learn", label: "Learn", icon: <BookOpen className="w-4 h-4" />, content: <LearnTab /> },
    { id: "visualize", label: "Visualize", icon: <Play className="w-4 h-4" />, content: <VisualizeTab /> },
    { id: "try", label: "Try It", icon: <Target className="w-4 h-4" />, content: <TryTab /> },
    { id: "insight", label: "Insight", icon: <Lightbulb className="w-4 h-4" />, content: <InsightTab /> },
  ];
  const quiz: EngQuizQuestion[] = [
    {
      question: "What is the time complexity of the sliding-window longest-unique-substring algorithm on a string of length n?",
      options: ["O(n log n)", "O(n²)", "O(n) - amortized, each pointer moves at most n times", "O(n · 26)"],
      correctIndex: 2,
      explanation: "left and right each advance at most n steps in total. The inner while does not restart left - so the total work is O(n).",
    },
    {
      question: "You are solving 'longest substring with at most k distinct characters.' When does the window shrink?",
      options: [
        "Every iteration, to keep size constant",
        "When the count of distinct characters inside exceeds k",
        "When the current character is a vowel",
        "Only at the end",
      ],
      correctIndex: 1,
      explanation: "The invariant is 'at most k distinct'. While distinctCount > k, advance left (decrementing freq) until distinctCount ≤ k.",
    },
    {
      question: "In the minimum-window-substring problem, why do we keep a 'matched' counter instead of comparing maps every step?",
      options: [
        "Maps cannot be compared in JavaScript",
        "To turn each add/remove into O(1) instead of O(|alphabet|)",
        "Because the window is always size 26",
        "It has no effect on complexity",
      ],
      correctIndex: 1,
      explanation: "Maintaining a counter of already-matched characters lets each step update state in O(1). Comparing full maps per step would be O(|alphabet|) per step.",
    },
    {
      question: "For input \"pwwkew\", after the first duplicate ('w' at index 2) appears, where does left land?",
      options: ["0", "1", "2", "3"],
      correctIndex: 2,
      explanation: "When right=2 sees 'w' (freq=2), we drop s[0]='p' (left=1) - still freq['w']=2, drop s[1]='w' (left=2) - now freq['w']=1, invariant restored.",
    },
  ];
  return (
    <EngineeringLessonShell
      title="Sliding Window (Advanced)"
      level={8}
      lessonNumber={1}
      tabs={tabs}
      quiz={quiz}
      placementRelevance="Very high - the #1 string-subarray pattern in interviews"
      nextLessonHint="Binary Search on Answer"
    />
  );
}
