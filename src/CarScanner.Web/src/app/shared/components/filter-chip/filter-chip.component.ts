import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-chip',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="cs-chip"
      [class.active]="active()"
      (click)="pressed.emit()"
    >
      <ng-content />
      @if (count() != null) {
        <span class="cs-chip-count">{{ count() }}</span>
      }
    </button>
  `,
  styles: [
    `
      :host {
        display: inline-block;
      }
      .cs-chip {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--cs-border);
        background: var(--cs-bg-2);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: -0.005em;
        cursor: pointer;
        transition: all 0.12s ease;
      }
      .cs-chip:hover {
        border-color: var(--cs-border-strong);
        color: var(--cs-text-primary);
      }
      .cs-chip.active {
        border-color: var(--cs-accent);
        background: var(--cs-accent-soft);
        color: var(--cs-accent);
      }
      .cs-chip-count {
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 999px;
        background: var(--cs-bg-3);
        color: var(--cs-text-tertiary);
      }
      .cs-chip.active .cs-chip-count {
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
      }
    `,
  ],
})
export class FilterChipComponent {
  readonly active = input<boolean>(false);
  readonly count = input<number | null>(null);
  readonly pressed = output<void>();
}
