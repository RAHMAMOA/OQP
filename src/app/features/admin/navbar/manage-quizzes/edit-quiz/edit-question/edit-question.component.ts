import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Question } from '../../../../../../core/models/question';

@Component({
  selector: 'app-edit-question',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-question.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditQuestionComponent {
  @Input() question!: Question;
  @Input() questionIndex!: number;
  @Output() questionChange = new EventEmitter<Question>();
  @Output() remove = new EventEmitter<number>();

  String = String; // Add String constructor for template access

  onQuestionChange() {
    this.questionChange.emit(this.question);
  }

  onRemove() {
    this.remove.emit(this.questionIndex);
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

  trackByIndex(index: number): number {
    return index;
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
}
