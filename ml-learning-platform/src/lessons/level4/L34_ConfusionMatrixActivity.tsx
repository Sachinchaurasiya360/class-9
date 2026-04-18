"use client";

import { useState, useMemo } from "react";
import { Grid3X3, Sliders, AlertCircle } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ConfusionMatrixViz,
  generateClassification2D,
  type Point,
} from "@/components/viz/ml-algorithms";
import { ScatterPlot } from "@/components/viz/data-viz";

const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Riku - local dialogue helper                                       */
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
/*  Tab 1 – The Four Outcomes (preset scenarios)                      */
/* ------------------------------------------------------------------ */

type Preset = {
  key: string;
  title: string;
  labels: [string, string];
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  takeaway: string;
  color: string;
};

const PRESETS: Preset[] = [
  {
    key: "spam",
    title: "Spam filter 📧",
    labels: ["spam", "not spam"],
    tp: 42,
    tn: 48,
    fp: 3,
    fn: 7,
    takeaway:
      "High accuracy, but those 3 FPs are real emails stuck in spam - one of them might be the job offer you were waiting for.",
    color: SKY,
  },
  {
    key: "cancer",
    title: "Cancer screening 🏥",
    labels: ["has disease", "healthy"],
    tp: 18,
    tn: 70,
    fp: 8,
    fn: 4,
    takeaway:
      "Those 4 False Negatives are patients told they're fine when they're not. In medicine, missing a real case is the worst kind of wrong.",
    color: CORAL,
  },
  {
    key: "fraud",
    title: "Credit fraud 💳",
    labels: ["fraud", "legit"],
    tp: 25,
    tn: 150,
    fp: 10,
    fn: 5,
    takeaway:
      "The 10 False Positives are real purchases flagged as fraud - a minor annoyance. The 5 False Negatives are actual fraud getting through. Cost: real money.",
    color: YELLOW,
  },
];

function FourOutcomesTab() {
  const [activeKey, setActiveKey] = useState<string>(PRESETS[0].key);
  const active = PRESETS.find((p) => p.key === activeKey) ?? PRESETS[0];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Every prediction lands in ONE of four boxes. Pick a scenario to see how.
      </p>

      <RikuSays>
        True positive: we said yes, it was yes. False positive: we said yes, it
        was no. False positive = confidently wrong. We've all been there.
      </RikuSays>

      {/* Scenario switcher */}
      <div className="flex gap-2 flex-wrap justify-center">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setActiveKey(p.key)}
            className="px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-xs font-bold transition-all"
            style={{
              background: activeKey === p.key ? p.color : PAPER,
              boxShadow: activeKey === p.key ? "2px 2px 0 #2b2a35" : "none",
            }}
          >
            {p.title}
          </button>
        ))}
      </div>

      {/* Confusion Matrix viz */}
      <ConfusionMatrixViz
        tp={active.tp}
        tn={active.tn}
        fp={active.fp}
        fn={active.fn}
        labels={active.labels}
      />

      <div
        className="card-sketchy p-4"
        style={{ background: active.color + "22" }}
      >
        <p className="font-hand text-sm text-foreground">
          <b>{active.title}:</b> {active.takeaway}
        </p>
      </div>

      <InfoBox variant="blue">
        This 2×2 grid is called a <b>confusion matrix</b> - because it shows you
        exactly where your model gets confused.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Build your own matrix (live from a classifier)            */
/* ------------------------------------------------------------------ */

