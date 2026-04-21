import { Component, inject } from '@angular/core';
import { AuthStore } from '../../../core/auth/store/auth.store';

@Component({
  selector: 'app-user-menu',
  standalone: true,
  template: `
    @if (profileImageUrl()) {
      <img [src]="profileImageUrl()" alt="Profile" class="h-8 w-8 rounded-full object-cover" />
    } @else {
      <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
        {{ userInitial() }}
      </div>
    }
  `,
})
export class UserMenuComponent {
  private readonly authStore = inject(AuthStore);

  readonly profileImageUrl = () => this.authStore.profileImageUrl();
  private readonly email = () => this.authStore.user()?.email ?? '';
  readonly userInitial = () => {
    const user = this.authStore.user();
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    return this.email().charAt(0).toUpperCase();
  };
}
