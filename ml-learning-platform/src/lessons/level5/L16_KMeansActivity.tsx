"use client";

import { useMemo, useState } from "react";
import { MousePointer, Play, Columns } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  KMeansViz,
  generateClusters,
  generateMoons,
  generateCircularData,
  type Point,
} from "../../components/viz/ml-algorithms";
import { playPop } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Riku dialogue helper                                               */
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
/*  Tab 1 - Watch It Work                                              */
/* ------------------------------------------------------------------ */
function WatchItWorkTab() {
  const blobs = useMemo<Point[]>(() => generateClusters(3, 18, 42), []);

  return (
    <div className="space-y-4">
      <RikuSays>
        K-means is the &ldquo;birds of a feather flock together&rdquo;
        algorithm. Literally. It keeps nudging each flock-center toward its own
        birds until nobody wants to switch flocks anymore.
      </RikuSays>

      <KMeansViz points={blobs} initialK={3} />

      <RikuSays>
        Hit Play and just watch. Notice how the centroid crosses slide toward
        the middle of their group on every step &mdash; that&rsquo;s the
        &ldquo;means&rdquo; part of K-means doing its thing.
      </RikuSays>

      <InfoBox variant="blue" title="The K-Means Loop">
        1. Drop K centroids randomly. 2. Paint each point the color of its
        nearest centroid. 3. Move each centroid to the average of its points.
        4. Repeat until nothing changes.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Step Through                                               */
/* ------------------------------------------------------------------ */
function StepThroughTab() {
  // Different seed so students see a fresh configuration on tab 2.
  const blobs = useMemo<Point[]>(() => generateClusters(3, 16, 11), []);

  return (
    <div className="space-y-4">
      <RikuSays>
        Same algorithm &mdash; but this time press <strong>Step</strong>{" "}
        instead of Play so you can see exactly what happens each iteration.
        Slow motion mode.
      </RikuSays>

      <KMeansViz points={blobs} initialK={3} />

      <RikuSays>
        One click = one round of &ldquo;assign everyone, then move the
        centers&rdquo;. Try hitting Reset a few times too &mdash; different
        starting spots can lead to slightly different endings!
      </RikuSays>

      <InfoBox variant="amber" title="Convergence">
        When the Step button stops making the centroids move, the algorithm
        has <strong>converged</strong>. That means the assignments stopped
        changing &mdash; K-means is done.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - On Different Shapes                                        */
/* ------------------------------------------------------------------ */
type ShapeKind = "blobs" | "moons" | "circles";

const SHAPE_OPTIONS: {
  id: ShapeKind;
  label: string;
  desc: string;
}[] = [
  { id: "blobs", label: "Round Blobs", desc: "K-means' happy place" },
  { id: "moons", label: "Two Moons", desc: "Interlocking crescents" },
  { id: "circles", label: "Rings", desc: "One circle inside another" },
];

function DifferentShapesTab() {
  const [shape, setShape] = useState<ShapeKind>("blobs");

  const points = useMemo<Point[]>(() => {
    switch (shape) {
      case "moons":
        return generateMoons(60, 31);
      case "circles":
        return generateCircularData(60, 23);
      case "blobs":
      default:
        return generateClusters(3, 18, 42);
    }
  }, [shape]);

  // Moons and circles are 2-class datasets, so start K-means with k=2 there.
  const initialK = shape === "blobs" ? 3 : 2;

  return (
    <div className="space-y-4">
      <RikuSays>
        K-means assumes your clusters are round-ish. Give it crescents or
        rings and it panics a little. Let&rsquo;s watch it struggle on
        purpose.
      </RikuSays>

      <div className="flex gap-2 justify-center flex-wrap">
        {SHAPE_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => {
              playPop();
              setShape(opt.id);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              shape === opt.id
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
            title={opt.desc}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <p className="font-hand text-sm text-center text-foreground">
        {SHAPE_OPTIONS.find((o) => o.id === shape)?.desc}
      </p>

      <KMeansViz
        key={shape}
        points={points}
        initialK={initialK}
      />

      <RikuSays>
        {shape === "blobs"
          ? "Round blobs = easy mode. Clean split, everyone goes home happy."
          : shape === "moons"
            ? "See how the moons get chopped straight through the middle? K-means draws straight-line-ish boundaries, so crescents confuse it."
            : "The inner ring and outer ring get cut like a pie instead of separated like rings. K-means just can't see circular structure."}
      </RikuSays>

      <InfoBox variant="green" title="Know the limits">
        K-means is fast and simple, but it assumes clusters are roughly round
        and similarly sized. For weird shapes, other algorithms (like DBSCAN
        or spectral clustering) do better. Every tool has a job it&rsquo;s
        good at.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is K in K-Means?",
    options: [
      "The number of data points",
      "The number of clusters to find",
      "The number of iterations",
      "The size of the dataset",
    ],
    correctIndex: 1,
    explanation: "K is the number of clusters (groups) you want the algorithm to find.",
  },
  {
    question: "What happens in the 'assign' step?",
    options: [
      "Centroids are moved",
      "Each point is colored by its nearest centroid",
      "New centroids are added",
      "Points are removed",
    ],
    correctIndex: 1,
    explanation:
      "In the assign step, each data point is assigned to the nearest centroid, forming clusters.",
  },
  {
    question: "What happens in the 'update' step?",
    options: [
      "Points move closer together",
      "Centroids move to the center of their cluster",
      "K is changed",
      "The data is reshuffled",
    ],
    correctIndex: 1,
    explanation:
      "Each centroid moves to the average (mean) position of all points assigned to it.",
  },
  {
    question: "When does K-Means stop?",
    options: [
      "After exactly 10 iterations",
      "When inertia reaches zero",
      "When assignments stop changing",
      "When all points are in one cluster",
    ],
    correctIndex: 2,
    explanation:
      "K-Means converges when the assign step produces the same clusters as the previous iteration - nothing changes anymore.",
  },
  {
    question: "Why is K-Means called K-'Means'?",
    options: [
      "It means average K times",
      "Centroids move to the mean of their cluster",
      "K is the mean of all data",
      "It was named after a scientist named Means",
    ],
    correctIndex: 1,
    explanation:
      "The 'Means' in K-Means refers to the centroids being moved to the mean (average) position of their assigned points.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L16_KMeansActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "watch",
        label: "Watch It Work",
        icon: <Play className="w-4 h-4" />,
        content: <WatchItWorkTab />,
      },
      {
        id: "step",
        label: "Step Through",
        icon: <MousePointer className="w-4 h-4" />,
        content: <StepThroughTab />,
      },
      {
        id: "shapes",
        label: "On Different Shapes",
        icon: <Columns className="w-4 h-4" />,
        content: <DifferentShapesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="K-Means Clustering"
      level={5}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: How do you choose the right K? The Elbow Method!"
      story={
        <StorySection
          paragraphs={[
            "Aru had 30 colorful marbles scattered across the floor. Some were close together, others far apart.",
            "Aru: \"Byte, I want to sort these into groups. But how do I know which go together?\"",
            "Byte: \"Let me show you how I'd sort them into groups. I pick K center points, assign each marble to the nearest center, then move the centers to the middle of their groups. Repeat until stable!\"",
            "Aru: \"That's like magic - the centers just... find the right spots?\"",
            "Byte: \"It's not magic - it's math! Each step makes the groups a little tighter. That's K-Means clustering.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="K-Means clustering works in two alternating steps: (1) assign each point to the nearest centroid, and (2) move each centroid to the mean of its assigned points. Repeat until the assignments stop changing."
        />
      }
    />
  );
}
