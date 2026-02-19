import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat {
  label: string;
  value: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  styleUrl: './stats-cards.css',
  templateUrl: './stats-cards.html'
})
export class StatsCardsComponent {
  @Input() stats: Stat[] = [];
}
