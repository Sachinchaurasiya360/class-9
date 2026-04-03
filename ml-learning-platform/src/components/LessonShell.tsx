import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import QuizCard from "./QuizCard";
import { ALL_LESSONS } from "./Sidebar";
import { playClick } from "../utils/sounds";

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

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
          Level {level} &middot; Lesson {lessonNumber}
        </p>
        <h1 className="text-xl font-bold text-slate-800 mt-1">{title}</h1>
      </div>

      {/* Story section */}
      {story}

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {allTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              playClick();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "__quiz" ? (
          <div className="space-y-4">
            <QuizCard questions={quiz} />
            {nextLessonHint && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-center">
                <p className="text-sm text-indigo-800 font-medium">{nextLessonHint}</p>
              </div>
            )}
          </div>
        ) : (
          tabs.find((t) => t.id === activeTab)?.content
        )}
      </div>

      {/* Previous / Next navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        {prevPath ? (
          <button
            onClick={() => { playClick(); navigate(prevPath); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous Lesson
          </button>
        ) : (
          <div />
        )}
        {nextPath ? (
          <button
            onClick={() => { playClick(); navigate(nextPath); }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Next Lesson
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="px-4 py-2.5 rounded-lg text-sm font-medium text-green-700 bg-green-50 border border-green-200">
            You've completed all lessons!
          </div>
        )}
      </div>
    </div>
  );
}
