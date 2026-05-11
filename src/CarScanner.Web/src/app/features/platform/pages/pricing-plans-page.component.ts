import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformAdminService } from '../services/platform-admin.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { PricingPlanSummary } from '../models/platform.model';

@Component({
  selector: 'app-pricing-plans-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ModalComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Pricing planovi</h1>
          <p class="cs-page-sub">
            Sistemski definisani planovi sa cijenama AI tokena i feature gating-om
          </p>
        </div>
        <button type="button" class="cs-btn-primary" (click)="onCreateNew()">
          <lucide-icon name="plus" [size]="15" /> Novi plan
        </button>
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (plans().length === 0) {
        <div class="cs-empty">
          <lucide-icon name="tag" [size]="36" />
          <p>Nema kreiranih planova. Kliknite "Novi plan" za prvi.</p>
        </div>
      } @else {
        <div class="cs-grid">
          @for (p of plans(); track p.id) {
            <article class="cs-card" [attr.data-default]="p.isDefault ? 'true' : 'false'">
              <header class="cs-card-head">
                <div class="cs-card-title-row">
                  <h3 class="cs-card-title">{{ p.name }}</h3>
                  @if (p.isDefault) {
                    <span class="cs-status-pill" data-status="default">Default</span>
                  }
                </div>
              </header>

              <dl class="cs-card-meta">
                <div>
                  <dt>Markup</dt>
                  <dd>{{ p.markupMultiplier | number: '1.2-2' }}x</dd>
                </div>
                <div>
                  <dt>Modula</dt>
                  <dd>{{ p.enabledModuleCount }}</dd>
                </div>
                <div>
                  <dt>Modela</dt>
                  <dd>{{ p.modelPricingCount }}</dd>
                </div>
                <div>
                  <dt>Effective</dt>
                  <dd>{{ p.effectiveFromUtc | date: 'dd.MM.yyyy' }}</dd>
                </div>
              </dl>

              <footer class="cs-card-actions">
                <div class="cs-card-actions-left">
                  @if (!p.isDefault) {
                    <button
                      type="button"
                      class="cs-btn-secondary"
                      [disabled]="setDefaultId() === p.id"
                      (click)="onSetDefault(p)"
                    >
                      <lucide-icon name="star" [size]="13" />
                      @if (setDefaultId() === p.id) {
                        Postavlja…
                      } @else {
                        Postavi default
                      }
                    </button>
                  }
                  <button
                    type="button"
                    class="cs-icon-btn cs-icon-btn-danger"
                    title="Obriši plan"
                    (click)="onAskDelete(p)"
                  >
                    <lucide-icon name="trash-2" [size]="14" />
                  </button>
                </div>
                <a [routerLink]="['/platform/pricing-plans', p.id]" class="cs-btn-link">
                  Detalji →
                </a>
              </footer>
            </article>
          }
        </div>
      }

      <app-modal
        [isOpen]="createOpen()"
        title="Novi pricing plan"
        subtitle="Kreiraj novi plan; po defaultu uključuje sve module osim PlatformTenants"
        (close)="onCancelCreate()"
      >
        @if (createError()) {
          <div class="cs-form-error">{{ createError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Naziv plana *</span>
            <input
              type="text"
              [(ngModel)]="createName"
              placeholder="npr. Standard plan"
              autofocus
            />
          </label>
          <label class="cs-form-field">
            <span>Markup multiplier *</span>
            <input
              type="number"
              min="1"
              step="0.05"
              [(ngModel)]="createMarkup"
              placeholder="1.40"
            />
            <small class="cs-form-hint">Min. 1.0 (bez markupa). Tipično 1.20–2.00.</small>
          </label>
          <label class="cs-form-checkbox">
            <input type="checkbox" [(ngModel)]="createDefault" />
            <span>Postavi kao default plan (skida default sa prethodnog)</span>
          </label>
        </div>

        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelCreate()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-primary"
            [disabled]="createSubmitting() || !canSubmitCreate()"
            (click)="onSubmitCreate()"
          >
            @if (createSubmitting()) {
              Spremanje…
            } @else {
              Kreiraj
            }
          </button>
        </div>
      </app-modal>

      <app-modal
        [isOpen]="deleteTarget() !== null"
        title="Obriši pricing plan?"
        size="sm"
        (close)="onCancelDelete()"
      >
        @if (deleteTarget(); as t) {
          @if (deleteError()) {
            <div class="cs-form-error">{{ deleteError() }}</div>
          }
          <p class="cs-confirm-text">
            Obrisati plan <strong>{{ t.name }}</strong>? Ovo se ne može vratiti.
          </p>
          @if (t.isDefault) {
            <p class="cs-confirm-warn">
              ⚠ Ovo je trenutni default plan. Drugi plan bi trebao biti postavljen kao default
              prije brisanja.
            </p>
          }
        }
        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelDelete()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-danger"
            [disabled]="deleteSubmitting()"
            (click)="onConfirmDelete()"
          >
            @if (deleteSubmitting()) {
              Brisanje…
            } @else {
              Obriši
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
      .cs-btn-secondary,
      .cs-btn-danger {
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
      .cs-btn-danger {
        background: #ef4444;
        color: white;
      }
      .cs-btn-primary[disabled],
      .cs-btn-secondary[disabled],
      .cs-btn-danger[disabled] {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-btn-link {
        color: var(--cs-accent);
        font-size: 13px;
        text-decoration: none;
      }
      .cs-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-tertiary);
        cursor: pointer;
      }
      .cs-icon-btn-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.4);
        color: #ef4444;
      }
      .cs-loading,
      .cs-empty {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
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
      .cs-card[data-default='true'] {
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
      .cs-status-pill {
        padding: 3px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }
      .cs-status-pill[data-status='default'] {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      .cs-card-meta {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
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
        gap: 8px;
      }
      .cs-card-actions-left {
        display: flex;
        align-items: center;
        gap: 6px;
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
      .cs-form-hint {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-form-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--cs-text-primary);
        cursor: pointer;
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
        margin: 0 0 8px;
        font-size: 14px;
        color: var(--cs-text-primary);
      }
      .cs-confirm-warn {
        margin: 0;
        font-size: 12px;
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
        border: 1px solid rgba(245, 158, 11, 0.3);
        padding: 8px 10px;
        border-radius: 8px;
      }
    `,
  ],
})
export class PricingPlansPageComponent implements OnInit {
  private readonly service = inject(PlatformAdminService);

  protected readonly plans = signal<PricingPlanSummary[]>([]);
  protected readonly loading = signal(true);

  protected readonly createOpen = signal(false);
  protected createName = '';
  protected createMarkup = 1.4;
  protected createDefault = false;
  protected readonly createSubmitting = signal(false);
  protected readonly createError = signal<string | null>(null);

  protected readonly deleteTarget = signal<PricingPlanSummary | null>(null);
  protected readonly deleteSubmitting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  protected readonly setDefaultId = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  protected onCreateNew(): void {
    this.createName = '';
    this.createMarkup = 1.4;
    this.createDefault = false;
    this.createError.set(null);
    this.createOpen.set(true);
  }

  protected onCancelCreate(): void {
    if (this.createSubmitting()) return;
    this.createOpen.set(false);
  }

  protected canSubmitCreate(): boolean {
    return (
      this.createName.trim().length > 0 &&
      Number.isFinite(this.createMarkup) &&
      this.createMarkup >= 1
    );
  }

  protected onSubmitCreate(): void {
    if (!this.canSubmitCreate() || this.createSubmitting()) return;
    this.createSubmitting.set(true);
    this.createError.set(null);

    this.service
      .createPricingPlan({
        name: this.createName.trim(),
        markupMultiplier: this.createMarkup,
        isDefault: this.createDefault,
      })
      .subscribe({
        next: () => {
          this.createSubmitting.set(false);
          this.createOpen.set(false);
          this.refresh();
        },
        error: (err) => {
          this.createSubmitting.set(false);
          this.createError.set(this.errorMessage(err, 'Greška pri kreiranju plana.'));
        },
      });
  }

  protected onSetDefault(plan: PricingPlanSummary): void {
    if (this.setDefaultId() !== null) return;
    this.setDefaultId.set(plan.id);

    this.service.setDefaultPricingPlan(plan.id).subscribe({
      next: () => {
        this.setDefaultId.set(null);
        this.refresh();
      },
      error: () => {
        this.setDefaultId.set(null);
        // Keep simple here — the only realistic error is "plan not found", which can't
        // happen for a plan we just listed. Silent failure suffices; user can retry.
      },
    });
  }

  protected onAskDelete(plan: PricingPlanSummary): void {
    this.deleteError.set(null);
    this.deleteTarget.set(plan);
  }

  protected onCancelDelete(): void {
    if (this.deleteSubmitting()) return;
    this.deleteTarget.set(null);
  }

  protected onConfirmDelete(): void {
    const target = this.deleteTarget();
    if (target === null || this.deleteSubmitting()) return;

    this.deleteSubmitting.set(true);
    this.deleteError.set(null);

    this.service.deletePricingPlan(target.id).subscribe({
      next: () => {
        this.deleteSubmitting.set(false);
        this.deleteTarget.set(null);
        this.refresh();
      },
      error: (err) => {
        this.deleteSubmitting.set(false);
        this.deleteError.set(this.errorMessage(err, 'Greška pri brisanju.'));
      },
    });
  }

  private refresh(): void {
    this.loading.set(true);
    this.service.getAllPricingPlans().subscribe({
      next: (data) => {
        this.plans.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private errorMessage(err: unknown, fallback: string): string {
    return (err as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
