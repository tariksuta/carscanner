import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type LicensePlateSize = 'sm' | 'md' | 'lg';

const SIZES: Record<LicensePlateSize, { fs: number; h: number; px: number }> = {
  sm: { fs: 10, h: 20, px: 6 },
  md: { fs: 12, h: 24, px: 8 },
  lg: { fs: 14, h: 28, px: 10 },
};

@Component({
  selector: 'app-license-plate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span
      class="cs-plate"
      [style.height.px]="dims().h"
      [style.font-size.px]="dims().fs"
    >
      <span
        class="cs-plate-eu"
        [style.padding]="'0 ' + (dims().px - 2) + 'px'"
        [style.font-size.px]="dims().fs - 2"
      >{{ country() }}</span>
      <span class="cs-plate-num" [style.padding]="'0 ' + dims().px + 'px'">{{ plate() }}</span>
    </span>
  `,
  styles: [
    `
      .cs-plate {
        display: inline-flex;
        align-items: stretch;
        border-radius: 4px;
        overflow: hidden;
        border: 1px solid var(--cs-border-strong);
        background: #f5f6f8;
        color: #0a0b0d;
        font-family: var(--font-mono);
        font-weight: 700;
        letter-spacing: 0.04em;
        line-height: 1;
        vertical-align: middle;
      }
      .cs-plate-eu {
        background: #0052b4;
        color: #ffd400;
        display: inline-flex;
        align-items: center;
      }
      .cs-plate-num {
        display: inline-flex;
        align-items: center;
      }
    `,
  ],
})
export class LicensePlateComponent {
  readonly plate = input.required<string>();
  readonly size = input<LicensePlateSize>('md');
  readonly country = input<string>('BiH');

  readonly dims = computed(() => SIZES[this.size()]);
}
