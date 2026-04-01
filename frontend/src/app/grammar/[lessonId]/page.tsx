'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getGrammarLessonById } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
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
      .then(setLesson)
      .finally(() => setLoading(false));
  }, [lessonId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Không tìm thấy bài học</p>
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href="/grammar"
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        &larr; Quay lại danh sách bài học
      </Link>

      <h1 className="text-3xl font-bold mb-1">{lesson.title}</h1>
      {lesson.titleVi && (
        <p className="text-lg text-muted-foreground mb-6">{lesson.titleVi}</p>
      )}

      {/* Lesson content rendered as simple formatted text */}
      <div className="prose prose-sm max-w-none mb-8">
        {lesson.content.split('\n').map((line, i) => {
          if (line.startsWith('## '))
            return <h2 key={i} className="text-2xl font-bold mt-6 mb-3">{line.slice(3)}</h2>;
          if (line.startsWith('### '))
            return <h3 key={i} className="text-lg font-semibold mt-4 mb-2">{line.slice(4)}</h3>;
          if (line.startsWith('- **'))
            return (
              <p key={i} className="ml-4 mb-1">
                <span dangerouslySetInnerHTML={{
                  __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              </p>
            );
          if (line.startsWith('- '))
            return <p key={i} className="ml-4 mb-1">{line.slice(2)}</p>;
          if (line.match(/^\d+\./))
            return (
              <p key={i} className="ml-4 mb-1">
                <span dangerouslySetInnerHTML={{
                  __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} />
              </p>
            );
          if (line.trim() === '') return <br key={i} />;
          return <p key={i} className="mb-1">{line}</p>;
        })}
      </div>

      {/* Examples */}
      <h2 className="text-xl font-semibold mb-4">Ví dụ</h2>
      <div className="space-y-3 mb-8">
        {examples.map((ex, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => speak(ex.english)}
                  className="mt-1 p-1.5 rounded-full hover:bg-primary/10 shrink-0"
                >
                  <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M17.95 6.05a8 8 0 010 11.9M6.5 8.8L10.7 5.6a.5.5 0 01.8.4v12a.5.5 0 01-.8.4L6.5 15.2H4a1 1 0 01-1-1v-4.4a1 1 0 011-1h2.5z" />
                  </svg>
                </button>
                <div>
                  <p className="font-medium">{ex.english}</p>
                  <p className="text-sm text-primary/80">{ex.vietnamese}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ex.explanation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Exercises */}
      <div className="border-t pt-8">
        {!showExercises ? (
          <div className="text-center">
            <Button size="lg" onClick={() => setShowExercises(true)}>
              Làm bài tập ({exercises.length} câu)
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4">Bài tập</h2>
            <div className="space-y-4 mb-6">
              {exercises.map((ex, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <p className="font-medium mb-3">
                      Câu {i + 1}: {ex.question}
                    </p>
                    {ex.type === 'multiple_choice' && ex.options ? (
                      <div className="grid grid-cols-2 gap-2">
                        {ex.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              if (!checked) setAnswers({ ...answers, [i]: opt });
                            }}
                            className={cn(
                              'p-3 rounded-lg border text-left transition-all',
                              answers[i] === opt && !checked && 'border-primary bg-primary/5',
                              checked && opt === ex.answer && 'border-green-500 bg-green-50',
                              checked && answers[i] === opt && opt !== ex.answer && 'border-red-500 bg-red-50',
                              !checked && 'hover:border-primary cursor-pointer',
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={answers[i] || ''}
                        onChange={(e) => {
                          if (!checked) setAnswers({ ...answers, [i]: e.target.value });
                        }}
                        className={cn(
                          'w-full p-3 rounded-lg border',
                          checked && (answers[i] || '').trim().toLowerCase() === ex.answer.toLowerCase()
                            ? 'border-green-500 bg-green-50'
                            : checked
                              ? 'border-red-500 bg-red-50'
                              : '',
                        )}
                        placeholder="Nhập đáp án..."
                      />
                    )}
                    {checked && (answers[i] || '').trim().toLowerCase() !== ex.answer.toLowerCase() && (
                      <p className="text-sm text-red-600 mt-2">
                        Đáp án đúng: <strong>{ex.answer}</strong>
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {!checked ? (
              <Button
                className="w-full"
                size="lg"
                onClick={() => setChecked(true)}
              >
                Kiểm tra đáp án
              </Button>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-xl font-semibold">
                  Kết quả: {score} / {exercises.length} ({Math.round((score / exercises.length) * 100)}%)
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnswers({});
                      setChecked(false);
                    }}
                  >
                    Làm lại
                  </Button>
                  <ButtonLink href="/grammar">Bài khác</ButtonLink>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
