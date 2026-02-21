import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatCard } from '../../../core/models/stat-card';

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
})
export class StatsCardsComponent {
  @Input() stats: StatCard[] = [];
  @Input() columns: number = 4; // Responsive grid columns (1-4)
  @Input() showTrends: boolean = false; // Whether to show trend indicators

  getTrendIcon(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up':
        return '↑';
      case 'down':
        return '↓';
      case 'neutral':
        return '→';
      default:
        return '';
    }
  }

  getTrendClass(trend: 'up' | 'down' | 'neutral'): string {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      case 'neutral':
        return 'text-gray-500';
      default:
        return '';
    }
  }
}
