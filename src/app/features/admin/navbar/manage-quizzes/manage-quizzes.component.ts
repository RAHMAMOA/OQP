import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { QuizService } from '../../../../core/services/quiz.service';

@Component({
  selector: 'app-manage-quizzes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './manage-quizzes.component.html',
  styleUrl: './manage-quizzes.component.css'
})
export class ManageQuizzesComponent {
  quizzes$;

  constructor(private quizService: QuizService) {
    this.quizzes$ = this.quizService.quizzes$;
  }

  deleteQuiz(id: string) {
    if (confirm('Are you sure you want to delete this quiz?')) {
      this.quizService.deleteQuiz(id);
    }
  }
}
