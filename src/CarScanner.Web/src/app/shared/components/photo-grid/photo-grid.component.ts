import { Component, input } from '@angular/core';

export interface PhotoItem {
  url: string;
  label: string;
}

@Component({
  selector: 'app-photo-grid',
  standalone: true,
  template: `
    <div class="grid grid-cols-2 gap-4">
      @for (photo of photos(); track photo.url) {
        <div class="rounded-lg border border-border overflow-hidden">
          <img [src]="photo.url" [alt]="photo.label" class="w-full h-48 object-cover" />
          <div class="p-2 bg-muted/50">
            <p class="text-xs font-medium text-center">{{ photo.label }}</p>
          </div>
        </div>
      } @empty {
        <div class="col-span-2 rounded-lg border border-dashed border-border p-8 text-center">
          <p class="text-muted-foreground">No photos available</p>
        </div>
      }
    </div>
  `,
})
export class PhotoGridComponent {
  photos = input.required<PhotoItem[]>();
}
