'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { getListeningLessonById, checkListeningAnswers, updateLessonProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { ListeningLesson, ListeningBlank, CheckResult } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import WordTooltip from '@/components/listening/WordTooltip';
import { 
  ChevronLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Trophy, 
  ArrowRight,
  Headphones,
  Languages,
  Info,
  PenTool,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ListeningLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<ListeningLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const { speak } = useSpeechSynthesis();
useEffect(() => {
  if (!lessonId) return;
  getListeningLessonById(lessonId)
    .then((data) => {
      setLesson(data);
      // Mark as ongoing when started
      updateLessonProgress(lessonId, 'listening', 'ongoing').catch(console.error);
    })
    .catch((err) => {
      console.error('Error fetching lesson:', err);
    })
    .finally(() => setLoading(false));
}, [lessonId]);


  const playAudio = useCallback(() => {
    if (!lesson) return;
    setIsPlaying(true);
    speak(lesson.transcript);
    // Rough estimation of speech duration
    setTimeout(() => setIsPlaying(false), lesson.transcript.length * 70);
  }, [lesson, speak]);

  const handleCheck = async () => {
    if (!lesson) return;
    const res = await checkListeningAnswers(lessonId, answers);
    setResult(res);
    updateLessonProgress(lessonId, 'listening', 'completed', res.score).catch(console.error);
    
    if (res.score === 100) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#8B5CF6', '#3B82F6', '#10B981']
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-32 bg-muted rounded-full" />
          <div className="h-48 bg-muted rounded-[2.5rem]" />
          <div className="h-64 bg-muted rounded-[2rem]" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const blanks: ListeningBlank[] = JSON.parse(lesson.blanks);
  const words = lesson.transcript.split(' ');
  const blankPositions = new Map(blanks.map((b) => [b.position, b]));
  
  const filledCount = Object.keys(answers).filter(k => answers[parseInt(k)]?.trim()).length;
  const progressPercentage = (filledCount / blanks.length) * 100;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          <Link
            href="/listening"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-8 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
          >
            <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>

          {/* Hero Header & Player */}
          <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none rotate-12">
              <Headphones className="w-64 h-64" />
            </div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 rounded-full backdrop-blur-md">
                    {lesson.level === 'beginner' ? '📗 Cơ bản' : lesson.level === 'intermediate' ? '📙 Trung cấp' : '📕 Nâng cao'}
                  </Badge>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                    {lesson.title}
                  </h1>
                  {lesson.titleVi && (
                    <p className="text-lg md:text-xl text-purple-100 font-medium">
                      {lesson.titleVi}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button
                    onClick={playAudio}
                    className={cn(
                      "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl shadow-black/20 group",
                      isPlaying ? "bg-white text-primary" : "bg-primary text-white hover:scale-105 active:scale-95"
                    )}
                  >
                    {isPlaying ? (
                      <div className="flex gap-1.5 items-center justify-center">
                        <div className="w-1.5 h-8 bg-primary rounded-full animate-[bounce_1s_infinite_0ms]" />
                        <div className="w-1.5 h-10 bg-primary rounded-full animate-[bounce_1s_infinite_200ms]" />
                        <div className="w-1.5 h-8 bg-primary rounded-full animate-[bounce_1s_infinite_400ms]" />
                      </div>
                    ) : (
                      <Play className="w-10 h-10 fill-white ml-1 group-hover:scale-110 transition-transform" />
                    )}
                  </button>
                  <p className="text-xs font-black uppercase tracking-widest text-purple-200">
                    {isPlaying ? "Đang phát..." : "Nhấn để nghe"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Area */}
          <div className="space-y-8">
            <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
              <div className="bg-slate-900 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <PenTool className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Điền vào chỗ trống</h2>
                    <p className="text-[10px] text-white/40 font-medium mt-0.5">Rê chuột hoặc nhấn vào từ bất kỳ để xem nghĩa</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-white/60">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest">Tiến độ</p>
                    <p className="text-xs font-bold text-emerald-400">{Math.round(progressPercentage)}%</p>
                  </div>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-400 transition-all duration-500" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <CardContent className="p-8 md:p-12">
                <div className="text-lg md:text-xl leading-[3.5rem] md:leading-[4rem] text-slate-700 font-medium text-justify">
                  {words.map((word, idx) => {
                    const blank = blankPositions.get(idx);
                    if (blank) {
                      const isCorrect = result?.results.find((r) => r.position === idx)?.isCorrect;
                      const isIncorrect = result && !isCorrect;
                      
                      return (
                        <span key={idx} className="relative inline-block mx-1 group">
                          <input
                            type="text"
                            value={answers[idx] || ''}
                            onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                            disabled={!!result}
                            placeholder={blank.hint ? `(${blank.hint})` : '...'}
                            className={cn(
                              'w-32 md:w-40 bg-slate-50 border-b-4 text-center py-1 transition-all outline-none focus:bg-primary/5 rounded-t-xl',
                              !result && 'border-slate-200 focus:border-primary',
                              result && isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-700 font-bold',
                              result && isIncorrect && 'border-red-500 bg-red-50 text-red-700 font-bold'
                            )}
                          />
                          {result && isIncorrect && (
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 animate-in fade-in zoom-in-95">
                              Đúng: {blank.answer}
                            </span>
                          )}
                        </span>
                      );
                    }
                    return <WordTooltip key={idx} word={word} context={lesson.transcript} />;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Results & Actions */}
            <div className="flex flex-col gap-6">
              {!result ? (
                <Button
                  size="lg"
                  onClick={handleCheck}
                  disabled={filledCount < blanks.length}
                  className="h-16 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90"
                >
                  Kiểm tra kết quả
                </Button>
              ) : (
                <div className="bg-white rounded-[3rem] p-10 md:p-16 text-center shadow-2xl animate-in zoom-in-95 duration-500">
                  <div className={cn(
                    "w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 shadow-lg",
                    result.score >= 80 ? "bg-emerald-500 text-white" : 
                    result.score >= 50 ? "bg-blue-500 text-white" : "bg-orange-500 text-white"
                  )}>
                    {result.score >= 80 ? <Trophy className="w-12 h-12" /> : <Award className="w-12 h-12" />}
                  </div>
                  <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                    {result.score === 100 ? "HOÀN HẢO!" : 
                     result.score >= 80 ? "XUẤT SẮC!" : 
                     result.score >= 50 ? "LÀM TỐT LẮM!" : "HÃY THỬ LẠI NHÉ!"}
                  </h3>
                  <p className="text-xl font-bold text-slate-500 mb-10">
                    Bạn đã đúng <span className="text-primary text-3xl mx-1">{result.correct}</span> / {result.total} từ.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      variant="outline"
                      className="h-16 px-10 rounded-2xl font-black text-lg border-2"
                      onClick={() => {
                        setAnswers({});
                        setResult(null);
                        setShowTranslation(false);
                      }}
                    >
                      <RotateCcw className="w-6 h-6 mr-2" /> Làm lại
                    </Button>
                    <ButtonLink 
                      href="/listening"
                      className="h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                    >
                      Bài học khác <ArrowRight className="w-6 h-6 ml-2" />
                    </ButtonLink>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  variant="ghost" 
                  onClick={playAudio}
                  className="flex-1 h-14 rounded-2xl font-bold text-slate-600 hover:bg-white hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-sm bg-white/50"
                >
                  <RotateCcw className="w-5 h-5 mr-2" /> Nghe lại từ đầu
                </Button>
                
                {lesson.translation && (
                  <Button
                    variant="ghost"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="flex-1 h-14 rounded-2xl font-bold text-slate-600 hover:bg-white hover:text-primary transition-all border border-transparent hover:border-primary/20 shadow-sm bg-white/50"
                  >
                    <Languages className="w-5 h-5 mr-2" />
                    {showTranslation ? 'Ẩn bản dịch' : 'Dịch cả đoạn'}
                  </Button>
                )}
              </div>

              {showTranslation && lesson.translation && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 md:p-10 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                      <Languages className="w-4 h-4" />
                    </div>
                    <h4 className="font-black text-indigo-900 uppercase tracking-widest text-xs">Bản dịch tiếng Việt</h4>
                  </div>
                  <p className="text-lg leading-relaxed text-indigo-800 font-medium">
                    {lesson.translation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
