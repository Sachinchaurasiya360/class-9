import { useState, useMemo, useEffect, useRef } from "react";
import { Clock, Milestone, Sparkles, Trophy } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { playClick, playPop } from "../../utils/sounds";

/* Sketchy palette */
const INK = "#2b2a35";
const CORAL = "#ff6b6b";
const MINT = "#4ecdc4";
const YELLOW = "#ffd93d";
const LAVENDER = "#b18cf2";
const SKY = "#6bb6ff";
const PEACH = "#ffb88c";
const PAPER = "#fffdf5";

/* ------------------------------------------------------------------ */
/*  Milestones                                                         */
/* ------------------------------------------------------------------ */

interface Milestone {
  year: number;
  title: string;
  who: string;
  what: string;
  why: string;
  color: string;
  emoji: string;
}

const MILESTONES: Milestone[] = [
  {
    year: 1943,
    title: "The First Brain Cell on Paper",
    who: "Warren McCulloch & Walter Pitts",
    what: "A neuroscientist and a young logician teamed up and wrote a paper called 'A Logical Calculus of the Ideas Immanent in Nervous Activity'. In it they showed that a brain cell could be described with simple yes/no logic — inputs come in, get added up, and if the total crosses a threshold, the neuron 'fires'. There was no computer to run it on. It was pure math, drawn on paper.",
    why: "It was the first time anyone said out loud: a thinking machine isn't magic — it's math. Every neural network you'll ever see, from the perceptron to GPT, is a direct descendant of this one paper.",
    color: PEACH,
    emoji: "🧠",
  },
  {
    year: 1950,
    title: "The Turing Test",
    who: "Alan Turing",
    what: "In a paper called 'Computing Machinery and Intelligence', Turing dodged the impossible question 'can machines think?' and replaced it with a game: put a human and a machine behind a curtain, let a judge chat with both, and see if the judge can tell which is which. If not — call it intelligent. He also predicted that by 2000, computers would have enough memory to fool people 30% of the time.",
    why: "It gave AI researchers a goal they could actually aim at. For the next 75 years, every chatbot, every language model, every voice assistant was — secretly or openly — chasing the Turing Test.",
    color: SKY,
    emoji: "🤔",
  },
  {
    year: 1956,
    title: "AI Gets Its Name",
    who: "Dartmouth Workshop",
    what: "John McCarthy, Marvin Minsky, Claude Shannon and Nathaniel Rochester gathered ten researchers at Dartmouth College for a summer workshop. McCarthy coined a brand-new phrase for what they were doing: 'Artificial Intelligence'. They were so optimistic they thought they'd solve most of it in two months. They were a little off.",
    why: "Before this summer, the field had no name. After it, AI was officially a discipline — with conferences, funding, and a flag to rally around.",
    color: MINT,
    emoji: "🎓",
  },
  {
    year: 1958,
    title: "The Perceptron",
    who: "Frank Rosenblatt",
    what: "At Cornell, Rosenblatt built the Mark I Perceptron — a real, physical machine the size of a refrigerator, with 400 light sensors wired to motorized potentiometers (the 'weights'). Show it a card with a shape, and it would adjust those weights until it learned to tell circles from squares. The New York Times called it 'the embryo of an electronic computer that the Navy expects will be able to walk, talk, see, write, reproduce itself and be conscious of its existence'.",
    why: "It was the first machine in history that learned from examples instead of being programmed step-by-step. That's the entire idea of machine learning, born in one humming metal cabinet.",
    color: CORAL,
    emoji: "⚡",
  },
  {
    year: 1969,
    title: "The AI Winter Begins",
    who: "Marvin Minsky & Seymour Papert",
    what: "Two MIT professors published a book called 'Perceptrons' that mathematically proved a single-layer perceptron could not learn even the simple XOR function (output 1 only when exactly one input is on). The press took it as 'AI is impossible'. Government money vanished. Labs closed. Researchers quietly left the field. The freeze lasted nearly 15 years.",
    why: "It was a brutal but useful lesson: one neuron is too weak. The fix was waiting in plain sight — stack neurons in layers — but nobody had a way to train those layers yet.",
    color: LAVENDER,
    emoji: "❄️",
  },
  {
    year: 1986,
    title: "Backpropagation Revives Neural Nets",
    who: "David Rumelhart, Geoffrey Hinton & Ronald Williams",
    what: "Their paper 'Learning representations by back-propagating errors' showed how to train a network with many layers: run an example forward, measure how wrong the answer was, then push that error BACKWARD through the layers, nudging every weight a tiny bit in the direction that reduces the mistake. The math (the chain rule from calculus) had existed for centuries — they finally pointed it at neural nets.",
    why: "Suddenly multi-layer networks could actually learn. This is the algorithm every modern model — yes, including ChatGPT — still uses to train. Hinton would later win the Nobel Prize partly for this.",
    color: MINT,
    emoji: "🔄",
  },
  {
    year: 1997,
    title: "Deep Blue Beats Kasparov",
    who: "IBM",
    what: "After a humiliating loss the year before, IBM's chess machine Deep Blue came back and beat reigning world champion Garry Kasparov 3.5–2.5 in a six-game match in New York. Deep Blue wasn't really 'learning' — it was a custom supercomputer that could evaluate 200 million chess positions per second using brute force and hand-tuned rules. Kasparov accused IBM of cheating. They never played a rematch.",
    why: "For the first time, a machine beat the very best human at something humans considered a peak of intelligence. It made the public start taking machines-vs-humans seriously again — and reminded everyone that compute was getting scary fast.",
    color: YELLOW,
    emoji: "♟️",
  },
  {
    year: 2012,
    title: "AlexNet & The Deep Learning Boom",
    who: "Alex Krizhevsky, Ilya Sutskever & Geoffrey Hinton",
    what: "An 8-layer convolutional network called AlexNet entered the ImageNet contest — a competition to label photos into 1,000 categories. The previous year's winner had ~26% errors. AlexNet got 15%. It won by a margin so huge the computer-vision world was in shock. The trick? Two consumer NVIDIA gaming GPUs in Alex's bedroom, training for a week on 1.2 million images.",
    why: "This is the moment 'deep learning' stopped being a niche trick and became THE way to do AI. Every company, every university, every research lab pivoted within months. The modern AI era starts here.",
    color: CORAL,
    emoji: "🎯",
  },
  {
    year: 2016,
    title: "AlphaGo Beats Lee Sedol",
    who: "DeepMind",
    what: "Go is a 2,500-year-old board game with more legal positions than atoms in the observable universe. Experts said computers were 10+ years away from beating top humans. Then DeepMind's AlphaGo — which trained by playing itself millions of times — beat 18-time world champion Lee Sedol 4 games to 1 in Seoul. In game 2, move 37, AlphaGo played a stone so strange that commentators thought it was a bug. It turned out to be brilliant.",
    why: "It proved deep learning plus reinforcement learning could master things humans called 'intuition' or 'creativity'. It also reset everyone's timelines for what AI could do — by years.",
    color: SKY,
    emoji: "🏆",
  },
  {
    year: 2017,
    title: "Transformers Are Born",
    who: "Vaswani et al. (Google Brain)",
    what: "Eight researchers at Google published a paper with a now-legendary title: 'Attention Is All You Need'. They threw out the recurrent networks everyone was using for language and replaced them with a new architecture — the Transformer — built around a mechanism called 'self-attention' that lets every word in a sentence directly look at every other word. It trained much faster and got much better results.",
    why: "Every modern large language model — GPT, Claude, Gemini, Llama, every AI chatbot you've ever talked to — is a Transformer. This single 15-page paper is arguably the most important AI paper of the 21st century.",
    color: LAVENDER,
    emoji: "✨",
  },
  {
    year: 2022,
    title: "ChatGPT Goes Viral",
    who: "OpenAI",
    what: "On November 30, OpenAI quietly put a chatbot called ChatGPT on the web as a 'research preview'. It could write essays, debug code, explain quantum physics to a 5-year-old, and tell jokes. Within 5 days it had 1 million users. Within 2 months, 100 million — the fastest-growing consumer product in history at that point. Schools panicked. Google declared a 'code red'.",
    why: "AI stopped being something academics argued about and became something your grandma uses to write birthday cards. The whole world finally noticed what researchers had been quietly building for a decade.",
    color: MINT,
    emoji: "💬",
  },
  {
    year: 2024,
    title: "AI Is Everywhere",
    who: "All of us",
    what: "AI writes code in your editor, drafts emails in your inbox, generates art from a sentence, dubs movies into 50 languages, finds new antibiotics, folds proteins, drives cars, diagnoses X-rays, and tutors students. Models are now multimodal — they see, hear, and speak. The race between OpenAI, Anthropic, Google, Meta, and open-source labs is moving in weeks, not years.",
    why: "And YOU are learning how it all works, from the inside. The kids reading this lesson are the same age Geoffrey Hinton, Yann LeCun and Yoshua Bengio were when they fell in love with neural nets. The next chapter of this story? It might literally be written by you.",
    color: YELLOW,
    emoji: "🚀",
  },
];

