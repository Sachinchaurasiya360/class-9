"use client";

import { useMemo, useState } from "react";
import { Layers, ToggleLeft, LayoutGrid } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { ScatterPlot } from "../../components/viz/data-viz";
import type { DataPoint } from "../../components/viz/data-viz/types";
import {
  KMeansViz,
  generateClusters,
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
/*  Shared dataset - 3 well-separated blobs used for the concept tab    */
/* ------------------------------------------------------------------ */
const CONCEPT_BLOBS: Point[] = generateClusters(3, 14, 7);
const CATEGORY_NAMES = ["Cat", "Dog", "Bird"];

function toUnlabeledScatter(points: Point[]): DataPoint[] {
  return points.map((p) => ({
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    color: "#9ca3af",
  }));
}

function toLabeledScatter(points: Point[]): DataPoint[] {
  return points.map((p) => ({
    x: Math.round(p.x * 10) / 10,
    y: Math.round(p.y * 10) / 10,
    category: CATEGORY_NAMES[(p.label ?? 0) % CATEGORY_NAMES.length],
  }));
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - Concept: supervised vs unsupervised                        */
/* ------------------------------------------------------------------ */
function ConceptTab() {
  const [mode, setMode] = useState<"unlabeled" | "labeled">("unlabeled");

  const unlabeled = useMemo(() => toUnlabeledScatter(CONCEPT_BLOBS), []);
  const labeled = useMemo(() => toLabeledScatter(CONCEPT_BLOBS), []);

  return (
    <div className="space-y-4">
      <RikuSays>
        Unsupervised learning = &ldquo;here&rsquo;s a pile of stuff, figure it
        out yourself&rdquo;. No answer key, no teacher &mdash; just patterns
        waiting to be noticed.
      </RikuSays>

      <div className="flex gap-2 justify-center">
        {(
          [
            { id: "unlabeled", label: "Unlabeled (no answer key)" },
            { id: "labeled", label: "Labeled (with answer key)" },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => {
              playPop();
              setMode(m.id);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              mode === m.id
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-3">
        <ScatterPlot
          data={mode === "unlabeled" ? unlabeled : labeled}
          width={520}
          height={320}
          title={
            mode === "unlabeled"
              ? "Unlabeled data - just dots, no categories"
              : "Labeled data - every dot has a name"
          }
          xLabel="Feature 1"
          yLabel="Feature 2"
          pointRadius={7}
        />
      </div>

      <RikuSays>
        Same dots, two different worlds. Supervised learning needs the colored
        version (someone labelled each point). Unsupervised only gets the grey
        version &mdash; and still has to find the groups.
      </RikuSays>

      <InfoBox variant="indigo" title="Key Difference">
        <strong>Supervised:</strong> data comes with labels (e.g.,
        &ldquo;cat&rdquo;, &ldquo;dog&rdquo;). The model learns the mapping from
        features to labels.
        <br />
        <strong>Unsupervised:</strong> no labels! The model discovers hidden
        structure &mdash; natural groups, outliers, themes &mdash; on its own.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Real-world examples                                        */
/* ------------------------------------------------------------------ */
interface ExampleCard {
  title: string;
  desc: string;
  detail: string;
}

const EXAMPLES: ExampleCard[] = [
  {
    title: "Customer Segmentation",
    desc: "Group shoppers by buying habits",
    detail:
      "Stores cluster customers into groups like 'bargain hunters' and 'premium buyers' to target ads better.",
  },
  {
    title: "Topic Discovery",
    desc: "Find themes in news articles",
    detail:
      "Algorithms scan thousands of articles and group similar ones, discovering topics like sports, politics, and tech automatically.",
  },
  {
    title: "Anomaly Detection",
    desc: "Spot unusual bank transactions",
    detail:
      "Most transactions cluster together. A fraudulent charge looks different and falls outside any cluster, flagging it as suspicious.",
  },
  {
    title: "Image Compression",
    desc: "Reduce colors in a photo",
    detail:
      "K-Means groups similar pixel colors and replaces each with the cluster center, compressing the image while keeping it recognizable.",
  },
];

function ExamplesTab() {
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <RikuSays>
        Nobody labels every customer as &ldquo;bargain hunter&rdquo; &mdash;
        that label doesn&rsquo;t even exist until unsupervised learning invents
        it. It&rsquo;s pattern archaeology.
      </RikuSays>

      <p className="font-hand text-sm text-center text-foreground">
        Click a card to learn how unsupervised learning is used in the real
        world.
      </p>

      <div className="grid grid-cols-2 gap-3">
        {EXAMPLES.map((ex, i) => {
          const isOpen = selected === i;
          return (
            <div
              key={ex.title}
              onClick={() => {
                playPop();
                setSelected(isOpen ? null : i);
              }}
              className={`card-sketchy p-3 cursor-pointer transition-all ${
                isOpen
                  ? "bg-accent-yellow/30"
                  : "hover:bg-accent-mint/20"
              }`}
            >
              <h4 className="font-hand text-base font-bold text-foreground">
                {ex.title}
              </h4>
              <p className="font-hand text-xs text-muted-foreground mt-0.5">
                {ex.desc}
              </p>
              {isOpen && (
                <p className="mt-2 font-hand text-xs text-foreground leading-relaxed">
                  {ex.detail}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <InfoBox variant="green" title="Everywhere!">
        Unsupervised learning is used wherever we have data but no labels
        &mdash; from healthcare to social media. It helps find hidden structure
        we didn&rsquo;t even know existed.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Interactive: watch clusters emerge without labels          */
/* ------------------------------------------------------------------ */
function TryItTab() {
  const playgroundPoints = useMemo(() => generateClusters(3, 18, 42), []);

  return (
    <div className="space-y-4">
      <RikuSays>
        The &ldquo;aha&rdquo; moment: the algorithm gets grey dots. No labels.
        Press Play and watch it invent the groups all by itself.
      </RikuSays>

      <KMeansViz points={playgroundPoints} initialK={3} />

      <RikuSays>
        Centroids are just &ldquo;guessed group centers&rdquo;. They keep
        sliding to the middle of their own flock until everything clicks into
        place. That sliding-until-settled dance is the whole trick.
      </RikuSays>

      <InfoBox variant="blue" title="No Labels Needed">
        K-Means received no labels &mdash; only point positions. The groups
        that emerge are discovered, not taught. That&rsquo;s the magic of
        unsupervised learning.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What makes unsupervised learning different from supervised learning?",
    options: [
      "It uses more data",
      "The data has no labels",
      "It runs faster",
      "It needs a teacher",
    ],
    correctIndex: 1,
    explanation:
      "In unsupervised learning, the data comes without labels. The algorithm must discover patterns on its own.",
  },
  {
    question: "What does an unsupervised algorithm try to find?",
    options: [
      "The correct answer",
      "Hidden patterns or groups",
      "The fastest calculation",
      "The biggest number",
    ],
    correctIndex: 1,
    explanation:
      "Unsupervised algorithms look for natural groups, patterns, or structure in unlabeled data.",
  },
  {
    question: "Which is a real-world use of unsupervised learning?",
    options: [
      "Predicting tomorrow's weather",
      "Grouping customers by behavior",
      "Translating English to French",
      "Recognizing a stop sign",
    ],
    correctIndex: 1,
    explanation:
      "Customer segmentation groups people by purchasing behavior without pre-defined labels - a classic unsupervised task.",
  },
  {
    question: "In unsupervised learning, who decides the group names?",
    options: [
      "The computer before it starts",
      "The data itself",
      "We do, after seeing the groups",
      "The training labels",
    ],
    correctIndex: 2,
    explanation:
      "The algorithm finds the groups, but we humans look at the results and give them meaningful names afterward.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L15_UnsupervisedLearningActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "concept",
        label: "Supervised vs Unsupervised",
        icon: <ToggleLeft className="w-4 h-4" />,
        content: <ConceptTab />,
      },
      {
        id: "examples",
        label: "Real-World Examples",
        icon: <LayoutGrid className="w-4 h-4" />,
        content: <ExamplesTab />,
      },
      {
        id: "tryit",
        label: "Try It Yourself",
        icon: <Layers className="w-4 h-4" />,
        content: <TryItTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is Unsupervised Learning?"
      level={5}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn K-Means - the most popular clustering algorithm!"
      story={
        <StorySection
          paragraphs={[
            "Aru dumped a big box of mixed buttons onto the kitchen table. There were red ones, blue ones, big ones, tiny ones - all jumbled up.",
            "Aru: \"Byte, can you sort these for me? I don't even know what the categories should be!\"",
            "Byte: \"I have no labels for these, but I can see some look similar - same color, same size. I can GROUP them without anyone telling me the categories. That's unsupervised learning!\"",
            "Aru: \"So you just... figure out the groups yourself?\"",
            "Byte: \"Exactly! I look at how similar things are and put alike items together. No teacher needed - just patterns in the data.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Unsupervised learning finds hidden patterns in data that has no labels. Instead of being told the answer, the algorithm discovers natural groups and structures all on its own."
        />
      }
    />
  );
}
