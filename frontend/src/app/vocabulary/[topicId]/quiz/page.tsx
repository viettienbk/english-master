'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ButtonLink } from '@/components/ui/button-link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getTopicById, updateProgress } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import type { VocabularyTopic, Word } from '@/types';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { 
  ChevronLeft, 
  Target, 
  PenTool, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy,
  RefreshCw,
  Home
} from 'lucide-react';

// ---------- Types & Helpers ----------

interface QuizQuestion {
  word: Word;
  options: string[];
  correctAnswer: string;
  type: 'definition' | 'word';
}

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(words: Word[]): QuizQuestion[] {
  return shuffleArray(words).map((word) => {
    const isDefinitionType = Math.random() > 0.5;
    const otherWords = words.filter((w) => w.id !== word.id);
    const wrongOptions = shuffleArray(otherWords)
      .slice(0, 3)
      .map((w) => (isDefinitionType ? (w.definitionVi || w.definition) : w.word));

    const correctAnswer = isDefinitionType
      ? (word.definitionVi || word.definition)
      : word.word;

    return {
      word,
      options: shuffleArray([correctAnswer, ...wrongOptions]),
      correctAnswer,
      type: isDefinitionType ? 'definition' : 'word',
    };
  });
}

function normalizeAnswer(s: string) {
  return s.trim().toLowerCase();
}

// ---------- Shared Result Screen ----------

