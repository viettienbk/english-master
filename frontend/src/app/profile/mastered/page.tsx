'use client';

import { useEffect, useState } from 'react';
import { getMasteredWords } from '@/lib/api';
import type { Word } from '@/types';
import FlashcardSession from '@/components/vocabulary/FlashcardSession';

export default function MasteredWordsPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMasteredWords()
      .then((items) => setWords(items.map(item => item.word)))
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
      title="Ôn tập từ đã thuộc"
      subtitle="Củng cố những từ vựng bạn đã thành thạo"
      words={words}
      backLink="/profile"
      backLabel="Quay lại trang cá nhân"
    />
  );
}
