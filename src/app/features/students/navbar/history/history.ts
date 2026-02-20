import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AttemptService } from '../../../../core/services/attempet.service';
import { Attempt } from '../../../../core/models/attempet';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.html',
  styleUrl: './history.css',
})
export class History {
  brandName = 'OQP';
  user = { name: '', role: 'student' };
  attempts: Attempt[] = [];

  constructor(
    private router: Router,
    private attemptService: AttemptService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.username;
      this.attempts = this.attemptService.getAttemptsForUser(currentUser.username);
    }
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
}
