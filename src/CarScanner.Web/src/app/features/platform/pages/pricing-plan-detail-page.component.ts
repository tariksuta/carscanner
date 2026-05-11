import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { PlatformAdminService } from '../services/platform-admin.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import {
  ModelPricing,
  PRICING_PLAN_MODULES,
  PricingPlanDetail,
  PricingPlanModule,
} from '../models/platform.model';

@Component({
  selector: 'app-pricing-plan-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, ModalComponent],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <a routerLink="/platform/pricing-plans" class="cs-back">
          <lucide-icon name="arrow-left" [size]="16" /> Svi planovi
        </a>
        @if (plan(); as p) {
          <div class="cs-title-block">
            <div class="cs-title-row">
              <h1 class="cs-page-title">{{ p.name }}</h1>
              @if (p.isDefault) {
                <span class="cs-status-pill" data-status="default">Default</span>
              }
            </div>
            <p class="cs-page-sub">
              Markup {{ p.markupMultiplier | number: '1.2-2' }}x · Effective od
              {{ p.effectiveFromUtc | date: 'dd.MM.yyyy' }}
            </p>
          </div>
          <div class="cs-head-actions">
            @if (!p.isDefault) {
              <button
                type="button"
                class="cs-btn-secondary"
                [disabled]="setDefaultBusy()"
                (click)="onSetDefault()"
              >
                <lucide-icon name="star" [size]="14" />
                @if (setDefaultBusy()) { Postavlja… } @else { Postavi default }
              </button>
            }
            <button type="button" class="cs-btn-danger" (click)="onAskDelete()">
              <lucide-icon name="trash-2" [size]="14" /> Obriši plan
            </button>
          </div>
        }
      </header>

      @if (loading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (plan(); as p) {
        <section class="cs-grid">
          <!-- Basic Info -->
          <div class="cs-card cs-card-wide">
            <div class="cs-card-head-row">
              <h3 class="cs-card-title">
                <lucide-icon name="info" [size]="14" /> Osnovne informacije
              </h3>
              <button type="button" class="cs-btn-secondary" (click)="onOpenEdit()">
                <lucide-icon name="pencil" [size]="13" /> Uredi
              </button>
            </div>
            <dl class="cs-meta">
              <div>
                <dt>Naziv</dt>
                <dd>{{ p.name }}</dd>
              </div>
              <div>
                <dt>Markup multiplier</dt>
                <dd>{{ p.markupMultiplier | number: '1.2-2' }}x</dd>
              </div>
              <div>
                <dt>Default plan</dt>
                <dd>{{ p.isDefault ? 'Da' : 'Ne' }}</dd>
              </div>
              <div>
                <dt>Effective od</dt>
                <dd>{{ p.effectiveFromUtc | date: 'dd.MM.yyyy HH:mm' }}</dd>
              </div>
              @if (p.effectiveUntilUtc) {
                <div>
                  <dt>Effective do</dt>
                  <dd>{{ p.effectiveUntilUtc | date: 'dd.MM.yyyy HH:mm' }}</dd>
                </div>
              }
            </dl>
          </div>

          <!-- Enabled Modules -->
          <div class="cs-card">
            <div class="cs-card-head-row">
              <h3 class="cs-card-title">
                <lucide-icon name="shield-check" [size]="14" /> Uključeni moduli
              </h3>
              <button
                type="button"
                class="cs-btn-primary"
                [disabled]="!modulesDirty() || modulesSaving()"
                (click)="onSaveModules()"
              >
                @if (modulesSaving()) { Spremanje… } @else { Sačuvaj }
              </button>
            </div>
            @if (modulesError()) {
              <div class="cs-form-error">{{ modulesError() }}</div>
            }
            <div class="cs-modules-grid">
              @for (m of availableModules; track m) {
                <label class="cs-form-checkbox">
                  <input
                    type="checkbox"
                    [checked]="moduleSelected(m)"
                    (change)="onToggleModule(m, $event)"
                  />
                  <span>{{ m }}</span>
                </label>
              }
            </div>
            @if (hasHiddenPlatformTenants()) {
              <p class="cs-hint">
                ⓘ Ovaj plan ima i interni <code>PlatformTenants</code> modul. Sakriven je iz
                liste; ostaje uključen pri spremanju.
              </p>
            }
          </div>

          <!-- Model Pricings -->
          <div class="cs-card cs-card-wide">
            <div class="cs-card-head-row">
              <h3 class="cs-card-title">
                <lucide-icon name="dollar-sign" [size]="14" /> Cijene po modelu
              </h3>
              <button type="button" class="cs-btn-primary" (click)="onAddPricing()">
                <lucide-icon name="plus" [size]="13" /> Dodaj model
              </button>
            </div>

            @if (p.modelPricings.length === 0) {
              <div class="cs-empty-inline">
                Nema definisanih cijena. Dodajte cijenu za prvi AI model.
              </div>
            } @else {
              <div class="cs-table-wrap">
                <table class="cs-table">
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th class="cs-num">Prompt $/1k</th>
                      <th class="cs-num">Completion $/1k</th>
                      <th class="cs-num">Surcharge</th>
                      <th class="cs-actions-col">Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (mp of p.modelPricings; track mp.model) {
                      <tr>
                        <td>{{ mp.model }}</td>
                        <td class="cs-num">{{ mp.promptCostPerThousandTokens | number: '1.4-6' }}</td>
                        <td class="cs-num">
                          {{ mp.completionCostPerThousandTokens | number: '1.4-6' }}
                        </td>
                        <td class="cs-num">
                          @if (mp.fixedSurchargePerCall !== null) {
                            {{ mp.fixedSurchargePerCall | number: '1.4-6' }}
                          } @else { — }
                        </td>
                        <td class="cs-actions">
                          <button
                            type="button"
                            class="cs-icon-btn"
                            title="Uredi"
                            (click)="onEditPricing(mp)"
                          >
                            <lucide-icon name="pencil" [size]="13" />
                          </button>
                          <button
                            type="button"
                            class="cs-icon-btn cs-icon-btn-danger"
                            title="Obriši"
                            (click)="onAskDeletePricing(mp)"
                          >
                            <lucide-icon name="trash-2" [size]="13" />
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </section>
      } @else if (loadError()) {
        <div class="cs-form-error">{{ loadError() }}</div>
      }

      <!-- Edit Basic Info Modal -->
      <app-modal
        [isOpen]="editOpen()"
        title="Uredi osnovne informacije"
        (close)="onCancelEdit()"
      >
        @if (editError()) {
          <div class="cs-form-error">{{ editError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Naziv plana *</span>
            <input type="text" [(ngModel)]="editName" autofocus />
          </label>
          <label class="cs-form-field">
            <span>Markup multiplier *</span>
            <input type="number" min="1" step="0.05" [(ngModel)]="editMarkup" />
          </label>
        </div>

        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelEdit()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-primary"
            [disabled]="editSaving() || !canSubmitEdit()"
            (click)="onSubmitEdit()"
          >
            @if (editSaving()) { Spremanje… } @else { Sačuvaj }
          </button>
        </div>
      </app-modal>

      <!-- Upsert Model Pricing Modal -->
      <app-modal
        [isOpen]="pricingOpen()"
        [title]="pricingEditingExisting() ? 'Uredi cijenu modela' : 'Dodaj cijenu modela'"
        (close)="onCancelPricing()"
      >
        @if (pricingError()) {
          <div class="cs-form-error">{{ pricingError() }}</div>
        }
        <div class="cs-form">
          <label class="cs-form-field">
            <span>Naziv modela *</span>
            <input
              type="text"
              [(ngModel)]="pricingModel"
              [disabled]="pricingEditingExisting()"
              placeholder="npr. gpt-4o-mini"
            />
            @if (pricingEditingExisting()) {
              <small class="cs-form-hint">
                Naziv modela se ne može mijenjati nakon kreiranja. Obrišite i dodajte novi.
              </small>
            }
          </label>
          <label class="cs-form-field">
            <span>Prompt cost (po 1000 tokena) *</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              [(ngModel)]="pricingPrompt"
              placeholder="0.0050"
            />
          </label>
          <label class="cs-form-field">
            <span>Completion cost (po 1000 tokena) *</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              [(ngModel)]="pricingCompletion"
              placeholder="0.0150"
            />
          </label>
          <label class="cs-form-field">
            <span>Fiksni dodatak po pozivu (opciono)</span>
            <input
              type="number"
              min="0"
              step="0.0001"
              [(ngModel)]="pricingSurcharge"
              placeholder="ostavi prazno"
            />
          </label>
        </div>

        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelPricing()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-primary"
            [disabled]="pricingSaving() || !canSubmitPricing()"
            (click)="onSubmitPricing()"
          >
            @if (pricingSaving()) { Spremanje… } @else { Sačuvaj }
          </button>
        </div>
      </app-modal>

      <!-- Delete Pricing Row Confirm -->
      <app-modal
        [isOpen]="deletePricingTarget() !== null"
        title="Obriši cijenu modela?"
        size="sm"
        (close)="onCancelDeletePricing()"
      >
        @if (deletePricingTarget(); as t) {
          <p class="cs-confirm-text">
            Obrisati cijene za model <strong>{{ t.model }}</strong>?
          </p>
        }
        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelDeletePricing()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-danger"
            [disabled]="deletePricingSaving()"
            (click)="onConfirmDeletePricing()"
          >
            @if (deletePricingSaving()) { Brisanje… } @else { Obriši }
          </button>
        </div>
      </app-modal>

      <!-- Delete Plan Confirm -->
      <app-modal
        [isOpen]="deletePlanOpen()"
        title="Obriši pricing plan?"
        size="sm"
        (close)="onCancelDeletePlan()"
      >
        @if (deletePlanError()) {
          <div class="cs-form-error">{{ deletePlanError() }}</div>
        }
        @if (plan(); as p) {
          <p class="cs-confirm-text">
            Obrisati plan <strong>{{ p.name }}</strong>? Ovo se ne može vratiti.
          </p>
          @if (p.isDefault) {
            <p class="cs-confirm-warn">
              ⚠ Ovo je trenutni default plan.
            </p>
          }
        }
        <div modal-footer>
          <button type="button" class="cs-btn-secondary" (click)="onCancelDeletePlan()">
            Otkaži
          </button>
          <button
            type="button"
            class="cs-btn-danger"
            [disabled]="deletePlanSaving()"
            (click)="onConfirmDeletePlan()"
          >
            @if (deletePlanSaving()) { Brisanje… } @else { Obriši }
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
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 16px;
        align-items: center;
      }
      .cs-back {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--cs-text-tertiary);
        text-decoration: none;
      }
      .cs-back:hover {
        color: var(--cs-text-primary);
      }
      .cs-title-row {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 22px;
        font-weight: 700;
        margin: 0;
        color: var(--cs-text-primary);
      }
      .cs-page-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
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
      .cs-head-actions {
        display: flex;
        gap: 8px;
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
      .cs-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 14px;
      }
      .cs-card {
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        border-radius: 12px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .cs-card-wide {
        grid-column: 1 / -1;
      }
      .cs-card-head-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      .cs-card-title {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: var(--cs-text-primary);
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .cs-meta {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 12px;
        margin: 0;
        padding: 8px 0;
      }
      .cs-meta dt {
        font-size: 10px;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .cs-meta dd {
        margin: 0;
        font-size: 13px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-modules-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 8px;
      }
      .cs-form-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: var(--cs-text-primary);
        cursor: pointer;
        padding: 6px 8px;
        border-radius: 8px;
      }
      .cs-form-checkbox:hover {
        background: var(--cs-bg);
      }
      .cs-hint {
        font-size: 11px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-hint code {
        background: var(--cs-bg);
        padding: 1px 4px;
        border-radius: 4px;
        font-size: 11px;
      }
      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
        background: var(--cs-bg-2);
        border: 1px dashed var(--cs-border);
        border-radius: 10px;
      }
      .cs-empty-inline {
        padding: 24px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 13px;
        background: var(--cs-bg);
        border-radius: 8px;
      }
      .cs-table-wrap {
        overflow-x: auto;
      }
      .cs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .cs-table th {
        text-align: left;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--cs-text-tertiary);
        padding: 8px 10px;
        border-bottom: 1px solid var(--cs-border-subtle);
      }
      .cs-table td {
        padding: 10px;
        border-bottom: 1px solid var(--cs-border-subtle);
        color: var(--cs-text-primary);
      }
      .cs-table tbody tr:last-child td {
        border-bottom: none;
      }
      .cs-num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .cs-actions-col {
        width: 100px;
        text-align: right;
      }
      .cs-actions {
        display: flex;
        gap: 6px;
        justify-content: flex-end;
      }
      .cs-icon-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: var(--cs-bg);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-tertiary);
        cursor: pointer;
      }
      .cs-icon-btn:hover {
        color: var(--cs-text-primary);
      }
      .cs-icon-btn-danger:hover {
        background: rgba(239, 68, 68, 0.1);
        border-color: rgba(239, 68, 68, 0.4);
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
      .cs-form-field input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .cs-form-hint {
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-form-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
        padding: 10px 12px;
        border-radius: 8px;
        font-size: 12px;
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
export class PricingPlanDetailPageComponent implements OnInit {
  private readonly service = inject(PlatformAdminService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly availableModules = PRICING_PLAN_MODULES;

  protected readonly plan = signal<PricingPlanDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);

  // Modules editor state
  private readonly initialModules = signal<Set<string>>(new Set());
  private readonly currentModules = signal<Set<string>>(new Set());
  protected readonly modulesSaving = signal(false);
  protected readonly modulesError = signal<string | null>(null);

  protected readonly modulesDirty = computed(() => {
    const a = this.initialModules();
    const b = this.currentModules();
    if (a.size !== b.size) return true;
    for (const v of a) if (!b.has(v)) return true;
    return false;
  });

  protected readonly hasHiddenPlatformTenants = computed(() =>
    this.currentModules().has('PlatformTenants'),
  );

  // Edit basic info
  protected readonly editOpen = signal(false);
  protected editName = '';
  protected editMarkup = 1;
  protected readonly editSaving = signal(false);
  protected readonly editError = signal<string | null>(null);

  // Upsert model pricing
  protected readonly pricingOpen = signal(false);
  protected readonly pricingEditingExisting = signal(false);
  protected pricingModel = '';
  protected pricingPrompt: number | null = null;
  protected pricingCompletion: number | null = null;
  protected pricingSurcharge: number | null = null;
  protected readonly pricingSaving = signal(false);
  protected readonly pricingError = signal<string | null>(null);

  // Delete pricing row
  protected readonly deletePricingTarget = signal<ModelPricing | null>(null);
  protected readonly deletePricingSaving = signal(false);

  // Set default
  protected readonly setDefaultBusy = signal(false);

  // Delete plan
  protected readonly deletePlanOpen = signal(false);
  protected readonly deletePlanSaving = signal(false);
  protected readonly deletePlanError = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/platform/pricing-plans']);
      return;
    }
    this.fetch(id);
  }

  protected moduleSelected(module: PricingPlanModule): boolean {
    return this.currentModules().has(module);
  }

  protected onToggleModule(module: PricingPlanModule, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.currentModules());
    if (checked) next.add(module);
    else next.delete(module);
    this.currentModules.set(next);
  }

  protected onSaveModules(): void {
    const p = this.plan();
    if (!p || !this.modulesDirty() || this.modulesSaving()) return;
    this.modulesSaving.set(true);
    this.modulesError.set(null);

    const modules = Array.from(this.currentModules());
    this.service.setPricingPlanModules(p.id, { modules }).subscribe({
      next: () => {
        this.modulesSaving.set(false);
        this.fetch(p.id);
      },
      error: (err) => {
        this.modulesSaving.set(false);
        this.modulesError.set(this.errorMessage(err, 'Greška pri spremanju modula.'));
      },
    });
  }

  protected onOpenEdit(): void {
    const p = this.plan();
    if (!p) return;
    this.editName = p.name;
    this.editMarkup = p.markupMultiplier;
    this.editError.set(null);
    this.editOpen.set(true);
  }

  protected onCancelEdit(): void {
    if (this.editSaving()) return;
    this.editOpen.set(false);
  }

  protected canSubmitEdit(): boolean {
    return (
      this.editName.trim().length > 0 &&
      Number.isFinite(this.editMarkup) &&
      this.editMarkup >= 1
    );
  }

  protected onSubmitEdit(): void {
    const p = this.plan();
    if (!p || !this.canSubmitEdit() || this.editSaving()) return;
    this.editSaving.set(true);
    this.editError.set(null);

    this.service
      .updatePricingPlan(p.id, {
        name: this.editName.trim(),
        markupMultiplier: this.editMarkup,
      })
      .subscribe({
        next: () => {
          this.editSaving.set(false);
          this.editOpen.set(false);
          this.fetch(p.id);
        },
        error: (err) => {
          this.editSaving.set(false);
          this.editError.set(this.errorMessage(err, 'Greška pri spremanju.'));
        },
      });
  }

  protected onAddPricing(): void {
    this.pricingEditingExisting.set(false);
    this.pricingModel = '';
    this.pricingPrompt = null;
    this.pricingCompletion = null;
    this.pricingSurcharge = null;
    this.pricingError.set(null);
    this.pricingOpen.set(true);
  }

  protected onEditPricing(mp: ModelPricing): void {
    this.pricingEditingExisting.set(true);
    this.pricingModel = mp.model;
    this.pricingPrompt = mp.promptCostPerThousandTokens;
    this.pricingCompletion = mp.completionCostPerThousandTokens;
    this.pricingSurcharge = mp.fixedSurchargePerCall;
    this.pricingError.set(null);
    this.pricingOpen.set(true);
  }

  protected onCancelPricing(): void {
    if (this.pricingSaving()) return;
    this.pricingOpen.set(false);
  }

  protected canSubmitPricing(): boolean {
    return (
      this.pricingModel.trim().length > 0 &&
      this.pricingPrompt !== null &&
      this.pricingPrompt >= 0 &&
      this.pricingCompletion !== null &&
      this.pricingCompletion >= 0 &&
      (this.pricingSurcharge === null || this.pricingSurcharge >= 0)
    );
  }

  protected onSubmitPricing(): void {
    const p = this.plan();
    if (!p || !this.canSubmitPricing() || this.pricingSaving()) return;
    this.pricingSaving.set(true);
    this.pricingError.set(null);

    this.service
      .upsertModelPricing(p.id, {
        model: this.pricingModel.trim(),
        promptCostPerThousandTokens: this.pricingPrompt!,
        completionCostPerThousandTokens: this.pricingCompletion!,
        fixedSurchargePerCall: this.pricingSurcharge,
      })
      .subscribe({
        next: () => {
          this.pricingSaving.set(false);
          this.pricingOpen.set(false);
          this.fetch(p.id);
        },
        error: (err) => {
          this.pricingSaving.set(false);
          this.pricingError.set(this.errorMessage(err, 'Greška pri spremanju cijene.'));
        },
      });
  }

  protected onAskDeletePricing(mp: ModelPricing): void {
    this.deletePricingTarget.set(mp);
  }

  protected onCancelDeletePricing(): void {
    if (this.deletePricingSaving()) return;
    this.deletePricingTarget.set(null);
  }

  protected onConfirmDeletePricing(): void {
    const p = this.plan();
    const target = this.deletePricingTarget();
    if (!p || !target || this.deletePricingSaving()) return;
    this.deletePricingSaving.set(true);

    this.service.removeModelPricing(p.id, target.model).subscribe({
      next: () => {
        this.deletePricingSaving.set(false);
        this.deletePricingTarget.set(null);
        this.fetch(p.id);
      },
      error: () => {
        this.deletePricingSaving.set(false);
      },
    });
  }

  protected onSetDefault(): void {
    const p = this.plan();
    if (!p || p.isDefault || this.setDefaultBusy()) return;
    this.setDefaultBusy.set(true);

    this.service.setDefaultPricingPlan(p.id).subscribe({
      next: () => {
        this.setDefaultBusy.set(false);
        this.fetch(p.id);
      },
      error: () => this.setDefaultBusy.set(false),
    });
  }

  protected onAskDelete(): void {
    this.deletePlanError.set(null);
    this.deletePlanOpen.set(true);
  }

  protected onCancelDeletePlan(): void {
    if (this.deletePlanSaving()) return;
    this.deletePlanOpen.set(false);
  }

  protected onConfirmDeletePlan(): void {
    const p = this.plan();
    if (!p || this.deletePlanSaving()) return;
    this.deletePlanSaving.set(true);
    this.deletePlanError.set(null);

    this.service.deletePricingPlan(p.id).subscribe({
      next: () => {
        this.deletePlanSaving.set(false);
        this.router.navigate(['/platform/pricing-plans']);
      },
      error: (err) => {
        this.deletePlanSaving.set(false);
        this.deletePlanError.set(this.errorMessage(err, 'Greška pri brisanju.'));
      },
    });
  }

  private fetch(id: string): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.service.getPricingPlanById(id).subscribe({
      next: (data) => {
        this.plan.set(data);
        const moduleSet = new Set(data.enabledModules);
        this.initialModules.set(new Set(moduleSet));
        this.currentModules.set(new Set(moduleSet));
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.loadError.set(this.errorMessage(err, 'Plan nije pronađen.'));
      },
    });
  }

  private errorMessage(err: unknown, fallback: string): string {
    return (err as { error?: { message?: string } })?.error?.message ?? fallback;
  }
}
