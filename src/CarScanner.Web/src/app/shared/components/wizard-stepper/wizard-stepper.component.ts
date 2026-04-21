import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface WizardStep {
  label: string;
  icon: string;
}

@Component({
  selector: 'app-wizard-stepper',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <ol class="cs-stepper">
      @for (step of steps(); track step.label; let i = $index; let last = $last) {
        <li class="cs-step" [attr.data-state]="stateFor(i)">
          <button
            type="button"
            class="cs-step-btn"
            (click)="jump.emit(i)"
          >
            <span class="cs-step-dot">
              @if (stateFor(i) === 'completed') {
                <lucide-icon name="check" [size]="14" />
              } @else {
                <lucide-icon [name]="step.icon" [size]="14" />
              }
            </span>
            <span class="cs-step-label">
              <span class="cs-step-num">{{ i + 1 }}</span>
              <span class="cs-step-text">{{ step.label }}</span>
            </span>
          </button>
          @if (!last) {
            <span class="cs-step-line" [attr.data-filled]="stateFor(i) === 'completed'"></span>
          }
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .cs-stepper {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        align-items: center;
        gap: 0;
      }
      .cs-step {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      .cs-step:last-child {
        flex: 0;
      }
      .cs-step-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        padding: 6px 4px;
        cursor: pointer;
        color: inherit;
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
        border: 1px solid var(--cs-border);
        flex-shrink: 0;
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
      .cs-step-label {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 2px;
      }
      .cs-step-num {
        font-size: 10px;
        font-weight: 700;
        color: var(--cs-text-quaternary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }
      .cs-step-text {
        font-size: 12px;
        font-weight: 600;
        color: var(--cs-text-tertiary);
      }
      .cs-step[data-state='current'] .cs-step-text,
      .cs-step[data-state='completed'] .cs-step-text {
        color: var(--cs-text-primary);
      }
      .cs-step-line {
        flex: 1;
        height: 1px;
        background: var(--cs-border);
        margin: 0 8px;
        min-width: 16px;
      }
      .cs-step-line[data-filled='true'] {
        background: var(--cs-accent);
      }
    `,
  ],
})
export class WizardStepperComponent {
  readonly steps = input.required<WizardStep[]>();
  readonly current = input.required<number>();
  readonly jump = output<number>();

  stateFor(i: number): 'completed' | 'current' | 'pending' {
    if (i < this.current()) return 'completed';
    if (i === this.current()) return 'current';
    return 'pending';
  }
}
