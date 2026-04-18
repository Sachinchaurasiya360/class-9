"use client";

import { useMemo } from "react";
import { ArrowDown, Gauge, Map } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { GradientDescentViz } from "../../components/viz/ml-algorithms";
import { LossLandscape } from "../../components/viz/neural-network";
import { LineChart } from "../../components/viz/data-viz";

/* ------------------------------------------------------------------ */
/*  Riku says - local dialogue helper                                  */
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
/*  Loss surface presets for GradientDescentViz / LossLandscape        */
/* ------------------------------------------------------------------ */

/** Simple symmetric bowl on [0,100]² - gentle, classic descent. */
function bowlLoss(w: number, b: number): number {
  const dw = (w - 50) / 22;
  const db = (b - 50) / 22;
  return dw * dw + db * db;
}

/** Skewed, stretched bowl - shows zig-zag descent. */
function skewedLoss(w: number, b: number): number {
  const dw = (w - 55) / 14;
  const db = (b - 48) / 30;
  return dw * dw + db * db + 0.6 * dw * db;
}

/** Saddle-ish double well on [-3.5, 3.5]² for LossLandscape. */
function doubleWellLoss(x: number, y: number): number {
  return (x * x - 1) * (x * x - 1) + y * y;
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - Why We Need Gradients (1D intro)                           */
/* ------------------------------------------------------------------ */
function RollDownTab() {
  // Sample a smooth 1D loss curve with a single minimum near x = 0.6.
  const curveSeries = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 60; i++) {
      const x = i / 60;
      const t = x - 0.6;
      const y = 2.5 * t * t * t * t - 1.2 * t * t + 0.5 * t + 1.0;
      pts.push({ x, y });
    }
    return [{ name: "Loss", data: pts, color: "var(--accent-coral)" }];
  }, []);

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Before we descend on a full 2D surface, let&apos;s look at a simpler
        1D loss curve. The bottom of this curve is where our model gets its
        answer right.
      </p>

      <RikuSays>
        Gradient descent is basically: which way is downhill? Go that way.
        Repeat. That&apos;s it, that&apos;s the whole algorithm.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <LineChart
          series={curveSeries}
          width={520}
          height={280}
          title="Loss as a function of one parameter"
          xLabel="parameter"
          yLabel="loss"
          smooth
          showPoints={false}
          animateOnMount
        />
        <p className="font-hand text-xs text-center text-muted-foreground mt-2">
          The valley near the middle is the minimum - that&apos;s where we
          want to end up.
        </p>
      </div>

      <RikuSays>
        The gradient is just a fancy word for &ldquo;a vector pointing
        uphill&rdquo;. We go the opposite way. Easy peasy, gradient squeezy.
      </RikuSays>

      <InfoBox variant="blue" title="Gradient = Slope">
        The gradient tells us which direction is &quot;uphill.&quot; We go the
        opposite way (downhill) to reduce the loss. Each step moves us closer
        to the best answer.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Descent on a 2D Bowl                                       */
/* ------------------------------------------------------------------ */
function BowlDescentTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Now let&apos;s do it in 2D. Press <strong>Play</strong> and watch the
        yellow ball roll toward the lowest point of the bowl. Each step moves
        opposite the gradient.
      </p>

      <RikuSays>
        Two parameters means two directions to worry about. But don&apos;t
        panic - the math still just says &ldquo;go downhill&rdquo;.
      </RikuSays>

      <GradientDescentViz
        lossFn={bowlLoss}
        initialLearningRate={4}
        startPoint={[15, 85]}
      />

      <RikuSays>
        See how the trail hugs a straight line into the center? Symmetric
        bowls are the easy level. We&apos;re about to crank up the difficulty.
      </RikuSays>

      <InfoBox variant="green" title="Contour Maps">
        Each colored band represents roughly the same loss value. The center
        is the minimum. Gradient descent always moves roughly perpendicular
        to the contour lines toward lower loss.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Tricky Landscapes                                          */
