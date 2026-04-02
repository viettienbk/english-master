'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TranslationData {
  translation: string;
  partOfSpeech: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Module-level cache shared across all instances
const cache = new Map<string, TranslationData>();

const POS_COLORS: Record<string, string> = {
  'danh từ':  'bg-blue-100 text-blue-700',
  'động từ':  'bg-green-100 text-green-700',
  'tính từ':  'bg-purple-100 text-purple-700',
  'trạng từ': 'bg-orange-100 text-orange-700',
  'giới từ':  'bg-slate-100 text-slate-600',
  'liên từ':  'bg-slate-100 text-slate-600',
  'đại từ':   'bg-pink-100 text-pink-700',
  'thán từ':  'bg-yellow-100 text-yellow-700',
};

function cleanWord(word: string): string {
  return word.replace(/[^a-zA-Z'-]/g, '').toLowerCase();
}

interface WordTooltipProps {
  word: string;
  context: string;
}

export default function WordTooltip({ word, context }: WordTooltipProps) {
  const [data, setData] = useState<TranslationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchingRef = useRef(false);
  const clean = cleanWord(word);

  const fetchTranslation = useCallback(async () => {
    if (!clean || fetchingRef.current) return;
    const cacheKey = `${clean}|${context.slice(0, 80)}`;
    if (cache.has(cacheKey)) {
      setData(cache.get(cacheKey)!);
      return;
    }
    fetchingRef.current = true;
    setLoading(true);
    try {
      const params = new URLSearchParams({ word: clean, context });
      const res = await fetch(`${API_BASE}/listening/translate?${params}`);
      if (res.ok) {
        const json = await res.json();
        cache.set(cacheKey, json);
        setData(json);
      }
    } catch {
      // silently fail — tooltip just stays empty
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [clean, context]);

  const show = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    hideTimerRef.current = setTimeout(() => setVisible(false), 150);
  }, []);

  const toggle = useCallback(() => {
    setVisible((v) => !v);
  }, []);

  // Fetch when first shown
  useEffect(() => {
    if (visible && !data && !fetchingRef.current) {
      fetchTranslation();
    }
  }, [visible, data, fetchTranslation]);

  useEffect(() => () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }, []);

  if (!clean) return <span>{word} </span>;

  const posColor = data ? (POS_COLORS[data.partOfSpeech] ?? 'bg-slate-100 text-slate-600') : '';

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={show}
        onMouseLeave={hide}
        onClick={toggle}
        className={cn(
          'cursor-pointer rounded px-0.5 transition-colors duration-150 select-none',
          visible ? 'bg-indigo-100 text-indigo-800' : 'hover:bg-indigo-50 hover:text-indigo-700'
        )}
      >
        {word}
      </span>
      {' '}

      {visible && (
        <span
          onMouseEnter={show}
          onMouseLeave={hide}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
          style={{ whiteSpace: 'nowrap' }}
        >
          <span className="flex flex-col gap-1 bg-slate-900 text-white rounded-xl px-3 py-2 shadow-2xl min-w-[110px] max-w-[180px] text-center">
            {loading ? (
              <span className="text-xs text-slate-400 py-0.5">...</span>
            ) : data ? (
              <>
                {data.partOfSpeech && (
                  <span className={cn('text-[10px] font-black uppercase tracking-wider rounded px-1.5 py-0.5 self-center', posColor)}>
                    {data.partOfSpeech}
                  </span>
                )}
                <span className="text-sm font-bold leading-snug whitespace-normal">{data.translation}</span>
              </>
            ) : null}
          </span>
          <span className="block w-2.5 h-2.5 bg-slate-900 rotate-45 mx-auto -mt-1.5 rounded-sm" />
        </span>
      )}
    </span>
  );
}
