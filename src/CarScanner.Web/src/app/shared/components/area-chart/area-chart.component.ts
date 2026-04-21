import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface AreaChartPoint {
  label: string;
  primary: number;
  secondary?: number;
}

interface Path {
  line: string;
  area: string;
  dots: { x: number; y: number }[];
}

@Component({
  selector: 'app-area-chart',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="'100%'"
      [attr.height]="height()"
      [attr.viewBox]="'0 0 ' + W + ' ' + height()"
      preserveAspectRatio="none"
      class="cs-area-chart"
    >
      <defs>
        <linearGradient id="cs-area-primary" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--cs-accent)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--cs-accent)" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="cs-area-secondary" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--cs-status-info)" stop-opacity="0.18" />
          <stop offset="100%" stop-color="var(--cs-status-info)" stop-opacity="0" />
        </linearGradient>
      </defs>

      @for (y of gridY(); track $index) {
        <line
          [attr.x1]="PAD_L"
          [attr.x2]="W - PAD_R"
          [attr.y1]="y"
          [attr.y2]="y"
          stroke="var(--cs-border-subtle)"
          stroke-dasharray="3 4"
        />
      }

      @for (lbl of yLabels(); track $index) {
        <text
          [attr.x]="PAD_L - 8"
          [attr.y]="lbl.y"
          text-anchor="end"
          font-size="10"
          fill="var(--cs-text-quaternary)"
          font-family="var(--font-mono)"
        >{{ lbl.text }}</text>
      }

      @if (hasSecondary()) {
        <path [attr.d]="secondary().area" fill="url(#cs-area-secondary)" />
        <path
          [attr.d]="secondary().line"
          stroke="var(--cs-status-info)"
          stroke-width="1.5"
          fill="none"
          stroke-opacity="0.6"
        />
      }

      <path [attr.d]="primary().area" fill="url(#cs-area-primary)" />
      <path [attr.d]="primary().line" stroke="var(--cs-accent)" stroke-width="2" fill="none" />

      @for (d of primary().dots; track $index) {
        <circle
          [attr.cx]="d.x"
          [attr.cy]="d.y"
          r="3"
          fill="var(--cs-accent)"
          stroke="var(--cs-bg-1)"
          stroke-width="1.5"
        />
      }

      @for (lbl of xLabels(); track $index) {
        <text
          [attr.x]="lbl.x"
          [attr.y]="height() - 6"
          text-anchor="middle"
          font-size="10"
          fill="var(--cs-text-tertiary)"
          font-family="var(--font-text)"
        >{{ lbl.text }}</text>
      }
    </svg>
  `,
  styles: [
    `
      .cs-area-chart {
        display: block;
      }
    `,
  ],
})
export class AreaChartComponent {
  readonly data = input.required<AreaChartPoint[]>();
  readonly height = input<number>(220);

  readonly W = 800;
  readonly PAD_Y = 24;
  readonly PAD_L = 36;
  readonly PAD_R = 12;

  private readonly max = computed(() => {
    const d = this.data();
    return Math.max(1, ...d.flatMap((p) => [p.primary, p.secondary ?? 0]));
  });

  private readonly step = computed(() => {
    const len = this.data().length;
    return (this.W - this.PAD_L - this.PAD_R) / Math.max(len - 1, 1);
  });

  private readonly chartH = computed(() => this.height() - this.PAD_Y * 2);

  readonly hasSecondary = computed(() => this.data().some((p) => p.secondary != null));

  readonly primary = computed<Path>(() => this.buildPath('primary'));
  readonly secondary = computed<Path>(() => this.buildPath('secondary'));

  readonly gridY = computed(() => {
    const ch = this.chartH();
    return [0, 0.25, 0.5, 0.75, 1].map((r) => this.PAD_Y + ch * r);
  });

  readonly yLabels = computed(() => {
    const ch = this.chartH();
    const max = this.max();
    return [1, 0.75, 0.5, 0.25, 0].map((r) => ({
      y: this.PAD_Y + ch * (1 - r) + 4,
      text: String(Math.round(max * r)),
    }));
  });

  readonly xLabels = computed(() => {
    const d = this.data();
    const every = Math.ceil(d.length / 7);
    const step = this.step();
    return d
      .map((p, i) => ({ i, p }))
      .filter(({ i }) => i % every === 0)
      .map(({ i, p }) => ({ x: this.PAD_L + i * step, text: p.label }));
  });

  private buildPath(key: 'primary' | 'secondary'): Path {
    const d = this.data();
    const max = this.max();
    const ch = this.chartH();
    const step = this.step();
    const bottom = this.height() - this.PAD_Y;
    const dots = d.map((p, i) => {
      const v = key === 'primary' ? p.primary : p.secondary ?? 0;
      return {
        x: this.PAD_L + i * step,
        y: this.PAD_Y + ch - (v / max) * ch,
      };
    });
    if (!dots.length) return { line: '', area: '', dots };
    const line = dots.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
    const area = `${line} L${dots[dots.length - 1].x},${bottom} L${dots[0].x},${bottom} Z`;
    return { line, area, dots };
  }
}
