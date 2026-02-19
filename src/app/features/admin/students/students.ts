import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user.service';
import { AttemptService } from '../../../core/services/result.service';

@Component({
  selector: 'app-students',
  imports: [CommonModule],
  templateUrl: './students.html',
})
export class Students implements OnInit {
  students: {
    username: string;
    email: string;
    quizzesTaken: number;
    avgScore: number;
    passRate: number;
    joined: string;
  }[] = [];

  constructor(
    private userService: UserService,
    private attemptService: AttemptService
  ) { }

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

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    const users = this.userService.getUsers();
    const students = users.filter((user: any) => user.role === 'student');

    this.students = students.map((student: any) => {
      const stats = this.attemptService.getUserStats(student.username);
      return {
        username: student.username,
        email: student.email,
        quizzesTaken: stats.quizzesTaken,
        avgScore: stats.avgScore,
        passRate: stats.passRate,
        joined: 'Recently' // You might want to add a createdAt field to User model
      };
    });
  }

  viewStudentDetails(student: any): void {
    console.log('View details for:', student);
    // TODO: implement navigation or modal to show student details
  }
}
