import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ServiceBookService } from '../services/service-book.service';
import {
  Reminder,
  ReminderNotificationStage,
  REMINDER_TYPE_LABELS,
  ServiceRecordSummary,
  SERVICE_RECORD_TYPE_LABELS,
} from '../models/service-book.model';

@Component({
  selector: 'app-service-book-overview-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Servisna knjiga</h1>
          <p class="cs-page-sub">Pregled servisa i podsjetnika za održavanje vozila</p>
        </div>
        <div class="cs-actions">
          <a routerLink="/service-book/records/new" class="cs-btn-primary">
            <lucide-icon name="plus" [size]="15" /> Dodaj servis
          </a>
          <a routerLink="/service-book/records" class="cs-btn-secondary">
            <lucide-icon name="list" [size]="15" /> Svi servisi
          </a>
        </div>
      </header>

      <section class="cs-section">
        <header class="cs-section-head">
          <h2 class="cs-section-title">
            <lucide-icon name="bell-ring" [size]="16" /> Nadolazeći podsjetnici (30 dana)
          </h2>
          <a routerLink="/service-book/reminders" class="cs-section-link">Pogledaj sve →</a>
        </header>
        @if (loadingReminders()) {
          <div class="cs-loading">Učitavanje…</div>
        } @else if (upcomingReminders().length === 0) {
          <div class="cs-empty">Nema nadolazećih podsjetnika u sljedećih 30 dana.</div>
        } @else {
          <div class="cs-reminder-grid">
            @for (reminder of upcomingReminders(); track reminder.id) {
              <article class="cs-reminder-card"
                       [attr.data-severity]="severityKey(reminder.notificationStage)"
                       [attr.data-type]="typeKey(reminder.type)">
                <header class="cs-reminder-head">
                  <span class="cs-reminder-type" [attr.data-type]="typeKey(reminder.type)">
                    {{ reminderTypeLabel(reminder.type) }}
                  </span>
                  <span class="cs-reminder-stage">{{ stageLabel(reminder) }}</span>
                </header>
                <p class="cs-reminder-vehicle">{{ reminder.vehicleDisplayName }}</p>
                <p class="cs-reminder-desc">{{ reminder.description }}</p>
                @if (reminder.dueDate) {
                  <p class="cs-reminder-date">Dospijeva: {{ reminder.dueDate | date: 'dd.MM.yyyy' }}</p>
                }
              </article>
            }
          </div>
        }
      </section>

      <section class="cs-section">
        <header class="cs-section-head">
          <h2 class="cs-section-title">
            <lucide-icon name="wrench" [size]="16" /> Posljednji servisi
          </h2>
          <a routerLink="/service-book/records" class="cs-section-link">Pogledaj sve →</a>
        </header>
        @if (loadingRecords()) {
          <div class="cs-loading">Učitavanje…</div>
        } @else if (recentRecords().length === 0) {
          <div class="cs-empty">Još nema unesenih servisa.</div>
        } @else {
          <div class="cs-records-list">
            @for (record of recentRecords(); track record.id) {
              <article class="cs-record-row">
                <div class="cs-record-main">
                  <strong>{{ recordTypeLabel(record.type) }}</strong>
                  <span class="cs-record-vehicle">{{ record.vehicleDisplayName }}</span>
                </div>
                <div class="cs-record-meta">
                  <span>{{ record.serviceDate | date: 'dd.MM.yyyy' }}</span>
                  <span>{{ record.mileageAtService | number }} km</span>
                  <strong>{{ record.cost | number: '1.2-2' }} {{ record.currency }}</strong>
                </div>
              </article>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 24px;
      }
      .cs-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        color: var(--cs-text-primary);
        margin: 0;
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-actions {
        display: flex;
        gap: 8px;
      }
      .cs-btn-primary,
      .cs-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
      }
      .cs-btn-secondary {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
      }
      .cs-section {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cs-section-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cs-section-title {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 600;
        color: var(--cs-text-primary);
        margin: 0;
      }
      .cs-section-link {
        font-size: 12px;
        color: var(--cs-accent);
        text-decoration: none;
      }
      .cs-loading,
      .cs-empty {
        padding: 28px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
      }
      .cs-reminder-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }
      .cs-reminder-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cs-reminder-card[data-severity='critical'] {
        border-left: 3px solid #ef4444;
      }
      .cs-reminder-card[data-severity='warning'] {
        border-left: 3px solid #f59e0b;
      }
      .cs-reminder-card[data-severity='info'] {
        border-left: 3px solid #3b82f6;
      }
      .cs-reminder-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--cs-text-tertiary);
      }
      .cs-reminder-type {
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--cs-bg);
      }
      .cs-reminder-type[data-type='registration'] {
        background: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
      }
      .cs-reminder-type[data-type='insurance'] {
        background: rgba(168, 85, 247, 0.15);
        color: #a855f7;
      }
      .cs-reminder-type[data-type='technical'] {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
      }
      .cs-reminder-type[data-type='service'] {
        background: rgba(249, 115, 22, 0.15);
        color: #f97316;
      }
      .cs-reminder-type[data-type='custom'] {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }
      .cs-reminder-vehicle {
        margin: 0;
        font-weight: 600;
        color: var(--cs-text-primary);
        font-size: 14px;
      }
      .cs-reminder-desc {
        margin: 0;
        color: var(--cs-text-secondary);
        font-size: 13px;
      }
      .cs-reminder-date {
        margin: 0;
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-records-list {
        display: flex;
        flex-direction: column;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        overflow: hidden;
      }
      .cs-record-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 12px 16px;
        border-bottom: 1px solid var(--cs-border);
      }
      .cs-record-row:last-child {
        border-bottom: none;
      }
      .cs-record-main {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cs-record-vehicle {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-record-meta {
        display: flex;
        gap: 16px;
        align-items: center;
        font-size: 13px;
        color: var(--cs-text-secondary);
      }
    `,
  ],
})
export class ServiceBookOverviewPageComponent implements OnInit {
  private readonly service = inject(ServiceBookService);
  private readonly router = inject(Router);

  protected readonly upcomingReminders = signal<Reminder[]>([]);
  protected readonly recentRecords = signal<ServiceRecordSummary[]>([]);
  protected readonly loadingReminders = signal(true);
  protected readonly loadingRecords = signal(true);

  ngOnInit(): void {
    this.service.getUpcomingReminders(30).subscribe({
      next: (data) => {
        this.upcomingReminders.set(data);
        this.loadingReminders.set(false);
      },
      error: () => this.loadingReminders.set(false),
    });

    this.service.getRecords(null, 1, 5).subscribe({
      next: (data) => {
        this.recentRecords.set(data.items);
        this.loadingRecords.set(false);
      },
      error: () => this.loadingRecords.set(false),
    });
  }

  protected reminderTypeLabel(type: number): string {
    return REMINDER_TYPE_LABELS[type as keyof typeof REMINDER_TYPE_LABELS] ?? '—';
  }

  protected recordTypeLabel(type: number): string {
    return SERVICE_RECORD_TYPE_LABELS[type as keyof typeof SERVICE_RECORD_TYPE_LABELS] ?? '—';
  }

  protected severityKey(stage: ReminderNotificationStage): 'critical' | 'warning' | 'info' {
    if (stage === ReminderNotificationStage.Overdue || stage === ReminderNotificationStage.T1Day) return 'critical';
    if (stage === ReminderNotificationStage.T7Days) return 'warning';
    return 'info';
  }

  protected typeKey(type: number): 'registration' | 'insurance' | 'technical' | 'service' | 'custom' {
    switch (type) {
      case 0: return 'registration';
      case 1: return 'insurance';
      case 2: return 'technical';
      case 3: return 'service';
      default: return 'custom';
    }
  }

  protected stageLabel(reminder: Reminder): string {
    if (reminder.daysUntilDue === null) {
      return reminder.dueMileage ? `${reminder.dueMileage} km` : '—';
    }
    if (reminder.daysUntilDue < 0) return `Kasni ${-reminder.daysUntilDue} dana`;
    if (reminder.daysUntilDue === 0) return 'Danas';
    return `Za ${reminder.daysUntilDue} dana`;
  }
}
