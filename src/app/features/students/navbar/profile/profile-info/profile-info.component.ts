import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { User } from '../../../../../core/models/user';

export interface ProfileStats {
  quizzesTaken: number;
  avgScore: number;
  bestScore: number;
  passRate: number;
}

@Component({
  selector: 'app-profile-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-info.component.html',
  styleUrl: './profile-info.component.css'
})
export class ProfileInfoComponent {
  @Input() currentUser!: User | null;
  @Input() stats!: ProfileStats;
  @Output() editProfile = new EventEmitter<void>();

  onEditProfile() {
    this.editProfile.emit();
  }
}
