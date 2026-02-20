import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attempt } from '../../../../core/models/attempet';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-recent-attempts',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './recent-attempts.css',
  templateUrl: './recent-attempts.html'
})
export class RecentAttemptsComponent {
  @Input() attempts: Attempt[] = [];

  constructor(private userService: UserService) { }

  getStudentName(username: string): string {
    const users = this.userService.getUsers();
    const user = users.find(u => u.username === username);
    return user ? user.fullName : username;
  }

  getScoreClass(score: string): string {
    const val = parseInt(score);
    if (val >= 80) return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    if (val >= 40) return 'bg-amber-50 text-amber-600 border border-amber-100';
    return 'bg-red-50 text-red-600 border border-red-100';
  }

  getStatusClass(status: string): string {
    if (status === 'Passed') return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
    return 'bg-red-50 text-red-600 border border-red-100';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 
