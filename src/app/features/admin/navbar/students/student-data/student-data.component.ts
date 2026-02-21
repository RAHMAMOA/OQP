import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StudentData } from '../../../../../core/models/student-data';

@Component({
  selector: 'app-student-data',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './student-data.component.html',
  styleUrls: ['./student-data.component.css']
})
export class StudentDataComponent {
  @Input() students: StudentData[] = [];
  @Output() viewDetails = new EventEmitter<string>();

  viewStudentDetails(username: string) {
    this.viewDetails.emit(username);
  }
}
