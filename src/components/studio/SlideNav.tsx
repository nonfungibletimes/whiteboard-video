import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface SlideItem {
  id: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

interface Props {
  slides: SlideItem[];
  activeSlideId: string;
  onAdd: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
}

export function SlideNav({ slides, activeSlideId, onAdd, onSelect, onDelete, onMoveLeft, onMoveRight }: Props) {
  return (
    <div className="absolute inset-x-8 bottom-4 z-35 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur">
      <div className="flex items-center gap-2 overflow-x-auto">
        {slides.map((slide, index) => {
          const active = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              className={`min-w-[140px] rounded-lg border p-2 text-xs ${active ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}
            >
              <button className="mb-2 w-full text-left font-semibold" onClick={() => onSelect(slide.id)}>
                Slide {index + 1}
              </button>
              <p className="truncate text-[11px] text-slate-500">{slide.elements.length} elements</p>
              <div className="mt-2 flex gap-1">
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onMoveLeft(slide.id)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => onMoveRight(slide.id)}><ChevronRight className="h-3.5 w-3.5" /></Button>
                <Button size="sm" variant="ghost" className="ml-auto h-6 w-6 p-0 text-red-500" onClick={() => onDelete(slide.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          );
        })}
        <Button size="sm" variant="outline" onClick={onAdd} className="h-14 min-w-[56px]"><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
