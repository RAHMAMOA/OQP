import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate', standalone: true })
export class TruncatePipe implements PipeTransform {
  transform<T>(array: T[] | null | undefined, limit: number): T[] {
    return array ? array.slice(0, limit) : [];
  }
}
