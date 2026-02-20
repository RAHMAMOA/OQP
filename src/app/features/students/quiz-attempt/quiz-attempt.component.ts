import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { Quiz } from '../../../core/models/quiz';
import { Question } from '../../../core/models/question';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './quiz-attempt.component.html'
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  selectedAnswers: { [key: string]: any } = {};
  timeRemaining = 0;
  timer: any;
  isLoading = true;
  String = String; // Add String constructor for template access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private attemptService: AttemptService
  ) {}

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  loadQuiz(quizId: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      if (found) {
        this.quiz = found;
        this.timeRemaining = found.time * 60; // Convert minutes to seconds
        this.startTimer();
      }
      this.isLoading = false;
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        this.submitQuiz();
      }
    }, 1000);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  selectAnswer(questionId: string, answer: any) {
    this.selectedAnswers[questionId] = answer;
  }

  nextQuestion() {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questionCount - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  getCurrentQuestion(): Question | null {
    if (!this.quiz || !this.quiz.questions || this.currentQuestionIndex >= this.quiz.questions.length) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex];
  }

  submitQuiz() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    if (!this.quiz) return;

    // Calculate score (simplified - assuming all questions have equal weight)
    const totalQuestions = this.quiz.questionCount;
    let correctAnswers = 0;

    // This is a simplified calculation - in real implementation, you'd need to check against correct answers
    const score = Math.round((correctAnswers / totalQuestions) * 100);

    // Save attempt
    const attempt = {
      id: Date.now().toString(),
      quizId: this.quiz.id,
      quizName: this.quiz.title,
      user: 'student', // This should come from auth service
      date: new Date().toISOString(),
      score: score.toString(),
      status: score >= 50 ? 'Passed' : 'Failed',
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      totalQuestions,
      selectedAnswers: this.selectedAnswers
    };

    this.attemptService.addAttempt(attempt);
    this.router.navigate(['/quiz-result', this.quiz.id], { 
      queryParams: { score, correct: correctAnswers, wrong: totalQuestions - correctAnswers }
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
