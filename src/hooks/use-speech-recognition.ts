import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: any) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldRestartRef = useRef(false);

  const isSupported = useMemo(() => {
    return typeof window !== "undefined" && !!((window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition || (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition);
  }, []);

  useEffect(() => {
    if (!isSupported) return;

    const Ctor = (window as Window & { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }).SpeechRecognition
      || (window as Window & { webkitSpeechRecognition?: SpeechRecognitionCtor }).webkitSpeechRecognition;

    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let finalText = "";
      let interimText = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const segment = event.results[i]?.[0]?.transcript ?? "";
        if (event.results[i].isFinal) finalText += `${segment} `;
        else interimText += segment;
      }

      setTranscript((prev) => {
        const merged = `${prev} ${finalText} ${interimText}`.replace(/\s+/g, " ").trim();
        const words = merged.split(" ");
        return words.slice(-24).join(" "); // ~2 caption lines
      });
    };

    recognition.onend = () => {
      setIsListening(false);
      if (shouldRestartRef.current) {
        try {
          recognition.start();
          setIsListening(true);
        } catch {
          // noop
        }
      }
    };

    recognition.onerror = () => {
      // keep silent; unsupported/mic errors are expected in some browsers
    };

    recognitionRef.current = recognition;

    return () => {
      shouldRestartRef.current = false;
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [isSupported]);

  const start = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    shouldRestartRef.current = true;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      // noop
    }
  }, []);

  const stop = useCallback(() => {
    shouldRestartRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { transcript, isListening, start, stop, isSupported };
}
