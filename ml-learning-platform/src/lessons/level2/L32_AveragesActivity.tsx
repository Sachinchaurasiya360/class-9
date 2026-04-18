"use client";

import { useState, useMemo } from "react";
import { Scale, BarChart3, Trophy, Plus, Minus } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  Histogram,
  BoxPlot,
  BarChart,
} from "../../components/viz/data-viz";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";

/* ------------------------------------------------------------------ */
/*  Riku dialogue helper                                               */
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
/*  Tab 1 – Balance Beam (Mean as balancing point)                     */
/* ------------------------------------------------------------------ */

function BalanceTab() {
  const [values, setValues] = useState<number[]>([3, 5, 7, 8]);

  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  function addValue(v: number) {
    if (values.length >= 15) return;
    playPop();
    setValues([...values, v]);
  }
  function removeLast() {
    if (values.length <= 1) return;
    playClick();
    setValues(values.slice(0, -1));
  }

  return (
    <div className="space-y-4">
      <RikuSays>
        The mean is the &quot;fair share&quot; - if everyone got exactly the
        same amount, how much would that be? Add &apos;em up, divide by count.
        Done.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        The <b>mean</b> is the spot where data balances perfectly - like a
        seesaw.
      </p>

      <div className="card-sketchy p-4" style={{ background: "#fffdf5" }}>
        <Histogram
          data={values}
          bins={Math.min(10, Math.max(4, new Set(values).size))}
          showMean
          width={520}
          height={260}
          xLabel="value"
          yLabel="count"
          color="var(--accent-sky)"
        />
      </div>

      <div
        className="card-sketchy p-3 text-center"
        style={{ background: CORAL + "22" }}
      >
        <p className="font-hand text-sm font-bold text-foreground">
          mean = {mean.toFixed(2)}{" "}
          <span className="text-muted-foreground">
            ({values.length} value{values.length === 1 ? "" : "s"})
          </span>
        </p>
      </div>

      {/* Controls */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <p className="font-hand text-sm font-bold text-foreground">
          Add a value (0–10):
        </p>
        <div className="flex flex-wrap gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => addValue(n)}
              disabled={values.length >= 15}
              className="px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-sm font-bold bg-background hover:bg-accent-yellow/50 transition-colors"
              style={{ opacity: values.length >= 15 ? 0.4 : 1 }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={removeLast}
            className="btn-sketchy-outline font-hand text-xs"
          >
            <Minus className="w-3 h-3" /> Remove last
          </button>
          <button
            onClick={() => setValues([3, 5, 7, 8])}
            className="btn-sketchy-outline font-hand text-xs"
          >
            Reset
          </button>
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Values: [{values.join(", ")}]
        </p>
      </div>

      <RikuSays>
        See that coral line in the histogram? That&apos;s the mean. Add a huge
        value and watch it drag to the right like it&apos;s being pulled on a
        leash.
      </RikuSays>

      <InfoBox variant="blue">
        The mean = (sum of all values) ÷ (how many values). It&apos;s the
        perfect balance point. If you put a real seesaw under it, the data
        wouldn&apos;t tip!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Mean vs Median race                                        */
/* ------------------------------------------------------------------ */

function MeanMedianTab() {
  const [vals, setVals] = useState<number[]>([4, 5, 6, 7, 8, 9, 10, 11, 12]);

  const sorted = useMemo(() => [...vals].sort((a, b) => a - b), [vals]);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const median =
    sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  function addValue(v: number) {
    if (vals.length >= 15) return;
    playPop();
    setVals([...vals, v]);
  }

  // Bars showing how mean vs median compare side-by-side.
  const compareBars = [
    { label: "mean", value: Number(mean.toFixed(2)), color: CORAL },
    { label: "median", value: Number(median.toFixed(2)), color: LAVENDER },
  ];

  return (
    <div className="space-y-4">
      <RikuSays>
        The mean is the &quot;fair share&quot; - if everyone got the same
        amount. The median is &quot;the middle person&quot;. They&apos;re
        usually close, but outliers break the mean.
      </RikuSays>

      <p className="font-hand text-base text-foreground text-center">
        Mean and median both find the &quot;middle&quot; - but in different
        ways.
      </p>

      {/* Histogram with mean + median overlays */}
      <div className="card-sketchy p-4" style={{ background: "#fffdf5" }}>
        <Histogram
          data={vals}
          bins={8}
          showMean
          showMedian
          width={520}
          height={260}
          xLabel="value"
          yLabel="count"
          color="var(--accent-sky)"
        />
      </div>

      {/* BoxPlot to show median + quartiles */}
      <div className="card-sketchy p-4" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs text-muted-foreground mb-2 text-center">
          Box plot: the line inside the box is the median. The box itself holds
          the middle half of the data.
        </p>
        <BoxPlot
          data={vals}
          width={520}
          height={220}
          yLabel="value"
          labels={["your data"]}
        />
      </div>

      {/* Side-by-side comparison bar chart */}
      <div className="card-sketchy p-4" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs text-muted-foreground mb-2 text-center">
          Side-by-side: mean (coral) vs median (lavender).
        </p>
        <BarChart
          data={compareBars}
          width={520}
          height={220}
          yLabel="value"
          animateOnMount={false}
        />
      </div>

      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
        <p className="font-hand text-sm font-bold text-foreground">
          Add values to the data:
        </p>
        <div className="flex flex-wrap gap-2">
          {[2, 5, 10, 25, 50, 75, 100].map((n) => (
            <button
              key={n}
              onClick={() => addValue(n)}
              className="px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-sm bg-background hover:bg-accent-yellow/50"
            >
              <Plus className="w-3 h-3 inline" />
              {n}
            </button>
          ))}
          <button
            onClick={() =>
              setVals([4, 5, 6, 7, 8, 9, 10, 11, 12])
            }
            className="btn-sketchy-outline font-hand text-xs"
          >
            Reset
          </button>
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Try adding <b>100</b> a few times - watch the coral mean line DASH
          right while the lavender median barely moves!
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div
          className="card-sketchy p-3"
          style={{ background: CORAL + "22" }}
        >
          <p className="font-hand font-bold text-foreground">Mean (average)</p>
          <p className="font-hand text-xs text-foreground mt-1">
            Add everything, divide by count. Easy to compute, but{" "}
            <b>outliers pull it around</b>.
          </p>
        </div>
        <div
          className="card-sketchy p-3"
          style={{ background: LAVENDER + "22" }}
        >
          <p className="font-hand font-bold text-foreground">
            Median (middle)
          </p>
          <p className="font-hand text-xs text-foreground mt-1">
            Sort the values and pick the middle one.{" "}
            <b>Outliers don&apos;t bother it.</b>
          </p>
        </div>
      </div>

      <RikuSays>
        Mean is easily bullied by outliers. Median just ignores them. Character
        matters!
      </RikuSays>

      <InfoBox variant="amber">
        The mean tells you &quot;what&apos;s the perfect balance point?&quot;
        The median tells you &quot;what&apos;s the typical value, ignoring
        weirdos?&quot;. Both are useful - for different questions!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – When does each one win?                                    */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  {
    title: "House prices in a neighborhood",
    icon: "🏠",
    color: CORAL,
    use: "median",
    why: "One mansion can drag the mean way up. The median tells you what a TYPICAL house actually costs.",
  },
  {
    title: "Test scores in a class",
    icon: "📝",
    color: SKY,
    use: "mean",
    why: "Test scores usually cluster together with no extreme outliers, so the mean works well.",
  },
  {
    title: "Salaries at a company with 1 CEO",
    icon: "💼",
    color: LAVENDER,
    use: "median",
    why: "The CEO's huge salary makes the mean misleading. The median shows what most workers really earn.",
  },
  {
    title: "Height of basketball players",
    icon: "🏀",
    color: MINT,
    use: "mean",
    why: "Heights are pretty similar with no crazy outliers - the mean gives a fair summary.",
  },
];

// Small demo: a few "normal" houses and a mansion that drags the mean
const HOUSE_PRICES_NORMAL = [35, 40, 42, 45, 48, 50, 52, 55];
const HOUSE_PRICES_WITH_MANSION = [...HOUSE_PRICES_NORMAL, 500];

function computeStats(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const median =
    sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  return { mean, median };
}

function ScenariosTab() {
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [showMansion, setShowMansion] = useState(false);

  const data = showMansion ? HOUSE_PRICES_WITH_MANSION : HOUSE_PRICES_NORMAL;
  const { mean, median } = computeStats(data);

  const outlierBars = [
    { label: "mean", value: Number(mean.toFixed(1)), color: CORAL },
    { label: "median", value: Number(median.toFixed(1)), color: LAVENDER },
  ];

  return (
    <div className="space-y-4">
      <RikuSays>
        Real talk: most &quot;average&quot; news headlines mean the arithmetic
        mean. That&apos;s fine - UNTIL a single weirdo shows up. Then the mean
        lies and the median saves you.
      </RikuSays>

      {/* Interactive outlier demo */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-sm font-bold text-foreground text-center">
          Slide the outlier: flip the switch to drop a mansion into the
          neighborhood.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => {
              playClick();
              setShowMansion((v) => !v);
            }}
            className="btn-sketchy font-hand text-xs"
            style={{ background: showMansion ? CORAL : YELLOW }}
          >
            {showMansion
              ? "Remove the 500k mansion"
              : "Add a 500k mansion"}
          </button>
        </div>

        <BarChart
          data={outlierBars}
          width={520}
          height={220}
          yLabel="price (lakhs)"
          animateOnMount={false}
        />

        <p className="font-hand text-xs text-muted-foreground text-center">
          Houses: [{data.join(", ")}]
        </p>
        <p className="font-hand text-xs text-foreground text-center">
          {showMansion
            ? "See how the mean jumped but the median barely blinked? That's why median wins here."
            : "Without the outlier, mean and median are almost the same."}
        </p>
      </div>

      <p className="font-hand text-base text-foreground text-center">
        For each situation, would you trust the <b>mean</b> or the{" "}
        <b>median</b>?
      </p>

      <div className="space-y-3">
        {SCENARIOS.map((s, i) => {
          const picked = picks[i];
          const correct = picked === s.use;
          return (
            <div
              key={s.title}
              className="card-sketchy p-4"
              style={{
                background: picked
                  ? correct
                    ? "#e8fff5"
                    : "#ffe8e8"
                  : "#fffdf5",
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="text-2xl rounded-full border-2 border-foreground flex items-center justify-center"
                  style={{ background: s.color, width: 44, height: 44 }}
                >
                  {s.icon}
                </div>
                <p className="font-hand font-bold text-foreground flex-1">
                  {s.title}
                </p>
              </div>
              {!picked ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if ("mean" === s.use) playSuccess();
                      else playClick();
                      setPicks({ ...picks, [i]: "mean" });
                    }}
                    className="flex-1 btn-sketchy-outline font-hand text-sm"
                    style={{ background: CORAL + "22" }}
                  >
                    Mean
                  </button>
                  <button
                    onClick={() => {
                      if ("median" === s.use) playSuccess();
                      else playClick();
                      setPicks({ ...picks, [i]: "median" });
                    }}
                    className="flex-1 btn-sketchy-outline font-hand text-sm"
                    style={{ background: LAVENDER + "22" }}
                  >
                    Median
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-hand text-sm font-bold text-foreground">
                    {correct ? "✓ Correct!" : "✗ Better choice: " + s.use}
                  </p>
                  <p className="font-hand text-sm text-foreground mt-1">
                    {s.why}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(picks).length === SCENARIOS.length && (
        <div
          className="card-sketchy p-4 text-center"
          style={{ background: YELLOW + "33" }}
        >
          <Trophy className="w-8 h-8 mx-auto text-foreground" />
          <p className="font-hand text-lg font-bold text-foreground mt-2">
            You scored{" "}
            {
              Object.entries(picks).filter(
                ([i, v]) => v === SCENARIOS[Number(i)].use,
              ).length
            }{" "}
            / {SCENARIOS.length}
          </p>
          <button
            onClick={() => setPicks({})}
            className="btn-sketchy font-hand text-sm mt-2"
            style={{ background: YELLOW }}
          >
            Try again
          </button>
        </div>
      )}

      <RikuSays>
        Rule of paw: if you spot an outlier, reach for the median. It just
        keeps its cool.
      </RikuSays>

      <InfoBox variant="green">
        Rule of thumb: if the data has outliers, use the <b>median</b>. If
        it&apos;s nice and clustered, the <b>mean</b> is fine.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "How do you calculate the mean of a list of numbers?",
    options: [
      "Pick the smallest one",
      "Add them all up and divide by how many there are",
      "Pick the middle one",
      "Multiply them",
    ],
    correctIndex: 1,
    explanation: "Mean = sum ÷ count. It's the balance point of the data.",
  },
  {
    question: "What is the median of [2, 5, 7, 9, 100]?",
    options: ["5", "7", "24.6", "100"],
    correctIndex: 1,
    explanation:
      "Sorted, the middle value is 7. Notice the median ignored the outlier 100.",
  },
  {
    question:
      "If salaries at a company are mostly $50k but the CEO makes $5 million, which gives a more honest 'typical' salary?",
    options: ["Mean", "Median", "Both equal", "Neither works"],
    correctIndex: 1,
    explanation:
      "The CEO's huge salary drags the mean way up. The median tells you what a typical worker actually earns.",
  },
  {
    question: "The mean is also called the...",
    options: ["middle", "average", "biggest", "count"],
    correctIndex: 1,
    explanation: "'Mean' and 'average' mean the same thing.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L32_AveragesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "balance",
        label: "Balance Beam",
        icon: <Scale className="w-4 h-4" />,
        content: <BalanceTab />,
      },
      {
        id: "meanmedian",
        label: "Mean vs Median",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <MeanMedianTab />,
      },
      {
        id: "scenarios",
        label: "Which One Wins?",
        icon: <Trophy className="w-4 h-4" />,
        content: <ScenariosTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Finding the Middle: Mean & Median"
      level={2}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You can now describe the 'middle' of any dataset two different ways. Next up: spotting bigger patterns!"
      story={
        <StorySection
          paragraphs={[
            "Aru: \"My teacher said our class average on the test was 78. But honestly, almost everyone got way higher than that.\"",
            "Byte: \"Did anyone get really LOW?\"",
            "Aru: \"Yeah, two kids got 5 and 10. They forgot it was test day.\"",
            "Byte: \"That explains it! Those low scores are pulling the average DOWN. The 'average' isn't always the best way to describe a typical value. Let me show you a better way.\"",
            "Aru: \"There's more than one kind of average?!\"",
            "Byte: \"Oh yes. Get ready to meet the mean's cooler, sneakier cousin: the median.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="There are two main ways to find the 'middle' of a dataset. The MEAN adds everything up and divides - it's the balance point but it's easily fooled by outliers. The MEDIAN sorts the values and picks the middle one - it ignores extreme values and tells you what's truly typical."
        />
      }
    />
  );
}
