import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AnswerService } from '../../../core/services/answer.service';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { QuizAttempt, Answer } from '../../../core/models/answer';
import { Quiz } from '../../../core/models/quiz';
import { Question } from '../../../core/models/question';
import { QuizResultData, QuizResultSettings, QuizResultState } from '../../../core/models/quiz-result';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Subject, takeUntil } from 'rxjs';
import { ResultBannerComponent } from './result-banner/result-banner.component';
import { ScoreCardsComponent } from './score-cards/score-cards.component';
import { AnswerReviewComponent } from './answer-review/answer-review.component';
import { ResultActionsComponent } from './result-actions/result-actions.component';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule, ResultBannerComponent, ScoreCardsComponent, AnswerReviewComponent, ResultActionsComponent, ConfirmationDialogComponent],
  templateUrl: './quiz-result.component.html'
})
export class QuizResultComponent implements OnInit, OnDestroy {
  resultData: QuizResultData = {
    score: 0,
    correct: 0,
    wrong: 0,
    percentage: 0,
    passed: false,
    totalQuestions: 0
  };

  resultState: QuizResultState = {
    quiz: null,
    quizName: '',
    attempt: null,
    allAttempts: [],
    questions: [],
    reviewMode: false
  };

  resultSettings: QuizResultSettings = {
    passingScore: 50,
    allowRetakes: false,
    showCorrectAnswers: false,
    maxAttempts: 0
  };

  Object = Object; // Add Object constructor for template access
  showRetakeConfirmation = false;
  private destroy$ = new Subject<void>();

