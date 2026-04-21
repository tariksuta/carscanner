import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  success(message: string): void {
    // TODO: integrate with spartan sonner when UI components are added
    console.log('[SUCCESS]', message);
  }

  error(message: string): void {
    console.error('[ERROR]', message);
  }

  warning(message: string): void {
    console.warn('[WARNING]', message);
  }

  info(message: string): void {
    console.info('[INFO]', message);
  }
}
