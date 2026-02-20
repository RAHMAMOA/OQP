import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { AttemptService } from '../../../../core/services/result.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { User } from '../../../../core/models/user';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isEditing = false;
  profileForm!: FormGroup;
  private destroy$ = new Subject<void>();

  // Statistics (calculated from real attempt data)
  stats = {
    quizzesTaken: 0,
    avgScore: 0,
    bestScore: 0,
    passRate: 0
  };
  passingScore = 50; // Default, will be updated from settings

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private attemptService: AttemptService,
    private settingsService: SettingsService
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.initializeForm();
    this.loadSettings();
    this.loadUserStats();
  }

  private loadSettings() {
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.passingScore = settings.passingScore || 50;
        // Recalculate stats with new passing score
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          const userAttempts = this.attemptService.getAttemptsByUser(currentUser.username);
          this.calculateStats(userAttempts);
        }
      });
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      fullName: [this.currentUser?.fullName || '', [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]]
    });
  }

  private loadUserStats() {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    // Subscribe to attempts for real-time stats updates
    this.attemptService.getAttempts().pipe(
      takeUntil(this.destroy$)
    ).subscribe(allAttempts => {
      // Filter attempts for current user
      const userAttempts = allAttempts.filter(attempt => attempt.user === currentUser.username);

      // Calculate real statistics
      this.calculateStats(userAttempts);
    });
  }

  private calculateStats(attempts: any[]) {
    if (attempts.length === 0) {
      this.stats = {
        quizzesTaken: 0,
        avgScore: 0,
        bestScore: 0,
        passRate: 0
      };
      return;
    }

    const quizzesTaken = attempts.length;
    const scores = attempts.map(attempt => parseInt(attempt.score) || 0);
    const totalScore = scores.reduce((sum, score) => sum + score, 0);
    const avgScore = Math.round(totalScore / scores.length);
    const bestScore = Math.max(...scores);
    const passCount = scores.filter(score => score >= this.passingScore).length;
    const passRate = Math.round((passCount / scores.length) * 100);

    this.stats = {
      quizzesTaken,
      avgScore,
      bestScore,
      passRate
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

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
