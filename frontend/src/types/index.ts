export interface User {
  id: number;
  username: string;
  email: string;
  date_joined: string;
  total_quizzes: number;
  avg_score: number;
}

export interface QuizSession {
  id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  num_questions: number;
  score: number | null;
  status: 'pending' | 'active' | 'completed';
  created_at: string;
  completed_at: string | null;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  order: number;
  // Only present in review mode:
  correct_index?: number;
  explanation?: string;
  user_answer?: number | null;
  is_correct?: boolean;
}

export interface CheatSheet {
  id: string;
  content: string;
  pdf_url: string | null;
  generated_at: string;
}

export interface TopicStat {
  topic: string;
  count: number;
  avg_score: number;
  difficulty: string;
}
