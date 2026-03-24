import { useCallback, useState } from "react";

export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeBackground = useCallback(async (imageBlob: Blob): Promise<Blob> => {
    setIsProcessing(true);
    setError(null);

    try {
      const module = await import("@imgly/background-removal");
      const result: unknown = await module.removeBackground(imageBlob);

      if (result instanceof Blob) {
        return result;
      }

      if (result instanceof ArrayBuffer) {
        return new Blob([result], { type: "image/png" });
      }

      return new Blob([result as BlobPart], { type: "image/png" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Background removal failed.";
      setError(message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { removeBackground, isProcessing, error };
}
