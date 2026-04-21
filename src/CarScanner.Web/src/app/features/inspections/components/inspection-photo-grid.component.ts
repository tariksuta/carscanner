import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { InspectionPhoto, PhotoPosition } from '../models/inspection.model';

interface Slot {
  position: PhotoPosition;
  label: string;
  photo: InspectionPhoto | null;
}

@Component({
  selector: 'app-inspection-photo-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="cs-photo-grid">
      @for (slot of slots(); track slot.position) {
        <figure class="cs-slot" [class.filled]="!!slot.photo">
          @if (slot.photo) {
            <img [src]="slot.photo.photoUrl" [alt]="slot.label" />
          } @else {
            <div class="cs-slot-empty">
              <svg viewBox="0 0 80 40" width="64" height="32" aria-hidden="true">
                <path
                  d="M8 28 Q12 16 24 14 L56 14 Q68 16 72 28 L72 32 L8 32 Z"
                  fill="none"
                  stroke="var(--cs-text-quaternary)"
                  stroke-width="1.5"
                  stroke-linejoin="round"
                />
                <circle cx="22" cy="32" r="4" fill="none" stroke="var(--cs-text-quaternary)" stroke-width="1.5" />
                <circle cx="58" cy="32" r="4" fill="none" stroke="var(--cs-text-quaternary)" stroke-width="1.5" />
              </svg>
              <span>Nema fotografije</span>
            </div>
          }
          <figcaption>
            <span class="cs-slot-label">{{ slot.label }}</span>
            <span class="cs-slot-state" [attr.data-filled]="!!slot.photo">
              {{ slot.photo ? 'Uploadano' : 'Čeka se' }}
            </span>
          </figcaption>
        </figure>
      }
    </div>
  `,
  styles: [
    `
      .cs-photo-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }
      .cs-slot {
        margin: 0;
        display: flex;
        flex-direction: column;
        border-radius: 14px;
        overflow: hidden;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-slot img {
        display: block;
        width: 100%;
        height: 220px;
        object-fit: cover;
        background: var(--cs-bg-3);
      }
      .cs-slot-empty {
        height: 220px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        color: var(--cs-text-quaternary);
        font-size: 12px;
        background: repeating-linear-gradient(
          45deg,
          var(--cs-bg-2),
          var(--cs-bg-2) 12px,
          var(--cs-bg-3) 12px,
          var(--cs-bg-3) 13px
        );
      }
      .cs-slot figcaption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-top: 1px solid var(--cs-border-subtle);
        background: var(--cs-bg-1);
      }
      .cs-slot-label {
        font-size: 12px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-slot-state {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-slot-state[data-filled='true'] {
        color: var(--cs-status-active);
      }
    `,
  ],
})
export class InspectionPhotoGridComponent {
  readonly photos = input.required<InspectionPhoto[]>();

  readonly slots = computed<Slot[]>(() => {
    const byPos = new Map<PhotoPosition, InspectionPhoto>();
    const photos = this.photos();
    if (Array.isArray(photos)) {
      for (const p of photos) byPos.set(p.position, p);
    }
    return [
      { position: PhotoPosition.Front, label: 'Prednja', photo: byPos.get(PhotoPosition.Front) ?? null },
      { position: PhotoPosition.Back, label: 'Zadnja', photo: byPos.get(PhotoPosition.Back) ?? null },
      { position: PhotoPosition.LeftSide, label: 'Lijeva strana', photo: byPos.get(PhotoPosition.LeftSide) ?? null },
      { position: PhotoPosition.RightSide, label: 'Desna strana', photo: byPos.get(PhotoPosition.RightSide) ?? null },
    ];
  });
}
