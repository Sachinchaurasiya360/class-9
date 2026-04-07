import { useState, useMemo } from "react";
import { Scale, BarChart3, Trophy, Plus, Minus } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Balance Beam (Mean as balancing point)                     */
/* ------------------------------------------------------------------ */

function BalanceTab() {
  const [values, setValues] = useState<number[]>([3, 5, 7, 8]);

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const W = 400;
  const PAD = 30;
  const xFor = (v: number) => PAD + (v / 10) * (W - PAD * 2);

  function addValue(v: number) {
    if (values.length >= 10) return;
    playPop();
    setValues([...values, v]);
  }
  function removeLast() {
    if (values.length <= 1) return;
    playClick();
    setValues(values.slice(0, -1));
  }

  // Tilt: difference between mean and beam center (5)
  const tilt = (mean - 5) * 2.5;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        The <b>mean</b> is the spot where data balances perfectly — like a seesaw.
      </p>

      <div className="card-sketchy notebook-grid p-4" style={{ background: PAPER }}>
        <svg width="100%" viewBox={`0 0 ${W} 200`} style={{ maxHeight: 240 }}>
          <defs>
            {[CORAL, MINT, LAVENDER, SKY, PEACH].map((c, idx) => (
              <linearGradient key={idx} id={`bal-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
                <stop offset="100%" stopColor={c} />
              </linearGradient>
            ))}
            <radialGradient id="bal-pivot" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#fff3a0" />
              <stop offset="100%" stopColor={YELLOW} />
            </radialGradient>
          </defs>
          {/* Pivot triangle (always at mean) */}
          <polygon
            points={`${xFor(mean) - 14},170 ${xFor(mean) + 14},170 ${xFor(mean)},145`}
            fill="url(#bal-pivot)"
            stroke={INK}
            strokeWidth="2"
            className="pulse-glow"
            style={{ color: YELLOW, transition: "all 0.4s ease" }}
          />
          <text
            x={xFor(mean)}
            y="190"
            textAnchor="middle"
            fill={INK}
            style={{ fontFamily: "Kalam, cursive", fontSize: 13, fontWeight: 700 }}
          >
            mean = {mean.toFixed(2)}
          </text>

          {/* Beam (rotates) */}
          <g
            style={{
              transform: `rotate(${tilt}deg)`,
              transformOrigin: `${xFor(mean)}px 140px`,
              transition: "transform 0.5s ease",
            }}
          >
            <line
              x1={PAD}
              y1="140"
              x2={W - PAD}
              y2="140"
              stroke={INK}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Tick marks */}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((t) => (
              <g key={t}>
                <line
                  x1={xFor(t)}
                  y1="135"
                  x2={xFor(t)}
                  y2="145"
                  stroke={INK}
                  strokeWidth="1.5"
                  opacity="0.5"
                />
                <text
                  x={xFor(t)}
                  y="128"
                  textAnchor="middle"
                  fill={INK}
                  opacity="0.5"
                  style={{ fontFamily: "Patrick Hand, cursive", fontSize: 10 }}
                >
                  {t}
                </text>
              </g>
            ))}

            {/* Stack values like blocks */}
            {values.map((v, i) => {
              const stackIdx = values.slice(0, i).filter((x) => x === v).length;
              return (
                <rect
                  key={i}
                  x={xFor(v) - 10}
                  y={120 - stackIdx * 18}
                  width="20"
                  height="16"
                  fill={`url(#bal-grad-${i % 5})`}
                  stroke={INK}
                  strokeWidth="2"
                  rx="2"
                  style={{
                    transition: "all 0.3s ease",
                    filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)",
                  }}
                />
              );
            })}
          </g>
        </svg>
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
              disabled={values.length >= 10}
              className="px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-sm font-bold bg-background hover:bg-accent-yellow/50 transition-colors"
              style={{ opacity: values.length >= 10 ? 0.4 : 1 }}
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

      <InfoBox variant="blue">
        The mean = (sum of all values) ÷ (how many values). It's the perfect
        balance point. If you put a real seesaw under it, the data wouldn't tip!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Mean vs Median race                                        */
/* ------------------------------------------------------------------ */

function MeanMedianTab() {
  const [vals, setVals] = useState<number[]>([4, 5, 6, 7, 8]);

  const sorted = [...vals].sort((a, b) => a - b);
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  const median =
    sorted.length % 2 === 1
      ? sorted[Math.floor(sorted.length / 2)]
      : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;

  const W = 400;
  const PAD = 30;
  const MAX = 100;
  const xFor = (v: number) => PAD + (v / MAX) * (W - PAD * 2);

  function addValue(v: number) {
    if (vals.length >= 10) return;
    playPop();
    setVals([...vals, v]);
  }

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Mean and median both find the "middle" — but in different ways.
      </p>

      <div className="card-sketchy notebook-grid p-4" style={{ background: PAPER }}>
        <svg width="100%" viewBox={`0 0 ${W} 180`} style={{ maxHeight: 220 }}>
          <defs>
            <radialGradient id="mm-sky" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
            <linearGradient id="mm-yellow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff3a0" />
              <stop offset="100%" stopColor={YELLOW} />
            </linearGradient>
            <linearGradient id="mm-mint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7ee0d8" />
              <stop offset="100%" stopColor={MINT} />
            </linearGradient>
          </defs>
          {/* Number line */}
          <line
            x1={PAD}
            y1="120"
            x2={W - PAD}
            y2="120"
            stroke={INK}
            strokeWidth="2"
          />
          {[0, 20, 40, 60, 80, 100].map((t) => (
            <g key={t}>
              <line
                x1={xFor(t)}
                y1="115"
                x2={xFor(t)}
                y2="125"
                stroke={INK}
                strokeWidth="1.5"
              />
              <text
                x={xFor(t)}
                y="140"
                textAnchor="middle"
                fill={INK}
                opacity="0.5"
                style={{ fontFamily: "Patrick Hand, cursive", fontSize: 10 }}
              >
                {t}
              </text>
            </g>
          ))}

          {/* Data points */}
          {vals.map((v, i) => (
            <circle
              key={i}
              cx={xFor(v)}
              cy={105 - (i % 3) * 5}
              r="7"
              fill="url(#mm-sky)"
              stroke={INK}
              strokeWidth="2"
              style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
            />
          ))}

          {/* Mean marker (yellow) */}
          <g style={{ transition: "all 0.5s ease" }}>
            <line
              x1={xFor(mean)}
              y1="50"
              x2={xFor(mean)}
              y2="120"
              stroke={YELLOW}
              strokeWidth="3"
              strokeDasharray="5 3"
              className="signal-flow pulse-glow"
              style={{ color: YELLOW }}
            />
            <rect
              x={xFor(mean) - 26}
              y="30"
              width="52"
              height="20"
              fill="url(#mm-yellow)"
              stroke={INK}
              strokeWidth="2"
              rx="3"
              style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
            />
            <text
              x={xFor(mean)}
              y="44"
              textAnchor="middle"
              fill={INK}
              style={{ fontFamily: "Kalam, cursive", fontSize: 12, fontWeight: 700 }}
            >
              mean {mean.toFixed(1)}
            </text>
          </g>

          {/* Median marker (mint) */}
          <g style={{ transition: "all 0.5s ease" }}>
            <line
              x1={xFor(median)}
              y1="80"
              x2={xFor(median)}
              y2="120"
              stroke={MINT}
              strokeWidth="3"
              strokeDasharray="5 3"
            />
            <rect
              x={xFor(median) - 30}
              y="60"
              width="60"
              height="20"
              fill="url(#mm-mint)"
              stroke={INK}
              strokeWidth="2"
              rx="3"
              style={{ filter: "drop-shadow(1.5px 1.5px 0 #2b2a35)" }}
            />
            <text
              x={xFor(median)}
              y="74"
              textAnchor="middle"
              fill={INK}
              style={{ fontFamily: "Kalam, cursive", fontSize: 12, fontWeight: 700 }}
            >
              median {median}
            </text>
          </g>
        </svg>
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
            onClick={() => setVals([4, 5, 6, 7, 8])}
            className="btn-sketchy-outline font-hand text-xs"
          >
            Reset
          </button>
        </div>
        <p className="font-hand text-xs text-muted-foreground">
          Try adding <b>100</b> a few times — watch the yellow mean DASH right
          while the mint median barely moves!
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div
          className="card-sketchy p-3"
          style={{ background: YELLOW + "33" }}
        >
          <p className="font-hand font-bold text-foreground">Mean (average)</p>
          <p className="font-hand text-xs text-foreground mt-1">
            Add everything, divide by count. Easy to compute, but{" "}
            <b>outliers pull it around</b>.
          </p>
        </div>
        <div
          className="card-sketchy p-3"
          style={{ background: MINT + "33" }}
        >
          <p className="font-hand font-bold text-foreground">Median (middle)</p>
          <p className="font-hand text-xs text-foreground mt-1">
            Sort the values and pick the middle one. <b>Outliers don't bother it.</b>
          </p>
        </div>
      </div>

      <InfoBox variant="amber">
        The mean tells you "what's the perfect balance point?" The median
        tells you "what's the typical value, ignoring weirdos?". Both are
        useful — for different questions!
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
    why: "Heights are pretty similar with no crazy outliers — the mean gives a fair summary.",
  },
];

