import { useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutMode, OutputFormat } from "@/types/studio";

const POSITION_CLASSES: Record<string, string> = {
  "pip-br": "bottom-24 right-2 sm:bottom-4 sm:right-4",
  "pip-bl": "bottom-24 left-2 sm:bottom-4 sm:left-4",
  "pip-tr": "top-14 right-2 sm:top-4 sm:right-4",
  "pip-tl": "top-14 left-2 sm:top-4 sm:left-4",
  "side-by-side": "bottom-24 right-2 sm:bottom-4 sm:right-4",
  "board-only": "bottom-24 right-2 sm:bottom-4 sm:right-4",
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
  hidden,
  onVideoRef,
  layout = "pip-br",
  format = "landscape",
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

  if (hidden || layout === "board-only") {
    return null;
  }

  const posClass = POSITION_CLASSES[layout] ?? "bottom-4 right-4";
  const sizeClass = format === "portrait" ? "h-[132px] w-[96px] sm:h-[180px] sm:w-[240px]" : "h-[112px] w-[160px] sm:h-[150px] sm:w-[220px]";

  return (
    <div className={`absolute ${posClass} z-20 overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur`}>
      {processedCanvas ? (
        <div ref={canvasMountRef} className={`${sizeClass} rounded-md bg-black`} />
      ) : (
        <video ref={videoRef} autoPlay playsInline muted className={`${sizeClass} rounded-md bg-black object-cover`} />
      )}
      <div className="mt-2">
        {webcamStream ? (
          <Button size="sm" variant="outline" onClick={onDisable} className="min-h-11 w-full"><CameraOff className="mr-2 h-4 w-4" />Disable webcam</Button>
        ) : (
          <Button size="sm" onClick={onEnable} className="min-h-11 w-full"><Camera className="mr-2 h-4 w-4" />Enable webcam</Button>
        )}
      </div>
    </div>
  );
}
