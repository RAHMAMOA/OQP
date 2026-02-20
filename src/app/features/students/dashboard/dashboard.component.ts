import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/attempet.service';
import { SettingsService } from '../../../core/services/settings.service';
import { Quiz } from '../../../core/models/quiz';
import { Observable } from 'rxjs';
import { map, combineLatest } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  brandName = 'OQP';
  user = {
    name: '',
    role: 'student'
  };
  quizzes$: Observable<Quiz[]>;
  stats$: Observable<any[]>;
  welcomeMessage = '';

  constructor(private router: Router, private authService: AuthService, private quizService: QuizService, private attemptService: AttemptService, private settingsService: SettingsService) {
    this.quizzes$ = this.quizService.getQuizzes();
    this.stats$ = this.calculateStats();
    this.welcomeMessage = this.settingsService.getSettings().welcomeMessage;
  }

  calculateStats(): Observable<any[]> {
    return combineLatest([
      this.quizzes$,
      this.quizzes$.pipe(
        map(quizzes => {
          const currentUser = this.authService.getCurrentUser();
          if (!currentUser) return [];
          return this.attemptService.getAttemptsForUser(currentUser.username);
        })
      )
    ]).pipe(
      map(([quizzes, attempts]) => {
        const quizzesTaken = attempts.length;
        const totalScore = attempts.reduce((sum, attempt) => {
          const score = parseInt(attempt.score.replace('%', ''));
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
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.fullName || currentUser.username;
    }
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}



