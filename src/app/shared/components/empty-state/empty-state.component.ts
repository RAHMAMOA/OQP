import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.scss']
})
export class EmptyStateComponent {
  @Input() message: string = 'No data available';
  @Input() icon: string = '';
  @Input() actionText: string = '';
  @Input() actionCallback: () => void = () => {};
}
