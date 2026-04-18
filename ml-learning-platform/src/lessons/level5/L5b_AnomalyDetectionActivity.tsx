"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { AlertOctagon, ShieldAlert, Activity } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ScatterPlot,
  Histogram,
  BarChart,
} from "../../components/viz/data-viz";
import { mulberry32 } from "../../components/viz/ml-algorithms";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Riku (red panda) dialogue bubble                                   */
/* ------------------------------------------------------------------ */
function RikuSays({ children }: { children: ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data generation                                                    */
/* ------------------------------------------------------------------ */
type Pt = { x: number; y: number; outlier: boolean };

function generatePoints(seed: number, n = 28, outliers = 3): Pt[] {
  const rand = mulberry32(seed);
  const cx = 50;
  const cy = 50;
  const radius = 16;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const angle = rand() * Math.PI * 2;
    const r = Math.sqrt(rand()) * radius;
    pts.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, outlier: false });
  }
  for (let i = 0; i < outliers; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const ox = cx + side * (28 + rand() * 14);
    const oy = cy + (rand() - 0.5) * 56;
    pts.push({
      x: Math.max(2, Math.min(98, ox)),
      y: Math.max(2, Math.min(98, oy)),
      outlier: true,
    });
  }
  return pts;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - Spot the Odd One                                           */
