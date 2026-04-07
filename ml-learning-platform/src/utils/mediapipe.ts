/**
 * Lazy CDN loader for @mediapipe/tasks-vision.
 *
 * We load the ES module bundle from jsDelivr at runtime so we don't have to
 * bundle the (large) WASM/JS into our Vite build. The first call resolves the
 * vision module + creates a `FilesetResolver` pointing at the matching WASM.
 *
 * Models are loaded directly from Google's MediaPipe model storage.
 */

const VERSION = "0.10.14";
const CDN_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}`;

// We can't statically `import` from a CDN URL with Vite without it trying to
// resolve, so we use a dynamic import with a /* @vite-ignore */ comment.
let visionModulePromise: Promise<any> | null = null;
let filesetPromise: Promise<any> | null = null;

export async function loadVisionModule(): Promise<any> {
  if (!visionModulePromise) {
    visionModulePromise = import(/* @vite-ignore */ `${CDN_BASE}/vision_bundle.mjs`);
  }
  return visionModulePromise;
}

export async function getFileset(): Promise<any> {
  if (!filesetPromise) {
    filesetPromise = (async () => {
      const vision = await loadVisionModule();
      return vision.FilesetResolver.forVisionTasks(`${CDN_BASE}/wasm`);
    })();
  }
  return filesetPromise;
}

export const MODEL_URLS = {
  handLandmarker:
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
  gestureRecognizer:
    "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
  objectDetector:
    "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
};

// Hand landmark connection pairs (MediaPipe's 21-point hand topology)
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];
