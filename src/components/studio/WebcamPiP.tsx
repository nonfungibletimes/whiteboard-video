import { useEffect, useRef } from "react";
import { Camera, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  webcamStream: MediaStream | null;
  onEnable: () => void;
  onDisable: () => void;
  hidden?: boolean;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
}

export function WebcamPiP({ webcamStream, onEnable, onDisable, hidden, onVideoRef }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = webcamStream;
    onVideoRef?.(videoRef.current);
  }, [webcamStream, onVideoRef]);

  if (hidden) {
    return null;
  }

  return (
    <div className="absolute bottom-4 right-4 z-20 overflow-hidden rounded-xl border border-slate-200 bg-white/90 p-2 shadow-xl backdrop-blur">
      <video ref={videoRef} autoPlay playsInline muted className="h-[150px] w-[220px] rounded-md bg-black object-cover" />
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
