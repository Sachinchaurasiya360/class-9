"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Cpu,
  Axis3D,
  Sparkles,
  Target,
  Layers,
  Zap,
  TrendingDown,
  ImageIcon,
  ChevronRight,
  Play,
  BookOpen,
  Users,
  Star,
} from "lucide-react";
import { playClick } from "../utils/sounds";

const LEVEL_CARDS = [
  {
    level: 1,
    title: "What Are Machines & Data?",
    desc: "Start from the very basics \u2014 what machines do, how computers think in 0s and 1s, and what data really means.",
    icon: <Cpu className="w-6 h-6" />,
    accent: "var(--accent-sky)",
    lessons: 3,
    path: "/level1/machines",
  },
  {
    level: 2,
    title: "Seeing Patterns in Data",
    desc: "Learn to plot data on graphs, spot trends and clusters, and sort information like a computer.",
    icon: <Axis3D className="w-6 h-6" />,
    accent: "var(--accent-mint)",
    lessons: 3,
    path: "/level2/coordinates",
  },
  {
    level: 3,
    title: "From Patterns to Predictions",
    desc: "Make predictions from data, draw the best-fit line, and understand what algorithms are.",
    icon: <Sparkles className="w-6 h-6" />,
    accent: "var(--accent-lav)",
    lessons: 4,
    path: "/level3/predictions",
  },
  {
    level: 4,
    title: "Introduction to ML",
    desc: "Dive into supervised learning, K-Nearest Neighbors, decision trees, and how to measure model success.",
    icon: <Target className="w-6 h-6" />,
    accent: "var(--accent-yellow)",
    lessons: 4,
    path: "/level4/supervised-learning",
  },
  {
    level: 5,
    title: "Unsupervised Learning",
    desc: "Discover how machines find hidden groups in data without labels using K-Means clustering.",
    icon: <Layers className="w-6 h-6" />,
    accent: "var(--accent-coral)",
    lessons: 3,
    path: "/level5/unsupervised-learning",
  },
  {
    level: 6,
    title: "Neural Networks",
    desc: "Build neurons, stack them into layers, and learn how backpropagation teaches a network.",
    icon: <Zap className="w-6 h-6" />,
    accent: "var(--accent-sky)",
    lessons: 4,
    path: "/level6/perceptron",
  },
  {
    level: 7,
    title: "Training & Optimization",
    desc: "Master gradient descent, learning rates, overfitting, and the difference between SGD and batch training.",
    icon: <TrendingDown className="w-6 h-6" />,
    accent: "var(--accent-coral)",
    lessons: 4,
    path: "/level7/gradient-descent",
  },
  {
    level: 8,
    title: "Computer Vision & CNNs",
    desc: "See how computers see \u2014 pixels, filters, convolution, pooling, and build a mini CNN from scratch.",
    icon: <ImageIcon className="w-6 h-6" />,
    accent: "var(--accent-lav)",
    lessons: 4,
    path: "/level8/images-as-data",
  },
];

