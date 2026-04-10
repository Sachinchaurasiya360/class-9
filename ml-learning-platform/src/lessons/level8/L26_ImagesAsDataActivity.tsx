"use client";

import { useState, useMemo, useCallback } from "react";
import { Grid3X3, ZoomIn, Palette, Eraser, Heart } from "lucide-react";

const THEMES = [
  { name: "Coral",    node: "#ff6b6b", glow: "#ff8a8a", accent: "#ffd93d" },
  { name: "Mint",     node: "#4ecdc4", glow: "#7ee0d8", accent: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", accent: "#ffd93d" },
  { name: "Sky",      node: "#6bb6ff", glow: "#94caff", accent: "#ffd93d" },
  { name: "Sunset",   node: "#ffb88c", glow: "#ffd0b3", accent: "#ff6b6b" },
];
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ------------------------------------------------------------------ */
/*  Sketchy palette (matches L18 Perceptron)                           */
/* ------------------------------------------------------------------ */

const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const SKY = "#6bb6ff";
const LAVENDER = "#b18cf2";
const YELLOW = "#ffd93d";
const PAPER = "#fffdf5";
const CREAM = "#fff8e7";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    const t0 = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    const t = (t0 + Math.imul(t0 ^ (t0 >>> 7), 61 | t0)) ^ t0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const BRIGHTNESS_LEVELS = [0, 64, 128, 192, 255];

function grayToHex(v: number): string {
  const h = v.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

function textColor(v: number): string {
  return v > 128 ? INK : "#fff";
}

/* ---- preset pixel art ---- */
const HEART: number[] = [
  0,   192, 192, 0,   0,   192, 192, 0,
  192, 255, 255, 192, 192, 255, 255, 192,
  192, 255, 255, 255, 255, 255, 255, 192,
  192, 255, 255, 255, 255, 255, 255, 192,
  0,   192, 255, 255, 255, 255, 192, 0,
  0,   0,   192, 255, 255, 192, 0,   0,
  0,   0,   0,   192, 192, 0,   0,   0,
  0,   0,   0,   0,   0,   0,   0,   0,
];

const SMILEY: number[] = [
  0,   0,   192, 192, 192, 192, 0,   0,
  0,   192, 255, 255, 255, 255, 192, 0,
  192, 255, 64,  255, 255, 64,  255, 192,
  192, 255, 255, 255, 255, 255, 255, 192,
  192, 255, 64,  255, 255, 64,  255, 192,
  192, 255, 255, 64,  64,  255, 255, 192,
  0,   192, 255, 255, 255, 255, 192, 0,
  0,   0,   192, 192, 192, 192, 0,   0,
];

const COLOR_IMAGE: number[][] = (() => {
  const rand = mulberry32(123);
  const r: number[][] = [];
  for (let i = 0; i < 64; i++) {
    const red = Math.floor(rand() * 200 + 55);
    const green = Math.floor(rand() * 200 + 55);
    const blue = Math.floor(rand() * 200 + 55);
    r.push([red, green, blue]);
  }
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const idx = row * 8 + col;
      r[idx][0] = Math.min(255, Math.floor(row * 36));
      r[idx][1] = Math.min(255, Math.floor(col * 36));
      r[idx][2] = Math.min(255, Math.floor((7 - row) * 36));
    }
  }
  return r;
})();