/* ------------------------------------------------------------------ */
function SpotOddTab() {
  const [seed, setSeed] = useState(7);
  const points = useMemo(() => generatePoints(seed, 28, 3), [seed]);

  const scatterData = useMemo(
    () =>
      points.map((p, i) => ({
        x: p.x,
        y: p.y,
        label: p.outlier ? `Anomaly #${i}` : `Normal #${i}`,
        category: p.outlier ? "anomaly" : "normal",
      })),
    [points],
  );

  const totalOutliers = points.filter((p) => p.outlier).length;

  return (
    <div className="space-y-4">
      <RikuSays>
        An outlier is data's version of "one of these things is not like the others".
        (Sesame Street was teaching us ML all along.) The mint points form the normal
        crowd; the coral ones drifted off.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Most points belong to the{" "}
        <span style={{ color: MINT, fontWeight: 700 }}>normal cluster</span>. A few are{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>anomalies</span> - they don't
        fit the pattern.
      </p>

      <div className="card-sketchy p-3">
        <ScatterPlot
          data={scatterData}
          categoryColors={{
            normal: "var(--accent-mint)",
            anomaly: "var(--accent-coral)",
          }}
          xLabel="feature 1"
          yLabel="feature 2"
          title="Normal crowd vs. outliers"
          height={320}
          pointRadius={7}
        />
        <div
          className="flex justify-between items-center mt-3 font-hand text-sm"
          style={{ color: INK }}
        >
          <span>
            Outliers in this cloud:{" "}
            <b style={{ color: CORAL }}>{totalOutliers}</b>
          </span>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="btn-sketchy-outline font-hand text-sm py-1 px-3"
          >
            New cloud
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        Banks use this exact idea to catch <b>credit-card fraud</b>. Most of your
        purchases form a "normal cloud". When a transaction sits far outside it (wrong
        country, weird hour), the bank flags it.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Distance threshold + histogram + bar scores                */
/* ------------------------------------------------------------------ */
function DistanceTab() {
  const [threshold, setThreshold] = useState(18);

  const points = useMemo(() => {
    const rand = mulberry32(42);
    const cx = 50;
    const cy = 50;
    const arr: { x: number; y: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const angle = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand()) * 14;
      arr.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad });
    }
    // a few far ones
    arr.push({ x: 82, y: 20 });
    arr.push({ x: 12, y: 78 });
    arr.push({ x: 88, y: 72 });
    arr.push({ x: 10, y: 30 });
    return arr.map((p) => ({
      ...p,
      d: Math.hypot(p.x - cx, p.y - cy),
    }));
  }, []);

  const scatterData = useMemo(
    () =>
      points.map((p, i) => ({
        x: p.x,
        y: p.y,
        label: `#${i} (d=${p.d.toFixed(1)})`,
        category: p.d > threshold ? "anomaly" : "normal",
      })),
    [points, threshold],
  );

  const distances = useMemo(() => points.map((p) => p.d), [points]);

  const scoreBars = useMemo(
    () =>
      points
        .map((p, i) => ({
          label: `#${i}`,
          value: Number(p.d.toFixed(1)),
          color:
            p.d > threshold ? "var(--accent-coral)" : "var(--accent-mint)",
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 12),
    [points, threshold],
  );

  const flagged = points.filter((p) => p.d > threshold).length;

  return (
    <div className="space-y-4">
      <RikuSays>
        Computers do not squint at a scatter plot. They just measure how far each point
        sits from the center. Anything past the threshold gets a red flag.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Drag the threshold. Points farther from the center than the cutoff turn coral
        (flagged).
      </p>

      <div className="card-sketchy p-3">
        <ScatterPlot
          data={scatterData}
          categoryColors={{
            normal: "var(--accent-mint)",
            anomaly: "var(--accent-coral)",
          }}
          xLabel="feature 1"
          yLabel="feature 2"
          title="Threshold = distance from center"
          height={300}
          pointRadius={7}
        />

        <div className="mt-3">
          <label
            className="font-hand font-bold text-sm flex justify-between"
            style={{ color: INK }}
          >
            <span>Sensitivity threshold</span>
            <span style={{ color: CORAL }}>
              flagged: {flagged} / {points.length}
            </span>
          </label>
          <input
            type="range"
            min={6}
            max={40}
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full mt-1 accent-accent-coral"
          />
          <div
            className="flex justify-between font-hand text-xs mt-1"
            style={{ color: INK, opacity: 0.6 }}
          >
            <span>strict (more alarms)</span>
            <span>loose (fewer alarms)</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="card-sketchy p-3">
          <Histogram
            data={distances}
            bins={12}
            showMean
            showMedian
            color="var(--accent-sky)"
            title="Distance distribution"
            xLabel="distance from center"
            yLabel="count"
            height={240}
          />
        </div>
        <div className="card-sketchy p-3">
          <BarChart
            data={scoreBars}
            title="Top anomaly scores"
            yLabel="distance"
            height={240}
          />
        </div>
      </div>

      <InfoBox variant="amber">
        Tuning the threshold is the trickiest part. Too tight means false alarms every
        time. Too loose means real fraud slips by. ML engineers tune this number for
        weeks.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Real World Anomaly Hunters                                 */
/* ------------------------------------------------------------------ */
const HUNTERS = [
  { emoji: "💳", name: "Fraud Detection", normal: "Your usual shops", anom: "$3000 in Russia at 3 AM", color: CORAL },
  { emoji: "❤️", name: "Heart Monitor", normal: "Steady 70 BPM", anom: "Sudden 180 BPM spike", color: MINT },
  { emoji: "🏭", name: "Factory Sensor", normal: "Vibration ~0.2g", anom: "1.5g shake → bearing failing", color: YELLOW },
  { emoji: "🛰️", name: "Network Security", normal: "Logins from your city", anom: "10,000 logins in 2 sec", color: SKY },
  { emoji: "🌐", name: "Server Health", normal: "CPU at 40%", anom: "CPU pinned at 100% for 1 hour", color: LAVENDER },
  { emoji: "📈", name: "Stock Trading", normal: "Calm market hum", anom: "Sudden 20% drop in 1 min", color: "#f49ac1" },
];

function HuntersTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        Anomaly detection is quietly running behind most of modern life. You probably
        triggered a few of these alarms today without realising.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Anomaly detection is one of ML's most useful tricks. It's secretly running
        everywhere:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HUNTERS.map((h) => (
          <div key={h.name} className="card-sketchy overflow-hidden p-4">
            <div
              style={{
                height: 6,
                background: h.color,
                margin: "-16px -16px 12px -16px",
                borderBottom: `2px solid ${INK}`,
              }}
            />
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 50,
                  height: 50,
                  background: h.color,
                  border: `2px solid ${INK}`,
                  boxShadow: "3px 3px 0 #2b2a35",
                  fontSize: 26,
                }}
              >
                {h.emoji}
              </div>
              <h3 className="font-hand text-base font-bold" style={{ color: INK }}>
                {h.name}
              </h3>
            </div>
            <div className="space-y-1 font-hand text-sm" style={{ color: INK }}>
              <div className="flex gap-2">
                <span
                  className="px-1.5 rounded"
                  style={{ background: MINT, color: PAPER, fontSize: 10, fontWeight: 700 }}
                >
                  NORMAL
                </span>
                <span>{h.normal}</span>
              </div>
              <div className="flex gap-2">
                <span
                  className="px-1.5 rounded"
                  style={{ background: CORAL, color: PAPER, fontSize: 10, fontWeight: 700 }}
                >
                  ALERT
                </span>
                <span>{h.anom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox variant="green">
        The trick: you don't need to label what's "bad" in advance. The model learns
        what's <b>normal</b> from millions of examples, then anything weird stands out.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is anomaly detection?",
    options: [
      "Sorting data",
      "Finding examples that don't fit the normal pattern",
      "Drawing pictures",
      "Counting things",
    ],
    correctIndex: 1,
    explanation:
      "Anomaly detection finds the few examples that look very different from the rest - fraud, bugs, attacks, breakdowns.",
  },
  {
    question: "How does an anomaly detector usually decide an example is weird?",
    options: [
      "By smelling it",
      "By measuring its distance from the normal cluster",
      "By asking the user",
      "Random guess",
    ],
    correctIndex: 1,
    explanation:
      "If a point is much farther from the center of normal data than the threshold allows, it gets flagged.",
  },
  {
    question: "Why is anomaly detection 'unsupervised'?",
    options: [
      "It needs no labels - it learns what 'normal' looks like by itself",
      "It runs without electricity",
      "Nobody supervises it",
      "It's wild",
    ],
    correctIndex: 0,
    explanation:
      "Unlike supervised learning, you don't need to mark examples as 'fraud' / 'not fraud' first. The model just learns the shape of normal.",
  },
  {
    question: "If you make the threshold too LOOSE, what happens?",
    options: [
      "More false alarms",
      "Real anomalies slip through unnoticed",
      "Computer crashes",
      "Nothing",
    ],
    correctIndex: 1,
    explanation:
      "A loose threshold means even far-out points count as 'normal' - so real fraud or failures slip past undetected.",
  },
];

export default function L5b_AnomalyDetectionActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "spot",
        label: "Spot the Odd One",
        icon: <AlertOctagon className="w-4 h-4" />,
        content: <SpotOddTab />,
      },
      {
        id: "distance",
        label: "Distance Threshold",
        icon: <Activity className="w-4 h-4" />,
        content: <DistanceTab />,
      },
      {
        id: "hunters",
        label: "Real Hunters",
        icon: <ShieldAlert className="w-4 h-4" />,
        content: <HuntersTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Anomaly Detection: Finding the Weird Ones"
      level={5}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Anomalies are about finding what doesn't fit. Next: how do we squish big tangled data so we can actually see it?"
      story={
        <StorySection
          paragraphs={[
            "Aru got a text from her bank: \"Did you just spend $400 on shoes in Brazil at 2 AM?\"",
            "Aru: \"Brazil?! I'm in my bedroom!\" She tapped 'NO' and the card was frozen instantly.",
            "Byte: \"That was anomaly detection, doing its job. Your bank doesn't know what fraud LOOKS like exactly - it just knows what YOUR normal looks like. Coffee shops, your school cafeteria, that one bookstore. Brazil at 2 AM? Way outside normal.\"",
            "Aru: \"So it didn't need anyone to teach it 'this is fraud' - it just spotted the weirdness?\"",
            "Byte: \"Exactly. That's the magic of unsupervised anomaly detection. Learn what normal looks like, then ring the alarm when something doesn't fit.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Anomaly detection is unsupervised ML that finds rare, unusual data points by learning what 'normal' looks like and flagging anything that sits far outside it. Used everywhere from fraud detection to factory sensors to heart monitors."
        />
      }
    />
  );
}
