'use client';

import { cn } from '@/lib/utils';
import type { Word } from '@/types';
import { Volume2, RotateCw } from 'lucide-react';

interface FlashCardProps {
  word: Word;
  flipped: boolean;
  setFlipped: (flipped: boolean) => void;
  onSpeak?: (text: string) => void;
}

export default function FlashCard({ word, flipped, setFlipped, onSpeak }: FlashCardProps) {
  const handleSpeak = (e: React.MouseEvent, text: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onSpeak) {
      onSpeak(text);
    } else if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="w-full max-w-md mx-auto cursor-pointer h-[380px]"
      style={{ perspective: '2000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={cn(
          'relative w-full h-full transition-all duration-700 shadow-2xl rounded-3xl',
          flipped && '[transform:rotateY(180deg)]',
        )}
        style={{ 
          transformStyle: 'preserve-3d',
          position: 'relative'
        }}
      >
        {/* Front Side */}
        <div
          className={cn(
            "absolute inset-0 bg-white rounded-3xl overflow-hidden flex flex-col border-2 border-primary/5",
            flipped ? "pointer-events-none opacity-0" : "pointer-events-auto opacity-100"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="relative h-2/5 w-full overflow-hidden bg-muted">
            <img
              src={word.imageUrl || `https://loremflickr.com/600/400/english,${encodeURIComponent(word.word)}/all?lock=${word.id.length}`}
              alt={word.word}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 -mt-8 relative z-10 text-center">
            <span className="px-3 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-3">
              {word.partOfSpeech}
            </span>
            <h2 className="text-4xl font-black text-slate-900 mb-1 tracking-tight">
              {word.word}
            </h2>
            {word.phonetic && (
              <p className="text-lg font-medium text-primary/60 font-mono mb-4 italic">
                {word.phonetic}
              </p>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={(e) => handleSpeak(e, word.word)}
                className="p-3 rounded-full bg-primary text-primary-foreground hover:scale-110 active:scale-95 transition-all shadow-lg shadow-primary/30 relative z-20"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="p-3 rounded-full bg-slate-100 text-slate-400">
                <RotateCw className="w-5 h-5" />
              </div>
            </div>
            
            <p className="mt-6 text-[10px] font-bold text-slate-300 uppercase tracking-widest animate-pulse">
              Nhấn để xem nghĩa
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div
          className={cn(
            "absolute inset-0 bg-slate-50 rounded-3xl p-8 flex flex-col justify-center border-2 border-slate-200 text-slate-900",
            flipped ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
          )}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="space-y-5">
            <div className="relative">
              <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full" />
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-1 opacity-80">
                Định nghĩa
              </p>
              <p className="text-xl font-bold text-slate-800 leading-snug">
                {word.definitionVi || word.definition}
              </p>
              {word.definitionVi && (
                <p className="text-sm font-medium text-slate-500 mt-1 italic">
                  {word.definition}
                </p>
              )}
            </div>

            {word.example && (
              <div className="bg-white rounded-2xl p-4 border border-slate-100 relative group shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  Ví dụ thực tế
                </p>
                <p className="text-base italic text-slate-700 leading-relaxed font-serif pr-10">
                  &ldquo;{word.example}&rdquo;
                </p>
                <button
                  type="button"
                  onClick={(e) => handleSpeak(e, word.example || '')}
                  className="absolute bottom-3 right-3 p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90 cursor-pointer z-30 pointer-events-auto"
                  title="Nghe ví dụ"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
              <RotateCw className="w-3.5 h-3.5" />
              <span>Chạm để lật lại</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
