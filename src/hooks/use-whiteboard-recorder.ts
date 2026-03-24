import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LayoutMode, OutputFormat, RecorderStatus } from "@/types/studio";
import type { RecordingQuality } from "@/components/studio/StudioSettingsPanel";

const FORMAT_SIZE: Record<RecordingQuality, Record<OutputFormat, { width: number; height: number }>> = {
  standard: {
    landscape: { width: 1280, height: 720 },
    portrait: { width: 720, height: 1280 },
    square: { width: 720, height: 720 },
  },
  hd: {
    landscape: { width: 1920, height: 1080 },
    portrait: { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 },
  },
};

interface RecorderOptions {
  format: OutputFormat;
  layout: LayoutMode;
  boardCanvas: HTMLCanvasElement | null;
  webcamVideo: HTMLVideoElement | null;
  boardBackground: string;
  countdownSeconds: 0 | 3 | 5;
  recordingQuality: RecordingQuality;
}

export function useWhiteboardRecorder({
  format,
  layout,
  boardCanvas,
  webcamVideo,
  boardBackground,
  countdownSeconds,
  recordingQuality,
}: RecorderOptions) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [countdown, setCountdown] = useState(0);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);

  const dimensions = useMemo(() => FORMAT_SIZE[recordingQuality][format], [format, recordingQuality]);

  const drawFrame = useCallback(() => {
    if (!renderCanvasRef.current || !boardCanvas) return;
    const ctx = renderCanvasRef.current.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    renderCanvasRef.current.width = width;
    renderCanvasRef.current.height = height;

    ctx.fillStyle = boardBackground;
    ctx.fillRect(0, 0, width, height);

    if (layout === "side-by-side" && webcamVideo) {
      const leftW = Math.floor(width * 0.65);
      ctx.drawImage(boardCanvas, 0, 0, leftW, height);
      ctx.fillStyle = "#f3f4f6";
      ctx.fillRect(leftW, 0, width - leftW, height);
      ctx.drawImage(webcamVideo, leftW + 16, 16, width - leftW - 32, height - 32);
    } else {
      ctx.drawImage(boardCanvas, 0, 0, width, height);
      if (layout !== "board-only" && webcamVideo) {
        const pipW = Math.round(width * 0.24);
        const pipH = Math.round(pipW * 9 / 16);
        const margin = 20;
        const positions = {
          "pip-br": { x: width - pipW - margin, y: height - pipH - margin },
          "pip-bl": { x: margin, y: height - pipH - margin },
          "pip-tr": { x: width - pipW - margin, y: margin },
          "pip-tl": { x: margin, y: margin },
        } as const;
        const pos = positions[(layout in positions ? layout : "pip-br") as keyof typeof positions];
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pipW, pipH, 12);
        ctx.clip();
        ctx.drawImage(webcamVideo, pos.x, pos.y, pipW, pipH);
        ctx.restore();

        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 2;
        ctx.strokeRect(pos.x, pos.y, pipW, pipH);
      }
    }

    animationRef.current = requestAnimationFrame(drawFrame);
  }, [boardBackground, boardCanvas, dimensions, layout, webcamVideo]);

  const startRecorder = useCallback(async () => {
    if (!boardCanvas) {
      setError("Whiteboard is not ready yet.");
      return;
    }

    setError(null);
    setRecordedBlob(null);

    const micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }).catch(() => null);

    if (countdownSeconds > 0) {
      setStatus("countdown");
      setCountdown(countdownSeconds);
      for (let i = countdownSeconds; i > 0; i -= 1) {
        setCountdown(i);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      setCountdown(0);
    }

    setStatus("recording");

    const renderCanvas = document.createElement("canvas");
    renderCanvasRef.current = renderCanvas;

    drawFrame();

    const stream = renderCanvas.captureStream(30);
    if (micStream) {
      micStream.getAudioTracks().forEach((track) => stream.addTrack(track));
    }

    streamRef.current = stream;
    chunksRef.current = [];

    const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
      ? "video/webm;codecs=vp9,opus"
      : "video/webm";

    const recorder = new MediaRecorder(stream, { mimeType });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.onstop = () => {
      cancelAnimationFrame(animationRef.current);
      const blob = new Blob(chunksRef.current, { type: mimeType });
      setRecordedBlob(blob);
      setStatus("stopped");
      setDuration(0);
      if (timerRef.current) window.clearInterval(timerRef.current);
      stream.getTracks().forEach((track) => track.stop());
    };

    recorder.start(300);

    setDuration(0);
    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, [boardCanvas, countdownSeconds, drawFrame]);

  const pauseRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) window.clearInterval(timerRef.current);
      setStatus("paused");
    }
  }, []);

  const resumeRecorder = useCallback(() => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setStatus("recording");
    }
  }, []);

  const stopRecorder = useCallback(() => {
    mediaRecorderRef.current?.stop();
  }, []);

  const downloadRecording = useCallback((target: "webm" | "mp4") => {
    if (!recordedBlob) return;
    const url = URL.createObjectURL(recordedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `whiteboard-recording.${target}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationRef.current);
      if (timerRef.current) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    status,
    countdown,
    duration,
    recordedBlob,
    error,
    startRecorder,
    pauseRecorder,
    resumeRecorder,
    stopRecorder,
    downloadRecording,
  };
}