/* ------------------------------------------------------------------ */
function TrickyLandscapesTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Real loss surfaces are rarely perfect bowls. Here are two nastier
        ones: a <strong>skewed</strong> valley and a <strong>double
        well</strong>. Watch how descent behaves differently on each.
      </p>

      <RikuSays>
        Skewed valleys are like a narrow canyon - descent zig-zags because
        one direction drops much faster than the other. Still works, just
        takes more steps.
      </RikuSays>

      <GradientDescentViz
        lossFn={skewedLoss}
        initialLearningRate={3}
        startPoint={[10, 90]}
      />

      <RikuSays>
        Double wells have <em>two</em> lowest points. Gradient descent finds
        whichever one is closer - which is why your starting position
        matters!
      </RikuSays>

      <div className="flex justify-center">
        <LossLandscape
          lossFn={doubleWellLoss}
          learningRate={0.08}
          startPoint={[-2.5, 2]}
          range={[-3.5, 3.5]}
        />
      </div>

      <InfoBox variant="amber" title="Not All Valleys Are Equal">
        Real models have loss surfaces with long canyons, saddle points, and
        many local minima. Plain gradient descent can get stuck - which is
        why we&apos;ll learn about learning rate and momentum next lesson.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What does the gradient tell us during gradient descent?",
    options: [
      "The final answer",
      "The direction of steepest ascent",
      "The number of steps needed",
      "The learning rate to use",
    ],
    correctIndex: 1,
    explanation:
      "The gradient points in the direction of steepest ascent. We move in the opposite direction (descent) to reduce the loss.",
  },
  {
    question: "What happens if the learning rate is too large?",
    options: [
      "Training takes too long",
      "The model converges perfectly",
      "The ball overshoots and may diverge",
      "Nothing changes",
    ],
    correctIndex: 2,
    explanation:
      "A learning rate that is too large causes the ball to overshoot the minimum and potentially bounce around or diverge.",
  },
  {
    question: "What is the goal of gradient descent?",
    options: [
      "Maximize the loss function",
      "Find the minimum of the loss function",
      "Make the gradient as large as possible",
      "Increase the learning rate",
    ],
    correctIndex: 1,
    explanation:
      "Gradient descent aims to find the point where the loss function is minimized, meaning the model's predictions are as good as possible.",
  },
  {
    question: "When does gradient descent stop (converge)?",
    options: [
      "After exactly 10 steps",
      "When the gradient is near zero",
      "When the loss equals 1",
      "When the learning rate is zero",
    ],
    correctIndex: 1,
    explanation:
      "Gradient descent converges when the gradient approaches zero, meaning the ball has reached a flat spot (minimum).",
  },
  {
    question: "In a 2D contour plot, where is the minimum?",
    options: [
      "At the edges",
      "Where contour lines are farthest apart",
      "At the center of the innermost ring",
      "Where colors are brightest",
    ],
    correctIndex: 2,
    explanation:
      "The minimum is at the center of the contour rings. Each ring represents the same loss value, getting smaller toward the center.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L22_GradientDescentActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "roll",
        label: "Why Gradients?",
        icon: <ArrowDown className="w-4 h-4" />,
        content: <RollDownTab />,
      },
      {
        id: "bowl",
        label: "Descent on a Bowl",
        icon: <Gauge className="w-4 h-4" />,
        content: <BowlDescentTab />,
      },
      {
        id: "contour",
        label: "Tricky Landscapes",
        icon: <Map className="w-4 h-4" />,
        content: <TrickyLandscapesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Gradient Descent"
      level={7}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Master learning rate and momentum  the speed controls of training!"
      story={
        <StorySection
          paragraphs={[
            "Aru stood on a grassy hillside, blindfolded, trying to find her way to the bottom of the valley.",
            "Aru: \"Byte, I can't see anything! How do I find the lowest point?\"",
            "Byte: \"Feel which way the ground slopes under your feet. Then take a step downhill. Keep doing that until the ground feels flat  that means you've reached the bottom!\"",
            "Aru: \"So I just keep going in the steepest downhill direction?\"",
            "Byte: \"Exactly! That's gradient descent  finding the lowest point of a loss function by following the slope. Every machine learning model uses this to learn!\"",
          ]}
          conceptTitle="Gradient Descent"
          conceptSummary="Gradient descent is an optimization algorithm that finds the minimum of a function by repeatedly moving in the direction of steepest descent (opposite to the gradient). It is the backbone of how ML models learn from data."
        />
      }
    />
  );
}
