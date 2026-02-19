import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent {
  brandName = 'OQP';
  user = {
    name: '',
    role: 'student'
  };

  quizzes = [
    {
      title: 'Angular Basics',
      description: 'Test your knowledge of Angular fundamentals including components, directives, and services.',
      questions: 5,
      time: '10m',
      bestScore: '100%',
      status: 'Completed'
    },
    {
      title: 'TypeScript Fundamentals',
      description: 'Evaluate your understanding of TypeScript types, interfaces, and advanced features.',
      questions: 3,
      time: '15m',
      bestScore: '0%',
      status: 'Completed'
    }
  ];

  stats = [
    { label: 'Available Quizzes', value: 3, icon: 'book' },
    { label: 'Quizzes Taken', value: 11, icon: 'history' },
    { label: 'Avg Score', value: '13%', icon: 'trending-up' }
  ];

  constructor(private router: Router, private authService: AuthService) { }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.name = currentUser.username;
    }
  }

  onLogout() {
    this.router.navigate(['/login']);
  }
}



