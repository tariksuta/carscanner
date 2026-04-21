import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
  VehicleDetail,
  VehicleStatus,
} from '../models/vehicle.model';
import { VehicleService } from '../services/vehicle.service';
import { VehicleStore } from '../store/vehicle.store';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';

type FuelKind = 'petrol' | 'diesel' | 'hybrid' | 'electric';
type GearKind = 'manual' | 'automatic' | 'dsg';

interface VehicleFormState {
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  vin: string;
  color: string;
  currentMileage: number;
  status: VehicleStatus;
  fuel: FuelKind;
  gear: GearKind;
  powerKw: number | null;
  seats: number | null;
  registrationExpiry: string;
  insuranceExpiry: string;
}

const SWATCHES = ['#0A0B0D', '#C9CDD3', '#1F2A44', '#FF5C5C', '#EAEAEC', '#1B5E3E', '#B03A3A'];

const VIN_RE = /^[A-HJ-NPR-Z0-9]{17}$/;
const PLATE_RE = /^[A-Z0-9]{3}-[A-Z0-9]-[A-Z0-9]{3}$/;

function formatPlate(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 4) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 4)}-${cleaned.slice(4)}`;
}

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, FormShellComponent, FormFieldComponent],
  template: `
    <app-form-shell
      [title]="mode() === 'edit' ? 'Uredi vozilo' : 'Dodaj vozilo'"
      [subtitle]="mode() === 'edit' ? 'Ažuriraj informacije o vozilu' : 'Unesi podatke za novo vozilo u floti'"
      [submitLabel]="mode() === 'edit' ? 'Sačuvaj izmjene' : 'Dodaj vozilo'"
      [submitDisabled]="submitting()"
      [statusLabel]="mode() === 'edit' ? 'Izmjena' : null"
      statusVariant="info"
      (submitted)="submit()"
      (cancelled)="cancel()"
    >
      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Osnovni podaci</h3>
        <div class="cs-2col">
          <app-form-field label="Proizvođač" [required]="true">
            <input type="text" [value]="state().brand" (input)="upd('brand', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Model" [required]="true">
            <input type="text" [value]="state().model" (input)="upd('model', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Godina" [required]="true">
            <input type="number" [value]="state().year" (input)="updNum('year', $event)" />
          </app-form-field>
          <app-form-field
            label="Registarska tablica"
            [required]="true"
            hint="Format: XXX-X-XXX"
            [error]="plateError()"
          >
            <input
              type="text"
              data-mono="true"
              placeholder="123-K-456"
              maxlength="9"
              [value]="state().licensePlate"
              (input)="onPlateInput($any($event.target).value)"
            />
          </app-form-field>
          <app-form-field label="VIN" hint="17 karaktera" [error]="vinError()">
            <input
              type="text"
              data-mono="true"
              maxlength="17"
              [value]="state().vin"
              (input)="upd('vin', $any($event.target).value.toUpperCase())"
            />
          </app-form-field>
          <app-form-field label="Kilometraža">
            <input type="number" [value]="state().currentMileage" (input)="updNum('currentMileage', $event)" />
          </app-form-field>
        </div>
      </section>

      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Tehničke specifikacije</h3>
        <div class="cs-2col">
          <app-form-field label="Gorivo">
            <select [value]="state().fuel" (change)="upd('fuel', $any($event.target).value)">
              <option value="petrol">Benzin</option>
              <option value="diesel">Dizel</option>
              <option value="hybrid">Hibrid</option>
              <option value="electric">Električno</option>
            </select>
          </app-form-field>
          <app-form-field label="Mjenjač">
            <select [value]="state().gear" (change)="upd('gear', $any($event.target).value)">
              <option value="manual">Ručni</option>
              <option value="automatic">Automatski</option>
              <option value="dsg">DSG</option>
            </select>
          </app-form-field>
          <app-form-field label="Snaga" hint="kW">
            <input type="number" [value]="state().powerKw ?? 0" (input)="updNum('powerKw', $event)" />
          </app-form-field>
          <app-form-field label="Broj sjedišta">
            <input type="number" [value]="state().seats ?? 5" (input)="updNum('seats', $event)" />
          </app-form-field>
        </div>
      </section>

      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Boja i dostupnost</h3>
        <app-form-field label="Boja vozila">
          <div class="cs-swatches">
            @for (s of swatches; track s) {
              <button
                type="button"
                class="cs-swatch"
                [class.active]="state().color === s"
                [style.background]="s"
                [attr.aria-label]="s"
                (click)="upd('color', s)"
              ></button>
            }
          </div>
        </app-form-field>
        <app-form-field label="Status">
          <select [value]="state().status" (change)="updNum('status', $event)">
            <option [value]="0">Dostupno</option>
            <option [value]="1">Izdato</option>
            <option [value]="2">Servis</option>
            <option [value]="3">Van službe</option>
          </select>
        </app-form-field>
      </section>

      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Dokumenti</h3>
        <div class="cs-2col">
          <app-form-field label="Registracija vrijedi do">
            <input type="date" [value]="state().registrationExpiry" (input)="upd('registrationExpiry', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Polisa vrijedi do">
            <input type="date" [value]="state().insuranceExpiry" (input)="upd('insuranceExpiry', $any($event.target).value)" />
          </app-form-field>
        </div>
        <button type="button" class="cs-dashed-btn">
          <lucide-icon name="plus" [size]="14" /> Upload saobraćajne + polise
        </button>
      </section>

      @if (mode() === 'edit') {
        <section class="cs-card cs-pad cs-danger-zone">
          <h3 class="cs-sect-title danger">Opasna zona</h3>
          <div class="cs-danger-row">
            <div>
              <div class="cs-danger-title">Arhiviraj vozilo</div>
              <div class="cs-danger-sub">
                Vozilo više neće biti dostupno za rentale. Historija ostaje sačuvana.
              </div>
            </div>
            <button type="button" class="cs-btn-danger" (click)="onArchive()">Arhiviraj</button>
          </div>
        </section>
      }
    </app-form-shell>
  `,
  styles: [
    `
      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-pad {
        padding: 20px;
      }
      .cs-sect-title {
        font-family: var(--font-display);
        font-size: 11px;
        font-weight: 700;
        color: var(--cs-text-tertiary);
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin: 0 0 16px;
      }
      .cs-sect-title.danger {
        color: var(--cs-status-danger);
      }
      .cs-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      @media (max-width: 700px) {
        .cs-2col {
          grid-template-columns: 1fr;
        }
      }
      .cs-swatches {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cs-swatch {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        border: 2px solid transparent;
        cursor: pointer;
        box-shadow: inset 0 0 0 1px var(--cs-border-subtle);
      }
      .cs-swatch.active {
        border-color: var(--cs-accent);
        box-shadow: 0 0 0 2px rgba(216, 255, 60, 0.25);
      }
      .cs-dashed-btn {
        margin-top: 12px;
        width: 100%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        padding: 10px;
        border-radius: 10px;
        background: transparent;
        border: 1px dashed var(--cs-border);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-danger-zone {
        background: rgba(255, 92, 92, 0.04);
      }
      .cs-danger-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      .cs-danger-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-danger-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
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
    `,
  ],
})
export class VehicleFormComponent implements OnInit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly vehicle = input<Vehicle | VehicleDetail | null>(null);
  readonly saved = output<string>();

  private readonly svc = inject(VehicleService);
  private readonly store = inject(VehicleStore);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitted = signal(false);
  readonly swatches = SWATCHES;

  readonly state = signal<VehicleFormState>({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: SWATCHES[0],
    currentMileage: 0,
    status: VehicleStatus.Available,
    fuel: 'petrol',
    gear: 'manual',
    powerKw: null,
    seats: 5,
    registrationExpiry: '',
    insuranceExpiry: '',
  });

  readonly plateError = computed(() => {
    const p = this.state().licensePlate;
    if (!p) return this.submitted() ? 'Registarska oznaka je obavezna.' : null;
    if (!PLATE_RE.test(p)) return 'Format: XXX-X-XXX (npr. 123-K-456).';
    return null;
  });

  readonly vinError = computed(() => {
    const vin = this.state().vin;
    if (!vin) return null;
    if (!VIN_RE.test(vin)) return 'VIN mora imati tačno 17 karaktera (A–Z bez I, O, Q i 0–9).';
    return null;
  });

  readonly canSubmit = computed(() => {
    const s = this.state();
    if (!s.brand.trim() || !s.model.trim() || !s.year) return false;
    if (!PLATE_RE.test(s.licensePlate)) return false;
    if (s.vin && !VIN_RE.test(s.vin)) return false;
    return true;
  });

  ngOnInit(): void {
    const v = this.vehicle();
    if (v) {
      this.state.update((s) => ({
        ...s,
        brand: v.brand,
        model: v.model,
        year: v.year,
        licensePlate: v.licensePlate,
        vin: v.vin,
        color: v.color || s.color,
        currentMileage: v.currentMileage,
        status: v.status,
      }));
    }
  }

  upd<K extends keyof VehicleFormState>(key: K, value: VehicleFormState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  onPlateInput(raw: string): void {
    this.state.update((s) => ({ ...s, licensePlate: formatPlate(raw) }));
  }

  updNum(key: keyof VehicleFormState, ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.state.update((s) => ({ ...s, [key]: Number.isFinite(v) ? v : 0 }));
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.canSubmit() || this.submitting()) return;
    const s = this.state();

    if (this.mode() === 'edit' && this.vehicle()?.id) {
      const req: UpdateVehicleRequest = {
        brand: s.brand,
        model: s.model,
        year: s.year,
        licensePlate: s.licensePlate,
        color: s.color,
        currentMileage: s.currentMileage,
      };
      this.submitting.set(true);
      this.svc.update(this.vehicle()!.id, req).subscribe({
        next: () => {
          this.store.loadVehicles();
          this.saved.emit(this.vehicle()!.id);
        },
        error: () => this.submitting.set(false),
      });
      return;
    }

    const req: CreateVehicleRequest = {
      brand: s.brand,
      model: s.model,
      year: s.year,
      licensePlate: s.licensePlate,
      vin: s.vin,
      color: s.color,
      currentMileage: s.currentMileage,
    };
    this.submitting.set(true);
    this.svc.create(req).subscribe({
      next: (res) => {
        this.store.loadVehicles();
        this.saved.emit(res.vehicleId);
      },
      error: () => this.submitting.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/vehicles']);
  }

  onArchive(): void {
    this.router.navigate(['/vehicles']);
  }
}
