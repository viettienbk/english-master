'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getTopics } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { VocabularyTopic } from '@/types';
import { BookOpen, Trophy } from 'lucide-react';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200 shadow-sm',
  intermediate: 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm',
  advanced: 'bg-red-100 text-red-700 border-red-200 shadow-sm',
};

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function VocabularyPage() {
  const [topics, setTopics] = useState<VocabularyTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    getTopics()
      .then(setTopics)
      .finally(() => setLoading(false));
  }, []);

  const handleAuthAction = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      window.location.href = `${apiUrl}/auth/google`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="space-y-3">
            <div className="h-10 bg-muted rounded w-64" />
            <div className="h-4 bg-muted rounded w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-72 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12 text-center md:text-left">
        <h1 className="text-4xl font-extrabold mb-3 tracking-tight">Thư viện từ vựng</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Khám phá {topics.length} chủ đề đa dạng với hơn 3,100 từ vựng cốt lõi giúp bạn tự tin giao tiếp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {topics.map((topic) => (
          <Link 
            key={topic.id} 
            href={`/vocabulary/${topic.id}`} 
            onClick={handleAuthAction}
            className="group"
          >
            <Card className="h-full overflow-hidden border-2 border-transparent transition-all duration-300 group-hover:border-primary/20 group-hover:shadow-xl group-hover:-translate-y-2 rounded-2xl">
              <div className="aspect-[16/9] w-full relative overflow-hidden bg-muted">
                <img
                  src={`https://loremflickr.com/640/360/${encodeURIComponent(topic.name.split(' ')[0])},english/all?lock=${topic.id.length}`}
                  alt={topic.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                <Badge 
                  className={`absolute top-4 left-4 border ${levelColors[topic.level]}`}
                  variant="outline"
                >
                  {levelLabels[topic.level] || topic.level}
                </Badge>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors">
                  {topic.nameVi || topic.name}
                </CardTitle>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                  {topic.name}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {topic.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-muted/50">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
                    <BookOpen className="w-4 h-4" />
                    <span>{topic._count?.words || 0} từ</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    <Trophy className="w-3 h-3 text-orange-500" />
                    <span>Bắt đầu học</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
