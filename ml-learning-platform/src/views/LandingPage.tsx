"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  Network,
  HardDrive,
  Database,
  Boxes,
  GraduationCap,
  Briefcase,
  Target,
  BookOpen,
  Check,
  ArrowRight,
  Menu,
  X,
  ChevronRight,
  BookOpenCheck,
  Users,
  Award,
  Sparkles,
  Code2,
  Shield,
  Cloud,
  Lock,
  Rocket,
  Mail,
  Heart,
  Zap,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

/* ================================================================== */
/*  THEME - Light, clean, Skilly-inspired                              */
/* ================================================================== */

const T = {
  bg: "#FFFFFF",
  bgSoft: "#F8FAF9",
  bgSection: "#F3F7F5",
  primary: "#1DC071",
  primaryDark: "#17A660",
  primaryLight: "#E8F8F0",
  primaryGlow: "rgba(29, 192, 113, 0.15)",
  accent: "#FFB800",
  accentLight: "#FFF4D6",
  text: "#1A1D26",
  textSecondary: "#5A6270",
  textMuted: "#8E95A2",
  border: "#E8ECF0",
  borderLight: "#F0F3F5",
  card: "#FFFFFF",
  heading: "'Bricolage Grotesque', 'Outfit', sans-serif",
  body: "'Outfit', system-ui, sans-serif",
};

/* ================================================================== */
/*  LEARNING TRACKS                                                    */
/* ================================================================== */

const TRACKS = [
  {
    badge: "School",
    level: "Class 8-12",
    title: "AI & Machine Learning",
    desc: 'From "What is a machine?" to building neural networks. Fun, visual, story-driven lessons that make complex concepts click.',
    coverage: "Covers CBSE, ICSE & State Boards",
    lessons: "9 Levels · 45 Lessons",
    color: T.primary,
    colorLight: T.primaryLight,
    href: "/level1/machines",
    icon: BookOpen,
    comingSoon: false,
  },
  {
    badge: "Engineering",
    level: "B.Tech CSE",
    title: "Core Computer Science",
    desc: "DSA, Networks, OS, DBMS, and OOP. Interactive visualizations and step-by-step algorithm tracing for deep understanding.",
    coverage: "Covers Placements & Semester Exams",
    lessons: "5 Subjects · 150+ Lessons",
    color: "#E76F51",
    colorLight: "rgba(231,111,81,0.1)",
    href: "/engineering",
    icon: GraduationCap,
    comingSoon: false,
  },
  {
    badge: "Architecture",
    level: "Intermediate → Advanced",
    title: "System Design",
    desc: "Scalability, load balancing, caching, databases, and distributed systems. Design real-world architectures like Twitter, Netflix, and URL shorteners.",
    coverage: "HLD + LLD for Interviews",
    lessons: "6 Modules · 80+ Lessons",
    color: "#06B6D4",
    colorLight: "rgba(6,182,212,0.1)",
    href: "/system-design",
    icon: Cloud,
    comingSoon: true,
  },
  {
    badge: "Problem Solving",
    level: "All Levels",
    title: "Competitive Programming",
    desc: "Master problem-solving patterns, time complexity, and contest strategies. Practice with curated problems from Codeforces & LeetCode.",
    coverage: "ICPC, CodeChef, LeetCode Prep",
    lessons: "8 Tracks · 200+ Problems",
    color: "#F59E0B",
    colorLight: "rgba(245,158,11,0.1)",
    href: "/competitive",
    icon: Code2,
    comingSoon: true,
  },
  {
    badge: "Security",
    level: "Intermediate",
    title: "Cybersecurity",
    desc: "Network security, ethical hacking, cryptography, and secure coding. Hands-on labs with real-world attack and defense scenarios.",
    coverage: "CEH, CompTIA Security+ Aligned",
    lessons: "6 Modules · 80+ Lessons",
    color: "#EF4444",
    colorLight: "rgba(239,68,68,0.1)",
    href: "/cybersecurity",
    icon: Shield,
    comingSoon: true,
  },
];

/* ================================================================== */
/*  PANDA LOGO                                                         */
/* ================================================================== */

function PandaLogo({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="7" r="4.5" fill="#F4A261" />
      <circle cx="24" cy="7" r="4.5" fill="#F4A261" />
      <circle cx="8" cy="7" r="2.2" fill="#2D1B0E" />
      <circle cx="24" cy="7" r="2.2" fill="#2D1B0E" />
      <ellipse cx="16" cy="18" rx="11.5" ry="11" fill="#E76F51" />
      <ellipse cx="16" cy="21" rx="5.5" ry="4.5" fill="#FDEBD0" />
      <ellipse cx="11" cy="15.5" rx="2.8" ry="2.5" fill="#6B2D0F" />
      <ellipse cx="21" cy="15.5" rx="2.8" ry="2.5" fill="#6B2D0F" />
      <circle cx="11" cy="15.2" r="1.2" fill="white" />
      <circle cx="21" cy="15.2" r="1.2" fill="white" />
      <circle cx="11.3" cy="15" r="0.6" fill="#1a1a2e" />
      <circle cx="21.3" cy="15" r="0.6" fill="#1a1a2e" />
      <ellipse cx="16" cy="19.2" rx="1.4" ry="1" fill="#2D1B0E" />
    </svg>
  );
}

/* ================================================================== */
/*  BRAND SVG ICONS (lucide dropped these)                             */
/* ================================================================== */

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.48.75 11.75c0 4.97 3.22 9.18 7.69 10.68.56.1.77-.25.77-.54 0-.27-.01-1.16-.02-2.1-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.29-.5-1.44.11-3 0 0 .95-.3 3.11 1.16.9-.25 1.87-.38 2.83-.38.96 0 1.93.13 2.83.38 2.16-1.46 3.11-1.16 3.11-1.16.61 1.56.23 2.71.11 3 .72.79 1.16 1.79 1.16 3.02 0 4.33-2.64 5.28-5.15 5.56.4.34.76 1.02.76 2.06 0 1.49-.01 2.69-.01 3.05 0 .29.2.64.78.54 4.47-1.5 7.69-5.71 7.69-10.68C23.25 5.48 18.27.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.26 2.37 4.26 5.45zM5.34 7.44a2.06 2.06 0 110-4.12 2.06 2.06 0 010 4.12zM7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/* ================================================================== */
/*  DATA                                                               */
/* ================================================================== */

const ENGINEERING_SUBJECTS = [
  {
    icon: BarChart3,
    title: "Data Structures & Algorithms",
    desc: "Arrays, trees, graphs, sorting, searching, and dynamic programming. Step-by-step visual tracing.",
    levels: "7 Levels",
    lessons: "35+ Lessons",
    accent: "#E76F51",
    accentBg: "rgba(231, 111, 81, 0.08)",
  },
  {
    icon: Network,
    title: "Computer Networks",
    desc: "OSI layers, TCP/IP, routing algorithms, DNS, and HTTP. Animated packet flow simulations.",
    levels: "6 Levels",
    lessons: "30+ Lessons",
    accent: "#3B82F6",
    accentBg: "rgba(59, 130, 246, 0.08)",
  },
  {
    icon: HardDrive,
    title: "Operating Systems",
    desc: "Process scheduling, memory management, deadlocks, and file systems. Interactive Gantt charts and diagrams.",
    levels: "6 Levels",
    lessons: "28+ Lessons",
    accent: "#1DC071",
    accentBg: "rgba(29, 192, 113, 0.08)",
  },
  {
    icon: Database,
    title: "Database Management",
    desc: "SQL, normalization, transactions, indexing, and ER diagrams. Live query execution visualizations.",
    levels: "6 Levels",
    lessons: "28+ Lessons",
    accent: "#FFB800",
    accentBg: "rgba(255, 184, 0, 0.08)",
  },
  {
    icon: Boxes,
    title: "Object-Oriented Programming",
    desc: "Classes, inheritance, polymorphism, and design patterns. UML diagrams and interactive code walkthroughs.",
    levels: "5 Levels",
    lessons: "22+ Lessons",
    accent: "#8B5CF6",
    accentBg: "rgba(139, 92, 246, 0.08)",
  },
];

