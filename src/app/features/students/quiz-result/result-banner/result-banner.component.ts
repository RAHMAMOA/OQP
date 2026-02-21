import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-result-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-banner.component.html',
  styleUrl: './result-banner.component.css'
})
export class ResultBannerComponent {
  @Input() passed!: boolean;
  @Input() quizName!: string;
  @Input() score!: number;
  @Input() passingScore!: number;

  getBannerClass(): string {
    return this.passed ? 'bg-emerald-500' : 'bg-red-500';
  }

  getBannerTitle(): string {
    return this.passed ? 'Congratulations!' : 'Better Luck Next Time';
  }

  getBannerMessage(): string {
    if (this.passed) {
      return `PASSED - Passing score is ${this.passingScore}%`;
    } else {
      return `X FAILED - Passing score is ${this.passingScore}%`;
    }
  }
}
