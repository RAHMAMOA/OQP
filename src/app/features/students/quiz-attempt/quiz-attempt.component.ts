import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { QuizService } from '../../../core/services/quiz.service';
import { AnswerService } from '../../../core/services/answer.service';
import { SettingsService } from '../../../core/services/settings.service';
import { AuthService } from '../../../core/services/auth.service';
import { AntiCheatService, SecurityEvent } from '../../../core/services/anti-cheat.service';
import { Quiz } from '../../../core/models/quiz';
import { Question } from '../../../core/models/question';
import { QuizAttempt } from '../../../core/models/answer';
import { Subject, takeUntil } from 'rxjs';
import { QuizHeaderComponent } from './quiz-header/quiz-header.component';
import { QuestionDisplayComponent } from './question-display/question-display.component';
import { QuizNavigationComponent } from './quiz-navigation/quiz-navigation.component';

@Component({
  selector: 'app-quiz-attempt',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, QuizHeaderComponent, QuestionDisplayComponent, QuizNavigationComponent],
  templateUrl: './quiz-attempt.component.html'
})
export class QuizAttemptComponent implements OnInit, OnDestroy {
  quiz: Quiz | null = null;
  currentQuestionIndex = 0;
  currentAttempt: QuizAttempt | null = null;
  timeRemaining = 0;
  timer: any;
  isLoading = true;
  String = String; // Add String constructor for template access
  passingScore = 50;
  questions: Question[] = [];
  totalQuestions = 0;
  selectedAnswers: (number | boolean | string)[] = [];
  private destroy$ = new Subject<void>();
  maxAttempts = 0;
  allowRetakes = false;

  // Security properties
  securityEvents: SecurityEvent[] = [];
  securityWarning = '';
  showSecurityWarning = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService,
    private answerService: AnswerService,
    private settingsService: SettingsService,
    private authService: AuthService,
    private antiCheatService: AntiCheatService
  ) { }

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');

    // Load settings
    this.settingsService.getSettings$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(settings => {
        this.passingScore = settings.passingScore || 50;
        this.maxAttempts = settings.maxAttempts || 0;
        this.allowRetakes = settings.allowRetakes || false;

        // Setup security monitoring with settings
        if (settings.securitySettings) {
          this.antiCheatService.updateSettings(settings.securitySettings);
        }
      });

    // Setup security event monitoring
    this.antiCheatService.getSecurityEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe(events => {
        this.securityEvents = events;

        // Check for auto-submit condition
        const latestEvent = events[events.length - 1];
        if (latestEvent?.details?.autoSubmit) {
          this.handleSecurityViolation('Maximum security violations reached. Quiz will be submitted automatically.');
          this.submitQuiz();
        } else if (events.length > 0) {
          const violationCount = this.antiCheatService.getViolationCount();
          const settings = this.antiCheatService.getCurrentSettings();
          const remaining = settings.maxViolations - violationCount;

          if (remaining > 0) {
            this.handleSecurityViolation(`Security violation detected! ${remaining} more violations will result in automatic submission.`);
          }
        }
      });

    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  loadQuiz(quizId: string) {
    // Check attempt limit first
    if (!this.allowRetakes) {
      alert('Quiz retakes are not allowed by administrator.');
      this.router.navigate(['/dashboard']);
      return;
    }

    if (this.maxAttempts > 0) {
      const currentUser = this.authService.getCurrentUser();
      this.answerService.getAttemptsForUser(currentUser?.username || '').subscribe(attempts => {
        const quizAttempts = attempts.filter(attempt => attempt.quizId === quizId);

        if (quizAttempts.length >= this.maxAttempts) {
          alert(`You have reached the maximum number of attempts (${this.maxAttempts}) for this quiz.`);
          this.router.navigate(['/dashboard']);
          return;
        }

        // If we get here, we can proceed with loading the quiz
        this.proceedWithQuizLoad(quizId);
      });
    } else {
      // Unlimited attempts, proceed directly
      this.proceedWithQuizLoad(quizId);
    }
  }

  proceedWithQuizLoad(quizId: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      console.log('Quiz loading - Quiz ID:', quizId);
      console.log('Quiz loading - Found quiz:', found);
      console.log('Quiz loading - All quizzes:', quizzes);

      if (found) {
        this.quiz = found;
        this.questions = found.questions || [];
        this.totalQuestions = this.questions.length;
        this.selectedAnswers = new Array(this.totalQuestions).fill(undefined);
        console.log('Quiz loading - Questions:', this.questions);
        console.log('Quiz loading - Question count:', this.totalQuestions);
        this.timeRemaining = found.time * 60; // Convert minutes to seconds

        // Start quiz attempt
        const maxScore = this.questions.reduce((sum, q) => sum + q.points, 0);
        this.currentAttempt = this.answerService.startQuizAttempt(quizId, maxScore);

        // Start security monitoring
        this.antiCheatService.startMonitoring();

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
    if (!this.currentAttempt || !this.questions[questionIndex]) return;

    // Store the selected answer for UI display
    this.selectedAnswers[questionIndex] = answer;

    const question = this.questions[questionIndex];
    let selectedAnswer: string | number | boolean | undefined;
    let textAnswer: string | undefined;

    switch (question.type) {
      case 'mcq':
        selectedAnswer = answer;
        break;
      case 'true-false':
        selectedAnswer = answer;
        break;
      case 'fill-blank':
        textAnswer = answer;
        break;
      case 'essay':
        textAnswer = answer;
        break;
    }

    try {
      this.answerService.addAnswer(question, selectedAnswer, textAnswer);
    } catch (error) {
      console.warn('Cannot add answer:', error);
    }
  }

  onAnswerSelected(event: { questionIndex: number; answer: any }) {
    this.selectAnswer(event.questionIndex, event.answer);
  }

  nextQuestion() {
    if (this.quiz && this.currentQuestionIndex < this.quiz.questionCount - 1) {
      this.currentQuestionIndex++;
    }
  }

  exitQuiz() {
    this.router.navigate(['/dashboard']);
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

  handleSecurityViolation(message: string) {
    this.securityWarning = message;
    this.showSecurityWarning = true;

    // Auto-hide warning after 5 seconds
    setTimeout(() => {
      this.showSecurityWarning = false;
    }, 5000);
  }

  submitQuiz() {
    console.log('Submit quiz called');

    // Debug: Check current attempt before submission
    const currentAttempt = this.answerService.getCurrentAttempt();
    console.log('Current attempt before submission:', currentAttempt);

    // Stop security monitoring
    this.antiCheatService.stopMonitoring();

    if (this.timer) {
      clearInterval(this.timer);
    }

    if (!this.currentAttempt) {
      console.log('No active attempt found in component');
      return;
    }

    // Submit the attempt
    const submittedAttempt = this.answerService.submitQuizAttempt();

    if (submittedAttempt) {
      console.log('Attempt submitted:', submittedAttempt);

      this.router.navigate(['/quiz-result', submittedAttempt.quizId], {
        queryParams: {
          score: submittedAttempt.percentage,
          correct: submittedAttempt.totalScore,
          wrong: submittedAttempt.maxScore - submittedAttempt.totalScore,
          attemptId: submittedAttempt.id
        }
      });
    } else {
      console.log('Failed to submit attempt');
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    // Stop security monitoring
    this.antiCheatService.stopMonitoring();

    this.destroy$.next();
    this.destroy$.complete();
  }
}
