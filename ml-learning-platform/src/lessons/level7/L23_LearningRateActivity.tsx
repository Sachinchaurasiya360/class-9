import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { SlidersHorizontal, Zap, TrendingDown } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ---- helpers ---- */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* Smooth loss curve with one minimum near x=0.55 */
function lossFn(x: number): number {
  const t = x - 0.55;
  return 3.0 * t * t * t * t - 1.5 * t * t + 0.4 * t + 0.9;
}

function lossGrad(x: number): number {
  const t = x - 0.55;
  return 4 * 3.0 * t * t * t - 2 * 1.5 * t + 0.4;
}

/* Bumpy curve with local minima for momentum demo */
function bumpyLoss(x: number): number {
  const t = x - 0.3;
  return 2.0 * t * t + 0.25 * Math.sin(x * 18) + 0.6;
}

function bumpyGrad(x: number): number {
  const t = x - 0.3;
  return 4.0 * t + 0.25 * 18 * Math.cos(x * 18);
}

/* SVG mapping */
const W = 460;
const H = 240;
const PAD = 40;
function xToSvg(x: number): number { return PAD + x * (W - 2 * PAD); }
function yToSvg(y: number, minY: number, maxY: number): number {
  return PAD + (1 - (y - minY) / (maxY - minY)) * (H - 2 * PAD);
}

