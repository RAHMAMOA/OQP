import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../../../core/services/settings.service';
import { PlatformSettings } from '../../../../../core/models/settings';
import { SecuritySettings } from '../../../../../core/services/anti-cheat.service';

@Component({
  selector: 'app-security-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './security-settings.component.html',
  styleUrls: ['./security-settings.component.css']
})
export class SecuritySettingsComponent implements OnInit {
  settings: PlatformSettings | null = null;
  securitySettings: SecuritySettings = {
    preventTabSwitching: true,
    preventCopyPaste: true,
    preventRightClick: true,
    preventKeyboardShortcuts: true,
    detectDevTools: true,
    maxViolations: 3,
    autoSubmitOnViolation: true
  };
  isLoading = true;
  saveStatus = '';

  constructor(private settingsService: SettingsService) { }

  ngOnInit() {
    this.loadSettings();
  }

  loadSettings() {
    this.settings = this.settingsService.getSettings();
    if (this.settings.securitySettings) {
      this.securitySettings = { ...this.settings.securitySettings };
    }
    this.isLoading = false;
  }

  saveSettings() {
    if (this.settings) {
      const updatedSettings: PlatformSettings = {
        ...this.settings,
        securitySettings: this.securitySettings
      };

      this.settingsService.saveSettings(updatedSettings);
      this.showSaveStatus('Security settings saved successfully!', 'success');
    }
  }

  resetToDefaults() {
    this.securitySettings = {
      preventTabSwitching: true,
      preventCopyPaste: true,
      preventRightClick: true,
      preventKeyboardShortcuts: true,
      detectDevTools: true,
      maxViolations: 3,
      autoSubmitOnViolation: true
    };
    this.showSaveStatus('Settings reset to defaults', 'info');
  }

  private showSaveStatus(message: string, type: 'success' | 'error' | 'info') {
    this.saveStatus = message;
    setTimeout(() => {
      this.saveStatus = '';
    }, 3000);
  }

  getSaveStatusClass() {
    switch (this.saveStatus.includes('success') ? 'success' :
      this.saveStatus.includes('error') ? 'error' : 'info') {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  }
}
