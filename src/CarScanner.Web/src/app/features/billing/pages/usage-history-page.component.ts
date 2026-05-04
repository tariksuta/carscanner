import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { BillingService } from '../services/billing.service';
import { AiUsageRecord, AiUsageStatus, PagedUsageResult } from '../models/billing.model';

@Component({
  selector: 'app-usage-history-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule, DatePipe],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Historija potrošnje</h1>
          <p class="cs-page-sub">AI analize zadnjih 30 dana</p>
        </div>
      </header>

      @if (isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (error()) {
        <div class="cs-error">{{ error() }}</div>
      } @else if (records(); as rs) {
        @if (rs.length === 0) {
          <div class="cs-empty">Još nema zabilježene AI potrošnje.</div>
        } @else {
          <div class="cs-table-wrap">
            <table class="cs-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Feature</th>
                  <th>Model</th>
                  <th class="num">Prompt</th>
                  <th class="num">Completion</th>
                  <th class="num">Total</th>
                  <th class="num">Naplaćeno</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                @for (r of rs; track r.id) {
                  <tr>
                    <td>{{ r.createdAtUtc | date: 'dd.MM.yyyy HH:mm' }}</td>
                    <td>{{ r.feature }}</td>
                    <td><code>{{ r.model }}</code></td>
                    <td class="num">{{ r.promptTokens }}</td>
                    <td class="num">{{ r.completionTokens }}</td>
                    <td class="num">{{ r.totalTokens }}</td>
                    <td class="num">{{ formatUsd(r.chargedAmount) }}</td>
                    <td>
                      <span class="cs-badge" [class]="statusClass(r.status)">
                        {{ statusLabel(r.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          @if (totalPages() > 1) {
            <div class="cs-pager">
              <button type="button" class="cs-pager-btn" [disabled]="page() <= 1" (click)="prev()">
                <lucide-icon name="chevron-left" [size]="14" /> Prethodna
              </button>
              <span class="cs-pager-info">Stranica {{ page() }} / {{ totalPages() }}</span>
              <button type="button" class="cs-pager-btn" [disabled]="page() >= totalPages()" (click)="next()">
                Sljedeća <lucide-icon name="chevron-right" [size]="14" />
              </button>
            </div>
          }
        }
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
      .cs-table-wrap {
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 14px;
        overflow: auto;
      }
      .cs-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .cs-table thead th {
        text-align: left;
        font-weight: 600;
        color: var(--cs-text-tertiary);
        padding: 12px 14px;
        background: var(--cs-bg-2);
        border-bottom: 1px solid var(--cs-border-subtle);
        text-transform: uppercase;
        font-size: 11px;
        letter-spacing: 0.04em;
      }
      .cs-table tbody td {
        padding: 11px 14px;
        border-bottom: 1px solid var(--cs-border-subtle);
        color: var(--cs-text-secondary);
      }
      .cs-table tbody tr:last-child td {
        border-bottom: 0;
      }
      .cs-table .num {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .cs-table code {
        font-family: var(--font-mono);
        font-size: 12px;
        color: var(--cs-text-primary);
      }
      .cs-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .cs-badge.committed {
        background: rgba(80, 200, 120, 0.15);
        color: rgb(80, 200, 120);
      }
      .cs-badge.refunded {
        background: rgba(150, 150, 150, 0.15);
        color: var(--cs-text-tertiary);
      }
      .cs-badge.fallback {
        background: rgba(255, 180, 60, 0.15);
        color: rgb(255, 180, 60);
      }
      .cs-badge.reserved {
        background: rgba(120, 160, 220, 0.15);
        color: rgb(120, 160, 220);
      }
      .cs-pager {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 8px 0;
      }
      .cs-pager-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 12px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 8px;
        color: var(--cs-text-secondary);
        font-size: 12px;
        cursor: pointer;
      }
      .cs-pager-btn:hover:not(:disabled) {
        background: var(--cs-bg-2);
        color: var(--cs-text-primary);
      }
      .cs-pager-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .cs-pager-info {
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-loading,
      .cs-error,
      .cs-empty {
        padding: 40px;
        text-align: center;
        color: var(--cs-text-tertiary);
      }
      .cs-error {
        color: var(--cs-status-danger);
      }
    `,
  ],
})
export class UsageHistoryPageComponent implements OnInit {
  private readonly billingService = inject(BillingService);

  private readonly pageSize = 20;

  readonly page = signal(1);
  readonly totalCount = signal(0);
  readonly records = signal<AiUsageRecord[] | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));

  ngOnInit(): void {
    this.load();
  }

  prev(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.load();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.page.update((p) => p + 1);
      this.load();
    }
  }

  formatUsd(value: number): string {
    return `$${value.toFixed(4)}`;
  }

  statusLabel(s: AiUsageStatus): string {
    switch (s) {
      case AiUsageStatus.Committed:
        return 'Naplaćeno';
      case AiUsageStatus.Refunded:
        return 'Vraćeno';
      case AiUsageStatus.EstimatedFallback:
        return 'Procjena';
      case AiUsageStatus.Reserved:
        return 'Rezervirano';
      default:
        return String(s);
    }
  }

  statusClass(s: AiUsageStatus): string {
    switch (s) {
      case AiUsageStatus.Committed:
        return 'committed';
      case AiUsageStatus.Refunded:
        return 'refunded';
      case AiUsageStatus.EstimatedFallback:
        return 'fallback';
      case AiUsageStatus.Reserved:
        return 'reserved';
      default:
        return '';
    }
  }

  private load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.billingService.getUsage({ page: this.page(), pageSize: this.pageSize }).subscribe({
      next: (result: PagedUsageResult) => {
        this.records.set(result.items);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Greška pri učitavanju.');
        this.isLoading.set(false);
      },
    });
  }
}
