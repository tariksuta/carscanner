import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformAdminService } from '../services/platform-admin.service';
import { TenantContextService } from '../../../core/services/tenant-context.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  TenantOverview,
  TenantStatus,
  TENANT_STATUS_LABELS,
} from '../models/platform.model';

type ConfirmKind = 'reactivate' | 'deactivate' | null;

@Component({
  selector: 'app-tenant-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ModalComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <a routerLink="/platform/tenants" class="cs-back">
          <lucide-icon name="arrow-left" [size]="16" /> Svi tenanti
        </a>
        @if (tenant(); as t) {
          <div class="cs-title-block">
            <div class="cs-title-row">
              <h1 class="cs-page-title">{{ t.name }}</h1>
              <span class="cs-status-pill" [attr.data-status]="statusKey(t.status)">
                {{ statusLabel(t.status) }}
              </span>
            </div>
            <p class="cs-page-sub">
              <lucide-icon name="mail" [size]="12" /> {{ t.contactEmail }}
              · Provisioned {{ t.provisionedAt | date: 'dd.MM.yyyy' }}
            </p>
          </div>
          <button type="button" class="cs-btn-primary" (click)="onViewAs()">
            <lucide-icon name="log-in" [size]="14" /> View as ovaj tenant
          </button>
        }
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (tenant(); as t) {
        <section class="cs-grid-2">
          <div class="cs-card">
            <h3 class="cs-card-title">
              <lucide-icon name="wallet" [size]="14" /> Billing
            </h3>
            <dl class="cs-meta">
              <div>
                <dt>Trenutni balance</dt>
                <dd>
                  @if (t.balance !== null) {
                    {{ t.balance | number: '1.2-2' }} {{ t.currency }}
                  } @else { — }
                </dd>
              </div>
              <div>
                <dt>Mjesečna potrošnja</dt>
                <dd>
                  @if (t.monthSpent !== null) {
                    {{ t.monthSpent | number: '1.2-2' }} {{ t.currency }}
                  } @else { — }
                </dd>
              </div>
              <div>
                <dt>Mjesečni cap</dt>
                <dd>
                  @if (t.monthlyHardCap !== null) {
                    {{ t.monthlyHardCap | number: '1.2-2' }} {{ t.currency }}
                  } @else { Bez limita }
                </dd>
              </div>
              <div>
                <dt>Low-balance prag</dt>
                <dd>
                  @if (t.lowBalanceThreshold !== null) {
                    {{ t.lowBalanceThreshold | number: '1.2-2' }} {{ t.currency }}
                  } @else { — }
                </dd>
              </div>
            </dl>
            <div class="cs-actions">
              <button class="cs-btn-secondary" (click)="onOpenTopUp()">
                <lucide-icon name="plus" [size]="13" /> Top-up
              </button>
              <button class="cs-btn-secondary" (click)="onOpenCap()">Postavi cap</button>
              <button class="cs-btn-secondary" (click)="onOpenThreshold()">Postavi prag</button>
            </div>
          </div>

          <div class="cs-card">
            <h3 class="cs-card-title">
              <lucide-icon name="shield-check" [size]="14" /> Status
            </h3>
            <p class="cs-status-desc">{{ statusDescription(t.status) }}</p>
            <div class="cs-actions">
              @if (t.status !== 0) {
                <button class="cs-btn-success" (click)="onConfirmAction('reactivate')">
                  <lucide-icon name="power" [size]="13" /> Aktiviraj
                </button>
              }
              @if (t.status === 0) {
                <button class="cs-btn-warning" (click)="onOpenSuspend()">
                  <lucide-icon name="alert-triangle" [size]="13" /> Suspenduj
                </button>
              }
              @if (t.status !== 2) {
                <button class="cs-btn-danger" (click)="onConfirmAction('deactivate')">
                  <lucide-icon name="power-off" [size]="13" /> Deaktiviraj
                </button>
              }
            </div>
          </div>
        </section>
      } @else {
        <div class="cs-empty">Tenant nije pronađen.</div>
      }

      <!-- TOP-UP MODAL -->
      <app-modal
        [isOpen]="topUpOpen()"
        title="Top-up balansa"
        [subtitle]="'Dodaj sredstva u tenant balance: ' + (tenant()?.name ?? '')"
        (close)="onCancel('topUp')"
      >
        @if (modalError()) {
          <div class="cs-form-error">{{ modalError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Iznos *</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              [(ngModel)]="topUpAmount"
              placeholder="0.00"
              autofocus
            />
          </label>
          <label class="cs-form-field">
            <span>Reference (opciono)</span>
            <input
              type="text"
              [(ngModel)]="topUpReference"
              placeholder="npr. Stripe payment #123"
            />
          </label>
        </div>
        <div modal-footer>
          <button class="cs-btn-secondary" (click)="onCancel('topUp')">Otkaži</button>
          <button
            class="cs-btn-primary"
            [disabled]="modalSubmitting() || !topUpAmount || topUpAmount <= 0"
            (click)="onSubmitTopUp()"
          >
            {{ modalSubmitting() ? 'Spremanje…' : 'Top-up' }}
          </button>
        </div>
      </app-modal>

      <!-- SET CAP MODAL -->
      <app-modal
        [isOpen]="capOpen()"
        title="Mjesečni cap"
        subtitle="Postavi mjesečni limit potrošnje (ostavi prazno za uklanjanje)"
        (close)="onCancel('cap')"
      >
        @if (modalError()) {
          <div class="cs-form-error">{{ modalError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Mjesečni cap (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              [(ngModel)]="capValue"
              placeholder="bez limita"
              autofocus
            />
          </label>
        </div>
        <div modal-footer>
          <button class="cs-btn-secondary" (click)="onCancel('cap')">Otkaži</button>
          <button
            class="cs-btn-primary"
            [disabled]="modalSubmitting()"
            (click)="onSubmitCap()"
          >
            {{ modalSubmitting() ? 'Spremanje…' : 'Spremi' }}
          </button>
        </div>
      </app-modal>

      <!-- SET THRESHOLD MODAL -->
      <app-modal
        [isOpen]="thresholdOpen()"
        title="Low-balance prag"
        subtitle="Postavi prag za upozorenje (ostavi prazno za uklanjanje)"
        (close)="onCancel('threshold')"
      >
        @if (modalError()) {
          <div class="cs-form-error">{{ modalError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Prag (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              [(ngModel)]="thresholdValue"
              placeholder="bez praga"
              autofocus
            />
          </label>
        </div>
        <div modal-footer>
          <button class="cs-btn-secondary" (click)="onCancel('threshold')">Otkaži</button>
          <button
            class="cs-btn-primary"
            [disabled]="modalSubmitting()"
            (click)="onSubmitThreshold()"
          >
            {{ modalSubmitting() ? 'Spremanje…' : 'Spremi' }}
          </button>
        </div>
      </app-modal>

      <!-- SUSPEND MODAL -->
      <app-modal
        [isOpen]="suspendOpen()"
        title="Suspenduj tenanta"
        subtitle="Korisnici neće moći pristupiti aplikaciji dok ne reaktivira"
        (close)="onCancel('suspend')"
      >
        @if (modalError()) {
          <div class="cs-form-error">{{ modalError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Razlog (opciono)</span>
            <input
              type="text"
              [(ngModel)]="suspendReason"
              placeholder="npr. Nepravilno korištenje servisa"
              autofocus
            />
          </label>
        </div>
        <div modal-footer>
          <button class="cs-btn-secondary" (click)="onCancel('suspend')">Otkaži</button>
          <button
            class="cs-btn-warning"
            [disabled]="modalSubmitting()"
            (click)="onSubmitSuspend()"
          >
            {{ modalSubmitting() ? 'Spremanje…' : 'Suspenduj' }}
          </button>
        </div>
      </app-modal>

      <!-- CONFIRM (REACTIVATE / DEACTIVATE) MODAL -->
      <app-modal
        [isOpen]="confirmOpen()"
        size="sm"
        [title]="confirmTitle()"
        [subtitle]="confirmSubtitle()"
        (close)="onCancel('confirm')"
      >
        @if (modalError()) {
          <div class="cs-form-error">{{ modalError() }}</div>
        }
        <p class="cs-confirm-text">{{ confirmMessage() }}</p>
        <div modal-footer>
          <button class="cs-btn-secondary" (click)="onCancel('confirm')">Otkaži</button>
          <button
            [class]="confirmAction() === 'deactivate' ? 'cs-btn-danger' : 'cs-btn-success'"
            [disabled]="modalSubmitting()"
            (click)="onSubmitConfirm()"
          >
            {{ modalSubmitting() ? 'Spremanje…' : confirmActionLabel() }}
          </button>
        </div>
      </app-modal>
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-page-head {
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 16px;
        align-items: end;
      }
      .cs-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: var(--cs-text-tertiary);
        text-decoration: none;
      }
      .cs-back:hover {
        color: var(--cs-text-primary);
      }
      .cs-title-block {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .cs-title-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        margin: 0;
        font-size: 12px;
        color: var(--cs-text-tertiary);
        display: inline-flex;
        align-items: center;
        gap: 6px;
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
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
      }
      .cs-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .cs-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .cs-card-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        margin: 0;
        color: var(--cs-text-secondary);
      }
      .cs-meta {
        margin: 0;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 14px;
      }
      .cs-meta div {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }
      .cs-meta dt {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .cs-meta dd {
        margin: 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-status-desc {
        margin: 0;
        font-size: 13px;
        color: var(--cs-text-secondary);
        line-height: 1.5;
      }
      .cs-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .cs-btn-primary,
      .cs-btn-secondary,
      .cs-btn-success,
      .cs-btn-warning,
      .cs-btn-danger {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 7px 12px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .cs-btn-primary {
        background: var(--cs-accent);
        color: var(--cs-accent-ink);
      }
      .cs-btn-primary[disabled],
      .cs-btn-warning[disabled],
      .cs-btn-danger[disabled],
      .cs-btn-success[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-btn-secondary {
        background: var(--cs-bg);
        border-color: var(--cs-border);
        color: var(--cs-text-primary);
      }
      .cs-btn-success {
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
        color: #10b981;
      }
      .cs-btn-warning {
        background: rgba(245, 158, 11, 0.1);
        border-color: rgba(245, 158, 11, 0.3);
        color: #f59e0b;
      }
      .cs-btn-danger {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.3);
        color: #ef4444;
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
      .cs-confirm-text {
        margin: 0;
        font-size: 13px;
        color: var(--cs-text-secondary);
        line-height: 1.55;
      }
    `,
  ],
})
export class TenantDetailPageComponent implements OnInit {
  private readonly service = inject(PlatformAdminService);
  private readonly tenantContext = inject(TenantContextService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tenant = signal<TenantOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly tenantId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');

  // Modal state
  protected readonly topUpOpen = signal(false);
  protected readonly capOpen = signal(false);
  protected readonly thresholdOpen = signal(false);
  protected readonly suspendOpen = signal(false);
  protected readonly confirmOpen = signal(false);
  protected readonly confirmAction = signal<ConfirmKind>(null);
  protected readonly modalSubmitting = signal(false);
  protected readonly modalError = signal<string | null>(null);

  // Form fields
  protected topUpAmount: number | null = null;
  protected topUpReference = '';
  protected capValue: number | null = null;
  protected thresholdValue: number | null = null;
  protected suspendReason = '';

  // Confirm dialog computed text
  protected readonly confirmTitle = computed(() =>
    this.confirmAction() === 'reactivate' ? 'Reaktiviraj tenanta' : 'Deaktiviraj tenanta',
  );
  protected readonly confirmSubtitle = computed(() => this.tenant()?.name ?? '');
  protected readonly confirmMessage = computed(() =>
    this.confirmAction() === 'reactivate'
      ? 'Tenant će se vratiti u aktivno stanje, korisnici će ponovo moći pristupiti aplikaciji.'
      : 'Trajno deaktiviraš tenanta. Ova akcija ne može se opozvati lako — koristi je samo ako tenant više neće biti klijent.',
  );
  protected readonly confirmActionLabel = computed(() =>
    this.confirmAction() === 'reactivate' ? 'Reaktiviraj' : 'Deaktiviraj',
  );

  ngOnInit(): void {
    this.refresh();
  }

  private refresh(): void {
    this.loading.set(true);
    this.service.getAllTenants().subscribe({
      next: (list) => {
        this.tenant.set(list.find((t) => t.tenantId === this.tenantId()) ?? null);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected onViewAs(): void {
    const t = this.tenant();
    if (!t) return;
    this.tenantContext.setTenant(t.tenantId, t.name);
    this.router.navigate(['/dashboard']).then(() => window.location.reload());
  }

  // ---- Open modal handlers ----

  protected onOpenTopUp(): void {
    this.topUpAmount = null;
    this.topUpReference = '';
    this.modalError.set(null);
    this.topUpOpen.set(true);
  }

  protected onOpenCap(): void {
    this.capValue = this.tenant()?.monthlyHardCap ?? null;
    this.modalError.set(null);
    this.capOpen.set(true);
  }

  protected onOpenThreshold(): void {
    this.thresholdValue = this.tenant()?.lowBalanceThreshold ?? null;
    this.modalError.set(null);
    this.thresholdOpen.set(true);
  }

  protected onOpenSuspend(): void {
    this.suspendReason = '';
    this.modalError.set(null);
    this.suspendOpen.set(true);
  }

  protected onConfirmAction(action: 'reactivate' | 'deactivate'): void {
    this.confirmAction.set(action);
    this.modalError.set(null);
    this.confirmOpen.set(true);
  }

  // ---- Cancel ----

  protected onCancel(kind: 'topUp' | 'cap' | 'threshold' | 'suspend' | 'confirm'): void {
    if (this.modalSubmitting()) return;
    if (kind === 'topUp') this.topUpOpen.set(false);
    if (kind === 'cap') this.capOpen.set(false);
    if (kind === 'threshold') this.thresholdOpen.set(false);
    if (kind === 'suspend') this.suspendOpen.set(false);
    if (kind === 'confirm') {
      this.confirmOpen.set(false);
      this.confirmAction.set(null);
    }
  }

  // ---- Submit handlers ----

  protected onSubmitTopUp(): void {
    if (!this.topUpAmount || this.topUpAmount <= 0) return;
    this.runAction(
      this.service.topUp(this.tenantId(), {
        amount: this.topUpAmount,
        reference: this.topUpReference.trim() || null,
      }),
      () => this.topUpOpen.set(false),
    );
  }

  protected onSubmitCap(): void {
    this.runAction(
      this.service.setMonthlyCap(this.tenantId(), { cap: this.capValue }),
      () => this.capOpen.set(false),
    );
  }

  protected onSubmitThreshold(): void {
    this.runAction(
      this.service.setLowBalanceThreshold(this.tenantId(), { threshold: this.thresholdValue }),
      () => this.thresholdOpen.set(false),
    );
  }

  protected onSubmitSuspend(): void {
    this.runAction(
      this.service.suspend(this.tenantId(), { reason: this.suspendReason.trim() || null }),
      () => this.suspendOpen.set(false),
    );
  }

  protected onSubmitConfirm(): void {
    const action = this.confirmAction();
    if (!action) return;
    const obs =
      action === 'reactivate' ? this.service.reactivate(this.tenantId()) : this.service.deactivate(this.tenantId());
    this.runAction(obs, () => {
      this.confirmOpen.set(false);
      this.confirmAction.set(null);
    });
  }

  private runAction<T>(observable: import('rxjs').Observable<T>, onSuccess: () => void): void {
    this.modalSubmitting.set(true);
    this.modalError.set(null);
    observable.subscribe({
      next: () => {
        this.modalSubmitting.set(false);
        onSuccess();
        this.refresh();
      },
      error: (err: unknown) => {
        this.modalSubmitting.set(false);
        const msg = (err as { error?: { message?: string } })?.error?.message;
        this.modalError.set(msg ?? 'Greška pri spremanju.');
      },
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

  protected statusDescription(s: TenantStatus): string {
    if (s === TenantStatus.Active) return 'Tenant je aktivan, korisnici mogu koristiti aplikaciju.';
    if (s === TenantStatus.Suspended) return 'Tenant je privremeno suspendovan. Korisnici ne mogu pristupiti.';
    return 'Tenant je deaktiviran (trajno).';
  }
}