function ScenariosTab() {
  const [picks, setPicks] = useState<Record<number, string>>({});

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        For each situation, would you trust the <b>mean</b> or the <b>median</b>?
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
                  : PAPER,
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
                      const ok = "mean" === s.use;
                      ok ? playSuccess() : playClick();
                      setPicks({ ...picks, [i]: "mean" });
                    }}
                    className="flex-1 btn-sketchy-outline font-hand text-sm"
                    style={{ background: YELLOW + "33" }}
                  >
                    Mean
                  </button>
                  <button
                    onClick={() => {
                      const ok = "median" === s.use;
                      ok ? playSuccess() : playClick();
                      setPicks({ ...picks, [i]: "median" });
                    }}
                    className="flex-1 btn-sketchy-outline font-hand text-sm"
                    style={{ background: MINT + "33" }}
                  >
                    Median
                  </button>
                </div>
              ) : (
                <div>
                  <p className="font-hand text-sm font-bold text-foreground">
                    {correct ? "✓ Correct!" : "✗ Better choice: " + s.use}
                  </p>
                  <p className="font-hand text-sm text-foreground mt-1">{s.why}</p>
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
            {Object.entries(picks).filter(
              ([i, v]) => v === SCENARIOS[Number(i)].use
            ).length}{" "}
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

      <InfoBox variant="green">
        Rule of thumb: if the data has outliers, use the <b>median</b>. If it's
        nice and clustered, the <b>mean</b> is fine.
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
    explanation: "Sorted, the middle value is 7. Notice the median ignored the outlier 100.",
  },
  {
    question: "If salaries at a company are mostly $50k but the CEO makes $5 million, which gives a more honest 'typical' salary?",
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
    []
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
          conceptSummary="There are two main ways to find the 'middle' of a dataset. The MEAN adds everything up and divides — it's the balance point but it's easily fooled by outliers. The MEDIAN sorts the values and picks the middle one — it ignores extreme values and tells you what's truly typical."
        />
      }
    />
  );
}
