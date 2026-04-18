"use client";

import { useMemo, useState } from "react";
import { Grid3X3, BarChart3, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick } from "../../utils/sounds";
import { ImageGrid, DEMO_IMAGES } from "@/components/viz/cnn";
import type { Pixels2D } from "@/components/viz/cnn";
import { Histogram } from "@/components/viz/data-viz";

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
/*  Helpers - scale the 0..1 DEMO_IMAGES values into 0..255 so          */
/*  students see the familiar "pixel brightness" number.                */
/* ------------------------------------------------------------------ */
function to255(img: Pixels2D): Pixels2D {
  return img.map((row) => row.map((v) => Math.round(v * 255)));
}

function flat(img: Pixels2D): number[] {
  const out: number[] = [];
  for (const row of img) for (const v of row) out.push(v);
  return out;
}

const DIGIT3_255 = to255(DEMO_IMAGES.digit3);
const SMILEY_255 = to255(DEMO_IMAGES.smiley);
const LETTER_X_255 = to255(DEMO_IMAGES.letterX);

/* ------------------------------------------------------------------ */
/*  Tab 1 - Grayscale Grid of Numbers                                   */
/* ------------------------------------------------------------------ */
function PixelGridTab() {
  const [which, setWhich] = useState<"digit3" | "smiley" | "letterX">("digit3");
  const [showValues, setShowValues] = useState(true);

  const pixels =
    which === "digit3"
      ? DIGIT3_255
      : which === "smiley"
      ? SMILEY_255
      : LETTER_X_255;

  const H = pixels.length;
  const W = pixels[0]?.length ?? 0;
  const litCount = flat(pixels).filter((v) => v > 0).length;

  return (
    <div className="space-y-5">
      <RikuSays>
        An image is just numbers in a grid. Each number tells you how bright
        that pixel is. That&apos;s it. Mind blown, right?
      </RikuSays>

      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <span className="font-hand text-sm font-bold">Pick an image:</span>
        {(
          [
            ["digit3", "3"],
            ["smiley", "smiley"],
            ["letterX", "letter X"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              playClick();
              setWhich(k);
            }}
            className={
              which === k ? "btn-sketchy" : "btn-sketchy-outline"
            }
          >
            {label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            playClick();
            setShowValues((s) => !s);
          }}
          className="btn-sketchy-outline"
        >
          {showValues ? "hide numbers" : "show numbers"}
        </button>
      </div>

      <div className="card-sketchy p-4 notebook-grid flex flex-col items-center gap-3">
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
          {W}×{H} pixel grid - every cell is a single number (0 = black, 255 = white)
        </p>
        <ImageGrid
          pixels={pixels}
          cellSize={showValues ? 42 : 30}
          showValues={showValues}
          colormap="gray"
          valueRange={[0, 255]}
        />
        <p className="font-hand text-xs text-center text-muted-foreground">
          lit pixels: <span className="font-bold text-foreground">{litCount}</span> / {W * H}
        </p>
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🖼️ Every digital image is just a grid of numbers. Each number is how bright one tiny
          pixel is. The computer never sees a picture - it only sees math!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 - Brightness = Number (pixel histogram)                       */
/* ------------------------------------------------------------------ */
function BrightnessTab() {
  const [which, setWhich] = useState<"digit3" | "smiley" | "letterX">("smiley");

  const pixels =
    which === "digit3"
      ? DIGIT3_255
      : which === "smiley"
      ? SMILEY_255
      : LETTER_X_255;

  const values = useMemo(() => flat(pixels), [pixels]);
  const mean =
    values.reduce((a, b) => a + b, 0) / Math.max(1, values.length);
  const dark = values.filter((v) => v < 85).length;
  const mid = values.filter((v) => v >= 85 && v < 170).length;
  const bright = values.filter((v) => v >= 170).length;

  return (
    <div className="space-y-5">
      <RikuSays>
        Here&apos;s the wild part: the only thing that changes a pixel is a
        number between 0 and 255. Low number = dark, high number = bright. Now
        count how many pixels sit at each brightness and you get a histogram.
      </RikuSays>

      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <span className="font-hand text-sm font-bold">Image:</span>
        {(
          [
            ["smiley", "smiley"],
            ["digit3", "3"],
            ["letterX", "letter X"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              playClick();
              setWhich(k);
            }}
            className={
              which === k ? "btn-sketchy" : "btn-sketchy-outline"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4 items-start">
        <div className="card-sketchy p-4 flex flex-col items-center gap-2 notebook-grid">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
            the image
          </p>
          <ImageGrid
            pixels={pixels}
            cellSize={24}
            colormap="gray"
            valueRange={[0, 255]}
          />
        </div>

        <div className="card-sketchy p-4">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center mb-2">
            distribution of pixel brightness
          </p>
          <Histogram
            data={values}
            bins={8}
            width={460}
            height={260}
            xLabel="pixel value (0-255)"
            yLabel="# of pixels"
            color="var(--accent-sky)"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="card-sketchy p-3 text-center">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
            dark (0-84)
          </p>
          <p className="font-hand text-2xl font-bold">{dark}</p>
        </div>
        <div className="card-sketchy p-3 text-center">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
            mid (85-169)
          </p>
          <p className="font-hand text-2xl font-bold">{mid}</p>
        </div>
        <div className="card-sketchy p-3 text-center">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
            bright (170-255)
          </p>
          <p className="font-hand text-2xl font-bold">{bright}</p>
        </div>
      </div>

      <p className="font-hand text-sm text-center text-muted-foreground">
        average brightness:{" "}
        <span className="font-bold text-foreground">{mean.toFixed(1)}</span>
      </p>

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          🔬 Every brightness value is just a number between 0 and 255. The
          histogram counts how many pixels sit in each bucket - a quick
          fingerprint of the whole image.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 - Color = 3 Grids (R, G, B)                                   */
/* ------------------------------------------------------------------ */
function ColorChannelsTab() {
  // Build a synthetic little 8x8 "color card" - three separate channel grids.
  // Each channel is its own Pixels2D, 0..255.
  const rChannel: Pixels2D = useMemo(() => {
    const out: Pixels2D = [];
    for (let y = 0; y < 8; y++) {
      const row: number[] = [];
      for (let x = 0; x < 8; x++) row.push(Math.round((x / 7) * 255));
      out.push(row);
    }
    return out;
  }, []);

  const gChannel: Pixels2D = useMemo(() => {
    const out: Pixels2D = [];
    for (let y = 0; y < 8; y++) {
      const row: number[] = [];
      for (let x = 0; x < 8; x++) row.push(Math.round((y / 7) * 255));
      out.push(row);
    }
    return out;
  }, []);

  const bChannel: Pixels2D = useMemo(() => {
    const out: Pixels2D = [];
    for (let y = 0; y < 8; y++) {
      const row: number[] = [];
      for (let x = 0; x < 8; x++)
        row.push(Math.round((((7 - y) + (7 - x)) / 14) * 255));
      out.push(row);
    }
    return out;
  }, []);

  const [showR, setShowR] = useState(true);
  const [showG, setShowG] = useState(true);
  const [showB, setShowB] = useState(true);

  const cellSize = 22;
  const gap = 2;
  const svgSize = 8 * cellSize + gap * 9;

  return (
    <div className="space-y-5">
      <RikuSays>
        A color image isn&apos;t one grid - it&apos;s <b>three</b> grids stacked up. One for red,
        one for green, one for blue. Each pixel becomes three numbers. Every
        color on your screen is a recipe: &quot;this much red, this much green,
        this much blue.&quot;
      </RikuSays>

      <div className="flex gap-2 justify-center flex-wrap">
        {(
          [
            ["Red", showR, setShowR, "var(--accent-coral)"],
            ["Green", showG, setShowG, "var(--accent-mint)"],
            ["Blue", showB, setShowB, "var(--accent-sky)"],
          ] as const
        ).map(([label, active, setter, bg]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              playClick();
              (setter as (v: boolean) => void)(!active);
            }}
            className="btn-sketchy font-hand text-xs"
            style={
              active
                ? { background: bg, color: "#fff" }
                : { opacity: 0.55 }
            }
          >
            {label}: {active ? "ON" : "OFF"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card-sketchy p-3 flex flex-col items-center">
          <p
            className="font-hand text-xs font-bold text-center mb-2"
            style={{ color: "var(--accent-coral)" }}
          >
            RED channel
          </p>
          <ImageGrid
            pixels={rChannel}
            cellSize={22}
            colormap="coral"
            valueRange={[0, 255]}
            showValues
          />
        </div>
        <div className="card-sketchy p-3 flex flex-col items-center">
          <p
            className="font-hand text-xs font-bold text-center mb-2"
            style={{ color: "var(--accent-mint)" }}
          >
            GREEN channel
          </p>
          <ImageGrid
            pixels={gChannel}
            cellSize={22}
            colormap="mint"
            valueRange={[0, 255]}
            showValues
          />
        </div>
        <div className="card-sketchy p-3 flex flex-col items-center">
          <p
            className="font-hand text-xs font-bold text-center mb-2"
            style={{ color: "var(--accent-sky)" }}
          >
            BLUE channel
          </p>
          <ImageGrid
            pixels={bChannel}
            cellSize={22}
            colormap="viridis"
            valueRange={[0, 255]}
            showValues
          />
        </div>
      </div>

      <div className="card-sketchy p-4 flex flex-col items-center">
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center mb-2">
          combined (R + G + B)
        </p>
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full max-w-[220px] rounded-lg"
          style={{ background: "#2b2a35" }}
        >
          {rChannel.map((row, y) =>
            row.map((_, x) => {
              const r = showR ? rChannel[y][x] : 0;
              const g = showG ? gChannel[y][x] : 0;
              const b = showB ? bChannel[y][x] : 0;
              const cx = gap + x * (cellSize + gap);
              const cy = gap + y * (cellSize + gap);
              return (
                <rect
                  key={`c-${y}-${x}`}
                  x={cx}
                  y={cy}
                  width={cellSize}
                  height={cellSize}
                  fill={`rgb(${r},${g},${b})`}
                  rx={2}
                />
              );
            })
          )}
        </svg>
        <p className="font-hand text-xs text-muted-foreground text-center mt-2">
          mixing the three channels gives you every color your screen can show
        </p>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🎨 Color images use three numbers per pixel - one each for Red,
          Green, Blue. (255, 0, 0) is pure red, (0, 255, 0) is pure green,
          (255, 255, 0) mixes to yellow. Three grids, stacked.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */
const quizQuestions = [
  {
    question: "What is a pixel?",
    options: [
      "A type of camera",
      "The smallest unit of a digital image",
      "A computer program",
      "A color name",
    ],
    correctIndex: 1,
    explanation:
      "A pixel (picture element) is the smallest unit of a digital image - a tiny square with a color or brightness value.",
  },
  {
    question: "How does a computer represent a grayscale image?",
    options: [
      "As a paragraph of text",
      "As a grid of numbers (0-255)",
      "As a sound wave",
      "As a single number",
    ],
    correctIndex: 1,
    explanation:
      "A grayscale image is stored as a 2D grid where each cell holds a brightness value from 0 (black) to 255 (white).",
  },
  {
    question: "What are the three color channels in a digital color image?",
    options: [
      "Hue, Saturation, Brightness",
      "Cyan, Magenta, Yellow",
      "Red, Green, Blue",
      "Light, Medium, Dark",
    ],
    correctIndex: 2,
    explanation:
      "Digital screens use RGB - Red, Green, and Blue channels - mixed together to produce every color.",
  },
  {
    question: "What happens when you zoom into a digital image far enough?",
    options: [
      "It becomes 3D",
      "You see individual square pixels",
      "It disappears",
      "It turns black and white",
    ],
    correctIndex: 1,
    explanation:
      "Every digital image is composed of tiny square pixels. Zooming in reveals these individual squares.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
export default function L26_ImagesAsDataActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "pixel-grid",
        label: "Grid of Numbers",
        icon: <Grid3X3 className="w-4 h-4" />,
        content: <PixelGridTab />,
      },
      {
        id: "brightness",
        label: "Brightness = Number",
        icon: <BarChart3 className="w-4 h-4" />,
        content: <BrightnessTab />,
      },
      {
        id: "channels",
        label: "Color Channels",
        icon: <Palette className="w-4 h-4" />,
        content: <ColorChannelsTab />,
      },
    ],
    [],
  );

  return (
    <LessonShell
      title="Images as Data"
      level={8}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Next: Learn about filters - how computers detect edges and patterns in images!"
      story={
        <StorySection
          paragraphs={[
            "Aru held up her phone and snapped a photo of Byte sitting on the desk.",
            "Aru: \"Look Byte, I took your picture! But how does the computer actually store this?\"",
            "Byte: \"Zoom in really close - see those tiny squares? Each one is a pixel, and each pixel is just a number for brightness!\"",
            "Aru: \"So my beautiful photo is... just a bunch of numbers?\"",
            "Byte: \"Exactly! An image is just a grid of numbers. Computers don't see pictures, they see math!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A digital image is a grid of pixels. Each pixel is just a number (0-255 for grayscale). Color images use three numbers per pixel - one each for Red, Green, and Blue."
        />
      }
    />
  );
}
