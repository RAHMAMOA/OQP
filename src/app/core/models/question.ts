export type QuestionType = 'mcq' | 'true-false' | 'fill-blank' | 'essay';

export interface Question {
    id: string;
    text: string;
    type: QuestionType;
    points: number;
    options?: string[];
    correctAnswer?: string | number | boolean;
    blanks?: string[]; // For fill-in-the-blank questions
}
