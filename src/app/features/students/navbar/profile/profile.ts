import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  currentUser: User | null = null;
  isEditing = false;
  profileForm!: FormGroup;

  // Statistics (these would come from a service in a real app)
  stats = {
    quizzesTaken: 0,
    avgScore: 0,
    bestScore: 0,
    passRate: 0
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForm();
    this.loadUserStats();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });
  }

  private loadUserStats() {
    // This would typically come from a statistics service
    // For now, we'll initialize with zeros
    this.stats = {
      quizzesTaken: 0,
      avgScore: 0,
      bestScore: 0,
      passRate: 0
    };
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.initializeForm();
    }
  }

  onSave() {
    if (this.profileForm.valid && this.currentUser) {
      // Update user data
      const updatedUser = {
        ...this.currentUser,
        fullName: this.profileForm.value.fullName,
        email: this.profileForm.value.email
      };

      // Call auth service to update the user
      this.authService.updateProfile(updatedUser);

      // Update local current user reference
      this.currentUser = updatedUser;

      this.isEditing = false;
    }
  }

  onCancel() {
    this.isEditing = false;
    this.initializeForm();
  }
}
