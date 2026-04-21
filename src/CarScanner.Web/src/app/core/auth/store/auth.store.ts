import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AuthUser, LoginRequest } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';
import { ProfileService } from '../../../features/profile/services/profile.service';

type AuthState = {
  user: AuthUser | null;
  profileImageUrl: string | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  user: null,
  profileImageUrl: null,
  isLoading: false,
  error: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => store.user() !== null),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      tokenService = inject(TokenService),
      profileService = inject(ProfileService),
      router = inject(Router),
    ) => ({
      loadProfileImage(): void {
        profileService.getProfile().subscribe({
          next: (profile) => patchState(store, { profileImageUrl: profile.profileImageUrl ?? null }),
          error: () => {},
        });
      },
      setProfileImageUrl(url: string | null): void {
        patchState(store, { profileImageUrl: url });
      },
      login: rxMethod<LoginRequest>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap((request) =>
            authService.login(request).pipe(
              tapResponse({
                next: (response) => {
                  console.log('Login response:', response);
                  const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
                  console.log('JWT payload:', payload);
                  const user: AuthUser = {
                    email: payload.email ?? payload.sub,
                    role: payload.role,
                    firstName: payload.first_name ?? payload.given_name,
                    lastName: payload.last_name ?? payload.family_name,
                  };
                  patchState(store, { user, isLoading: false, error: null });
                  profileService.getProfile().subscribe({
                    next: (profile) => patchState(store, { profileImageUrl: profile.profileImageUrl ?? null }),
                    error: () => {},
                  });
                  router.navigate(['/dashboard']).then((result) => {
                    console.log('Navigation result:', result);
                  });
                },
                error: (error: unknown) => {
                  console.error('Login error:', error);
                  const message = error instanceof Error ? error.message : 'Login failed';
                  patchState(store, { isLoading: false, error: message });
                },
              }),
            ),
          ),
        ),
      ),
      logout(): void {
        authService.logout();
        patchState(store, { user: null, profileImageUrl: null, error: null });
        router.navigate(['/login']);
      },
      checkAuth(): void {
        if (authService.isAuthenticated()) {
          const token = tokenService.getAccessToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              patchState(store, {
                user: {
                  email: payload.email ?? payload.sub,
                  role: payload.role,
                  firstName: payload.first_name ?? payload.given_name,
                  lastName: payload.last_name ?? payload.family_name,
                },
              });
              profileService.getProfile().subscribe({
                next: (profile) => patchState(store, { profileImageUrl: profile.profileImageUrl ?? null }),
                error: () => {},
              });
            } catch {
              patchState(store, { user: null });
            }
          }
        }
      },
    }),
  ),
);
