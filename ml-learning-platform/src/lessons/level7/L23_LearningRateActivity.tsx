"use client";

import { useMemo } from "react";
import { SlidersHorizontal, Zap, TrendingDown } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { GradientDescentViz } from "../../components/viz/ml-algorithms";
import { LossLandscape } from "../../components/viz/neural-network";
import { LineChart } from "../../components/viz/data-viz";
import type { Series } from "../../components/viz/data-viz";

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
/*  Shared loss surfaces                                               */
/* ------------------------------------------------------------------ */

/** Classic skewed bowl on [0,100]² - used by GradientDescentViz. */
function skewedBowl(w: number, b: number): number {
  const dw = (w - 55) / 18;
  const db = (b - 48) / 26;
  return dw * dw + db * db + 0.5 * dw * db;
}

/** Simple 1D loss for the offline loss-curve plots. */
function loss1D(x: number): number {
  const t = x - 0.55;
  return 3.0 * t * t * t * t - 1.5 * t * t + 0.4 * t + 0.9;
}
function grad1D(x: number): number {
  const t = x - 0.55;
  return 4 * 3.0 * t * t * t - 2 * 1.5 * t + 0.4;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/* ------------------------------------------------------------------ */
/*  Tab 1 - Learning Rate Tuning (hero)                                */
/* ------------------------------------------------------------------ */
function LRTuningTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Drag the <strong>learning rate</strong> slider and press{" "}
        <strong>Play</strong>. Try to find the sweet spot where the ball
        reaches the bottom smoothly - not too slow, not bouncing wildly.
      </p>

      <RikuSays>
        Learning rate too small = you&apos;ll train forever. Too big =
        you&apos;ll bounce out of the valley. Goldilocks time.
      </RikuSays>

      <GradientDescentViz
        lossFn={skewedBowl}
        initialLearningRate={4}
        startPoint={[15, 85]}
      />

      <RikuSays>
        Pro tip: the default (~4) is already pretty good here. Nudge it
        up to around 9 and watch the ball start zig-zagging. Nudge it down
        to 0.5 and it crawls like it&apos;s Monday morning.
      </RikuSays>

      <InfoBox variant="blue" title="Goldilocks LR">
        The learning rate controls step size. Too small = slow convergence.
        Too large = overshooting. Finding the &quot;just right&quot; value is
        one of the most important choices in training.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Extreme Rates (side-by-side)                               */
/* ------------------------------------------------------------------ */
function ExtremeRatesTab() {
  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Two learning rates, same loss landscape. The one on top is painfully
        tiny - barely moves. The one below is way too big - watch it ping
        around the valley.
      </p>

      <RikuSays>
        This is the ML version of &ldquo;hold my drink&rdquo;. On the right
        lr, descent is chill. On the wrong lr, it&apos;s a chaos panda.
      </RikuSays>

      <div className="card-sketchy p-3">
        <p className="font-hand text-xs text-center font-bold mb-2">
          Tiny learning rate (lr = 0.01) - barely budges
        </p>
        <div className="flex justify-center">
          <LossLandscape
            lossFn={(x, y) => (x - 1) * (x - 1) + (y + 0.5) * (y + 0.5)}
            learningRate={0.01}
            startPoint={[-2.5, 2]}
            range={[-3.5, 3.5]}
          />
        </div>
      </div>

      <div className="card-sketchy p-3">
        <p className="font-hand text-xs text-center font-bold mb-2">
          Huge learning rate (lr = 1.1) - overshoots and diverges
        </p>
        <div className="flex justify-center">
          <LossLandscape
            lossFn={(x, y) => (x - 1) * (x - 1) + (y + 0.5) * (y + 0.5)}
            learningRate={1.1}
            startPoint={[-2.5, 2]}
            range={[-3.5, 3.5]}
          />
        </div>
      </div>

      <RikuSays>
        Notice how the huge-lr trail bounces <em>across</em> the minimum
        instead of settling into it? That&apos;s called overshooting - and
        if it&apos;s bad enough, the loss literally goes up forever. Oops.
      </RikuSays>

      <InfoBox variant="amber" title="Too Small vs Too Big">
        Tiny lr: you&apos;ll reach the bottom eventually, but training
        wastes huge amounts of time. Huge lr: each step overshoots - the
        ball can&apos;t settle, and the loss may actually increase over
        time.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Loss Curves (side-by-side analytical)                      */
/* ------------------------------------------------------------------ */
function LossCurvesTab() {
  // Run the same 1D gradient descent for three different learning rates,
  // then plot loss over iterations using LineChart.
  const series = useMemo<Series[]>(() => {
    const configs: { lr: number; name: string; color: string }[] = [
      { lr: 0.005, name: "lr = 0.005 (tiny)", color: "var(--accent-sky)" },
      { lr: 0.08, name: "lr = 0.08 (good)", color: "var(--accent-mint)" },
      { lr: 0.6, name: "lr = 0.6 (huge)", color: "var(--accent-coral)" },
    ];
    const steps = 50;

    return configs.map(({ lr, name, color }) => {
      const data: { x: number; y: number }[] = [];
      let x = 0.05;
      for (let i = 0; i <= steps; i++) {
        const l = loss1D(clamp(x, -1, 2));
        // Clip crazy losses so the chart stays readable.
        data.push({ x: i, y: clamp(l, 0, 6) });
        const g = grad1D(x);
        x = x - lr * g;
        // If it diverges, keep reporting a big loss so the line stays visible.
        if (!Number.isFinite(x) || Math.abs(x) > 5) x = Math.sign(x) * 5;
      }
      return { name, data, color };
    });
  }, []);

  return (
    <div className="space-y-5">
      <p className="font-hand text-sm text-center text-muted-foreground">
        Here&apos;s the same optimization run three times, with three
        different learning rates. The y-axis is loss, the x-axis is
        iteration number. The story becomes super obvious.
      </p>

      <RikuSays>
        Loss curves are the ML equivalent of a fitness tracker. A nice
        smooth drop means training is happy. A flat line means your lr is
        too small. A wiggly mess means it&apos;s too big.
      </RikuSays>

      <div className="card-sketchy p-4 notebook-grid">
        <LineChart
          series={series}
          width={560}
          height={320}
          title="Loss over iterations"
          xLabel="iteration"
          yLabel="loss"
          smooth
          showPoints={false}
          animateOnMount
        />
      </div>

      <RikuSays>
        Mint = smooth descent into the valley. Sky = technically working,
        but it&apos;s going to take <em>forever</em>. Coral = welcome to
        chaos panda town.
      </RikuSays>

      <InfoBox variant="indigo" title="Reading a Loss Curve">
        <strong>Smooth fall and flatten:</strong> healthy training.
        <br />
        <strong>Flat line near the start:</strong> lr too small - model
        barely learning.
        <br />
        <strong>Spiky or rising curve:</strong> lr too large - model
        diverging.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What happens if the learning rate is too small?",
    options: [
      "The model diverges",
      "Training converges very slowly",
      "The model overfits immediately",
      "Gradient becomes zero",
    ],
    correctIndex: 1,
    explanation:
      "A very small learning rate means tiny steps, so the model takes forever to reach the minimum.",
  },
  {
    question: "What does momentum help with?",
    options: [
      "Making the model larger",
      "Escaping local minima",
      "Increasing the learning rate",
      "Reducing the dataset size",
    ],
    correctIndex: 1,
    explanation:
      "Momentum carries speed from previous steps, helping the ball roll through small bumps (local minima) to find the global minimum.",
  },
  {
    question: "In cosine annealing, how does the learning rate change?",
    options: [
      "It stays constant",
      "It increases over time",
      "It smoothly decreases following a cosine curve",
      "It randomly fluctuates",
    ],
    correctIndex: 2,
    explanation:
      "Cosine annealing starts with a large learning rate and smoothly reduces it following a cosine curve shape.",
  },
  {
    question: "Why is step decay useful?",
    options: [
      "It makes training faster at the start and more precise at the end",
      "It increases the learning rate over time",
      "It removes the need for momentum",
      "It doubles the batch size",
    ],
    correctIndex: 0,
    explanation:
      "Step decay uses a large learning rate initially for fast progress, then reduces it at set intervals for fine-tuning near the minimum.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L23_LearningRateActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "tuning",
        label: "Learning Rate Tuning",
        icon: <SlidersHorizontal className="w-4 h-4" />,
        content: <LRTuningTab />,
      },
      {
        id: "extremes",
        label: "Extreme Rates",
        icon: <Zap className="w-4 h-4" />,
        content: <ExtremeRatesTab />,
      },
      {
        id: "curves",
        label: "Loss Curves",
        icon: <TrendingDown className="w-4 h-4" />,
        content: <LossCurvesTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Learning Rate & Momentum"
      level={7}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn about overfitting  when your model memorizes instead of learning!"
      story={
        <StorySection
          paragraphs={[
            "Byte showed Aru a skateboard perched at the top of a steep hill.",
            "Byte: \"Imagine rolling this skateboard down the hill. The learning rate is how hard you push it. Too gentle  it barely moves. Too hard  it flies right past the bottom!\"",
            "Aru: \"What about the bumps in the road? A small push might get stuck on one.\"",
            "Byte: \"That's where momentum comes in! Momentum is like the skateboard carrying speed from before. It helps you roll right through those small bumps and find the real bottom of the valley!\"",
            "Aru: \"So I need the right push AND enough rolling speed. Got it!\"",
          ]}
          conceptTitle="Learning Rate & Momentum"
          conceptSummary="The learning rate controls step size during gradient descent. Too small = slow, too large = unstable. Momentum adds 'memory' of previous steps, helping escape local minima and converge faster."
        />
      }
    />
  );
}
