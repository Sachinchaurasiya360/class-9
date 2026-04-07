import { useState, useMemo } from "react";
import { AlertOctagon, ShieldAlert, Activity } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Seeded PRNG                                                        */
/* ------------------------------------------------------------------ */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ------------------------------------------------------------------ */
/*  Tab 1 – Spot the Odd One                                           */
/* ------------------------------------------------------------------ */

type Pt = { x: number; y: number; outlier: boolean };

function generatePoints(seed: number, n = 30, k = 1): Pt[] {
  const rand = mulberry32(seed);
  const cx = 200, cy = 130, r = 55;
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const angle = rand() * Math.PI * 2;
    const rad = Math.sqrt(rand()) * r;
    pts.push({ x: cx + Math.cos(angle) * rad, y: cy + Math.sin(angle) * rad, outlier: false });
  }
  for (let i = 0; i < k; i++) {
    const side = rand() > 0.5 ? 1 : -1;
    const ox = cx + side * (90 + rand() * 50);
    const oy = cy + (rand() - 0.5) * 180;
    pts.push({ x: ox, y: oy, outlier: true });
  }
  return pts;
}

function SpotOddTab() {
  const [seed, setSeed] = useState(7);
  const [picks, setPicks] = useState<Set<number>>(new Set());
  const points = useMemo(() => generatePoints(seed, 30, 2), [seed]);
  const W = 400, H = 260;

  const togglePick = (i: number) => {
    setPicks((p) => {
      const next = new Set(p);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  };

  const correctPicks = Array.from(picks).filter((i) => points[i].outlier).length;
  const wrongPicks = picks.size - correctPicks;
  const totalOutliers = points.filter((p) => p.outlier).length;
  const allFound = correctPicks === totalOutliers && wrongPicks === 0;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Most points belong to the <span style={{ color: SKY, fontWeight: 700 }}>normal cluster</span>.
        A few are <span style={{ color: CORAL, fontWeight: 700 }}>anomalies</span> — they don't fit the pattern.
        Click them!
      </p>

      <div className="card-sketchy notebook-grid p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 540 }}>
          <defs>
            <radialGradient id="anom-normal-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={LAVENDER} />
            </radialGradient>
            <radialGradient id="anom-correct-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={MINT} />
            </radialGradient>
            <radialGradient id="anom-wrong-grad" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
          </defs>

          {/* normal-zone hint circle */}
          <circle cx={200} cy={130} r={70} fill="none" stroke={MINT} strokeWidth="2.5" strokeDasharray="4 4" opacity="0.6" className="wobble" />
          <text x={200} y={50} textAnchor="middle" fill={MINT} fontFamily="Kalam"
            style={{ fontSize: 13, fontWeight: 700 }}>
            normal zone
          </text>

          {points.map((p, i) => {
            const picked = picks.has(i);
            const correct = picked && p.outlier;
            const wrong = picked && !p.outlier;
            const fill = correct ? "url(#anom-correct-grad)" : wrong ? "url(#anom-wrong-grad)" : "url(#anom-normal-grad)";
            return (
              <g key={i} onClick={() => togglePick(i)} style={{ cursor: "pointer" }}>
                {/* fire-ring on outliers (always visible as a hint after revealed; here on correct picks) */}
                {p.outlier && (
                  <circle cx={p.x} cy={p.y} r={9} fill="none" stroke={CORAL} strokeWidth={2.5}
                    className="fire-ring" style={{ color: CORAL }} />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={picked ? 9 : 6}
                  fill={fill}
                  stroke={INK}
                  strokeWidth="2.5"
                  className={correct ? "pulse-glow" : ""}
                  style={{ transition: "r .15s", color: MINT }}
                />
                {correct && (
                  <text x={p.x} y={p.y + 4} textAnchor="middle" fill={INK} fontFamily="Kalam"
                    style={{ fontSize: 11, fontWeight: 700 }}>✓</text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="flex justify-between items-center mt-3 font-hand text-sm" style={{ color: INK }}>
          <span>Found: <b style={{ color: MINT }}>{correctPicks}/{totalOutliers}</b></span>
          {wrongPicks > 0 && <span style={{ color: CORAL }}>Wrong: {wrongPicks}</span>}
          <button
            onClick={() => { setSeed((s) => s + 1); setPicks(new Set()); }}
            className="btn-sketchy-outline font-hand text-sm py-1 px-3"
          >
            New cloud
          </button>
        </div>
        {allFound && (
          <div className="text-center mt-3 font-hand text-base" style={{ color: MINT }}>
            <span className="marker-highlight-yellow" style={{ padding: "0 6px" }}>
              All anomalies found! 🎯
            </span>
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        Banks use this exact idea to catch <b>credit-card fraud</b>. Most of your purchases form a "normal cloud". When a transaction sits far outside it (wrong country, weird hour), the bank flags it.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Distance from the Center                                    */
/* ------------------------------------------------------------------ */

function DistanceTab() {
  const [threshold, setThreshold] = useState(60);
  const points = useMemo(() => {
    const rand = mulberry32(42);
    const cx = 200, cy = 130;
    const arr: { x: number; y: number; d: number }[] = [];
    for (let i = 0; i < 28; i++) {
      const angle = rand() * Math.PI * 2;
      const rad = Math.sqrt(rand()) * 50;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;
      arr.push({ x, y, d: Math.hypot(x - cx, y - cy) });
    }
    // Add a few far ones
    arr.push({ x: 320, y: 60, d: 0 });
    arr.push({ x: 80, y: 220, d: 0 });
    arr.push({ x: 350, y: 200, d: 0 });
    arr.push({ x: 60, y: 90, d: 0 });
    return arr.map((p) => ({ ...p, d: Math.hypot(p.x - cx, p.y - cy) }));
  }, []);
  const W = 400, H = 260;
  const flagged = points.filter((p) => p.d > threshold).length;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Computers don't "see" outliers — they <b>measure distances</b>. Anything farther than the threshold gets flagged.
      </p>

      <div className="card-sketchy notebook-grid p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 540 }}>
          <defs>
            <radialGradient id="dist-mint" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={MINT} />
            </radialGradient>
            <radialGradient id="dist-coral" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
          </defs>

          {/* threshold ring */}
          <circle cx={200} cy={130} r={threshold} fill={YELLOW} fillOpacity="0.25" stroke={INK} strokeWidth="2.5" strokeDasharray="5 4" className="wobble" />
          <circle cx={200} cy={130} r={3} fill={INK} />
          <text x={200} y={130 - threshold - 6} textAnchor="middle" fill={INK} fontFamily="Kalam"
            style={{ fontSize: 12, fontWeight: 700 }}>
            threshold = {threshold}
          </text>

          {points.map((p, i) => {
            const isAnom = p.d > threshold;
            return (
              <g key={i}>
                {isAnom && (
                  <>
                    <line x1={200} y1={130} x2={p.x} y2={p.y} stroke={CORAL} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.7" className="signal-flow" />
                    <circle cx={p.x} cy={p.y} r={9} fill="none" stroke={CORAL} strokeWidth={2.5} className="fire-ring" style={{ color: CORAL }} />
                  </>
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={6}
                  fill={isAnom ? "url(#dist-coral)" : "url(#dist-mint)"}
                  stroke={INK}
                  strokeWidth="2.5"
                  className={isAnom ? "pulse-glow" : ""}
                  style={{ color: CORAL }}
                />
              </g>
            );
          })}
        </svg>

        <div className="mt-3">
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🎚️ Sensitivity threshold</span>
            <span style={{ color: CORAL }}>flagged: {flagged}</span>
          </label>
          <input
            type="range"
            min={20}
            max={120}
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
          <div className="flex justify-between font-hand text-xs mt-1" style={{ color: INK, opacity: 0.6 }}>
            <span>strict (more alarms)</span>
            <span>loose (fewer alarms)</span>
          </div>
        </div>
      </div>

      <InfoBox variant="amber">
        Tuning the threshold is the trickiest part. Too tight → false alarms every time. Too loose → real fraud slips by. ML engineers tune this number for weeks.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Real World Anomaly Hunters                                  */
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
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Anomaly detection is one of ML's most useful tricks. It's secretly running everywhere:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {HUNTERS.map((h) => (
          <div key={h.name} className="card-sketchy overflow-hidden p-4">
            <div style={{ height: 6, background: h.color, margin: "-16px -16px 12px -16px", borderBottom: `2px solid ${INK}` }} />
            <div className="flex items-center gap-3 mb-2">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 50, height: 50, background: h.color, border: `2px solid ${INK}`, boxShadow: "3px 3px 0 #2b2a35", fontSize: 26 }}
              >
                {h.emoji}
              </div>
              <h3 className="font-hand text-base font-bold" style={{ color: INK }}>{h.name}</h3>
            </div>
            <div className="space-y-1 font-hand text-sm" style={{ color: INK }}>
              <div className="flex gap-2">
                <span className="px-1.5 rounded" style={{ background: MINT, color: PAPER, fontSize: 10, fontWeight: 700 }}>NORMAL</span>
                <span>{h.normal}</span>
              </div>
              <div className="flex gap-2">
                <span className="px-1.5 rounded" style={{ background: CORAL, color: PAPER, fontSize: 10, fontWeight: 700 }}>ALERT</span>
                <span>{h.anom}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <InfoBox variant="green">
        The trick: you don't need to label what's "bad" in advance. The model learns what's <b>normal</b> from millions of examples — then anything weird stands out.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What is anomaly detection?",
    options: ["Sorting data", "Finding examples that don't fit the normal pattern", "Drawing pictures", "Counting things"],
    correctIndex: 1,
    explanation: "Anomaly detection finds the few examples that look very different from the rest — fraud, bugs, attacks, breakdowns.",
  },
  {
    question: "How does an anomaly detector usually decide an example is weird?",
    options: ["By smelling it", "By measuring its distance from the normal cluster", "By asking the user", "Random guess"],
    correctIndex: 1,
    explanation: "If a point is much farther from the center of normal data than the threshold allows, it gets flagged.",
  },
  {
    question: "Why is anomaly detection 'unsupervised'?",
    options: ["It needs no labels — it learns what 'normal' looks like by itself", "It runs without electricity", "Nobody supervises it", "It's wild"],
    correctIndex: 0,
    explanation: "Unlike supervised learning, you don't need to mark examples as 'fraud' / 'not fraud' first. The model just learns the shape of normal.",
  },
  {
    question: "If you make the threshold too LOOSE, what happens?",
    options: ["More false alarms", "Real anomalies slip through unnoticed", "Computer crashes", "Nothing"],
    correctIndex: 1,
    explanation: "A loose threshold means even far-out points count as 'normal' — so real fraud or failures slip past undetected.",
  },
];

export default function L5b_AnomalyDetectionActivity() {
  const tabs = useMemo(
    () => [
      { id: "spot", label: "Spot the Odd One", icon: <AlertOctagon className="w-4 h-4" />, content: <SpotOddTab /> },
      { id: "distance", label: "Distance Threshold", icon: <Activity className="w-4 h-4" />, content: <DistanceTab /> },
      { id: "hunters", label: "Real Hunters", icon: <ShieldAlert className="w-4 h-4" />, content: <HuntersTab /> },
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
            "Byte: \"That was anomaly detection, doing its job. Your bank doesn't know what fraud LOOKS like exactly — it just knows what YOUR normal looks like. Coffee shops, your school cafeteria, that one bookstore. Brazil at 2 AM? Way outside normal.\"",
            "Aru: \"So it didn't need anyone to teach it 'this is fraud' — it just spotted the weirdness?\"",
            "Byte: \"Exactly. That's the magic of unsupervised anomaly detection. Learn what normal looks like, then ring the alarm when something doesn't fit.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Anomaly detection is unsupervised ML that finds rare, unusual data points by learning what 'normal' looks like and flagging anything that sits far outside it. Used everywhere from fraud detection to factory sensors to heart monitors."
        />
      }
    />
  );
}
