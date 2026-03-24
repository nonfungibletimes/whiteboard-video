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
    outputCategoryMask: true,
    outputConfidenceMasks: false,
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
    const stagingCanvas = document.createElement("canvas");
    const stagingCtx = stagingCanvas.getContext("2d", { willReadFrequently: true });

    if (!outputCtx || !stagingCtx) {
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

    const drawEffect = (maskData: Uint8Array, width: number, height: number) => {
      outputCanvas.width = width;
      outputCanvas.height = height;
      stagingCanvas.width = width;
      stagingCanvas.height = height;

      outputCtx.clearRect(0, 0, width, height);
      stagingCtx.clearRect(0, 0, width, height);

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

      stagingCtx.drawImage(webcamVideo, 0, 0, width, height);
      const frame = stagingCtx.getImageData(0, 0, width, height);
      const px = frame.data;
      for (let i = 0; i < maskData.length; i += 1) {
        const person = maskData[i] > 0;
        if (!person) {
          px[i * 4 + 3] = 0;
        }
      }
      stagingCtx.putImageData(frame, 0, 0);
      outputCtx.drawImage(stagingCanvas, 0, 0, width, height);
    };

    const loop = async () => {
      if (!active || !segmenter || !webcamVideo) return;

      const now = performance.now();
      if (now - lastFrameTimeRef.current < 33) {
        rafRef.current = requestAnimationFrame(() => void loop());
        return;
      }
      lastFrameTimeRef.current = now;

      const width = webcamVideo.videoWidth || 1280;
      const height = webcamVideo.videoHeight || 720;

      try {
        segmenter.segmentForVideo(webcamVideo, now, (result) => {
          if (!active || !result.categoryMask) return;
          const mask = result.categoryMask.getAsUint8Array();
          drawEffect(mask, width, height);
        });
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to process camera effect.");
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
