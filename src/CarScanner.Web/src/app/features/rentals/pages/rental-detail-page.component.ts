import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RentalStore } from '../store/rental.store';
import { RentalTimelineComponent } from '../components/rental-timeline.component';
import { RENTAL_STATUS_LABELS, RentalStatus } from '../models/rental.model';
import { VehicleStore } from '../../vehicles/store/vehicle.store';
import { ClientStore } from '../../clients/store/client.store';
import { EmployeeStore } from '../../employees/store/employee.store';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../shared/components/status-badge/status-badge.component';
import { LicensePlateComponent } from '../../../shared/components/license-plate/license-plate.component';

@Component({
  selector: 'app-rental-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    RentalTimelineComponent,
    DateFormatPipe,
    StatusBadgeComponent,
    LicensePlateComponent,
  ],
  template: `
    <div class="cs-page">
      @if (store.selectedRental(); as rental) {
        <header class="cs-detail-head">
          <div>
            <button type="button" class="cs-back" (click)="goBack()">
              <lucide-icon name="arrow-left" [size]="14" /> Nazad
            </button>
            <h1 class="cs-page-title">
              Rental <span class="mono">{{ shortId(rental.id) }}</span>
            </h1>
            <div class="cs-detail-meta">
              <app-status-badge [label]="statusLabel(rental.status)" [variant]="statusVariant(rental.status)" />
              <span class="cs-meta-sep">·</span>
              <span class="cs-meta-text">
                Očekivani povratak: <span class="mono">{{ rental.expectedReturnDate | dateFormat: 'date' }}</span>
              </span>
            </div>
          </div>
          <div class="cs-detail-actions">
            @if (nextAction()) {
              @if (needsEmployee()) {
                <select class="cs-select" (change)="onEmployeeChange($event)">
                  <option value="">Odaberi zaposlenika…</option>
                  @for (emp of employeeStore.entities(); track emp.id) {
                    <option [value]="emp.id">{{ emp.firstName }} {{ emp.lastName }}</option>
                  }
                </select>
              }
              <button
                type="button"
                class="cs-btn-primary"
                (click)="advanceStatus()"
                [disabled]="needsEmployee() && !selectedEmployeeId()"
              >
                {{ nextAction() }}
              </button>
            }
            @if (canCancel()) {
              <button type="button" class="cs-btn-danger" (click)="cancelRental()">Otkaži rental</button>
            }
          </div>
        </header>

        <div class="cs-detail-grid">
          <section class="cs-card">
            <header class="cs-card-head">
              <div class="cs-card-title">Timeline</div>
            </header>
            <div class="cs-card-pad">
              <app-rental-timeline [currentStatus]="rental.status" />
            </div>
          </section>

          <div class="cs-detail-col">
            <section class="cs-card">
              <header class="cs-card-head">
                <div class="cs-card-title">Vozilo</div>
              </header>
              <div class="cs-card-pad cs-two">
                <div class="cs-vehicle-mark">
                  <lucide-icon name="car" [size]="22" />
                </div>
                <div>
                  <div class="cs-strong">{{ vehicleLabel() }}</div>
                  @if (vehiclePlate(); as p) {
                    <div class="cs-plate-row"><app-license-plate [plate]="p" size="md" /></div>
                  }
                </div>
              </div>
            </section>

            <section class="cs-card">
              <header class="cs-card-head">
                <div class="cs-card-title">Klijent</div>
              </header>
              <div class="cs-card-pad cs-two">
                <span class="cs-avatar-lg">{{ clientInitials() }}</span>
                <div>
                  <div class="cs-strong">{{ clientName() }}</div>
                  <div class="cs-muted">{{ clientEmail() }}</div>
                </div>
              </div>
            </section>

            @if (rental.notes) {
              <section class="cs-card">
                <header class="cs-card-head">
                  <div class="cs-card-title">Napomene</div>
                </header>
                <div class="cs-card-pad cs-notes">{{ rental.notes }}</div>
              </section>
            }
          </div>
        </div>
      } @else {
        <p class="cs-empty">Rental nije pronađen</p>
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .cs-detail-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }
      .cs-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: none;
        color: var(--cs-text-tertiary);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 8px;
      }
      .cs-back:hover {
        color: var(--cs-text-primary);
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 26px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-detail-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 8px;
      }
      .cs-meta-sep {
        color: var(--cs-text-quaternary);
      }
      .cs-meta-text {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-detail-actions {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .cs-select {
        height: 36px;
        padding: 0 10px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 9px;
        color: var(--cs-text-primary);
        font-family: var(--font-text);
        font-size: 13px;
      }
      .cs-btn-primary {
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        border: none;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-btn-danger {
        padding: 8px 14px;
        border-radius: 9px;
        background: transparent;
        color: var(--cs-status-danger);
        border: 1px solid var(--cs-status-danger);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-danger:hover {
        background: var(--cs-status-danger-soft);
      }

      .cs-detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 900px) {
        .cs-detail-grid {
          grid-template-columns: 1fr;
        }
      }
      .cs-detail-col {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
      }
      .cs-card-head {
        padding: 14px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-card-title {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-card-pad {
        padding: 20px;
      }
      .cs-two {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .cs-vehicle-mark {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: var(--cs-bg-3);
        color: var(--cs-text-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-avatar-lg {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: linear-gradient(135deg, #3bd4a0, #5b9fff);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 16px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-strong {
        font-size: 15px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-muted {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-plate-row {
        margin-top: 6px;
      }
      .cs-notes {
        font-size: 13px;
        color: var(--cs-text-secondary);
        line-height: 1.55;
      }
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class RentalDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly store = inject(RentalStore);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly clientStore = inject(ClientStore);
  protected readonly employeeStore = inject(EmployeeStore);
  private readonly router = inject(Router);

  readonly selectedEmployeeId = signal('');

  readonly vehicleLabel = computed(() => {
    const rental = this.store.selectedRental();
    if (!rental) return '';
    const v = this.vehicleStore.entityMap()[rental.vehicleId];
    return v ? `${v.brand} ${v.model}` : '—';
  });
  readonly vehiclePlate = computed(() => {
    const rental = this.store.selectedRental();
    if (!rental) return null;
    return this.vehicleStore.entityMap()[rental.vehicleId]?.licensePlate ?? null;
  });
  readonly clientName = computed(() => {
    const rental = this.store.selectedRental();
    if (!rental) return '';
    const c = this.clientStore.entityMap()[rental.clientId];
    return c ? `${c.firstName} ${c.lastName}` : '—';
  });
  readonly clientEmail = computed(() => {
    const rental = this.store.selectedRental();
    if (!rental) return '';
    return this.clientStore.entityMap()[rental.clientId]?.email ?? '';
  });
  readonly clientInitials = computed(() => {
    const n = this.clientName();
    return n
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  readonly nextAction = computed(() => {
    const rental = this.store.selectedRental();
    if (!rental) return null;
    switch (rental.status) {
      case RentalStatus.Pending:
        return 'Pokreni preuzimanje';
      case RentalStatus.Active:
        return 'Pokreni povrat';
      default:
        return null;
    }
  });
  readonly needsEmployee = computed(() => {
    const s = this.store.selectedRental()?.status;
    return s === RentalStatus.Pending || s === RentalStatus.Active;
  });
  readonly canCancel = computed(() => {
    const s = this.store.selectedRental()?.status;
    return s === RentalStatus.Pending || s === RentalStatus.PickupInProgress;
  });

  ngOnInit(): void {
    this.store.selectRental(this.id());
    if (!this.store.entities().length) this.store.loadRentals();
    if (!this.vehicleStore.entities().length) this.vehicleStore.loadVehicles();
    if (!this.clientStore.entities().length) this.clientStore.loadClients();
    if (!this.employeeStore.entities().length) this.employeeStore.loadEmployees();
  }

  onEmployeeChange(ev: Event): void {
    this.selectedEmployeeId.set((ev.target as HTMLSelectElement).value);
  }

  advanceStatus(): void {
    const rental = this.store.selectedRental();
    if (!rental) return;
    const target =
      rental.status === RentalStatus.Pending ? RentalStatus.PickupInProgress : RentalStatus.ReturnInProgress;
    this.store.changeStatus({
      id: rental.id,
      status: target,
      employeeId: this.selectedEmployeeId() || undefined,
    });
  }

  cancelRental(): void {
    const rental = this.store.selectedRental();
    if (!rental) return;
    this.store.changeStatus({ id: rental.id, status: RentalStatus.Cancelled });
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
  shortId(id: string): string {
    return id.length > 8 ? `R-${id.slice(0, 4).toUpperCase()}` : id;
  }
  goBack(): void {
    this.router.navigate(['/rentals']);
  }
}
