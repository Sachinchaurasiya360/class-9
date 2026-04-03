import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Hash, TrendingUp, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

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
/*  Tab 1 — Guess the Next Number                                      */
/* ------------------------------------------------------------------ */

interface Round {
  sequence: number[];
  answer: number;
  patternLabel: string;
  hint: string;
}

const ROUNDS: Round[] = [
  {
    sequence: [2, 4, 6, 8],
    answer: 10,
    patternLabel: "+2",
    hint: "Look at the difference between consecutive numbers.",
  },
  {
    sequence: [3, 9, 27, 81],
    answer: 243,
    patternLabel: "\u00d73",
    hint: "Try dividing each number by the one before it.",
  },
  {
    sequence: [1, 1, 2, 3, 5],
    answer: 8,
    patternLabel: "Fibonacci (add the two previous numbers)",
    hint: "Try adding the two previous numbers together.",
  },
  {
    sequence: [1, 4, 9, 16, 25],
    answer: 36,
    patternLabel: "perfect squares (1\u00b2, 2\u00b2, 3\u00b2, ...)",
    hint: "What do you get when you square 1, 2, 3, 4, 5, 6?",
  },
  {
    sequence: [2, 6, 12, 20, 30],
    answer: 42,
    patternLabel: "differences increase by 2 each time",
    hint: "Look at the differences: 4, 6, 8, 10 \u2014 what comes next?",
  },
];

