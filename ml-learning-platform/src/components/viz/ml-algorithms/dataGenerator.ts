// Seeded PRNG + synthetic dataset utilities for the ML Algorithms playground.
// Everything is deterministic given a seed so students see stable visuals.

export type Point = { x: number; y: number; label?: number };

export function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Box–Muller transform for a standard normal sample using a provided rand().
function randn(rand: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rand();
  while (v === 0) v = rand();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Generate k Gaussian blobs. Points are in roughly [0, 100] range.
 */
export function generateClusters(
  k = 3,
  pointsPerCluster = 15,
  seed = 42
): Point[] {
  const rand = mulberry32(seed);
  const points: Point[] = [];
  const padding = 18;
  const range = 100 - padding * 2;

  for (let c = 0; c < k; c++) {
    const cx = padding + rand() * range;
    const cy = padding + rand() * range;
    const spread = 6 + rand() * 4;
    for (let i = 0; i < pointsPerCluster; i++) {
      const x = cx + randn(rand) * spread;
      const y = cy + randn(rand) * spread;
      points.push({
        x: clamp(x, 2, 98),
        y: clamp(y, 2, 98),
        label: c,
      });
    }
  }
  return points;
}

/**
 * Generate noisy y = slope*x + intercept data with x in [0, 100].
 */
export function generateLinearData(
  n = 20,
  slope = 0.6,
  intercept = 15,
  noise = 8,
  seed = 7
): Point[] {
  const rand = mulberry32(seed);
  const out: Point[] = [];
  for (let i = 0; i < n; i++) {
    const x = rand() * 100;
    const y = slope * x + intercept + randn(rand) * noise;
    out.push({ x, y: clamp(y, 0, 100) });
  }
  return out;
}

/**
 * Two linearly separable blobs labelled 0 / 1.
 */
export function generateClassification2D(n = 40, seed = 11): Point[] {
  const rand = mulberry32(seed);
  const out: Point[] = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    out.push({
      x: clamp(30 + randn(rand) * 8, 2, 98),
      y: clamp(30 + randn(rand) * 8, 2, 98),
      label: 0,
    });
  }
  for (let i = 0; i < n - half; i++) {
    out.push({
      x: clamp(70 + randn(rand) * 8, 2, 98),
      y: clamp(70 + randn(rand) * 8, 2, 98),
      label: 1,
    });
  }
  return out;
}

/**
 * Two concentric circles - the inner class gets label 0, outer class gets label 1.
 */
export function generateCircularData(n = 50, seed = 23): Point[] {
  const rand = mulberry32(seed);
  const out: Point[] = [];
  const cx = 50;
  const cy = 50;
  for (let i = 0; i < n; i++) {
    const isInner = i < n / 2;
    const radius = isInner ? 10 + rand() * 5 : 28 + rand() * 5;
    const angle = rand() * Math.PI * 2;
    out.push({
      x: clamp(cx + Math.cos(angle) * radius + randn(rand) * 1.5, 2, 98),
      y: clamp(cy + Math.sin(angle) * radius + randn(rand) * 1.5, 2, 98),
      label: isInner ? 0 : 1,
    });
  }
  return out;
}

/**
 * Classic "two moons" dataset - interlocking crescents.
 */
export function generateMoons(n = 50, seed = 31): Point[] {
  const rand = mulberry32(seed);
  const out: Point[] = [];
  const half = Math.floor(n / 2);
  for (let i = 0; i < half; i++) {
    const t = Math.PI * (i / half);
    const x = 50 + Math.cos(t) * 25 + randn(rand) * 2;
    const y = 45 - Math.sin(t) * 20 + randn(rand) * 2;
    out.push({ x: clamp(x, 2, 98), y: clamp(y, 2, 98), label: 0 });
  }
  for (let i = 0; i < n - half; i++) {
    const t = Math.PI * (i / (n - half));
    const x = 50 + 12 - Math.cos(t) * 25 + randn(rand) * 2;
    const y = 55 + Math.sin(t) * 20 + randn(rand) * 2;
    out.push({ x: clamp(x, 2, 98), y: clamp(y, 2, 98), label: 1 });
  }
  return out;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

// Shared palette helper - indexed cluster colors.
export const CLUSTER_COLORS = [
  "var(--accent-coral)",
  "var(--accent-mint)",
  "var(--accent-sky)",
  "var(--accent-lav)",
  "var(--accent-yellow)",
  "var(--accent-peach)",
  "#8e44ad",
  "#16a085",
];
