import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, upsertEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { VehicleInspection } from '../models/inspection.model';
import { InspectionService } from '../services/inspection.service';

type InspectionState = {
  isLoading: boolean;
  error: string | null;
  selectedInspectionId: string | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const initialState: InspectionState = {
  isLoading: false,
  error: null,
  selectedInspectionId: null,
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const InspectionStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<VehicleInspection>(),
  withComputed((store) => ({
    selectedInspection: computed(() => store.entityMap()[store.selectedInspectionId() ?? ''] ?? null),
  })),
  withMethods((store, svc = inject(InspectionService)) => ({
    loadInspections: rxMethod<void>(
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
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectInspection(id: string | null): void {
      patchState(store, { selectedInspectionId: id });
    },
    loadInspectionById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          svc.getById(id).pipe(
            tapResponse({
              next: (insp) => patchState(store, upsertEntity(insp), { isLoading: false }),
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
  })),
);
