import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { Quiz } from '../../../../../core/models/quiz';
import { Question, QuestionType } from '../../../../../core/models/question';
import { QuizService } from '../../../../../core/services/quiz.service';
import { QuestionService } from '../../../../../core/services/question.service';
import { QuestionComponent } from './question/question.component';


@Component({
    selector: 'app-create-quiz',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, QuestionComponent],
    templateUrl: './create-quiz.component.html',
})
export class CreateQuizComponent {
    quizForm!: FormGroup;
    currentQuiz: Quiz | null = null;
    isDropdownOpen = false;
    isSaving = false;
    validationErrors: string[] = [];

    get questions(): Question[] {
        return this.currentQuiz?.questions || [];
    }

    constructor(
        private router: Router,
        private quizService: QuizService,
        private questionService: QuestionService,
        private fb: FormBuilder
    ) {
        this.initializeForm();
    }

    private initializeForm() {
        this.quizForm = this.fb.group({
            title: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            timeLimit: [null, [Validators.required, Validators.min(1), Validators.max(180)]]
        });
    }

    get titleControl() {
        return this.quizForm.get('title');
    }

    get descriptionControl() {
        return this.quizForm.get('description');
    }

    get timeLimitControl() {
        return this.quizForm.get('timeLimit');
    }

    debugLog(message: string) {
        console.log('Debug:', message);
    }

    async addQuestion(type: QuestionType) {
        this.isDropdownOpen = false;
        this.validationErrors = [];

        // Validate form before adding questions
        if (this.quizForm.invalid) {
            this.getValidationErrors();
            return;
        }

        // Create or get current quiz
        if (!this.currentQuiz) {
            const formValues = this.quizForm.value;
            this.currentQuiz = this.quizService.createQuiz(
                formValues.title,
                formValues.description,
                formValues.timeLimit || 0
            );
        }

        const updatedQuiz = this.quizService.addQuestionToQuiz(this.currentQuiz.id, type);
        if (updatedQuiz) {
            this.currentQuiz = updatedQuiz;
        }
    }

    private getValidationErrors() {
        this.validationErrors = [];

        if (this.titleControl?.errors?.['required']) {
            this.validationErrors.push('Quiz title is required');
        }
        if (this.titleControl?.errors?.['minlength']) {
            this.validationErrors.push('Quiz title must be at least 3 characters long');
        }

        if (this.descriptionControl?.errors?.['required']) {
            this.validationErrors.push('Quiz description is required');
        }
        if (this.descriptionControl?.errors?.['minlength']) {
            this.validationErrors.push('Quiz description must be at least 10 characters long');
        }

        if (this.timeLimitControl?.errors?.['required']) {
            this.validationErrors.push('Time limit is required');
        }
        if (this.timeLimitControl?.errors?.['min']) {
            this.validationErrors.push('Time limit must be at least 1 minute');
        }
        if (this.timeLimitControl?.errors?.['max']) {
            this.validationErrors.push('Time limit cannot exceed 180 minutes');
        }
    }

    removeQuestion(index: number) {
        if (this.currentQuiz && this.currentQuiz.questions && this.currentQuiz.questions[index]) {
            const questionId = this.currentQuiz.questions[index].id;
            const updatedQuiz = this.quizService.removeQuestionFromQuiz(this.currentQuiz.id, questionId);
            if (updatedQuiz) {
                this.currentQuiz = updatedQuiz;
            }
        }
    }

    updateQuestion(index: number, updatedQuestion: Question) {
        if (this.currentQuiz && this.currentQuiz.questions && this.currentQuiz.questions[index]) {
            const questionId = this.currentQuiz.questions[index].id;
            const updatedQuiz = this.quizService.updateQuestionInQuiz(this.currentQuiz.id, questionId, updatedQuestion);
            if (updatedQuiz) {
                this.currentQuiz = updatedQuiz;
            }
        }
    }

    async saveQuiz() {
        this.validationErrors = [];
        this.isSaving = true;

        try {
            // Validate form first
            if (this.quizForm.invalid) {
                this.getValidationErrors();
                this.isSaving = false;
                return;
            }

            // Check if quiz exists
            if (!this.currentQuiz) {
                this.validationErrors.push('Please add at least one question to the quiz.');
                this.isSaving = false;
                return;
            }

            // Check if quiz has questions
            if (!this.currentQuiz.questions || this.currentQuiz.questions.length === 0) {
                this.validationErrors.push('Quiz must have at least one question.');
                this.isSaving = false;
                return;
            }

            // Validate all questions have content
            const questionErrors = this.validateQuestions();
            if (questionErrors.length > 0) {
                this.validationErrors.push(...questionErrors);
                this.isSaving = false;
                return;
            }

            // Validate quiz before saving
            const validation = this.quizService.validateQuiz(this.currentQuiz);
            if (!validation.isValid) {
                this.validationErrors.push(...validation.errors);
                this.isSaving = false;
                return;
            }

            // All validations passed - save the quiz
            this.quizService.updateQuiz(this.currentQuiz);
            this.router.navigate(['/admin/quizzes']);
        } finally {
            this.isSaving = false;
        }
    }

    private validateQuestions(): string[] {
        const errors: string[] = [];

        this.currentQuiz?.questions?.forEach((question, index) => {
            const questionNumber = index + 1;

            // Check if question has text
            if (!question.text || question.text.trim().length === 0) {
                errors.push(`Question ${questionNumber}: Question text is required.`);
            }

            // Check MCQ questions have options and correct answer
            if (question.type === 'mcq') {
                if (!question.options || question.options.length === 0) {
                    errors.push(`Question ${questionNumber}: Multiple choice questions must have options.`);
                } else {
                    // Check if all options have content
                    const emptyOptions = question.options.filter((opt, optIndex) =>
                        !opt || opt.trim().length === 0
                    );
                    if (emptyOptions.length > 0) {
                        errors.push(`Question ${questionNumber}: All multiple choice options must have content.`);
                    }
                }

                if (question.correctAnswer === undefined || question.correctAnswer === null) {
                    errors.push(`Question ${questionNumber}: Multiple choice questions must have a correct answer selected.`);
                }
            }

            // Check True/False questions have correct answer
            if (question.type === 'true-false') {
                if (question.correctAnswer === undefined || question.correctAnswer === null) {
                    errors.push(`Question ${questionNumber}: True/False questions must have a correct answer selected.`);
                }
            }
        });

        return errors;
    }
}