const FEATURES = [
  {
    icon: <Play className="w-5 h-5" />,
    title: "Fully Interactive",
    desc: "Every lesson has hands-on SVG activities \u2014 click, drag, and explore concepts visually.",
    accent: "var(--accent-coral)",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Story-Driven",
    desc: "Follow Aru & her robot friend Byte as they discover ML concepts through real-world adventures.",
    accent: "var(--accent-yellow)",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Beginner Friendly",
    desc: "Starts from \"What is a machine?\" \u2014 no coding or math prerequisites needed.",
    accent: "var(--accent-mint)",
  },
  {
    icon: <Star className="w-5 h-5" />,
    title: "Quiz Challenges",
    desc: "Test your understanding with quizzes at the end of every lesson.",
    accent: "var(--accent-lav)",
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#fdfbf6] text-[#2b2a35]">
      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden notebook-grid">
        {/* Floating doodle accents */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[6%] top-[14%] text-5xl animate-float" style={{ color: "var(--accent-yellow)" }}>&#9733;</div>
          <div className="absolute right-[8%] top-[18%] text-4xl animate-float float-delay-1" style={{ color: "var(--accent-coral)" }}>&#10022;</div>
          <div className="absolute left-[12%] bottom-[18%] text-4xl animate-float float-delay-2" style={{ color: "var(--accent-mint)" }}>&#10047;</div>
          <div className="absolute right-[14%] bottom-[22%] text-3xl animate-wiggle" style={{ color: "var(--accent-lav)" }}>&#9998;</div>
          <div className="absolute left-[45%] top-[8%] text-2xl animate-wiggle" style={{ color: "var(--accent-sky)" }}>&#10042;</div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center relative">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6 border-2 border-[#2b2a35]"
            style={{ background: "var(--accent-yellow)", boxShadow: "2px 2px 0 #2b2a35" }}
          >
            <Brain className="w-3.5 h-3.5" />
            29 Interactive Lessons &middot; 8 Levels
          </div>

          {/* Title */}
          <div className="mb-4 text-6xl">&#x1F43C;</div>
          <h1 className="font-hand text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
            Learn Machine Learning
            <br />
            <span className="marker-highlight-yellow">From Scratch</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#6b6776] max-w-2xl mx-auto leading-relaxed">
            A hands-on interactive journey from &ldquo;What is a machine?&rdquo; all the way to
            building neural networks and CNNs. No prior knowledge needed &mdash; just curiosity.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                playClick();
                router.push("/level1/machines");
              }}
              className="btn-sketchy text-lg"
            >
              <Play className="w-4 h-4" />
              Start Learning
            </button>
            <a
              href="#levels"
              onClick={() => playClick()}
              className="btn-sketchy-outline text-lg"
            >
              <BookOpen className="w-4 h-4" />
              Browse Curriculum
            </a>
          </div>

          {/* Hero visual  mini neural network SVG */}
          <div className="mt-14 flex justify-center">
            <svg viewBox="0 0 400 160" className="w-full max-w-md">
              {[40, 80, 120].map((y, i) => (
                <g key={`in-${i}`}>
                  <circle cx={60} cy={y} r={15} fill="#fff3a0" stroke="#2b2a35" strokeWidth={2.5} />
                  <text x={60} y={y + 4} textAnchor="middle" className="text-[11px] font-bold" fill="#2b2a35" fontFamily="Kalam">
                    {["x1", "x2", "x3"][i]}
                  </text>
                </g>
              ))}
              {[50, 90, 130].map((y, i) => (
                <g key={`h-${i}`}>
                  <circle cx={200} cy={y} r={15} fill="#d6c2ff" stroke="#2b2a35" strokeWidth={2.5} />
                  <text x={200} y={y + 4} textAnchor="middle" className="text-[11px] font-bold" fill="#2b2a35" fontFamily="Kalam">
                    {["h1", "h2", "h3"][i]}
                  </text>
                </g>
              ))}
              <circle cx={340} cy={80} r={17} fill="#a8e8e3" stroke="#2b2a35" strokeWidth={2.5} />
              <text x={340} y={84} textAnchor="middle" className="text-[12px] font-bold" fill="#2b2a35" fontFamily="Kalam">
                y
              </text>
              {[40, 80, 120].map((y1) =>
                [50, 90, 130].map((y2) => (
                  <line key={`c1-${y1}-${y2}`} x1={75} y1={y1} x2={185} y2={y2} stroke="#2b2a35" strokeWidth={1.2} strokeDasharray="3 2" />
                ))
              )}
              {[50, 90, 130].map((y) => (
                <line key={`c2-${y}`} x1={215} y1={y} x2={323} y2={80} stroke="#2b2a35" strokeWidth={1.2} strokeDasharray="3 2" />
              ))}
              <text x={60} y={155} textAnchor="middle" className="text-[10px]" fill="#6b6776" fontFamily="Kalam">Input</text>
              <text x={200} y={155} textAnchor="middle" className="text-[10px]" fill="#6b6776" fontFamily="Kalam">Hidden</text>
              <text x={340} y={155} textAnchor="middle" className="text-[10px]" fill="#6b6776" fontFamily="Kalam">Output</text>
            </svg>
          </div>
        </div>
      </header>

      {/* ---------- Features row ---------- */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-sketchy p-5 hover:-translate-y-1 transition-transform">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 border-2 border-[#2b2a35]"
                style={{ background: f.accent }}
              >
                {f.icon}
              </div>
              <h3 className="font-hand text-xl font-bold text-[#2b2a35]">{f.title}</h3>
              <p className="text-sm text-[#6b6776] mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Levels grid ---------- */}
      <section id="levels" className="max-w-5xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <h2 className="font-hand text-4xl sm:text-5xl font-bold text-[#2b2a35]">
            Your Learning <span className="marker-highlight-mint">Path</span>
          </h2>
          <p className="text-[#6b6776] mt-3 text-lg">
            8 levels &middot; 29 lessons &middot; From absolute beginner to building CNNs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {LEVEL_CARDS.map((card) => (
            <button
              key={card.level}
              onClick={() => {
                playClick();
                router.push(card.path);
              }}
              className="group card-sketchy text-left p-6 hover:-translate-y-1 transition-transform"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-[#2b2a35]"
                    style={{ background: card.accent, boxShadow: "2px 2px 0 #2b2a35" }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#6b6776] uppercase tracking-wider font-hand">
                      Level {card.level}
                    </p>
                    <h3 className="font-hand text-xl font-bold text-[#2b2a35]">{card.title}</h3>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#2b2a35]/40 group-hover:text-[#2b2a35] transition-colors mt-1" />
              </div>
              <p className="text-sm text-[#6b6776] mt-3 leading-relaxed">{card.desc}</p>
              <div className="mt-3 text-[10px] font-bold text-[#6b6776] uppercase tracking-wider font-hand">
                {card.lessons} lessons
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ---------- Meet the characters ---------- */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="card-sketchy p-7 sm:p-9" style={{ background: "#fff8e7" }}>
          <h2 className="font-hand text-3xl font-bold text-[#2b2a35] text-center mb-6">
            Meet Your <span className="marker-highlight-coral">Guides</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3 items-start">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 border-[#2b2a35]"
                style={{ background: "var(--accent-coral)" }}
              >
                <span className="text-2xl">&#x1F63B;</span>
              </div>
              <div>
                <h3 className="font-hand text-xl font-bold text-[#2b2a35]">Aru</h3>
                <p className="text-sm text-[#6b6776] leading-relaxed mt-0.5">
                  A curious 12-year-old who loves asking &ldquo;why?&rdquo; &mdash; she discovers ML concepts through
                  everyday adventures like packing for trips, finding lost dogs, and predicting rain.
                </p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 border-2 border-[#2b2a35]"
                style={{ background: "var(--accent-sky)" }}
              >
                <span className="text-2xl">&#x1F916;</span>
              </div>
              <div>
                <h3 className="font-hand text-xl font-bold text-[#2b2a35]">Byte</h3>
                <p className="text-sm text-[#6b6776] leading-relaxed mt-0.5">
                  Aru&apos;s friendly robot companion who explains how computers think, learn, and see the world &mdash;
                  one step at a time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Footer CTA ---------- */}
      <section className="py-16 notebook-grid border-y-2 border-[#2b2a35]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-hand text-4xl font-bold text-[#2b2a35]">Ready to begin?</h2>
          <p className="text-[#6b6776] text-lg mt-3">
            Start from the very first lesson and work your way up. It&apos;s free and fun!
          </p>
          <button
            onClick={() => {
              playClick();
              router.push("/level1/machines");
            }}
            className="btn-sketchy mt-8 text-lg"
          >
            <Play className="w-4 h-4" />
            Start Level 1
          </button>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="py-8 bg-[#2b2a35]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#fdfbf6]">
            <Brain className="w-5 h-5" style={{ color: "var(--accent-yellow)" }} />
            <span className="font-hand text-xl font-bold">ML Learning Path</span>
          </div>
          <p className="text-[#fdfbf6]/60 text-xs font-hand">
            From Machines to Machine Learning &middot; 29 Interactive Lessons
          </p>
        </div>
      </footer>
    </div>
  );
}
