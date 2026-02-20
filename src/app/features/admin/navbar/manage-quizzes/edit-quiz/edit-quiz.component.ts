import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../../../../core/services/quiz.service';
import { Quiz } from '../../../../../core/models/quiz';
import { Question, QuestionType } from '../../../../../core/models/question';

@Component({
  selector: 'app-edit-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
  ) {}

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

    // Include questions in the update
    const quizWithQuestions = {
      ...updatedQuiz,
      questions: this.questions
    } as any;

    console.log('Updating Quiz:', quizWithQuestions);
    this.quizService.updateQuiz(updatedQuiz);
    this.router.navigate(['/admin/quizzes']);
  }

  cancel() {
    this.router.navigate(['/admin/quizzes']);
  }
}
