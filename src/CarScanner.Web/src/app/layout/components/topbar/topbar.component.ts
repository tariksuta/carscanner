import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { UserMenuComponent } from '../user-menu/user-menu.component';
import { BalanceIndicatorComponent } from '../balance-indicator/balance-indicator.component';
import { NotificationBellComponent } from '../../../features/notifications/components/notification-bell.component';
import { TenantSwitcherComponent } from './tenant-switcher.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [
    BreadcrumbComponent,
    UserMenuComponent,
    LucideAngularModule,
    BalanceIndicatorComponent,
    NotificationBellComponent,
    TenantSwitcherComponent,
  ],
  template: `
    <header class="cs-topbar">
      <div class="cs-topbar-left">
        <app-breadcrumb />
      </div>
      <div class="cs-topbar-right">
        <app-tenant-switcher />
        <button type="button" class="cs-cmd-btn" aria-label="Pretraga (⌘K)">
          <lucide-icon name="search" [size]="14" />
          <span>Pretraži…</span>
          <span class="cs-kbd">⌘K</span>
        </button>
        <app-balance-indicator />
        <app-notification-bell />
        <app-user-menu />
      </div>
    </header>
  `,
  styles: [
    `
      .cs-topbar {
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 0 20px;
        background: var(--cs-bg-0);
        border-bottom: 1px solid var(--cs-border-subtle);
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .cs-topbar-left {
        min-width: 0;
        flex: 1;
      }
      .cs-topbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-cmd-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 34px;
        padding: 0 10px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 10px;
        color: var(--cs-text-tertiary);
        font-size: 12px;
        cursor: pointer;
      }
      .cs-cmd-btn:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-secondary);
      }
      .cs-cmd-btn span:first-of-type {
        min-width: 140px;
        text-align: left;
      }
      .cs-kbd {
        font-family: var(--font-mono);
        font-size: 10px;
        padding: 2px 6px;
        border-radius: 6px;
        background: var(--cs-bg-3);
        color: var(--cs-text-secondary);
      }
      .cs-icon-btn {
        position: relative;
        width: 34px;
        height: 34px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 10px;
        color: var(--cs-text-secondary);
        cursor: pointer;
      }
      .cs-icon-btn:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-bell-dot {
        position: absolute;
        top: 7px;
        right: 8px;
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: var(--cs-status-danger);
        box-shadow: 0 0 0 2px var(--cs-bg-1);
      }
    `,
  ],
})
export class TopbarComponent {}
