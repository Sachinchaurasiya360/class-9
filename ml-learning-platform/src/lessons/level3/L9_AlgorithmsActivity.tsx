"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Search, Wrench, Sparkles } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";
import {
  LinearRegressionViz,
  KNNViz,
  DecisionTreeViz,
  GradientDescentViz,
} from "../../components/viz/ml-algorithms";

/* ------------------------------------------------------------------ */
/*  Riku (red panda narrator)                                          */
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
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - Follow the Recipe (step-by-step procedure)                 */
/* ------------------------------------------------------------------ */

interface AlgorithmDef {
  name: string;
  data: number[];
  steps: string[];
}

const ALGORITHMS: AlgorithmDef[] = [
  {
    name: "Find the Biggest Number",
    data: [7, 3, 12, 5, 9],
    steps: [
      "Set first card (7) as biggest",
      "Compare 7 with 3 → 7 is bigger, keep 7",
      "Compare 7 with 12 → 12 is bigger, update biggest to 12",
      "Compare 12 with 5 → 12 is bigger, keep 12",
      "Compare 12 with 9 → 12 is bigger, keep 12",
    ],
  },
  {
    name: "Sort Three Numbers",
    data: [8, 2, 5],
    steps: [
      "Compare positions 1 and 2: 8 > 2, swap them → [2, 8, 5]",
      "Compare positions 2 and 3: 8 > 5, swap them → [2, 5, 8]",
      "Compare positions 1 and 2: 2 < 5, no swap needed → [2, 5, 8]",
      "No more swaps needed - list is sorted!",
    ],
  },
  {
    name: "Is it Even or Odd?",
    data: [17],
    steps: [
      "Take the number: 17",
      "Divide by 2: 17 / 2 = 8 remainder 1",
      "Check the remainder: remainder is 1",
      "Remainder is not 0, so 17 is ODD",
    ],
  },
];

