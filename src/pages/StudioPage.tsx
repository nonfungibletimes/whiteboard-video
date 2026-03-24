import { Captions, Image as ImageIcon, Link2, Menu, MonitorPlay, Settings2, Wand2 } from "lucide-react";
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
import { CameraEffectsPanel } from "@/components/studio/CameraEffectsPanel";
import { useWebcam } from "@/hooks/use-webcam";
import { useWhiteboardRecorder } from "@/hooks/use-whiteboard-recorder";
import { useCameraEffects, type CameraEffect } from "@/hooks/use-camera-effects";
import type { LayoutMode, OutputFormat, SavedTemplate } from "@/types/studio";
import { Button } from "@/components/ui/button";
import { Teleprompter } from "@/components/studio/Teleprompter";
import { CaptionOverlay } from "@/components/studio/CaptionOverlay";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { SlideNav, type SlideItem } from "@/components/studio/SlideNav";
import { AiDiagramPrompt } from "@/components/studio/AiDiagramPrompt";
import { ImageFinder } from "@/components/studio/ImageFinder";
import { useBackgroundRemoval } from "@/hooks/use-background-removal";
import { useBreakpoint } from "@/hooks/use-breakpoint";

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

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth || 800, height: img.naturalHeight || 600 });
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to parse blob"));
    reader.readAsDataURL(blob);
  });
}

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
  const [cameraEffect, setCameraEffect] = useState<CameraEffect>("none");
  const [cameraBgColor, setCameraBgColor] = useState("#00FF00");
  const [cameraBgImageUrl, setCameraBgImageUrl] = useState<string | undefined>(undefined);
  const [cameraBlurRadius, setCameraBlurRadius] = useState(15);
  const [isExportOpen, setIsExportOpen] = useState(true);

  const [showTeleprompter, setShowTeleprompter] = useState(false);
  const [teleprompterScript, setTeleprompterScript] = useState("");
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [showImageFinder, setShowImageFinder] = useState(false);
  const [latestFinderImage, setLatestFinderImage] = useState<{ dataUrl: string; name: string } | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"templates" | "settings" | null>(null);
  const [showMobileTools, setShowMobileTools] = useState(false);

  const [slides, setSlides] = useState<SlideItem[]>(() => loadSlides());
  const [activeSlideId, setActiveSlideId] = useState<string>("");

  const [boardCanvas, setBoardCanvas] = useState<HTMLCanvasElement | null>(null);
  const [webcamVideo, setWebcamVideo] = useState<HTMLVideoElement | null>(null);
  const sceneDataRef = useRef<{ elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }>({ elements: [], appState: {}, files: {} });
  const [initialData, setInitialData] = useState<{ elements: unknown[]; appState?: Record<string, unknown>; files?: Record<string, unknown> }>({ elements: [], appState: {}, files: {} });
  const [templates, setTemplates] = useState<SavedTemplate[]>(loadTemplates);
  const excalidrawApiRef = useRef<any>(null);

  const { transcript, isSupported: captionsSupported, start: startCaptions, stop: stopCaptions } = useSpeechRecognition();
  const { isMobile, isTablet } = useBreakpoint();
  const { stream, enableWebcam, disableWebcam } = useWebcam();
  const { removeBackground, isProcessing: isRemovingLatestBg } = useBackgroundRemoval();
  const { processedCanvas, isLoading: effectsLoading, error: effectsError } = useCameraEffects({
    effect: stream ? cameraEffect : "none",
    webcamVideo,
    bgColor: cameraBgColor,
    bgImageUrl: cameraBgImageUrl,
    blurRadius: cameraBlurRadius,
  });

  const recorder = useWhiteboardRecorder({
    format,
    layout,
    boardCanvas,
    webcamVideo,
    processedCanvas: cameraEffect !== "none" ? processedCanvas : null,
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

  useEffect(() => {
    if (!isMobile) {
      setMobilePanel(null);
      setShowMobileTools(false);
    }
  }, [isMobile]);

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

  const addImageToCanvas = useCallback(async (dataUrl: string, mimeType: string, name?: string) => {
    const api = excalidrawApiRef.current;
    if (!api) return;

    const { width, height } = await getImageSize(dataUrl);
    const maxWidth = 420;
    const scale = width > maxWidth ? maxWidth / width : 1;
    const finalWidth = Math.max(80, Math.round(width * scale));
    const finalHeight = Math.max(80, Math.round(height * scale));

    const fileId = crypto.randomUUID();
    const now = Date.now();

    api.addFiles?.([
      {
        id: fileId,
        dataURL: dataUrl,
        mimeType,
        created: now,
        lastRetrieved: now,
        size: dataUrl.length,
        name: name ?? "image",
      },
    ]);

    const existing = (api.getSceneElements?.() ?? []) as Record<string, unknown>[];

    const imageElement = {
      id: crypto.randomUUID(),
      type: "image",
      x: 120,
      y: 120,
      width: finalWidth,
      height: finalHeight,
      angle: 0,
      strokeColor: "transparent",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 1,
      strokeStyle: "solid",
      roughness: 0,
      opacity: 100,
      groupIds: [],
      frameId: null,
      roundness: null,
      seed: Math.floor(Math.random() * 1_000_000),
      version: 1,
      versionNonce: Math.floor(Math.random() * 1_000_000),
      isDeleted: false,
      boundElements: null,
      updated: now,
      link: null,
      locked: false,
      fileId,
      scale: [1, 1],
      status: "saved",
    };

    api.updateScene?.({
      elements: [...existing, imageElement],
      appState: api.getAppState?.() ?? {},
      files: api.getFiles?.() ?? {},
    });
  }, []);

  const removeBgFromLatest = useCallback(async () => {
    if (!latestFinderImage) return;
    const blob = await fetch(latestFinderImage.dataUrl).then((r) => r.blob());
    const result = await removeBackground(blob);
    const dataUrl = await blobToDataUrl(result);
    setLatestFinderImage({ dataUrl, name: `${latestFinderImage.name.replace(/\.[^/.]+$/, "")}-no-bg.png` });
  }, [latestFinderImage, removeBackground]);

  const canvasAspectClass = useMemo(() => FORMAT_CLASS[format], [format]);

  return (
    <main className="h-screen overflow-hidden bg-slate-100 text-slate-900">
      <header className="space-y-2 border-b border-slate-200 bg-white px-3 py-2 md:px-4 md:py-3">
        <div className="flex items-center justify-between gap-2">
          <Link to="/" className="truncate text-sm font-semibold sm:text-base">WhiteBoard Video</Link>
          {isMobile && (
            <Button variant="outline" size="sm" className="min-h-11 min-w-11" onClick={() => setShowMobileTools((p) => !p)} aria-label="Toggle tools">
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <RecordingControls
            status={recorder.status}
            countdown={recorder.countdown}
            duration={recorder.duration}
            onStart={recorder.startRecorder}
            onPause={recorder.pauseRecorder}
            onResume={recorder.resumeRecorder}
            onStop={recorder.stopRecorder}
          />
        </div>

        <div className={`flex items-center gap-2 overflow-x-auto pb-1 ${isMobile && !showMobileTools ? "hidden" : ""}`}>
          <FormatSelector value={format} onChange={setFormat} />
          <LayoutSelector value={layout} onChange={setLayout} />
          <Button variant="outline" size={isTablet ? "sm" : "default"} className="min-h-11 shrink-0" onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>{theme === "light" ? "Dark UI" : "Light UI"}</Button>
          <Button variant={showImageFinder ? "default" : "outline"} size={isTablet ? "sm" : "default"} className="min-h-11 shrink-0" onClick={() => setShowImageFinder((p) => !p)}><ImageIcon className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Images</span></Button>
          <Button variant={showTeleprompter ? "default" : "outline"} size={isTablet ? "sm" : "default"} className="min-h-11 shrink-0" onClick={() => setShowTeleprompter((p) => !p)}><MonitorPlay className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Teleprompter</span></Button>
          <Button variant={captionsEnabled ? "default" : "outline"} size={isTablet ? "sm" : "default"} className="min-h-11 shrink-0" disabled={!captionsSupported} onClick={() => setCaptionsEnabled((p) => !p)}><Captions className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">CC</span></Button>
          <Button variant="outline" size={isTablet ? "sm" : "default"} className="min-h-11 shrink-0" onClick={persistCurrentSlide}><Link2 className="h-4 w-4 md:mr-1" /><span className="hidden md:inline">Save Slide</span></Button>
          {isMobile && <Button variant="outline" className="min-h-11 shrink-0" onClick={() => setMobilePanel("templates")}>Templates</Button>}
          {isMobile && <Button variant="outline" className="min-h-11 shrink-0" onClick={() => setMobilePanel("settings")}><Settings2 className="mr-1 h-4 w-4" />Settings</Button>}
        </div>
      </header>

      <section className="relative h-[calc(100vh-122px)] p-2 sm:p-4">
        {!isMobile && <div className="absolute inset-y-4 left-4 z-30 w-[220px] space-y-3 lg:left-8 lg:w-[280px]">
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
          {stream && (
            <CameraEffectsPanel
              effect={cameraEffect}
              onEffectChange={setCameraEffect}
              bgColor={cameraBgColor}
              onBgColorChange={setCameraBgColor}
              bgImageUrl={cameraBgImageUrl}
              onBgImageUrlChange={setCameraBgImageUrl}
              blurRadius={cameraBlurRadius}
              onBlurRadiusChange={setCameraBlurRadius}
              isLoading={effectsLoading}
            />
          )}
          {latestFinderImage && (
            <Button size="sm" variant="outline" className="w-full min-h-11" onClick={() => void removeBgFromLatest()} disabled={isRemovingLatestBg}>
              <Wand2 className="mr-2 h-4 w-4" />
              {isRemovingLatestBg ? "Removing background..." : "Remove BG (latest image)"}
            </Button>
          )}
          {effectsError && <p className="rounded bg-amber-50 p-2 text-xs text-amber-700">{effectsError}</p>}
          {recorder.error && <p className="rounded bg-red-50 p-2 text-xs text-red-600">{recorder.error}</p>}
        </div>}

        {isMobile && mobilePanel && (
          <div className="fixed inset-0 z-50 bg-slate-950/40 p-2">
            <div className="h-full overflow-y-auto rounded-2xl bg-white p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">{mobilePanel === "templates" ? "Templates" : "Settings"}</p>
                <Button variant="ghost" className="min-h-11 min-w-11" onClick={() => setMobilePanel(null)}>Close</Button>
              </div>
              {mobilePanel === "templates" ? (
                <TemplateManager templates={templates} onSave={saveTemplate} onLoad={loadTemplate} onDelete={deleteTemplate} />
              ) : (
                <div className="space-y-3">
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
                  {stream && (
                    <CameraEffectsPanel
                      effect={cameraEffect}
                      onEffectChange={setCameraEffect}
                      bgColor={cameraBgColor}
                      onBgColorChange={setCameraBgColor}
                      bgImageUrl={cameraBgImageUrl}
                      onBgImageUrlChange={setCameraBgImageUrl}
                      blurRadius={cameraBlurRadius}
                      onBlurRadiusChange={setCameraBlurRadius}
                      isLoading={effectsLoading}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {showImageFinder && (
          <ImageFinder
            visible={showImageFinder}
            onClose={() => setShowImageFinder(false)}
            onAddImage={(dataUrl: string, mimeType: string, name?: string) => {
              void addImageToCanvas(dataUrl, mimeType, name ?? "finder-image");
              setLatestFinderImage({ dataUrl, name: name ?? "finder-image" });
            }}
          />
        )}

        <div className="flex h-full items-center justify-center px-2 pb-[154px] sm:px-4 md:px-8 lg:px-[300px]">
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

        <WebcamPiP
          webcamStream={stream}
          onEnable={enableWebcam}
          onDisable={disableWebcam}
          onVideoRef={setWebcamVideo}
          layout={layout}
          format={format}
          processedCanvas={cameraEffect !== "none" ? processedCanvas : null}
        />
      </section>

      {recorder.recordedBlob && isExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-2 sm:p-4">
          <ExportPanel blob={recorder.recordedBlob} onClose={() => setIsExportOpen(false)} onDownloadWebm={() => recorder.downloadRecording("webm")} onDownloadMp4={() => recorder.downloadRecording("mp4")} />
        </div>
      )}
    </main>
  );
}
