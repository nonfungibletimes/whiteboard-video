import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { useCallback, useRef } from "react";

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

export function WhiteboardCanvas({ theme, onCanvasReady, onSceneChange, initialData }: Props) {
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const reportCanvas = useCallback(() => {
    const canvas = wrapRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    onCanvasReady(canvas);
  }, [onCanvasReady]);

  return (
    <div ref={wrapRef} className="h-full w-full" onMouseEnter={reportCanvas}>
      <Excalidraw
        theme={theme}
        initialData={initialData as never}
        onChange={(elements, appState, files) =>
          onSceneChange({
            elements: elements as unknown[],
            appState: appState as unknown as Record<string, unknown>,
            files: files as unknown as Record<string, unknown>,
          })
        }
      >
        <MainMenu>
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ChangeCanvasBackground />
          <MainMenu.DefaultItems.SaveToActiveFile />
        </MainMenu>
      </Excalidraw>
    </div>
  );
}
