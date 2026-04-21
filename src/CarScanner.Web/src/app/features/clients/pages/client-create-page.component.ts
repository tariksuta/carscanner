import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ClientFormComponent } from '../components/client-form.component';

@Component({
  selector: 'app-client-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClientFormComponent],
  template: `<app-client-form mode="create" (saved)="onSaved($event)" />`,
})
export class ClientCreatePageComponent {
  private readonly router = inject(Router);

  onSaved(id: string): void {
    this.router.navigate(['/clients', id]);
  }
}
