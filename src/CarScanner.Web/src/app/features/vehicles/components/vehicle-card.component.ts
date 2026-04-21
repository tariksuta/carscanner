import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { Vehicle, VehicleDetail, VEHICLE_STATUS_LABELS, VehicleStatus } from '../models/vehicle.model';
import { LicensePlateComponent } from '../../../shared/components/license-plate/license-plate.component';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-vehicle-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, LucideAngularModule, LicensePlateComponent, StatusBadgeComponent],
  template: `
    <button type="button" class="cs-vcard" (click)="activate.emit(vehicle().id)">
      <div class="cs-vcard-media">
        @if (primaryImageUrl()) {
          <img [src]="primaryImageUrl()" [alt]="vehicle().brand + ' ' + vehicle().model" />
        } @else {
          <div class="cs-vcard-empty">
            <lucide-icon name="car" [size]="36" />
          </div>
        }
        <span class="cs-vcard-status">
          <app-status-badge [label]="statusLabel()" [variant]="statusVariant()" />
        </span>
      </div>
      <div class="cs-vcard-body">
        <div class="cs-vcard-title">
          <span>{{ vehicle().brand }} {{ vehicle().model }}</span>
          <span class="cs-vcard-year mono">{{ vehicle().year }}</span>
        </div>
        <app-license-plate [plate]="vehicle().licensePlate" size="md" />
        <div class="cs-vcard-meta">
          <div>
            <div class="cs-vcard-label">Boja</div>
            <div class="cs-vcard-val">{{ vehicle().color }}</div>
          </div>
          <div>
            <div class="cs-vcard-label">Kilometraža</div>
            <div class="cs-vcard-val mono">{{ vehicle().currentMileage | number }} km</div>
          </div>
        </div>
      </div>
    </button>
  `,
  styles: [
    `
      .cs-vcard {
        width: 100%;
        padding: 0;
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        text-align: left;
        font-family: var(--font-text);
        color: inherit;
        transition: border-color 0.12s ease, transform 0.12s ease;
      }
      .cs-vcard:hover {
        border-color: var(--cs-border-strong);
      }
      .cs-vcard-media {
        position: relative;
        aspect-ratio: 16 / 10;
        background: var(--cs-bg-3);
        overflow: hidden;
      }
      .cs-vcard-media img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .cs-vcard-empty {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--cs-text-quaternary);
      }
      .cs-vcard-status {
        position: absolute;
        top: 10px;
        right: 10px;
      }
      .cs-vcard-body {
        padding: 14px 16px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cs-vcard-title {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
        font-family: var(--font-display);
        font-size: 15px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-vcard-year {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        font-weight: 500;
      }
      .cs-vcard-meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-vcard-label {
        font-size: 10px;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-weight: 600;
        margin-bottom: 2px;
      }
      .cs-vcard-val {
        font-size: 13px;
        color: var(--cs-text-primary);
      }
    `,
  ],
})
export class VehicleCardComponent {
  readonly vehicle = input.required<Vehicle | VehicleDetail>();
  readonly activate = output<string>();

  readonly primaryImageUrl = computed(() => {
    const v = this.vehicle();
    if ('primaryImageUrl' in v) return v.primaryImageUrl;
    if ('images' in v) return v.images.find((i) => i.isPrimary)?.imageUrl ?? null;
    return null;
  });

  readonly statusLabel = computed(() => {
    const bs: Partial<Record<VehicleStatus, string>> = {
      [VehicleStatus.Available]: 'Dostupno',
      [VehicleStatus.Rented]: 'Izdato',
      [VehicleStatus.InMaintenance]: 'Servis',
      [VehicleStatus.OutOfService]: 'Van službe',
    };
    return (
      bs[this.vehicle().status as VehicleStatus] ??
      VEHICLE_STATUS_LABELS[this.vehicle().status as keyof typeof VEHICLE_STATUS_LABELS] ??
      '—'
    );
  });

  readonly statusVariant = computed<StatusBadgeVariant>(() => {
    switch (this.vehicle().status) {
      case VehicleStatus.Available:
        return 'success';
      case VehicleStatus.Rented:
        return 'info';
      case VehicleStatus.InMaintenance:
        return 'warning';
      case VehicleStatus.OutOfService:
        return 'danger';
      default:
        return 'default';
    }
  });
}
