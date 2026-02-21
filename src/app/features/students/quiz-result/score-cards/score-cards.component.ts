import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './score-cards.component.html',
  styleUrl: './score-cards.component.css'
})
export class ScoreCardsComponent {
  @Input() score!: number;
  @Input() correct!: number;
  @Input() wrong!: number;
  @Input() totalQuestions!: number;
  @Input() passed!: boolean;
  @Input() passingScore!: number;
  @Input() showCorrectAnswers!: boolean;

  getBannerMessage(): string {
    if (this.passed) {
      return `PASSED - Passing score is ${this.passingScore}%`;
    } else {
      return `X FAILED - Passing score is ${this.passingScore}%`;
    }
  }
}
