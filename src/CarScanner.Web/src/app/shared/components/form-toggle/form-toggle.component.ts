import { ChangeDetectionStrategy, Component, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-form-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormToggleComponent),
      multi: true,
    },
  ],
  template: `
    <button
      type="button"
      class="cs-toggle-row"
      [class.disabled]="disabled()"
      (click)="toggle()"
    >
      <div class="cs-toggle-meta">
        <div class="cs-toggle-label">{{ label() }}</div>
        @if (hint()) {
          <div class="cs-toggle-hint">{{ hint() }}</div>
        }
      </div>
      <span class="cs-toggle-pill" [class.on]="value()">
        <span class="cs-toggle-knob"></span>
      </span>
    </button>
  `,
  styles: [
    `
      .cs-toggle-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 0;
        background: transparent;
        border: none;
        text-align: left;
        font-family: var(--font-text);
        color: inherit;
        cursor: pointer;
      }
      .cs-toggle-row.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-toggle-meta {
        flex: 1;
        min-width: 0;
      }
      .cs-toggle-label {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-toggle-hint {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-toggle-pill {
        position: relative;
        width: 40px;
        height: 22px;
        border-radius: 999px;
        background: var(--cs-bg-3);
        border: 1px solid var(--cs-border);
        flex-shrink: 0;
        transition: background 0.12s ease, border-color 0.12s ease;
      }
      .cs-toggle-pill.on {
        background: var(--cs-accent);
        border-color: var(--cs-accent);
      }
      .cs-toggle-knob {
        position: absolute;
        top: 2px;
        left: 2px;
        width: 16px;
        height: 16px;
        border-radius: 999px;
        background: var(--cs-text-primary);
        transition: left 0.14s ease, background 0.14s ease;
      }
      .cs-toggle-pill.on .cs-toggle-knob {
        left: 20px;
        background: var(--cs-accent-ink);
      }
    `,
  ],
})
export class FormToggleComponent implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly disabled = input<boolean>(false);

  readonly value = signal(false);

  private onChange: (v: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: boolean): void {
    this.value.set(!!v);
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  toggle(): void {
    if (this.disabled()) return;
    const next = !this.value();
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
