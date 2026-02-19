import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-students',
  imports: [CommonModule],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class Students {
  students: {
    username: string;
    email: string;
    quizzesTaken: number;
    avgScore: number;
    passRate: number;
    joined: string;
  }[] = [];

  get topPerformer() {
    if (this.students.length === 0) return null;
    return this.students.reduce((top, s) => s.avgScore > top.avgScore ? s : top, this.students[0]);
  }

  get mostActive() {
    if (this.students.length === 0) return null;
    return this.students.reduce((top, s) => s.quizzesTaken > top.quizzesTaken ? s : top, this.students[0]);
  }

  get overallPassRate(): number {
    if (this.students.length === 0) return 0;
    const total = this.students.reduce((sum, s) => sum + s.passRate, 0);
    return Math.round(total / this.students.length);
  }

  viewStudentDetails(student: any): void {
    console.log('View details for:', student);
    // TODO: implement navigation or modal to show student details
  }
}
