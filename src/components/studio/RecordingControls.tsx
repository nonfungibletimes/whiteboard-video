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
        <Button variant="success" onClick={onStart} className="min-h-11 px-3 sm:px-4"><Video className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Start</span></Button>
      )}
      {status === "recording" && (
        <Button variant="secondary" onClick={onPause} className="min-h-11 px-3 sm:px-4"><Pause className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Pause</span></Button>
      )}
      {status === "paused" && (
        <Button onClick={onResume} className="min-h-11 px-3 sm:px-4"><Play className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Resume</span></Button>
      )}
      {(status === "recording" || status === "paused") && (
        <Button variant="destructive" onClick={onStop} className="min-h-11 px-3 sm:px-4"><Square className="h-4 w-4 sm:mr-2" /><span className="hidden sm:inline">Stop</span></Button>
      )}

      <div className="ml-1 min-w-[88px] rounded-md border border-slate-200 bg-white px-2 py-2 text-center text-xs font-medium sm:ml-2 sm:px-3 sm:text-sm">
        {status === "countdown" ? `Starting in ${countdown}` : formatSeconds(duration)}
      </div>
    </div>
  );
}
