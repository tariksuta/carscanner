import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceRecordFormComponent } from '../components/service-record-form.component';

@Component({
  selector: 'app-service-record-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ServiceRecordFormComponent],
  template: `<app-service-record-form [recordId]="recordId" (saved)="onSaved()" />`,
})
export class ServiceRecordEditPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly recordId: string = this.route.snapshot.paramMap.get('id') ?? '';

  onSaved(): void {
    this.router.navigate(['/service-book/records']);
  }
}
