import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeFormComponent } from '../components/employee-form.component';
import { EmployeeStore } from '../store/employee.store';

@Component({
  selector: 'app-employee-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmployeeFormComponent],
  template: `
    @if (employee(); as e) {
      <app-employee-form mode="edit" [employee]="e" (saved)="onSaved($event)" />
    } @else {
      <p class="cs-empty">Zaposlenik nije pronađen</p>
    }
  `,
  styles: [
    `
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class EmployeeEditPageComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly store = inject(EmployeeStore);
  private readonly router = inject(Router);

  readonly employee = computed(() => this.store.entityMap()[this.id()] ?? null);

  ngOnInit(): void {
    if (!this.store.entities().length) this.store.loadEmployees();
  }

  onSaved(id: string): void {
    this.router.navigate(['/employees', id]);
  }
}
