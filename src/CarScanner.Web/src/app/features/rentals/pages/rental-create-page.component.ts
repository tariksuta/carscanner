import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { RentalService } from '../services/rental.service';
import { CreateRentalRequest } from '../models/rental.model';
import { VehicleStore } from '../../vehicles/store/vehicle.store';
import { ClientStore } from '../../clients/store/client.store';
import { VehicleStatus } from '../../vehicles/models/vehicle.model';
import { WizardStepperComponent, WizardStep } from '../../../shared/components/wizard-stepper/wizard-stepper.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { LicensePlateComponent } from '../../../shared/components/license-plate/license-plate.component';

interface WizardState {
  clientId: string | null;
  vehicleId: string | null;
  pickupAt: string;
  returnAt: string;
  pickupLocation: string;
  returnLocation: string;
  notes: string;
  discountPct: number;
  deposit: number;
  payment: 'card' | 'cash' | 'invoice';
  dailyRate: number;
}

@Component({
  selector: 'app-rental-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    LucideAngularModule,
    WizardStepperComponent,
    FormFieldComponent,
    LicensePlateComponent,
  ],
  template: `
    <div class="cs-wizard">
      <header class="cs-wizard-head">
        <div>
          <h1 class="cs-wizard-title">Novi rental</h1>
          <p class="cs-wizard-sub">Popuni 5 koraka da kreiraš najam vozila.</p>
        </div>
      </header>

      <app-wizard-stepper
        [steps]="steps"
        [current]="current()"
        (jump)="jumpTo($event)"
      />

      <div class="cs-step-pane">
        @switch (current()) {
          <!-- STEP 1: CLIENT -->
          @case (0) {
            <div class="cs-card cs-pad">
              <div class="cs-search-row">
                <lucide-icon name="search" [size]="14" />
                <input
                  type="text"
                  placeholder="Unesi ime, email ili telefon..."
                  [value]="clientQuery()"
                  (input)="onClientQuery($event)"
                />
              </div>
              <div class="cs-pick-list">
                @for (c of filteredClients(); track c.id) {
                  <button
                    type="button"
                    class="cs-pick-row"
                    [class.active]="state().clientId === c.id"
                    (click)="pickClient(c.id)"
                  >
                    <span class="cs-avatar">{{ initials(c.firstName + ' ' + c.lastName) }}</span>
                    <div class="cs-pick-meta">
                      <div class="cs-pick-name">
                        {{ c.firstName }} {{ c.lastName }}
                      </div>
                      <div class="cs-pick-sub">{{ c.email }}</div>
                    </div>
                    @if (state().clientId === c.id) {
                      <lucide-icon name="check" [size]="16" class="cs-tick" />
                    }
                  </button>
                } @empty {
                  <div class="cs-empty">Nema klijenata</div>
                }
              </div>
              <button type="button" class="cs-dashed-btn" (click)="createClient()">
                <lucide-icon name="plus" [size]="14" /> Kreiraj novog klijenta
              </button>
            </div>
          }

          <!-- STEP 2: VEHICLE -->
          @case (1) {
            <div class="cs-vgrid">
              @for (v of availableVehicles(); track v.id) {
                <button
                  type="button"
                  class="cs-vcard"
                  [class.active]="state().vehicleId === v.id"
                  (click)="pickVehicle(v.id, v.dailyRate)"
                >
                  <div class="cs-vmark">
                    <lucide-icon name="car" [size]="28" />
                  </div>
                  <div class="cs-vmeta">
                    <div class="cs-vname">{{ v.brand }} {{ v.model }}</div>
                    <div class="cs-vsub">{{ v.year }} · {{ v.currentMileage | number }} km</div>
                    <app-license-plate [plate]="v.licensePlate" size="sm" />
                  </div>
                  <div class="cs-vrate mono">{{ v.dailyRate }} KM<span class="muted">/dan</span></div>
                </button>
              } @empty {
                <div class="cs-empty">Nema dostupnih vozila</div>
              }
            </div>
          }

          <!-- STEP 3: DATES + LOCATIONS -->
          @case (2) {
            <div class="cs-card cs-pad cs-2col">
              <app-form-field label="Preuzimanje" [required]="true">
                <input type="datetime-local" [value]="state().pickupAt" (input)="update('pickupAt', $any($event.target).value)" />
              </app-form-field>
              <app-form-field label="Povrat" [required]="true">
                <input type="datetime-local" [value]="state().returnAt" (input)="update('returnAt', $any($event.target).value)" />
              </app-form-field>
              <app-form-field label="Lokacija preuzimanja">
                <select [value]="state().pickupLocation" (change)="update('pickupLocation', $any($event.target).value)">
                  <option value="Baščaršija">Baščaršija</option>
                  <option value="Aerodrom Sarajevo">Aerodrom Sarajevo</option>
                  <option value="Ilidža">Ilidža</option>
                  <option value="Druga lokacija">Druga lokacija</option>
                </select>
              </app-form-field>
              <app-form-field label="Lokacija povrata">
                <select [value]="state().returnLocation" (change)="update('returnLocation', $any($event.target).value)">
                  <option value="Baščaršija">Baščaršija</option>
                  <option value="Aerodrom Sarajevo">Aerodrom Sarajevo</option>
                  <option value="Ilidža">Ilidža</option>
                  <option value="Druga lokacija">Druga lokacija</option>
                </select>
              </app-form-field>
            </div>
            <div class="cs-card cs-pad">
              <app-form-field label="Napomene" hint="Opcionalno">
                <textarea
                  placeholder="Dječije sjedište, GPS, dodatni vozač..."
                  [value]="state().notes"
                  (input)="update('notes', $any($event.target).value)"
                ></textarea>
              </app-form-field>
            </div>
          }

          <!-- STEP 4: PRICING -->
          @case (3) {
            <div class="cs-card cs-pad cs-price-summary">
              <div class="cs-price-row">
                <span class="cs-price-lbl">Dnevna cijena</span>
                <span class="mono">{{ state().dailyRate }} KM</span>
              </div>
              <div class="cs-price-row">
                <span class="cs-price-lbl">Broj dana</span>
                <span class="mono">{{ numDays() }}</span>
              </div>
              <div class="cs-price-row">
                <span class="cs-price-lbl">Popust</span>
                <span class="mono muted">−{{ discountAmt() | number: '1.0-0' }} KM</span>
              </div>
              <div class="cs-price-row cs-price-total">
                <span class="cs-price-lbl">Subtotal</span>
                <span class="mono cs-subtotal">{{ subtotal() | number: '1.0-0' }} KM</span>
              </div>
            </div>
            <div class="cs-card cs-pad cs-2col">
              <app-form-field label="Popust" hint="%">
                <input type="number" min="0" max="100" [value]="state().discountPct" (input)="updateNum('discountPct', $event)" />
              </app-form-field>
              <app-form-field label="Depozit" hint="KM">
                <input type="number" min="0" [value]="state().deposit" (input)="updateNum('deposit', $event)" />
              </app-form-field>
              <app-form-field label="Način plaćanja">
                <select [value]="state().payment" (change)="update('payment', $any($event.target).value)">
                  <option value="card">Kartica</option>
                  <option value="cash">Gotovina</option>
                  <option value="invoice">Faktura</option>
                </select>
              </app-form-field>
            </div>
          }

          <!-- STEP 5: REVIEW -->
          @case (4) {
            <div class="cs-card cs-pad">
              <dl class="cs-review">
                <div><dt>Klijent</dt><dd>{{ selectedClientLabel() }}</dd></div>
                <div><dt>Vozilo</dt><dd>{{ selectedVehicleLabel() }}</dd></div>
                <div><dt>Trajanje</dt><dd class="mono">{{ numDays() }} dana · {{ fmtDate(state().pickupAt) }} → {{ fmtDate(state().returnAt) }}</dd></div>
                <div><dt>Lokacije</dt><dd>{{ state().pickupLocation }} → {{ state().returnLocation }}</dd></div>
                <div><dt>Ukupno</dt><dd class="cs-subtotal mono">{{ subtotal() | number: '1.0-0' }} KM</dd></div>
              </dl>
            </div>
            <div class="cs-ai-banner">
              <lucide-icon name="sparkles" [size]="16" />
              <span>
                Nakon potvrde, zakazat će se inspekcija preuzimanja i poslati email klijentu sa detaljima.
              </span>
            </div>
          }
        }
      </div>

      <footer class="cs-wizard-foot">
        <button type="button" class="cs-btn-ghost" (click)="cancel()">Otkaži</button>
        <div class="cs-spacer"></div>
        @if (current() > 0) {
          <button type="button" class="cs-btn-ghost" (click)="back()">← Nazad</button>
        }
        @if (current() < 4) {
          <button type="button" class="cs-btn-primary" [disabled]="!canAdvance()" (click)="next()">
            Dalje →
          </button>
        } @else {
          <button type="button" class="cs-btn-primary" [disabled]="submitting()" (click)="submit()">
            {{ submitting() ? 'Spremanje…' : 'Potvrdi rental' }}
          </button>
        }
      </footer>
    </div>
  `,
  styles: [
    `
      .cs-wizard {
        padding: 28px;
        max-width: 1100px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 20px;
      }
      .cs-wizard-head h1 {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-wizard-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 2px 0 0;
      }
      .cs-step-pane {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
      }
      .cs-pad {
        padding: 20px;
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

      .cs-search-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 12px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 9px;
        color: var(--cs-text-tertiary);
        margin-bottom: 14px;
      }
      .cs-search-row input {
        background: transparent;
        border: none;
        outline: none;
        color: var(--cs-text-primary);
        flex: 1;
        font-size: 13px;
      }
      .cs-pick-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        max-height: 320px;
        overflow-y: auto;
        margin-bottom: 12px;
      }
      .cs-pick-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid var(--cs-border-subtle);
        background: transparent;
        cursor: pointer;
        color: inherit;
        text-align: left;
      }
      .cs-pick-row:hover {
        background: var(--cs-bg-2);
      }
      .cs-pick-row.active {
        background: var(--cs-accent-soft);
        border-color: var(--cs-accent);
      }
      .cs-avatar {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: linear-gradient(135deg, #3bd4a0, #5b9fff);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-family: var(--font-display);
        font-size: 12px;
        font-weight: 700;
        flex-shrink: 0;
      }
      .cs-pick-meta {
        flex: 1;
        min-width: 0;
      }
      .cs-pick-name {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-pick-sub {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-tick {
        color: var(--cs-accent);
      }
      .cs-dashed-btn {
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

      .cs-vgrid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      @media (max-width: 700px) {
        .cs-vgrid {
          grid-template-columns: 1fr;
        }
      }
      .cs-vcard {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 14px;
        border-radius: 12px;
        border: 1px solid var(--cs-border-subtle);
        background: var(--cs-bg-1);
        cursor: pointer;
        text-align: left;
        color: inherit;
      }
      .cs-vcard.active {
        background: var(--cs-accent-soft);
        border-color: var(--cs-accent);
      }
      .cs-vmark {
        width: 60px;
        height: 60px;
        border-radius: 10px;
        background: var(--cs-bg-3);
        color: var(--cs-text-primary);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-vmeta {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-vname {
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-vsub {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-vrate {
        font-size: 14px;
        font-weight: 700;
        color: var(--cs-text-primary);
        white-space: nowrap;
      }

      .cs-price-summary {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px 20px;
        background: var(--cs-bg-2);
      }
      .cs-price-row {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        font-size: 13px;
      }
      .cs-price-lbl {
        color: var(--cs-text-tertiary);
      }
      .cs-price-total {
        padding-top: 10px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-subtotal {
        color: var(--cs-accent);
        font-size: 22px;
        font-weight: 700;
      }

      .cs-review {
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .cs-review > div {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-review > div:last-child {
        border-bottom: none;
      }
      .cs-review dt {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-review dd {
        font-size: 13px;
        color: var(--cs-text-primary);
        margin: 0;
        text-align: right;
      }

      .cs-ai-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 14px 16px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--cs-accent-soft), rgba(216, 255, 60, 0.04));
        border: 1px solid rgba(216, 255, 60, 0.2);
        color: var(--cs-text-primary);
        font-size: 13px;
      }
      .cs-ai-banner lucide-icon {
        color: var(--cs-accent);
      }

      .cs-wizard-foot {
        display: flex;
        gap: 10px;
        padding-top: 10px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-spacer {
        flex: 1;
      }
      .cs-btn-ghost {
        padding: 9px 16px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .cs-btn-primary {
        padding: 9px 18px;
        border-radius: 9px;
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-empty {
        padding: 32px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 13px;
      }
      .muted {
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class RentalCreatePageComponent implements OnInit {
  private readonly svc = inject(RentalService);
  private readonly router = inject(Router);
  private readonly vehicleStore = inject(VehicleStore);
  private readonly clientStore = inject(ClientStore);

  readonly steps: WizardStep[] = [
    { label: 'Klijent', icon: 'user' },
    { label: 'Vozilo', icon: 'car' },
    { label: 'Datumi', icon: 'calendar' },
    { label: 'Cijena', icon: 'wallet' },
    { label: 'Potvrda', icon: 'check-circle' },
  ];

  readonly current = signal(0);
  readonly submitting = signal(false);
  readonly clientQuery = signal('');

  private readonly tomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(9, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };
  private readonly dayAfter = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    d.setHours(18, 0, 0, 0);
    return d.toISOString().slice(0, 16);
  };

  readonly state = signal<WizardState>({
    clientId: null,
    vehicleId: null,
    pickupAt: this.tomorrow(),
    returnAt: this.dayAfter(),
    pickupLocation: 'Baščaršija',
    returnLocation: 'Baščaršija',
    notes: '',
    discountPct: 0,
    deposit: 300,
    payment: 'card',
    dailyRate: 80,
  });

  readonly availableVehicles = computed(() =>
    this.vehicleStore.entities().map((v) => ({
      ...v,
      dailyRate: this.defaultRate(v.brand),
    })).filter(
      (v) => v.status === VehicleStatus.Available,
    ),
  );

  readonly filteredClients = computed(() => {
    const q = this.clientQuery().trim().toLowerCase();
    const list = this.clientStore.entities();
    if (!q) return list.slice(0, 20);
    return list.filter((c) =>
      [c.firstName, c.lastName, c.email, c.phone ?? ''].some((v) =>
        v.toLowerCase().includes(q),
      ),
    );
  });

  readonly numDays = computed(() => {
    const s = new Date(this.state().pickupAt).getTime();
    const e = new Date(this.state().returnAt).getTime();
    if (!s || !e || e <= s) return 1;
    return Math.max(1, Math.ceil((e - s) / 86_400_000));
  });

  readonly discountAmt = computed(() => {
    const s = this.state();
    return (s.dailyRate * this.numDays() * s.discountPct) / 100;
  });

  readonly subtotal = computed(() => {
    return this.state().dailyRate * this.numDays() - this.discountAmt();
  });

  readonly canAdvance = computed(() => {
    const s = this.state();
    switch (this.current()) {
      case 0:
        return !!s.clientId;
      case 1:
        return !!s.vehicleId;
      case 2:
        return !!s.pickupAt && !!s.returnAt && new Date(s.returnAt) > new Date(s.pickupAt);
      case 3:
        return s.deposit >= 0;
      default:
        return true;
    }
  });

  readonly selectedClientLabel = computed(() => {
    const id = this.state().clientId;
    if (!id) return '—';
    const c = this.clientStore.entityMap()[id];
    return c ? `${c.firstName} ${c.lastName}` : '—';
  });

  readonly selectedVehicleLabel = computed(() => {
    const id = this.state().vehicleId;
    if (!id) return '—';
    const v = this.vehicleStore.entityMap()[id];
    return v ? `${v.brand} ${v.model} · ${v.licensePlate}` : '—';
  });

  ngOnInit(): void {
    if (!this.vehicleStore.entities().length) this.vehicleStore.loadVehicles();
    if (!this.clientStore.entities().length) this.clientStore.loadClients();
  }

  jumpTo(i: number): void {
    if (i < this.current() || this.canAdvance()) {
      this.current.set(Math.max(0, Math.min(4, i)));
    }
  }

  next(): void {
    if (this.canAdvance()) this.current.update((c) => Math.min(4, c + 1));
  }
  back(): void {
    this.current.update((c) => Math.max(0, c - 1));
  }
  cancel(): void {
    this.router.navigate(['/rentals']);
  }

  onClientQuery(ev: Event): void {
    this.clientQuery.set((ev.target as HTMLInputElement).value);
  }

  pickClient(id: string): void {
    this.state.update((s) => ({ ...s, clientId: id }));
  }

  pickVehicle(id: string, dailyRate: number): void {
    this.state.update((s) => ({ ...s, vehicleId: id, dailyRate }));
  }

  createClient(): void {
    this.router.navigate(['/clients', 'new']);
  }

  update<K extends keyof WizardState>(key: K, value: WizardState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  updateNum(key: keyof WizardState, ev: Event): void {
    const v = Number((ev.target as HTMLInputElement).value);
    this.state.update((s) => ({ ...s, [key]: Number.isFinite(v) ? v : 0 }));
  }

  submit(): void {
    const s = this.state();
    if (!s.clientId || !s.vehicleId) return;
    const req: CreateRentalRequest = {
      clientId: s.clientId,
      vehicleId: s.vehicleId,
      expectedReturnDate: new Date(s.returnAt).toISOString(),
      price: this.subtotal(),
      notes: s.notes || undefined,
    };
    this.submitting.set(true);
    this.svc.create(req).subscribe({
      next: () => this.router.navigate(['/rentals']),
      error: () => this.submitting.set(false),
    });
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

  fmtDate(iso: string): string {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}. ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  private defaultRate(brand: string): number {
    const rates: Record<string, number> = {
      BMW: 120,
      Audi: 110,
      Mercedes: 130,
      'VW': 70,
      Volkswagen: 70,
      Škoda: 65,
      Renault: 55,
      Toyota: 75,
    };
    return rates[brand] ?? 80;
  }
}
