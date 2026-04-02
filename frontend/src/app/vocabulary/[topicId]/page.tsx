'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { ButtonLink } from '@/components/ui/button-link';
import { Badge } from '@/components/ui/badge';
import { getTopicById } from '@/lib/api';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useAuth } from '@/hooks/useAuth';
import type { VocabularyTopic } from '@/types';
import { ChevronLeft, PlayCircle, BookOpen, BrainCircuit, Volume2 } from 'lucide-react';

export default function TopicDetailPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [loading, setLoading] = useState(true);
  const { speak } = useSpeechSynthesis();
  const { user } = useAuth();

  useEffect(() => {
    getTopicById(topicId)
      .then(setTopic)
      .finally(() => setLoading(false));
  }, [topicId]);

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
          <div className="h-[300px] bg-muted rounded-[2.5rem]" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 bg-muted rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-xl">Không tìm thấy chủ đề học tập</p>
        <ButtonLink href="/vocabulary" className="mt-4">Quay lại thư viện</ButtonLink>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24">
      {/* Hero Section */}
      <div className="relative mb-12 group">
        <div className="absolute inset-0 bg-slate-900 rounded-[2.5rem] overflow-hidden">
          <img
            src={`https://loremflickr.com/1200/400/${encodeURIComponent(topic.name.split(' ')[0])},english/all?lock=${topic.id.length}`}
            alt={topic.name}
            className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
        </div>
        
        <div className="relative p-8 md:p-16 text-white">
          <Link
            href="/vocabulary"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors font-bold text-sm uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Thư viện
          </Link>
          
          <div className="max-w-3xl">
            <Badge className="mb-4 bg-primary text-white border-none px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
              {topic.level}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight leading-tight">
              {topic.nameVi || topic.name}
            </h1>
            <p className="text-xl text-white/70 mb-8 font-medium leading-relaxed">
              {topic.description}
            </p>
            
            <div className="flex flex-wrap gap-4">
              <ButtonLink 
                href={`/vocabulary/${topicId}/flashcard`}
                onClick={handleAuthAction}
                className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-lg shadow-xl shadow-white/5 flex items-center gap-2"
              >
                <BrainCircuit className="w-6 h-6" />
                Học Flashcard
              </ButtonLink>
              <ButtonLink 
                href={`/vocabulary/${topicId}/quiz`} 
                onClick={handleAuthAction}
                className="h-14 px-8 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black text-lg shadow-xl shadow-primary/20 flex items-center gap-2 border-none"
              >
                <PlayCircle className="w-6 h-6" />
                Luyện tập ngay
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>

      {/* Word List Section */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b pb-6">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
            <BookOpen className="w-8 h-8 text-primary" />
            Danh sách từ vựng
          </h2>
          <Badge variant="outline" className="px-4 py-1.5 rounded-xl font-bold text-slate-500 border-slate-200">
            {topic.words?.length || 0} từ trong chủ đề
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topic.words?.map((word) => (
            <Card key={word.id} className="group border-2 border-slate-50 hover:border-primary/20 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-primary transition-colors">
                        {word.word}
                      </h3>
                      <Badge variant="secondary" className="bg-slate-100 text-slate-500 text-[10px] font-black uppercase py-0 px-2 rounded-md border-none">
                        {word.partOfSpeech}
                      </Badge>
                    </div>
                    {word.phonetic && (
                      <p className="text-sm font-mono text-primary font-medium italic">
                        {word.phonetic}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => speak(word.word)}
                    className="p-3 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300 hover:scale-110 active:scale-95"
                    title="Phát âm"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="relative pl-4 border-l-2 border-slate-100 group-hover:border-primary/20 transition-colors">
                    <p className="text-base font-bold text-slate-700 leading-tight">
                      {word.definitionVi || word.definition}
                    </p>
                    {word.definitionVi && (
                      <p className="text-sm text-slate-400 font-medium mt-1">
                        {word.definition}
                      </p>
                    )}
                  </div>

                  {word.example && (
                    <div className="bg-slate-50/50 rounded-xl p-3 text-sm italic text-slate-500 group-hover:bg-primary/5 transition-colors">
                      &ldquo;{word.example}&rdquo;
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
