'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getListeningLessons } from '@/lib/api';
import type { ListeningLesson } from '@/types';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function ListeningPage() {
  const [lessons, setLessons] = useState<ListeningLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getListeningLessons()
      .then(setLessons)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Luyện nghe</h1>
        <p className="text-muted-foreground">
          Nghe và điền từ còn thiếu để cải thiện kỹ năng nghe
        </p>
      </div>

      <div className="space-y-4">
        {lessons.map((lesson) => (
          <Link key={lesson.id} href={`/listening/${lesson.id}`}>
            <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mb-4">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className={levelColors[lesson.level]}>
                    {levelLabels[lesson.level] || lesson.level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {(JSON.parse(lesson.blanks) as unknown[]).length} chỗ trống
                  </span>
                </div>
                <CardTitle className="text-lg">{lesson.title}</CardTitle>
                {lesson.titleVi && (
                  <p className="text-sm text-muted-foreground">{lesson.titleVi}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {lesson.transcript}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}

        {lessons.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Chưa có bài nghe nào
          </p>
        )}
      </div>
    </div>
  );
}
