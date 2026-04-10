"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Hash, TrendingUp, RotateCcw, Coins, Sparkles, Palette } from "lucide-react";
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
/*  Theme palette (matches sketchy notebook)                           */
/* ------------------------------------------------------------------ */

const THEMES = [
  { name: "Coral", node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint", node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky", node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
];

const INK = "#2b2a35";

function ThemePicker({ themeIdx, setThemeIdx }: { themeIdx: number; setThemeIdx: (n: number) => void }) {
  return (
    <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Theme:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              onClick={() => { playClick(); setThemeIdx(i); }}
              title={t.name}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.node }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Guess the Next Number                                      */
/* ------------------------------------------------------------------ */

interface Round {
  sequence: number[];
  answer: number;
  patternLabel: string;
  hint: string;
  rule: (n: number, i: number) => string;
}

const ROUNDS: Round[] = [
  {
    sequence: [2, 4, 6, 8],
    answer: 10,
    patternLabel: "+2",
    hint: "Look at the difference between consecutive numbers.",
    rule: () => "+2",
  },
  {
    sequence: [3, 9, 27, 81],
    answer: 243,
    patternLabel: "\u00d73",
    hint: "Try dividing each number by the one before it.",
    rule: () => "\u00d73",
  },
  {
    sequence: [1, 1, 2, 3, 5],
    answer: 8,
    patternLabel: "Fibonacci (add the two previous numbers)",
    hint: "Try adding the two previous numbers together.",
    rule: () => "+prev",
  },
  {
    sequence: [1, 4, 9, 16, 25],
    answer: 36,
    patternLabel: "perfect squares (1\u00b2, 2\u00b2, 3\u00b2, ...)",
    hint: "What do you get when you square 1, 2, 3, 4, 5, 6?",
    rule: (_n, i) => `${i + 2}\u00b2`,
  },
  {
    sequence: [2, 6, 12, 20, 30],
    answer: 42,
    patternLabel: "differences increase by 2 each time",
    hint: "Look at the differences: 4, 6, 8, 10 — what comes next?",
    rule: (_n, i) => `+${(i + 2) * 2}`,
  },
];

function GuessTheNumber() {
  const [themeIdx, setThemeIdx] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [burstKey, setBurstKey] = useState(0);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = THEMES[themeIdx];

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
      playSuccess();
      setFeedback("correct");
      setRevealed(true);
      setBurstKey((k) => k + 1);
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
      }, 1900);
    } else {
      playError();
      setFeedback("wrong");
      setShakeKey((k) => k + 1);
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
        <div className="card-sketchy p-6 text-center space-y-3" style={{ background: "#fff8e7" }}>
          <div className="text-5xl">🎉</div>
          <h3 className="font-hand text-2xl font-bold" style={{ color: INK }}>All Rounds Complete!</h3>
          <p className="font-hand text-base">
            Your score: <span className="marker-highlight-yellow font-bold">{score} / {ROUNDS.length}</span>
          </p>
          <button
            onClick={() => {
              playClick();
              setRoundIndex(0);
              setScore(0);
              setInput("");
              setFeedback(null);
              setRevealed(false);
              setCompleted(false);
            }}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
        </div>
      </div>
    );
  }

  // SVG layout
  const boxW = 70, boxH = 60, gap = 24;
  const totalBoxes = round.sequence.length + 1;
  const svgW = totalBoxes * (boxW + gap) + 16;
  const svgH = 150;

  return (
    <div className="space-y-5">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />

      <div className="card-sketchy p-4 notebook-grid space-y-4">
        {/* Score / round tracker */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="font-hand text-sm font-bold">What comes next?</span>
          <span className="font-hand text-xs">
            Round <span className="marker-highlight-mint font-bold">{roundIndex + 1}/{ROUNDS.length}</span>
            <span className="mx-1">·</span>
            Score <span className="marker-highlight-yellow font-bold">{score}</span>
          </span>
        </div>

        {/* Sequence SVG */}
        <div className="flex justify-center overflow-x-auto">
          <svg
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            key={shakeKey}
            className={feedback === "wrong" ? "shake" : ""}
            style={feedback === "wrong" ? { animation: "shake 0.4s" } : undefined}
          >
            <defs>
              <radialGradient id="seq-grad" cx="35%" cy="30%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.node} />
              </radialGradient>
              <radialGradient id="seq-mystery" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#fff3a0" />
                <stop offset="100%" stopColor={theme.accent} />
              </radialGradient>
              <marker id="seq-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                <path d="M0,0 L8,3 L0,6 Z" fill={INK} />
              </marker>
            </defs>

            {/* Connector arcs with rule labels and traveling pulses */}
            {round.sequence.map((_, i) => {
              if (i === round.sequence.length - 1 && !revealed) return null;
              const x1 = 16 + i * (boxW + gap) + boxW;
              const x2 = 16 + (i + 1) * (boxW + gap);
              const midX = (x1 + x2) / 2;
              const arcPath = `M${x1},75 Q${midX},25 ${x2},75`;
              const ruleLabel = round.rule(round.sequence[i], i);
              return (
                <g key={`arc-${i}`}>
                  <path
                    d={arcPath}
                    fill="none"
                    stroke={theme.node}
                    strokeWidth={2.2}
                    strokeDasharray="4 3"
                    markerEnd="url(#seq-arrow)"
                    opacity={0.8}
                  />
                  <circle r={4} fill={theme.accent} stroke={INK} strokeWidth={1}>
                    <animateMotion dur="1.6s" repeatCount="indefinite" path={arcPath} />
                  </circle>
                  <text
                    x={midX} y={28} textAnchor="middle"
                    fontFamily="Kalam" fontWeight="bold" fontSize={13}
                    fill={INK}
                  >
                    {ruleLabel}
                  </text>
                </g>
              );
            })}

            {/* Number boxes */}
            {round.sequence.map((num, i) => {
              const x = 16 + i * (boxW + gap);
              return (
                <g key={`n-${i}`}>
                  <rect
                    x={x} y={45} width={boxW} height={boxH} rx={12}
                    fill="url(#seq-grad)"
                    stroke={INK} strokeWidth={2.5}
                  />
                  <text
                    x={x + boxW / 2} y={86}
                    textAnchor="middle"
                    fontFamily="Kalam" fontWeight="bold" fontSize={26}
                    fill="#fff"
                  >
                    {num}
                  </text>
                </g>
              );
            })}

            {/* Mystery box */}
            {(() => {
              const x = 16 + round.sequence.length * (boxW + gap);
              return (
                <g>
                  <rect
                    x={x} y={45} width={boxW} height={boxH} rx={12}
                    fill={revealed ? "url(#seq-mystery)" : "#f3efe6"}
                    stroke={INK} strokeWidth={2.5}
                    strokeDasharray={revealed ? undefined : "6 4"}
                    className={revealed ? "pulse-glow" : "wobble"}
                    style={revealed ? { color: theme.accent } : undefined}
                  />
                  <text
                    x={x + boxW / 2} y={86}
                    textAnchor="middle"
                    fontFamily="Kalam" fontWeight="bold" fontSize={26}
                    fill={revealed ? INK : "#94a3b8"}
                  >
                    {revealed ? round.answer : "?"}
                  </text>
                  {/* Spark burst on reveal */}
                  {revealed && (
                    <g key={burstKey}>
                      {Array.from({ length: 10 }).map((_, k) => {
                        const angle = (k / 10) * Math.PI * 2;
                        const cx = x + boxW / 2;
                        const cy = 75;
                        const x2 = cx + Math.cos(angle) * 50;
                        const y2 = cy + Math.sin(angle) * 50;
                        return (
                          <line
                            key={k}
                            x1={cx} y1={cy} x2={x2} y2={y2}
                            stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round"
                            className="spark"
                            style={{ animationDelay: `${k * 0.04}s` }}
                          />
                        );
                      })}
                    </g>
                  )}
                </g>
              );
            })()}
          </svg>
        </div>

        {/* Input & check */}
        {!revealed && (
          <div className="flex justify-center gap-2 items-center">
            <input
              type="number"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (feedback === "wrong") setFeedback(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder="?"
              className="w-28 px-3 py-2 border-2 border-foreground rounded-lg font-hand text-lg font-bold text-center bg-background focus:outline-none focus:bg-accent-yellow/30 transition-colors"
            />
            <button
              onClick={handleCheck}
              disabled={!input.trim()}
              className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
              style={{ background: theme.node, color: "#fff" }}
            >
              Check ✨
            </button>
          </div>
        )}

        {/* Feedback */}
        {feedback === "correct" && (
          <div className="text-center">
            <p className="font-hand text-base">
              <span className="marker-highlight-mint font-bold">Correct!</span> The pattern is{" "}
              <span className="marker-highlight-yellow font-bold">{round.patternLabel}</span>
            </p>
          </div>
        )}
        {feedback === "wrong" && (
          <div className="text-center">
            <p className="font-hand text-base">
              <span className="marker-highlight-coral font-bold">Try again!</span>{" "}
              <span className="text-muted-foreground">Hint: {round.hint}</span>
            </p>
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🔮 A prediction is a guess based on a pattern. Watch the dashed arcs — they show the rule connecting each number to the next!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Predict from a Graph                                       */
/* ------------------------------------------------------------------ */

interface DataPoint {
  x: number;
  y: number;
}

function generateScatterData(rng: () => number, slope: number, intercept: number): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < 15; i++) {
    const x = 5 + rng() * 55;
    const noise = (rng() - 0.5) * 14;
    const y = slope * x + intercept + noise;
    points.push({ x, y: Math.max(0, Math.min(100, y)) });
  }
  return points;
}

function PredictFromGraph() {
  const [themeIdx, setThemeIdx] = useState(1);
  const [seed, setSeed] = useState(42);
  const [userPoint, setUserPoint] = useState<DataPoint | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [roundsDone, setRoundsDone] = useState(0);
  const [errors, setErrors] = useState<number[]>([]);
  const [revealKey, setRevealKey] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);

  const theme = THEMES[themeIdx];

  const { dataPoints, slope, intercept } = useMemo(() => {
    const rng = mulberry32(seed);
    const s = 0.4 + rng() * 0.8;
    const b = 5 + rng() * 20;
    return { dataPoints: generateScatterData(rng, s, b), slope: s, intercept: b };
  }, [seed]);

  const targetX = 85;
  const actualY = slope * targetX + intercept;
  const clampedActualY = Math.max(0, Math.min(100, actualY));

  const svgW = 480;
  const svgH = 320;
  const pad = { left: 44, right: 22, top: 28, bottom: 36 };
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
      if (dataX >= 70 && dataX <= 100 && dataY >= 0 && dataY <= 100) {
        playPop();
        setUserPoint({ x: dataX, y: dataY });
      }
    },
    [showAnswer, fromSvgX, fromSvgY],
  );

  const handleShowAnswer = useCallback(() => {
    if (!userPoint) return;
    playSuccess();
    setShowAnswer(true);
    setRevealKey((k) => k + 1);
    const err = Math.abs(userPoint.y - clampedActualY);
    setErrors((prev) => [...prev, err]);
    setRoundsDone((r) => r + 1);
  }, [userPoint, clampedActualY]);

  const handleNewData = useCallback(() => {
    playClick();
    setSeed((s) => s + 7);
    setUserPoint(null);
    setShowAnswer(false);
  }, []);

  const gridLines = [0, 20, 40, 60, 80, 100];

  const trendY0 = Math.max(0, Math.min(100, intercept));
  const trendY1 = Math.max(0, Math.min(100, slope * 100 + intercept));

  const avgError = useMemo(() => {
    if (errors.length === 0) return 0;
    return errors.reduce((a, b) => a + b, 0) / errors.length;
  }, [errors]);

  const errorMagnitude = userPoint && showAnswer ? Math.abs(userPoint.y - clampedActualY) : 0;
  const isGreatGuess = showAnswer && errorMagnitude < 8;

  return (
    <div className="space-y-5">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />

      <div className="card-sketchy p-4 notebook-grid space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="font-hand text-sm font-bold">
            🎯 Click in the <span className="marker-highlight-yellow">yellow zone</span> to predict
          </span>
          {roundsDone >= 3 && (
            <span className="font-hand text-xs">
              Avg error: <span className="marker-highlight-coral font-bold">{avgError.toFixed(1)} units</span>
            </span>
          )}
        </div>

        <div className="flex justify-center overflow-x-auto">
          <svg
            ref={svgRef}
            width={svgW}
            height={svgH}
            viewBox={`0 0 ${svgW} ${svgH}`}
            className={showAnswer ? "" : "cursor-crosshair"}
            onClick={handleClick}
          >
            <defs>
              <radialGradient id="pt-grad" cx="35%" cy="30%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.node} />
              </radialGradient>
              <radialGradient id="user-grad" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff3a0" />
                <stop offset="100%" stopColor={theme.accent} />
              </radialGradient>
            </defs>

            {/* Data zone */}
            <rect x={pad.left} y={pad.top} width={plotW * 0.7} height={plotH} fill="#fefefe" />
            {/* Prediction zone */}
            <rect
              x={pad.left + plotW * 0.7}
              y={pad.top}
              width={plotW * 0.3}
              height={plotH}
              fill="#fff8d6"
            />
            {/* Dashed border between zones */}
            <line
              x1={pad.left + plotW * 0.7}
              y1={pad.top}
              x2={pad.left + plotW * 0.7}
              y2={pad.top + plotH}
              stroke={INK}
              strokeWidth={2}
              strokeDasharray="6 4"
            />

            {/* Zone labels */}
            <text
              x={pad.left + plotW * 0.35} y={pad.top - 10}
              textAnchor="middle"
              fontFamily="Kalam" fontWeight="bold" fontSize={12}
              fill={INK}
            >
              📊 Data Zone
            </text>
            <text
              x={pad.left + plotW * 0.85} y={pad.top - 10}
              textAnchor="middle"
              fontFamily="Kalam" fontWeight="bold" fontSize={12}
              fill={INK}
            >
              🔮 Prediction Zone
            </text>

            {/* Grid */}
            {gridLines.map((v) => (
              <g key={`g-${v}`}>
                <line
                  x1={toSvgX(v)} y1={pad.top}
                  x2={toSvgX(v)} y2={pad.top + plotH}
                  stroke="#d8d3c4" strokeWidth={0.6}
                />
                <line
                  x1={pad.left} y1={toSvgY(v)}
                  x2={pad.left + plotW} y2={toSvgY(v)}
                  stroke="#d8d3c4" strokeWidth={0.6}
                />
              </g>
            ))}

            {/* Axes */}
            <line x1={pad.left} y1={pad.top + plotH} x2={pad.left + plotW} y2={pad.top + plotH} stroke={INK} strokeWidth={2} />
            <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + plotH} stroke={INK} strokeWidth={2} />

            {gridLines.map((v) => (
              <text key={`lx-${v}`} x={toSvgX(v)} y={pad.top + plotH + 18} textAnchor="middle" fontFamily="Kalam" fontSize={11} fill={INK}>
                {v}
              </text>
            ))}
            {gridLines.filter((v) => v > 0).map((v) => (
              <text key={`ly-${v}`} x={pad.left - 8} y={toSvgY(v) + 4} textAnchor="end" fontFamily="Kalam" fontSize={11} fill={INK}>
                {v}
              </text>
            ))}

            {/* Data points */}
            {dataPoints.map((p, i) => (
              <g key={i}>
                <circle
                  cx={toSvgX(p.x)} cy={toSvgY(p.y)} r={6}
                  fill="url(#pt-grad)"
                  stroke={INK} strokeWidth={1.5}
                />
              </g>
            ))}

            {/* Trend line (drawn after reveal) */}
            {showAnswer && (
              <g key={revealKey}>
                <line
                  x1={toSvgX(0)} y1={toSvgY(trendY0)}
                  x2={toSvgX(100)} y2={toSvgY(trendY1)}
                  stroke={INK}
                  strokeWidth={2.5}
                  strokeDasharray="500"
                  strokeDashoffset="500"
                  style={{ animation: "draw 0.9s ease-out forwards" }}
                />
                <style>{`@keyframes draw { to { stroke-dashoffset: 0; } }`}</style>

                {/* Actual point */}
                <circle
                  cx={toSvgX(targetX)} cy={toSvgY(clampedActualY)} r={9}
                  fill={theme.node}
                  stroke={INK} strokeWidth={2}
                  className="pulse-glow"
                  style={{ color: theme.node }}
                />
                <text
                  x={toSvgX(targetX)} y={toSvgY(clampedActualY) - 14}
                  textAnchor="middle"
                  fontFamily="Kalam" fontWeight="bold" fontSize={12}
                  fill={INK}
                >
                  Actual
                </text>

                {/* Error line between user guess and actual */}
                {userPoint && (
                  <line
                    x1={toSvgX(userPoint.x)} y1={toSvgY(userPoint.y)}
                    x2={toSvgX(targetX)} y2={toSvgY(clampedActualY)}
                    stroke="#ff6b6b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                )}
              </g>
            )}

            {/* User prediction point */}
            {userPoint && (
              <g transform={`translate(${toSvgX(userPoint.x)}, ${toSvgY(userPoint.y)})`}>
                <polygon
                  points="0,-11 3,-3 11,-3 5,3 7,11 0,6 -7,11 -5,3 -11,-3 -3,-3"
                  fill="url(#user-grad)"
                  stroke={INK} strokeWidth={1.8}
                  className="pulse-glow"
                  style={{ color: theme.accent }}
                />
              </g>
            )}

            {/* Confetti spark on great guess */}
            {isGreatGuess && userPoint && (
              <g key={`burst-${revealKey}`}>
                {Array.from({ length: 10 }).map((_, k) => {
                  const angle = (k / 10) * Math.PI * 2;
                  const cx = toSvgX(userPoint.x);
                  const cy = toSvgY(userPoint.y);
                  return (
                    <line
                      key={k}
                      x1={cx} y1={cy}
                      x2={cx + Math.cos(angle) * 40}
                      y2={cy + Math.sin(angle) * 40}
                      stroke={theme.accent} strokeWidth={2.5} strokeLinecap="round"
                      className="spark"
                      style={{ animationDelay: `${k * 0.04}s` }}
                    />
                  );
                })}
              </g>
            )}
          </svg>
        </div>

        {/* Results */}
        {showAnswer && userPoint && (
          <div className="text-center font-hand text-sm">
            Your guess <span className="marker-highlight-yellow font-bold">({userPoint.x.toFixed(0)}, {userPoint.y.toFixed(1)})</span>
            <span className="mx-1">·</span>
            Actual <span className="marker-highlight-mint font-bold">({targetX}, {clampedActualY.toFixed(1)})</span>
            <span className="mx-1">·</span>
            Error <span className={`font-bold ${isGreatGuess ? "marker-highlight-mint" : "marker-highlight-coral"}`}>
              {errorMagnitude.toFixed(1)}
            </span>
            {isGreatGuess && <span className="ml-1">🎯</span>}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          {!showAnswer && (
            <button
              onClick={handleShowAnswer}
              disabled={!userPoint}
              className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
              style={{ background: theme.node, color: "#fff" }}
            >
              Show Answer ✨
            </button>
          )}
          {showAnswer && (
            <button
              onClick={handleNewData}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              New Data
            </button>
          )}
        </div>
      </div>

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          📈 Predicting from a graph means extending the pattern into unknown territory — exactly what weather forecasters and stock analysts do every day!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Prediction Confidence (Coin Flip)                          */
/* ------------------------------------------------------------------ */

function CoinFlipSimulator() {
  const [themeIdx, setThemeIdx] = useState(2);
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [history, setHistory] = useState<("H" | "T")[]>([]);
  const [lastResult, setLastResult] = useState<"H" | "T" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [predictionPrompt, setPredictionPrompt] = useState(false);
  const [predictions, setPredictions] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);

  const theme = THEMES[themeIdx];
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
      playClick();
      setIsFlipping(true);

      flipTimerRef.current = setTimeout(() => {
        const prob = loaded ? 0.7 : 0.5;
        const result: "H" | "T" = Math.random() < prob ? "H" : "T";
        setLastResult(result);
        setHistory((h) => [...h, result].slice(-30));
        if (result === "H") setHeads((h) => h + 1);
        else setTails((t) => t + 1);

        if (prediction) {
          setPredictions((p) => p + 1);
          if (prediction === result) {
            setCorrectPredictions((c) => c + 1);
            playSuccess();
          } else {
            playError();
          }
        } else {
          playPop();
        }

        setIsFlipping(false);
        setPredictionPrompt(false);
      }, 600);
    },
    [isFlipping, loaded],
  );

  const handleFlip = useCallback(() => {
    if (predictionPrompt) return;
    if (total > 0 && total % 10 === 0 && !predictionPrompt) {
      setPredictionPrompt(true);
      return;
    }
    doFlip();
  }, [total, predictionPrompt, doFlip]);

  const handlePrediction = useCallback(
    (choice: "H" | "T") => {
      doFlip(choice);
    },
    [doFlip],
  );

  const handleReset = useCallback(() => {
    playClick();
    setHeads(0);
    setTails(0);
    setHistory([]);
    setLastResult(null);
    setPredictionPrompt(false);
    setPredictions(0);
    setCorrectPredictions(0);
  }, []);

  const headsPct = total > 0 ? (heads / total) * 100 : 0;
  const tailsPct = total > 0 ? (tails / total) * 100 : 0;

  return (
    <div className="space-y-5">
      <ThemePicker themeIdx={themeIdx} setThemeIdx={setThemeIdx} />

      <div className="card-sketchy p-4 notebook-grid space-y-4">
        <div className="text-center">
          <span className="font-hand text-sm font-bold">🪙 Flip the coin and watch the pattern emerge</span>
        </div>

        {/* Big animated coin */}
        <div className="flex justify-center">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <defs>
              <radialGradient id="coin-h" cx="35%" cy="30%">
                <stop offset="0%" stopColor={theme.glow} />
                <stop offset="100%" stopColor={theme.node} />
              </radialGradient>
              <radialGradient id="coin-t" cx="35%" cy="30%">
                <stop offset="0%" stopColor="#fff3a0" />
                <stop offset="100%" stopColor={theme.accent} />
              </radialGradient>
            </defs>
            <g
              style={{
                transformOrigin: "70px 70px",
                transition: "transform 0.6s ease-in-out",
                transform: isFlipping ? "rotateX(720deg) scale(0.7)" : "rotateX(0deg) scale(1)",
              }}
            >
              <circle
                cx="70" cy="70" r="56"
                fill={lastResult === "H" ? "url(#coin-h)" : lastResult === "T" ? "url(#coin-t)" : "#f3efe6"}
                stroke={INK} strokeWidth={3}
                className={lastResult && !isFlipping ? "pulse-glow" : ""}
                style={lastResult ? { color: lastResult === "H" ? theme.node : theme.accent } : undefined}
              />
              <circle
                cx="70" cy="70" r="46" fill="none"
                stroke={INK} strokeWidth={1.5} strokeDasharray="3 3"
                opacity={0.5}
              />
              <text
                x="70" y="82" textAnchor="middle"
                fontFamily="Kalam" fontWeight="bold" fontSize={42}
                fill={INK}
              >
                {lastResult === null ? "?" : lastResult}
              </text>
            </g>
          </svg>
        </div>

        {/* Stats */}
        <div className="text-center font-hand text-sm">
          <span className="marker-highlight-mint font-bold">Heads {heads}</span>
          <span className="mx-2">·</span>
          <span className="marker-highlight-coral font-bold">Tails {tails}</span>
          <span className="mx-2">·</span>
          <span>Total {total}</span>
        </div>

        {/* Bar chart */}
        {total > 0 && (
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-hand text-xs font-bold w-8 text-right">H</span>
              <div className="flex-1 h-6 border-2 border-foreground rounded-full overflow-hidden bg-background">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${headsPct}%`, background: theme.node }}
                />
              </div>
              <span className="font-hand text-xs w-10">{headsPct.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-hand text-xs font-bold w-8 text-right">T</span>
              <div className="flex-1 h-6 border-2 border-foreground rounded-full overflow-hidden bg-background">
                <div
                  className="h-full transition-all duration-500"
                  style={{ width: `${tailsPct}%`, background: theme.accent }}
                />
              </div>
              <span className="font-hand text-xs w-10">{tailsPct.toFixed(0)}%</span>
            </div>
          </div>
        )}

        {/* History strip */}
        {history.length > 0 && (
          <div className="flex justify-center flex-wrap gap-1">
            {history.map((r, i) => (
              <span
                key={i}
                className="inline-block w-6 h-6 rounded-full border-2 border-foreground font-hand text-xs font-bold leading-5 text-center"
                style={{
                  background: r === "H" ? theme.node : theme.accent,
                  color: r === "H" ? "#fff" : INK,
                }}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Prediction prompt */}
        {predictionPrompt && !isFlipping && (
          <div className="card-sketchy p-3 text-center space-y-2" style={{ background: "#fff8e7" }}>
            <p className="font-hand text-sm font-bold">🤔 Predict the next flip!</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handlePrediction("H")}
                className="px-4 py-1.5 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
                style={{ background: theme.node, color: "#fff" }}
              >
                Heads
              </button>
              <button
                onClick={() => handlePrediction("T")}
                className="px-4 py-1.5 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
                style={{ background: theme.accent, color: INK }}
              >
                Tails
              </button>
            </div>
          </div>
        )}

        {predictions > 0 && (
          <div className="text-center font-hand text-xs">
            Prediction accuracy: <span className="marker-highlight-yellow font-bold">{correctPredictions}/{predictions} ({((correctPredictions / predictions) * 100).toFixed(0)}%)</span>
          </div>
        )}

        {total >= 50 && (
          <div className="text-center font-hand text-sm">
            <Sparkles className="w-4 h-4 inline mr-1" />
            With more data the pattern is clearer!{" "}
            {!loaded ? (
              <span className="marker-highlight-mint font-bold">Fair coin → ~50/50</span>
            ) : (
              <span className="marker-highlight-coral font-bold">Loaded coin shows clear bias!</span>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          <button
            onClick={handleFlip}
            disabled={isFlipping || predictionPrompt}
            className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed transition-transform"
            style={{ background: theme.node, color: "#fff" }}
          >
            {isFlipping ? "Flipping..." : "Flip! 🪙"}
          </button>
          <button
            onClick={() => { playClick(); setLoaded((l) => !l); }}
            className={`px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground transition-all ${loaded ? "bg-accent-coral text-white shadow-[2px_2px_0_#2b2a35]" : "bg-background"}`}
          >
            {loaded ? "Loaded (70% H)" : "Fair Coin"}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🎲 With more data, predictions get better. After 2 flips you can't tell much. After 100, the pattern is clear — the foundation of statistics and ML!
        </span>
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
        icon: <Coins className="w-4 h-4" />,
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
