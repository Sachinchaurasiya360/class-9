"use client";

import { useState, useMemo, useCallback } from "react";
import { Grid3X3, Scale, BarChart3, RotateCcw } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess, playError } from "../../utils/sounds";

const INK = "#2b2a35";

/* Animated metric meter */
function MetricMeter({ label, value, color, glow }: { label: string; value: number; color: string; glow: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="card-sketchy p-3" style={{ background: "#fff" }}>
      <div className="flex justify-between font-hand text-xs font-bold text-foreground mb-1">
        <span>{label}</span>
        <span style={{ color }}>{v.toFixed(0)}%</span>
      </div>
      <svg viewBox="0 0 200 18" className="w-full">
        <defs>
          <linearGradient id={`mm-${label}`} x1="0" x2="1">
            <stop offset="0%" stopColor={glow} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <rect x={1} y={1} width={198} height={16} rx={8} fill="#f3efe6" stroke={INK} strokeWidth={2} />
        <rect x={3} y={3} width={(196 * v) / 100} height={12} rx={6}
          fill={`url(#mm-${label})`}
          className="pulse-glow"
          style={{ color, transition: "width 0.5s ease" }} />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */

/* mulberry32 PRNG removed  not needed in this lesson */

/* ------------------------------------------------------------------ */
/*  Tab 1  Confusion Matrix                                          */
/* ------------------------------------------------------------------ */

interface EmailItem {
  id: number;
  text: string;
  isSpam: boolean;
}

function ConfusionMatrix() {
  const emails = useMemo<EmailItem[]>(() => [
    { id: 0, text: "You won $1,000,000!", isSpam: true },
    { id: 1, text: "Meeting at 3pm today", isSpam: false },
    { id: 2, text: "Buy cheap meds now!!!", isSpam: true },
    { id: 3, text: "Project update attached", isSpam: false },
    { id: 4, text: "Claim your free prize", isSpam: true },
    { id: 5, text: "Dinner plans tonight?", isSpam: false },
    { id: 6, text: "Limited time offer!!!", isSpam: true },
    { id: 7, text: "Please review the PR", isSpam: false },
    { id: 8, text: "Congratulations winner!", isSpam: true },
    { id: 9, text: "Team standup notes", isSpam: false },
    { id: 10, text: "ACT NOW free gift", isSpam: true },
    { id: 11, text: "Lunch tomorrow?", isSpam: false },
  ], []);

  const [predictions, setPredictions] = useState<Record<number, boolean>>({});
  const currentIdx = Object.keys(predictions).length;
  const currentEmail = currentIdx < emails.length ? emails[currentIdx] : null;

  const handlePredict = useCallback((predictedSpam: boolean) => {
    if (!currentEmail) return;
    const isCorrect = predictedSpam === currentEmail.isSpam;
    if (isCorrect) playSuccess(); else playError();
    setPredictions((prev) => ({ ...prev, [currentEmail.id]: predictedSpam }));
  }, [currentEmail]);

  const reset = useCallback(() => {
    playClick();
    setPredictions({});
  }, []);

  // Compute confusion matrix values
  const { tp, fp, tn, fn } = useMemo(() => {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    for (const email of emails) {
      if (predictions[email.id] === undefined) continue;
      const pred = predictions[email.id];
      if (pred && email.isSpam) tp++;
      else if (pred && !email.isSpam) fp++;
      else if (!pred && !email.isSpam) tn++;
      else if (!pred && email.isSpam) fn++;
    }
    return { tp, fp, tn, fn };
  }, [emails, predictions]);

  const total = tp + fp + tn + fn;
  const accuracy = total > 0 ? ((tp + tn) / total * 100).toFixed(0) : "";
  const precision = (tp + fp) > 0 ? (tp / (tp + fp) * 100).toFixed(0) : "";
  const recall = (tp + fn) > 0 ? (tp / (tp + fn) * 100).toFixed(0) : "";

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Classify each email as Spam or Not Spam  watch the confusion matrix build!</h3>

        {/* Current email */}
        {currentEmail ? (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-md mx-auto text-center space-y-3">
            <p className="text-xs text-slate-500">Email {currentIdx + 1} of {emails.length}</p>
            <p className="text-sm font-medium text-slate-800">"{currentEmail.text}"</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => handlePredict(true)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors">
                Spam
              </button>
              <button onClick={() => handlePredict(false)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors">
                Not Spam
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-sm font-semibold text-green-700">All emails classified!</p>
            <button onClick={reset} className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Confusion matrix SVG */}
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 360 300" className="w-full max-w-[400px]">
            {/* Title */}
            <text x={180} y={20} textAnchor="middle" className="text-[12px] fill-slate-700 font-bold">Confusion Matrix</text>

            {/* Column headers */}
            <text x={230} y={55} textAnchor="middle" className="text-[10px] fill-slate-600 font-semibold">Predicted</text>
            <text x={185} y={75} textAnchor="middle" className="text-[10px] fill-red-600 font-medium">Spam</text>
            <text x={285} y={75} textAnchor="middle" className="text-[10px] fill-green-600 font-medium">Not Spam</text>

            {/* Row headers */}
            <text x={50} y={115} textAnchor="middle" className="text-[10px] fill-slate-600 font-semibold" transform="rotate(-90, 50, 115)">Actual</text>
            <text x={105} y={120} textAnchor="middle" className="text-[10px] fill-red-600 font-medium">Spam</text>
            <text x={105} y={200} textAnchor="middle" className="text-[10px] fill-green-600 font-medium">Not Spam</text>

            {/* TP cell */}
            <rect x={135} y={85} width={100} height={60} rx={6} fill="#dcfce7" stroke="#22c55e" strokeWidth={1.5} />
            <text x={185} y={112} textAnchor="middle" className="text-[20px] fill-green-700 font-bold">{tp}</text>
            <text x={185} y={132} textAnchor="middle" className="text-[8px] fill-green-600">True Positive</text>

            {/* FN cell */}
            <rect x={235} y={85} width={100} height={60} rx={6} fill="#fee2e2" stroke="#ef4444" strokeWidth={1.5} />
            <text x={285} y={112} textAnchor="middle" className="text-[20px] fill-red-700 font-bold">{fn}</text>
            <text x={285} y={132} textAnchor="middle" className="text-[8px] fill-red-600">False Negative</text>

            {/* FP cell */}
            <rect x={135} y={165} width={100} height={60} rx={6} fill="#fef9c3" stroke="#eab308" strokeWidth={1.5} />
            <text x={185} y={192} textAnchor="middle" className="text-[20px] fill-amber-700 font-bold">{fp}</text>
            <text x={185} y={212} textAnchor="middle" className="text-[8px] fill-amber-600">False Positive</text>

            {/* TN cell */}
            <rect x={235} y={165} width={100} height={60} rx={6} fill="#dcfce7" stroke="#22c55e" strokeWidth={1.5} />
            <text x={285} y={192} textAnchor="middle" className="text-[20px] fill-green-700 font-bold">{tn}</text>
            <text x={285} y={212} textAnchor="middle" className="text-[8px] fill-green-600">True Negative</text>

            {/* Metrics */}
            <text x={60} y={260} className="text-[10px] fill-slate-700 font-medium">Accuracy: {accuracy}%</text>
            <text x={170} y={260} className="text-[10px] fill-slate-700 font-medium">Precision: {precision}%</text>
            <text x={280} y={260} className="text-[10px] fill-slate-700 font-medium">Recall: {recall}%</text>
          </svg>
        </div>

        {/* Animated metric meters */}
        {total > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricMeter label="Accuracy" value={Number(accuracy) || 0} color="#b18cf2" glow="#c9adf7" />
            <MetricMeter label="Precision" value={Number(precision) || 0} color="#6bb6ff" glow="#94caff" />
            <MetricMeter label="Recall" value={Number(recall) || 0} color="#4ecdc4" glow="#7ee0d8" />
          </div>
        )}

        {/* Progress */}
        <svg viewBox="0 0 400 14" className="w-full">
          <rect x={1} y={1} width={398} height={12} rx={6} fill="#f3efe6" stroke={INK} strokeWidth={2} />
          <rect x={3} y={3} width={Math.max(0, (394 * currentIdx) / emails.length)} height={8} rx={4}
            fill="#ffd93d" className="pulse-glow" style={{ color: "#ffd93d", transition: "width 0.4s" }} />
        </svg>
      </div>

      <InfoBox variant="blue" title="Confusion Matrix Explained">
        <strong>True Positive (TP)</strong>: Correctly identified spam. <strong>True Negative (TN)</strong>: Correctly identified non-spam. <strong>False Positive (FP)</strong>: Called it spam but it wasn't. <strong>False Negative (FN)</strong>: Missed the spam.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Accuracy Isn't Everything                                  */
/* ------------------------------------------------------------------ */

function AccuracyIsntEverything() {
  const [threshold, setThreshold] = useState(50);

  // Imbalanced dataset: 95 healthy, 5 sick
  const totalHealthy = 95;
  const totalSick = 5;
  const total = totalHealthy + totalSick;

  // As threshold increases, the model is more "cautious" about predicting sick
  // Low threshold = predicts many as sick (high recall, low precision)
  // High threshold = predicts few as sick (low recall, higher precision)
  const predictedSick = useMemo(() => {
    if (threshold <= 20) return 15; // predicts many sick (includes false positives)
    if (threshold <= 40) return 8;
    if (threshold <= 50) return 5;
    if (threshold <= 60) return 3;
    if (threshold <= 80) return 1;
    return 0; // predicts nobody sick
  }, [threshold]);

  const truePositives = useMemo(() => {
    if (threshold <= 20) return 5;
    if (threshold <= 40) return 4;
    if (threshold <= 50) return 3;
    if (threshold <= 60) return 2;
    if (threshold <= 80) return 1;
    return 0;
  }, [threshold]);

  const fp = predictedSick - truePositives;
  const fn = totalSick - truePositives;
  const tn = totalHealthy - fp;
  const tp = truePositives;

  const accuracy = ((tp + tn) / total * 100).toFixed(1);
  const precisionVal = (tp + fp) > 0 ? (tp / (tp + fp) * 100).toFixed(0) : "0";
  const recallVal = (tp + fn) > 0 ? (tp / (tp + fn) * 100).toFixed(0) : "0";

  // Lazy model always predicts healthy
  const lazyAccuracy = ((totalHealthy) / total * 100).toFixed(0);

  return (
    <div className="space-y-5">
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">A "lazy" model shows why accuracy alone can be misleading</h3>

        {/* Lazy model callout */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-md mx-auto">
          <p className="text-xs text-red-700">
            <strong>Lazy Model:</strong> Always predicts "Healthy"  gets <strong>{lazyAccuracy}% accuracy</strong>!
            But it misses ALL {totalSick} sick patients.
          </p>
        </div>

        {/* Threshold slider */}
        <div className="max-w-md mx-auto space-y-1">
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-600 w-20">Threshold:</span>
            <input type="range" min={10} max={90} step={10} value={threshold}
              onChange={(e) => { playClick(); setThreshold(Number(e.target.value)); }}
              className="flex-1 accent-indigo-500" />
            <span className="text-sm font-bold text-indigo-700 w-8">{threshold}</span>
          </div>
          <p className="text-[10px] text-slate-400 text-center">Low = catch more sick (but more false alarms) | High = fewer false alarms (but miss sick people)</p>
        </div>

        {/* Population visualization */}
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 500 160" className="w-full max-w-[520px]">
            {/* Background */}
            <rect x={10} y={10} width={480} height={140} rx={8} fill="#f8fafc" stroke="#e2e8f0" strokeWidth={1} />

            {/* People dots  100 total */}
            {Array.from({ length: total }, (_, i) => {
              const row = Math.floor(i / 20);
              const col = i % 20;
              const isSick = i >= totalHealthy;
              // Simplified: show sick people highlighted
              const wasCaught = isSick && (i - totalHealthy) < tp;
              const wasFalsePositive = !isSick && i < fp;

              let fill = "#94a3b8"; // default healthy gray
              if (isSick && wasCaught) fill = "#22c55e"; // caught sick = green
              else if (isSick && !wasCaught) fill = "#ef4444"; // missed sick = red
              else if (wasFalsePositive) fill = "#f59e0b"; // false alarm = amber
              else fill = "#93c5fd"; // healthy = light blue

              return (
                <circle
                  key={i}
                  cx={30 + col * 23}
                  cy={30 + row * 24}
                  r={6}
                  fill={fill}
                  stroke="#334155"
                  strokeWidth={0.5}
                  opacity={0.8}
                />
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 flex-wrap text-[10px] text-slate-600">
          <span><span className="inline-block w-3 h-3 rounded-full bg-blue-300 mr-1 align-middle" />Healthy (correct)</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1 align-middle" />Sick (caught)</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1 align-middle" />Sick (missed)</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-1 align-middle" />False alarm</span>
        </div>

        {/* Animated metric meters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-md mx-auto">
          <MetricMeter label="Accuracy" value={Number(accuracy)} color="#b18cf2" glow="#c9adf7" />
          <MetricMeter label="Precision" value={Number(precisionVal)} color="#6bb6ff" glow="#94caff" />
          <MetricMeter label="Recall" value={Number(recallVal)} color="#4ecdc4" glow="#7ee0d8" />
        </div>
      </div>

      <InfoBox variant="amber" title="The Accuracy Trap">
        With imbalanced data, a model can get high accuracy by just predicting the majority class. <strong>Precision</strong> tells us how many of our positive predictions were correct. <strong>Recall</strong> tells us how many actual positives we caught. For medical diagnosis, recall is critical  missing a sick patient is dangerous!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Compare Models                                             */
/* ------------------------------------------------------------------ */

interface ModelMetrics {
  name: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
}

const MODELS: ModelMetrics[] = [
  { name: "Model A", accuracy: 92, precision: 88, recall: 65, f1: 75 },
  { name: "Model B", accuracy: 85, precision: 72, recall: 95, f1: 82 },
  { name: "Model C", accuracy: 89, precision: 90, recall: 87, f1: 88 },
];

interface Scenario {
  title: string;
  description: string;
  bestModel: number; // index
  reason: string;
}

const SCENARIOS: Scenario[] = [
  {
    title: "Medical Diagnosis",
    description: "Detecting whether a patient has a disease. Missing a sick patient could be life-threatening.",
    bestModel: 1,
    reason: "Model B has the highest recall (95%)  it catches almost all sick patients, which is critical in healthcare.",
  },
  {
    title: "Spam Filter",
    description: "Filtering spam emails. Marking a real email as spam is very annoying.",
    bestModel: 0,
    reason: "Model A has the highest precision (88%) with high accuracy  it rarely marks real emails as spam.",
  },
  {
    title: "Movie Recommendation",
    description: "Suggesting movies a user might enjoy. We want a good overall balance.",
    bestModel: 2,
    reason: "Model C has the best F1 score (88%)  the best balance of precision and recall for general recommendations.",
  },
];

function CompareModels() {
  const [selectedScenario, setSelectedScenario] = useState(0);
  const [userPick, setUserPick] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const scenario = SCENARIOS[selectedScenario];
  const metrics: Array<{ key: string; label: string; color: string }> = [
    { key: "accuracy", label: "Accuracy", color: "#6366f1" },
    { key: "precision", label: "Precision", color: "#3b82f6" },
    { key: "recall", label: "Recall", color: "#22c55e" },
    { key: "f1", label: "F1 Score", color: "#f59e0b" },
  ];

  const handlePick = useCallback((modelIdx: number) => {
    playPop();
    setUserPick(modelIdx);
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
      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">Compare 3 models  which is best for each scenario?</h3>

        {/* Bar chart */}
        <div className="flex justify-center overflow-x-auto">
          <svg viewBox="0 0 500 240" className="w-full max-w-[540px]">
            {/* Y axis labels */}
            {[0, 25, 50, 75, 100].map((v) => {
              const y = 200 - (v / 100) * 180;
              return (
                <g key={v}>
                  <text x={30} y={y + 4} textAnchor="end" className="text-[9px] fill-slate-500">{v}</text>
                  <line x1={35} y1={y} x2={480} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
                </g>
              );
            })}

            {/* Bars for each model */}
            {MODELS.map((model, mi) => {
              const groupX = 60 + mi * 150;
              return (
                <g key={mi}>
                  <text x={groupX + 50} y={225} textAnchor="middle" className="text-[10px] fill-slate-700 font-semibold">
                    {model.name}
                  </text>
                  {metrics.map((m, bi) => {
                    const val = model[m.key as keyof ModelMetrics] as number;
                    const barH = (val / 100) * 180;
                    const barX = groupX + bi * 25;
                    return (
                      <g key={m.key}>
                        <rect x={barX} y={200 - barH} width={20} height={barH}
                          fill={m.color} rx={2} opacity={0.85}
                          style={{ transition: "all 0.3s" }} />
                        <text x={barX + 10} y={195 - barH} textAnchor="middle"
                          className="text-[8px] fill-slate-600 font-medium">{val}</text>
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Axis */}
            <line x1={35} y1={200} x2={480} y2={200} stroke="#334155" strokeWidth={1.5} />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-3 text-[10px] text-slate-600 flex-wrap">
          {metrics.map((m) => (
            <span key={m.key}>
              <span className="inline-block w-3 h-3 rounded mr-1 align-middle" style={{ backgroundColor: m.color }} />
              {m.label}
            </span>
          ))}
        </div>

        {/* Scenario selector */}
        <div className="flex justify-center gap-2 flex-wrap">
          {SCENARIOS.map((s, i) => (
            <button key={i} onClick={() => switchScenario(i)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                selectedScenario === i
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}>
              {s.title}
            </button>
          ))}
        </div>

        {/* Scenario description */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-md mx-auto text-center">
          <p className="text-xs font-semibold text-slate-700">{scenario.title}</p>
          <p className="text-xs text-slate-500 mt-1">{scenario.description}</p>
        </div>

        {/* Model selection */}
        <div className="flex justify-center gap-3">
          {MODELS.map((model, i) => (
            <button key={i} onClick={() => handlePick(i)}
              className={`px-4 py-2 rounded-lg text-xs font-medium border-2 transition-all ${
                userPick === i
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}>
              {model.name}
            </button>
          ))}
        </div>

        {userPick !== null && !revealed && (
          <div className="flex justify-center">
            <button onClick={handleReveal}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors">
              Check Answer
            </button>
          </div>
        )}

        {revealed && (
          <div className={`text-center p-3 rounded-lg text-xs ${
            userPick === scenario.bestModel ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
          }`}>
            <p className="font-semibold">
              {userPick === scenario.bestModel ? "Correct!" : `The best choice is ${MODELS[scenario.bestModel].name}.`}
            </p>
            <p className="mt-1">{scenario.reason}</p>
          </div>
        )}
      </div>

      <InfoBox variant="indigo" title="Which Metric Matters?">
        There is no single "best" metric  it depends on the problem! For <strong>medical diagnosis</strong>, recall matters most (catch all sick patients). For <strong>spam filtering</strong>, precision matters (don't block real emails). <strong>F1 score</strong> balances both.
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
    explanation: "A True Positive means the model correctly predicted the positive class  in this case, correctly catching a spam email.",
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
    explanation: "With 95% healthy and 5% sick patients, predicting everyone as healthy gives 95% accuracy while missing all sick patients!",
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
    explanation: "Recall measures how many actual positives were caught. In medical diagnosis, missing a sick patient (false negative) could be life-threatening, so high recall is critical.",
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
    explanation: "The F1 score is the harmonic mean of precision and recall, giving a single number that balances both metrics. It's useful when you need both precision and recall to be good.",
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
          conceptSummary="Accuracy measures how often the model is correct overall, but it can be misleading with imbalanced data. Precision measures how many positive predictions were actually correct. Recall measures how many actual positives were caught. The F1 score balances both. Which metric matters most depends on the problem!"
        />
      }
    />
  );
}