function buildPath(fn: (x: number) => number, minY: number, maxY: number): string {
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    const sx = xToSvg(x);
    const sy = yToSvg(fn(x), minY, maxY);
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Learning Rate Tuning                                      */
/* ------------------------------------------------------------------ */
function LRTuningTab() {
  const [lrIdx, setLrIdx] = useState(3);
  const lrValues = [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1.0];
  const lr = lrValues[lrIdx];

  const [ballX, setBallX] = useState(0.05);
  const [losses, setLosses] = useState<number[]>([lossFn(0.05)]);
  const [running, setRunning] = useState(false);
  const animRef = useRef<number | null>(null);

  const handleRun = useCallback(() => {
    playClick();
    setBallX(0.05);
    setLosses([lossFn(0.05)]);
    setRunning(true);
    let cx = 0.05;
    let step = 0;
    const maxSteps = 50;
    const collected: number[] = [lossFn(0.05)];

    const tick = () => {
      const grad = lossGrad(cx);
      cx = cx - lr * grad;
      step++;
      const loss = lossFn(clamp(cx, 0, 1));
      collected.push(loss);
      setBallX(clamp(cx, 0, 1));
      setLosses([...collected]);

      if (step < maxSteps && cx > 0 && cx < 1 && loss < 5) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        if (loss < 0.7) playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [lr]);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const minY = 0.2;
  const maxY = 2.0;
  const lossLabel = lr < 0.01 ? "Too small!" : lr > 0.4 ? "Too large!" : "Good range";
  const lossColor = lr < 0.01 ? "text-amber-600" : lr > 0.4 ? "text-red-600" : "text-green-600";

  /* Loss chart */
  const LCH = 80;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Adjust the learning rate slider, then click <strong>Run</strong> to watch the ball descend.
      </p>

      {/* LR slider */}
      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-slate-500">LR:</span>
        <input
          type="range"
          min={0} max={lrValues.length - 1} step={1}
          value={lrIdx}
          onChange={(e) => { setLrIdx(Number(e.target.value)); playPop(); }}
          className="w-48 accent-indigo-600"
          disabled={running}
        />
        <span className={`text-sm font-bold ${lossColor}`}>{lr}</span>
        <span className={`text-xs font-medium ${lossColor}`}>{lossLabel}</span>
      </div>

      {/* Curve */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        <path d={buildPath(lossFn, minY, maxY)} fill="none" stroke="#6366f1" strokeWidth={2.5} />
        <circle
          cx={xToSvg(ballX)} cy={yToSvg(lossFn(ballX), minY, maxY)}
          r={7} fill="#f59e0b" stroke="#b45309" strokeWidth={2}
          className="transition-all duration-75"
        />
        <text x={W - PAD} y={PAD - 6} textAnchor="end" className="text-[10px] fill-slate-600 font-medium">
          Loss: {lossFn(ballX).toFixed(3)}
        </text>
      </svg>

      {/* Loss over steps */}
      {losses.length > 1 && (
        <svg viewBox={`0 0 ${W} ${LCH}`} className="w-full max-w-[500px] mx-auto bg-white rounded-xl border border-slate-200">
          <text x={W / 2} y={12} textAnchor="middle" className="text-[9px] fill-slate-500">Loss over steps</text>
          <polyline
            points={losses.map((l, i) => {
              const sx = PAD + (i / Math.max(losses.length - 1, 1)) * (W - 2 * PAD);
              const sy = 20 + (1 - (clamp(l, minY, maxY) - minY) / (maxY - minY)) * (LCH - 28);
              return `${sx.toFixed(1)},${sy.toFixed(1)}`;
            }).join(" ")}
            fill="none" stroke="#6366f1" strokeWidth={1.5}
          />
        </svg>
      )}

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Running..." : "Run"}
        </button>
      </div>

      <InfoBox variant="blue" title="Goldilocks LR">
        The learning rate controls step size. Too small = slow convergence. Too large = overshooting. Finding the &quot;just right&quot; value is one of the most important choices in training.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Momentum Explained                                        */
/* ------------------------------------------------------------------ */
function MomentumTab() {
  const [momentum, setMomentum] = useState(0.0);
  const [pathNoM, setPathNoM] = useState<number[]>([0.95]);
  const [pathWithM, setPathWithM] = useState<number[]>([0.95]);
  const [running, setRunning] = useState(false);
  const animRef = useRef<number | null>(null);

  const lr = 0.012;
  const minY = 0.3;
  const maxY = 1.8;

  const handleRun = useCallback(() => {
    playClick();
    setRunning(true);
    let xNoM = 0.95;
    let xWithM = 0.95;
    let velNoM = 0;
    let velWithM = 0;
    let step = 0;
    const pNoM: number[] = [0.95];
    const pWithM: number[] = [0.95];

    const tick = () => {
      const gNoM = bumpyGrad(xNoM);
      velNoM = -lr * gNoM;
      xNoM = clamp(xNoM + velNoM, 0.01, 0.99);
      pNoM.push(xNoM);

      const gWithM = bumpyGrad(xWithM);
      velWithM = momentum * velWithM - lr * gWithM;
      xWithM = clamp(xWithM + velWithM, 0.01, 0.99);
      pWithM.push(xWithM);

      step++;
      setPathNoM([...pNoM]);
      setPathWithM([...pWithM]);

      if (step < 80) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [momentum]);

  const handleReset = useCallback(() => {
    playPop();
    setPathNoM([0.95]);
    setPathWithM([0.95]);
    setRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const lastNoM = pathNoM[pathNoM.length - 1];
  const lastWithM = pathWithM[pathWithM.length - 1];

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        The bumpy curve has local minima. Without momentum the ball gets stuck. Increase momentum and see the difference!
      </p>

      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs text-slate-500">Momentum:</span>
        <input
          type="range" min={0} max={99} step={1}
          value={Math.round(momentum * 100)}
          onChange={(e) => { setMomentum(Number(e.target.value) / 100); playPop(); }}
          className="w-48 accent-indigo-600"
          disabled={running}
        />
        <span className="text-sm font-bold text-indigo-700">{momentum.toFixed(2)}</span>
      </div>

      {/* Side-by-side curves */}
      <div className="grid grid-cols-2 gap-2">
        {/* No momentum */}
        <div>
          <p className="text-xs text-center text-slate-500 mb-1 font-medium">No Momentum</p>
          <svg viewBox={`0 0 ${W / 2} ${H}`} className="w-full bg-slate-50 rounded-lg border border-slate-200">
            <path d={(() => {
              const pts: string[] = [];
              for (let i = 0; i <= 100; i++) {
                const x = i / 100;
                const sx = 20 + x * (W / 2 - 40);
                const sy = yToSvg(bumpyLoss(x), minY, maxY);
                pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
              }
              return pts.join(" ");
            })()} fill="none" stroke="#94a3b8" strokeWidth={2} />
            <circle
              cx={20 + lastNoM * (W / 2 - 40)} cy={yToSvg(bumpyLoss(lastNoM), minY, maxY)}
              r={6} fill="#ef4444" stroke="#b91c1c" strokeWidth={1.5}
            />
          </svg>
          <p className="text-[10px] text-center text-slate-500 mt-1">Loss: {bumpyLoss(lastNoM).toFixed(3)}</p>
        </div>

        {/* With momentum */}
        <div>
          <p className="text-xs text-center text-slate-500 mb-1 font-medium">With Momentum ({momentum.toFixed(2)})</p>
          <svg viewBox={`0 0 ${W / 2} ${H}`} className="w-full bg-slate-50 rounded-lg border border-slate-200">
            <path d={(() => {
              const pts: string[] = [];
              for (let i = 0; i <= 100; i++) {
                const x = i / 100;
                const sx = 20 + x * (W / 2 - 40);
                const sy = yToSvg(bumpyLoss(x), minY, maxY);
                pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
              }
              return pts.join(" ");
            })()} fill="none" stroke="#94a3b8" strokeWidth={2} />
            <circle
              cx={20 + lastWithM * (W / 2 - 40)} cy={yToSvg(bumpyLoss(lastWithM), minY, maxY)}
              r={6} fill="#22c55e" stroke="#15803d" strokeWidth={1.5}
            />
          </svg>
          <p className="text-[10px] text-center text-slate-500 mt-1">Loss: {bumpyLoss(lastWithM).toFixed(3)}</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Running..." : "Run Both"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      <InfoBox variant="amber" title="Momentum = Memory">
        Momentum adds a &quot;memory&quot; of past steps. Like a skateboard carrying speed, it helps the ball roll through small bumps (local minima) to find the true bottom (global minimum).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Learning Rate Schedules                                   */
/* ------------------------------------------------------------------ */
function SchedulesTab() {
  const totalEpochs = 60;
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const animRef = useRef<number | null>(null);

  const schedules = useMemo(() => {
    const constant: number[] = [];
    const stepDecay: number[] = [];
    const cosine: number[] = [];
    const initLr = 0.5;
    for (let e = 0; e < totalEpochs; e++) {
      constant.push(initLr);
      stepDecay.push(initLr * Math.pow(0.5, Math.floor(e / 15)));
      cosine.push(initLr * 0.5 * (1 + Math.cos(Math.PI * e / totalEpochs)));
    }
    return { constant, stepDecay, cosine };
  }, []);

  /* Simulate loss for each schedule */
  const losses = useMemo(() => {
    const lossConst: number[] = [];
    const lossStep: number[] = [];
    const lossCos: number[] = [];
    let xC = 0.05, xS = 0.05, xCos = 0.05;
    for (let e = 0; e < totalEpochs; e++) {
      const gC = lossGrad(xC);
      xC = clamp(xC - schedules.constant[e] * gC * 0.15, 0, 1);
      lossConst.push(lossFn(xC));

      const gS = lossGrad(xS);
      xS = clamp(xS - schedules.stepDecay[e] * gS * 0.15, 0, 1);
      lossStep.push(lossFn(xS));

      const gCos = lossGrad(xCos);
      xCos = clamp(xCos - schedules.cosine[e] * gCos * 0.15, 0, 1);
      lossCos.push(lossFn(xCos));
    }
    return { constant: lossConst, stepDecay: lossStep, cosine: lossCos };
  }, [schedules]);

  const handleAnimate = useCallback(() => {
    playClick();
    setStep(0);
    setRunning(true);
    let s = 0;
    const tick = () => {
      s++;
      setStep(s);
      if (s < totalEpochs) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, []);

  const colors = ["#ef4444", "#3b82f6", "#22c55e"];
  const names = ["Constant", "Step Decay", "Cosine Annealing"];
  const allLR = [schedules.constant, schedules.stepDecay, schedules.cosine];
  const allLoss = [losses.constant, losses.stepDecay, losses.cosine];

  const chartW = 460;
  const chartH = 110;

  function renderChart(data: number[][], maxVal: number, title: string) {
    return (
      <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full max-w-[500px] mx-auto bg-white rounded-xl border border-slate-200">
        <text x={chartW / 2} y={13} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">{title}</text>
        {data.map((d, di) => {
          const visible = d.slice(0, step);
          if (visible.length < 2) return null;
          const pts = visible.map((v, j) => {
            const sx = PAD + (j / (totalEpochs - 1)) * (chartW - 2 * PAD);
            const sy = 22 + (1 - v / maxVal) * (chartH - 30);
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
          }).join(" ");
          return <polyline key={di} points={pts} fill="none" stroke={colors[di]} strokeWidth={1.5} />;
        })}
        {/* Legend */}
        {names.map((n, i) => (
          <g key={n}>
            <line x1={PAD + 5} y1={chartH - 10 + i * 0} x2={PAD + 20} y2={chartH - 10} stroke={colors[i]} strokeWidth={2} style={{ display: i === 0 ? "block" : "none" }} />
          </g>
        ))}
      </svg>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Compare three learning rate schedules. Click <strong>Animate</strong> to watch them over {totalEpochs} epochs.
      </p>

      {/* Legend */}
      <div className="flex gap-4 justify-center">
        {names.map((n, i) => (
          <div key={n} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
            <span className="text-xs text-slate-600">{n}</span>
          </div>
        ))}
      </div>

      {/* LR over epochs */}
      {renderChart(allLR, 0.55, "Learning Rate vs Epoch")}

      {/* Loss over epochs */}
      {renderChart(allLoss, 2.0, "Loss vs Epoch")}

      <div className="text-center text-xs text-slate-500">Epoch: {step} / {totalEpochs}</div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleAnimate}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Animating..." : "Animate"}
        </button>
      </div>

      <InfoBox variant="indigo" title="Why Schedules?">
        <strong>Constant:</strong> same LR throughout — risky.
        <br />
        <strong>Step Decay:</strong> big jumps early, then fine-tuning with smaller steps.
        <br />
        <strong>Cosine Annealing:</strong> smoothly reduces LR, often giving the best results.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What happens if the learning rate is too small?",
    options: ["The model diverges", "Training converges very slowly", "The model overfits immediately", "Gradient becomes zero"],
    correctIndex: 1,
    explanation: "A very small learning rate means tiny steps, so the model takes forever to reach the minimum.",
  },
  {
    question: "What does momentum help with?",
    options: ["Making the model larger", "Escaping local minima", "Increasing the learning rate", "Reducing the dataset size"],
    correctIndex: 1,
    explanation: "Momentum carries speed from previous steps, helping the ball roll through small bumps (local minima) to find the global minimum.",
  },
  {
    question: "In cosine annealing, how does the learning rate change?",
    options: ["It stays constant", "It increases over time", "It smoothly decreases following a cosine curve", "It randomly fluctuates"],
    correctIndex: 2,
    explanation: "Cosine annealing starts with a large learning rate and smoothly reduces it following a cosine curve shape.",
  },
  {
    question: "Why is step decay useful?",
    options: ["It makes training faster at the start and more precise at the end", "It increases the learning rate over time", "It removes the need for momentum", "It doubles the batch size"],
    correctIndex: 0,
    explanation: "Step decay uses a large learning rate initially for fast progress, then reduces it at set intervals for fine-tuning near the minimum.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L23_LearningRateActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "tuning",
        label: "Learning Rate Tuning",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <LRTuningTab />,
      },
      {
        id: "momentum",
        label: "Momentum Explained",
        icon: <Zap className="w-4 h-4" />,
        content: <MomentumTab />,
      },
      {
        id: "schedules",
        label: "LR Schedules",
        icon: <TrendingDown className="w-4 h-4" />,
        content: <SchedulesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Learning Rate & Momentum"
      level={7}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn about overfitting — when your model memorizes instead of learning!"
      story={
        <StorySection
          paragraphs={[
            "Byte showed Aru a skateboard perched at the top of a steep hill.",
            "Byte: \"Imagine rolling this skateboard down the hill. The learning rate is how hard you push it. Too gentle — it barely moves. Too hard — it flies right past the bottom!\"",
            "Aru: \"What about the bumps in the road? A small push might get stuck on one.\"",
            "Byte: \"That's where momentum comes in! Momentum is like the skateboard carrying speed from before. It helps you roll right through those small bumps and find the real bottom of the valley!\"",
            "Aru: \"So I need the right push AND enough rolling speed. Got it!\"",
          ]}
          conceptTitle="Learning Rate & Momentum"
          conceptSummary="The learning rate controls step size during gradient descent. Too small = slow, too large = unstable. Momentum adds 'memory' of previous steps, helping escape local minima and converge faster."
        />
      }
    />
  );
}
