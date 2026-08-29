import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  duration?: number; // ms
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  private notificationIdCounter = 0;

  constructor() {}

  /**
   * Show success notification
   */
  success(message: string, duration = 3000): void {
    this.addNotification('success', message, duration);
  }

  /**
   * Show error notification
   */
  error(message: string, duration = 5000): void {
    this.addNotification('error', message, duration);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration = 4000): void {
    this.addNotification('warning', message, duration);
  }

  /**
   * Show info notification
   */
  info(message: string, duration = 3000): void {
    this.addNotification('info', message, duration);
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
  }

  /**
   * Add notification to the list
   */
  private addNotification(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    duration?: number
  ): void {
    const notification: Notification = {
      id: `notification-${++this.notificationIdCounter}`,
      type,
      message,
      timestamp: new Date(),
      duration,
    };

    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, notification]);

    // Auto remove after duration
    if (duration) {
      setTimeout(() => this.removeNotification(notification.id), duration);
    }
  }

  /**
   * Remove notification by id
   */
  removeNotification(id: string): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next(current.filter((n) => n.id !== id));
  }
}
