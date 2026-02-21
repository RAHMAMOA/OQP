import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../../core/models/question';

@Component({
  selector: 'app-question-display',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question-display.component.html',
  styleUrl: './question-display.component.css'
})
export class QuestionDisplayComponent {
  @Input() question!: Question | null;
  @Input() questionIndex!: number;
  @Input() selectedAnswer!: number | boolean | string | string[] | null;
  @Output() answerSelected = new EventEmitter<{ questionIndex: number; answer: any }>();

  String = String; // Add String constructor for template access

  selectAnswer(answer: any) {
    this.answerSelected.emit({ questionIndex: this.questionIndex, answer });
  }

  isAnswerSelected(optionIndex: number): boolean {
    if (this.question?.type === 'mcq') {
      return this.selectedAnswer === optionIndex;
    }
    if (this.question?.type === 'true-false') {
      return (optionIndex === 0 && this.selectedAnswer === true) ||
        (optionIndex === 1 && this.selectedAnswer === false);
    }
    return false;
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }
}
