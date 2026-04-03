import { useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Menu, Brain, GraduationCap } from "lucide-react";
import Sidebar from "./components/Sidebar";

// Level 1
import L1_MachinesActivity from "./lessons/level1/L1_MachinesActivity";
import L2_ComputersActivity from "./lessons/level1/L2_ComputersActivity";
import L3_DataActivity from "./lessons/level1/L3_DataActivity";

// Level 2
import L4_CoordinatesActivity from "./lessons/level2/L4_CoordinatesActivity";
import L5_PatternsActivity from "./lessons/level2/L5_PatternsActivity";
import L6_SortingActivity from "./lessons/level2/L6_SortingActivity";

// Level 3
import L7_PredictionsActivity from "./lessons/level3/L7_PredictionsActivity";
import L8_BestLineActivity from "./lessons/level3/L8_BestLineActivity";
import L9_AlgorithmsActivity from "./lessons/level3/L9_AlgorithmsActivity";
import L10_HowComputersLearnActivity from "./lessons/level3/L10_HowComputersLearnActivity";

// Level 4
import L11_SupervisedLearningActivity from "./lessons/level4/L11_SupervisedLearningActivity";
import L12_KNNActivity from "./lessons/level4/L12_KNNActivity";
import L13_DecisionTreesActivity from "./lessons/level4/L13_DecisionTreesActivity";
import L14_MeasuringSuccessActivity from "./lessons/level4/L14_MeasuringSuccessActivity";

// Level 5
import L15_UnsupervisedLearningActivity from "./lessons/level5/L15_UnsupervisedLearningActivity";
import L16_KMeansActivity from "./lessons/level5/L16_KMeansActivity";
import L17_ChoosingKActivity from "./lessons/level5/L17_ChoosingKActivity";

// Level 6
import L18_PerceptronActivity from "./lessons/level6/L18_PerceptronActivity";
import L19_ActivationFunctionsActivity from "./lessons/level6/L19_ActivationFunctionsActivity";
import L20_NeuralNetworkActivity from "./lessons/level6/L20_NeuralNetworkActivity";
import L21_BackpropagationActivity from "./lessons/level6/L21_BackpropagationActivity";

// Level 7
import L22_GradientDescentActivity from "./lessons/level7/L22_GradientDescentActivity";
import L23_LearningRateActivity from "./lessons/level7/L23_LearningRateActivity";
import L24_OverfittingActivity from "./lessons/level7/L24_OverfittingActivity";
import L25_SGDvsBatchActivity from "./lessons/level7/L25_SGDvsBatchActivity";

// Level 8
import L26_ImagesAsDataActivity from "./lessons/level8/L26_ImagesAsDataActivity";
import L27_FiltersActivity from "./lessons/level8/L27_FiltersActivity";
import L28_StridePaddingActivity from "./lessons/level8/L28_StridePaddingActivity";
import L29_MiniCNNActivity from "./lessons/level8/L29_MiniCNNActivity";

