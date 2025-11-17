import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error-state.component.html',
  styleUrl: './error-state.component.scss'
})
export class ErrorStateComponent {
  @Input() icon = 'fas fa-exclamation-triangle';
  @Input() title = 'Oops! Something went wrong';
  @Input() message = 'An error occurred. Please try again.';
  @Input() showRetry = true;
  @Input() retryText = 'Try Again';
  @Output() retry = new EventEmitter<void>();
}
