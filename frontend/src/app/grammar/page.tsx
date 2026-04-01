'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGrammarLessons } from '@/lib/api';
import type { GrammarLesson } from '@/types';

const categoryLabels: Record<string, string> = {
  basic: 'Ngữ pháp cơ bản',
  structures: 'Cấu trúc câu',
  conversational: 'Ngữ pháp giao tiếp',
};

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function GrammarPage() {
  const [lessons, setLessons] = useState<GrammarLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGrammarLessons()
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

  const categories = ['basic', 'structures', 'conversational'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ngữ pháp</h1>
        <p className="text-muted-foreground">
          Học ngữ pháp tiếng Anh từ cơ bản đến nâng cao
        </p>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="mb-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat} value={cat}>
              {categoryLabels[cat]}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="space-y-4">
              {lessons
                .filter((l) => l.category === cat)
                .map((lesson) => (
                  <Link key={lesson.id} href={`/grammar/${lesson.id}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer mb-4">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary">
                            {levelLabels[lesson.level] || lesson.level}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{lesson.title}</CardTitle>
                        {lesson.titleVi && (
                          <p className="text-sm text-muted-foreground">
                            {lesson.titleVi}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {JSON.parse(lesson.exercises).length} bài tập
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              {lessons.filter((l) => l.category === cat).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Chưa có bài học nào
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
