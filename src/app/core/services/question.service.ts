import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Question, QuestionType } from '../models/question';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class QuestionService {
    private questionsSubject = new BehaviorSubject<Question[]>([]);
    questions$ = this.questionsSubject.asObservable();
    private storageKey = 'questions';

    constructor(
        private storageService: StorageService
    ) {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const questions = this.storageService.getItem<Question[]>(this.storageKey);
        if (questions) {
            this.questionsSubject.next(questions);
        }
    }

    private saveToStorage(questions: Question[]) {
        this.storageService.setItem(this.storageKey, questions);
    }

    getQuestions(): Observable<Question[]> {
        return this.questions$;
    }

    addQuestion(question: Question) {
        const currentQuestions = this.questionsSubject.value;
        const updatedQuestions = [...currentQuestions, question];
        this.questionsSubject.next(updatedQuestions);
        this.saveToStorage(updatedQuestions);
    }

    updateQuestion(updatedQuestion: Question) {
        const currentQuestions = this.questionsSubject.value;
        const index = currentQuestions.findIndex(q => q.id === updatedQuestion.id);
        if (index !== -1) {
            currentQuestions[index] = updatedQuestion;
            const updatedQuestions = [...currentQuestions];
            this.questionsSubject.next(updatedQuestions);
            this.saveToStorage(updatedQuestions);
        }
    }

    deleteQuestion(id: string) {
        const currentQuestions = this.questionsSubject.value;
        const updatedQuestions = currentQuestions.filter(q => q.id !== id);
        this.questionsSubject.next(updatedQuestions);
        this.saveToStorage(updatedQuestions);
    }

    // Question validation and creation helpers
    createQuestion(type: QuestionType, quizId: string): Question {
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            type: type,
            points: 1,
            options: type === 'mcq' ? ['', '', '', ''] : undefined,
            correctAnswer: this.getDefaultCorrectAnswer(type)
        };

        // Add to quiz questions
        this.addQuestion(newQuestion);
        return newQuestion;
    }

    private getDefaultCorrectAnswer(type: QuestionType): any {
        switch (type) {
            case 'true-false':
                return true;
            case 'mcq':
                return 0; // Default to first option
            case 'fill-blank':
                return ''; // Empty string for fill in the blank
            case 'essay':
                return undefined; // Essay questions don't have predefined answers
            default:
                return '';
        }
    }

    validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!question.text.trim()) {
            errors.push('Question text is required');
        }

        if (question.type === 'mcq') {
            if (!question.options || question.options.length < 2) {
                errors.push('Multiple choice questions need at least 2 options');
            }
            if (question.options) {
                const hasEmptyOptions = question.options.some(option => !option.trim());
                if (hasEmptyOptions) {
                    errors.push('All options must have content');
                }
            }
            if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 || !question.options || question.correctAnswer >= question.options.length) {
                errors.push('Must select a valid correct option');
            }
        }

        if (question.type === 'fill-blank') {
            if (!question.correctAnswer || question.correctAnswer === '') {
                errors.push('Fill in the blank questions must have a correct answer');
            }
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
}