import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-platform-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './platform-settings.component.html',
  styleUrl: './platform-settings.component.css'
})
export class PlatformSettingsComponent {
  @Input() settingsForm!: FormGroup;
  @Input() isSaving!: boolean;
  @Output() save = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();

  onSave() {
    this.save.emit();
  }

  onReset() {
    this.reset.emit();
  }
}
