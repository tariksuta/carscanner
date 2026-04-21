import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { EMPLOYEE_ROLES, EmployeeRole } from '../models/employee.model';

@Component({
  selector: 'app-grant-login-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="fixed inset-0 bg-black/50" (click)="cancel.emit()"></div>
        <div class="relative z-50 w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
          <h3 class="text-lg font-semibold text-card-foreground">Dodijeli login pristup</h3>
          <p class="mt-2 text-sm text-muted-foreground">
            Kreira se korisnički nalog za
            <strong class="text-card-foreground">{{ employeeName() }}</strong
            >. Privremena lozinka će biti poslana na email zaposlenika.
          </p>

          <label class="mt-4 block text-sm font-medium text-card-foreground" for="grant-role-select">
            Uloga
          </label>
          <select
            id="grant-role-select"
            class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
            [value]="selectedRole()"
            (change)="onRoleChange($event)"
          >
            @for (r of roles; track r) {
              <option [value]="r">{{ r }}</option>
            }
          </select>

          <div class="mt-5 flex justify-end gap-3">
            <button
              type="button"
              (click)="cancel.emit()"
              class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Otkaži
            </button>
            <button
              type="button"
              (click)="confirm.emit(selectedRole())"
              class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Dodijeli pristup
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class GrantLoginDialogComponent {
  readonly open = input(false);
  readonly employeeName = input('');
  readonly confirm = output<EmployeeRole>();
  readonly cancel = output<void>();

  protected readonly roles = EMPLOYEE_ROLES;
  protected readonly selectedRole = signal<EmployeeRole>(EMPLOYEE_ROLES[0]);

  protected onRoleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as EmployeeRole;
    this.selectedRole.set(value);
  }
}
