import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Attempt } from '../../../../../core/models/attempet';

@Component({
  selector: 'app-quiz-history-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz-history-card.component.html',
  styleUrls: ['./quiz-history-card.component.css']
})
export class QuizHistoryCardComponent {
  @Input() attempt!: Attempt;
  @Input() showCorrectAnswers!: boolean;
  @Input() canRetake!: boolean;
  @Output() reviewAnswers = new EventEmitter<void>();

  getStatusClass(status: string): string {
    switch (status) {
      case 'Passed':
        return 'bg-emerald-100 text-emerald-700';
      case 'Failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  onReviewAnswers() {
    this.reviewAnswers.emit();
  }
}
