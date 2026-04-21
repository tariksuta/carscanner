import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeFormComponent } from '../components/employee-form.component';

@Component({
  selector: 'app-employee-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmployeeFormComponent],
  template: `<app-employee-form mode="create" (saved)="onSaved($event)" />`,
})
export class EmployeeCreatePageComponent {
  private readonly router = inject(Router);

  onSaved(id: string): void {
    this.router.navigate(['/employees', id]);
  }
}
