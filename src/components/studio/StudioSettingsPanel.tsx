import { ChevronDown, Settings2 } from "lucide-react";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type PenThickness = "thin" | "medium" | "thick";
export type RecordingQuality = "standard" | "hd";

interface Props {
  penColor: string;
  onPenColorChange: (color: string) => void;
  penThickness: PenThickness;
  onPenThicknessChange: (thickness: PenThickness) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  countdownSeconds: 0 | 3 | 5;
  onCountdownChange: (seconds: 0 | 3 | 5) => void;
  recordingQuality: RecordingQuality;
  onRecordingQualityChange: (quality: RecordingQuality) => void;
}

export function StudioSettingsPanel({
  penColor,
  onPenColorChange,
  penThickness,
  onPenThicknessChange,
  backgroundColor,
  onBackgroundColorChange,
  showGrid,
  onShowGridChange,
  countdownSeconds,
  onCountdownChange,
  recordingQuality,
  onRecordingQualityChange,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
      >
        <span className="flex items-center gap-2"><Settings2 className="h-4 w-4" />Settings</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-xs text-slate-600">
          <label className="block space-y-1">
            <span className="font-medium text-slate-700">Pen color</span>
            <input
              type="color"
              value={penColor}
              onChange={(e) => onPenColorChange(e.target.value)}
              className="h-9 w-full cursor-pointer rounded border border-slate-200 bg-white p-1"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-slate-700">Pen thickness</span>
            <Select value={penThickness} onValueChange={(v) => onPenThicknessChange(v as PenThickness)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="thin">Thin</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="thick">Thick</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-slate-700">Canvas background</span>
            <input
              type="color"
              value={backgroundColor}
              onChange={(e) => onBackgroundColorChange(e.target.value)}
              className="h-9 w-full cursor-pointer rounded border border-slate-200 bg-white p-1"
            />
          </label>

          <label className="flex items-center justify-between rounded-md border border-slate-200 px-2 py-2">
            <span className="font-medium text-slate-700">Show grid</span>
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => onShowGridChange(e.target.checked)}
              className="h-4 w-4 accent-slate-700"
            />
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-slate-700">Countdown</span>
            <Select value={String(countdownSeconds)} onValueChange={(v) => onCountdownChange(Number(v) as 0 | 3 | 5)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No countdown</SelectItem>
                <SelectItem value="3">3 seconds</SelectItem>
                <SelectItem value="5">5 seconds</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-slate-700">Recording quality</span>
            <Select value={recordingQuality} onValueChange={(v) => onRecordingQualityChange(v as RecordingQuality)}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard (720p)</SelectItem>
                <SelectItem value="hd">HD (1080p)</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>
      )}
    </div>
  );
}
