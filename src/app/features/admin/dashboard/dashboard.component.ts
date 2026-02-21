import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from '../../../shared/components/stats-cards/stats-cards.component';
import { StatCard } from '../../../core/models/stat-card';
import { QuickActionsComponent } from './quick-actions/quick-actions.component';
import { RecentAttemptsComponent } from './recent-attempts/recent-attempts.component';
import { QuizService } from '../../../core/services/quiz.service';
import { UserService } from '../../../core/services/user.service';
import { AttemptService } from '../../../core/services/result.service';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../../../core/models/user';
import { TruncatePipe } from '../../../shared/pipes';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardsComponent,
    QuickActionsComponent,
    RecentAttemptsComponent,
    TruncatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  stats$: Observable<StatCard[]>;
  quickActions = [
    { label: 'Manage Quizzes', path: '/admin/quizzes', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-emerald-600' },
    { label: 'View Students', path: '/admin/students', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'text-emerald-500' },
    { label: 'Settings', path: '/admin/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-emerald-500' }
  ];
  recentAttempts$: Observable<any[]>;

  constructor(
    private quizService: QuizService,
    private userService: UserService,
    private attemptService: AttemptService
  ) {
    // Add clear attempts method for testing
    (window as any).clearAllAttempts = () => {
      this.attemptService.clearAllAttempts();
      alert('All quiz attempts cleared!');
    };
    this.stats$ = this.calculateStats();
    this.recentAttempts$ = this.getRecentAttempts();
  }

  calculateStats(): Observable<StatCard[]> {
    return combineLatest([
      this.quizService.getQuizzes(),
      new Observable<User[]>(subscriber => {
        const users = this.userService.getUsers();
        subscriber.next(users);
      }),
      this.attemptService.getAttempts()
    ]).pipe(
      map(([quizzes, users, allAttempts]: [any[], User[], any[]]) => {
        const students = users.filter((user: User) => user.role === 'student');
        const totalAttempts = allAttempts.length;

        const totalScore = allAttempts.reduce((sum: number, attempt: any) => {
          const score = parseFloat(attempt.percentage) || 0;
          return sum + score;
        }, 0);
        const avgScore = totalAttempts > 0 ? Math.round(totalScore / totalAttempts) : 0;

        return [
          {
            label: 'Total Students',
            value: students.length.toString(),
            icon: 'users',
            color: 'bg-emerald-50 text-emerald-500 border-emerald-200'
          },
          {
            label: 'Total Quizzes',
            value: quizzes.length.toString(),
            icon: 'quiz',
            color: 'bg-amber-50 text-amber-500 border-amber-200'
          },
          {
            label: 'Total Attempts',
            value: totalAttempts.toString(),
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

  getRecentAttempts(): Observable<any[]> {
    return this.attemptService.getAttempts().pipe(
      map(allAttempts => {
        // Sort by date and get latest 5
        return allAttempts
          .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      })
    );
  }
}
