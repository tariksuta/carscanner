import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { SlicePipe } from '@angular/common';
import { Rental, RentalStatus, RENTAL_STATUS_LABELS } from '../models/rental.model';
import { VehicleStore } from '../../vehicles/store/vehicle.store';
import { ClientStore } from '../../clients/store/client.store';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../shared/components/status-badge/status-badge.component';
import { LicensePlateComponent } from '../../../shared/components/license-plate/license-plate.component';

@Component({
  selector: 'app-rental-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SlicePipe, DateFormatPipe, StatusBadgeComponent, LicensePlateComponent],
  template: `
    <div class="cs-table-card">
      <table class="cs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Klijent</th>
            <th>Vozilo</th>
            <th>Povratak</th>
            <th>Status</th>
            <th style="text-align: right">Akcije</th>
          </tr>
        </thead>
        <tbody>
          @for (r of rows(); track r.id) {
            <tr (click)="view.emit(r.id)">
              <td class="mono muted">{{ shortId(r.id) }}</td>
              <td>
                <div class="cs-cell-2">
                  <span class="cs-avatar">{{ initials(clientLabel(r.clientId)) }}</span>
                  <div>
                    <div class="cs-cell-primary">{{ clientLabel(r.clientId) }}</div>
                    <div class="cs-cell-secondary">{{ r.clientId | slice: 0 : 8 }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>
                  <div class="cs-cell-primary">{{ vehicleLabel(r.vehicleId) }}</div>
                  @if (vehiclePlate(r.vehicleId); as p) {
                    <app-license-plate [plate]="p" size="sm" />
                  }
                </div>
              </td>
              <td>
                <span class="mono">{{ r.expectedReturnDate | dateFormat: 'date' }}</span>
              </td>
              <td>
                <app-status-badge [label]="statusLabel(r.status)" [variant]="statusVariant(r.status)" />
              </td>
              <td style="text-align: right">
                <button type="button" class="cs-row-btn" (click)="view.emit(r.id); $event.stopPropagation()">
                  Detalji →
                </button>
              </td>
            </tr>
          } @empty {
            <tr>
              <td colspan="6" class="cs-empty">Nema rentala</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .cs-table-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
      }
      .cs-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-family: var(--font-text);
      }
      .cs-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1px solid var(--cs-border-subtle);
        white-space: nowrap;
        background: var(--cs-bg-1);
      }
      .cs-table th:first-child,
      .cs-table td:first-child {
        padding-left: 20px;
      }
      .cs-table td {
        padding: 14px 16px;
        font-size: 13px;
        color: var(--cs-text-primary);
        border-bottom: 1px solid var(--cs-border-subtle);
        vertical-align: middle;
      }
      .cs-table tbody tr {
        cursor: pointer;
      }
      .cs-table tbody tr:hover {
        background: var(--cs-bg-2);
      }
      .cs-table tr:last-child td {
        border-bottom: none;
      }
      .cs-cell-2 {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-cell-primary {
        font-size: 13px;
        font-weight: 500;
        color: var(--cs-text-primary);
      }
      .cs-cell-secondary {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-avatar {
        width: 28px;
        height: 28px;
        border-radius: 7px;
        background: linear-gradient(135deg, #3bd4a0, #5b9fff);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-row-btn {
        background: transparent;
        border: none;
        color: var(--cs-accent);
        font-family: var(--font-text);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-empty {
        padding: 48px 20px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
      .muted {
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class RentalTableComponent {
  private readonly vehicleStore = inject(VehicleStore);
  private readonly clientStore = inject(ClientStore);

  readonly rentals = input.required<Rental[]>();
  readonly view = output<string>();

  readonly rows = computed(() => this.rentals());

  shortId(id: string): string {
    return id.length > 8 ? `R-${id.slice(0, 4).toUpperCase()}` : id;
  }

  vehicleLabel(id: string): string {
    const v = this.vehicleStore.entityMap()[id];
    return v ? `${v.brand} ${v.model}` : '—';
  }

  vehiclePlate(id: string): string | null {
    const v = this.vehicleStore.entityMap()[id];
    return v?.licensePlate ?? null;
  }

  clientLabel(id: string): string {
    const c = this.clientStore.entityMap()[id];
    return c ? `${c.firstName} ${c.lastName}` : '—';
  }

  statusLabel(s: number): string {
    return RENTAL_STATUS_LABELS[s as keyof typeof RENTAL_STATUS_LABELS] ?? '—';
  }

  statusVariant(s: number): StatusBadgeVariant {
    switch (s) {
      case RentalStatus.Active:
        return 'success';
      case RentalStatus.Pending:
        return 'warning';
      case RentalStatus.PickupInProgress:
      case RentalStatus.ReturnInProgress:
        return 'info';
      case RentalStatus.Cancelled:
        return 'danger';
      default:
        return 'default';
    }
  }

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
