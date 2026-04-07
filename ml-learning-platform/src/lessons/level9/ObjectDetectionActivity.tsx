import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Camera, RotateCcw, Eye, BarChart3 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { useWebcam } from "../../hooks/useWebcam";
import { getFileset, loadVisionModule, MODEL_URLS } from "../../utils/mediapipe";
import { playClick } from "../../utils/sounds";

const INK = "#2b2a35";

const PALETTE = ["#ff6b6b", "#4ecdc4", "#ffd93d", "#b18cf2", "#6bb6ff", "#ffb88c", "#7ee0d8", "#ff8a8a"];

interface Detection {
  category: string;
  score: number;
  box: { x: number; y: number; w: number; h: number }; // normalized 0..1
}

function colorFor(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(h) % PALETTE.length];
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Live Object Detection                                        */
/* ------------------------------------------------------------------ */

function LiveDetectionTab() {
  const { videoRef, status, error, start, stop } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(-1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [threshold, setThreshold] = useState(0.5);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (detectorRef.current?.close) detectorRef.current.close();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureDetector = useCallback(async (thr: number) => {
    if (detectorRef.current?.close) detectorRef.current.close();
    setLoading(true);
    try {
      const [vision, fileset] = await Promise.all([loadVisionModule(), getFileset()]);
      const d = await vision.ObjectDetector.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URLS.objectDetector, delegate: "GPU" },
        runningMode: "VIDEO",
        scoreThreshold: thr,
        maxResults: 6,
      });
      detectorRef.current = d;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load detector");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const drawLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const det = detectorRef.current;
    if (!video || !canvas || !det || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(drawLoop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const ts = performance.now();
    if (ts !== lastTsRef.current) {
      lastTsRef.current = ts;
      try {
        const res = det.detectForVideo(video, ts);
        const ds: Detection[] = (res.detections ?? []).map((d: any) => {
          const bb = d.boundingBox;
          const cat = d.categories?.[0];
          return {
            category: cat?.categoryName ?? "object",
            score: cat?.score ?? 0,
            box: {
              x: bb.originX / canvas.width,
              y: bb.originY / canvas.height,
              w: bb.width / canvas.width,
              h: bb.height / canvas.height,
            },
          };
        });

        // Mirror x for display because the canvas is CSS-flipped
        ds.forEach((d) => {
          const x = d.box.x * canvas.width;
          const y = d.box.y * canvas.height;
          const w = d.box.w * canvas.width;
          const h = d.box.h * canvas.height;
          const color = colorFor(d.category);

          ctx.lineWidth = 4;
          ctx.strokeStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          // Sketchy double-stroke box
          ctx.strokeRect(x, y, w, h);
          ctx.shadowBlur = 0;
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = INK;
          ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);

          // Label background — drawn flipped so the text reads correctly
          // since the whole canvas is CSS scale-x(-1)
          const label = `${d.category} ${(d.score * 100).toFixed(0)}%`;
          ctx.font = "bold 16px Kalam, sans-serif";
          const textWidth = ctx.measureText(label).width + 12;
          // Save and unflip for text so labels aren't mirrored
          ctx.save();
          ctx.translate(x + w, y);
          ctx.scale(-1, 1);
          ctx.fillStyle = color;
          ctx.fillRect(0, -22, textWidth, 22);
          ctx.strokeStyle = INK;
          ctx.lineWidth = 2;
          ctx.strokeRect(0, -22, textWidth, 22);
          ctx.fillStyle = INK;
          ctx.fillText(label, 6, -6);
          ctx.restore();
        });

        setDetections(ds);
        setCounts((prev) => {
          const next = { ...prev };
          ds.forEach((d) => { next[d.category] = (next[d.category] ?? 0) + 1; });
          return next;
        });
      } catch { /* */ }
    }
    rafRef.current = requestAnimationFrame(drawLoop);
  }, [videoRef]);

  const handleStart = useCallback(async () => {
    playClick();
    try {
      await ensureDetector(threshold);
      await start();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawLoop);
    } catch { /* */ }
  }, [ensureDetector, threshold, start, drawLoop]);

  const handleStop = useCallback(() => {
    playClick();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stop();
    setDetections([]);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [stop]);

  const handleResetCounts = useCallback(() => {
    playClick();
    setCounts({});
  }, []);

  const isLive = status === "running";
  const sortedCounts = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <div className="space-y-5">
      {/* Threshold slider */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <span className="font-hand text-sm font-bold">Confidence threshold:</span>
        <input
          type="range" min={0.2} max={0.9} step={0.05} value={threshold}
          onChange={(e) => setThreshold(parseFloat(e.target.value))}
          className="w-40 accent-accent-coral"
          disabled={isLive}
        />
        <span className="font-hand text-xs marker-highlight-yellow font-bold">{(threshold * 100).toFixed(0)}%</span>
        {isLive && <span className="text-xs text-muted-foreground font-hand">(stop camera to change)</span>}
      </div>

      <div className="card-sketchy p-4 space-y-4">
        <div className="relative mx-auto w-full max-w-[640px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-foreground bg-[#1a1a22]">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />

          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a22]/85 text-white text-center p-4">
              <Box className="w-10 h-10 text-accent-mint" />
              {loading && <p className="font-hand text-sm">Loading EfficientDet-Lite0 from Google CDN...</p>}
              {loadError && <p className="font-hand text-sm text-accent-coral">⚠ {loadError}</p>}
              {error && <p className="font-hand text-sm text-accent-coral">⚠ {error}</p>}
              {!loading && !loadError && !error && (
                <p className="font-hand text-sm">Point your camera at things — phones, cups, books, pets — and watch them get boxed!</p>
              )}
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/55 border-2 border-foreground font-hand text-xs text-white flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-coral animate-pulse" />
              LIVE · {detections.length} object{detections.length === 1 ? "" : "s"}
            </div>
          )}
        </div>

        {/* Live label list */}
        {isLive && detections.length > 0 && (
          <div className="flex justify-center flex-wrap gap-1.5">
            {detections.map((d, i) => {
              const color = colorFor(d.category);
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-foreground font-hand text-xs font-bold"
                  style={{ background: color, color: INK }}
                >
                  {d.category}
                  <span className="opacity-70">{(d.score * 100).toFixed(0)}%</span>
                </span>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          {!isLive ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-mint text-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 transition-transform"
            >
              <Camera className="w-4 h-4" />
              {loading ? "Loading..." : "Start Camera"}
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-background hover:bg-accent-coral/30 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Stop
            </button>
          )}
          <button
            onClick={handleResetCounts}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-background hover:bg-accent-yellow/40 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Reset Counts
          </button>
        </div>
      </div>

      {/* Per-class counter */}
      {sortedCounts.length > 0 && (
        <div className="card-sketchy p-4">
          <div className="font-hand text-sm font-bold mb-2">Things spotted so far:</div>
          <div className="space-y-1.5">
            {sortedCounts.map(([cat, n]) => {
              const color = colorFor(cat);
              const max = sortedCounts[0][1];
              const pct = (n / max) * 100;
              return (
                <div key={cat} className="flex items-center gap-2">
                  <span className="font-hand text-xs font-bold w-24 truncate">{cat}</span>
                  <div className="flex-1 h-5 border-2 border-foreground rounded-full overflow-hidden bg-background">
                    <div
                      className="h-full transition-all duration-300"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="font-hand text-xs font-bold w-8 text-right">{n}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          📦 Object detection draws a <b>bounding box</b> around each thing it sees and labels it. The model is <b>EfficientDet-Lite0</b> — small enough to run on a phone, trained on the COCO dataset (80 everyday objects).
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  How a Detector Works                                        */
/* ------------------------------------------------------------------ */

function HowItWorksTab() {
  const [step, setStep] = useState(0);
  const steps = [
    {
      title: "1. Image goes in",
      body: "The webcam frame is shrunk to 320×320 pixels and sent to the model.",
      emoji: "📷",
      color: "#4ecdc4",
    },
    {
      title: "2. Backbone extracts features",
      body: "A small CNN finds edges, textures, and shapes — exactly like Level 8's filters, just stacked deep.",
      emoji: "🧱",
      color: "#b18cf2",
    },
    {
      title: "3. Anchor boxes propose regions",
      body: "The model places thousands of candidate boxes at different sizes across the image.",
      emoji: "🎯",
      color: "#ffd93d",
    },
    {
      title: "4. Classify + refine each box",
      body: "For each box, predict: 'is there an object?', 'which class?', and 'tweak the box edges'.",
      emoji: "🏷️",
      color: "#ff6b6b",
    },
    {
      title: "5. Non-max suppression",
      body: "Many boxes overlap on the same object. Keep only the best one per object — everything else is removed.",
      emoji: "✂️",
      color: "#ffb88c",
    },
    {
      title: "6. Final boxes drawn",
      body: "What's left is a clean list: cat at (120,80,200,300) with 92% confidence. Drawn on screen!",
      emoji: "🎉",
      color: "#7ee0d8",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-4 notebook-grid space-y-4">
        <div className="flex justify-center gap-1.5 flex-wrap">
          {steps.map((s, i) => (
            <button
              key={i}
              onClick={() => { playClick(); setStep(i); }}
              className={`w-9 h-9 rounded-full border-2 border-foreground font-hand font-bold transition-all ${step === i ? "scale-110 shadow-[2px_2px_0_#2b2a35]" : "opacity-70"}`}
              style={{ background: s.color, color: INK }}
              title={s.title}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div
          className="rounded-xl border-2 border-foreground p-5 text-center space-y-2 shadow-[3px_3px_0_#2b2a35]"
          style={{ background: steps[step].color }}
        >
          <div className="text-5xl">{steps[step].emoji}</div>
          <h3 className="font-hand text-xl font-bold" style={{ color: INK }}>{steps[step].title}</h3>
          <p className="font-hand text-sm" style={{ color: INK }}>{steps[step].body}</p>
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => { playClick(); setStep((s) => Math.max(0, s - 1)); }}
            disabled={step === 0}
            className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-background disabled:opacity-40"
          >
            ← Prev
          </button>
          <button
            onClick={() => { playClick(); setStep((s) => Math.min(steps.length - 1, s + 1)); }}
            disabled={step === steps.length - 1}
            className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-40 transition-transform"
          >
            Next →
          </button>
        </div>
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🧠 Modern detectors (YOLO, SSD, EfficientDet) all follow this rough recipe. The differences are in <i>how</i> they propose boxes and <i>how fast</i> they classify them.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quiz                                                                */
/* ------------------------------------------------------------------ */

const quizQuestions = [
  {
    question: "What's the difference between image classification and object detection?",
    options: [
      "Classification uses color, detection uses shape",
      "Classification labels the whole image; detection finds and boxes each object",
      "There is no difference",
      "Detection is older",
    ],
    correctIndex: 1,
    explanation: "Classification answers 'what is this image of?'. Detection answers 'where is each thing, and what is it?'. Detection is harder.",
  },
  {
    question: "What is a 'bounding box'?",
    options: [
      "A rectangle around a detected object",
      "The whole image",
      "A crop of the background",
      "A network layer",
    ],
    correctIndex: 0,
    explanation: "A bounding box is the (x, y, width, height) rectangle the model draws around each object it found.",
  },
  {
    question: "Why do we use Non-Max Suppression?",
    options: [
      "To suppress evil networks",
      "To remove duplicate overlapping boxes for the same object",
      "To make the image black and white",
      "To shrink the model",
    ],
    correctIndex: 1,
    explanation: "The model proposes thousands of boxes; many overlap on the same object. NMS keeps only the highest-scoring one per object.",
  },
  {
    question: "EfficientDet-Lite0 is trained on the COCO dataset. How many object classes is that?",
    options: ["10", "80", "1000", "10000"],
    correctIndex: 1,
    explanation: "COCO has 80 common object categories — people, animals, vehicles, food, household items, etc.",
  },
];

export default function ObjectDetectionActivity() {
  const tabs = useMemo(
    () => [
      { id: "live", label: "Live Detection", icon: <Eye className="w-4 h-4" />, content: <LiveDetectionTab /> },
      { id: "how", label: "How It Works", icon: <Box className="w-4 h-4" />, content: <HowItWorksTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Object Detection"
      level={9}
      lessonNumber={3}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="You've now seen how computers can sense the world: hands, gestures, and objects — all in your browser, with no installs."
      story={
        <StorySection
          paragraphs={[
            "Aru held up her water bottle. The screen flashed: 'bottle 94%'. Then her cat walked by. 'cat 88%'. Then her phone. 'cell phone 91%'.",
            "Aru: \"How does it know what they ALL are?\"",
            "Byte: \"It's a network trained on a giant dataset called COCO — 80 common objects, hundreds of thousands of photos, each with rectangles drawn around the things in them.\"",
            "Aru: \"So it learned the shapes?\"",
            "Byte: \"It learned the patterns of pixels that usually mean 'cat-ness' or 'phone-ness'. Then for every new image it asks: is there a cat HERE? a phone HERE? a cup HERE? — and draws a box wherever the answer is yes.\"",
            "Aru: \"And it does this 30 times a second?\"",
            "Byte: \"Yep. Right inside your browser. Welcome to live computer vision.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Object detection finds and labels every object in an image with a bounding box. EfficientDet-Lite0 (the model used here) is small and fast enough to run live in a browser, recognizing 80 common COCO classes — people, animals, vehicles, food, and household objects."
        />
      }
    />
  );
}
