'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getListeningLessonById, checkListeningAnswers, updateLessonProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { ListeningLesson, ListeningBlank, CheckResult } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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
    getListeningLessonById(lessonId)
      .then((data) => {
        setLesson(data);
        // Mark as ongoing when started
        updateLessonProgress(lessonId, 'listening', 'ongoing').catch(console.error);
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const playAudio = useCallback(() => {
    if (!lesson) return;
    setIsPlaying(true);
    speak(lesson.transcript);
    setTimeout(() => setIsPlaying(false), lesson.transcript.length * 60);
  }, [lesson, speak]);

  const handleCheck = async () => {
    if (!lesson) return;
    const res = await checkListeningAnswers(lessonId, answers);
    setResult(res);
    // Mark as completed with score
    updateLessonProgress(lessonId, 'listening', 'completed', res.score).catch(console.error);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-64" />
          <div className="h-48 bg-muted rounded-xl" />
          <div className="h-64 bg-muted rounded-xl" />
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

  const blanks: ListeningBlank[] = JSON.parse(lesson.blanks);

  // Build fill-in-blank transcript display
  const words = lesson.transcript.split(' ');
  const blankPositions = new Map(blanks.map((b) => [b.position, b]));

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/listening"
          className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
        >
          &larr; Quay lại danh sách bài nghe
        </Link>

        <h1 className="text-3xl font-bold mb-1">{lesson.title}</h1>
        {lesson.titleVi && (
          <p className="text-lg text-muted-foreground mb-6">{lesson.titleVi}</p>
        )}

        {/* Audio Player */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <button
                onClick={playAudio}
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center transition-all',
                  isPlaying
                    ? 'bg-primary/20 text-primary'
                    : 'bg-primary text-white hover:bg-primary/90',
                )}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div>
                <p className="font-medium">{lesson.title}</p>
                <p className="text-sm text-muted-foreground">
                  Nhấn play để nghe. Điền từ còn thiếu vào ô trống.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fill-in-blank */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="font-semibold mb-4">Điền từ còn thiếu:</h2>
            <p className="text-base leading-8">
              {words.map((word, idx) => {
                const blank = blankPositions.get(idx);
                if (blank) {
                  const isCorrect =
                    result?.results.find((r) => r.position === idx)?.isCorrect;
                  return (
                    <span key={idx}>
                      <input
                        type="text"
                        value={answers[idx] || ''}
                        onChange={(e) =>
                          setAnswers({ ...answers, [idx]: e.target.value })
                        }
                        disabled={!!result}
                        placeholder={blank.hint ? `(${blank.hint})` : '___'}
                        className={cn(
                          'inline-block w-28 border-b-2 px-1 text-center focus:outline-none transition-colors',
                          !result && 'border-primary focus:border-primary/70',
                          result && isCorrect && 'border-green-500 text-green-700',
                          result && !isCorrect && 'border-red-500 text-red-700',
                        )}
                      />{' '}
                    </span>
                  );
                }
                return <span key={idx}>{word} </span>;
              })}
            </p>
          </CardContent>
        </Card>

        {/* Result */}
        {result && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">
                  {result.score >= 80 ? '🎉' : result.score >= 50 ? '👍' : '💪'}
                </span>
                <div>
                  <p className="text-xl font-bold">
                    {result.correct} / {result.total} câu đúng
                  </p>
                  <p className="text-muted-foreground">{result.score}%</p>
                </div>
              </div>
              <div className="space-y-2">
                {result.results.map((r) => (
                  <div key={r.position} className="flex items-center gap-2 text-sm">
                    <span>{r.isCorrect ? '✅' : '❌'}</span>
                    <span className="font-medium">Vị trí {r.position + 1}:</span>
                    <span className="text-muted-foreground">
                      Bạn viết: <em>&ldquo;{r.userAnswer || '(bỏ trống)'}&rdquo;</em>
                    </span>
                    {!r.isCorrect && (
                      <span className="text-green-600">
                        → Đáp án đúng: <strong>{r.correctAnswer}</strong>
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Translation */}
        {lesson.translation && result && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className="font-semibold text-primary flex items-center gap-2"
              >
                {showTranslation ? '▼' : '▶'} Xem bản dịch
              </button>
              {showTranslation && (
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {lesson.translation}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          {!result ? (
            <Button
              size="lg"
              onClick={handleCheck}
              disabled={Object.keys(answers).length < blanks.length}
            >
              Kiểm tra đáp án
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                  setShowTranslation(false);
                }}
              >
                Làm lại
              </Button>
              <ButtonLink href="/listening">Bài khác</ButtonLink>
            </>
          )}
          <Button variant="ghost" onClick={playAudio}>
            🔊 Nghe lại
          </Button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
