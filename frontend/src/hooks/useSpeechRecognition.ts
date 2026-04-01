'use client';

import { useState, useRef, useCallback } from 'react';

export interface SpeechResultSegment {
  word: string;
  isCorrect: boolean;
}

export interface SpeechRecognitionResult {
  transcript: string;
  isCorrect: boolean;
  score: number; // 0-100
  segments?: SpeechResultSegment[];
}

function normalize(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Calculates a strict similarity score between what was heard and the target.
 */
function calculatePronunciationScore(transcript: string, target: string): number {
  const tNorm = normalize(transcript);
  const targetNorm = normalize(target);
  
  if (tNorm === targetNorm) return 100;
  if (!tNorm) return 0;

  const tWords = tNorm.split(/\s+/);
  const targetWords = targetNorm.split(/\s+/);
  
  // 1. Word-level match score
  let matches = 0;
  const usedIndices = new Set<number>();
  
  targetWords.forEach(tw => {
    const matchIdx = tWords.findIndex((word, idx) => word === tw && !usedIndices.has(idx));
    if (matchIdx !== -1) {
      matches++;
      usedIndices.add(matchIdx);
    }
  });

  const wordScore = (matches / targetWords.length) * 100;

  // 2. Character-level similarity (Levenshtein)
  const longerLen = Math.max(tNorm.length, targetNorm.length);
  const distance = levenshtein(tNorm, targetNorm);
  const charScore = ((longerLen - distance) / longerLen) * 100;

  // Final score is a weighted average (70% word accuracy, 30% character accuracy)
  // This penalizes missing words heavily but allows for minor phonetic variations
  return Math.round((wordScore * 0.7) + (charScore * 0.3));
}

function diffWords(transcript: string, target: string): SpeechResultSegment[] {
  const tWords = normalize(transcript).split(/\s+/);
  const targetWords = target.split(/\s+/);
  
  const usedIndices = new Set<number>();
  
  return targetWords.map(targetWord => {
    const normalizedTarget = normalize(targetWord);
    // Find if this word exists in the transcript and hasn't been "used" yet
    const matchIdx = tWords.findIndex((tw, idx) => tw === normalizedTarget && !usedIndices.has(idx));
    
    if (matchIdx !== -1) {
      usedIndices.add(matchIdx);
      return { word: targetWord, isCorrect: true };
    }
    
    return { word: targetWord, isCorrect: false };
  });
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
  const recognitionRef = useRef<any>(null);

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

      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) return;

      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      // We set maxAlternatives to 1 to get exactly what the engine heard first,
      // which is better for pronunciation practice.
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        // Take ONLY the first (most confident) result
        const transcript = event.results[0][0].transcript;
        
        const score = calculatePronunciationScore(transcript, targetWord);
        const isCorrect = score >= 85; // Stricter threshold for "Correct"
        const segments = diffWords(transcript, targetWord);
        
        onResult({ 
          transcript, 
          isCorrect, 
          score,
          segments
        });
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
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
