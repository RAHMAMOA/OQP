import { Injectable } from '@angular/core';
import { User } from '../models/user';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly STORAGE_KEY = 'oqp_users';

    getUsers(): User[] {
        const usersJson = localStorage.getItem(this.STORAGE_KEY);
        let users: User[] = usersJson ? JSON.parse(usersJson) : [];

        // Seed default admin if it doesn't exist
        if (!users.some(u => u.username === 'admin')) {
            users.push({
                id: 'admin-1',
                username: 'admin',
                fullName: 'Administrator',
                email: 'admin@oqp.com',
                password: 'admin123',
                role: 'admin'
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        }

        // Fix existing users without passwords
        users.forEach(user => {
            if (!user.password && user.email === 'r44234782@gmail.com') {
                user.password = 'rah123';
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
            }
        });

        return users;
    }

    addUser(user: User): void {
        const users = this.getUsers();
        users.push(user);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
    }

    emailExists(email: string): boolean {
        const users = this.getUsers();
        return users.some(u => u.email.toLowerCase() === email.toLowerCase());
    }

    updateUser(updatedUser: User): void {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.id === updatedUser.id);

        if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
        }
    }
}
