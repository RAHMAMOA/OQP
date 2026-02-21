import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Quiz } from '../../../../core/models/quiz';

@Component({
  selector: 'app-quiz-navigation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quiz-navigation.component.html',
  styleUrl: './quiz-navigation.component.css'
})
export class QuizNavigationComponent {
  @Input() quiz!: Quiz | null;
  @Input() currentQuestionIndex!: number;
  @Output() nextQuestion = new EventEmitter<void>();
  @Output() submitQuiz = new EventEmitter<void>();
  @Output() exitQuiz = new EventEmitter<void>();

  isLastQuestion(): boolean {
    return this.currentQuestionIndex === (this.quiz?.questionCount || 0) - 1;
  }

  onNextQuestion() {
    this.nextQuestion.emit();
  }

  onSubmitQuiz() {
    this.submitQuiz.emit();
  }

  onExitQuiz() {
    this.exitQuiz.emit();
  }
}
