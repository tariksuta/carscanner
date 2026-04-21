import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ProfileStore } from './store/profile.store';
import { UpdateProfileRequest, ChangePasswordRequest } from './models/profile.model';

@Component({
  selector: 'app-profile-settings-page',
  standalone: true,
  imports: [ReactiveFormsModule],
  providers: [ProfileStore],
  template: `
    <div class="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p class="text-sm text-muted-foreground">Manage your account information and password.</p>
      </div>

      <!-- Profile Image -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold">Profile Photo</h3>
        <div class="flex items-center gap-6">
          <div class="relative">
            @if (store.profile()?.profileImageUrl) {
              <img
                [src]="store.profile()?.profileImageUrl"
                alt="Profile"
                class="h-24 w-24 rounded-full object-cover border-2 border-border" />
            } @else {
              <div class="flex h-24 w-24 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {{ userInitial() }}
              </div>
            }
            @if (store.isUploadingImage()) {
              <div class="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                <div class="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              </div>
            }
          </div>
          <div class="space-y-2">
            <div class="flex gap-2">
              <button type="button" (click)="fileInput.click()"
                class="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
                [disabled]="store.isUploadingImage()">
                Upload Photo
              </button>
              @if (store.profile()?.profileImageUrl) {
                <button type="button" (click)="onDeleteImage()"
                  class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-destructive transition-colors hover:bg-accent disabled:opacity-50"
                  [disabled]="store.isUploadingImage()">
                  Remove
                </button>
              }
            </div>
            <p class="text-xs text-muted-foreground">JPG, PNG or WEBP. Max 5MB.</p>
            <input #fileInput type="file" accept="image/jpeg,image/png,image/webp" class="hidden"
              (change)="onFileSelected($event)" />
          </div>
        </div>
      </div>

      <!-- Profile Information -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold">Profile Information</h3>
        <form [formGroup]="profileForm" (ngSubmit)="onUpdateProfile()" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2 md:col-span-2">
              <label class="mb-1 block text-sm font-medium">Email</label>
              <input
                [value]="store.profile()?.email ?? ''"
                disabled
                class="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm text-muted-foreground" />
            </div>
            <div class="space-y-2">
              <label class="mb-1 block text-sm font-medium">First Name</label>
              <input formControlName="firstName"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                [class.border-destructive]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched" />
              @if (profileForm.get('firstName')?.hasError('maxlength') && profileForm.get('firstName')?.touched) {
                <p class="text-xs text-destructive">First name cannot exceed 100 characters.</p>
              }
            </div>
            <div class="space-y-2">
              <label class="mb-1 block text-sm font-medium">Last Name</label>
              <input formControlName="lastName"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                [class.border-destructive]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched" />
              @if (profileForm.get('lastName')?.hasError('maxlength') && profileForm.get('lastName')?.touched) {
                <p class="text-xs text-destructive">Last name cannot exceed 100 characters.</p>
              }
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-sm font-semibold">Address</h4>
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2 md:col-span-2">
                <label class="mb-1 block text-sm font-medium">Street</label>
                <input formControlName="street"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  [class.border-destructive]="profileForm.get('street')?.invalid && profileForm.get('street')?.touched" />
                @if (profileForm.get('street')?.hasError('maxlength') && profileForm.get('street')?.touched) {
                  <p class="text-xs text-destructive">Street cannot exceed 200 characters.</p>
                }
              </div>
              <div class="space-y-2">
                <label class="mb-1 block text-sm font-medium">City</label>
                <input formControlName="city"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  [class.border-destructive]="profileForm.get('city')?.invalid && profileForm.get('city')?.touched" />
                @if (profileForm.get('city')?.hasError('maxlength') && profileForm.get('city')?.touched) {
                  <p class="text-xs text-destructive">City cannot exceed 100 characters.</p>
                }
              </div>
              <div class="space-y-2">
                <label class="mb-1 block text-sm font-medium">Zip Code</label>
                <input formControlName="zipCode" maxlength="5"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  [class.border-destructive]="profileForm.get('zipCode')?.invalid && profileForm.get('zipCode')?.touched"
                  (input)="onZipCodeInput($event)" />
                @if (profileForm.get('zipCode')?.errors && profileForm.get('zipCode')?.touched) {
                  @if (profileForm.get('zipCode')?.hasError('pattern')) {
                    <p class="text-xs text-destructive">Zip code must be exactly 5 digits.</p>
                  }
                }
              </div>
              <div class="space-y-2 md:col-span-2">
                <label class="mb-1 block text-sm font-medium">Country</label>
                <input formControlName="country"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  [class.border-destructive]="profileForm.get('country')?.invalid && profileForm.get('country')?.touched" />
                @if (profileForm.get('country')?.hasError('maxlength') && profileForm.get('country')?.touched) {
                  <p class="text-xs text-destructive">Country cannot exceed 100 characters.</p>
                }
              </div>
            </div>
          </div>

          @if (store.profileSuccess()) {
            <p class="text-sm text-green-600">Profile updated successfully.</p>
          }
          @if (store.error()) {
            <p class="text-sm text-destructive">{{ store.error() }}</p>
          }

          <div>
            <button type="submit"
              class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
              [disabled]="profileForm.invalid || store.isSaving()">
              {{ store.isSaving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Change Password -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h3 class="mb-4 text-lg font-semibold">Change Password</h3>
        <form [formGroup]="passwordForm" (ngSubmit)="onChangePassword()" class="space-y-4">
          <div class="grid gap-4 md:grid-cols-1 max-w-md">
            <div class="space-y-2">
              <label class="mb-1 block text-sm font-medium">Current Password</label>
              <input type="password" formControlName="currentPassword"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="mb-1 block text-sm font-medium">New Password</label>
              <input type="password" formControlName="newPassword"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div class="space-y-2">
              <label class="mb-1 block text-sm font-medium">Confirm New Password</label>
              <input type="password" formControlName="confirmPassword"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
              @if (passwordForm.hasError('passwordMismatch') && passwordForm.get('confirmPassword')?.touched) {
                <p class="text-xs text-destructive">Passwords do not match.</p>
              }
            </div>
          </div>

          @if (store.passwordSuccess()) {
            <p class="text-sm text-green-600">Password changed successfully.</p>
          }
          @if (store.passwordError()) {
            <p class="text-sm text-destructive">{{ store.passwordError() }}</p>
          }

          <div>
            <button type="submit"
              class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 disabled:opacity-50"
              [disabled]="passwordForm.invalid || store.isSaving()">
              {{ store.isSaving() ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class ProfileSettingsPageComponent implements OnInit {
  readonly store = inject(ProfileStore);
  private readonly fb = new FormBuilder();

  profileForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.maxLength(100)]],
    lastName: ['', [Validators.maxLength(100)]],
    street: ['', [Validators.maxLength(200)]],
    city: ['', [Validators.maxLength(100)]],
    zipCode: ['', [Validators.pattern(/^\d{5}$/)]],
    country: ['', [Validators.maxLength(100)]],
  });

  passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: [this.passwordMatchValidator] },
  );

  ngOnInit(): void {
    this.store.loadProfile();

    // Patch form when profile loads
    const checkProfile = setInterval(() => {
      const profile = this.store.profile();
      if (profile) {
        this.profileForm.patchValue({
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          street: profile.street ?? '',
          city: profile.city ?? '',
          zipCode: profile.zipCode ?? '',
          country: profile.country ?? '',
        });
        clearInterval(checkProfile);
      }
    }, 100);
  }

  userInitial(): string {
    const profile = this.store.profile();
    if (profile?.firstName) return profile.firstName.charAt(0).toUpperCase();
    if (profile?.email) return profile.email.charAt(0).toUpperCase();
    return '?';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.store.uploadImage(file);
      input.value = '';
    }
  }

  onZipCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\D/g, '');
    this.profileForm.get('zipCode')?.setValue(input.value);
  }

  onDeleteImage(): void {
    this.store.deleteImage();
  }

  onUpdateProfile(): void {
    this.store.clearMessages();
    const values = this.profileForm.getRawValue();
    const request: UpdateProfileRequest = {
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
      street: values.street || undefined,
      city: values.city || undefined,
      zipCode: values.zipCode || undefined,
      country: values.country || undefined,
    };
    this.store.updateProfile(request);
  }

  onChangePassword(): void {
    if (this.passwordForm.invalid) return;
    this.store.clearMessages();
    const values = this.passwordForm.getRawValue();
    const request: ChangePasswordRequest = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    };
    this.store.changePassword(request);
    this.passwordForm.reset();
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }
}
