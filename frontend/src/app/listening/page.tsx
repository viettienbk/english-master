'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getListeningLessons } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { ListeningLesson } from '@/types';
import { Headphones, Sparkles, Clock, ArrowRight, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const levelColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 border-green-200',
  intermediate: 'bg-orange-100 text-orange-700 border-orange-200',
  advanced: 'bg-red-100 text-red-700 border-red-200',
};

const levelLabels: Record<string, string> = {
  beginner: 'Cơ bản',
  intermediate: 'Trung cấp',
  advanced: 'Nâng cao',
};

export default function ListeningPage() {
  const [lessons, setLessons] = useState<ListeningLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveSection] = useState<string>('all');
  const { user } = useAuth();

  useEffect(() => {
    getListeningLessons()
      .then(setLessons)
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
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-muted rounded-full w-32" />)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredLessons = activeLevel === 'all' 
    ? lessons 
    : lessons.filter(l => l.level === activeLevel);

  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white p-8 md:p-12 mb-10 shadow-xl">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
            <Headphones className="w-96 h-96" />
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Nâng tầm khả năng nghe hiểu</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Luyện nghe <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                Hiệu quả & Thú vị
              </span>
            </h1>
            <p className="text-lg md:text-xl text-purple-100 font-medium">
              Cải thiện kỹ năng nghe thông qua các bài tập điền từ trực quan từ cấp độ cơ bản đến nâng cao.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActiveSection(lvl)}
                className={cn(
                  "px-6 py-2.5 rounded-full text-sm font-bold transition-all border-2",
                  activeLevel === lvl 
                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white border-slate-100 text-slate-500 hover:border-primary/20 hover:text-primary"
                )}
              >
                {lvl === 'all' ? 'Tất cả' : levelLabels[lvl]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/listening/${lesson.id}`}
              onClick={handleAuthAction}
              className="group"
            >
              <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent group-hover:border-primary/20 rounded-2xl overflow-hidden bg-white">
                <div className="h-2 w-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-80" />
                <CardHeader className="pb-3 flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                        levelColors[lesson.level]
                      )}
                    >
                      {levelLabels[lesson.level] || lesson.level}
                    </Badge>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {(JSON.parse(lesson.blanks) as unknown[]).length} chỗ trống
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {lesson.title}
                  </CardTitle>
                  {lesson.titleVi && (
                    <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2">
                      {lesson.titleVi}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="pt-0 pb-5 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 italic border-l-2 border-slate-100 pl-3">
                    "{lesson.transcript}"
                  </p>
                  <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2">
                      <Play className="w-4 h-4 fill-primary" />
                    </div>
                    Bắt đầu nghe <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Headphones className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có bài nghe nào</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              Các bài học cho cấp độ này đang được cập nhật. Vui lòng chọn cấp độ khác hoặc quay lại sau!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
