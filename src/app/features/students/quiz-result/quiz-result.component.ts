import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { Attempt } from '../../../core/models/attempet';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-result.component.html'
})
export class QuizResultComponent implements OnInit {
  quiz: any = null;
  score = 0;
  correct = 0;
  wrong = 0;
  percentage = 0;
  passed = false;
  quizName = '';
  attempt: Attempt | null = null;
  allAttempts: Attempt[] = [];
  Object = Object; // Add Object constructor for template access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private attemptService: AttemptService
  ) {}

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    
    // Try to get data from query params first (for immediate results)
    this.score = parseInt(this.route.snapshot.queryParamMap.get('score') || '0');
    this.correct = parseInt(this.route.snapshot.queryParamMap.get('correct') || '0');
    this.wrong = parseInt(this.route.snapshot.queryParamMap.get('wrong') || '0');
    this.percentage = this.score;
    this.passed = this.score >= 50;

    // Load quiz details
    if (quizId) {
      this.loadQuiz(quizId);
    }

    // Load all attempts for history
    this.loadAllAttempts();
  }

  loadQuiz(quizId: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      if (found) {
        this.quiz = found;
        this.quizName = found.title;
      }
    });
  }

  loadAllAttempts() {
    // Get current user (simplified - should come from auth service)
    const currentUser = 'student'; // This should come from auth service
    
    // Load all attempts for this user
    this.attemptService.getAttempts().subscribe(attempts => {
      this.allAttempts = attempts.filter(attempt => attempt.user === currentUser);
      
      // Find the most recent attempt for this quiz to get detailed data
      const latestAttempt = this.allAttempts
        .filter(attempt => this.quiz && attempt.quizId === this.quiz.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      
      if (latestAttempt) {
        this.attempt = latestAttempt;
        // Override query params with actual attempt data if available
        this.score = parseInt(latestAttempt.score) || 0;
        this.correct = latestAttempt.correctAnswers || 0;
        this.wrong = latestAttempt.wrongAnswers || 0;
        this.percentage = this.score;
        this.passed = this.score >= 50;
      }
    });
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  reviewAnswers() {
    if (this.attempt && this.attempt.selectedAnswers) {
      console.log('Review answers:', this.attempt.selectedAnswers);
      // Here you could navigate to a detailed review page
      // this.router.navigate(['/quiz-review', this.quiz.id, this.attempt.id]);
    } else {
      console.log('No detailed answers available for review');
    }
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
}
