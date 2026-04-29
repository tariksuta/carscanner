import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, upsertEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import {
  Employee,
  EmployeePermission,
  EmployeeRecentInspection,
  EmployeeRole,
  EmployeeStats,
} from '../models/employee.model';
import { EmployeeService } from '../services/employee.service';

type EmployeeState = {
  isLoading: boolean;
  error: string | null;
  selectedEmployeeId: string | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  permissionsByEmployeeId: Record<string, EmployeePermission[]>;
  statsByEmployeeId: Record<string, EmployeeStats>;
  recentInspectionsByEmployeeId: Record<string, EmployeeRecentInspection[]>;
};

const initialState: EmployeeState = {
  isLoading: false,
  error: null,
  selectedEmployeeId: null,
  searchQuery: '',
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  permissionsByEmployeeId: {},
  statsByEmployeeId: {},
  recentInspectionsByEmployeeId: {},
};

export const EmployeeStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Employee>(),
  withComputed((store) => ({
    selectedEmployee: computed(() => store.entityMap()[store.selectedEmployeeId() ?? ''] ?? null),
    selectedEmployeePermissions: computed(() => {
      const id = store.selectedEmployeeId();
      if (!id) return [];
      return store.permissionsByEmployeeId()[id] ?? [];
    }),
    selectedEmployeeStats: computed(() => {
      const id = store.selectedEmployeeId();
      if (!id) return null;
      return store.statsByEmployeeId()[id] ?? null;
    }),
    selectedEmployeeRecentInspections: computed(() => {
      const id = store.selectedEmployeeId();
      if (!id) return [];
      return store.recentInspectionsByEmployeeId()[id] ?? [];
    }),
  })),
  withMethods((store, svc = inject(EmployeeService)) => ({
    loadEmployees: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          svc.getAll({ page: store.currentPage(), pageSize: store.pageSize(), search: store.searchQuery() || undefined }).pipe(
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
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectEmployee(id: string | null): void {
      patchState(store, { selectedEmployeeId: id });
    },
    loadEmployeeById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          svc.getById(id).pipe(
            tapResponse({
              next: (emp) => patchState(store, upsertEntity(emp), { isLoading: false }),
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    grantLoginAccess: rxMethod<{ employeeId: string; role: EmployeeRole }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ employeeId, role }) =>
          svc.grantLoginAccess(employeeId, { role }).pipe(
            switchMap(() => svc.getById(employeeId)),
            switchMap((emp) =>
              svc.getPermissions(employeeId).pipe(
                tap((perms) =>
                  patchState(store, (s) => ({
                    permissionsByEmployeeId: { ...s.permissionsByEmployeeId, [employeeId]: perms },
                  })),
                ),
                tap(() => patchState(store, upsertEntity(emp), { isLoading: false })),
              ),
            ),
            tapResponse({
              next: () => undefined,
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    loadPermissions: rxMethod<string>(
      pipe(
        switchMap((id) =>
          svc.getPermissions(id).pipe(
            tapResponse({
              next: (perms) =>
                patchState(store, (s) => ({
                  permissionsByEmployeeId: { ...s.permissionsByEmployeeId, [id]: perms },
                })),
              error: (e: Error) => patchState(store, { error: e.message }),
            }),
          ),
        ),
      ),
    ),
    loadStats: rxMethod<string>(
      pipe(
        switchMap((id) =>
          svc.getStats(id).pipe(
            tapResponse({
              next: (stats) =>
                patchState(store, (s) => ({
                  statsByEmployeeId: { ...s.statsByEmployeeId, [id]: stats },
                })),
              error: (e: Error) => patchState(store, { error: e.message }),
            }),
          ),
        ),
      ),
    ),
    loadRecentInspections: rxMethod<string>(
      pipe(
        switchMap((id) =>
          svc.getRecentInspections(id).pipe(
            tapResponse({
              next: (items) =>
                patchState(store, (s) => ({
                  recentInspectionsByEmployeeId: {
                    ...s.recentInspectionsByEmployeeId,
                    [id]: items,
                  },
                })),
              error: (e: Error) => patchState(store, { error: e.message }),
            }),
          ),
        ),
      ),
    ),
  })),
);
