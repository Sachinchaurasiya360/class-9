"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Hand, Camera, Pause, Play, RotateCcw, Palette, Hash } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { useWebcam } from "../../hooks/useWebcam";
import { getFileset, loadVisionModule, MODEL_URLS, HAND_CONNECTIONS } from "../../utils/mediapipe";
import { playClick, playPop } from "../../utils/sounds";

const THEMES = [
  { name: "Coral", node: "#ff6b6b", glow: "#ff8a8a", line: "#ffd93d" },
  { name: "Mint", node: "#4ecdc4", glow: "#7ee0d8", line: "#ffd93d" },
  { name: "Lavender", node: "#b18cf2", glow: "#c9adf7", line: "#ffd93d" },
  { name: "Sky", node: "#6bb6ff", glow: "#94caff", line: "#ffd93d" },
];
const INK = "#2b2a35";

interface Landmark { x: number; y: number; z: number }
interface HandResult {
  landmarks: Landmark[][];
  handedness: string[];
  fingerCount: number;
}

/** Heuristic finger counter (works in mirrored selfie view). */
function countFingers(lm: Landmark[], hand: "Left" | "Right"): number {
  if (lm.length < 21) return 0;
  let count = 0;
  // Index, middle, ring, pinky: tip y < pip y → extended
  const tips = [8, 12, 16, 20];
  const pips = [6, 10, 14, 18];
  for (let i = 0; i < tips.length; i++) {
    if (lm[tips[i]].y < lm[pips[i]].y) count++;
  }
  // Thumb: compare x of tip vs ip joint based on handedness
  if (hand === "Right") {
    if (lm[4].x < lm[3].x) count++;
  } else {
    if (lm[4].x > lm[3].x) count++;
  }
  return count;
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Live Hand Tracking                                          */
/* ------------------------------------------------------------------ */

function LiveHandTab() {
  const { videoRef, status, error, start, stop } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(-1);
  const [themeIdx, setThemeIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [result, setResult] = useState<HandResult>({ landmarks: [], handedness: [], fingerCount: 0 });
  const [paused, setPaused] = useState(false);

  const theme = THEMES[themeIdx];

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (landmarkerRef.current?.close) landmarkerRef.current.close();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureLandmarker = useCallback(async () => {
    if (landmarkerRef.current) return landmarkerRef.current;
    setLoading(true);
    try {
      const [vision, fileset] = await Promise.all([loadVisionModule(), getFileset()]);
      const lm = await vision.HandLandmarker.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URLS.handLandmarker, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 2,
      });
      landmarkerRef.current = lm;
      return lm;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load model");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const drawLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const lm = landmarkerRef.current;
    if (!video || !canvas || !lm || video.readyState < 2) {
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
        const res = lm.detectForVideo(video, ts);
        const landmarks: Landmark[][] = res.landmarks ?? [];
        const handednessArr: string[] =
          (res.handednesses ?? []).map((h: any[]) => h?.[0]?.categoryName ?? "Right");

        // Draw connections
        ctx.lineWidth = 4;
        ctx.strokeStyle = theme.line;
        ctx.shadowColor = theme.glow;
        ctx.shadowBlur = 6;
        landmarks.forEach((handLm) => {
          HAND_CONNECTIONS.forEach(([a, b]) => {
            const pa = handLm[a], pb = handLm[b];
            if (!pa || !pb) return;
            ctx.beginPath();
            ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
            ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
            ctx.stroke();
          });
        });
        ctx.shadowBlur = 0;

        // Draw landmark dots
        landmarks.forEach((handLm) => {
          handLm.forEach((p, i) => {
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, i === 0 || i === 4 || i === 8 || i === 12 || i === 16 || i === 20 ? 7 : 5, 0, Math.PI * 2);
            ctx.fillStyle = theme.node;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = INK;
            ctx.stroke();
          });
        });

        let totalFingers = 0;
        landmarks.forEach((handLm, i) => {
          totalFingers += countFingers(handLm, (handednessArr[i] as "Left" | "Right") ?? "Right");
        });

        setResult({ landmarks, handedness: handednessArr, fingerCount: totalFingers });
      } catch {
        // ignore frame errors
      }
    }
    rafRef.current = requestAnimationFrame(drawLoop);
  }, [theme, videoRef]);

  const handleStart = useCallback(async () => {
    playClick();
    try {
      await ensureLandmarker();
      await start();
      setPaused(false);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawLoop);
    } catch { /* errors surfaced via state */ }
  }, [ensureLandmarker, start, drawLoop]);

  const handleStop = useCallback(() => {
    playClick();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stop();
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setResult({ landmarks: [], handedness: [], fingerCount: 0 });
  }, [stop]);

  const handlePause = useCallback(() => {
    playClick();
    if (paused) {
      setPaused(false);
      rafRef.current = requestAnimationFrame(drawLoop);
    } else {
      setPaused(true);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [paused, drawLoop]);

  const isLive = status === "running";

  return (
    <div className="space-y-5">
      {/* Theme + status */}
      <div className="card-sketchy p-3 flex flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-foreground/60" />
          <span className="font-hand text-sm font-bold">Skeleton color:</span>
          <div className="flex gap-1.5">
            {THEMES.map((t, i) => (
              <button
                key={t.name}
                onClick={() => { playClick(); setThemeIdx(i); }}
                title={t.name}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
                style={{ background: t.node }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Camera stage */}
      <div className="card-sketchy p-4 space-y-4">
        <div className="relative mx-auto w-full max-w-[640px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-foreground bg-[#1a1a22]">
          {/* mirror via CSS so the user feels natural */}
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
            playsInline muted
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
          />

          {/* Idle / loading / error overlay */}
          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a22]/85 text-white text-center p-4">
              <Hand className="w-10 h-10" style={{ color: theme.node }} />
              {loading && <p className="font-hand text-sm">Loading hand model from Google CDN...</p>}
              {loadError && <p className="font-hand text-sm text-accent-coral">⚠ {loadError}</p>}
              {error && <p className="font-hand text-sm text-accent-coral">⚠ {error}</p>}
              {!loading && !loadError && !error && (
                <p className="font-hand text-sm">Click <span className="marker-highlight-yellow">Start Camera</span> to track your hands live.</p>
              )}
            </div>
          )}

          {/* Live overlay HUD */}
          {isLive && (
            <div className="absolute top-2 left-2 flex items-center gap-2 px-2 py-1 rounded-lg bg-black/55 border-2 border-foreground font-hand text-xs text-white">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-coral animate-pulse" />
              LIVE · {result.landmarks.length} hand{result.landmarks.length === 1 ? "" : "s"}
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/60 border-2 border-foreground font-hand text-base font-bold text-white">
              <Hash className="w-4 h-4" style={{ color: theme.line }} />
              {result.fingerCount}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 flex-wrap">
          {!isLive ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 transition-transform"
              style={{ background: theme.node, color: "#fff" }}
            >
              <Camera className="w-4 h-4" />
              {loading ? "Loading..." : "Start Camera"}
            </button>
          ) : (
            <>
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
              >
                {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={handleStop}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-background hover:bg-accent-coral/30 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Stop
              </button>
            </>
          )}
        </div>

        {/* Landmark stats */}
        {isLive && result.landmarks.length > 0 && (
          <div className="text-center font-hand text-sm">
            {result.handedness.map((h, i) => (
              <span key={i} className="mr-3">
                {h === "Right" ? "🤚" : "✋"}{" "}
                <span className="marker-highlight-mint font-bold">{h}</span>
                {" · "}
                <span className="marker-highlight-yellow font-bold">21 landmarks</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          🖐️ MediaPipe finds <b>21 landmark points</b> on each hand: 4 per finger + 1 for the wrist. The colored lines connect them into a skeleton — that's how a computer "sees" the shape of your hand.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Anatomy of 21 Landmarks                                     */
/* ------------------------------------------------------------------ */

const LANDMARK_POSITIONS: { id: number; x: number; y: number; label: string }[] = [
  { id: 0, x: 200, y: 360, label: "wrist" },
  // Thumb
  { id: 1, x: 145, y: 320, label: "thumb CMC" },
  { id: 2, x: 110, y: 270, label: "thumb MCP" },
  { id: 3, x: 85, y: 220, label: "thumb IP" },
  { id: 4, x: 70, y: 170, label: "thumb tip" },
  // Index
  { id: 5, x: 165, y: 240, label: "index MCP" },
  { id: 6, x: 160, y: 180, label: "index PIP" },
  { id: 7, x: 158, y: 130, label: "index DIP" },
  { id: 8, x: 156, y: 80, label: "index tip" },
  // Middle
  { id: 9, x: 200, y: 230, label: "middle MCP" },
  { id: 10, x: 200, y: 165, label: "middle PIP" },
  { id: 11, x: 200, y: 105, label: "middle DIP" },
  { id: 12, x: 200, y: 50, label: "middle tip" },
  // Ring
  { id: 13, x: 235, y: 240, label: "ring MCP" },
  { id: 14, x: 240, y: 180, label: "ring PIP" },
  { id: 15, x: 244, y: 125, label: "ring DIP" },
  { id: 16, x: 248, y: 75, label: "ring tip" },
  // Pinky
  { id: 17, x: 270, y: 260, label: "pinky MCP" },
  { id: 18, x: 285, y: 215, label: "pinky PIP" },
  { id: 19, x: 295, y: 175, label: "pinky DIP" },
  { id: 20, x: 305, y: 135, label: "pinky tip" },
];

function LandmarkAnatomyTab() {
  const [hover, setHover] = useState<number | null>(null);
  const [themeIdx, setThemeIdx] = useState(0);
  const theme = THEMES[themeIdx];

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-3 flex items-center justify-center gap-2">
        <Palette className="w-4 h-4 text-foreground/60" />
        <span className="font-hand text-sm font-bold">Color:</span>
        <div className="flex gap-1.5">
          {THEMES.map((t, i) => (
            <button
              key={t.name}
              onClick={() => { playClick(); setThemeIdx(i); }}
              className={`w-6 h-6 rounded-full border-2 transition-transform ${themeIdx === i ? "scale-125 border-foreground" : "border-foreground/30"}`}
              style={{ background: t.node }}
            />
          ))}
        </div>
      </div>

      <div className="card-sketchy p-4 notebook-grid">
        <div className="flex justify-center">
          <svg viewBox="0 0 400 420" className="w-full max-w-[440px]">
            {/* Connections */}
            {HAND_CONNECTIONS.map(([a, b], i) => {
              const pa = LANDMARK_POSITIONS[a];
              const pb = LANDMARK_POSITIONS[b];
              return (
                <line
                  key={i}
                  x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y}
                  stroke={theme.line} strokeWidth={4} strokeLinecap="round"
                  opacity={0.85}
                />
              );
            })}
            {/* Landmarks */}
            {LANDMARK_POSITIONS.map((p) => {
              const isTip = p.id === 4 || p.id === 8 || p.id === 12 || p.id === 16 || p.id === 20;
              const r = isTip ? 11 : 8;
              return (
                <g
                  key={p.id}
                  onMouseEnter={() => { playPop(); setHover(p.id); }}
                  onMouseLeave={() => setHover((h) => (h === p.id ? null : h))}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx={p.x} cy={p.y} r={r}
                    fill={hover === p.id ? theme.glow : theme.node}
                    stroke={INK} strokeWidth={2}
                    className={hover === p.id ? "pulse-glow" : ""}
                    style={hover === p.id ? { color: theme.node } : undefined}
                  />
                  <text
                    x={p.x} y={p.y + 3} textAnchor="middle"
                    fontFamily="Kalam" fontWeight="bold" fontSize={10}
                    fill="#fff"
                  >
                    {p.id}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="text-center font-hand text-sm mt-2">
          {hover !== null ? (
            <span>
              Point <span className="marker-highlight-yellow font-bold">#{hover}</span> ={" "}
              <span className="marker-highlight-mint font-bold">{LANDMARK_POSITIONS[hover].label}</span>
            </span>
          ) : (
            <span className="text-muted-foreground">Hover any dot to see what it represents.</span>
          )}
        </div>
      </div>

      <InfoBox variant="amber">
        <span className="font-hand text-base">
          🧠 Each landmark is just an (x, y, z) coordinate in space. From these 21 numbers per hand, the computer can tell whether you're pointing, waving, or making a fist — all using simple geometry!
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
    question: "How many landmark points does MediaPipe place on each hand?",
    options: ["10", "15", "21", "33"],
    correctIndex: 2,
    explanation: "MediaPipe Hands marks 21 keypoints per hand: 4 joints per finger × 5 fingers + 1 wrist.",
  },
  {
    question: "What does each landmark contain?",
    options: ["A color", "An (x, y, z) coordinate", "A finger name", "An emoji"],
    correctIndex: 1,
    explanation: "Each landmark is a 3D coordinate (x, y are normalized to the image; z is depth relative to the wrist).",
  },
  {
    question: "Why is the camera image mirrored on screen?",
    options: [
      "MediaPipe requires it",
      "Because the model is upside down",
      "So your movements feel natural — like a mirror",
      "It runs faster mirrored",
    ],
    correctIndex: 2,
    explanation: "Mirroring is purely a UX choice — the underlying model works on any orientation.",
  },
  {
    question: "Where does the model run?",
    options: [
      "On Google's servers",
      "On your own device, in the browser",
      "On a special phone chip only",
      "It doesn't actually run",
    ],
    correctIndex: 1,
    explanation: "MediaPipe Tasks Vision runs entirely in the browser via WebAssembly + WebGL — no data leaves your device.",
  },
];

/* ------------------------------------------------------------------ */
/*  Main export                                                         */
/* ------------------------------------------------------------------ */

export default function HandTrackingActivity() {
  const tabs = useMemo(
    () => [
      { id: "live", label: "Live Hand Tracking", icon: <Hand className="w-4 h-4" />, content: <LiveHandTab /> },
      { id: "anatomy", label: "21 Landmarks", icon: <Hash className="w-4 h-4" />, content: <LandmarkAnatomyTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Hand Tracking with MediaPipe"
      level={9}
      lessonNumber={1}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Now that the computer can SEE your hand, can it understand what you're doing? Next: gesture recognition!"
      story={
        <StorySection
          paragraphs={[
            "Aru waved at the screen. Nothing happened.",
            "Byte: \"For the computer to wave back, it first has to see your hand. Not just the pixels — the actual shape of your fingers.\"",
            "Aru: \"How does it do that?\"",
            "Byte: \"Google built a tiny model called MediaPipe Hands. It looks at every video frame and finds 21 special points — your wrist, your knuckles, your fingertips. Then we connect them like a stick figure!\"",
            "Aru: \"And then?\"",
            "Byte: \"Then we can count fingers, recognize gestures, even build games where you control characters with your hands. All in your browser. No app to install.\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="MediaPipe Hands is a tiny ML model from Google that finds 21 landmarks (keypoints) on each hand from a webcam frame, in real time, right inside your browser. Once you have the landmarks, you can build anything — finger counters, gesture controls, sign-language readers, and AR effects."
        />
      }
    />
  );
}
