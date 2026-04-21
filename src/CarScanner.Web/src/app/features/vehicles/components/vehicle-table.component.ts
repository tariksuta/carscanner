import { Component, input, output } from '@angular/core';
import { Vehicle, VEHICLE_STATUS_LABELS } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicle-table',
  standalone: true,
  template: `
    <div class="rounded-md border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="w-16 px-4 py-3 text-left font-medium text-muted-foreground">Image</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Brand</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Model</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Year</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">License Plate</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Mileage</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (vehicle of vehicles(); track vehicle.id) {
            <tr class="border-b border-border transition-colors hover:bg-muted/50">
              <td class="px-4 py-3">
                @if (vehicle.primaryImageUrl) {
                  <img [src]="vehicle.primaryImageUrl" [alt]="vehicle.brand + ' ' + vehicle.model"
                    class="h-10 w-10 rounded object-cover" />
                } @else {
                  <div class="flex h-10 w-10 items-center justify-center rounded bg-muted">
                    <svg class="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                }
              </td>
              <td class="px-4 py-3 font-medium">{{ vehicle.brand }}</td>
              <td class="px-4 py-3">{{ vehicle.model }}</td>
              <td class="px-4 py-3">{{ vehicle.year }}</td>
              <td class="px-4 py-3">{{ vehicle.licensePlate }}</td>
              <td class="px-4 py-3">
                <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="getStatusClass(vehicle.status)">
                  {{ getStatusLabel(vehicle.status) }}
                </span>
              </td>
              <td class="px-4 py-3">{{ vehicle.currentMileage }} km</td>
              <td class="px-4 py-3 text-right">
                <button (click)="view.emit(vehicle.id)" class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">View</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="8" class="px-4 py-8 text-center text-muted-foreground">No vehicles found</td></tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class VehicleTableComponent {
  vehicles = input.required<Vehicle[]>();
  view = output<string>();

  getStatusLabel(status: number): string {
    return VEHICLE_STATUS_LABELS[status as keyof typeof VEHICLE_STATUS_LABELS] ?? 'Unknown';
  }

  getStatusClass(status: number): string {
    const c: Record<number, string> = { 0: 'bg-green-500/10 text-green-400', 1: 'bg-blue-500/10 text-blue-400', 2: 'bg-yellow-500/10 text-yellow-400', 3: 'bg-red-500/10 text-red-400' };
    return c[status] ?? 'bg-gray-500/10 text-gray-400';
  }
}
