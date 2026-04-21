import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Rental, RentalStatus } from '../models/rental.model';
import { RentalService } from '../services/rental.service';

type RentalState = {
  isLoading: boolean;
  error: string | null;
  selectedRentalId: string | null;
  statusFilter: RentalStatus | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const initialState: RentalState = {
  isLoading: false,
  error: null,
  selectedRentalId: null,
  statusFilter: null,
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const RentalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Rental>(),
  withComputed((store) => ({
    selectedRental: computed(() => store.entityMap()[store.selectedRentalId() ?? ''] ?? null),
  })),
  withMethods((store, svc = inject(RentalService)) => ({
    loadRentals: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          svc.getAll({ page: store.currentPage(), pageSize: store.pageSize() }).pipe(
            tapResponse({
              next: (result) =>
                patchState(store, setAllEntities(result.items), {
                  isLoading: false,
                  totalCount: result.totalCount,
                  totalPages: result.totalPages,
                  hasPreviousPage: result.hasPreviousPage,
                  hasNextPage: result.hasNextPage,
                }),
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    changeStatus: rxMethod<{ id: string; status: RentalStatus; employeeId?: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((p) =>
          svc.changeStatus(p.id, p.status, p.employeeId).pipe(
            tapResponse({
              next: () => {
                patchState(store, { isLoading: false });
                svc.getAll({ page: store.currentPage(), pageSize: store.pageSize() }).subscribe((result) =>
                  patchState(store, setAllEntities(result.items), {
                    totalCount: result.totalCount,
                    totalPages: result.totalPages,
                    hasPreviousPage: result.hasPreviousPage,
                    hasNextPage: result.hasNextPage,
                  }),
                );
              },
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    setStatusFilter(status: RentalStatus | null): void {
      patchState(store, { statusFilter: status });
    },
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectRental(id: string | null): void {
      patchState(store, { selectedRentalId: id });
    },
  })),
);
