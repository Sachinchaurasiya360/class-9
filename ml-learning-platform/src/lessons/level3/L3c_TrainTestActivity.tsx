import { useState, useMemo, useEffect, useRef } from "react";
import { Layers, Scissors, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Tab 1 – Why Split? (animated card split)                           */
/* ------------------------------------------------------------------ */

function SplitTab() {
  const [trainPct, setTrainPct] = useState(80);
  const [animKey, setAnimKey] = useState(0);
  const total = 20;
  const trainCount = Math.round((trainPct / 100) * total);
  const testCount = total - trainCount;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Before we let a model learn, we hide some examples in a{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>secret pile</span> — so later we can check if it really learned, or just memorized.
      </p>

      <div className="card-sketchy notebook-grid" style={{ background: PAPER }}>
        {/* Animated split SVG */}
        <svg viewBox="0 0 360 90" className="w-full max-w-[360px] mx-auto mb-2">
          <defs>
            <radialGradient id="ds-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff3a0" />
              <stop offset="100%" stopColor={YELLOW} />
            </radialGradient>
          </defs>
          <circle cx={50} cy={45} r={26} fill="url(#ds-grad)" stroke={INK} strokeWidth={2.5} className="pulse-glow" style={{ color: YELLOW }} />
          <text x={50} y={49} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={11} fill={INK}>DATA</text>
          <line x1={80} y1={45} x2={170} y2={20} stroke={MINT} strokeWidth={3} strokeLinecap="round" className="signal-flow" style={{ color: MINT }} />
          <line x1={80} y1={45} x2={170} y2={70} stroke={CORAL} strokeWidth={3} strokeLinecap="round" className="signal-flow" style={{ color: CORAL }} />
          <rect x={170} y={6} width={100} height={28} rx={8} fill={MINT} stroke={INK} strokeWidth={2} />
          <text x={220} y={25} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={12} fill="#fff">TRAIN {trainPct}%</text>
          <rect x={170} y={56} width={100} height={28} rx={8} fill={CORAL} stroke={INK} strokeWidth={2} />
          <text x={220} y={75} textAnchor="middle" fontFamily="Kalam" fontWeight="bold" fontSize={12} fill="#fff">TEST {100 - trainPct}%</text>
        </svg>
        <label className="font-hand font-bold text-sm flex justify-between mb-1" style={{ color: INK }}>
          <span>Training data %</span>
          <span style={{ color: MINT }}>{trainPct}% train · {100 - trainPct}% test</span>
        </label>
        <input
          type="range"
          min={50}
          max={95}
          step={5}
          value={trainPct}
          onChange={(e) => { playClick(); setTrainPct(parseInt(e.target.value)); setAnimKey((k) => k + 1); }}
          className="w-full accent-[#4ecdc4]"
        />

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div
            className="card-sketchy text-center"
            style={{ background: "#e6fff8", padding: 12 }}
          >
            <div className="font-hand text-xs font-bold" style={{ color: INK, opacity: 0.6 }}>TRAINING PILE</div>
            <div className="font-hand text-3xl font-bold marker-highlight-yellow" style={{ color: MINT }}>{trainCount}</div>
            <div
              key={`tr-${animKey}`}
              className="grid mx-auto mt-2"
              style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 4, maxWidth: 180 }}
            >
              {Array.from({ length: trainCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: MINT,
                    border: `1.5px solid ${INK}`,
                    borderRadius: 4,
                    boxShadow: "1.5px 1.5px 0 #2b2a35",
                    animation: `fadeIn .3s ${i * 0.02}s both`,
                  }}
                />
              ))}
            </div>
            <div className="font-hand text-xs mt-2" style={{ color: INK }}>model practices on these</div>
          </div>

          <div className="card-sketchy text-center" style={{ background: "#fff0ed", padding: 12 }}>
            <div className="font-hand text-xs font-bold" style={{ color: INK, opacity: 0.6 }}>TEST PILE (locked)</div>
            <div className="font-hand text-3xl font-bold marker-highlight-yellow" style={{ color: CORAL }}>{testCount}</div>
            <div
              key={`te-${animKey}`}
              className="grid mx-auto mt-2"
              style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 4, maxWidth: 180 }}
            >
              {Array.from({ length: testCount }, (_, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "1",
                    background: CORAL,
                    border: `1.5px solid ${INK}`,
                    borderRadius: 4,
                    boxShadow: "1.5px 1.5px 0 #2b2a35",
                    animation: `fadeIn .3s ${i * 0.02}s both`,
                  }}
                />
              ))}
            </div>
            <div className="font-hand text-xs mt-2" style={{ color: INK }}>model never sees these</div>
          </div>
        </div>
      </div>

      <InfoBox variant="blue">
        Most ML projects use about <b>80% train, 20% test</b>. Too little training → model learns nothing. Too little test → you can't trust the score.
      </InfoBox>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(.4) translateY(-6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Memorize vs Learn (cheating quiz)                          */
/* ------------------------------------------------------------------ */

const SEEN_QUESTIONS = [
  { q: "2 + 3 = ?", a: 5 },
  { q: "4 + 1 = ?", a: 5 },
  { q: "6 + 2 = ?", a: 8 },
  { q: "7 + 3 = ?", a: 10 },
];

const NEW_QUESTIONS = [
  { q: "5 + 4 = ?", a: 9 },
  { q: "8 + 2 = ?", a: 10 },
  { q: "3 + 6 = ?", a: 9 },
  { q: "9 + 1 = ?", a: 10 },
];

function MemorizeTab() {
  const [phase, setPhase] = useState<"intro" | "trained" | "tested">("intro");
  const memorizerScoreSeen = 4; // perfect
  const memorizerScoreNew = 0;  // never seen
  const learnerScoreSeen = 4;
  const learnerScoreNew = 4;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Two students study the SAME 4 math problems. Then we test them on{" "}
        <span style={{ color: LAVENDER, fontWeight: 700 }}>new</span> problems they've never seen.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="card-sketchy" style={{ background: "#fff0ed" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 28 }}>🦜</span>
            <h3 className="font-hand font-bold" style={{ color: INK }}>The Memorizer</h3>
          </div>
          <p className="font-hand text-xs" style={{ color: INK, opacity: 0.75 }}>Just memorizes the 4 answers like a parrot.</p>
        </div>
        <div className="card-sketchy" style={{ background: "#e6fff8" }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ fontSize: 28 }}>🧠</span>
            <h3 className="font-hand font-bold" style={{ color: INK }}>The Learner</h3>
          </div>
          <p className="font-hand text-xs" style={{ color: INK, opacity: 0.75 }}>Learns the rule "add the two numbers".</p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={() => { playPop(); setPhase("trained"); }} className="btn-sketchy font-hand" style={{ background: MINT }}>
          1. Train on seen 4
        </button>
        <button onClick={() => { playPop(); setPhase("tested"); }} disabled={phase === "intro"} className="btn-sketchy font-hand" style={{ background: CORAL, opacity: phase === "intro" ? 0.4 : 1 }}>
          2. Test on new 4
        </button>
      </div>

      {phase !== "intro" && (
        <div className="card-sketchy" style={{ background: PAPER }}>
          <h4 className="font-hand font-bold mb-2 text-sm" style={{ color: INK }}>
            ✅ Training problems (both score)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {SEEN_QUESTIONS.map((q, i) => (
              <div key={i} className="card-sketchy text-center" style={{ background: "#fff8dc", padding: 8 }}>
                <div className="font-mono text-xs" style={{ color: INK }}>{q.q}</div>
                <div className="font-hand font-bold" style={{ color: MINT }}>{q.a}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center mt-3 font-hand text-sm">
            <span>🦜 <b style={{ color: MINT }}>{memorizerScoreSeen}/4</b></span>
            <span>🧠 <b style={{ color: MINT }}>{learnerScoreSeen}/4</b></span>
          </div>
        </div>
      )}

      {phase === "tested" && (
        <div className="card-sketchy" style={{ background: PAPER }}>
          <h4 className="font-hand font-bold mb-2 text-sm" style={{ color: INK }}>
            🎯 Test problems (NEW — never seen during training)
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NEW_QUESTIONS.map((q, i) => (
              <div key={i} className="card-sketchy text-center" style={{ background: "#f0e6ff", padding: 8 }}>
                <div className="font-mono text-xs" style={{ color: INK }}>{q.q}</div>
                <div className="font-hand font-bold" style={{ color: LAVENDER }}>{q.a}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <div className="card-sketchy text-center" style={{ background: "#ffe8e8", padding: 10 }}>
              <div className="font-hand text-xs">Memorizer</div>
              <div className="font-hand text-2xl font-bold" style={{ color: CORAL }}>{memorizerScoreNew} / 4</div>
              <div className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>didn't actually learn anything</div>
            </div>
            <div className="card-sketchy text-center" style={{ background: "#d4f7e8", padding: 10 }}>
              <div className="font-hand text-xs">Learner</div>
              <div className="font-hand text-2xl font-bold" style={{ color: MINT }}>{learnerScoreNew} / 4</div>
              <div className="font-hand text-xs" style={{ color: INK, opacity: 0.7 }}>found the real rule</div>
            </div>
          </div>
        </div>
      )}

      <InfoBox variant="amber">
        This is the whole point of a test set! On the training problems both look perfect — but only the test reveals who actually learned. ML calls this <b>generalization</b>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Accuracy meter (interactive)                               */
/* ------------------------------------------------------------------ */

function AccuracyTab() {
  const [correct, setCorrect] = useState(7);
  const total = 10;
  const pct = (correct / total) * 100;
  const grade = pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : pct >= 50 ? "Okay" : "Needs work";
  const gradeColor = pct >= 90 ? MINT : pct >= 70 ? SKY : pct >= 50 ? YELLOW : CORAL;

  // animated needle
  const targetAngle = -90 + (pct / 100) * 180;
  const [angle, setAngle] = useState(targetAngle);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    let cur = angle;
    const step = () => {
      cur += (targetAngle - cur) * 0.18;
      if (Math.abs(cur - targetAngle) < 0.2) cur = targetAngle;
      setAngle(cur);
      if (cur !== targetAngle) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetAngle]);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        After testing, we count how many predictions the model got right.{" "}
        <span style={{ color: CORAL, fontWeight: 700 }}>Accuracy</span> = correct ÷ total.
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <svg viewBox="0 0 320 180" className="w-full mx-auto" style={{ maxWidth: 360 }}>
          <defs>
            <pattern id="acc-grid" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M14 0H0V14" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="320" height="180" fill="url(#acc-grid)" />
          {/* arc segments */}
          {[
            { from: -90, to: -36, color: CORAL },
            { from: -36, to: 0, color: PEACH },
            { from: 0, to: 36, color: YELLOW },
            { from: 36, to: 72, color: SKY },
            { from: 72, to: 90, color: MINT },
          ].map((seg, i) => {
            const r = 110;
            const cx = 160, cy = 150;
            const a1 = (seg.from * Math.PI) / 180;
            const a2 = (seg.to * Math.PI) / 180;
            const x1 = cx + r * Math.cos(a1);
            const y1 = cy + r * Math.sin(a1);
            const x2 = cx + r * Math.cos(a2);
            const y2 = cy + r * Math.sin(a2);
            return (
              <path
                key={i}
                d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                stroke={seg.color}
                strokeWidth="22"
                fill="none"
                strokeLinecap="butt"
                style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }}
              />
            );
          })}
          {/* needle */}
          <g transform={`rotate(${angle} 160 150)`}>
            <line x1="160" y1="150" x2="160" y2="55" stroke={INK} strokeWidth="4" strokeLinecap="round" />
            <circle cx="160" cy="55" r="6" fill={YELLOW} stroke={INK} strokeWidth="2.5" />
          </g>
          <circle cx="160" cy="150" r="10" fill={INK} />
          <text x="160" y="178" textAnchor="middle" fill={INK}
            style={{ fontFamily: "Patrick Hand, cursive", fontSize: 14 }}>
            ACCURACY
          </text>
        </svg>

        <div className="text-center mt-3">
          <div className="font-hand text-5xl font-bold" style={{ color: gradeColor, filter: "drop-shadow(2px 2px 0 #2b2a35)" }}>
            {pct.toFixed(0)}%
          </div>
          <div className="font-hand text-base" style={{ color: INK }}>{grade}</div>
        </div>

        <div className="mt-4">
          <label className="font-hand text-sm font-bold flex justify-between" style={{ color: INK }}>
            <span>Correct predictions</span>
            <span style={{ color: CORAL }}>{correct} / {total}</span>
          </label>
          <input
            type="range"
            min={0}
            max={total}
            value={correct}
            onChange={(e) => setCorrect(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hand text-xs">
        <div className="card-sketchy text-center p-2" style={{ background: "#e6fff8" }}>
          90%+ → ML model ready to ship 🚀
        </div>
        <div className="card-sketchy text-center p-2" style={{ background: "#ffe8e8" }}>
          &lt;50% → worse than flipping a coin 🪙
        </div>
      </div>

      <InfoBox variant="green">
        Accuracy is the simplest score, but it's not the only one. Later you'll meet <b>precision</b>, <b>recall</b>, and <b>F1</b> — different ways to measure what "good" means.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do we split data into training and test sets?",
    options: ["To make training faster", "To check if the model truly learned, not just memorized", "Because computers prefer two piles", "To save space"],
    correctIndex: 1,
    explanation: "The test set is locked away during training. If the model does well on data it never saw, we know it really learned the pattern.",
  },
  {
    question: "What is the most common train/test split?",
    options: ["50/50", "80/20", "10/90", "100/0"],
    correctIndex: 1,
    explanation: "About 80% for training and 20% for testing is the classic recipe — enough to learn from, enough to honestly test.",
  },
  {
    question: "A model gets 100% on training but 30% on test. What's wrong?",
    options: ["Nothing — it's perfect", "It memorized instead of learning", "The test set is broken", "It's too small"],
    correctIndex: 1,
    explanation: "This is called overfitting — the model memorized the training answers but never found the real pattern. Always trust the TEST score.",
  },
  {
    question: "If a model gets 8 out of 10 right, what's its accuracy?",
    options: ["8%", "20%", "80%", "100%"],
    correctIndex: 2,
    explanation: "Accuracy = correct ÷ total = 8 ÷ 10 = 0.80 = 80%.",
  },
];

export default function L3c_TrainTestActivity() {
  const tabs = useMemo(
    () => [
      { id: "split", label: "The Split", icon: <Scissors className="w-4 h-4" />, content: <SplitTab /> },
      { id: "memorize", label: "Memorize vs Learn", icon: <Layers className="w-4 h-4" />, content: <MemorizeTab /> },
      { id: "accuracy", label: "Accuracy Meter", icon: <Trophy className="w-4 h-4" />, content: <AccuracyTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Train & Test: The Honesty Trick"
      level={3}
      lessonNumber={6}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You know how to score a model honestly. Time to dive into actual ML algorithms in Level 4!"
      story={
        <StorySection
          paragraphs={[
            "Aru: \"Byte, I taught my little robot every math question in the book. It got 100% on the exam!\"",
            "Byte: \"Wait — were the exam questions the SAME ones from the book?\"",
            "Aru: \"Yes...?\"",
            "Byte: \"Then your robot didn't learn math. It just memorized the answers. Quick — give it a brand new question it's never seen.\"",
            "Aru tried. The robot froze. It didn't know what to do.",
            "Byte: \"That's why ML always hides some examples in a TEST PILE. We never let the model see them while it's learning. Then we use them as a surprise quiz to see if it really learned.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Always split your data into TRAIN (the model practices on this) and TEST (locked away — used only at the end to check if the model truly learned). Score on the test set is the only honest measure of how well a model will work on new data in the real world."
        />
      }
    />
  );
}
