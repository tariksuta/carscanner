import { Component, output, signal } from '@angular/core';

interface ImagePreview {
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

@Component({
  selector: 'app-image-gallery-upload',
  standalone: true,
  template: `
    <div class="space-y-4">
      <label class="text-sm font-medium">Vehicle Images (max 10)</label>

      <div
        class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors cursor-pointer"
        [class.border-primary]="isDragOver()"
        [class.bg-primary/5]="isDragOver()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()">
        <svg class="mb-2 h-10 w-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-sm text-muted-foreground">Drag and drop images here, or click to browse</p>
        <p class="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB each</p>
        <input #fileInput type="file" accept="image/*" multiple class="hidden"
          (change)="onFilesSelected($event)" />
      </div>

      @if (images().length > 0) {
        <p class="text-sm text-muted-foreground">{{ images().length }} / 10 images selected</p>

        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          @for (image of images(); track image.previewUrl; let i = $index) {
            <div class="group relative overflow-hidden rounded-lg border border-border"
              [class.ring-2]="image.isPrimary"
              [class.ring-primary]="image.isPrimary">
              <img [src]="image.previewUrl" [alt]="image.file.name"
                class="aspect-square w-full object-cover" />
              <div class="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                @if (!image.isPrimary) {
                  <button type="button" (click)="setPrimary(i); $event.stopPropagation()"
                    class="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-900 hover:bg-white">
                    Set as Primary
                  </button>
                }
                <button type="button" (click)="removeImage(i); $event.stopPropagation()"
                  class="rounded bg-red-500/90 px-2 py-1 text-xs font-medium text-white hover:bg-red-500">
                  Remove
                </button>
              </div>
              @if (image.isPrimary) {
                <div class="absolute left-1 top-1 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                  Primary
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class ImageGalleryUploadComponent {
  imagesChange = output<{ file: File; isPrimary: boolean }[]>();

  images = signal<ImagePreview[]>([]);
  isDragOver = signal(false);

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
    if (files) this.addFiles(Array.from(files));
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
      input.value = '';
    }
  }

  setPrimary(index: number): void {
    this.images.update((imgs) => imgs.map((img, i) => ({ ...img, isPrimary: i === index })));
    this.emitChanges();
  }

  removeImage(index: number): void {
    this.images.update((imgs) => {
      const removed = imgs[index];
      const updated = imgs.filter((_, i) => i !== index);
      if (removed.isPrimary && updated.length > 0) {
        updated[0] = { ...updated[0], isPrimary: true };
      }
      URL.revokeObjectURL(removed.previewUrl);
      return updated;
    });
    this.emitChanges();
  }

  private addFiles(files: File[]): void {
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const remaining = 10 - this.images().length;
    const toAdd = imageFiles.slice(0, remaining);

    const newPreviews: ImagePreview[] = toAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      isPrimary: false,
    }));

    const current = this.images();
    if (current.length === 0 && newPreviews.length > 0) {
      newPreviews[0].isPrimary = true;
    }

    this.images.set([...current, ...newPreviews]);
    this.emitChanges();
  }

  private emitChanges(): void {
    this.imagesChange.emit(this.images().map((img) => ({ file: img.file, isPrimary: img.isPrimary })));
  }
}
