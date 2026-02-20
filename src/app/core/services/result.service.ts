import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Attempt } from '../models/attempet';

@Injectable({
    providedIn: 'root'
})
export class AttemptService {
    private attemptsSubject = new BehaviorSubject<Attempt[]>([]);
    attempts$ = this.attemptsSubject.asObservable();
    private storageKey = 'quiz_attempts';

    constructor() {
        this.loadFromLocalStorage();

        // Add global function for clearing attempts (for testing)
        (window as any).clearAllAttempts = () => {
            this.clearAllAttempts();
        };
    }

    private loadFromLocalStorage() {
        const storedAttempts = localStorage.getItem(this.storageKey);
        if (storedAttempts) {
            try {
                const attempts = JSON.parse(storedAttempts);
                this.attemptsSubject.next(attempts);
            } catch (error) {
                console.error('Error parsing attempts from localStorage', error);
            }
        }
    }

    private saveToLocalStorage(attempts: Attempt[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(attempts));
    }

    getAttempts(): Observable<Attempt[]> {
        return this.attempts$;
    }

    addAttempt(attempt: Attempt) {
        const currentAttempts = this.attemptsSubject.value;
        const updatedAttempts = [...currentAttempts, attempt];
        this.attemptsSubject.next(updatedAttempts);
        this.saveToLocalStorage(updatedAttempts);
    }

    getAttemptsByUser(username: string): Attempt[] {
        return this.attemptsSubject.value.filter(attempt => attempt.user === username);
    }

    clearAllAttempts(): void {
        this.attemptsSubject.next([]);
        localStorage.removeItem(this.storageKey);
        console.log('All attempts cleared from localStorage');
    }

    getUserStats(username: string): { quizzesTaken: number; avgScore: number; passRate: number } {
        const userAttempts = this.getAttemptsByUser(username);

        console.log(`getUserStats for ${username}:`);
        console.log('All attempts:', this.attemptsSubject.value);
        console.log('User attempts:', userAttempts);

        if (userAttempts.length === 0) {
            return { quizzesTaken: 0, avgScore: 0, passRate: 0 };
        }

        const scores = userAttempts.map(attempt => parseInt(attempt.score) || 0);
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const avgScore = Math.round(totalScore / scores.length);
        const passCount = scores.filter(score => score >= 50).length;
        const passRate = Math.round((passCount / scores.length) * 100);

        const result = {
            quizzesTaken: userAttempts.length,
            avgScore,
            passRate
        };

        console.log('Calculated stats:', result);
        return result;
    }
}