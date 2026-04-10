"use client";

import { useState, useMemo } from "react";
import { Grid3X3, Sliders, AlertCircle } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – The Four Outcomes (visual)                                 */
/* ------------------------------------------------------------------ */

function FourOutcomesTab() {
  const [hovered, setHovered] = useState<string | null>(null);

  const cells = [
    {
      key: "tp",
      label: "True Positive",
      sub: "Predicted YES, was YES",
      example: "Model said it's a cat 🐱 — and it really IS a cat. ✓",
      color: MINT,
      emoji: "✅",
    },
    {
      key: "fp",
      label: "False Positive",
      sub: "Predicted YES, was NO",
      example: "Model said it's a cat 🐱 — but it's actually a dog 🐶. False alarm!",
      color: PEACH,
      emoji: "⚠️",
    },
    {
      key: "fn",
      label: "False Negative",
      sub: "Predicted NO, was YES",
      example: "Model said NOT a cat — but it really IS a cat. Missed it!",
      color: CORAL,
      emoji: "❌",
    },
    {
      key: "tn",
      label: "True Negative",
      sub: "Predicted NO, was NO",
      example: "Model said NOT a cat — and it's a dog 🐶. Correct rejection!",
      color: SKY,
      emoji: "✅",
    },
  ];

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        Every prediction lands in ONE of four boxes. Hover or tap each.
      </p>

      <div className="card-sketchy notebook-grid p-4" style={{ background: PAPER }}>
        <svg viewBox="0 0 460 320" className="w-full max-w-[520px] mx-auto">
          <defs>
            <radialGradient id="cm-tp" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#7ee0d8" />
              <stop offset="100%" stopColor={MINT} />
            </radialGradient>
            <radialGradient id="cm-tn" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#94caff" />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
            <radialGradient id="cm-fp" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ffd0b3" />
              <stop offset="100%" stopColor={PEACH} />
            </radialGradient>
            <radialGradient id="cm-fn" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#ff8a8a" />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
          </defs>

          {/* Column headers */}
          <text x={170} y={30} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">Actual: YES</text>
          <text x={340} y={30} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">Actual: NO</text>

          {/* Row headers */}
          <text x={50} y={110} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">Pred: YES</text>
          <text x={50} y={230} textAnchor="middle" fill={INK} fontFamily="Kalam" className="text-[12px] font-bold">Pred: NO</text>

          {(() => {
            const cellMeta = [
              { c: cells[0], x: 100, y: 50, gradId: "cm-tp", glowColor: MINT, kind: "good" },  // TP
              { c: cells[1], x: 270, y: 50, gradId: "cm-fp", glowColor: PEACH, kind: "bad" },  // FP
              { c: cells[2], x: 100, y: 170, gradId: "cm-fn", glowColor: CORAL, kind: "bad" }, // FN
              { c: cells[3], x: 270, y: 170, gradId: "cm-tn", glowColor: SKY, kind: "good" },  // TN
            ];
            return cellMeta.map((m) => {
              const isHover = hovered === m.c.key;
              return (
                <g key={m.c.key}
                  onMouseEnter={() => setHovered(m.c.key)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setHovered(m.c.key)}
                  style={{ cursor: "pointer" }}>
                  {m.kind === "bad" && (
                    <circle cx={m.x + 70} cy={m.y + 50} r={28}
                      fill="none" stroke={m.glowColor} strokeWidth={3}
                      className="fire-ring" />
                  )}
                  <rect x={m.x} y={m.y} width={140} height={100} rx={16}
                    fill={`url(#${m.gradId})`} stroke={INK}
                    strokeWidth={isHover ? 4 : 2.5}
                    className={m.kind === "good" ? "pulse-glow" : ""}
                    style={m.kind === "good" ? { color: m.glowColor } : undefined} />
                  <text x={m.x + 70} y={m.y + 50} textAnchor="middle"
                    fontFamily="Kalam" className="text-[24px] font-bold" fill="#fff">
                    {m.c.emoji}
                  </text>
                  <text x={m.x + 70} y={m.y + 78} textAnchor="middle"
                    fontFamily="Kalam" className="text-[12px] font-bold" fill="#fff">
                    {m.c.label}
                  </text>
                </g>
              );
            });
          })()}
        </svg>
      </div>

      {/* Detail card */}
      <div
        className="card-sketchy p-4"
        style={{
          background: hovered
            ? cells.find((c) => c.key === hovered)!.color + "22"
            : "#fff8e7",
          minHeight: 100,
        }}
      >
        {hovered ? (
          (() => {
            const c = cells.find((x) => x.key === hovered)!;
            return (
              <div className="space-y-1">
                <p className="font-hand text-base font-bold text-foreground">
                  {c.label} {c.emoji}
                </p>
                <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
                  {c.sub}
                </p>
                <p className="font-hand text-sm text-foreground">{c.example}</p>
              </div>
            );
          })()
        ) : (
          <p className="font-hand text-sm text-muted-foreground italic text-center">
            Hover over any box to see what it means.
          </p>
        )}
      </div>

      <InfoBox variant="blue">
        This 2×2 grid is called a <b>confusion matrix</b> — because it shows you
        exactly where your model gets confused.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Build your own confusion matrix                            */
/* ------------------------------------------------------------------ */

const ANIMALS: { id: number; name: string; emoji: string; isCat: boolean }[] = [
  { id: 1, name: "Whiskers", emoji: "🐱", isCat: true },
  { id: 2, name: "Rex", emoji: "🐶", isCat: false },
  { id: 3, name: "Mittens", emoji: "🐱", isCat: true },
  { id: 4, name: "Buddy", emoji: "🐶", isCat: false },
  { id: 5, name: "Tiger", emoji: "🐱", isCat: true },
  { id: 6, name: "Max", emoji: "🐶", isCat: false },
  { id: 7, name: "Luna", emoji: "🐱", isCat: true },
  { id: 8, name: "Charlie", emoji: "🐶", isCat: false },
  { id: 9, name: "Shadow", emoji: "🐱", isCat: true },
  { id: 10, name: "Bella", emoji: "🐶", isCat: false },
];

// Pre-baked "predictions" so we can demonstrate
const PREDICTIONS = [true, false, true, false, false, true, true, false, true, false];

function BuildMatrixTab() {
  const [revealed, setRevealed] = useState<number[]>([]);

  const tp = ANIMALS.filter((a, i) => a.isCat && PREDICTIONS[i]).length;
  const tn = ANIMALS.filter((a, i) => !a.isCat && !PREDICTIONS[i]).length;

  function reveal(id: number) {
    if (revealed.includes(id)) return;
    setRevealed([...revealed, id]);
  }

  function revealAll() {
    setRevealed(ANIMALS.map((a) => a.id));
  }

  function reset() {
    setRevealed([]);
  }

  const total = ANIMALS.length;
  const correct = tp + tn;
  const accuracy = ((correct / total) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        A model tried to spot cats 🐱. Click each animal to see what happened!
      </p>

      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <div className="grid grid-cols-5 gap-2">
          {ANIMALS.map((a, i) => {
            const isRevealed = revealed.includes(a.id);
            const pred = PREDICTIONS[i];
            const correct = pred === a.isCat;
            return (
              <button
                key={a.id}
                onClick={() => reveal(a.id)}
                className="card-sketchy p-2 text-center transition-transform hover:-translate-y-0.5"
                style={{
                  background: isRevealed
                    ? correct
                      ? MINT + "44"
                      : CORAL + "44"
                    : PAPER,
                }}
              >
                <div className="text-2xl">{isRevealed ? a.emoji : "❓"}</div>
                <p className="font-hand text-[10px] text-foreground">{a.name}</p>
                {isRevealed && (
                  <p className="font-hand text-[9px] font-bold text-muted-foreground">
                    pred: {pred ? "cat" : "not"}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={revealAll}
          className="btn-sketchy font-hand text-xs"
          style={{ background: YELLOW }}
        >
          Reveal all
        </button>
        <button onClick={reset} className="btn-sketchy-outline font-hand text-xs">
          Reset
        </button>
      </div>

      {/* Live confusion matrix */}
      {revealed.length > 0 && (
        <div className="card-sketchy p-4" style={{ background: PAPER }}>
          <p className="font-hand text-sm font-bold text-foreground text-center mb-3">
            Confusion Matrix ({revealed.length} of {total} revealed)
          </p>
          <div className="grid grid-cols-[60px_1fr_1fr] gap-2 text-center">
            <div />
            <div className="font-hand text-[10px] font-bold text-muted-foreground">
              Actual: cat
            </div>
            <div className="font-hand text-[10px] font-bold text-muted-foreground">
              Actual: not
            </div>
            <div className="font-hand text-[10px] font-bold text-muted-foreground self-center">
              Pred: cat
            </div>
            <div
              className="card-sketchy p-3"
              style={{ background: MINT + "44" }}
            >
              <p className="font-hand text-[10px] font-bold">TP</p>
              <p className="font-hand text-2xl font-bold text-foreground">
                {ANIMALS.filter(
                  (a, i) => a.isCat && PREDICTIONS[i] && revealed.includes(a.id)
                ).length}
              </p>
            </div>
            <div
              className="card-sketchy p-3"
              style={{ background: PEACH + "44" }}
            >
              <p className="font-hand text-[10px] font-bold">FP</p>
              <p className="font-hand text-2xl font-bold text-foreground">
                {ANIMALS.filter(
                  (a, i) => !a.isCat && PREDICTIONS[i] && revealed.includes(a.id)
                ).length}
              </p>
            </div>
            <div className="font-hand text-[10px] font-bold text-muted-foreground self-center">
              Pred: not
            </div>
            <div
              className="card-sketchy p-3"
              style={{ background: CORAL + "44" }}
            >
              <p className="font-hand text-[10px] font-bold">FN</p>
              <p className="font-hand text-2xl font-bold text-foreground">
                {ANIMALS.filter(
                  (a, i) => a.isCat && !PREDICTIONS[i] && revealed.includes(a.id)
                ).length}
              </p>
            </div>
            <div
              className="card-sketchy p-3"
              style={{ background: SKY + "44" }}
            >
              <p className="font-hand text-[10px] font-bold">TN</p>
              <p className="font-hand text-2xl font-bold text-foreground">
                {ANIMALS.filter(
                  (a, i) =>
                    !a.isCat && !PREDICTIONS[i] && revealed.includes(a.id)
                ).length}
              </p>
            </div>
          </div>

          {revealed.length === total && (
            <p className="font-hand text-sm text-center text-foreground mt-3">
              Accuracy ={" "}
              <b>
                {tp + tn} / {total} = {accuracy}%
              </b>
            </p>
          )}
        </div>
      )}

      <InfoBox variant="amber">
        Notice: even when accuracy is high, the four boxes tell you DIFFERENT
        stories. The matrix is more honest than a single percentage.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – When mistakes hurt differently                             */
/* ------------------------------------------------------------------ */

const STAKES = [
  {
    title: "Spam filter 📧",
    color: SKY,
    fpCost: "An important email lands in spam — you miss your job offer.",
    fnCost: "A spam email reaches your inbox — minor annoyance.",
    worse: "FP",
    explain: "Better to let some spam through than lose a real email.",
  },
  {
    title: "Cancer detector 🏥",
    color: CORAL,
    fpCost: "A healthy person gets extra tests — scary but treatable.",
    fnCost: "A sick person is told they're fine — disease grows untreated.",
    worse: "FN",
    explain: "Missing a real case is FAR worse than a false alarm here.",
  },
  {
    title: "Loud fire alarm 🔥",
    color: YELLOW,
    fpCost: "Alarm goes off when there's no fire — you're annoyed.",
    fnCost: "Real fire, but no alarm — danger.",
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
        Not all mistakes are equal. Some <b>false positives</b> hurt more — sometimes <b>false negatives</b> do.
      </p>

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
        Smart engineers don't just chase high accuracy — they ask "which mistake
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
      "Predicted NO (no cancer) but the truth was YES (had cancer). That's a False Negative — and a dangerous one.",
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
      "Accuracy is one number. The confusion matrix splits it into 4 — so you can see if mistakes are mostly false alarms or missed cases.",
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
            "Byte: \"Did it call dogs 'cats' (false alarm)? Or did it miss real cats (missed catch)? Those are very different mistakes — and depending on the job, one might be way worse than the other.\"",
            "Aru: \"How do I see that?\"",
            "Byte: \"With a confusion matrix — a 2×2 grid that shows EVERY type of right and wrong answer your model made.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A confusion matrix is a 2×2 grid that breaks down a model's predictions into four boxes: True Positives, False Positives, True Negatives, and False Negatives. It tells you not just HOW often a model is wrong — but in WHICH way it's wrong, which often matters more."
        />
      }
    />
  );
}
