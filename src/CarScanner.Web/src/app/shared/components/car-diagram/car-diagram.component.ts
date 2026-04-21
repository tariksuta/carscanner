import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type DamageSeverityTone = 'minor' | 'moderate' | 'severe';

export interface CarDiagramPin {
  id: string | number;
  /** x in 0..160 coordinate space */
  x: number;
  /** y in 0..300 coordinate space */
  y: number;
  severity: DamageSeverityTone;
  label?: string | number;
}

@Component({
  selector: 'app-car-diagram',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cs-car-wrap">
      <svg
        [attr.width]="size()"
        [attr.height]="size() * 1.875"
        viewBox="0 0 160 300"
        class="cs-car-svg"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="var(--cs-text-secondary)"
          stroke-width="1.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <!-- Body -->
          <path
            d="M40 20 Q20 30 20 60 L20 240 Q20 270 40 280 L120 280 Q140 270 140 240 L140 60 Q140 30 120 20 Z"
          />
          <!-- Windshield -->
          <path d="M38 60 L122 60 L118 90 L42 90 Z" />
          <!-- Rear window -->
          <path d="M38 240 L122 240 L118 215 L42 215 Z" />
          <!-- Hood/bonnet seam -->
          <line x1="35" y1="30" x2="125" y2="30" />
          <!-- Trunk seam -->
          <line x1="35" y1="270" x2="125" y2="270" />
          <!-- Roof seam -->
          <line x1="42" y1="90" x2="42" y2="215" />
          <line x1="118" y1="90" x2="118" y2="215" />
          <!-- Left doors -->
          <line x1="42" y1="140" x2="20" y2="140" stroke-opacity="0.6" />
          <!-- Right doors -->
          <line x1="118" y1="140" x2="140" y2="140" stroke-opacity="0.6" />
          <!-- Wheels -->
          <rect x="10" y="50" width="12" height="28" rx="3" />
          <rect x="138" y="50" width="12" height="28" rx="3" />
          <rect x="10" y="220" width="12" height="28" rx="3" />
          <rect x="138" y="220" width="12" height="28" rx="3" />
          <!-- Headlights -->
          <line x1="40" y1="25" x2="55" y2="25" stroke="var(--cs-text-tertiary)" />
          <line x1="105" y1="25" x2="120" y2="25" stroke="var(--cs-text-tertiary)" />
        </g>

        @for (p of pins(); track p.id) {
          <g class="cs-pin" (click)="pinSelect.emit(p)">
            @if (p.id === selectedId()) {
              <circle
                [attr.cx]="p.x"
                [attr.cy]="p.y"
                r="14"
                fill="none"
                stroke="var(--cs-accent)"
                stroke-width="2"
                class="cs-pin-ring"
              />
            }
            <circle
              [attr.cx]="p.x"
              [attr.cy]="p.y"
              r="9"
              [attr.fill]="pinColor(p.severity)"
              stroke="#0A0B0D"
              stroke-width="2"
            />
            <text
              [attr.x]="p.x"
              [attr.y]="p.y + 4"
              text-anchor="middle"
              font-size="10"
              font-weight="700"
              fill="#0A0B0D"
              font-family="var(--font-display)"
            >{{ p.label ?? p.id }}</text>
          </g>
        }
      </svg>
    </div>
  `,
  styles: [
    `
      .cs-car-wrap {
        display: inline-block;
      }
      .cs-car-svg {
        display: block;
      }
      .cs-pin {
        cursor: pointer;
      }
      .cs-pin-ring {
        animation: cs-pulse 2s ease-in-out infinite;
        transform-origin: center;
      }
    `,
  ],
})
export class CarDiagramComponent {
  readonly size = input<number>(220);
  readonly pins = input<CarDiagramPin[]>([]);
  readonly selectedId = input<string | number | null>(null);
  readonly pinSelect = output<CarDiagramPin>();

  pinColor(severity: DamageSeverityTone): string {
    switch (severity) {
      case 'minor':
        return 'var(--cs-sev-minor)';
      case 'moderate':
        return 'var(--cs-sev-moderate)';
      case 'severe':
        return 'var(--cs-sev-severe)';
    }
  }
}
