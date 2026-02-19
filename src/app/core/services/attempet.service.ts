import { Injectable } from '@angular/core';
import { Attempt } from '../models/attempet';

@Injectable({
    providedIn: 'root'
})
export class AttemptService {
    private readonly STORAGE_KEY = 'oqp_attempts';

    constructor() { }

    getAttemptsForUser(username: string): Attempt[] {
        const attempts = this.getAllAttempts();
        return attempts.filter(attempt => attempt.user === username);
    }

    getAllAttempts(): Attempt[] {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    }

    saveAttempt(attempt: Attempt): void {
        const attempts = this.getAllAttempts();
        attempts.push(attempt);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(attempts));
    }

    clearUserAttempts(username: string): void {
        const attempts = this.getAllAttempts();
        const filtered = attempts.filter(attempt => attempt.user !== username);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    }
}