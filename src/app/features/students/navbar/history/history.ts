import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AttemptService } from '../../../../core/services/result.service';
import { QuizService } from '../../../../core/services/quiz.service';
import { SettingsService } from '../../../../core/services/settings.service';
import { Attempt } from '../../../../core/models/attempet';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History implements OnInit {
  brandName = 'OQP';
  user = { name: '', role: 'student' };
  attempts: Attempt[] = [];
  showCorrectAnswers = false;
  allowRetakes = false;
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private attemptService: AttemptService,
    private quizService: QuizService,
    private authService: AuthService,
    private settingsService: SettingsService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.username;

      // Load settings
      this.settingsService.getSettings$()
        .pipe(takeUntil(this.destroy$))
        .subscribe(settings => {
          this.showCorrectAnswers = settings.showCorrectAnswers || false;
          this.allowRetakes = settings.allowRetakes || false;
        });

      // Subscribe to attempts for real-time updates
      this.attemptService.getAttempts().pipe(
        takeUntil(this.destroy$)
      ).subscribe(allAttempts => {
        this.attempts = allAttempts.filter(attempt => attempt.user === currentUser.username);
        console.log('History - User attempts:', this.attempts);
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getScoreClass(score: string): string {
    const val = parseInt(score);
    if (val >= 80) return 'bg-emerald-100 text-emerald-700';
    if (val >= 40) return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-600';
  }

  getScoreDotClass(score: string): string {
    const val = parseInt(score);
    if (val >= 80) return 'bg-emerald-500';
    if (val >= 40) return 'bg-amber-400';
    return 'bg-red-500';
  }

  getStatusClass(status: string): string {
    if (status === 'Passed') return 'bg-emerald-100 text-emerald-700';
    return 'bg-red-100 text-red-600';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  reviewAnswers(attempt: Attempt): void {
    // Navigate to quiz result page with the attempt data
    this.router.navigate(['/quiz-result', attempt.quizId], {
      queryParams: {
        reviewMode: 'true',
        attemptId: attempt.id
      }
    });
  }

  canRetakeQuiz(attempt: Attempt): boolean {
    if (!this.allowRetakes) return false;

    // Check if user has already taken this quiz
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    const userAttempts = this.attemptService.getAttemptsByUser(currentUser.username);
    const quizAttempts = userAttempts.filter(a => a.quizId === attempt.quizId);

    return quizAttempts.length > 0; // Only show retake if they've taken it before
  }
}
