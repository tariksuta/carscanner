import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Client, CreateClientRequest, UpdateClientRequest } from '../models/client.model';
import { ClientService } from '../services/client.service';
import { ClientStore } from '../store/client.store';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { FormToggleComponent } from '../../../shared/components/form-toggle/form-toggle.component';

interface ClientFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  jmbg: string;
  driverLicenseNumber: string;
  driverLicenseExpiry: string;
  driverLicenseCountry: string;
  address: string;
  city: string;
  isVip: boolean;
  marketingConsent: boolean;
  internalNote: string;
}

type RequiredField =
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'driverLicenseNumber'
  | 'driverLicenseExpiry';

const REQUIRED_MSG = 'Obavezno polje';
const JMBG_MSG = 'JMBG mora imati tačno 13 cifara';
const LICENSE_LEN_MSG = 'Vozačka dozvola mora imati tačno 9 karaktera';

@Component({
  selector: 'app-client-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FormShellComponent, FormFieldComponent, FormToggleComponent],
  template: `
    <app-form-shell
      [title]="mode() === 'edit' ? 'Uredi klijenta' : 'Dodaj klijenta'"
      [subtitle]="mode() === 'edit' ? 'Ažuriraj podatke o klijentu' : 'Unesi podatke za novog klijenta'"
      [submitLabel]="mode() === 'edit' ? 'Sačuvaj izmjene' : 'Dodaj klijenta'"
      [submitDisabled]="submitting()"
      [statusLabel]="mode() === 'edit' ? 'Izmjena' : null"
      statusVariant="info"
      (submitted)="submit()"
      (cancelled)="cancel()"
    >
      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Lični podaci</h3>
        <div class="cs-2col">
          <app-form-field label="Ime" [required]="true" [error]="errorFor('firstName')">
            <input type="text" [value]="state().firstName" (input)="upd('firstName', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Prezime" [required]="true" [error]="errorFor('lastName')">
            <input type="text" [value]="state().lastName" (input)="upd('lastName', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Email" [required]="true" [error]="errorFor('email')">
            <input type="email" [disabled]="mode() === 'edit'" [value]="state().email" (input)="upd('email', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Telefon" [required]="true" [error]="errorFor('phone')">
            <input type="tel" data-mono="true" [value]="state().phone" (input)="upd('phone', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Datum rođenja">
            <input type="date" [value]="state().birthDate" (input)="upd('birthDate', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="JMBG" hint="13 cifara" [error]="jmbgError()">
            <input type="text" data-mono="true" maxlength="13" [value]="state().jmbg" (input)="upd('jmbg', $any($event.target).value)" />
          </app-form-field>
        </div>
      </section>

      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Identifikacija i adresa</h3>
        <div class="cs-2col">
          <app-form-field label="Vozačka dozvola" hint="9 karaktera" [required]="true" [error]="licenseNumberError()">
            <input type="text" data-mono="true" maxlength="9" [value]="state().driverLicenseNumber" (input)="upd('driverLicenseNumber', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Vrijedi do" [required]="true" [error]="errorFor('driverLicenseExpiry')">
            <input type="date" [value]="state().driverLicenseExpiry" (input)="upd('driverLicenseExpiry', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Adresa" class="cs-col-2">
            <input type="text" [value]="state().address" (input)="upd('address', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Grad">
            <input type="text" [value]="state().city" (input)="upd('city', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Država" [required]="true">
            <select [value]="state().driverLicenseCountry" (change)="upd('driverLicenseCountry', $any($event.target).value)">
              <option value="BA">Bosna i Hercegovina</option>
              <option value="HR">Hrvatska</option>
              <option value="RS">Srbija</option>
            </select>
          </app-form-field>
        </div>
      </section>

      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Status i napomene</h3>
        <app-form-toggle
          label="VIP klijent"
          hint="Prioritetno rukovanje, popusti, dedicated manager"
          [ngModel]="state().isVip"
          (ngModelChange)="upd('isVip', $event)"
        />
        <div class="cs-divider"></div>
        <app-form-toggle
          label="Marketing komunikacija"
          hint="Pristanak na email/SMS kampanje"
          [ngModel]="state().marketingConsent"
          (ngModelChange)="upd('marketingConsent', $event)"
        />
        <div class="cs-divider"></div>
        <app-form-field label="Interna napomena" hint="Vidljivo samo tvom timu">
          <textarea
            rows="3"
            [value]="state().internalNote"
            (input)="upd('internalNote', $any($event.target).value)"
          ></textarea>
        </app-form-field>
      </section>
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
      .cs-col-2 {
        grid-column: span 2;
      }
      .cs-divider {
        height: 1px;
        background: var(--cs-border-subtle);
      }
    `,
  ],
})
export class ClientFormComponent implements OnInit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly client = input<Client | null>(null);
  readonly saved = output<string>();

  private readonly svc = inject(ClientService);
  private readonly store = inject(ClientStore);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly submitted = signal(false);

  readonly state = signal<ClientFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    jmbg: '',
    driverLicenseNumber: '',
    driverLicenseExpiry: '',
    driverLicenseCountry: 'BA',
    address: '',
    city: '',
    isVip: false,
    marketingConsent: false,
    internalNote: '',
  });

  readonly jmbgError = computed(() => {
    const jmbg = this.state().jmbg.trim();
    if (!jmbg) return null;
    return /^\d{13}$/.test(jmbg) ? null : JMBG_MSG;
  });

  readonly licenseNumberError = computed(() => {
    const num = this.state().driverLicenseNumber.trim();
    if (!num) return this.submitted() ? REQUIRED_MSG : null;
    return num.length === 9 ? null : LICENSE_LEN_MSG;
  });

  private readonly missingRequired = computed<Set<RequiredField>>(() => {
    const s = this.state();
    const missing = new Set<RequiredField>();
    if (!s.firstName.trim()) missing.add('firstName');
    if (!s.lastName.trim()) missing.add('lastName');
    if (!s.email.trim()) missing.add('email');
    if (!s.phone.trim()) missing.add('phone');
    if (!s.driverLicenseNumber.trim()) missing.add('driverLicenseNumber');
    if (!s.driverLicenseExpiry.trim()) missing.add('driverLicenseExpiry');
    return missing;
  });

  readonly canSubmit = computed(() =>
    this.missingRequired().size === 0 && !this.jmbgError() && !this.licenseNumberError(),
  );

  errorFor(field: RequiredField): string | null {
    if (!this.submitted()) return null;
    return this.missingRequired().has(field) ? REQUIRED_MSG : null;
  }

  ngOnInit(): void {
    const c = this.client();
    if (c) {
      this.state.update((s) => ({
        ...s,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        driverLicenseNumber: c.driverLicenseNumber,
        driverLicenseExpiry: c.driverLicenseExpiry,
        driverLicenseCountry: c.driverLicenseCountry || 'BA',
        address: c.address ?? '',
        city: c.city ?? '',
        birthDate: c.birthDate ?? '',
        jmbg: c.jmbg ?? '',
        isVip: c.isVip ?? false,
        marketingConsent: c.marketingConsent ?? false,
        internalNote: c.internalNote ?? '',
      }));
    }
  }

  upd<K extends keyof ClientFormState>(key: K, value: ClientFormState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.canSubmit() || this.submitting()) return;
    const s = this.state();

    if (this.mode() === 'edit' && this.client()?.id) {
      const req: UpdateClientRequest = {
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone,
        address: s.address || undefined,
        driverLicenseNumber: s.driverLicenseNumber,
        driverLicenseExpiry: s.driverLicenseExpiry,
        driverLicenseCountry: s.driverLicenseCountry,
        city: s.city || undefined,
        birthDate: s.birthDate || undefined,
        jmbg: s.jmbg || undefined,
        isVip: s.isVip,
        marketingConsent: s.marketingConsent,
        internalNote: s.internalNote || undefined,
      };
      this.submitting.set(true);
      this.svc.update(this.client()!.id, req).subscribe({
        next: () => {
          this.store.loadClients();
          this.saved.emit(this.client()!.id);
        },
        error: () => this.submitting.set(false),
      });
      return;
    }

    const req: CreateClientRequest = {
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      driverLicenseNumber: s.driverLicenseNumber,
      driverLicenseExpiry: s.driverLicenseExpiry,
      driverLicenseCountry: s.driverLicenseCountry,
      address: s.address || undefined,
      city: s.city || undefined,
      birthDate: s.birthDate || undefined,
      jmbg: s.jmbg || undefined,
      isVip: s.isVip,
      marketingConsent: s.marketingConsent,
      internalNote: s.internalNote || undefined,
    };
    this.submitting.set(true);
    this.svc.create(req).subscribe({
      next: (res) => {
        this.store.loadClients();
        this.saved.emit(res.clientId);
      },
      error: () => this.submitting.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/clients']);
  }
}
