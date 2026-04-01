'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import FlashCard from '@/components/vocabulary/FlashCard';
import { getTopicById, updateProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import type { VocabularyTopic } from '@/types';
import { ChevronLeft, ArrowRight, Mic, CheckCircle2, AlertCircle, Square, Check, X } from 'lucide-react';

export default function FlashcardPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [pronunciationResult, setPronunciationResult] = useState<{
    transcript: string;
    isCorrect: boolean;
    score: number;
  } | null>(null);

  const { speak } = useSpeechSynthesis();
  const { isRecording, isSupported, startRecording, stopRecording } = useSpeechRecognition();

  useEffect(() => {
    getTopicById(topicId)
      .then(setTopic)
      .finally(() => setLoading(false));
  }, [topicId]);

  // Reset states when word changes
  useEffect(() => {
    setPronunciationResult(null);
    setFlipped(false);
    setAnimationClass('animate-in fade-in zoom-in-95 duration-500');
    const timer = setTimeout(() => setAnimationClass(''), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const nextCard = useCallback(() => {
    if (topic?.words && currentIndex < topic.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, topic]);

  const handleAssess = (quality: number) => {
    if (!topic || !topic.words) return;
    const currentWord = topic.words[currentIndex];
    updateProgress(currentWord.id, quality).catch(console.error);

    // Animation based on quality
    if (quality >= 3) {
      setAnimationClass('translate-x-full opacity-0 transition-all duration-500 scale-95 rotate-12');
    } else {
      setAnimationClass('-translate-x-full opacity-0 transition-all duration-500 scale-95 -rotate-12');
    }

    setTimeout(() => {
      if (topic.words && currentIndex < topic.words.length - 1) {
        nextCard();
      } else if (topic.words) {
        // Just set final state if it's the last card
        setAnimationClass('');
        setCurrentIndex(topic.words.length); // Trigger finish state
      }
    }, 400);
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
      return;
    }
    setPronunciationResult(null);
    if (!topic || !topic.words) return;
    startRecording(topic.words[currentIndex].word, (result) => {
      setPronunciationResult(result);
      const quality = Math.round(result.score / 20); 
      if (topic.words) {
        updateProgress(topic.words[currentIndex].id, quality).catch(console.error);
      }
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-12">
          <div className="h-12 bg-muted rounded-xl w-64 mx-auto" />
          <div className="h-[380px] bg-muted rounded-3xl max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  if (!topic || !topic.words?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-xl">Không tìm thấy dữ liệu từ vựng</p>
        <ButtonLink href="/vocabulary" className="mt-4">Quay lại thư viện</ButtonLink>
      </div>
    );
  }

  const words = topic.words;
  const isFinished = currentIndex >= words.length;
  const currentWord = words[currentIndex] || words[words.length - 1];
  const progress = Math.min(((currentIndex + (isFinished ? 0 : 1)) / words.length) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-sans overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Link
              href={`/vocabulary/${topicId}`}
              className="p-2 rounded-full bg-white shadow-sm border hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 line-clamp-1">
                {topic.nameVi || topic.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium tracking-tight">Học qua Flashcard</p>
            </div>
          </div>

          <div className="flex-1 max-w-md w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Tiến độ bài học
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
            {/* Main Card with Animation */}
            <div className={cn("mb-8 duration-500", animationClass)}>
              <FlashCard 
                word={currentWord} 
                flipped={flipped} 
                setFlipped={setFlipped} 
                onSpeak={speak} 
              />
            </div>

            {/* Assessment Buttons - AT FRONT */}
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

            {/* Interaction Area (Pronunciation) */}
            <div className="max-w-md mx-auto space-y-8">
              {isSupported !== false && (
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
                      <Badge className={cn(
                        "px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
                        pronunciationResult.isCorrect ? "bg-green-500" : "bg-orange-500"
                      )}>
                        Độ chính xác: {pronunciationResult.score}%
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      onClick={handleRecord}
                      className={cn(
                        'group relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl',
                        isRecording
                          ? 'bg-red-500 scale-110 shadow-red-200'
                          : 'bg-primary hover:scale-105 active:scale-95 shadow-primary/20'
                      )}
                    >
                      {isRecording ? <Square className="w-6 h-6 text-white fill-white" /> : <Mic className="w-7 h-7 text-white" />}
                      {isRecording && <span className="absolute -inset-2 rounded-full border-4 border-red-500/20 animate-ping" />}
                    </button>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                      {isRecording ? "Đang thu âm... Nhấn để dừng" : "Nhấn mic để luyện đọc"}
                    </p>

                    {pronunciationResult && (
                      <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 mt-2">
                        <div className={cn(
                          "flex items-start gap-3 p-4 rounded-2xl",
                          pronunciationResult.isCorrect ? "bg-green-500/10 text-green-700" : "bg-orange-500/10 text-orange-700"
                        )}>
                          {pronunciationResult.isCorrect ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-black text-sm leading-tight mb-1 uppercase tracking-tight">
                              {pronunciationResult.isCorrect ? "Rất tốt! Chính xác" : "Hãy thử lại nhé!"}
                            </p>
                            <p className="text-xs font-medium opacity-80">
                              Nhận diện: <span className="underline decoration-2 underline-offset-4 font-bold tracking-tight">"{pronunciationResult.transcript || "..."}"</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Simple Navigation */}
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
          <div className="max-w-md mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white text-center shadow-2xl shadow-green-200 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm rotate-12">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Hoàn thành!</h3>
            <p className="font-medium opacity-90 mb-10 text-lg">
              Tuyệt vời! Bạn đã hoàn thành việc ôn tập bộ thẻ này.
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
                href={`/vocabulary/${topicId}/quiz`}
                className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-400 text-white hover:bg-emerald-300 shadow-lg"
              >
                Làm bài tập ngay
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
