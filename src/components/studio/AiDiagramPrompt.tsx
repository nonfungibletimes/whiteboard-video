import { Sparkles, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ElementShape = Record<string, unknown>;

interface Props {
  onGenerateElements: (elements: ElementShape[]) => void;
}

const STYLE = {
  strokeColor: "#1e293b",
  backgroundColor: "transparent",
  fillStyle: "solid",
  strokeWidth: 2,
  roughness: 1,
  opacity: 100,
  strokeStyle: "solid",
  roundness: null,
  seed: 1,
  version: 1,
  versionNonce: 1,
  isDeleted: false,
  groupIds: [],
  boundElements: null,
  locked: false,
};

function base(type: "rectangle" | "text" | "arrow" | "line" | "ellipse", x: number, y: number, width: number, height: number): ElementShape {
  return { id: crypto.randomUUID(), type, x, y, width, height, angle: 0, ...STYLE };
}

function textEl(text: string, x: number, y: number): ElementShape {
  return {
    ...base("text", x, y, Math.max(40, text.length * 8), 24),
    text, fontSize: 20, fontFamily: 1, textAlign: "left", verticalAlign: "top", baseline: 18, lineHeight: 1.2,
  };
}

function arrow(x1: number, y1: number, x2: number, y2: number): ElementShape {
  return {
    ...base("arrow", x1, y1, x2 - x1, y2 - y1),
    points: [[0, 0], [x2 - x1, y2 - y1]], startArrowhead: null, endArrowhead: "arrow",
  };
}

function parseItems(prompt: string): string[] {
  const body = prompt.split(":").slice(1).join(":") || prompt;
  return body.split(/→|->|,|\n|\||-/g).map((s) => s.trim()).filter(Boolean);
}

function generate(prompt: string): ElementShape[] {
  const p = prompt.toLowerCase();
  const items = parseItems(prompt);

  if (["flowchart", "flow", "process", "steps"].some((k) => p.includes(k))) {
    return items.flatMap((item, i) => {
      const x = 80 + i * 220; const y = 180;
      const arr: ElementShape[] = [base("rectangle", x, y, 180, 80), textEl(item, x + 20, y + 28)];
      if (i > 0) arr.push(arrow(x - 40, y + 40, x, y + 40));
      return arr;
    });
  }

  if (["mind map", "brainstorm", "ideas"].some((k) => p.includes(k))) {
    const center = items[0] || "Topic"; const branches = items.slice(1);
    const out: ElementShape[] = [base("ellipse", 420, 260, 200, 120), textEl(center, 480, 312)];
    branches.forEach((b, i) => {
      const angle = (Math.PI * 2 * i) / Math.max(branches.length, 1);
      const x = 520 + Math.cos(angle) * 300; const y = 320 + Math.sin(angle) * 180;
      out.push(base("rectangle", x, y, 170, 70), textEl(b, x + 16, y + 24), arrow(520, 320, x, y + 35));
    });
    return out;
  }

  if (["timeline", "roadmap", "schedule"].some((k) => p.includes(k))) {
    const out: ElementShape[] = [base("line", 100, 300, 1000, 0)];
    items.forEach((item, i) => { const x = 130 + i * 220; out.push(base("line", x, 280, 0, 40), textEl(item, x - 20, 235)); });
    return out;
  }

  if (["funnel", "pipeline", "stages"].some((k) => p.includes(k))) {
    return items.flatMap((item, i) => {
      const w = 360 - i * 55; const x = 400 - w / 2; const y = 140 + i * 95;
      return [base("rectangle", x, y, w, 74), textEl(item, x + 16, y + 25)];
    });
  }

  if (["org chart", "hierarchy", "team"].some((k) => p.includes(k))) {
    const root = items[0] || "Team";
    const out: ElementShape[] = [base("rectangle", 500, 80, 180, 70), textEl(root, 550, 106)];
    items.slice(1).forEach((item, i) => {
      const x = 260 + i * 220;
      out.push(base("rectangle", x, 240, 170, 70), textEl(item, x + 20, 266), arrow(590, 150, x + 85, 240));
    });
    return out;
  }

  if (["pros cons", "comparison", " vs ", "vs"].some((k) => p.includes(k))) {
    const mid = Math.ceil(items.length / 2); const pros = items.slice(0, mid); const cons = items.slice(mid);
    const out: ElementShape[] = [textEl("Pros", 220, 110), textEl("Cons", 650, 110), base("line", 560, 80, 0, 500)];
    pros.forEach((it, i) => out.push(textEl(`+ ${it}`, 200, 160 + i * 46)));
    cons.forEach((it, i) => out.push(textEl(`- ${it}`, 640, 160 + i * 46)));
    return out;
  }

  if (["checklist", "todo", "list"].some((k) => p.includes(k))) {
    return items.flatMap((item, i) => {
      const y = 140 + i * 58;
      return [base("rectangle", 180, y, 28, 28), textEl(item, 225, y + 3)];
    });
  }

  if (["swot", "analysis"].some((k) => p.includes(k))) {
    return [
      base("rectangle", 220, 120, 320, 220), textEl(`Strengths\n${items[0] ?? ""}`, 240, 150),
      base("rectangle", 560, 120, 320, 220), textEl(`Weaknesses\n${items[1] ?? ""}`, 580, 150),
      base("rectangle", 220, 360, 320, 220), textEl(`Opportunities\n${items[2] ?? ""}`, 240, 390),
      base("rectangle", 560, 360, 320, 220), textEl(`Threats\n${items[3] ?? ""}`, 580, 390),
    ];
  }

  return items.flatMap((item, i) => [base("rectangle", 200, 120 + i * 96, 500, 70), textEl(item, 220, 145 + i * 96)]);
}

export function AiDiagramPrompt({ onGenerateElements }: Props) {
  const [prompt, setPrompt] = useState("");
  const [minimized, setMinimized] = useState(false);
  const canGenerate = useMemo(() => prompt.trim().length > 0, [prompt]);

  if (minimized) {
    return (
      <button
        className="pointer-events-auto absolute right-2 top-2 z-30 flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white/90 shadow-md backdrop-blur"
        onClick={() => setMinimized(false)}
        title="Show AI Diagram"
      >
        <Sparkles className="h-4 w-4 text-indigo-500" />
      </button>
    );
  }

  return (
    <div className="pointer-events-auto absolute left-2 right-2 top-2 z-30 rounded-xl border border-slate-200 bg-white/95 p-2 shadow-lg backdrop-blur sm:left-1/2 sm:right-auto sm:w-[min(94%,780px)] sm:-translate-x-1/2">
      <div className="flex items-center gap-2">
        <Sparkles className="hidden h-4 w-4 shrink-0 text-indigo-500 sm:block" />
        <Input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe a diagram... (e.g., 'flowchart: idea → build → ship')"
          className="min-h-10 text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && canGenerate) { onGenerateElements(generate(prompt)); }
          }}
        />
        <Button size="sm" onClick={() => onGenerateElements(generate(prompt))} disabled={!canGenerate} className="shrink-0">
          Go
        </Button>
        <Button size="sm" variant="ghost" className="h-8 w-8 shrink-0 p-0" onClick={() => setMinimized(true)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
