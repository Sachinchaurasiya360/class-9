"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import type { ExamQuestion as ExamQuestionType } from "@/data/examBank";

export interface ExamQuestionProps {
  question: ExamQuestionType;
  mode: "practice" | "test" | "review";
  onAnswer: (selectedIndex: number, correct: boolean) => void;
  initialSelected?: number;
  showExplanation: boolean;
}

const DIFFICULTY_COLOR: Record<ExamQuestionType["difficulty"], string> = {
  easy: "var(--accent-mint)",
  medium: "var(--accent-yellow)",
  hard: "var(--accent-coral)",
};

export default function ExamQuestion({
  question,
  mode,
  onAnswer,
  initialSelected,
  showExplanation,
}: ExamQuestionProps) {
  const [selected, setSelected] = useState<number | null>(
    typeof initialSelected === "number" ? initialSelected : null,
  );
  const [locked, setLocked] = useState<boolean>(
    mode !== "test" && typeof initialSelected === "number",
  );

  // Reset internal state whenever the question changes
  useEffect(() => {
    setSelected(typeof initialSelected === "number" ? initialSelected : null);
    setLocked(mode !== "test" && typeof initialSelected === "number");
  }, [question.id, initialSelected, mode]);

  function handleSelect(idx: number) {
    if (mode === "test") {
      // Test mode - no immediate feedback, allow changing until submit.
      setSelected(idx);
      onAnswer(idx, idx === question.correctIndex);
      return;
    }
    if (locked) return;
    setSelected(idx);
    setLocked(true);
    onAnswer(idx, idx === question.correctIndex);
  }

  const showResult = mode !== "test" && locked;

  return (
    <div className="card-sketchy p-5 sm:p-6 space-y-4" style={{ background: "#fffdf5" }}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-hand">
          <span
            className="px-2 py-0.5 rounded-full border-2 border-foreground text-[11px] font-bold uppercase tracking-wide"
            style={{
              background: DIFFICULTY_COLOR[question.difficulty],
              boxShadow: "2px 2px 0 #2b2a35",
            }}
          >
            {question.difficulty}
          </span>
          <span className="text-[11px] text-muted-foreground uppercase">
            {question.type === "true-false" ? "True / False" : "MCQ"}
          </span>
        </div>
        {question.topic && (
          <span className="font-hand text-[11px] text-muted-foreground">
            topic: <em className="text-foreground">{question.topic}</em>
          </span>
        )}
      </div>

      <h3 className="font-hand text-lg sm:text-xl font-bold text-foreground leading-snug">
        {question.question}
      </h3>

      <div className="space-y-2">
        {question.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === question.correctIndex;

          // Default look
          let classes =
            "border-2 border-foreground bg-white hover:bg-accent-yellow/30 text-foreground";
          let icon: React.ReactNode = null;

          if (mode === "test") {
            if (isSelected) {
              classes = "border-2 border-foreground bg-accent-sky text-foreground";
            }
          } else if (showResult) {
            if (isCorrect) {
              classes = "border-2 border-foreground bg-accent-mint text-foreground";
              icon = <CheckCircle2 className="w-5 h-5 shrink-0" />;
            } else if (isSelected && !isCorrect) {
              classes = "border-2 border-foreground bg-accent-coral text-foreground";
              icon = <XCircle className="w-5 h-5 shrink-0" />;
            } else {
              classes = "border-2 border-foreground bg-white text-muted-foreground";
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(i)}
              disabled={mode !== "test" && locked}
              className={`w-full text-left px-4 py-3 rounded-xl font-hand text-base font-medium transition-colors flex items-center gap-3 disabled:cursor-default ${classes}`}
              style={{
                boxShadow: isSelected || (showResult && isCorrect) ? "3px 3px 0 #2b2a35" : "2px 2px 0 #2b2a35",
              }}
            >
              <span className="w-7 h-7 rounded-full border-2 border-foreground flex items-center justify-center text-xs font-bold shrink-0 bg-white">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {showExplanation && showResult && (
        <div
          className="rounded-xl border-2 border-foreground p-3 sm:p-4 flex gap-3 items-start font-hand"
          style={{ background: "var(--accent-lav)", boxShadow: "2px 2px 0 #2b2a35" }}
        >
          <Lightbulb className="w-5 h-5 mt-0.5 shrink-0" />
          <p className="text-sm text-foreground leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  );
}
