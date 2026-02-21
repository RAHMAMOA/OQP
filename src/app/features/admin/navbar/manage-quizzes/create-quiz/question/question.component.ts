import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question, QuestionType } from '../../../../../../core/models/question';

@Component({
  selector: 'app-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './question.component.html',
  styleUrl: './question.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuestionComponent implements OnInit {
  @Input() question!: Question;
  @Input() questionIndex!: number;
  @Output() questionChange = new EventEmitter<Question>();
  @Output() remove = new EventEmitter<number>();

  ngOnInit() {
    console.log('QuestionComponent received question:', this.question);
  }


  onQuestionChange() {
    this.questionChange.emit(this.question);
  }

  onRemove() {
    this.remove.emit(this.questionIndex);
  }

  addOption() {
    if (this.question.type === 'mcq' && this.question.options) {
      // Create a new array to avoid reference issues
      this.question.options = [...this.question.options, ''];
      this.onQuestionChange();
    }
  }

  removeOption(index: number) {
    if (this.question.options) {
      // Create a new array to avoid reference issues
      this.question.options = this.question.options.filter((_, i) => i !== index);
      this.onQuestionChange();
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onOptionChange(index: number, value: string) {
    if (this.question.options) {
      // Update the specific option directly without recreating the array
      this.question.options[index] = value;
      // Don't trigger change detection immediately - let user finish typing
    }
  }

  onOptionBlur() {
    // Only trigger change detection when user leaves the input field
    this.onQuestionChange();
  }

  getQuestionTypeLabel(): string {
    switch (this.question.type) {
      case 'mcq': return 'Multiple Choice';
      case 'true-false': return 'True / False';
      case 'fill-blank': return 'Fill in the Blank';
      case 'essay': return 'Essay';
      default: return this.question.type;
    }
  }
}
