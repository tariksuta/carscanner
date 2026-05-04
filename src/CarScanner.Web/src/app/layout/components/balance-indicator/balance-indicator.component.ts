import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../../../../environments/environment';
import { BillingService } from '../../../features/billing/services/billing.service';
import { BillingAccount } from '../../../features/billing/models/billing.model';

@Component({
  selector: 'app-balance-indicator',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideAngularModule],
  template: `
    @if (account(); as a) {
      <button
        type="button"
        class="cs-balance"
        [class.amber]="tone() === 'amber'"
        [class.red]="tone() === 'red'"
        (click)="goToBilling()"
        [attr.aria-label]="'Balans: ' + formatUsd(a.balance)"
      >
        <lucide-icon name="wallet" [size]="14" />
        <span class="cs-balance-amount">{{ formatUsd(a.balance) }}</span>
        <span class="cs-balance-sub">~ {{ formatBam(a.balance) }}</span>
      </button>
    }
  `,
  styles: [
    `
      .cs-balance {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 34px;
        padding: 0 12px;
        background: var(--cs-bg-1);
        border: 1px solid rgba(216, 255, 60, 0.35);
        border-radius: 10px;
        color: var(--cs-text-primary);
        font-size: 12px;
        cursor: pointer;
      }
      .cs-balance:hover {
        background: var(--cs-bg-2);
      }
      .cs-balance.amber {
        border-color: rgba(255, 180, 60, 0.5);
        color: rgb(255, 180, 60);
      }
      .cs-balance.red {
        border-color: rgba(255, 90, 90, 0.55);
        color: rgb(255, 90, 90);
      }
      .cs-balance-amount {
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .cs-balance-sub {
        color: var(--cs-text-tertiary);
        font-size: 11px;
      }
    `,
  ],
})
export class BalanceIndicatorComponent implements OnInit, OnDestroy {
  private readonly billingService = inject(BillingService);
  private readonly router = inject(Router);

  private readonly pollIntervalMs = 60_000;
  private timer: ReturnType<typeof setInterval> | null = null;

  readonly account = signal<BillingAccount | null>(null);

  readonly tone = computed<'green' | 'amber' | 'red'>(() => {
    const a = this.account();
    if (!a) return 'green';
    const threshold = a.lowBalanceThreshold ?? 0;
    if (a.balance <= threshold) return 'red';
    if (threshold > 0 && a.balance <= threshold * 2) return 'amber';
    return 'green';
  });

  ngOnInit(): void {
    this.fetch();
    this.timer = setInterval(() => this.fetch(), this.pollIntervalMs);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  goToBilling(): void {
    this.router.navigate(['/billing']);
  }

  formatUsd(value: number): string {
    return `$${value.toFixed(2)}`;
  }

  formatBam(value: number): string {
    return `${(value * environment.usdToBamRate).toFixed(0)} BAM`;
  }

  private fetch(): void {
    this.billingService.getAccount().subscribe({
      next: (a) => this.account.set(a),
      error: () => {
        // Silent fail — indicator simply won't render. Don't disrupt the user.
      },
    });
  }
}
