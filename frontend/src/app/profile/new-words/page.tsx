'use client';

import { useEffect, useState } from 'react';
import { getNewWords } from '@/lib/api';
import type { Word } from '@/types';
import FlashcardSession from '@/components/vocabulary/FlashcardSession';

export default function NewWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNewWords()
      .then(setWords)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <FlashcardSession
      title="Học từ vựng mới"
      subtitle="Khám phá các từ vựng bạn chưa từng học"
      words={words}
      backLink="/profile"
      backLabel="Quay lại trang cá nhân"
    />
  );
}
