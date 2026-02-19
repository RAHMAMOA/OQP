import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Quiz } from '../models/quiz';

@Injectable({
    providedIn: 'root'
})
export class QuizService {
    private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
    quizzes$ = this.quizzesSubject.asObservable();
    private storageKey = 'quizzes';

    constructor() {
        this.loadFromLocalStorage();
    }

    private loadFromLocalStorage() {
        const storedQuizzes = localStorage.getItem(this.storageKey);
        if (storedQuizzes) {
            try {
                const quizzes = JSON.parse(storedQuizzes);
                this.quizzesSubject.next(quizzes);
            } catch (error) {
                console.error('Error parsing quizzes from localStorage', error);
            }
        }
    }

    private saveToLocalStorage(quizzes: Quiz[]) {
        localStorage.setItem(this.storageKey, JSON.stringify(quizzes));
    }

    getQuizzes(): Observable<Quiz[]> {
        return this.quizzes$;
    }

    addQuiz(quiz: Quiz) {
        const currentQuizzes = this.quizzesSubject.value;
        const updatedQuizzes = [...currentQuizzes, quiz];
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToLocalStorage(updatedQuizzes);
    }

    deleteQuiz(id: string) {
        const currentQuizzes = this.quizzesSubject.value;
        const updatedQuizzes = currentQuizzes.filter(q => q.id !== id);
        this.quizzesSubject.next(updatedQuizzes);
        this.saveToLocalStorage(updatedQuizzes);
    }

    updateQuiz(updatedQuiz: Quiz) {
        const currentQuizzes = this.quizzesSubject.value;
        const index = currentQuizzes.findIndex(q => q.id === updatedQuiz.id);
        if (index !== -1) {
            currentQuizzes[index] = updatedQuiz;
            const updatedQuizzes = [...currentQuizzes];
            this.quizzesSubject.next(updatedQuizzes);
            this.saveToLocalStorage(updatedQuizzes);
        }
    }
}
