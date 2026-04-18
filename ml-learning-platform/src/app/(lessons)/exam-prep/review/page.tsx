"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import ExamQuestion from "@/components/exam/ExamQuestion";
import { getQuestionById } from "@/data/examBank";
import {
  getWrongQuestionIds,
  recordAttempt,
  useExamState,
} from "@/utils/examProgress";
import { awardExamQuestion } from "@/utils/gamification";

export default function ReviewModePage() {
  // Subscribe so that clearing a question from review updates the UI naturally.
  const examState = useExamState();
  void examState;

  // Freeze the initial wrong list on mount so the student works through a
  // stable queue. New wrongs from this session will join on the next visit.
  const initialWrongIds = useMemo(() => getWrongQuestionIds(), []);

  const queue = useMemo(
    () =>
      initialWrongIds
        .map((id) => getQuestionById(id))
        .filter((q): q is NonNullable<typeof q> => Boolean(q)),
    [initialWrongIds],
  );

  const [index, setIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  // Live-update set of IDs still considered "wrong" based on current state -
  // used to decide whether a question still belongs in the review pile
  const stillWrongSet = useMemo(
    () => new Set(getWrongQuestionIds()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [examState.attempts.length],
  );

  if (queue.length === 0) {
    return (
      <div className="space-y-5">
        <Link
          href="/exam-prep"
          className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exam prep
        </Link>
        <div
          className="card-sketchy p-8 text-center space-y-3"
          style={{ background: "var(--accent-mint)" }}
        >
          <CheckCircle2 className="w-12 h-12 mx-auto" />
          <h2 className="font-hand text-2xl font-bold text-foreground">
            Nothing to review!
          </h2>
          <p className="font-hand text-sm text-foreground/80 max-w-md mx-auto">
            Your review pile is empty. Keep practising and any questions you miss will
            land here until you've nailed them twice in a row.
          </p>
          <Link href="/exam-prep" className="btn-sketchy font-hand inline-block mt-2">
            Back to hub
          </Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const nowMastered = queue.filter((q) => !stillWrongSet.has(q.id)).length;
    const stillPending = queue.length - nowMastered;
    return (
      <div className="space-y-5">
        <Link
          href="/exam-prep"
          className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exam prep
        </Link>
        <div
          className="card-sketchy p-6 text-center space-y-3"
          style={{ background: "var(--accent-peach)" }}
        >
          <Sparkles className="w-12 h-12 mx-auto" />
          <h2 className="font-hand text-3xl font-bold text-foreground">
            Review session done
          </h2>
          <p className="font-hand text-lg text-foreground">
            You reviewed{" "}
            <span className="marker-highlight-yellow font-bold">{queue.length}</span>{" "}
            question{queue.length === 1 ? "" : "s"}.
          </p>
          <p className="font-hand text-sm text-foreground/80">
            {nowMastered} moved out of review ·{" "}
            {stillPending > 0 ? `${stillPending} still need more reps` : "nothing left!"}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link href="/exam-prep/review" className="btn-sketchy-outline font-hand">
              Start new session
            </Link>
            <Link href="/exam-prep" className="btn-sketchy font-hand">
              Back to hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const question = queue[index];

  function handleAnswer(selectedIndex: number, correct: boolean) {
    recordAttempt(question.id, selectedIndex, correct);
    awardExamQuestion(correct);
    setSessionResults((prev) => {
      const next = prev.slice();
      next[index] = correct;
      return next;
    });
  }

  function handleNext() {
    if (index < queue.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  const answered = typeof sessionResults[index] === "boolean";
  const correctCount = sessionResults.filter(Boolean).length;

  return (
    <div className="space-y-5">
      <Link
        href="/exam-prep"
        className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to exam prep
      </Link>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-hand text-2xl font-bold text-foreground">
            Review Mistakes
          </h1>
          <p className="font-hand text-xs text-muted-foreground">
            Get each one right twice to clear it from your pile.
          </p>
        </div>
        <div
          className="font-hand px-3 py-1.5 rounded-full border-2 border-foreground text-sm font-bold"
          style={{ background: "var(--accent-coral)", boxShadow: "2px 2px 0 #2b2a35" }}
        >
          {index + 1} / {queue.length}
        </div>
      </div>

      <div className="h-3 rounded-full border-2 border-foreground overflow-hidden bg-background">
        <div
          className="h-full transition-all"
          style={{
            width: `${((index + (answered ? 1 : 0)) / queue.length) * 100}%`,
            background: "var(--accent-coral)",
          }}
        />
      </div>

      <ExamQuestion
        question={question}
        mode="review"
        onAnswer={handleAnswer}
        showExplanation
      />

      {answered && (
        <div className="flex items-center justify-between gap-3">
          <span className="font-hand text-sm text-muted-foreground">
            {correctCount} correct in this session
          </span>
          <button
            type="button"
            onClick={handleNext}
            className="btn-sketchy font-hand inline-flex items-center gap-1.5"
          >
            {index < queue.length - 1 ? "Next question" : "Finish review"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
