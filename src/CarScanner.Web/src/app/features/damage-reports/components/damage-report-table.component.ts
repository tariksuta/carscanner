import { Component, input, output } from '@angular/core';
import { DamageReport, DAMAGE_REPORT_STATUS_LABELS } from '../models/damage-report.model';

@Component({
  selector: 'app-damage-report-table',
  standalone: true,
  template: `
    <div class="rounded-md border border-border">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-border bg-muted/50">
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Rental</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Damages</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Est. Cost</th>
            <th class="px-4 py-3 text-left font-medium text-muted-foreground">Requested</th>
            <th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          @for (report of reports(); track report.id) {
            <tr class="border-b border-border transition-colors hover:bg-muted/50">
              <td class="px-4 py-3 font-medium">{{ report.rentalId }}</td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                  [class]="getStatusClass(report.status)"
                >
                  {{ getStatusLabel(report.status) }}
                </span>
              </td>
              <td class="px-4 py-3">{{ report.damageItems?.length ?? 0 }}</td>
              <td class="px-4 py-3">{{ report.totalEstimatedCost ? ('$' + report.totalEstimatedCost) : '-' }}</td>
              <td class="px-4 py-3">{{ report.requestedAt }}</td>
              <td class="px-4 py-3 text-right">
                <button
                  (click)="view.emit(report.id)"
                  class="rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  View
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="px-4 py-8 text-center text-muted-foreground">
                No damage reports found
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DamageReportTableComponent {
  reports = input.required<DamageReport[]>();
  view = output<string>();

  getStatusLabel(status: number): string {
    return DAMAGE_REPORT_STATUS_LABELS[status as keyof typeof DAMAGE_REPORT_STATUS_LABELS] ?? 'Unknown';
  }

  getStatusClass(status: number): string {
    const classes: Record<number, string> = {
      0: 'bg-gray-500/10 text-gray-400',
      1: 'bg-yellow-500/10 text-yellow-400',
      2: 'bg-green-500/10 text-green-400',
      3: 'bg-green-500/10 text-green-400',
      4: 'bg-red-500/10 text-red-400',
      5: 'bg-red-500/10 text-red-400',
    };
    return classes[status] ?? 'bg-gray-500/10 text-gray-400';
  }
}
