import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StorageService {

    getItem<T>(key: string): T | null {
        const item = localStorage.getItem(key);
        console.log(`StorageService: Getting item for key: ${key}`, item);
        if (item) {
            try {
                const parsed = JSON.parse(item) as T;
                console.log(`StorageService: Successfully parsed item for key: ${key}`, parsed);
                return parsed;
            } catch (error) {
                console.error(`Error parsing item from localStorage for key: ${key}`, error);
                return null;
            }
        }
        console.log(`StorageService: No item found for key: ${key}`);
        return null;
    }

    setItem<T>(key: string, value: T): void {
        try {
            const serialized = JSON.stringify(value);
            console.log(`StorageService: Setting item for key: ${key}`, value);
            localStorage.setItem(key, serialized);
            console.log(`StorageService: Successfully set item for key: ${key}`);

            // Verify it was saved
            const verify = localStorage.getItem(key);
            console.log(`StorageService: Verification - item exists after save: ${!!verify}`);
        } catch (error) {
            console.error(`Error setting item in localStorage for key: ${key}`, error);
        }
    }

    removeItem(key: string): void {
        try {
            console.log(`StorageService: Removing item for key: ${key}`);
            localStorage.removeItem(key);
            console.log(`StorageService: Successfully removed item for key: ${key}`);
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