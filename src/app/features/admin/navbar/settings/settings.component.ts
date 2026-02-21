import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsService } from '../../../../core/services/settings.service';
import { PlatformSettings } from '../../../../core/models/settings';
import { BrandingSettingsComponent } from './branding-settings/branding-settings.component';
import { PlatformSettingsComponent } from './platform-settings/platform-settings.component';
import { SecuritySettingsComponent } from './security-settings/security-settings.component';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BrandingSettingsComponent, PlatformSettingsComponent, SecuritySettingsComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  settingsForm!: FormGroup;
  isSaving = false;
  saveMessage = '';

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    const currentSettings = this.settingsService.getSettings();
    this.settingsForm = this.fb.group({
      siteName: [currentSettings.siteName, [Validators.required, Validators.minLength(2)]],
      welcomeMessage: [currentSettings.welcomeMessage, [Validators.required, Validators.minLength(10)]],
      passingScore: [currentSettings.passingScore || 50, [Validators.min(0), Validators.max(100)]],
      maxAttempts: [currentSettings.maxAttempts || 0, [Validators.min(0)]],
      allowRetakes: [currentSettings.allowRetakes || false],
      showCorrectAnswers: [currentSettings.showCorrectAnswers || false]
    });
  }

  onSave(): void {
    if (this.settingsForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isSaving = true;
    this.saveMessage = '';

    const formValues = this.settingsForm.value;
    this.settingsService.saveSettings(formValues);

    // Simulate save delay and show success message
    setTimeout(() => {
      this.isSaving = false;
      this.saveMessage = 'Settings saved successfully!';

      // Clear message after 3 seconds
      setTimeout(() => {
        this.saveMessage = '';
      }, 3000);
    }, 500);
  }

  onReset(): void {
    this.initializeForm();
    this.saveMessage = '';
  }

  private markFormAsTouched(): void {
    Object.keys(this.settingsForm.controls).forEach(key => {
      this.settingsForm.get(key)?.markAsTouched();
    });
  }

  get siteNameControl() {
    return this.settingsForm.get('siteName');
  }

  get welcomeMessageControl() {
    return this.settingsForm.get('welcomeMessage');
  }
}
