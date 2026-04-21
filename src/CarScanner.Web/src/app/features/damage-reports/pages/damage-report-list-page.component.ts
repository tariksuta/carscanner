import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { DamageReportStore } from '../store/damage-report.store';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FilterChipComponent } from '../../../shared/components/filter-chip/filter-chip.component';
import { StatusBadgeComponent, StatusBadgeVariant } from '../../../shared/components/status-badge/status-badge.component';
import { StatCardComponent } from '../../../shared/components/stat-card/stat-card.component';
import { DateFormatPipe } from '../../../shared/pipes/date-format.pipe';
import { DAMAGE_REPORT_STATUS_LABELS, DamageReportStatus } from '../models/damage-report.model';

type ReportFilter = 'all' | 'new' | 'analyzing' | 'damage' | 'clean';

@Component({
  selector: 'app-damage-report-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LucideAngularModule,
    PaginationComponent,
    FilterChipComponent,
    StatusBadgeComponent,
    StatCardComponent,
    DateFormatPipe,
  ],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Izvještaji šteta</h1>
          <p class="cs-page-sub">AI-generirani izvještaji nakon povrata vozila</p>
        </div>
        <button type="button" class="cs-btn-ghost">
          <lucide-icon name="download" [size]="14" /> Export svi
        </button>
      </header>

      <div class="cs-grid-4">
        <app-stat-card
          label="Ukupno ovog mjeseca"
          [value]="summary().total"
          [delta]="8"
          icon="shield-alert"
          [footer]="summary().clean + ' bez štete · ' + summary().damaged + ' sa'"
        />
        <app-stat-card
          label="Ukupni iznos šteta"
          [value]="summary().totalCost + ' KM'"
          [delta]="12"
          deltaTone="danger"
          icon="sparkles"
          footer="Prosjek po stavci"
        />
        <app-stat-card
          label="Stopa detekcije"
          [value]="summary().detectionRate + '%'"
          icon="alert-triangle"
          footer="Od svih povrata"
        />
        <app-stat-card
          label="Prosjek pouzdanosti"
          value="89%"
          icon="check"
          footer="Visoka za auto-potvrdu"
        />
      </div>

      <div class="cs-chips">
        <app-filter-chip [active]="filter() === 'all'" [count]="store.totalCount()" (pressed)="filter.set('all')">Svi</app-filter-chip>
        <app-filter-chip [active]="filter() === 'new'" [count]="counts().pending" (pressed)="filter.set('new')">Nove</app-filter-chip>
        <app-filter-chip [active]="filter() === 'analyzing'" [count]="counts().analyzing" (pressed)="filter.set('analyzing')">U analizi</app-filter-chip>
        <app-filter-chip [active]="filter() === 'damage'" [count]="counts().damage" (pressed)="filter.set('damage')">Šteta</app-filter-chip>
        <app-filter-chip [active]="filter() === 'clean'" [count]="counts().clean" (pressed)="filter.set('clean')">Bez štete</app-filter-chip>
      </div>

      @if (store.isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else {
        <div class="cs-table-card">
          <table class="cs-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rental</th>
                <th>Stavki</th>
                <th>Status</th>
                <th style="text-align: right">Procjena</th>
                <th>Zatraženo</th>
              </tr>
            </thead>
            <tbody>
              @for (r of filtered(); track r.id) {
                <tr (click)="onView(r.id)">
                  <td class="mono muted">{{ shortId(r.id) }}</td>
                  <td class="mono">{{ shortId(r.rentalId) }}</td>
                  <td>
                    @if (r.damageItems?.length) {
                      <span class="mono">{{ r.damageItems.length }}</span>
                    } @else {
                      <span class="muted">—</span>
                    }
                  </td>
                  <td>
                    <app-status-badge [label]="statusLabel(r.status)" [variant]="statusVariant(r.status)" />
                  </td>
                  <td style="text-align: right">
                    @if (r.totalEstimatedCost != null) {
                      <span class="mono" [style.color]="(r.totalEstimatedCost ?? 0) > 0 ? 'var(--cs-status-danger)' : 'var(--cs-status-active)'">
                        {{ r.totalEstimatedCost }} KM
                      </span>
                    } @else {
                      <span class="muted">—</span>
                    }
                  </td>
                  <td class="mono muted">{{ r.requestedAt | dateFormat: 'date' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="cs-empty">Nema izvještaja</td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (store.totalPages() > 1) {
          <app-pagination
            [currentPage]="store.currentPage()"
            [totalPages]="store.totalPages()"
            [totalCount]="store.totalCount()"
            [pageSize]="store.pageSize()"
            [hasPreviousPage]="store.hasPreviousPage()"
            [hasNextPage]="store.hasNextPage()"
            (pageChange)="onPageChange($event)"
          />
        }
      }
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
        color: var(--cs-text-primary);
        letter-spacing: -0.025em;
        margin: 0;
      }
      .cs-page-sub {
        font-size: 13px;
        color: var(--cs-text-tertiary);
        margin: 4px 0 0;
      }
      .cs-btn-ghost {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        border-radius: 9px;
        background: var(--cs-bg-2);
        border: 1px solid var(--cs-border);
        color: var(--cs-text-secondary);
        font-family: var(--font-text);
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
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
      .cs-chips {
        display: flex;
        gap: 6px;
        flex-wrap: wrap;
      }
      .cs-table-card {
        border-radius: 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        overflow: hidden;
      }
      .cs-table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        font-family: var(--font-text);
      }
      .cs-table th {
        padding: 12px 16px;
        text-align: left;
        font-size: 11px;
        font-weight: 600;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.08em;
        border-bottom: 1px solid var(--cs-border-subtle);
        white-space: nowrap;
      }
      .cs-table th:first-child,
      .cs-table td:first-child {
        padding-left: 20px;
      }
      .cs-table td {
        padding: 14px 16px;
        font-size: 13px;
        color: var(--cs-text-primary);
        border-bottom: 1px solid var(--cs-border-subtle);
        vertical-align: middle;
      }
      .cs-table tbody tr {
        cursor: pointer;
      }
      .cs-table tbody tr:hover {
        background: var(--cs-bg-2);
      }
      .cs-table tr:last-child td {
        border-bottom: none;
      }
      .cs-empty {
        padding: 48px 20px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
      .muted {
        color: var(--cs-text-tertiary);
      }
      .cs-loading {
        padding: 48px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
    `,
  ],
})
export class DamageReportListPageComponent implements OnInit {
  protected readonly store = inject(DamageReportStore);
  private readonly router = inject(Router);

  readonly filter = signal<ReportFilter>('all');

  readonly counts = computed(() => {
    const list = this.store.entities();
    return {
      pending: list.filter((r) => r.status === DamageReportStatus.Pending).length,
      analyzing: list.filter((r) => r.status === DamageReportStatus.Analyzing).length,
      damage: list.filter((r) => r.status === DamageReportStatus.DamageDetected).length,
      clean: list.filter((r) => r.status === DamageReportStatus.NoDamageFound).length,
    };
  });

  readonly summary = computed(() => {
    const list = this.store.entities();
    const damaged = list.filter((r) => r.status === DamageReportStatus.DamageDetected).length;
    const clean = list.filter((r) => r.status === DamageReportStatus.NoDamageFound).length;
    const totalCost = list.reduce((s, r) => s + (r.totalEstimatedCost ?? 0), 0);
    const completed = damaged + clean;
    const rate = completed ? Math.round((damaged / completed) * 100) : 0;
    return {
      total: list.length,
      damaged,
      clean,
      totalCost: totalCost.toLocaleString('bs-BA'),
      detectionRate: rate,
    };
  });

  readonly filtered = computed(() => {
    const list = this.store.entities();
    switch (this.filter()) {
      case 'new':
        return list.filter((r) => r.status === DamageReportStatus.Pending);
      case 'analyzing':
        return list.filter((r) => r.status === DamageReportStatus.Analyzing);
      case 'damage':
        return list.filter((r) => r.status === DamageReportStatus.DamageDetected);
      case 'clean':
        return list.filter((r) => r.status === DamageReportStatus.NoDamageFound);
      default:
        return list;
    }
  });

  ngOnInit(): void {
    this.store.loadReports();
  }

  onPageChange(page: number): void {
    this.store.setPage(page);
    this.store.loadReports();
  }

  onView(id: string): void {
    this.router.navigate(['/damage-reports', id]);
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

  shortId(id: string): string {
    return id.length > 8 ? id.slice(0, 8).toUpperCase() : id;
  }
}
