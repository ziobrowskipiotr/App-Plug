import { useState, useCallback } from "react";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";

interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string, isFinal?: boolean) => void;
  onError?: (error: Error) => void;
}

interface SpeechRecognitionResultEvent {
  results: { transcript: string; confidence?: number }[];
  isFinal?: boolean;
}

export const useSpeechRecognition = (
  options: SpeechRecognitionOptions = {}
) => {
  const {
    continuous = false,
    interimResults = true,
    lang = "en-US",
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isFinal, setIsFinal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle speech recognition events using the hook
  useSpeechRecognitionEvent("start", () => {
    setIsListening(true);
    setError(null);
    setIsFinal(false);
  });

  useSpeechRecognitionEvent("end", () => {
    setIsListening(false);
    setIsFinal(true);
    // Final result is already set in the 'result' event handler
  });

  useSpeechRecognitionEvent("result", (event: SpeechRecognitionResultEvent) => {
    if (event.results && event.results.length > 0) {
      // Get the most recent result
      const latestResult = event.results[event.results.length - 1];
      const transcriptText = latestResult.transcript || "";

      if (transcriptText) {
        setTranscript(transcriptText);
        // Call onResult callback
        onResult?.(transcriptText, event.isFinal ?? false);

        if (event.isFinal) {
          setIsFinal(true);
        }
      }
    }
  });

  useSpeechRecognitionEvent("error", (event) => {
    const errorMessage =
      (event as any).message ||
      (event as any).error?.message ||
      "Speech recognition error";
    setError(errorMessage);
    setIsListening(false);

    const errorObj = new Error(errorMessage);
    onError?.(errorObj);
    console.error("Speech recognition error:", event.error || errorMessage);
  });

  const startListening = useCallback(async () => {
    try {
      setTranscript("");
      setError(null);
      setIsFinal(false);

      const { granted } =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!granted) {
        const errorMsg = "Microphone permission was denied";
        setError(errorMsg);
        onError?.(new Error(errorMsg));
        return;
      }

      const isAvailable = ExpoSpeechRecognitionModule.isRecognitionAvailable();
      if (!isAvailable) {
        const errorMsg = "Speech recognition is not available on this device";
        setError(errorMsg);
        onError?.(new Error(errorMsg));
        return;
      }

      await ExpoSpeechRecognitionModule.start({
        lang,
        continuous,
        interimResults,
      });
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to start speech recognition";
      setError(errorMsg);
      setIsListening(false);
      onError?.(new Error(errorMsg));
      console.error("Failed to start listening:", err);
    }
  }, [lang, continuous, interimResults, onError]);

  const stopListening = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
      setIsListening(false);
      setIsFinal(true);
    } catch (err: any) {
      const errorMsg = err?.message || "Failed to stop speech recognition";
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      console.error("Failed to stop listening:", err);
    }
  }, [onError]);

  const cancel = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.cancel();
      setIsListening(false);
      setTranscript("");
      setIsFinal(false);
    } catch (err: any) {
      console.error("Failed to cancel listening:", err);
    }
  }, []);

  const abort = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    isListening,
    transcript,
    isFinal,
    error,
    startListening,
    stopListening,
    cancel,
    abort,
  };
};