function ResultScreen({
  score,
  total,
  onRetry,
  topicId,
  topicName
}: {
  score: number;
  total: number;
  onRetry: () => void;
  topicId: string;
  topicName: string;
}) {
  const percentage = Math.round((score / total) * 100);
  
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card className="overflow-hidden border-none shadow-2xl rounded-3xl">
        <div className={cn(
          "p-12 text-center text-white",
          percentage >= 80 ? "bg-gradient-to-br from-yellow-400 to-orange-500" : 
          percentage >= 50 ? "bg-gradient-to-br from-blue-500 to-indigo-600" : 
          "bg-gradient-to-br from-slate-600 to-slate-800"
        )}>
          <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Trophy className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-black mb-2">Kết quả hoàn thành!</h1>
          <p className="text-white/80 font-medium">Chủ đề: {topicName}</p>
        </div>
        
        <CardContent className="p-10 bg-white">
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Đúng</p>
              <p className="text-4xl font-black text-slate-900">{score} <span className="text-slate-300 text-2xl">/ {total}</span></p>
            </div>
            <div className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Tỉ lệ</p>
              <p className="text-4xl font-black text-slate-900">{percentage}%</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={onRetry} 
              className="h-14 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
            >
              <RefreshCw className="w-5 h-5" />
              Luyện tập lại
            </Button>
            <div className="flex gap-3">
              <ButtonLink 
                href={`/vocabulary/${topicId}`} 
                variant="outline" 
                className="flex-1 h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Về chủ đề
              </ButtonLink>
              <ButtonLink 
                href="/vocabulary" 
                variant="outline" 
                className="flex-1 h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                Học chủ đề khác
              </ButtonLink>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Multiple Choice Mode ----------

function MultipleChoiceMode({
  words,
  topicId,
  topicName,
}: {
  words: Word[];
  topicId: string;
  topicName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [quizDone, setQuizDone] = useState(false);
  const { speak } = useSpeechSynthesis();

  const questions = useMemo(() => generateQuestions(words), [words]);

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setQuizDone(false);
  };

  if (quizDone) {
    return (
      <ResultScreen score={score} total={questions.length} onRetry={reset} topicId={topicId} topicName={topicName} />
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (answer: string) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      setScore((s) => s + 1);
      updateProgress(question.word.id, 5).catch(console.error);
    } else {
      updateProgress(question.word.id, 0).catch(console.error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setAnswered(false);
    } else {
      setQuizDone(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/vocabulary/${topicId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
          <ChevronLeft className="w-5 h-5" />
          Thoát
        </Link>
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" />
          <span className="font-black text-slate-900 text-lg">{currentIndex + 1} <span className="text-slate-300">/ {questions.length}</span></span>
        </div>
      </div>

      <Progress value={progress} className="h-3 mb-12 bg-slate-100" />

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden mb-8">
        <CardContent className="p-10">
          <div className="text-center mb-10">
            {question.type === 'definition' ? (
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5">
                  Chọn nghĩa đúng
                </Badge>
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tight">{question.word.word}</h2>
                  <button
                    onClick={() => speak(question.word.word)}
                    className="p-4 rounded-2xl bg-slate-50 text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Volume2 className="w-6 h-6" />
                  </button>
                </div>
                {question.word.phonetic && (
                  <p className="text-xl font-medium text-slate-400 font-mono italic">{question.word.phonetic}</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Badge variant="outline" className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5">
                  Từ vựng tương ứng là gì?
                </Badge>
                <h2 className="text-3xl font-black text-slate-900 leading-tight">
                  {question.word.definitionVi || question.word.definition}
                </h2>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={answered}
                className={cn(
                  'group relative p-6 rounded-[1.5rem] border-2 text-left transition-all duration-300 font-bold text-lg flex items-center justify-between',
                  !answered && 'border-slate-100 hover:border-primary hover:bg-primary/5 hover:scale-[1.02] active:scale-[0.98]',
                  answered && option === question.correctAnswer && 'border-green-500 bg-green-50 text-green-700 ring-4 ring-green-100',
                  answered && option === selectedAnswer && option !== question.correctAnswer && 'border-red-500 bg-red-50 text-red-700 ring-4 ring-red-100',
                  answered && option !== question.correctAnswer && option !== selectedAnswer && 'opacity-40 grayscale',
                )}
              >
                <span>{option}</span>
                {answered && option === question.correctAnswer && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                {answered && option === selectedAnswer && option !== question.correctAnswer && <XCircle className="w-6 h-6 text-red-500" />}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {answered && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <Button 
            onClick={handleNext} 
            className="w-full h-16 rounded-2xl text-xl font-black shadow-2xl shadow-primary/20 flex items-center justify-center gap-2"
          >
            {currentIndex < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'}
            <ArrowRight className="w-6 h-6" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ---------- Spelling Mode ----------

function SpellingMode({
  words,
  topicId,
  topicName,
}: {
  words: Word[];
  topicId: string;
  topicName: string;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { speak } = useSpeechSynthesis();

  const questions = useMemo(() => words.map(w => ({ word: w })), [words]);

  useEffect(() => {
    if (!submitted) inputRef.current?.focus();
  }, [currentIndex, submitted]);

  const reset = () => {
    setCurrentIndex(0);
    setUserInput('');
    setSubmitted(false);
    setIsCorrect(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <ResultScreen score={score} total={questions.length} onRetry={reset} topicId={topicId} topicName={topicName} />
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleSubmit = () => {
    if (submitted || !userInput.trim()) return;
    const correct = normalizeAnswer(userInput) === normalizeAnswer(question.word.word);
    setIsCorrect(correct);
    setSubmitted(true);
    if (correct) {
      setScore((s) => s + 1);
      updateProgress(question.word.id, 5).catch(console.error);
    } else {
      updateProgress(question.word.id, 0).catch(console.error);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setUserInput('');
      setSubmitted(false);
      setIsCorrect(false);
    } else {
      setDone(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!submitted) handleSubmit();
      else handleNext();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <Link href={`/vocabulary/${topicId}`} className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-bold text-sm uppercase tracking-widest">
          <ChevronLeft className="w-5 h-5" />
          Thoát
        </Link>
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-primary" />
          <span className="font-black text-slate-900 text-lg">{currentIndex + 1} <span className="text-slate-300">/ {questions.length}</span></span>
        </div>
      </div>

      <Progress value={progress} className="h-3 mb-12 bg-slate-100" />

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden mb-8">
        <CardContent className="p-10">
          <div className="text-center mb-10 space-y-6">
            <Badge variant="outline" className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-[0.2em] border-primary/20 text-primary bg-primary/5">
              Nghe và viết lại từ
            </Badge>
            
            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
              <h2 className="text-3xl font-black text-slate-900 mb-2 leading-tight">
                {question.word.definitionVi || question.word.definition}
              </h2>
              <p className="text-lg text-slate-400 font-medium">{question.word.definition}</p>
              
              <button
                onClick={() => speak(question.word.word)}
                className="mt-6 flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary border-2 border-primary/10 hover:border-primary transition-all font-bold mx-auto shadow-sm"
              >
                <Volume2 className="w-5 h-5" />
                Nghe âm thanh
              </button>
            </div>

            {question.word.example && (
              <div className="relative">
                <p className={cn(
                  'text-lg italic font-serif text-slate-500 px-6 transition-all duration-700',
                  !submitted && 'blur-md select-none opacity-30',
                )}>
                  &ldquo;{question.word.example.replace(new RegExp(question.word.word, 'gi'), '_____')}&rdquo;
                </p>
                {!submitted && (
                  <p className="absolute inset-0 flex items-center justify-center text-xs font-bold text-slate-300 uppercase tracking-widest">
                    Ví dụ được ẩn
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={submitted}
                placeholder="Nhập từ tiếng Anh..."
                className={cn(
                  'w-full h-20 bg-slate-50 border-4 rounded-3xl px-8 text-2xl font-black outline-none transition-all text-center tracking-wide',
                  !submitted && 'border-slate-100 focus:border-primary focus:bg-white focus:ring-8 focus:ring-primary/5',
                  submitted && isCorrect && 'border-green-500 bg-green-50 text-green-700',
                  submitted && !isCorrect && 'border-red-500 bg-red-50 text-red-700',
                )}
              />
              {submitted && (
                <div className="absolute -top-3 -right-3">
                  {isCorrect ? (
                    <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="bg-red-500 text-white p-2 rounded-full shadow-lg">
                      <XCircle className="w-6 h-6" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {!submitted ? (
              <Button 
                onClick={handleSubmit} 
                disabled={!userInput.trim()}
                className="w-full h-16 rounded-2xl text-xl font-black shadow-xl shadow-primary/20"
              >
                Kiểm tra kết quả
              </Button>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                {!isCorrect && (
                  <div className="p-6 rounded-2xl bg-slate-900 text-white text-center">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Đáp án đúng</p>
                    <p className="text-3xl font-black tracking-tight">{question.word.word}</p>
                    {question.word.phonetic && <p className="text-primary font-mono mt-1">{question.word.phonetic}</p>}
                  </div>
                )}
                <Button 
                  onClick={handleNext} 
                  className="w-full h-16 rounded-2xl text-xl font-black flex items-center justify-center gap-2"
                >
                  {currentIndex < questions.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành bài tập'}
                  <ArrowRight className="w-6 h-6" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------- Main Page ----------

type Mode = 'select' | 'multiple_choice' | 'spelling';

export default function QuizPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('select');

  useEffect(() => {
    getTopicById(topicId)
      .then(setTopic)
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded-xl w-48" />
          <div className="h-64 bg-muted rounded-[2.5rem]" />
        </div>
      </div>
    );
  }

  if (!topic?.words?.length) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-xl mb-4">Dữ liệu bài tập hiện không khả dụng</p>
        <ButtonLink href="/vocabulary">Quay lại thư viện</ButtonLink>
      </div>
    );
  }

  const content = () => {
    if (mode === 'multiple_choice') {
      return (
        <MultipleChoiceMode
          words={topic.words}
          topicId={topicId}
          topicName={topic.nameVi || topic.name}
        />
      );
    }

    if (mode === 'spelling') {
      return (
        <SpellingMode
          words={topic.words}
          topicId={topicId}
          topicName={topic.nameVi || topic.name}
        />
      );
    }

    // Mode selection screen
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <Link
            href={`/vocabulary/${topicId}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-bold text-sm uppercase tracking-[0.2em] mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Quay lại bài học
          </Link>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">Kiểm tra kiến thức</h1>
          <p className="text-lg text-slate-500 font-medium max-w-md mx-auto">
            Chọn phương thức luyện tập để ghi nhớ tốt nhất cho chủ đề <span className="text-primary font-bold">"{topic.nameVi || topic.name}"</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            className="group relative p-1 text-left"
            onClick={() => setMode('multiple_choice')}
          >
            <div className="absolute inset-0 bg-primary/10 rounded-[2.5rem] rotate-2 group-hover:rotate-0 transition-transform duration-300" />
            <Card className="relative h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Target className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Trắc nghiệm</h2>
                <p className="text-slate-500 font-medium mb-8">
                  Thử thách khả năng nhận diện từ và nghĩa qua 4 lựa chọn khác nhau.
                </p>
                <div className="mt-auto w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-primary/20 group-hover:bg-primary/90 transition-colors">
                  Bắt đầu ngay
                </div>
              </CardContent>
            </Card>
          </button>

          <button
            className="group relative p-1 text-left"
            onClick={() => setMode('spelling')}
          >
            <div className="absolute inset-0 bg-slate-900/5 rounded-[2.5rem] -rotate-2 group-hover:rotate-0 transition-transform duration-300" />
            <Card className="relative h-full border-none shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 group-hover:-translate-y-2">
              <CardContent className="p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <PenTool className="w-10 h-10 text-slate-900" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-3">Điền từ</h2>
                <p className="text-slate-500 font-medium mb-8">
                  Khám phá khả năng ghi nhớ mặt chữ bằng cách tự gõ từ tiếng Anh.
                </p>
                <div className="mt-auto w-full py-4 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-sm shadow-lg shadow-slate-200 group-hover:bg-slate-800 transition-colors">
                  Bắt đầu ngay
                </div>
              </CardContent>
            </Card>
          </button>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 py-6 px-10 rounded-3xl bg-slate-50 border border-slate-100">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Số lượng từ</p>
            <p className="text-xl font-black text-slate-900">{topic.words.length}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thời gian ước tính</p>
            <p className="text-xl font-black text-slate-900">{Math.ceil(topic.words.length * 0.5)} phút</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      {content()}
    </ProtectedRoute>
  );
}
