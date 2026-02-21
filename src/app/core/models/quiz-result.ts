import { Quiz } from './quiz';
import { QuizAttempt } from './answer';
import { Question } from './question';

export interface QuizResultData {
  score: number;
  correct: number;
  wrong: number;
  percentage: number;
  passed: boolean;
  totalQuestions: number;
}

export interface QuizResultSettings {
  passingScore: number;
  allowRetakes: boolean;
  showCorrectAnswers: boolean;
  maxAttempts: number;
}

export interface QuizResultState {
  quiz: Quiz | null;
  quizName: string;
  attempt: QuizAttempt | null;
  allAttempts: QuizAttempt[];
  questions: Question[];
  reviewMode: boolean;
}
