import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(key);
        if (item) {
            try {
                return JSON.parse(item) as T;
            } catch (error) {
                console.error(`Error parsing item from localStorage for key: ${key}`, error);
                return null;
            }
        }
        return null;
    }

    setItem<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error setting item in localStorage for key: ${key}`, error);
        }
    }

    removeItem(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Error removing item from localStorage for key: ${key}`, error);
        }
    }

    clear(): void {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error clearing localStorage', error);
        }
    }

    exists(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }
}