import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Answer, QuizAttempt } from '../models/answer';
import { Question } from '../models/question';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class AnswerService {
    private currentAttemptSubject = new BehaviorSubject<QuizAttempt | null>(null);
    private attemptsSubject = new BehaviorSubject<QuizAttempt[]>([]);
    
    currentAttempt$ = this.currentAttemptSubject.asObservable();
    attempts$ = this.attemptsSubject.asObservable();
    
    private storageKey = 'quizAttempts';
    private currentAttemptKey = 'currentAttempt';

    constructor(
        private authService: AuthService,
        private storageService: StorageService
    ) {
        this.loadAttempts();
        this.loadCurrentAttempt();
    }

    // Quiz Attempt Management
    startQuizAttempt(quizId: string, maxScore: number): QuizAttempt {
        const currentUser = this.authService.getCurrentUser();
        if (!currentUser) {
            throw new Error('User must be logged in to start a quiz attempt');
        }

        const attempt: QuizAttempt = {
            id: Date.now().toString(),
            quizId,
            userId: currentUser.username,
            answers: [],
            totalScore: 0,
            maxScore,
            percentage: 0,
            startTime: new Date(),
            status: 'in-progress'
        };

        this.currentAttemptSubject.next(attempt);
        this.saveCurrentAttempt(attempt);
        return attempt;
    }

    submitQuizAttempt(): QuizAttempt | null {
        const currentAttempt = this.currentAttemptSubject.value;
        if (!currentAttempt) return null;

        currentAttempt.endTime = new Date();
        currentAttempt.duration = Math.floor(
            (currentAttempt.endTime.getTime() - currentAttempt.startTime.getTime()) / 1000
        );
        currentAttempt.status = 'submitted';

        // Calculate final scores
        this.calculateAttemptScores(currentAttempt);

        // Save to attempts history
        const attempts = [...this.attemptsSubject.value, currentAttempt];
        this.attemptsSubject.next(attempts);
        this.saveAttempts(attempts);

        // Clear current attempt
        this.currentAttemptSubject.next(null);
        this.storageService.removeItem(this.currentAttemptKey);

        return currentAttempt;
    }

    // Answer Management
    addAnswer(question: Question, selectedAnswer: string | number | boolean | undefined, textAnswer?: string): void {
        const currentAttempt = this.currentAttemptSubject.value;
        if (!currentAttempt) {
            throw new Error('No active quiz attempt');
        }

        const existingAnswerIndex = currentAttempt.answers.findIndex(a => a.questionId === question.id);
        
        const answer: Answer = {
            id: Date.now().toString(),
            questionId: question.id,
            quizId: currentAttempt.quizId,
            userId: currentAttempt.userId,
            type: question.type,
            selectedAnswer,
            textAnswer,
            points: 0,
            timestamp: new Date()
        };

        // Check if answer is correct
        answer.isCorrect = this.isAnswerCorrect(question, answer);
        answer.points = answer.isCorrect ? question.points : 0;

        if (existingAnswerIndex >= 0) {
            currentAttempt.answers[existingAnswerIndex] = answer;
        } else {
            currentAttempt.answers.push(answer);
        }

        this.calculateAttemptScores(currentAttempt);
        this.saveCurrentAttempt(currentAttempt);
    }

    // Scoring
    private calculateAttemptScores(attempt: QuizAttempt): void {
        attempt.totalScore = attempt.answers.reduce((sum, answer) => sum + answer.points, 0);
        attempt.percentage = attempt.maxScore > 0 ? (attempt.totalScore / attempt.maxScore) * 100 : 0;
    }

    private isAnswerCorrect(question: Question, answer: Answer): boolean {
        switch (question.type) {
            case 'mcq':
                return answer.selectedAnswer === question.correctAnswer;
            case 'true-false':
                return answer.selectedAnswer === question.correctAnswer;
            case 'fill-blank':
                return answer.textAnswer?.toLowerCase().trim() === 
                       (question.correctAnswer as string)?.toLowerCase().trim();
            case 'essay':
                // Essay questions typically require manual grading
                return false;
            default:
                return false;
        }
    }

    // Storage Methods
    private loadAttempts(): void {
        const attempts = this.storageService.getItem<QuizAttempt[]>(this.storageKey);
        if (attempts) {
            this.attemptsSubject.next(attempts);
        }
    }

    private saveAttempts(attempts: QuizAttempt[]): void {
        this.storageService.setItem(this.storageKey, attempts);
    }

    private loadCurrentAttempt(): void {
        const attempt = this.storageService.getItem<QuizAttempt>(this.currentAttemptKey);
        if (attempt && attempt.status === 'in-progress') {
            this.currentAttemptSubject.next(attempt);
        }
    }

    private saveCurrentAttempt(attempt: QuizAttempt): void {
        this.storageService.setItem(this.currentAttemptKey, attempt);
    }

    // Getters
    getCurrentAttempt(): QuizAttempt | null {
        return this.currentAttemptSubject.value;
    }

    getAttemptsForQuiz(quizId: string): Observable<QuizAttempt[]> {
        return new Observable(observer => {
            const filtered = this.attemptsSubject.value.filter(attempt => 
                attempt.quizId === quizId
            );
            observer.next(filtered);
            observer.complete();
        });
    }

    getAttemptsForUser(userId: string): Observable<QuizAttempt[]> {
        return new Observable(observer => {
            const filtered = this.attemptsSubject.value.filter(attempt => 
                attempt.userId === userId
            );
            observer.next(filtered);
            observer.complete();
        });
    }
}
