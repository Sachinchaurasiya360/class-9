"use client";

import { useState, useMemo } from "react";
import type { ReactNode } from "react";
import { Minimize2, Eye, Layers } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ScatterPlot,
  LineChart,
  BarChart,
} from "../../components/viz/data-viz";
import { mulberry32 } from "../../components/viz/ml-algorithms";

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const LAVENDER = "#b18cf2";
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
/*  Tab 1 - Squish 2D -> 1D (projection onto an axis)                  */
/* ------------------------------------------------------------------ */
type P2 = { x: number; y: number; cls: 0 | 1 };

function makePoints(): P2[] {
  // two elongated clusters along a diagonal
  const pts: P2[] = [];
  const rand = mulberry32(11);
  for (let i = 0; i < 16; i++) {
    pts.push({ x: 25 + rand() * 18, y: 25 + rand() * 18, cls: 0 });
    pts.push({ x: 55 + rand() * 18, y: 55 + rand() * 18, cls: 1 });
  }
  return pts;
}

function SquishTab() {
  const [angleDeg, setAngleDeg] = useState(45);
  const points = useMemo(makePoints, []);
  const angle = (angleDeg * Math.PI) / 180;
  const ux = Math.cos(angle);
  const uy = Math.sin(angle);

  // project onto the chosen axis and derive 1D coordinate + separation
  const { scatterData, oneDData, sep } = useMemo(() => {
    const cx = 50;
    const cy = 50;
    const proj = points.map((p) => {
      const px = p.x - cx;
      const py = p.y - cy;
      const t = px * ux + py * uy;
      return { p, t, projX: cx + t * ux, projY: cy + t * uy };
    });

    const scatter = points.flatMap((p, i) => {
      const pr = proj[i];
      return [
        {
          x: p.x,
          y: p.y,
          label: p.cls === 0 ? "class A" : "class B",
          category: p.cls === 0 ? "A" : "B",
        },
        {
          x: pr.projX,
          y: pr.projY,
          label: "projected",
          category: "projected",
        },
      ];
    });

    const oneD = proj.map((pr) => ({
      x: pr.t,
      y: pr.p.cls === 0 ? 0.5 : 1,
      label: pr.p.cls === 0 ? "A" : "B",
      category: pr.p.cls === 0 ? "A" : "B",
    }));

    const m0 =
      proj.filter((pp) => pp.p.cls === 0).reduce((a, b) => a + b.t, 0) / 16;
    const m1 =
      proj.filter((pp) => pp.p.cls === 1).reduce((a, b) => a + b.t, 0) / 16;
    return {
      scatterData: scatter,
      oneDData: oneD,
      sep: Math.abs(m1 - m0),
    };
  }, [points, ux, uy]);

  return (
    <div className="space-y-4">
      <RikuSays>
        Dimensionality reduction: when your data has 100 features but really only 2 of
        them matter. This tab squishes 2D onto a line. Rotate to find the angle where
        the two classes stay furthest apart.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Real data has <b>many dimensions</b>. To visualise it, we squish points onto a
        single line. Rotate the axis and watch the 1D projection separate - or collapse.
      </p>

      <div className="card-sketchy p-3">
        <ScatterPlot
          data={scatterData}
          categoryColors={{
            A: "var(--accent-coral)",
            B: "var(--accent-sky)",
            projected: "var(--accent-yellow)",
          }}
          xLabel="feature 1"
          yLabel="feature 2"
          title="2D points (coral / sky) + yellow projections onto chosen axis"
          height={300}
          pointRadius={6}
        />

        <div className="mt-3">
          <label
            className="font-hand font-bold text-sm flex justify-between"
            style={{ color: INK }}
          >
            <span>Line angle</span>
            <span style={{ color: LAVENDER }}>{angleDeg} deg</span>
          </label>
          <input
            type="range"
            min={0}
            max={180}
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseInt(e.target.value))}
            className="w-full mt-1 accent-accent-lav"
          />
          <div className="text-center font-hand text-sm mt-2" style={{ color: INK }}>
            Cluster separation:{" "}
            <span
              className="marker-highlight-yellow"
              style={{
                padding: "0 6px",
                color: sep > 20 ? MINT : sep > 10 ? CORAL : INK,
                fontWeight: 700,
              }}
            >
              {sep.toFixed(1)}
            </span>
            {sep > 22 && <span style={{ color: MINT }}> great angle!</span>}
          </div>
        </div>
      </div>

      <div className="card-sketchy p-3">
        <p
          className="font-hand text-xs font-bold text-center mb-2"
          style={{ color: INK }}
        >
          1D projection (each point's position along the chosen line)
        </p>
        <ScatterPlot
          data={oneDData}
          categoryColors={{
            A: "var(--accent-coral)",
            B: "var(--accent-sky)",
          }}
          xLabel="projection coordinate"
          yLabel=""
          height={160}
          pointRadius={7}
        />
      </div>

      <InfoBox variant="blue">
        This is the heart of <b>PCA</b> (Principal Component Analysis). PCA picks the
        angle automatically - the one that spreads the data out as much as possible.
        It's how a 1000-feature dataset becomes a viewable 2D plot.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Curse of Dimensions                                        */
/* ------------------------------------------------------------------ */
function CurseTab() {
  const [dims, setDims] = useState(2);
  const cellsNeeded = Math.pow(10, dims);

  const growthData = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        x: i + 1,
        y: Math.pow(10, i + 1),
      })),
    [],
  );

  return (
    <div className="space-y-4">
      <RikuSays>
        Each new dimension multiplies the empty space. Your data points stay the same
        size but the room they live in balloons. That's the curse.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Adding more features <b>sounds</b> good - until you realise empty space
        explodes faster than data can fill it.
      </p>

      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <LineChart
          series={[
            {
              name: "cells needed (10^d)",
              data: growthData,
              color: "var(--accent-coral)",
            },
          ]}
          smooth
          showArea
          xLabel="dimensions"
          yLabel="cells needed"
          title="Empty space vs. dimensions"
          height={240}
        />

        <div className="mt-3">
          <label
            className="font-hand font-bold text-sm flex justify-between"
            style={{ color: INK }}
          >
            <span>Number of dimensions</span>
            <span style={{ color: CORAL }}>{dims}</span>
          </label>
          <input
            type="range"
            min={1}
            max={8}
            value={dims}
            onChange={(e) => setDims(parseInt(e.target.value))}
            className="w-full mt-1 accent-accent-coral"
          />
          <div className="text-center font-hand mt-2" style={{ color: INK }}>
            {dims} dimensions = {" "}
            <b style={{ color: dims > 3 ? CORAL : MINT }}>
              {cellsNeeded.toLocaleString()}
            </b>{" "}
            cells to cover the space (10 per axis)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 font-hand text-xs">
        <div
          className="card-sketchy text-center p-2"
          style={{ background: "#e6fff8" }}
        >
          Few dims → easy to fill
        </div>
        <div
          className="card-sketchy text-center p-2"
          style={{ background: "#ffe8e8" }}
        >
          Many dims → mostly empty
        </div>
      </div>

      <InfoBox variant="amber">
        ML calls this the <b>curse of dimensionality</b>. With 100 features, you'd need
        more data points than atoms in the universe to fill the space. That's why we
        squish - to bring high-D data back into a learnable shape.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Compression slider + explained-variance curve              */
/* ------------------------------------------------------------------ */
function CompressionTab() {
  const [components, setComponents] = useState(8);

  // Fake but reasonable PCA-style explained variance: exponential decay summing to 1.
  const varianceTable = useMemo(() => {
    const raw = Array.from({ length: 16 }, (_, i) => Math.exp(-i * 0.55));
    const total = raw.reduce((a, b) => a + b, 0);
    return raw.map((v) => v / total);
  }, []);

  const cumulative = useMemo(() => {
    let acc = 0;
    return varianceTable.map((v) => {
      acc += v;
      return acc;
    });
  }, [varianceTable]);

  const variancePoints = useMemo(
    () =>
      cumulative.map((v, i) => ({
        x: i + 1,
        y: Number((v * 100).toFixed(1)),
      })),
    [cumulative],
  );

  const perComponentBars = useMemo(
    () =>
      varianceTable.slice(0, 12).map((v, i) => ({
        label: `PC${i + 1}`,
        value: Number((v * 100).toFixed(1)),
        color:
          i < components ? "var(--accent-coral)" : "var(--accent-sky)",
      })),
    [varianceTable, components],
  );

  const keptPct = (cumulative[Math.min(components - 1, cumulative.length - 1)] * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <RikuSays>
        JPEG, MP3, MP4: every compression format is the same trick. Keep the big waves,
        throw away the tiny wiggles. PCA does this for ML data, and the explained
        variance curve tells you how much you can safely ditch.
      </RikuSays>

      <p className="font-hand text-base text-center" style={{ color: INK }}>
        Squishing data is like compressing a song. With <b>fewer components</b>, you
        keep the shape but lose tiny details. Watch the explained-variance curve flatten
        out - that's the sweet spot.
      </p>

      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <LineChart
          series={[
            {
              name: "cumulative variance (%)",
              data: variancePoints,
              color: "var(--accent-mint)",
            },
          ]}
          smooth
          showArea
          xLabel="components kept"
          yLabel="variance explained (%)"
          title="Explained-variance curve"
          height={240}
        />

        <div className="mt-3">
          <label
            className="font-hand font-bold text-sm flex justify-between"
            style={{ color: INK }}
          >
            <span>Components to keep</span>
            <span style={{ color: CORAL }}>
              {components} → {keptPct}% of variance
            </span>
          </label>
          <input
            type="range"
            min={1}
            max={16}
            value={components}
            onChange={(e) => setComponents(parseInt(e.target.value))}
            className="w-full mt-1 accent-accent-coral"
          />
          <div
            className="flex justify-between font-hand text-xs mt-1"
            style={{ color: INK, opacity: 0.6 }}
          >
            <span>tiny file, blurry</span>
            <span>full size, perfect</span>
          </div>
        </div>
      </div>

      <div className="card-sketchy p-3">
        <BarChart
          data={perComponentBars}
          title="Variance per component (coral = kept)"
          yLabel="%"
          height={220}
        />
      </div>

      <InfoBox variant="green">
        JPEG, MP3, MP4 - every file format you know is built on this idea. Throw away
        tiny details, keep the big shape, save 95% of the space. Same thing PCA does for
        ML data.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Why do we use dimensionality reduction?",
    options: [
      "To make data prettier",
      "To squish many features down so we can see and learn from them",
      "To delete data",
      "To add features",
    ],
    correctIndex: 1,
    explanation:
      "Real datasets have hundreds or thousands of features. We squish them down so they're easier to visualize and easier for models to learn from.",
  },
  {
    question: "What is the 'curse of dimensionality'?",
    options: [
      "A spell on computers",
      "Empty space grows huge as you add features, leaving data sparse",
      "A bug in Python",
      "When models take too long",
    ],
    correctIndex: 1,
    explanation:
      "Each new dimension multiplies the volume of empty space. With many features, your data points become tiny dots in an enormous mostly-empty space.",
  },
  {
    question: "What does PCA try to find?",
    options: [
      "The cheapest features",
      "The directions that spread the data out the most",
      "The smallest values",
      "The labels",
    ],
    correctIndex: 1,
    explanation:
      "PCA picks the angles where your data varies the most - those carry the most information and are best for compression.",
  },
  {
    question: "What's the trade-off when keeping fewer components?",
    options: [
      "Smaller data, but lose fine details",
      "Bigger files",
      "More features",
      "Slower training",
    ],
    correctIndex: 0,
    explanation:
      "Fewer components = smaller, faster, cleaner - but you discard tiny details. Same trade-off as JPEG image quality.",
  },
];

export default function L5c_DimensionalityActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "squish",
        label: "Squish 2D -> 1D",
        icon: <Minimize2 className="w-4 h-4" />,
        content: <SquishTab />,
      },
      {
        id: "curse",
        label: "Curse of Dimensions",
        icon: <Layers className="w-4 h-4" />,
        content: <CurseTab />,
      },
      {
        id: "compress",
        label: "Compression",
        icon: <Eye className="w-4 h-4" />,
        content: <CompressionTab />,
      },
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
            "Byte: \"It IS cheating - beautifully. It's called PCA, and every data scientist on Earth uses it daily.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Dimensionality reduction takes data with many features and squishes it into fewer dimensions while keeping the important structure. PCA is the most famous method - it picks the angles that spread your data out the most, so you can visualize, compress, and learn from it."
        />
      }
    />
  );
}
