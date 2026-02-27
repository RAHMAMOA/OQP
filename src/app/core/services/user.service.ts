import { Injectable } from '@angular/core';
import { User } from '../models/user';
import { StorageService } from './storage.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly STORAGE_KEY = 'oqp_users';

    constructor(private storageService: StorageService) { }

    getUsers(): User[] {
        const users = this.storageService.getItem<User[]>(this.STORAGE_KEY) || [];
        console.log('UserService: Retrieved users from storage:', users);

        // Seed default admin if it doesn't exist
        if (!users.some(u => u.username === 'admin')) {
            console.log('UserService: Adding default admin user');
            users.push({
                id: 'admin-1',
                username: 'admin',
                fullName: 'Administrator',
                email: 'admin@oqp.com',
                password: 'admin123',
                role: 'admin'
            });
            this.storageService.setItem(this.STORAGE_KEY, users);
        }

        // Fix existing users without passwords
        let needsUpdate = false;
        users.forEach(user => {
            if (!user.password && user.email === 'r44234782@gmail.com') {
                user.password = 'rah123';
                needsUpdate = true;
            }
        });

        if (needsUpdate) {
            console.log('UserService: Updated user password');
            this.storageService.setItem(this.STORAGE_KEY, users);
        }

        return users;
    }

    addUser(user: User): void {
        const users = this.getUsers();
        users.push(user);
        this.storageService.setItem(this.STORAGE_KEY, users);
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
            this.storageService.setItem(this.STORAGE_KEY, users);
        }
    }
}
