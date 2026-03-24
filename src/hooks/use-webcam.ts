import { useCallback, useEffect, useState } from "react";

interface WebcamState {
  stream: MediaStream | null;
  isEnabled: boolean;
  error: string | null;
}

export function useWebcam() {
  const [state, setState] = useState<WebcamState>({
    stream: null,
    isEnabled: false,
    error: null,
  });

  const enableWebcam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30, max: 30 },
        },
        audio: false,
      });

      setState({ stream, isEnabled: true, error: null });
      return stream;
    } catch {
      setState({ stream: null, isEnabled: false, error: "Webcam permission denied or unavailable." });
      return null;
    }
  }, []);

  const disableWebcam = useCallback(() => {
    setState((prev) => {
      prev.stream?.getTracks().forEach((track) => track.stop());
      return { stream: null, isEnabled: false, error: null };
    });
  }, []);

  useEffect(() => {
    return () => {
      state.stream?.getTracks().forEach((track) => track.stop());
    };
  }, [state.stream]);

  return { ...state, enableWebcam, disableWebcam };
}
