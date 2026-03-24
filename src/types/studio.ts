export type OutputFormat = "landscape" | "portrait" | "square";

export type LayoutMode =
  | "pip-br"
  | "pip-bl"
  | "pip-tr"
  | "pip-tl"
  | "side-by-side"
  | "board-only";

export type RecorderStatus = "idle" | "countdown" | "recording" | "paused" | "stopped";

export interface SavedTemplate {
  id: string;
  name: string;
  createdAt: number;
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}
