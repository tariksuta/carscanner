import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  OnInit,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { concat } from 'rxjs';
import { last } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleCardComponent } from '../components/vehicle-card.component';
import { VehicleService } from '../services/vehicle.service';
import { VehicleDetail, VehicleImage } from '../models/vehicle.model';
import {
  ImageLightboxComponent,
  LightboxImage,
} from '../../../shared/components/image-lightbox/image-lightbox.component';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehicleCardComponent, LucideAngularModule, ImageLightboxComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <button type="button" class="cs-back-btn" (click)="goBack()" aria-label="Nazad">
          <lucide-icon name="chevron-left" [size]="16" />
        </button>
        <h1 class="cs-page-title">Detalji vozila</h1>
        <div class="cs-spacer"></div>
        @if (vehicleDetail()) {
          <button type="button" class="cs-btn-primary" (click)="onEdit()">
            <lucide-icon name="pencil" [size]="14" /> Uredi vozilo
          </button>
        }
      </header>

      @if (isLoading()) {
        <p class="cs-muted">Učitavanje…</p>
      } @else if (vehicleDetail(); as detail) {
        <app-vehicle-card [vehicle]="detail" />

        <section class="cs-card cs-pad cs-gallery">
          <div class="cs-gallery-head">
            <h3 class="cs-sect-title">Galerija</h3>
            <span class="cs-muted">{{ detail.images.length }} / 10 slika</span>
          </div>

          @if (detail.images.length > 0 && currentImage(); as current) {
            <div class="cs-carousel">
              <button
                type="button"
                class="cs-carousel-hero"
                (click)="openLightbox(carouselIndex())"
                aria-label="Otvori pregled"
              >
                <img [src]="current.imageUrl" alt="" />
                @if (current.isPrimary) {
                  <span class="cs-primary-tag">Glavna</span>
                }
                <span class="cs-carousel-count mono">
                  {{ carouselIndex() + 1 }} / {{ detail.images.length }}
                </span>
              </button>

              @if (detail.images.length > 1) {
                <button
                  type="button"
                  class="cs-carousel-nav left"
                  aria-label="Prethodna"
                  (click)="prevImage()"
                >
                  <lucide-icon name="chevron-left" [size]="22" />
                </button>
                <button
                  type="button"
                  class="cs-carousel-nav right"
                  aria-label="Sljedeća"
                  (click)="nextImage()"
                >
                  <lucide-icon name="chevron-right" [size]="22" />
                </button>
              }
            </div>

            @if (detail.images.length > 1) {
              <div class="cs-thumbs">
                @for (image of detail.images; track image.id; let i = $index) {
                  <button
                    type="button"
                    class="cs-thumb"
                    [class.active]="i === carouselIndex()"
                    (click)="carouselIndex.set(i)"
                  >
                    <img [src]="image.imageUrl" alt="" />
                    @if (image.isPrimary) {
                      <span class="cs-thumb-primary" aria-label="Glavna"></span>
                    }
                  </button>
                }
              </div>
            }

            <div class="cs-carousel-actions">
              @if (!current.isPrimary) {
                <button
                  type="button"
                  class="cs-btn-ghost"
                  (click)="onSetPrimary(current)"
                  [disabled]="isUploading()"
                >
                  Postavi kao glavnu
                </button>
              }
              <button
                type="button"
                class="cs-btn-danger"
                (click)="onDeleteImage(current)"
                [disabled]="isUploading()"
              >
                Obriši sliku
              </button>
            </div>
          }

          @if (canAddMore()) {
            <div
              class="cs-drop"
              [class.over]="isDragOver()"
              [class.disabled]="isUploading()"
              (dragover)="onDragOver($event)"
              (dragleave)="onDragLeave($event)"
              (drop)="onDrop($event)"
              (click)="fileInput.click()"
            >
              @if (isUploading()) {
                <span class="cs-muted">Upload u toku…</span>
              } @else {
                <lucide-icon name="image-plus" [size]="22" />
                <span class="cs-muted">Prevuci slike ili klikni za dodavanje</span>
                <span class="cs-hint">PNG, JPG, WEBP do 5MB</span>
              }
              <input #fileInput type="file" accept="image/*" multiple hidden (change)="onFilesSelected($event)" />
            </div>
          }
        </section>

        @if (lightboxOpen()) {
          <app-image-lightbox
            [images]="lightboxImages()"
            [initialIndex]="carouselIndex()"
            (close)="closeLightbox()"
          />
        }
      } @else {
        <p class="cs-muted">Vozilo nije pronađeno</p>
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .cs-back-btn {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-spacer {
        flex: 1;
      }
      .cs-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-pad {
        padding: 20px;
      }
      .cs-gallery {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-gallery-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .cs-sect-title {
        font-family: var(--font-display);
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
        margin: 0;
      }
      .cs-carousel {
        position: relative;
        border-radius: 12px;
        overflow: hidden;
        background: var(--cs-bg-3);
      }
      .cs-carousel-hero {
        display: block;
        width: 100%;
        padding: 0;
        border: none;
        background: var(--cs-bg-3);
        cursor: zoom-in;
        position: relative;
        aspect-ratio: 16 / 10;
        overflow: hidden;
      }
      .cs-carousel-hero img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.18s ease;
      }
      .cs-carousel-hero:hover img {
        transform: scale(1.02);
      }
      .cs-carousel-count {
        position: absolute;
        bottom: 12px;
        right: 12px;
        padding: 4px 10px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.6);
        backdrop-filter: blur(6px);
        color: #fff;
        font-size: 11px;
        font-weight: 600;
      }
      .cs-carousel-nav {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 40px;
        height: 40px;
        border-radius: 999px;
        background: rgba(0, 0, 0, 0.55);
        backdrop-filter: blur(6px);
        border: 1px solid rgba(255, 255, 255, 0.12);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.12s ease;
      }
      .cs-carousel-nav:hover {
        background: rgba(0, 0, 0, 0.75);
      }
      .cs-carousel-nav.left {
        left: 12px;
      }
      .cs-carousel-nav.right {
        right: 12px;
      }
      .cs-thumbs {
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 4px 0 2px;
      }
      .cs-thumb {
        position: relative;
        flex: 0 0 auto;
        width: 80px;
        height: 56px;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid transparent;
        padding: 0;
        background: var(--cs-bg-3);
        cursor: pointer;
        transition: border-color 0.12s ease, transform 0.12s ease;
      }
      .cs-thumb:hover {
        transform: translateY(-1px);
      }
      .cs-thumb.active {
        border-color: var(--cs-accent);
      }
      .cs-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cs-thumb-primary {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--cs-accent);
        box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.55);
      }
      .cs-carousel-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cs-btn-ghost {
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .cs-btn-ghost:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-btn-danger {
        padding: 8px 14px;
        border-radius: 9px;
        background: transparent;
        border: 1px solid var(--cs-status-danger);
        color: var(--cs-status-danger);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-danger:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-primary-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        padding: 3px 10px;
        border-radius: 6px;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        font-size: 10px;
        font-weight: 700;
      }
      .cs-drop {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 24px;
        border-radius: 10px;
        border: 1px dashed var(--cs-border);
        cursor: pointer;
        color: var(--cs-text-tertiary);
      }
      .cs-drop.over {
        border-color: var(--cs-accent);
        background: var(--cs-accent-soft);
      }
      .cs-drop.disabled {
        pointer-events: none;
        opacity: 0.5;
      }
      .cs-hint {
        font-size: 11px;
      }
      .cs-muted {
        color: var(--cs-text-tertiary);
        font-size: 13px;
      }
    `,
  ],
})
export class VehicleDetailPageComponent implements OnInit {
  readonly id = input.required<string>();

  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);

  readonly vehicleDetail = signal<VehicleDetail | null>(null);
  readonly isLoading = signal(true);
  readonly isUploading = signal(false);
  readonly isDragOver = signal(false);
  readonly lightboxOpen = signal(false);

  readonly canAddMore = computed(() => {
    const detail = this.vehicleDetail();
    return detail !== null && detail.images.length < 10;
  });

  readonly carouselIndex = linkedSignal<number, number>({
    source: () => this.vehicleDetail()?.images.length ?? 0,
    computation: (len, previous) => {
      if (len === 0) return 0;
      const prev = previous?.value ?? 0;
      return Math.max(0, Math.min(len - 1, prev));
    },
  });

  readonly currentImage = computed<VehicleImage | null>(() => {
    const detail = this.vehicleDetail();
    if (!detail || detail.images.length === 0) return null;
    return detail.images[this.carouselIndex()] ?? detail.images[0] ?? null;
  });

  readonly lightboxImages = computed<LightboxImage[]>(() =>
    this.vehicleDetail()?.images.map((i) => ({ url: i.imageUrl })) ?? [],
  );

  ngOnInit(): void {
    this.loadDetail();
  }

  onEdit(): void {
    this.router.navigate(['/vehicles', this.id(), 'edit']);
  }

  onSetPrimary(image: VehicleImage): void {
    if (image.isPrimary) return;
    this.vehicleService.setPrimaryImage(this.id(), image.id).subscribe({
      next: () => this.loadDetail(),
    });
  }

  onDeleteImage(image: VehicleImage): void {
    this.vehicleService.deleteImage(this.id(), image.id).subscribe({
      next: () => this.loadDetail(),
    });
  }

  prevImage(): void {
    const len = this.vehicleDetail()?.images.length ?? 0;
    if (len <= 1) return;
    this.carouselIndex.update((i) => (i - 1 + len) % len);
  }

  nextImage(): void {
    const len = this.vehicleDetail()?.images.length ?? 0;
    if (len <= 1) return;
    this.carouselIndex.update((i) => (i + 1) % len);
  }

  openLightbox(index: number): void {
    this.carouselIndex.set(index);
    this.lightboxOpen.set(true);
  }

  closeLightbox(): void {
    this.lightboxOpen.set(false);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    const files = event.dataTransfer?.files;
    if (files) this.uploadFiles(Array.from(files));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.uploadFiles(Array.from(input.files));
      input.value = '';
    }
  }

  goBack(): void {
    this.router.navigate(['/vehicles']);
  }

  private loadDetail(): void {
    this.vehicleService.getDetail(this.id()).subscribe({
      next: (detail) => {
        this.vehicleDetail.set(detail);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private uploadFiles(files: File[]): void {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const detail = this.vehicleDetail();
    if (!detail || imageFiles.length === 0) return;

    const remaining = 10 - detail.images.length;
    const toUpload = imageFiles.slice(0, remaining);

    this.isUploading.set(true);

    const uploads = toUpload.map((file) => this.vehicleService.uploadImage(this.id(), file, false));

    concat(...uploads)
      .pipe(last())
      .subscribe({
        next: () => {
          this.isUploading.set(false);
          this.loadDetail();
        },
        error: () => {
          this.isUploading.set(false);
          this.loadDetail();
        },
      });
  }
}
