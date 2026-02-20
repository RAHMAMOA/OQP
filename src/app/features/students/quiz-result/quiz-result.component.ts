import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AttemptService } from '../../../core/services/result.service';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { Attempt } from '../../../core/models/attempet';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-quiz-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-result.component.html'
})
export class QuizResultComponent implements OnInit, OnDestroy {
  quiz: any = null;
  score = 0;
  correct = 0;
  wrong = 0;
  percentage = 0;
  passed = false;
  quizName = '';
  attempt: Attempt | null = null;
  allAttempts: Attempt[] = [];
  questions: any[] = [];
  totalQuestions = 0;
  Object = Object; // Add Object constructor for template access
  passingScore = 50;
  allowRetakes = false;
  showCorrectAnswers = false;
  maxAttempts = 0;
  reviewMode = false;
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
    this.reviewMode = this.route.snapshot.queryParamMap.get('reviewMode') === 'true';
    const attemptId = this.route.snapshot.queryParamMap.get('attemptId');

    // Load settings
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.passingScore = settings.passingScore || 50;
        this.allowRetakes = settings.allowRetakes || false;
        // Respect the showCorrectAnswers setting even in review mode
        this.showCorrectAnswers = settings.showCorrectAnswers || false;
        this.maxAttempts = settings.maxAttempts || 0;
        // Recalculate passed status with new passing score
        this.calculatePassedStatus();
      });

    // Load quiz details first (attempts will be loaded after quiz is loaded)
    if (quizId) {
      this.loadQuiz(quizId, this.reviewMode, attemptId || undefined);
    }
  }

  loadQuiz(quizId: string, reviewMode?: boolean, attemptId?: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      if (found) {
        this.quiz = found;
        this.quizName = found.title;
        this.questions = found.questions || [];
        this.totalQuestions = this.questions.length;
        // Load attempts after quiz data is available
        this.loadAllAttempts(reviewMode, attemptId);
      }
    });
  }

  loadAllAttempts(reviewMode?: boolean, attemptId?: string) {
    // Get current user (simplified - should come from auth service)
    const currentUser = this.authService.getCurrentUser()?.username || '';

    // Load all attempts for this user
    const attempts = this.attemptService.getAttemptsByUser(currentUser);
    this.allAttempts = attempts;

    console.log('All attempts for user:', attempts);
    console.log('Current quiz ID:', this.quiz?.id);

    let latestAttempt: Attempt | undefined;

    if (reviewMode && attemptId) {
      // In review mode, find the specific attempt by ID
      latestAttempt = this.allAttempts.find(attempt => attempt.id === attemptId);
      console.log('Review mode - Found specific attempt:', latestAttempt);
    } else {
      // Normal mode - find the most recent attempt for this quiz
      latestAttempt = this.allAttempts
        .filter(attempt => this.quiz && attempt.quizId === this.quiz.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      console.log('Normal mode - Latest attempt:', latestAttempt);
    }

    console.log('Filtered attempts for this quiz:', this.allAttempts.filter(attempt => this.quiz && attempt.quizId === this.quiz.id));
    console.log('Latest attempt:', latestAttempt);

    if (latestAttempt) {
      this.attempt = latestAttempt;
      // Use the saved score data
      this.score = parseInt(latestAttempt.score) || 0;
      this.correct = latestAttempt.correctAnswers || 0;
      this.wrong = latestAttempt.wrongAnswers || 0;
      this.totalQuestions = latestAttempt.totalQuestions || this.questions.length;
      this.percentage = this.score;
      // Use saved status or calculate based on current passing score
      this.passed = latestAttempt.status === 'Passed' || this.score >= this.passingScore;

      console.log('Result Page - Latest Attempt:', {
        attempt: latestAttempt,
        score: this.score,
        correct: this.correct,
        wrong: this.wrong,
        totalQuestions: this.totalQuestions,
        passingScore: this.passingScore,
        passed: this.passed,
        savedStatus: latestAttempt.status
      });
    } else {
      console.log('No attempt found for this quiz');
    }
  }

  calculateScoreFromAnswers() {
    if (!this.attempt?.selectedAnswers || !this.questions.length) {
      return;
    }

    let correctCount = 0;
    let totalQuestions = this.questions.length;

    this.questions.forEach((question: any, index: number) => {
      const userAnswer = this.attempt?.selectedAnswers?.[index];

      if (question.type === 'mcq' || question.type === 'true-false') {
        // Handle both string and number correct answers
        const isCorrect = userAnswer === question.correctAnswer ||
          parseInt(userAnswer) === parseInt(question.correctAnswer) ||
          userAnswer?.toString() === question.correctAnswer?.toString();

        if (isCorrect) {
          correctCount++;
        }
      } else if (question.type === 'fill-blank') {
        const correctAnswers = question.correctAnswers || [];
        let allBlanksCorrect = true;

        if (Array.isArray(userAnswer) && correctAnswers.length > 0) {
          userAnswer.forEach((answer: string, blankIndex: number) => {
            const correctAnswer = correctAnswers[blankIndex];
            if (answer?.toLowerCase().trim() !== correctAnswer?.toLowerCase().trim()) {
              allBlanksCorrect = false;
            }
          });

          if (allBlanksCorrect) {
            correctCount++;
          }
        } else {
          allBlanksCorrect = false;
        }
      }
      // Essay questions are not auto-graded
    });

    this.correct = correctCount;
    this.wrong = totalQuestions - correctCount;
    this.totalQuestions = totalQuestions;
    this.score = Math.round((correctCount / totalQuestions) * 100);
    this.percentage = this.score;
    this.calculatePassedStatus();
  }

  calculatePassedStatus(): void {
    this.passed = this.score >= this.passingScore;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToHistory() {
    this.router.navigate(['/history']);
  }

  goToQuiz() {
    if (this.quiz) {
      this.router.navigate(['/quiz', this.quiz.id]);
    }
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

  // Methods for answer review functionality
  getAnswerClass(questionIndex: number, optionIndex: number, option: string): string {
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return 'bg-gray-50 border-gray-200';

    const selectedAnswer = this.attempt.selectedAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswer;
    const isUserSelected = selectedAnswer === optionIndex;
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
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return 'border-gray-300';

    const selectedAnswer = this.attempt.selectedAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswer;
    const isUserSelected = selectedAnswer === optionIndex;
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
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return '';

    const selectedAnswer = this.attempt.selectedAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswer;
    const isUserSelected = selectedAnswer === optionIndex;
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
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return 'bg-gray-50 border-gray-200';

    const selectedAnswer = this.attempt.selectedAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswer;
    const isUserSelected = selectedAnswer === option;
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
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return '';

    const selectedAnswer = this.attempt.selectedAnswers[questionIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswer;
    const isUserSelected = selectedAnswer === option;
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
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return 'border-gray-200';

    const userAnswer = this.attempt.selectedAnswers[questionIndex]?.[blankIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswers?.[blankIndex];

    if (!userAnswer || !correctAnswer) return 'border-gray-200';

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    if (isCorrect) {
      return 'border-emerald-500 bg-emerald-50';
    } else {
      return 'border-red-500 bg-red-50';
    }
  }

  getBlankIcon(questionIndex: number, blankIndex: number): string {
    if (!this.attempt?.selectedAnswers || !this.questions[questionIndex]) return '';

    const userAnswer = this.attempt.selectedAnswers[questionIndex]?.[blankIndex];
    const correctAnswer = this.questions[questionIndex].correctAnswers?.[blankIndex];

    if (!userAnswer || !correctAnswer) return '';

    const isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();

    return isCorrect ? 'correct' : 'incorrect';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  canRetakeQuiz(): boolean {
    if (!this.allowRetakes || !this.quiz) return false;

    if (this.maxAttempts === 0) return true; // Unlimited attempts

    const quizAttempts = this.allAttempts.filter(attempt => attempt.quizId === this.quiz.id);
    return quizAttempts.length < this.maxAttempts;
  }
}
