"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Hash, TrendingUp, RotateCcw, Coins, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";
import { LinearRegressionViz, generateLinearData } from "../../components/viz/ml-algorithms";
import type { Point } from "../../components/viz/ml-algorithms";
import { ScatterPlot, LineChart } from "../../components/viz/data-viz";
import type { DataPoint, Series } from "../../components/viz/data-viz";

/* ------------------------------------------------------------------ */
/*  Riku helper (shared across tabs)                                   */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Guess the Next Number                                      */
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
    hint: "Look at the differences: 4, 6, 8, 10 - what comes next?",
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

  // Plot the sequence itself: index → value. A prediction is just the
  // value at the next index.
  const scatterData: DataPoint[] = useMemo(
    () =>
      round.sequence.map((v, i) => ({
        x: i + 1,
        y: v,
        label: `term ${i + 1}`,
      })),
    [round],
  );
  const scatterWithGuess: DataPoint[] = useMemo(
    () =>
      revealed
        ? [
            ...scatterData,
            {
              x: round.sequence.length + 1,
              y: round.answer,
              label: "predicted",
              category: "prediction",
            },
          ]
        : scatterData,
    [scatterData, revealed, round],
  );

  const handleCheck = useCallback(() => {
    const parsed = parseInt(input.trim(), 10);
    if (isNaN(parsed)) return;
    if (parsed === round.answer) {
      playSuccess();
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
      }, 1900);
    } else {
      playError();
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

  return (
    <div className="space-y-5">
      <RikuSays>
        A prediction is just a fancy guess that's (hopefully) based on patterns you've seen before.
        Stare at the dots. Spot the rule. Guess the next one.
      </RikuSays>

      <div className="card-sketchy p-4 space-y-4">
        {/* Score / round tracker */}
        <div className="flex flex-wrap justify-between items-center gap-2">
          <span className="font-hand text-sm font-bold">What comes next?</span>
          <span className="font-hand text-xs">
            Round <span className="marker-highlight-mint font-bold">{roundIndex + 1}/{ROUNDS.length}</span>
            <span className="mx-1">·</span>
            Score <span className="marker-highlight-yellow font-bold">{score}</span>
          </span>
        </div>

        {/* Sequence as numbers */}
        <div className="flex flex-wrap justify-center gap-3">
          {round.sequence.map((num, i) => (
            <div
              key={i}
              className="flex items-center justify-center font-hand font-bold"
              style={{
                width: 64,
                height: 60,
                background: "#fff",
                border: `2.5px solid ${INK}`,
                borderRadius: 12,
                boxShadow: "3px 3px 0 #2b2a35",
                fontSize: 24,
                color: INK,
              }}
            >
              {num}
            </div>
          ))}
          <div
            className="flex items-center justify-center font-hand font-bold"
            style={{
              width: 64,
              height: 60,
              background: revealed ? YELLOW : "#f3efe6",
              border: `2.5px dashed ${INK}`,
              borderRadius: 12,
              boxShadow: "3px 3px 0 #2b2a35",
              fontSize: 24,
              color: INK,
            }}
          >
            {revealed ? round.answer : "?"}
          </div>
        </div>

        {/* Data viz scatter - pattern in chart form */}
        <ScatterPlot
          data={scatterWithGuess}
          width={520}
          height={260}
          xLabel="term #"
          yLabel="value"
          title="The sequence as a scatter plot"
          categoryColors={{ prediction: CORAL }}
        />

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
              className="btn-sketchy font-hand"
              style={{ background: MINT, color: "#fff" }}
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
          🔮 A prediction is a guess based on a pattern. Spot the rule, extend it one step, that's your prediction.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Predict from a Graph (Linear Regression Viz)               */
/* ------------------------------------------------------------------ */

function PredictFromGraph() {
  // Three toy datasets - students can cycle through them.
  const datasets: { name: string; data: Point[] }[] = useMemo(
    () => [
      { name: "Ice-cream sales vs temperature", data: generateLinearData(22, 0.7, 12, 7, 5) },
      { name: "Study hours vs test score",      data: generateLinearData(20, 0.9, 8,  9, 17) },
      { name: "Plant height vs days of sun",    data: generateLinearData(18, 0.55, 20, 6, 31) },
    ],
    [],
  );
  const [idx, setIdx] = useState(0);
  const ds = datasets[idx];

  return (
    <div className="space-y-5">
      <RikuSays>
        Draw a line through the cloud of dots, then extend it off the edge. That's the prediction!
        Drag the slope and intercept - watch the error (MSE) shrink as your line fits better.
      </RikuSays>

      <div className="card-sketchy p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-hand text-sm font-bold">🎯 Fit a line → extend it → that's your prediction</span>
          <div className="flex gap-2">
            {datasets.map((d, i) => (
              <button
                key={d.name}
                onClick={() => { playClick(); setIdx(i); }}
                className="btn-sketchy font-hand text-xs"
                style={{
                  background: idx === i ? YELLOW : "#fff",
                  color: INK,
                }}
              >
                {d.name}
              </button>
            ))}
          </div>
        </div>

        <LinearRegressionViz data={ds.data} showResiduals showMSE />

        <p className="font-hand text-xs text-center" style={{ color: INK, opacity: 0.75 }}>
          Each little red stick is a <b>residual</b> - how wrong the line is at that point. MSE is their average-squared length.
        </p>
      </div>

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          📈 Predicting from a graph means extending the pattern into unknown territory - exactly what weather forecasters and stock analysts do every day!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Prediction Confidence (Coin Flip + convergence line)       */
/* ------------------------------------------------------------------ */

function CoinFlipSimulator() {
  const [heads, setHeads] = useState(0);
  const [tails, setTails] = useState(0);
  const [history, setHistory] = useState<("H" | "T")[]>([]);
  const [lastResult, setLastResult] = useState<"H" | "T" | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [predictionPrompt, setPredictionPrompt] = useState(false);
  const [predictions, setPredictions] = useState(0);
  const [correctPredictions, setCorrectPredictions] = useState(0);
  const [runningHeadsPct, setRunningHeadsPct] = useState<{ x: number; y: number }[]>([]);

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
        setHistory((h) => [...h, result].slice(-40));
        setHeads((h) => {
          setTails((t) => {
            const nextHeads = h + (result === "H" ? 1 : 0);
            const nextTails = t + (result === "T" ? 1 : 0);
            const nextTotal = nextHeads + nextTails;
            setRunningHeadsPct((prev) =>
              [...prev, { x: nextTotal, y: (nextHeads / nextTotal) * 100 }].slice(-120),
            );
            return nextTails;
          });
          return h + (result === "H" ? 1 : 0);
        });

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
    setRunningHeadsPct([]);
  }, []);

  const headsPct = total > 0 ? (heads / total) * 100 : 0;
  const tailsPct = total > 0 ? (tails / total) * 100 : 0;

  // Running-average line (what % of flips so far have been heads?)
  const convergenceSeries: Series[] = useMemo(
    () => [
      {
        name: "Running % heads",
        data: runningHeadsPct.length > 0 ? runningHeadsPct : [{ x: 0, y: 50 }],
        color: CORAL,
      },
      {
        name: loaded ? "Target (70%)" : "Target (50%)",
        data: [
          { x: 0, y: loaded ? 70 : 50 },
          { x: Math.max(10, total), y: loaded ? 70 : 50 },
        ],
        color: SKY,
      },
    ],
    [runningHeadsPct, loaded, total],
  );

  return (
    <div className="space-y-5">
      <RikuSays>
        With 3 flips you know nothing. With 300, the pattern is obvious. That's why ML is hungry for data -
        more flips, more confidence. Watch the running line drift toward the target as you flip.
      </RikuSays>

      <div className="card-sketchy p-4 space-y-4">
        <div className="text-center">
          <span className="font-hand text-sm font-bold">🪙 Flip the coin and watch the pattern emerge</span>
        </div>

        {/* Simple coin display (no SVG gradient zoo) */}
        <div className="flex justify-center">
          <div
            className="flex items-center justify-center font-hand font-bold"
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              border: `3px solid ${INK}`,
              background: lastResult === "H" ? MINT : lastResult === "T" ? YELLOW : "#f3efe6",
              boxShadow: "4px 4px 0 #2b2a35",
              fontSize: 56,
              color: INK,
              transition: "transform .6s ease",
              transform: isFlipping ? "rotateX(720deg) scale(.7)" : "rotateX(0deg) scale(1)",
            }}
          >
            {lastResult ?? "?"}
          </div>
        </div>

        {/* Stats */}
        <div className="text-center font-hand text-sm">
          <span className="marker-highlight-mint font-bold">Heads {heads}</span>
          <span className="mx-2">·</span>
          <span className="marker-highlight-coral font-bold">Tails {tails}</span>
          <span className="mx-2">·</span>
          <span>Total {total}</span>
        </div>

        {/* Bar split */}
        {total > 0 && (
          <div className="space-y-2 max-w-sm mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-hand text-xs font-bold w-8 text-right">H</span>
              <div className="flex-1 h-6 border-2 border-foreground rounded-full overflow-hidden bg-background">
                <div className="h-full transition-all duration-500" style={{ width: `${headsPct}%`, background: MINT }} />
              </div>
              <span className="font-hand text-xs w-10">{headsPct.toFixed(0)}%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-hand text-xs font-bold w-8 text-right">T</span>
              <div className="flex-1 h-6 border-2 border-foreground rounded-full overflow-hidden bg-background">
                <div className="h-full transition-all duration-500" style={{ width: `${tailsPct}%`, background: YELLOW }} />
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
                  background: r === "H" ? MINT : YELLOW,
                  color: INK,
                }}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        {/* Convergence line chart */}
        {total >= 2 && (
          <div className="pt-2">
            <LineChart
              series={convergenceSeries}
              width={520}
              height={240}
              xLabel="flips so far"
              yLabel="% heads"
              title="The long-run pattern reveals itself"
              smooth
              showPoints={false}
            />
          </div>
        )}

        {/* Prediction prompt */}
        {predictionPrompt && !isFlipping && (
          <div className="card-sketchy p-3 text-center space-y-2" style={{ background: "#fff8e7" }}>
            <p className="font-hand text-sm font-bold">🤔 Predict the next flip!</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => handlePrediction("H")}
                className="btn-sketchy font-hand"
                style={{ background: MINT, color: "#fff" }}
              >
                Heads
              </button>
              <button
                onClick={() => handlePrediction("T")}
                className="btn-sketchy font-hand"
                style={{ background: YELLOW, color: INK }}
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
            className="btn-sketchy font-hand"
            style={{ background: MINT, color: "#fff" }}
          >
            {isFlipping ? "Flipping..." : "Flip! 🪙"}
          </button>
          <button
            onClick={() => { playClick(); setLoaded((l) => !l); }}
            className="btn-sketchy font-hand"
            style={{ background: loaded ? CORAL : "#fff", color: loaded ? "#fff" : INK }}
          >
            {loaded ? "Loaded (70% H)" : "Fair Coin"}
          </button>
          <button
            onClick={handleReset}
            className="btn-sketchy-outline font-hand inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🎲 With more data, predictions get better. After 2 flips you can't tell much. After 100, the pattern is clear - the foundation of statistics and ML!
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
