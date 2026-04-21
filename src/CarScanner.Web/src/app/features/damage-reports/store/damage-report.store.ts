import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { DamageReport, DamageReportStatus } from '../models/damage-report.model';
import { DamageReportService } from '../services/damage-report.service';

type DamageReportState = {
  isLoading: boolean;
  error: string | null;
  selectedReportId: string | null;
  statusFilter: DamageReportStatus | null;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

const initialState: DamageReportState = {
  isLoading: false,
  error: null,
  selectedReportId: null,
  statusFilter: null,
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
};

export const DamageReportStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<DamageReport>(),
  withComputed((store) => ({
    selectedReport: computed(() => {
      const id = store.selectedReportId();
      return store.entityMap()[id ?? ''] ?? null;
    }),
  })),
  withMethods((store, reportService = inject(DamageReportService)) => ({
    loadReports: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          reportService.getAll({ page: store.currentPage(), pageSize: store.pageSize() }).pipe(
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
    setStatusFilter(status: DamageReportStatus | null): void {
      patchState(store, { statusFilter: status });
    },
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectReport(id: string | null): void {
      patchState(store, { selectedReportId: id });
    },
  })),
);