function GuessTheNumber() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, []);

  const round = ROUNDS[roundIndex];

  const handleCheck = useCallback(() => {
    const parsed = parseInt(input.trim(), 10);
    if (isNaN(parsed)) return;
    if (parsed === round.answer) {
      setFeedback("correct");
      setRevealed(true);
      setScore((s) => s + 1);
      advanceTimerRef.current = setTimeout(() => {
        if (roundIndex < ROUNDS.length - 1) {
          setRoundIndex((r) => r + 1);
          setInput("");
          setFeedback(null);
          setRevealed(false);
        } else {
          setCompleted(true);
        }
      }, 1800);
    } else {
      setFeedback("wrong");
    }
  }, [input, round, roundIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") handleCheck();
    },
    [handleCheck],
  );

  if (completed) {
    return (
      <div className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-3">
          <div className="text-4xl">&#127881;</div>
          <h3 className="text-lg font-bold text-slate-800">All Rounds Complete!</h3>
          <p className="text-sm text-slate-600">
            Your score: <span className="font-bold text-indigo-600">{score} / {ROUNDS.length}</span>
          </p>
          <button
            onClick={() => {
              setRoundIndex(0);
              setScore(0);
              setInput("");
              setFeedback(null);
              setRevealed(false);
              setCompleted(false);
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
        <InfoBox variant="blue">
          A prediction is a guess based on a pattern. The better you understand the pattern, the better your prediction! Look at how each number relates to the one before it.
        </InfoBox>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        {/* Score tracker */}
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-700">What comes next?</h3>
          <span className="text-xs font-medium text-slate-500">
            Round {roundIndex + 1} / {ROUNDS.length} | Score: {score}
          </span>
        </div>

        {/* Sequence SVG */}
        <div className="flex justify-center overflow-x-auto">
          <svg
            width={Math.max((round.sequence.length + 1) * 72 + 16, 300)}
            height={80}
            viewBox={`0 0 ${Math.max((round.sequence.length + 1) * 72 + 16, 300)} 80`}
            className="mx-auto"
          >
            {round.sequence.map((num, i) => {
              const x = i * 72 + 16;
              return (
                <g key={i}>
                  <rect x={x} y={10} width={60} height={52} rx={10} className="fill-indigo-100 stroke-indigo-300" strokeWidth={1.5} />
                  <text
                    x={x + 30}
                    y={43}
                    textAnchor="middle"
                    className="fill-indigo-700 font-bold"
                    style={{ fontSize: 18 }}
                  >
                    {num}
                  </text>
                </g>
              );
            })}
            {/* Mystery box */}
            {(() => {
              const x = round.sequence.length * 72 + 16;
              return (
                <g>
                  <rect
                    x={x}
                    y={10}
                    width={60}
                    height={52}
                    rx={10}
                    className={`transition-colors duration-300 ${
                      revealed
                        ? "fill-green-100 stroke-green-400"
                        : feedback === "wrong"
                        ? "fill-red-50 stroke-red-300"
                        : "fill-amber-50 stroke-amber-300"
                    }`}
                    strokeWidth={2}
                    strokeDasharray={revealed ? undefined : "6 4"}
                  />
                  <text
                    x={x + 30}
                    y={43}
                    textAnchor="middle"
                    className={`font-bold transition-colors duration-300 ${
                      revealed ? "fill-green-700" : "fill-amber-500"
                    }`}
                    style={{ fontSize: 18 }}
                  >
                    {revealed ? round.answer : "?"}
                  </text>
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Input & check */}
        {!revealed && (
          <div className="flex justify-center gap-2">
            <input
              type="number"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (feedback === "wrong") setFeedback(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Your answer"
              className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 text-center focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-colors"
            />
            <button
              onClick={handleCheck}
              disabled={!input.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Check
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback === "correct" && (
          <div className="text-center animate-pulse">
            <p className="text-sm font-semibold text-green-600">
              Correct! The pattern is: {round.patternLabel}
            </p>
          </div>
        )}
        {feedback === "wrong" && (
          <div className="text-center">
            <p className="text-sm font-semibold text-red-500">
              Try again! Hint: {round.hint}
            </p>
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        A prediction is a guess based on a pattern. The better you understand the pattern, the better your prediction! Look at how each number relates to the one before it.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Predict from a Graph                                       */
/* ------------------------------------------------------------------ */

interface DataPoint {
  x: number;
  y: number;
}

function generateScatterData(rng: () => number, slope: number, intercept: number): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < 15; i++) {
    const x = 5 + rng() * 55; // range 5..60 (Data Zone: 0-70% of 100)
    const noise = (rng() - 0.5) * 14;
    const y = slope * x + intercept + noise;
    points.push({ x, y: Math.max(0, Math.min(100, y)) });
  }
  return points;
}

function PredictFromGraph() {
  const [seed, setSeed] = useState(42);
  const [userPoint, setUserPoint] = useState<DataPoint | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundsDone, setRoundsDone] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  const { dataPoints, slope, intercept } = useMemo(() => {
    const rng = mulberry32(seed);
    const s = 0.4 + rng() * 0.8; // slope 0.4..1.2
    const b = 5 + rng() * 20;    // intercept 5..25
    return { dataPoints: generateScatterData(rng, s, b), slope: s, intercept: b };
  }, [seed]);

  // Prediction target x = 85 (in the prediction zone)
  const targetX = 85;
  const actualY = slope * targetX + intercept;
  const clampedActualY = Math.max(0, Math.min(100, actualY));

  // SVG layout
  const svgW = 440;
  const svgH = 300;
  const pad = { left: 40, right: 20, top: 20, bottom: 30 };
  const plotW = svgW - pad.left - pad.right;
  const plotH = svgH - pad.top - pad.bottom;

  const toSvgX = useCallback((v: number) => pad.left + (v / 100) * plotW, [plotW]);
  const toSvgY = useCallback((v: number) => pad.top + plotH - (v / 100) * plotH, [plotH]);
  const fromSvgX = useCallback((sx: number) => ((sx - pad.left) / plotW) * 100, [plotW]);
  const fromSvgY = useCallback((sy: number) => ((plotH - (sy - pad.top)) / plotH) * 100, [plotH]);

  const handleClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (showAnswer) return;
      const svg = svgRef.current;
      if (!svg) return;
      const rect = svg.getBoundingClientRect();
      const sx = ((e.clientX - rect.left) / rect.width) * svgW;
      const sy = ((e.clientY - rect.top) / rect.height) * svgH;
      const dataX = fromSvgX(sx);
      const dataY = fromSvgY(sy);
      // Only allow clicks in prediction zone (x > 70)
      if (dataX >= 70 && dataX <= 100 && dataY >= 0 && dataY <= 100) {
        setUserPoint({ x: dataX, y: dataY });
      }
    },
    [showAnswer, fromSvgX, fromSvgY],
  );

  const handleShowAnswer = useCallback(() => {
    setShowAnswer(true);
    if (userPoint) {
      const err = Math.abs(userPoint.y - clampedActualY);
      setErrors((prev) => [...prev, err]);
      setRoundsDone((r) => r + 1);
    }
  }, [userPoint, clampedActualY]);

  const handleNewData = useCallback(() => {
    setSeed((s) => s + 7);
    setUserPoint(null);
    setShowAnswer(false);
  }, []);

  // Grid lines
  const gridLinesX = [0, 20, 40, 60, 80, 100];
  const gridLinesY = [0, 20, 40, 60, 80, 100];

  // Trend line endpoints for display
  const trendX0 = 0;
  const trendY0 = Math.max(0, Math.min(100, slope * trendX0 + intercept));
  const trendX1 = 100;
  const trendY1 = Math.max(0, Math.min(100, slope * trendX1 + intercept));

  const avgError = useMemo(() => {
    if (errors.length === 0) return 0;
    return errors.reduce((a, b) => a + b, 0) / errors.length;
  }, [errors]);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-slate-700">Click in the yellow zone to predict the next point</h3>
          {roundsDone >= 3 && (
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Avg error: {avgError.toFixed(1)} units
            </span>
          )}
        </div>

        <div className="flex justify-center overflow-x-auto">
          <svg
            ref={svgRef}
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="cursor-crosshair mx-auto"
            onClick={handleClick}
          >
            {/* Background for data zone */}
            <rect x={pad.left} y={pad.top} width={plotW * 0.7} height={plotH} className="fill-white" />
            {/* Background for prediction zone */}
            <rect
              x={pad.left + plotW * 0.7}
              y={pad.top}
              width={plotW * 0.3}
              height={plotH}
              className="fill-amber-50"
            />
            {/* Dashed border between zones */}
            <line
              x1={pad.left + plotW * 0.7}
              y1={pad.top}
              x2={pad.left + plotW * 0.7}
              y2={pad.top + plotH}
              stroke="#d97706"
              strokeWidth={1.5}
              strokeDasharray="6 4"
            />

            {/* Zone labels */}
            <text x={pad.left + plotW * 0.35} y={pad.top + 14} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
              Data Zone
            </text>
            <text x={pad.left + plotW * 0.85} y={pad.top + 14} textAnchor="middle" className="fill-amber-500" style={{ fontSize: 10 }}>
              Prediction Zone
            </text>

            {/* Grid lines */}
            {gridLinesX.map((v) => (
              <line
                key={`gx-${v}`}
                x1={toSvgX(v)}
                y1={pad.top}
                x2={toSvgX(v)}
                y2={pad.top + plotH}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />
            ))}
            {gridLinesY.map((v) => (
              <line
                key={`gy-${v}`}
                x1={pad.left}
                y1={toSvgY(v)}
                x2={pad.left + plotW}
                y2={toSvgY(v)}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />
            ))}

            {/* Axes */}
            <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke="#94a3b8" strokeWidth={1.5} />
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke="#94a3b8" strokeWidth={1.5} />

            {/* Axis labels */}
            {gridLinesX.map((v) => (
              <text key={`lx-${v}`} x={toSvgX(v)} y={pad.top + plotH + 16} textAnchor="middle" className="fill-slate-400" style={{ fontSize: 10 }}>
                {v}
              </text>
            ))}
            {gridLinesY.filter((v) => v > 0).map((v) => (
              <text key={`ly-${v}`} x={pad.left - 8} y={toSvgY(v) + 3} textAnchor="end" className="fill-slate-400" style={{ fontSize: 10 }}>
                {v}
              </text>
            ))}

            {/* Data points */}
            {dataPoints.map((p, i) => (
              <circle
                key={i}
                cx={toSvgX(p.x)}
                cy={toSvgY(p.y)}
                r={4.5}
                className="fill-indigo-500 stroke-white"
                strokeWidth={1}
              />
            ))}

            {/* User prediction point (star/diamond shape) */}
            {userPoint && (
              <g transform={`translate(${toSvgX(userPoint.x)}, ${toSvgY(userPoint.y)})`}>
                <polygon
                  points="0,-8 2.5,-2.5 8,-2.5 3.5,2 5.5,8 0,4.5 -5.5,8 -3.5,2 -8,-2.5 -2.5,-2.5"
                  className="fill-amber-400 stroke-amber-600"
                  strokeWidth={1}
                />
              </g>
            )}

            {/* Trend line (shown on reveal) */}
            {showAnswer && (
              <>
                <line
                  x1={toSvgX(trendX0)}
                  y1={toSvgY(trendY0)}
                  x2={toSvgX(trendX1)}
                  y2={toSvgY(trendY1)}
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  opacity={0.7}
                />
                {/* Actual point */}
                <circle
                  cx={toSvgX(targetX)}
                  cy={toSvgY(clampedActualY)}
                  r={6}
                  className="fill-red-500 stroke-white"
                  strokeWidth={2}
                />
                <text
                  x={toSvgX(targetX) + 10}
                  y={toSvgY(clampedActualY) - 8}
                  className="fill-red-600"
                  style={{ fontSize: 10, fontWeight: 600 }}
                >
                  Actual
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Results */}
        {showAnswer && userPoint && (
          <div className="text-center space-y-1">
            <p className="text-xs text-slate-600">
              Your prediction:{" "}
              <span className="font-mono font-bold text-amber-600">
                ({userPoint.x.toFixed(0)}, {userPoint.y.toFixed(1)})
              </span>{" "}
              | Actual:{" "}
              <span className="font-mono font-bold text-red-600">
                ({targetX}, {clampedActualY.toFixed(1)})
              </span>{" "}
              | Error:{" "}
              <span className="font-mono font-bold text-slate-800">
                {Math.abs(userPoint.y - clampedActualY).toFixed(1)} units
              </span>
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!showAnswer && (
            <button
              onClick={handleShowAnswer}
              disabled={!userPoint}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              Show Answer
            </button>
          )}
          {showAnswer && (
            <button
              onClick={handleNewData}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              New Data
            </button>
          )}
        </div>
      </div>

      <InfoBox variant="amber">
        When you predict from a graph, you're extending the pattern you see into unknown territory. This is exactly what scientists, weather forecasters, and stock analysts do!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Prediction Confidence (Coin Flip)                          */
/* ------------------------------------------------------------------ */

function CoinFlipSimulator() {
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [lastResult, setLastResult] = useState<"H" | "T" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [predictionPrompt, setPredictionPrompt] = useState(false);
  const [predictions, setPredictions] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [, setPendingPrediction] = useState<"H" | "T" | null>(null);

  const total = heads + tails;
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current);
    };
  }, []);

  const doFlip = useCallback(
    (prediction?: "H" | "T") => {
      if (isFlipping) return;
      setIsFlipping(true);

      flipTimerRef.current = setTimeout(() => {
        const prob = loaded ? 0.7 : 0.5;
        const result: "H" | "T" = Math.random() < prob ? "H" : "T";
        setLastResult(result);
        if (result === "H") setHeads((h) => h + 1);
        else setTails((t) => t + 1);

        if (prediction) {
          setPredictions((p) => p + 1);
          if (prediction === result) setCorrectPredictions((c) => c + 1);
          setPendingPrediction(null);
        }

        setIsFlipping(false);
        setPredictionPrompt(false);
      }, 500);
    },
    [isFlipping, loaded],
  );

  const handleFlip = useCallback(() => {
    if (predictionPrompt) return;
    // Check if we should prompt for prediction (every 10 flips)
    if (total > 0 && total % 10 === 0 && !predictionPrompt) {
      setPredictionPrompt(true);
      return;
    }
    doFlip();
  }, [total, predictionPrompt, doFlip]);

  const handlePrediction = useCallback(
    (choice: "H" | "T") => {
      setPendingPrediction(choice);
      doFlip(choice);
    },
    [doFlip],
  );

  const handleReset = useCallback(() => {
    setHeads(0);
    setTails(0);
    setLastResult(null);
    setPredictionPrompt(false);
    setPredictions(0);
    setCorrectPredictions(0);
    setPendingPrediction(null);
  }, []);

  // Bar chart dimensions
  const barMaxW = 260;
  const headsW = total > 0 ? (heads / total) * barMaxW : 0;
  const tailsW = total > 0 ? (tails / total) * barMaxW : 0;

  return (
    <div className="space-y-5">
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">Flip the coin and watch the pattern emerge</h3>

        {/* Coin SVG */}
        <div className="flex justify-center">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <g
              style={{
                transformOrigin: "50px 50px",
                transition: "transform 0.5s ease-in-out",
                transform: isFlipping ? "rotateX(360deg) scale(0.7)" : "rotateX(0deg) scale(1)",
              }}
            >
              <circle
                cx="50"
                cy="50"
                r="42"
                className={`transition-colors duration-300 ${
                  lastResult === "H"
                    ? "fill-blue-400 stroke-blue-600"
                    : lastResult === "T"
                    ? "fill-orange-400 stroke-orange-600"
                    : "fill-slate-300 stroke-slate-400"
                }`}
                strokeWidth={3}
              />
              <circle
                cx="50"
                cy="50"
                r="34"
                fill="none"
                className={`transition-colors duration-300 ${
                  lastResult === "H"
                    ? "stroke-blue-300"
                    : lastResult === "T"
                    ? "stroke-orange-300"
                    : "stroke-slate-200"
                }`}
                strokeWidth={1}
              />
              <text
                x="50"
                y="55"
                textAnchor="middle"
                className={`font-bold transition-colors duration-300 ${
                  lastResult === "H"
                    ? "fill-blue-900"
                    : lastResult === "T"
                    ? "fill-orange-900"
                    : "fill-slate-500"
                }`}
                style={{ fontSize: 22 }}
              >
                {lastResult === null ? "?" : lastResult === "H" ? "H" : "T"}
              </text>
            </g>
          </svg>
        </div>

        {/* Stats */}
        <div className="text-center text-sm text-slate-600">
          <span className="font-semibold text-blue-600">Heads: {heads}</span>
          {" | "}
          <span className="font-semibold text-orange-600">Tails: {tails}</span>
          {" | "}
          <span className="text-slate-500">Total flips: {total}</span>
        </div>

        {/* Bar chart */}
        {total > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600 font-medium w-10 text-right">H</span>
              <div className="h-5 bg-slate-100 rounded-full overflow-hidden" style={{ width: barMaxW }}>
                <div
                  className="h-full bg-blue-400 rounded-full transition-all duration-300"
                  style={{ width: headsW }}
                />
              </div>
              <span className="text-xs text-slate-500 w-12">
                {((heads / total) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-600 font-medium w-10 text-right">T</span>
              <div className="h-5 bg-slate-100 rounded-full overflow-hidden" style={{ width: barMaxW }}>
                <div
                  className="h-full bg-orange-400 rounded-full transition-all duration-300"
                  style={{ width: tailsW }}
                />
              </div>
              <span className="text-xs text-slate-500 w-12">
                {((tails / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        )}

        {/* Prediction prompt */}
        {predictionPrompt && !isFlipping && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center space-y-2">
            <p className="text-sm font-medium text-indigo-800">What do you predict for the next flip?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handlePrediction("H")}
                className="px-4 py-1.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                Heads
              </button>
              <button
                onClick={() => handlePrediction("T")}
                className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                Tails
              </button>
            </div>
          </div>
        )}

        {/* Prediction accuracy */}
        {predictions > 0 && (
          <div className="text-center">
            <p className="text-xs text-slate-500">
              Prediction accuracy: {correctPredictions} / {predictions} ({((correctPredictions / predictions) * 100).toFixed(0)}%)
            </p>
          </div>
        )}

        {/* 50+ flip message */}
        {total >= 50 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            <p className="text-xs text-green-700 font-medium">
              With more data, the pattern becomes clearer!{" "}
              {!loaded
                ? "A fair coin tends toward 50/50."
                : "Notice how the loaded coin shows a clear bias toward heads!"}
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={handleFlip}
            disabled={isFlipping || predictionPrompt}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {isFlipping ? "Flipping..." : "Flip!"}
          </button>
          <button
            onClick={() => setLoaded((l) => !l)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              loaded
                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {loaded ? "Loaded Coin (70% Heads)" : "Fair Coin"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        With more data, predictions get better. After 2 flips, you can't tell much. After 100 flips, the pattern is clear! This is a fundamental principle of statistics and machine learning.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What comes next in the sequence: 5, 10, 20, 40, ?",
    options: ["60", "45", "80", "50"],
    correctIndex: 2,
    explanation: "Each number is doubled (\u00d72): 5\u219210\u219220\u219240\u219280.",
  },
  {
    question: "When predicting from a scatter plot, what are you doing?",
    options: [
      "Deleting old data points",
      "Extending the pattern into unknown areas",
      "Making the graph look nicer",
      "Counting the number of points",
    ],
    correctIndex: 1,
    explanation:
      "When you predict from a scatter plot, you're extending the pattern (trend) you see in the existing data to estimate values you haven't observed yet.",
  },
  {
    question:
      "You flip a coin 3 times and get Heads, Heads, Heads. Is it definitely a loaded coin?",
    options: [
      "Yes, definitely",
      "No \u2014 3 flips is too few to tell",
      "It depends on the coin's color",
      "Coins always land on heads",
    ],
    correctIndex: 1,
    explanation:
      "Three flips is far too few data points to draw conclusions. Even a fair coin will sometimes give 3 heads in a row. You need many more flips to determine if a coin is loaded.",
  },
  {
    question: "What generally makes predictions more accurate?",
    options: [
      "Using less data",
      "Having more relevant data",
      "Guessing randomly",
      "Ignoring patterns",
    ],
    correctIndex: 1,
    explanation:
      "More relevant data usually leads to better predictions because patterns become clearer and more reliable with larger sample sizes.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L7_PredictionsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "sequence",
        label: "Guess the Next Number",
        icon: <Hash className="w-4 h-4" />,
        content: <GuessTheNumber />,
      },
      {
        id: "graph",
        label: "Predict from a Graph",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <PredictFromGraph />,
      },
      {
        id: "confidence",
        label: "Prediction Confidence",
        icon: <RotateCcw className="w-4 h-4" />,
        content: <CoinFlipSimulator />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is a Prediction?"
      level={3}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You're making predictions now! But how do we make the BEST prediction? Let's learn about drawing the best line through data."
      story={
        <StorySection
          paragraphs={[
            "Aru looked up at the sky. Dark clouds were rolling in, and the wind was picking up.",
            "Aru: \"I bet it's going to rain tomorrow. It looks exactly like yesterday before the storm.\"",
            "Byte: \"You just made a prediction! You used past data - what the sky looked like yesterday before rain - to guess what will happen tomorrow.\"",
            "Aru: \"But what if I'm wrong?\"",
            "Byte: \"That's totally fine! Predictions aren't guarantees. But the more data you have, and the better your pattern recognition, the more accurate your predictions become. That's the whole idea behind weather forecasting, stock markets, and even Netflix recommendations!\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A prediction is an educated guess about something unknown, based on patterns in data you've already seen. More data generally leads to better predictions. The key steps: observe a pattern, extend it into the unknown, and check how accurate you were."
        />
      }
    />
  );
}
