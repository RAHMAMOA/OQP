import { Injectable } from '@angular/core';
import { PlatformSettings } from '../models/settings';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { SecuritySettings } from './anti-cheat.service';

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
    allowRetakes: true,
    showCorrectAnswers: false,
    securitySettings: {
      preventTabSwitching: true,
      preventCopyPaste: true,
      preventRightClick: true,
      preventKeyboardShortcuts: true,
      detectDevTools: true,
      maxViolations: 3,
      autoSubmitOnViolation: true
    }
  };
  private settingsSubject = new BehaviorSubject<PlatformSettings>(this.defaultSettings);

  constructor(
    private storageService: StorageService
  ) {
    this.initializeDefaultSettings();
  }

  private initializeDefaultSettings() {
    const stored = this.storageService.getItem<Partial<PlatformSettings>>(this.STORAGE_KEY);
    const settings = stored ? { ...this.defaultSettings, ...stored } : this.defaultSettings;
    this.settingsSubject.next(settings);
    if (!stored) {
      this.saveSettings(this.defaultSettings);
    }
  }

  getSettings$(): Observable<PlatformSettings> {
    return this.settingsSubject.asObservable();
  }

  getSettings(): PlatformSettings {
    const stored = this.storageService.getItem<Partial<PlatformSettings>>(this.STORAGE_KEY);
    return stored ? { ...this.defaultSettings, ...stored } : this.defaultSettings;
  }

  saveSettings(settings: Partial<PlatformSettings>): void {
    const currentSettings = this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    this.storageService.setItem(this.STORAGE_KEY, updatedSettings);
    this.settingsSubject.next(updatedSettings);
  }

  updateSiteName(siteName: string): void {
    this.saveSettings({ siteName });
  }

  updateWelcomeMessage(welcomeMessage: string): void {
    this.saveSettings({ welcomeMessage });
  }
}
