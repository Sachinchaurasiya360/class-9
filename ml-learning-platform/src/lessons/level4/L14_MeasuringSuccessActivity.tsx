"use client";

import { useState, useMemo, useCallback } from "react";
import { Grid3X3, Scale, BarChart3 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";
import {
  ConfusionMatrixViz,
  LogisticRegressionViz,
  type Point,
} from "@/components/viz/ml-algorithms";

/* ------------------------------------------------------------------ */
/*  Riku (red panda mascot) dialogue helper                            */
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
/*  Tab 1  Confusion Matrix - interactive sliders + presets           */
/* ------------------------------------------------------------------ */

type Preset = {
  id: string;
  label: string;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  blurb: string;
};

const PRESETS: Preset[] = [
  {
    id: "great",
    label: "A good classifier",
    tp: 42,
    tn: 50,
    fp: 3,
    fn: 5,
    blurb:
      "Most predictions land on the mint diagonal. A few slip-ups, but overall very solid.",
  },
  {
    id: "trigger-happy",
    label: "Trigger-happy",
    tp: 48,
    tn: 20,
    fp: 30,
    fn: 2,
    blurb:
      "Catches almost every positive (high recall) but flags tons of negatives too (low precision).",
  },
  {
    id: "cautious",
    label: "Overly cautious",
    tp: 12,
    tn: 55,
    fp: 1,
    fn: 32,
    blurb:
      "Barely predicts positive. The few it does flag are usually right (high precision) - but it misses most real positives (low recall).",
  },
  {
    id: "lazy",
    label: "Lazy baseline",
    tp: 0,
    tn: 95,
    fp: 0,
    fn: 5,
    blurb:
      "Predicts 'not spam' every single time. 95% accurate and completely useless. Welcome to the accuracy trap.",
  },
];

function ConfusionMatrix() {
  const [tp, setTp] = useState(PRESETS[0].tp);
  const [tn, setTn] = useState(PRESETS[0].tn);
  const [fp, setFp] = useState(PRESETS[0].fp);
  const [fn, setFn] = useState(PRESETS[0].fn);
  const [activePreset, setActivePreset] = useState<string>("great");

  const applyPreset = useCallback((p: Preset) => {
    playPop();
    setTp(p.tp);
    setTn(p.tn);
    setFp(p.fp);
    setFn(p.fn);
    setActivePreset(p.id);
  }, []);

  const blurb = useMemo(
    () => PRESETS.find((p) => p.id === activePreset)?.blurb,
    [activePreset],
  );

  // A little slider helper
  function Slider({
    label,
    value,
    setValue,
    color,
  }: {
    label: string;
    value: number;
    setValue: (v: number) => void;
    color: string;
  }) {
    return (
      <div className="space-y-1">
        <div className="flex justify-between font-hand text-xs font-bold">
          <span style={{ color }}>{label}</span>
          <span className="text-foreground">{value}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => {
            playClick();
            setValue(Number(e.target.value));
            setActivePreset("");
          }}
          className="w-full accent-indigo-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <RikuSays>
        A confusion matrix is the therapy session your model needs after
        getting things wrong. Four little boxes that tell you{" "}
        <em>exactly</em> how your classifier messed up - not just that it did.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Drag the sliders (or pick a preset) and watch the metrics update
        </h3>

        {/* Preset buttons */}
        <div className="flex justify-center gap-2 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                activePreset === p.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <Slider
            label="TP"
            value={tp}
            setValue={setTp}
            color="var(--accent-mint)"
          />
          <Slider
            label="FN"
            value={fn}
            setValue={setFn}
            color="var(--accent-coral)"
          />
          <Slider
            label="FP"
            value={fp}
            setValue={setFp}
            color="var(--accent-coral)"
          />
          <Slider
            label="TN"
            value={tn}
            setValue={setTn}
            color="var(--accent-mint)"
          />
        </div>

        {/* The library matrix */}
        <ConfusionMatrixViz
          tp={tp}
          tn={tn}
          fp={fp}
          fn={fn}
          labels={["Spam", "Not Spam"]}
        />

        {blurb && (
          <p className="font-hand text-xs text-center text-slate-600 italic max-w-md mx-auto">
            {blurb}
          </p>
        )}
      </div>

      <RikuSays>
        Fun fact: the four boxes have nothing to hide. If precision is great
        but recall is bad, the matrix will literally show you a fat FN
        column. No more &ldquo;my accuracy is 95% so I&apos;m done&rdquo;
        nonsense.
      </RikuSays>

      <InfoBox variant="blue" title="Confusion Matrix Explained">
        <strong>True Positive (TP)</strong>: Correctly identified spam.{" "}
        <strong>True Negative (TN)</strong>: Correctly identified non-spam.{" "}
        <strong>False Positive (FP)</strong>: Called it spam but it wasn&apos;t.{" "}
        <strong>False Negative (FN)</strong>: Missed the spam.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Accuracy Isn't Everything - live classifier + matrix       */
/* ------------------------------------------------------------------ */

// Build an imbalanced dataset: 95 negatives, 5 positives, all in the
// library's [0, 100] × [0, 100] coordinate space.
function buildImbalancedData(): Point[] {
  const pts: Point[] = [];
  // 95 "healthy" negatives spread broadly over the left/lower region.
  let s = 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < 95; i++) {
    pts.push({
      x: 10 + rand() * 55,
      y: 10 + rand() * 55,
      label: 0,
    });
  }
  // 5 "sick" positives clustered in the upper-right.
  for (let i = 0; i < 5; i++) {
    pts.push({
      x: 65 + rand() * 25,
      y: 65 + rand() * 25,
      label: 1,
    });
  }
  return pts;
}

function AccuracyIsntEverything() {
  const data = useMemo(() => buildImbalancedData(), []);

  // "Always predict healthy" baseline - this is the accuracy trap.
  const totalPositive = data.filter((p) => p.label === 1).length;
  const totalNegative = data.length - totalPositive;
  const lazyAccuracy = ((totalNegative / data.length) * 100).toFixed(0);

  return (
    <div className="space-y-5">
      <RikuSays>
        Accuracy alone lies. If 99% of emails aren&apos;t spam, &ldquo;always
        say not spam&rdquo; is 99% accurate and completely useless. Let&apos;s
        prove it with a real (imbalanced) dataset.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          The &ldquo;lazy&rdquo; model vs a real classifier
        </h3>

        {/* Lazy model callout */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md mx-auto">
          <p className="text-xs text-red-700">
            <strong>Lazy Model:</strong> Always predicts &ldquo;Healthy&rdquo;
            - gets <strong>{lazyAccuracy}% accuracy</strong>! But it misses
            ALL {totalPositive} sick patients.
          </p>
        </div>

        <ConfusionMatrixViz
          tp={0}
          tn={totalNegative}
          fp={0}
          fn={totalPositive}
          labels={["Sick", "Healthy"]}
        />

        <RikuSays>
          See the empty TP box? 95% accuracy, 0% recall. The lazy model
          never catches a single sick patient. In medicine, that&apos;s a
          disaster.
        </RikuSays>

        <div className="border-t-2 border-dashed border-slate-300 pt-4">
          <p className="font-hand text-xs text-center text-slate-600 mb-3">
            Now try a real classifier - drag the weight sliders below to draw
            your own decision boundary on the same imbalanced data:
          </p>
          <LogisticRegressionViz data={data} />
        </div>
      </div>

      <RikuSays>
        Watch what happens when the boundary moves: one nudge and you catch
        all the sick folks (high recall) but start false-alarming healthy
        ones (low precision). That tension is why we need more than
        accuracy.
      </RikuSays>

      <InfoBox variant="amber" title="The Accuracy Trap">
        With imbalanced data, a model can get high accuracy by just predicting
        the majority class. <strong>Precision</strong> tells us how many of
        our positive predictions were correct. <strong>Recall</strong> tells
        us how many actual positives we caught. For medical diagnosis, recall
        is critical - missing a sick patient is dangerous!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Compare Models - presets + live confusion matrix           */
/* ------------------------------------------------------------------ */

interface ModelPreset {
  name: string;
  tp: number;
  tn: number;
  fp: number;
  fn: number;
}

const MODELS: ModelPreset[] = [
  // Model A - high precision, lower recall (good spam filter)
  { name: "Model A", tp: 65, tn: 185, fp: 9, fn: 35 },
  // Model B - high recall, lower precision (good medical screen)
  { name: "Model B", tp: 95, tn: 155, fp: 37, fn: 5 },
  // Model C - balanced (best F1)
  { name: "Model C", tp: 87, tn: 180, fp: 10, fn: 13 },
];

interface Scenario {
  title: string;
  description: string;
  bestModel: number;
  reason: string;
}

const SCENARIOS: Scenario[] = [
  {
    title: "Medical Diagnosis",
    description:
      "Detecting whether a patient has a disease. Missing a sick patient could be life-threatening.",
    bestModel: 1,
    reason:
      "Model B has the highest recall - it catches almost all sick patients, which is critical in healthcare.",
  },
  {
    title: "Spam Filter",
    description:
      "Filtering spam emails. Marking a real email as spam is very annoying.",
    bestModel: 0,
    reason:
      "Model A has the highest precision - it rarely marks real emails as spam.",
  },
  {
    title: "Movie Recommendation",
    description:
      "Suggesting movies a user might enjoy. We want a good overall balance.",
    bestModel: 2,
    reason:
      "Model C has the best F1 score - the best balance of precision and recall for general recommendations.",
  },
];

function CompareModels() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [userPick, setUserPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const scenario = SCENARIOS[selectedScenario];
  const activeModel = MODELS[userPick ?? 0];

  const handlePick = useCallback((modelIdx: number) => {
    playPop();
    setUserPick(modelIdx);
    setRevealed(false);
  }, []);

  const handleReveal = useCallback(() => {
    playClick();
    if (userPick === scenario.bestModel) playSuccess();
    else playError();
    setRevealed(true);
  }, [userPick, scenario.bestModel]);

  const switchScenario = useCallback((idx: number) => {
    playClick();
    setSelectedScenario(idx);
    setUserPick(null);
    setRevealed(false);
  }, []);

  return (
    <div className="space-y-5">
      <RikuSays>
        Three models, three different personalities. One&apos;s cautious,
        one&apos;s trigger-happy, one&apos;s balanced. Pick the right
        teammate for the job - the matrix will show you why.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Compare 3 models - which is best for each scenario?
        </h3>

        {/* Scenario selector */}
        <div className="flex justify-center gap-2 flex-wrap">
          {SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => switchScenario(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedScenario === i
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Scenario description */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-md mx-auto text-center">
          <p className="text-xs font-semibold text-slate-700">
            {scenario.title}
          </p>
          <p className="text-xs text-slate-500 mt-1">{scenario.description}</p>
        </div>

        {/* Model selection */}
        <div className="flex justify-center gap-3">
          {MODELS.map((model, i) => (
            <button
              key={i}
              onClick={() => handlePick(i)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                userPick === i
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              {model.name}
            </button>
          ))}
        </div>

        {/* Live confusion matrix for the picked model */}
        {userPick !== null && (
          <ConfusionMatrixViz
            tp={activeModel.tp}
            tn={activeModel.tn}
            fp={activeModel.fp}
            fn={activeModel.fn}
          />
        )}

        {userPick !== null && !revealed && (
          <div className="flex justify-center">
            <button
              onClick={handleReveal}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors"
            >
              Check Answer
            </button>
          </div>
        )}

        {revealed && (
          <div
            className={`text-center p-3 rounded-lg text-xs ${
              userPick === scenario.bestModel
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            <p className="font-semibold">
              {userPick === scenario.bestModel
                ? "Correct!"
                : `The best choice is ${MODELS[scenario.bestModel].name}.`}
            </p>
            <p className="mt-1">{scenario.reason}</p>
          </div>
        )}
      </div>

      <RikuSays>
        No single metric wins every game. Medical? Recall. Spam? Precision.
        Recommendations? F1. The matrix lets you see all four at once so you
        can pick with your eyes open.
      </RikuSays>

      <InfoBox variant="indigo" title="Which Metric Matters?">
        There is no single &ldquo;best&rdquo; metric - it depends on the
        problem! For <strong>medical diagnosis</strong>, recall matters most
        (catch all sick patients). For <strong>spam filtering</strong>,
        precision matters (don&apos;t block real emails).{" "}
        <strong>F1 score</strong> balances both.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a True Positive mean in a spam detector?",
    options: [
      "A real email marked as not spam",
      "A spam email correctly identified as spam",
      "A real email wrongly marked as spam",
      "A spam email missed by the filter",
    ],
    correctIndex: 1,
    explanation:
      "A True Positive means the model correctly predicted the positive class  in this case, correctly catching a spam email.",
  },
  {
    question: "Why can high accuracy be misleading with imbalanced data?",
    options: [
      "Because accuracy always gives wrong numbers",
      "Because a model can get high accuracy by just predicting the majority class",
      "Because imbalanced data is always wrong",
      "Because accuracy only works with 2 classes",
    ],
    correctIndex: 1,
    explanation:
      "With 95% healthy and 5% sick patients, predicting everyone as healthy gives 95% accuracy while missing all sick patients!",
  },
  {
    question: "When is recall the most important metric?",
    options: [
      "When predicting movie ratings",
      "When false positives are very costly",
      "When missing a positive case is dangerous (like medical diagnosis)",
      "When you have perfectly balanced data",
    ],
    correctIndex: 2,
    explanation:
      "Recall measures how many actual positives were caught. In medical diagnosis, missing a sick patient (false negative) could be life-threatening, so high recall is critical.",
  },
  {
    question: "What does the F1 score measure?",
    options: [
      "Only accuracy",
      "Only precision",
      "The harmonic mean (balance) of precision and recall",
      "The speed of the model",
    ],
    correctIndex: 2,
    explanation:
      "The F1 score is the harmonic mean of precision and recall, giving a single number that balances both metrics. It's useful when you need both precision and recall to be good.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L14_MeasuringSuccessActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "confusion",
        label: "Confusion Matrix",
        icon: <Grid3X3 className="w-4 h-4" />,
        content: <ConfusionMatrix />,
      },
      {
        id: "accuracy",
        label: "Accuracy Isn't Everything",
        icon: <Scale className="w-4 h-4" />,
        content: <AccuracyIsntEverything />,
      },
      {
        id: "compare",
        label: "Compare Models",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <CompareModels />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Measuring Success"
      level={4}
      lessonNumber={4}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover unsupervised learning  when data has no labels!"
      story={
        <StorySection
          paragraphs={[
            "Aru was beaming after her math test. She got 80%!",
            "Byte: That's great! But let me ask you something. What if 80% of the questions had the answer 'True', and you just wrote 'True' for every single one?",
            "Aru: I'd still get 80%... but I wouldn't really know math at all!",
            "Byte: Exactly! That's why accuracy alone can be misleading. In machine learning, we need better ways to measure success. We need to know  did you actually catch the right answers, or just get lucky?",
            "Aru: So how do we measure success properly?",
            "Byte: With tools like the confusion matrix, precision, recall, and F1 score. Let me show you!",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Accuracy measures how often the model is correct overall, but it can be misleading with imbalanced data. Precision measures how many positive predictions were actually correct. Recall measures how many actual positives we caught. The F1 score balances both. Which metric matters most depends on the problem!"
        />
      }
    />
  );
}
