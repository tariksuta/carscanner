import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';
import { VehicleService } from '../services/vehicle.service';

type VehicleState = {
  isLoading: boolean;
  error: string | null;
  selectedVehicleId: string | null;
  statusFilter: VehicleStatus | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const initialState: VehicleState = {
  isLoading: false,
  error: null,
  selectedVehicleId: null,
  statusFilter: null,
  searchQuery: '',
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const VehicleStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Vehicle>(),
  withComputed((store) => ({
    selectedVehicle: computed(() => {
      const id = store.selectedVehicleId();
      return store.entityMap()[id ?? ''] ?? null;
    }),
  })),
  withMethods((store, vehicleService = inject(VehicleService)) => ({
    loadVehicles: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          vehicleService.getAll({ page: store.currentPage(), pageSize: store.pageSize(), search: store.searchQuery() || undefined }).pipe(
            tapResponse({
              next: (result) =>
                patchState(store, setAllEntities(result.items), {
                  isLoading: false,
                  totalCount: result.totalCount,
                  totalPages: result.totalPages,
                  hasPreviousPage: result.hasPreviousPage,
                  hasNextPage: result.hasNextPage,
                }),
              error: (error: Error) => patchState(store, { isLoading: false, error: error.message }),
            }),
          ),
        ),
      ),
    ),
    setStatusFilter(status: VehicleStatus | null): void {
      patchState(store, { statusFilter: status });
    },
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectVehicle(id: string | null): void {
      patchState(store, { selectedVehicleId: id });
    },
  })),
);