  // Getter to transform answers array into selectedAnswers format for template compatibility
  get selectedAnswers(): (string | number | boolean | string[])[] {
    if (!this.resultState.attempt?.answers || !this.resultState.questions) return [];

    return this.resultState.questions.map((question: Question, index: number) => {
      const answer = this.resultState.attempt!.answers.find(a => a.questionId === question.id);
      if (!answer) return '';

      switch (question.type) {
        case 'mcq':
          return answer.selectedAnswer !== undefined ? answer.selectedAnswer : '';
        case 'true-false':
          return answer.selectedAnswer !== undefined ? answer.selectedAnswer : '';
        case 'essay':
          return answer.textAnswer || '';
        case 'fill-blank':
          // For fill-blank, textAnswer might contain comma-separated values
          return answer.textAnswer ? answer.textAnswer.split(',').map((s: string) => s.trim()) : [];
        default:
          return '';
      }
    });
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private answerService: AnswerService,
    private settingsService: SettingsService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    this.resultState.reviewMode = this.route.snapshot.queryParamMap.get('reviewMode') === 'true';
    const attemptId = this.route.snapshot.queryParamMap.get('attemptId');

    // Load settings
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.resultSettings.passingScore = settings.passingScore || 50;
        this.resultSettings.allowRetakes = settings.allowRetakes || false;
        // Respect the showCorrectAnswers setting even in review mode
        this.resultSettings.showCorrectAnswers = settings.showCorrectAnswers || false;
        this.resultSettings.maxAttempts = settings.maxAttempts || 0;
        // Recalculate passed status with new passing score
        this.calculatePassedStatus();
      });

    // Load quiz details first (attempts will be loaded after quiz is loaded)
    if (quizId) {
      this.loadQuiz(quizId, this.resultState.reviewMode, attemptId || undefined);
    }
  }

  loadQuiz(quizId: string, reviewMode?: boolean, attemptId?: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find((q: Quiz) => q.id === quizId);
      if (found) {
        this.resultState.quiz = found;
        this.resultState.quizName = found.title;
        this.resultState.questions = found.questions || [];
        this.resultData.totalQuestions = this.resultState.questions.length;
        // Load attempts after quiz data is available
        this.loadAllAttempts(reviewMode, attemptId);
      }
    });
  }

  loadAllAttempts(reviewMode?: boolean, attemptId?: string) {
    // Get current user
    const currentUser = this.authService.getCurrentUser()?.username || '';

    // Load all attempts for this user
    this.answerService.getAttemptsForUser(currentUser).subscribe(attempts => {
      this.resultState.allAttempts = attempts;

      console.log('All attempts for user:', attempts);
      console.log('Current quiz ID:', this.resultState.quiz?.id);

      let latestAttempt: QuizAttempt | undefined;

      if (reviewMode && attemptId) {
        // In review mode, find the specific attempt by ID
        latestAttempt = this.resultState.allAttempts.find((attempt: QuizAttempt) => attempt.id === attemptId);
        console.log('Review mode - Found specific attempt:', latestAttempt);
      } else {
        // Normal mode - find the most recent attempt for this quiz
        latestAttempt = this.resultState.allAttempts
          .filter((attempt: QuizAttempt) => this.resultState.quiz && attempt.quizId === this.resultState.quiz.id)
          .sort((a: QuizAttempt, b: QuizAttempt) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())[0];
        console.log('Normal mode - Latest attempt:', latestAttempt);
      }

      console.log('Filtered attempts for this quiz:', this.resultState.allAttempts.filter((attempt: QuizAttempt) => this.resultState.quiz && attempt.quizId === this.resultState.quiz.id));
      console.log('Latest attempt:', latestAttempt);

      if (latestAttempt) {
        this.resultState.attempt = latestAttempt;
        // Use the QuizAttempt data
        this.resultData.score = Math.round(latestAttempt.percentage);
        this.resultData.correct = latestAttempt.totalScore;
        this.resultData.wrong = latestAttempt.maxScore - latestAttempt.totalScore;
        this.resultData.totalQuestions = this.resultState.questions.length || latestAttempt.answers.length;
        this.resultData.percentage = latestAttempt.percentage;
        // Use saved status or calculate based on current passing score
        this.resultData.passed = latestAttempt.percentage >= this.resultSettings.passingScore;

        console.log('Result Page - Latest Attempt:', {
          attempt: latestAttempt,
          score: this.resultData.score,
          correct: this.resultData.correct,
          wrong: this.resultData.wrong,
          totalQuestions: this.resultData.totalQuestions,
          passingScore: this.resultSettings.passingScore,
          passed: this.resultData.passed
        });
      } else {
        console.log('No attempt found for this quiz');
      }
    });
  }

  calculatePassedStatus(): void {
    this.resultData.passed = this.resultData.score >= this.resultSettings.passingScore;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  goToQuiz() {
    if (this.resultState.quiz) {
      this.router.navigate(['/quiz', this.resultState.quiz.id]);
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

  // Methods for answer review functionality
  getAnswerClass(questionIndex: number, optionIndex: number, option: string): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return 'bg-gray-50 border-gray-200';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer) return 'bg-gray-50 border-gray-200';

    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;
    const isUserSelected = answer.selectedAnswer === optionIndex;
    const isCorrect = optionIndex === correctAnswer;

    if (isUserSelected && isCorrect) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    } else if (isUserSelected && !isCorrect) {
      return 'bg-red-50 border-red-300 text-red-700';
    } else if (isCorrect) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  }

  getOptionBorderClass(questionIndex: number, optionIndex: number, option: string): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return 'border-gray-300';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer) return 'border-gray-300';

    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;
    const isUserSelected = answer.selectedAnswer === optionIndex;
    const isCorrect = optionIndex === correctAnswer;

    if (isUserSelected && isCorrect) {
      return 'border-emerald-500 bg-emerald-50';
    } else if (isUserSelected && !isCorrect) {
      return 'border-red-500 bg-red-50';
    } else if (isCorrect) {
      return 'border-emerald-500 bg-emerald-50';
    } else {
      return 'border-gray-300';
    }
  }

  getOptionIcon(questionIndex: number, optionIndex: number, option: string): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return '';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer) return '';

    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;
    const isUserSelected = answer.selectedAnswer === optionIndex;
    const isCorrect = optionIndex === correctAnswer;

    if (isUserSelected && isCorrect) {
      return 'correct';
    } else if (isUserSelected && !isCorrect) {
      return 'incorrect';
    } else if (isCorrect) {
      return 'correct';
    } else {
      return '';
    }
  }

  getTrueFalseClass(questionIndex: number, option: boolean): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return 'bg-gray-50 border-gray-200';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer) return 'bg-gray-50 border-gray-200';

    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;
    const isUserSelected = answer.selectedAnswer === option;
    const isCorrect = correctAnswer === option;

    if (isUserSelected && isCorrect) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    } else if (isUserSelected && !isCorrect) {
      return 'bg-red-50 border-red-300 text-red-700';
    } else if (isCorrect) {
      return 'bg-emerald-50 border-emerald-300 text-emerald-700';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  }

  getTrueFalseIcon(questionIndex: number, option: boolean): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return '';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer) return '';

    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;
    const isUserSelected = answer.selectedAnswer === option;
    const isCorrect = correctAnswer === option;

    if (isUserSelected && isCorrect) {
      return 'correct';
    } else if (isUserSelected && !isCorrect) {
      return 'incorrect';
    } else if (isCorrect) {
      return 'correct';
    } else {
      return '';
    }
  }

  getBlankClass(questionIndex: number, blankIndex: number): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return 'border-gray-200';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer || !answer.textAnswer) return 'border-gray-200';

    // For fill-blank questions, textAnswer might contain the answer
    const userAnswer = answer.textAnswer;
    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;

    if (!userAnswer || !correctAnswer) return 'border-gray-200';

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();

    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  }

  getBlankIcon(questionIndex: number, blankIndex: number): string {
    if (!this.resultState.attempt?.answers || !this.resultState.questions[questionIndex]) return '';

    const answer = this.resultState.attempt.answers.find((a: Answer) => a.questionId === this.resultState.questions[questionIndex].id);
    if (!answer || !answer.textAnswer) return '';

    const userAnswer = answer.textAnswer;
    const correctAnswer = this.resultState.questions[questionIndex].correctAnswer;

    if (!userAnswer || !correctAnswer) return '';

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toString().toLowerCase().trim();

    return isCorrect ? 'correct' : 'incorrect';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canRetakeQuiz(): boolean {
    if (!this.resultSettings.allowRetakes || !this.resultState.quiz) return false;

    if (this.resultSettings.maxAttempts === 0) return true; // Unlimited attempts

    const quizAttempts = this.resultState.allAttempts.filter((attempt: QuizAttempt) => attempt.quizId === this.resultState.quiz!.id);
    return quizAttempts.length < this.resultSettings.maxAttempts;
  }

  retakeQuiz(): void {
    if (this.canRetakeQuiz() && this.resultState.quiz) {
      this.showRetakeConfirmation = true;
    }
  }

  confirmRetakeQuiz(): void {
    if (this.resultState.quiz) {
      this.router.navigate(['/quiz', this.resultState.quiz.id]);
    }
  }

  cancelRetakeQuiz(): void {
    this.showRetakeConfirmation = false;
  }

  // Helper method to safely access fill-blank answers
  getFillBlankAnswer(questionIndex: number, blankIndex: number): string {
    const answer = this.selectedAnswers[questionIndex];
    if (Array.isArray(answer) && answer[blankIndex] !== undefined) {
      return answer[blankIndex];
    }
    return 'No answer';
  }
}
