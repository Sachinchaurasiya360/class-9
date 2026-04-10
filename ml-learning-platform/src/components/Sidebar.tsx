"use client";

import { useState, useEffect } from "react";
import { Lock } from "lucide-react";
import { useProgress, isLessonUnlocked } from "../utils/progress";
import { useDueCount } from "../utils/reviewDeck";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  Binary,
  Database,
  Axis3D,
  Search,
  ArrowUpDown,
  Sparkles,
  TrendingUp,
  ListOrdered,
  Brain,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronRight,
  Target,
  Users,
  GitFork,
  BarChart3,
  Layers,
  CircleDot,
  LineChart,
  Zap,
  Activity,
  Network,
  ArrowLeftRight,
  TrendingDown,
  Gauge,
  Shield,
  Shuffle,
  ImageIcon,
  Grid3X3,
  Move,
  Box,
  Clock,
  AlertTriangle,
  Scale,
  Radar,
  ToggleLeft,
  Tags,
  Scissors,
  Split,
  ShieldAlert,
  Minimize2,
  Hand,
  Eye,
  Sliders,
  Play,
} from "lucide-react";

interface LessonDef {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface LevelDef {
  level: number;
  title: string;
  lessons: LessonDef[];
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    title: "What Are Machines & Data?",
    lessons: [
      { path: "/level1/machines", label: "Machines & Instructions", icon: <Cpu className="w-4 h-4" /> },
      { path: "/level1/computers", label: "How Computers Work", icon: <Binary className="w-4 h-4" /> },
      { path: "/level1/data", label: "What Is Data?", icon: <Database className="w-4 h-4" /> },
      { path: "/level1/senses", label: "Sensors: How Machines Sense", icon: <Radar className="w-4 h-4" /> },
      { path: "/level1/bits", label: "Bits, Bytes & Files", icon: <ToggleLeft className="w-4 h-4" /> },
    ],
  },
  {
    level: 2,
    title: "Seeing Patterns in Data",
    lessons: [
      { path: "/level2/coordinates", label: "Coordinates & Graphs", icon: <Axis3D className="w-4 h-4" /> },
      { path: "/level2/patterns", label: "Spotting Patterns", icon: <Search className="w-4 h-4" /> },
      { path: "/level2/sorting", label: "Sorting & Grouping", icon: <ArrowUpDown className="w-4 h-4" /> },
      { path: "/level2/outliers", label: "Spotting Outliers", icon: <AlertTriangle className="w-4 h-4" /> },
      { path: "/level2/averages", label: "Mean & Median", icon: <Scale className="w-4 h-4" /> },
    ],
  },
  {
    level: 3,
    title: "From Patterns to Predictions",
    lessons: [
      { path: "/level3/predictions", label: "What Is a Prediction?", icon: <Sparkles className="w-4 h-4" /> },
      { path: "/level3/best-line", label: "Drawing the Best Line", icon: <TrendingUp className="w-4 h-4" /> },
      { path: "/level3/algorithms", label: "What Is an Algorithm?", icon: <ListOrdered className="w-4 h-4" /> },
      { path: "/level3/how-computers-learn", label: "How Computers Learn", icon: <Brain className="w-4 h-4" /> },
      { path: "/level3/features-labels", label: "Features & Labels", icon: <Tags className="w-4 h-4" /> },
      { path: "/level3/train-test", label: "Train & Test Split", icon: <Scissors className="w-4 h-4" /> },
    ],
  },
  {
    level: 4,
    title: "Introduction to ML",
    lessons: [
      { path: "/level4/supervised-learning", label: "Supervised Learning", icon: <Target className="w-4 h-4" /> },
      { path: "/level4/knn", label: "K-Nearest Neighbors", icon: <Users className="w-4 h-4" /> },
      { path: "/level4/decision-trees", label: "Decision Trees", icon: <GitFork className="w-4 h-4" /> },
      { path: "/level4/measuring-success", label: "Measuring Success", icon: <BarChart3 className="w-4 h-4" /> },
      { path: "/level4/train-test-split", label: "Train vs Test", icon: <Split className="w-4 h-4" /> },
      { path: "/level4/confusion-matrix", label: "Confusion Matrix", icon: <Grid3X3 className="w-4 h-4" /> },
    ],
  },
  {
    level: 5,
    title: "Unsupervised Learning",
    lessons: [
      { path: "/level5/unsupervised-learning", label: "What Is Unsupervised?", icon: <Layers className="w-4 h-4" /> },
      { path: "/level5/kmeans", label: "K-Means Clustering", icon: <CircleDot className="w-4 h-4" /> },
      { path: "/level5/choosing-k", label: "Choosing K", icon: <LineChart className="w-4 h-4" /> },
      { path: "/level5/anomaly", label: "Anomaly Detection", icon: <ShieldAlert className="w-4 h-4" /> },
      { path: "/level5/dimensionality", label: "Dimensionality Reduction", icon: <Minimize2 className="w-4 h-4" /> },
    ],
  },
  {
    level: 6,
    title: "Neural Networks",
    lessons: [
      { path: "/level6/perceptron", label: "The Perceptron", icon: <Zap className="w-4 h-4" /> },
      { path: "/level6/activation-functions", label: "Activation Functions", icon: <Activity className="w-4 h-4" /> },
      { path: "/level6/neural-network", label: "Building a Neural Network", icon: <Network className="w-4 h-4" /> },
      { path: "/level6/backpropagation", label: "Backpropagation", icon: <ArrowLeftRight className="w-4 h-4" /> },
      { path: "/level6/weights-biases", label: "Weights & Biases", icon: <Sliders className="w-4 h-4" /> },
      { path: "/level6/forward-pass", label: "Forward Pass", icon: <Play className="w-4 h-4" /> },
    ],
  },
  {
    level: 7,
    title: "Training & Optimization",
    lessons: [
      { path: "/level7/gradient-descent", label: "Gradient Descent", icon: <TrendingDown className="w-4 h-4" /> },
      { path: "/level7/learning-rate", label: "Learning Rate & Momentum", icon: <Gauge className="w-4 h-4" /> },
      { path: "/level7/overfitting", label: "Overfitting & Regularization", icon: <Shield className="w-4 h-4" /> },
      { path: "/level7/sgd-vs-batch", label: "SGD vs Batch", icon: <Shuffle className="w-4 h-4" /> },
    ],
  },
  {
    level: 8,
    title: "Computer Vision & CNNs",
    lessons: [
      { path: "/level8/images-as-data", label: "Images as Data", icon: <ImageIcon className="w-4 h-4" /> },
      { path: "/level8/filters", label: "Filters & Convolution", icon: <Grid3X3 className="w-4 h-4" /> },
      { path: "/level8/stride-padding", label: "Stride, Padding & Pooling", icon: <Move className="w-4 h-4" /> },
      { path: "/level8/mini-cnn", label: "Building a Mini CNN", icon: <Box className="w-4 h-4" /> },
      { path: "/level8/history", label: "The Story of ML", icon: <Clock className="w-4 h-4" /> },
    ],
  },
  {
    level: 9,
    title: "Live AI with Your Camera",
    lessons: [
      { path: "/level9/hand-tracking", label: "Hand Tracking (MediaPipe)", icon: <Hand className="w-4 h-4" /> },
      { path: "/level9/gesture-recognition", label: "Gesture Recognition", icon: <Sparkles className="w-4 h-4" /> },
      { path: "/level9/object-detection", label: "Object Detection", icon: <Eye className="w-4 h-4" /> },
    ],
  },
];

