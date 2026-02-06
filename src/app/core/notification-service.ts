import { Injectable, signal } from '@angular/core';

export type NotificationKind = 'success' | 'warning' | 'error'; 

@Injectable({ providedIn: 'root' })
export class NotificationService {

  private timeoutId: any;

  message = signal<string | null>(null);
  kind = signal<NotificationKind>('success');

  showSuccess(text: string) {
    this.kind.set('success');
    this.message.set(text);

    if (this.timeoutId)
      clearTimeout(this.timeoutId);

    // auto clear after 5s
    this.timeoutId = setTimeout(() => { this.clear(); }, 5000);
  }

  showWarning(text: string) {
    this.kind.set('warning');
    this.message.set(text);
  }

  showError(text: string) {
    this.kind.set('error');
    this.message.set(text);
  }

  clear() {
    this.message.set(null);
  }
}