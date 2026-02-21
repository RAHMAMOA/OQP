import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Quiz } from '../models/quiz';
import { Question, QuestionType } from '../models/question';
import { AttemptService } from './result.service';
import { AuthService } from './auth.service';
import { SettingsService } from './settings.service';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class QuizService {
    private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
    quizzes$ = this.quizzesSubject.asObservable();
    private storageKey = 'quizzes';

    constructor(
        private attemptService: AttemptService,
        private authService: AuthService,
        private settingsService: SettingsService,
        private storageService: StorageService
    ) {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        const quizzes = this.storageService.getItem<Quiz[]>(this.storageKey);
        if (quizzes) {
            this.quizzesSubject.next(quizzes);
        }
    }

    private saveToStorage(quizzes: Quiz[]) {
        this.storageService.setItem(this.storageKey, quizzes);
    }

    getQuizzes(): Observable<Quiz[]> {
        return this.quizzes$;
    }

    addQuiz(quiz: Quiz) {
        const currentQuizzes = this.quizzesSubject.value;
        const updatedQuizzes = [...currentQuizzes, quiz];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);
    }

    deleteQuiz(id: string) {
        const currentQuizzes = this.quizzesSubject.value;
        const updatedQuizzes = currentQuizzes.filter(q => q.id !== id);
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);
    }

    updateQuiz(updatedQuiz: Quiz) {
        const currentQuizzes = this.quizzesSubject.value;
        const index = currentQuizzes.findIndex(q => q.id === updatedQuiz.id);
        if (index !== -1) {
            currentQuizzes[index] = updatedQuiz;
            const updatedQuizzes = [...currentQuizzes];
            this.quizzesSubject.next(updatedQuizzes);
            this.saveToStorage(updatedQuizzes);
        }
    }

    // Quiz attempt validation
    async canAttemptQuiz(quizId: string): Promise<{ canAttempt: boolean; reason?: string }> {
        const settings = this.settingsService.getSettings();

        // Check if retakes are allowed
        if (!settings.allowRetakes) {
            return { canAttempt: false, reason: 'Quiz retakes are not allowed by administrator.' };
        }

        // Check attempt limit
        if (settings.maxAttempts && settings.maxAttempts > 0) {
            const currentUser = this.authService.getCurrentUser();
            const attempts = await this.attemptService.getAttempts().toPromise();
            const quizAttempts = (attempts || []).filter(attempt =>
                attempt.quizId === quizId && attempt.userId === currentUser?.username
            );

            if (quizAttempts.length >= settings.maxAttempts) {
                return {
                    canAttempt: false,
                    reason: `You have reached the maximum number of attempts (${settings.maxAttempts}) for this quiz.`
                };
            }
        }

        return { canAttempt: true };
    }

    // Quiz creation helpers
    createQuiz(title: string, description: string, time: number): Quiz {
        const newQuiz: Quiz = {
            id: Date.now().toString(),
            title,
            description,
            time,
            questionCount: 0,
            questions: []
        };

        this.addQuiz(newQuiz);
        return newQuiz;
    }

    // Question management within quizzes
    addQuestionToQuiz(quizId: string, type: QuestionType): Quiz | null {
        const currentQuizzes = this.quizzesSubject.value;
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);

        if (quizIndex === -1) return null;

        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            type: type,
            points: 1,
            options: type === 'mcq' ? ['', '', '', ''].map(() => '') : undefined,
            correctAnswer: this.getDefaultCorrectAnswer(type)
        };

        currentQuizzes[quizIndex].questions = [...(currentQuizzes[quizIndex].questions || []), newQuestion];
        currentQuizzes[quizIndex].questionCount = currentQuizzes[quizIndex].questions.length;

        const updatedQuizzes = [...currentQuizzes];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);

        return currentQuizzes[quizIndex];
    }

    updateQuestionInQuiz(quizId: string, questionId: string, updatedQuestion: Question): Quiz | null {
        const currentQuizzes = this.quizzesSubject.value;
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);

        if (quizIndex === -1) return null;

        const quiz = currentQuizzes[quizIndex];
        if (!quiz.questions) return null;

        const questionIndex = quiz.questions.findIndex(q => q.id === questionId);
        if (questionIndex === -1) return null;

        const question = quiz.questions[questionIndex];
        if (!question) return null;

        // Create a deep copy to avoid reference issues, especially for options array
        const questionCopy = {
            ...updatedQuestion,
            options: updatedQuestion.options ? [...updatedQuestion.options] : undefined
        };
        currentQuizzes[quizIndex].questions![questionIndex] = questionCopy;

        const updatedQuizzes = [...currentQuizzes];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);

        return currentQuizzes[quizIndex];
    }

    removeQuestionFromQuiz(quizId: string, questionId: string): Quiz | null {
        const currentQuizzes = this.quizzesSubject.value;
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);

        if (quizIndex === -1) return null;

        const quiz = currentQuizzes[quizIndex];
        if (!quiz.questions) return null;

        currentQuizzes[quizIndex].questions = quiz.questions.filter(q => q.id !== questionId);
        currentQuizzes[quizIndex].questionCount = currentQuizzes[quizIndex].questions.length;

        const updatedQuizzes = [...currentQuizzes];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);

        return currentQuizzes[quizIndex];
    }

    // Quiz validation
    validateQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!quiz.title.trim()) {
            errors.push('Quiz title is required');
        }

        if (!quiz.time || quiz.time <= 0) {
            errors.push('Quiz time must be greater than 0');
        }

        if (!quiz.questions || quiz.questions.length === 0) {
            errors.push('Quiz must have at least one question');
        }

        // Validate each question
        if (quiz.questions) {
            quiz.questions.forEach((question, index) => {
                const questionValidation = this.validateQuestion(question);
                if (!questionValidation.isValid) {
                    errors.push(`Question ${index + 1}: ${questionValidation.errors.join(', ')}`);
                }
            });
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    private validateQuestion(question: Question): { isValid: boolean; errors: string[] } {
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
            if (typeof question.correctAnswer !== 'number' || question.correctAnswer < 0 ||
                (question.options && question.correctAnswer >= question.options.length)) {
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

    // Update quiz with questions
    updateQuizWithQuestions(quizId: string, updatedQuiz: Quiz, questions: Question[]): Quiz | null {
        const currentQuizzes = this.quizzesSubject.value;
        const quizIndex = currentQuizzes.findIndex(q => q.id === quizId);

        if (quizIndex === -1) return null;

        const quizWithQuestions = {
            ...updatedQuiz,
            questions: questions,
            questionCount: questions.length
        };

        currentQuizzes[quizIndex] = quizWithQuestions;

        const updatedQuizzes = [...currentQuizzes];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToStorage(updatedQuizzes);

        return quizWithQuestions;
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
}
