import { Injectable } from '@angular/core';
import { PlatformSettings } from '../models/settings';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private readonly STORAGE_KEY = 'oqp_platform_settings';
  private defaultSettings: PlatformSettings = {
    siteName: 'OQP',
    welcomeMessage: 'Ready to challenge yourself? Pick a quiz below.',
    passingScore: 50,
    maxAttempts: 0,
    allowRetakes: false,
    showCorrectAnswers: false
  };
  private settingsSubject = new BehaviorSubject<PlatformSettings>(this.defaultSettings);

  constructor() {
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const settings = stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
    this.settingsSubject.next(settings);
    if (!stored) {
      this.saveSettings(this.defaultSettings);
    }
  }

  getSettings$(): Observable<PlatformSettings> {
    return this.settingsSubject.asObservable();
  }

  getSettings(): PlatformSettings {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
  }

  saveSettings(settings: Partial<PlatformSettings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedSettings));
    this.settingsSubject.next(updatedSettings);
  }

  updateSiteName(siteName: string): void {
    this.saveSettings({ siteName });
  }

  updateWelcomeMessage(welcomeMessage: string): void {
    this.saveSettings({ welcomeMessage });
  }
}
