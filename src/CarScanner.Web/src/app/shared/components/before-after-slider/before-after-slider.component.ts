import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-before-after-slider',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="cs-ba"
      (mousemove)="onMove($event)"
      (touchmove)="onTouch($event)"
    >
      <div class="cs-ba-layer cs-ba-before">
        @if (beforeUrl()) {
          <img [src]="beforeUrl()" alt="" />
        } @else {
          <ng-content select="[slot=before]" />
        }
        <span class="cs-ba-chip left">{{ beforeLabel() }}</span>
      </div>

      <div class="cs-ba-layer cs-ba-after" [style.clip-path]="afterClip()">
        @if (afterUrl()) {
          <img [src]="afterUrl()" alt="" />
        } @else {
          <ng-content select="[slot=after]" />
        }
        <span class="cs-ba-chip right">{{ afterLabel() }}</span>
      </div>

      <div class="cs-ba-handle" [style.left.%]="pos()">
        <div class="cs-ba-knob">⇔</div>
      </div>

      <div class="cs-ba-hint">Pomjeri kursor za usporedbu</div>
    </div>
  `,
  styles: [
    `
      .cs-ba {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 12px;
        overflow: hidden;
        background: #111;
        user-select: none;
        cursor: col-resize;
      }
      .cs-ba-layer {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-ba-before {
        background: linear-gradient(135deg, #1a1d22, #2a2f38);
      }
      .cs-ba-after {
        background: linear-gradient(135deg, #1a1d22, #2a2f38);
      }
      .cs-ba img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cs-ba-chip {
        position: absolute;
        top: 14px;
        padding: 5px 10px;
        border-radius: 6px;
        color: #fff;
        font-family: var(--font-text);
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .cs-ba-chip.left {
        left: 14px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
      }
      .cs-ba-chip.right {
        right: 14px;
        background: var(--cs-status-danger);
      }
      .cs-ba-handle {
        position: absolute;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--cs-accent);
        pointer-events: none;
        box-shadow: 0 0 0 1px rgba(10, 11, 13, 0.5), 0 0 20px rgba(216, 255, 60, 0.4);
      }
      .cs-ba-knob {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 36px;
        height: 36px;
        border-radius: 999px;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        font-weight: 700;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      }
      .cs-ba-hint {
        position: absolute;
        bottom: 14px;
        left: 50%;
        transform: translateX(-50%);
        padding: 5px 12px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(8px);
        color: #fff;
        font-size: 10px;
        font-weight: 500;
        pointer-events: none;
      }
    `,
  ],
})
export class BeforeAfterSliderComponent {
  readonly beforeUrl = input<string | null>(null);
  readonly afterUrl = input<string | null>(null);
  readonly beforeLabel = input<string>('Preuzimanje');
  readonly afterLabel = input<string>('Povrat');

  readonly pos = signal(50);

  afterClip(): string {
    return `inset(0 0 0 ${this.pos()}%)`;
  }

  onMove(ev: MouseEvent): void {
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((ev.clientX - rect.left) / rect.width) * 100;
    this.pos.set(Math.max(5, Math.min(95, x)));
  }

  onTouch(ev: TouchEvent): void {
    const t = ev.touches[0];
    if (!t) return;
    const rect = (ev.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((t.clientX - rect.left) / rect.width) * 100;
    this.pos.set(Math.max(5, Math.min(95, x)));
  }
}
