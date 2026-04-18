"use client";

import { useMemo, useState } from "react";
import { ScanLine, Wrench, Layers } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import {
  ConvolutionViz,
  FilterBank,
  KernelEditor,
  DEMO_IMAGES,
  PRESET_FILTERS,
  DEFAULT_FILTER_BANK,
} from "@/components/viz/cnn";
import type { FilterKernel } from "@/components/viz/cnn";

/* ------------------------------------------------------------------ */
/*  Riku (red panda) narrator bubble                                   */
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
/*  Tab 1 - Apply a Filter (hero ConvolutionViz)                        */
/* ------------------------------------------------------------------ */
function ApplyFilterTab() {
  return (
    <div className="space-y-5">
      <RikuSays>
        A filter is like a tiny magnifying glass that slides across the image
        looking for one specific thing. &quot;Is there an edge here? A corner
        here?&quot; Hit Play and watch it sweep.
      </RikuSays>

      <ConvolutionViz
        image={DEMO_IMAGES.letterX}
        filter={PRESET_FILTERS["edge-vertical"]}
        title="Vertical edge filter, one step at a time"
      />

      <RikuSays>
        Look at the feature map on the right - the bright cells are saying
        &quot;yes! I found what I was looking for at this spot!&quot; Dim cells
        mean &quot;nope, nothing here.&quot;
      </RikuSays>

      <InfoBox variant="blue" title="Convolution">
        A filter (kernel) slides over the image. At each position it
        multiplies overlapping values, sums them up, and writes one number
        into the output - the feature map. Different kernels detect different
        features!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Try Different Filters                                       */
/* ------------------------------------------------------------------ */
function FilterGalleryTab() {
  const [filterIdx, setFilterIdx] = useState(0);
  const [imgKey, setImgKey] = useState<"letterX" | "plus" | "digit3" | "box">(
    "letterX",
  );

  const selectedFilter = DEFAULT_FILTER_BANK[filterIdx];
  const image = DEMO_IMAGES[imgKey];

  return (
    <div className="space-y-5">
      <RikuSays>
        Each filter has its own personality. The horizontal edge filter only
        gets excited about horizontal lines. Blur averages its neighbours.
        Sharpen amplifies the differences. Click one and see what it finds.
      </RikuSays>

      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <span className="font-hand text-sm font-bold">Try it on:</span>
        {(
          [
            ["letterX", "letter X"],
            ["plus", "plus"],
            ["digit3", "digit 3"],
            ["box", "box"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setImgKey(k)}
            className={imgKey === k ? "btn-sketchy" : "btn-sketchy-outline"}
          >
            {label}
          </button>
        ))}
      </div>

      <FilterBank
        selectedIdx={filterIdx}
        onSelect={(i) => setFilterIdx(i)}
        title="Pick a filter"
      />

      <ConvolutionViz
        image={image}
        filter={selectedFilter.kernel}
        title={`${selectedFilter.name} applied to ${imgKey}`}
      />

      <InfoBox variant="amber" title="One filter, one feature">
        Each kernel is tuned to exactly one pattern. A vertical edge detector
        won&apos;t find horizontal stripes. That&apos;s why real CNNs use
        dozens or hundreds of filters - the whole gallery is what lets a
        network &quot;see.&quot;
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Build Your Own Filter                                       */
/* ------------------------------------------------------------------ */
function BuildFilterTab() {
  const [kernel, setKernel] = useState<FilterKernel>(
    () => PRESET_FILTERS["edge-vertical"].map((row) => row.slice()),
  );

  return (
    <div className="space-y-5">
      <RikuSays>
        Your turn. Click cells to bump them up, shift-click to bump down,
        drag to paint. Then watch the feature map recompute in real time.
        Try: all +1 on the left, all −1 on the right. Boom - vertical edge
        detector.
      </RikuSays>

      <KernelEditor
        kernel={kernel}
        onChange={setKernel}
        title="Your kernel - drag to paint"
      />

      <ConvolutionViz
        image={DEMO_IMAGES.letterX}
        filter={kernel}
        title="Live feature map from your kernel"
      />

      <RikuSays>
        Stack enough filters and your CNN starts seeing faces, cats, stop
        signs - not because you told it what those look like, but because it
        figured out which patterns matter.
      </RikuSays>

      <InfoBox variant="indigo" title="CNNs Learn Their Filters">
        In a real Convolutional Neural Network the computer doesn&apos;t use
        hand-made filters. It <strong>learns</strong> which filters work best
        during training - automatically discovering edges, textures, and
        shapes from raw pixels.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is a convolution in image processing?",
    options: [
      "Rotating the image 90 degrees",
      "Sliding a small filter over the image and computing sums",
      "Deleting pixels from the image",
      "Converting color to grayscale",
    ],
    correctIndex: 1,
    explanation:
      "Convolution slides a small kernel over the image, multiplying and summing overlapping values to produce each output pixel.",
  },
  {
    question: "What does an edge detection filter typically find?",
    options: [
      "The brightest pixel",
      "Boundaries where brightness changes sharply",
      "The average color",
      "The center of the image",
    ],
    correctIndex: 1,
    explanation:
      "Edge detection kernels highlight areas where pixel values change abruptly - that is where edges appear.",
  },
  {
    question:
      "If you apply a 3x3 filter to an 8x8 image (no padding), what is the output size?",
    options: ["8x8", "6x6", "3x3", "5x5"],
    correctIndex: 1,
    explanation:
      "Output size = (8 - 3 + 1) = 6. The filter cannot go past the edge, so the output shrinks by (kernel - 1) on each side.",
  },
  {
    question: "What does a blur filter do?",
    options: [
      "Sharpens the image",
      "Averages neighboring pixels to smooth the image",
      "Turns the image upside down",
      "Removes all color",
    ],
    correctIndex: 1,
    explanation:
      "A blur kernel averages nearby pixel values, smoothing out noise and detail in the image.",
  },
  {
    question: "In a CNN, who designs the filters?",
    options: [
      "A human designer for each image",
      "The network learns them during training",
      "They are always the same for every task",
      "The camera hardware",
    ],
    correctIndex: 1,
    explanation:
      "One of the key powers of CNNs is that they learn which filters to use automatically through training, rather than relying on hand-crafted ones.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L27_FiltersActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "apply",
        label: "Apply a Filter",
        icon: <ScanLine className="w-4 h-4" />,
        content: <ApplyFilterTab />,
      },
      {
        id: "gallery",
        label: "Try Different Filters",
        icon: <Layers className="w-4 h-4" />,
        content: <FilterGalleryTab />,
      },
      {
        id: "build",
        label: "Build Your Own Filter",
        icon: <Wrench className="w-4 h-4" />,
        content: <BuildFilterTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Filters & Convolution"
      level={8}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Discover stride, padding, and pooling - how CNNs handle image sizes!"
      story={
        <StorySection
          paragraphs={[
            "Aru was scrolling through photos on her phone when she paused on a selfie with a fun filter applied.",
            "Aru: \"How does my phone find faces in photos? It seems like magic!\"",
            "Byte: \"It slides a small filter over the image - like a magnifying glass looking for specific patterns. An edge filter finds edges, a blur filter smooths things out. That's convolution!\"",
            "Aru: \"So the phone is basically looking at tiny patches of pixels at a time?\"",
            "Byte: \"Exactly! And different filters detect different things - edges, corners, textures. That's the foundation of how computers see.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Convolution slides a small filter (kernel) over an image, computing a weighted sum at each position. Different kernels detect different features like edges, blur, or sharpness."
        />
      }
    />
  );
}
