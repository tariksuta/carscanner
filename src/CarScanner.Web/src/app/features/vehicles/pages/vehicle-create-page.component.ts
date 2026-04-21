import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleFormComponent } from '../components/vehicle-form.component';

@Component({
  selector: 'app-vehicle-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehicleFormComponent],
  template: `<app-vehicle-form mode="create" (saved)="onSaved($event)" />`,
})
export class VehicleCreatePageComponent {
  private readonly router = inject(Router);

  onSaved(id: string): void {
    this.router.navigate(['/vehicles', id]);
  }
}
