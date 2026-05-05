import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { AuthStore } from '../../../core/auth/store/auth.store';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { PlatformAdminService } from '../../../features/platform/services/platform-admin.service';
import { TenantOverview } from '../../../features/platform/models/platform.model';

@Component({
  selector: 'app-tenant-switcher',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (authStore.isPlatformAdmin()) {
      <div class="cs-switcher" (click)="$event.stopPropagation()">
        <button type="button" class="cs-switcher-btn" (click)="toggle()">
          <lucide-icon name="building-2" [size]="14" />
          <span class="cs-switcher-label">{{ currentLabel() }}</span>
          <lucide-icon name="chevrons-up-down" [size]="12" />
        </button>

        @if (isOpen()) {
          <div class="cs-dropdown">
            <header class="cs-dropdown-head">
              <div class="cs-search">
                <lucide-icon name="search" [size]="13" />
                <input type="text"
                       placeholder="Pretraži tenante…"
                       [value]="searchQuery()"
                       (input)="onSearch($event)" />
              </div>
            </header>

            <button type="button" class="cs-platform-link" (click)="onPlatformView()">
              <lucide-icon name="layout-dashboard" [size]="13" />
              <span>Platform admin view</span>
            </button>

            <div class="cs-divider"></div>

            @if (loading()) {
              <div class="cs-empty">Učitavanje…</div>
            } @else if (filteredTenants().length === 0) {
              <div class="cs-empty">Nema tenanta.</div>
            } @else {
              <ul class="cs-list">
                @for (t of filteredTenants(); track t.tenantId) {
                  <li>
                    <button type="button" class="cs-item"
                            [class.cs-item--active]="t.tenantId === currentTenantId()"
                            (click)="onSelect(t)">
                      <span class="cs-item-name">{{ t.name }}</span>
                      @if (t.tenantId === currentTenantId()) {
                        <lucide-icon name="check" [size]="13" />
                      }
                    </button>
                  </li>
                }
              </ul>
            }
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .cs-switcher {
        position: relative;
      }
      .cs-switcher-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 34px;
        padding: 0 12px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 10px;
        color: var(--cs-text-secondary);
        font-size: 12px;
        cursor: pointer;
        max-width: 280px;
      }
      .cs-switcher-btn:hover {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-switcher-label {
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .cs-dropdown {
        position: absolute;
        top: calc(100% + 6px);
        left: 0;
        width: 320px;
        max-height: 480px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
        z-index: 50;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .cs-dropdown-head {
        padding: 10px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-search {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        border-radius: 8px;
        padding: 6px 10px;
        color: var(--cs-text-tertiary);
      }
      .cs-search input {
        background: transparent;
        border: none;
        outline: none;
        flex: 1;
        font-size: 12px;
        color: var(--cs-text-primary);
      }
      .cs-platform-link {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        width: 100%;
        padding: 10px 14px;
        background: transparent;
        border: none;
        text-align: left;
        font-size: 12px;
        color: var(--cs-accent);
        font-weight: 600;
        cursor: pointer;
      }
      .cs-platform-link:hover {
        background: var(--cs-bg-2);
      }
      .cs-divider {
        height: 1px;
        background: var(--cs-border-subtle);
      }
      .cs-empty {
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-list {
        list-style: none;
        margin: 0;
        padding: 4px 0;
        overflow-y: auto;
      }
      .cs-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        width: 100%;
        padding: 8px 14px;
        background: transparent;
        border: none;
        text-align: left;
        font-size: 13px;
        color: var(--cs-text-primary);
        cursor: pointer;
      }
      .cs-item:hover {
        background: var(--cs-bg-2);
      }
      .cs-item--active {
        color: var(--cs-accent);
        font-weight: 600;
      }
      .cs-item-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `,
  ],
})
export class TenantSwitcherComponent implements OnInit {
  protected readonly authStore = inject(AuthStore);
  protected readonly tenantContext = inject(TenantContextService);
  private readonly platformService = inject(PlatformAdminService);
  private readonly router = inject(Router);

  protected readonly tenants = signal<TenantOverview[]>([]);
  protected readonly loading = signal(false);
  protected readonly isOpen = signal(false);
  protected readonly searchQuery = signal('');

  protected readonly currentTenantId = this.tenantContext.currentTenantId;

  protected readonly currentLabel = computed(() => {
    const name = this.tenantContext.currentTenantName();
    return name ?? 'Platform Admin';
  });

  protected readonly filteredTenants = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    const list = this.tenants();
    if (!q) return list;
    return list.filter((t) => t.name.toLowerCase().includes(q) || t.contactEmail.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    if (this.authStore.isPlatformAdmin()) {
      this.loadTenants();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.isOpen.set(false);
  }

  protected toggle(): void {
    this.isOpen.update((v) => !v);
  }

  protected onSearch(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  protected onSelect(tenant: TenantOverview): void {
    if (tenant.tenantId === this.currentTenantId()) {
      this.isOpen.set(false);
      return;
    }
    this.tenantContext.setTenant(tenant.tenantId, tenant.name);
    this.isOpen.set(false);
    // Reload da svi components fetch-uju podatke za novi tenant.
    window.location.reload();
  }

  protected onPlatformView(): void {
    this.tenantContext.clearTenant();
    this.isOpen.set(false);
    this.router.navigate(['/platform/tenants']).then(() => window.location.reload());
  }

  private loadTenants(): void {
    this.loading.set(true);
    this.platformService.getAllTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
