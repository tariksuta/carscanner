import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DamageItem, DamageSeverity, DAMAGE_SEVERITY_LABELS } from '../models/damage-report.model';
import { DamageSeverityTone } from '../../../shared/components/car-diagram/car-diagram.component';

@Component({
  selector: 'app-damage-item-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="cs-dmg-card"
      [class.selected]="selected()"
      (click)="activate.emit(item().id)"
    >
      <div class="cs-dmg-pin" [style.background]="tone().color" [style.color]="tone().ink">
        {{ pinLabel() }}
      </div>
      <div class="cs-dmg-body">
        <div class="cs-dmg-top">
          <span class="cs-dmg-pos">{{ position() }}</span>
          <span class="cs-dmg-sev" [style.background]="tone().soft" [style.color]="tone().color">
            {{ severityLabel() }}
          </span>
        </div>
        <div class="cs-dmg-desc">{{ item().description }}</div>
        <div class="cs-dmg-foot">
          <div class="cs-dmg-conf">
            <div class="cs-conf-track">
              <div
                class="cs-conf-fill"
                [style.width.%]="confidence()"
                [style.background]="confidence() > 90 ? 'var(--cs-status-active)' : 'var(--cs-status-pending)'"
              ></div>
            </div>
            <span class="mono cs-dmg-conf-num">{{ confidence() }}%</span>
          </div>
          @if (item().estimatedCost != null) {
            <span class="mono cs-dmg-cost">{{ item().estimatedCost }} KM</span>
          }
        </div>
      </div>
    </button>
  `,
  styles: [
    `
      .cs-dmg-card {
        width: 100%;
        display: flex;
        align-items: flex-start;
        gap: 14px;
        padding: 14px 16px;
        background: transparent;
        border: 1px solid var(--cs-border-subtle);
        border-radius: 12px;
        text-align: left;
        font-family: var(--font-text);
        color: inherit;
        cursor: pointer;
        transition: background 0.12s ease, border-color 0.12s ease;
      }
      .cs-dmg-card:hover {
        background: var(--cs-bg-2);
      }
      .cs-dmg-card.selected {
        background: var(--cs-accent-soft);
        border-color: var(--cs-accent);
      }
      .cs-dmg-pin {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-dmg-body {
        flex: 1;
        min-width: 0;
      }
      .cs-dmg-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .cs-dmg-pos {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-dmg-sev {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 8px;
        border-radius: 999px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }
      .cs-dmg-desc {
        font-size: 12px;
        color: var(--cs-text-secondary);
        margin-top: 4px;
      }
      .cs-dmg-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-top: 10px;
      }
      .cs-dmg-conf {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }
      .cs-conf-track {
        flex: 1;
        max-width: 100px;
        height: 4px;
        border-radius: 999px;
        background: var(--cs-bg-3);
        overflow: hidden;
      }
      .cs-conf-fill {
        height: 100%;
      }
      .cs-dmg-conf-num {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-dmg-cost {
        font-size: 13px;
        font-weight: 700;
        color: var(--cs-text-primary);
      }
    `,
  ],
})
export class DamageItemCardComponent {
  readonly item = input.required<DamageItem>();
  readonly selected = input<boolean>(false);
  readonly pinLabel = input<string | number>('?');
  readonly confidence = input<number>(90);
  readonly activate = output<string>();

  readonly position = computed(() => `Pozicija ${this.item().position + 1}`);

  readonly severityLabel = computed(() => {
    const bsLabels: Record<DamageSeverity, string> = {
      [DamageSeverity.Minor]: 'Minor',
      [DamageSeverity.Moderate]: 'Moderate',
      [DamageSeverity.Severe]: 'Severe',
    };
    return bsLabels[this.item().severity] ?? DAMAGE_SEVERITY_LABELS[this.item().severity] ?? '—';
  });

  readonly tone = computed<{ color: string; soft: string; ink: string }>(() => {
    switch (this.item().severity) {
      case DamageSeverity.Minor:
        return { color: 'var(--cs-sev-minor)', soft: 'rgba(245, 208, 74, 0.14)', ink: '#0A0B0D' };
      case DamageSeverity.Moderate:
        return { color: 'var(--cs-sev-moderate)', soft: 'rgba(255, 154, 60, 0.14)', ink: '#0A0B0D' };
      case DamageSeverity.Severe:
        return { color: 'var(--cs-sev-severe)', soft: 'rgba(255, 92, 92, 0.14)', ink: '#0A0B0D' };
    }
  });

  toneKey(): DamageSeverityTone {
    switch (this.item().severity) {
      case DamageSeverity.Minor:
        return 'minor';
      case DamageSeverity.Moderate:
        return 'moderate';
      case DamageSeverity.Severe:
        return 'severe';
    }
  }
}