/* ------------------------------------------------------------------ */
/*  Tab 1 — Pixel Grid                                                 */
/* ------------------------------------------------------------------ */
function PixelGridTab() {
  const [grid, setGrid] = useState<number[]>(() => new Array(64).fill(0));
  const [themeIdx, setThemeIdx] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  const [brightness, setBrightness] = useState(255);
  const theme = THEMES[themeIdx];

  const handleCellClick = useCallback((idx: number) => {
    playPop();
    setGrid((prev) => {
      const next = [...prev];
      next[idx] = next[idx] === brightness ? 0 : brightness;
      return next;
    });
  }, [brightness]);

  const handleClear = useCallback(() => {
    playClick();
    setGrid(new Array(64).fill(0));
  }, []);

  const handleHeart = useCallback(() => {
    playSuccess();
    setGrid([...HEART]);
  }, []);

  const handleSmiley = useCallback(() => {
    playSuccess();
    setGrid([...SMILEY]);
  }, []);

  const litCount = grid.filter((v) => v > 0).length;

  const cellSize = 44;
  const gap = 3;
  const totalSvgSize = cellSize * 8 + gap * 9;

  return (
    <div className="space-y-5">
      {/* Intro card */}
      <div className="card-sketchy p-4" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground">
          🎨 <b>Click any cell</b> to paint it with the current brightness.
          Paint a shape and watch the same picture appear as a grid of numbers on the right!
        </p>
      </div>

      {/* Toolbar: theme + brightness */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-foreground/60" />
          <span className="font-hand text-sm font-bold">Theme:</span>
          <div className="flex gap-1.5">
            {THEMES.map((t, i) => (
              <button key={t.name} onClick={() => { playClick(); setThemeIdx(i); }} title={t.name}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
                style={{ background: t.node }} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-hand text-sm font-bold">Brightness:</span>
          <input type="range" min={0} max={255} step={1} value={brightness}
            onChange={(e) => setBrightness(parseInt(e.target.value))}
            className="w-32 accent-accent-coral" />
          <span className="font-hand text-sm font-bold px-2 py-0.5 rounded border-2 border-foreground"
            style={{ background: grayToHex(brightness), color: textColor(brightness) }}>
            {brightness}
          </span>
        </div>
      </div>

      {/* Grids side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Visual grid */}
        <div className="card-sketchy p-4 notebook-grid">
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center mb-2">
            Picture
          </p>
          <svg
            viewBox={`0 0 ${totalSvgSize} ${totalSvgSize}`}
            className="w-full max-w-[340px] mx-auto rounded-lg"
            style={{ background: INK, padding: 0 }}
          >
            <defs>
              <radialGradient id="px-glow" cx="50%" cy="50%">
                <stop offset="0%" stopColor={theme.glow} stopOpacity={0.85} />
                <stop offset="100%" stopColor={theme.node} stopOpacity={0} />
              </radialGradient>
            </defs>
            {grid.map((val, idx) => {
              const row = Math.floor(idx / 8);
              const col = idx % 8;
              const x = gap + col * (cellSize + gap);
              const y = gap + row * (cellSize + gap);
              const isHovered = hovered === idx;
              return (
                <g key={idx}
                  onClick={() => handleCellClick(idx)}
                  onMouseEnter={() => setHovered(idx)}
                  onMouseLeave={() => setHovered(null)}
                  className="cursor-pointer">
                  <rect
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    fill={grayToHex(val)}
                    stroke={isHovered ? theme.accent : INK}
                    strokeWidth={isHovered ? 2.5 : 1}
                    rx={4}
                    className={isHovered ? "pulse-glow" : ""}
                    style={isHovered ? { color: theme.node } : undefined}
                  />
                  {isHovered && (
                    <rect x={x} y={y} width={cellSize} height={cellSize} fill="url(#px-glow)" rx={4} pointerEvents="none" />
                  )}
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 4}
                    textAnchor="middle"
                    fill={textColor(val)}
                    fontFamily="Kalam"
                    className="text-[12px] font-bold pointer-events-none"
                  >
                    {val}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Number grid */}
        <div className="card-sketchy p-4" style={{ background: PAPER }}>
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center mb-2">
            What the computer sees
          </p>
          <div className="overflow-x-auto">
            <table className="border-collapse mx-auto" style={{ fontFamily: "Kalam" }}>
              <tbody>
                {Array.from({ length: 8 }, (_, row) => (
                  <tr key={row}>
                    {Array.from({ length: 8 }, (_, col) => {
                      const v = grid[row * 8 + col];
                      return (
                        <td
                          key={col}
                          className="text-center text-xs font-bold w-9 h-9 border-2"
                          style={{
                            borderColor: INK,
                            background: `rgba(43, 42, 53, ${(v / 255) * 0.85})`,
                            color: v > 128 ? "#fff" : INK,
                          }}
                        >
                          {v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="font-hand text-xs text-center text-muted-foreground mt-3">
            Lit pixels: <span className="font-bold text-foreground">{litCount}</span> / 64
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        <button
          onClick={handleHeart}
          className="btn-sketchy font-hand text-sm"
          style={{ background: CORAL, color: "#fff" }}
        >
          <Heart className="w-4 h-4" />
          Load Heart
        </button>
        <button
          onClick={handleSmiley}
          className="btn-sketchy font-hand text-sm"
          style={{ background: YELLOW }}
        >
          😊 Load Smiley
        </button>
        <button onClick={handleClear} className="btn-sketchy-outline font-hand text-sm">
          <Eraser className="w-4 h-4" />
          Clear
        </button>
      </div>

      {/* Brightness legend */}
      <div className="card-sketchy p-3" style={{ background: PAPER }}>
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center mb-2">
          Brightness Scale
        </p>
        <div className="flex justify-center items-center gap-2 flex-wrap">
          {BRIGHTNESS_LEVELS.map((v) => (
            <div key={v} className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-md border-2"
                style={{ background: grayToHex(v), borderColor: INK }}
              />
              <span className="font-hand text-xs font-bold mt-1" style={{ color: INK }}>
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🖼️ Every digital image is just a grid of numbers. Each number is how bright one tiny
          pixel is. The computer never sees a picture — it only sees math!
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 — Zoom Into Pixels                                           */
/* ------------------------------------------------------------------ */
function ZoomTab() {
  const [zoom, setZoom] = useState(0);
  const [whichImage, setWhichImage] = useState<"heart" | "smiley">("heart");
  const image = whichImage === "heart" ? HEART : SMILEY;
  const cellSize = 44;
  const gap = 3;
  const svgSize = cellSize * 8 + gap * 9;

  const pixelOpacity = 1 - zoom;
  const numberOpacity = zoom < 0.5 ? 1 : Math.max(0, 1 - (zoom - 0.5) * 2);
  const borderRadius = Math.round(zoom * 20);

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-4" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground">
          🔍 Drag the slider to <b>zoom out</b> from raw pixels to a smooth picture. Notice how
          your eye stitches the squares together.
        </p>
      </div>

      {/* Image picker */}
      <div className="flex justify-center gap-2">
        {(["heart", "smiley"] as const).map((k) => (
          <button
            key={k}
            onClick={() => {
              playClick();
              setWhichImage(k);
            }}
            className="btn-sketchy font-hand text-xs"
            style={
              whichImage === k
                ? { background: k === "heart" ? CORAL : YELLOW, color: k === "heart" ? "#fff" : INK }
                : undefined
            }
          >
            {k === "heart" ? "❤️ Heart" : "😊 Smiley"}
          </button>
        ))}
      </div>

      {/* SVG canvas */}
      <div className="card-sketchy p-4 notebook-grid">
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          className="w-full max-w-[360px] mx-auto rounded-lg"
          style={{ background: INK }}
        >
          {image.map((val, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const x = gap + col * (cellSize + gap);
            const y = gap + row * (cellSize + gap);
            const gapDisplay = gap * (1 - zoom * 0.9);
            const sizeDisplay = cellSize + (gap - gapDisplay);
            const xDisplay = gapDisplay + col * (sizeDisplay + gapDisplay);
            const yDisplay = gapDisplay + row * (sizeDisplay + gapDisplay);
            return (
              <g key={idx}>
                <rect
                  x={xDisplay}
                  y={yDisplay}
                  width={sizeDisplay}
                  height={sizeDisplay}
                  fill={grayToHex(val)}
                  rx={borderRadius}
                  opacity={pixelOpacity > 0.3 ? 1 : 0.3 + pixelOpacity}
                />
                {numberOpacity > 0.05 && (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 4}
                    textAnchor="middle"
                    fill={textColor(val)}
                    fontFamily="Kalam"
                    className="text-[12px] font-bold pointer-events-none"
                    opacity={numberOpacity}
                  >
                    {val}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Slider */}
      <div className="card-sketchy p-4" style={{ background: PAPER }}>
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <span className="font-hand text-sm font-bold" style={{ color: CORAL }}>
            Pixelated
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={zoom}
            onChange={(e) => {
              playPop();
              setZoom(Number(e.target.value));
            }}
            className="w-56"
            style={{ accentColor: LAVENDER }}
          />
          <span className="font-hand text-sm font-bold" style={{ color: MINT }}>
            Smooth
          </span>
        </div>
        <p className="font-hand text-xs text-center text-muted-foreground mt-2">
          Zoom: <span className="font-bold text-foreground">{Math.round(zoom * 100)}%</span>
        </p>
      </div>

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          🔬 No matter how smooth a photo looks, zoom in far enough and you'll always find tiny
          square pixels — each one just a number. High-resolution images simply have millions of
          these tiny squares.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 — Color Channels                                             */
/* ------------------------------------------------------------------ */
function ColorChannelsTab() {
  const [showR, setShowR] = useState(true);
  const [showG, setShowG] = useState(true);
  const [showB, setShowB] = useState(true);
  const [adjustChannel, setAdjustChannel] = useState<"r" | "g" | "b">("r");
  const [adjustment, setAdjustment] = useState(0);

  const image = useMemo(() => {
    return COLOR_IMAGE.map(([r, g, b]) => {
      const ar = adjustChannel === "r" ? Math.min(255, Math.max(0, r + adjustment)) : r;
      const ag = adjustChannel === "g" ? Math.min(255, Math.max(0, g + adjustment)) : g;
      const ab = adjustChannel === "b" ? Math.min(255, Math.max(0, b + adjustment)) : b;
      return [ar, ag, ab];
    });
  }, [adjustChannel, adjustment]);

  const cellSize = 30;
  const gap = 2;
  const gridSize = cellSize * 8 + gap * 9;

  const renderChannelGrid = (channel: 0 | 1 | 2, label: string, color: string) => (
    <div className="card-sketchy p-2" style={{ background: PAPER }}>
      <p className="font-hand text-xs font-bold text-center mb-1" style={{ color }}>
        {label}
      </p>
      <svg
        viewBox={`0 0 ${gridSize} ${gridSize}`}
        className="w-full max-w-[140px] mx-auto rounded"
        style={{ background: INK }}
      >
        {image.map((pixel, idx) => {
          const row = Math.floor(idx / 8);
          const col = idx % 8;
          const x = gap + col * (cellSize + gap);
          const y = gap + row * (cellSize + gap);
          const val = pixel[channel];
          const channelHex = val.toString(16).padStart(2, "0");
          const fill =
            channel === 0
              ? `#${channelHex}0000`
              : channel === 1
              ? `#00${channelHex}00`
              : `#0000${channelHex}`;
          return (
            <g key={idx}>
              <rect x={x} y={y} width={cellSize} height={cellSize} fill={fill} rx={2} />
              <text
                x={x + cellSize / 2}
                y={y + cellSize / 2 + 3}
                textAnchor="middle"
                fill="#fff"
                fontFamily="Kalam"
                className="text-[9px] font-bold pointer-events-none"
              >
                {val}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-4" style={{ background: CREAM }}>
        <p className="font-hand text-base text-foreground">
          🌈 Every color pixel is <b>three numbers</b>: how much Red, Green, and Blue. Toggle
          channels and slide the adjuster to see how they mix.
        </p>
      </div>

      {/* Channel toggles */}
      <div className="flex gap-2 justify-center flex-wrap">
        {(
          [
            ["Red", showR, setShowR, CORAL],
            ["Green", showG, setShowG, MINT],
            ["Blue", showB, setShowB, SKY],
          ] as const
        ).map(([label, active, setter, bg]) => (
          <button
            key={label}
            onClick={() => {
              playPop();
              (setter as (v: boolean) => void)(!active);
            }}
            className="btn-sketchy font-hand text-xs"
            style={
              active
                ? { background: bg, color: "#fff" }
                : { background: PAPER, color: INK, opacity: 0.55 }
            }
          >
            {label}: {active ? "ON" : "OFF"}
          </button>
        ))}
      </div>

      {/* Channel grids + combined */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 justify-items-center">
        {renderChannelGrid(0, "Red", CORAL)}
        {renderChannelGrid(1, "Green", MINT)}
        {renderChannelGrid(2, "Blue", SKY)}
        <div
          className="card-sketchy p-2"
          style={{ background: YELLOW + "33" }}
        >
          <p className="font-hand text-xs font-bold text-center mb-1" style={{ color: INK }}>
            Combined
          </p>
          <svg
            viewBox={`0 0 ${gridSize} ${gridSize}`}
            className="w-full max-w-[140px] mx-auto rounded"
            style={{ background: INK }}
          >
            {image.map((pixel, idx) => {
              const row = Math.floor(idx / 8);
              const col = idx % 8;
              const x = gap + col * (cellSize + gap);
              const y = gap + row * (cellSize + gap);
              const r = showR ? pixel[0] : 0;
              const g = showG ? pixel[1] : 0;
              const b = showB ? pixel[2] : 0;
              return (
                <rect
                  key={idx}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  fill={`rgb(${r},${g},${b})`}
                  rx={2}
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Channel adjustment */}
      <div className="card-sketchy p-4 space-y-3" style={{ background: PAPER }}>
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground text-center">
          Tweak a channel
        </p>
        <div className="flex items-center gap-3 justify-center flex-wrap">
          <span className="font-hand text-sm font-bold">Adjust:</span>
          {(["r", "g", "b"] as const).map((ch) => {
            const c = ch === "r" ? CORAL : ch === "g" ? MINT : SKY;
            const active = adjustChannel === ch;
            return (
              <button
                key={ch}
                onClick={() => {
                  playClick();
                  setAdjustChannel(ch);
                  setAdjustment(0);
                }}
                className="btn-sketchy font-hand text-xs"
                style={active ? { background: c, color: "#fff" } : undefined}
              >
                {ch.toUpperCase()}
              </button>
            );
          })}
          <input
            type="range"
            min={-128}
            max={128}
            step={8}
            value={adjustment}
            onChange={(e) => {
              playPop();
              setAdjustment(Number(e.target.value));
            }}
            className="w-40"
            style={{
              accentColor:
                adjustChannel === "r" ? CORAL : adjustChannel === "g" ? MINT : SKY,
            }}
          />
          <span
            className="font-hand text-sm font-bold px-2 py-0.5 rounded border-2 border-foreground"
            style={{ background: YELLOW }}
          >
            {adjustment > 0 ? `+${adjustment}` : adjustment}
          </span>
        </div>
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🎨 Every color on your screen is made by mixing just three colors. (255, 0, 0) is pure
          red, (0, 255, 0) is pure green. Mix them all to get every color in the rainbow!
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
      "A pixel (picture element) is the smallest unit of a digital image — a tiny square with a color or brightness value.",
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
      "Digital screens use RGB — Red, Green, and Blue channels — mixed together to produce every color.",
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
        label: "Pixel Grid",
        icon: <Grid3X3 className="w-4 h-4" />,
        content: <PixelGridTab />,
      },
      {
        id: "zoom",
        label: "Zoom Into Pixels",
        icon: <ZoomIn className="w-4 h-4" />,
        content: <ZoomTab />,
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
      nextLessonHint="Next: Learn about filters — how computers detect edges and patterns in images!"
      story={
        <StorySection
          paragraphs={[
            "Aru held up her phone and snapped a photo of Byte sitting on the desk.",
            "Aru: \"Look Byte, I took your picture! But how does the computer actually store this?\"",
            "Byte: \"Zoom in really close — see those tiny squares? Each one is a pixel, and each pixel is just a number for brightness!\"",
            "Aru: \"So my beautiful photo is... just a bunch of numbers?\"",
            "Byte: \"Exactly! An image is just a grid of numbers. Computers don't see pictures, they see math!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="A digital image is a grid of pixels. Each pixel is just a number (0-255 for grayscale). Color images use three numbers per pixel — one each for Red, Green, and Blue."
        />
      }
    />
  );
}
