import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RentalStatus } from '../models/rental.model';

interface TimelineStep {
  status: RentalStatus;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-rental-timeline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <ol class="cs-timeline">
      @for (step of steps; track step.status; let i = $index; let last = $last) {
        <li class="cs-step" [attr.data-state]="stateFor(step.status)">
          <div class="cs-step-dot">
            <lucide-icon [name]="step.icon" [size]="14" />
          </div>
          <div class="cs-step-meta">
            <div class="cs-step-label">{{ step.label }}</div>
            <div class="cs-step-time mono">
              {{ stateFor(step.status) === 'completed' ? 'Završeno' : stateFor(step.status) === 'current' ? 'U toku' : '—' }}
            </div>
          </div>
          @if (!last) {
            <span class="cs-step-connector" [attr.data-filled]="stateFor(step.status) === 'completed'"></span>
          }
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .cs-timeline {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        gap: 0;
      }
      .cs-step {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 12px 0;
      }
      .cs-step-dot {
        width: 30px;
        height: 30px;
        border-radius: 999px;
        background: var(--cs-bg-3);
        color: var(--cs-text-tertiary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        z-index: 1;
        border: 1px solid var(--cs-border);
      }
      .cs-step[data-state='current'] .cs-step-dot {
        background: var(--cs-accent-soft);
        color: var(--cs-accent);
        border-color: var(--cs-accent);
        box-shadow: 0 0 0 3px rgba(216, 255, 60, 0.18);
      }
      .cs-step[data-state='completed'] .cs-step-dot {
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        border-color: var(--cs-accent);
      }
      .cs-step-meta {
        flex: 1;
        min-width: 0;
        padding-top: 4px;
      }
      .cs-step-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-step[data-state='pending'] .cs-step-label {
        color: var(--cs-text-tertiary);
        font-weight: 500;
      }
      .cs-step-time {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-step-connector {
        position: absolute;
        left: 15px;
        top: 42px;
        bottom: -12px;
        width: 1px;
        background: var(--cs-border);
      }
      .cs-step-connector[data-filled='true'] {
        background: var(--cs-accent);
      }
    `,
  ],
})
export class RentalTimelineComponent {
  readonly currentStatus = input.required<RentalStatus>();

  readonly steps: TimelineStep[] = [
    { status: RentalStatus.Pending, label: 'Na čekanju', icon: 'clock' },
    { status: RentalStatus.PickupInProgress, label: 'Preuzimanje', icon: 'scan-line' },
    { status: RentalStatus.Active, label: 'Aktivan', icon: 'key' },
    { status: RentalStatus.ReturnInProgress, label: 'Povrat u toku', icon: 'log-in' },
    { status: RentalStatus.Completed, label: 'Završen', icon: 'check' },
  ];

  stateFor(s: RentalStatus): 'completed' | 'current' | 'pending' {
    const current = this.currentStatus();
    if (current === RentalStatus.Cancelled) {
      return s === RentalStatus.Pending ? 'completed' : 'pending';
    }
    if (s < current) return 'completed';
    if (s === current) return 'current';
    return 'pending';
  }
}
