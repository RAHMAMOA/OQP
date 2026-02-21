import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-branding-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './branding-settings.component.html',
  styleUrl: './branding-settings.component.css'
})
export class BrandingSettingsComponent {
  @Input() settingsForm!: FormGroup;
  @Input() isSaving!: boolean;
  @Input() saveMessage!: string;
  @Output() save = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  get siteNameControl() {
    return this.settingsForm.get('siteName');
  }

  get welcomeMessageControl() {
    return this.settingsForm.get('welcomeMessage');
  }

  onSave() {
    this.save.emit();
  }

  onReset() {
    this.reset.emit();
  }
}
