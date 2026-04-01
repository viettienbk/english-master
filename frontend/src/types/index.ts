export interface VocabularyTopic {
  id: string;
  name: string;
  nameVi: string | null;
  description: string | null;
  level: string;
  imageUrl: string | null;
  order: number;
  words?: Word[];
  _count?: { words: number };
}

export interface Word {
  id: string;
  word: string;
  phonetic: string | null;
  partOfSpeech: string;
  definition: string;
  definitionVi: string | null;
  example: string | null;
  exampleVi: string | null;
  imageUrl: string | null;
  audioUrl: string | null;
  topicId: string;
}

export interface GrammarLesson {
  id: string;
  title: string;
  titleVi: string | null;
  level: string;
  category: string;
  content: string;
  examples: string; // JSON string
  exercises: string; // JSON string
  order: number;
}

export interface GrammarExample {
  english: string;
  vietnamese: string;
  explanation: string;
}

export interface GrammarExercise {
  type: 'multiple_choice' | 'fill_blank';
  question: string;
  options?: string[];
  answer: string;
}

export interface ListeningLesson {
  id: string;
  title: string;
  titleVi: string | null;
  level: string;
  audioUrl: string;
  transcript: string;
  blanks: string; // JSON string
  translation: string | null;
  order: number;
}

export interface ListeningBlank {
  position: number;
  answer: string;
  hint: string;
}

export interface CheckResult {
  score: number;
  correct: number;
  total: number;
  results: {
    position: number;
    correctAnswer: string;
    userAnswer: string;
    isCorrect: boolean;
  }[];
}
