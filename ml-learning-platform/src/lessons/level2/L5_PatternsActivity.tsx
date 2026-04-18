"use client";

import { useState, useMemo, useCallback } from "react";
import { TrendingUp, Circle, AlertCircle, RefreshCw, Check } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playSuccess, playError } from "../../utils/sounds";
import { ScatterPlot } from "../../components/viz/data-viz";
import type { DataPoint } from "../../components/viz/data-viz";
import {
  LinearRegressionViz,
  mulberry32,
} from "../../components/viz/ml-algorithms";

/* ------------------------------------------------------------------ */
/*  Riku says                                                          */
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
      <p className="font-hand text-sm text-foreground leading-snug">
        {children}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const CORAL = "var(--accent-coral)";
const MINT = "var(--accent-mint)";
const YELLOW = "var(--accent-yellow)";
const LAV = "var(--accent-lav)";
const SKY = "var(--accent-sky)";
const PEACH = "var(--accent-peach)";
const INK = "#2b2a35";

function normalApprox(rng: () => number, std: number): number {
  return ((rng() + rng() + rng() + rng() + rng() + rng() - 3) / 3) * std;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Trend Detector                                             */
/* ------------------------------------------------------------------ */

type TrendType = "positive" | "negative" | "flat";

function generateTrendData(seed: number) {
  const rng = mulberry32(seed);
  const r = rng();
  let trend: TrendType;
  let slope: number;
  if (r < 0.33) {
    trend = "positive";
    slope = 0.5 + rng() * 0.4;
  } else if (r < 0.66) {
    trend = "negative";
    slope = -(0.5 + rng() * 0.4);
  } else {
    trend = "flat";
    slope = (rng() - 0.5) * 0.15;
  }

  const intercept = 2 + rng() * 3;
  const points: DataPoint[] = [];
  for (let i = 0; i < 25; i++) {
    const x = 0.5 + rng() * 9;
    const noise = normalApprox(rng, 1.0);
    let y = slope * x + intercept + noise;
    y = Math.max(0.2, Math.min(9.8, y));
    points.push({ x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) });
  }
  return { points, trend };
}