/* ------------------------------------------------------------------ */
/*  Tab 1 – Interactive Timeline                                       */
/* ------------------------------------------------------------------ */

function TimelineTab() {
  const [selected, setSelected] = useState(2); // start on Perceptron
  const scrollRef = useRef<HTMLDivElement>(null);

  const minYear = MILESTONES[0].year;
  const maxYear = MILESTONES[MILESTONES.length - 1].year;
  const span = maxYear - minYear;

  // Auto-scroll selected dot into view
  useEffect(() => {
    const el = scrollRef.current?.querySelector(`[data-idx="${selected}"]`) as HTMLElement | null;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [selected]);

  const m = MILESTONES[selected];

  return (
    <div className="space-y-5">
      <div className="text-center font-hand">
        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
          1943 → Today
        </p>
        <p className="text-base text-foreground mt-1">
          Click any dot to travel through ML history.
        </p>
      </div>

      {/* Horizontal timeline */}
      <div
        ref={scrollRef}
        className="card-sketchy p-4 overflow-x-auto"
        style={{ background: PAPER }}
      >
        <div className="relative" style={{ minWidth: 720, height: 130 }}>
          {/* The line */}
          <svg
            width="100%"
            height="130"
            style={{ position: "absolute", top: 0, left: 0 }}
          >
            <defs>
              <pattern id="dash" patternUnits="userSpaceOnUse" width="8" height="2">
                <rect width="5" height="2" fill={INK} />
              </pattern>
            </defs>
            <line
              x1="2%"
              y1="65"
              x2="98%"
              y2="65"
              stroke={INK}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <line
              x1="2%"
              y1="65"
              x2="98%"
              y2="65"
              stroke={CORAL}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
              className="signal-flow"
            />
            {/* Tick marks for decades */}
            {[1950, 1970, 1990, 2010, 2020].map((y) => {
              const pct = ((y - minYear) / span) * 96 + 2;
              return (
                <g key={y}>
                  <line
                    x1={`${pct}%`}
                    y1="58"
                    x2={`${pct}%`}
                    y2="72"
                    stroke={INK}
                    strokeWidth="1.5"
                    opacity="0.4"
                  />
                  <text
                    x={`${pct}%`}
                    y="92"
                    textAnchor="middle"
                    fill={INK}
                    opacity="0.5"
                    style={{ fontFamily: "Patrick Hand, cursive", fontSize: 11 }}
                  >
                    {y}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Milestone dots */}
          {MILESTONES.map((mi, i) => {
            const pct = ((mi.year - minYear) / span) * 96 + 2;
            const isSelected = i === selected;
            const above = i % 2 === 0;
            return (
              <button
                key={mi.year}
                data-idx={i}
                onClick={() => { playPop(); setSelected(i); }}
                className="absolute -translate-x-1/2 flex flex-col items-center group hover:scale-110 transition-transform"
                style={{ left: `${pct}%`, top: above ? 0 : 70 }}
              >
                {above && (
                  <>
                    <span
                      className="font-hand text-[11px] font-bold whitespace-nowrap mb-0.5"
                      style={{ color: INK, opacity: isSelected ? 1 : 0.6 }}
                    >
                      {mi.year}
                    </span>
                    <span className="text-lg leading-none">{mi.emoji}</span>
                    <div
                      className="w-0.5 h-3"
                      style={{ background: INK, opacity: 0.4 }}
                    />
                  </>
                )}
                <div
                  className="rounded-full border-2 transition-all"
                  style={{
                    background: mi.color,
                    borderColor: INK,
                    width: isSelected ? 22 : 14,
                    height: isSelected ? 22 : 14,
                    boxShadow: isSelected ? `0 0 0 4px ${mi.color}55` : "1px 1px 0 #2b2a35",
                  }}
                />
                {!above && (
                  <>
                    <div
                      className="w-0.5 h-3"
                      style={{ background: INK, opacity: 0.4 }}
                    />
                    <span className="text-lg leading-none">{mi.emoji}</span>
                    <span
                      className="font-hand text-[11px] font-bold whitespace-nowrap mt-0.5"
                      style={{ color: INK, opacity: isSelected ? 1 : 0.6 }}
                    >
                      {mi.year}
                    </span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Detail card */}
      <div
        key={selected}
        className="card-sketchy p-5 space-y-3"
        style={{ background: m.color + "22", animation: "fadeInSlide 0.4s ease-out" }}
      >
        <div className="flex items-start gap-3">
          <div
            className="text-3xl shrink-0 rounded-full border-2 border-foreground p-2 flex items-center justify-center"
            style={{ background: m.color, width: 56, height: 56 }}
          >
            {m.emoji}
          </div>
          <div className="flex-1">
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {m.who} &middot; {m.year}
            </p>
            <h3 className="font-hand text-2xl font-bold text-foreground mt-0.5">
              {m.title}
            </h3>
          </div>
        </div>
        <p className="font-hand text-base text-foreground leading-relaxed">{m.what}</p>
        <div
          className="card-sketchy p-3"
          style={{ background: PAPER }}
        >
          <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">
            Why it mattered
          </p>
          <p className="font-hand text-sm text-foreground">{m.why}</p>
        </div>
      </div>

      {/* Prev / Next */}
      <div className="flex gap-2 justify-center">
        <button
          onClick={() => { playClick(); setSelected((s) => Math.max(0, s - 1)); }}
          disabled={selected === 0}
          className="btn-sketchy-outline font-hand text-sm"
          style={{ opacity: selected === 0 ? 0.5 : 1 }}
        >
          ← Earlier
        </button>
        <span className="font-hand text-sm font-bold text-muted-foreground self-center px-3">
          {selected + 1} / {MILESTONES.length}
        </span>
        <button
          onClick={() => { playClick(); setSelected((s) => Math.min(MILESTONES.length - 1, s + 1)); }}
          disabled={selected === MILESTONES.length - 1}
          className="btn-sketchy font-hand text-sm"
          style={{
            background: YELLOW,
            opacity: selected === MILESTONES.length - 1 ? 0.5 : 1,
          }}
        >
          Later →
        </button>
      </div>

      <style>{`
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2 – Three Big Eras (visual)                                    */
/* ------------------------------------------------------------------ */

const ERAS = [
  {
    name: "The Dream Era",
    range: "1943–1980",
    color: SKY,
    icon: "🌱",
    points: [
      "Scientists imagined thinking machines",
      "First neuron model on paper (1943)",
      "Perceptron built (1958)",
      "Reality hit: too little compute, too little data",
    ],
    summary: "Big ideas, tiny machines. The seeds were planted but couldn't grow yet.",
  },
  {
    name: "The Slow Climb",
    range: "1980–2010",
    color: MINT,
    icon: "🧗",
    points: [
      "Backpropagation revived neural nets (1986)",
      "Computers got faster every year",
      "Deep Blue beat Kasparov at chess (1997)",
      "Researchers kept the dream alive in quiet labs",
    ],
    summary: "Slow progress, stubborn scientists. The world didn't notice — yet.",
  },
  {
    name: "The Explosion",
    range: "2012–Today",
    color: CORAL,
    icon: "💥",
    points: [
      "AlexNet crushed image recognition (2012)",
      "GPUs made deep learning possible",
      "Transformers changed language forever (2017)",
      "ChatGPT brought AI to everyone (2022)",
    ],
    summary: "Everything changed. AI went from lab curiosity to world-changing tech in just 10 years.",
  },
];

function ErasTab() {
  const [openEra, setOpenEra] = useState(0);

  return (
    <div className="space-y-4">
      <p className="font-hand text-base text-foreground text-center">
        ML history fits into three big eras. Click each to expand.
      </p>

      <div className="space-y-3">
        {ERAS.map((era, i) => {
          const open = openEra === i;
          return (
            <div
              key={era.name}
              className="card-sketchy overflow-hidden"
              style={{ background: open ? era.color + "22" : PAPER }}
            >
              <button
                onClick={() => setOpenEra(open ? -1 : i)}
                className="w-full p-4 flex items-center gap-3 text-left"
              >
                <div
                  className="text-2xl rounded-full border-2 border-foreground flex items-center justify-center shrink-0"
                  style={{ background: era.color, width: 48, height: 48 }}
                >
                  {era.icon}
                </div>
                <div className="flex-1">
                  <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
                    Era {i + 1} &middot; {era.range}
                  </p>
                  <h3 className="font-hand text-xl font-bold text-foreground">
                    {era.name}
                  </h3>
                </div>
                <span className="font-hand text-2xl text-foreground">
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <div className="px-4 pb-4 space-y-3" style={{ animation: "fadeIn 0.3s" }}>
                  <ul className="space-y-1.5 ml-2">
                    {era.points.map((p) => (
                      <li
                        key={p}
                        className="font-hand text-sm text-foreground flex gap-2"
                      >
                        <span style={{ color: era.color }}>●</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div
                    className="card-sketchy p-3"
                    style={{ background: PAPER }}
                  >
                    <p className="font-hand text-sm font-bold text-foreground italic">
                      "{era.summary}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <InfoBox variant="amber">
        Notice the pattern: huge dreams → cold winters → patient scientists → sudden
        explosion. Most big ideas in science follow this same shape.
      </InfoBox>
      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 3 – From Perceptron → GPT (visual chain)                       */
/* ------------------------------------------------------------------ */

const CHAIN = [
  {
    label: "1 Neuron",
    sub: "Perceptron, 1958",
    detail: "Could only tell apart 2 simple groups. Cool but limited.",
    nodes: 1,
    layers: 1,
    color: PEACH,
  },
  {
    label: "Few Neurons",
    sub: "Multi-layer net, 1986",
    detail: "Stack neurons in layers. Now it can solve harder problems.",
    nodes: 6,
    layers: 2,
    color: MINT,
  },
  {
    label: "Deep Network",
    sub: "AlexNet, 2012",
    detail: "8 layers, 60 million weights, trained on a million images. Won everything.",
    nodes: 12,
    layers: 4,
    color: SKY,
  },
  {
    label: "Transformer",
    sub: "GPT family, 2017+",
    detail: "Hundreds of layers, BILLIONS of weights. Reads, writes, codes, talks.",
    nodes: 24,
    layers: 6,
    color: LAVENDER,
  },
];

function ChainTab() {
  const [step, setStep] = useState(0);
  const stage = CHAIN[step];

  // Build node positions
  const W = 360;
  const H = 160;
  const PAD = 30;
  const nodes = useMemo(() => {
    const arr: { x: number; y: number; layer: number }[] = [];
    const perLayer = Math.ceil(stage.nodes / stage.layers);
    for (let l = 0; l < stage.layers; l++) {
      const x = PAD + (l * (W - PAD * 2)) / Math.max(1, stage.layers - 1 || 1);
      const count = l === stage.layers - 1
        ? stage.nodes - perLayer * (stage.layers - 1)
        : perLayer;
      const actualCount = Math.max(1, count);
      for (let n = 0; n < actualCount; n++) {
        const y =
          PAD +
          ((n + 0.5) * (H - PAD * 2)) /
            actualCount -
          (H - PAD * 2) / (actualCount * 2) +
          ((H - PAD * 2) / actualCount) * 0.5;
        arr.push({ x, y, layer: l });
      }
    }
    return arr;
  }, [stage]);

  return (
    <div className="space-y-5">
      <p className="font-hand text-base text-foreground text-center">
        Watch how neural networks grew from{" "}
        <b>1 neuron</b> to <b>billions</b>.
      </p>

      {/* Step buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {CHAIN.map((c, i) => (
          <button
            key={c.label}
            onClick={() => setStep(i)}
            className="px-3 py-1.5 rounded-lg border-2 font-hand text-xs font-bold transition-all"
            style={{
              background: step === i ? c.color : PAPER,
              borderColor: INK,
              boxShadow: step === i ? "2px 2px 0 #2b2a35" : "none",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Network visualization */}
      <div
        className="card-sketchy p-4 flex justify-center"
        style={{ background: stage.color + "22" }}
      >
        <svg width={W} height={H}>
          {/* Connections */}
          {nodes.map((n, i) =>
            nodes.map((m, j) => {
              if (m.layer !== n.layer + 1) return null;
              return (
                <line
                  key={`${i}-${j}`}
                  x1={n.x}
                  y1={n.y}
                  x2={m.x}
                  y2={m.y}
                  stroke={INK}
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })
          )}
          {/* Nodes */}
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r="8"
              fill={stage.color}
              stroke={INK}
              strokeWidth="2"
              style={{
                animation: `popIn 0.4s ease-out ${i * 0.04}s both`,
              }}
            />
          ))}
        </svg>
      </div>

      {/* Stats card */}
      <div
        key={step}
        className="card-sketchy p-4 space-y-2"
        style={{ background: PAPER, animation: "fadeInSlide 0.4s ease-out" }}
      >
        <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
          {stage.sub}
        </p>
        <h3 className="font-hand text-2xl font-bold text-foreground">{stage.label}</h3>
        <p className="font-hand text-sm text-foreground">{stage.detail}</p>
      </div>

      <InfoBox variant="blue">
        The math behind one neuron and a billion neurons is the SAME. The only
        difference? More neurons, more layers, more data, more compute.
      </InfoBox>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; transform-origin: center; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInSlide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 4 – Your place in the story                                    */
/* ------------------------------------------------------------------ */

function FutureTab() {
  const [claimed, setClaimed] = useState(false);
  const studentName = "John";
  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">
      <div
        className="card-sketchy p-5 text-center space-y-3"
        style={{ background: YELLOW + "33" }}
      >
        <Trophy className="w-10 h-10 mx-auto text-foreground" />
        <h3 className="font-hand text-2xl font-bold text-foreground">
          You're Part of the Story Now
        </h3>
        <p className="font-hand text-base text-foreground">
          You just learned what took scientists 80 years to figure out: how
          machines spot patterns, learn from data, and make decisions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            year: "1958",
            text: "Rosenblatt built the first perceptron — a single neuron.",
            color: PEACH,
          },
          {
            year: "1986",
            text: "Backprop made it possible to train multi-layer nets.",
            color: MINT,
          },
          {
            year: "2012",
            text: "AlexNet showed deep learning was the future.",
            color: SKY,
          },
          {
            year: "2022",
            text: "ChatGPT made AI useful for everyone.",
            color: LAVENDER,
          },
          {
            year: "Today",
            text: "You finished 30 lessons on how it all works.",
            color: CORAL,
          },
          {
            year: "Tomorrow",
            text: "What you build is the next chapter.",
            color: YELLOW,
          },
        ].map((c) => (
          <div
            key={c.year}
            className="card-sketchy p-3"
            style={{ background: c.color + "22" }}
          >
            <p className="font-hand text-xs uppercase tracking-wider font-bold text-muted-foreground">
              {c.year}
            </p>
            <p className="font-hand text-sm text-foreground mt-1">{c.text}</p>
          </div>
        ))}
      </div>

      <InfoBox variant="amber">
        Every researcher you read about today started exactly where you are now —
        curious, learning, asking 'how does this work?'. Keep going.
      </InfoBox>

      {/* ---------- Certificate ---------- */}
      {!claimed ? (
        <div className="text-center">
          <button
            onClick={() => setClaimed(true)}
            className="btn-sketchy font-hand text-base"
            style={{ background: YELLOW }}
          >
            <Trophy className="w-5 h-5" />
            Claim Your Certificate
          </button>
        </div>
      ) : (
        <div
          className="card-sketchy p-6 relative overflow-hidden"
          style={{
            background: `repeating-linear-gradient(45deg, ${PAPER}, ${PAPER} 14px, ${YELLOW}11 14px, ${YELLOW}11 28px)`,
            border: `4px double ${INK}`,
            animation: "fadeInSlide 0.6s ease-out",
          }}
        >
          {/* Corner flourishes */}
          <div className="absolute top-2 left-2 text-2xl">✦</div>
          <div className="absolute top-2 right-2 text-2xl">✦</div>
          <div className="absolute bottom-2 left-2 text-2xl">✦</div>
          <div className="absolute bottom-2 right-2 text-2xl">✦</div>

          <div className="text-center space-y-3 py-2">
            <p
              className="font-hand text-[11px] uppercase tracking-[0.3em] font-bold"
              style={{ color: INK, opacity: 0.6 }}
            >
              Certificate of Completion
            </p>
            <h2
              className="font-hand text-2xl font-bold"
              style={{ color: INK }}
            >
              The Story of Machine Learning
            </h2>
            <div
              className="mx-auto"
              style={{ width: 60, height: 2, background: INK, opacity: 0.3 }}
            />
            <p className="font-hand text-sm" style={{ color: INK }}>
              This certifies that
            </p>
            <p
              className="font-hand text-4xl font-bold pb-1"
              style={{
                color: CORAL,
                borderBottom: `2px dashed ${INK}`,
                display: "inline-block",
                padding: "0 1rem",
              }}
            >
              {studentName}
            </p>
            <p className="font-hand text-sm leading-relaxed max-w-md mx-auto" style={{ color: INK }}>
              has journeyed through 30 lessons covering neurons, gradients,
              clusters, convolutions and 80 years of ML history — and now stands
              at the doorway of building the future of AI.
            </p>

            <div className="flex justify-around items-end pt-4 max-w-md mx-auto">
              <div className="text-center">
                <div
                  className="font-hand text-base font-bold pb-0.5"
                  style={{ color: INK, borderBottom: `1.5px solid ${INK}`, minWidth: 110 }}
                >
                  {today}
                </div>
                <p className="font-hand text-[10px] uppercase tracking-wider mt-1" style={{ color: INK, opacity: 0.6 }}>
                  Date
                </p>
              </div>
              <div className="text-3xl">🏅</div>
              <div className="text-center">
                <div
                  className="font-hand text-base font-bold italic pb-0.5"
                  style={{ color: INK, borderBottom: `1.5px solid ${INK}`, minWidth: 110 }}
                >
                  Aru &amp; Byte
                </div>
                <p className="font-hand text-[10px] uppercase tracking-wider mt-1" style={{ color: INK, opacity: 0.6 }}>
                  Your Guides
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                               */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "Who built the first learning machine, the Perceptron, and in what year?",
    options: [
      "Alan Turing, 1950",
      "Frank Rosenblatt, 1958",
      "Geoffrey Hinton, 1986",
      "Sam Altman, 2022",
    ],
    correctIndex: 1,
    explanation:
      "Frank Rosenblatt built the Perceptron in 1958 — the first machine that could learn from examples instead of being programmed step-by-step.",
  },
  {
    question: "What was the 'AI Winter'?",
    options: [
      "A really cold lab",
      "A time when AI lost funding because perceptrons couldn't solve hard problems",
      "When all AIs froze",
      "A movie about robots",
    ],
    correctIndex: 1,
    explanation:
      "After Minsky and Papert showed perceptrons had limits, funding and interest dried up for years. We call this the AI Winter.",
  },
  {
    question: "What was special about AlexNet in 2012?",
    options: [
      "It was the first computer named Alex",
      "It crushed an image recognition contest using deep learning and GPUs",
      "It beat humans at chess",
      "It wrote poetry",
    ],
    correctIndex: 1,
    explanation:
      "AlexNet won ImageNet by a huge margin, proving deep neural networks (with GPU training) were the future. It started the modern AI boom.",
  },
  {
    question: "Modern chatbots like ChatGPT and Claude are built on what kind of architecture?",
    options: ["Perceptron", "Decision Tree", "Transformer", "K-Means"],
    correctIndex: 2,
    explanation:
      "The Transformer, introduced in 2017 in 'Attention Is All You Need', is the foundation of every modern large language model.",
  },
  {
    question: "What is the BIG lesson from 80 years of ML history?",
    options: [
      "AI will replace humans tomorrow",
      "Big breakthroughs take patience, more data, more compute, and stubborn scientists",
      "Computers can't really learn",
      "Only geniuses can do AI",
    ],
    correctIndex: 1,
    explanation:
      "The same ideas from the 1950s only worked once we had enough data and compute. Patience + persistence + better tools = progress.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */

export default function L30_HistoryActivity() {
  const tabs = useMemo(
    () => [
      {
        id: "timeline",
        label: "Interactive Timeline",
        icon: <Clock className="w-4 h-4" />,
        content: <TimelineTab />,
      },
      {
        id: "eras",
        label: "Three Big Eras",
        icon: <Milestone className="w-4 h-4" />,
        content: <ErasTab />,
      },
      {
        id: "chain",
        label: "Perceptron → GPT",
        icon: <Sparkles className="w-4 h-4" />,
        content: <ChainTab />,
      },
      {
        id: "future",
        label: "Your Place",
        icon: <Trophy className="w-4 h-4" />,
        content: <FutureTab />,
      },
    ],
    []
  );

  return (
    <LessonShell
      title="The Story of Machine Learning"
      level={8}
      lessonNumber={30}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've reached the end — but really, this is just the beginning. Keep tinkering, keep building, keep asking questions. The next breakthrough might be yours."
      story={
        <StorySection
          paragraphs={[
            "Aru leaned back, looking at all the lessons she'd finished. 30 of them. Neurons, gradients, clusters, convolutions — all of it.",
            "Aru: \"Byte... how did people even figure all this out? Did one person just invent it?\"",
            "Byte: \"Ha! No way. ML has an 80-year story — full of dreams, failures, frozen winters, and sudden explosions. The first 'learning machine' was built before your grandparents were born.\"",
            "Aru: \"Wait, REALLY? Show me!\"",
            "Byte: \"Buckle up. We're going on a 2-minute trip through the entire history of machine learning — from 1943 to today. And by the end, you'll see why YOU are part of this story.\"",
          ]}
          conceptTitle="The Journey"
          conceptSummary="Machine learning didn't appear overnight. It took 80 years, dozens of brilliant minds, two 'AI Winters', and a few magical breakthroughs to get from a single artificial neuron to ChatGPT. Understanding this history helps you understand where AI is going next."
        />
      }
    />
  );
}
