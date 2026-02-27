import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { User } from '../models/user';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly SESSION_KEY = 'oqp_session';
    private currentUserSubject = new BehaviorSubject<User | null>(null);

    constructor(private userService: UserService, private storageService: StorageService) {
        const session = this.storageService.getItem<User>(this.SESSION_KEY);
        if (session) {
            this.currentUserSubject.next(session);
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
            this.storageService.setItem(this.SESSION_KEY, userWithoutPassword);
            this.currentUserSubject.next(userWithoutPassword as User);
            return of(true);
        }

        return of(false);
    }

    logout(): void {
        this.storageService.removeItem(this.SESSION_KEY);
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
        this.storageService.setItem(this.SESSION_KEY, userWithoutPassword);
        this.currentUserSubject.next(userWithoutPassword as User);
        this.userService.updateUser(updatedUser);
    }
}