function FollowRecipeTab() {
  const [algoIndex, setAlgoIndex] = useState(0);
  const [currentStep, setCurrentStep] = useState(-1);
  const [autoRunning, setAutoRunning] = useState(false);
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const algo = ALGORITHMS[algoIndex];
  const totalSteps = algo.steps.length;
  const isDone = currentStep >= totalSteps - 1;

  const handleSelectAlgo = useCallback((idx: number) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setAlgoIndex(idx);
    setCurrentStep(-1);
    setAutoRunning(false);
  }, []);

  const handleStep = useCallback(() => {
    if (autoRunning) return;
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  }, [autoRunning, totalSteps]);

  const handleReset = useCallback(() => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    setCurrentStep(-1);
    setAutoRunning(false);
  }, []);

  const handleAutoRun = useCallback(() => {
    if (autoRunning) {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      setAutoRunning(false);
      return;
    }
    setAutoRunning(true);
    setCurrentStep(-1);
  }, [autoRunning]);

  useEffect(() => {
    if (!autoRunning) return;
    if (currentStep >= totalSteps - 1) {
      setAutoRunning(false);
      return;
    }
    autoTimerRef.current = setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 1000);
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, [autoRunning, currentStep, totalSteps]);

  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4">
      <RikuSays>
        An algorithm is just a recipe with no vibes. Step 1, step 2, step 3,
        done. Pick a recipe below and walk through it one step at a time - no
        magic, just careful instructions.
      </RikuSays>

      {/* Algorithm selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {ALGORITHMS.map((a, i) => (
          <button
            key={a.name}
            onClick={() => {
              playClick();
              handleSelectAlgo(i);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              algoIndex === i
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {a.name}
          </button>
        ))}
      </div>

      {/* Data display */}
      <div className="card-sketchy notebook-grid p-4">
        <p className="font-hand text-xs font-bold uppercase tracking-wide mb-2 text-foreground/70">
          Input data
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {algo.data.map((num, i) => (
            <div
              key={i}
              className="w-14 h-14 rounded-xl border-2 border-foreground shadow-[2px_2px_0_#2b2a35] flex items-center justify-center font-hand text-2xl font-bold bg-background"
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Step list */}
      <div
        className="card-sketchy p-3 space-y-1.5"
        style={{ background: "#fffdf5" }}
      >
        <p className="font-hand text-xs font-bold uppercase tracking-wide mb-2 text-foreground/70">
          Algorithm steps
        </p>
        {algo.steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isCurrent = i === currentStep;
          return (
            <div
              key={i}
              className={`flex items-start gap-2 px-2 py-1.5 rounded-md font-hand text-xs transition-all duration-300 ${
                isCurrent
                  ? "border-2 border-foreground bg-accent-yellow font-bold"
                  : isCompleted
                    ? "font-bold text-foreground"
                    : "opacity-50"
              }`}
            >
              <span className="shrink-0 mt-0.5 w-5 text-center font-bold">
                {i + 1}.
              </span>
              <span>{step}</span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => {
            playPop();
            handleStep();
          }}
          disabled={isDone || autoRunning}
          className="btn-sketchy disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Step
        </button>
        <button
          onClick={() => {
            playClick();
            handleAutoRun();
          }}
          disabled={isDone && !autoRunning}
          className="btn-sketchy-outline disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {autoRunning ? "Stop" : "Auto-Run"}
        </button>
        <button
          onClick={() => {
            playClick();
            handleReset();
          }}
          className="btn-sketchy-outline"
        >
          Reset
        </button>
      </div>

      <RikuSays>
        Notice how you always get the same answer? That&apos;s the whole point
        of an algorithm - same input, same steps, same output. Every single
        time. Reliable as gravity.
      </RikuSays>

      <InfoBox variant="blue">
        An algorithm is like a recipe - a step-by-step procedure that always
        produces the correct result. If you follow it exactly, you get the
        answer every time!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Many Ways to Think (ML algorithms as strategies)           */
/* ------------------------------------------------------------------ */

type StrategyId = "regression" | "knn" | "tree" | "descent";

interface Strategy {
  id: StrategyId;
  label: string;
  tagline: string;
}

const STRATEGIES: Strategy[] = [
  {
    id: "regression",
    label: "Find the best line",
    tagline: "Linear regression - an algorithm that draws a line through points.",
  },
  {
    id: "knn",
    label: "Ask the neighbors",
    tagline: "K-Nearest Neighbors - an algorithm that copies whoever is closest.",
  },
  {
    id: "tree",
    label: "Play 20 questions",
    tagline:
      "Decision Tree - an algorithm that keeps asking yes/no questions until it's sure.",
  },
  {
    id: "descent",
    label: "Walk downhill",
    tagline:
      "Gradient Descent - an algorithm that tiptoes toward the lowest point of a loss surface.",
  },
];

function ManyWaysTab() {
  const [strategy, setStrategy] = useState<StrategyId>("regression");
  const current = STRATEGIES.find((s) => s.id === strategy)!;

  return (
    <div className="space-y-4">
      <RikuSays>
        Decision tree algorithm = 20 Questions. K-NN algorithm = check your
        neighbors. Regression algorithm = find the best line. Gradient descent
        = walk downhill with tiny steps. Each one is a different *way of
        thinking*. Pick a brain below!
      </RikuSays>

      {/* Strategy picker */}
      <div className="flex flex-wrap gap-2 justify-center">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              playClick();
              setStrategy(s.id);
            }}
            className={`px-3 py-1.5 rounded-lg font-hand text-xs font-bold border-2 border-foreground transition-all ${
              strategy === s.id
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-3 text-center">
        <p className="font-hand text-sm text-foreground">{current.tagline}</p>
      </div>

      <div className="card-sketchy notebook-grid p-4">
        {strategy === "regression" && <LinearRegressionViz showResiduals showMSE />}
        {strategy === "knn" && <KNNViz />}
        {strategy === "tree" && <DecisionTreeViz />}
        {strategy === "descent" && <GradientDescentViz />}
      </div>

      <RikuSays>
        {strategy === "regression" &&
          "Linear regression just keeps wiggling slope and intercept until the mistakes shrink. No neighbors, no questions - just math on the residuals."}
        {strategy === "knn" &&
          "K-NN doesn't 'learn' anything ahead of time. When a new point shows up, it literally looks at its K closest friends and copies the majority label. Low effort, high vibes."}
        {strategy === "tree" &&
          "A decision tree plays 20 Questions: 'Is X less than 50? Is Y greater than 30?' Each split carves the space into smaller boxes until every box has one label."}
        {strategy === "descent" &&
          "Gradient descent is the 'I'm lost in fog on a mountain' algorithm. It feels which way is downhill and takes a tiny step. Repeat until the bottom. That's how almost every modern ML model trains."}
      </RikuSays>

      <InfoBox variant="amber">
        Different algorithms can solve the same kind of problem in totally
        different ways. Choosing the right one is half the fun of ML - and the
        whole job of a data scientist.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Algorithms That Learn                                      */
/* ------------------------------------------------------------------ */

function AlgorithmsThatLearnTab() {
  return (
    <div className="space-y-4">
      <RikuSays>
        Here&apos;s the plot twist: an ML algorithm is still just a recipe. But
        instead of giving it the answer, you give it *examples* and it tweaks
        itself until its mistakes shrink. The recipe learns the recipe.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-4 space-y-3">
        <h3 className="font-hand text-base font-bold">
          A learning algorithm in action
        </h3>
        <p className="font-hand text-xs text-foreground/70">
          Press Fit and watch the line search for its best slope and intercept.
          The "algorithm" is: &quot;keep adjusting until the error is as small
          as possible&quot;.
        </p>
        <LinearRegressionViz showResiduals showMSE />
      </div>

      <RikuSays>
        Compare this to Tab 1&apos;s &quot;find the biggest number&quot;
        recipe. That one has a hard-coded answer. This one *discovers* an
        answer. Same idea - step-by-step instructions - just with a built-in
        &quot;oops-o-meter&quot; (the loss).
      </RikuSays>

      <div className="card-sketchy p-4 space-y-2">
        <h3 className="font-hand text-base font-bold flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          The recipe for a learning algorithm
        </h3>
        <ol className="list-decimal pl-5 space-y-1 font-hand text-sm text-foreground">
          <li>Start with a random guess (any line will do).</li>
          <li>Measure how wrong the guess is (the loss).</li>
          <li>Nudge the guess in a direction that shrinks the loss.</li>
          <li>Repeat until the loss stops going down.</li>
          <li>Done - that&apos;s a trained model.</li>
        </ol>
      </div>

      <InfoBox variant="green">
        Every ML model you&apos;ve ever heard of - from spam filters to image
        classifiers to ChatGPT - is running some version of this exact loop.
        Guess, measure, nudge, repeat. That&apos;s the whole field.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What makes something an algorithm?",
    options: [
      "It uses a computer",
      "It is a step-by-step procedure with a clear beginning and end",
      "It is very fast",
      "It involves numbers only",
    ],
    correctIndex: 1,
    explanation:
      "An algorithm is a finite, step-by-step procedure that takes input and produces output. It doesn't even need a computer - a cooking recipe is an algorithm!",
  },
  {
    question:
      "For a sorted list of 1000 numbers, about how many steps does binary search need at most?",
    options: ["1000", "500", "100", "10"],
    correctIndex: 3,
    explanation:
      "Binary search eliminates half the remaining options each step: 1000 → 500 → 250 → 125 → 63 → 32 → 16 → 8 → 4 → 2 → 1. That's about 10 steps (log₂ of 1000).",
  },
  {
    question: "Can two different algorithms solve the same problem?",
    options: [
      "No, there's only one way",
      "Yes, but they might take different numbers of steps",
      "Only if they're written in the same programming language",
      "Only if the problem is easy",
    ],
    correctIndex: 1,
    explanation:
      "Many algorithms can solve the same problem. For example, bubble sort and selection sort both sort data, but they work differently and may take different numbers of steps.",
  },
  {
    question: "Why is binary search faster than linear search?",
    options: [
      "It skips every other element",
      "It eliminates half the remaining options each step",
      "It's always faster",
      "It doesn't need sorted data",
    ],
    correctIndex: 1,
    explanation:
      "Binary search works by checking the middle element and eliminating the half that can't contain the target. Each step cuts the search space in half!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function L9_AlgorithmsActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "follow-recipe",
        label: "Follow the Recipe",
        icon: <BookOpen className="w-4 h-4" />,
        content: <FollowRecipeTab />,
      },
      {
        id: "many-ways",
        label: "Many Ways to Think",
        icon: <Search className="w-4 h-4" />,
        content: <ManyWaysTab />,
      },
      {
        id: "algorithms-learn",
        label: "Algorithms That Learn",
        icon: <Wrench className="w-4 h-4" />,
        content: <AlgorithmsThatLearnTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="What Is an Algorithm?"
      level={3}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now you know what an algorithm is. So here's the big question: can we make an algorithm that LEARNS? That's exactly what the next lesson is about!"
      story={
        <StorySection
          paragraphs={[
            "Aru was frantic. Her dog, Biscuit, had escaped from the yard and could be anywhere in the neighborhood.",
            "Aru: \"I need to find Biscuit! Should I run around randomly?\"",
            "Byte: \"Stop! Let's think step by step. First, check the places Biscuit goes most often - the park, the neighbor's yard, the bakery. Then expand your search outward. That's an algorithm - a step-by-step plan to solve a problem.\"",
            "Aru: \"So an algorithm is just... a plan?\"",
            "Byte: \"A very precise plan! One where every step is clear, the order matters, and you always reach the answer. Recipes, GPS directions, even your morning routine - they're all algorithms. And some algorithms are much faster than others!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="An algorithm is a step-by-step procedure with a clear beginning and end that solves a problem. The same algorithm always produces the same result for the same input. Different algorithms can solve the same problem, but some take fewer steps than others - finding efficient algorithms is at the heart of computer science."
        />
      }
    />
  );
}
