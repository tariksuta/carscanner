import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';
import { EmployeeStore } from '../store/employee.store';
import { FormShellComponent } from '../../../shared/components/form-shell/form-shell.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { BranchService } from '../../branches/services/branch.service';
import { Branch } from '../../branches/models/branch.model';

interface EmployeeFormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  branchId: string;
}

@Component({
  selector: 'app-employee-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, FormShellComponent, FormFieldComponent],
  template: `
    <app-form-shell
      [title]="mode() === 'edit' ? 'Uredi zaposlenika' : 'Pozovi u tim'"
      [subtitle]="mode() === 'edit' ? 'Ažuriraj kontakt podatke' : 'Novi član tima će primiti email sa invite linkom'"
      [submitLabel]="mode() === 'edit' ? 'Sačuvaj izmjene' : 'Pošalji pozivnicu'"
      [submitDisabled]="!canSubmit() || submitting()"
      [statusLabel]="mode() === 'edit' ? 'Izmjena' : null"
      statusVariant="info"
      (submitted)="submit()"
      (cancelled)="cancel()"
    >
      <section class="cs-card cs-pad">
        <h3 class="cs-sect-title">Lični podaci</h3>
        <div class="cs-2col">
          <app-form-field label="Ime" [required]="true">
            <input type="text" [value]="state().firstName" (input)="upd('firstName', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Prezime" [required]="true">
            <input type="text" [value]="state().lastName" (input)="upd('lastName', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Email" [required]="true">
            <input type="email" [disabled]="mode() === 'edit'" [value]="state().email" (input)="upd('email', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Telefon">
            <input type="tel" data-mono="true" [value]="state().phone" (input)="upd('phone', $any($event.target).value)" />
          </app-form-field>
          <app-form-field label="Poslovnica">
            <select [value]="state().branchId" (change)="upd('branchId', $any($event.target).value)">
              <option value="">— Bez poslovnice —</option>
              @for (b of branches(); track b.id) {
                <option [value]="b.id">{{ b.city }} · {{ b.name }}</option>
              }
            </select>
          </app-form-field>
        </div>
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
    `,
  ],
})
export class EmployeeFormComponent implements OnInit {
  readonly mode = input<'create' | 'edit'>('create');
  readonly employee = input<Employee | null>(null);
  readonly saved = output<string>();

  private readonly svc = inject(EmployeeService);
  private readonly store = inject(EmployeeStore);
  private readonly branchSvc = inject(BranchService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly branches = signal<Branch[]>([]);

  readonly state = signal<EmployeeFormState>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    branchId: '',
  });

  readonly canSubmit = computed(() => {
    const s = this.state();
    return !!s.firstName.trim() && !!s.lastName.trim() && !!s.email.trim();
  });

  ngOnInit(): void {
    this.branchSvc.getAll(true).subscribe({
      next: (list) => this.branches.set(list),
    });

    const e = this.employee();
    if (e) {
      this.state.set({
        firstName: e.firstName,
        lastName: e.lastName,
        email: e.email,
        phone: e.phone ?? '',
        branchId: e.branchId ?? '',
      });
    }
  }

  upd<K extends keyof EmployeeFormState>(key: K, value: EmployeeFormState[K]): void {
    this.state.update((s) => ({ ...s, [key]: value }));
  }

  submit(): void {
    if (!this.canSubmit() || this.submitting()) return;
    const s = this.state();
    const branchId = s.branchId || undefined;

    if (this.mode() === 'edit' && this.employee()?.id) {
      const req: UpdateEmployeeRequest = {
        firstName: s.firstName,
        lastName: s.lastName,
        phone: s.phone || undefined,
        branchId,
      };
      this.submitting.set(true);
      this.svc.update(this.employee()!.id, req).subscribe({
        next: () => {
          this.store.loadEmployees();
          this.saved.emit(this.employee()!.id);
        },
        error: () => this.submitting.set(false),
      });
      return;
    }

    const req: CreateEmployeeRequest = {
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone || undefined,
      branchId,
    };
    this.submitting.set(true);
    this.svc.create(req).subscribe({
      next: (res) => {
        this.store.loadEmployees();
        this.saved.emit(res.employeeId);
      },
      error: () => this.submitting.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/employees']);
  }
}
