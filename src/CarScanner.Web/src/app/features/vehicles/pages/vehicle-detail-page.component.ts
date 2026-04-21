import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { concat } from 'rxjs';
import { last } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { VehicleCardComponent } from '../components/vehicle-card.component';
import { VehicleService } from '../services/vehicle.service';
import { VehicleDetail, VehicleImage } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicle-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehicleCardComponent, LucideAngularModule],
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

          @if (detail.images.length > 0) {
            <div class="cs-img-grid">
              @for (image of detail.images; track image.id) {
                <div class="cs-img-tile" [class.primary]="image.isPrimary">
                  <img [src]="image.imageUrl" alt="" />
                  <div class="cs-img-actions">
                    @if (!image.isPrimary) {
                      <button type="button" (click)="onSetPrimary(image)" [disabled]="isUploading()">
                        Postavi kao glavnu
                      </button>
                    }
                    <button
                      type="button"
                      class="danger"
                      (click)="onDeleteImage(image)"
                      [disabled]="isUploading()"
                    >
                      Obriši
                    </button>
                  </div>
                  @if (image.isPrimary) {
                    <span class="cs-primary-tag">Glavna</span>
                  }
                </div>
              }
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
      .cs-img-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 10px;
      }
      .cs-img-tile {
        position: relative;
        aspect-ratio: 1 / 1;
        border-radius: 10px;
        overflow: hidden;
        border: 1px solid var(--cs-border-subtle);
        background: var(--cs-bg-3);
      }
      .cs-img-tile.primary {
        box-shadow: 0 0 0 2px var(--cs-accent);
      }
      .cs-img-tile img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .cs-img-actions {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: rgba(0, 0, 0, 0.55);
        opacity: 0;
        transition: opacity 0.12s ease;
      }
      .cs-img-tile:hover .cs-img-actions {
        opacity: 1;
      }
      .cs-img-actions button {
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.9);
        color: #0a0b0d;
        border: none;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-img-actions button.danger {
        background: var(--cs-status-danger);
        color: #fff;
      }
      .cs-img-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-primary-tag {
        position: absolute;
        top: 6px;
        left: 6px;
        padding: 2px 8px;
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

  readonly canAddMore = computed(() => {
    const detail = this.vehicleDetail();
    return detail !== null && detail.images.length < 10;
  });

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
