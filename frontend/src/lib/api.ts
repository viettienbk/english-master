import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = Cookies.get('token');
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Vocabulary
export const getTopics = (level?: string) =>
  fetchApi<import('@/types').VocabularyTopic[]>(
    `/vocabulary/topics${level ? `?level=${level}` : ''}`,
  );

export const getTopicById = (id: string) =>
  fetchApi<import('@/types').VocabularyTopic>(`/vocabulary/topics/${id}`);

export const getWordsByTopic = (topicId: string) =>
  fetchApi<import('@/types').Word[]>(`/vocabulary/topics/${topicId}/words`);

export const searchWords = (query: string) =>
  fetchApi<import('@/types').Word[]>(`/vocabulary/search?q=${encodeURIComponent(query)}`);

// Grammar
export const getGrammarLessons = (level?: string, category?: string) => {
  const params = new URLSearchParams();
  if (level) params.set('level', level);
  if (category) params.set('category', category);
  const qs = params.toString();
  return fetchApi<import('@/types').GrammarLesson[]>(`/grammar/lessons${qs ? `?${qs}` : ''}`);
};

export const getGrammarLessonById = (id: string) =>
  fetchApi<import('@/types').GrammarLesson>(`/grammar/lessons/${id}`);

// Listening
export const getListeningLessons = (level?: string) =>
  fetchApi<import('@/types').ListeningLesson[]>(
    `/listening/lessons${level ? `?level=${level}` : ''}`,
  );

export const getListeningLessonById = (id: string) =>
  fetchApi<import('@/types').ListeningLesson>(`/listening/lessons/${id}`);

export const checkListeningAnswers = (id: string, answers: Record<number, string>) =>
  fetchApi<import('@/types').CheckResult>(`/listening/lessons/${id}/check`, {
    method: 'POST',
    body: JSON.stringify({ answers }),
  });

// Conversation
export interface ConversationTopic {
  id: string;
  name: string;
  nameEn: string;
  scenario: string;
}

export const getConversationTopics = () =>
  fetchApi<ConversationTopic[]>('/conversation/topics');

export const startConversation = (topicId: string) =>
  fetchApi<{ conversation: { id: string }; message: string }>('/conversation/start', {
    method: 'POST',
    body: JSON.stringify({ topicId }),
  });

export const sendMessage = (conversationId: string, message: string) =>
  fetchApi<{ message: string }>(`/conversation/${conversationId}/message`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });

// Progress
export interface ProgressStats {
  totalWords: number;
  learnedWords: number;
  masteredWords: number;
  progressPercentage: number;
}

export interface ProgressItem {
  id: string;
  userId: string;
  wordId: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: string;
  lastQuality: number;
  word: import('@/types').Word;
}

export const updateProgress = (wordId: string, quality: number) =>
  fetchApi<ProgressItem>('/progress/update', {
    method: 'POST',
    body: JSON.stringify({ wordId, quality }),
  });

export const getProgressStats = () =>
  fetchApi<{ stats: ProgressStats; items: ProgressItem[] }>('/progress/stats');

export const getReviewWords = () =>
  fetchApi<ProgressItem[]>('/progress/review');
