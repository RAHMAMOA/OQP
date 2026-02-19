import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-quiz-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './quiz-card.component.html',
    styleUrl: './quiz-card.component.css'
})
export class QuizCardComponent {
    @Input() title: string = '';
    @Input() description: string = '';
    @Input() questionCount: number = 0;
    @Input() category: string = '';
}
