"use client";

import { useCallback, useMemo, useState } from "react";
import ImageGrid from "./ImageGrid";
import type { FilterKernel, NamedFilter } from "./types";
import { DEFAULT_FILTER_BANK, minMax } from "./imageUtils";

export interface FilterBankProps {
  /** Named filters to display. Defaults to a 6-filter classic bank. */
  filters?: NamedFilter[];
  /** Override labels shown below each filter. */
  labels?: string[];
  /** Controlled selected index. */
  selectedIdx?: number;
  /** Fired on click; passes the index and the kernel. */
  onSelect?: (idx: number, kernel: FilterKernel) => void;
  /** Cell size for the little kernel grids. */
  cellSize?: number;
  /** Optional title. */
  title?: string;
}

/**
 * <FilterBank /> - a row of miniature filter previews. Each filter is
 * rendered as a small ImageGrid with its own min/max so the structure of
 * the kernel (positive vs negative weights) is visible.
 */
export default function FilterBank({
  filters = DEFAULT_FILTER_BANK,
  labels,
  selectedIdx,
  onSelect,
  cellSize = 18,
  title = "Learned Filters",
}: FilterBankProps) {
  const [internalSel, setInternalSel] = useState(0);
  const selected = selectedIdx ?? internalSel;

  const handleClick = useCallback(
    (idx: number) => {
      if (selectedIdx === undefined) setInternalSel(idx);
      onSelect?.(idx, filters[idx].kernel);
    },
    [onSelect, selectedIdx, filters]
  );

  return (
    <div className="card-sketchy p-4 md:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-hand text-xl">{title}</h3>
        <span className="font-hand text-sm text-muted-foreground">
          click to pick
        </span>
      </div>
      <div className="flex flex-wrap gap-3 justify-start">
        {filters.map((f, i) => {
          const isSelected = i === selected;
          const label = labels?.[i] ?? f.name;
          return (
            <FilterTile
              key={`f-${i}-${f.name}`}
              filter={f}
              label={label}
              selected={isSelected}
              cellSize={cellSize}
              onClick={() => handleClick(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

interface FilterTileProps {
  filter: NamedFilter;
  label: string;
  selected: boolean;
  cellSize: number;
  onClick: () => void;
}

function FilterTile({
  filter,
  label,
  selected,
  cellSize,
  onClick,
}: FilterTileProps) {
  const { min, max } = useMemo(() => minMax(filter.kernel), [filter.kernel]);
  // Use a symmetric range so 0 maps to mid-gray for signed kernels.
  const absMax = Math.max(Math.abs(min), Math.abs(max), 1e-6);
  const range: [number, number] = [-absMax, absMax];

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 font-hand text-sm focus:outline-none group"
      style={{ minWidth: filter.kernel[0]?.length * cellSize + 18 }}
    >
      <div
        className="p-1 rounded-lg transition-all"
        style={{
          background: selected ? "rgba(255, 217, 61, 0.5)" : "transparent",
          border: selected
            ? "2.5px solid var(--accent-coral)"
            : "2.5px dashed rgba(43, 42, 53, 0.3)",
          boxShadow: selected ? "3px 3px 0 #2b2a35" : "none",
        }}
      >
        <ImageGrid
          pixels={filter.kernel}
          cellSize={cellSize}
          colormap="viridis"
          valueRange={range}
          showValues={cellSize >= 22}
          rounded={false}
        />
      </div>
      <span
        className={`text-center ${
          selected ? "font-bold" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
      {filter.description ? (
        <span className="text-[10px] text-muted-foreground max-w-[100px] text-center leading-tight hidden md:block">
          {filter.description}
        </span>
      ) : null}
    </button>
  );
}