function BuildMatrixTab() {
  const [threshold, setThreshold] = useState(50);
  const [noiseLevel, setNoiseLevel] = useState(1); // 0 = clean, 1 = normal, 2 = chaos

  // Labelled dataset: class 1 = "positive" (e.g. cat). We'll classify by
  // x-coordinate with a movable threshold - then count how predictions
  // match truth.
  const basePoints = useMemo<Point[]>(
    () => generateClassification2D(50, 23),
    []
  );

  // Optionally jitter some labels to simulate a noisier problem.
  const points = useMemo<Point[]>(() => {
    if (noiseLevel === 0) return basePoints;
    return basePoints.map((p, i) => {
      // Flip a fraction of labels deterministically.
      const flipEvery = noiseLevel === 1 ? 7 : 4;
      if (i % flipEvery === 0) {
        return { ...p, label: p.label === 1 ? 0 : 1 };
      }
      return p;
    });
  }, [basePoints, noiseLevel]);

  // Classifier rule: if x >= threshold, predict 1 (positive). Simple but
  // lets students see the matrix respond to a moving decision boundary.
  const { tp, tn, fp, fn, scatterData } = useMemo(() => {
    let tp = 0,
      tn = 0,
      fp = 0,
      fn = 0;
    const scatterData = points.map((p) => {
      const actual = p.label ?? 0;
      const predicted = p.x >= threshold ? 1 : 0;
      let category: "TP" | "TN" | "FP" | "FN";
      if (predicted === 1 && actual === 1) {
        tp++;
        category = "TP";
      } else if (predicted === 0 && actual === 0) {
        tn++;
        category = "TN";
      } else if (predicted === 1 && actual === 0) {
        fp++;
        category = "FP";
      } else {
        fn++;
        category = "FN";
      }
      return {
        x: p.x,
        y: p.y,
        category,
        label: `${category} · actual ${actual}`,
      };
    });
    return { tp, tn, fp, fn, scatterData };
  }, [points, threshold]);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Move the threshold. The matrix IS the report card - live.
      </p>

      <RikuSays>
        Watch what happens: slide the threshold left and the model calls
        everything "positive". Slide it right and it calls everything
        "negative". The sweet spot is somewhere in the middle - and the matrix
        tells you exactly where you are.
      </RikuSays>

      {/* Scatter - points coloured by outcome */}
      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <p className="font-hand text-sm font-bold text-foreground text-center mb-2">
          Predictions on 50 test points (vertical line = decision threshold)
        </p>
        <div className="flex justify-center">
          <ScatterPlot
            data={scatterData}
            width={520}
            height={280}
            xLabel="feature 1"
            yLabel="feature 2"
            categoryColors={{
              TP: MINT,
              TN: SKY,
              FP: PEACH,
              FN: CORAL,
            }}
            pointRadius={6}
          />
        </div>
        <div className="flex gap-3 justify-center mt-2 font-hand text-xs flex-wrap">
          <Swatch color={MINT} label="TP" />
          <Swatch color={SKY} label="TN" />
          <Swatch color={PEACH} label="FP" />
          <Swatch color={CORAL} label="FN" />
        </div>
      </div>

      {/* Threshold slider */}
      <div
        className="card-sketchy p-4 space-y-3"
        style={{ background: "#fff8e7" }}
      >
        <p className="font-hand text-sm font-bold text-foreground">
          Decision threshold: x ≥ {threshold} → predict positive
        </p>
        <input
          type="range"
          min={10}
          max={90}
          step={2}
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Noise toggle */}
      <div className="flex gap-2 justify-center">
        {[
          { n: 0, label: "Clean data" },
          { n: 1, label: "A bit noisy" },
          { n: 2, label: "Chaos mode" },
        ].map((opt) => (
          <button
            key={opt.n}
            onClick={() => setNoiseLevel(opt.n)}
            className="btn-sketchy-outline font-hand text-xs"
            style={{
              background: noiseLevel === opt.n ? YELLOW : PAPER,
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Live confusion matrix */}
      <ConfusionMatrixViz
        tp={tp}
        tn={tn}
        fp={fp}
        fn={fn}
        labels={["positive", "negative"]}
      />

      <InfoBox variant="amber">
        Notice: moving one slider changes every cell at once. The four numbers
        always add up to 50 - but their balance tells a different story at each
        position.
      </InfoBox>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span
        className="inline-block w-3 h-3 rounded-full border-2 border-foreground"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – When mistakes hurt differently                             */
/* ------------------------------------------------------------------ */

const STAKES = [
  {
    title: "Spam filter 📧",
    color: SKY,
    labels: ["spam", "not spam"] as [string, string],
    tp: 40,
    tn: 45,
    fp: 6,
    fn: 9,
    fpCost: "An important email lands in spam - you miss your job offer.",
    fnCost: "A spam email reaches your inbox - minor annoyance.",
    worse: "FP",
    explain: "Better to let some spam through than lose a real email.",
  },
  {
    title: "Cancer detector 🏥",
    color: CORAL,
    labels: ["has cancer", "healthy"] as [string, string],
    tp: 22,
    tn: 68,
    fp: 8,
    fn: 2,
    fpCost: "A healthy person gets extra tests - scary but treatable.",
    fnCost: "A sick person is told they're fine - disease grows untreated.",
    worse: "FN",
    explain: "Missing a real case is FAR worse than a false alarm here.",
  },
  {
    title: "Loud fire alarm 🔥",
    color: YELLOW,
    labels: ["fire", "no fire"] as [string, string],
    tp: 12,
    tn: 78,
    fp: 9,
    fn: 1,
    fpCost: "Alarm goes off when there's no fire - you're annoyed.",
    fnCost: "Real fire, but no alarm - danger.",
    worse: "FN",
    explain: "Missing a real fire is dangerous. False alarms are just loud.",
  },
];

function StakesTab() {
  const [open, setOpen] = useState(0);
  const s = STAKES[open];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Not all mistakes are equal. Some <b>false positives</b> hurt more - sometimes <b>false negatives</b> do.
      </p>

      <RikuSays>
        The four numbers always tell a story - but the story changes depending
        on what you're predicting. Same matrix, totally different stakes.
      </RikuSays>

      <div className="flex gap-2 flex-wrap justify-center">
        {STAKES.map((st, i) => (
          <button
            key={st.title}
            onClick={() => setOpen(i)}
            className="px-3 py-1.5 rounded-lg border-2 border-foreground font-hand text-xs font-bold transition-all"
            style={{
              background: open === i ? st.color : PAPER,
              boxShadow: open === i ? "2px 2px 0 #2b2a35" : "none",
            }}
          >
            {st.title}
          </button>
        ))}
      </div>

      <div
        key={open}
        className="card-sketchy p-4 space-y-3"
        style={{ background: s.color + "22", animation: "fadeIn 0.3s" }}
      >
        <h3 className="font-hand text-xl font-bold text-foreground">{s.title}</h3>

        <ConfusionMatrixViz
          tp={s.tp}
          tn={s.tn}
          fp={s.fp}
          fn={s.fn}
          labels={s.labels}
        />

        <div className="grid sm:grid-cols-2 gap-3">
          <div
            className="card-sketchy p-3"
            style={{
              background: s.worse === "FP" ? CORAL + "44" : PEACH + "33",
            }}
          >
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
              False Positive cost
            </p>
            <p className="font-hand text-sm text-foreground mt-1">{s.fpCost}</p>
          </div>
          <div
            className="card-sketchy p-3"
            style={{
              background: s.worse === "FN" ? CORAL + "44" : PEACH + "33",
            }}
          >
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
              False Negative cost
            </p>
            <p className="font-hand text-sm text-foreground mt-1">{s.fnCost}</p>
          </div>
        </div>

        <div className="card-sketchy p-3" style={{ background: PAPER }}>
          <p className="font-hand text-sm font-bold text-foreground">
            Worse mistake here: <span style={{ color: CORAL }}>{s.worse}</span>
          </p>
          <p className="font-hand text-sm text-foreground mt-1">{s.explain}</p>
        </div>
      </div>

      <InfoBox variant="green">
        Smart engineers don't just chase high accuracy - they ask "which mistake
        would hurt my users most?" and tune the model to avoid THOSE.
      </InfoBox>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is a 'False Positive'?",
    options: [
      "Model predicted YES and was right",
      "Model predicted YES but was wrong",
      "Model predicted NO and was right",
      "Model predicted NO but was wrong",
    ],
    correctIndex: 1,
    explanation:
      "False Positive = the model raised an alarm (predicted YES) when it shouldn't have.",
  },
  {
    question: "A cancer detector says 'healthy' to someone who actually HAS cancer. This is a...",
    options: ["True Positive", "False Positive", "True Negative", "False Negative"],
    correctIndex: 3,
    explanation:
      "Predicted NO (no cancer) but the truth was YES (had cancer). That's a False Negative - and a dangerous one.",
  },
  {
    question: "Why is a confusion matrix more useful than just 'accuracy'?",
    options: [
      "It looks cooler",
      "It shows exactly WHERE the model is making mistakes",
      "It's faster",
      "It's required by law",
    ],
    correctIndex: 1,
    explanation:
      "Accuracy is one number. The confusion matrix splits it into 4 - so you can see if mistakes are mostly false alarms or missed cases.",
  },
  {
    question: "For a fire alarm, which mistake is WORSE?",
    options: [
      "False Positive (alarm with no fire)",
      "False Negative (fire with no alarm)",
      "Both equal",
      "Neither matters",
    ],
    correctIndex: 1,
    explanation:
      "Missing a real fire could cost lives. A false alarm is just annoying. The cost of FN >> FP here.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L34_ConfusionMatrixActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "four",
        label: "The Four Outcomes",
        icon: <Grid3X3 className="w-4 h-4" />,
        content: <FourOutcomesTab />,
      },
      {
        id: "build",
        label: "Build the Matrix",
        icon: <Sliders className="w-4 h-4" />,
        content: <BuildMatrixTab />,
      },
      {
        id: "stakes",
        label: "When Mistakes Hurt",
        icon: <AlertCircle className="w-4 h-4" />,
        content: <StakesTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="Confusion Matrix: Where Models Go Wrong"
      level={4}
      lessonNumber={6}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you can describe a model's mistakes in detail. Time to dive into unsupervised learning!"
      story={
        <StorySection
          paragraphs={[
            "Aru built a model that says 'cat' or 'not cat' for photos. It scored 90% accuracy. She was thrilled!",
            "Aru: \"90%! That's amazing, right?\"",
            "Byte: \"Maybe. Let's look closer. Out of 100 photos, your model got 90 right and 10 wrong. But what KIND of wrong?\"",
            "Aru: \"What do you mean?\"",
            "Byte: \"Did it call dogs 'cats' (false alarm)? Or did it miss real cats (missed catch)? Those are very different mistakes - and depending on the job, one might be way worse than the other.\"",
            "Aru: \"How do I see that?\"",
            "Byte: \"With a confusion matrix - a 2×2 grid that shows EVERY type of right and wrong answer your model made.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A confusion matrix is a 2×2 grid that breaks down a model's predictions into four boxes: True Positives, False Positives, True Negatives, and False Negatives. It tells you not just HOW often a model is wrong - but in WHICH way it's wrong, which often matters more."
        />
      }
    />
  );
}
