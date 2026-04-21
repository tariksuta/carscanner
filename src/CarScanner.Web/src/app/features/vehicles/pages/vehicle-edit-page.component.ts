import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleFormComponent } from '../components/vehicle-form.component';
import { VehicleService } from '../services/vehicle.service';
import { VehicleDetail } from '../models/vehicle.model';

@Component({
  selector: 'app-vehicle-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehicleFormComponent],
  template: `
    @if (vehicle(); as v) {
      <app-vehicle-form mode="edit" [vehicle]="v" (saved)="onSaved($event)" />
    } @else if (notFound()) {
      <p class="cs-empty">Vozilo nije pronađeno</p>
    } @else {
      <p class="cs-empty">Učitavanje…</p>
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
export class VehicleEditPageComponent {
  readonly id = input.required<string>();
  private readonly svc = inject(VehicleService);
  private readonly router = inject(Router);

  readonly vehicle = signal<VehicleDetail | null>(null);
  readonly notFound = signal(false);

  constructor() {
    effect(() => {
      const id = this.id();
      this.vehicle.set(null);
      this.notFound.set(false);
      this.svc.getDetail(id).subscribe({
        next: (v) => this.vehicle.set(v),
        error: () => this.notFound.set(true),
      });
    });
  }

  onSaved(id: string): void {
    this.router.navigate(['/vehicles', id]);
  }
}
