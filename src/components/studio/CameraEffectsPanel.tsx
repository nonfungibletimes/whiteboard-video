import { Blend, Camera, ChevronDown, Eraser, Image as ImageIcon, Loader2, Palette, Sparkles } from "lucide-react";
import { type ComponentType, useMemo, useState } from "react";
import { type CameraEffect } from "@/hooks/use-camera-effects";

interface Props {
  effect: CameraEffect;
  onEffectChange: (effect: CameraEffect) => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
  bgImageUrl?: string;
  onBgImageUrlChange: (url?: string) => void;
  blurRadius: number;
  onBlurRadiusChange: (value: number) => void;
  isLoading?: boolean;
}

const EFFECTS: { id: CameraEffect; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: "none", label: "None", icon: Camera },
  { id: "blur", label: "Blur", icon: Blend },
  { id: "remove", label: "Remove BG", icon: Eraser },
  { id: "virtual-bg", label: "Virtual BG", icon: ImageIcon },
  { id: "grayscale-bg", label: "Color Pop", icon: Palette },
];

const BUILTIN_BACKGROUNDS = [
  { name: "Gradient Blue", value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='%231d4ed8'/><stop offset='100%' stop-color='%230ea5e9'/></linearGradient></defs><rect fill='url(%23g)' width='1280' height='720'/></svg>", preview: "bg-gradient-to-br from-blue-700 to-sky-400" },
  { name: "Gradient Purple", value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop offset='0%' stop-color='%235b21b6'/><stop offset='100%' stop-color='%23ec4899'/></linearGradient></defs><rect fill='url(%23g)' width='1280' height='720'/></svg>", preview: "bg-gradient-to-br from-violet-800 to-fuchsia-500" },
  { name: "Office", value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'><defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0%' stop-color='%23e2e8f0'/><stop offset='100%' stop-color='%23cbd5e1'/></linearGradient></defs><rect fill='url(%23g)' width='1280' height='720'/><rect x='0' y='520' width='1280' height='200' fill='%2394a3b8'/></svg>", preview: "bg-gradient-to-b from-slate-200 to-slate-400" },
  { name: "Nature", value: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1280' height='720'><defs><linearGradient id='g' x1='0' x2='0' y1='0' y2='1'><stop offset='0%' stop-color='%2386efac'/><stop offset='100%' stop-color='%2316a34a'/></linearGradient></defs><rect fill='url(%23g)' width='1280' height='720'/><circle cx='1120' cy='110' r='70' fill='%23fde047'/></svg>", preview: "bg-gradient-to-b from-green-300 to-green-700" },
];

export function CameraEffectsPanel({
  effect,
  onEffectChange,
  bgColor,
  onBgColorChange,
  bgImageUrl,
  onBgImageUrlChange,
  blurRadius,
  onBlurRadiusChange,
  isLoading,
}: Props) {
  const [open, setOpen] = useState(true);

  const isBuiltinSelected = useMemo(() => BUILTIN_BACKGROUNDS.some((b) => b.value === bgImageUrl), [bgImageUrl]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between text-left text-sm font-semibold text-slate-800"
      >
        <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" />Camera Effects</span>
        <span className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-500" />}
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3 text-xs text-slate-600">
          <div className="grid grid-cols-2 gap-2">
            {EFFECTS.map((item) => {
              const Icon = item.icon;
              const active = effect === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onEffectChange(item.id)}
                  className={`flex items-center gap-2 rounded-md border px-2 py-2 text-left text-xs transition ${
                    active ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {effect === "remove" && (
            <div className="space-y-2">
              <p className="font-medium text-slate-700">Background color</p>
              <div className="flex items-center gap-2">
                {["#00FF00", "#FFFFFF", "#000000", "#3B82F6"].map((color) => (
                  <button
                    key={color}
                    onClick={() => onBgColorChange(color)}
                    className={`h-7 w-7 rounded-full border ${bgColor.toLowerCase() === color.toLowerCase() ? "ring-2 ring-indigo-400" : ""}`}
                    style={{ backgroundColor: color }}
                    aria-label={`Set background color ${color}`}
                  />
                ))}
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => onBgColorChange(e.target.value)}
                  className="h-7 w-9 cursor-pointer rounded border border-slate-200 p-0.5"
                  aria-label="Custom background color"
                />
              </div>
            </div>
          )}

          {effect === "blur" && (
            <label className="block space-y-1">
              <span className="font-medium text-slate-700">Blur intensity: {blurRadius}px</span>
              <input
                type="range"
                min={5}
                max={30}
                step={1}
                value={blurRadius}
                onChange={(e) => onBlurRadiusChange(Number(e.target.value))}
                className="w-full"
              />
            </label>
          )}

          {effect === "virtual-bg" && (
            <div className="space-y-2">
              <label className="block">
                <span className="mb-1 block font-medium text-slate-700">Upload image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => onBgImageUrlChange(String(reader.result));
                    reader.readAsDataURL(file);
                    e.currentTarget.value = "";
                  }}
                  className="w-full rounded border border-slate-200 p-1.5"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                {BUILTIN_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.name}
                    onClick={() => onBgImageUrlChange(bg.value)}
                    className={`h-12 rounded-md border text-[11px] font-medium text-white shadow-sm ${bg.preview} ${bgImageUrl === bg.value ? "ring-2 ring-indigo-400" : ""}`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>

              {(bgImageUrl && !isBuiltinSelected) && (
                <p className="text-[11px] text-slate-500">Custom image selected.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
