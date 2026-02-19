import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../models/user';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly SESSION_KEY = 'oqp_session';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    constructor(private userService: UserService) {
        const session = localStorage.getItem(this.SESSION_KEY);
        if (session) {
            this.currentUserSubject.next(JSON.parse(session));
        }
    }

    get currentUser$(): Observable<User | null> {
        return this.currentUserSubject.asObservable();
    }

    login(email: string, password: string): Observable<boolean> {
        const users = this.userService.getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            const { password, ...userWithoutPassword } = user;
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(userWithoutPassword));
            this.currentUserSubject.next(userWithoutPassword as User);
            return of(true);
        }

        return of(false);
    }

    logout(): void {
        localStorage.removeItem(this.SESSION_KEY);
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean {
        return this.currentUserSubject.value !== null;
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    updateProfile(updatedUser: User): void {
        const { password, ...userWithoutPassword } = updatedUser;
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(userWithoutPassword));
        this.currentUserSubject.next(userWithoutPassword as User);
        this.userService.updateUser(updatedUser);
    }
}
