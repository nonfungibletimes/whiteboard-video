import { Pause, Play, Square, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatSeconds } from "@/lib/utils";
import type { RecorderStatus } from "@/types/studio";

interface Props {
  status: RecorderStatus;
  countdown: number;
  duration: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function RecordingControls({ status, countdown, duration, onStart, onPause, onResume, onStop }: Props) {
  return (
    <div className="flex items-center gap-2">
      {(status === "idle" || status === "stopped") && (
        <Button variant="success" onClick={onStart}><Video className="mr-2 h-4 w-4" />Start</Button>
      )}
      {status === "recording" && (
        <Button variant="secondary" onClick={onPause}><Pause className="mr-2 h-4 w-4" />Pause</Button>
      )}
      {status === "paused" && (
        <Button onClick={onResume}><Play className="mr-2 h-4 w-4" />Resume</Button>
      )}
      {(status === "recording" || status === "paused") && (
        <Button variant="destructive" onClick={onStop}><Square className="mr-2 h-4 w-4" />Stop</Button>
      )}

      <div className="ml-2 min-w-[88px] rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium">
        {status === "countdown" ? `Starting in ${countdown}` : formatSeconds(duration)}
      </div>
    </div>
  );
}
