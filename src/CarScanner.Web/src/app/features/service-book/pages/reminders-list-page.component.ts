import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { ServiceBookService } from '../services/service-book.service';
import {
  Reminder,
  ReminderNotificationStage,
  REMINDER_TYPE_LABELS,
} from '../models/service-book.model';

@Component({
  selector: 'app-reminders-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Podsjetnici</h1>
          <p class="cs-page-sub">Nadolazeći servisi, registracije i osiguranja</p>
        </div>
        <div class="cs-filters">
          <label class="cs-filter">
            <span>Period:</span>
            <select [value]="daysAhead()" (change)="onDaysChange($event)">
              <option [value]="7">7 dana</option>
              <option [value]="30">30 dana</option>
              <option [value]="90">90 dana</option>
              <option [value]="365">365 dana</option>
            </select>
          </label>
        </div>
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (reminders().length === 0) {
        <div class="cs-empty">Nema nadolazećih podsjetnika u odabranom periodu.</div>
      } @else {
        <div class="cs-list">
          @for (r of reminders(); track r.id) {
            <article class="cs-card"
                     [attr.data-severity]="severityKey(r.notificationStage)"
                     [attr.data-type]="typeKey(r.type)">
              <div class="cs-card-icon" [attr.data-type]="typeKey(r.type)">
                <lucide-icon [name]="iconFor(r.type)" [size]="20" />
              </div>
              <div class="cs-card-body">
                <div class="cs-card-row">
                  <span class="cs-type-pill" [attr.data-type]="typeKey(r.type)">
                    {{ typeLabel(r.type) }}
                  </span>
                  <span class="cs-card-vehicle">{{ r.vehicleDisplayName }}</span>
                </div>
                <p class="cs-card-desc">{{ r.description }}</p>
                <div class="cs-card-meta">
                  @if (r.dueDate) {
                    <span><lucide-icon name="calendar" [size]="12" /> {{ r.dueDate | date: 'dd.MM.yyyy' }}</span>
                  }
                  @if (r.dueMileage) {
                    <span><lucide-icon name="gauge" [size]="12" /> {{ r.dueMileage | number }} km</span>
                  }
                </div>
              </div>
              <div class="cs-card-stage">
                <span class="cs-stage-pill" [attr.data-severity]="severityKey(r.notificationStage)">
                  {{ stageText(r) }}
                </span>
                <button class="cs-dismiss" (click)="onDismiss(r.id)" title="Označi kao odrađeno">
                  <lucide-icon name="check-circle" [size]="14" />
                </button>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-filter {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-filter select {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 8px;
        padding: 7px 10px;
        font-size: 13px;
        color: var(--cs-text-primary);
      }
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
      }
      .cs-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cs-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        padding: 14px 18px;
        display: grid;
        grid-template-columns: 40px 1fr auto;
        gap: 14px;
        align-items: center;
      }
      .cs-card[data-severity='critical'] {
        border-left: 3px solid #ef4444;
      }
      .cs-card[data-severity='warning'] {
        border-left: 3px solid #f59e0b;
      }
      .cs-card[data-severity='info'] {
        border-left: 3px solid #3b82f6;
      }
      .cs-card-icon {
        width: 40px;
        height: 40px;
        background: var(--cs-bg);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cs-text-secondary);
      }
      /* Type-coded ikona */
      .cs-card-icon[data-type='registration'] {
        background: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
      }
      .cs-card-icon[data-type='insurance'] {
        background: rgba(168, 85, 247, 0.15);
        color: #a855f7;
      }
      .cs-card-icon[data-type='technical'] {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
      }
      .cs-card-icon[data-type='service'] {
        background: rgba(249, 115, 22, 0.15);
        color: #f97316;
      }
      .cs-card-icon[data-type='custom'] {
        background: rgba(107, 114, 128, 0.15);
        color: #9ca3af;
      }
      /* Type pill — naslov reminder-a */
      .cs-type-pill {
        padding: 3px 9px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: var(--cs-bg);
      }
      .cs-type-pill[data-type='registration'] {
        background: rgba(6, 182, 212, 0.15);
        color: #06b6d4;
      }
      .cs-type-pill[data-type='insurance'] {
        background: rgba(168, 85, 247, 0.15);
        color: #a855f7;
      }
      .cs-type-pill[data-type='technical'] {
        background: rgba(234, 179, 8, 0.15);
        color: #eab308;
      }
      .cs-type-pill[data-type='service'] {
        background: rgba(249, 115, 22, 0.15);
        color: #f97316;
      }
      .cs-type-pill[data-type='custom'] {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }
      .cs-card-body {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-card-row {
        display: flex;
        gap: 12px;
        align-items: center;
      }
      .cs-card-vehicle {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-card-desc {
        margin: 0;
        font-size: 13px;
        color: var(--cs-text-secondary);
      }
      .cs-card-meta {
        display: flex;
        gap: 14px;
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-card-meta span {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cs-card-stage {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .cs-stage-pill {
        padding: 4px 10px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        background: var(--cs-bg);
      }
      .cs-stage-pill[data-severity='critical'] {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }
      .cs-stage-pill[data-severity='warning'] {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .cs-stage-pill[data-severity='info'] {
        background: rgba(59, 130, 246, 0.15);
        color: #3b82f6;
      }
      .cs-dismiss {
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        border-radius: 6px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-dismiss:hover {
        color: #10b981;
        border-color: rgba(16, 185, 129, 0.4);
      }
    `,
  ],
})
export class RemindersListPageComponent implements OnInit {
  private readonly service = inject(ServiceBookService);

  protected readonly reminders = signal<Reminder[]>([]);
  protected readonly loading = signal(true);
  protected readonly daysAhead = signal(30);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.service.getUpcomingReminders(this.daysAhead()).subscribe({
      next: (data) => {
        this.reminders.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onDaysChange(event: Event): void {
    const value = +(event.target as HTMLSelectElement).value;
    this.daysAhead.set(value);
    this.load();
  }

  protected onDismiss(id: string): void {
    if (!confirm('Označiti ovaj podsjetnik kao odrađen?')) return;
    this.service.dismissReminder(id).subscribe({
      next: () => this.load(),
    });
  }

  protected typeLabel(type: number): string {
    return REMINDER_TYPE_LABELS[type as keyof typeof REMINDER_TYPE_LABELS] ?? '—';
  }

  protected iconFor(type: number): string {
    switch (type) {
      case 0: return 'file-badge';     // RegistrationExpiry
      case 1: return 'shield-check';   // InsuranceExpiry
      case 2: return 'clipboard-check'; // TechnicalInspection
      case 3: return 'wrench';         // NextService
      default: return 'bell';
    }
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

  protected severityKey(stage: ReminderNotificationStage): 'critical' | 'warning' | 'info' {
    if (stage === ReminderNotificationStage.Overdue || stage === ReminderNotificationStage.T1Day) return 'critical';
    if (stage === ReminderNotificationStage.T7Days) return 'warning';
    return 'info';
  }

  protected stageText(r: Reminder): string {
    if (r.daysUntilDue === null) {
      return r.dueMileage ? `${r.dueMileage} km` : '—';
    }
    if (r.daysUntilDue < 0) return `Kasni ${-r.daysUntilDue} dana`;
    if (r.daysUntilDue === 0) return 'Danas';
    if (r.daysUntilDue === 1) return 'Sutra';
    return `Za ${r.daysUntilDue} dana`;
  }
}
