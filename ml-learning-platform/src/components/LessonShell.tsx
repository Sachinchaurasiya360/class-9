import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import QuizCard from "./QuizCard";
import PredictionGate from "./PredictionGate";
import { ALL_LESSONS, ALL_LESSONS_META } from "./Sidebar";
import { playClick } from "../utils/sounds";
import { getLessonExtras } from "../data/lessonExtras";
import { registerCards } from "../utils/reviewDeck";
import {
  useProgress,
  isLessonUnlocked,
  isTabUnlocked,
  markTabComplete,
  markLessonComplete,
} from "../utils/progress";

interface TabDef {
  id: string;
  label: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface LessonShellProps {
  title: string;
  level: number;
  lessonNumber: number;
  tabs: TabDef[];
  quiz: QuizQuestion[];
  nextLessonHint?: string;
  story?: React.ReactNode;
}

export default function LessonShell({ title, level, lessonNumber, tabs, quiz, nextLessonHint, story }: LessonShellProps) {
  const allTabs = [
    ...tabs,
    {
      id: "__quiz",
      label: "Challenge",
      icon: <BookOpen className="w-4 h-4" />,
      content: null,
    },
  ];
  const [activeTab, setActiveTab] = useState(allTabs[0].id);

  const location = useLocation();
  const navigate = useNavigate();
  const currentIdx = ALL_LESSONS.indexOf(location.pathname);
  const prevPath = currentIdx > 0 ? ALL_LESSONS[currentIdx - 1] : null;
  const nextPath = currentIdx < ALL_LESSONS.length - 1 ? ALL_LESSONS[currentIdx + 1] : null;

  const progress = useProgress();
  const tabIds = allTabs.map((t) => t.id);
  const lessonPath = location.pathname;
  const nextLessonReady = nextPath ? isLessonUnlocked(nextPath, progress) : false;

  const extras = getLessonExtras(lessonPath);

  // Mark tab complete when visited; mark lesson complete when reaching Challenge
  useEffect(() => {
    markTabComplete(lessonPath, activeTab);
    if (activeTab === "__quiz") {
      markLessonComplete(lessonPath);
    }
  }, [activeTab, lessonPath]);

  // Register spaced-repetition cards on first visit
  useEffect(() => {
    if (extras?.cards?.length) {
      registerCards(
        extras.cards.map((c, i) => ({
          id: `${lessonPath}#${i}`,
          lessonPath,
          question: c.question,
          answer: c.answer,
        }))
      );
    }
  }, [lessonPath, extras]);

  // Reset to first tab when navigating to a new lesson
  useEffect(() => {
    setActiveTab(allTabs[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonPath]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="font-hand text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Level {level} &middot; Lesson {lessonNumber}
        </p>
        <h1 className="font-hand text-3xl sm:text-4xl font-bold text-foreground mt-1">
          <span className="marker-highlight-yellow">{title}</span>
        </h1>
      </div>

      {/* Story section */}
      {story}

      {/* Predict-First gate */}
      {extras?.predict && (
        <PredictionGate lessonPath={lessonPath} prompt={extras.predict} />
      )}

      {/* Tab bar */}
      <div className="flex gap-2 p-1.5 overflow-x-auto card-sketchy">
        {allTabs.map((tab, i) => {
          const unlocked = isTabUnlocked(lessonPath, i, tabIds, progress);
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (!unlocked) return;
                setActiveTab(tab.id);
                playClick();
              }}
              disabled={!unlocked}
              title={!unlocked ? "Complete the previous activity to unlock" : undefined}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-hand text-sm font-bold whitespace-nowrap transition-all border-2 ${
                isActive
                  ? "bg-accent-yellow text-foreground border-foreground shadow-[2px_2px_0_#2b2a35]"
                  : unlocked
                    ? "text-muted-foreground border-transparent hover:text-foreground hover:bg-accent-mint/30"
                    : "text-muted-foreground/50 border-transparent cursor-not-allowed opacity-60"
              }`}
            >
              {unlocked ? tab.icon : <Lock className="w-3.5 h-3.5" />}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "__quiz" ? (
          <div className="space-y-4">
            <QuizCard questions={quiz} />
            {nextLessonHint && (
              <div className="card-sketchy p-4 text-center" style={{ background: "#fff8e7" }}>
                <p className="font-hand text-base text-foreground font-bold">{nextLessonHint}</p>
              </div>
            )}
          </div>
        ) : (
          tabs.find((t) => t.id === activeTab)?.content
        )}
      </div>

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between pt-5 border-t-2 border-dashed border-foreground/30">
        {prevPath ? (
          <button
            onClick={() => { playClick(); navigate(prevPath); }}
            className="btn-sketchy-outline text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
        ) : (
          <div />
        )}
        {nextPath ? (
          <button
            onClick={() => {
              if (!nextLessonReady) return;
              playClick();
              navigate(nextPath);
            }}
            disabled={!nextLessonReady}
            title={!nextLessonReady ? "Finish the Challenge tab to unlock the next lesson" : undefined}
            className="btn-sketchy text-sm font-hand"
            style={{ opacity: nextLessonReady ? 1 : 0.5, cursor: nextLessonReady ? "pointer" : "not-allowed" }}
          >
            {nextLessonReady ? null : <Lock className="w-3.5 h-3.5" />}
            Next: {ALL_LESSONS_META[currentIdx + 1]?.label}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div
            className="px-4 py-2.5 rounded-lg font-hand text-sm font-bold text-foreground border-2 border-foreground"
            style={{ background: "var(--accent-mint)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            🎉 You've completed all lessons!
          </div>
        )}
      </div>
    </div>
  );
}
