import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';

/**
 * Generic modal sa backdrop, header, scrollable body, footer slots.
 * Koristi se kao:
 *   <app-modal [isOpen]="state()" title="..." (close)="onClose()">
 *     <ng-content body content here>
 *     <div footer>...</div>
 *   </app-modal>
 */
@Component({
  selector: 'app-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="cs-modal-backdrop" (click)="onBackdropClick()">
        <div class="cs-modal" [attr.data-size]="size()" (click)="$event.stopPropagation()">
          <header class="cs-modal-head">
            <div class="cs-modal-title-block">
              <h3 class="cs-modal-title">{{ title() }}</h3>
              @if (subtitle()) {
                <p class="cs-modal-sub">{{ subtitle() }}</p>
              }
            </div>
            <button type="button" class="cs-modal-close" (click)="close.emit()" aria-label="Zatvori">
              <lucide-icon name="x" [size]="16" />
            </button>
          </header>

          <div class="cs-modal-body">
            <ng-content />
          </div>

          @if (showFooter()) {
            <footer class="cs-modal-foot">
              <ng-content select="[modal-footer]" />
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .cs-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(4px);
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: csFadeIn 0.15s ease;
      }
      @keyframes csFadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .cs-modal {
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        width: 100%;
        max-width: 480px;
        max-height: calc(100vh - 40px);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: csSlideUp 0.18s ease;
      }
      .cs-modal[data-size='lg'] {
        max-width: 720px;
      }
      .cs-modal[data-size='sm'] {
        max-width: 380px;
      }
      @keyframes csSlideUp {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .cs-modal-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-modal-title-block {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-modal-title {
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 700;
        color: var(--cs-text-primary);
        margin: 0;
      }
      .cs-modal-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin: 0;
      }
      .cs-modal-close {
        background: transparent;
        border: 1px solid var(--cs-border-subtle);
        border-radius: 8px;
        width: 28px;
        height: 28px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: var(--cs-text-tertiary);
        cursor: pointer;
        flex-shrink: 0;
      }
      .cs-modal-close:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-modal-body {
        padding: 20px;
        overflow-y: auto;
        flex: 1;
      }
      .cs-modal-foot {
        padding: 14px 20px;
        border-top: 1px solid var(--cs-border-subtle);
        background: var(--cs-bg-0);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
    `,
  ],
})
export class ModalComponent {
  readonly isOpen = input(false);
  readonly title = input('');
  readonly subtitle = input<string | null>(null);
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly showFooter = input(true);
  readonly closeOnBackdrop = input(true);
  readonly close = output<void>();

  protected onBackdropClick(): void {
    if (this.closeOnBackdrop()) {
      this.close.emit();
    }
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen()) {
      this.close.emit();
    }
  }
}
