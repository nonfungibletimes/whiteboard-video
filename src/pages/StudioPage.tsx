import { Captions, Link2, MonitorPlay } from "lucide-react";
import { Link } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { WhiteboardCanvas } from "@/components/studio/WhiteboardCanvas";
import { FormatSelector } from "@/components/studio/FormatSelector";
import { LayoutSelector } from "@/components/studio/LayoutSelector";
import { RecordingControls } from "@/components/studio/RecordingControls";
import { WebcamPiP } from "@/components/studio/WebcamPiP";
import { TemplateManager } from "@/components/studio/TemplateManager";
import { ExportPanel } from "@/components/studio/ExportPanel";
import { StudioSettingsPanel, type PenThickness, type RecordingQuality } from "@/components/studio/StudioSettingsPanel";
import { useWebcam } from "@/hooks/use-webcam";
import { useWhiteboardRecorder } from "@/hooks/use-whiteboard-recorder";
import type { LayoutMode, OutputFormat, SavedTemplate } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { Teleprompter } from "@/components/studio/Teleprompter";
import { CaptionOverlay } from "@/components/studio/CaptionOverlay";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { SlideNav, type SlideItem } from "@/components/studio/SlideNav";
import { AiDiagramPrompt } from "@/components/studio/AiDiagramPrompt";

const TEMPLATE_KEY = "wb-video-templates-v1";
const SLIDES_KEY = "wb-video-slides-v1";

