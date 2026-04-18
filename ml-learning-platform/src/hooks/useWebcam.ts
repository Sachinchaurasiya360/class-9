import { useCallback, useEffect, useRef, useState } from "react";

export type WebcamStatus = "idle" | "requesting" | "running" | "error";

export interface UseWebcamResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  status: WebcamStatus;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Manages a `getUserMedia` webcam stream and binds it to a <video> element.
 * - Call `start()` from a user gesture (click) - browsers require it.
 * - The stream is released on `stop()` or component unmount.
 * - Mirrors the video horizontally via CSS in the consumer (we don't flip pixels).
 */
export function useWebcam(constraints?: MediaStreamConstraints): UseWebcamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<WebcamStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    const s = streamRef.current;
    if (s) {
      s.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStatus("idle");
  }, []);

  const start = useCallback(async () => {
    if (streamRef.current) return;
    setStatus("requesting");
    setError(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Your browser does not support getUserMedia.");
      }
      const stream = await navigator.mediaDevices.getUserMedia(
        constraints ?? {
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        },
      );
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) {
        v.srcObject = stream;
        v.playsInline = true;
        v.muted = true;
        await v.play().catch(() => { /* autoplay edge case */ });
      }
      setStatus("running");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow camera access and try again."
            : e.name === "NotFoundError"
              ? "No camera found on this device."
              : e.message
          : "Could not start the camera.";
      setError(msg);
      setStatus("error");
    }
  }, [constraints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return { videoRef, status, error, start, stop };
}
