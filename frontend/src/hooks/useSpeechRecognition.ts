'use client';

import { useState, useRef, useCallback } from 'react';

export interface SpeechResultSegment {
  word: string;
  isCorrect: boolean;
  similarity: number; // 0-1
  spokenAs?: string; // what the STT actually recognized for this word
  phoneticNote?: string; // description of the phonetic error in Vietnamese
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

// Soundex phonetic encoding for English
function soundex(word: string): string {
  const w = word.toUpperCase().replace(/[^A-Z]/g, '');
  if (!w) return '0000';

  const codes: Record<string, string> = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  let result = w[0];
  let prevCode = codes[w[0]] || '0';

  for (let i = 1; i < w.length && result.length < 4; i++) {
    const code = codes[w[i]] || '0';
    if (code !== '0' && code !== prevCode) {
      result += code;
    }
    prevCode = code === '0' ? prevCode : code;
  }

  return result.padEnd(4, '0');
}

function getPhoneticSimilarity(w1: string, w2: string): number {
  const s1 = soundex(w1);
  const s2 = soundex(w2);
  // First char (initial consonant) is most important — weight it more
  let score = s1[0] === s2[0] ? 2 : 0;
  for (let i = 1; i < 4; i++) {
    if (s1[i] === s2[i]) score += 1;
  }
  return score / 5; // max score = 5
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

function getCharSimilarity(w1: string, w2: string): number {
  if (w1 === w2) return 1;
  if (!w1 || !w2) return 0;
  const longerLen = Math.max(w1.length, w2.length);
  return (longerLen - levenshtein(w1, w2)) / longerLen;
}

/**
 * Combined character + phonetic similarity.
 * 55% character-based (spelling), 45% Soundex phonetic.
 */
function getWordSimilarity(word1: string, word2: string): number {
  const w1 = normalize(word1);
  const w2 = normalize(word2);
  if (w1 === w2) return 1;
  if (!w1 || !w2) return 0;
  return getCharSimilarity(w1, w2) * 0.55 + getPhoneticSimilarity(w1, w2) * 0.45;
}

// Common phonetic error patterns (target regex, spoken regex, Vietnamese explanation)
const PHONETIC_ISSUES: Array<{
  targetPattern: RegExp;
  spokenPattern: RegExp;
  note: string;
}> = [
  {
    targetPattern: /th/,
    spokenPattern: /^[dt]/,
    note: 'Âm "th" — đặt đầu lưỡi nhẹ giữa hai hàm răng khi thở ra',
  },
  {
    targetPattern: /th/,
    spokenPattern: /^[fv]/,
    note: 'Âm "th" — đặt lưỡi giữa răng, không dùng môi và răng như "f/v"',
  },
  {
    targetPattern: /^r/,
    spokenPattern: /^l/,
    note: 'Âm "r" — uốn lưỡi ra sau, không chạm vòm miệng',
  },
  {
    targetPattern: /^l/,
    spokenPattern: /^r/,
    note: 'Âm "l" — chạm đầu lưỡi vào vòm miệng phía trên',
  },
  {
    targetPattern: /^v/,
    spokenPattern: /^b/,
    note: 'Âm "v" — răng trên nhẹ chạm môi dưới khi rung thanh',
  },
  {
    targetPattern: /^w/,
    spokenPattern: /^v/,
    note: 'Âm "w" — chỉ tròn môi, không dùng răng',
  },
  {
    targetPattern: /sh/,
    spokenPattern: /s(?!h)/,
    note: 'Âm "sh" — lưỡi lui về sau hơn "s", môi hơi tròn',
  },
  {
    targetPattern: /^z/,
    spokenPattern: /^s/,
    note: 'Âm "z" — giống "s" nhưng rung thanh quản',
  },
  {
    targetPattern: /ng$/,
    spokenPattern: /n$/,
    note: 'Âm cuối "-ng" — kết thúc bằng ngậm miệng, không bật âm',
  },
  {
    targetPattern: /ed$/,
    spokenPattern: /e$/,
    note: 'Đuôi "-ed" — phát âm /d/, /t/ hoặc /ɪd/ tùy theo phụ âm trước',
  },
  {
    targetPattern: /tion/,
    spokenPattern: /tion|sion/,
    note: 'Âm "-tion" — phát âm là /ʃən/ ("shun")',
  },
];

/**
 * Identify the phonetic difference between the target word and what was spoken.
 */
function getPhoneticNote(target: string, spoken: string): string | undefined {
  if (!spoken || spoken === target) return undefined;

  const t = normalize(target);
  const s = normalize(spoken);

  for (const issue of PHONETIC_ISSUES) {
    if (issue.targetPattern.test(t) && issue.spokenPattern.test(s)) {
      return issue.note;
    }
  }

  // Find first differing position and generate a generic note
  let diffPos = 0;
  while (diffPos < t.length && diffPos < s.length && t[diffPos] === s[diffPos]) {
    diffPos++;
  }
  if (diffPos < t.length && diffPos < s.length) {
    // Extract up to 2-char cluster at diff position
    const tSound = t.slice(diffPos, diffPos + 2);
    const sSound = s.slice(diffPos, diffPos + 2);
    return `Âm "${tSound}" bị phát âm thành "${sSound}"`;
  }
  if (diffPos < t.length) {
    return `Bị thiếu âm "${t.slice(diffPos, diffPos + 2)}" ở cuối`;
  }

  return undefined;
}

/**
 * Score calculation — purely based on how well transcript matches target.
 * No confidence bonus to avoid inflating scores.
 */
function calculateScore(transcript: string, target: string): number {
  const tNorm = normalize(transcript);
  const targetNorm = normalize(target);

  if (tNorm === targetNorm) return 100;
  if (!tNorm) return 0;

  const tWords = tNorm.split(/\s+/);
  const targetWords = targetNorm.split(/\s+/);

  let totalSimilarity = 0;
  const usedIndices = new Set<number>();

  for (const tw of targetWords) {
    let bestSimilarity = 0;
    let bestIdx = -1;

    tWords.forEach((pw, idx) => {
      if (usedIndices.has(idx)) return;
      const sim = getWordSimilarity(tw, pw);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestIdx = idx;
      }
    });

    totalSimilarity += bestSimilarity;
    if (bestIdx !== -1) usedIndices.add(bestIdx);
  }

  const wordScore = (totalSimilarity / targetWords.length) * 100;

  // Penalize extra words (noise) — 5 points each
  const extraWords = Math.max(0, tWords.length - targetWords.length);
  const penalty = extraWords * 5;

  return Math.round(Math.max(0, Math.min(100, wordScore - penalty)));
}

/**
 * Build per-word segments showing what was spoken vs. what was expected,
 * plus a phonetic note if the word was wrong.
 */
function getDetailedSegments(
  transcriptWords: string[],
  targetWords: string[],
): SpeechResultSegment[] {
  const tWordsNorm = transcriptWords.map(normalize);
  const usedIndices = new Set<number>();

  return targetWords.map((targetWord) => {
    const tNorm = normalize(targetWord);
    let bestSimilarity = 0;
    let bestIdx = -1;

    tWordsNorm.forEach((pw, idx) => {
      if (usedIndices.has(idx)) return;
      const sim = getWordSimilarity(tNorm, pw);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        bestIdx = idx;
      }
    });

    const spokenRaw = bestIdx !== -1 ? transcriptWords[bestIdx] : undefined;
    // Only show spokenAs if it's actually different
    const spokenAs = spokenRaw && normalize(spokenRaw) !== tNorm ? spokenRaw : undefined;

    // Threshold 0.85: require both character AND phonetic closeness
    const isCorrect = bestSimilarity >= 0.85;

    if (bestIdx !== -1) usedIndices.add(bestIdx);

    const phoneticNote = isCorrect ? undefined : getPhoneticNote(targetWord, spokenRaw || '');

    return {
      word: targetWord,
      isCorrect,
      similarity: Math.round(bestSimilarity * 100) / 100,
      spokenAs,
      phoneticNote,
    };
  });
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
      recognition.maxAlternatives = 5; // Use multiple alternatives for better accuracy

      recognitionRef.current = recognition;
      setIsRecording(true);

      recognition.onresult = (event: any) => {
        const results = event.results[0];

        // Pick the alternative that best matches the target word
        let bestTranscript = results[0].transcript;
        let bestScore = -1;

        for (let i = 0; i < results.length; i++) {
          const altTranscript = results[i].transcript;
          const altScore = calculateScore(altTranscript, targetWord);
          if (altScore > bestScore) {
            bestScore = altScore;
            bestTranscript = altTranscript;
          }
        }

        const targetWords = targetWord.split(/\s+/);
        const transcriptWords = bestTranscript.trim().split(/\s+/);

        const score = calculateScore(bestTranscript, targetWord);
        const segments = getDetailedSegments(transcriptWords, targetWords);
        const isCorrect = score >= 80;

        onResult({
          transcript: bestTranscript,
          isCorrect,
          score,
          segments,
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
