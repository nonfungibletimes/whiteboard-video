import { useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LayoutMode, OutputFormat } from "@/types/studio";

const POSITION_CLASSES: Record<string, string> = {
  "pip-br": "bottom-4 right-4",
  "pip-bl": "bottom-4 left-[300px]",
  "pip-tr": "top-4 right-4",
  "pip-tl": "top-4 left-[300px]",
  "side-by-side": "bottom-4 right-4",
  "board-only": "bottom-4 right-4",
};

interface Props {
  webcamStream: MediaStream | null;
  onEnable: () => void;
  onDisable: () => void;
  hidden?: boolean;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
  layout?: LayoutMode;
  format?: OutputFormat;
}

export function WebcamPiP({ webcamStream, onEnable, onDisable, hidden, onVideoRef, layout = "pip-br", format = "landscape" }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = webcamStream;
    onVideoRef?.(videoRef.current);
  }, [webcamStream, onVideoRef]);

  if (hidden || layout === "board-only") {
    return null;
  }

  const posClass = POSITION_CLASSES[layout] ?? "bottom-4 right-4";
  // Larger preview for portrait/square since webcam is more prominent
  const sizeClass = format === "portrait" ? "h-[180px] w-[240px]" : "h-[150px] w-[220px]";

  return (
    <div className={`absolute ${posClass} z-20 overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur`}>
      <video ref={videoRef} autoPlay playsInline muted className={`${sizeClass} rounded-md bg-black object-cover`} />
      <div className="mt-2">
        {webcamStream ? (
          <Button size="sm" variant="outline" onClick={onDisable} className="w-full"><CameraOff className="mr-2 h-4 w-4" />Disable webcam</Button>
        ) : (
          <Button size="sm" onClick={onEnable} className="w-full"><Camera className="mr-2 h-4 w-4" />Enable webcam</Button>
        )}
      </div>
    </div>
  );
}
