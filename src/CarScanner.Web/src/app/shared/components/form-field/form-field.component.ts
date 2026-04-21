import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-field',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cs-field" [class.has-error]="!!error()">
      @if (label()) {
        <div class="cs-field-head">
          <label class="cs-field-label">
            {{ label() }}
            @if (required()) {
              <span class="cs-field-req">*</span>
            }
          </label>
          @if (hint()) {
            <span class="cs-field-hint">{{ hint() }}</span>
          }
        </div>
      }
      <div class="cs-field-control">
        <ng-content />
      </div>
      @if (error()) {
        <div class="cs-field-err">{{ error() }}</div>
      }
    </div>
  `,
  styles: [
    `
      .cs-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cs-field-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }
      .cs-field-label {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: var(--cs-text-tertiary);
        font-family: var(--font-text);
      }
      .cs-field-req {
        color: var(--cs-accent);
        margin-left: 3px;
      }
      .cs-field-hint {
        font-size: 10px;
        color: var(--cs-text-quaternary);
      }
      .cs-field-err {
        font-size: 11px;
        color: var(--cs-status-danger);
      }
      :host ::ng-deep .cs-field-control > input,
      :host ::ng-deep .cs-field-control > textarea,
      :host ::ng-deep .cs-field-control > select {
        width: 100%;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 9px;
        padding: 10px 12px;
        color: var(--cs-text-primary);
        font-family: var(--font-text);
        font-size: 13px;
        outline: none;
        transition: border-color 0.12s ease;
      }
      :host ::ng-deep .cs-field-control > input:focus,
      :host ::ng-deep .cs-field-control > textarea:focus,
      :host ::ng-deep .cs-field-control > select:focus {
        border-color: var(--cs-accent);
      }
      :host ::ng-deep .cs-field-control > textarea {
        min-height: 88px;
        resize: vertical;
      }
      :host ::ng-deep .cs-field.has-error .cs-field-control > input,
      :host ::ng-deep .cs-field.has-error .cs-field-control > textarea,
      :host ::ng-deep .cs-field.has-error .cs-field-control > select {
        border-color: var(--cs-status-danger);
      }
      :host ::ng-deep .cs-field-control > input.mono,
      :host ::ng-deep .cs-field-control > input[data-mono='true'] {
        font-family: var(--font-mono);
        letter-spacing: 0.02em;
      }
    `,
  ],
})
export class FormFieldComponent {
  readonly label = input<string>('');
  readonly hint = input<string | null>(null);
  readonly required = input<boolean>(false);
  readonly error = input<string | null>(null);
}
