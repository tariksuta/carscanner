import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { StatusBadgeComponent, StatusBadgeVariant } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-form-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, StatusBadgeComponent],
  template: `
    <div class="cs-form-page">
      <header class="cs-form-head">
        <button type="button" class="cs-back-btn" (click)="cancelled.emit()" aria-label="Nazad">
          <lucide-icon name="chevron-left" [size]="16" />
        </button>
        <div class="cs-head-main">
          <h1 class="cs-form-title">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="cs-form-sub">{{ subtitle() }}</p>
          }
        </div>
        @if (statusLabel()) {
          <app-status-badge [label]="statusLabel()!" [variant]="statusVariant()" />
        }
      </header>

      <div class="cs-form-body">
        <ng-content />
      </div>

      <footer class="cs-form-foot">
        <button type="button" class="cs-btn-ghost" (click)="cancelled.emit()">Otkaži</button>
        <button
          type="button"
          class="cs-btn-primary"
          [disabled]="submitDisabled()"
          (click)="submitted.emit()"
        >
          {{ submitLabel() }}
        </button>
      </footer>
    </div>
  `,
  styles: [
    `
      .cs-form-page {
        padding: 28px;
        max-width: 900px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-form-head {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .cs-back-btn {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-head-main {
        flex: 1;
        min-width: 0;
      }
      .cs-form-title {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-form-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 2px 0 0;
      }
      .cs-form-body {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-form-foot {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-btn-ghost {
        padding: 9px 16px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .cs-btn-primary {
        padding: 9px 18px;
        border-radius: 9px;
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class FormShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly submitLabel = input<string>('Sačuvaj');
  readonly submitDisabled = input<boolean>(false);
  readonly statusLabel = input<string | null>(null);
  readonly statusVariant = input<StatusBadgeVariant>('info');

  readonly submitted = output<void>();
  readonly cancelled = output<void>();
}
