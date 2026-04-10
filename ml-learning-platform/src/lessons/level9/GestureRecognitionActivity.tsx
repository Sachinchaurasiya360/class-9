"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Camera, RotateCcw, Trophy, Hand, Gamepad2 } from "lucide-react";
import LessonShell from "../../components/LessonShell";
import InfoBox from "../../components/InfoBox";
import StorySection from "../../components/StorySection";
import { useWebcam } from "../../hooks/useWebcam";
import { getFileset, loadVisionModule, MODEL_URLS, HAND_CONNECTIONS } from "../../utils/mediapipe";
import { playClick, playSuccess, playPop } from "../../utils/sounds";

const INK = "#2b2a35";

// MediaPipe gesture names → emoji + label
const GESTURE_INFO: Record<string, { emoji: string; label: string; color: string }> = {
  Thumb_Up: { emoji: "👍", label: "Thumbs Up", color: "#4ecdc4" },
  Thumb_Down: { emoji: "👎", label: "Thumbs Down", color: "#ff6b6b" },
  Open_Palm: { emoji: "✋", label: "Open Palm", color: "#ffd93d" },
  Closed_Fist: { emoji: "✊", label: "Closed Fist", color: "#b18cf2" },
  Pointing_Up: { emoji: "☝️", label: "Pointing Up", color: "#6bb6ff" },
  Victory: { emoji: "✌️", label: "Victory", color: "#ff8a8a" },
  ILoveYou: { emoji: "🤟", label: "I Love You", color: "#ffb88c" },
  None: { emoji: "❔", label: "None", color: "#94a3b8" },
};

interface DetectedGesture {
  name: string;
  score: number;
  landmarks: { x: number; y: number }[];
}

/* ------------------------------------------------------------------ */
/*  Tab 1  Live Gesture Recognition                                    */
/* ------------------------------------------------------------------ */

