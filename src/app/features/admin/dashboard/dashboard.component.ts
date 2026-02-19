import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from './stats-cards/stats-cards.component';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { RecentAttemptsComponent } from './recent-attempts/recent-attempts.component';
import { QuizService } from '../../../core/services/quiz.service';
import { UserService } from '../../../core/services/user.service';
import { AttemptService } from '../../../core/services/attempet.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardsComponent,
    QuickActionsComponent,
    RecentAttemptsComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats$: Observable<any[]>;
  quickActions = [
    { label: 'Manage Quizzes', path: '/admin/quizzes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-emerald-600' },
    { label: 'View Students', path: '/admin/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-emerald-500' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', color: 'text-emerald-500' }
  ];
  recentAttempts$: Observable<any[]>;

  constructor(
    private quizService: QuizService,
    private userService: UserService,
    private attemptService: AttemptService
  ) {
    this.stats$ = this.calculateStats();
    this.recentAttempts$ = this.getRecentAttempts();
  }

  calculateStats(): Observable<any[]> {
    return combineLatest([
      this.quizService.getQuizzes(),
      new Observable<User[]>(subscriber => {
        const users = this.userService.getUsers();
        subscriber.next(users);
      })
    ]).pipe(
      map(([quizzes, users]: [any[], User[]]) => {
        const students = users.filter((user: User) => user.role === 'student');
        const allAttempts = this.attemptService.getAllAttempts();
        const totalAttempts = allAttempts.length;

        const totalScore = allAttempts.reduce((sum, attempt) => {
          const score = parseInt(attempt.score.replace('%', ''));
          return sum + score;
        }, 0);
        const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

        return [
          { label: 'Total Students', value: students.length.toString(), icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Total Quizzes', value: quizzes.length.toString(), icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-amber-50 text-amber-600' },
          { label: 'Total Attempts', value: totalAttempts.toString(), icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'bg-green-50 text-green-600' },
          { label: 'Avg Score', value: `${avgScore}%`, icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', color: 'bg-orange-50 text-orange-600' }
        ];
      })
    );
  }

  getRecentAttempts(): Observable<any[]> {
    return new Observable(subscriber => {
      const allAttempts = this.attemptService.getAllAttempts();
      // Sort by date and get latest 5
      const recentAttempts = allAttempts
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      subscriber.next(recentAttempts);
    });
  }
}
