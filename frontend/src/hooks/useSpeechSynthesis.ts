'use client';

import { useCallback, useEffect, useState } from 'react';

export function useSpeechSynthesis() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const updateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    updateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        setSpeaking(window.speechSynthesis.speaking);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Get voices directly from window.speechSynthesis for latest state
    const currentVoices = window.speechSynthesis.getVoices();
    
    // Priority: Google English -> English (US) -> English -> Any voice
    const voice = currentVoices.find(v => v.lang === 'en-US' && v.name.includes('Google')) 
      || currentVoices.find(v => v.lang === 'en-US')
      || currentVoices.find(v => v.lang.startsWith('en'))
      || currentVoices[0];

    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    // Speak immediately - important for some browsers to be inside the user gesture
    window.speechSynthesis.speak(utterance);
    
    // Chrome bug workaround: sometimes it gets stuck in speaking state
    // calling resume() periodically can help
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }, []);

  return { speak, speaking, voices };
}
