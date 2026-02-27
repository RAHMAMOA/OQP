import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../core/models/quiz';

@Component({
  selector: 'app-quiz-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-header.component.html',
  styleUrl: './quiz-header.component.css'
})
export class QuizHeaderComponent {
  @Input() quiz!: Quiz | null;
  @Input() currentQuestionIndex!: number;
  @Input() timeRemaining!: number;
  @Output() exitQuiz = new EventEmitter<void>();

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  onExitQuiz() {
    this.exitQuiz.emit();
  }
}