function TrendDetector() {
  const [seedCounter, setSeedCounter] = useState(42);
  const [selected, setSelected] = useState<TrendType | null>(null);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [shakeBtn, setShakeBtn] = useState<TrendType | null>(null);

  const data = useMemo(() => generateTrendData(seedCounter), [seedCounter]);

  const handleAnswer = useCallback(
    (answer: TrendType) => {
      if (correct === true) return;
      if (answer === data.trend) {
        playSuccess();
        setSelected(answer);
        setCorrect(true);
        setStreak((s) => s + 1);
      } else {
        playError();
        setCorrect(false);
        setStreak(0);
        setShakeBtn(answer);
        setTimeout(() => setShakeBtn(null), 500);
      }
    },
    [data.trend, correct],
  );

  const handleNewData = useCallback(() => {
    playClick();
    setSeedCounter((c) => c + 1);
    setSelected(null);
    setCorrect(null);
  }, []);

  const trendInfo: Record<TrendType, { label: string; color: string }> = {
    positive: { label: "Going Up ↗", color: MINT },
    negative: { label: "Going Down ↘", color: CORAL },
    flat: { label: "Flat →", color: SKY },
  };

  return (
    <div className="space-y-5">
      <RikuSays>
        Patterns are just things that repeat or trend. Your brain is
        incredibly good at spotting them - sometimes too good (hence:
        seeing faces in clouds). Let&apos;s train that instinct on real
        scatter plots.
      </RikuSays>

      <div className="card-sketchy p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
            What trend do you see?
          </h3>
          <span
            className="font-hand text-sm font-bold px-3 py-1 rounded-full border-2"
            style={{
              borderColor: INK,
              background: YELLOW,
              boxShadow: "2px 2px 0 #2b2a35",
            }}
          >
            🔥 Streak: {streak}
          </span>
        </div>

        <ScatterPlot
          data={data.points}
          width={520}
          height={340}
          xLabel="x"
          yLabel="y"
          showTrendLine={correct === true}
          pointRadius={6}
        />

        <div className="flex flex-wrap justify-center gap-2">
          {(["positive", "negative", "flat"] as TrendType[]).map((t) => {
            const info = trendInfo[t];
            const isCorrectAnswer = correct === true && selected === t;
            return (
              <button
                key={t}
                onClick={() => handleAnswer(t)}
                className="btn-sketchy font-hand text-sm"
                style={{
                  background: isCorrectAnswer ? MINT : info.color,
                  animation: shakeBtn === t ? "shake-x 0.4s" : undefined,
                }}
              >
                {info.label}
              </button>
            );
          })}
        </div>

        {correct === true && (
          <p
            className="text-center font-hand text-base font-bold"
            style={{ color: MINT }}
          >
            <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
            Correct! The data has a{" "}
            {data.trend === "flat" ? "flat (no clear)" : data.trend} trend.
          </p>
        )}
        {correct === false && (
          <p
            className="text-center font-hand text-base font-bold"
            style={{ color: CORAL }}
          >
            Look again...
          </p>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleNewData}
            className="btn-sketchy-outline font-hand text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Data
          </button>
        </div>
      </div>

      <RikuSays>
        Once you&apos;ve spotted a trend, the next question is: can a
        computer draw the best line through it? Yes - that&apos;s called
        <b> linear regression</b>. Drag the sliders below to try!
      </RikuSays>

      <LinearRegressionViz showResiduals showMSE />

      <InfoBox variant="blue">
        A <strong>trend</strong> is the general direction data is heading.
        Not every point follows the trend perfectly - we&apos;re looking at
        the big picture!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Find the Clusters                                          */
/* ------------------------------------------------------------------ */

function generateClusterData(seed: number, difficulty: number) {
  const rng = mulberry32(seed);
  const numClusters = 2 + Math.floor(rng() * 3);
  const centers: { cx: number; cy: number }[] = [];
  for (let c = 0; c < numClusters; c++) {
    let cx: number, cy: number;
    let attempts = 0;
    do {
      cx = 1.5 + rng() * 7;
      cy = 1.5 + rng() * 7;
      attempts++;
    } while (
      attempts < 50 &&
      centers.some(
        (o) => Math.hypot(o.cx - cx, o.cy - cy) < 3.5 - difficulty * 1.5,
      )
    );
    centers.push({ cx, cy });
  }
  const spread = 0.4 + difficulty * 0.4;
  const points: DataPoint[] = [];
  for (let c = 0; c < numClusters; c++) {
    const count = 10 + Math.floor(rng() * 6);
    for (let i = 0; i < count; i++) {
      let x = centers[c].cx + normalApprox(rng, spread);
      let y = centers[c].cy + normalApprox(rng, spread);
      x = Math.max(0.2, Math.min(9.8, x));
      y = Math.max(0.2, Math.min(9.8, y));
      points.push({
        x: Number(x.toFixed(2)),
        y: Number(y.toFixed(2)),
        category: `cluster-${c}`,
      });
    }
  }
  return { points, numClusters };
}

const CLUSTER_PALETTE: Record<string, string> = {
  "cluster-0": CORAL,
  "cluster-1": MINT,
  "cluster-2": LAV,
  "cluster-3": PEACH,
  "cluster-4": SKY,
};

function FindClusters() {
  const [seedCounter, setSeedCounter] = useState(17);
  const [difficulty, setDifficulty] = useState(0);
  const [guess, setGuess] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const data = useMemo(
    () => generateClusterData(seedCounter * 100 + difficulty, difficulty),
    [seedCounter, difficulty],
  );

  // Hide clusters until revealed by stripping category info.
  const displayPoints = useMemo<DataPoint[]>(() => {
    if (revealed) return data.points;
    return data.points.map((p) => ({ x: p.x, y: p.y, color: "#9aa0b4" }));
  }, [data.points, revealed]);

  const handleGuess = useCallback(
    (n: number) => {
      if (revealed) return;
      setGuess(n);
      setRevealed(true);
      if (n === data.numClusters) {
        playSuccess();
        setScore((s) => s + 1);
      } else {
        playError();
        setScore(0);
      }
    },
    [revealed, data.numClusters],
  );

  const handleNewData = useCallback(() => {
    playClick();
    setSeedCounter((c) => c + 1);
    setGuess(null);
    setRevealed(false);
  }, []);

  const difficultyLabels = ["Easy", "Medium", "Hard"];

  return (
    <div className="space-y-5">
      <RikuSays>
        Clusters are groups of points that hang out together - like
        cliques at lunch. Real data rarely labels them for you, so spotting
        them is half the job of a data scientist.
      </RikuSays>

      <div className="card-sketchy p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
            How many clusters do you see?
          </h3>
          <span
            className="font-hand text-sm font-bold px-3 py-1 rounded-full border-2"
            style={{
              borderColor: INK,
              background: YELLOW,
              boxShadow: "2px 2px 0 #2b2a35",
            }}
          >
            ⭐ Score: {score}
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-hand text-sm font-bold" style={{ color: INK }}>
            Difficulty:
          </span>
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(Number(e.target.value));
              setSeedCounter((c) => c + 1);
              setGuess(null);
              setRevealed(false);
            }}
            className="w-32"
            style={{ accentColor: "#ff6b6b" }}
          />
          <span
            className="font-hand text-sm font-bold"
            style={{ color: CORAL }}
          >
            {difficultyLabels[difficulty]}
          </span>
        </div>

        <ScatterPlot
          data={displayPoints}
          width={520}
          height={340}
          xLabel="x"
          yLabel="y"
          categoryColors={CLUSTER_PALETTE}
          pointRadius={6}
        />

        <div className="flex flex-wrap justify-center gap-2">
          {[2, 3, 4].map((n) => {
            const isCorrect = revealed && n === data.numClusters;
            const isWrong =
              revealed && guess === n && n !== data.numClusters;
            return (
              <button
                key={n}
                onClick={() => handleGuess(n)}
                className="btn-sketchy font-hand text-sm"
                style={{
                  background: isCorrect ? MINT : isWrong ? CORAL : SKY,
                }}
              >
                I see {n} clusters
              </button>
            );
          })}
        </div>

        {revealed && (
          <p
            className="text-center font-hand text-base font-bold"
            style={{ color: guess === data.numClusters ? MINT : CORAL }}
          >
            {guess === data.numClusters ? (
              <>
                <Check className="w-4 h-4 inline -mt-0.5 mr-1" />
                Correct! There are {data.numClusters} clusters.
              </>
            ) : (
              <>
                Not quite - there are actually {data.numClusters} clusters.
                Look at the colors!
              </>
            )}
          </p>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleNewData}
            className="btn-sketchy-outline font-hand text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Data
          </button>
        </div>
      </div>

      <InfoBox variant="amber">
        <strong>Clusters</strong> are groups of data points that are closer
        to each other than to points in other groups. Spotting clusters is
        one of the most important skills in data science!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Outlier Spotter                                            */
/* ------------------------------------------------------------------ */

interface OutlierPoint extends DataPoint {
  isOutlier: boolean;
}

function generateOutlierData(seed: number): OutlierPoint[] {
  const rng = mulberry32(seed);
  const slope = 0.4 + rng() * 0.4;
  const intercept = 1.5 + rng() * 2;
  const points: OutlierPoint[] = [];

  for (let i = 0; i < 22; i++) {
    const x = 0.5 + rng() * 9;
    const noise = normalApprox(rng, 0.6);
    let y = slope * x + intercept + noise;
    y = Math.max(0.3, Math.min(9.7, y));
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      isOutlier: false,
      category: "normal",
    });
  }

  const numOutliers = 2 + Math.floor(rng() * 2);
  for (let i = 0; i < numOutliers; i++) {
    const x = 1 + rng() * 8;
    const expected = slope * x + intercept;
    const direction = rng() > 0.5 ? 1 : -1;
    const offset = 2.8 + rng() * 2;
    let y = expected + direction * offset;
    y = Math.max(0.3, Math.min(9.7, y));
    points.push({
      x: Number(x.toFixed(2)),
      y: Number(y.toFixed(2)),
      isOutlier: true,
      category: "outlier",
    });
  }
  return points;
}

function mean(nums: number[]) {
  return nums.reduce((a, b) => a + b, 0) / Math.max(1, nums.length);
}
function stdDev(nums: number[]) {
  const m = mean(nums);
  return Math.sqrt(
    nums.reduce((a, b) => a + (b - m) ** 2, 0) / Math.max(1, nums.length),
  );
}

function OutlierSpotter() {
  const [seedCounter, setSeedCounter] = useState(99);
  const [threshold, setThreshold] = useState(2);

  const rawPoints = useMemo(
    () => generateOutlierData(seedCounter),
    [seedCounter],
  );

  // Use z-score on y-residuals vs a simple regression line to flag outliers.
  const { display, flagged, actualOutliers, correctlyFlagged } = useMemo(() => {
    const xs = rawPoints.map((p) => p.x);
    const ys = rawPoints.map((p) => p.y);
    const mx = mean(xs);
    const my = mean(ys);
    const num = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
    const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
    const slope = num / den;
    const intercept = my - slope * mx;
    const residuals = rawPoints.map((p) => p.y - (slope * p.x + intercept));
    const sd = stdDev(residuals) || 1;
    let flagged = 0;
    let correctlyFlagged = 0;
    let actualOutliers = 0;
    const display: DataPoint[] = rawPoints.map((p, i) => {
      const z = Math.abs(residuals[i] / sd);
      const isFlagged = z >= threshold;
      if (p.isOutlier) actualOutliers += 1;
      if (isFlagged) {
        flagged += 1;
        if (p.isOutlier) correctlyFlagged += 1;
      }
      return {
        x: p.x,
        y: p.y,
        category: isFlagged ? "outlier" : "normal",
      };
    });
    return { display, flagged, actualOutliers, correctlyFlagged };
  }, [rawPoints, threshold]);

  const handleNew = useCallback(() => {
    playClick();
    setSeedCounter((c) => c + 1);
  }, []);

  return (
    <div className="space-y-5">
      <RikuSays>
        Outliers are the weirdos. Sometimes they&apos;re typos, sometimes
        they&apos;re the most interesting thing in the data. Don&apos;t
        just delete them - investigate!
      </RikuSays>

      <div className="card-sketchy p-5 space-y-4">
        <h3
          className="font-hand text-base font-bold text-center"
          style={{ color: INK }}
        >
          Slide the z-score threshold to flag extreme points
        </h3>

        <ScatterPlot
          data={display}
          width={520}
          height={340}
          xLabel="x"
          yLabel="y"
          showTrendLine
          categoryColors={{ normal: MINT, outlier: CORAL }}
          pointRadius={6}
        />

        <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="font-hand text-sm font-bold" style={{ color: INK }}>
              Z-score threshold:{" "}
              <span style={{ color: CORAL }}>{threshold.toFixed(1)}</span>
            </span>
            <span className="font-hand text-xs" style={{ color: INK }}>
              Flagged: <b>{flagged}</b> • Actual outliers:{" "}
              <b>{actualOutliers}</b> • Caught:{" "}
              <b style={{ color: MINT }}>{correctlyFlagged}</b>
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={3.5}
            step={0.1}
            value={threshold}
            onChange={(e) => setThreshold(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: "#ff6b6b" }}
          />
          <p className="font-hand text-xs text-muted-foreground">
            Low threshold = flag lots of points (even normal ones). High
            threshold = only the most extreme get flagged.
          </p>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNew}
            className="btn-sketchy-outline font-hand text-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> New Data
          </button>
        </div>
      </div>

      <RikuSays>
        A z-score just means &quot;how many standard deviations from the
        trend line?&quot; Around 2 is a common cutoff, but it depends on
        your data. The coral dots are what your threshold caught.
      </RikuSays>

      <InfoBox variant="green">
        An <strong>outlier</strong> is a data point that is very different
        from the others. Outliers can be mistakes - or the most interesting
        discoveries! Scientists pay close attention to outliers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a trend in data?",
    options: [
      "A single data point",
      "The general direction data is heading",
      "The largest value",
      "The average value",
    ],
    correctIndex: 1,
    explanation:
      "A trend is the overall pattern or direction in the data - whether values tend to go up, go down, or stay flat.",
  },
  {
    question: "What are clusters in data?",
    options: [
      "The biggest numbers",
      "Groups of data points close together",
      "Points on a straight line",
      "Empty spaces in the data",
    ],
    correctIndex: 1,
    explanation:
      "Clusters are groups of data points that are closer to each other than to other points. They suggest natural groupings in the data.",
  },
  {
    question: "If a data point is far away from all the others, it is called a(n):",
    options: ["Cluster", "Trend", "Outlier", "Average"],
    correctIndex: 2,
    explanation:
      "An outlier is a data point that is significantly different from the rest. It could be an error or something genuinely unusual!",
  },
  {
    question: "Why is spotting patterns in data important?",
    options: [
      "It makes graphs look pretty",
      "It helps us understand and predict",
      "It's not important",
      "It only matters for scientists",
    ],
    correctIndex: 1,
    explanation:
      "Spotting patterns (trends, clusters, outliers) helps us understand what's happening in the data and make predictions about future observations.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L5_PatternsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "trends",
        label: "Trend Detector",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <TrendDetector />,
      },
      {
        id: "clusters",
        label: "Find the Clusters",
        icon: <Circle className="w-4 h-4" />,
        content: <FindClusters />,
      },
      {
        id: "outliers",
        label: "Outlier Spotter",
        icon: <AlertCircle className="w-4 h-4" />,
        content: <OutlierSpotter />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Spotting Patterns"
      level={2}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've learned to see trends, clusters, and outliers. But how do we organize messy data? Let's learn about sorting and grouping!"
      story={
        <StorySection
          paragraphs={[
            "It was Monday again, and it was raining - just like the last three Mondays. Aru looked out the window and said, \"It always rains on Monday!\"",
            "Byte: \"Interesting observation! You just spotted a pattern - something that repeats or follows a trend. But here's the tricky part: is it a real pattern, or just a coincidence?\"",
            "Aru: \"How do I tell the difference?\"",
            "Byte: \"By looking at more data! If it rained on 20 out of 24 Mondays, that's a strong pattern. If it only rained on 4, you just got unlucky. Today, I'll teach you three kinds of patterns: trends, clusters, and outliers.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Patterns in data come in three main forms: Trends (data going up, down, or staying flat), Clusters (groups of data points close together), and Outliers (unusual points far from the rest). Spotting these patterns is the first step to understanding what data is telling you."
        />
      }
    />
  );
}
