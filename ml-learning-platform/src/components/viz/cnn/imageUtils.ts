// Pure TS helpers for the CNN / image visualization library.
// No external deps - just math and typed arrays.

import type {
  ColormapName,
  FilterKernel,
  NamedFilter,
  Pixels2D,
  PoolingType,
} from "./types";

// ---------------------------------------------------------------------------
// Deterministic PRNG so demos look identical across reloads.
// ---------------------------------------------------------------------------
export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Basic shape helpers.
// ---------------------------------------------------------------------------
export function rows(img: Pixels2D): number {
  return img.length;
}

export function cols(img: Pixels2D): number {
  return img.length > 0 ? img[0].length : 0;
}

export function makeZeros(h: number, w: number): Pixels2D {
  const out: Pixels2D = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) row.push(0);
    out.push(row);
  }
  return out;
}

export function clonePixels(img: Pixels2D): Pixels2D {
  return img.map((row) => row.slice());
}

// ---------------------------------------------------------------------------
// normalizeImage - scales arbitrary pixel range to [0, 1].
// If min/max are not supplied, they are computed from the image itself.
// ---------------------------------------------------------------------------
export function normalizeImage(
  pixels: Pixels2D,
  min?: number,
  max?: number
): Pixels2D {
  let lo = min ?? Infinity;
  let hi = max ?? -Infinity;
  if (min === undefined || max === undefined) {
    for (const row of pixels) {
      for (const v of row) {
        if (v < lo) lo = v;
        if (v > hi) hi = v;
      }
    }
  }
  const span = hi - lo;
  if (span <= 1e-9) {
    return pixels.map((row) => row.map(() => 0));
  }
  return pixels.map((row) => row.map((v) => (v - lo) / span));
}

// ---------------------------------------------------------------------------
// Convolution. Simple single-channel 2D convolution (cross-correlation really,
// no kernel flip - matches the convention most teaching materials use).
// Supports integer stride and symmetric zero-padding.
// ---------------------------------------------------------------------------
export function convolve2d(
  image: Pixels2D,
  kernel: FilterKernel,
  stride: number = 1,
  padding: number = 0
): Pixels2D {
  const H = rows(image);
  const W = cols(image);
  const kH = rows(kernel);
  const kW = cols(kernel);
  const outH = Math.floor((H + 2 * padding - kH) / stride) + 1;
  const outW = Math.floor((W + 2 * padding - kW) / stride) + 1;
  if (outH <= 0 || outW <= 0) return [];

  const out = makeZeros(outH, outW);
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      let sum = 0;
      for (let ky = 0; ky < kH; ky++) {
        for (let kx = 0; kx < kW; kx++) {
          const iy = oy * stride + ky - padding;
          const ix = ox * stride + kx - padding;
          let v = 0;
          if (iy >= 0 && iy < H && ix >= 0 && ix < W) v = image[iy][ix];
          sum += v * kernel[ky][kx];
        }
      }
      out[oy][ox] = sum;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Max / Average pooling.
// ---------------------------------------------------------------------------
function pool2d(
  input: Pixels2D,
  size: number,
  stride: number,
  type: PoolingType
): Pixels2D {
  const H = rows(input);
  const W = cols(input);
  const outH = Math.floor((H - size) / stride) + 1;
  const outW = Math.floor((W - size) / stride) + 1;
  if (outH <= 0 || outW <= 0) return [];
  const out = makeZeros(outH, outW);
  for (let oy = 0; oy < outH; oy++) {
    for (let ox = 0; ox < outW; ox++) {
      let agg = type === "max" ? -Infinity : 0;
      let count = 0;
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const iy = oy * stride + dy;
          const ix = ox * stride + dx;
          if (iy < H && ix < W) {
            const v = input[iy][ix];
            if (type === "max") {
              if (v > agg) agg = v;
            } else {
              agg += v;
              count += 1;
            }
          }
        }
      }
      out[oy][ox] =
        type === "max" ? (agg === -Infinity ? 0 : agg) : count > 0 ? agg / count : 0;
    }
  }
  return out;
}

export function maxPool2d(
  input: Pixels2D,
  size: number = 2,
  stride: number = 2
): Pixels2D {
  return pool2d(input, size, stride, "max");
}

