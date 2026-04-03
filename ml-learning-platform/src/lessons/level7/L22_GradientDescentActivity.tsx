import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { ArrowDown, Gauge, Map } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ---- helpers ---- */
function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

/* 1D loss curve: a smooth polynomial with one minimum near x=0.6 */
function lossFn(x: number): number {
  const t = x - 0.6;
  return 2.5 * t * t * t * t - 1.2 * t * t + 0.5 * t + 1.0;
}

function lossGrad(x: number): number {
  const t = x - 0.6;
  return 4 * 2.5 * t * t * t - 2 * 1.2 * t + 0.5;
}

/* Map x [0,1] to SVG coords */
const W = 460;
const H = 260;
const PAD = 40;
function xToSvg(x: number): number {
  return PAD + x * (W - 2 * PAD);
}
function yToSvg(y: number): number {
  const minY = 0.3;
  const maxY = 2.0;
  const norm = (y - minY) / (maxY - minY);
  return PAD + (1 - norm) * (H - 2 * PAD);
}

function curvePath(): string {
  const pts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    const sx = xToSvg(x);
    const sy = yToSvg(lossFn(x));
    pts.push(`${i === 0 ? "M" : "L"}${sx.toFixed(1)},${sy.toFixed(1)}`);
  }
  return pts.join(" ");
}

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Roll Down the Hill                                        */
/* ------------------------------------------------------------------ */
function RollDownTab() {
  const [ballX, setBallX] = useState(0.1);
  const [steps, setSteps] = useState(0);
  const lr = 0.1;

  const handleStep = useCallback(() => {
    playClick();
    setBallX((prev) => {
      const grad = lossGrad(prev);
      return clamp(prev - lr * grad, 0.01, 0.99);
    });
    setSteps((s) => s + 1);
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setBallX(0.1);
    setSteps(0);
  }, []);

  const ballY = lossFn(ballX);
  const grad = lossGrad(ballX);
  const converged = Math.abs(grad) < 0.05;

  useEffect(() => {
    if (converged && steps > 0) playSuccess();
  }, [converged, steps]);

  /* tangent line segment */
  const tangentLen = 0.08;
  const tx1 = ballX - tangentLen;
  const ty1 = ballY - grad * tangentLen;
  const tx2 = ballX + tangentLen;
  const ty2 = ballY + grad * tangentLen;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Click <strong>Step</strong> to move the ball downhill following the gradient. Reach the bottom!
      </p>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        {/* Curve */}
        <path d={curvePath()} fill="none" stroke="#6366f1" strokeWidth={2.5} />

        {/* Tangent line */}
        <line
          x1={xToSvg(tx1)} y1={yToSvg(ty1)}
          x2={xToSvg(tx2)} y2={yToSvg(ty2)}
          stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 3"
        />

        {/* Direction arrow */}
        {!converged && (
          <polygon
            points={`${xToSvg(ballX) + (grad > 0 ? -18 : 18)},${yToSvg(ballY) - 6} ${xToSvg(ballX) + (grad > 0 ? -8 : 8)},${yToSvg(ballY) - 10} ${xToSvg(ballX) + (grad > 0 ? -8 : 8)},${yToSvg(ballY) - 2}`}
            fill="#22c55e"
          />
        )}

        {/* Ball */}
        <circle
          cx={xToSvg(ballX)} cy={yToSvg(ballY)}
          r={8} fill="#f59e0b" stroke="#b45309" strokeWidth={2}
          className="transition-all duration-300"
        />

        {/* Labels */}
        <text x={W / 2} y={H - 6} textAnchor="middle" className="text-[10px] fill-slate-500">Parameter value</text>
        <text x={14} y={H / 2} textAnchor="middle" transform={`rotate(-90,14,${H / 2})`} className="text-[10px] fill-slate-500">Loss</text>

        {/* Loss readout */}
        <text x={W - PAD} y={PAD - 8} textAnchor="end" className="text-[11px] fill-slate-700 font-semibold">
          Loss: {ballY.toFixed(3)}
        </text>
        <text x={PAD} y={PAD - 8} className="text-[11px] fill-slate-700 font-semibold">
          Step: {steps}
        </text>
      </svg>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleStep}
          disabled={converged}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {converged ? "Converged!" : "Step"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      {converged && (
        <div className="text-center text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg py-2 px-4">
          The ball reached the minimum in {steps} steps!
        </div>
      )}

      <InfoBox variant="blue" title="Gradient = Slope">
        The gradient tells us which direction is &quot;uphill.&quot; We go the opposite way (downhill) to reduce the loss. Each step moves us closer to the best answer.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Learning Rate Explorer                                    */
/* ------------------------------------------------------------------ */
interface BallState {
  x: number;
  trail: number[];
  losses: number[];
}

function LRExplorerTab() {
  const rates = [0.01, 0.1, 0.5];
  const labels = ["Small (0.01)", "Medium (0.1)", "Large (0.5)"];
  const colors = ["#3b82f6", "#22c55e", "#ef4444"];

  const initBalls = useCallback((): BallState[] =>
    rates.map(() => ({ x: 0.1, trail: [0.1], losses: [lossFn(0.1)] })),
    [],
  );

  const [balls, setBalls] = useState<BallState[]>(initBalls);
  const [step, setStep] = useState(0);

  const handleStepAll = useCallback(() => {
    playClick();
    setBalls((prev) =>
      prev.map((b, i) => {
        const grad = lossGrad(b.x);
        const nx = clamp(b.x - rates[i] * grad, -0.5, 1.5);
        return {
          x: nx,
          trail: [...b.trail, nx],
          losses: [...b.losses, lossFn(nx)],
        };
      }),
    );
    setStep((s) => s + 1);
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setBalls(initBalls());
    setStep(0);
  }, [initBalls]);

  /* Loss chart dimensions */
  const LCW = 460;
  const LCH = 100;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Three balls with different learning rates start at the same point. Click <strong>Step All</strong> to see how each behaves.
      </p>

      {/* Main curve */}
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[500px] mx-auto bg-slate-50 rounded-xl border border-slate-200">
        <path d={curvePath()} fill="none" stroke="#94a3b8" strokeWidth={2} />

        {balls.map((b, i) => (
          <g key={i}>
            {/* Trail dots */}
            {b.trail.map((tx, j) => {
              const cx = clamp(tx, 0, 1);
              return (
                <circle key={j} cx={xToSvg(cx)} cy={yToSvg(lossFn(cx))} r={3} fill={colors[i]} opacity={0.3 + 0.05 * j} />
              );
            })}
            {/* Current ball */}
            <circle
              cx={xToSvg(clamp(b.x, 0, 1))} cy={yToSvg(lossFn(clamp(b.x, 0, 1)))}
              r={7} fill={colors[i]} stroke="#fff" strokeWidth={2}
              className="transition-all duration-300"
            />
          </g>
        ))}

        {/* Legend */}
        {labels.map((l, i) => (
          <g key={l}>
            <circle cx={PAD + 10} cy={PAD + 10 + i * 16} r={5} fill={colors[i]} />
            <text x={PAD + 22} y={PAD + 14 + i * 16} className="text-[9px] fill-slate-600">{l}</text>
          </g>
        ))}
      </svg>

      {/* Loss curves */}
      <svg viewBox={`0 0 ${LCW} ${LCH}`} className="w-full max-w-[500px] mx-auto bg-white rounded-xl border border-slate-200">
        <text x={LCW / 2} y={12} textAnchor="middle" className="text-[9px] fill-slate-500 font-medium">Loss over steps</text>
        {balls.map((b, i) => {
          if (b.losses.length < 2) return null;
          const maxL = 2.0;
          const minL = 0.3;
          const maxSteps = Math.max(step, 1);
          const pts = b.losses.map((l, j) => {
            const sx = 30 + (j / maxSteps) * (LCW - 50);
            const sy = 20 + (1 - (clamp(l, minL, maxL) - minL) / (maxL - minL)) * (LCH - 30);
            return `${sx.toFixed(1)},${sy.toFixed(1)}`;
          });
          return <polyline key={i} points={pts.join(" ")} fill="none" stroke={colors[i]} strokeWidth={1.5} />;
        })}
      </svg>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleStepAll}
          disabled={step >= 30}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          Step All ({step}/30)
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      <InfoBox variant="amber" title="Learning Rate Matters!">
        Too small: barely moves. Just right: converges smoothly. Too large: overshoots and bounces wildly. Choosing the right learning rate is crucial for training.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- 2D Gradient Descent                                       */
/* ------------------------------------------------------------------ */
function loss2D(x: number, y: number): number {
  return 2 * (x - 0.5) * (x - 0.5) + 3 * (y - 0.4) * (y - 0.4) + 0.8 * (x - 0.5) * (y - 0.4);
}

function grad2D(x: number, y: number): [number, number] {
  return [
    4 * (x - 0.5) + 0.8 * (y - 0.4),
    6 * (y - 0.4) + 0.8 * (x - 0.5),
  ];
}

function Contour2DTab() {
  const CW = 400;
  const CH = 340;
  const [path, setPath] = useState<[number, number][]>([]);
  const [running, setRunning] = useState(false);
  const animRef = useRef<number | null>(null);

  /* Generate contour lines */
  const contours = useMemo(() => {
    const lines: { d: string; level: number }[] = [];
    const levels = [0.05, 0.15, 0.3, 0.5, 0.8, 1.2, 1.8];
    const res = 60;

    for (const level of levels) {
      const segs: string[] = [];
      for (let i = 0; i < res; i++) {
        for (let j = 0; j < res; j++) {
          const x0 = i / res, y0 = j / res;
          const x1 = (i + 1) / res, y1 = (j + 1) / res;
          const v00 = loss2D(x0, y0) - level;
          const v10 = loss2D(x1, y0) - level;
          const v01 = loss2D(x0, y1) - level;

          if (v00 * v10 < 0) {
            const t = v00 / (v00 - v10);
            const ix = x0 + t * (x1 - x0);
            const sx = 30 + ix * (CW - 60);
            const sy = 30 + y0 * (CH - 60);
            segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${sx.toFixed(1)},${(sy + (CH - 60) / res).toFixed(1)}`);
          }
          if (v00 * v01 < 0) {
            const t = v00 / (v00 - v01);
            const iy = y0 + t * (y1 - y0);
            const sx = 30 + x0 * (CW - 60);
            const sy = 30 + iy * (CH - 60);
            segs.push(`M${sx.toFixed(1)},${sy.toFixed(1)}L${(sx + (CW - 60) / res).toFixed(1)},${sy.toFixed(1)}`);
          }
        }
      }
      if (segs.length > 0) lines.push({ d: segs.join(" "), level });
    }
    return lines;
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (running) return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = CW / rect.width;
    const scaleY = CH / rect.height;
    const sx = (e.clientX - rect.left) * scaleX;
    const sy = (e.clientY - rect.top) * scaleY;
    const nx = clamp((sx - 30) / (CW - 60), 0.01, 0.99);
    const ny = clamp((sy - 30) / (CH - 60), 0.01, 0.99);
    playPop();
    setPath([[nx, ny]]);
  }, [running]);

  const handleRun = useCallback(() => {
    if (path.length === 0) return;
    playClick();
    setRunning(true);
    let current: [number, number] = [...path[path.length - 1]] as [number, number];
    let stepCount = 0;
    const lr = 0.08;

    const tick = () => {
      const [gx, gy] = grad2D(current[0], current[1]);
      current = [
        clamp(current[0] - lr * gx, 0.01, 0.99),
        clamp(current[1] - lr * gy, 0.01, 0.99),
      ];
      stepCount++;
      setPath((prev) => [...prev, [...current] as [number, number]]);

      if (stepCount < 40 && (Math.abs(gx) > 0.01 || Math.abs(gy) > 0.01)) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        setRunning(false);
        playSuccess();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [path]);

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const handleReset = useCallback(() => {
    playPop();
    setPath([]);
    setRunning(false);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Click on the contour map to place a starting point, then click <strong>Run</strong> to watch gradient descent find the minimum.
      </p>

      <svg
        viewBox={`0 0 ${CW} ${CH}`}
        className="w-full max-w-[440px] mx-auto bg-slate-50 rounded-xl border border-slate-200 cursor-crosshair"
        onClick={handleClick}
      >
        {/* Contour lines */}
        {contours.map((c, i) => (
          <path key={i} d={c.d} fill="none" stroke="#6366f1" strokeWidth={0.8} opacity={0.3 + i * 0.08} />
        ))}

        {/* Minimum marker */}
        <circle cx={30 + 0.5 * (CW - 60)} cy={30 + 0.4 * (CH - 60)} r={5} fill="none" stroke="#22c55e" strokeWidth={1.5} strokeDasharray="3 2" />
        <text x={30 + 0.5 * (CW - 60)} y={30 + 0.4 * (CH - 60) - 10} textAnchor="middle" className="text-[8px] fill-green-600 font-medium">min</text>

        {/* Path */}
        {path.length > 1 && (
          <polyline
            points={path.map(([px, py]) => `${(30 + px * (CW - 60)).toFixed(1)},${(30 + py * (CH - 60)).toFixed(1)}`).join(" ")}
            fill="none" stroke="#f59e0b" strokeWidth={2} strokeLinejoin="round"
          />
        )}

        {/* Path dots */}
        {path.map(([px, py], i) => (
          <circle
            key={i}
            cx={30 + px * (CW - 60)} cy={30 + py * (CH - 60)}
            r={i === path.length - 1 ? 6 : 2.5}
            fill={i === path.length - 1 ? "#f59e0b" : "#fbbf24"}
            stroke={i === path.length - 1 ? "#b45309" : "none"}
            strokeWidth={1.5}
          />
        ))}
      </svg>

      <div className="flex gap-2 justify-center">
        <button
          onClick={handleRun}
          disabled={path.length === 0 || running}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 shadow-sm"
        >
          {running ? "Running..." : "Run"}
        </button>
        <button onClick={handleReset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all duration-300">
          Reset
        </button>
      </div>

      <InfoBox variant="green" title="Contour Maps">
        Each ring represents the same loss value. The center is the minimum. Gradient descent always moves perpendicular to the contour lines toward lower loss.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What does the gradient tell us during gradient descent?",
    options: ["The final answer", "The direction of steepest ascent", "The number of steps needed", "The learning rate to use"],
    correctIndex: 1,
    explanation: "The gradient points in the direction of steepest ascent. We move in the opposite direction (descent) to reduce the loss.",
  },
  {
    question: "What happens if the learning rate is too large?",
    options: ["Training takes too long", "The model converges perfectly", "The ball overshoots and may diverge", "Nothing changes"],
    correctIndex: 2,
    explanation: "A learning rate that is too large causes the ball to overshoot the minimum and potentially bounce around or diverge.",
  },
  {
    question: "What is the goal of gradient descent?",
    options: ["Maximize the loss function", "Find the minimum of the loss function", "Make the gradient as large as possible", "Increase the learning rate"],
    correctIndex: 1,
    explanation: "Gradient descent aims to find the point where the loss function is minimized, meaning the model's predictions are as good as possible.",
  },
  {
    question: "When does gradient descent stop (converge)?",
    options: ["After exactly 10 steps", "When the gradient is near zero", "When the loss equals 1", "When the learning rate is zero"],
    correctIndex: 1,
    explanation: "Gradient descent converges when the gradient approaches zero, meaning the ball has reached a flat spot (minimum).",
  },
  {
    question: "In a 2D contour plot, where is the minimum?",
    options: ["At the edges", "Where contour lines are farthest apart", "At the center of the innermost ring", "Where colors are brightest"],
    correctIndex: 2,
    explanation: "The minimum is at the center of the contour rings. Each ring represents the same loss value, getting smaller toward the center.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L22_GradientDescentActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "roll",
        label: "Roll Down the Hill",
        icon: <ArrowDown className="w-4 h-4" />,
        content: <RollDownTab />,
      },
      {
        id: "lr-explore",
        label: "Learning Rate Explorer",
        icon: <Gauge className="w-4 h-4" />,
        content: <LRExplorerTab />,
      },
      {
        id: "contour",
        label: "2D Gradient Descent",
        icon: <Map className="w-4 h-4" />,
        content: <Contour2DTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Gradient Descent"
      level={7}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Master learning rate and momentum — the speed controls of training!"
      story={
        <StorySection
          paragraphs={[
            "Aru stood on a grassy hillside, blindfolded, trying to find her way to the bottom of the valley.",
            "Aru: \"Byte, I can't see anything! How do I find the lowest point?\"",
            "Byte: \"Feel which way the ground slopes under your feet. Then take a step downhill. Keep doing that until the ground feels flat — that means you've reached the bottom!\"",
            "Aru: \"So I just keep going in the steepest downhill direction?\"",
            "Byte: \"Exactly! That's gradient descent — finding the lowest point of a loss function by following the slope. Every machine learning model uses this to learn!\"",
          ]}
          conceptTitle="Gradient Descent"
          conceptSummary="Gradient descent is an optimization algorithm that finds the minimum of a function by repeatedly moving in the direction of steepest descent (opposite to the gradient). It is the backbone of how ML models learn from data."
        />
      }
    />
  );
}
