import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformAdminService } from '../services/platform-admin.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  TenantOverview,
  TenantStatus,
  TENANT_STATUS_LABELS,
} from '../models/platform.model';

@Component({
  selector: 'app-tenants-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ModalComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Platform Admin — Tenanti</h1>
          <p class="cs-page-sub">Pregled i upravljanje svim tenantima u sistemu</p>
        </div>
        <button type="button" class="cs-btn-primary" (click)="onProvisionNew()">
          <lucide-icon name="plus" [size]="15" /> Novi tenant
        </button>
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (tenants().length === 0) {
        <div class="cs-empty">Nema kreiranih tenanta. Kliknite "Novi tenant" da provisionirate prvog.</div>
      } @else {
        <div class="cs-grid">
          @for (t of tenants(); track t.tenantId) {
            <article class="cs-card" [attr.data-status]="statusKey(t.status)">
              <header class="cs-card-head">
                <div class="cs-card-title-row">
                  <h3 class="cs-card-title">{{ t.name }}</h3>
                  <span class="cs-status-pill" [attr.data-status]="statusKey(t.status)">
                    {{ statusLabel(t.status) }}
                  </span>
                </div>
                <p class="cs-card-email">
                  <lucide-icon name="mail" [size]="12" /> {{ t.contactEmail }}
                </p>
              </header>

              <dl class="cs-card-meta">
                <div>
                  <dt>Balance</dt>
                  <dd>
                    @if (t.balance !== null) {
                      {{ t.balance | number: '1.2-2' }} {{ t.currency }}
                    } @else {
                      —
                    }
                  </dd>
                </div>
                <div>
                  <dt>Mjesec</dt>
                  <dd>
                    @if (t.monthSpent !== null) {
                      {{ t.monthSpent | number: '1.2-2' }}
                    } @else {
                      —
                    }
                  </dd>
                </div>
                <div>
                  <dt>Provisioned</dt>
                  <dd>{{ t.provisionedAt | date: 'dd.MM.yyyy' }}</dd>
                </div>
              </dl>

              <footer class="cs-card-actions">
                <button type="button" class="cs-btn-secondary" (click)="onViewAs(t)">
                  <lucide-icon name="log-in" [size]="14" /> View as
                </button>
                <a [routerLink]="['/platform/tenants', t.tenantId]" class="cs-btn-link">
                  Detalji →
                </a>
              </footer>
            </article>
          }
        </div>
      }

      <app-modal
        [isOpen]="provisionOpen()"
        title="Novi tenant"
        subtitle="Provisioniraj novi tenant na platformi"
        (close)="onCancelProvision()"
      >
        @if (provisionError()) {
          <div class="cs-form-error">{{ provisionError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Naziv tenanta *</span>
            <input
              type="text"
              [(ngModel)]="provisionName"
              placeholder="npr. Sarajevo Auto-Park"
              autofocus
            />
          </label>
          <label class="cs-form-field">
            <span>Kontakt email *</span>
            <input
              type="email"
              [(ngModel)]="provisionEmail"
              placeholder="kontakt@firma.com"
            />
          </label>
          <label class="cs-form-field">
            <span>Početni balans (USD, opciono)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              [(ngModel)]="provisionBalance"
              placeholder="0.00"
            />
          </label>
        </div>

        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelProvision()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-primary"
            [disabled]="provisionSubmitting() || !canSubmitProvision()"
            (click)="onSubmitProvision()"
          >
            @if (provisionSubmitting()) {
              Spremanje…
            } @else {
              Provisioniraj
            }
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1600px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-btn-primary,
      .cs-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 8px 14px;
        border-radius: 9px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        border: none;
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
      }
      .cs-btn-secondary {
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
      }
      .cs-btn-link {
        color: var(--cs-accent);
        font-size: 13px;
        text-decoration: none;
      }
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
      }
      .cs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 14px;
      }
      .cs-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-card[data-status='suspended'] {
        border-left: 3px solid #f59e0b;
      }
      .cs-card[data-status='deactivated'] {
        opacity: 0.6;
        border-left: 3px solid #6b7280;
      }
      .cs-card[data-status='active'] {
        border-left: 3px solid #10b981;
      }
      .cs-card-head {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-card-title-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .cs-card-title {
        margin: 0;
        font-size: 16px;
        font-weight: 700;
        color: var(--cs-text-primary);
      }
      .cs-card-email {
        margin: 0;
        font-size: 12px;
        color: var(--cs-text-tertiary);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .cs-status-pill {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        background: var(--cs-bg);
      }
      .cs-status-pill[data-status='active'] {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      .cs-status-pill[data-status='suspended'] {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
      .cs-status-pill[data-status='deactivated'] {
        background: rgba(107, 114, 128, 0.2);
        color: #9ca3af;
      }
      .cs-card-meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin: 0;
        padding: 12px 0;
        border-top: 1px solid var(--cs-border-subtle);
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-card-meta div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cs-card-meta dt {
        font-size: 10px;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .cs-card-meta dd {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-card-actions {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .cs-form {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-form-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .cs-form-field span {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        font-weight: 600;
      }
      .cs-form-field input {
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        border-radius: 8px;
        padding: 9px 10px;
        font-family: var(--font-text);
        font-size: 13px;
        color: var(--cs-text-primary);
        outline: none;
        color-scheme: dark;
      }
      .cs-form-field input:focus {
        border-color: var(--cs-accent);
      }
      .cs-form-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 12px;
        margin-bottom: 14px;
      }
      .cs-btn-primary[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
    `,
  ],
})
export class TenantsListPageComponent implements OnInit {
  private readonly service = inject(PlatformAdminService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly router = inject(Router);

  protected readonly tenants = signal<TenantOverview[]>([]);
  protected readonly loading = signal(true);

  protected readonly provisionOpen = signal(false);
  protected provisionName = '';
  protected provisionEmail = '';
  protected provisionBalance: number | null = null;
  protected readonly provisionSubmitting = signal(false);
  protected readonly provisionError = signal<string | null>(null);

  ngOnInit(): void {
    this.service.getAllTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onViewAs(tenant: TenantOverview): void {
    this.tenantContext.setTenant(tenant.tenantId, tenant.name);
    this.router.navigate(['/dashboard']).then(() => window.location.reload());
  }

  protected onProvisionNew(): void {
    this.provisionName = '';
    this.provisionEmail = '';
    this.provisionBalance = null;
    this.provisionError.set(null);
    this.provisionOpen.set(true);
  }

  protected onCancelProvision(): void {
    this.provisionOpen.set(false);
  }

  protected canSubmitProvision(): boolean {
    return this.provisionName.trim().length > 0 && this.provisionEmail.trim().length > 0;
  }

  protected onSubmitProvision(): void {
    if (!this.canSubmitProvision() || this.provisionSubmitting()) return;
    this.provisionSubmitting.set(true);
    this.provisionError.set(null);

    this.service
      .provisionTenant({
        name: this.provisionName.trim(),
        contactEmail: this.provisionEmail.trim(),
        initialBalance: this.provisionBalance,
      })
      .subscribe({
        next: () => {
          this.provisionSubmitting.set(false);
          this.provisionOpen.set(false);
          this.refresh();
        },
        error: (err) => {
          this.provisionSubmitting.set(false);
          this.provisionError.set(
            (err as { error?: { message?: string } })?.error?.message ?? 'Greška pri spremanju.',
          );
        },
      });
  }

  private refresh(): void {
    this.loading.set(true);
    this.service.getAllTenants().subscribe({
      next: (data) => {
        this.tenants.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected statusLabel(s: TenantStatus): string {
    return TENANT_STATUS_LABELS[s] ?? '—';
  }

  protected statusKey(s: TenantStatus): 'active' | 'suspended' | 'deactivated' {
    if (s === TenantStatus.Active) return 'active';
    if (s === TenantStatus.Suspended) return 'suspended';
    return 'deactivated';
  }
}
