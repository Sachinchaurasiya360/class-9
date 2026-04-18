"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Flag,
  Play,
  Trophy,
  XCircle,
} from "lucide-react";
import ExamQuestion from "@/components/exam/ExamQuestion";
import ExamTimer from "@/components/exam/ExamTimer";
import {
  EXAM_CHAPTERS,
  ExamQuestion as ExamQuestionType,
  getSamplePaper,
} from "@/data/examBank";
import { recordAttempt, recordTestResult } from "@/utils/examProgress";
import { awardExamQuestion } from "@/utils/gamification";

const TEST_DURATION_SECONDS = 30 * 60;
const TEST_QUESTION_COUNT = 30;

type Phase = "intro" | "running" | "review";

export default function TestModePage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [seed, setSeed] = useState<number>(0);
  const [paper, setPaper] = useState<ExamQuestionType[]>([]);
  const [selected, setSelected] = useState<(number | null)[]>([]);
  const [current, setCurrent] = useState(0);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [elapsed, setElapsed] = useState<number>(0);
  const [expandedReview, setExpandedReview] = useState<number | null>(null);

  const score = useMemo(() => {
    if (!paper.length) return 0;
    return selected.reduce<number>((acc, sel, i) => {
      if (sel !== null && sel === paper[i].correctIndex) return acc + 1;
      return acc;
    }, 0);
  }, [paper, selected]);

  const startTest = useCallback(() => {
    const newSeed = Date.now();
    const questions = getSamplePaper(newSeed, TEST_QUESTION_COUNT);
    setSeed(newSeed);
    setPaper(questions);
    setSelected(new Array(questions.length).fill(null));
    setCurrent(0);
    setStartedAt(Date.now());
    setPhase("running");
  }, []);

  const submitTest = useCallback(() => {
    if (phase !== "running") return;
    const finalElapsed = Math.round((Date.now() - startedAt) / 1000);
    setElapsed(finalElapsed);

    // Record each attempt + gamification XP for correct ones
    let correctTotal = 0;
    selected.forEach((sel, i) => {
      if (sel === null) return;
      const q = paper[i];
      const correct = sel === q.correctIndex;
      if (correct) correctTotal += 1;
      recordAttempt(q.id, sel, correct);
      awardExamQuestion(correct);
    });
    recordTestResult(correctTotal, paper.length);
    setPhase("review");
  }, [phase, paper, selected, startedAt]);

  /* ------------------------------- INTRO ------------------------------- */
  if (phase === "intro") {
    return (
      <div className="space-y-5">
        <Link
          href="/exam-prep"
          className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exam prep
        </Link>

        <div
          className="card-sketchy p-6 sm:p-8 space-y-4"
          style={{ background: "var(--accent-sky)" }}
        >
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8" />
            <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground">
              Test Mode
            </h1>
          </div>
          <p className="font-hand text-base text-foreground/80">
            Simulate a real CBSE AI 417 paper - balanced across all seven units.
          </p>

          <ul className="space-y-2 font-hand text-base text-foreground">
            <Rule>{TEST_QUESTION_COUNT} questions drawn across every unit</Rule>
            <Rule>{TEST_DURATION_SECONDS / 60} minutes on the clock</Rule>
            <Rule>No hints or explanations until you submit</Rule>
            <Rule>No calculator allowed - mental maths only</Rule>
            <Rule>You can revisit and change answers until submit</Rule>
          </ul>

          <button
            type="button"
            onClick={startTest}
            className="btn-sketchy font-hand text-lg inline-flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Start test
          </button>
        </div>
      </div>
    );
  }

  /* --------------------------- REVIEW RESULTS -------------------------- */
  if (phase === "review") {
    const pct = Math.round((score / paper.length) * 100);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    // Per-chapter breakdown
    const perChapter = new Map<string, { attempted: number; correct: number }>();
    paper.forEach((q, i) => {
      const row = perChapter.get(q.chapter) ?? { attempted: 0, correct: 0 };
      row.attempted += 1;
      if (selected[i] === q.correctIndex) row.correct += 1;
      perChapter.set(q.chapter, row);
    });

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
          style={{ background: pct >= 70 ? "var(--accent-mint)" : "var(--accent-peach)" }}
        >
          <Trophy className="w-12 h-12 mx-auto" />
          <h2 className="font-hand text-3xl font-bold text-foreground">Test complete!</h2>
          <p className="font-hand text-2xl text-foreground">
            {score} / {paper.length}{" "}
            <span className="marker-highlight-yellow">({pct}%)</span>
          </p>
          <p className="font-hand text-sm text-foreground/80">
            Finished in {minutes}m {seconds}s · seed {seed}
          </p>
        </div>

        {/* Per-chapter breakdown */}
        <div className="card-sketchy p-5 space-y-3" style={{ background: "#fffdf5" }}>
          <h3 className="font-hand text-xl font-bold text-foreground">By chapter</h3>
          <div className="grid sm:grid-cols-2 gap-2">
            {Array.from(perChapter.entries()).map(([slug, s]) => {
              const meta = EXAM_CHAPTERS.find((c) => c.slug === slug);
              const cpct = Math.round((s.correct / s.attempted) * 100);
              return (
                <div
                  key={slug}
                  className="font-hand text-sm border-2 border-foreground rounded-lg px-3 py-2 bg-white flex items-center justify-between gap-2"
                >
                  <span className="truncate">
                    {meta?.icon} {meta?.name ?? slug}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">
                    {s.correct}/{s.attempted} · <strong className="text-foreground">{cpct}%</strong>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question review grid */}
        <div className="card-sketchy p-5 space-y-3" style={{ background: "#fffdf5" }}>
          <h3 className="font-hand text-xl font-bold text-foreground">
            Review every question
          </h3>
          <p className="font-hand text-xs text-muted-foreground">
            Tap a number to expand the question and explanation.
          </p>
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {paper.map((q, i) => {
              const sel = selected[i];
              const correct = sel !== null && sel === q.correctIndex;
              const answered = sel !== null;
              let bg = "var(--accent-yellow)";
              if (answered) bg = correct ? "var(--accent-mint)" : "var(--accent-coral)";
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setExpandedReview(expandedReview === i ? null : i)}
                  className="font-hand text-sm font-bold aspect-square rounded-lg border-2 border-foreground flex items-center justify-center"
                  style={{ background: bg, boxShadow: "2px 2px 0 #2b2a35" }}
                  aria-label={`Question ${i + 1} - ${correct ? "correct" : answered ? "wrong" : "unanswered"}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          {expandedReview !== null && (
            <div className="pt-3">
              <ReviewDetail
                question={paper[expandedReview]}
                selected={selected[expandedReview]}
                index={expandedReview}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={startTest}
            className="btn-sketchy-outline font-hand"
          >
            Take another
          </button>
          <Link href="/exam-prep" className="btn-sketchy font-hand">
            Back to hub
          </Link>
        </div>
      </div>
    );
  }

  /* ----------------------------- RUNNING ------------------------------- */
  const q = paper[current];
  const answeredCount = selected.filter((s) => s !== null).length;

  function handleAnswer(idx: number) {
    setSelected((prev) => {
      const next = prev.slice();
      next[current] = idx;
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* Top bar: timer + submit */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <ExamTimer seconds={TEST_DURATION_SECONDS} onExpire={submitTest} />
        <div className="flex items-center gap-2 font-hand text-sm text-muted-foreground">
          <span>
            {answeredCount} / {paper.length} answered
          </span>
          <button
            type="button"
            onClick={submitTest}
            className="btn-sketchy font-hand inline-flex items-center gap-1.5 text-sm"
          >
            <Flag className="w-4 h-4" /> Submit
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <h2 className="font-hand text-xl font-bold text-foreground">
          Question {current + 1} of {paper.length}
        </h2>
        <span
          className="font-hand text-xs px-2 py-0.5 rounded-full border-2 border-foreground"
          style={{ background: "var(--accent-peach)" }}
        >
          {EXAM_CHAPTERS.find((c) => c.slug === q.chapter)?.name ?? q.chapter}
        </span>
      </div>

      <ExamQuestion
        question={q}
        mode="test"
        onAnswer={handleAnswer}
        initialSelected={selected[current] ?? undefined}
        showExplanation={false}
      />

      {/* Nav buttons */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="btn-sketchy-outline font-hand inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </button>
        {current < paper.length - 1 ? (
          <button
            type="button"
            onClick={() => setCurrent((c) => c + 1)}
            className="btn-sketchy font-hand inline-flex items-center gap-1.5"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={submitTest}
            className="btn-sketchy font-hand inline-flex items-center gap-1.5"
          >
            <Flag className="w-4 h-4" />
            Submit test
          </button>
        )}
      </div>

      {/* Question navigator */}
      <div className="card-sketchy p-4 space-y-2" style={{ background: "#fffdf5" }}>
        <p className="font-hand text-xs text-muted-foreground uppercase tracking-wide">
          Jump to question
        </p>
        <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
          {paper.map((_, i) => {
            const isCurrent = i === current;
            const isAnswered = selected[i] !== null;
            let bg = "#fff";
            if (isCurrent) bg = "var(--accent-yellow)";
            else if (isAnswered) bg = "var(--accent-mint)";
            return (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                className="font-hand text-sm font-bold aspect-square rounded-lg border-2 border-foreground"
                style={{ background: bg, boxShadow: "2px 2px 0 #2b2a35" }}
                aria-label={`Go to question ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------ */

function Rule({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span
        className="w-5 h-5 mt-0.5 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center bg-white text-[10px]"
        aria-hidden
      >
        ✓
      </span>
      <span>{children}</span>
    </li>
  );
}

function ReviewDetail({
  question,
  selected,
  index,
}: {
  question: ExamQuestionType;
  selected: number | null;
  index: number;
}) {
  const correct = selected !== null && selected === question.correctIndex;
  return (
    <div
      className="border-2 border-foreground rounded-xl p-4 space-y-3 font-hand"
      style={{ background: "#fff", boxShadow: "3px 3px 0 #2b2a35" }}
    >
      <p className="text-xs text-muted-foreground uppercase tracking-wide">
        Question {index + 1}
      </p>
      <p className="text-base font-bold text-foreground">{question.question}</p>
      <div className="space-y-1">
        {question.options.map((opt, i) => {
          const isCorrect = i === question.correctIndex;
          const isSelected = i === selected;
          let bg = "#fff";
          if (isCorrect) bg = "var(--accent-mint)";
          else if (isSelected) bg = "var(--accent-coral)";
          return (
            <div
              key={i}
              className="flex items-center gap-2 border-2 border-foreground rounded-lg px-3 py-1.5 text-sm"
              style={{ background: bg }}
            >
              <span className="w-5 h-5 rounded-full border-2 border-foreground flex items-center justify-center text-[10px] font-bold bg-white shrink-0">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="flex-1">{opt}</span>
              {isCorrect && <CheckCircle2 className="w-4 h-4" />}
              {isSelected && !isCorrect && <XCircle className="w-4 h-4" />}
            </div>
          );
        })}
      </div>
      {selected === null && (
        <p className="text-xs text-muted-foreground">You did not answer this question.</p>
      )}
      <p className="text-sm text-foreground bg-accent-lav/60 border-2 border-foreground rounded-lg p-2">
        <strong>{correct ? "Correct! " : "Why: "}</strong>
        {question.explanation}
      </p>
    </div>
  );
}
