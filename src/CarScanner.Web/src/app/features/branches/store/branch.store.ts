import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, upsertEntity, removeEntity, addEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Branch, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.model';
import { BranchService } from '../services/branch.service';

type BranchState = {
  isLoading: boolean;
  error: string | null;
  selectedBranchId: string | null;
  searchQuery: string;
  showInactive: boolean;
};

const initialState: BranchState = {
  isLoading: false,
  error: null,
  selectedBranchId: null,
  searchQuery: '',
  showInactive: true,
};

export const BranchStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Branch>(),
  withComputed((store) => ({
    selectedBranch: computed(() => store.entityMap()[store.selectedBranchId() ?? ''] ?? null),
    filtered: computed(() => {
      const q = store.searchQuery().trim().toLowerCase();
      const includeInactive = store.showInactive();
      return store.entities().filter((b) => {
        if (!includeInactive && !b.isActive) return false;
        if (!q) return true;
        return (
          b.name.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.address?.toLowerCase().includes(q) ?? false)
        );
      });
    }),
  })),
  withMethods((store, svc = inject(BranchService)) => ({
    loadBranches: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          svc.getAll(false).pipe(
            tapResponse({
              next: (items) => patchState(store, setAllEntities(items), { isLoading: false }),
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    loadBranchById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          svc.getById(id).pipe(
            tapResponse({
              next: (b) => patchState(store, upsertEntity(b), { isLoading: false }),
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    selectBranch(id: string | null): void {
      patchState(store, { selectedBranchId: id });
    },
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query });
    },
    setShowInactive(value: boolean): void {
      patchState(store, { showInactive: value });
    },
    create: rxMethod<{ request: CreateBranchRequest; onSuccess?: (id: string) => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ request, onSuccess }) =>
          svc.create(request).pipe(
            switchMap((res) =>
              svc.getById(res.branchId).pipe(
                tap((branch) => {
                  patchState(store, addEntity(branch), { isLoading: false });
                  onSuccess?.(res.branchId);
                }),
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
    update: rxMethod<{ id: string; request: UpdateBranchRequest; onSuccess?: () => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(({ id, request, onSuccess }) =>
          svc.update(id, request).pipe(
            switchMap(() => svc.getById(id)),
            tap((branch) => {
              patchState(store, upsertEntity(branch), { isLoading: false });
              onSuccess?.();
            }),
            tapResponse({
              next: () => undefined,
              error: (e: Error) => patchState(store, { isLoading: false, error: e.message }),
            }),
          ),
        ),
      ),
    ),
    setActive: rxMethod<{ id: string; isActive: boolean }>(
      pipe(
        switchMap(({ id, isActive }) =>
          (isActive ? svc.activate(id) : svc.deactivate(id)).pipe(
            switchMap(() => svc.getById(id)),
            tapResponse({
              next: (branch) => patchState(store, upsertEntity(branch)),
              error: (e: Error) => patchState(store, { error: e.message }),
            }),
          ),
        ),
      ),
    ),
    removeFromCache(id: string): void {
      patchState(store, removeEntity(id));
    },
  })),
);
