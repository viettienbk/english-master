'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getGrammarLessons } from '@/lib/api';
import type { GrammarLesson } from '@/types';
import { BookOpen, MessageSquare, Layout, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryLabels: Record<string, string> = {
  basic: 'Ngữ pháp cơ bản',
  structures: 'Cấu trúc câu',
  conversational: 'Ngữ pháp giao tiếp',
};

const categoryIcons: Record<string, React.ReactNode> = {
  basic: <BookOpen className="w-4 h-4 mr-2" />,
  structures: <Layout className="w-4 h-4 mr-2" />,
  conversational: <MessageSquare className="w-4 h-4 mr-2" />,
};

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
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-muted rounded-3xl" />
          <div className="flex gap-4">
            {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded-full w-32" />)}
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

  const categories = ['basic', 'structures', 'conversational'];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white p-8 md:p-12 mb-10 shadow-xl">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-96 h-96">
              <path fill="#FFFFFF" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,97.1,-2.6C97.4,12.9,92,28.6,83.1,42.1C74.2,55.6,61.8,67,47.8,74.9C33.8,82.8,18.2,87.2,2.3,83.9C-13.6,80.6,-28.9,69.5,-42.6,60C-56.3,50.5,-68.4,42.6,-77.2,31.5C-86,20.4,-91.5,6.1,-90.6,-7.8C-89.7,-21.7,-82.4,-35,-72.6,-45.5C-62.8,-56,-50.5,-63.7,-37.5,-71.4C-24.5,-79.1,-10.8,-86.8,2.7,-91.2C16.2,-95.6,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>Chinh phục ngữ pháp tiếng Anh</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              Làm chủ ngữ pháp <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400">
                một cách dễ dàng
              </span>
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 font-medium">
              Từ những khái niệm cơ bản nhất đến các cấu trúc phức tạp, được trình bày rõ ràng, dễ hiểu và dễ nhớ.
            </p>
          </div>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="mb-8 w-full md:w-auto flex flex-wrap justify-start h-auto bg-transparent gap-2 p-0">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-full px-6 py-2.5 text-sm font-semibold transition-all hover:bg-slate-100"
              >
                <div className="flex items-center">
                  {categoryIcons[cat]}
                  {categoryLabels[cat]}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((cat) => (
            <TabsContent key={cat} value={cat} className="mt-0 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lessons
                  .filter((l) => l.category === cat)
                  .map((lesson) => (
                    <Link key={lesson.id} href={`/grammar/${lesson.id}`} className="group h-full">
                      <Card className="h-full flex flex-col hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent group-hover:border-primary/20 rounded-2xl overflow-hidden bg-white">
                        <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80" />
                        <CardHeader className="pb-3 flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider",
                                levelColors[lesson.level] || 'bg-slate-100 text-slate-700 border-slate-200'
                              )}
                            >
                              {levelLabels[lesson.level] || lesson.level}
                            </Badge>
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                              {JSON.parse(lesson.exercises).length} bài tập
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
                        <CardContent className="pt-0 pb-5">
                          <div className="flex items-center text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                            Bắt đầu học <ArrowRight className="w-4 h-4 ml-1" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
              
              {lessons.filter((l) => l.category === cat).length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có bài học nào</h3>
                  <p className="text-slate-500 max-w-sm mx-auto">
                    Các bài học cho phần {categoryLabels[cat].toLowerCase()} đang được cập nhật. Vui lòng quay lại sau!
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
