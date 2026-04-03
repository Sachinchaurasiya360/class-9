interface SVGGridProps {
  width?: number;
  height?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  xLabel?: string;
  yLabel?: string;
  showGrid?: boolean;
  children?: (helpers: {
    toSvgX: (x: number) => number;
    toSvgY: (y: number) => number;
    plotW: number;
    plotH: number;
    padLeft: number;
    padTop: number;
  }) => React.ReactNode;
}

export default function SVGGrid({
  width = 500,
  height = 350,
  xMin = 0,
  xMax = 10,
  yMin = 0,
  yMax = 10,
  padding = { top: 20, right: 20, bottom: 40, left: 45 },
  xLabel = "X",
  yLabel = "Y",
  showGrid = true,
  children,
}: SVGGridProps) {
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const toSvgX = (x: number) => padding.left + ((x - xMin) / (xMax - xMin)) * plotW;
  const toSvgY = (y: number) => padding.top + (1 - (y - yMin) / (yMax - yMin)) * plotH;

  const xTicks: number[] = [];
  const xStep = Math.max(1, Math.ceil((xMax - xMin) / 10));
  for (let v = Math.ceil(xMin); v <= xMax; v += xStep) xTicks.push(v);

  const yTicks: number[] = [];
  const yStep = Math.max(1, Math.ceil((yMax - yMin) / 10));
  for (let v = Math.ceil(yMin); v <= yMax; v += yStep) yTicks.push(v);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[560px]">
      {/* Grid lines */}
      {showGrid &&
        xTicks.map((v) => (
          <line
            key={`gx-${v}`}
            x1={toSvgX(v)}
            y1={padding.top}
            x2={toSvgX(v)}
            y2={padding.top + plotH}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        ))}
      {showGrid &&
        yTicks.map((v) => (
          <line
            key={`gy-${v}`}
            x1={padding.left}
            y1={toSvgY(v)}
            x2={padding.left + plotW}
            y2={toSvgY(v)}
            stroke="#e2e8f0"
            strokeWidth={0.5}
          />
        ))}

      {/* Axes */}
      <line
        x1={padding.left}
        y1={padding.top + plotH}
        x2={padding.left + plotW}
        y2={padding.top + plotH}
        stroke="#334155"
        strokeWidth={1.5}
      />
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + plotH}
        stroke="#334155"
        strokeWidth={1.5}
      />

      {/* X tick labels */}
      {xTicks.map((v) => (
        <text
          key={`xt-${v}`}
          x={toSvgX(v)}
          y={padding.top + plotH + 16}
          textAnchor="middle"
          className="text-[10px] fill-slate-500"
        >
          {v}
        </text>
      ))}

      {/* Y tick labels */}
      {yTicks.map((v) => (
        <text
          key={`yt-${v}`}
          x={padding.left - 8}
          y={toSvgY(v) + 3}
          textAnchor="end"
          className="text-[10px] fill-slate-500"
        >
          {v}
        </text>
      ))}

      {/* Axis labels */}
      <text
        x={padding.left + plotW / 2}
        y={height - 4}
        textAnchor="middle"
        className="text-[11px] fill-slate-600 font-medium"
      >
        {xLabel}
      </text>
      <text
        x={12}
        y={padding.top + plotH / 2}
        textAnchor="middle"
        transform={`rotate(-90, 12, ${padding.top + plotH / 2})`}
        className="text-[11px] fill-slate-600 font-medium"
      >
        {yLabel}
      </text>

      {/* User content */}
      {children?.({ toSvgX, toSvgY, plotW, plotH, padLeft: padding.left, padTop: padding.top })}
    </svg>
  );
}
