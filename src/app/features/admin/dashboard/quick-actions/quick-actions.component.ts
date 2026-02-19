import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface QuickAction {
  label: string;
  path: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrl: './quick-actions.css',
  templateUrl: './quick-actions.html'
})
export class QuickActionsComponent {
  @Input() actions: QuickAction[] = [];
}
