import { useState, useEffect } from "react";
import { Lightbulb, Check, RotateCcw } from "lucide-react";

export type PredictionType = "mcq" | "numeric" | "text";

export interface PredictionPrompt {
  type: PredictionType;
  question: string;
  options?: string[]; // for mcq
  hint?: string;
}

interface Props {
  lessonPath: string;
  prompt: PredictionPrompt;
}

const STORAGE_KEY = "ml-predictions";

function loadAll(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveOne(path: string, value: string) {
  const all = loadAll();
  all[path] = value;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function clearOne(path: string) {
  const all = loadAll();
  delete all[path];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export default function PredictionGate({ lessonPath, prompt }: Props) {
  const [guess, setGuess] = useState<string>("");
  const [submitted, setSubmitted] = useState<string | null>(null);

  useEffect(() => {
    const existing = loadAll()[lessonPath];
    setSubmitted(existing ?? null);
    setGuess("");
  }, [lessonPath]);

  function handleSubmit() {
    if (!guess.trim()) return;
    saveOne(lessonPath, guess);
    setSubmitted(guess);
  }

  function handleReset() {
    clearOne(lessonPath);
    setSubmitted(null);
    setGuess("");
  }

  if (submitted) {
    return (
      <div
        className="card-sketchy p-3 flex items-center gap-3 flex-wrap"
        style={{ background: "#e8fff5" }}
      >
        <div className="flex items-center gap-2">
          <Check className="w-4 h-4 text-foreground" />
          <span className="font-hand text-sm font-bold text-foreground">
            Your prediction:
          </span>
          <span className="font-hand text-sm text-foreground italic">"{submitted}"</span>
        </div>
        <button
          onClick={handleReset}
          className="ml-auto flex items-center gap-1 text-xs font-hand text-muted-foreground hover:text-foreground"
          title="Change prediction"
        >
          <RotateCcw className="w-3 h-3" />
          change
        </button>
      </div>
    );
  }

  return (
    <div className="card-sketchy p-4 space-y-3" style={{ background: "#fff8e7" }}>
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5" style={{ color: "#ff6b6b" }} />
        <span className="font-hand text-sm font-bold uppercase tracking-wider text-foreground">
          Predict First
        </span>
      </div>
      <p className="font-hand text-base text-foreground">{prompt.question}</p>
      {prompt.hint && (
        <p className="font-hand text-xs text-muted-foreground italic">{prompt.hint}</p>
      )}

      {prompt.type === "mcq" && prompt.options && (
        <div className="grid gap-2">
          {prompt.options.map((opt) => (
            <button
              key={opt}
              onClick={() => setGuess(opt)}
              className={`text-left px-3 py-2 rounded-lg border-2 font-hand text-sm transition-all ${
                guess === opt
                  ? "bg-accent-yellow border-foreground shadow-[2px_2px_0_#2b2a35]"
                  : "border-foreground/30 hover:border-foreground bg-background"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {prompt.type === "numeric" && (
        <input
          type="number"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type a number..."
          className="w-full px-3 py-2 rounded-lg border-2 border-foreground font-hand text-base bg-background"
        />
      )}

      {prompt.type === "text" && (
        <textarea
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          placeholder="Type your guess..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border-2 border-foreground font-hand text-sm bg-background resize-none"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!guess.trim()}
        className="btn-sketchy text-sm font-hand"
        style={{ opacity: guess.trim() ? 1 : 0.5, cursor: guess.trim() ? "pointer" : "not-allowed" }}
      >
        Lock in my guess
      </button>
      <p className="font-hand text-[11px] text-muted-foreground">
        No wrong answers! Guessing first helps your brain remember twice as much.
      </p>
    </div>
  );
}
