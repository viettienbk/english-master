'use client';

import { useState, useRef, useCallback } from 'react';

export interface SpeechRecognitionResult {
  transcript: string;
  isCorrect: boolean;
  score: number; // 0-100
}

function similarityScore(a: string, b: string): number {
  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z\s]/g, '');
  const na = normalize(a);
  const nb = normalize(b);
  if (na === nb) return 100;
  // Simple character-level similarity
  const longer = na.length > nb.length ? na : nb;
  const shorter = na.length > nb.length ? nb : na;
  if (longer.length === 0) return 100;
  const editDistance = levenshtein(na, nb);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b[i - 1] === a[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

export function useSpeechRecognition() {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const checkSupport = useCallback(() => {
    if (isSupported !== null) return isSupported;
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    setIsSupported(supported);
    return supported;
  }, [isSupported]);

  const startRecording = useCallback(
    (targetWord: string, onResult: (result: SpeechRecognitionResult) => void) => {
      if (!checkSupport()) {
        onResult({ transcript: '', isCorrect: false, score: 0 });
        return;
      }

      // Stop any existing session
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognitionAPI =
        (window as typeof window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as typeof window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) return;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 3;

      recognitionRef.current = recognition;
      setIsRecording(true);

      recognition.onresult = (event) => {
        const results = Array.from({ length: event.results[0].length }, (_, i) =>
          event.results[0][i].transcript,
        );
        // Pick the result closest to the target word
        let best = { transcript: results[0], score: 0 };
        for (const transcript of results) {
          const score = similarityScore(transcript, targetWord);
          if (score > best.score) best = { transcript, score };
        }
        const isCorrect = best.score >= 70;
        onResult({ transcript: best.transcript, isCorrect, score: best.score });
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        onResult({ transcript: '', isCorrect: false, score: 0 });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    },
    [checkSupport],
  );

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  return { isRecording, isSupported: checkSupport(), startRecording, stopRecording };
}
