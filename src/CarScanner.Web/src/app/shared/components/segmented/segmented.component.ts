import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-segmented',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cs-segmented">
      @for (opt of options(); track opt.value) {
        <button
          type="button"
          class="cs-seg-btn"
          [class.active]="opt.value === value()"
          (click)="changed.emit(opt.value)"
        >
          {{ opt.label }}
        </button>
      }
    </div>
  `,
  styles: [
    `
      .cs-segmented {
        display: inline-flex;
        padding: 3px;
        gap: 2px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-seg-btn {
        padding: 6px 12px;
        border-radius: 7px;
        border: none;
        background: transparent;
        color: var(--cs-text-tertiary);
        font-family: var(--font-text);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
      }
      .cs-seg-btn.active {
        background: var(--cs-bg-3);
        color: var(--cs-text-primary);
        font-weight: 600;
      }
    `,
  ],
})
export class SegmentedComponent<T extends string = string> {
  readonly value = input.required<T>();
  readonly options = input.required<SegmentedOption<T>[]>();
  readonly changed = output<T>();
}
