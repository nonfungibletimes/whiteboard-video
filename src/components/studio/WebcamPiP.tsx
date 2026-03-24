import { useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import type { LayoutMode, OutputFormat } from "@/types/studio";

const POSITION_CLASSES: Record<string, string> = {
  "pip-br": "bottom-[148px] right-2 md:bottom-[100px] md:right-4",
  "pip-bl": "bottom-[148px] left-2 md:bottom-[100px] md:left-4",
  "pip-tr": "top-2 right-2 md:top-4 md:right-4",
  "pip-tl": "top-2 left-2 md:top-4 md:left-4",
  "side-by-side": "bottom-[148px] right-2 md:bottom-[100px] md:right-4",
  "board-only": "bottom-[148px] right-2 md:bottom-[100px] md:right-4",
};

interface Props {
  webcamStream: MediaStream | null;
  onEnable: () => void;
  onDisable: () => void;
  hidden?: boolean;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
  layout?: LayoutMode;
  format?: OutputFormat;
  processedCanvas?: HTMLCanvasElement | null;
}

export function WebcamPiP({
  webcamStream,
  onEnable,
  onDisable,
  onVideoRef,
  layout = "pip-br",
  processedCanvas,
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasMountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = webcamStream;
    onVideoRef?.(videoRef.current);
  }, [webcamStream, onVideoRef]);

  useEffect(() => {
    const mount = canvasMountRef.current;
    if (!mount) return;
    mount.innerHTML = "";
    if (!processedCanvas) return;

    processedCanvas.className = "h-full w-full rounded-md bg-black object-cover";
    mount.appendChild(processedCanvas);

    return () => {
      if (mount.contains(processedCanvas)) {
        mount.removeChild(processedCanvas);
      }
    };
  }, [processedCanvas]);

  // Don't render PiP box in board-only mode when webcam is off
  if (layout === "board-only" && !webcamStream) return null;

  const posClass = POSITION_CLASSES[layout] ?? POSITION_CLASSES["pip-br"];
  // Smaller on mobile
  const sizeClass = "h-[80px] w-[112px] md:h-[120px] md:w-[170px] lg:h-[150px] lg:w-[220px]";

  return (
    <div className={`absolute ${posClass} z-20 overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-1.5 shadow-xl backdrop-blur md:p-2`}>
      {webcamStream ? (
        <>
          {processedCanvas ? (
            <div ref={canvasMountRef} className={`${sizeClass} rounded-md bg-black`} />
          ) : (
            <video ref={videoRef} autoPlay playsInline muted className={`${sizeClass} rounded-md bg-black object-cover`} />
          )}
          <button
            className="mt-1 flex w-full items-center justify-center gap-1 rounded-md bg-slate-100 px-2 py-1.5 text-[11px] font-medium text-slate-600 active:bg-slate-200 md:mt-2 md:py-2 md:text-xs"
            onClick={onDisable}
          >
            <CameraOff className="h-3 w-3 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Disable</span>
          </button>
        </>
      ) : (
        <button
          className="flex h-[80px] w-[112px] flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-slate-300 text-slate-500 active:bg-slate-50 md:h-[120px] md:w-[170px] lg:h-[150px] lg:w-[220px]"
          onClick={onEnable}
        >
          <Camera className="h-6 w-6 md:h-8 md:w-8" />
          <span className="text-[11px] font-medium md:text-xs">Enable Camera</span>
        </button>
      )}
      {/* Hidden video element for the recorder to reference when camera effects are applied */}
      {webcamStream && processedCanvas && (
        <video ref={videoRef} autoPlay playsInline muted className="sr-only" />
      )}
    </div>
  );
}
