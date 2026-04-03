import { useState, useMemo, useCallback } from "react";
import { Grid3X3, ZoomIn, Palette } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop, playSuccess } from "../../utils/sounds";

/* ---- helpers ---- */
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
  return v > 128 ? "#000" : "#fff";
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

const COLOR_IMAGE: number[][] = (() => {
  const rand = mulberry32(123);
  const r: number[][] = [];
  for (let i = 0; i < 64; i++) {
    const red = Math.floor(rand() * 200 + 55);
    const green = Math.floor(rand() * 200 + 55);
    const blue = Math.floor(rand() * 200 + 55);
    r.push([red, green, blue]);
  }
  // Make it a gradient-ish pattern for better visual
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const idx = row * 8 + col;
      r[idx][0] = Math.min(255, Math.floor(row * 36));       // R increases down
      r[idx][1] = Math.min(255, Math.floor(col * 36));       // G increases right
      r[idx][2] = Math.min(255, Math.floor((7 - row) * 36)); // B decreases down
    }
  }
  return r;
})();

/* ------------------------------------------------------------------ */
/*  Tab 1 -- Pixel Grid                                                */
/* ------------------------------------------------------------------ */
function PixelGridTab() {
  const [grid, setGrid] = useState<number[]>(() => new Array(64).fill(0));

  const handleCellClick = useCallback((idx: number) => {
    playPop();
    setGrid((prev) => {
      const next = [...prev];
      const curLevel = BRIGHTNESS_LEVELS.indexOf(next[idx]);
      const nextLevel = (curLevel + 1) % BRIGHTNESS_LEVELS.length;
      next[idx] = BRIGHTNESS_LEVELS[nextLevel];
      return next;
    });
  }, []);

  const handleClear = useCallback(() => {
    playClick();
    setGrid(new Array(64).fill(0));
  }, []);

  const handlePreset = useCallback(() => {
    playSuccess();
    setGrid([...HEART]);
  }, []);

  const cellSize = 44;
  const gap = 2;
  const totalSvgSize = cellSize * 8 + gap * 9;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Click cells to cycle through brightness levels (0, 64, 128, 192, 255). Paint a shape and see its number grid!
      </p>

      <div className="flex flex-col lg:flex-row gap-4 items-start justify-center">
        {/* Visual grid */}
        <svg viewBox={`0 0 ${totalSvgSize} ${totalSvgSize}`} className="w-full max-w-[320px] bg-slate-800 rounded-lg">
          {grid.map((val, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const x = gap + col * (cellSize + gap);
            const y = gap + row * (cellSize + gap);
            return (
              <g key={idx} onClick={() => handleCellClick(idx)} className="cursor-pointer">
                <rect x={x} y={y} width={cellSize} height={cellSize} fill={grayToHex(val)} rx={3} className="hover:opacity-80 transition-opacity" />
                <text x={x + cellSize / 2} y={y + cellSize / 2 + 5} textAnchor="middle" fill={textColor(val)} className="text-[11px] font-mono font-bold pointer-events-none">
                  {val}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Number grid */}
        <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 overflow-x-auto">
          <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Numeric Grid</p>
          <table className="border-collapse">
            <tbody>
              {Array.from({ length: 8 }, (_, row) => (
                <tr key={row}>
                  {Array.from({ length: 8 }, (_, col) => (
                    <td key={col} className="text-center font-mono text-xs px-2 py-1 border border-slate-200" style={{ backgroundColor: `rgba(0,0,0,${grid[row * 8 + col] / 255 * 0.15})` }}>
                      {grid[row * 8 + col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button onClick={handlePreset} className="px-4 py-2 rounded-lg text-sm font-semibold bg-pink-500 text-white hover:bg-pink-600 transition-all shadow-sm">
          Load Heart
        </button>
        <button onClick={handleClear} className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-all">
          Clear
        </button>
      </div>

      <InfoBox variant="blue" title="Images = Numbers">
        Every digital image is just a grid of numbers. Each number represents how bright one tiny pixel is. The computer never sees a picture — it only sees math!
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 -- Zoom Into Pixels                                          */
/* ------------------------------------------------------------------ */
function ZoomTab() {
  const [zoom, setZoom] = useState(0);
  const image = HEART;
  const cellSize = 44;
  const gap = 2;
  const svgSize = cellSize * 8 + gap * 9;

  const pixelOpacity = 1 - zoom;
  const numberOpacity = zoom < 0.5 ? 1 : Math.max(0, 1 - (zoom - 0.5) * 2);
  const borderRadius = Math.round(zoom * 20);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Slide the zoom slider to see the heart go from individual pixels with numbers to a smoother image.
      </p>

      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} className="w-full max-w-[340px] mx-auto bg-slate-800 rounded-lg">
        <defs>
          <filter id="blur-filter">
            <feGaussianBlur stdDeviation={zoom * 4} />
          </filter>
        </defs>
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
                x={xDisplay} y={yDisplay}
                width={sizeDisplay} height={sizeDisplay}
                fill={grayToHex(val)}
                rx={borderRadius}
                opacity={pixelOpacity > 0.3 ? 1 : 0.3 + pixelOpacity}
              />
              {numberOpacity > 0.05 && (
                <text
                  x={x + cellSize / 2} y={y + cellSize / 2 + 5}
                  textAnchor="middle" fill={textColor(val)}
                  className="text-[11px] font-mono font-bold pointer-events-none"
                  opacity={numberOpacity}
                >
                  {val}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="flex items-center gap-3 justify-center">
        <span className="text-xs font-semibold text-slate-500">Pixelated</span>
        <input
          type="range" min={0} max={1} step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-48 accent-indigo-500"
        />
        <span className="text-xs font-semibold text-slate-500">Smooth</span>
      </div>

      <InfoBox variant="amber" title="Zoom Reveals the Truth">
        No matter how smooth a photo looks, zoom in far enough and you will always find tiny square pixels — each one just a number. High-resolution images simply have millions of these tiny squares.
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 -- Color Channels                                            */
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

  const cellSize = 34;
  const gap = 1;
  const gridSize = cellSize * 8 + gap * 9;

  const renderChannelGrid = useCallback((channel: 0 | 1 | 2, label: string, color: string) => {
    return (
      <div>
        <p className={`text-xs font-bold mb-1 text-center`} style={{ color }}>{label}</p>
        <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="w-full max-w-[150px] bg-slate-100 rounded">
          {image.map((pixel, idx) => {
            const row = Math.floor(idx / 8);
            const col = idx % 8;
            const x = gap + col * (cellSize + gap);
            const y = gap + row * (cellSize + gap);
            const val = pixel[channel];
            const channelHex = val.toString(16).padStart(2, "0");
            const fill = channel === 0 ? `#${channelHex}0000` : channel === 1 ? `#00${channelHex}00` : `#0000${channelHex}`;
            return (
              <g key={idx}>
                <rect x={x} y={y} width={cellSize} height={cellSize} fill={fill} rx={2} />
                <text x={x + cellSize / 2} y={y + cellSize / 2 + 4} textAnchor="middle" fill="#fff" className="text-[8px] font-mono pointer-events-none">
                  {val}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }, [image, gridSize]);

  const renderCombined = useCallback(() => {
    return (
      <svg viewBox={`0 0 ${gridSize} ${gridSize}`} className="w-full max-w-[150px] bg-slate-100 rounded">
        {image.map((pixel, idx) => {
          const row = Math.floor(idx / 8);
          const col = idx % 8;
          const x = gap + col * (cellSize + gap);
          const y = gap + row * (cellSize + gap);
          const r = showR ? pixel[0] : 0;
          const g = showG ? pixel[1] : 0;
          const b = showB ? pixel[2] : 0;
          return (
            <rect key={idx} x={x} y={y} width={cellSize} height={cellSize} fill={`rgb(${r},${g},${b})`} rx={2} />
          );
        })}
      </svg>
    );
  }, [image, showR, showG, showB, gridSize]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">
        Every color pixel has three numbers: Red, Green, and Blue. Toggle channels on/off to see how they combine!
      </p>

      {/* Channel toggles */}
      <div className="flex gap-3 justify-center flex-wrap">
        {([["Red", showR, setShowR, "bg-red-500"], ["Green", showG, setShowG, "bg-green-500"], ["Blue", showB, setShowB, "bg-blue-500"]] as const).map(([label, active, setter, bg]) => (
          <button
            key={label}
            onClick={() => { playPop(); (setter as (v: boolean) => void)(!active); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-sm ${active ? bg : "bg-slate-300"}`}
          >
            {label}: {active ? "ON" : "OFF"}
          </button>
        ))}
      </div>

      {/* Grids */}
      <div className="flex gap-3 justify-center flex-wrap items-start">
        {renderChannelGrid(0, "Red", "#ef4444")}
        {renderChannelGrid(1, "Green", "#22c55e")}
        {renderChannelGrid(2, "Blue", "#3b82f6")}
        <div>
          <p className="text-xs font-bold mb-1 text-center text-slate-600">Combined</p>
          {renderCombined()}
        </div>
      </div>

      {/* Channel adjustment */}
      <div className="flex items-center gap-3 justify-center flex-wrap">
        <span className="text-xs font-semibold text-slate-500">Adjust:</span>
        {(["r", "g", "b"] as const).map((ch) => (
          <button
            key={ch}
            onClick={() => { playClick(); setAdjustChannel(ch); setAdjustment(0); }}
            className={`px-2 py-1 rounded text-xs font-bold ${adjustChannel === ch ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"}`}
          >
            {ch.toUpperCase()}
          </button>
        ))}
        <input
          type="range" min={-128} max={128} step={8} value={adjustment}
          onChange={(e) => setAdjustment(Number(e.target.value))}
          className="w-36 accent-indigo-500"
        />
        <span className="text-xs font-mono text-slate-500">{adjustment > 0 ? `+${adjustment}` : adjustment}</span>
      </div>

      <InfoBox variant="green" title="RGB = Red + Green + Blue">
        Every color on your screen is made by mixing just three colors. (255, 0, 0) is pure red, (0, 255, 0) is pure green. Mix them to get any color in the rainbow!
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
    options: ["A type of camera", "The smallest unit of a digital image", "A computer program", "A color name"],
    correctIndex: 1,
    explanation: "A pixel (picture element) is the smallest unit of a digital image — a tiny square with a color or brightness value.",
  },
  {
    question: "How does a computer represent a grayscale image?",
    options: ["As a paragraph of text", "As a grid of numbers (0-255)", "As a sound wave", "As a single number"],
    correctIndex: 1,
    explanation: "A grayscale image is stored as a 2D grid where each cell holds a brightness value from 0 (black) to 255 (white).",
  },
  {
    question: "What are the three color channels in a digital color image?",
    options: ["Hue, Saturation, Brightness", "Cyan, Magenta, Yellow", "Red, Green, Blue", "Light, Medium, Dark"],
    correctIndex: 2,
    explanation: "Digital screens use RGB — Red, Green, and Blue channels — mixed together to produce every color.",
  },
  {
    question: "What happens when you zoom into a digital image far enough?",
    options: ["It becomes 3D", "You see individual square pixels", "It disappears", "It turns black and white"],
    correctIndex: 1,
    explanation: "Every digital image is composed of tiny square pixels. Zooming in reveals these individual squares.",
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
