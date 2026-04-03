import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
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
    ],
  },
  {
    level: 2,
    title: "Seeing Patterns in Data",
    lessons: [
      { path: "/level2/coordinates", label: "Coordinates & Graphs", icon: <Axis3D className="w-4 h-4" /> },
      { path: "/level2/patterns", label: "Spotting Patterns", icon: <Search className="w-4 h-4" /> },
      { path: "/level2/sorting", label: "Sorting & Grouping", icon: <ArrowUpDown className="w-4 h-4" /> },
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
    ],
  },
  {
    level: 5,
    title: "Unsupervised Learning",
    lessons: [
      { path: "/level5/unsupervised-learning", label: "What Is Unsupervised?", icon: <Layers className="w-4 h-4" /> },
      { path: "/level5/kmeans", label: "K-Means Clustering", icon: <CircleDot className="w-4 h-4" /> },
      { path: "/level5/choosing-k", label: "Choosing K", icon: <LineChart className="w-4 h-4" /> },
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
    ],
  },
];

// Flat list of all lesson paths in order — used for prev/next navigation
export const ALL_LESSONS = LEVELS.flatMap((l) => l.lessons.map((ls) => ls.path));

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: SidebarProps) {
  const location = useLocation();

  // Determine which level the current route is in, and auto-expand it
  const currentLevelIdx = LEVELS.findIndex((l) =>
    l.lessons.some((ls) => ls.path === location.pathname)
  );

  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    LEVELS.forEach((_, i) => { init[i] = i === currentLevelIdx; });
    return init;
  });

  function toggleLevel(idx: number) {
    setExpandedLevels((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white border-r border-slate-200 overflow-y-auto transition-all duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-16" : "w-72"}`}
      >
        {/* Logo + collapse toggle */}
        <div className={`p-4 border-b border-slate-200 flex items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-500 shrink-0" />
                ML Learning Path
              </h2>
              <p className="text-[10px] text-slate-500 mt-1">From Machines to Machine Learning</p>
            </div>
          )}
          {collapsed && <Brain className="w-5 h-5 text-indigo-500" />}
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors shrink-0"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronsRight className="w-4 h-4" /> : <ChevronsLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className={`p-3 space-y-1 ${collapsed ? "px-2" : ""}`}>
          {LEVELS.map((level, idx) => {
            const isExpanded = expandedLevels[idx] ?? false;
            const hasActivePage = level.lessons.some((ls) => ls.path === location.pathname);

            return (
              <div key={level.level}>
                {/* Level header — collapsible toggle */}
                {!collapsed ? (
                  <button
                    onClick={() => toggleLevel(idx)}
                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-xs font-semibold transition-colors ${
                      hasActivePage
                        ? "text-indigo-700 bg-indigo-50/50"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
                  >
                    <span className="uppercase tracking-wider text-[10px]">
                      Level {level.level}: {level.title}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 shrink-0" />
                    )}
                  </button>
                ) : (
                  <div className="text-[9px] font-bold text-slate-400 text-center mb-1 mt-2">L{level.level}</div>
                )}

                {/* Lessons — shown when expanded (or always in collapsed mode) */}
                {(isExpanded || collapsed) && (
                  <div className={`space-y-0.5 ${!collapsed ? "mt-1 ml-1 border-l-2 border-slate-100 pl-2" : ""}`}>
                    {level.lessons.map((lesson) => (
                      <NavLink
                        key={lesson.path}
                        to={lesson.path}
                        onClick={onClose}
                        title={collapsed ? lesson.label : undefined}
                        className={({ isActive }) =>
                          `flex items-center rounded-lg text-xs font-medium transition-colors ${
                            collapsed ? "justify-center px-0 py-2.5" : "gap-2 px-2.5 py-2"
                          } ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                          }`
                        }
                      >
                        {lesson.icon}
                        {!collapsed && lesson.label}
                      </NavLink>
                    ))}
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
