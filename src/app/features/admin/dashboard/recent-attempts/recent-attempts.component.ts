import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Attempt } from '../../../../core/models/attempet';



@Component({
  selector: 'app-recent-attempts',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './recent-attempts.css',
  templateUrl: './recent-attempts.html'
})
export class RecentAttemptsComponent {
  @Input() attempts: Attempt[] = [];
} 
