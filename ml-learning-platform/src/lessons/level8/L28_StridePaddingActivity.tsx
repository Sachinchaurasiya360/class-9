"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Footprints, Frame, Minimize2 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ConvolutionViz,
  PoolingViz,
  DEMO_IMAGES,
  PRESET_FILTERS,
  type Pixels2D,
} from "@/components/viz/cnn";
import { playClick } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Riku - red panda mascot dialogue helper                            */
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
/*  A pretty 8x8 feature-map-like demo used for the stride tab         */
/* ------------------------------------------------------------------ */
const STRIDE_IMAGE: Pixels2D = DEMO_IMAGES.letterX;
const PADDING_IMAGE: Pixels2D = DEMO_IMAGES.plus;
const POOLING_INPUT: Pixels2D = [
  [1, 3, 2, 4, 5, 0, 6, 1],
  [4, 6, 1, 8, 3, 2, 7, 0],
  [2, 1, 9, 0, 4, 5, 1, 3],
  [0, 3, 5, 2, 6, 1, 8, 2],
  [7, 2, 0, 4, 9, 3, 2, 6],
  [1, 5, 3, 1, 0, 8, 4, 1],
  [2, 4, 6, 0, 3, 5, 7, 2],
  [3, 1, 2, 5, 1, 0, 4, 9],
];

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Stride Explorer                                           */
/* ------------------------------------------------------------------ */
function StrideTab() {
  const [stride, setStride] = useState(1);

  // output size for 8x8 input, 3x3 kernel, no padding, with current stride
  const outSize = Math.floor((8 - 3) / stride) + 1;

  return (
    <div className="space-y-4">
      <RikuSays>
        Stride = &ldquo;how many steps the filter jumps&rdquo;. Stride 1 = every pixel. Stride 2 = skip one.
        Bigger stride = smaller output, faster compute. Watch what happens when I crank it up!
      </RikuSays>

      <div className="flex items-center gap-3 justify-center flex-wrap">
        <span className="font-hand text-sm font-bold">Stride:</span>
        {[1, 2, 3].map((s) => (
          <button
            key={s}
            onClick={() => {
              playClick();
              setStride(s);
            }}
            className={`w-10 h-10 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
              stride === s
                ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                : "bg-background hover:bg-accent-yellow/40"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="card-sketchy p-3 text-center" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-sm">
          Output size = (N − K) / S + 1 = (8 − 3) / {stride} + 1 ={" "}
          <span className="marker-highlight-yellow font-bold">{outSize}</span>
        </p>
      </div>

      <ConvolutionViz
        key={`stride-${stride}`}
        image={STRIDE_IMAGE}
        filter={PRESET_FILTERS.sharpen}
        stride={stride}
        padding={0}
        title={`Stride ${stride} convolution`}
      />

      <RikuSays>
        Notice the feature map on the right shrinks as stride grows. Stride 2 literally
        skips every other window, so you get a 3&times;3 output instead of 6&times;6. Fewer
        outputs, less math &mdash; but also less detail. Trade-offs, everywhere!
      </RikuSays>

      <InfoBox variant="blue" title="Stride">
        Stride controls how many pixels the filter moves each step. Stride 1 moves one pixel at a
        time; stride 2 skips every other position, producing a smaller output.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Padding Demo                                              */
/* ------------------------------------------------------------------ */
function PaddingTab() {
  const [usePadding, setUsePadding] = useState(false);

  const inputSize = 8;
  const padAmt = usePadding ? 1 : 0;
  const outSize = inputSize + 2 * padAmt - 3 + 1;

  return (
    <div className="space-y-4">
      <RikuSays>
        Padding = &ldquo;put a border of zeros around the image so the filter can still reach the
        edges&rdquo;. Without padding, every conv layer shrinks your image &mdash; stack a few and
        there&apos;s nothing left!
      </RikuSays>

      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={() => {
            playClick();
            setUsePadding(false);
          }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
            !usePadding ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background"
          }`}
        >
          Valid (No Padding)
        </button>
        <button
          onClick={() => {
            playClick();
            setUsePadding(true);
          }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
            usePadding ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]" : "bg-background"
          }`}
        >
          Same (Zero Padding)
        </button>
      </div>

      <div className="card-sketchy p-3 text-center" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-sm">
          Input: <span className="font-bold">8&times;8</span>
          {usePadding && <span className="font-bold"> + 1 pad = 10&times;10</span>} → Output:{" "}
          <span className="marker-highlight-yellow font-bold">
            {outSize}&times;{outSize}
          </span>
          {usePadding && (
            <span className="marker-highlight-mint font-bold ml-2">(same as original!)</span>
          )}
        </p>
      </div>

      <ConvolutionViz
        key={`padding-${padAmt}`}
        image={PADDING_IMAGE}
        filter={PRESET_FILTERS["edge-vertical"]}
        stride={1}
        padding={padAmt}
        title={usePadding ? "Convolution with padding = 1" : "Convolution with padding = 0"}
      />

      <RikuSays>
        With padding 1, a 3&times;3 filter still reaches the corner pixels &mdash; they just sit
        next to imagined zeros. That&apos;s why &ldquo;same&rdquo; padding keeps the output the
        exact size of the input. Very handy when you stack 5, 10, 50 conv layers.
      </RikuSays>

      <InfoBox variant="green" title="Why Padding?">
        Without padding, each convolution layer shrinks the image. With &ldquo;same&rdquo; padding
        (adding zeros around the border), the output stays the same size as the input. This lets us
        stack many convolution layers without losing spatial dimensions.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Pooling                                                   */
/* ------------------------------------------------------------------ */
function PoolingTab() {
  const [poolType, setPoolType] = useState<"max" | "avg">("max");
  const [poolSize, setPoolSize] = useState(2);

  return (
    <div className="space-y-4">
      <RikuSays>
        Pooling is the &ldquo;downsampling&rdquo; step. Take the most important pixel from each
        2&times;2 chunk. Keeps the signal, drops the noise &mdash; and halves the size for free.
      </RikuSays>

      <div className="flex gap-3 justify-center flex-wrap items-center">
        <button
          onClick={() => {
            playClick();
            setPoolType("max");
          }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
            poolType === "max"
              ? "bg-accent-mint text-white shadow-[2px_2px_0_#2b2a35]"
              : "bg-background"
          }`}
        >
          Max Pooling
        </button>
        <button
          onClick={() => {
            playClick();
            setPoolType("avg");
          }}
          className={`px-4 py-2 rounded-lg font-hand text-sm font-bold border-2 border-foreground transition-all ${
            poolType === "avg"
              ? "bg-accent-sky text-white shadow-[2px_2px_0_#2b2a35]"
              : "bg-background"
          }`}
        >
          Average Pooling
        </button>

        <div className="flex items-center gap-2">
          <span className="font-hand text-sm font-bold">Window:</span>
          {[2, 4].map((s) => (
            <button
              key={s}
              onClick={() => {
                playClick();
                setPoolSize(s);
              }}
              className={`w-10 h-10 rounded-lg font-hand text-base font-bold border-2 border-foreground transition-all ${
                poolSize === s
                  ? "bg-accent-yellow shadow-[2px_2px_0_#2b2a35]"
                  : "bg-background hover:bg-accent-yellow/40"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <PoolingViz
        key={`${poolType}-${poolSize}`}
        input={POOLING_INPUT}
        poolSize={poolSize}
        type={poolType}
        title={`${poolType === "max" ? "Max" : "Average"} pooling (${poolSize}×${poolSize})`}
      />

      <RikuSays>
        <b>Max</b> pooling is like a photo album &mdash; only the best shot per page makes it.{" "}
        <b>Average</b> pooling is more like a polite summary. Max usually wins for classification
        because the loudest feature matters most.
      </RikuSays>

      <InfoBox variant="amber" title="Pooling Reduces Size">
        Pooling reduces the spatial size while keeping the strongest features. Max pooling picks
        the largest value in each block (preserving the most active feature). Average pooling takes
        the mean. Both reduce computation for later layers.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What does stride control in convolution?",
    options: [
      "The size of the kernel",
      "How many positions the filter moves each step",
      "The number of filters used",
      "The brightness of pixels",
    ],
    correctIndex: 1,
    explanation:
      "Stride determines how many pixels the filter jumps between positions. A larger stride produces a smaller output.",
  },
  {
    question:
      "If you apply a 3x3 filter with stride 2 to an 8x8 image (no padding), what is the output size?",
    options: ["6x6", "4x4", "3x3", "8x8"],
    correctIndex: 2,
    explanation:
      "Output size = (8 - 3) / 2 + 1 = 3.5 rounded down = 3. The output is 3x3.",
  },
  {
    question: "What is the purpose of zero padding?",
    options: [
      "To make the image brighter",
      "To preserve the spatial size of the output",
      "To speed up computation",
      "To remove edges from the image",
    ],
    correctIndex: 1,
    explanation:
      "Zero padding adds zeros around the border so the filter can process edge pixels. With 'same' padding, the output keeps the same size as the input.",
  },
  {
    question: "What does max pooling do?",
    options: [
      "Averages all pixel values",
      "Selects the largest value in each pooling window",
      "Doubles the image size",
      "Adds noise to the image",
    ],
    correctIndex: 1,
    explanation:
      "Max pooling divides the feature map into blocks and keeps only the maximum value from each block, reducing size while preserving the strongest features.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
export default function L28_StridePaddingActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "stride",
        label: "Stride Explorer",
        icon: <Footprints className="w-4 h-4" />,
        content: <StrideTab />,
      },
      {
        id: "padding",
        label: "Padding Demo",
        icon: <Frame className="w-4 h-4" />,
        content: <PaddingTab />,
      },
      {
        id: "pooling",
        label: "Max Pooling",
        icon: <Minimize2 className="w-4 h-4" />,
        content: <PoolingTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Stride, Padding & Pooling"
      level={8}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Put it all together - build a mini CNN from scratch!"
      story={
        <StorySection
          paragraphs={[
            "Aru watched Byte demonstrate how a filter slides across an image, and a question popped up.",
            "Aru: \"Does the filter always move one pixel at a time? And what happens at the edges?\"",
            "Byte: \"Great questions! When we slide the filter, we can skip positions - that's called stride. And we can add zeros around the edges - that's padding. After filtering, we shrink the image with pooling, keeping only the important parts!\"",
            "Aru: \"So stride, padding, and pooling all help control the size of the output?\"",
            "Byte: \"Exactly! They're the building blocks that let us design CNNs that process images efficiently.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Stride controls how many pixels the filter skips. Padding adds zeros around the border to preserve size. Pooling shrinks the feature map by keeping only the max (or average) in each block."
        />
      }
    />
  );
}
