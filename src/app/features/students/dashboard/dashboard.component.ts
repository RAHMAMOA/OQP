import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
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

    constructor(private router: Router) { }

    onLogout() {
        this.router.navigate(['/login']);
    }
}



