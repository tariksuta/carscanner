import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRecordFormComponent } from '../components/service-record-form.component';

@Component({
  selector: 'app-service-record-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServiceRecordFormComponent],
  template: `<app-service-record-form [initialVehicleId]="vehicleId" (saved)="onSaved($event)" />`,
})
export class ServiceRecordCreatePageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly vehicleId: string | null = this.route.snapshot.queryParamMap.get('vehicleId');

  onSaved(_id: string): void {
    this.router.navigate(['/service-book/records']);
  }
}
