"use client";

import { useCallback, useEffect, useState } from "react";

export interface StepPlayer<F> {
  frames: F[];
  index: number;
  current: F | null;
  isPlaying: boolean;
  speed: number;
  progress: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  reset: () => void;
  step: (dir: 1 | -1) => void;
  seek: (i: number) => void;
  setSpeed: (s: number) => void;
}

/**
 * Scrubbable frame-based playback controller.
 * Pre-compute frames once; the hook handles play/pause/step/speed/seek.
 */
export function useStepPlayer<F>(frames: F[], initialSpeed = 1): StepPlayer<F> {
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);

  useEffect(() => { setIndex(0); setIsPlaying(false); }, [frames]);

  useEffect(() => {
    if (!isPlaying) return;
    if (index >= frames.length - 1) { setIsPlaying(false); return; }
    const t = setTimeout(() => setIndex((i) => i + 1), 700 / speed);
    return () => clearTimeout(t);
  }, [isPlaying, index, frames.length, speed]);

  const play = useCallback(() => {
    setIsPlaying(true);
    setIndex((i) => (i >= frames.length - 1 ? 0 : i));
  }, [frames.length]);
  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(() => setIsPlaying((p) => !p), []);
  const reset = useCallback(() => { setIndex(0); setIsPlaying(false); }, []);
  const step = useCallback((dir: 1 | -1) => {
    setIsPlaying(false);
    setIndex((i) => Math.max(0, Math.min(frames.length - 1, i + dir)));
  }, [frames.length]);
  const seek = useCallback((i: number) => {
    setIsPlaying(false);
    setIndex(Math.max(0, Math.min(frames.length - 1, i)));
  }, [frames.length]);

  return {
    frames,
    index,
    current: frames[index] ?? null,
    isPlaying,
    speed,
    progress: frames.length > 1 ? index / (frames.length - 1) : 0,
    play, pause, toggle, reset, step, seek, setSpeed,
  };
}
