"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, Brain, GraduationCap } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const BREADCRUMB_MAP: Record<string, { level: string; lesson: string }> = {
  "/level1/machines": { level: "Level 1", lesson: "Machines & Instructions" },
  "/level1/computers": { level: "Level 1", lesson: "How Computers Work" },
  "/level1/data": { level: "Level 1", lesson: "What Is Data?" },
  "/level1/senses": { level: "Level 1", lesson: "Sensors: How Machines Sense" },
  "/level1/bits": { level: "Level 1", lesson: "Bits, Bytes & Files" },
  "/level2/coordinates": { level: "Level 2", lesson: "Coordinates & Graphs" },
  "/level2/patterns": { level: "Level 2", lesson: "Spotting Patterns" },
  "/level2/sorting": { level: "Level 2", lesson: "Sorting & Grouping" },
  "/level2/outliers": { level: "Level 2", lesson: "Outliers" },
  "/level2/averages": { level: "Level 2", lesson: "Mean & Median" },
  "/level3/predictions": { level: "Level 3", lesson: "What Is a Prediction?" },
  "/level3/best-line": { level: "Level 3", lesson: "Drawing the Best Line" },
  "/level3/algorithms": { level: "Level 3", lesson: "What Is an Algorithm?" },
  "/level3/how-computers-learn": { level: "Level 3", lesson: "How Computers Learn" },
  "/level3/features-labels": { level: "Level 3", lesson: "Features & Labels" },
  "/level3/train-test": { level: "Level 3", lesson: "Train & Test Split" },
  "/level4/supervised-learning": { level: "Level 4", lesson: "Supervised Learning" },
  "/level4/knn": { level: "Level 4", lesson: "K-Nearest Neighbors" },
  "/level4/decision-trees": { level: "Level 4", lesson: "Decision Trees" },
  "/level4/measuring-success": { level: "Level 4", lesson: "Measuring Success" },
  "/level4/train-test-split": { level: "Level 4", lesson: "Train vs Test" },
  "/level4/confusion-matrix": { level: "Level 4", lesson: "Confusion Matrix" },
  "/level5/unsupervised-learning": { level: "Level 5", lesson: "What Is Unsupervised?" },
  "/level5/kmeans": { level: "Level 5", lesson: "K-Means Clustering" },
  "/level5/choosing-k": { level: "Level 5", lesson: "Choosing K" },
  "/level5/anomaly": { level: "Level 5", lesson: "Anomaly Detection" },
  "/level5/dimensionality": { level: "Level 5", lesson: "Dimensionality Reduction" },
  "/level6/perceptron": { level: "Level 6", lesson: "The Perceptron" },
  "/level6/activation-functions": { level: "Level 6", lesson: "Activation Functions" },
  "/level6/neural-network": { level: "Level 6", lesson: "Building a Neural Network" },
  "/level6/backpropagation": { level: "Level 6", lesson: "Backpropagation" },
  "/level6/weights-biases": { level: "Level 6", lesson: "Weights & Biases" },
  "/level6/forward-pass": { level: "Level 6", lesson: "Forward Pass" },
  "/level7/gradient-descent": { level: "Level 7", lesson: "Gradient Descent" },
  "/level7/learning-rate": { level: "Level 7", lesson: "Learning Rate & Momentum" },
  "/level7/overfitting": { level: "Level 7", lesson: "Overfitting & Regularization" },
  "/level7/sgd-vs-batch": { level: "Level 7", lesson: "SGD vs Batch" },
  "/level8/images-as-data": { level: "Level 8", lesson: "Images as Data" },
  "/level8/filters": { level: "Level 8", lesson: "Filters & Convolution" },
  "/level8/stride-padding": { level: "Level 8", lesson: "Stride, Padding & Pooling" },
  "/level8/mini-cnn": { level: "Level 8", lesson: "Building a Mini CNN" },
  "/level8/history": { level: "Level 8", lesson: "The Story of ML" },
  "/level9/hand-tracking": { level: "Level 9", lesson: "Hand Tracking" },
  "/level9/gesture-recognition": { level: "Level 9", lesson: "Gesture Recognition" },
  "/level9/object-detection": { level: "Level 9", lesson: "Object Detection" },
};

export default function LessonsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const crumb = pathname ? BREADCRUMB_MAP[pathname] : undefined;

  return (
    <div className="flex h-screen bg-[#fdfbf6]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-[#fdfbf6]/90 backdrop-blur border-b-2 border-[#2b2a35] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(true);
              } else {
                setSidebarCollapsed((c) => !c);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-[#ffd93d]/40 transition-colors border-2 border-transparent hover:border-[#2b2a35]"
          >
            <Menu className="w-5 h-5 text-[#2b2a35]" />
          </button>

          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 hidden lg:block" style={{ color: "var(--accent-coral)" }} />
            <span className="font-hand text-xl font-bold text-[#2b2a35] hidden lg:block">ML Learning Path</span>
          </div>

          {crumb && (
            <div className="flex items-center gap-1.5 ml-auto font-hand">
              <span className="text-[#6b6776] text-sm">{crumb.level}</span>
              <span className="text-[#6b6776]/50">/</span>
              <span className="text-[#2b2a35] font-bold text-sm">{crumb.lesson}</span>
            </div>
          )}

          <div className={`flex items-center gap-2 ${crumb ? "" : "ml-auto"}`}>
            <div
              className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border-2 border-[#2b2a35] font-hand"
              style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              36 Lessons
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
