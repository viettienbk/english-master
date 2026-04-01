'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ButtonLink } from '@/components/ui/button-link';
import { getProgressStats, getReviewWords, type ProgressStats, type ProgressItem } from '@/lib/api';

export default function ProgressPage() {
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [reviewWords, setReviewWords] = useState<ProgressItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProgressStats(), getReviewWords()])
      .then(([statsData, reviewData]) => {
        setStats(statsData.stats);
        setReviewWords(reviewData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tiến độ học tập</h1>
        <p className="text-muted-foreground">
          Theo dõi hành trình chinh phục tiếng Anh của bạn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 uppercase tracking-wider">
              Tổng số từ đã học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {stats?.learnedWords || 0} / {stats?.totalWords || 0}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Từ vựng bạn đã bắt đầu học qua Flashcard/Quiz
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 uppercase tracking-wider">
              Từ đã thành thạo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {stats?.masteredWords || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Từ đã ôn tập thành công ít nhất 5 lần (SM-2)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-purple-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600 uppercase tracking-wider">
              Tỉ lệ hoàn thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {Math.round(stats?.progressPercentage || 0)}%
            </div>
            <div className="mt-2">
              <Progress value={stats?.progressPercentage || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Review Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-xl">Cần ôn tập ngay</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Các từ đến hạn ôn tập theo thuật toán lặp lại ngắt quãng
                </p>
              </div>
              <Badge variant={reviewWords.length > 0 ? 'destructive' : 'secondary'} className="px-3 py-1">
                {reviewWords.length} từ
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              {reviewWords.length > 0 ? (
                <div className="divide-y">
                  {reviewWords.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div>
                        <p className="font-bold text-lg text-primary">{item.word.word}</p>
                        <p className="text-sm text-muted-foreground">{item.word.definitionVi || item.word.definition}</p>
                        <div className="flex gap-2 mt-1">
                           <Badge variant="outline" className="text-[10px] h-4">Lần ôn: {item.repetitions}</Badge>
                           <Badge variant="outline" className="text-[10px] h-4">EF: {item.easeFactor.toFixed(1)}</Badge>
                        </div>
                      </div>
                      <Link href={`/vocabulary/${item.word.topicId}/flashcard`}>
                        <button className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </Link>
                    </div>
                  ))}
                  {reviewWords.length > 10 && (
                    <div className="p-4 text-center">
                       <p className="text-sm text-muted-foreground">Và {reviewWords.length - 10} từ khác...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 className="text-lg font-semibold mb-1">Bạn đã hoàn thành hết bài ôn!</h3>
                  <p className="text-sm text-muted-foreground">
                    Không có từ nào cần ôn tập vào lúc này. Hãy học thêm từ mới nhé!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions / Suggestions */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Học từ mới</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Khám phá các chủ đề từ vựng mới để làm phong phú thêm vốn từ của bạn.
              </p>
              <ButtonLink href="/vocabulary" className="w-full">
                Xem tất cả chủ đề
              </ButtonLink>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thực hành hội thoại</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Sử dụng những từ đã học để giao tiếp với AI trong các tình huống thực tế.
              </p>
              <ButtonLink href="/conversation" variant="outline" className="w-full">
                Bắt đầu hội thoại
              </ButtonLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
