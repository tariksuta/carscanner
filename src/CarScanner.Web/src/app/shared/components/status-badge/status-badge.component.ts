import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="cs-status-badge"
      [style.background]="style().bg"
      [style.color]="style().fg"
    >
      <span class="cs-status-dot" [style.background]="style().fg"></span>
      {{ label() }}
    </span>
  `,
  styles: [
    `
      .cs-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 10px;
        border-radius: 999px;
        font-family: var(--font-text);
        font-size: 11px;
        font-weight: 600;
        line-height: 1;
        letter-spacing: -0.005em;
        white-space: nowrap;
      }
      .cs-status-dot {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        flex-shrink: 0;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<StatusBadgeVariant>('default');

  readonly style = computed(() => {
    switch (this.variant()) {
      case 'success':
        return { bg: 'var(--cs-status-active-soft)', fg: 'var(--cs-status-active)' };
      case 'warning':
        return { bg: 'var(--cs-status-pending-soft)', fg: 'var(--cs-status-pending)' };
      case 'danger':
        return { bg: 'var(--cs-status-danger-soft)', fg: 'var(--cs-status-danger)' };
      case 'info':
        return { bg: 'var(--cs-status-info-soft)', fg: 'var(--cs-status-info)' };
      default:
        return { bg: 'var(--cs-status-neutral-soft)', fg: 'var(--cs-status-neutral)' };
    }
  });
}
