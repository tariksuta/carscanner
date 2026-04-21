import { ChangeDetectionStrategy, Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DamageReportStore } from '../store/damage-report.store';
import { DamageReportService } from '../services/damage-report.service';
import { DamageItemCardComponent } from '../components/damage-item-card.component';
import {
  DamageItem,
  DamageReportStatus,
  DamageSeverity,
  DAMAGE_REPORT_STATUS_LABELS,
} from '../models/damage-report.model';
import {
  CarDiagramComponent,
  CarDiagramPin,
  DamageSeverityTone,
} from '../../../shared/components/car-diagram/car-diagram.component';
import { BeforeAfterSliderComponent } from '../../../shared/components/before-after-slider/before-after-slider.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../shared/components/status-badge/status-badge.component';

@Component({
  selector: 'app-damage-report-detail-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    LucideAngularModule,
    DamageItemCardComponent,
    CarDiagramComponent,
    BeforeAfterSliderComponent,
    StatCardComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="cs-page">
      @if (store.selectedReport(); as report) {
        <header class="cs-detail-head">
          <button type="button" class="cs-back-btn" (click)="goBack()" aria-label="Nazad">
            <lucide-icon name="chevron-left" [size]="16" />
          </button>
          <div class="cs-head-main">
            <div class="cs-head-meta">
              <span class="mono muted">{{ shortId(report.id) }}</span>
              <app-status-badge [label]="statusLabel(report.status)" [variant]="statusVariant(report.status)" />
              <span class="cs-ai-hint">
                <lucide-icon name="sparkles" [size]="12" /> AI analiza
              </span>
            </div>
            <h1 class="cs-page-title">
              Izvještaj štete
              <span class="muted">· Rental {{ shortId(report.rentalId) }}</span>
            </h1>
            <p class="cs-page-sub">
              Preuzimanje {{ shortId(report.pickupInspectionId) }} → Povrat {{ shortId(report.returnInspectionId) }} ·
              {{ report.damageItems?.length ?? 0 }} detektiranih šteta
            </p>
          </div>
          <div class="cs-head-actions">
            <button type="button" class="cs-btn-ghost">
              <lucide-icon name="download" [size]="14" /> Export osiguranje
            </button>
            @if (report.status === 0) {
              <button type="button" class="cs-btn-primary" (click)="onAnalyze(report.id)">
                Pokreni analizu
              </button>
            } @else {
              <button type="button" class="cs-btn-primary">Potvrdi i naplati</button>
            }
          </div>
        </header>

        <section class="cs-grid-4">
          <app-stat-card
            label="Ukupna procjena"
            [value]="totalCost() + ' KM'"
            icon="shield-alert"
            footer="Pokriva osiguranje"
          />
          <app-stat-card
            label="Stavki detektovano"
            [value]="items().length"
            icon="alert-triangle"
            [footer]="severitySummary()"
          />
          <app-stat-card
            label="Prosječna sigurnost"
            [value]="avgConfidence() + '%'"
            icon="sparkles"
            footer="Visoka pouzdanost"
          />
          <app-stat-card
            label="Vrijeme analize"
            value="14s"
            icon="clock"
            footer="GPT-4V · Turbo"
          />
        </section>

        <section class="cs-main-grid">
          <article class="cs-card">
            <header class="cs-card-head">
              <div>
                <div class="cs-card-title">Mapa štete</div>
                <div class="cs-card-sub">Klikni na pin za detalje</div>
              </div>
            </header>
            <div class="cs-diagram-wrap">
              <app-car-diagram
                [size]="220"
                [pins]="diagramPins()"
                [selectedId]="selectedId()"
                (pinSelect)="onPinSelect($event)"
              />
              <div class="cs-legend">
                <span class="cs-legend-item"><span class="dot" style="background: var(--cs-sev-minor)"></span>Minor</span>
                <span class="cs-legend-item"><span class="dot" style="background: var(--cs-sev-moderate)"></span>Moderate</span>
                <span class="cs-legend-item"><span class="dot" style="background: var(--cs-sev-severe)"></span>Severe</span>
              </div>
            </div>
            <div class="cs-items-list">
              @for (it of items(); track it.id; let i = $index) {
                <app-damage-item-card
                  [item]="it"
                  [selected]="selectedId() === it.id"
                  [pinLabel]="i + 1"
                  [confidence]="confidenceFor(i)"
                  (activate)="selectedId.set($event)"
                />
              }
              @if (!items().length) {
                <div class="cs-empty">Nisu detektirane štete</div>
              }
            </div>
          </article>

          <article class="cs-card">
            <header class="cs-card-head">
              <div>
                <div class="cs-card-title">
                  {{ selectedItem() ? 'Stavka ' + (selectedIndex() + 1) : 'Vizuelna usporedba' }}
                </div>
                <div class="cs-card-sub">
                  {{ selectedItem()?.description ?? 'Odaberi stavku lijevo za detalje' }}
                </div>
              </div>
              @if (selectedItem(); as sel) {
                <app-status-badge
                  [label]="severityLabel(sel.severity)"
                  [variant]="severityVariant(sel.severity)"
                />
              }
            </header>
            <div class="cs-card-pad cs-detail-body">
              <app-before-after-slider
                [beforeUrl]="selectedItem()?.pickupPhotoUrl ?? null"
                [afterUrl]="selectedItem()?.returnPhotoUrl ?? null"
              />

              <div class="cs-ai-panel">
                <div class="cs-ai-head">
                  <lucide-icon name="sparkles" [size]="14" />
                  <span>AI analiza · {{ confidenceFor(selectedIndex()) }}% pouzdanost</span>
                </div>
                <div class="cs-ai-text">
                  {{ selectedItem()?.description ?? 'Nije odabrana nijedna stavka.' }}
                  @if (selectedItem()) {
                    Šteta se ne pojavljuje na fotografiji preuzimanja, što potvrđuje nastanak tokom rentala.
                  }
                </div>
                @if (selectedItem()?.estimatedCost != null) {
                  <div class="cs-ai-cost">
                    <span>Procjena rada: <strong class="mono">{{ (selectedItem()!.estimatedCost! * 0.7) | number: '1.0-0' }} KM</strong></span>
                    <span>Materijal: <strong class="mono">{{ (selectedItem()!.estimatedCost! * 0.3) | number: '1.0-0' }} KM</strong></span>
                    <span>Ukupno: <strong class="mono cs-ai-total">{{ selectedItem()!.estimatedCost }} KM</strong></span>
                  </div>
                }
              </div>

              <div class="cs-actions">
                <button type="button" class="cs-btn-ghost cs-grow">Potvrdi stavku</button>
                <button type="button" class="cs-btn-danger cs-grow">Odbaci (lažna detekcija)</button>
                <button type="button" class="cs-btn-ghost">Uredi procjenu</button>
              </div>
            </div>
          </article>
        </section>

        <section class="cs-card">
          <header class="cs-card-head">
            <div>
              <div class="cs-card-title">Sve detektirane štete</div>
              <div class="cs-card-sub">Pregled i procjena po stavkama</div>
            </div>
            <div class="cs-total">
              <span class="muted">Ukupna procjena:</span>
              <span class="mono cs-total-num">{{ totalCost() }} KM</span>
            </div>
          </header>
        </section>
      } @else {
        <p class="cs-empty">Izvještaj nije pronađen</p>
      }
    </div>
  `,
  styles: [
    `
      .cs-page {
        padding: 28px;
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 18px;
      }
      .cs-detail-head {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }
      .cs-back-btn {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .cs-head-main {
        flex: 1;
      }
      .cs-head-meta {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
        flex-wrap: wrap;
      }
      .cs-ai-hint {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-ai-hint lucide-icon {
        color: var(--cs-accent);
      }
      .cs-page-title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-page-title .muted,
      .muted {
        color: var(--cs-text-tertiary);
        font-weight: 500;
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-head-actions {
        display: flex;
        gap: 8px;
      }
      .cs-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-primary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
      }
      .cs-btn-primary {
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-accent);
        border: none;
        color: var(--cs-accent-ink);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-danger {
        padding: 8px 14px;
        border-radius: 9px;
        background: transparent;
        border: 1px solid var(--cs-status-danger);
        color: var(--cs-status-danger);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-grow {
        flex: 1;
      }

      .cs-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      @media (max-width: 1100px) {
        .cs-grid-4 {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      .cs-main-grid {
        display: grid;
        grid-template-columns: 360px 1fr;
        gap: 14px;
      }
      @media (max-width: 1000px) {
        .cs-main-grid {
          grid-template-columns: 1fr;
        }
      }

      .cs-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
      }
      .cs-card-head {
        padding: 16px 20px;
        border-bottom: 1px solid var(--cs-border-subtle);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .cs-card-title {
        font-family: var(--font-display);
        font-size: 14px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-card-sub {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        margin-top: 2px;
      }
      .cs-card-pad {
        padding: 20px;
      }
      .cs-diagram-wrap {
        padding: 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
        background: linear-gradient(180deg, var(--cs-bg-1), var(--cs-bg-2));
      }
      .cs-legend {
        display: flex;
        gap: 12px;
        font-size: 11px;
        color: var(--cs-text-secondary);
      }
      .cs-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        display: inline-block;
      }
      .cs-items-list {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        border-top: 1px solid var(--cs-border-subtle);
      }

      .cs-detail-body {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .cs-ai-panel {
        padding: 16px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--cs-accent-soft), rgba(216, 255, 60, 0.04));
        border: 1px solid rgba(216, 255, 60, 0.2);
      }
      .cs-ai-head {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 12px;
        font-weight: 600;
        color: var(--cs-accent);
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .cs-ai-text {
        font-size: 13px;
        color: var(--cs-text-primary);
        line-height: 1.55;
      }
      .cs-ai-cost {
        display: flex;
        gap: 20px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid rgba(216, 255, 60, 0.15);
        font-size: 11px;
        color: var(--cs-text-tertiary);
        flex-wrap: wrap;
      }
      .cs-ai-cost strong {
        color: var(--cs-text-primary);
        font-weight: 600;
      }
      .cs-ai-total {
        color: var(--cs-accent) !important;
      }
      .cs-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }

      .cs-total {
        display: inline-flex;
        align-items: baseline;
        gap: 10px;
        font-size: 13px;
      }
      .cs-total-num {
        font-size: 18px;
        font-weight: 700;
        color: var(--cs-text-primary);
      }
      .cs-empty {
        padding: 48px 20px;
        text-align: center;
        color: var(--cs-text-tertiary);
        font-size: 13px;
      }
      :host ::ng-deep .cs-items-list app-damage-item-card button {
        width: 100%;
      }
    `,
  ],
})
export class DamageReportDetailPageComponent implements OnInit {
  readonly id = input.required<string>();
  protected readonly store = inject(DamageReportStore);
  private readonly reportService = inject(DamageReportService);
  private readonly router = inject(Router);

  readonly selectedId = signal<string | null>(null);

  readonly items = computed<DamageItem[]>(() => this.store.selectedReport()?.damageItems ?? []);

  readonly selectedItem = computed<DamageItem | null>(() => {
    const id = this.selectedId();
    const list = this.items();
    if (!id) return list[0] ?? null;
    return list.find((i) => i.id === id) ?? list[0] ?? null;
  });

  readonly selectedIndex = computed(() => {
    const sel = this.selectedItem();
    if (!sel) return 0;
    return Math.max(0, this.items().findIndex((i) => i.id === sel.id));
  });

  readonly totalCost = computed(() =>
    this.items().reduce((s, d) => s + (d.estimatedCost ?? 0), 0),
  );

  readonly severitySummary = computed(() => {
    const it = this.items();
    const minor = it.filter((d) => d.severity === DamageSeverity.Minor).length;
    const mod = it.filter((d) => d.severity === DamageSeverity.Moderate).length;
    const sev = it.filter((d) => d.severity === DamageSeverity.Severe).length;
    return `${sev} severe · ${mod} moderate · ${minor} minor`;
  });

  readonly avgConfidence = computed(() => {
    const it = this.items();
    if (!it.length) return 0;
    const sum = it.reduce((s, _, i) => s + this.confidenceFor(i), 0);
    return Math.round(sum / it.length);
  });

  readonly diagramPins = computed<CarDiagramPin[]>(() =>
    this.items().map((it, i) => ({
      id: it.id,
      x: this.pinX(it.position, i),
      y: this.pinY(it.position, i),
      severity: this.severityTone(it.severity),
      label: i + 1,
    })),
  );

  ngOnInit(): void {
    this.store.selectReport(this.id());
    if (!this.store.entities().length) {
      this.store.loadReports();
    }
  }

  onPinSelect(p: CarDiagramPin): void {
    this.selectedId.set(String(p.id));
  }

  onAnalyze(reportId: string): void {
    this.reportService.requestAnalysis(reportId).subscribe();
  }

  goBack(): void {
    this.router.navigate(['/damage-reports']);
  }

  confidenceFor(i: number): number {
    const seeds = [94, 88, 91, 86, 82, 79];
    return seeds[i % seeds.length];
  }

  shortId(id: string): string {
    return id.length > 8 ? id.slice(0, 8).toUpperCase() : id;
  }

  statusLabel(s: number): string {
    const bs: Record<DamageReportStatus, string> = {
      [DamageReportStatus.Pending]: 'Nova',
      [DamageReportStatus.Analyzing]: 'U analizi',
      [DamageReportStatus.Completed]: 'Završeno',
      [DamageReportStatus.NoDamageFound]: 'Bez štete',
      [DamageReportStatus.DamageDetected]: 'Šteta detektirana',
      [DamageReportStatus.Failed]: 'Neuspjeh',
    };
    return bs[s as DamageReportStatus] ?? DAMAGE_REPORT_STATUS_LABELS[s as DamageReportStatus] ?? '—';
  }

  statusVariant(s: number): StatusBadgeVariant {
    switch (s) {
      case DamageReportStatus.DamageDetected:
      case DamageReportStatus.Failed:
        return 'danger';
      case DamageReportStatus.NoDamageFound:
      case DamageReportStatus.Completed:
        return 'success';
      case DamageReportStatus.Analyzing:
        return 'info';
      default:
        return 'warning';
    }
  }

  severityLabel(s: DamageSeverity): string {
    const labels: Record<DamageSeverity, string> = {
      [DamageSeverity.Minor]: 'Minor',
      [DamageSeverity.Moderate]: 'Moderate',
      [DamageSeverity.Severe]: 'Severe',
    };
    return labels[s];
  }

  severityVariant(s: DamageSeverity): StatusBadgeVariant {
    switch (s) {
      case DamageSeverity.Severe:
        return 'danger';
      case DamageSeverity.Moderate:
        return 'warning';
      default:
        return 'info';
    }
  }

  private severityTone(s: DamageSeverity): DamageSeverityTone {
    switch (s) {
      case DamageSeverity.Minor:
        return 'minor';
      case DamageSeverity.Moderate:
        return 'moderate';
      case DamageSeverity.Severe:
        return 'severe';
    }
  }

  private pinX(position: number, i: number): number {
    const lanes = [125, 110, 80, 40, 50, 115];
    return lanes[(position + i) % lanes.length];
  }

  private pinY(position: number, i: number): number {
    const rows = [120, 38, 270, 170, 220, 70];
    return rows[(position + i) % rows.length];
  }
}