function LiveGestureTab() {
  const { videoRef, status, error, start, stop } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognizerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef(-1);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedGesture | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const lastHistoryGesture = useRef<string>("");

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (recognizerRef.current?.close) recognizerRef.current.close();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ensureRecognizer = useCallback(async () => {
    if (recognizerRef.current) return recognizerRef.current;
    setLoading(true);
    try {
      const [vision, fileset] = await Promise.all([loadVisionModule(), getFileset()]);
      const r = await vision.GestureRecognizer.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URLS.gestureRecognizer, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
      });
      recognizerRef.current = r;
      return r;
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load gesture model");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const drawLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const r = recognizerRef.current;
    if (!video || !canvas || !r || video.readyState < 2) {
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
        const res = r.recognizeForVideo(video, ts);
        const landmarks = res.landmarks?.[0] ?? [];
        const gesture = res.gestures?.[0]?.[0];
        const name = gesture?.categoryName ?? "None";
        const score = gesture?.score ?? 0;
        const info = GESTURE_INFO[name] ?? GESTURE_INFO.None;

        // Draw skeleton
        if (landmarks.length) {
          ctx.lineWidth = 4;
          ctx.strokeStyle = info.color;
          ctx.shadowColor = info.color;
          ctx.shadowBlur = 8;
          HAND_CONNECTIONS.forEach(([a, b]) => {
            const pa = landmarks[a], pb = landmarks[b];
            if (!pa || !pb) return;
            ctx.beginPath();
            ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
            ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
            ctx.stroke();
          });
          ctx.shadowBlur = 0;

          landmarks.forEach((p: any) => {
            ctx.beginPath();
            ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = INK;
            ctx.stroke();
          });
        }

        if (landmarks.length) {
          setDetected({ name, score, landmarks: landmarks.map((p: any) => ({ x: p.x, y: p.y })) });
          if (name !== "None" && name !== lastHistoryGesture.current && score > 0.6) {
            lastHistoryGesture.current = name;
            setHistory((h) => [...h, name].slice(-12));
          }
        } else {
          setDetected(null);
        }
      } catch { /* ignore */ }
    }
    rafRef.current = requestAnimationFrame(drawLoop);
  }, [videoRef]);

  const handleStart = useCallback(async () => {
    playClick();
    try {
      await ensureRecognizer();
      await start();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(drawLoop);
    } catch { /* surfaced */ }
  }, [ensureRecognizer, start, drawLoop]);

  const handleStop = useCallback(() => {
    playClick();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stop();
    setDetected(null);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx && canvasRef.current) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  }, [stop]);

  const isLive = status === "running";
  const info = detected ? GESTURE_INFO[detected.name] ?? GESTURE_INFO.None : GESTURE_INFO.None;

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-4 space-y-4">
        <div className="relative mx-auto w-full max-w-[640px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-foreground bg-[#1a1a22]">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />

          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a22]/85 text-white text-center p-4">
              <Sparkles className="w-10 h-10 text-accent-yellow" />
              {loading && <p className="font-hand text-sm">Loading gesture model from Google CDN...</p>}
              {loadError && <p className="font-hand text-sm text-accent-coral">⚠ {loadError}</p>}
              {error && <p className="font-hand text-sm text-accent-coral">⚠ {error}</p>}
              {!loading && !loadError && !error && (
                <p className="font-hand text-sm">Try ✋ ✊ 👍 👎 ✌️ ☝️ 🤟 in front of the camera!</p>
              )}
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-black/55 border-2 border-foreground font-hand text-xs text-white flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-accent-coral animate-pulse" />
              LIVE
            </div>
          )}

          {/* Big gesture chip */}
          {isLive && detected && (
            <div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl border-2 border-foreground shadow-[3px_3px_0_#2b2a35] font-hand font-bold flex items-center gap-2"
              style={{ background: info.color, color: INK }}
            >
              <span className="text-2xl">{info.emoji}</span>
              <span className="text-base">{info.label}</span>
              <span className="text-xs opacity-80">{(detected.score * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        {/* Confidence bar */}
        {isLive && detected && (
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <span className="font-hand text-xs font-bold w-20 text-right">confidence</span>
              <div className="flex-1 h-5 border-2 border-foreground rounded-full overflow-hidden bg-background">
                <div
                  className="h-full transition-all duration-200"
                  style={{ width: `${detected.score * 100}%`, background: info.color }}
                />
              </div>
              <span className="font-hand text-xs w-10">{(detected.score * 100).toFixed(0)}%</span>
            </div>
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
        </div>

        {/* History strip */}
        {history.length > 0 && (
          <div className="text-center">
            <div className="font-hand text-xs text-muted-foreground mb-1">Recent gestures</div>
            <div className="flex justify-center flex-wrap gap-1">
              {history.map((g, i) => {
                const inf = GESTURE_INFO[g] ?? GESTURE_INFO.None;
                return (
                  <span
                    key={i}
                    title={inf.label}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-foreground text-base"
                    style={{ background: inf.color }}
                  >
                    {inf.emoji}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <InfoBox variant="blue">
        <span className="font-hand text-base">
          ✨ Behind the scenes: MediaPipe first finds the <b>21 hand landmarks</b>, then a small classifier looks at their geometric arrangement and predicts which of 7 known gestures you're making.
        </span>
      </InfoBox>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tab 2  Simon Says (mini-game)                                      */
/* ------------------------------------------------------------------ */

const SIMON_TARGETS = ["Thumb_Up", "Open_Palm", "Closed_Fist", "Victory", "Pointing_Up", "ILoveYou"];

function SimonSaysTab() {
  const { videoRef, status, error, start, stop } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognizerRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [target, setTarget] = useState<string>(SIMON_TARGETS[0]);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [matchedAt, setMatchedAt] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (recognizerRef.current?.close) recognizerRef.current.close();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickNext = useCallback(() => {
    setTarget((cur) => {
      let next = cur;
      while (next === cur) next = SIMON_TARGETS[Math.floor(Math.random() * SIMON_TARGETS.length)];
      return next;
    });
    setRound((r) => r + 1);
  }, []);

  const ensure = useCallback(async () => {
    if (recognizerRef.current) return;
    setLoading(true);
    try {
      const [vision, fileset] = await Promise.all([loadVisionModule(), getFileset()]);
      recognizerRef.current = await vision.GestureRecognizer.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URLS.gestureRecognizer, delegate: "GPU" },
        runningMode: "VIDEO",
        numHands: 1,
      });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load");
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const loop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const r = recognizerRef.current;
    if (!video || !canvas || !r || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(loop);
      return;
    }
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      const res = r.recognizeForVideo(video, performance.now());
      const lms = res.landmarks?.[0] ?? [];
      const top = res.gestures?.[0]?.[0];
      const targetInfo = GESTURE_INFO[target];

      if (lms.length) {
        ctx.lineWidth = 4;
        ctx.strokeStyle = targetInfo.color;
        ctx.shadowColor = targetInfo.color;
        ctx.shadowBlur = 8;
        HAND_CONNECTIONS.forEach(([a, b]) => {
          const pa = lms[a], pb = lms[b];
          if (!pa || !pb) return;
          ctx.beginPath();
          ctx.moveTo(pa.x * canvas.width, pa.y * canvas.height);
          ctx.lineTo(pb.x * canvas.width, pb.y * canvas.height);
          ctx.stroke();
        });
        ctx.shadowBlur = 0;
      }

      if (top && top.categoryName === target && top.score > 0.7 && performance.now() - matchedAt > 900) {
        setMatchedAt(performance.now());
        setScore((s) => s + 1);
        setStreak((s) => s + 1);
        playSuccess();
        pickNext();
      }
    } catch { /* */ }
    rafRef.current = requestAnimationFrame(loop);
  }, [target, matchedAt, pickNext, videoRef]);

  const handleStart = useCallback(async () => {
    playClick();
    try {
      await ensure();
      await start();
      setScore(0);
      setRound(1);
      setStreak(0);
      pickNext();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(loop);
    } catch { /* */ }
  }, [ensure, start, loop, pickNext]);

  const handleStop = useCallback(() => {
    playClick();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    stop();
  }, [stop]);

  const handleSkip = useCallback(() => {
    playPop();
    setStreak(0);
    pickNext();
  }, [pickNext]);

  const isLive = status === "running";
  const targetInfo = GESTURE_INFO[target];

  return (
    <div className="space-y-5">
      <div className="card-sketchy p-4 space-y-4">
        {/* Target prompt */}
        {isLive && (
          <div className="flex justify-center">
            <div
              className="px-4 py-2 rounded-xl border-2 border-foreground shadow-[3px_3px_0_#2b2a35] font-hand font-bold flex items-center gap-2"
              style={{ background: targetInfo.color, color: INK }}
            >
              <span className="text-sm">Show me:</span>
              <span className="text-3xl">{targetInfo.emoji}</span>
              <span className="text-base">{targetInfo.label}</span>
            </div>
          </div>
        )}

        <div className="relative mx-auto w-full max-w-[600px] aspect-[4/3] rounded-xl overflow-hidden border-2 border-foreground bg-[#1a1a22]">
          <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover scale-x-[-1]" playsInline muted />
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]" />

          {!isLive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#1a1a22]/85 text-white text-center p-4">
              <Gamepad2 className="w-10 h-10 text-accent-mint" />
              {loading && <p className="font-hand text-sm">Loading...</p>}
              {loadError && <p className="font-hand text-sm text-accent-coral">⚠ {loadError}</p>}
              {error && <p className="font-hand text-sm text-accent-coral">⚠ {error}</p>}
              {!loading && !loadError && !error && (
                <p className="font-hand text-sm">Make the requested gesture as fast as you can!</p>
              )}
            </div>
          )}

          {isLive && (
            <div className="absolute top-2 right-2 px-3 py-1 rounded-lg bg-black/60 border-2 border-foreground font-hand text-sm font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-accent-yellow" />
              {score}
            </div>
          )}
          {isLive && streak >= 3 && (
            <div className="absolute top-2 left-2 px-3 py-1 rounded-lg bg-accent-yellow border-2 border-foreground font-hand text-xs font-bold text-foreground">
              🔥 {streak} streak
            </div>
          )}
        </div>

        <div className="flex justify-center gap-3 flex-wrap">
          {!isLive ? (
            <button
              onClick={handleStart}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-mint text-foreground shadow-[2px_2px_0_#2b2a35] hover:translate-y-px disabled:opacity-50 transition-transform"
            >
              <Camera className="w-4 h-4" />
              {loading ? "Loading..." : "Start Game"}
            </button>
          ) : (
            <>
              <button
                onClick={handleSkip}
                className="px-4 py-2 rounded-lg font-hand font-bold border-2 border-foreground bg-accent-yellow shadow-[2px_2px_0_#2b2a35] hover:translate-y-px transition-transform"
              >
                Skip ⏭
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

        {isLive && (
          <div className="text-center font-hand text-sm">
            Round <span className="marker-highlight-mint font-bold">{round}</span>
            <span className="mx-2">·</span>
            Score <span className="marker-highlight-yellow font-bold">{score}</span>
          </div>
        )}
      </div>

      <InfoBox variant="green">
        <span className="font-hand text-base">
          🎮 This is the foundation of <b>gesture-controlled UIs</b>: TVs that change channels with a wave, cars that adjust volume with a twist, and accessibility tools for people who can't use a mouse or touchscreen.
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
    question: "How does MediaPipe decide which gesture you're making?",
    options: [
      "It guesses randomly",
      "It first finds 21 hand landmarks, then classifies their arrangement",
      "It compares your hand to a photo database",
      "It asks you to type the gesture name",
    ],
    correctIndex: 1,
    explanation: "MediaPipe runs a hand-landmark model first, then a small classifier looks at the geometry of those 21 points to predict the gesture.",
  },
  {
    question: "What does a confidence score of 0.92 mean?",
    options: [
      "92 frames per second",
      "92% sure that's the gesture",
      "9 out of 2 hands seen",
      "92 landmarks detected",
    ],
    correctIndex: 1,
    explanation: "Confidence is the model's probability — 0.92 means it's 92% certain about its prediction.",
  },
  {
    question: "Which is NOT a built-in MediaPipe gesture?",
    options: ["Thumbs Up", "Open Palm", "Victory", "Pinch"],
    correctIndex: 3,
    explanation: "MediaPipe's default gesture model recognizes 7 gestures: Thumbs Up/Down, Open Palm, Closed Fist, Pointing Up, Victory, and ILoveYou. 'Pinch' is not one of them — you'd have to train your own.",
  },
  {
    question: "Why do gesture-controlled interfaces matter?",
    options: [
      "They look futuristic",
      "Hands-free input helps accessibility, sterile environments, and AR/VR",
      "They are always more accurate than touch",
      "They require expensive hardware",
    ],
    correctIndex: 1,
    explanation: "Gestures enable hands-free control in contexts where touching a screen is hard or impossible — surgery, cooking, driving, AR glasses, and assistive tech.",
  },
];

export default function GestureRecognitionActivity() {
  const tabs = useMemo(
    () => [
      { id: "live", label: "Live Gestures", icon: <Hand className="w-4 h-4" />, content: <LiveGestureTab /> },
      { id: "simon", label: "Simon Says Game", icon: <Gamepad2 className="w-4 h-4" />, content: <SimonSaysTab /> },
    ],
    [],
  );

  return (
    <LessonShell
      title="Gesture Recognition"
      level={9}
      lessonNumber={2}
      tabs={tabs}
      quiz={quizQuestions}
      nextLessonHint="Hands are great — but what about everything else? Next, the computer learns to spot phones, books, cups, dogs, and more!"
      story={
        <StorySection
          paragraphs={[
            "Aru gave the screen a thumbs up. The computer beeped: 'Thumbs Up detected!'",
            "Aru: \"Wait — how did it know it was a thumbs up and not just any hand?\"",
            "Byte: \"Two steps! Step 1: find the 21 landmarks (you already know this). Step 2: a tiny classifier looks at where those points are relative to each other — is the thumb sticking up while the other fingers are curled? — and outputs a label.\"",
            "Aru: \"So it's really just geometry!\"",
            "Byte: \"Exactly. And the cool part? You can train it to recognize YOUR own gestures too — like a secret handshake or sign language alphabet!\"",
          ]}
          conceptTitle="Key Concept"
          conceptSummary="Gesture Recognition = Hand Landmark Detection + a small classifier that maps the 21 landmark coordinates to a gesture label. MediaPipe's default model knows 7 gestures, but you can train custom ones with as few as ~50 samples per class."
        />
      }
    />
  );
}
