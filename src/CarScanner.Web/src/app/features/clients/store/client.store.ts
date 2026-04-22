import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { withEntities, setAllEntities, upsertEntity } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { Client, ClientDetails } from '../models/client.model';
import { ClientService } from '../services/client.service';

type ClientState = {
  isLoading: boolean;
  error: string | null;
  selectedClientId: string | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  selectedClientDetails: ClientDetails | null;
  isDetailsLoading: boolean;
  detailsError: string | null;
};

const initialState: ClientState = {
  isLoading: false,
  error: null,
  selectedClientId: null,
  searchQuery: '',
  currentPage: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  selectedClientDetails: null,
  isDetailsLoading: false,
  detailsError: null,
};

export const ClientStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withEntities<Client>(),
  withComputed((store) => ({
    selectedClient: computed(() => {
      const id = store.selectedClientId();
      return store.entityMap()[id ?? ''] ?? null;
    }),
  })),
  withMethods((store, clientService = inject(ClientService)) => ({
    loadClients: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap(() =>
          clientService.getAll({ page: store.currentPage(), pageSize: store.pageSize(), search: store.searchQuery() || undefined }).pipe(
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
    setSearchQuery(query: string): void {
      patchState(store, { searchQuery: query, currentPage: 1 });
    },
    setPage(page: number): void {
      patchState(store, { currentPage: page });
    },
    selectClient(id: string | null): void {
      patchState(store, { selectedClientId: id });
    },
    loadClientById: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((id) =>
          clientService.getById(id).pipe(
            tapResponse({
              next: (client) => patchState(store, upsertEntity(client), { isLoading: false }),
              error: (error: Error) => patchState(store, { isLoading: false, error: error.message }),
            }),
          ),
        ),
      ),
    ),
    loadClientDetails: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isDetailsLoading: true, detailsError: null })),
        switchMap((id) =>
          clientService.getDetails(id).pipe(
            tapResponse({
              next: (details) =>
                patchState(store, upsertEntity(details.client), {
                  selectedClientDetails: details,
                  isDetailsLoading: false,
                }),
              error: (error: Error) =>
                patchState(store, { isDetailsLoading: false, detailsError: error.message }),
            }),
          ),
        ),
      ),
    ),
  })),
);
