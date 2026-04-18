"use client";

import { useMemo } from "react";
import { Target, SlidersHorizontal, Ruler } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { KNNViz } from "../../components/viz/ml-algorithms";

/* ------------------------------------------------------------------ */
/*  Riku mascot helper                                                 */
/* ------------------------------------------------------------------ */

function RikuSays({ children }: { children: React.ReactNode }) {
  return (
    <div className="card-sketchy p-3 flex gap-3 items-start" style={{ background: "#fff8e7" }}>
      <span className="text-2xl" aria-hidden>🐼</span>
      <p className="font-hand text-sm text-foreground leading-snug">{children}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Find the Neighbors                                        */
/* ------------------------------------------------------------------ */

function FindTheNeighbors() {
  return (
    <div className="space-y-5">
      <RikuSays>
        KNN is basically &quot;tell me who your neighbors are and I&apos;ll tell you who you are.&quot; Drop a point and watch it take a majority vote.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-3">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Click anywhere on the plot to place a test point. KNN will find its K closest neighbors and classify it.
        </h3>
        <KNNViz initialK={3} />
      </div>

      <RikuSays>
        Notice the dashed circle? That&apos;s the reach of your K nearest neighbors. Inside the circle = they get a vote. Outside = ignored.
      </RikuSays>

      <InfoBox variant="blue" title="How KNN Works">
        K-Nearest Neighbors looks at the <strong>K closest data points</strong> to a new point. Whatever class most of those neighbors belong to, that&apos;s the prediction! It&apos;s like asking your nearest friends for advice.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  K Changes Everything                                       */
/* ------------------------------------------------------------------ */

function KChangesEverything() {
  return (
    <div className="space-y-5">
      <RikuSays>
        Pick K = 1 and you trust literally one neighbor. Bold move. Often wrong. Try clicking around and bumping K up and down - the classification can flip!
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-3">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          Same data, same test point - just change K. Start with K = 1 and drag the slider all the way up.
        </h3>
        <KNNViz initialK={1} />
      </div>

      <RikuSays>
        Rule of thumb: odd K so you can&apos;t tie. Small K = sensitive and jagged. Large K = smooth but lazy. The sweet spot is somewhere in the middle.
      </RikuSays>

      <InfoBox variant="amber" title="Choosing K">
        A <strong>small K</strong> (like 1) is sensitive to noise  one odd neighbor changes everything. A <strong>large K</strong> is more stable but might include points from far away. Finding the right K is key to good KNN performance!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3  Distance Matters                                           */
/* ------------------------------------------------------------------ */

function DistanceMatters() {
  return (
    <div className="space-y-5">
      <RikuSays>
        Euclidean = straight-line crow flight. Manhattan = grid walk, like counting city blocks. Different rulers can pick different &quot;nearest&quot; neighbors for the exact same point.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-5 space-y-3">
        <h3 className="font-hand text-sm font-bold text-foreground text-center">
          This plot starts in Manhattan mode. Click a test point, then switch the distance metric to Euclidean and watch the neighbor ring reshape.
        </h3>
        <KNNViz initialK={5} initialMetric="manhattan" />
      </div>

      <RikuSays>
        Fun fact: in high-dimensional spaces, the choice of distance metric matters way more than it does in these friendly 2D toy plots. Welcome to the &quot;curse of dimensionality&quot; - a future lesson problem.
      </RikuSays>

      <InfoBox variant="indigo" title="Distance Metrics">
        <strong>Euclidean distance</strong> is the straight-line distance (as the crow flies). <strong>Manhattan distance</strong> follows a grid path (like walking city blocks). Different metrics can find different neighbors, leading to different predictions!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "In KNN, what does 'K' represent?",
    options: [
      "The number of features in the data",
      "The number of nearest neighbors to consider",
      "The total number of data points",
      "The number of classes",
    ],
    correctIndex: 1,
    explanation: "K is the number of closest data points (neighbors) the algorithm looks at to make its prediction through majority voting.",
  },
  {
    question: "If K=5 and 3 neighbors are blue while 2 are red, what does KNN predict?",
    options: ["Red", "Blue", "Green", "It cannot decide"],
    correctIndex: 1,
    explanation: "KNN uses majority voting. Since 3 out of 5 neighbors are blue, the prediction is blue.",
  },
  {
    question: "Why might K=1 be a bad choice?",
    options: [
      "It's too slow",
      "It considers too many neighbors",
      "A single noisy point can cause a wrong prediction",
      "It always picks the farthest point",
    ],
    correctIndex: 2,
    explanation: "With K=1, the prediction depends on just one neighbor. If that single neighbor is an outlier or noisy, the prediction will be wrong.",
  },
  {
    question: "What is the main difference between Euclidean and Manhattan distance?",
    options: [
      "Euclidean is faster to compute",
      "Manhattan only works in 2D",
      "Euclidean measures straight-line distance while Manhattan follows grid paths",
      "They always give the same result",
    ],
    correctIndex: 2,
    explanation: "Euclidean distance is the straight-line (diagonal) distance between two points. Manhattan distance is the sum of horizontal and vertical steps, like walking city blocks.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L12_KNNActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "find",
        label: "Find the Neighbors",
        icon: <Target className="w-4 h-4" />,
        content: <FindTheNeighbors />,
      },
      {
        id: "kchange",
        label: "K Changes Everything",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <KChangesEverything />,
      },
      {
        id: "distance",
        label: "Distance Matters",
        icon: <Ruler className="w-4 h-4" />,
        content: <DistanceMatters />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="K-Nearest Neighbors"
      level={4}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover how Decision Trees make choices step by step!"
      story={
        <StorySection
          paragraphs={[
            "Aru just moved to a new school and was wondering which friend group she would fit into.",
            "Byte: To figure out which group you'd fit in, look at the K closest kids to you  the ones sitting nearest in the cafeteria, or who share your interests.",
            "Aru: So if most of the kids near me like art, I'd probably like art too?",
            "Byte: Exactly! Whatever most of your nearest neighbors like, you'll probably like too. That's KNN  K-Nearest Neighbors. You look at K nearby examples and go with the majority vote!",
            "Aru: What if I pick too many neighbors? Like, everyone in the whole school?",
            "Byte: Then you'd just go with whatever's most popular overall  you'd lose the local flavor. That's why choosing the right K matters!",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="K-Nearest Neighbors (KNN) classifies a new data point by finding the K closest existing data points and using majority voting. The choice of K and the distance metric (how we measure 'closest') both affect the result."
        />
      }
    />
  );
}
