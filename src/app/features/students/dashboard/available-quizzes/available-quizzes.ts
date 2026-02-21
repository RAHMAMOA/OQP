import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Quiz } from '../../../../core/models/quiz';
import { PlatformSettings } from '../../../../core/models/settings';
import { QuizAttempt } from '../../../../core/models/answer';
import { User } from '../../../../core/models/user';

@Component({
  selector: 'app-available-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './available-quizzes.html',
  styleUrl: './available-quizzes.css',
})
export class AvailableQuizzes {
  @Input() quizzes: Quiz[] | null = [];
  @Input() settings: PlatformSettings = {
    siteName: '',
    welcomeMessage: '',
    allowRetakes: true,
    showCorrectAnswers: true
  };
  @Input() attempts: QuizAttempt[] = [];
  @Input() currentUser: User | null = null;

  hasUserTakenQuiz(quizId: string): boolean {
    if (!this.currentUser) return false;

    return this.attempts.some(attempt =>
      this.currentUser && (attempt.userId === this.currentUser.username || (attempt as any).user === this.currentUser.username) &&
      (attempt as any).quizId === quizId
    );
  }

  getQuizButtonState(quizId: string) {
    const hasTaken = this.hasUserTakenQuiz(quizId);
    const canRetake = this.settings?.allowRetakes !== false; // Default to true if undefined

    return {
      isLocked: hasTaken && !canRetake,
      canTake: !hasTaken || canRetake,
      showCompleted: hasTaken && !canRetake
    };
  }

  getResultFlagColor(quizId: string): string {
    const hasTaken = this.hasUserTakenQuiz(quizId);
    const showResults = this.settings?.showCorrectAnswers !== false; // Default to true if undefined

    if (!hasTaken) return '';
    return showResults ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600';
  }
}

