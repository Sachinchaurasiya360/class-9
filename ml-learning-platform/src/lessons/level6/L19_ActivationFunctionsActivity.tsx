import { useState, useMemo, useCallback } from "react";
import { Activity, TrendingUp, Sliders } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Activation function helpers                                        */
/* ------------------------------------------------------------------ */

const step = (x: number) => (x >= 0 ? 1 : 0);
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const tanh_ = (x: number) => Math.tanh(x);
const relu = (x: number) => Math.max(0, x);

type AFn = { name: string; fn: (x: number) => number; color: string; range: [number, number] };

const activationFns: AFn[] = [
  { name: "Step", fn: step, color: "#ef4444", range: [-0.2, 1.2] },
  { name: "Sigmoid", fn: sigmoid, color: "#3b82f6", range: [-0.1, 1.1] },
  { name: "Tanh", fn: tanh_, color: "#8b5cf6", range: [-1.2, 1.2] },
  { name: "ReLU", fn: relu, color: "#22c55e", range: [-1, 5.5] },
];

/* ------------------------------------------------------------------ */
/*  Shared SVG mini-chart                                              */
/* ------------------------------------------------------------------ */

const CHART_W = 220;
const CHART_H = 140;
const CHART_PAD = 28;

function MiniChart({
  af,
  inputVal,
  showCursor,
}: {
  af: AFn;
  inputVal: number;
  showCursor: boolean;
}) {
  const xMin = -5, xMax = 5;
  const [yMin, yMax] = af.range;
  const toSX = (v: number) => CHART_PAD + ((v - xMin) / (xMax - xMin)) * (CHART_W - 2 * CHART_PAD);
  const toSY = (v: number) => CHART_H - CHART_PAD - ((v - yMin) / (yMax - yMin)) * (CHART_H - 2 * CHART_PAD);

  // Build path
  const points: string[] = [];
  for (let px = 0; px <= 80; px++) {
    const x = xMin + (px / 80) * (xMax - xMin);
    const y = af.fn(x);
    const clampedY = Math.max(yMin, Math.min(yMax, y));
    points.push(`${toSX(x).toFixed(1)},${toSY(clampedY).toFixed(1)}`);
  }
  const pathD = "M " + points.join(" L ");

  const cursorX = toSX(inputVal);
  const outVal = af.fn(inputVal);
  const cursorY = toSY(Math.max(yMin, Math.min(yMax, outVal)));

  return (
    <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full">
      {/* Background */}
      <rect x={CHART_PAD} y={CHART_PAD - 10} width={CHART_W - 2 * CHART_PAD} height={CHART_H - 2 * CHART_PAD + 10} fill="#f8fafc" stroke="#e2e8f0" rx={4} />
      {/* Zero lines */}
      <line x1={toSX(0)} y1={CHART_PAD - 10} x2={toSX(0)} y2={CHART_H - CHART_PAD} stroke="#cbd5e1" strokeWidth={0.5} />
      <line x1={CHART_PAD} y1={toSY(0)} x2={CHART_W - CHART_PAD} y2={toSY(0)} stroke="#cbd5e1" strokeWidth={0.5} />
      {/* Function curve */}
      <path d={pathD} fill="none" stroke={af.color} strokeWidth={2.5} strokeLinecap="round" />
      {/* Input cursor */}
      {showCursor && (
        <>
          <line x1={cursorX} y1={CHART_PAD - 10} x2={cursorX} y2={CHART_H - CHART_PAD} stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 2" />
          <circle cx={cursorX} cy={cursorY} r={5} fill={af.color} stroke="white" strokeWidth={2} />
          <text x={cursorX} y={cursorY - 10} textAnchor="middle" className="text-[9px] fill-slate-700 font-bold">
            {outVal.toFixed(2)}
          </text>
        </>
      )}
      {/* Title */}
      <text x={CHART_W / 2} y={14} textAnchor="middle" className="text-[11px] font-bold" fill={af.color}>
        {af.name}
      </text>
      {/* Axis labels */}
      <text x={CHART_W - CHART_PAD + 4} y={toSY(0) + 3} className="text-[8px] fill-slate-400">x</text>
      <text x={toSX(0) + 4} y={CHART_PAD - 12} className="text-[8px] fill-slate-400">y</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 — Meet the Functions                                         */
/* ------------------------------------------------------------------ */

function MeetFunctionsTab() {
  const [inputVal, setInputVal] = useState(0);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          Input value (x): <span className="font-bold text-indigo-700">{inputVal.toFixed(1)}</span>
        </label>
        <input
          type="range" min={-5} max={5} step={0.1} value={inputVal}
          onChange={(e) => { playPop(); setInputVal(parseFloat(e.target.value)); }}
          className="w-full accent-indigo-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400">
          <span>-5</span><span>0</span><span>5</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {activationFns.map((af) => (
          <div key={af.name} className="bg-white border border-slate-200 rounded-lg p-2">
            <MiniChart af={af} inputVal={inputVal} showCursor={true} />
            <div className="text-center mt-1">
              <span className="text-[10px] text-slate-500">f({inputVal.toFixed(1)}) = </span>
              <span className="text-xs font-bold" style={{ color: af.color }}>
                {af.fn(inputVal).toFixed(3)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <InfoBox variant="blue">
        Each activation function transforms the input differently. Step is binary (on/off), Sigmoid squishes values between 0 and 1, Tanh between -1 and 1, and ReLU passes positives through unchanged.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Why Not Linear?                                            */
/* ------------------------------------------------------------------ */

function WhyNotLinearTab() {
  const [numUnits, setNumUnits] = useState(3);
  const [showNonLinear, setShowNonLinear] = useState(false);

  const W = 480, H = 200, pad = 40;
  const xMin = -5, xMax = 5;
  const toSX = (v: number) => pad + ((v - xMin) / (xMax - xMin)) * (W - 2 * pad);

  // Linear composition: y = a1 * (a2 * x) is still linear
  const linearOut = useCallback((x: number) => {
    let v = x;
    for (let i = 0; i < numUnits; i++) v = 0.7 * v + 0.2;
    return v;
  }, [numUnits]);

  // ReLU composition: creates piecewise linear shapes
  const reluOut = useCallback((x: number) => {
    const shifts = [-2, -1, 0, 1, 2];
    let sum = 0;
    for (let i = 0; i < numUnits; i++) {
      const shifted = x - shifts[i % shifts.length];
      sum += relu(shifted) * (i % 2 === 0 ? 0.5 : -0.5);
    }
    return sum;
  }, [numUnits]);

  const computeFn = showNonLinear ? reluOut : linearOut;

  // Compute range for y
  const yVals: number[] = [];
  for (let px = 0; px <= 100; px++) {
    yVals.push(computeFn(xMin + (px / 100) * (xMax - xMin)));
  }
  const yMinVal = Math.min(...yVals, -1);
  const yMaxVal = Math.max(...yVals, 1);
  const yRange = yMaxVal - yMinVal || 1;
  const toSY = (v: number) => H - pad - ((v - yMinVal) / yRange) * (H - 2 * pad);

  const points: string[] = [];
  for (let px = 0; px <= 100; px++) {
    const x = xMin + (px / 100) * (xMax - xMin);
    points.push(`${toSX(x).toFixed(1)},${toSY(computeFn(x)).toFixed(1)}`);
  }
  const pathD = "M " + points.join(" L ");

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { playClick(); setShowNonLinear(false); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            !showNonLinear
              ? "bg-blue-600 text-white border-blue-600 shadow"
              : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
          }`}
        >
          Linear (y = ax + b)
        </button>
        <button
          onClick={() => { playClick(); setShowNonLinear(true); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            showNonLinear
              ? "bg-green-600 text-white border-green-600 shadow"
              : "bg-white text-slate-600 border-slate-200 hover:border-green-300"
          }`}
        >
          Non-linear (ReLU)
        </button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">
          Stacked units: <span className="font-bold text-indigo-700">{numUnits}</span>
        </label>
        <input
          type="range" min={1} max={5} step={1} value={numUnits}
          onChange={(e) => { playPop(); setNumUnits(parseInt(e.target.value)); }}
          className="w-full accent-indigo-600"
        />
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[480px] mx-auto">
        <rect x={pad} y={pad - 10} width={W - 2 * pad} height={H - 2 * pad + 10} fill="#f8fafc" stroke="#e2e8f0" rx={4} />
        {/* Zero lines */}
        <line x1={toSX(0)} y1={pad - 10} x2={toSX(0)} y2={H - pad} stroke="#cbd5e1" strokeWidth={0.5} />
        {yMinVal <= 0 && yMaxVal >= 0 && (
          <line x1={pad} y1={toSY(0)} x2={W - pad} y2={toSY(0)} stroke="#cbd5e1" strokeWidth={0.5} />
        )}
        <path d={pathD} fill="none" stroke={showNonLinear ? "#22c55e" : "#3b82f6"} strokeWidth={2.5} strokeLinecap="round" />
        <text x={W / 2} y={20} textAnchor="middle" className="text-[11px] fill-slate-600 font-semibold">
          {showNonLinear
            ? `${numUnits} ReLU units combined = complex shape`
            : `${numUnits} linear functions stacked = still a line`}
        </text>
      </svg>

      <InfoBox variant="amber" title="Why Non-Linearity Matters">
        {showNonLinear
          ? "Stacking non-linear functions like ReLU creates complex, piecewise curves. More units = more complexity. This is the power of neural networks!"
          : "No matter how many linear functions you stack, the result is still a straight line: a(b(cx + d) + e) + f is still linear. You can never model curves with only linear layers!"}
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Activation Playground                                      */
/* ------------------------------------------------------------------ */

type ActivationType = "sigmoid" | "relu" | "tanh";
const ACT_MAP: Record<ActivationType, (x: number) => number> = {
  sigmoid,
  relu,
  tanh: tanh_,
};
const ACT_COLORS: Record<ActivationType, string> = {
  sigmoid: "#3b82f6",
  relu: "#22c55e",
  tanh: "#8b5cf6",
};

function PlaygroundTab() {
  const [activation, setActivation] = useState<ActivationType>("sigmoid");

  // Simple 2-input, 2-hidden, 1-output network with fixed weights
  // but different activations to show how boundary changes
  const w_h = [[0.8, -0.6], [-0.5, 0.9]]; // 2 hidden neurons, 2 weights each
  const b_h = [-0.2, 0.1];
  const w_o = [1.0, -0.8]; // output weights
  const b_o = -0.1;

  const act = ACT_MAP[activation];

  const forward = useCallback(
    (x1: number, x2: number) => {
      const h0 = act(w_h[0][0] * x1 + w_h[0][1] * x2 + b_h[0]);
      const h1 = act(w_h[1][0] * x1 + w_h[1][1] * x2 + b_h[1]);
      return act(w_o[0] * h0 + w_o[1] * h1 + b_o);
    },
    [activation],
  );

  const plotSize = 260;
  const pad = 30;
  const gridRes = 30;
  const cellW = (plotSize - 2 * pad) / gridRes;

  const cells = useMemo(() => {
    const result: { x: number; y: number; val: number }[] = [];
    for (let i = 0; i < gridRes; i++) {
      for (let j = 0; j < gridRes; j++) {
        const x1 = -2 + (i / gridRes) * 4;
        const x2 = -2 + (j / gridRes) * 4;
        result.push({ x: i, y: j, val: forward(x1, x2) });
      }
    }
    return result;
  }, [forward]);

  const colorForVal = (v: number) => {
    const t = Math.max(0, Math.min(1, v));
    const r = Math.round(239 + (34 - 239) * t);
    const g = Math.round(68 + (197 - 68) * t);
    const b = Math.round(68 + (94 - 68) * t);
    return `rgb(${r},${g},${b})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 justify-center">
        {(["sigmoid", "relu", "tanh"] as ActivationType[]).map((a) => (
          <button
            key={a}
            onClick={() => { playClick(); setActivation(a); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all capitalize ${
              activation === a
                ? "text-white shadow"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
            }`}
            style={activation === a ? { backgroundColor: ACT_COLORS[a], borderColor: ACT_COLORS[a] } : {}}
          >
            {a}
          </button>
        ))}
      </div>

      {/* Network diagram */}
      <svg viewBox="0 0 400 120" className="w-full max-w-[400px] mx-auto">
        {/* Input nodes */}
        <circle cx={40} cy={35} r={16} fill="#f1f5f9" stroke="#64748b" strokeWidth={1.5} />
        <text x={40} y={39} textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">x1</text>
        <circle cx={40} cy={85} r={16} fill="#f1f5f9" stroke="#64748b" strokeWidth={1.5} />
        <text x={40} y={89} textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">x2</text>
        {/* Hidden nodes */}
        {[35, 85].map((y, i) => (
          <g key={i}>
            <line x1={58} y1={35} x2={170} y2={y} stroke="#94a3b8" strokeWidth={1} />
            <line x1={58} y1={85} x2={170} y2={y} stroke="#94a3b8" strokeWidth={1} />
            <circle cx={188} cy={y} r={16} fill={ACT_COLORS[activation]} opacity={0.2} />
            <circle cx={188} cy={y} r={12} fill={ACT_COLORS[activation]} />
            <text x={188} y={y + 4} textAnchor="middle" className="text-[9px] fill-white font-bold">h{i + 1}</text>
          </g>
        ))}
        {/* Output node */}
        <line x1={202} y1={35} x2={318} y2={60} stroke="#94a3b8" strokeWidth={1} />
        <line x1={202} y1={85} x2={318} y2={60} stroke="#94a3b8" strokeWidth={1} />
        <circle cx={336} cy={60} r={18} fill="#f1f5f9" stroke="#334155" strokeWidth={1.5} />
        <text x={336} y={64} textAnchor="middle" className="text-[10px] fill-slate-700 font-bold">out</text>
        {/* Labels */}
        <text x={40} y={12} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">INPUT</text>
        <text x={188} y={12} textAnchor="middle" className="text-[8px] font-medium" fill={ACT_COLORS[activation]}>
          HIDDEN ({activation.toUpperCase()})
        </text>
        <text x={336} y={35} textAnchor="middle" className="text-[8px] fill-slate-400 font-medium">OUTPUT</text>
      </svg>

      {/* Decision boundary heatmap */}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${plotSize} ${plotSize}`} className="w-64 h-64">
          {cells.map((c, i) => (
            <rect
              key={i}
              x={pad + c.x * cellW}
              y={pad + (gridRes - 1 - c.y) * cellW}
              width={cellW + 0.5}
              height={cellW + 0.5}
              fill={colorForVal(c.val)}
            />
          ))}
          <rect x={pad} y={pad} width={plotSize - 2 * pad} height={plotSize - 2 * pad} fill="none" stroke="#cbd5e1" />
          <text x={plotSize / 2} y={plotSize - 8} textAnchor="middle" className="text-[9px] fill-slate-500">x1</text>
          <text x={8} y={plotSize / 2} textAnchor="middle" className="text-[9px] fill-slate-500" transform={`rotate(-90 8 ${plotSize / 2})`}>x2</text>
          {/* Legend */}
          <rect x={plotSize - 60} y={pad} width={10} height={10} fill={colorForVal(0)} stroke="#cbd5e1" strokeWidth={0.5} />
          <text x={plotSize - 45} y={pad + 8} className="text-[8px] fill-slate-500">Low</text>
          <rect x={plotSize - 60} y={pad + 14} width={10} height={10} fill={colorForVal(1)} stroke="#cbd5e1" strokeWidth={0.5} />
          <text x={plotSize - 45} y={pad + 22} className="text-[8px] fill-slate-500">High</text>
        </svg>
      </div>

      <InfoBox variant="indigo">
        The same network with different activation functions produces different decision boundaries. Sigmoid creates smooth curves, ReLU creates sharp edges, and Tanh creates balanced regions. Try switching between them!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do neural networks need non-linear activation functions?",
    options: [
      "To make the code shorter",
      "Because linear functions stacked together are still linear",
      "To slow down computation",
      "They don't -- linear functions work fine",
    ],
    correctIndex: 1,
    explanation:
      "Stacking linear functions always gives another linear function. Non-linear activations let networks learn complex, curved decision boundaries.",
  },
  {
    question: "What is the output range of the Sigmoid function?",
    options: ["0 to infinity", "-1 to 1", "0 to 1", "-infinity to infinity"],
    correctIndex: 2,
    explanation: "Sigmoid squishes any input into a value between 0 and 1, making it useful for probabilities.",
  },
  {
    question: "What does ReLU do with negative inputs?",
    options: [
      "Outputs them unchanged",
      "Squares them",
      "Outputs zero",
      "Flips them to positive",
    ],
    correctIndex: 2,
    explanation:
      "ReLU (Rectified Linear Unit) outputs zero for negative inputs and passes positive inputs through unchanged: max(0, x).",
  },
  {
    question: "Which activation function acts like a simple on/off switch?",
    options: ["Sigmoid", "ReLU", "Tanh", "Step"],
    correctIndex: 3,
    explanation:
      "The Step function outputs 1 for positive inputs and 0 for negative inputs -- a binary on/off decision with no in-between.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function L19_ActivationFunctionsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "meet",
        label: "Meet the Functions",
        icon: <Activity className="w-4 h-4" />,
        content: <MeetFunctionsTab />,
      },
      {
        id: "why-not-linear",
        label: "Why Not Linear?",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <WhyNotLinearTab />,
      },
      {
        id: "playground",
        label: "Activation Playground",
        icon: <Sliders className="w-4 h-4" />,
        content: <PlaygroundTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Activation Functions"
      level={6}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Build a full neural network with multiple layers!"
      story={
        <StorySection
          paragraphs={[
            "Aru was thinking about the perceptron they built in the last lesson.",
            "Aru: \"The perceptron just fires or doesn't fire. It's like a light switch -- on or off. But real brains are more nuanced, right?\"",
            "Byte: \"Exactly! What if we want a dimmer instead of a switch? That's where activation functions come in. They control HOW MUCH a neuron fires, not just whether it fires.\"",
            "Aru: \"So instead of just yes or no, a neuron can say 'a little bit' or 'a lot'?\"",
            "Byte: \"Precisely! And the choice of activation function changes how the whole network behaves. Let me show you the most popular ones!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Activation functions introduce non-linearity into neural networks. Without them, stacking layers would be pointless -- you'd just get another linear function. Common activations include Step (binary), Sigmoid (0 to 1), Tanh (-1 to 1), and ReLU (zero out negatives)."
        />
      }
    />
  );
}
