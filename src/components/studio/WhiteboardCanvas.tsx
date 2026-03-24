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

/**
 * Excalidraw requires appState.collaborators to be a Map.
 * JSON.stringify turns Maps into plain objects → crashes on reload.
 * This ensures it's always a Map no matter what comes in.
 */
function sanitizeAppState(appState: Record<string, unknown> | undefined): Record<string, unknown> {
  const safe = { ...(appState ?? {}) };
  // Always force collaborators to be an empty Map (we don't use collaboration)
  safe.collaborators = new Map();
  return safe;
}

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

  const handleChange = useCallback((elements: unknown, appState: unknown, files: unknown) => {
    onSceneChangeRef.current({
      elements: elements as unknown[],
      appState: appState as unknown as Record<string, unknown>,
      files: files as unknown as Record<string, unknown>,
    });
  }, []);

  // Update settings WITHOUT resetting elements
  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api) return;

    const currentAppState = api.getAppState?.() ?? {};
    api.updateScene?.({
      appState: {
        ...currentAppState,
        collaborators: new Map(),
        currentItemStrokeColor: penColor,
        currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
        viewBackgroundColor: backgroundColor,
        gridSize: showGrid ? 20 : null,
      },
    });
  }, [backgroundColor, penColor, penThickness, showGrid]);

  // Load initial data / slide changes
  useEffect(() => {
    const api = excalidrawApiRef.current;
    if (!api || !initialData) return;

    if (!hasLoadedInitialRef.current) {
      hasLoadedInitialRef.current = true;
      return;
    }

    const currentAppState = api.getAppState?.() ?? {};
    api.updateScene?.({
      elements: initialData.elements ?? [],
      appState: {
        ...currentAppState,
        ...sanitizeAppState(initialData.appState),
        viewBackgroundColor: backgroundColor,
      },
      files: initialData.files ?? {},
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  return (
    <div ref={wrapRef} className="h-full w-full touch-none" onMouseEnter={reportCanvas}>
      <Excalidraw
        theme={theme}
        initialData={{
          elements: initialData?.elements ?? [],
          appState: {
            ...sanitizeAppState(initialData?.appState),
            currentItemStrokeColor: penColor,
            currentItemStrokeWidth: THICKNESS_VALUE[penThickness],
            viewBackgroundColor: backgroundColor,
            gridSize: showGrid ? 20 : null,
          },
          files: initialData?.files ?? {},
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
