import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationsService } from '../services/notifications.service';
import { SignalRConnectionService } from '../../../core/services/signalr-connection.service';
import { NotificationItem, NotificationSeverity } from '../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="cs-bell-wrap">
      <button type="button" class="cs-icon-btn" aria-label="Obavijesti" (click)="toggleDropdown($event)">
        <lucide-icon name="bell" [size]="16" />
        @if (unreadCount() > 0) {
          <span class="cs-bell-badge">{{ unreadCount() > 9 ? '9+' : unreadCount() }}</span>
        }
      </button>

      @if (isOpen()) {
        <div class="cs-dropdown" (click)="$event.stopPropagation()">
          <header class="cs-dropdown-head">
            <span>Obavijesti</span>
            @if (unreadCount() > 0) {
              <button class="cs-link-btn" (click)="onMarkAllRead()">Označi sve kao pročitano</button>
            }
          </header>

          @if (loading()) {
            <div class="cs-empty">Učitavanje…</div>
          } @else if (notifications().length === 0) {
            <div class="cs-empty">Nema novih obavijesti.</div>
          } @else {
            <ul class="cs-list">
              @for (n of notifications(); track n.id) {
                <li class="cs-item" [class.cs-item--unread]="!n.isRead"
                    [attr.data-severity]="severityKey(n.severity)"
                    (click)="onItemClick(n)">
                  <div class="cs-item-dot"></div>
                  <div class="cs-item-body">
                    <strong>{{ n.title }}</strong>
                    <p>{{ n.message }}</p>
                    <span class="cs-item-time">{{ n.createdOnUtc | date: 'dd.MM.yyyy HH:mm' }}</span>
                  </div>
                </li>
              }
            </ul>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cs-bell-wrap {
        position: relative;
      }
      .cs-icon-btn {
        position: relative;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 10px;
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-icon-btn:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-bell-badge {
        position: absolute;
        top: -4px;
        right: -4px;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        background: #ef4444;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 2px var(--cs-bg-1);
      }
      .cs-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 360px;
        max-height: 480px;
        overflow: hidden;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        z-index: 50;
        display: flex;
        flex-direction: column;
      }
      .cs-dropdown-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px;
        border-bottom: 1px solid var(--cs-border-subtle);
        font-size: 13px;
        font-weight: 600;
      }
      .cs-link-btn {
        background: none;
        border: none;
        color: var(--cs-accent);
        font-size: 12px;
        cursor: pointer;
      }
      .cs-empty {
        padding: 32px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 13px;
      }
      .cs-list {
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-y: auto;
      }
      .cs-item {
        display: flex;
        gap: 10px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--cs-border-subtle);
        cursor: pointer;
      }
      .cs-item:hover {
        background: var(--cs-bg-2);
      }
      .cs-item:last-child {
        border-bottom: none;
      }
      .cs-item-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--cs-bg-3);
        margin-top: 6px;
        flex-shrink: 0;
      }
      .cs-item--unread .cs-item-dot {
        background: var(--cs-accent);
      }
      .cs-item[data-severity='critical'] .cs-item-dot {
        background: #ef4444;
      }
      .cs-item[data-severity='warning'] .cs-item-dot {
        background: #f59e0b;
      }
      .cs-item-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 0;
      }
      .cs-item-body strong {
        font-size: 13px;
        color: var(--cs-text-primary);
      }
      .cs-item-body p {
        margin: 0;
        font-size: 12px;
        color: var(--cs-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cs-item-time {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class NotificationBellComponent implements OnInit {
  private readonly notificationsService = inject(NotificationsService);
  private readonly signalR = inject(SignalRConnectionService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly notifications = signal<NotificationItem[]>([]);
  protected readonly unreadCount = signal(0);
  protected readonly loading = signal(false);
  protected readonly isOpen = signal(false);

  ngOnInit(): void {
    this.loadUnreadCount();

    this.signalR
      .start()
      .catch((err) => console.error('[Bell] SignalR start failed', err));

    this.signalR.notification$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((payload) => {
      // Real-time push: bump count + prepend if dropdown already loaded.
      this.unreadCount.update((c) => c + 1);
      this.notifications.update((current) => {
        const exists = current.some((n) => n.id === payload.id);
        if (exists) return current;
        return [
          {
            id: payload.id,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            severity: payload.severity as NotificationSeverity,
            relatedEntityType: payload.relatedEntityType,
            relatedEntityId: payload.relatedEntityId,
            isRead: false,
            readAtUtc: null,
            createdOnUtc: payload.createdAtUtc,
          },
          ...current,
        ].slice(0, 10);
      });
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isOpen.set(false);
  }

  protected toggleDropdown(event: MouseEvent): void {
    event.stopPropagation();
    const willOpen = !this.isOpen();
    this.isOpen.set(willOpen);
    if (willOpen) this.loadList();
  }

  private loadUnreadCount(): void {
    this.notificationsService.getUnreadCount().subscribe({
      next: (res) => this.unreadCount.set(res.count),
    });
  }

  private loadList(): void {
    this.loading.set(true);
    this.notificationsService.getList(false, 1, 10).subscribe({
      next: (res) => {
        this.notifications.set(res.items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onItemClick(n: NotificationItem): void {
    if (!n.isRead) {
      this.notificationsService.markAsRead(n.id).subscribe({
        next: () => {
          this.notifications.update((items) =>
            items.map((it) => (it.id === n.id ? { ...it, isRead: true, readAtUtc: new Date().toISOString() } : it)),
          );
          this.unreadCount.update((c) => Math.max(0, c - 1));
        },
      });
    }
  }

  protected onMarkAllRead(): void {
    this.notificationsService.markAllAsRead().subscribe({
      next: () => {
        this.notifications.update((items) => items.map((it) => ({ ...it, isRead: true })));
        this.unreadCount.set(0);
      },
    });
  }

  protected severityKey(severity: NotificationSeverity): 'critical' | 'warning' | 'info' {
    if (severity === NotificationSeverity.Critical) return 'critical';
    if (severity === NotificationSeverity.Warning) return 'warning';
    return 'info';
  }
}
