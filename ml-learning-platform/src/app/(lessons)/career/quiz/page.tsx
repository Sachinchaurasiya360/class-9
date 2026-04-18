"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  RefreshCw,
  SkipForward,
  Sparkles,
  Trophy,
} from "lucide-react";
import {
  CAREER_QUIZ,
  scoreQuiz,
  type QuizAnswer,
  type CareerMatch,
} from "@/utils/careerQuiz";
import { awardCareerQuizComplete } from "@/utils/gamification";
import type { CareerAccent } from "@/data/careers";

type Stage = "intro" | "questions" | "results";

const ACCENT_BG: Record<CareerAccent, string> = {
  coral: "var(--accent-coral)",
  mint: "var(--accent-mint)",
  yellow: "var(--accent-yellow)",
  lav: "var(--accent-lav)",
  sky: "var(--accent-sky)",
  peach: "var(--accent-peach)",
};

export default function CareerQuizPage() {
  const [stage, setStage] = useState<Stage>("intro");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const awardedRef = useRef(false);

  const total = CAREER_QUIZ.length;
  const question = CAREER_QUIZ[index];

  const results: CareerMatch[] = useMemo(() => {
    if (stage !== "results") return [];
    return scoreQuiz(answers);
  }, [stage, answers]);

  // Award XP + badge exactly once on reaching results.
  useEffect(() => {
    if (stage === "results" && !awardedRef.current) {
      awardedRef.current = true;
      awardCareerQuizComplete();
    }
  }, [stage]);

  function start() {
    setAnswers([]);
    setIndex(0);
    awardedRef.current = false;
    setStage("questions");
  }

  function recordAnswer(selectedIndex: number) {
    const next: QuizAnswer[] = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, selectedIndex },
    ];
    setAnswers(next);
    advance();
  }

  function skip() {
    // Skip = record an invalid index so nothing is counted.
    const next: QuizAnswer[] = [
      ...answers.filter((a) => a.questionId !== question.id),
      { questionId: question.id, selectedIndex: -1 },
    ];
    setAnswers(next);
    advance();
  }

  function advance() {
    if (index + 1 >= total) {
      setStage("results");
    } else {
      setIndex(index + 1);
    }
  }

  function back() {
    if (index > 0) setIndex(index - 1);
  }

  function retake() {
    setAnswers([]);
    setIndex(0);
    awardedRef.current = false;
    setStage("intro");
  }

  /* ------------------------------ Intro ------------------------------ */
  if (stage === "intro") {
    return (
      <div className="space-y-5">
        <Link
          href="/career"
          className="inline-flex items-center gap-1.5 font-hand text-sm font-bold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to careers
        </Link>

        <div>
          <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Career Quiz
          </p>
          <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
            <span className="marker-highlight-coral">Find your AI career match</span>
          </h1>
        </div>

        <div
          className="card-sketchy p-6 space-y-4"
          style={{ background: "var(--accent-yellow)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl border-2 border-foreground flex items-center justify-center flex-shrink-0"
              style={{ background: "#fff8e7", boxShadow: "2px 2px 0 #2b2a35" }}
              aria-hidden
            >
              <Compass className="w-7 h-7 text-foreground" />
            </div>
            <div>
              <p className="font-hand text-xl font-bold text-foreground">
                15 quick questions
              </p>
              <p className="font-hand text-sm text-foreground/80">
                Takes about 2 minutes - answer honestly, no &quot;right&quot; answers
              </p>
            </div>
          </div>

          <ul className="space-y-1.5 font-hand text-sm text-foreground/85">
            <li className="flex items-center gap-2">
              <span className="font-bold">→</span> Pick the option that feels most like you
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">→</span> You can skip any question you&apos;re unsure about
            </li>
            <li className="flex items-center gap-2">
              <span className="font-bold">→</span> At the end we&apos;ll show your top 3 career matches
            </li>
          </ul>

          <button
            onClick={start}
            className="btn-sketchy text-base font-hand w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4" />
            Start the quiz
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  /* ---------------------------- Questions ---------------------------- */
  if (stage === "questions") {
    const progressPct = Math.round(((index + 1) / total) * 100);
    const selected = answers.find((a) => a.questionId === question.id);

    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <button
            onClick={retake}
            className="inline-flex items-center gap-1.5 font-hand text-sm font-bold text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Quit
          </button>
          <p className="font-hand text-xs text-muted-foreground">
            Question {index + 1} / {total}
          </p>
        </div>

        <div
          className="card-sketchy p-5 sm:p-6"
          style={{ background: "#fff8e7" }}
        >
          {/* Progress bar */}
          <div className="mb-4">
            <div className="h-3 rounded-full border-2 border-foreground overflow-hidden bg-background">
              <div
                className="h-full transition-all"
                style={{
                  width: `${progressPct}%`,
                  background: "var(--accent-coral)",
                }}
              />
            </div>
            <p className="font-hand text-[11px] text-muted-foreground mt-1 text-right">
              {progressPct}% done
            </p>
          </div>

          <h2 className="font-hand text-xl sm:text-2xl font-bold text-foreground mb-4 leading-snug">
            {question.question}
          </h2>

          <div className="space-y-2.5">
            {question.options.map((opt, i) => {
              const isSelected = selected?.selectedIndex === i;
              return (
                <button
                  key={i}
                  onClick={() => recordAnswer(i)}
                  className={`w-full text-left p-4 rounded-xl border-2 border-foreground font-hand text-sm sm:text-base transition-all ${
                    isSelected ? "font-bold" : "hover:-translate-y-0.5"
                  }`}
                  style={{
                    background: isSelected
                      ? "var(--accent-yellow)"
                      : "var(--accent-mint)",
                    boxShadow: "2px 2px 0 #2b2a35",
                  }}
                >
                  <span className="text-foreground/85">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-dashed border-foreground/30">
            <button
              onClick={back}
              disabled={index === 0}
              className="btn-sketchy-outline text-sm"
              style={{
                opacity: index === 0 ? 0.4 : 1,
                cursor: index === 0 ? "not-allowed" : "pointer",
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={skip}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-hand text-sm font-bold text-muted-foreground hover:text-foreground"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------ Results ------------------------------ */
  const top3 = results.slice(0, 3);
  const leader = top3[0];

  return (
    <div className="space-y-5">
      <Link
        href="/career"
        className="inline-flex items-center gap-1.5 font-hand text-sm font-bold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to careers
      </Link>

      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Quiz Complete
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-yellow">Your top AI career matches</span>
        </h1>
        <p className="font-hand text-sm text-muted-foreground mt-2">
          Based on your answers. Remember - these are starting points, not
          verdicts. You earned +40 XP and the Career Ready badge!
        </p>
      </div>

      {/* Leader spotlight */}
      {leader && (
        <div
          className="card-sketchy p-5 sm:p-6"
          style={{ background: ACCENT_BG[leader.career.accent] }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-foreground" />
            <p className="font-hand text-xs font-bold uppercase tracking-wider text-foreground">
              Your top match
            </p>
          </div>
          <div className="flex items-start gap-4">
            <div
              className="w-16 h-16 rounded-xl border-2 border-foreground flex items-center justify-center text-4xl flex-shrink-0"
              style={{
                background: "#fff8e7",
                boxShadow: "2px 2px 0 #2b2a35",
              }}
              aria-hidden
            >
              {leader.career.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-hand text-2xl font-bold text-foreground leading-tight">
                {leader.career.name}
              </h2>
              <p className="font-hand text-sm text-foreground/85 mt-1 leading-snug">
                {leader.career.shortDescription}
              </p>
              <div
                className="inline-flex items-center gap-1 mt-3 px-3 py-1 rounded-full border-2 border-foreground font-hand text-sm font-bold"
                style={{
                  background: "#fff8e7",
                  boxShadow: "2px 2px 0 #2b2a35",
                }}
              >
                {leader.score}% match
              </div>
            </div>
          </div>
          <Link
            href={`/career/${leader.career.slug}`}
            className="btn-sketchy text-sm font-hand mt-4 inline-flex"
          >
            View full details
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Runner-ups */}
      {top3.length > 1 && (
        <div>
          <h2 className="font-hand text-lg font-bold text-foreground mb-3">
            Also worth exploring
          </h2>
          <div className="space-y-3">
            {top3.slice(1).map((m) => (
              <Link
                key={m.career.slug}
                href={`/career/${m.career.slug}`}
                className="card-sketchy p-4 flex items-center gap-3 group"
                style={{ background: ACCENT_BG[m.career.accent] }}
              >
                <div
                  className="w-12 h-12 rounded-xl border-2 border-foreground flex items-center justify-center text-2xl flex-shrink-0"
                  style={{
                    background: "#fff8e7",
                    boxShadow: "2px 2px 0 #2b2a35",
                  }}
                  aria-hidden
                >
                  {m.career.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <h3 className="font-hand text-lg font-bold text-foreground leading-tight truncate">
                      {m.career.name}
                    </h3>
                    <span className="font-hand text-xs font-bold text-foreground/70 flex-shrink-0">
                      {m.score}% match
                    </span>
                  </div>
                  <p className="font-hand text-xs text-foreground/85 leading-snug truncate">
                    {m.career.shortDescription}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-foreground flex-shrink-0 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={retake} className="btn-sketchy-outline text-sm">
          <RefreshCw className="w-4 h-4" />
          Retake quiz
        </button>
        <Link href="/career" className="btn-sketchy text-sm font-hand">
          Browse all careers
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
