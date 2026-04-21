import { Component, computed, output, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CreateRentalRequest } from '../models/rental.model';
import { SearchableSelectComponent } from '../../../shared/components/searchable-select/searchable-select.component';
import { VehicleStore } from '../../vehicles/store/vehicle.store';
import { ClientStore } from '../../clients/store/client.store';
import { VehicleStatus } from '../../vehicles/models/vehicle.model';

@Component({
  selector: 'app-rental-form', standalone: true, imports: [ReactiveFormsModule, SearchableSelectComponent],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <label class="text-sm font-medium">Vehicle</label>
          <app-searchable-select
            [options]="vehicleOptions()"
            [selectedId]="form.controls.vehicleId.value"
            placeholder="Search by brand, model or plate..."
            (selectionChange)="onVehicleSelect($event)"
          />
        </div>
        <div class="space-y-2">
          <label class="text-sm font-medium">Client</label>
          <app-searchable-select
            [options]="clientOptions()"
            [selectedId]="form.controls.clientId.value"
            placeholder="Search by name or email..."
            (selectionChange)="onClientSelect($event)"
          />
        </div>
        <div class="space-y-2"><label class="text-sm font-medium">Expected Return Date</label><input type="date" formControlName="expectedReturnDate" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" /></div>
        <div class="space-y-2 md:col-span-2"><label class="text-sm font-medium">Notes</label><textarea formControlName="notes" rows="3" class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"></textarea></div>
      </div>
      <div class="flex gap-3">
        <button type="submit" class="inline-flex h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50" [disabled]="form.invalid">Save</button>
        <button type="button" (click)="cancel.emit()" class="inline-flex h-10 items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">Cancel</button>
      </div>
    </form>
  `,
})
export class RentalFormComponent implements OnInit {
  private readonly vehicleStore = inject(VehicleStore);
  private readonly clientStore = inject(ClientStore);

  submitForm = output<CreateRentalRequest>(); cancel = output<void>();
  private readonly fb = new FormBuilder();
  form = this.fb.nonNullable.group({ vehicleId: ['', Validators.required], clientId: ['', Validators.required], expectedReturnDate: ['', Validators.required], notes: [''] });

  vehicleOptions = computed(() =>
    this.vehicleStore.entities()
      .filter((v) => v.status === VehicleStatus.Available)
      .map((v) => ({ id: v.id, label: `${v.brand} ${v.model} (${v.licensePlate})` }))
  );

  clientOptions = computed(() =>
    this.clientStore.entities().map((c) => ({ id: c.id, label: `${c.firstName} ${c.lastName} — ${c.email}` }))
  );

  ngOnInit(): void {
    this.vehicleStore.loadVehicles();
    this.clientStore.loadClients();
  }

  onVehicleSelect(id: string): void {
    this.form.controls.vehicleId.setValue(id);
  }

  onClientSelect(id: string): void {
    this.form.controls.clientId.setValue(id);
  }

  onSubmit(): void { if (this.form.valid) this.submitForm.emit(this.form.getRawValue()); }
}
