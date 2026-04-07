import { useState, useMemo, useEffect, useRef } from "react";
import { Minimize2, Eye, Layers } from "lucide-react";
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
/*  Tab 1 – Squish 2D → 1D (project onto a line)                        */
/* ------------------------------------------------------------------ */

type P2 = { x: number; y: number; cls: 0 | 1 };

function makePoints(): P2[] {
  // two elongated clusters along a diagonal
  const pts: P2[] = [];
  const seed = (s: number) => {
    let a = s;
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };
  const r = seed(11);
  for (let i = 0; i < 16; i++) {
    pts.push({ x: 0.2 + r() * 0.3, y: 0.2 + r() * 0.3, cls: 0 });
    pts.push({ x: 0.55 + r() * 0.3, y: 0.55 + r() * 0.3, cls: 1 });
  }
  return pts;
}

function SquishTab() {
  const [angleDeg, setAngleDeg] = useState(45);
  const points = useMemo(makePoints, []);
  const W = 360, H = 360;
  const cx = W / 2, cy = H / 2;
  const angle = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(angle), uy = Math.sin(angle);

  const projected = points.map((p) => {
    const px = (p.x - 0.5) * 240;
    const py = (p.y - 0.5) * 240;
    const t = px * ux + py * uy;
    return { p, px, py, projX: cx + t * ux, projY: cy + t * uy, t };
  });

  // separability = absolute difference of class means
  const m0 = projected.filter((p) => p.p.cls === 0).reduce((a, b) => a + b.t, 0) / 16;
  const m1 = projected.filter((p) => p.p.cls === 1).reduce((a, b) => a + b.t, 0) / 16;
  const sep = Math.abs(m1 - m0);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Real data has <b>many dimensions</b>. To visualize it, we squish points onto a single line.
        Try rotating the line — find the angle that <span style={{ color: CORAL, fontWeight: 700 }}>separates the clusters best</span>!
      </p>

      <div className="card-sketchy notebook-grid p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 460 }}>
          <defs>
            <radialGradient id="dim-coral" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={CORAL} />
            </radialGradient>
            <radialGradient id="dim-sky" cx="35%" cy="30%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor={SKY} />
            </radialGradient>
          </defs>
          <line x1={0} y1={cy} x2={W} y2={cy} stroke={INK} strokeWidth="1" opacity="0.3" />
          <line x1={cx} y1={0} x2={cx} y2={H} stroke={INK} strokeWidth="1" opacity="0.3" />

          {/* projection line */}
          <line
            x1={cx - ux * 200}
            y1={cy - uy * 200}
            x2={cx + ux * 200}
            y2={cy + uy * 200}
            stroke={YELLOW}
            strokeWidth="6"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(2px 2px 0 #2b2a35)" }}
          />
          <line
            x1={cx - ux * 200}
            y1={cy - uy * 200}
            x2={cx + ux * 200}
            y2={cy + uy * 200}
            stroke={INK}
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* original + projection lines + projected points (signal-flow on projections) */}
          {projected.map((pp, i) => (
            <g key={i}>
              <line x1={cx + pp.px} y1={cy + pp.py} x2={pp.projX} y2={pp.projY}
                stroke={pp.p.cls === 0 ? CORAL : SKY} strokeWidth="1.5" opacity="0.55"
                className="signal-flow" style={{ color: pp.p.cls === 0 ? CORAL : SKY }} />
              <circle cx={cx + pp.px} cy={cy + pp.py} r={6}
                fill={pp.p.cls === 0 ? "url(#dim-coral)" : "url(#dim-sky)"}
                stroke={INK} strokeWidth="2.5" />
              <circle cx={pp.projX} cy={pp.projY} r={4.5}
                fill={pp.p.cls === 0 ? "url(#dim-coral)" : "url(#dim-sky)"}
                stroke={INK} strokeWidth="2"
                className="pulse-glow"
                style={{ color: pp.p.cls === 0 ? CORAL : SKY }} />
            </g>
          ))}
        </svg>

        <div className="mt-2">
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🔄 Line angle</span>
            <span style={{ color: LAVENDER }}>{angleDeg}°</span>
          </label>
          <input
            type="range"
            min={0}
            max={180}
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#b18cf2]"
          />
          <div className="text-center font-hand text-sm mt-2" style={{ color: INK }}>
            Cluster separation:{" "}
            <span className="marker-highlight-yellow" style={{ padding: "0 6px", color: sep > 80 ? MINT : sep > 40 ? CORAL : INK, fontWeight: 700 }}>
              {sep.toFixed(0)}
            </span>
            {sep > 100 && <span style={{ color: MINT }}> 👍 great angle!</span>}
          </div>
        </div>
      </div>

      <InfoBox variant="blue">
        This is the heart of <b>PCA</b> (Principal Component Analysis). PCA picks the angle automatically — the one that spreads the data out as much as possible. It's how a 1000-feature dataset becomes a viewable 2D plot.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Curse of Dimensions (animated counter)                      */
/* ------------------------------------------------------------------ */

function CurseTab() {
  const [dims, setDims] = useState(2);
  const cellsNeeded = Math.pow(10, dims);

  // grid renders only for d ≤ 3
  const renderGrid = () => {
    if (dims === 1) {
      return (
        <div className="flex justify-center gap-1">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ width: 24, height: 24, background: SKY, border: `2px solid ${INK}`, borderRadius: 4 }} />
          ))}
        </div>
      );
    }
    if (dims === 2) {
      return (
        <div className="grid mx-auto" style={{ gridTemplateColumns: "repeat(10,1fr)", gap: 3, maxWidth: 240 }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} style={{ aspectRatio: "1", background: MINT, border: `1.5px solid ${INK}`, borderRadius: 3 }} />
          ))}
        </div>
      );
    }
    if (dims === 3) {
      return (
        <div className="font-hand text-center" style={{ color: INK }}>
          <div style={{ fontSize: 80 }}>🧊</div>
          <div className="text-sm">a 10×10×10 cube = <b>1,000</b> tiny boxes</div>
        </div>
      );
    }
    return (
      <div className="font-hand text-center text-base" style={{ color: CORAL }}>
        Can't even draw {dims} dimensions on paper. Imagine a {dims}-D cube...
        <div className="text-3xl mt-2 font-bold marker-highlight-yellow" style={{ padding: "0 6px" }}>
          {cellsNeeded.toLocaleString()} cells!
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Adding more features <b>sounds</b> good — until you realize empty space explodes faster than data can fill it.
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <h3 className="font-hand font-bold text-center mb-2" style={{ color: INK }}>
          Cells needed to cover the space (10 per axis)
        </h3>
        <div className="min-h-[200px] flex items-center justify-center py-3">
          {renderGrid()}
        </div>
        <div className="text-center font-hand mt-2" style={{ color: INK }}>
          {dims} dimensions = <b style={{ color: dims > 3 ? CORAL : MINT }}>{cellsNeeded.toLocaleString()}</b> cells
        </div>

        <div className="mt-3">
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🧱 Number of dimensions</span>
            <span style={{ color: CORAL }}>{dims}</span>
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={dims}
            onChange={(e) => setDims(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hand text-xs">
        <div className="card-sketchy text-center p-2" style={{ background: "#e6fff8" }}>
          Few dims → easy to fill
        </div>
        <div className="card-sketchy text-center p-2" style={{ background: "#ffe8e8" }}>
          Many dims → mostly empty
        </div>
      </div>

      <InfoBox variant="amber">
        ML calls this the <b>curse of dimensionality</b>. With 100 features, you'd need more data points than atoms in the universe to fill the space. That's why we squish — to bring high-D data back into a learnable shape.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – Compression Slider (image pixels → bars)                    */
/* ------------------------------------------------------------------ */

function CompressionTab() {
  const original = useMemo(
    () => Array.from({ length: 32 }, (_, i) => 30 + 50 * Math.sin(i * 0.45) + 25 * Math.cos(i * 0.18) + 15 * Math.sin(i * 0.9)),
    [],
  );
  const [components, setComponents] = useState(8);

  // Simple "PCA-like" compression: average groups together (block compression)
  const compressed = useMemo(() => {
    const block = Math.max(1, Math.round(original.length / components));
    const result: number[] = [];
    for (let i = 0; i < original.length; i++) {
      const start = Math.floor(i / block) * block;
      const end = Math.min(start + block, original.length);
      const avg = original.slice(start, end).reduce((a, b) => a + b, 0) / (end - start);
      result.push(avg);
    }
    return result;
  }, [original, components]);

  const [pulse, setPulse] = useState(0);
  const raf = useRef<number | undefined>(undefined);
  useEffect(() => {
    const tick = () => { setPulse((p) => (p + 0.05) % (Math.PI * 2)); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, []);

  const W = 480, H = 200;
  const barW = W / original.length;

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Squishing data is like compressing a song. With <b>fewer numbers</b>, you keep the shape — but lose tiny details.
      </p>

      <div className="card-sketchy" style={{ background: PAPER }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxWidth: 600 }}>
          <defs>
            <pattern id="comp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M20 0H0V20" fill="none" stroke="#e8e3d3" strokeWidth="0.6" />
            </pattern>
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="url(#comp-grid)" />
          {original.map((v, i) => (
            <rect key={`o${i}`} x={i * barW + 1} y={H - v} width={barW - 2} height={v}
              fill={SKY} stroke={INK} strokeWidth="1" opacity="0.45" />
          ))}
          {compressed.map((v, i) => (
            <rect key={`c${i}`} x={i * barW + 1} y={H - v} width={barW - 2} height={v}
              fill={CORAL} stroke={INK} strokeWidth="1.5"
              style={{ filter: "drop-shadow(1px 1px 0 #2b2a35)" }} />
          ))}
          <circle cx={20 + Math.sin(pulse) * 10} cy={20} r="6" fill={YELLOW} stroke={INK} strokeWidth="2" />
        </svg>

        <div className="flex justify-center gap-4 mt-2 font-hand text-xs" style={{ color: INK }}>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, background: SKY, border: `1.5px solid ${INK}`, opacity: 0.6 }} />
            original ({original.length} numbers)
          </div>
          <div className="flex items-center gap-1.5">
            <span style={{ width: 12, height: 12, background: CORAL, border: `1.5px solid ${INK}` }} />
            compressed ({components} unique)
          </div>
        </div>

        <div className="mt-3">
          <label className="font-hand font-bold text-sm flex justify-between" style={{ color: INK }}>
            <span>🎚️ Components to keep</span>
            <span style={{ color: CORAL }}>{components}</span>
          </label>
          <input
            type="range"
            min={1}
            max={32}
            value={components}
            onChange={(e) => setComponents(parseInt(e.target.value))}
            className="w-full mt-1 accent-[#ff6b6b]"
          />
          <div className="flex justify-between font-hand text-xs mt-1" style={{ color: INK, opacity: 0.6 }}>
            <span>tiny file, blurry</span>
            <span>full size, perfect</span>
          </div>
        </div>
      </div>

      <InfoBox variant="green">
        JPEG, MP3, MP4 — every file format you know is built on this idea. Throw away tiny details, keep the big shape, save 95% of the space. Same thing PCA does for ML data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do we use dimensionality reduction?",
    options: ["To make data prettier", "To squish many features down so we can see and learn from them", "To delete data", "To add features"],
    correctIndex: 1,
    explanation: "Real datasets have hundreds or thousands of features. We squish them down so they're easier to visualize and easier for models to learn from.",
  },
  {
    question: "What is the 'curse of dimensionality'?",
    options: ["A spell on computers", "Empty space grows huge as you add features, leaving data sparse", "A bug in Python", "When models take too long"],
    correctIndex: 1,
    explanation: "Each new dimension multiplies the volume of empty space. With many features, your data points become tiny dots in an enormous mostly-empty space.",
  },
  {
    question: "What does PCA try to find?",
    options: ["The cheapest features", "The directions that spread the data out the most", "The smallest values", "The labels"],
    correctIndex: 1,
    explanation: "PCA picks the angles where your data varies the most — those carry the most information and are best for compression.",
  },
  {
    question: "What's the trade-off when keeping fewer components?",
    options: ["Smaller data, but lose fine details", "Bigger files", "More features", "Slower training"],
    correctIndex: 0,
    explanation: "Fewer components = smaller, faster, cleaner — but you discard tiny details. Same trade-off as JPEG image quality.",
  },
];

export default function L5c_DimensionalityActivity() {
  const tabs = useMemo(
    () => [
      { id: "squish", label: "Squish 2D → 1D", icon: <Minimize2 className="w-4 h-4" />, content: <SquishTab /> },
      { id: "curse", label: "Curse of Dimensions", icon: <Layers className="w-4 h-4" />, content: <CurseTab /> },
      { id: "compress", label: "Compression", icon: <Eye className="w-4 h-4" />, content: <CompressionTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Dimensionality Reduction: Squishing Big Data"
      level={5}
      lessonNumber={5}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've mastered unsupervised learning! Time to meet the brain itself: neural networks in Level 6."
      story={
        <StorySection
          paragraphs={[
            "Aru showed Byte a spreadsheet with 50 columns about her classmates: height, weight, age, favorite color, sleep hours, screen time, math score, music taste...",
            "Aru: \"How am I supposed to SEE patterns in this? I can only plot 2 things at a time!\"",
            "Byte: \"You're hitting a real wall. Humans can see 2D plots, maybe 3D. But your data lives in 50 dimensions.\"",
            "Aru: \"So... I just give up?\"",
            "Byte: \"Nope. We squish. We find the 2 most interesting angles in those 50 dimensions and project everything onto them. Suddenly 50-D becomes a flat picture you can read with your eyes.\"",
            "Aru: \"That feels like cheating.\"",
            "Byte: \"It IS cheating — beautifully. It's called PCA, and every data scientist on Earth uses it daily.\""
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Dimensionality reduction takes data with many features and squishes it into fewer dimensions while keeping the important structure. PCA is the most famous method — it picks the angles that spread your data out the most, so you can visualize, compress, and learn from it."
        />
      }
    />
  );
}
