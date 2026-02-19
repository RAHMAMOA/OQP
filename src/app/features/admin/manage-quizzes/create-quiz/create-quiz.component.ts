import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Question, QuestionType } from '../../../../core/models/question';

import { QuizService } from '../../../../core/services/quiz.service';

@Component({
    selector: 'app-create-quiz',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './create-quiz.component.html',
})
export class CreateQuizComponent {
    quizTitle = '';
    quizDescription = '';
    quizTime: number | null = null;
    questions: Question[] = [];
    isDropdownOpen = false;

    constructor(
        private router: Router,
        private quizService: QuizService
    ) { }

    addQuestion(type: QuestionType) {
        this.isDropdownOpen = false;
        const newQuestion: Question = {
            id: Date.now().toString(),
            text: '',
            type: type,
            points: 1,
            options: type === 'mcq' ? ['', '', '', ''] : undefined,
            correctAnswer: type === 'true-false' ? true : ''
        };
        this.questions.push(newQuestion);
    }

    removeQuestion(index: number) {
        this.questions.splice(index, 1);
    }

    saveQuiz() {
        if (!this.quizTitle || !this.quizTime) {
            alert('Please fill in the required fields (Title and Time).');
            return;
        }

        const newQuiz: any = {
            id: Date.now().toString(),
            title: this.quizTitle,
            description: this.quizDescription,
            time: this.quizTime,
            questionCount: this.questions.length,
            questions: this.questions
        };

        console.log('Saving Quiz:', newQuiz);
        this.quizService.addQuiz(newQuiz);
        this.router.navigate(['/admin/quizzes']);
    }
}
