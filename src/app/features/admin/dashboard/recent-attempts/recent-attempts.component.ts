import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizAttempt } from '../../../../core/models/answer';
import { Quiz } from '../../../../core/models/quiz';
import { UserService } from '../../../../core/services/user.service';
import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-recent-attempts',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './recent-attempts.css',
  templateUrl: './recent-attempts.html'
})
export class RecentAttemptsComponent {
  @Input() attempts: QuizAttempt[] = [];
  private quizzes: Quiz[] = [];

  constructor(private userService: UserService, private quizService: QuizService) {
    this.quizService.getQuizzes().subscribe(q => this.quizzes = q);
  }

  getStudentName(username: string): string {
    const users = this.userService.getUsers();
    const user = users.find(u => u.username === username);
    return user ? user.fullName : username;
  }

  getQuizName(quizId: string): string {
    const quiz = this.quizzes.find(q => q.id === quizId);
    return quiz ? quiz.title : 'Unknown Quiz';
  }

  getScoreClass(score: number): string {
    if (score >= 80) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (score >= 40) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-red-50 text-red-600 border border-red-100';
  }

  getStatusClass(percentage: number): string {
    if (percentage >= 50) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    return 'bg-red-50 text-red-600 border border-red-100';
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 
