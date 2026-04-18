"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  HelpCircle,
  TrendingUp,
  SlidersHorizontal,
  Swords,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playPop } from "../../utils/sounds";
import {
  LinearRegressionViz,
  GradientDescentViz,
} from "../../components/viz/ml-algorithms";
import { LineChart } from "../../components/viz/data-viz";
import type { Series } from "../../components/viz/data-viz";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";

/* ------------------------------------------------------------------ */
/*  Riku says - local dialogue helper                                  */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="card-sketchy p-3 flex gap-3 items-start"
      style={{ background: "#fff8e7" }}
    >
      <span className="text-2xl" aria-hidden>
        🐼
      </span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Learning loop diagram (kept - it's just arrows, not a "viz")       */
/* ------------------------------------------------------------------ */

function LearningLoopDiagram() {
  return (
    <div className="card-sketchy notebook-grid p-3">
      <p
        className="font-hand text-xs font-bold uppercase tracking-wide text-center mb-1"
        style={{ color: INK, opacity: 0.7 }}
      >
        The Learning Loop
      </p>
      <svg viewBox="0 0 420 140" className="w-full max-w-[460px] mx-auto">
        <defs>
          <radialGradient id="ll-grad" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ff8a8a" />
            <stop offset="100%" stopColor={CORAL} />
          </radialGradient>
          <marker id="ll-arrow" markerWidth="10" markerHeight="8" refX="9" refY="4" orient="auto">
            <path d="M0,0 L10,4 L0,8 Z" fill={INK} />
          </marker>
        </defs>
        {[
          { cx: 60, cy: 70, label: "GUESS" },
          { cx: 210, cy: 70, label: "CHECK" },
          { cx: 360, cy: 70, label: "ADJUST" },
        ].map((n, i) => (
          <g key={i}>
            <circle
              cx={n.cx}
              cy={n.cy}
              r={36}
              fill="url(#ll-grad)"
              stroke={INK}
              strokeWidth={2.5}
              className="pulse-glow"
              style={{ color: CORAL, animationDelay: `${i * 0.4}s` }}
            />
            <text
              x={n.cx}
              y={n.cy + 4}
              textAnchor="middle"
              fontFamily="Kalam"
              fontWeight="bold"
              fontSize={13}
              fill="#fff"
            >
              {n.label}
            </text>
          </g>
        ))}
        <line
          x1={100}
          y1={70}
          x2={170}
          y2={70}
          stroke={CORAL}
          strokeWidth={3}
          className="signal-flow"
          style={{ color: CORAL }}
          markerEnd="url(#ll-arrow)"
        />
        <line
          x1={250}
          y1={70}
          x2={320}
          y2={70}
          stroke={CORAL}
          strokeWidth={3}
          className="signal-flow"
          style={{ color: CORAL }}
          markerEnd="url(#ll-arrow)"
        />
        <path
          d="M 360 110 Q 210 150 60 110"
          fill="none"
          stroke={YELLOW}
          strokeWidth={3}
          className="signal-flow"
          style={{ color: YELLOW }}
          markerEnd="url(#ll-arrow)"
        />
        <text
          x={210}
          y={138}
          textAnchor="middle"
          fontFamily="Kalam"
          fontWeight="bold"
          fontSize={11}
          fill={INK}
        >
          repeat until error is small
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - The Guessing Game                                          */
/* ------------------------------------------------------------------ */

function GuessingGame() {
  const [secretNumber, setSecretNumber] = useState(42);
  const [started, setStarted] = useState(false);
  const [low, setLow] = useState(1);
  const [high, setHigh] = useState(100);
  const [currentGuess, setCurrentGuess] = useState(50);
  const [history, setHistory] = useState<{ guess: number; feedback: string }[]>([]);
  const [found, setFound] = useState(false);

  const startGame = useCallback(() => {
    setStarted(true);
    setLow(1);
    setHigh(100);
    setCurrentGuess(50);
    setHistory([]);
    setFound(false);
  }, []);

  const handleFeedback = useCallback(
    (feedback: "too_high" | "too_low" | "correct") => {
      if (found) return;

      if (feedback === "correct") {
        setHistory((prev) => [...prev, { guess: currentGuess, feedback: "Correct!" }]);
        setFound(true);
        return;
      }

      const label = feedback === "too_high" ? "Too high" : "Too low";
      setHistory((prev) => [...prev, { guess: currentGuess, feedback: label }]);

      let newLow = low;
      let newHigh = high;
      if (feedback === "too_high") {
        newHigh = currentGuess - 1;
      } else {
        newLow = currentGuess + 1;
      }
      setLow(newLow);
      setHigh(newHigh);
      const nextGuess = Math.floor((newLow + newHigh) / 2);
      setCurrentGuess(nextGuess);
    },
    [currentGuess, low, high, found],
  );

  const resetGame = useCallback(() => {
    setStarted(false);
    setFound(false);
    setHistory([]);
    setLow(1);
    setHigh(100);
    setCurrentGuess(50);
  }, []);

  // SVG number line
  const nlWidth = 560;
  const nlHeight = 70;
  const nlPadX = 30;
  const barY = 30;
  const barH = 16;
  const scaleX = (v: number) => nlPadX + ((v - 1) / 99) * (nlWidth - 2 * nlPadX);

  return (
    <div className="space-y-5">
      <RikuSays>
        Learning = trying something, getting it slightly wrong, adjusting. Rinse and repeat. You&apos;ve been doing this since you learned to walk.
      </RikuSays>

      <LearningLoopDiagram />

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
          Pick a secret number and watch the computer find it!
        </h3>

        {!started && (
          <div className="flex flex-col items-center gap-3">
            <label className="text-xs font-medium text-slate-600">Your secret number (1-100):</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={100}
                value={secretNumber}
                onChange={(e) => setSecretNumber(Number(e.target.value))}
                className="w-48 accent-indigo-500"
              />
              <input
                type="number"
                min={1}
                max={100}
                value={secretNumber}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(100, Number(e.target.value)));
                  setSecretNumber(v);
                }}
                className="w-16 border border-slate-300 rounded-lg px-2 py-1.5 text-sm text-center font-bold text-slate-800"
              />
            </div>
            <button
              onClick={() => { playPop(); startGame(); }}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
            >
              <Play className="w-4 h-4" />
              Start
            </button>
          </div>
        )}

        {started && (
          <>
            <div className="flex justify-center overflow-x-auto">
              <svg width={nlWidth} height={nlHeight} viewBox={`0 0 ${nlWidth} ${nlHeight}`} className="max-w-full">
                <rect x={scaleX(1)} y={barY} width={scaleX(100) - scaleX(1)} height={barH} rx={4} fill="#e2e8f0" />
                <rect
                  x={scaleX(low)}
                  y={barY}
                  width={Math.max(scaleX(high) - scaleX(low), 2)}
                  height={barH}
                  rx={4}
                  fill="#93c5fd"
                  style={{ transition: "all 0.3s ease-out" }}
                />
                {[1, 25, 50, 75, 100].map((v) => (
                  <g key={v}>
                    <line x1={scaleX(v)} y1={barY + barH} x2={scaleX(v)} y2={barY + barH + 6} stroke="#94a3b8" strokeWidth={1} />
                    <text x={scaleX(v)} y={barY + barH + 16} textAnchor="middle" style={{ fontSize: 9, fill: "#64748b" }}>
                      {v}
                    </text>
                  </g>
                ))}
                {!found && (
                  <g style={{ transition: "transform 0.3s ease-out" }}>
                    <polygon
                      points={`${scaleX(currentGuess) - 6},${barY - 2} ${scaleX(currentGuess) + 6},${barY - 2} ${scaleX(currentGuess)},${barY + 4}`}
                      fill="#ef4444"
                    />
                    <text
                      x={scaleX(currentGuess)}
                      y={barY - 8}
                      textAnchor="middle"
                      style={{ fontSize: 12, fontWeight: 700, fill: "#ef4444" }}
                    >
                      {currentGuess}
                    </text>
                  </g>
                )}
                {found && (
                  <g>
                    <polygon
                      points={`${scaleX(secretNumber) - 6},${barY - 2} ${scaleX(secretNumber) + 6},${barY - 2} ${scaleX(secretNumber)},${barY + 4}`}
                      fill="#22c55e"
                    />
                    <text
                      x={scaleX(secretNumber)}
                      y={barY - 8}
                      textAnchor="middle"
                      style={{ fontSize: 12, fontWeight: 700, fill: "#22c55e" }}
                    >
                      {secretNumber}
                    </text>
                  </g>
                )}
              </svg>
            </div>

            {!found && (
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-slate-700">
                  Computer guesses: <span className="font-bold text-lg text-indigo-700">{currentGuess}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (currentGuess === secretNumber) {
                        handleFeedback("correct");
                      } else {
                        handleFeedback("too_low");
                      }
                    }}
                    disabled={currentGuess >= secretNumber && currentGuess !== secretNumber}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentGuess >= secretNumber && currentGuess !== secretNumber
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    <ChevronUp className="w-4 h-4" />
                    Too Low
                  </button>
                  <button
                    onClick={() => handleFeedback("correct")}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    Correct!
                  </button>
                  <button
                    onClick={() => {
                      if (currentGuess === secretNumber) {
                        handleFeedback("correct");
                      } else {
                        handleFeedback("too_high");
                      }
                    }}
                    disabled={currentGuess <= secretNumber && currentGuess !== secretNumber}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentGuess <= secretNumber && currentGuess !== secretNumber
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                    Too High
                  </button>
                </div>
              </div>
            )}

            {found && (
              <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-green-600" />
                  <span className="text-lg font-bold text-green-700">
                    Found it in {history.length} {history.length === 1 ? "guess" : "guesses"}!
                  </span>
                </div>
                <button
                  onClick={resetGame}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mt-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            )}

            {history.length > 0 && (
              <div className="border border-slate-200 rounded-lg p-3">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Guess History
                </h4>
                <div className="flex flex-wrap gap-2">
                  {history.map((h, i) => (
                    <div
                      key={i}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium ${
                        h.feedback === "Correct!"
                          ? "bg-green-100 text-green-700"
                          : h.feedback === "Too high"
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                      }`}
                    >
                      Guess {i + 1}: {h.guess} ({h.feedback})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <RikuSays>
        Computers don&apos;t learn by magic. They learn by &ldquo;try, fail, adjust, try again&rdquo; - just faster.
      </RikuSays>

      <InfoBox variant="blue">
        This is learning in its simplest form: guess, get feedback, adjust. Every machine learning algorithm works on
        this same principle - make a prediction, check how wrong you are, and adjust to be less wrong next time!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Train the Line (LinearRegressionViz)                       */
/* ------------------------------------------------------------------ */

function TrainTheLine() {
  return (
    <div className="space-y-5">
      <RikuSays>
        Try a line, see the error, try a better line. That&apos;s literally the whole trick behind linear regression.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
          Watch a line learn to fit the data
        </h3>
        <p className="text-xs text-slate-600">
          Drag the slope and intercept sliders to move the line yourself. The dashed
          vertical bars are <b>residuals</b> - how wrong each prediction is. MSE is
          the average squared residual, and it&apos;s what the model tries to shrink.
          Hit <b>Fit</b> to let the computer find the best line in one shot.
        </p>

        <LinearRegressionViz showResiduals showMSE />
      </div>

      <RikuSays>
        Red dashes = how wrong we are at each point. Squish them all down and you&apos;ve trained a model. That&apos;s it.
      </RikuSays>

      <InfoBox variant="amber">
        The computer is learning! It adjusts the line little by little, always trying
        to make the error smaller. When it can&apos;t make it any smaller, training
        is done.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Learning Speed (GradientDescentViz + LineChart of loss)    */
/* ------------------------------------------------------------------ */

/** A smooth skewed bowl in [0, 100]^2 - the landscape for learning-rate demos. */
function bowlLoss(w: number, b: number): number {
  const dw = (w - 60) / 18;
  const db = (b - 40) / 22;
  return dw * dw + db * db * 1.4;
}

/** Simulate gradient descent on bowlLoss to build loss curves. */
function simulateDescent(lr: number, steps: number): number[] {
  let w = 20;
  let b = 80;
  const out: number[] = [];
  const eps = 0.5;
  for (let i = 0; i < steps; i++) {
    out.push(bowlLoss(w, b));
    const gw = (bowlLoss(w + eps, b) - bowlLoss(w - eps, b)) / (2 * eps);
    const gb = (bowlLoss(w, b + eps) - bowlLoss(w, b - eps)) / (2 * eps);
    w -= lr * gw;
    b -= lr * gb;
    // Guard against overflow when lr is huge.
    if (!isFinite(w) || !isFinite(b) || Math.abs(w) > 1000 || Math.abs(b) > 1000) {
      // Pad remaining with a large value so the curve "explodes"
      for (let j = i + 1; j < steps; j++) out.push(1000);
      break;
    }
  }
  return out;
}

function LearningSpeed() {
  const steps = 40;
  const tinyHistory = useMemo(() => simulateDescent(0.4, steps), []);
  const goodHistory = useMemo(() => simulateDescent(3, steps), []);
  const hugeHistory = useMemo(() => simulateDescent(22, steps), []);

  const series: Series[] = useMemo(
    () => [
      {
        name: "Tiny lr (0.4)",
        data: tinyHistory.map((v, i) => ({ x: i, y: Math.min(v, 100) })),
        color: SKY,
      },
      {
        name: "Good lr (3)",
        data: goodHistory.map((v, i) => ({ x: i, y: Math.min(v, 100) })),
        color: MINT,
      },
      {
        name: "Huge lr (22)",
        data: hugeHistory.map((v, i) => ({ x: i, y: Math.min(v, 100) })),
        color: CORAL,
      },
    ],
    [tinyHistory, goodHistory, hugeHistory],
  );

  return (
    <div className="space-y-5">
      <RikuSays>
        Think of learning as walking down a hill while blindfolded. Tiny steps = safe but forever. Huge steps = fall off a cliff. Goldilocks territory is where the magic happens.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
          Descending a loss landscape
        </h3>
        <p className="text-xs text-slate-600">
          The colored heatmap is a <b>loss surface</b> - lower = better. Training
          is just rolling downhill. The <b>learning rate</b> slider controls how
          far we step each time. Watch what happens when you crank it up.
        </p>

        <GradientDescentViz
          lossFn={bowlLoss}
          initialLearningRate={3}
          startPoint={[20, 80]}
        />
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <p className="font-hand text-xs font-bold text-center mb-2" style={{ color: INK }}>
          Loss vs iterations - same problem, three learning rates
        </p>
        <LineChart
          series={series}
          width={560}
          height={280}
          xLabel="iteration"
          yLabel="loss"
          smooth
          showPoints={false}
          animateOnMount
        />
        <div className="flex justify-center gap-4 text-xs mt-2 font-hand">
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: SKY }} />
            Tiny - crawls
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: MINT }} />
            Good - smooth
          </span>
          <span>
            <span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: CORAL }} />
            Huge - explodes
          </span>
        </div>
      </div>

      <RikuSays>
        A good loss curve is the ML version of a fitness tracker. Smooth drop = happy training. Flat line = too slow. Wiggly mess = too big.
      </RikuSays>

      <InfoBox variant="green">
        The step size (also called <b>learning rate</b> in ML) controls how much the
        computer adjusts each time. Too small and learning takes forever. Too big
        and it overshoots. Finding the right step size is one of the most important
        decisions in machine learning!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 - You vs The Computer                                        */
/* ------------------------------------------------------------------ */

function YouVsComputer() {
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 0.1);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const reset = useCallback(() => {
    setTimer(0);
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  return (
    <div className="space-y-5">
      <RikuSays>
        Click <b>Fit</b> in the playground below. The computer finds the best line in a single blink. You can drag the sliders and try to beat it - spoiler: you won&apos;t. That&apos;s fine! Understanding the how is the superpower, not the speed.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
          Can you fit the line better than the computer?
        </h3>
        <p className="text-xs text-slate-600">
          Start the stopwatch, then try to get MSE as low as you can using the
          sliders. When you&apos;re done, hit <b>Fit</b> and see how close you got
          to the closed-form least-squares answer.
        </p>

        <div className="flex justify-center gap-4 text-sm">
          <span className="text-slate-600">
            Your time:{" "}
            <span className="font-bold text-slate-800">{timer.toFixed(1)}s</span>
          </span>
        </div>

        <div className="flex justify-center gap-2">
          {!running ? (
            <button
              onClick={() => setRunning(true)}
              className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Stopwatch
            </button>
          ) : (
            <button
              onClick={() => setRunning(false)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Stop
            </button>
          )}
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>

        <LinearRegressionViz showResiduals showMSE />
      </div>

      <RikuSays>
        Computers can try thousands of adjustments per second. Your job isn&apos;t to out-race them - it&apos;s to understand the trick they use.
      </RikuSays>

      <InfoBox variant="indigo">
        Don&apos;t worry if the computer beats you - that&apos;s the whole point of
        machine learning! Computers can try thousands of adjustments per second.
        Your job is to understand HOW it works, not to be faster.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What are the three steps of the learning loop?",
    options: ["Read, Write, Execute", "Guess, Check, Adjust", "Input, Process, Output", "Start, Stop, Restart"],
    correctIndex: 1,
    explanation:
      "The learning loop is: Guess (make a prediction), Check (see how wrong you are), Adjust (change to be less wrong). Repeat until the error is small enough!",
  },
  {
    question: "What happens if the step size (learning rate) is too large?",
    options: [
      "Learning is very slow",
      "The computer learns perfectly",
      "The error overshoots and bounces around",
      "Nothing changes",
    ],
    correctIndex: 2,
    explanation:
      "A large step size causes the adjustments to overshoot the optimal values, making the error bounce around instead of decreasing smoothly.",
  },
  {
    question: "In the training process, what does the 'error' measure?",
    options: [
      "How fast the computer is",
      "How wrong the current prediction is",
      "How many data points there are",
      "The number of steps taken",
    ],
    correctIndex: 1,
    explanation:
      "The error measures how far off the current prediction (line) is from the actual data. The goal of training is to make this error as small as possible.",
  },
  {
    question: "Why is machine learning useful?",
    options: [
      "Computers are always right",
      "Computers can find patterns much faster than humans",
      "Machine learning is only for games",
      "It replaces all human thinking",
    ],
    correctIndex: 1,
    explanation:
      "Machine learning is powerful because computers can process millions of data points and try thousands of adjustments per second, finding patterns that would take humans much longer to discover.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L10_HowComputersLearnActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "guessing",
        label: "The Guessing Game",
        icon: <HelpCircle className="w-4 h-4" />,
        content: <GuessingGame />,
      },
      {
        id: "train",
        label: "Train the Line",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <TrainTheLine />,
      },
      {
        id: "speed",
        label: "Learning Speed",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <LearningSpeed />,
      },
      {
        id: "vs",
        label: "You vs The Computer",
        icon: <Swords className="w-4 h-4" />,
        content: <YouVsComputer />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="How Computers Learn"
      level={3}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Congratulations! You've completed Level 3! You now understand the foundations of how machines learn. In Level 4, you'll start building real machine learning models!"
      story={
        <StorySection
          paragraphs={[
            "Aru decided to play \"guess the number\" with Byte. She picked 73 and told Byte to guess.",
            "Byte: \"Is it 50?\" Aru: \"Too low.\" Byte: \"75?\" Aru: \"Too high.\" Byte: \"62?\" Aru: \"Too low.\" Byte: \"69?\" Aru: \"Too low.\" Byte: \"72?\" Aru: \"Too low.\" Byte: \"73!\"",
            "Aru: \"Wait a minute... you got better with every guess! Each time I told you 'too high' or 'too low,' you adjusted. That's... learning!\"",
            "Byte: \"Exactly! That's the core of machine learning: guess, get feedback on how wrong you are, adjust, and repeat. Every ML algorithm in the world - from self-driving cars to language translators - works on this same loop.\"",
            "Aru: \"So machine learning is just... guessing and improving?\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Machine learning is built on a simple loop: Guess (make a prediction), Check (measure how wrong you are), Adjust (change to be less wrong), Repeat. The 'step size' controls how much you adjust each time - too small is slow, too large causes overshooting. This is the foundation of all modern AI."
        />
      }
    />
  );
}
