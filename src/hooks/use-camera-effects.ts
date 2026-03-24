import { useEffect, useMemo, useRef, useState } from "react";
import { FilesetResolver, ImageSegmenter } from "@mediapipe/tasks-vision";

export type CameraEffect = "none" | "blur" | "remove" | "virtual-bg" | "grayscale-bg";

interface CameraEffectOptions {
  effect: CameraEffect;
  webcamVideo: HTMLVideoElement | null;
  bgColor?: string;
  bgImageUrl?: string;
  blurRadius?: number;
}

interface CameraEffectResult {
  processedCanvas: HTMLCanvasElement | null;
  isLoading: boolean;
  error: string | null;
  supported: boolean;
}

const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";
const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm";

async function getSegmenter() {
  const vision = await FilesetResolver.forVisionTasks(WASM_URL);
  return ImageSegmenter.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_URL },
    runningMode: "VIDEO",
    outputCategoryMask: false,
    outputConfidenceMasks: true,
  });
}

function isWebglSupported() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl") || canvas.getContext("webgl2"));
  } catch {
    return false;
  }
}

export function useCameraEffects({
  effect,
  webcamVideo,
  bgColor = "#00FF00",
  bgImageUrl,
  blurRadius = 15,
}: CameraEffectOptions): CameraEffectResult {
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supported = useMemo(() => {
    if (typeof window === "undefined") return false;
    return isWebglSupported();
  }, []);

  const rafRef = useRef<number>(0);
  const lastFrameTimeRef = useRef(0);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;
    let segmenter: ImageSegmenter | null = null;

    const outputCanvas = document.createElement("canvas");
    const outputCtx = outputCanvas.getContext("2d", { willReadFrequently: false });
    const personCanvas = document.createElement("canvas");
    const personCtx = personCanvas.getContext("2d", { willReadFrequently: true });

    if (!outputCtx || !personCtx) {
      setError("Canvas is not supported in this browser.");
      setProcessedCanvas(null);
      return;
    }

    if (effect === "none" || !webcamVideo) {
      setProcessedCanvas(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    if (!supported) {
      setError("Camera effects require WebGL support.");
      setProcessedCanvas(null);
      return;
    }

    // Uses confidence mask (float32 array, 0.0 = background, 1.0 = person)
    // Threshold at 0.5 for person detection
    const drawEffect = (confidenceMask: Float32Array, width: number, height: number) => {
      outputCanvas.width = width;
      outputCanvas.height = height;
      personCanvas.width = width;
      personCanvas.height = height;

      outputCtx.clearRect(0, 0, width, height);

      // Step 1: Draw the background layer
      if (effect === "remove") {
        outputCtx.fillStyle = bgColor;
        outputCtx.fillRect(0, 0, width, height);
      } else if (effect === "virtual-bg") {
        const bgImg = imageRef.current;
        if (bgImg?.complete && bgImg.naturalWidth > 0) {
          outputCtx.drawImage(bgImg, 0, 0, width, height);
        } else {
          outputCtx.fillStyle = "#0f172a";
          outputCtx.fillRect(0, 0, width, height);
        }
      } else if (effect === "grayscale-bg") {
        outputCtx.filter = "grayscale(1)";
        outputCtx.drawImage(webcamVideo, 0, 0, width, height);
        outputCtx.filter = "none";
      } else if (effect === "blur") {
        outputCtx.filter = `blur(${Math.max(5, blurRadius)}px)`;
        outputCtx.drawImage(webcamVideo, 0, 0, width, height);
        outputCtx.filter = "none";
      }

      // Step 2: Draw person layer — webcam frame with background pixels made transparent
      personCtx.clearRect(0, 0, width, height);
      personCtx.drawImage(webcamVideo, 0, 0, width, height);
      const frame = personCtx.getImageData(0, 0, width, height);
      const px = frame.data;

      for (let i = 0; i < confidenceMask.length; i++) {
        // confidenceMask[i] is 0.0-1.0 where higher = more likely person
        // Make background pixels transparent, keep person pixels opaque
        const personConfidence = confidenceMask[i];
        if (personConfidence < 0.5) {
          // This is background — make transparent
          px[i * 4 + 3] = 0;
        } else {
          // Soft edge: use confidence for smooth blending near edges
          px[i * 4 + 3] = Math.round(Math.min(1, personConfidence * 1.5) * 255);
        }
      }

      personCtx.putImageData(frame, 0, 0);

      // Step 3: Composite person on top of background
      outputCtx.drawImage(personCanvas, 0, 0, width, height);
    };

    const loop = async () => {
      if (!active || !segmenter || !webcamVideo) return;

      const now = performance.now();
      if (now - lastFrameTimeRef.current < 33) {
        rafRef.current = requestAnimationFrame(() => void loop());
        return;
      }
      lastFrameTimeRef.current = now;

      const width = webcamVideo.videoWidth || 640;
      const height = webcamVideo.videoHeight || 480;

      if (width <= 1 || height <= 1) {
        rafRef.current = requestAnimationFrame(() => void loop());
        return;
      }

      try {
        segmenter.segmentForVideo(webcamVideo, now, (result) => {
          if (!active) return;
          // confidenceMasks[0] is the person confidence mask
          const masks = result.confidenceMasks;
          if (!masks || masks.length === 0) return;
          const personMask = masks[0].getAsFloat32Array();
          drawEffect(personMask, width, height);
        });
      } catch (err) {
        if (active) {
          console.warn("Camera effect frame error:", err);
        }
      }

      rafRef.current = requestAnimationFrame(() => void loop());
    };

    const start = async () => {
      setIsLoading(true);
      setError(null);

      if (effect === "virtual-bg" && bgImageUrl) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = bgImageUrl;
        imageRef.current = img;
      } else {
        imageRef.current = null;
      }

      try {
        segmenter = await getSegmenter();
        if (!active) return;
        setProcessedCanvas(outputCanvas);
        setIsLoading(false);
        rafRef.current = requestAnimationFrame(() => void loop());
      } catch (err) {
        if (!active) return;
        setIsLoading(false);
        setError(err instanceof Error ? err.message : "Failed to load camera effects model.");
      }
    };

    void start();

    return () => {
      active = false;
      cancelAnimationFrame(rafRef.current);
      lastFrameTimeRef.current = 0;
      imageRef.current = null;
      try {
        segmenter?.close();
      } catch {
        // noop
      }
      setProcessedCanvas(null);
    };
  }, [effect, webcamVideo, bgColor, bgImageUrl, blurRadius, supported]);

  return { processedCanvas, isLoading, error, supported };
}
