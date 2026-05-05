import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ServiceBookService } from '../services/service-book.service';
import { VehicleService } from '../../vehicles/services/vehicle.service';
import {
  CreateServiceRecordRequest,
  ServiceRecordType,
  SERVICE_RECORD_TYPE_LABELS,
  UpdateServiceRecordRequest,
} from '../models/service-book.model';
import { Vehicle } from '../../vehicles/models/vehicle.model';

interface FormState {
  vehicleId: string;
  serviceDate: string;
  mileageAtService: number;
  type: ServiceRecordType;
  cost: number;
  currency: string;
  description: string;
  workshopName: string;
  workshopContact: string;
}

@Component({
  selector: 'app-service-record-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <form class="cs-page" (submit)="onSubmit($event)">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">{{ isEdit() ? 'Uredi servis' : 'Dodaj servis' }}</h1>
          <p class="cs-page-sub">Unesi detalje o izvršenom servisu vozila</p>
        </div>
        <div class="cs-actions">
          <button type="button" class="cs-btn-secondary" (click)="onCancel()">Otkaži</button>
          <button type="submit" class="cs-btn-primary" [disabled]="submitting() || !canSubmit()">
            <lucide-icon name="save" [size]="14" />
            {{ submitting() ? 'Spremanje…' : 'Spremi' }}
          </button>
        </div>
      </header>

      @if (errorMessage()) {
        <div class="cs-error">{{ errorMessage() }}</div>
      }

      <div class="cs-card">
        <div class="cs-grid">
          <label class="cs-field">
            <span>Vozilo *</span>
            <select [ngModel]="state().vehicleId" name="vehicleId"
                    [disabled]="isEdit()"
                    (ngModelChange)="upd('vehicleId', $event)" required>
              <option value="">— odaberi vozilo —</option>
              @for (v of vehicles(); track v.id) {
                <option [value]="v.id">{{ v.brand }} {{ v.model }} ({{ v.licensePlate }})</option>
              }
            </select>
          </label>

          <label class="cs-field">
            <span>Tip servisa *</span>
            <select [ngModel]="state().type" name="type"
                    (ngModelChange)="upd('type', +$event)" required>
              @for (opt of typeOptions; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </label>

          <label class="cs-field">
            <span>Datum servisa *</span>
            <input type="date" [ngModel]="state().serviceDate" name="serviceDate"
                   (ngModelChange)="upd('serviceDate', $event)" required />
          </label>

          <label class="cs-field">
            <span>Kilometraža (km) *</span>
            <input type="number" min="0" [ngModel]="state().mileageAtService" name="mileage"
                   (ngModelChange)="upd('mileageAtService', +$event)" required />
          </label>

          <label class="cs-field">
            <span>Cijena *</span>
            <input type="number" min="0" step="0.01" [ngModel]="state().cost" name="cost"
                   (ngModelChange)="upd('cost', +$event)" required />
          </label>

          <label class="cs-field">
            <span>Valuta</span>
            <input type="text" maxlength="3" [ngModel]="state().currency" name="currency"
                   (ngModelChange)="upd('currency', $event)" />
          </label>

          <label class="cs-field cs-field-full">
            <span>Opis</span>
            <textarea rows="3" [ngModel]="state().description" name="description"
                      (ngModelChange)="upd('description', $event)"
                      placeholder="Šta je urađeno na servisu…"></textarea>
          </label>

          <label class="cs-field">
            <span>Naziv servisa</span>
            <input type="text" [ngModel]="state().workshopName" name="workshopName"
                   (ngModelChange)="upd('workshopName', $event)" />
          </label>

          <label class="cs-field">
            <span>Kontakt servisa</span>
            <input type="text" [ngModel]="state().workshopContact" name="workshopContact"
                   (ngModelChange)="upd('workshopContact', $event)" />
          </label>
        </div>
      </div>
    </form>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-actions {
        display: flex;
        gap: 8px;
      }
      .cs-btn-primary,
      .cs-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
      }
      .cs-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-btn-secondary {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
      }
      .cs-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        padding: 20px;
      }
      .cs-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .cs-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cs-field-full {
        grid-column: 1 / -1;
      }
      .cs-field span {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        font-weight: 600;
      }
      .cs-field input,
      .cs-field select,
      .cs-field textarea {
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        border-radius: 8px;
        padding: 9px 10px;
        font-family: var(--font-text);
        font-size: 13px;
        color: var(--cs-text-primary);
        outline: none;
        /* Forsira dark native dropdown (Chrome/Edge/Firefox) — bez ovoga
           browser renderira <option> u svojoj svijetloj temi. */
        color-scheme: dark;
      }
      .cs-field select option {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-field input:focus,
      .cs-field select:focus,
      .cs-field textarea:focus {
        border-color: var(--cs-accent);
      }
      .cs-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 12px;
        border-radius: 8px;
        font-size: 13px;
      }
    `,
  ],
})
export class ServiceRecordFormComponent implements OnInit {
  private readonly serviceBook = inject(ServiceBookService);
  private readonly vehicleService = inject(VehicleService);
  private readonly router = inject(Router);

  readonly recordId = input<string | null>(null);
  readonly initialVehicleId = input<string | null>(null);
  readonly saved = output<string>();

  protected readonly state = signal<FormState>({
    vehicleId: '',
    serviceDate: this.todayIso(),
    mileageAtService: 0,
    type: ServiceRecordType.RegularService,
    cost: 0,
    currency: 'BAM',
    description: '',
    workshopName: '',
    workshopContact: '',
  });
  protected readonly vehicles = signal<Vehicle[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly isEdit = computed(() => !!this.recordId());
  protected readonly canSubmit = computed(
    () => !!this.state().vehicleId && !!this.state().serviceDate && this.state().cost >= 0,
  );

  protected readonly typeOptions = Object.entries(SERVICE_RECORD_TYPE_LABELS).map(([k, v]) => ({
    value: Number(k) as ServiceRecordType,
    label: v,
  }));

  ngOnInit(): void {
    this.vehicleService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => this.vehicles.set(res.items),
    });

    const initVehicle = this.initialVehicleId();
    if (initVehicle) this.upd('vehicleId', initVehicle);

    const id = this.recordId();
    if (id) {
      this.serviceBook.getRecordById(id).subscribe({
        next: (r) => {
          this.state.set({
            vehicleId: r.vehicleId,
            serviceDate: r.serviceDate.substring(0, 10),
            mileageAtService: r.mileageAtService,
            type: r.type,
            cost: r.cost,
            currency: r.currency,
            description: r.description ?? '',
            workshopName: r.workshopName ?? '',
            workshopContact: r.workshopContact ?? '',
          });
        },
      });
    }
  }

  protected upd<K extends keyof FormState>(key: K, value: FormState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    if (!this.canSubmit() || this.submitting()) return;

    this.submitting.set(true);
    this.errorMessage.set(null);

    const s = this.state();
    const id = this.recordId();

    if (id) {
      const req: UpdateServiceRecordRequest = {
        serviceDate: s.serviceDate,
        mileageAtService: s.mileageAtService,
        type: s.type,
        cost: s.cost,
        currency: s.currency,
        description: s.description || undefined,
        workshopName: s.workshopName || undefined,
        workshopContact: s.workshopContact || undefined,
      };
      this.serviceBook.updateRecord(id, req).subscribe({
        next: () => {
          this.submitting.set(false);
          this.saved.emit(id);
        },
        error: (err) => this.handleError(err),
      });
    } else {
      const req: CreateServiceRecordRequest = {
        vehicleId: s.vehicleId,
        serviceDate: s.serviceDate,
        mileageAtService: s.mileageAtService,
        type: s.type,
        cost: s.cost,
        currency: s.currency,
        description: s.description || undefined,
        workshopName: s.workshopName || undefined,
        workshopContact: s.workshopContact || undefined,
      };
      this.serviceBook.createRecord(req).subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.saved.emit(res.serviceRecordId);
        },
        error: (err) => this.handleError(err),
      });
    }
  }

  protected onCancel(): void {
    this.router.navigate(['/service-book/records']);
  }

  private handleError(err: unknown): void {
    this.submitting.set(false);
    const msg = (err as { error?: { message?: string } })?.error?.message;
    this.errorMessage.set(msg ?? 'Greška pri spremanju.');
  }

  private todayIso(): string {
    return new Date().toISOString().substring(0, 10);
  }
}
