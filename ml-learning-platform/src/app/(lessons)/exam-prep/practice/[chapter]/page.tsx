"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { ArrowLeft, ChevronRight, Sparkles, Trophy } from "lucide-react";
import ExamQuestion from "@/components/exam/ExamQuestion";
import { EXAM_CHAPTERS, getQuestionsByChapter } from "@/data/examBank";
import { recordAttempt } from "@/utils/examProgress";
import { awardExamQuestion } from "@/utils/gamification";

export default function PracticeChapterPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter: slug } = use(params);
  const chapterMeta = EXAM_CHAPTERS.find((c) => c.slug === slug);
  const questions = useMemo(() => getQuestionsByChapter(slug), [slug]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<
    { selected: number; correct: boolean; topic?: string }[]
  >([]);
  const [finished, setFinished] = useState(false);

  if (!chapterMeta) {
    return (
      <div className="space-y-4">
        <Link
          href="/exam-prep"
          className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exam prep
        </Link>
        <div className="card-sketchy p-6 font-hand">
          <p className="text-foreground">Chapter not found.</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="space-y-4">
        <Link
          href="/exam-prep"
          className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" /> Back to exam prep
        </Link>
        <div className="card-sketchy p-6 font-hand">
          <p className="text-foreground">No questions in this chapter yet.</p>
        </div>
      </div>
    );
  }

  const question = questions[index];
  const answered = answers[index];
  const correctCount = answers.filter((a) => a?.correct).length;

  function handleAnswer(selectedIndex: number, correct: boolean) {
    setAnswers((prev) => {
      const next = prev.slice();
      next[index] = { selected: selectedIndex, correct, topic: question.topic };
      return next;
    });
    recordAttempt(question.id, selectedIndex, correct);
    awardExamQuestion(correct);
  }

  function handleNext() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);

    // Weak topics inside this chapter
    const topicTotals = new Map<string, { attempted: number; correct: number }>();
    answers.forEach((a) => {
      if (!a || !a.topic) return;
      const t = topicTotals.get(a.topic) ?? { attempted: 0, correct: 0 };
      t.attempted += 1;
      if (a.correct) t.correct += 1;
      topicTotals.set(a.topic, t);
    });
    const weakTopics = Array.from(topicTotals.entries())
      .map(([topic, s]) => ({
        topic,
        accuracy: s.attempted === 0 ? 1 : s.correct / s.attempted,
        attempted: s.attempted,
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .filter((t) => t.accuracy < 1)
      .slice(0, 3);

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
          style={{ background: "var(--accent-yellow)" }}
        >
          <Trophy className="w-12 h-12 mx-auto" />
          <h2 className="font-hand text-3xl font-bold text-foreground">
            Chapter complete!
          </h2>
          <p className="font-hand text-lg text-foreground">
            You scored{" "}
            <span className="marker-highlight-coral font-bold">
              {correctCount} / {questions.length}
            </span>{" "}
            ({pct}%)
          </p>
          <p className="font-hand text-sm text-foreground/80">
            {pct === 100
              ? "Perfect! You own this chapter."
              : pct >= 75
                ? "Great work - a couple more reps and you'll ace it."
                : "Review the ones you missed and try again when you're ready."}
          </p>
        </div>

        {weakTopics.length > 0 && (
          <div className="card-sketchy p-5 space-y-3" style={{ background: "#fffdf5" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-hand text-xl font-bold text-foreground">
                Topics to revisit
              </h3>
            </div>
            <ul className="space-y-2">
              {weakTopics.map((t) => (
                <li
                  key={t.topic}
                  className="flex items-center justify-between font-hand text-sm border-2 border-foreground rounded-lg px-3 py-2 bg-white"
                >
                  <span className="text-foreground capitalize">{t.topic.replace(/-/g, " ")}</span>
                  <span className="text-muted-foreground">
                    {Math.round(t.accuracy * 100)}% ({t.attempted} attempts)
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIndex(0);
              setAnswers([]);
              setFinished(false);
            }}
            className="btn-sketchy-outline font-hand"
          >
            Try again
          </button>
          <Link href="/exam-prep" className="btn-sketchy font-hand">
            Back to hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/exam-prep"
        className="inline-flex items-center gap-2 font-hand text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" /> Back to exam prep
      </Link>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-xl"
            style={{ background: "var(--accent-lav)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            {chapterMeta.icon}
          </span>
          <div>
            <h1 className="font-hand text-2xl font-bold text-foreground">
              {chapterMeta.name}
            </h1>
            <p className="font-hand text-xs text-muted-foreground">
              Practice mode · untimed · explanations shown
            </p>
          </div>
        </div>
        <div
          className="font-hand px-3 py-1.5 rounded-full border-2 border-foreground text-sm font-bold"
          style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
        >
          Question {index + 1} / {questions.length}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-3 rounded-full border-2 border-foreground overflow-hidden bg-background">
        <div
          className="h-full transition-all"
          style={{
            width: `${((index + (answered ? 1 : 0)) / questions.length) * 100}%`,
            background: "var(--accent-mint)",
          }}
        />
      </div>

      <ExamQuestion
        question={question}
        mode="practice"
        onAnswer={handleAnswer}
        showExplanation
      />

      {answered && (
        <div className="flex items-center justify-between gap-3">
          <span className="font-hand text-sm text-muted-foreground">
            {correctCount} correct so far
          </span>
          <button type="button" onClick={handleNext} className="btn-sketchy font-hand inline-flex items-center gap-1.5">
            {index < questions.length - 1 ? "Next question" : "See results"}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