export function avgPool2d(
  input: Pixels2D,
  size: number = 2,
  stride: number = 2
): Pixels2D {
  return pool2d(input, size, stride, "avg");
}

// ---------------------------------------------------------------------------
// Which cell "won" inside a max-pool window? Returns {y, x} within the input.
// Used by PoolingViz to highlight the selected cell.
// ---------------------------------------------------------------------------
export function maxPoolArgmax(
  input: Pixels2D,
  outY: number,
  outX: number,
  size: number,
  stride: number
): { y: number; x: number } {
  let best = -Infinity;
  let by = outY * stride;
  let bx = outX * stride;
  const H = rows(input);
  const W = cols(input);
  for (let dy = 0; dy < size; dy++) {
    for (let dx = 0; dx < size; dx++) {
      const iy = outY * stride + dy;
      const ix = outX * stride + dx;
      if (iy < H && ix < W && input[iy][ix] > best) {
        best = input[iy][ix];
        by = iy;
        bx = ix;
      }
    }
  }
  return { y: by, x: bx };
}

// ---------------------------------------------------------------------------
// Colormaps - map a normalized value v in [0, 1] to an rgb/rgba string.
// We clamp automatically so callers can pass raw activations.
// ---------------------------------------------------------------------------
function clamp01(v: number): number {
  if (!isFinite(v)) return 0;
  if (v < 0) return 0;
  if (v > 1) return 1;
  return v;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

function rgb(r: number, g: number, b: number): RGB {
  return { r, g, b };
}

function rgbToString({ r, g, b }: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

// Linearly interpolate through a list of anchor colors.
function gradient(stops: RGB[]): (v: number) => string {
  return (raw: number) => {
    const t = clamp01(raw);
    if (stops.length === 0) return "#fdfbf6";
    if (stops.length === 1) return rgbToString(stops[0]);
    const scaled = t * (stops.length - 1);
    const i = Math.floor(scaled);
    const frac = scaled - i;
    const a = stops[i];
    const b = stops[Math.min(i + 1, stops.length - 1)];
    return rgbToString({
      r: lerp(a.r, b.r, frac),
      g: lerp(a.g, b.g, frac),
      b: lerp(a.b, b.b, frac),
    });
  };
}

const COLORMAP_STOPS: Record<ColormapName, RGB[]> = {
  gray: [rgb(253, 251, 246), rgb(43, 42, 53)],
  coral: [rgb(253, 251, 246), rgb(255, 184, 140), rgb(255, 107, 107), rgb(130, 20, 30)],
  mint: [rgb(253, 251, 246), rgb(180, 240, 225), rgb(78, 205, 196), rgb(20, 90, 85)],
  viridis: [
    rgb(68, 1, 84),
    rgb(59, 82, 139),
    rgb(33, 145, 140),
    rgb(94, 201, 98),
    rgb(253, 231, 37),
  ],
};

export function getColormap(name: ColormapName): (v: number) => string {
  return gradient(COLORMAP_STOPS[name] ?? COLORMAP_STOPS.gray);
}

// Nice text color for a given normalized pixel value - used so numeric
// overlays stay legible on both light and dark cells.
export function textColorForValue(v: number): string {
  return clamp01(v) > 0.55 ? "#fdfbf6" : "#2b2a35";
}

// ---------------------------------------------------------------------------
// Preset 3x3 filters, ready to drop into ConvolutionViz / FilterBank.
// ---------------------------------------------------------------------------
export const PRESET_FILTERS: Record<string, FilterKernel> = {
  identity: [
    [0, 0, 0],
    [0, 1, 0],
    [0, 0, 0],
  ],
  "edge-horizontal": [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1],
  ],
  "edge-vertical": [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ],
  blur: [
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
    [1 / 9, 1 / 9, 1 / 9],
  ],
  sharpen: [
    [0, -1, 0],
    [-1, 5, -1],
    [0, -1, 0],
  ],
  emboss: [
    [-2, -1, 0],
    [-1, 1, 1],
    [0, 1, 2],
  ],
  "sobel-x": [
    [-1, 0, 1],
    [-2, 0, 2],
    [-1, 0, 1],
  ],
  "sobel-y": [
    [-1, -2, -1],
    [0, 0, 0],
    [1, 2, 1],
  ],
};

// Ordered list - useful for rendering FilterBank with nice labels.
export const DEFAULT_FILTER_BANK: NamedFilter[] = [
  {
    name: "edge-horizontal",
    kernel: PRESET_FILTERS["edge-horizontal"],
    description: "detects horizontal edges",
  },
  {
    name: "edge-vertical",
    kernel: PRESET_FILTERS["edge-vertical"],
    description: "detects vertical edges",
  },
  { name: "blur", kernel: PRESET_FILTERS.blur, description: "smooths the image" },
  {
    name: "sharpen",
    kernel: PRESET_FILTERS.sharpen,
    description: "amplifies edges",
  },
  {
    name: "emboss",
    kernel: PRESET_FILTERS.emboss,
    description: "3D emboss effect",
  },
  {
    name: "sobel-x",
    kernel: PRESET_FILTERS["sobel-x"],
    description: "Sobel gradient x",
  },
];

// ---------------------------------------------------------------------------
// DEMO_IMAGES - a handful of hand-drawn 8x8 / 12x12 grayscale demo images.
// Values are 0 (background) to 1 (full ink) so colormaps show them nicely.
// ---------------------------------------------------------------------------
function fromMask(mask: string[]): Pixels2D {
  return mask.map((row) =>
    row.split("").map((ch) => {
      if (ch === "#") return 1;
      if (ch === "+") return 0.7;
      if (ch === ".") return 0.3;
      return 0;
    })
  );
}

export const DEMO_IMAGES: Record<string, Pixels2D> = {
  smiley: fromMask([
    "........",
    "..####..",
    ".#....#.",
    "#.#..#.#",
    "#......#",
    "#.#..#.#",
    ".#.##.#.",
    "..####..",
  ]),
  letterX: fromMask([
    "........",
    ".#....#.",
    "..#..#..",
    "...##...",
    "...##...",
    "..#..#..",
    ".#....#.",
    "........",
  ]),
  arrow: fromMask([
    "........",
    "...#....",
    "..##....",
    ".#######",
    ".#######",
    "..##....",
    "...#....",
    "........",
  ]),
  plus: fromMask([
    "........",
    "...##...",
    "...##...",
    "########",
    "########",
    "...##...",
    "...##...",
    "........",
  ]),
  diagonal: fromMask([
    "#.......",
    "##......",
    ".##.....",
    "..##....",
    "...##...",
    "....##..",
    ".....##.",
    "......##",
  ]),
  box: fromMask([
    "........",
    ".######.",
    ".#....#.",
    ".#....#.",
    ".#....#.",
    ".#....#.",
    ".######.",
    "........",
  ]),
  // A 12x12 "digit 3" for slightly larger CNN demos.
  digit3: fromMask([
    "............",
    "...#####....",
    "..#+...##...",
    ".......##...",
    ".....###....",
    ".....###....",
    ".......##...",
    ".......##...",
    "..#+...##...",
    "...#####....",
    "............",
    "............",
  ]),
};

// Wide default image for ConvolutionViz - something with clear edges.
export const DEFAULT_DEMO_IMAGE: Pixels2D = DEMO_IMAGES.letterX;

// ---------------------------------------------------------------------------
// Small helper - absolute min / max for styling and axis ticks.
// ---------------------------------------------------------------------------
export function minMax(img: Pixels2D): { min: number; max: number } {
  let lo = Infinity;
  let hi = -Infinity;
  for (const row of img) {
    for (const v of row) {
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  if (!isFinite(lo) || !isFinite(hi)) return { min: 0, max: 1 };
  return { min: lo, max: hi };
}

// ---------------------------------------------------------------------------
// Normalize a single value given a min/max, clamped to [0, 1]. Used by
// visualizations that need to scale a raw activation for the colormap.
// ---------------------------------------------------------------------------
export function normalizeValue(v: number, min: number, max: number): number {
  if (max - min < 1e-9) return 0;
  const t = (v - min) / (max - min);
  if (t < 0) return 0;
  if (t > 1) return 1;
  return t;
}

// ---------------------------------------------------------------------------
// Kernel helpers.
// ---------------------------------------------------------------------------
export function makeKernel(size: number, fill: number = 0): FilterKernel {
  return makeZeros(size, size).map((row) => row.map(() => fill));
}

export function cloneKernel(k: FilterKernel): FilterKernel {
  return k.map((row) => row.slice());
}
