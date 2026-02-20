import { Question } from './question';

export interface Quiz {
    id: string;
    title: string;
    description: string;
    questionCount: number;
    time: number; // in minutes
    questions?: Question[]; // Optional array of questions
}
