'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getGrammarLessonById, updateLessonProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { 
  ChevronLeft, 
  Volume2, 
  CheckCircle2, 
  ArrowRight, 
  BookOpen, 
  Lightbulb, 
  PenTool, 
  Award, 
  Info, 
  AlertTriangle,
  Flame,
  ListRestart
} from 'lucide-react';
import type { GrammarLesson, GrammarExample, GrammarExercise } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import confetti from 'canvas-confetti';

export default function GrammarLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExercises, setShowExercises] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [activeSection, setActiveSection] = useState<'theory' | 'examples' | 'practice'>('theory');
  const { speak } = useSpeechSynthesis();

  const theoryRef = useRef<HTMLDivElement>(null);
  const examplesRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getGrammarLessonById(lessonId)
      .then((data) => {
        setLesson(data);
        updateLessonProgress(lessonId, 'grammar', 'ongoing').catch(console.error);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  // Intersection observer for sticky nav
  useEffect(() => {
    const options = { threshold: 0.2 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id as any);
        }
      });
    }, options);

    const refs = [theoryRef.current, examplesRef.current, practiceRef.current];
    refs.forEach(ref => ref && observer.observe(ref));

    return () => refs.forEach(ref => ref && observer.unobserve(ref));
  }, [loading, showExercises]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-10 w-32 bg-muted rounded-full" />
          <div className="h-48 bg-muted rounded-[2.5rem]" />
          <div className="grid grid-cols-4 gap-4">
            <div className="h-12 bg-muted rounded-xl col-span-3" />
            <div className="h-12 bg-muted rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  const examples: GrammarExample[] = JSON.parse(lesson.examples);
  const exercises: GrammarExercise[] = JSON.parse(lesson.exercises);

  const score = checked
    ? exercises.filter((ex, i) => (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase()).length
    : 0;
  
  const progressPercentage = (Object.keys(answers).length / exercises.length) * 100;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleCheck = () => {
    setChecked(true);
    const percentage = Math.round((score / exercises.length) * 100);
    updateLessonProgress(lessonId, 'grammar', 'completed', percentage).catch(console.error);
    
    if (score === exercises.length) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B']
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 pb-32">
        {/* Sticky Nav */}
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 py-3 mb-8">
          <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/grammar" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                <ChevronLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">Đang học</p>
                <h3 className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{lesson.title}</h3>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => scrollTo('theory')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeSection === 'theory' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Lý thuyết
              </button>
              <button 
                onClick={() => scrollTo('examples')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeSection === 'examples' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Ví dụ
              </button>
              <button 
                onClick={() => scrollTo('practice')}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                  activeSection === 'practice' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                Thực hành
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiến độ</p>
                <p className="text-xs font-bold text-slate-900">{Math.round(progressPercentage)}% hoàn thành</p>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 w-full bg-primary transition-all duration-1000" 
                  style={{ height: `${progressPercentage}%`, opacity: 0.2 }}
                />
                <PenTool className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Header Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-10 pointer-events-none rotate-12">
              <BookOpen className="w-64 h-64" />
            </div>
            <div className="relative z-10 space-y-6">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-none px-4 py-1.5 rounded-full backdrop-blur-md">
                {lesson.category === 'basic' ? '📗 Cơ bản' : lesson.category === 'structures' ? '📙 Cấu trúc' : '💬 Giao tiếp'}
              </Badge>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                {lesson.title}
              </h1>
              {lesson.titleVi && (
                <p className="text-xl md:text-2xl text-indigo-100 font-medium max-w-3xl">
                  {lesson.titleVi}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-8 space-y-12">
              {/* Theory Section */}
              <section id="theory" ref={theoryRef} className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Kiến thức trọng tâm</h2>
                </div>

                <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-slate-100 leading-relaxed">
                  <div className="prose prose-slate prose-lg max-w-none">
                    {lesson.content.split('\n').map((line, i) => {
                      if (line.startsWith('## '))
                        return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-8 mb-6 pb-2 border-b-2 border-slate-50">{line.slice(3)}</h2>;
                      
                      if (line.startsWith('### '))
                        return <h3 key={i} className="text-xl font-extrabold text-slate-700 mt-8 mb-4">{line.slice(4)}</h3>;
                      
                      // Structure box detection (heuristic: lines with + and bold)
                      if (line.includes('+') && line.includes('**')) {
                        return (
                          <div key={i} className="my-6 p-6 rounded-2xl bg-indigo-50 border-2 border-indigo-100 text-indigo-900 font-bold text-center shadow-inner italic">
                            <span dangerouslySetInnerHTML={{
                              __html: line.replace(/\*\*(.*?)\*\*/g, '<span class="text-indigo-600 text-xl mx-1">$1</span>')
                            }} />
                          </div>
                        );
                      }

                      // Callout detection
                      if (line.startsWith('!NOTE:')) {
                        return (
                          <div key={i} className="my-6 p-5 rounded-2xl bg-blue-50 border-l-8 border-blue-400 flex gap-4 items-start">
                            <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                            <p className="text-blue-800 font-medium m-0">{line.replace('!NOTE:', '').trim()}</p>
                          </div>
                        );
                      }

                      if (line.startsWith('- **'))
                        return (
                          <div key={i} className="flex items-start gap-3 mb-3 pl-2">
                            <div className="w-2 h-2 rounded-full bg-primary mt-3 shrink-0" />
                            <p className="m-0 text-slate-700">
                              <span dangerouslySetInnerHTML={{
                                __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-900 font-black">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-primary font-bold not-italic">$1</em>')
                              }} />
                            </p>
                          </div>
                        );

                      if (line.trim() === '') return <div key={i} className="h-4" />;
                      
                      return <p key={i} className="mb-4 text-slate-600 font-medium">{line}</p>;
                    })}
                  </div>
                </div>
              </section>

              {/* Examples Section */}
              <section id="examples" ref={examplesRef} className="scroll-mt-32">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Ví dụ trực quan</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {examples.map((ex, i) => (
                    <Card key={i} className="border-none shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-shadow">
                      <CardContent className="p-0 flex flex-col md:flex-row">
                        <div className="p-8 bg-white flex-1 space-y-2">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-amber-50 text-amber-600 border-amber-100 text-[10px] uppercase font-black">Ví dụ {i + 1}</Badge>
                          </div>
                          <p className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{ex.english}</p>
                          <p className="text-lg text-slate-500 font-bold">{ex.vietnamese}</p>
                        </div>
                        <div className="bg-slate-50 p-8 md:w-1/3 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col justify-between gap-4">
                          <p className="text-sm text-slate-600 italic font-medium">
                            {ex.explanation}
                          </p>
                          <button
                            onClick={() => speak(ex.english)}
                            className="self-end p-4 rounded-2xl bg-white shadow-sm border border-slate-200 text-primary hover:bg-primary hover:text-white transition-all transform active:scale-95"
                          >
                            <Volume2 className="w-6 h-6" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Practice Section */}
              <section id="practice" ref={practiceRef} className="scroll-mt-32">
                <div className="bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-cyan-400" />
                  
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                        <PenTool className="w-8 h-8 text-emerald-400" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-white tracking-tight">Thực hành ngay</h2>
                        <p className="text-slate-400 font-medium">Hoàn thành {exercises.length} câu hỏi để làm chủ bài học</p>
                      </div>
                    </div>

                    {!showExercises && (
                      <Button 
                        size="lg"
                        onClick={() => setShowExercises(true)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl px-10 h-16 text-lg shadow-xl shadow-emerald-500/20"
                      >
                        Bắt đầu làm bài
                      </Button>
                    )}
                  </div>

                  {showExercises && (
                    <div className="space-y-8">
                      {exercises.map((ex, i) => (
                        <Card key={i} className={cn(
                          "border-2 rounded-[2rem] transition-all overflow-hidden",
                          checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase() ? "border-emerald-500/50 bg-emerald-500/5" : 
                          checked ? "border-red-500/50 bg-red-500/5" : "border-white/10 bg-white/5"
                        )}>
                          <CardContent className="p-8">
                            <div className="flex gap-6 mb-6">
                              <div className={cn(
                                "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                                checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase() ? "bg-emerald-500 text-white" :
                                checked ? "bg-red-500 text-white" : "bg-white/10 text-white"
                              )}>
                                {i + 1}
                              </div>
                              <p className="text-xl font-bold text-white pt-1 leading-snug">
                                {ex.question}
                              </p>
                            </div>
                            
                            <div className="pl-16">
                              {ex.type === 'multiple_choice' && ex.options ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {ex.options.map((opt) => {
                                    const isSelected = answers[i] === opt;
                                    const isCorrectAnswer = opt === ex.answer;
                                    
                                    let btnClass = "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:border-white/20";
                                    if (!checked && isSelected) btnClass = "border-primary bg-primary/20 text-white ring-2 ring-primary/50";
                                    if (checked && isCorrectAnswer) btnClass = "border-emerald-500 bg-emerald-500 text-white font-black";
                                    if (checked && isSelected && !isCorrectAnswer) btnClass = "border-red-500 bg-red-500 text-white font-black opacity-70";

                                    return (
                                      <button
                                        key={opt}
                                        disabled={checked}
                                        onClick={() => setAnswers({ ...answers, [i]: opt })}
                                        className={cn(
                                          'p-5 rounded-2xl border-2 text-left transition-all relative font-bold text-base',
                                          btnClass
                                        )}
                                      >
                                        {opt}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  disabled={checked}
                                  value={answers[i] || ''}
                                  onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
                                  className={cn(
                                    'w-full h-16 bg-white/5 border-2 rounded-2xl px-6 text-xl font-bold text-white outline-none transition-all',
                                    !checked ? 'border-white/10 focus:border-primary focus:bg-white/10' :
                                    (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase() ? 'border-emerald-500 bg-emerald-500/20' : 'border-red-500 bg-red-500/20'
                                  )}
                                  placeholder="Gõ câu trả lời của bạn..."
                                />
                              )}
                              
                              {checked && (answers[i] || '').trim().toLowerCase() !== ex.answer.toLowerCase() && (
                                <div className="mt-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-center">
                                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                                  <div>
                                    <p className="text-xs font-black text-amber-500 uppercase tracking-widest mb-1">Đáp án chính xác</p>
                                    <p className="text-xl font-black text-white">{ex.answer}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {!checked ? (
                        <Button
                          className="w-full h-20 text-2xl font-black rounded-3xl shadow-2xl shadow-primary/40 mt-12 bg-indigo-500 hover:bg-indigo-600 text-white"
                          disabled={Object.keys(answers).length === 0}
                          onClick={handleCheck}
                        >
                          Kiểm tra tất cả đáp án
                        </Button>
                      ) : (
                        <div className="bg-white rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95 duration-500 mt-12">
                          <div className={cn(
                            "w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 rotate-6 shadow-lg",
                            score === exercises.length ? "bg-emerald-500 text-white" : 
                            score >= exercises.length / 2 ? "bg-indigo-500 text-white" : "bg-orange-500 text-white"
                          )}>
                            <Award className="w-12 h-12" />
                          </div>
                          <h3 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">
                            {score === exercises.length ? "HOÀN HẢO!" : 
                             score >= exercises.length / 2 ? "LÀM TỐT LẮM!" : "CỐ GẮNG LÊN!"}
                          </h3>
                          <p className="text-xl font-bold text-slate-500 mb-10">
                            Bạn đã trả lời đúng <span className="text-primary text-3xl mx-1">{score}</span> / {exercises.length} câu.
                          </p>
                          
                          <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                              variant="outline"
                              className="h-16 px-10 rounded-2xl font-black text-lg border-2"
                              onClick={() => {
                                setAnswers({});
                                setChecked(false);
                              }}
                            >
                              <ListRestart className="w-6 h-6 mr-2" /> Làm lại
                            </Button>
                            <ButtonLink 
                              href="/grammar"
                              className="h-16 px-10 rounded-2xl font-black text-lg shadow-xl shadow-primary/20"
                            >
                              Bài học khác <ArrowRight className="w-6 h-6 ml-2" />
                            </ButtonLink>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* Sidebar (Optional info) */}
            <div className="lg:col-span-4 space-y-8">
              <div className="sticky top-32">
                <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
                  <div className="bg-primary/10 p-8 text-center border-b border-primary/5">
                    <Flame className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                    <h3 className="text-xl font-black text-slate-900">Mẹo ghi nhớ</h3>
                  </div>
                  <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-black text-xs">1</div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">Hãy đọc to các ví dụ để kích hoạt vùng ngôn ngữ trong não bộ.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-black text-xs">2</div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">Tập trung vào cấu trúc câu được bọc trong khung màu xanh nhạt.</p>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 font-black text-xs">3</div>
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">Đừng ngại làm lại bài tập nhiều lần cho đến khi đạt điểm tối đa.</p>
                      </div>
                    </div>
                    
                    <div className="pt-6 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">AI</div>
                        <p className="text-xs font-bold text-slate-500 italic">"Học ngữ pháp là nền tảng để giao tiếp tự tin."</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
