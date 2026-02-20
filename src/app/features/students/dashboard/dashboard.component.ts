import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Quiz } from '../../../core/models/quiz';
import { Observable, Subject } from 'rxjs';
import { map, combineLatest, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit, OnDestroy {
  brandName = '';
  user = {
    name: '',
    role: 'student'
  };
  quizzes$: Observable<Quiz[]>;
  stats$: Observable<any[]>;
  welcomeMessage = '';
  settings: any;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService, private quizService: QuizService, private attemptService: AttemptService, private settingsService: SettingsService) {
    this.quizzes$ = this.quizService.getQuizzes();
    this.stats$ = this.calculateStats();
  }

  calculateStats(): Observable<any[]> {
    return combineLatest([
      this.quizzes$,
      this.attemptService.getAttempts().pipe(
        map(allAttempts => {
          const currentUser = this.authService.getCurrentUser();
          if (!currentUser) return [];
          return allAttempts.filter(attempt => attempt.user === currentUser.username);
        })
      )
    ]).pipe(
      map(([quizzes, attempts]) => {
        const quizzesTaken = attempts.length;
        const totalScore = attempts.reduce((sum: number, attempt: any) => {
          const score = parseInt(attempt.score) || 0;
          return sum + score;
        }, 0);
        const avgScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

        return [
          { label: 'Available Quizzes', value: quizzes.length, icon: 'book' },
          { label: 'Quizzes Taken', value: quizzesTaken, icon: 'history' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: 'trending-up' }
        ];
      })
    );
  }

  ngOnInit(): void {
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.settings = settings;
        this.brandName = settings.siteName;
        this.welcomeMessage = settings.welcomeMessage;
      });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.fullName || currentUser.username;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onLogout() {
    this.router.navigate(['/login']);
  }

  hasUserTakenQuiz(quizId: string): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;

    const attempts = this.attemptService.getAttemptsByUser(currentUser.username);
    return attempts.some(attempt => attempt.quizId === quizId);
  }

  getQuizButtonState(quizId: string) {
    const hasTaken = this.hasUserTakenQuiz(quizId);
    const canRetake = this.settings?.allowRetakes !== false; // Default to true if undefined

    return {
      isLocked: hasTaken && !canRetake,
      canTake: !hasTaken || canRetake,
      showCompleted: hasTaken && !canRetake
    };
  }

  getResultFlagColor(quizId: string): string {
    const hasTaken = this.hasUserTakenQuiz(quizId);
    const showResults = this.settings?.showCorrectAnswers !== false; // Default to true if undefined

    if (!hasTaken) return '';
    return showResults ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600';
  }
}



