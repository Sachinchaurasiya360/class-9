"use client";

import { formatNum } from "./utils";

export type ConfusionMatrixVizProps = {
  tp: number;
  tn: number;
  fp: number;
  fn: number;
  labels?: [string, string];
};

export default function ConfusionMatrixViz({
  tp,
  tn,
  fp,
  fn,
  labels = ["Positive", "Negative"],
}: ConfusionMatrixVizProps) {
  const total = tp + tn + fp + fn;
  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const max = Math.max(1, tp, tn, fp, fn);

  function cell(
    value: number,
    color: string,
    label: string,
    keyStr: string,
    isCorrect: boolean
  ) {
    const intensity = value / max;
    return (
      <div
        key={keyStr}
        className="border-2 border-foreground rounded-xl p-4 text-center relative"
        style={{
          background: color,
          // Use opacity via an inline gradient overlay trick - simpler to
          // directly blend with the background.
          opacity: 0.35 + intensity * 0.6,
        }}
      >
        <div className="font-hand text-3xl font-bold text-foreground">
          {value}
        </div>
        <div className="font-hand text-xs mt-1 text-foreground/80">{label}</div>
        <div className="absolute top-1 right-2 font-hand text-[10px] text-foreground/60">
          {isCorrect ? "correct" : "error"}
        </div>
      </div>
    );
  }

  return (
    <div className="card-sketchy p-4 md:p-6">
      <h3 className="font-hand text-2xl mb-3">Confusion Matrix</h3>

      <div className="grid md:grid-cols-[1fr_220px] gap-4">
        <div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 font-hand items-center">
            <div></div>
            <div className="text-center text-sm text-muted-foreground">
              predicted {labels[0]}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              predicted {labels[1]}
            </div>

            <div className="text-sm text-muted-foreground text-right pr-1">
              actual
              <br />
              {labels[0]}
            </div>
            {cell(tp, "var(--accent-mint)", "True Positive", "tp", true)}
            {cell(fn, "var(--accent-coral)", "False Negative", "fn", false)}

            <div className="text-sm text-muted-foreground text-right pr-1">
              actual
              <br />
              {labels[1]}
            </div>
            {cell(fp, "var(--accent-coral)", "False Positive", "fp", false)}
            {cell(tn, "var(--accent-mint)", "True Negative", "tn", true)}
          </div>
        </div>

        <div className="font-hand space-y-2 text-sm">
          <div className="p-3 border-2 border-dashed border-foreground/60 rounded-md">
            <Metric label="Accuracy" value={accuracy} />
            <Metric label="Precision" value={precision} />
            <Metric label="Recall" value={recall} />
            <Metric label="F1 score" value={f1} />
          </div>
          <p className="text-xs text-muted-foreground">
            color intensity scales with cell count. mint = correct, coral =
            error.
          </p>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between">
      <span>{label}</span>
      <span className="font-bold">{formatNum(value * 100, 1)}%</span>
    </div>
  );
}
