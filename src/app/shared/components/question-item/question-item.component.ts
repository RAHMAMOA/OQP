import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-question-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './question-item.component.html',
    styleUrl: './question-item.component.css'
})
export class QuestionItemComponent {
    @Input() questionNumber: number = 0;
    @Input() questionText: string = '';
    @Input() options: string[] = [];
    @Input() selectedOption: string | null = null;
    @Output() optionSelected = new EventEmitter<string>();

    selectOption(option: string) {
        this.optionSelected.emit(option);
    }
}
