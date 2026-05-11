import { Component, inject, signal, HostListener, computed } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { SidebarNavItemComponent } from './sidebar-nav-item.component';
import { getNavGroups } from './sidebar.config';
import { AuthStore } from '../../../core/auth/store/auth.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [SidebarNavItemComponent, LucideAngularModule],
  template: `
    <aside
      class="cs-sidebar"
      [class.collapsed]="collapsed()"
    >
      <div class="cs-sidebar-head">
        <button
          type="button"
          class="cs-logo-btn"
          (click)="toggleCollapsed()"
          [attr.aria-label]="collapsed() ? 'Proširi meni' : 'Suzi meni'"
        >
          <span class="cs-logo-mark">
            <lucide-icon name="scan-line" [size]="16" />
          </span>
          @if (!collapsed()) {
            <span class="cs-logo-text">CarScanner</span>
          }
        </button>
      </div>

      <nav class="cs-sidebar-nav">
        @for (group of navGroups(); track group.label) {
          @if (group.label && !collapsed()) {
            <div class="cs-nav-group-label">{{ group.label }}</div>
          }
          @if (group.label && collapsed()) {
            <div class="cs-nav-group-divider"></div>
          }
          @for (item of group.items; track item.route) {
            <app-sidebar-nav-item [item]="item" [collapsed]="collapsed()" />
          }
        }
      </nav>

      <div class="cs-sidebar-foot">
        @if (dropdownOpen()) {
          <div class="cs-user-dropdown">
            <button type="button" class="cs-user-dropdown-item" (click)="onProfileSettings()">
              <lucide-icon name="settings" [size]="16" />
              <span>Profil</span>
            </button>
            <div class="cs-user-dropdown-sep"></div>
            <button
              type="button"
              class="cs-user-dropdown-item danger"
              (click)="onLogout()"
            >
              <lucide-icon name="log-out" [size]="16" />
              <span>Odjava</span>
            </button>
          </div>
        }
        <button type="button" class="cs-user-btn" (click)="toggleDropdown($event)">
          @if (profileImageUrl()) {
            <img [src]="profileImageUrl()" alt="" class="cs-user-avatar-img" />
          } @else {
            <span class="cs-user-avatar">{{ userInitial() }}</span>
          }
          @if (!collapsed()) {
            <div class="cs-user-meta">
              <p class="cs-user-name">{{ displayName() }}</p>
              <p class="cs-user-email">{{ email() }}</p>
            </div>
            <lucide-icon name="chevrons-up-down" [size]="14" class="cs-user-chev" />
          }
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .cs-sidebar {
        position: sticky;
        top: 0;
        height: 100vh;
        width: 240px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        background: var(--cs-bg-1);
        border-right: 1px solid var(--cs-border-subtle);
        transition: width 0.18s ease;
      }
      .cs-sidebar.collapsed {
        width: 68px;
      }

      .cs-sidebar-head {
        height: 64px;
        display: flex;
        align-items: center;
        padding: 0 16px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-logo-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
        color: var(--cs-text-primary);
      }
      .cs-logo-mark {
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 0 1px rgba(216, 255, 60, 0.4), 0 6px 18px rgba(216, 255, 60, 0.18);
      }
      .cs-logo-text {
        font-family: var(--font-display);
        font-weight: 700;
        font-size: 15px;
        letter-spacing: -0.01em;
      }

      .cs-sidebar-nav {
        flex: 1;
        overflow-y: auto;
        padding: 16px 10px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cs-nav-group-label {
        font-size: 10px;
        font-weight: 700;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding: 14px 10px 6px;
      }
      .cs-nav-group-divider {
        height: 1px;
        background: var(--cs-border-subtle);
        margin: 10px 8px;
      }

      .cs-sidebar-foot {
        position: relative;
        padding: 10px;
        border-top: 1px solid var(--cs-border-subtle);
      }
      .cs-user-btn {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: transparent;
        border: 1px solid transparent;
        border-radius: 10px;
        cursor: pointer;
        color: var(--cs-text-primary);
        text-align: left;
      }
      .cs-user-btn:hover {
        background: var(--cs-bg-2);
        border-color: var(--cs-border-subtle);
      }
      .cs-user-avatar,
      .cs-user-avatar-img {
        width: 28px;
        height: 28px;
        border-radius: 999px;
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
        object-fit: cover;
      }
      .cs-user-meta {
        flex: 1;
        min-width: 0;
        overflow: hidden;
      }
      .cs-user-name {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cs-user-email {
        margin: 0;
        font-size: 11px;
        color: var(--cs-text-tertiary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .cs-user-chev {
        color: var(--cs-text-tertiary);
        flex-shrink: 0;
      }

      .cs-user-dropdown {
        position: absolute;
        left: 10px;
        right: 10px;
        bottom: calc(100% - 4px);
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 10px;
        box-shadow: var(--cs-shadow-md);
        padding: 4px;
        z-index: 20;
      }
      .cs-user-dropdown-item {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 10px;
        background: transparent;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        color: var(--cs-text-primary);
        font-size: 13px;
        text-align: left;
      }
      .cs-user-dropdown-item:hover {
        background: var(--cs-bg-3);
      }
      .cs-user-dropdown-item.danger {
        color: var(--cs-status-danger);
      }
      .cs-user-dropdown-sep {
        height: 1px;
        background: var(--cs-border-subtle);
        margin: 4px 0;
      }
    `,
  ],
})
export class SidebarComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  readonly navGroups = computed(() => getNavGroups(this.authStore.user()?.role));
  readonly dropdownOpen = signal(false);
  readonly collapsed = signal(false);

  readonly profileImageUrl = computed(() => this.authStore.profileImageUrl());
  readonly email = computed(() => this.authStore.user()?.email ?? '');
  readonly displayName = computed(() => {
    const user = this.authStore.user();
    if (user?.firstName || user?.lastName) {
      return [user.firstName, user.lastName].filter(Boolean).join(' ');
    }
    return user?.email ?? '';
  });
  readonly userInitial = computed(() => {
    const user = this.authStore.user();
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    return (this.email() || '?').charAt(0).toUpperCase();
  });

  @HostListener('document:click')
  onDocumentClick(): void {
    this.dropdownOpen.set(false);
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.dropdownOpen.update((v) => !v);
  }

  toggleCollapsed(): void {
    this.collapsed.update((v) => !v);
  }

  onProfileSettings(): void {
    this.dropdownOpen.set(false);
    this.router.navigate(['/profile']);
  }

  onLogout(): void {
    this.dropdownOpen.set(false);
    this.authStore.logout();
  }
}
