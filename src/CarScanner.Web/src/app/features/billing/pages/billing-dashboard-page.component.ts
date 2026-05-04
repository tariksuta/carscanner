import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../../environments/environment';
import { BillingService } from '../services/billing.service';
import { BillingAccount } from '../models/billing.model';

@Component({
  selector: 'app-billing-dashboard-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    <div class="cs-page">
      <header class="cs-page-head">
        <div>
          <h1 class="cs-page-title">Naplata</h1>
          <p class="cs-page-sub">Stanje kredita i potrošnja AI analize</p>
        </div>
        <button type="button" class="cs-btn-secondary" (click)="goToHistory()">
          <lucide-icon name="history" [size]="15" /> Historija potrošnje
        </button>
      </header>

      @if (isLoading()) {
        <div class="cs-loading">Učitavanje…</div>
      } @else if (error()) {
        <div class="cs-error">{{ error() }}</div>
      } @else if (account(); as a) {
        <section class="cs-grid">
          <article class="cs-card balance" [class.amber]="balanceTone() === 'amber'" [class.red]="balanceTone() === 'red'">
            <div class="cs-card-label">Trenutni balans</div>
            <div class="cs-card-amount">{{ formatUsd(a.balance) }}</div>
            <div class="cs-card-sub">~ {{ formatBam(a.balance) }}</div>
            @if (a.lowBalanceThreshold) {
              <div class="cs-card-foot">
                Prag upozorenja: {{ formatUsd(a.lowBalanceThreshold) }}
              </div>
            }
          </article>

          <article class="cs-card">
            <div class="cs-card-label">Potrošeno ovaj mjesec</div>
            <div class="cs-card-amount">{{ formatUsd(a.monthSpent) }}</div>
            @if (a.monthlyHardCap) {
              <div class="cs-card-sub">Limit: {{ formatUsd(a.monthlyHardCap) }}</div>
              <div class="cs-progress">
                <div class="cs-progress-bar" [style.width.%]="capPercent(a)"></div>
              </div>
              <div class="cs-card-foot">{{ capPercent(a).toFixed(0) }}% iskorišteno</div>
            } @else {
              <div class="cs-card-sub">Bez mjesečnog limita</div>
            }
          </article>

          <article class="cs-card">
            <div class="cs-card-label">Plan</div>
            <div class="cs-card-amount small">{{ a.planName || '—' }}</div>
            <div class="cs-card-sub">Markup: {{ a.markupMultiplier }}×</div>
          </article>

          <article class="cs-card">
            <div class="cs-card-label">Lifetime</div>
            <div class="cs-stat-row">
              <span>Uplaćeno</span><strong>{{ formatUsd(a.lifetimeToppedUp) }}</strong>
            </div>
            <div class="cs-stat-row">
              <span>Potrošeno</span><strong>{{ formatUsd(a.lifetimeSpent) }}</strong>
            </div>
          </article>
        </section>

        <section class="cs-topup">
          <div>
            <h3 class="cs-topup-title">Dopuni kredit</h3>
            <p class="cs-topup-sub">Self-serve top-up dolazi u sljedećoj fazi (Stripe). Za sad kontaktiraj support.</p>
          </div>
          <button type="button" class="cs-btn-primary disabled" disabled title="Dolazi uskoro">
            <lucide-icon name="credit-card" [size]="14" /> Dopuni
          </button>
        </section>
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
      .cs-btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 10px;
        color: var(--cs-text-primary);
        font-size: 13px;
        cursor: pointer;
      }
      .cs-btn-secondary:hover {
        background: var(--cs-bg-2);
      }
      .cs-btn-primary {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 8px 14px;
        background: var(--cs-accent);
        border: 1px solid var(--cs-accent);
        border-radius: 10px;
        color: var(--cs-bg-0);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .cs-btn-primary.disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .cs-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        gap: 14px;
      }
      .cs-card {
        background: var(--cs-bg-1);
        border: 1px solid var(--cs-border-subtle);
        border-radius: 14px;
        padding: 18px 20px;
      }
      .cs-card.balance {
        border-color: rgba(216, 255, 60, 0.35);
      }
      .cs-card.balance.amber {
        border-color: rgba(255, 180, 60, 0.5);
        background: rgba(255, 180, 60, 0.06);
      }
      .cs-card.balance.red {
        border-color: rgba(255, 90, 90, 0.55);
        background: rgba(255, 90, 90, 0.07);
      }
      .cs-card-label {
        font-size: 12px;
        color: var(--cs-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }
      .cs-card-amount {
        margin-top: 6px;
        font-family: var(--font-display);
        font-size: 28px;
        font-weight: 700;
        color: var(--cs-text-primary);
        letter-spacing: -0.02em;
      }
      .cs-card-amount.small {
        font-size: 18px;
      }
      .cs-card-sub {
        margin-top: 4px;
        font-size: 12px;
        color: var(--cs-text-secondary);
      }
      .cs-card-foot {
        margin-top: 8px;
        font-size: 11px;
        color: var(--cs-text-tertiary);
      }
      .cs-stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        color: var(--cs-text-secondary);
        padding: 6px 0;
        border-bottom: 1px dashed var(--cs-border-subtle);
      }
      .cs-stat-row:last-child {
        border-bottom: 0;
      }
      .cs-stat-row strong {
        color: var(--cs-text-primary);
        font-weight: 600;
      }
      .cs-progress {
        margin-top: 10px;
        height: 6px;
        background: var(--cs-bg-3);
        border-radius: 999px;
        overflow: hidden;
      }
      .cs-progress-bar {
        height: 100%;
        background: var(--cs-accent);
        border-radius: 999px;
        transition: width 0.3s ease;
      }
      .cs-topup {
        background: var(--cs-bg-1);
        border: 1px dashed var(--cs-border-subtle);
        border-radius: 14px;
        padding: 18px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .cs-topup-title {
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: var(--cs-text-primary);
      }
      .cs-topup-sub {
        margin: 4px 0 0;
        font-size: 12px;
        color: var(--cs-text-tertiary);
      }
      .cs-loading,
      .cs-error {
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
export class BillingDashboardPageComponent implements OnInit {
  private readonly billingService = inject(BillingService);
  private readonly router = inject(Router);

  readonly account = signal<BillingAccount | null>(null);
  readonly isLoading = signal(true);
  readonly error = signal<string | null>(null);

  readonly balanceTone = computed<'green' | 'amber' | 'red'>(() => {
    const a = this.account();
    if (!a) return 'green';
    const threshold = a.lowBalanceThreshold ?? 0;
    if (a.balance <= threshold) return 'red';
    if (threshold > 0 && a.balance <= threshold * 2) return 'amber';
    return 'green';
  });

  ngOnInit(): void {
    this.load();
  }

  goToHistory(): void {
    this.router.navigate(['/billing/usage']);
  }

  capPercent(a: BillingAccount): number {
    if (!a.monthlyHardCap || a.monthlyHardCap <= 0) return 0;
    return Math.min(100, (a.monthSpent / a.monthlyHardCap) * 100);
  }

  formatUsd(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  formatBam(value: number): string {
    return `${(value * environment.usdToBamRate).toFixed(2)} BAM`;
  }

  private load(): void {
    this.isLoading.set(true);
    this.error.set(null);
    this.billingService.getAccount().subscribe({
      next: (a) => {
        this.account.set(a);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message ?? 'Greška pri učitavanju.');
        this.isLoading.set(false);
      },
    });
  }
}
