import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  input,
  linkedSignal,
  output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

export interface LightboxImage {
  url: string;
  alt?: string;
}

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="cs-lb-backdrop" (click)="close.emit()">
      <button
        type="button"
        class="cs-lb-close"
        aria-label="Zatvori"
        (click)="$event.stopPropagation(); close.emit()"
      >
        <lucide-icon name="x" [size]="20" />
      </button>

      @if (images().length > 1) {
        <button
          type="button"
          class="cs-lb-nav left"
          aria-label="Prethodna"
          (click)="$event.stopPropagation(); prev()"
        >
          <lucide-icon name="chevron-left" [size]="28" />
        </button>
        <button
          type="button"
          class="cs-lb-nav right"
          aria-label="Sljedeća"
          (click)="$event.stopPropagation(); next()"
        >
          <lucide-icon name="chevron-right" [size]="28" />
        </button>
      }

      <figure class="cs-lb-stage" (click)="$event.stopPropagation()">
        @if (current(); as img) {
          <img [src]="img.url" [alt]="img.alt ?? ''" />
        }
        @if (images().length > 1) {
          <figcaption class="cs-lb-count mono">
            {{ index() + 1 }} / {{ images().length }}
          </figcaption>
        }
      </figure>
    </div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        z-index: 1000;
        display: block;
      }
      .cs-lb-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.88);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-lb-stage {
        margin: 0;
        max-width: 92vw;
        max-height: 88vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .cs-lb-stage img {
        max-width: 92vw;
        max-height: 82vh;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      }
      .cs-lb-count {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
        padding: 4px 12px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.55);
      }
      .cs-lb-close {
        position: absolute;
        top: 18px;
        right: 18px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .cs-lb-close:hover {
        background: rgba(255, 255, 255, 0.18);
      }
      .cs-lb-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 48px;
        height: 48px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.15);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .cs-lb-nav:hover {
        background: rgba(255, 255, 255, 0.18);
      }
      .cs-lb-nav.left {
        left: 24px;
      }
      .cs-lb-nav.right {
        right: 24px;
      }
    `,
  ],
})
export class ImageLightboxComponent {
  readonly images = input.required<LightboxImage[]>();
  readonly initialIndex = input<number>(0);
  readonly close = output<void>();

  readonly index = linkedSignal<{ len: number; init: number }, number>({
    source: () => ({ len: this.images().length, init: this.initialIndex() }),
    computation: ({ len, init }) => (len === 0 ? 0 : Math.max(0, Math.min(len - 1, init))),
  });

  readonly current = computed<LightboxImage | null>(() => {
    const list = this.images();
    if (!list.length) return null;
    return list[this.index()] ?? null;
  });

  prev(): void {
    const len = this.images().length;
    if (!len) return;
    this.index.update((i: number) => (i - 1 + len) % len);
  }

  next(): void {
    const len = this.images().length;
    if (!len) return;
    this.index.update((i: number) => (i + 1) % len);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    this.prev();
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    this.next();
  }
}
