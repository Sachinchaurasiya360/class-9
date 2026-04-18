"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronLeft, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { getSubjectLessonPaths, getSubjectFromPath } from "./EngineeringSidebar";
import {
  useEngProgress,
  isEngLessonUnlocked,
  isEngTabUnlocked,
  markEngTabComplete,
  markEngLessonComplete,
} from "../../utils/engineeringProgress";

export interface EngTabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

export interface EngQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface EngineeringLessonShellProps {
  title: string;
  level: number;
  lessonNumber: number;
  tabs: EngTabDef[];
  quiz: EngQuizQuestion[];
  nextLessonHint?: string;
  placementRelevance?: string;
}

/* ------------------------------------------------------------------ */
/*  Quiz Component (clean, non-sketchy)                                */
/* ------------------------------------------------------------------ */

function EngQuizCard({ questions, onComplete }: { questions: EngQuizQuestion[]; onComplete: () => void }) {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[currentQ];

  function handleSelect(idx: number) {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  }

  function handleNext() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((c) => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
      onComplete();
    }
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="card-eng p-8 text-center eng-fadeIn" style={{ maxWidth: 480, margin: "0 auto" }}>
        <div style={{ fontSize: "3rem", marginBottom: 12 }}>
          {pct >= 80 ? <CheckCircle2 className="w-16 h-16 mx-auto" style={{ color: "var(--eng-success)" }} /> : null}
        </div>
        <h3 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.5rem", color: "var(--eng-text)", margin: "0 0 8px" }}>
          {pct >= 80 ? "Excellent!" : pct >= 50 ? "Good effort!" : "Keep practicing!"}
        </h3>
        <p style={{ fontFamily: "var(--eng-font)", fontSize: "1rem", color: "var(--eng-text-muted)", margin: "0 0 4px" }}>
          You scored <strong>{score}/{questions.length}</strong> ({pct}%)
        </p>
      </div>
    );
  }

  return (
    <div className="card-eng p-6 eng-fadeIn" style={{ maxWidth: 640, margin: "0 auto" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
        <span className="tag-eng" style={{ background: "var(--eng-primary-light)", color: "var(--eng-primary)" }}>
          Question {currentQ + 1} of {questions.length}
        </span>
        <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)" }}>
          Score: {score}
        </span>
      </div>

      <h4 style={{ fontFamily: "var(--eng-font)", fontWeight: 600, fontSize: "1.05rem", color: "var(--eng-text)", margin: "0 0 16px", lineHeight: 1.5 }}>
        {q.question}
      </h4>

      <div className="space-y-2" style={{ marginBottom: 16 }}>
        {q.options.map((opt, idx) => {
          const isCorrect = idx === q.correctIndex;
          const isSelected = idx === selected;
          let bg = "var(--eng-surface)";
          let border = "1px solid var(--eng-border)";
          let color = "var(--eng-text)";

          if (answered) {
            if (isCorrect) { bg = "rgba(16,185,129,0.1)"; border = "1.5px solid var(--eng-success)"; color = "#065f46"; }
            else if (isSelected) { bg = "rgba(239,68,68,0.1)"; border = "1.5px solid var(--eng-danger)"; color = "#991b1b"; }
          } else if (isSelected) {
            bg = "var(--eng-primary-light)"; border = "1.5px solid var(--eng-primary)";
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={answered}
              className="w-full text-left flex items-center gap-3 transition-all"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                background: bg,
                border,
                color,
                fontFamily: "var(--eng-font)",
                fontSize: "0.9rem",
                cursor: answered ? "default" : "pointer",
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700,
                background: isSelected ? (answered ? (isCorrect ? "var(--eng-success)" : "var(--eng-danger)") : "var(--eng-primary)") : "#e2e8f0",
                color: isSelected ? "#fff" : "var(--eng-text-muted)",
                flexShrink: 0,
              }}>
                {String.fromCharCode(65 + idx)}
              </span>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>

      {answered && q.explanation && (
        <div className="info-eng eng-fadeIn" style={{ marginBottom: 16, fontSize: "0.85rem" }}>
          {q.explanation}
        </div>
      )}

      {answered && (
        <button onClick={handleNext} className="btn-eng" style={{ width: "100%" }}>
          {currentQ < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Lesson Header                                                      */
/* ------------------------------------------------------------------ */

function LessonHeader({
  title,
  level,
  lessonNumber,
  subjectLabel,
  totalLessons,
  currentIdx,
  placementRelevance,
}: {
  title: string;
  level: number;
  lessonNumber: number;
  subjectLabel: string;
  totalLessons: number;
  currentIdx: number;
  placementRelevance?: string;
}) {
  const mono = '"SF Mono", Menlo, Consolas, monospace';
  const num = String(lessonNumber).padStart(2, "0");
  const progressPct = totalLessons > 0 ? Math.round(((currentIdx + 1) / totalLessons) * 100) : 0;

  return (
    <div style={{ background: "var(--eng-surface)", borderBottom: "1px solid var(--eng-border)" }}>
      <div style={{ padding: "22px 28px 20px 28px", display: "flex", alignItems: "stretch", gap: 22, maxWidth: 1160, margin: "0 auto" }}>
        {/* Display-stat lesson number */}
        <div
          style={{
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingRight: 22,
            borderRight: "1px solid var(--eng-border)",
          }}
        >
          <span style={{ fontFamily: mono, fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.16em", color: "var(--eng-text-muted)", marginBottom: 2 }}>
            LESSON
          </span>
          <span
            style={{
              fontFamily: mono,
              fontSize: "2.75rem",
              fontWeight: 800,
              color: "var(--eng-text)",
              lineHeight: 1,
              letterSpacing: "-0.03em",
            }}
          >
            {num}
          </span>
          <span style={{ fontFamily: mono, fontSize: "0.64rem", fontWeight: 600, letterSpacing: "0.1em", color: "var(--eng-primary)", marginTop: 4 }}>
            LEVEL {level}
          </span>
        </div>

        {/* Title + metadata */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: mono, fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.08em", color: "var(--eng-text-muted)" }}>
            <span style={{ textTransform: "uppercase" }}>{subjectLabel}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ textTransform: "uppercase" }}>Level {level}</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: "var(--eng-text)", textTransform: "uppercase" }}>{lessonNumber} of {totalLessons}</span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "var(--eng-font)",
              fontWeight: 700,
              fontSize: "1.75rem",
              color: "var(--eng-text)",
              margin: 0,
              letterSpacing: "-0.015em",
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>

          {/* Metadata chips */}
          {placementRelevance && (
            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
              {placementRelevance && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "3px 9px",
                    fontFamily: mono,
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    color: "var(--eng-primary)",
                    background: "var(--eng-primary-light)",
                    border: "1px solid rgba(59,130,246,0.3)",
                    borderRadius: 4,
                  }}
                >
                  <span style={{ fontWeight: 700, letterSpacing: "0.08em" }}>PLACEMENT</span>
                  <span style={{ opacity: 0.5 }}>·</span>
                  <span>{placementRelevance}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress rail */}
      <div style={{ height: 2, background: "var(--eng-bg)", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: `${progressPct}%`,
            background: "var(--eng-primary)",
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Shell                                                         */
/* ------------------------------------------------------------------ */

export default function EngineeringLessonShell({
  title, level, lessonNumber, tabs, quiz, nextLessonHint, placementRelevance
}: EngineeringLessonShellProps) {
  const allTabs: EngTabDef[] = [
    ...tabs,
    {
      id: "__quiz",
      label: "Challenge",
      icon: <BookOpen className="w-4 h-4" />,
      content: null,
    },
  ];
  const [activeTab, setActiveTab] = useState(allTabs[0].id);

  const pathname = usePathname() ?? "";
  const router = useRouter();
  const allLessons = getSubjectLessonPaths(pathname);
  const currentIdx = allLessons.indexOf(pathname);
  const prevPath = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextPath = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const progress = useEngProgress();
  const tabIds = allTabs.map((t) => t.id);
  const lessonPath = pathname;

  useEffect(() => {
    markEngTabComplete(lessonPath, activeTab);
    if (activeTab === "__quiz") {
      markEngLessonComplete(lessonPath);
    }
  }, [activeTab, lessonPath]);

  const currentTabObj = allTabs.find((t) => t.id === activeTab);

  return (
    <div style={{ fontFamily: "var(--eng-font)", minHeight: "100vh", background: "var(--eng-bg)" }}>
      {/* Lesson header */}
      <LessonHeader
        title={title}
        level={level}
        lessonNumber={lessonNumber}
        subjectLabel={getSubjectFromPath(pathname).label}
        totalLessons={allLessons.length}
        currentIdx={currentIdx}
        placementRelevance={placementRelevance}
      />

      {/* Tab navigation */}
      <div style={{ background: "var(--eng-surface)", borderBottom: "1px solid var(--eng-border)", padding: "0 24px" }}>
        <div className="flex gap-1 overflow-x-auto" style={{ paddingTop: 4 }}>
          {allTabs.map((tab, idx) => {
            const isActive = tab.id === activeTab;
            const unlocked = isEngTabUnlocked(lessonPath, idx, tabIds, progress);

            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (unlocked) setActiveTab(tab.id);
                }}
                disabled={!unlocked}
                className="flex items-center gap-2 shrink-0 transition-all"
                style={{
                  padding: "10px 16px",
                  fontFamily: "var(--eng-font)",
                  fontSize: "0.85rem",
                  fontWeight: isActive ? 600 : 400,
                  color: !unlocked ? "#cbd5e1" : isActive ? "var(--eng-primary)" : "var(--eng-text-muted)",
                  background: "transparent",
                  border: "none",
                  borderBottom: isActive ? "2px solid var(--eng-primary)" : "2px solid transparent",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.5,
                }}
              >
                {!unlocked ? <Lock className="w-3.5 h-3.5" /> : tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: "24px", maxWidth: 960, margin: "0 auto" }}>
        <div className="eng-fadeIn" key={activeTab}>
          {activeTab === "__quiz" ? (
            <div>
              <h2 style={{ fontFamily: "var(--eng-font)", fontWeight: 700, fontSize: "1.25rem", color: "var(--eng-text)", margin: "0 0 16px" }}>
                Challenge Quiz
              </h2>
              <EngQuizCard questions={quiz} onComplete={() => {}} />
            </div>
          ) : (
            currentTabObj?.content
          )}
        </div>
      </div>

      {/* Prev / Next navigation */}
      <div style={{ background: "var(--eng-surface)", borderTop: "1px solid var(--eng-border)", padding: "16px 24px" }}>
        <div className="flex items-center justify-between" style={{ maxWidth: 960, margin: "0 auto" }}>
          {prevPath ? (
            <button onClick={() => router.push(prevPath)} className="btn-eng-outline" style={{ fontSize: "0.85rem" }}>
              <ChevronLeft className="w-4 h-4" /> Previous Lesson
            </button>
          ) : <div />}

          {nextPath ? (
            <button
              onClick={() => {
                if (isEngLessonUnlocked(nextPath, allLessons, progress)) router.push(nextPath);
              }}
              className="btn-eng"
              style={{ fontSize: "0.85rem", opacity: isEngLessonUnlocked(nextPath, allLessons, progress) ? 1 : 0.5 }}
            >
              Next Lesson <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span style={{ fontFamily: "var(--eng-font)", fontSize: "0.85rem", color: "var(--eng-success)", fontWeight: 600 }}>
              Subject Complete!
            </span>
          )}
        </div>
        {nextLessonHint && (
          <p style={{ fontFamily: "var(--eng-font)", fontSize: "0.8rem", color: "var(--eng-text-muted)", textAlign: "center", marginTop: 8, maxWidth: 960, margin: "8px auto 0" }}>
            Next up: {nextLessonHint}
          </p>
        )}
      </div>
    </div>
  );
}
