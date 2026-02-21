import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Quiz } from '../../../core/models/quiz';
import { User } from '../../../core/models/user';
import { PlatformSettings } from '../../../core/models/settings';
import { QuizAttempt } from '../../../core/models/answer';
import { Stats } from '../../../core/models/stats';
import { Observable, Subject } from 'rxjs';
import { map, combineLatest, takeUntil } from 'rxjs';
import { StatsCardsComponent } from '../../../shared/components/stats-cards/stats-cards.component';
import { StatCard } from '../../../core/models/stat-card';
import { AvailableQuizzes } from './available-quizzes/available-quizzes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardsComponent, AvailableQuizzes],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit, OnDestroy {
  brandName = '';
  user: User = { id: '', username: '', fullName: '', email: '', role: 'student' };
  quizzes$: Observable<Quiz[]>;
  stats$: Observable<StatCard[]>;
  welcomeMessage = '';
  settings: PlatformSettings = {
    siteName: '',
    welcomeMessage: '',
    allowRetakes: true,
    showCorrectAnswers: true
  };
  allAttempts: QuizAttempt[] = [];
  currentUser: User | null;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService, private quizService: QuizService, private attemptService: AttemptService, private settingsService: SettingsService) {
    this.currentUser = this.authService.getCurrentUser();
    this.quizzes$ = this.quizService.getQuizzes();
    this.stats$ = this.calculateStats();
  }

  calculateStats(): Observable<StatCard[]> {
    return combineLatest([
      this.quizzes$,
      this.attemptService.getAttempts().pipe(
        map(allAttempts => {
          if (!this.currentUser) return [];

          // Check for both userId and user properties to handle legacy data
          const filtered = allAttempts.filter(attempt =>
            this.currentUser && (attempt.userId === this.currentUser.username || (attempt as any).user === this.currentUser.username)
          );

          this.allAttempts = filtered;
          return filtered;
        })
      )
    ]).pipe(
      map(([quizzes, attempts]) => {
        // Group attempts by quizId and find the highest score for each quiz
        const bestScores = new Map<string, number>();

        attempts.forEach(attempt => {
          let score = 0;
          if (attempt.percentage !== undefined && attempt.percentage !== null) {
            score = Number(attempt.percentage.toString().replace(/[^0-9.-]/g, '')) || 0;
          }
          if (!bestScores.has(attempt.quizId) || score > bestScores.get(attempt.quizId)!) {
            bestScores.set(attempt.quizId, score);
          }
        });

        const quizzesTaken = bestScores.size;

        let totalScore = 0;
        bestScores.forEach(score => {
          totalScore += score;
        });

        const avgScore = quizzesTaken > 0 ? Math.round(totalScore / quizzesTaken) : 0;

        return [
          {
            label: 'Available Quizzes',
            value: quizzes.length,
            icon: 'quiz',
            color: 'bg-emerald-50 text-emerald-500 border-emerald-200'
          },
          {
            label: 'Quizzes Taken',
            value: quizzesTaken,
            icon: 'attempts',
            color: 'bg-blue-50 text-blue-500 border-blue-200'
          },
          {
            label: 'Avg Score',
            value: `${avgScore}%`,
            icon: 'trending-up',
            color: 'bg-purple-50 text-purple-500 border-purple-200'
          }
        ] as StatCard[];
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
      this.user.fullName = currentUser.fullName || currentUser.username;
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
    return attempts.some(attempt =>
      (attempt.userId === currentUser.username || (attempt as any).user === currentUser.username) &&
      (attempt as any).quizId === quizId
    );
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



