import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Cpu, GitBranch, AlertTriangle } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Build a Perceptron                                         */
/* ------------------------------------------------------------------ */

function BuildPerceptronTab() {
  const [weights, setWeights] = useState([1.0, 0.5, -0.5]);
  const [bias, setBias] = useState(0);
  const [threshold, setThreshold] = useState(0.5);
  const [inputSet, setInputSet] = useState(0);

  const inputSets = useMemo(
    () => [
      [1, 0, 1],
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [],
  );

  const inputs = inputSets[inputSet];
  const weightedProducts = inputs.map((inp, i) => inp * weights[i]);
  const weightedSum = weightedProducts.reduce((a, b) => a + b, 0) + bias;
  const fires = weightedSum >= threshold;

  const handleWeightChange = useCallback((idx: number, val: number) => {
    playPop();
    setWeights((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  }, []);

  const nodeColors = ["#3b82f6", "#8b5cf6", "#06b6d4"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {inputSets.map((s, i) => (
          <button
            key={i}
            onClick={() => { playClick(); setInputSet(i); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
              inputSet === i
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            Inputs: [{s.join(", ")}]
          </button>
        ))}
      </div>

      <svg viewBox="0 0 560 260" className="w-full max-w-[560px] mx-auto">
        <defs>
          <marker id="ph-arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <path d="M0,0 L8,3 L0,6 Z" fill="#94a3b8" />
          </marker>
        </defs>

        {/* Input nodes */}
        {inputs.map((inp, i) => {
          const y = 50 + i * 80;
          return (
            <g key={i}>
              <circle cx={60} cy={y} r={28} fill={nodeColors[i]} opacity={0.15} />
              <circle cx={60} cy={y} r={22} fill={nodeColors[i]} />
              <text x={60} y={y + 5} textAnchor="middle" className="text-[14px] fill-white font-bold">
                {inp}
              </text>
              <text x={60} y={y - 30} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
                x{i + 1}
              </text>
              {/* Connection line */}
              <line x1={85} y1={y} x2={310} y2={130} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#ph-arrow)" />
              {/* Weight label on line */}
              <text
                x={160 + i * 20}
                y={90 + i * 15}
                textAnchor="middle"
                className="text-[10px] fill-indigo-600 font-bold"
              >
                w={weights[i].toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* Summation node */}
        <circle cx={340} cy={130} r={36} fill="#f8fafc" stroke="#334155" strokeWidth={2} />
        <text x={340} y={125} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
          Sum
        </text>
        <text x={340} y={142} textAnchor="middle" className="text-[13px] fill-slate-800 font-bold">
          {weightedSum.toFixed(2)}
        </text>

        {/* Arrow to output */}
        <line x1={378} y1={130} x2={440} y2={130} stroke="#94a3b8" strokeWidth={2} markerEnd="url(#ph-arrow)" />
        <text x={410} y={118} textAnchor="middle" className="text-[9px] fill-slate-400">
          {">="}{threshold.toFixed(1)}?
        </text>

        {/* Output node */}
        <circle cx={475} cy={130} r={30} fill={fires ? "#22c55e" : "#e2e8f0"} className="transition-all duration-300" />
        <text
          x={475}
          y={135}
          textAnchor="middle"
          className={`text-[14px] font-bold ${fires ? "fill-white" : "fill-slate-400"}`}
        >
          {fires ? "1" : "0"}
        </text>
        <text x={475} y={95} textAnchor="middle" className="text-[10px] fill-slate-500 font-medium">
          Output
        </text>
      </svg>

      {/* Calculation breakdown */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 font-mono leading-relaxed">
        {inputs.map((inp, i) => (
          <span key={i}>
            {inp} x {weights[i].toFixed(1)} = {weightedProducts[i].toFixed(2)}
            {i < inputs.length - 1 ? " + " : ""}
          </span>
        ))}
        {" + bias("}{bias.toFixed(1)}{") = "}
        <span className="font-bold text-indigo-700">{weightedSum.toFixed(2)}</span>
        {weightedSum >= threshold ? " >= " : " < "}
        {threshold.toFixed(1)}
        {" => "}
        <span className={`font-bold ${fires ? "text-green-600" : "text-red-500"}`}>
          {fires ? "FIRES!" : "Does not fire"}
        </span>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {weights.map((w, i) => (
          <div key={i} className="space-y-1">
            <label className="text-xs font-medium text-slate-600">
              Weight {i + 1}: <span className="font-bold">{w.toFixed(1)}</span>
            </label>
            <input
              type="range" min={-2} max={2} step={0.1} value={w}
              onChange={(e) => handleWeightChange(i, parseFloat(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Bias: <span className="font-bold">{bias.toFixed(1)}</span>
          </label>
          <input
            type="range" min={-2} max={2} step={0.1} value={bias}
            onChange={(e) => { playPop(); setBias(parseFloat(e.target.value)); }}
            className="w-full accent-indigo-600"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">
            Threshold: <span className="font-bold">{threshold.toFixed(1)}</span>
          </label>
          <input
            type="range" min={-2} max={3} step={0.1} value={threshold}
            onChange={(e) => { playPop(); setThreshold(parseFloat(e.target.value)); }}
            className="w-full accent-indigo-600"
          />
        </div>
      </div>

      <InfoBox variant="blue">
        A perceptron multiplies each input by its weight, adds them all up (plus the bias), and fires if the total meets the threshold. Adjust the sliders to see how the output changes!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — AND / OR Gates                                             */
/* ------------------------------------------------------------------ */

const TRUTH_TABLE: [number, number][] = [[0, 0], [0, 1], [1, 0], [1, 1]];
const AND_TARGETS = [0, 0, 0, 1];
const OR_TARGETS = [0, 1, 1, 1];

function GatesTab() {
  const [gate, setGate] = useState<"AND" | "OR">("AND");
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.5);
  const [b, setB] = useState(0.0);
  const [training, setTraining] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targets = gate === "AND" ? AND_TARGETS : OR_TARGETS;
  const lr = 0.1;

  const predict = useCallback(
    (x1: number, x2: number, cw1: number, cw2: number, cb: number) =>
      x1 * cw1 + x2 * cw2 + cb >= 0.5 ? 1 : 0,
    [],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2, w1, w2, b));
  const allCorrect = predictions.every((p, i) => p === targets[i]);

  const trainStep = useCallback(() => {
    setW1((pw1) => {
      let nw1 = pw1;
      let nw2 = w2;
      let nb = b;
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * nw1 + x2 * nw2 + nb >= 0.5) ? 1 : 0;
        const err = targets[i] - pred;
        nw1 += lr * err * x1;
        nw2 += lr * err * x2;
        nb += lr * err;
      }
      setW2(nw2);
      setB(nb);
      setEpoch((e) => e + 1);
      return nw1;
    });
  }, [w2, b, targets]);

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    let step = 0;
    const tick = () => {
      if (step >= 20) {
        setTraining(false);
        playSuccess();
        return;
      }
      trainStep();
      step++;
      timerRef.current = setTimeout(tick, 150);
    };
    tick();
  }, [trainStep]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.5);
    setW2(0.5);
    setB(0.0);
    setEpoch(0);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  // Decision boundary: w1*x + w2*y + b = 0.5 => y = (0.5 - b - w1*x) / w2
  const plotSize = 180;
  const pad = 30;
  const toX = (v: number) => pad + v * (plotSize - 2 * pad);
  const toY = (v: number) => plotSize - pad - v * (plotSize - 2 * pad);

  const lineY0 = w2 !== 0 ? (0.5 - b) / w2 : 0;
  const lineY1 = w2 !== 0 ? (0.5 - b - w1) / w2 : 0;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {(["AND", "OR"] as const).map((g) => (
          <button
            key={g}
            onClick={() => { playClick(); setGate(g); handleReset(); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              gate === g
                ? "bg-indigo-600 text-white border-indigo-600 shadow"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
          >
            {g} Gate
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Truth table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-1.5 text-slate-600">x1</th>
                <th className="px-3 py-1.5 text-slate-600">x2</th>
                <th className="px-3 py-1.5 text-slate-600">Target</th>
                <th className="px-3 py-1.5 text-slate-600">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {TRUTH_TABLE.map(([x1, x2], i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-center font-mono">{x1}</td>
                  <td className="px-3 py-1.5 text-center font-mono">{x2}</td>
                  <td className="px-3 py-1.5 text-center font-mono font-bold">{targets[i]}</td>
                  <td className={`px-3 py-1.5 text-center font-mono font-bold ${
                    predictions[i] === targets[i] ? "text-green-600" : "text-red-500"
                  }`}>
                    {predictions[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2D plot */}
        <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-44 h-44">
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="#f8fafc" stroke="#cbd5e1" />
          {/* Decision boundary line */}
          {Math.abs(w2) > 0.01 && (
            <line
              x1={toX(0)} y1={toY(lineY0)} x2={toX(1)} y2={toY(lineY1)}
              stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2"
            />
          )}
          {/* Data points */}
          {TRUTH_TABLE.map(([x1, x2], i) => (
            <circle
              key={i}
              cx={toX(x1)} cy={toY(x2)} r={8}
              fill={targets[i] === 1 ? "#22c55e" : "#ef4444"}
              stroke="white" strokeWidth={2}
            />
          ))}
          {/* Axis labels */}
          <text x={plotSize / 2} y={plotSize - 5} textAnchor="middle" className="text-[9px] fill-slate-500">x1</text>
          <text x={8} y={plotSize / 2} textAnchor="middle" className="text-[9px] fill-slate-500" transform={`rotate(-90 8 ${plotSize / 2})`}>x2</text>
        </svg>
      </div>

      <div className="text-center text-xs text-slate-600 font-mono">
        w1={w1.toFixed(2)} | w2={w2.toFixed(2)} | bias={b.toFixed(2)} | Epoch: {epoch}
        {allCorrect && <span className="ml-2 text-green-600 font-bold">All correct!</span>}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleTrain}
          disabled={training}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {training ? "Training..." : "Train"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Reset
        </button>
      </div>

      <InfoBox variant="green">
        A single perceptron can learn linear separations like AND and OR. The decision boundary is a straight line that separates the 1s from the 0s.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — The XOR Problem                                            */
/* ------------------------------------------------------------------ */

const XOR_TARGETS = [0, 1, 1, 0];

function XORTab() {
  const [w1, setW1] = useState(0.5);
  const [w2, setW2] = useState(0.5);
  const [b, setB] = useState(0.0);
  const [epoch, setEpoch] = useState(0);
  const [training, setTraining] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const predict = useCallback(
    (x1: number, x2: number) => (x1 * w1 + x2 * w2 + b >= 0.5 ? 1 : 0),
    [w1, w2, b],
  );

  const predictions = TRUTH_TABLE.map(([x1, x2]) => predict(x1, x2));
  const allCorrect = predictions.every((p, i) => p === XOR_TARGETS[i]);

  const handleTrain = useCallback(() => {
    playClick();
    setTraining(true);
    setMessage(null);
    let cw1 = w1, cw2 = w2, cb = b;
    let step = 0;
    const tick = () => {
      if (step >= 30) {
        setTraining(false);
        playError();
        setMessage("The perceptron could NOT learn XOR! No single straight line can separate these points. We need more layers!");
        return;
      }
      for (let i = 0; i < TRUTH_TABLE.length; i++) {
        const [x1, x2] = TRUTH_TABLE[i];
        const pred = (x1 * cw1 + x2 * cw2 + cb >= 0.5) ? 1 : 0;
        const err = XOR_TARGETS[i] - pred;
        cw1 += 0.1 * err * x1;
        cw2 += 0.1 * err * x2;
        cb += 0.1 * err;
      }
      setW1(cw1);
      setW2(cw2);
      setB(cb);
      setEpoch((e) => e + 1);
      step++;
      timerRef.current = setTimeout(tick, 120);
    };
    tick();
  }, [w1, w2, b]);

  const handleReset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setTraining(false);
    setW1(0.5);
    setW2(0.5);
    setB(0.0);
    setEpoch(0);
    setMessage(null);
    playClick();
  }, []);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const plotSize = 200;
  const pad = 30;
  const toX = (v: number) => pad + v * (plotSize - 2 * pad);
  const toY = (v: number) => plotSize - pad - v * (plotSize - 2 * pad);
  const lineY0 = Math.abs(w2) > 0.01 ? (0.5 - b) / w2 : 0;
  const lineY1 = Math.abs(w2) > 0.01 ? (0.5 - b - w1) / w2 : 0;

  return (
    <div className="space-y-4">
      <div className="text-center text-sm font-semibold text-slate-700">
        XOR Gate: Can a single perceptron learn it?
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
        {/* Truth table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <table className="text-xs">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-3 py-1.5 text-slate-600">x1</th>
                <th className="px-3 py-1.5 text-slate-600">x2</th>
                <th className="px-3 py-1.5 text-slate-600">XOR</th>
                <th className="px-3 py-1.5 text-slate-600">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {TRUTH_TABLE.map(([x1, x2], i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-1.5 text-center font-mono">{x1}</td>
                  <td className="px-3 py-1.5 text-center font-mono">{x2}</td>
                  <td className="px-3 py-1.5 text-center font-mono font-bold">{XOR_TARGETS[i]}</td>
                  <td className={`px-3 py-1.5 text-center font-mono font-bold ${
                    predictions[i] === XOR_TARGETS[i] ? "text-green-600" : "text-red-500"
                  }`}>
                    {predictions[i]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 2D plot showing XOR isn't linearly separable */}
        <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-48 h-48">
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="#f8fafc" stroke="#cbd5e1" />
          {/* Decision boundary */}
          {Math.abs(w2) > 0.01 && (
            <line
              x1={toX(0)} y1={toY(lineY0)} x2={toX(1)} y2={toY(lineY1)}
              stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2"
            />
          )}
          {/* Data points */}
          {TRUTH_TABLE.map(([x1, x2], i) => (
            <g key={i}>
              <circle
                cx={toX(x1)} cy={toY(x2)} r={10}
                fill={XOR_TARGETS[i] === 1 ? "#22c55e" : "#ef4444"}
                stroke="white" strokeWidth={2}
              />
              <text x={toX(x1)} y={toY(x2) + 4} textAnchor="middle" className="text-[10px] fill-white font-bold">
                {XOR_TARGETS[i]}
              </text>
            </g>
          ))}
          <text x={plotSize / 2} y={plotSize - 5} textAnchor="middle" className="text-[9px] fill-slate-500">x1</text>
          <text x={8} y={plotSize / 2} textAnchor="middle" className="text-[9px] fill-slate-500" transform={`rotate(-90 8 ${plotSize / 2})`}>x2</text>
        </svg>
      </div>

      <div className="text-center text-xs text-slate-600 font-mono">
        w1={w1.toFixed(2)} | w2={w2.toFixed(2)} | bias={b.toFixed(2)} | Epoch: {epoch}
        {allCorrect && <span className="ml-2 text-green-600 font-bold">Solved!</span>}
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleTrain}
          disabled={training}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-40 transition-all shadow-sm"
        >
          {training ? "Training..." : "Try to Train XOR"}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all"
        >
          Reset
        </button>
      </div>

      {message && (
        <div className="text-center text-sm font-semibold rounded-lg py-3 px-4 border bg-red-50 border-red-300 text-red-700 transition-all">
          {message}
        </div>
      )}

      <InfoBox variant="amber" title="The XOR Problem">
        A single perceptron draws ONE straight line. But XOR requires separating diagonal corners -- no single line can do that! This is why we need neural networks with multiple layers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a perceptron do with its inputs?",
    options: [
      "Adds them without modification",
      "Multiplies each by a weight, sums them, and checks a threshold",
      "Picks the largest input",
      "Randomly decides an output",
    ],
    correctIndex: 1,
    explanation:
      "A perceptron multiplies each input by its weight, sums the products plus a bias, and fires if the total meets the threshold.",
  },
  {
    question: "Which logic gate can a single perceptron NOT learn?",
    options: ["AND", "OR", "XOR", "NOT"],
    correctIndex: 2,
    explanation:
      "XOR is not linearly separable -- no single straight line can separate the 1s from the 0s, so a single perceptron fails.",
  },
  {
    question: "What is the role of the bias in a perceptron?",
    options: [
      "It makes the perceptron run faster",
      "It shifts the decision boundary",
      "It removes noise from inputs",
      "It doubles the weights",
    ],
    correctIndex: 1,
    explanation:
      "The bias shifts the decision boundary, allowing the perceptron to fire even when all inputs are zero.",
  },
  {
    question: "What does the decision boundary of a single perceptron look like?",
    options: [
      "A curved line",
      "A straight line",
      "A circle",
      "A zigzag",
    ],
    correctIndex: 1,
    explanation:
      "A single perceptron produces a linear decision boundary -- a straight line (or hyperplane in higher dimensions).",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L18_PerceptronActivity() {
  const rngRef = useRef(mulberry32(18));
  void rngRef.current;

  const tabs = useMemo(
    () => [
      {
        id: "build",
        label: "Build a Perceptron",
        icon: <Cpu className="w-4 h-4" />,
        content: <BuildPerceptronTab />,
      },
      {
        id: "gates",
        label: "AND / OR Gates",
        icon: <GitBranch className="w-4 h-4" />,
        content: <GatesTab />,
      },
      {
        id: "xor",
        label: "The XOR Problem",
        icon: <AlertTriangle className="w-4 h-4" />,
        content: <XORTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="The Perceptron"
      level={6}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover activation functions -- how neurons decide to fire!"
      story={
        <StorySection
          paragraphs={[
            "Aru was staring at a diagram of the human brain, fascinated by the billions of tiny neurons firing signals to each other.",
            "Aru: \"What's the simplest brain cell a computer can have?\"",
            "Byte: \"Great question! It's called a perceptron! Imagine a circle with arrows coming in. It takes inputs, multiplies each by a weight, adds them all up, and if the total is big enough -- it fires! Like a tiny decision maker.\"",
            "Aru: \"So it's like a neuron that says YES or NO?\"",
            "Byte: \"Exactly! And by adjusting the weights, you can teach it to make different decisions. Let's build one!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A perceptron is the simplest neural unit. It takes weighted inputs, sums them with a bias, and compares to a threshold to decide whether to fire (output 1) or not (output 0). It can learn linearly separable problems like AND and OR, but fails on XOR."
        />
      }
    />
  );
}
