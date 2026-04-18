"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  Timer,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Target,
  Trophy,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { EXAM_CHAPTERS, EXAM_QUESTIONS, getQuestionsByChapter } from "@/data/examBank";
import {
  useExamState,
  getChapterAccuracy,
  getOverallStats,
  getReviewCount,
  getWeakestChapters,
} from "@/utils/examProgress";

export default function ExamPrepHubPage() {
  const examState = useExamState();
  const [practiceExpanded, setPracticeExpanded] = useState(false);

  // Re-compute derived stats off the subscribed state - since the helpers
  // read the same module-level state, useExamState triggers rerenders.
  void examState;
  const { totalAttempted, accuracy } = getOverallStats();
  const reviewCount = getReviewCount();
  const weakest = getWeakestChapters(1)[0];
  const weakestName = weakest
    ? EXAM_CHAPTERS.find((c) => c.slug === weakest.chapter)?.name ?? weakest.chapter
    : null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="relative">
        <div
          className="card-sketchy p-6 sm:p-8 space-y-3"
          style={{ background: "var(--accent-peach)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full border-2 border-foreground flex items-center justify-center text-2xl"
              style={{ background: "var(--accent-yellow)", boxShadow: "3px 3px 0 #2b2a35" }}
            >
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground">
                Exam Prep - CBSE AI 417
              </h1>
              <p className="font-hand text-sm text-muted-foreground">
                Board-exam ready practice for Class 9-10 students
              </p>
            </div>
          </div>
          <p className="font-hand text-base text-foreground/80 max-w-2xl">
            Chapter-wise drills, full-length timed papers, and a review pile that
            remembers the questions you struggled with. Everything runs locally - your
            progress stays on this device.
          </p>
        </div>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Attempted"
          value={totalAttempted.toString()}
          bg="var(--accent-sky)"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Accuracy"
          value={totalAttempted === 0 ? "-" : `${Math.round(accuracy * 100)}%`}
          bg="var(--accent-mint)"
        />
        <StatCard
          icon={<Trophy className="w-5 h-5" />}
          label="Best test"
          value={examState.bestTestScore > 0 ? `${examState.bestTestScore}%` : "-"}
          bg="var(--accent-yellow)"
        />
        <StatCard
          icon={<AlertCircle className="w-5 h-5" />}
          label="Weak area"
          value={weakestName ?? "-"}
          bg="var(--accent-coral)"
          small
        />
      </section>

      {/* Mode selector */}
      <section className="space-y-3">
        <h2 className="font-hand text-2xl font-bold text-foreground">Choose a mode</h2>

        <ModeCard
          title="Practice Mode"
          subtitle="Chapter-wise untimed practice with explanations"
          icon={<BookOpen className="w-6 h-6" />}
          bg="var(--accent-mint)"
          expanded={practiceExpanded}
          onClick={() => setPracticeExpanded((v) => !v)}
        />

        {practiceExpanded && (
          <div className="grid gap-2 pl-2">
            {EXAM_CHAPTERS.map((ch) => {
              const qs = getQuestionsByChapter(ch.slug);
              const acc = getChapterAccuracy(ch.slug);
              const attemptedInChapter = examState.chapterStats[ch.slug]?.attempted ?? 0;
              return (
                <Link
                  key={ch.slug}
                  href={`/exam-prep/practice/${ch.slug}`}
                  className="card-sketchy px-4 py-3 flex items-center gap-3 hover:-translate-y-0.5 transition-transform"
                  style={{ background: "#fffdf5" }}
                >
                  <span
                    className="w-10 h-10 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center text-xl"
                    style={{ background: "var(--accent-lav)", boxShadow: "2px 2px 0 #2b2a35" }}
                  >
                    {ch.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-hand text-base font-bold text-foreground truncate">
                      {ch.name}
                    </p>
                    <p className="font-hand text-xs text-muted-foreground truncate">
                      {qs.length} questions ·{" "}
                      {attemptedInChapter > 0
                        ? `${Math.round(acc * 100)}% accuracy`
                        : "not attempted"}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 shrink-0 text-muted-foreground" />
                </Link>
              );
            })}
          </div>
        )}

        <Link href="/exam-prep/test" className="block">
          <ModeCard
            title="Test Mode"
            subtitle="Simulate a real 30-question timed exam"
            icon={<Timer className="w-6 h-6" />}
            bg="var(--accent-sky)"
          />
        </Link>

        <Link href="/exam-prep/review" className="block">
          <ModeCard
            title="Review Mistakes"
            subtitle="Go over questions you got wrong until you master them"
            icon={<RefreshCw className="w-6 h-6" />}
            bg="var(--accent-coral)"
            badge={reviewCount > 0 ? reviewCount : undefined}
          />
        </Link>
      </section>

      {/* Chapter list */}
      <section className="space-y-3">
        <h2 className="font-hand text-2xl font-bold text-foreground">
          Chapters ({EXAM_QUESTIONS.length} questions in the bank)
        </h2>
        <div className="space-y-2">
          {EXAM_CHAPTERS.map((ch) => {
            const qs = getQuestionsByChapter(ch.slug);
            const acc = getChapterAccuracy(ch.slug);
            const stats = examState.chapterStats[ch.slug];
            return (
              <div
                key={ch.slug}
                className="card-sketchy p-4 flex items-center gap-4"
                style={{ background: "#fffdf5" }}
              >
                <span
                  className="w-12 h-12 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center text-2xl"
                  style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
                >
                  {ch.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <h3 className="font-hand text-lg font-bold text-foreground">{ch.name}</h3>
                    <span className="font-hand text-[11px] text-muted-foreground uppercase">
                      {ch.totalMarks} marks
                    </span>
                  </div>
                  <p className="font-hand text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {ch.description}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 font-hand text-[11px] text-muted-foreground">
                    <span>{qs.length} questions</span>
                    {stats && stats.attempted > 0 ? (
                      <span>
                        {stats.correct} / {stats.attempted} correct ·{" "}
                        <strong className="text-foreground">{Math.round(acc * 100)}%</strong>
                      </span>
                    ) : (
                      <span>Not yet attempted</span>
                    )}
                  </div>
                </div>
                <Link
                  href={`/exam-prep/practice/${ch.slug}`}
                  className="btn-sketchy font-hand text-sm shrink-0"
                >
                  Practice
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Sub-components
 * ------------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
  bg,
  small = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  small?: boolean;
}) {
  return (
    <div
      className="card-sketchy p-3 flex flex-col gap-1"
      style={{ background: bg }}
    >
      <div className="flex items-center gap-1.5 font-hand text-[11px] uppercase tracking-wide text-foreground/70">
        {icon}
        {label}
      </div>
      <p
        className={`font-hand font-bold text-foreground leading-tight ${small ? "text-base" : "text-2xl"}`}
      >
        {value}
      </p>
    </div>
  );
}

function ModeCard({
  title,
  subtitle,
  icon,
  bg,
  expanded,
  onClick,
  badge,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  bg: string;
  expanded?: boolean;
  onClick?: () => void;
  badge?: number;
}) {
  const content = (
    <div
      className="card-sketchy w-full p-5 flex items-center gap-4 text-left hover:-translate-y-0.5 transition-transform"
      style={{ background: bg }}
    >
      <span
        className="w-12 h-12 shrink-0 rounded-full border-2 border-foreground flex items-center justify-center bg-white"
        style={{ boxShadow: "2px 2px 0 #2b2a35" }}
      >
        {icon}
      </span>
      <div className="flex-1">
        <h3 className="font-hand text-xl font-bold text-foreground">{title}</h3>
        <p className="font-hand text-sm text-foreground/80">{subtitle}</p>
      </div>
      {badge !== undefined && (
        <span
          className="font-hand text-sm font-bold px-2.5 py-1 rounded-full border-2 border-foreground bg-white"
          style={{ boxShadow: "2px 2px 0 #2b2a35" }}
        >
          {badge}
        </span>
      )}
      <ChevronRight
        className={`w-6 h-6 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
      />
    </div>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="block w-full">
        {content}
      </button>
    );
  }
  return content;
}
