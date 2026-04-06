"use client";

import { useCallback, useRef, useState } from "react";

export interface SpeechResult {
  text: string;
  listening: boolean;
  supported: boolean;
  start: () => void;
  stop: () => void;
}

interface SpeechAlternative {
  transcript: string;
}

interface SpeechResultItem {
  0: SpeechAlternative;
}

interface SpeechResultEvent {
  results: ArrayLike<SpeechResultItem>;
}

interface SpeechInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechCtor = new () => SpeechInstance;
type SpeechWindow = Window & {
  SpeechRecognition?: SpeechCtor;
  webkitSpeechRecognition?: SpeechCtor;
};

export function useSpeechRecognition(lang = "en-US"): SpeechResult {
  const [text, setText] = useState("");
  const [listening, setListening] = useState(false);
  const supported =
    typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
  const recognitionRef = useRef<SpeechInstance | null>(null);

  const start = useCallback(() => {
    if (!supported) {
      return;
    }
    const win = window as SpeechWindow;
    const SR = win.SpeechRecognition || win.webkitSpeechRecognition;
    if (!SR) {
      return;
    }
    const recognition = new SR();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results)
        .map((result) => result[0].transcript)
        .join("");
      setText(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [supported, lang]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  return { listening, start, stop, supported, text };
}
