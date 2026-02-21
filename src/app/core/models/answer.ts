import { QuestionType } from './question';

export interface Answer {
    id: string;
    questionId: string;
    quizId: string;
    userId: string;
    type: QuestionType;
    selectedAnswer?: string | number | boolean;
    textAnswer?: string; // For essay and fill-blank questions
    selectedOptions?: number[]; // For multiple select (if implemented)
    isCorrect?: boolean;
    points: number;
    timestamp: Date;
    timeSpent?: number; // Time spent on this question in seconds
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    answers: Answer[];
    totalScore: number;
    maxScore: number;
    percentage: number;
    startTime: Date;
    endTime?: Date;
    duration?: number; // Total time taken in seconds
    status: 'in-progress' | 'completed' | 'submitted';
    isPassed?: boolean;
}