export interface Attempt {
    id?: string;
    quizId: string;
    quizName: string;
    user: string;
    date: string;
    score: string;
    status: string;
    correctAnswers?: number;
    wrongAnswers?: number;
    totalQuestions?: number;
    selectedAnswers?: { [key: string]: any }; // Store user's answers for review
}