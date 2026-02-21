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
  @Output() goToDashboard = new EventEmitter<void>();
  @Output() retakeQuiz = new EventEmitter<void>();

  onGoToDashboard() {
    this.goToDashboard.emit();
  }

  onRetakeQuiz() {
    this.retakeQuiz.emit();
  }
}
