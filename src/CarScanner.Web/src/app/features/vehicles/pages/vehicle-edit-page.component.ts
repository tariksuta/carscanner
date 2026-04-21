import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { VehicleFormComponent } from '../components/vehicle-form.component';
import { VehicleStore } from '../store/vehicle.store';

@Component({
  selector: 'app-vehicle-edit-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [VehicleFormComponent],
  template: `
    @if (vehicle(); as v) {
      <app-vehicle-form mode="edit" [vehicle]="v" (saved)="onSaved($event)" />
    } @else {
      <p class="cs-empty">Vozilo nije pronađeno</p>
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
export class VehicleEditPageComponent implements OnInit {
  readonly id = input.required<string>();
  private readonly store = inject(VehicleStore);
  private readonly router = inject(Router);

  readonly vehicle = computed(() => this.store.entityMap()[this.id()] ?? null);

  ngOnInit(): void {
    if (!this.store.entities().length) this.store.loadVehicles();
  }

  onSaved(id: string): void {
    this.router.navigate(['/vehicles', id]);
  }
}
