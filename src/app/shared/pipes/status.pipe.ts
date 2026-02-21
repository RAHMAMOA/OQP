import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'status', standalone: true })
export class StatusPipe implements PipeTransform {
  transform(score: number | string | null | undefined, passingScore: number = 50): string {
    if (score == null) return 'Unknown';

    const numericScore = typeof score === 'string' ? parseFloat(score) : score;

    if (isNaN(numericScore)) return 'Unknown';

    return numericScore >= passingScore ? 'Passed' : 'Failed';
  }
}
