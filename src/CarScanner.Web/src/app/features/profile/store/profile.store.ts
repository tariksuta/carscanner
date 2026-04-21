import { computed, inject } from '@angular/core';
import { signalStore, withComputed, withMethods, withState, patchState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { UserProfile, UpdateProfileRequest, ChangePasswordRequest } from '../models/profile.model';
import { ProfileService } from '../services/profile.service';
import { AuthStore } from '../../../core/auth/store/auth.store';

type ProfileState = {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploadingImage: boolean;
  error: string | null;
  passwordError: string | null;
  passwordSuccess: boolean;
  profileSuccess: boolean;
};

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  isUploadingImage: false,
  error: null,
  passwordError: null,
  passwordSuccess: false,
  profileSuccess: false,
};

export const ProfileStore = signalStore(
  withState(initialState),
  withMethods(
    (store, profileService = inject(ProfileService), authStore = inject(AuthStore)) => ({
      loadProfile: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() =>
            profileService.getProfile().pipe(
              tapResponse({
                next: (profile) => patchState(store, { profile, isLoading: false }),
                error: (error: Error) =>
                  patchState(store, { isLoading: false, error: error.message }),
              }),
            ),
          ),
        ),
      ),
      updateProfile: rxMethod<UpdateProfileRequest>(
        pipe(
          tap(() => patchState(store, { isSaving: true, error: null, profileSuccess: false })),
          switchMap((request) =>
            profileService.updateProfile(request).pipe(
              tapResponse({
                next: () => {
                  const currentProfile = store.profile();
                  if (currentProfile) {
                    patchState(store, {
                      profile: { ...currentProfile, ...request },
                      isSaving: false,
                      profileSuccess: true,
                    });
                  } else {
                    patchState(store, { isSaving: false, profileSuccess: true });
                  }
                },
                error: (error: Error) =>
                  patchState(store, { isSaving: false, error: error.message }),
              }),
            ),
          ),
        ),
      ),
      changePassword: rxMethod<ChangePasswordRequest>(
        pipe(
          tap(() => patchState(store, { isSaving: true, passwordError: null, passwordSuccess: false })),
          switchMap((request) =>
            profileService.changePassword(request).pipe(
              tapResponse({
                next: () =>
                  patchState(store, { isSaving: false, passwordSuccess: true }),
                error: (error: Error) =>
                  patchState(store, { isSaving: false, passwordError: error.message }),
              }),
            ),
          ),
        ),
      ),
      uploadImage: rxMethod<File>(
        pipe(
          tap(() => patchState(store, { isUploadingImage: true, error: null })),
          switchMap((file) =>
            profileService.uploadImage(file).pipe(
              tapResponse({
                next: (response) => {
                  const currentProfile = store.profile();
                  if (currentProfile) {
                    patchState(store, {
                      profile: { ...currentProfile, profileImageUrl: response.imageUrl },
                      isUploadingImage: false,
                    });
                  } else {
                    patchState(store, { isUploadingImage: false });
                  }
                  authStore.setProfileImageUrl(response.imageUrl);
                },
                error: (error: Error) =>
                  patchState(store, { isUploadingImage: false, error: error.message }),
              }),
            ),
          ),
        ),
      ),
      deleteImage: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isUploadingImage: true, error: null })),
          switchMap(() =>
            profileService.deleteImage().pipe(
              tapResponse({
                next: () => {
                  const currentProfile = store.profile();
                  if (currentProfile) {
                    patchState(store, {
                      profile: { ...currentProfile, profileImageUrl: undefined },
                      isUploadingImage: false,
                    });
                  } else {
                    patchState(store, { isUploadingImage: false });
                  }
                  authStore.setProfileImageUrl(null);
                },
                error: (error: Error) =>
                  patchState(store, { isUploadingImage: false, error: error.message }),
              }),
            ),
          ),
        ),
      ),
      clearMessages(): void {
        patchState(store, { error: null, passwordError: null, passwordSuccess: false, profileSuccess: false });
      },
    }),
  ),
);
