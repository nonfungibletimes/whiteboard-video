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
  className?: string;
}

export function SlideNav({ slides, activeSlideId, onAdd, onSelect, onDelete, onMoveLeft, onMoveRight, className = "" }: Props) {
  return (
    <div className={`absolute inset-x-2 bottom-2 z-30 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-lg backdrop-blur md:inset-x-8 md:bottom-4 md:p-2 ${className}`}>
      <div className="flex items-center gap-1.5 overflow-x-auto md:gap-2">
        {slides.map((slide, index) => {
          const active = slide.id === activeSlideId;
          return (
            <div
              key={slide.id}
              className={`min-w-[80px] shrink-0 rounded-lg border p-1.5 text-xs md:min-w-[120px] md:p-2 ${active ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-slate-50"}`}
            >
              <button className="w-full text-left text-[11px] font-semibold md:mb-1 md:text-xs" onClick={() => onSelect(slide.id)}>
                Slide {index + 1}
              </button>
              <div className="mt-1 flex gap-0.5">
                <button className="rounded p-0.5 hover:bg-slate-200 active:bg-slate-300" onClick={() => onMoveLeft(slide.id)}><ChevronLeft className="h-3 w-3" /></button>
                <button className="rounded p-0.5 hover:bg-slate-200 active:bg-slate-300" onClick={() => onMoveRight(slide.id)}><ChevronRight className="h-3 w-3" /></button>
                <button className="ml-auto rounded p-0.5 text-red-500 hover:bg-red-100 active:bg-red-200" onClick={() => onDelete(slide.id)}><Trash2 className="h-3 w-3" /></button>
              </div>
            </div>
          );
        })}
        <Button size="sm" variant="outline" onClick={onAdd} className="h-10 min-w-[40px] shrink-0 md:h-14 md:min-w-[56px]"><Plus className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
