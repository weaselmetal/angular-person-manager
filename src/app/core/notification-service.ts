import { Injectable, signal } from '@angular/core';

/**
 * This notification kind will be added to the element's css class!
 */
export type NotificationKind = 'success' | 'warning' | 'error'; 

export interface AppNotification {
  id: number;
  text: string;
  kind: NotificationKind;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {

  // to identify a notification
  private messageId = 0;

  // using a simple array here because iterating over it with @for
  // is super easy
  messages = signal<AppNotification[]>([]);

  private messageFactory(text: string, kind: NotificationKind): AppNotification {
    return { id: ++this.messageId, text: text, kind: kind };
  }

  private addMessage(message: AppNotification) {
    // using the spread operator to add a new message
    this.messages.update(old => [...old, message]);
  }

  showSuccess(text: string) {
    const m = this.messageFactory(text, 'success');
    this.addMessage(m);

    // auto clear after success message after 5s
    setTimeout(() => { this.remove(m); }, 15000);
  }

  showWarning(text: string) {
    const m = this.messageFactory(text, 'warning');
    this.addMessage(m);
  }

  showError(text: string) {
    const m = this.messageFactory(text, 'error');
    this.addMessage(m);
  }

  remove(message: AppNotification) {
    // only keep the messages with a different id
    this.messages.update(old => old.filter(i => i.id !== message.id));
  }
}
