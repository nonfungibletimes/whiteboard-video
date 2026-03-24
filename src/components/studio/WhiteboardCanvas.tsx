import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { memo, useCallback, useRef } from "react";

interface Props {
  theme: "light" | "dark";
  onCanvasReady: (canvas: HTMLCanvasElement | null) => void;
  onSceneChange: (data: { elements: unknown[]; appState: Record<string, unknown>; files: Record<string, unknown> }) => void;
  initialData?: {
    elements: unknown[];
    appState?: Record<string, unknown>;
    files?: Record<string, unknown>;
  };
}

export const WhiteboardCanvas = memo(function WhiteboardCanvas({ theme, onCanvasReady, onSceneChange, initialData }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const onSceneChangeRef = useRef(onSceneChange);
  onSceneChangeRef.current = onSceneChange;

  const reportCanvas = useCallback(() => {
    const canvas = wrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    onCanvasReady(canvas);
  }, [onCanvasReady]);

  // Stable onChange handler — avoids re-render loops from Excalidraw's frequent calls
  const handleChange = useCallback((elements: unknown, appState: unknown, files: unknown) => {
    onSceneChangeRef.current({
      elements: elements as unknown[],
      appState: appState as unknown as Record<string, unknown>,
      files: files as unknown as Record<string, unknown>,
    });
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full" onMouseEnter={reportCanvas}>
      <Excalidraw
        theme={theme}
        initialData={initialData as never}
        onChange={handleChange}
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
