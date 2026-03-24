import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
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

  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api || !initialData) return;

    const currentAppState = api.getAppState?.() ?? {};
    api.updateScene?.({
      elements: initialData.elements ?? [],
      appState: {
        ...currentAppState,
        ...(initialData.appState ?? {}),
        currentItemStrokeColor: penColor,
        currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
        viewBackgroundColor: backgroundColor,
        gridSize: showGrid ? 20 : null,
      },
      files: initialData.files ?? {},
    });
  }, [backgroundColor, initialData, penColor, penThickness, showGrid]);

  const mergedInitialData = useMemo(() => ({
    ...(initialData ?? { elements: [] }),
    appState: {
      ...(initialData?.appState ?? {}),
      currentItemStrokeColor: penColor,
      currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
      viewBackgroundColor: backgroundColor,
      gridSize: showGrid ? 20 : null,
    },
  }), [backgroundColor, initialData, penColor, penThickness, showGrid]);

  return (
    <div ref={wrapRef} className="h-full w-full touch-none" onMouseEnter={reportCanvas}>
      <Excalidraw
        theme={theme}
        initialData={mergedInitialData as never}
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
