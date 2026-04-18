"use client";

import { useMemo } from "react";
import { TrendingUp, SlidersHorizontal, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  LinearRegressionViz,
  generateLinearData,
} from "../../components/viz/ml-algorithms";
import { BarChart } from "../../components/viz/data-viz";

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
/*  Tab 1 - Drag the Line                                              */
/* ------------------------------------------------------------------ */

function DragTheLine() {
  // A friendly, low-noise dataset so students can clearly see a "right answer".
  const data = useMemo(
    () => generateLinearData(20, 0.7, 20, 6, 42),
    [],
  );

  return (
    <div className="space-y-4">
      <RikuSays>
        Grab the slope and intercept sliders and chase those dashed residual
        lines down. The "best" line is just the one with the smallest mistakes.
        Math calls that "minimizing the loss". I call it "fewer oops".
      </RikuSays>

      <div className="card-sketchy notebook-grid p-4 space-y-3">
        <h3 className="font-hand text-base font-bold">
          Adjust the line to fit the data
        </h3>
        <LinearRegressionViz data={data} showResiduals showMSE />
      </div>

      <RikuSays>
        Hit the "Fit" button to watch the computer snap the line into the
        math-perfect spot. That's literally least-squares linear regression -
        your very first ML algorithm.
      </RikuSays>

      <InfoBox variant="blue">
        The best line is the one where the total error - the sum of squared
        distances from points to the line - is as small as possible. Can you
        beat the computer? Drag the sliders, then press Fit to compare.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Slope & Intercept Explorer                                 */
/* ------------------------------------------------------------------ */

function SlopeInterceptExplorer() {
  // A second dataset with a steeper underlying slope so students see
  // that slope/intercept are just *numbers that describe a line*.
  const data = useMemo(
    () => generateLinearData(18, 1.1, 8, 5, 101),
    [],
  );

  return (
    <div className="space-y-4">
      <RikuSays>
        Slope = "how steep". Intercept = "where the line crosses the Y axis".
        Slide them around and watch the line tilt and slide. Two numbers, one
        line. That's the whole trick.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-4 space-y-3">
        <h3 className="font-hand text-base font-bold">
          Explore how slope and intercept change the line
        </h3>
        <LinearRegressionViz data={data} showResiduals showMSE />
      </div>

      <RikuSays>
        Try setting slope to zero - the line goes flat. Try a negative slope -
        it tilts downhill. Every possible line you could ever draw is just a
        slope plus an intercept. Mind = blown.
      </RikuSays>

      <InfoBox variant="amber">
        The slope tells you how steep the line is - positive means uphill,
        negative means downhill, zero means flat. The intercept is where the
        line crosses the Y axis (the starting point when X is 0).
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Error Showdown                                             */
/* ------------------------------------------------------------------ */

// Three hand-picked "bad lines" we'll compare against the best-fit line.
// Values are tuned to look visually wrong on our noisy dataset.
const BAD_LINES: Array<{ label: string; meanResidual: number; color: string }> = [
  { label: "Too Flat", meanResidual: 18.4, color: "var(--accent-coral)" },
  { label: "Too Steep", meanResidual: 14.7, color: "var(--accent-lav)" },
  { label: "Offset Up", meanResidual: 11.2, color: "var(--accent-sky)" },
  { label: "Best Fit", meanResidual: 4.1, color: "var(--accent-mint)" },
];

function ErrorShowdown() {
  // Noisier data so the contest between lines feels meaningful.
  const data = useMemo(
    () => generateLinearData(25, 0.6, 15, 12, 77),
    [],
  );

  return (
    <div className="space-y-4">
      <RikuSays>
        Challenge time. Drag the sliders and try to beat the Fit button. Then
        peek at the residual bar chart below - each bar is one "type" of wrong
        line. Short bar = happy line.
      </RikuSays>

      <div className="card-sketchy notebook-grid p-4 space-y-3">
        <h3 className="font-hand text-base font-bold">
          Can you match the computer&apos;s best fit?
        </h3>
        <LinearRegressionViz data={data} showResiduals showMSE />
      </div>

      <div className="card-sketchy p-4 space-y-2">
        <h3 className="font-hand text-base font-bold">
          Residual size: bad lines vs. best fit
        </h3>
        <p className="font-hand text-xs text-foreground/70">
          Lower is better - the best line has the smallest average mistake.
        </p>
        <BarChart
          data={BAD_LINES.map((b) => ({
            label: b.label,
            value: b.meanResidual,
            color: b.color,
          }))}
          yLabel="Avg residual"
          height={240}
        />
      </div>

      <RikuSays>
        See how "Best Fit" is a tiny little stump while the others tower over
        it? That&apos;s exactly what an ML training loop does - it keeps wiggling
        the line until its bar is the shortest. Congratulations: you just did
        machine learning with your hands.
      </RikuSays>

      <InfoBox variant="green">
        Machine learning does exactly this - it adjusts the line (or curve)
        over and over until the error is as small as possible. You just did ML
        with your hands!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz data                                                          */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "If a line has a slope of 2, what does that mean?",
    options: [
      "The line is flat",
      "Y increases by 2 for every 1 unit increase in X",
      "The line starts at Y = 2",
      "The line has 2 points",
    ],
    correctIndex: 1,
    explanation:
      "A slope of 2 means that for every 1 unit you move to the right on the X axis, the Y value goes up by 2 units.",
  },
  {
    question: "What is a residual?",
    options: [
      "The slope of the line",
      "The distance between a data point and the line",
      "The total number of points",
      "The intercept value",
    ],
    correctIndex: 1,
    explanation:
      "A residual is the vertical distance between a data point and the line. Smaller residuals mean the line fits the data better.",
  },
  {
    question:
      "What happens to the total error when the line goes through every point perfectly?",
    options: [
      "The error is very large",
      "The error is exactly zero",
      "The error is negative",
      "The error is undefined",
    ],
    correctIndex: 1,
    explanation:
      "If the line passes through every point, all residuals are zero, so the total error is zero. In practice, this rarely happens with real data.",
  },
  {
    question: "The 'best fit line' is the line that:",
    options: [
      "Goes through the first and last points",
      "Has the steepest slope",
      "Minimizes the total error",
      "Is perfectly horizontal",
    ],
    correctIndex: 2,
    explanation:
      "The best fit line minimizes the total error (sum of squared residuals). This is the core idea behind linear regression in machine learning!",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

export default function L8_BestLineActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "drag",
        label: "Drag the Line",
        icon: <TrendingUp className="w-4 h-4" />,
        content: <DragTheLine />,
      },
      {
        id: "slope-intercept",
        label: "What Do Slope and Intercept Mean?",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <SlopeInterceptExplorer />,
      },
      {
        id: "showdown",
        label: "Error Showdown",
        icon: <Trophy className="w-4 h-4" />,
        content: <ErrorShowdown />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Drawing the Best Line"
      level={3}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You manually adjusted a line to fit data. But how would a computer do this automatically? It needs a set of steps - an algorithm!"
      story={
        <StorySection
          paragraphs={[
            "Aru had been tracking her sunflower's height every week: 5 cm, 8 cm, 12 cm, 15 cm, 19 cm. She wanted to know how tall it would be next month.",
            "Aru: \"I can see the plant is growing, but how do I predict the exact height in 4 weeks?\"",
            "Byte: \"Let's plot your measurements on a graph. Then we'll draw a line that gets as close to all the dots as possible. That line is your best guess for the pattern - and you can extend it into the future!\"",
            "Aru: \"But how do I know which line is the 'best' one? I could draw a million different lines.\"",
            "Byte: \"The best line is the one that makes the smallest total error - the distances between each dot and the line. Let me show you how to find it!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="The line of best fit is the line that minimizes the total error (the sum of distances from each data point to the line). It's defined by two numbers: the slope (steepness) and the intercept (where it crosses the Y axis). This concept is the foundation of linear regression - one of the most used techniques in machine learning."
        />
      }
    />
  );
}
