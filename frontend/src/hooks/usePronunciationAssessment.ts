'use client';

import { useState, useRef, useCallback } from 'react';

export interface WordAssessment {
  word: string;
  accuracyScore: number; // 0-100
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
  feedback?: string; // Vietnamese explanation from Gemini
}

export interface PronunciationAssessmentResult {
  transcript: string;
  overallScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: WordAssessment[];
  isCorrect: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/** Convert Float32Array PCM to Int16Array */
function floatTo16BitPCM(float32: Float32Array): Int16Array {
  const out = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return out;
}

/** Build a WAV file (PCM 16-bit mono 16kHz) from Int16Array */
function buildWav(pcm: Int16Array, sampleRate = 16000): Blob {
  const dataBytes = pcm.length * 2;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);
  const write = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  write(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  write(8, 'WAVE');
  write(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, 'data');
  view.setUint32(40, dataBytes, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, pcm[i], true);
  return new Blob([buffer], { type: 'audio/wav' });
}

/**
 * Decode a Blob (WebM/Opus from MediaRecorder), resample to 16kHz mono,
 * and return a WAV Blob.
 */
async function blobToWav16k(blob: Blob): Promise<Blob> {
  const arrayBuffer = await blob.arrayBuffer();
  // Decode at native sample rate
  const decodeCtx = new AudioContext();
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer);
  decodeCtx.close();

  // Resample to 16kHz mono using OfflineAudioContext
  const targetSampleRate = 16000;
  const offlineCtx = new OfflineAudioContext(
    1,
    Math.ceil(decoded.duration * targetSampleRate),
    targetSampleRate,
  );
  const source = offlineCtx.createBufferSource();
  source.buffer = decoded;
  source.connect(offlineCtx.destination);
  source.start(0);

  const resampled = await offlineCtx.startRendering();
  const float32 = resampled.getChannelData(0);
  const pcm16 = floatTo16BitPCM(float32);
  return buildWav(pcm16, targetSampleRate);
}

export function usePronunciationAssessment() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (typeof window === 'undefined') return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    chunksRef.current = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(
    (
      targetText: string,
      onResult: (result: PronunciationAssessmentResult) => void,
      onError?: (err: Error) => void,
    ) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) return;

      recorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const rawBlob = new Blob(chunksRef.current, { type: recorder.mimeType });
          const wavBlob = await blobToWav16k(rawBlob);

          const formData = new FormData();
          formData.append('audio', wavBlob, 'recording.wav');
          formData.append('referenceText', targetText);

          const res = await fetch(`${API_BASE}/pronunciation/assess`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const text = await res.text();
            throw new Error(`Server error ${res.status}: ${text}`);
          }

          const data = await res.json();

          const words: WordAssessment[] = (data.words ?? []).map((w: any) => ({
            word: w.word ?? '',
            accuracyScore: w.accuracyScore ?? 0,
            errorType: w.errorType ?? 'None',
            feedback: w.feedback || undefined,
          }));

          onResult({
            ...data,
            words,
            isCorrect: (data.overallScore ?? 0) >= 80,
          });
        } catch (err) {
          onError?.(err as Error);
        } finally {
          setIsProcessing(false);
        }

        // Stop all audio tracks
        recorder.stream.getTracks().forEach((t) => t.stop());
      };

      recorder.stop();
      setIsRecording(false);
    },
    [],
  );

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return { isRecording, isProcessing, startRecording, stopRecording, cancelRecording };
}
