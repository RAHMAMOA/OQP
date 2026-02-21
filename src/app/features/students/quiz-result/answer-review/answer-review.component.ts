import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Question } from '../../../../core/models/question';

@Component({
  selector: 'app-answer-review',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer-review.component.html',
  styleUrl: './answer-review.component.css'
})
export class AnswerReviewComponent {
  @Input() questions!: Question[];
  @Input() selectedAnswers!: (string | number | boolean | string[])[];
  @Input() showCorrectAnswers!: boolean;

  Object = Object; // Add Object constructor for template access

  getAnswerClass(questionIndex: number, optionIndex: number): string {
    const answer = this.selectedAnswers[questionIndex];
    const question = this.questions[questionIndex];
    if (!question) return 'bg-gray-50 border-gray-200';

    const correctAnswer = question.correctAnswer;
    const isUserSelected = answer === optionIndex;
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

  getTrueFalseClass(questionIndex: number, option: boolean): string {
    const answer = this.selectedAnswers[questionIndex];
    const question = this.questions[questionIndex];
    if (!question) return 'bg-gray-50 border-gray-200';

    const correctAnswer = question.correctAnswer;
    const isUserSelected = answer === option;
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
    const answer = this.selectedAnswers[questionIndex];
    const question = this.questions[questionIndex];
    if (!question) return '';

    const correctAnswer = question.correctAnswer;
    const isUserSelected = answer === option;
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

  getOptionIcon(questionIndex: number, optionIndex: number): string {
    const answer = this.selectedAnswers[questionIndex];
    const question = this.questions[questionIndex];
    if (!question) return '';

    const correctAnswer = question.correctAnswer;
    const isUserSelected = answer === optionIndex;
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
}
