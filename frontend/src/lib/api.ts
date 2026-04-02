import Cookies from 'js-cookie';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = Cookies.get('token');
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });

    if (!res.ok) {
      // Try to get error message from body
      let errorData;
      try {
        const errorText = await res.text();
        errorData = errorText ? JSON.parse(errorText) : { message: `HTTP Error ${res.status}` };
      } catch {
        errorData = { message: `HTTP Error ${res.status}` };
      }
      throw new Error(errorData.message || `API error: ${res.status}`);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      console.error(`Network error or Mixed Content blocked: ${url}. Check if API server is running and accessible via ${url.startsWith('https') ? 'HTTPS' : 'HTTP'}.`);
      throw new Error('Không thể kết nối đến máy chủ API. Vui lòng kiểm tra kết nối mạng hoặc cấu hình ứng dụng.');
    }
    console.error(`Fetch error at ${url}:`, error);
    throw error;
  }
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

export interface ProfileStats {
  user: {
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  vocabulary: {
    total: number;
    learned: number;
    mastered: number;
    learning: number;
    new: number;
    percentage: number;
  };
  ongoingLessons: Array<{
    id: string;
    lessonId: string;
    lessonType: 'listening' | 'grammar';
    status: 'ongoing' | 'completed';
    score: number | null;
    lastStudied: string;
    details: any;
  }>;
}

export const getProfileStats = () =>
  fetchApi<ProfileStats>('/progress/profile');

export const updateLessonProgress = (
  lessonId: string,
  lessonType: 'listening' | 'grammar',
  status: 'ongoing' | 'completed',
  score?: number,
) =>
  fetchApi<any>('/progress/lesson', {
    method: 'POST',
    body: JSON.stringify({ lessonId, lessonType, status, score }),
  });

export const getMasteredWords = () =>
  fetchApi<ProgressItem[]>('/progress/words/mastered');

export const getNewWords = () =>
  fetchApi<import('@/types').Word[]>('/progress/words/new');
