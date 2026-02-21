import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../../../core/services/quiz.service';
import { Quiz } from '../../../../../core/models/quiz';
import { Question, QuestionType } from '../../../../../core/models/question';
import { EditQuestionComponent } from './edit-question/edit-question.component';

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EditQuestionComponent],
  templateUrl: './edit-quiz.component.html'
})
export class EditQuizComponent implements OnInit {
  quiz: Quiz | null = null;
  quizTitle = '';
  quizDescription = '';
  quizTime: number | null = null;
  questions: Question[] = [];
  isDropdownOpen = false;
  isLoading = true;
  String = String; // Add String constructor for template access

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) { }

  ngOnInit() {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (quizId) {
      this.loadQuiz(quizId);
    }
  }

  loadQuiz(quizId: string) {
    this.quizService.quizzes$.subscribe(quizzes => {
      const found = quizzes.find(q => q.id === quizId);
      if (found) {
        this.quiz = found;
        this.quizTitle = found.title;
        this.quizDescription = found.description;
        this.quizTime = found.time;
        // Load questions if they exist in the quiz object
        this.questions = (found as any).questions || [];
      }
      this.isLoading = false;
    });
  }

  addQuestion(type: QuestionType) {
    this.isDropdownOpen = false;

    if (!this.quiz) return;

    // Add question using QuizService
    const updatedQuiz = this.quizService.addQuestionToQuiz(this.quiz.id, type);
    if (updatedQuiz) {
      this.quiz = updatedQuiz;
      this.questions = updatedQuiz.questions || [];
    }
  }

  removeQuestion(index: number) {
    if (!this.quiz || !this.questions[index]) return;

    const questionId = this.questions[index].id;
    const updatedQuiz = this.quizService.removeQuestionFromQuiz(this.quiz.id, questionId);
    if (updatedQuiz) {
      this.quiz = updatedQuiz;
      this.questions = updatedQuiz.questions || [];
    }
  }

  updateQuestion(index: number, updatedQuestion: Question) {
    if (!this.quiz || !this.questions[index]) return;

    const questionId = this.questions[index].id;
    const updatedQuiz = this.quizService.updateQuestionInQuiz(this.quiz.id, questionId, updatedQuestion);
    if (updatedQuiz) {
      this.quiz = updatedQuiz;
      this.questions = updatedQuiz.questions || [];
    }
  }

  updateQuiz() {
    if (!this.quiz || !this.quizTitle || !this.quizTime) {
      alert('Please fill in the required fields (Title and Time).');
      return;
    }

    const updatedQuiz: Quiz = {
      ...this.quiz,
      title: this.quizTitle,
      description: this.quizDescription,
      time: this.quizTime,
      questionCount: this.questions.length
    };

    // Update quiz with questions using service
    const result = this.quizService.updateQuizWithQuestions(this.quiz.id, updatedQuiz, this.questions);
    if (result) {
      console.log('Quiz updated successfully');
      this.router.navigate(['/admin/quizzes']);
    }
  }

  cancel() {
    this.router.navigate(['/admin/quizzes']);
  }
}
