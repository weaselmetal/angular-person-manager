import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../notification-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (notifyService.message()) {
      <div class="toast-container" [ngClass]="notifyService.kind()" (click)="notifyService.clear()">
        {{ notifyService.message() }}
      </div>
    }
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      color: white;
      background-color: #AAA;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      max-width: 200px;
      z-index: 9999;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
    }

    .toast-container.error {
      background-color: #C00;
    }

    .toast-container.warning {
      background-color: rgb(233, 159, 0);
    }

    .toast-container.success {
      background-color: rgb(16, 138, 0);
    }

    @keyframes slideIn {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class Toast {
  notifyService = inject(NotificationService);
}