const AUDIENCE = [
  {
    icon: GraduationCap,
    title: "School Students (Class 8-12)",
    desc: "AI/ML fundamentals with fun, story-driven lessons",
    accent: "#1DC071",
  },
  {
    icon: BookOpen,
    title: "B.Tech CSE Students",
    desc: "Core CS subjects with interactive visualizations",
    accent: "#3B82F6",
  },
  {
    icon: Briefcase,
    title: "Placement Seekers",
    desc: "Company-specific prep, interview patterns",
    accent: "#E76F51",
  },
  {
    icon: Target,
    title: "Interview Prep",
    desc: "Pattern-based problem sets and mock rounds",
    accent: "#8B5CF6",
  },
];

const PRICING_PLANS = [
  {
    name: "Free",
    tagline: "Try it out - no strings attached.",
    icon: Sparkles,
    monthlyPrice: "₹0",
    yearlyPrice: "₹0",
    period: { monthly: "forever", yearly: "forever" },
    subtitle: { monthly: "No credit card needed", yearly: "No credit card needed" },
    accent: "#1DC071",
    features: [
      "3 lessons per subject",
      "Basic quizzes",
      "Community access",
      "Leaderboard (view only)",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Engineering",
    tagline: "Everything a B.Tech student needs.",
    icon: Rocket,
    monthlyPrice: "₹249",
    yearlyPrice: "₹149",
    period: { monthly: "/month", yearly: "/month" },
    subtitle: { monthly: "or ₹149/mo billed yearly", yearly: "₹1,788 billed annually" },
    accent: "#3B82F6",
    features: [
      "Full Engineering track (DSA, CN, OS, DBMS, OOP)",
      "Placement prep (company-specific)",
      "Interview pattern drills + mock rounds",
      "Interactive visualizations",
      "Certificates",
      "Browser extension (Leetcode hints)",
    ],
    cta: "Start 2-Day Free Trial",
    popular: true,
  },
  {
    name: "School",
    tagline: "For Class 8-12 AI/ML learners.",
    icon: GraduationCap,
    monthlyPrice: "₹449",
    yearlyPrice: "₹299",
    period: { monthly: "/month", yearly: "/month" },
    subtitle: { monthly: "or ₹299/mo billed yearly", yearly: "₹3,588 billed annually" },
    accent: "#8B5CF6",
    features: [
      "Full School track (AI/ML, Class 8-12)",
      "Board exam prep (CBSE/ICSE)",
      "Riku AI companion",
      "Projects + Career roadmap",
      "Video explanations",
      "Certificates",
    ],
    cta: "Start 2-Day Free Trial",
    popular: false,
  },
];

const STATS = [
  { value: "21+", label: "Modules", icon: BookOpenCheck },
  { value: "200+", label: "Lessons", icon: Users },
  { value: "1000+", label: "Visualizations", icon: Sparkles },
  { value: "195+", label: "Quizzes", icon: Award },
];

/* ================================================================== */
/*  PRICING SECTION (with monthly / yearly toggle)                     */
/* ================================================================== */

function PricingSection({ headingFont }: { headingFont: React.CSSProperties }) {
  const [yearly, setYearly] = useState(true);

  return (
    <section
      id="pricing"
      className="relative py-20 sm:py-28 overflow-hidden"
      style={{ background: T.bgSection }}
    >
      <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
        <Reveal>
          <div className="text-center mb-12">
            <h2
              className="text-3xl sm:text-[40px] font-bold tracking-tight"
              style={{ ...headingFont, color: T.text }}
            >
              Simple, Transparent Pricing
            </h2>
            <p
              className="mt-4 text-lg max-w-xl mx-auto"
              style={{ color: T.textSecondary }}
            >
              Start free. Upgrade when you&apos;re ready. 2-day free trial on
              all paid plans.
            </p>

            {/* ---- Toggle ---- */}
            <div
              className="mt-8 inline-flex items-center gap-1 p-1 rounded-full"
              style={{ background: T.border }}
            >
              <button
                onClick={() => setYearly(false)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={{
                  background: !yearly ? T.card : "transparent",
                  color: !yearly ? T.text : T.textMuted,
                  boxShadow: !yearly ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                style={{
                  background: yearly ? T.card : "transparent",
                  color: yearly ? T.text : T.textMuted,
                  boxShadow: yearly ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                Yearly
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: T.primaryLight, color: T.primary }}
                >
                  Save 40%
                </span>
              </button>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-5 max-w-5xl mx-auto md:items-center">
            {PRICING_PLANS.map((plan) => {
              const Icon = plan.icon;
              const price = yearly ? plan.yearlyPrice : plan.monthlyPrice;
              const period = yearly ? plan.period.yearly : plan.period.monthly;
              const subtitle = yearly
                ? plan.subtitle.yearly
                : plan.subtitle.monthly;

              return (
                <div
                  key={plan.name}
                  className={`relative h-full transition-all duration-300 ${
                    plan.popular ? "md:scale-[1.04]" : "hover:translate-y-[-3px]"
                  }`}
                >
                  {plan.popular && (
                    <div
                      className="absolute top-0 right-5 -translate-y-1/2 z-10 text-[10px] font-bold uppercase tracking-[0.14em] py-1 px-3 rounded-full flex items-center gap-1.5 whitespace-nowrap"
                      style={{
                        background: plan.accent,
                        color: "#fff",
                        boxShadow: `0 6px 16px ${plan.accent}66`,
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  )}

                  <div
                    className="relative rounded-3xl p-6 sm:p-7 h-full flex flex-col overflow-hidden"
                    style={{
                      background: T.card,
                      border: plan.popular
                        ? `2px solid ${plan.accent}`
                        : `1px solid ${T.border}`,
                    }}
                  >
                    {/* Plan header: icon + name */}
                    <div className="relative flex items-center gap-3 mb-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center rotate-[-4deg]"
                        style={{
                          background: plan.accent,
                          boxShadow: `0 6px 14px ${plan.accent}40`,
                        }}
                      >
                        <Icon
                          className="w-5 h-5 text-white"
                          strokeWidth={1.75}
                        />
                      </div>
                      <div>
                        <h3
                          className="text-lg font-bold leading-tight"
                          style={{ ...headingFont, color: T.text }}
                        >
                          {plan.name}
                        </h3>
                        <p
                          className="text-[11px] font-medium"
                          style={{ color: T.textMuted }}
                        >
                          {plan.tagline}
                        </p>
                      </div>
                    </div>

                    {/* Price block */}
                    <div className="relative mb-5">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className="text-[40px] font-extrabold leading-none transition-all duration-300"
                          style={{ ...headingFont, color: T.text }}
                          key={price}
                        >
                          {price}
                        </span>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: T.textMuted }}
                        >
                          {period}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-2 min-h-[20px]">
                        {yearly && plan.monthlyPrice !== "₹0" && (
                          <>
                            <span
                              className="text-xs line-through"
                              style={{ color: T.textMuted }}
                            >
                              {plan.monthlyPrice}/mo
                            </span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                background: T.primaryLight,
                                color: T.primary,
                              }}
                            >
                              SAVE 40%
                            </span>
                          </>
                        )}
                      </div>

                      <p
                        className="text-xs mt-2"
                        style={{ color: T.textMuted }}
                      >
                        {subtitle}
                      </p>
                    </div>

                    {/* Divider */}
                    <div
                      className="h-px w-full mb-5"
                      style={{ background: `${plan.accent}26` }}
                    />

                    {/* Features */}
                    <ul className="space-y-3 mb-7 flex-1" role="list">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2.5"
                        >
                          <span
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: `${plan.accent}1f` }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              strokeWidth={3}
                              style={{ color: plan.accent }}
                            />
                          </span>
                          <span
                            className="text-sm font-medium"
                            style={{ color: T.textSecondary }}
                          >
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/level1/machines"
                      className="relative w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: plan.popular ? plan.accent : "transparent",
                        color: plan.popular ? "#fff" : plan.accent,
                        border: plan.popular
                          ? "none"
                          : `1.5px solid ${plan.accent}40`,
                        boxShadow: plan.popular
                          ? `0 6px 20px ${plan.accent}4d`
                          : "none",
                      }}
                    >
                      {plan.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Trust row */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {[
              { icon: ShieldCheck, label: "Cancel anytime" },
              { icon: CreditCard, label: "Secure payment" },
              { icon: Zap, label: "Instant access" },
              { icon: Check, label: "2-day free trial" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="inline-flex items-center gap-2 font-medium"
                style={{ color: T.textSecondary }}
              >
                <Icon className="w-4 h-4" style={{ color: T.primary }} />
                {label}
              </div>
            ))}
          </div>

          {/* Lifetime callout */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div
              className="rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
              style={{
                background: T.card,
                border: `1px dashed ${T.primary}66`,
                boxShadow: `0 6px 24px rgba(29,192,113,0.06)`,
              }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: T.primaryLight }}
              >
                <Rocket className="w-5 h-5" style={{ color: T.primary }} />
              </div>
              <div className="flex-1">
                <div
                  className="text-sm font-bold"
                  style={{ ...headingFont, color: T.text }}
                >
                  Lifetime access for your engineering journey
                </div>
                <div className="text-xs" style={{ color: T.textMuted }}>
                  Pay once, own it forever. All future updates included.
                </div>
              </div>
              <div
                className="text-[22px] font-extrabold"
                style={{ ...headingFont, color: T.primary }}
              >
                &#8377;2,999
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  REVEAL ON SCROLL                                                   */
/* ================================================================== */

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

/* ================================================================== */
/*  HERO ANIMATION SHOWCASE - Cycling CS visualizations                */
/* ================================================================== */

const SCENE_INTERVAL = 4000;

const SCENE_META = [
  { label: "Bubble Sort", category: "DSA", color: "#E76F51" },
  { label: "Neural Network", category: "Machine Learning", color: "#8B5CF6" },
  { label: "Binary Tree", category: "Data Structures", color: "#1DC071" },
  { label: "Packet Routing", category: "Computer Networks", color: "#3B82F6" },
  { label: "Load Balancer", category: "System Design", color: "#FFB800" },
  { label: "BFS Traversal", category: "Graph Algorithms", color: "#EC4899" },
  { label: "CPU Scheduling", category: "Operating Systems", color: "#14B8A6" },
  { label: "SQL Join", category: "Database Management", color: "#F97316" },
];

/* ---------- Scene 1: Bubble Sort ---------- */
function SortingScene() {
  const BARS = [
    { id: 0, h: 65, color: "#E76F51" },
    { id: 1, h: 25, color: "#FFB800" },
    { id: 2, h: 50, color: "#1DC071" },
    { id: 3, h: 80, color: "#3B82F6" },
    { id: 4, h: 15, color: "#8B5CF6" },
    { id: 5, h: 60, color: "#EC4899" },
    { id: 6, h: 35, color: "#F97316" },
    { id: 7, h: 45, color: "#14B8A6" },
  ];

  const stepsRef = useRef<{ id: number; h: number; color: string }[][] | null>(null);
  if (!stepsRef.current) {
    const arr = BARS.map((b) => ({ ...b }));
    const s: (typeof arr)[] = [arr.map((b) => ({ ...b }))];
    for (let i = 0; i < arr.length; i++)
      for (let j = 0; j < arr.length - i - 1; j++)
        if (arr[j].h > arr[j + 1].h) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          s.push(arr.map((b) => ({ ...b })));
        }
    stepsRef.current = s;
  }
  const steps = stepsRef.current;
  const [si, setSi] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSi((p) => (p + 1) % steps.length), 450);
    return () => clearInterval(t);
  }, [steps]);

  return (
    <div className="relative w-full h-full">
      {steps[si].map((bar, pos) => (
        <div
          key={bar.id}
          className="absolute rounded-t-md"
          style={{
            width: "8%",
            height: `${(bar.h / 80) * 50}%`,
            background: bar.color,
            bottom: "22%",
            left: `${11 + pos * 10}%`,
            transition: "left 0.35s cubic-bezier(0.4,0,0.2,1)",
            opacity: 0.9,
            borderRadius: "4px 4px 0 0",
          }}
        />
      ))}
    </div>
  );
}

/* ---------- Scene 2: Neural Network ---------- */
function NeuralNetScene() {
  const layers = [
    { ys: [80, 140, 200], color: "#1DC071" },
    { ys: [60, 120, 180, 240], color: "#FFB800" },
    { ys: [110, 170], color: "#E76F51" },
  ];
  const xs = [65, 140, 215];

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full" aria-hidden="true">
      {/* Connections */}
      {[0, 1].map((li) =>
        layers[li].ys.map((y1, j) =>
          layers[li + 1].ys.map((y2, k) => (
            <line
              key={`c-${li}-${j}-${k}`}
              x1={xs[li]} y1={y1} x2={xs[li + 1]} y2={y2}
              stroke="rgba(0,0,0,0.06)" strokeWidth={1.5}
            />
          ))
        )
      )}
      {/* Signal pulses along connections */}
      {[0, 1].map((li) =>
        layers[li].ys.map((y1, j) =>
          layers[li + 1].ys.map((y2, k) => (
            <circle key={`s-${li}-${j}-${k}`} r={3} fill={layers[li].color} opacity={0.7}>
              <animateMotion
                dur={`${1.5 + (li * 4 + j + k) * 0.12}s`}
                repeatCount="indefinite"
                path={`M${xs[li]},${y1} L${xs[li + 1]},${y2}`}
              />
            </circle>
          ))
        )
      )}
      {/* Nodes */}
      {layers.map((layer, li) =>
        layer.ys.map((y, ni) => (
          <g key={`n-${li}-${ni}`}>
            <circle
              cx={xs[li]} cy={y} r={14}
              fill={`${layer.color}18`} stroke={layer.color} strokeWidth={2}
              className="hero-nn-node"
              style={{ animationDelay: `${li * 0.3 + ni * 0.1}s` }}
            />
            <text
              x={xs[li]} y={y + 1} textAnchor="middle"
              fill={layer.color} fontSize={8} fontWeight={700}
            >
              {li === 0 ? `x${ni + 1}` : li === 2 ? `y${ni + 1}` : ""}
            </text>
          </g>
        ))
      )}
      {/* Layer labels */}
      <text x={xs[0]} y={260} textAnchor="middle" fill="#8E95A2" fontSize={9}>Input</text>
      <text x={xs[1]} y={260} textAnchor="middle" fill="#8E95A2" fontSize={9}>Hidden</text>
      <text x={xs[2]} y={260} textAnchor="middle" fill="#8E95A2" fontSize={9}>Output</text>
    </svg>
  );
}

/* ---------- Scene 3: Binary Tree ---------- */
function TreeScene() {
  const nodes = [
    { x: 140, y: 55, v: "10" },
    { x: 85, y: 115, v: "5" },
    { x: 195, y: 115, v: "15" },
    { x: 55, y: 175, v: "3" },
    { x: 115, y: 175, v: "7" },
    { x: 165, y: 175, v: "12" },
    { x: 225, y: 175, v: "20" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6],
  ];

  return (
    <svg viewBox="0 0 280 240" className="w-full h-full" aria-hidden="true">
      {edges.map(([f, t], i) => (
        <line
          key={i}
          x1={nodes[f].x} y1={nodes[f].y} x2={nodes[t].x} y2={nodes[t].y}
          stroke="rgba(29,192,113,0.2)" strokeWidth={2}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x} cy={n.y} r={20}
            className="hero-tree-node"
            style={{ animationDelay: `${i * 0.4}s` }}
          />
          <text
            x={n.x} y={n.y + 5} textAnchor="middle"
            fill="#1A1D26" fontSize={13} fontWeight={700}
          >
            {n.v}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Scene 4: Network Packet Routing ---------- */
function NetworkScene() {
  const nodes = [
    { x: 140, y: 45, label: "Router" },
    { x: 55, y: 130, label: "PC" },
    { x: 225, y: 130, label: "Server" },
    { x: 85, y: 210, label: "Phone" },
    { x: 195, y: 210, label: "DB" },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [2, 4], [1, 2],
  ];

  return (
    <svg viewBox="0 0 280 260" className="w-full h-full" aria-hidden="true">
      {edges.map(([f, t], i) => (
        <line
          key={`e-${i}`}
          x1={nodes[f].x} y1={nodes[f].y} x2={nodes[t].x} y2={nodes[t].y}
          stroke="rgba(59,130,246,0.15)" strokeWidth={2} strokeDasharray="5 3"
        />
      ))}
      {edges.map(([f, t], i) => (
        <circle key={`p-${i}`} r={4} fill="#3B82F6" opacity={0.8}>
          <animateMotion
            dur={`${1.5 + i * 0.3}s`}
            repeatCount="indefinite"
            path={`M${nodes[f].x},${nodes[f].y} L${nodes[t].x},${nodes[t].y}`}
          />
        </circle>
      ))}
      {nodes.map((n, i) => (
        <g key={`n-${i}`}>
          <rect
            x={n.x - 24} y={n.y - 14} width={48} height={28} rx={6}
            fill="white" stroke="rgba(59,130,246,0.3)" strokeWidth={1.5}
          />
          <text
            x={n.x} y={n.y + 4} textAnchor="middle"
            fill="#3B82F6" fontSize={10} fontWeight={700}
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Scene 5: System Design - Load Balancer ---------- */
function SystemDesignScene() {
  const servers = [
    { x: 40, label: "Srv 1", color: "#3B82F6" },
    { x: 110, label: "Srv 2", color: "#8B5CF6" },
    { x: 180, label: "Srv 3", color: "#E76F51" },
  ];

  return (
    <svg viewBox="0 0 280 270" className="w-full h-full" aria-hidden="true">
      {/* Client */}
      <rect x={100} y={20} width={80} height={30} rx={6} fill="#E8F8F0" stroke="#1DC071" strokeWidth={1.5} />
      <text x={140} y={40} textAnchor="middle" fill="#1DC071" fontSize={11} fontWeight={700}>Client</text>

      {/* Load Balancer */}
      <rect x={80} y={85} width={120} height={35} rx={8} fill="#FFF4D6" stroke="#FFB800" strokeWidth={1.5} />
      <text x={140} y={108} textAnchor="middle" fill="#FFB800" fontSize={11} fontWeight={700}>Load Balancer</text>

      {/* Lines: Client → LB */}
      <line x1={140} y1={50} x2={140} y2={85} stroke="rgba(0,0,0,0.1)" strokeWidth={1.5} />

      {/* Servers */}
      {servers.map((srv, i) => (
        <g key={i}>
          <line x1={80 + i * 30 + 20} y1={120} x2={srv.x + 35} y2={160} stroke="rgba(0,0,0,0.08)" strokeWidth={1.5} />
          <rect x={srv.x} y={160} width={70} height={32} rx={6} fill={`${srv.color}10`} stroke={srv.color} strokeWidth={1.5} />
          <text x={srv.x + 35} y={180} textAnchor="middle" fill={srv.color} fontSize={10} fontWeight={700}>{srv.label}</text>
          {/* DB line */}
          <line x1={srv.x + 35} y1={192} x2={140} y2={225} stroke="rgba(0,0,0,0.05)" strokeWidth={1} />
        </g>
      ))}

      {/* Database */}
      <ellipse cx={140} cy={235} rx={35} ry={14} fill="#E8F8F0" stroke="#1DC071" strokeWidth={1.5} />
      <text x={140} y={239} textAnchor="middle" fill="#1DC071" fontSize={10} fontWeight={700}>Database</text>

      {/* Animated requests */}
      <circle r={3.5} fill="#1DC071" opacity={0.85}>
        <animateMotion dur="1.4s" repeatCount="indefinite" path="M140,50 L140,85" />
      </circle>
      {servers.map((srv, i) => (
        <circle key={`r-${i}`} r={3} fill={srv.color} opacity={0.8}>
          <animateMotion
            dur={`${1.2 + i * 0.25}s`}
            repeatCount="indefinite"
            path={`M${80 + i * 30 + 20},120 L${srv.x + 35},160`}
          />
        </circle>
      ))}
    </svg>
  );
}

/* ---------- Scene 6: Graph BFS ---------- */
function GraphScene() {
  const nodes = [
    { x: 140, y: 45 },
    { x: 70, y: 100 },
    { x: 210, y: 100 },
    { x: 40, y: 170 },
    { x: 115, y: 165 },
    { x: 175, y: 165 },
    { x: 230, y: 170 },
    { x: 140, y: 225 },
  ];
  const edges: [number, number][] = [
    [0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [4, 7], [5, 7], [3, 4],
  ];

  return (
    <svg viewBox="0 0 280 270" className="w-full h-full" aria-hidden="true">
      {edges.map(([f, t], i) => (
        <line
          key={i}
          x1={nodes[f].x} y1={nodes[f].y} x2={nodes[t].x} y2={nodes[t].y}
          stroke="rgba(236,72,153,0.15)" strokeWidth={2}
        />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x} cy={n.y} r={18}
            className="hero-graph-node"
            style={{ animationDelay: `${i * 0.35}s` }}
          />
          <text
            x={n.x} y={n.y + 5} textAnchor="middle"
            fill="#1A1D26" fontSize={12} fontWeight={700}
          >
            {i}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ---------- Scene 7: CPU Process Scheduling (OS) ---------- */
function CpuSchedulingScene() {
  const processes = [
    { id: "P1", burst: 70, color: "#E76F51", arrival: 0 },
    { id: "P2", burst: 40, color: "#3B82F6", arrival: 1 },
    { id: "P3", burst: 55, color: "#1DC071", arrival: 2 },
    { id: "P4", burst: 30, color: "#8B5CF6", arrival: 3 },
    { id: "P5", burst: 50, color: "#FFB800", arrival: 4 },
  ];

  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((p) => (p + 1) % processes.length), 700);
    return () => clearInterval(t);
  }, [processes.length]);

  const barW = 260;
  const barH = 22;
  const startY = 48;
  const gap = 10;

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full" aria-hidden="true">
      {/* CPU icon */}
      <rect x={105} y={8} width={70} height={26} rx={5} fill="#14B8A618" stroke="#14B8A6" strokeWidth={1.5} />
      <text x={140} y={25} textAnchor="middle" fill="#14B8A6" fontSize={10} fontWeight={700}>CPU</text>

      {/* Gantt chart bars */}
      {processes.map((p, i) => {
        const isActive = i === active;
        const x = 10;
        const y = startY + i * (barH + gap);
        const w = (p.burst / 100) * (barW - 50);
        return (
          <g key={p.id}>
            {/* Label */}
            <text x={x + 2} y={y + 15} fill="#1A1D26" fontSize={10} fontWeight={700}>{p.id}</text>
            {/* Track */}
            <rect x={x + 30} y={y} width={barW - 50} height={barH} rx={4}
              fill="rgba(0,0,0,0.03)" stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
            {/* Progress bar */}
            <rect x={x + 30} y={y} width={w} height={barH} rx={4}
              fill={p.color}
              opacity={isActive ? 0.9 : 0.25}
              style={{ transition: "opacity 0.3s ease" }}
            />
            {/* Running indicator */}
            {isActive && (
              <circle cx={x + 30 + w + 8} cy={y + barH / 2} r={4}
                fill={p.color} className="hero-pulse" />
            )}
            {/* Burst label */}
            <text x={x + 30 + w / 2} y={y + 15} textAnchor="middle"
              fill="white" fontSize={9} fontWeight={700} opacity={isActive ? 1 : 0.5}>
              {p.burst}ms
            </text>
          </g>
        );
      })}

      {/* Timeline */}
      <line x1={40} y1={startY + processes.length * (barH + gap) + 5}
        x2={barW} y2={startY + processes.length * (barH + gap) + 5}
        stroke="rgba(0,0,0,0.1)" strokeWidth={1} />
      {[0, 25, 50, 75, 100].map((t) => (
        <text key={t}
          x={40 + (t / 100) * (barW - 50)}
          y={startY + processes.length * (barH + gap) + 18}
          textAnchor="middle" fill="#8E95A2" fontSize={8}
        >
          {t}ms
        </text>
      ))}

      {/* Status */}
      <text x={140} y={startY + processes.length * (barH + gap) + 34}
        textAnchor="middle" fill="#14B8A6" fontSize={10} fontWeight={700}>
        Round Robin · Q=20ms
      </text>
    </svg>
  );
}

/* ---------- Scene 8: SQL Join (DBMS) ---------- */
function SqlJoinScene() {
  const [highlightRow, setHighlightRow] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setHighlightRow((p) => (p + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);

  const leftTable = [
    { id: "1", name: "Alice" },
    { id: "2", name: "Bob" },
    { id: "3", name: "Carol" },
    { id: "4", name: "Dave" },
  ];
  const rightTable = [
    { uid: "1", dept: "Engg" },
    { uid: "3", dept: "Math" },
    { uid: "2", dept: "Sci" },
    { uid: "5", dept: "Arts" },
  ];

  const rowH = 24;
  const headerH = 28;
  const tblW = 90;
  const leftX = 15;
  const rightX = 175;
  const resultX = 82;

  return (
    <svg viewBox="0 0 280 280" className="w-full h-full" aria-hidden="true">
      {/* Left table: Users */}
      <rect x={leftX} y={30} width={tblW} height={headerH} rx={5} fill="#F9731618" stroke="#F97316" strokeWidth={1.5} />
      <text x={leftX + tblW / 2} y={49} textAnchor="middle" fill="#F97316" fontSize={10} fontWeight={700}>Users</text>

      <rect x={leftX} y={30 + headerH} width={tblW / 2} height={18} fill="#F9731610" />
      <text x={leftX + tblW / 4} y={30 + headerH + 13} textAnchor="middle" fill="#8E95A2" fontSize={8} fontWeight={700}>id</text>
      <rect x={leftX + tblW / 2} y={30 + headerH} width={tblW / 2} height={18} fill="#F9731608" />
      <text x={leftX + tblW * 3 / 4} y={30 + headerH + 13} textAnchor="middle" fill="#8E95A2" fontSize={8} fontWeight={700}>name</text>

      {leftTable.map((r, i) => {
        const y = 30 + headerH + 18 + i * rowH;
        const matched = r.id === rightTable[highlightRow]?.uid;
        return (
          <g key={`l-${i}`}>
            <rect x={leftX} y={y} width={tblW} height={rowH}
              fill={matched ? "rgba(249,115,22,0.12)" : "transparent"}
              style={{ transition: "fill 0.3s ease" }} />
            <line x1={leftX} y1={y + rowH} x2={leftX + tblW} y2={y + rowH} stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />
            <text x={leftX + tblW / 4} y={y + 16} textAnchor="middle" fill="#1A1D26" fontSize={9} fontWeight={matched ? 700 : 400}>{r.id}</text>
            <text x={leftX + tblW * 3 / 4} y={y + 16} textAnchor="middle" fill="#1A1D26" fontSize={9} fontWeight={matched ? 700 : 400}>{r.name}</text>
          </g>
        );
      })}

      {/* Right table: Departments */}
      <rect x={rightX} y={30} width={tblW} height={headerH} rx={5} fill="#3B82F610" stroke="#3B82F6" strokeWidth={1.5} />
      <text x={rightX + tblW / 2} y={49} textAnchor="middle" fill="#3B82F6" fontSize={10} fontWeight={700}>Depts</text>

      <rect x={rightX} y={30 + headerH} width={tblW / 2} height={18} fill="#3B82F610" />
      <text x={rightX + tblW / 4} y={30 + headerH + 13} textAnchor="middle" fill="#8E95A2" fontSize={8} fontWeight={700}>uid</text>
      <rect x={rightX + tblW / 2} y={30 + headerH} width={tblW / 2} height={18} fill="#3B82F608" />
      <text x={rightX + tblW * 3 / 4} y={30 + headerH + 13} textAnchor="middle" fill="#8E95A2" fontSize={8} fontWeight={700}>dept</text>

      {rightTable.map((r, i) => {
        const y = 30 + headerH + 18 + i * rowH;
        const isActive = i === highlightRow;
        return (
          <g key={`r-${i}`}>
            <rect x={rightX} y={y} width={tblW} height={rowH}
              fill={isActive ? "rgba(59,130,246,0.12)" : "transparent"}
              style={{ transition: "fill 0.3s ease" }} />
            <line x1={rightX} y1={y + rowH} x2={rightX + tblW} y2={y + rowH} stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />
            <text x={rightX + tblW / 4} y={y + 16} textAnchor="middle" fill="#1A1D26" fontSize={9} fontWeight={isActive ? 700 : 400}>{r.uid}</text>
            <text x={rightX + tblW * 3 / 4} y={y + 16} textAnchor="middle" fill="#1A1D26" fontSize={9} fontWeight={isActive ? 700 : 400}>{r.dept}</text>
          </g>
        );
      })}

      {/* Join arrow */}
      {(() => {
        const activeRight = rightTable[highlightRow];
        const matchIdx = leftTable.findIndex((l) => l.id === activeRight?.uid);
        if (matchIdx === -1) return null;
        const ly = 30 + headerH + 18 + matchIdx * rowH + rowH / 2;
        const ry = 30 + headerH + 18 + highlightRow * rowH + rowH / 2;
        return (
          <g>
            <path
              d={`M${leftX + tblW},${ly} C${140},${ly} ${140},${ry} ${rightX},${ry}`}
              fill="none" stroke="#F97316" strokeWidth={1.5} opacity={0.5}
              strokeDasharray="4 3"
            />
            <circle r={3} fill="#F97316" opacity={0.8}>
              <animateMotion dur="1s" repeatCount="indefinite"
                path={`M${leftX + tblW},${ly} C${140},${ly} ${140},${ry} ${rightX},${ry}`} />
            </circle>
          </g>
        );
      })()}

      {/* Result label */}
      <rect x={resultX} y={230} width={116} height={28} rx={6} fill="#F9731612" stroke="#F97316" strokeWidth={1} />
      <text x={resultX + 58} y={248} textAnchor="middle" fill="#F97316" fontSize={10} fontWeight={700}>
        INNER JOIN ON id
      </text>
    </svg>
  );
}

const SCENE_COMPONENTS = [SortingScene, NeuralNetScene, TreeScene, NetworkScene, SystemDesignScene, GraphScene, CpuSchedulingScene, SqlJoinScene];

/* ---------- Showcase wrapper ---------- */
function HeroShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setActiveIdx((p) => (p + 1) % SCENE_META.length);
        setFading(false);
      }, 400);
    }, SCENE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const scene = SCENE_META[activeIdx];
  const Scene = SCENE_COMPONENTS[activeIdx];

  return (
    <div className="relative w-full max-w-[520px] mx-auto aspect-square">
      {/* Outer dashed ring */}
      <div
        className="absolute inset-[3%] rounded-full hero-spin-slow"
        style={{ border: "3px dashed rgba(29,192,113,0.2)" }}
      />

      {/* Background circle */}
      <div
        className="absolute inset-[8%] rounded-full"
        style={{ background: "rgba(29,192,113,0.06)" }}
      />

      {/* Scene container */}
      <div
        className="absolute inset-[10%] rounded-full overflow-hidden"
        style={{
          transition: "opacity 0.4s ease",
          opacity: fading ? 0 : 1,
        }}
      >
        <Scene key={activeIdx} />
      </div>

      {/* Scene label card */}
      <div
        className="absolute bottom-[1%] left-1/2 -translate-x-1/2 z-10"
        style={{ transition: "opacity 0.3s ease", opacity: fading ? 0 : 1 }}
      >
        <div
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl whitespace-nowrap"
          style={{
            background: "#FFFFFF",
            boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.04)",
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: scene.color }}
          />
          <div>
            <div
              className="text-xs font-bold"
              style={{ color: T.text, fontFamily: T.heading }}
            >
              {scene.label}
            </div>
            <div className="text-[10px]" style={{ color: T.textMuted }}>
              {scene.category}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-[-6%] left-1/2 -translate-x-1/2 flex gap-1.5">
        {SCENE_META.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background:
                i === activeIdx ? "#1DC071" : "rgba(29,192,113,0.2)",
              transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
            }}
          />
        ))}
      </div>

      {/* Floating book icon - top left */}
      <div
        className="absolute top-[5%] left-[0%] hero-float"
        style={{ animationDelay: "0.5s" }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center rotate-[-12deg]"
          style={{
            background: "#FFF4D6",
            boxShadow: "0 4px 14px rgba(255,184,0,0.15)",
          }}
        >
          <BookOpen className="w-5 h-5" style={{ color: "#FFB800" }} />
        </div>
      </div>

      {/* Decorative dots */}
      <div
        className="absolute bottom-[22%] right-[-2%] w-3 h-3 rounded-full hero-pulse"
        style={{ background: T.primary, animationDelay: "1s" }}
      />
      <div
        className="absolute top-[28%] left-[-2%] w-2.5 h-2.5 rounded-full hero-pulse"
        style={{ background: "#FFB800", animationDelay: "1.5s" }}
      />

      {/* Dot grid - bottom right */}
      <div className="absolute bottom-[8%] right-[0%]">
        <div className="grid grid-cols-4 gap-1.5">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "rgba(29,192,113,0.2)" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================== */
/*  COMPONENT                                                          */
/* ================================================================== */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const headingFont = { fontFamily: T.heading };

  return (
    <div
      className="min-h-screen"
      style={{ fontFamily: T.body, background: T.bg, color: T.text }}
    >
      {/* ==================== NAVBAR ==================== */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(20px) saturate(1.4)" : "none",
          borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
          boxShadow: scrolled ? "0 1px 12px rgba(0,0,0,0.04)" : "none",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="Red Panda Learn home"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]"
              style={{ background: "#E76F51" }}
            >
              <PandaLogo size={22} />
            </div>
            <span
              className="text-[18px] font-bold tracking-tight"
              style={{ ...headingFont, color: T.text }}
            >
              Red Panda{" "}
              <span style={{ color: T.primary }}>Learn</span>
            </span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-1">
            {[
              { label: "Home", href: "#" },
              { label: "Course Catalog", href: "#tracks" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-4 py-2 text-[14px] font-medium rounded-lg transition-all duration-200 hover:text-[#1DC071] hover:bg-[rgba(29,192,113,0.06)]"
                style={{ color: T.textSecondary }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link
              href="/level1/machines"
              className="hidden md:inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-all duration-300 hover:shadow-lg hover:shadow-[rgba(29,192,113,0.25)] hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: T.primary }}
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              className="md:hidden p-2 rounded-lg transition-all"
              style={{ color: T.textSecondary }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div
          className="fixed top-[72px] left-4 right-4 z-50 rounded-2xl md:hidden"
          style={{
            background: "rgba(255,255,255,0.98)",
            border: `1px solid ${T.border}`,
            backdropFilter: "blur(24px)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.1)",
          }}
        >
          <div className="p-3 flex flex-col gap-0.5">
            {[
              { label: "Home", href: "#" },
              { label: "Course Catalog", href: "#tracks" },
              { label: "Pricing", href: "#pricing" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium py-2.5 px-3 rounded-xl transition-all hover:bg-[rgba(29,192,113,0.06)]"
                style={{ color: T.textSecondary }}
              >
                {item.label}
              </a>
            ))}
            <div
              className="mt-1 pt-2"
              style={{ borderTop: `1px solid ${T.border}` }}
            >
              <Link
                href="/level1/machines"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: T.primary }}
              >
                Start Learning
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ==================== HERO ==================== */}
      <header className="relative overflow-hidden pt-[100px] sm:pt-[120px] pb-10 sm:pb-16">
        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            {/* Left - Text content */}
            <div className="flex-1 text-center lg:text-left max-w-xl lg:max-w-none">
              <Reveal>
                <h1
                  className="text-[36px] sm:text-[48px] lg:text-[56px] font-extrabold tracking-tight leading-[1.1]"
                  style={{ ...headingFont, color: T.text }}
                >
                  Explore thousands
                  <br />
                  hands-on creative{" "}
                  <span className="relative inline-block">
                    <span style={{ color: T.primary }}>courses</span>
                    <svg
                      className="absolute -bottom-2 left-0 w-full"
                      viewBox="0 0 200 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 8 C 40 2, 80 2, 100 6 S 160 12, 198 4"
                        stroke="#1DC071"
                        strokeWidth="3"
                        strokeLinecap="round"
                        fill="none"
                        className="hero-underline-draw"
                      />
                    </svg>
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={0.08}>
                <p
                  className="mt-6 text-[16px] sm:text-[18px] leading-relaxed max-w-lg mx-auto lg:mx-0"
                  style={{ color: T.textSecondary }}
                >
                  Enroll in immersive classes with the world&apos;s best
                  interactive visualizations. Unlock your creative potential in
                  AI, ML, and Computer Science.
                </p>
              </Reveal>

              <Reveal delay={0.16}>
                <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 lg:justify-start justify-center">
                  <Link
                    href="/level1/machines"
                    className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-[15px] font-semibold text-white transition-all duration-300 hover:shadow-xl hover:shadow-[rgba(29,192,113,0.2)] hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: T.primary,
                      boxShadow: "0 4px 16px rgba(29, 192, 113, 0.25)",
                    }}
                  >
                    Explore Classes
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="#tracks"
                    className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl text-[15px] font-semibold transition-all duration-200 hover:bg-[rgba(0,0,0,0.03)]"
                    style={{ color: T.textSecondary }}
                  >
                    Browse Catalog
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Right - Illustration */}
            <div className="flex-1 w-full max-w-[480px] lg:max-w-[520px]">
              <Reveal delay={0.12}>
                <HeroShowcase />
              </Reveal>
            </div>
          </div>

          {/* Stats bar */}
          <Reveal delay={0.28}>
            <div
              className="mt-16 sm:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-0 max-w-4xl mx-auto rounded-3xl py-8 px-6 sm:px-10"
              style={{
                background: T.bg,
                boxShadow: "0 4px 40px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.03)",
                border: `1px solid ${T.borderLight}`,
              }}
            >
              {STATS.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 sm:justify-center"
                    style={{
                      borderRight:
                        i < STATS.length - 1
                          ? `1px solid ${T.borderLight}`
                          : "none",
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: T.primaryLight }}
                    >
                      <Icon className="w-5 h-5" style={{ color: T.primary }} />
                    </div>
                    <div>
                      <div
                        className="text-xl sm:text-2xl font-extrabold"
                        style={{ ...headingFont, color: T.text }}
                      >
                        {stat.value}
                      </div>
                      <div
                        className="text-xs font-medium"
                        style={{ color: T.textMuted }}
                      >
                        {stat.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </header>

      {/* ==================== TRACK SELECTOR ==================== */}
      <section
        id="tracks"
        className="py-20 sm:py-28"
        style={{ background: T.bgSection }}
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-[40px] font-bold tracking-tight"
                style={{ ...headingFont, color: T.text }}
              >
                Choose Your Path
              </h2>
              <p
                className="mt-4 text-lg max-w-xl mx-auto"
                style={{ color: T.textSecondary }}
              >
                Multiple learning tracks designed for every stage of your
                computer science journey.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-7">
            {TRACKS.map((track, i) => {
              const Icon = track.icon;
              return (
                <Reveal key={track.title} delay={0.1 + i * 0.07}>
                  <div
                    className="relative rounded-3xl p-6 sm:p-7 transition-all duration-300 group overflow-hidden h-full flex flex-col hover:translate-y-[-3px]"
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 16px 40px ${track.color}1f`;
                      e.currentTarget.style.borderColor = `${track.color}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    {/* ---- Hero-style circular showcase ---- */}
                    <div className="relative w-full aspect-[1.6/1] mb-5">
                      {/* Soft backdrop */}
                      <div
                        className="absolute inset-0 rounded-2xl overflow-hidden"
                        style={{ background: track.colorLight }}
                      >
                        {/* Dot grid - bottom left */}
                        <div className="absolute bottom-3 left-3">
                          <div className="grid grid-cols-4 gap-1">
                            {Array.from({ length: 12 }).map((_, k) => (
                              <div
                                key={k}
                                className="w-1 h-1 rounded-full"
                                style={{ background: `${track.color}33` }}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Pulsing dot - top right */}
                        <div
                          className="absolute top-4 right-5 w-2 h-2 rounded-full hero-pulse"
                          style={{
                            background: track.color,
                            animationDelay: `${i * 0.3}s`,
                          }}
                        />
                        <div
                          className="absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full hero-pulse"
                          style={{
                            background: track.color,
                            opacity: 0.5,
                            animationDelay: `${i * 0.3 + 0.8}s`,
                          }}
                        />
                      </div>

                      {/* Dashed rotating ring */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[68%] aspect-square rounded-full hero-spin-slow"
                        style={{
                          border: `2px dashed ${track.color}33`,
                        }}
                      />

                      {/* Inner solid circle */}
                      <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[54%] aspect-square rounded-full flex items-center justify-center"
                        style={{
                          background: `${track.color}18`,
                          boxShadow: `inset 0 0 0 1px ${track.color}1a`,
                        }}
                      >
                        <Icon
                          className="w-10 h-10 sm:w-11 sm:h-11"
                          style={{ color: track.color }}
                          strokeWidth={1.75}
                        />
                      </div>

                      {/* Floating badge pill - top left */}
                      <div
                        className="absolute top-3 left-3 hero-float"
                        style={{ animationDelay: `${i * 0.2}s` }}
                      >
                        <div
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold rotate-[-4deg]"
                          style={{
                            background: T.card,
                            color: track.color,
                            boxShadow: `0 4px 12px ${track.color}1f`,
                            border: `1px solid ${track.color}1a`,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: track.color }}
                          />
                          {track.badge}
                        </div>
                      </div>

                      {/* Floating level chip - bottom right */}
                      <div
                        className="absolute bottom-3 right-3 hero-float"
                        style={{ animationDelay: `${i * 0.2 + 1}s` }}
                      >
                        <div
                          className="px-2.5 py-1 rounded-lg text-[10px] font-semibold rotate-[3deg]"
                          style={{
                            background: T.card,
                            color: T.textSecondary,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                            border: `1px solid ${T.borderLight}`,
                          }}
                        >
                          {track.level}
                        </div>
                      </div>
                    </div>

                    {/* ---- Content ---- */}
                    <h3
                      className="text-xl font-bold mb-2"
                      style={{ ...headingFont, color: T.text }}
                    >
                      {track.title}
                    </h3>

                    <p
                      className="text-sm leading-relaxed mb-4"
                      style={{ color: T.textSecondary }}
                    >
                      {track.desc}
                    </p>

                    <div
                      className="flex items-center gap-2 text-xs font-medium mb-5 flex-wrap"
                      style={{ color: T.textMuted }}
                    >
                      <span>{track.coverage}</span>
                      <span
                        className="w-1 h-1 rounded-full"
                        style={{ background: T.textMuted }}
                      />
                      <span>{track.lessons}</span>
                    </div>

                    <div className="mt-auto">
                      {track.comingSoon ? (
                        <span
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold cursor-default"
                          style={{
                            background: T.bgSection,
                            color: T.textMuted,
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Coming Soon
                        </span>
                      ) : (
                        <Link
                          href={track.href}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            background: track.color,
                            boxShadow: `0 4px 14px ${track.color}33`,
                          }}
                        >
                          Start Learning
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== SUBJECT GRID ==================== */}
      <section className="py-20 sm:py-28" style={{ background: T.bg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-[40px] font-bold tracking-tight"
                style={{ ...headingFont, color: T.text }}
              >
                What You&apos;ll Master
              </h2>
              <p
                className="mt-4 text-lg max-w-xl mx-auto"
                style={{ color: T.textSecondary }}
              >
                All five core engineering subjects are here - ready to explore
                with interactive visualizations.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ENGINEERING_SUBJECTS.map((subject, i) => {
              const Icon = subject.icon;
              const num = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={subject.title} delay={0.06 * i}>
                  <div
                    className="relative rounded-3xl p-7 transition-all duration-300 group h-full flex flex-col overflow-hidden hover:translate-y-[-3px]"
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 16px 40px ${subject.accent}1f`;
                      e.currentTarget.style.borderColor = `${subject.accent}33`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    {/* Huge watermark number */}
                    <div
                      className="absolute -top-4 -right-2 text-[110px] font-extrabold leading-none select-none pointer-events-none"
                      style={{
                        ...headingFont,
                        color: subject.accent,
                        opacity: 0.07,
                        letterSpacing: "-0.05em",
                      }}
                      aria-hidden="true"
                    >
                      {num}
                    </div>

                    {/* Icon stamp + number chip */}
                    <div className="relative flex items-start justify-between mb-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-[-4deg] transition-transform duration-300 group-hover:rotate-[4deg]"
                        style={{
                          background: subject.accent,
                          boxShadow: `0 6px 16px ${subject.accent}40`,
                        }}
                      >
                        <Icon
                          className="w-7 h-7 text-white"
                          strokeWidth={1.75}
                        />
                      </div>

                      <div
                        className="text-[11px] font-bold tracking-wider px-2.5 py-1 rounded-full"
                        style={{
                          ...headingFont,
                          background: subject.accentBg,
                          color: subject.accent,
                        }}
                      >
                        {num} / 05
                      </div>
                    </div>

                    {/* Title */}
                    <h3
                      className="relative text-lg font-bold mb-2"
                      style={{ ...headingFont, color: T.text }}
                    >
                      {subject.title}
                    </h3>

                    {/* Accent divider */}
                    <div
                      className="w-10 h-[2px] mb-3 rounded-full"
                      style={{ background: subject.accent }}
                    />

                    {/* Description */}
                    <p
                      className="relative text-sm leading-relaxed mb-5 flex-1"
                      style={{ color: T.textSecondary }}
                    >
                      {subject.desc}
                    </p>

                    {/* Stat pills */}
                    <div className="relative flex items-center gap-2 flex-wrap">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: subject.accentBg,
                          color: subject.accent,
                        }}
                      >
                        <Boxes className="w-3 h-3" />
                        {subject.levels}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                        style={{
                          background: T.bgSection,
                          color: T.textSecondary,
                        }}
                      >
                        <BookOpenCheck className="w-3 h-3" />
                        {subject.lessons}
                      </span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== WHO IT'S FOR ==================== */}
      <section className="py-20 sm:py-28" style={{ background: T.bg }}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <Reveal>
            <div className="text-center mb-16">
              <h2
                className="text-3xl sm:text-[40px] font-bold tracking-tight"
                style={{ ...headingFont, color: T.text }}
              >
                Built for Every Stage
              </h2>
              <p
                className="mt-4 text-lg max-w-xl mx-auto"
                style={{ color: T.textSecondary }}
              >
                Whether you&apos;re starting out or preparing for your career,
                we&apos;ve got you covered.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line - lg+ only */}
            <div
              className="hidden lg:block absolute top-[88px] left-[10%] right-[10%] border-t-2 border-dashed pointer-events-none"
              style={{ borderColor: "rgba(0,0,0,0.12)" }}
              aria-hidden="true"
            />

            {AUDIENCE.map((item, i) => {
              const Icon = item.icon;
              const stage = String(i + 1).padStart(2, "0");
              return (
                <Reveal key={item.title} delay={0.08 * i}>
                  <div
                    className="relative rounded-3xl p-6 transition-all duration-300 group h-full flex flex-col hover:translate-y-[-3px]"
                    style={{
                      background: T.card,
                      border: `1px solid ${T.border}`,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 16px 40px ${item.accent}1f`;
                      e.currentTarget.style.borderColor = `${item.accent}40`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                      e.currentTarget.style.borderColor = T.border;
                    }}
                  >
                    {/* Stage label + progress dots */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[10px] font-bold tracking-[0.14em]"
                        style={{ ...headingFont, color: item.accent }}
                      >
                        STAGE {stage}
                      </span>
                      <div className="flex items-center gap-1">
                        {AUDIENCE.map((_, k) => (
                          <span
                            key={k}
                            className="rounded-full transition-all"
                            style={{
                              width: k === i ? 14 : 4,
                              height: 4,
                              background: k <= i ? item.accent : `${T.border}`,
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Icon disc with dashed ring */}
                    <div className="relative mx-auto mb-5 w-[88px] h-[88px]">
                      {/* Rotating dashed ring */}
                      <div
                        className="absolute inset-0 rounded-full hero-spin-slow"
                        style={{ border: `2px dashed ${item.accent}40` }}
                      />
                      {/* Solid backdrop */}
                      <div
                        className="absolute inset-[10px] rounded-full"
                        style={{
                          background: item.accent,
                          boxShadow: `0 8px 20px ${item.accent}40`,
                        }}
                      />
                      {/* Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon
                          className="w-9 h-9 text-white transition-transform duration-300 group-hover:scale-110"
                          strokeWidth={1.75}
                        />
                      </div>
                      {/* Floating corner dot */}
                      <div
                        className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full hero-pulse"
                        style={{
                          background: item.accent,
                          animationDelay: `${i * 0.3}s`,
                        }}
                      />
                    </div>

                    {/* Title */}
                    <h3
                      className="text-[15px] font-bold mb-2 text-center"
                      style={{ ...headingFont, color: T.text }}
                    >
                      {item.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-sm leading-relaxed text-center flex-1"
                      style={{ color: T.textSecondary }}
                    >
                      {item.desc}
                    </p>

                    {/* Bottom arrow indicator */}
                    <div
                      className="mt-4 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ color: item.accent }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ==================== PRICING ==================== */}
      <PricingSection headingFont={headingFont} />

      {/* ==================== FOOTER ==================== */}
      <footer
        className="relative pt-20 pb-10 overflow-hidden"
        style={{ background: "#141720" }}
        role="contentinfo"
      >
        {/* Accent stripe */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[2px]"
          style={{ background: T.primary, opacity: 0.5 }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          {/* CTA strip */}
          <div
            className="rounded-3xl p-6 sm:p-10 mb-14 relative overflow-hidden"
            style={{
              background: "rgba(29,192,113,0.1)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              className="absolute -top-12 -right-12 w-40 h-40 rounded-full hero-spin-slow"
              style={{ border: "2px dashed rgba(29,192,113,0.2)" }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full hero-pulse"
              style={{ background: "rgba(255,184,0,0.08)" }}
              aria-hidden="true"
            />

            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <h3
                  className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight"
                  style={headingFont}
                >
                  Ready to start learning?
                </h3>
                <p
                  className="mt-2 text-sm sm:text-base"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Join thousands of students mastering CS with visual,
                  interactive lessons.
                </p>
              </div>
              <Link
                href="/level1/machines"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{
                  background: T.primary,
                  boxShadow: `0 8px 24px ${T.primary}4d`,
                }}
              >
                Start Learning Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-6 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-5">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 group"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-[-8deg]"
                  style={{ background: "#E76F51" }}
                >
                  <PandaLogo size={22} />
                </div>
                <span
                  className="text-[18px] font-bold text-white tracking-tight"
                  style={headingFont}
                >
                  Red Panda{" "}
                  <span style={{ color: T.primary }}>Learn</span>
                </span>
              </Link>

              <p
                className="mt-4 text-sm leading-relaxed max-w-sm"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Visual CS education for curious learners. From Class 8 to
                placement prep - every concept, animated.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-2">
                {[
                  { Icon: TwitterIcon, label: "Twitter", href: "#" },
                  { Icon: GithubIcon, label: "GitHub", href: "#" },
                  { Icon: LinkedinIcon, label: "LinkedIn", href: "#" },
                  { Icon: Mail, label: "Email", href: "mailto:contact@redpandalearn.com" },
                ].map(({ Icon, label, href }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      color: "rgba(255,255,255,0.7)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = `${T.primary}22`;
                      e.currentTarget.style.borderColor = `${T.primary}66`;
                      e.currentTarget.style.color = T.primary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {[
              {
                title: "Learn",
                links: [
                  { label: "Tracks", href: "#tracks" },
                  { label: "AI & ML", href: "/level1/machines" },
                  { label: "Engineering", href: "/engineering" },
                  { label: "System Design", href: "/system-design" },
                ],
              },
              {
                title: "Company",
                links: [
                  { label: "Pricing", href: "#pricing" },
                  { label: "About", href: "#" },
                  { label: "Blog", href: "#" },
                  { label: "Careers", href: "#" },
                ],
              },
              {
                title: "Support",
                links: [
                  { label: "Help Center", href: "#" },
                  { label: "Contact", href: "mailto:contact@redpandalearn.com" },
                  { label: "Privacy", href: "#" },
                  { label: "Terms", href: "#" },
                ],
              },
            ].map((col) => (
              <div key={col.title} className="md:col-span-[2.33]" style={{ gridColumn: "span 1 / span 1" }}>
                <div
                  className="text-xs font-bold uppercase tracking-[0.14em] mb-4"
                  style={{ ...headingFont, color: T.primary }}
                >
                  {col.title}
                </div>
                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm transition-colors duration-200 inline-flex items-center gap-1.5 group"
                        style={{ color: "rgba(255,255,255,0.55)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                        }}
                      >
                        <span
                          className="w-0 group-hover:w-2 h-[2px] rounded-full transition-all duration-200"
                          style={{ background: T.primary }}
                        />
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div
            className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <p
              className="text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              &copy; 2026 Red Panda Learn. All rights reserved.
            </p>
            <p
              className="text-xs inline-flex items-center gap-1.5"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Made with{" "}
              <Heart
                className="w-3 h-3 fill-current"
                style={{ color: "#E76F51" }}
              />{" "}
              for curious learners.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
