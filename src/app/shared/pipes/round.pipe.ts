import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'round', standalone: true })
export class RoundPipe implements PipeTransform {
  transform(value: number | null | undefined): number {
    return value != null ? Math.round(value) : 0;
  }
}
