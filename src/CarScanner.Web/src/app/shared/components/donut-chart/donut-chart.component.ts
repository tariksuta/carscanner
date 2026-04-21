import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface DonutSegment {
  value: number;
  color: string;
  label?: string;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="'0 0 ' + size() + ' ' + size()">
      <circle
        [attr.cx]="size() / 2"
        [attr.cy]="size() / 2"
        [attr.r]="radius()"
        fill="none"
        stroke="var(--cs-bg-3)"
        [attr.stroke-width]="thickness()"
      />
      @for (s of arcs(); track $index) {
        <circle
          [attr.cx]="size() / 2"
          [attr.cy]="size() / 2"
          [attr.r]="radius()"
          fill="none"
          [attr.stroke]="s.color"
          [attr.stroke-width]="thickness()"
          [attr.stroke-dasharray]="s.dash"
          [attr.stroke-dashoffset]="s.offset"
          [attr.transform]="'rotate(-90 ' + size() / 2 + ' ' + size() / 2 + ')'"
          stroke-linecap="butt"
        />
      }
      @if (centerValue() != null) {
        <text
          [attr.x]="size() / 2"
          [attr.y]="size() / 2 - 2"
          text-anchor="middle"
          font-size="28"
          font-weight="700"
          fill="var(--cs-text-primary)"
          font-family="var(--font-display)"
          letter-spacing="-0.03em"
          dominant-baseline="central"
        >{{ centerValue() }}</text>
      }
      @if (centerLabel()) {
        <text
          [attr.x]="size() / 2"
          [attr.y]="size() / 2 + 20"
          text-anchor="middle"
          font-size="11"
          fill="var(--cs-text-tertiary)"
          font-family="var(--font-text)"
          font-weight="500"
        >{{ centerLabel() }}</text>
      }
    </svg>
  `,
})
export class DonutChartComponent {
  readonly segments = input.required<DonutSegment[]>();
  readonly size = input<number>(160);
  readonly thickness = input<number>(18);
  readonly centerLabel = input<string | null>(null);
  readonly centerValue = input<string | number | null>(null);

  readonly radius = computed(() => (this.size() - this.thickness()) / 2);

  readonly arcs = computed(() => {
    const segs = this.segments();
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    const c = 2 * Math.PI * this.radius();
    let offset = 0;
    return segs.map((s) => {
      const len = (s.value / total) * c;
      const arc = {
        color: s.color,
        dash: `${len} ${c - len}`,
        offset: -offset,
      };
      offset += len;
      return arc;
    });
  });
}
