import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { memo, useCallback, useEffect, useRef } from "react";
import type { PenThickness } from "@/components/studio/StudioSettingsPanel";

interface Props {
  theme: "light" | "dark";
  penColor: string;
  penThickness: PenThickness;
  backgroundColor: string;
  showGrid: boolean;
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onSceneChange: (data: { elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }) => void;
  onApiReady?: (api: any) => void;
  initialData?: {
    elements: unknown[];
    appState?: Record<string, unknown>;
    files?: Record<string, unknown>;
  };
}

const THICKNESS_VALUE: Record<PenThickness, number> = {
  thin: 1,
  medium: 2,
  thick: 4,
};

export const WhiteboardCanvas = memo(function WhiteboardCanvas({
  theme,
  penColor,
  penThickness,
  backgroundColor,
  showGrid,
  onCanvasReady,
  onSceneChange,
  onApiReady,
  initialData,
}: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const excalidrawApiRef = useRef<any>(null);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  // Track whether we've done the initial load
  const hasLoadedInitialRef = useRef(false);

  const reportCanvas = useCallback(() => {
    const canvas = wrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    onCanvasReady(canvas);
  }, [onCanvasReady]);

  const handleApiReady = useCallback((api: unknown) => {
    excalidrawApiRef.current = api;
    onApiReady?.(api as any);
    reportCanvas();
  }, [onApiReady, reportCanvas]);

  // Stable onChange handler — avoids re-render loops from Excalidraw's frequent calls
  const handleChange = useCallback((elements: unknown, appState: unknown, files: unknown) => {
    onSceneChangeRef.current({
      elements: elements as unknown[],
      appState: appState as unknown as Record<string, unknown>,
      files: files as unknown as Record<string, unknown>,
    });
  }, []);

  // Update settings WITHOUT resetting elements — this is the fix for background
  // overwriting your drawing
  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api) return;

    const currentAppState = api.getAppState?.() ?? {};
    api.updateScene?.({
      appState: {
        ...currentAppState,
        currentItemStrokeColor: penColor,
        currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
        viewBackgroundColor: backgroundColor,
        gridSize: showGrid ? 20 : null,
      },
    });
  }, [backgroundColor, penColor, penThickness, showGrid]);

  // Load initial data / slide changes — ONLY when initialData actually changes
  // (not when pen color or background changes!)
  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api || !initialData) return;

    // Skip if this is just the first render (Excalidraw handles that via initialData prop)
    if (!hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      return;
    }

    const currentAppState = api.getAppState?.() ?? {};
    api.updateScene?.({
      elements: initialData.elements ?? [],
      appState: {
        ...currentAppState,
        ...(initialData.appState ?? {}),
        viewBackgroundColor: backgroundColor,
      },
      files: initialData.files ?? {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]); // Only re-run when initialData changes (slide switch, template load)

  return (
    <div ref={wrapRef} className="h-full w-full touch-none" onMouseEnter={reportCanvas}>
      <Excalidraw
        theme={theme}
        initialData={{
          ...(initialData ?? { elements: [] }),
          appState: {
            ...(initialData?.appState ?? {}),
            currentItemStrokeColor: penColor,
            currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
            viewBackgroundColor: backgroundColor,
            gridSize: showGrid ? 20 : null,
          },
        } as never}
        onChange={handleChange}
        excalidrawAPI={handleApiReady}
      >
        <MainMenu>
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.DefaultItems.SaveToActiveFile />
        </MainMenu>
      </Excalidraw>
    </div>
  );
});
