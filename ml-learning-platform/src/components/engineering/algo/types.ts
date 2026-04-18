export type CellState =
  | "default" | "compare" | "swap" | "active" | "done"
  | "pivot" | "window" | "match" | "mismatch" | "sorted"
  | "visited" | "frontier" | "path" | "low" | "high" | "mid";

export interface AlgoFrame {
  line?: number;
  vars?: Record<string, string | number | boolean | undefined>;
  message?: string;
}

export interface ArrayFrame extends AlgoFrame {
  values: number[];
  states?: (CellState | undefined)[];
  pointers?: Record<string, number>;
  labels?: (string | undefined)[];
}

export interface StackFrame extends AlgoFrame {
  items: (string | number)[];
  highlight?: number[];
}

export interface QueueFrame extends AlgoFrame {
  items: (string | number)[];
  front?: number;
  rear?: number;
}

export interface TreeNodeData {
  id: string;
  value: string | number;
  left?: string;
  right?: string;
  state?: CellState;
  meta?: Record<string, string | number>;
}

export interface TreeFrame extends AlgoFrame {
  nodes: Record<string, TreeNodeData>;
  root?: string;
  edgeStates?: Record<string, CellState>;
}

export interface GraphNodeData {
  id: string;
  x: number;
  y: number;
  label?: string;
  state?: CellState;
  meta?: Record<string, string | number>;
}

export interface GraphEdgeData {
  from: string;
  to: string;
  weight?: number;
  directed?: boolean;
  state?: CellState;
}

export interface GraphFrame extends AlgoFrame {
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
}

export interface RecursionNode {
  id: string;
  label: string;
  parent?: string;
  state?: CellState;
  returnValue?: string | number;
  depth: number;
}

export interface RecursionFrame extends AlgoFrame {
  nodes: RecursionNode[];
  activeId?: string;
}
