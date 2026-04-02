'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getTopicById } from '@/lib/api';
import type { VocabularyTopic } from '@/types';
import FlashcardSession from '@/components/vocabulary/FlashcardSession';
import { ButtonLink } from '@/components/ui/button-link';
import { CheckCircle2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function FlashcardPage() {
  const params = useParams();
  const topicId = params.topicId as string;
  const [topic, setTopic] = useState<VocabularyTopic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTopicById(topicId)
      .then(setTopic)
      .finally(() => setLoading(false));
  }, [topicId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-12">
          <div className="h-12 bg-muted rounded-xl w-64 mx-auto" />
          <div className="h-[380px] bg-muted rounded-3xl max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  if (!topic || !topic.words?.length) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground text-xl">Không tìm thấy dữ liệu từ vựng</p>
        <ButtonLink href="/vocabulary" className="mt-4">Quay lại thư viện</ButtonLink>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <FlashcardSession
        title={topic.nameVi || topic.name}
        subtitle="Học qua Flashcard"
        words={topic.words}
        backLink={`/vocabulary/${topicId}`}
        backLabel="Quay lại chủ đề"
        finishComponent={
          <div className="max-w-md mx-auto p-12 rounded-[3rem] bg-gradient-to-br from-green-500 to-emerald-600 text-white text-center shadow-2xl shadow-green-200 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm rotate-12">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-3xl font-black mb-2 uppercase tracking-tight">Hoàn thành!</h3>
            <p className="font-medium opacity-90 mb-10 text-lg">
              Tuyệt vời! Bạn đã hoàn thành việc ôn tập bộ thẻ này.
            </p>
            <div className="flex flex-col gap-3">
              <ButtonLink 
                href={`/vocabulary/${topicId}/quiz`}
                className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-white text-emerald-600 hover:bg-emerald-50 shadow-lg"
              >
                Làm bài tập ngay
              </ButtonLink>
              <ButtonLink 
                href={`/vocabulary/${topicId}`}
                className="h-14 rounded-2xl font-black text-sm uppercase tracking-widest bg-emerald-400 text-white hover:bg-emerald-300 shadow-lg"
              >
                Quay lại chủ đề
              </ButtonLink>
            </div>
          </div>
        }
      />
    </ProtectedRoute>
  );
}