// Flat list of all lesson paths in order  used for prev/next navigation
export const ALL_LESSONS = LEVELS.flatMap((l) => l.lessons.map((ls) => ls.path));
export const ALL_LESSONS_META = LEVELS.flatMap((l) => l.lessons.map((ls) => ({ path: ls.path, label: ls.label })));

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const progress = useProgress();
  const dueCount = useDueCount();

  // Determine which level the current route is in, and auto-expand it
  const currentLevelIdx = LEVELS.findIndex((l) =>
    l.lessons.some((ls) => ls.path === pathname)
  );

  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    LEVELS.forEach((_, i) => { init[i] = i === currentLevelIdx; });
    return init;
  });

  useEffect(() => {
    if (currentLevelIdx >= 0) {
      setExpandedLevels((prev) => (prev[currentLevelIdx] ? prev : { ...prev, [currentLevelIdx]: true }));
    }
  }, [currentLevelIdx]);

  function toggleLevel(idx: number) {
    setExpandedLevels((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  const isReviewActive = pathname === "/review";

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-background border-r-2 border-foreground overflow-y-auto transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16" : "w-72"}`}
      >
        {/* Logo + collapse toggle */}
        <div className={`p-4 border-b-2 border-foreground flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div>
              <h2 className="font-hand text-2xl font-bold text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-accent-coral shrink-0" />
                ML Path
              </h2>
              <p className="text-[11px] text-muted-foreground mt-1 font-hand">From Machines to Machine Learning</p>
            </div>
          )}
          {collapsed && <Brain className="w-6 h-6 text-accent-coral" />}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-accent-yellow/40 text-foreground/60 hover:text-foreground transition-colors shrink-0 border-2 border-transparent hover:border-foreground"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`p-3 space-y-1 ${collapsed ? "px-2" : ""}`}>
          <Link
            href="/review"
            onClick={onClose}
            title={collapsed ? `Review (${dueCount} due)` : undefined}
            className={`flex items-center rounded-lg text-sm font-hand transition-all mb-2 ${
              collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2"
            } ${
              isReviewActive
                ? "bg-accent-coral text-background border-2 border-foreground font-bold shadow-[2px_2px_0_#2b2a35]"
                : "text-foreground/80 hover:bg-accent-mint/30 hover:text-foreground border-2 border-transparent"
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Review Deck</span>}
            {dueCount > 0 && (
              <span
                className={`${collapsed ? "absolute" : "ml-auto"} text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-foreground`}
                style={{ background: "var(--accent-yellow)", color: "var(--foreground)" }}
              >
                {dueCount}
              </span>
            )}
          </Link>

          {LEVELS.map((level, idx) => {
            const isExpanded = expandedLevels[idx] ?? false;
            const hasActivePage = level.lessons.some((ls) => ls.path === pathname);

            return (
              <div key={level.level}>
                {!collapsed ? (
                  <button
                    onClick={() => toggleLevel(idx)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg font-hand text-left transition-colors ${
                      hasActivePage
                        ? "text-foreground bg-accent-yellow/40"
                        : "text-muted-foreground hover:bg-accent-yellow/20 hover:text-foreground"
                    }`}
                  >
                    <span className="uppercase tracking-wider text-[11px] font-bold">
                      Level {level.level}: {level.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                ) : (
                  <div className="text-[10px] font-bold text-muted-foreground text-center mb-1 mt-2 font-hand">L{level.level}</div>
                )}

                {(isExpanded || collapsed) && (
                  <div className={`space-y-0.5 ${!collapsed ? "mt-1 ml-1 border-l-2 border-dashed border-foreground/20 pl-2" : ""}`}>
                    {level.lessons.map((lesson) => {
                      const unlocked = isLessonUnlocked(lesson.path, progress);
                      const isActive = pathname === lesson.path;
                      if (!unlocked) {
                        return (
                          <div
                            key={lesson.path}
                            title={collapsed ? `${lesson.label} (locked)` : "Complete the previous lesson to unlock"}
                            className={`flex items-center rounded-lg text-sm font-hand opacity-50 cursor-not-allowed ${
                              collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2"
                            } text-foreground/60`}
                          >
                            <Lock className="w-3.5 h-3.5 shrink-0" />
                            {!collapsed && (
                              <span className="flex-1 text-left leading-tight wrap-break-word">{lesson.label}</span>
                            )}
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={lesson.path}
                          href={lesson.path}
                          onClick={onClose}
                          title={collapsed ? lesson.label : undefined}
                          className={`flex items-center rounded-lg text-sm font-hand transition-all ${
                            collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2"
                          } ${
                            isActive
                              ? "bg-accent-coral text-background border-2 border-foreground font-bold shadow-[2px_2px_0_#2b2a35]"
                              : "text-foreground/80 hover:bg-accent-mint/30 hover:text-foreground"
                          }`}
                        >
                          <span className="shrink-0 flex items-center justify-center">{lesson.icon}</span>
                          {!collapsed && (
                            <span className="flex-1 leading-tight wrap-break-word">{lesson.label}</span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