function loadTemplates(): SavedTemplate[] {
  try {
    return JSON.parse(localStorage.getItem(TEMPLATE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function loadSlides(): SlideItem[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(SLIDES_KEY) ?? "[]") as SlideItem[];
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // noop
  }
  return [{ id: crypto.randomUUID(), elements: [], appState: {}, files: {} }];
}

const FORMAT_CLASS: Record<OutputFormat, string> = {
  landscape: "aspect-[16/9] h-full w-auto max-h-full max-w-full",
  portrait: "aspect-[9/16] h-full w-auto max-h-full max-w-full",
  square: "aspect-square h-full w-auto max-h-full max-w-full",
};

export function StudioPage() {
  const [format, setFormat] = useState<OutputFormat>("landscape");
  const [layout, setLayout] = useState<LayoutMode>("pip-br");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [penColor, setPenColor] = useState("#1e293b");
  const [penThickness, setPenThickness] = useState<PenThickness>("medium");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showGrid, setShowGrid] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState<0 | 3 | 5>(3);
  const [recordingQuality, setRecordingQuality] = useState<RecordingQuality>("standard");
  const [isExportOpen, setIsExportOpen] = useState(true);

  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterScript, setTeleprompterScript] = useState("");
  const [captionsEnabled, setCaptionsEnabled] = useState(false);

  const [slides, setSlides] = useState<SlideItem[]>(() => loadSlides());
  const [activeSlideId, setActiveSlideId] = useState<string>("");

  const [boardCanvas, setBoardCanvas] = useState<HTMLCanvasElement | null>(null);
  const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement | null>(null);
  const sceneDataRef = useRef<{ elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }>({ elements: [], appState: {}, files: {} });
  const [initialData, setInitialData] = useState<{ elements: unknown[]; appState?: Record<string, unknown>; files?: Record<string, unknown> }>({ elements: [], appState: {}, files: {} });
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const excalidrawApiRef = useRef<any>(null);

  const { transcript, isSupported: captionsSupported, start: startCaptions, stop: stopCaptions } = useSpeechRecognition();
  const { stream, enableWebcam, disableWebcam } = useWebcam();

  const recorder = useWhiteboardRecorder({
    format,
    layout,
    boardCanvas,
    webcamVideo,
    boardBackground: backgroundColor,
    countdownSeconds,
    recordingQuality,
    captionsEnabled,
    captionText: transcript,
  });

  useEffect(() => {
    localStorage.setItem(SLIDES_KEY, JSON.stringify(slides));
  }, [slides]);

  useEffect(() => {
    if (!activeSlideId && slides.length > 0) {
      setActiveSlideId(slides[0].id);
      setInitialData({ elements: slides[0].elements, appState: slides[0].appState, files: slides[0].files });
    }
  }, [activeSlideId, slides]);

  useEffect(() => {
    if (recorder.status === "recording" && captionsEnabled && captionsSupported) startCaptions();
    if (recorder.status !== "recording") stopCaptions();
  }, [captionsEnabled, captionsSupported, recorder.status, startCaptions, stopCaptions]);

  useEffect(() => {
    if (recorder.recordedBlob) setIsExportOpen(true);
  }, [recorder.recordedBlob]);

  const persistCurrentSlide = useCallback(() => {
    setSlides((prev) => prev.map((slide) => (slide.id === activeSlideId ? { ...slide, ...sceneDataRef.current } : slide)));
  }, [activeSlideId]);

  const handleSceneChange = useCallback((data: { elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }) => {
    sceneDataRef.current = data;
  }, []);

  const saveTemplate = (name: string) => {
    const scene = sceneDataRef.current;
    const next: SavedTemplate[] = [
      { id: crypto.randomUUID(), name, createdAt: Date.now(), elements: scene.elements, appState: scene.appState, files: scene.files },
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

  const selectSlide = useCallback((id: string) => {
    setSlides((prev) => {
      const updated = prev.map((slide) => (slide.id === activeSlideId ? { ...slide, ...sceneDataRef.current } : slide));
      const target = updated.find((s) => s.id === id);
      if (target) {
        setActiveSlideId(id);
        setInitialData({ elements: target.elements, appState: target.appState, files: target.files });
      }
      return updated;
    });
  }, [activeSlideId]);

  const addSlide = useCallback(() => {
    setSlides((prev) => {
      if (prev.length >= 20) return prev;
      const next = [...prev.map((slide) => (slide.id === activeSlideId ? { ...slide, ...sceneDataRef.current } : slide)), { id: crypto.randomUUID(), elements: [], appState: {}, files: {} }];
      setActiveSlideId(next[next.length - 1].id);
      setInitialData({ elements: [], appState: {}, files: {} });
      return next;
    });
  }, [activeSlideId]);

  const deleteSlide = useCallback((id: string) => {
    setSlides((prev) => {
      if (prev.length <= 1) return prev;
      if (!window.confirm("Delete this slide?")) return prev;
      const filtered = prev.filter((s) => s.id !== id);
      if (activeSlideId === id) {
        const fallback = filtered[0];
        setActiveSlideId(fallback.id);
        setInitialData({ elements: fallback.elements, appState: fallback.appState, files: fallback.files });
      }
      return filtered;
    });
  }, [activeSlideId]);

  const moveSlide = useCallback((id: string, dir: -1 | 1) => {
    setSlides((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      const nextIdx = idx + dir;
      if (idx < 0 || nextIdx < 0 || nextIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[nextIdx]] = [copy[nextIdx], copy[idx]];
      return copy;
    });
  }, []);

  const appendGeneratedElements = useCallback((newElements: Record<string, unknown>[]) => {
    const api = excalidrawApiRef.current;
    if (!api) return;
    const existing = (api.getSceneElements?.() ?? []) as Record<string, unknown>[];
    const appState = api.getAppState?.() ?? {};
    const files = api.getFiles?.() ?? {};
    api.updateScene?.({ elements: [...existing, ...newElements], appState, files });
  }, []);

  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  const canvasAspectClass = useMemo(() => FORMAT_CLASS[format], [format]);

  return (
    <main className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-semibold">WhiteBoard Video</Link>
          <FormatSelector value={format} onChange={setFormat} />
          <LayoutSelector value={layout} onChange={setLayout} />
          <Button variant="outline" size="sm" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>{theme === "light" ? "Dark UI" : "Light UI"}</Button>
          <Button variant={showTeleprompter ? "default" : "outline"} size="sm" onClick={() => setShowTeleprompter((p) => !p)}><MonitorPlay className="mr-1 h-4 w-4" />Teleprompter</Button>
          <Button variant={captionsEnabled ? "default" : "outline"} size="sm" disabled={!captionsSupported} onClick={() => setCaptionsEnabled((p) => !p)}><Captions className="mr-1 h-4 w-4" />CC</Button>
          <Button variant="outline" size="sm" onClick={persistCurrentSlide}><Link2 className="mr-1 h-4 w-4" />Save Slide</Button>
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
        <div className="absolute inset-y-4 left-8 z-30 w-[280px] space-y-3">
          <TemplateManager templates={templates} onSave={saveTemplate} onLoad={loadTemplate} onDelete={deleteTemplate} />
          <StudioSettingsPanel
            penColor={penColor}
            onPenColorChange={setPenColor}
            penThickness={penThickness}
            onPenThicknessChange={setPenThickness}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={setBackgroundColor}
            showGrid={showGrid}
            onShowGridChange={setShowGrid}
            countdownSeconds={countdownSeconds}
            onCountdownChange={setCountdownSeconds}
            recordingQuality={recordingQuality}
            onRecordingQualityChange={setRecordingQuality}
          />
          {recorder.error && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{recorder.error}</p>}
        </div>

        <div className="flex h-full items-center justify-center px-[300px] pb-[88px]">
          <div className={`mx-auto ${canvasAspectClass}`}>
            <div className="relative h-full overflow-hidden rounded-xl border border-slate-200 bg-white">
              <AiDiagramPrompt onGenerateElements={appendGeneratedElements} />
              <WhiteboardCanvas
                theme={theme}
                penColor={penColor}
                penThickness={penThickness}
                backgroundColor={backgroundColor}
                showGrid={showGrid}
                onCanvasReady={setBoardCanvas}
                onSceneChange={handleSceneChange}
                onApiReady={(api) => {
                  excalidrawApiRef.current = api;
                }}
                initialData={initialData}
              />
              <CaptionOverlay text={transcript} visible={captionsEnabled && recorder.status === "recording"} />
            </div>
          </div>
        </div>

        <SlideNav
          slides={slides}
          activeSlideId={activeSlideId}
          onAdd={addSlide}
          onSelect={selectSlide}
          onDelete={deleteSlide}
          onMoveLeft={(id) => moveSlide(id, -1)}
          onMoveRight={(id) => moveSlide(id, 1)}
        />

        <Teleprompter visible={showTeleprompter} script={teleprompterScript} onScriptChange={setTeleprompterScript} isRecording={recorder.status === "recording"} />

        <WebcamPiP webcamStream={stream} onEnable={enableWebcam} onDisable={disableWebcam} hidden={isMobile} onVideoRef={setWebcamVideo} />
      </section>

      {recorder.recordedBlob && isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
          <ExportPanel blob={recorder.recordedBlob} onClose={() => setIsExportOpen(false)} onDownloadWebm={() => recorder.downloadRecording("webm")} onDownloadMp4={() => recorder.downloadRecording("mp4")} />
        </div>
      )}
    </main>
  );
}