const BREADCRUMB_MAP: Record<string, { level: string; lesson: string }> = {
  "/level1/machines": { level: "Level 1", lesson: "Machines & Instructions" },
  "/level1/computers": { level: "Level 1", lesson: "How Computers Work" },
  "/level1/data": { level: "Level 1", lesson: "What Is Data?" },
  "/level2/coordinates": { level: "Level 2", lesson: "Coordinates & Graphs" },
  "/level2/patterns": { level: "Level 2", lesson: "Spotting Patterns" },
  "/level2/sorting": { level: "Level 2", lesson: "Sorting & Grouping" },
  "/level3/predictions": { level: "Level 3", lesson: "What Is a Prediction?" },
  "/level3/best-line": { level: "Level 3", lesson: "Drawing the Best Line" },
  "/level3/algorithms": { level: "Level 3", lesson: "What Is an Algorithm?" },
  "/level3/how-computers-learn": { level: "Level 3", lesson: "How Computers Learn" },
  "/level4/supervised-learning": { level: "Level 4", lesson: "Supervised Learning" },
  "/level4/knn": { level: "Level 4", lesson: "K-Nearest Neighbors" },
  "/level4/decision-trees": { level: "Level 4", lesson: "Decision Trees" },
  "/level4/measuring-success": { level: "Level 4", lesson: "Measuring Success" },
  "/level5/unsupervised-learning": { level: "Level 5", lesson: "What Is Unsupervised?" },
  "/level5/kmeans": { level: "Level 5", lesson: "K-Means Clustering" },
  "/level5/choosing-k": { level: "Level 5", lesson: "Choosing K" },
  "/level6/perceptron": { level: "Level 6", lesson: "The Perceptron" },
  "/level6/activation-functions": { level: "Level 6", lesson: "Activation Functions" },
  "/level6/neural-network": { level: "Level 6", lesson: "Building a Neural Network" },
  "/level6/backpropagation": { level: "Level 6", lesson: "Backpropagation" },
  "/level7/gradient-descent": { level: "Level 7", lesson: "Gradient Descent" },
  "/level7/learning-rate": { level: "Level 7", lesson: "Learning Rate & Momentum" },
  "/level7/overfitting": { level: "Level 7", lesson: "Overfitting & Regularization" },
  "/level7/sgd-vs-batch": { level: "Level 7", lesson: "SGD vs Batch" },
  "/level8/images-as-data": { level: "Level 8", lesson: "Images as Data" },
  "/level8/filters": { level: "Level 8", lesson: "Filters & Convolution" },
  "/level8/stride-padding": { level: "Level 8", lesson: "Stride, Padding & Pooling" },
  "/level8/mini-cnn": { level: "Level 8", lesson: "Building a Mini CNN" },
};

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const crumb = BREADCRUMB_MAP[location.pathname];

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
          <button
            onClick={() => {
              // On mobile, open the sidebar overlay. On desktop, toggle collapse.
              if (window.innerWidth < 1024) {
                setSidebarOpen(true);
              } else {
                setSidebarCollapsed((c) => !c);
              }
            }}
            className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>

          {/* Brand (visible when sidebar is collapsed on desktop) */}
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-indigo-500 hidden lg:block" />
            <span className="text-sm font-bold text-slate-800 hidden lg:block">ML Learning Path</span>
          </div>

          {/* Breadcrumb */}
          {crumb && (
            <div className="flex items-center gap-1.5 ml-auto text-xs">
              <span className="text-slate-400 font-medium">{crumb.level}</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-700 font-semibold">{crumb.lesson}</span>
            </div>
          )}

          {/* Right side */}
          <div className={`flex items-center gap-2 ${crumb ? "" : "ml-auto"}`}>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-semibold uppercase tracking-wide">
              <GraduationCap className="w-3.5 h-3.5" />
              29 Lessons
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<Navigate to="/level1/machines" replace />} />
              <Route path="/level1/machines" element={<L1_MachinesActivity />} />
              <Route path="/level1/computers" element={<L2_ComputersActivity />} />
              <Route path="/level1/data" element={<L3_DataActivity />} />
              <Route path="/level2/coordinates" element={<L4_CoordinatesActivity />} />
              <Route path="/level2/patterns" element={<L5_PatternsActivity />} />
              <Route path="/level2/sorting" element={<L6_SortingActivity />} />
              <Route path="/level3/predictions" element={<L7_PredictionsActivity />} />
              <Route path="/level3/best-line" element={<L8_BestLineActivity />} />
              <Route path="/level3/algorithms" element={<L9_AlgorithmsActivity />} />
              <Route path="/level3/how-computers-learn" element={<L10_HowComputersLearnActivity />} />
              <Route path="/level4/supervised-learning" element={<L11_SupervisedLearningActivity />} />
              <Route path="/level4/knn" element={<L12_KNNActivity />} />
              <Route path="/level4/decision-trees" element={<L13_DecisionTreesActivity />} />
              <Route path="/level4/measuring-success" element={<L14_MeasuringSuccessActivity />} />
              <Route path="/level5/unsupervised-learning" element={<L15_UnsupervisedLearningActivity />} />
              <Route path="/level5/kmeans" element={<L16_KMeansActivity />} />
              <Route path="/level5/choosing-k" element={<L17_ChoosingKActivity />} />
              <Route path="/level6/perceptron" element={<L18_PerceptronActivity />} />
              <Route path="/level6/activation-functions" element={<L19_ActivationFunctionsActivity />} />
              <Route path="/level6/neural-network" element={<L20_NeuralNetworkActivity />} />
              <Route path="/level6/backpropagation" element={<L21_BackpropagationActivity />} />
              <Route path="/level7/gradient-descent" element={<L22_GradientDescentActivity />} />
              <Route path="/level7/learning-rate" element={<L23_LearningRateActivity />} />
              <Route path="/level7/overfitting" element={<L24_OverfittingActivity />} />
              <Route path="/level7/sgd-vs-batch" element={<L25_SGDvsBatchActivity />} />
              <Route path="/level8/images-as-data" element={<L26_ImagesAsDataActivity />} />
              <Route path="/level8/filters" element={<L27_FiltersActivity />} />
              <Route path="/level8/stride-padding" element={<L28_StridePaddingActivity />} />
              <Route path="/level8/mini-cnn" element={<L29_MiniCNNActivity />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
