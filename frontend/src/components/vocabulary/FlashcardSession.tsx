'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FlashCard from '@/components/vocabulary/FlashCard';
import { updateProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { usePronunciationAssessment, type PronunciationAssessmentResult } from '@/hooks/usePronunciationAssessment';
import type { Word } from '@/types';
import { ChevronLeft, ArrowRight, Mic, CheckCircle2, AlertCircle, Square, Check, X, Loader2 } from 'lucide-react';

interface FlashcardSessionProps {
  title: string;
  subtitle: string;
  words: Word[];
  backLink: string;
  backLabel: string;
  onFinish?: () => void;
  finishComponent?: React.ReactNode;
}

export default function FlashcardSession({ 
  title, 
  subtitle, 
  words, 
  backLink, 
  backLabel,
  onFinish,
  finishComponent
}: FlashcardSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationAssessmentResult | null>(null);
  const [pronunciationError, setPronunciationError] = useState<string | null>(null);

  const { speak } = useSpeechSynthesis();
  const { isRecording, isProcessing, startRecording, stopRecording, cancelRecording } = usePronunciationAssessment();

  // Reset states when word changes
  useEffect(() => {
    setPronunciationResult(null);
    setPronunciationError(null);
    cancelRecording();
    setFlipped(false);
    setAnimationClass('animate-in fade-in zoom-in-95 duration-500');
    const timer = setTimeout(() => setAnimationClass(''), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const nextCard = useCallback(() => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(words.length); // Trigger finish state
      onFinish?.();
    }
  }, [currentIndex, words.length, onFinish]);

  const handleAssess = (quality: number) => {
    const currentWord = words[currentIndex];
    updateProgress(currentWord.id, quality).catch(console.error);

    // Animation based on quality
    if (quality >= 3) {
      setAnimationClass('translate-x-full opacity-0 transition-all duration-500 scale-95 rotate-12');
    } else {
      setAnimationClass('-translate-x-full opacity-0 transition-all duration-500 scale-95 -rotate-12');
    }

    setTimeout(() => {
      nextCard();
    }, 400);
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording(
        words[currentIndex].word,
        (result) => {
          setPronunciationResult(result);
          setPronunciationError(null);
          const quality = Math.round(result.overallScore / 20);
          updateProgress(words[currentIndex].id, quality).catch(console.error);
        },
        (err) => {
          setPronunciationError(err.message);
        },
      );
      return;
    }
    setPronunciationResult(null);
    setPronunciationError(null);
    startRecording();
  };

  const isFinished = currentIndex >= words.length;
  const currentWord = words[currentIndex] || words[words.length - 1];
  const progress = Math.min(((currentIndex + (isFinished ? 0 : 1)) / words.length) * 100, 100);

  if (words.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-xl">Không có từ vựng nào trong danh sách này</p>
        <ButtonLink href={backLink} className="mt-4">{backLabel}</ButtonLink>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link
              href={backLink}
              className="p-2 rounded-full bg-white shadow-sm border hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 line-clamp-1">{title}</h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">{subtitle}</p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Tiến độ
              </span>
              <span className="text-sm font-black text-primary">
                {Math.min(currentIndex + 1, words.length)} <span className="text-slate-300">/</span> {words.length}
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-slate-200" />
          </div>
        </div>

        {!isFinished ? (
          <>
            {/* Main Card */}
            <div className={cn("mb-8 duration-500", animationClass)}>
              <FlashCard 
                word={currentWord} 
                flipped={flipped} 
                setFlipped={setFlipped} 
                onSpeak={speak} 
              />
            </div>

            {/* Assessment Buttons */}
            <div className="max-w-md mx-auto grid grid-cols-2 gap-4 mb-12">
              <button
                onClick={() => handleAssess(0)}
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-white border-2 border-red-50 text-red-400 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <X className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Chưa nhớ</span>
              </button>
              
              <button
                onClick={() => handleAssess(5)}
                className="group flex flex-col items-center justify-center gap-2 p-4 rounded-[2rem] bg-white border-2 border-green-50 text-green-500 hover:bg-green-50 hover:border-green-100 transition-all active:scale-95 shadow-sm"
              >
                <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Check className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Đã nhớ</span>
              </button>
            </div>

            {/* Interaction Area */}
            <div className="max-w-md mx-auto space-y-8">
              <div className={cn(
                "rounded-3xl border-2 p-6 transition-all duration-500 shadow-sm",
                isRecording ? "bg-red-50/50 border-red-200 ring-4 ring-red-50" : "bg-white border-slate-100",
                pronunciationResult?.isCorrect && "bg-green-50/50 border-green-200",
                pronunciationResult && !pronunciationResult.isCorrect && "bg-orange-50/50 border-orange-200"
              )}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Mic className="w-3.5 h-3.5 text-primary" />
                    Luyện phát âm
                  </h3>
                  {pronunciationResult && (
                    <div className="flex items-center gap-1.5">
                      <Badge className={cn(
                        "px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        pronunciationResult.isCorrect ? "bg-green-500" : "bg-orange-500"
                      )}>
                        {pronunciationResult.overallScore}%
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={handleRecord}
                    disabled={isProcessing}
                    className={cn(
                      'group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl',
                      isRecording
                        ? 'bg-red-500 scale-110 shadow-red-200'
                        : isProcessing
                          ? 'bg-slate-300 cursor-not-allowed'
                          : 'bg-primary hover:scale-105 active:scale-95 shadow-primary/20'
                    )}
                  >
                    {isProcessing
                      ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                      : isRecording
                        ? <Square className="w-6 h-6 text-white fill-white" />
                        : <Mic className="w-7 h-7 text-white" />
                    }
                    {isRecording && <span className="absolute -inset-2 rounded-full border-4 border-red-500/20 animate-ping" />}
                  </button>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {isProcessing ? "Đang phân tích..." : isRecording ? "Đang thu âm... Nhấn để dừng" : "Nhấn mic để luyện đọc"}
                  </p>

                  {pronunciationError && (
                    <p className="text-xs text-red-500 font-medium">{pronunciationError}</p>
                  )}

                  {pronunciationResult && (
                    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 mt-2">
                      <div className={cn(
                        "flex flex-col gap-3 p-4 rounded-2xl",
                        pronunciationResult.isCorrect ? "bg-green-500/10 text-green-700" : "bg-orange-500/10 text-orange-700"
                      )}>
                        {/* Header */}
                        <div className="flex items-start gap-3">
                          {pronunciationResult.isCorrect
                            ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                            : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                          }
                          <div className="flex-1">
                            <p className="font-black text-sm leading-tight mb-1 uppercase tracking-tight">
                              {pronunciationResult.isCorrect ? "Rất tốt! Phát âm chuẩn" : "Hãy thử lại nhé!"}
                            </p>
                            <p className="text-xs font-medium opacity-80">
                              Nhận diện: <span className="font-bold">"{pronunciationResult.transcript || '...'}"</span>
                            </p>
                          </div>
                        </div>

                        {/* Score breakdown */}
                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-current/10 text-center">
                          {[
                            { label: 'Chính xác', value: pronunciationResult.accuracyScore },
                            { label: 'Lưu loát', value: pronunciationResult.fluencyScore },
                            { label: 'Đầy đủ', value: pronunciationResult.completenessScore },
                          ].map(({ label, value }) => (
                            <div key={label}>
                              <div className="text-base font-black">{value}%</div>
                              <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
                            </div>
                          ))}
                        </div>

                        {/* Word-level feedback */}
                        {pronunciationResult.words.length > 0 && (
                          <div className="flex flex-col gap-2 pt-2 border-t border-current/10">
                            {/* Word badges */}
                            <div className="flex flex-wrap gap-1.5">
                              {pronunciationResult.words.map((w, idx) => (
                                <span
                                  key={idx}
                                  className={cn(
                                    "px-2 py-0.5 rounded-md text-sm font-bold border",
                                    w.errorType === 'None'
                                      ? "bg-green-500 text-white border-green-600 shadow-sm"
                                      : "bg-red-500 text-white border-red-600 shadow-sm"
                                  )}
                                >
                                  {w.word}
                                  {w.errorType !== 'None' && (
                                    <span className="ml-1 text-[10px] font-normal opacity-80">
                                      {w.accuracyScore}%
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>

                            {/* Per-word feedback from Gemini */}
                            {pronunciationResult.words.some(w => w.errorType !== 'None') && (
                              <div className="flex flex-col gap-1.5">
                                {pronunciationResult.words
                                  .filter(w => w.errorType !== 'None')
                                  .map((w, idx) => (
                                    <div key={idx} className="text-xs flex gap-1.5 items-start">
                                      <span className="font-black shrink-0">"{w.word}"</span>
                                      <span className="opacity-80">
                                        {w.errorType === 'Omission' && '— bị bỏ sót'}
                                        {w.errorType === 'Insertion' && '— thêm từ thừa'}
                                        {w.errorType === 'Mispronunciation' && (w.feedback || '— phát âm chưa đúng')}
                                      </span>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-center gap-8 pt-2">
                <button
                  onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                  disabled={currentIndex === 0}
                  className="text-slate-400 hover:text-primary disabled:opacity-20 transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Trước đó
                </button>
                <div className="w-px h-4 bg-slate-200" />
                <button
                  onClick={() => handleAssess(5)}
                  disabled={currentIndex === words.length - 1}
                  className="text-slate-400 hover:text-primary disabled:opacity-20 transition-colors font-bold text-xs uppercase tracking-widest flex items-center gap-2"
                >
                  Bỏ qua
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Completion State */
          finishComponent || (
            <div className="max-w-md mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white text-center shadow-2xl shadow-green-200 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm rotate-12">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Hoàn thành!</h3>
              <p className="font-medium opacity-90 mb-10 text-lg">
                Tuyệt vời! Bạn đã hoàn thành phiên học này.
              </p>
              <div className="flex flex-col gap-3">
                <Button 
                  variant="secondary" 
                  onClick={() => setCurrentIndex(0)}
                  className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg"
                >
                  Học lại từ đầu
                </Button>
                <ButtonLink 
                  href={backLink}
                  className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-400 text-white hover:bg-emerald-300 shadow-lg"
                >
                  Quay lại
                </ButtonLink>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
