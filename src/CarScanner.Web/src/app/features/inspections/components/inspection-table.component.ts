import { Component, input, output } from '@angular/core';
import { VehicleInspection, INSPECTION_TYPE_LABELS, INSPECTION_STATUS_LABELS } from '../models/inspection.model';

@Component({
  selector: 'app-inspection-table', standalone: true,
  template: `
    <div class="rounded-md border border-border"><table class="w-full text-sm">
      <thead><tr class="border-b border-border bg-muted/50">
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">Rental</th>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
        <th class="px-4 py-3 text-left font-medium text-muted-foreground">Photos</th>
        <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
      </tr></thead>
      <tbody>
        @for (i of inspections(); track i.id) {
          <tr class="border-b border-border hover:bg-muted/50">
            <td class="px-4 py-3 font-medium">{{ i.rentalId }}</td>
            <td class="px-4 py-3"><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="i.inspectionType === 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-orange-500/10 text-orange-400'">{{ typeLabel(i.inspectionType) }}</span></td>
            <td class="px-4 py-3"><span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium" [class]="statusClass(i.status)">{{ statusLabel(i.status) }}</span></td>
            <td class="px-4 py-3">{{ i.photos?.length ?? 0 }} / 4</td>
            <td class="px-4 py-3 text-right"><button (click)="view.emit(i.id)" class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">View</button></td>
          </tr>
        } @empty { <tr><td colspan="5" class="px-4 py-8 text-center text-muted-foreground">No inspections found</td></tr> }
      </tbody>
    </table></div>
  `,
})
export class InspectionTableComponent {
  inspections = input.required<VehicleInspection[]>(); view = output<string>();
  typeLabel(t: number): string { return INSPECTION_TYPE_LABELS[t as keyof typeof INSPECTION_TYPE_LABELS] ?? 'Unknown'; }
  statusLabel(s: number): string { return INSPECTION_STATUS_LABELS[s as keyof typeof INSPECTION_STATUS_LABELS] ?? 'Unknown'; }
  statusClass(s: number): string { const c: Record<number,string>={0:'bg-gray-500/10 text-gray-400',1:'bg-yellow-500/10 text-yellow-400',2:'bg-blue-500/10 text-blue-400',3:'bg-green-500/10 text-green-400'}; return c[s]??'bg-gray-500/10 text-gray-400'; }
}
