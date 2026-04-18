"use client";

import { useMemo } from "react";
import { GitBranch, TreePine, SlidersHorizontal } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  DecisionTreeViz,
  RandomForestViz,
  generateClassification2D,
  generateMoons,
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
/*  Tab 1  Build a Decision Tree (interactive depth slider)           */
/* ------------------------------------------------------------------ */

function BuildADecisionTree() {
  // Stable default dataset - two well-separated blobs so axis-aligned
  // splits look clean at low depth.
  const data = useMemo(() => generateClassification2D(48, 17), []);

  return (
    <div className="space-y-5">
      <RikuSays>
        Decision trees are just 20 Questions with extra steps. &ldquo;Is
        feature-1 &gt; 50?&rdquo; &ldquo;Is feature-2 &lt; 30?&rdquo; Keep
        asking yes/no questions until every group is pure. That&apos;s it.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Slide the depth to watch the tree carve the plane into boxes
        </h3>
        <DecisionTreeViz data={data} maxDepth={6} />
      </div>

      <RikuSays>
        Notice how every split is a straight vertical or horizontal line?
        That&apos;s an &ldquo;axis-aligned&rdquo; split - trees only ever cut
        one feature at a time. Simple, but surprisingly powerful.
      </RikuSays>

      <InfoBox variant="blue" title="How Decision Trees Split">
        A decision tree picks the feature that best separates the data at each
        step. The goal is to create groups (leaves) where most items belong to
        the same class. This process is called <strong>splitting</strong>.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Tree Visualization (where axis-aligned splits struggle)    */
/* ------------------------------------------------------------------ */

function TreeVisualization() {
  // Moons are interlocking crescents - the tree has to stair-step to fit,
  // which visually teaches the limitation of axis-aligned splits.
  const data = useMemo(() => generateMoons(70, 23), []);

  return (
    <div className="space-y-5">
      <RikuSays>
        Here&apos;s a trickier dataset - two interlocking crescents. Watch what
        happens as you crank the depth. The tree builds a little staircase of
        splits trying to follow the curves.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Curved data meets straight-line splits - let&apos;s see who wins
        </h3>
        <DecisionTreeViz data={data} maxDepth={6} />
      </div>

      <RikuSays>
        A shallow tree makes big mistakes on the curves. A deep tree fits every
        wiggle - but that&apos;s not always what you want. (Keep that in mind
        for the next tab.)
      </RikuSays>

      <InfoBox variant="green" title="Tree Structure">
        A decision tree has <strong>internal nodes</strong> (questions),{" "}
        <strong>branches</strong> (yes/no answers), and{" "}
        <strong>leaf nodes</strong> (final predictions). Data flows from the
        root down through questions until it reaches a leaf.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Depth vs Accuracy (+ forest foreshadow)                    */
/* ------------------------------------------------------------------ */

function DepthVsAccuracy() {
  // Noisier classification - cranking depth quickly shows overfitting.
  const data = useMemo(() => generateClassification2D(60, 7), []);
  const forestData = useMemo(() => generateClassification2D(50, 29), []);

  return (
    <div className="space-y-5">
      <RikuSays>
        This is the classic overfitting demo. Start at depth 1 - too simple
        (underfit). Slide to the max - the tree carves the plane into tiny
        boxes around every individual point. That&apos;s memorization, not
        learning.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Adjust tree depth and see how the decision boundary changes
        </h3>
        <DecisionTreeViz data={data} maxDepth={6} />
      </div>

      <RikuSays>
        The sweet spot is usually in the middle - deep enough to capture the
        real pattern, shallow enough to ignore the noise. Goldilocks would love
        ML.
      </RikuSays>

      <InfoBox variant="amber" title="Underfitting vs Overfitting">
        A <strong>shallow tree</strong> (low depth) might be too simple - it
        underfits, missing important patterns. A <strong>deep tree</strong>{" "}
        (high depth) can memorize noise - it overfits. The sweet spot is a tree
        that captures the real pattern without being overly complex.
      </InfoBox>

      {/* Foreshadow: many trees = forest */}
      <RikuSays>
        Sneak peek! One grumpy, overfitted tree is sad. But grow a whole bunch
        of slightly-different trees and let them vote? That&apos;s a{" "}
        <strong>random forest</strong>, and it&apos;s surprisingly hard to
        beat.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-4">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Preview: many trees voting together (click the big plot to test)
        </h3>
        <RandomForestViz data={forestData} numTrees={5} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What does a decision tree use to make predictions?",
    options: [
      "Random guessing",
      "A series of yes/no questions",
      "The average of all data points",
      "Only the most recent data point",
    ],
    correctIndex: 1,
    explanation:
      "A decision tree makes predictions by asking a series of yes/no questions about the features, following branches until reaching a leaf node with the answer.",
  },
  {
    question: "What is a 'leaf node' in a decision tree?",
    options: [
      "A node that asks a question",
      "The root of the tree",
      "A final prediction/answer",
      "An unused feature",
    ],
    correctIndex: 2,
    explanation:
      "Leaf nodes are the endpoints of the tree  they contain the final prediction or classification, with no further questions to ask.",
  },
  {
    question: "What happens when a decision tree is too deep?",
    options: [
      "It becomes faster",
      "It underfits the data",
      "It overfits  memorizing noise instead of learning patterns",
      "It stops working completely",
    ],
    correctIndex: 2,
    explanation:
      "An overly deep tree creates too many specific rules that fit the training data perfectly but fail on new data  this is overfitting.",
  },
  {
    question: "How does a decision tree choose which feature to split on?",
    options: [
      "It always picks the first feature",
      "Random selection",
      "It picks the feature that best separates the classes",
      "It uses all features at once",
    ],
    correctIndex: 2,
    explanation:
      "The algorithm evaluates each feature and picks the one that creates the most pure/separated groups  this gives the most informative split.",
  },
  {
    question: "What is 'underfitting'?",
    options: [
      "The model is too complex",
      "The model is too simple and misses important patterns",
      "The model has too much data",
      "The model trains too slowly",
    ],
    correctIndex: 1,
    explanation:
      "Underfitting happens when the model is too simple to capture the underlying patterns in the data, resulting in poor predictions on both training and test data.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L13_DecisionTreesActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "build",
        label: "Build a Decision Tree",
        icon: <GitBranch className="w-4 h-4" />,
        content: <BuildADecisionTree />,
      },
      {
        id: "visualize",
        label: "Tree Visualization",
        icon: <TreePine className="w-4 h-4" />,
        content: <TreeVisualization />,
      },
      {
        id: "depth",
        label: "Depth vs Accuracy",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <DepthVsAccuracy />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Decision Trees"
      level={4}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn how to measure if your ML model is actually good!"
      story={
        <StorySection
          paragraphs={[
            "Aru was staring at her closet, overwhelmed by choices for what to wear today.",
            "Byte: Let me help! Is it raining outside?",
            "Aru: Yes, it's drizzling.",
            "Byte: Then take an umbrella. Now, is it cold?",
            "Aru: Not really, just a bit cool.",
            "Byte: Then wear a light jacket. See what I just did? I asked a series of yes/no questions, and each answer led us closer to the right choice. That's a decision tree!",
            "Aru: So a decision tree is like a flowchart for making decisions?",
            "Byte: Exactly! And computers can build these trees automatically by finding the best questions to ask at each step.",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A decision tree makes predictions by asking a series of yes/no questions about the data features. Each question splits the data into groups, and the process repeats until we reach a final answer. The order and choice of questions determine how accurate the tree is."
        />
      }
    />
  );
}
