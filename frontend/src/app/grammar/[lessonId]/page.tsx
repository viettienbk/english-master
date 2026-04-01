'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getGrammarLessonById, updateLessonProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { ChevronLeft, Volume2, CheckCircle2, ArrowRight, BookOpen, Lightbulb, PenTool, Award } from 'lucide-react';
import type { GrammarLesson, GrammarExample, GrammarExercise } from '@/types';

export default function GrammarLessonPage() {
  const params = useParams();
  const lessonId = params.lessonId as string;
  const [lesson, setLesson] = useState<GrammarLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExercises, setShowExercises] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const { speak } = useSpeechSynthesis();

  useEffect(() => {
    getGrammarLessonById(lessonId)
      .then((data) => {
        setLesson(data);
        // Mark as ongoing when started
        updateLessonProgress(lessonId, 'grammar', 'ongoing').catch(console.error);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-32" />
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="h-96 bg-muted rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-10 h-10 text-slate-300" />
        </div>
        <p className="text-xl font-bold text-slate-700 mb-2">Không tìm thấy bài học</p>
        <p className="text-slate-500 mb-6">Bài học này có thể đã bị xóa hoặc không tồn tại.</p>
        <ButtonLink href="/grammar">Quay lại danh sách</ButtonLink>
      </div>
    );
  }

  const examples: GrammarExample[] = JSON.parse(lesson.examples);
  const exercises: GrammarExercise[] = JSON.parse(lesson.exercises);

  const score = checked
    ? exercises.filter((ex, i) => {
        const userAnswer = (answers[i] || '').trim().toLowerCase();
        return userAnswer === ex.answer.toLowerCase();
      }).length
    : 0;
  
  const progressPercentage = Object.keys(answers).length / exercises.length * 100;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <Link
          href="/grammar"
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100"
        >
          <ChevronLeft className="w-4 h-4" /> Quay lại danh sách
        </Link>

        {/* Hero Header */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 opacity-10 pointer-events-none">
            <BookOpen className="w-48 h-48" />
          </div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-4">
              <Lightbulb className="w-3.5 h-3.5" /> Bài học ngữ pháp
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight tracking-tight">
              {lesson.title}
            </h1>
            {lesson.titleVi && (
              <p className="text-lg md:text-xl text-blue-100 font-medium max-w-2xl">
                {lesson.titleVi}
              </p>
            )}
          </div>
        </div>

        {/* Lesson Content */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-slate-100 mb-10">
          <div className="prose prose-slate prose-lg max-w-none">
            {lesson.content.split('\n').map((line, i) => {
              if (line.startsWith('## '))
                return <h2 key={i} className="text-2xl font-bold text-slate-800 mt-8 mb-4 flex items-center gap-2"><span className="w-2 h-6 bg-primary rounded-full block"></span>{line.slice(3)}</h2>;
              if (line.startsWith('### '))
                return <h3 key={i} className="text-xl font-bold text-slate-700 mt-6 mb-3">{line.slice(4)}</h3>;
              if (line.startsWith('- **'))
                return (
                  <p key={i} className="ml-4 mb-2 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2.5 shrink-0 block"></span>
                    <span dangerouslySetInnerHTML={{
                      __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong class="text-slate-800">$1</strong>').replace(/\*(.*?)\*/g, '<em class="text-primary font-medium">$1</em>')
                    }} />
                  </p>
                );
              if (line.startsWith('- '))
                return (
                  <p key={i} className="ml-4 mb-2 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2.5 shrink-0 block"></span>
                    <span>{line.slice(2)}</span>
                  </p>
                );
              if (line.match(/^\d+\./))
                return (
                  <p key={i} className="ml-4 mb-2 font-medium text-slate-700">
                    <span dangerouslySetInnerHTML={{
                      __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }} />
                  </p>
                );
              if (line.trim() === '') return <br key={i} />;
              return <p key={i} className="mb-4 text-slate-600 leading-relaxed">{line}</p>;
            })}
          </div>
        </div>

        {/* Examples Section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6 px-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Ví dụ minh họa</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examples.map((ex, i) => (
              <Card key={i} className="border-2 border-slate-100 hover:border-orange-200 transition-colors shadow-sm rounded-2xl overflow-hidden group">
                <CardContent className="p-0">
                  <div className="p-5 bg-white">
                    <p className="font-bold text-lg text-slate-800 mb-1 group-hover:text-primary transition-colors">{ex.english}</p>
                    <p className="text-slate-500 font-medium">{ex.vietnamese}</p>
                  </div>
                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-start gap-3 justify-between">
                    <p className="text-sm text-slate-600 italic">
                      💡 {ex.explanation}
                    </p>
                    <button
                      onClick={() => speak(ex.english)}
                      className="p-2 rounded-full bg-white shadow-sm border border-slate-200 text-primary hover:bg-primary hover:text-white transition-all shrink-0"
                      title="Nghe phát âm"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Exercises Section */}
        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          <div className="bg-slate-900 p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <PenTool className="w-7 h-7 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Thực hành</h2>
                <p className="text-slate-400 font-medium">Kiểm tra lại kiến thức vừa học</p>
              </div>
            </div>
            
            {!showExercises ? (
              <Button 
                size="lg" 
                onClick={() => setShowExercises(true)}
                className="bg-green-500 hover:bg-green-600 text-white font-bold rounded-full px-8 h-12 shadow-lg shadow-green-500/20"
              >
                Làm bài tập ngay ({exercises.length} câu)
              </Button>
            ) : (
              <div className="w-full md:w-48">
                <div className="flex justify-between text-xs font-bold mb-2">
                  <span className="text-slate-400">Tiến độ</span>
                  <span className="text-green-400">{Math.round(progressPercentage)}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {showExercises && (
            <div className="p-6 md:p-8 bg-slate-50/50">
              <div className="space-y-6 mb-8">
                {exercises.map((ex, i) => (
                  <Card key={i} className={cn(
                    "border-2 shadow-sm rounded-2xl transition-all",
                    checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase() ? "border-green-200 bg-green-50/30" : 
                    checked ? "border-red-200 bg-red-50/30" : "border-slate-100 hover:border-primary/20 bg-white"
                  )}>
                    <CardContent className="p-6 md:p-8">
                      <div className="flex gap-4 mb-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0",
                          checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase() ? "bg-green-100 text-green-600" :
                          checked ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"
                        )}>
                          {i + 1}
                        </div>
                        <p className="font-semibold text-lg text-slate-800 pt-1 leading-snug">
                          {ex.question}
                        </p>
                      </div>
                      
                      <div className="pl-12">
                        {ex.type === 'multiple_choice' && ex.options ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {ex.options.map((opt) => {
                              const isSelected = answers[i] === opt;
                              const isCorrectAnswer = opt === ex.answer;
                              
                              let buttonClass = "border-slate-200 hover:border-primary/50 hover:bg-slate-50 text-slate-700";
                              if (!checked && isSelected) buttonClass = "border-primary bg-primary/5 text-primary font-bold ring-2 ring-primary/20";
                              if (checked && isCorrectAnswer) buttonClass = "border-green-500 bg-green-50 text-green-700 font-bold";
                              if (checked && isSelected && !isCorrectAnswer) buttonClass = "border-red-500 bg-red-50 text-red-700 font-bold opacity-70";

                              return (
                                <button
                                  key={opt}
                                  disabled={checked}
                                  onClick={() => {
                                    if (!checked) setAnswers({ ...answers, [i]: opt });
                                  }}
                                  className={cn(
                                    'p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden',
                                    buttonClass
                                  )}
                                >
                                  {checked && isCorrectAnswer && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                  )}
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
                            onChange={(e) => {
                              if (!checked) setAnswers({ ...answers, [i]: e.target.value });
                            }}
                            className={cn(
                              'w-full p-4 rounded-xl border-2 font-medium text-slate-800 transition-all outline-none focus:ring-4',
                              checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase()
                                ? 'border-green-500 bg-green-50 focus:ring-0'
                                : checked
                                  ? 'border-red-500 bg-red-50 focus:ring-0'
                                  : 'border-slate-200 focus:border-primary focus:ring-primary/20'
                            )}
                            placeholder="Nhập câu trả lời của bạn..."
                          />
                        )}
                        
                        {checked && (answers[i] || '').trim().toLowerCase() !== ex.answer.toLowerCase() && (
                          <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-100 flex gap-3 items-start">
                            <Lightbulb className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-bold text-orange-800 mb-1">Đáp án đúng là:</p>
                              <p className="font-medium text-orange-700">{ex.answer}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {!checked ? (
                <Button
                  className="w-full h-14 text-lg font-bold rounded-2xl shadow-lg shadow-primary/20"
                  size="lg"
                  disabled={Object.keys(answers).length === 0}
                  onClick={() => {
                    setChecked(true);
                    if (lesson) {
                      const exercises: GrammarExercise[] = JSON.parse(lesson.exercises);
                      const correctCount = exercises.filter((ex, i) => {
                        const userAnswer = (answers[i] || '').trim().toLowerCase();
                        return userAnswer === ex.answer.toLowerCase();
                      }).length;
                      const percentage = Math.round((correctCount / exercises.length) * 100);
                      updateLessonProgress(lessonId, 'grammar', 'completed', percentage).catch(console.error);
                    }
                  }}
                >
                  Kiểm tra đáp án
                </Button>
              ) : (
                <div className="text-center bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm animate-in zoom-in-95 duration-500">
                  <div className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
                    score === exercises.length ? "bg-green-100 text-green-500" : 
                    score >= exercises.length / 2 ? "bg-blue-100 text-blue-500" : "bg-orange-100 text-orange-500"
                  )}>
                    <Award className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    {score === exercises.length ? "Tuyệt vời! Hoàn hảo!" : 
                     score >= exercises.length / 2 ? "Khá lắm! Cố gắng thêm nhé" : "Hãy ôn tập lại một chút nhé"}
                  </h3>
                  <p className="text-lg font-medium text-slate-500 mb-8">
                    Bạn đã đúng <span className="font-black text-slate-800 text-xl mx-1">{score}</span> trên tổng số <span className="font-bold">{exercises.length}</span> câu hỏi.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      className="h-12 px-8 rounded-xl font-bold border-2"
                      onClick={() => {
                        setAnswers({});
                        setChecked(false);
                      }}
                    >
                      Làm lại bài tập
                    </Button>
                    <ButtonLink 
                      href="/grammar"
                      className="h-12 px-8 rounded-xl font-bold"
                    >
                      Tiếp tục bài khác <ArrowRight className="w-4 h-4 ml-2" />
                    </ButtonLink>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
