import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { Quiz } from '../../../core/models/quiz';
import { Question } from '../../../core/models/question';
import { Subject, takeUntil } from 'rxjs';

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
  passingScore = 50;
  questions: any[] = [];
  totalQuestions = 0;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private attemptService: AttemptService,
    private settingsService: SettingsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');

    // Load settings
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.passingScore = settings.passingScore || 50;
      });

    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  loadQuiz(quizId: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      console.log('Quiz loading - Quiz ID:', quizId);
      console.log('Quiz loading - Found quiz:', found);
      console.log('Quiz loading - All quizzes:', quizzes);

      if (found) {
        this.quiz = found;
        this.questions = found.questions || [];
        this.totalQuestions = this.questions.length;
        console.log('Quiz loading - Questions:', this.questions);
        console.log('Quiz loading - Question count:', this.totalQuestions);
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

  selectAnswer(questionIndex: number, answer: any) {
    this.selectedAnswers[questionIndex] = answer;
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
    console.log('Submit quiz called');

    if (this.timer) {
      clearInterval(this.timer);
    }

    if (!this.quiz) {
      console.log('No quiz data found');
      return;
    }

    // Calculate score by checking actual answers
    const totalQuestions = this.quiz.questions?.length || this.quiz.questionCount;
    let correctAnswers = 0;

    if (this.quiz.questions) {
      this.quiz.questions.forEach((question: any, index: number) => {
        const userAnswer = this.selectedAnswers[index];

        if (question.type === 'mcq' || question.type === 'true-false') {
          // Handle both string and number correct answers
          const isCorrect = userAnswer === question.correctAnswer ||
            parseInt(userAnswer) === parseInt(question.correctAnswer) ||
            userAnswer?.toString() === question.correctAnswer?.toString();

          if (isCorrect) {
            correctAnswers++;
          }
        } else if (question.type === 'fill-blank') {
          const correctAnswersArray = question.correctAnswers || [];
          let allBlanksCorrect = true;

          if (Array.isArray(userAnswer) && correctAnswersArray.length > 0) {
            userAnswer.forEach((answer: string, blankIndex: number) => {
              const correctAnswer = correctAnswersArray[blankIndex];
              if (answer?.toLowerCase().trim() !== correctAnswer?.toLowerCase().trim()) {
                allBlanksCorrect = false;
              }
            });

            if (allBlanksCorrect) {
              correctAnswers++;
            }
          }
        }
        // Essay questions are not auto-graded
      });
    }

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

    // Save attempt
    const currentUser = this.authService.getCurrentUser();
    const attempt = {
      id: Date.now().toString(),
      quizId: this.quiz.id,
      quizName: this.quiz.title,
      user: currentUser ? currentUser.username : 'student',
      date: new Date().toISOString(),
      score: score.toString(),
      status: score >= this.passingScore ? 'Passed' : 'Failed',
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      totalQuestions,
      selectedAnswers: this.selectedAnswers
    };

    console.log('About to save attempt:', attempt);
    this.attemptService.addAttempt(attempt);
    console.log('Attempt saved, navigating to results');

    this.router.navigate(['/quiz-result', this.quiz.id], {
      queryParams: { score, correct: correctAnswers, wrong: totalQuestions - correctAnswers }
    });
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
}
