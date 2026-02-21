import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { QuizAttempt } from '../models/answer';
import { AnswerService } from './answer.service';

@Injectable({
    providedIn: 'root'
})
export class AttemptService {
    constructor(private answerService: AnswerService) { }

    getAttempts(): Observable<QuizAttempt[]> {
        return this.answerService.attempts$;
    }

    addAttempt(attempt: QuizAttempt) {
        // Obsolete: AnswerService manages attempt addition via submitQuizAttempt
        console.warn('AttemptService.addAttempt is deprecated. Use AnswerService instead.');
    }

    getAttemptsByUser(userId: string): QuizAttempt[] {
        let userAttempts: QuizAttempt[] = [];
        this.answerService.getAttemptsForUser(userId).subscribe(attempts => userAttempts = attempts);
        return userAttempts;
    }

    clearAllAttempts(): void {
        // For testing purposes
        localStorage.removeItem('quizAttempts');
        window.location.reload();
    }

    getUserStats(userId: string): { quizzesTaken: number; avgScore: number; passRate: number } {
        const userAttempts = this.getAttemptsByUser(userId);

        console.log(`getUserStats for ${userId}:`);
        console.log('User attempts:', userAttempts);

        const bestScores = new Map<string, number>();

        userAttempts.forEach(attempt => {
            let score = 0;
            if (attempt.percentage !== undefined && attempt.percentage !== null) {
                score = Number(attempt.percentage.toString().replace(/[^0-9.-]/g, '')) || 0;
            }
            if (!bestScores.has(attempt.quizId) || score > bestScores.get(attempt.quizId)!) {
                bestScores.set(attempt.quizId, score);
            }
        });

        if (bestScores.size === 0) {
            return { quizzesTaken: 0, avgScore: 0, passRate: 0 };
        }

        let totalScore = 0;
        let passCount = 0;
        bestScores.forEach(score => {
            totalScore += score;
            if (score >= 50) {
                passCount++;
            }
        });

        const avgScore = Math.round(totalScore / bestScores.size);
        const passRate = Math.round((passCount / bestScores.size) * 100);

        const result = {
            quizzesTaken: bestScores.size,
            avgScore,
            passRate
        };

        console.log('Calculated stats:', result);
        return result;
    }
}