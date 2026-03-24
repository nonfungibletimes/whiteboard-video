import { Link } from "react-router-dom";
import { useCallback, useRef, useState } from "react";
import { WhiteboardCanvas } from "@/components/studio/WhiteboardCanvas";
import { FormatSelector } from "@/components/studio/FormatSelector";
import { LayoutSelector } from "@/components/studio/LayoutSelector";
import { RecordingControls } from "@/components/studio/RecordingControls";
import { WebcamPiP } from "@/components/studio/WebcamPiP";
import { TemplateManager } from "@/components/studio/TemplateManager";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { useWebcam } from "@/hooks/use-webcam";
import { useWhiteboardRecorder } from "@/hooks/use-whiteboard-recorder";
import type { LayoutMode, OutputFormat, SavedTemplate } from "@/types/studio";
import { Button } from "@/components/ui/button";

const TEMPLATE_KEY = "wb-video-templates-v1";

function loadTemplates(): SavedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function StudioPage() {
  const [format, setFormat] = useState<OutputFormat>("landscape");
  const [layout, setLayout] = useState<LayoutMode>("pip-br");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [boardCanvas, setBoardCanvas] = useState<HTMLCanvasElement | null>(null);
  const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement | null>(null);
  // Use ref for scene data — it changes constantly from Excalidraw onChange
  // and must NOT trigger re-renders (that causes infinite update loops)
  const sceneDataRef = useRef<{ elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }>({
    elements: [], appState: {}, files: {},
  });
  const [initialData, setInitialData] = useState<{ elements: unknown[]; appState?: Record<string, unknown>; files?: Record<string, unknown> }>();
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);

  const { stream, enableWebcam, disableWebcam } = useWebcam();

  const recorder = useWhiteboardRecorder({
    format,
    layout,
    boardCanvas,
    webcamVideo,
    boardBackground: theme,
  });

  const handleSceneChange = useCallback((data: { elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }) => {
    sceneDataRef.current = data;
  }, []);

  const saveTemplate = (name: string) => {
    const scene = sceneDataRef.current;
    const next: SavedTemplate[] = [
      {
        id: crypto.randomUUID(),
        name,
        createdAt: Date.now(),
        elements: scene.elements,
        appState: scene.appState,
        files: scene.files,
      },
      ...templates,
    ].slice(0, 20);
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next));
    setTemplates(next);
  };

  const loadTemplate = (id: string) => {
    const found = templates.find((t) => t.id === id);
    if (!found) return;
    setInitialData({ elements: found.elements, appState: found.appState, files: found.files });
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter((t) => t.id !== id);
    localStorage.setItem(TEMPLATE_KEY, JSON.stringify(next));
    setTemplates(next);
  };

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  return (
    <main className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold">WhiteBoard Video</Link>
          <FormatSelector value={format} onChange={setFormat} />
          <LayoutSelector value={layout} onChange={setLayout} />
          <Button variant="outline" size="sm" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>
            {theme === "light" ? "Dark canvas" : "Light canvas"}
          </Button>
        </div>
        <RecordingControls
          status={recorder.status}
          countdown={recorder.countdown}
          duration={recorder.duration}
          onStart={recorder.startRecorder}
          onPause={recorder.pauseRecorder}
          onResume={recorder.resumeRecorder}
          onStop={recorder.stopRecorder}
        />
      </header>

      <section className="relative h-[calc(100vh-65px)] p-4">
        <div className="h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <WhiteboardCanvas
            theme={theme}
            onCanvasReady={setBoardCanvas}
            onSceneChange={handleSceneChange}
            initialData={initialData}
          />
        </div>

        <div className="absolute left-8 top-8 z-30 w-[280px]">
          <TemplateManager templates={templates} onSave={saveTemplate} onLoad={loadTemplate} onDelete={deleteTemplate} />
          {recorder.error && <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-600">{recorder.error}</p>}
        </div>

        <WebcamPiP
          webcamStream={stream}
          onEnable={enableWebcam}
          onDisable={disableWebcam}
          hidden={isMobile}
          onVideoRef={setWebcamVideo}
        />
      </section>

      <div className="mx-4 mb-4 -mt-2">
        <ExportPanel
          blob={recorder.recordedBlob}
          onDownloadWebm={() => recorder.downloadRecording("webm")}
          onDownloadMp4={() => recorder.downloadRecording("mp4")}
        />
      </div>
    </main>
  );
}
