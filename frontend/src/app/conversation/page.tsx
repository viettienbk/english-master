'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getConversationTopics, startConversation, type ConversationTopic } from '@/lib/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const topicIcons: Record<string, string> = {
  travel: '✈️',
  restaurant: '🍽️',
  shopping: '🛍️',
  job_interview: '💼',
  doctor: '🏥',
  daily_chat: '☕',
  hotel: '🏨',
  bank: '🏦',
  apartment: '🏠',
  phone_support: '📞',
  making_plans: '📅',
  gym: '💪',
  business_meeting: '📊',
  complaint: '😤',
  directions: '🗺️',
  school: '🎓',
  social_event: '🎉',
  emergency: '🚨',
  pharmacy: '💊',
  job_resignation: '👋',
};

export default function ConversationPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<ConversationTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState<string | null>(null);

  useEffect(() => {
    getConversationTopics()
      .then(setTopics)
      .finally(() => setLoading(false));
  }, []);

  const handleStart = async (topicId: string) => {
    setStarting(topicId);
    try {
      const res = await startConversation(topicId);
      // Store initial AI message so the session page can display it immediately
      sessionStorage.setItem(`conv_${res.conversation.id}`, res.message);
      router.push(`/conversation/${res.conversation.id}`);
    } catch (error: any) {
      console.error('Start conversation error:', error);
      alert(error.message || 'Lỗi kết nối. Hãy kiểm tra GEMINI_API_KEY trong backend .env');
      setStarting(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hội thoại AI</h1>
          <p className="text-muted-foreground">
            Luyện nói tiếng Anh với AI trong các tình huống giao tiếp thực tế
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card
              key={topic.id}
              className="hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <CardHeader>
                <div className="text-4xl mb-3">
                  {topicIcons[topic.id] || '💬'}
                </div>
                <CardTitle className="text-xl">{topic.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{topic.nameEn}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {topic.scenario}
                </p>
                <Button
                  className="w-full"
                  onClick={() => handleStart(topic.id)}
                  disabled={starting === topic.id}
                >
                  {starting === topic.id ? 'Đang bắt đầu...' : 'Bắt đầu hội thoại'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
