import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StudentStats {
  username: string;
  email: string;
  quizzesTaken: number;
  avgScore: number;
  passRate: number;
  joined: string;
}

@Component({
  selector: 'app-student-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-stats.component.html',
  styleUrls: ['./student-stats.component.css']
})
export class StudentStatsComponent {
  @Input() topPerformer: StudentStats | null = null;
  @Input() mostActive: StudentStats | null = null;
  @Input() overallPassRate: number = 0;
}
