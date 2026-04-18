// Shared types for the CNN / image visualization library.
// Every grid is a row-major `number[][]` - `pixels[y][x]`.
// Values are either 0-255 (classic image) or 0-1 (normalized).

export type Pixels2D = number[][];

export type FilterKernel = number[][];

export type ColormapName = "gray" | "coral" | "mint" | "viridis";

export type PoolingType = "max" | "avg";

export type LayerType = "conv" | "pool" | "dense" | "flatten";

export interface ConvLayerSpec {
  type: "conv";
  filters: number;
  kernelSize: number;
  label?: string;
}

export interface PoolLayerSpec {
  type: "pool";
  size: number;
  pooling?: PoolingType;
  label?: string;
}

export interface DenseLayerSpec {
  type: "dense";
  units: number;
  label?: string;
}

export interface FlattenLayerSpec {
  type: "flatten";
  label?: string;
}

export type LayerSpec =
  | ConvLayerSpec
  | PoolLayerSpec
  | DenseLayerSpec
  | FlattenLayerSpec;

// Convolution step for animation / step-by-step playback.
export interface ConvStep {
  outX: number;
  outY: number;
  inX: number; // top-left corner of current window in input
  inY: number;
  window: number[][];
  output: number;
}

export interface NamedFilter {
  name: string;
  kernel: FilterKernel;
  description?: string;
}
