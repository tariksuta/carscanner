import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { SparklineComponent } from '../sparkline/sparkline.component';

export type DeltaTone = 'active' | 'danger';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [LucideAngularModule, SparklineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cs-stat-card">
      <div class="cs-stat-top">
        <div class="cs-stat-icon">
          @if (icon()) {
            <lucide-icon [name]="icon()!" [size]="17" />
          }
        </div>
        @if (delta() != null) {
          <span
            class="cs-stat-delta"
            [style.background]="deltaStyle().bg"
            [style.color]="deltaStyle().fg"
          >
            {{ delta()! > 0 ? '↑' : '↓' }} {{ absDelta() }}%
          </span>
        }
      </div>
      <div>
        <div class="cs-stat-label">{{ label() }}</div>
        <div class="cs-stat-value">{{ value() }}</div>
      </div>
      @if (sparklineValues()?.length) {
        <div class="cs-stat-spark">
          <app-sparkline [values]="sparklineValues()!" />
        </div>
      }
      @if (footer()) {
        <div class="cs-stat-footer">{{ footer() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .cs-stat-card {
        padding: 20px;
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cs-stat-top {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }
      .cs-stat-icon {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: var(--cs-bg-3);
        color: var(--cs-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .cs-stat-delta {
        display: inline-flex;
        align-items: center;
        gap: 3px;
        font-size: 11px;
        font-weight: 600;
        padding: 3px 8px;
        border-radius: 999px;
      }
      .cs-stat-label {
        font-size: 12px;
        font-weight: 500;
        color: var(--cs-text-tertiary);
        margin-bottom: 4px;
        letter-spacing: -0.005em;
      }
      .cs-stat-value {
        font-family: var(--font-display);
        font-size: 30px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.03em;
        line-height: 1;
      }
      .cs-stat-spark {
        margin-top: 4px;
      }
      .cs-stat-footer {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        border-top: 1px solid var(--cs-border-subtle);
        padding-top: 10px;
        margin-top: 2px;
      }
    `,
  ],
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly delta = input<number | null>(null);
  readonly deltaTone = input<DeltaTone>('active');
  readonly icon = input<string | null>(null);
  readonly sparklineValues = input<number[] | null>(null);
  readonly footer = input<string | null>(null);

  readonly absDelta = computed(() => Math.abs(this.delta() ?? 0));

  readonly deltaStyle = computed(() =>
    this.deltaTone() === 'danger'
      ? { bg: 'var(--cs-status-danger-soft)', fg: 'var(--cs-status-danger)' }
      : { bg: 'var(--cs-status-active-soft)', fg: 'var(--cs-status-active)' },
  );
}
