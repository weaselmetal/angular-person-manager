import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AppNotification, NotificationService } from '../notification-service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class='toast-container'>
    @for (m of notificationService.messages(); track m.id) {
      <div class="toast"
        [ngClass]="m.kind"
        [class.closing]="closingIds.has(m.id)"
        (click)="closeToast(m)"
        (contextmenu)="closeToastDiscouraged(m, $event)">
        {{ m.text }}
      </div>
    }
  </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      z-index: 9999;
      display: flex;
      flex-direction: column; 
      gap: 10px;
      pointer-events: none;
    }

    .toast {
      color: white;
      background-color: #AAA;
      padding: 12px 24px;
      border-radius: 4px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      animation: slideIn 0.3s ease-out;
      transition: all 0.3s ease-in-out;
      max-height: 100px;
      opacity: 1;
      overflow: hidden;
      pointer-events: auto;
    }

    .toast.error {
      background-color: #C00;
    }

    .toast.warning {
      background-color: rgb(233, 159, 0);
    }

    .toast.success {
      background-color: rgb(16, 138, 0);
    }

    .toast.closing {
      opacity: 0;
      max-height: 0;
      padding-top: 0;
      padding-bottom: 0;
      margin-bottom: 0;
      border: 0;
    }

    @keyframes slideIn {
      from { transform: translateY(100%); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `]
})
export class Toast {
  notificationService = inject(NotificationService);

  // toast that were clicked and will be removed
  closingIds = new Set<number>();
  
  closeToast(toast: AppNotification) {
    this.closingIds.add(toast.id);
    setTimeout(() => {
      this.notificationService.remove(toast);
      this.closingIds.delete(toast.id);
    }, 300);
  }
  
  closeToastDiscouraged(toast: AppNotification, event: MouseEvent) {
    event.preventDefault(); // avoid the context menu!

    // Disclaimer: Touching the DOM directly in TS is frowned upon!
    
    // Reason 1: Loss of state knowledge
    // TS doesn't remember the changes on the manipulated element / DOM.
    // In Angular, the DOM should always be a projection of the state, not the other way around.
    
    // Reason 2: SSR / Security, testibility
    // This following crashes on Server-Side Rendering (SSR) because 'HTMLElement' doesn't exist there.
    // Plus, direct DOM access bypasses Angular's security sanitization (XSS protection).

    // The only upside: we save a few lines of code (no Set needed).
    // Verdict: DON'T DO IT (unless you have a very specific reason and know the risks).

    const clickedElement = event.currentTarget as HTMLElement;
    clickedElement.classList.add('closing');
    setTimeout(() => {
      this.notificationService.remove(toast);
    }, 300);
  }
}