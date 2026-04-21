import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-sparkline',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="'100%'"
      [attr.height]="height()"
      [attr.viewBox]="'0 0 100 ' + height()"
      preserveAspectRatio="none"
      class="cs-sparkline"
    >
      <defs>
        <linearGradient [attr.id]="gradientId()" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" [attr.stop-color]="color()" stop-opacity="0.3" />
          <stop offset="100%" [attr.stop-color]="color()" stop-opacity="0" />
        </linearGradient>
      </defs>
      <polygon [attr.points]="areaPoints()" [attr.fill]="'url(#' + gradientId() + ')'" />
      <polyline
        [attr.points]="linePoints()"
        fill="none"
        [attr.stroke]="color()"
        stroke-width="1.5"
        stroke-linejoin="round"
        stroke-linecap="round"
      />
    </svg>
  `,
  styles: [
    `
      .cs-sparkline {
        display: block;
      }
    `,
  ],
})
export class SparklineComponent {
  readonly values = input.required<number[]>();
  readonly color = input<string>('var(--cs-accent)');
  readonly height = input<number>(28);

  private readonly _id = `cs-spark-${Math.random().toString(36).slice(2, 9)}`;
  readonly gradientId = () => this._id;

  readonly linePoints = computed(() => {
    const vs = this.values();
    if (!vs.length) return '';
    const max = Math.max(...vs);
    const min = Math.min(...vs);
    const range = max - min || 1;
    const h = this.height();
    return vs
      .map((v, i) => {
        const x = (i / Math.max(vs.length - 1, 1)) * 100;
        const y = h - ((v - min) / range) * (h - 4) - 2;
        return `${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(' ');
  });

  readonly areaPoints = computed(() => {
    const line = this.linePoints();
    if (!line) return '';
    const h = this.height();
    return `0,${h} ${line} 100,${h}`;
  });
}
