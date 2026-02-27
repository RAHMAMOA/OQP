import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-actions.component.html',
  styleUrl: './result-actions.component.css'
})
export class ResultActionsComponent {
  @Input() reviewMode!: boolean;
  @Input() canRetakeQuiz!: boolean;
  @Output() goToDashboard = new EventEmitter<void>();
  @Output() retakeQuiz = new EventEmitter<void>();

  onGoToDashboard() {
    this.goToDashboard.emit();
  }

  onRetakeQuiz() {
    if (this.canRetakeQuiz) {
      this.retakeQuiz.emit();
    } else {
      alert('Quiz retakes are not allowed. You have reached the maximum number of attempts or retakes are disabled by the administrator.');
    }
  }
}
