import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  visible: boolean;
  script: string;
  onScriptChange: (value: string) => void;
  isRecording: boolean;
}

const FONT_SIZES = [18, 24, 30];

export function Teleprompter({ visible, script, onScriptChange, isRecording }: Props) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.4);
  const [fontSizeIndex, setFontSizeIndex] = useState(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording) setIsPlaying(true);
  }, [isRecording]);

  useEffect(() => {
    if (!visible || !isPlaying) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const step = () => {
      const el = viewportRef.current;
      if (el) {
        const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight);
        const next = Math.min(maxScroll, el.scrollTop + speed);
        el.scrollTop = next;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, speed, visible]);

  if (!visible) return null;

  return (
    <div className="absolute left-2 right-2 top-2 z-40 h-[65%] rounded-xl border border-slate-600/60 bg-slate-950/70 p-3 text-white shadow-2xl backdrop-blur-md sm:left-auto sm:right-4 sm:top-4 sm:h-[70%] sm:w-[340px]">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold">Teleprompter</p>
        <Button size="sm" variant="secondary" onClick={() => setIsPlaying((prev) => !prev)}>
          {isPlaying ? <Pause className="mr-1 h-3.5 w-3.5" /> : <Play className="mr-1 h-3.5 w-3.5" />}
          {isPlaying ? "Pause" : "Play"}
        </Button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <label className="space-y-1">
          <span className="text-slate-300">Speed</span>
          <input type="range" min={0.6} max={3} step={0.2} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="w-full" />
        </label>
        <label className="space-y-1">
          <span className="text-slate-300">Font size</span>
          <input type="range" min={0} max={2} step={1} value={fontSizeIndex} onChange={(e) => setFontSizeIndex(Number(e.target.value))} className="w-full" />
        </label>
      </div>

      {isPlaying ? (
        <div ref={viewportRef} className="h-[calc(100%-104px)] overflow-y-auto rounded-lg border border-slate-600/60 bg-black/30 p-3" style={{ fontSize: FONT_SIZES[fontSizeIndex], lineHeight: 1.6 }}>
          <div className="whitespace-pre-wrap">{script || "Paste your script, then press play."}</div>
        </div>
      ) : (
        <textarea
          value={script}
          onChange={(e) => onScriptChange(e.target.value)}
          placeholder="Paste your script here..."
          className="h-[calc(100%-104px)] w-full resize-none rounded-lg border border-slate-600/60 bg-black/30 p-3 text-sm text-white outline-none"
        />
      )}
    </div>
  );
}
